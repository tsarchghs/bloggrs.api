const BisonParser = {
  // Lexical analysis configuration
  tokens: {
    IDENTIFIER: /[a-zA-Z_][a-zA-Z0-9_]*/,
    STRING: /"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'/,
    NUMBER: /\d+(?:\.\d+)?/,
    OPERATOR: /[+\-*/%=<>!&|^~?:]+/,
    PUNCTUATION: /[.,;(){}[\]]/,
    WHITESPACE: /\s+/,
    COMMENT: /\/\/.*|\/\*[\s\S]*?\*\//,
    DEPENDENCY_VERSION: /\^?\d+\.\d+\.\d+(-[a-zA-Z0-9]+)?/,
    PACKAGE_NAME: /@?[a-zA-Z\-_]+\/[a-zA-Z\-_]+|[a-zA-Z\-_]+/,
    BUILD_CONFIG: /webpack|babel|tsconfig|eslint/i,
    JSX_TAG: /<\/?[a-zA-Z][a-zA-Z0-9-._]*\s*\/?>?/,
    JSX_ATTRIBUTE: /[a-zA-Z][a-zA-Z0-9]*=['"][^'"]*['"]|[a-zA-Z][a-zA-Z0-9]*={[^}]+}|[a-zA-Z][a-zA-Z0-9]*/,
    COMPONENT_EXPORT: /export\s+default\s+function\s+[a-zA-Z_][a-zA-Z0-9_]*/,
    HOOK_DECLARATION: /use[A-Z][a-zA-Z]*\s*\([^)]*\)/,
    HOOK_DEPENDENCY: /\[[^\]]*\]/,
  },

  // Add type imports at the top
  typeImports: {
    next: [
      "import { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next'",
      "import { ParsedUrlQuery } from 'querystring'"
    ],
    react: [
      "import React from 'react'",
      "import PropTypes from 'prop-types'"
    ],
    custom: [
      "import { Post, Category, Comment } from '../types'",
      "import { ApiResponse } from '../types/api'"
    ]
  },

  // Add new SQLite-specific configurations
  sqliteConfig: {
    migrations: true,
    seeders: true,
    models: true,
    relationships: true
  },

  // Add database schema parsing
  parseDbSchema(schema) {
    const models = {};
    
    for (const [tableName, fields] of Object.entries(schema)) {
      models[tableName] = {
        fields: this.parseTableFields(fields),
        relationships: this.parseRelationships(tableName, fields),
        indexes: this.parseIndexes(fields),
        timestamps: fields.timestamps !== false
      };
    }
    
    return models;
  },

  parseTableFields(fields) {
    const parsed = {};
    
    for (const [fieldName, config] of Object.entries(fields)) {
      if (fieldName !== 'relationships' && fieldName !== 'indexes' && fieldName !== 'timestamps') {
        parsed[fieldName] = {
          type: this.getSqliteType(config.type),
          nullable: config.nullable || false,
          unique: config.unique || false,
          default: config.default,
          primary: config.primary || false
        };
      }
    }
    
    return parsed;
  },

  parseRelationships(tableName, fields) {
    if (!fields.relationships) return {};
    
    return Object.entries(fields.relationships).reduce((acc, [name, config]) => {
      acc[name] = {
        type: config.type, // 'hasMany', 'belongsTo', etc.
        model: config.model,
        foreignKey: config.foreignKey || `${tableName}_id`,
        localKey: config.localKey || 'id'
      };
      return acc;
    }, {});
  },

  parseIndexes(fields) {
    if (!fields.indexes) return [];
    return fields.indexes.map(index => ({
      fields: Array.isArray(index.fields) ? index.fields : [index.fields],
      unique: index.unique || false
    }));
  },

  getSqliteType(type) {
    const typeMap = {
      'string': 'TEXT',
      'number': 'INTEGER',
      'boolean': 'BOOLEAN',
      'date': 'DATETIME',
      'json': 'TEXT'
    };
    return typeMap[type] || 'TEXT';
  },

  // Generate SQLite migration files
  generateMigrations(schema) {
    return Object.entries(schema).map(([tableName, config]) => {
      const fields = this.parseTableFields(config.fields);
      const relationships = config.relationships || {};
      
      return `
// migrations/${Date.now()}_create_${tableName}_table.js
exports.up = function(knex) {
  return knex.schema.createTable('${tableName}', table => {
    ${Object.entries(fields).map(([fieldName, fieldConfig]) => `
    table.${fieldConfig.type.toLowerCase()}('${fieldName}')${fieldConfig.nullable ? '.nullable()' : '.notNullable()'}${fieldConfig.unique ? '.unique()' : ''}${fieldConfig.primary ? '.primary()' : ''}${fieldConfig.default ? `.defaultTo(${JSON.stringify(fieldConfig.default)})` : ''};`
    ).join('\n    ')}
    
    ${config.timestamps ? `
    table.timestamps(true, true);` : ''}
    
    ${Object.entries(relationships).map(([name, rel]) => {
      if (rel.type === 'belongsTo') {
        return `table.integer('${rel.foreignKey}').references('id').inTable('${rel.model}');`;
      }
      return '';
    }).filter(Boolean).join('\n    ')}
  });
};

exports.down = function(knex) {
  return knex.schema.dropTable('${tableName}');
};`;
    }).join('\n\n');
  },

  // Generate SQLite models
  generateModels(schema) {
    if (!schema) return '';
    
    return Object.entries(schema).map(([tableName, config]) => {
      const className = this.capitalize(tableName.slice(0, -1));
      const relationships = config.relationships || {};
      
      return `
// models/${className}.js
const { Model } = require('objection');

class ${className} extends Model {
  static get tableName() {
    return '${tableName}';
  }
  
  static get jsonSchema() {
    return {
      type: 'object',
      required: [${Object.entries(config.fields)
        .filter(([_, field]) => !field.nullable)
        .map(([fieldName]) => `'${fieldName}'`)
        .join(', ')}],
        
      properties: {
        ${Object.entries(config.fields).map(([fieldName, field]) => `
        ${fieldName}: { type: '${field.type.toLowerCase()}' ${field.nullable ? ', nullable: true' : ''} }`
        ).join(',\n        ')}
      }
    };
  }
  
  static get relationMappings() {
    return {
      ${Object.entries(relationships).map(([name, rel]) => `
      ${name}: {
        relation: Model.${this.getRelationType(rel.type)}Relation,
        modelClass: require('./${rel.model}'),
        join: {
          from: '${tableName}.${rel.localKey || 'id'}',
          to: '${rel.model}.${rel.foreignKey}'
        }
      }`).join(',\n      ')}
    };
  }
}

module.exports = ${className};`;
    }).join('\n\n');
  },

  getRelationType(type) {
    const types = {
      'hasMany': 'HasMany',
      'belongsTo': 'BelongsTo',
      'belongsToMany': 'ManyToMany'
    };
    return types[type] || 'HasOne';
  },

  // Generate database configuration
  generateDbConfig() {
    return `
// knexfile.js
module.exports = {
  development: {
    client: 'sqlite3',
    connection: {
      filename: './dev.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  
  test: {
    client: 'sqlite3',
    connection: ':memory:',
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    },
    seeds: {
      directory: './seeds'
    }
  },
  
  production: {
    client: 'sqlite3',
    connection: {
      filename: './prod.sqlite3'
    },
    useNullAsDefault: true,
    migrations: {
      directory: './migrations'
    }
  }
};`;
  },

  // Parse API endpoints and generate code
  parseEndpoint(endpoint) {
    const {method, path, params, response} = this.tokenizeEndpoint(endpoint);
    
    return {
      frontend: this.generateFrontendCode(method, path, params, response),
      backend: this.generateBackendCode(method, path, params, response)
    };
  },

  // Tokenize endpoint definition
  tokenizeEndpoint(endpoint) {
    if (!endpoint || typeof endpoint !== 'object') {
      console.warn('Invalid endpoint format:', endpoint);
      return {
        method: '',
        path: '',
        params: {},
        response: {}
      };
    }

    return {
      method: endpoint.method || '',
      path: endpoint.path || '',
      params: endpoint.params || {},
      response: endpoint.response || {}
    };
  },

  parseEndpointObject(str) {
    try {
      // Remove any whitespace and newlines
      const cleaned = str.replace(/\s+/g, ' ').trim();
      
      // Convert the string to valid JSON format
      const jsonStr = cleaned
        // Add quotes around keys
        .replace(/([{,])\s*([a-zA-Z0-9_]+):/g, '$1"$2":')
        // Handle optional types (e.g., "number?")
        .replace(/:\s*"([^"]+)\??"/g, (match, type) => {
          // Remove the optional marker for parsing
          return `:"${type.replace('?', '')}"`;
        })
        // Handle array types (e.g., "number[]")
        .replace(/:\s*"([^"]+)\[\]"/g, ':"$1[]"');
      
      return JSON.parse(jsonStr);
    } catch (error) {
      console.warn('Error parsing endpoint object:', str);
      console.warn('Parse error:', error);
      return {};
    }
  },

  // Parse tokens into endpoint structure 
  parseTokens(tokens) {
    const endpoint = {
      method: '',
      path: '',
      params: {},
      response: {}
    };

    let currentToken = 0;

    // Parse HTTP method
    if (tokens[currentToken].type === 'IDENTIFIER') {
      endpoint.method = tokens[currentToken].value;
      currentToken++;
    }

    // Parse path
    if (tokens[currentToken].type === 'STRING') {
      endpoint.path = tokens[currentToken].value.slice(1, -1);
      currentToken++;
    }

    // Parse parameters
    if (tokens[currentToken].value === '{') {
      currentToken++;
      endpoint.params = this.parseObject(tokens, currentToken);
      currentToken = this.findClosingBrace(tokens, currentToken) + 1;
    }

    // Parse response
    if (currentToken < tokens.length && tokens[currentToken].value === '{') {
      currentToken++;
      endpoint.response = this.parseObject(tokens, currentToken);
    }

    return endpoint;
  },

  // Parse object structure from tokens
  parseObject(tokens, start) {
    const obj = {};
    let current = start;

    while (current < tokens.length && tokens[current].value !== '}') {
      // Parse key
      if (tokens[current].type !== 'IDENTIFIER' && tokens[current].type !== 'STRING') {
        throw new Error('Expected property name');
      }
      
      const key = tokens[current].type === 'STRING' 
        ? tokens[current].value.slice(1, -1)
        : tokens[current].value;
      
      current++;

      // Skip colon
      if (tokens[current].value !== ':') {
        throw new Error('Expected :');
      }
      current++;

      // Parse value
      const value = this.parseValue(tokens, current);
      obj[key] = value.value;
      current = value.next;

      // Skip comma
      if (tokens[current].value === ',') {
        current++;
      }
    }

    return obj;
  },

  // Parse individual values
  parseValue(tokens, start) {
    const token = tokens[start];

    switch (token.type) {
      case 'NUMBER':
        return {
          value: Number(token.value),
          next: start + 1
        };
        
      case 'STRING':
        return {
          value: token.value.slice(1, -1),
          next: start + 1
        };
        
      case 'IDENTIFIER':
        if (['true', 'false', 'null'].includes(token.value)) {
          return {
            value: JSON.parse(token.value),
            next: start + 1
          };
        }
        return {
          value: token.value,
          next: start + 1
        };

      default:
        throw new Error(`Unexpected token type: ${token.type}`);
    }
  },

  // Generate frontend code
  generateFrontendCode(method, path, params, response) {
    const paramString = Object.keys(params).length 
      ? `params: ${JSON.stringify(params, null, 2)},`
      : '';

    return `
// Frontend API call
const ${method.toLowerCase()}${path.split('/').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')} = async (${Object.keys(params).join(', ')}) => {
  try {
    const response = await axios.${method.toLowerCase()}(\`${path}\`, {
      ${paramString}
      headers: {
        'Content-Type': 'application/json',
        Authorization: \`Bearer \${getToken()}\`
      }
    });
    return response.data;
  } catch (error) {
    handleApiError(error);
    throw error;
  }
};`;
  },

  // Generate backend code
  generateBackendCode(method, path, params, response) {
    const paramValidation = Object.entries(params)
      .map(([key, type]) => `
    if (!${key}) {
      throw new Error('${key} is required');
    }
    // Validate ${key} is type ${type}`
      ).join('\n');

    return `
// Backend route handler
router.${method.toLowerCase()}('${path}', async (req, res) => {
  try {
    // Parameter validation
    ${paramValidation}

    // Implementation
    const result = await service.${method.toLowerCase()}${path.split('/').map(p => p.charAt(0).toUpperCase() + p.slice(1)).join('')}(
      ${Object.keys(params).map(p => `req.${method === 'GET' ? 'query' : 'body'}.${p}`).join(', ')}
    );

    // Response
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});`;
  },

  // Helper to find closing brace
  findClosingBrace(tokens, start) {
    let depth = 1;
    let pos = start;

    while (depth > 0 && pos < tokens.length) {
      if (tokens[pos].value === '{') depth++;
      if (tokens[pos].value === '}') depth--;
      pos++;
    }

    return pos - 1;
  },

  parseDependencies(packageJson) {
    const dependencies = {
      runtime: this.parsePackageSection(packageJson.dependencies),
      dev: this.parsePackageSection(packageJson.devDependencies)
    };

    return {
      frontend: this.generatePackageCode(dependencies),
      backend: this.generateBuildConfig(dependencies)
    };
  },

  parsePackageSection(section = {}) {
    const parsed = {};
    
    for (const [pkg, version] of Object.entries(section)) {
      parsed[pkg] = {
        name: pkg,
        version: version.replace('^', ''),
        isExact: !version.startsWith('^')
      };
    }
    
    return parsed;
  },

  generatePackageCode(dependencies) {
    const { runtime, dev } = dependencies;
    
    return `
// package.json
{
  "dependencies": {
    ${Object.values(runtime)
      .map(dep => `"${dep.name}": "${dep.isExact ? '' : '^'}${dep.version}"`)
      .join(',\n    ')}
  },
  "devDependencies": {
    ${Object.values(dev)
      .map(dep => `"${dep.name}": "${dep.isExact ? '' : '^'}${dep.version}"`)
      .join(',\n    ')}
  }
}`;
  },

  generateBuildConfig(dependencies) {
    const hasTypeScript = dependencies.dev['typescript'];
    const hasWebpack = dependencies.dev['webpack'];
    const hasBabel = dependencies.dev['@babel/core'];

    return `
// Build configuration
${hasTypeScript ? `// tsconfig.json
{
  "compilerOptions": {
    "target": "es5",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}` : ''}

${hasWebpack ? `// webpack.config.js
module.exports = {
  // Webpack configuration based on dependencies
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        exclude: /node_modules/,
        use: {
          loader: 'babel-loader'
        }
      }
    ]
  }
}` : ''}

${hasBabel ? `// babel.config.js
module.exports = {
  presets: [
    ['@babel/preset-env', { targets: { node: 'current' } }],
    '@babel/preset-typescript'
  ]
}` : ''}`;
  },

  parseNextPage(pageCode) {
    // Add type imports to existing imports
    const imports = [
      ...this.typeImports.next,
      ...this.typeImports.react,
      ...this.parseImports(pageCode)
    ];

    const serverProps = this.parseGetServerSideProps(pageCode);
    const component = this.parseComponent(pageCode);

    return {
      imports,
      serverProps,
      component
    };
  },

  parseImports(code) {
    const importRegex = /import\s+(?:{[^}]+}|\w+)\s+from\s+['"][^'"]+['"]/g;
    return code.match(importRegex) || [];
  },

  parseGetServerSideProps(code) {
    const serverPropsRegex = /export\s+async\s+function\s+getServerSideProps\s*\([^)]*\)\s*{([^}]*)}/s;
    const match = code.match(serverPropsRegex);
    
    if (!match) return null;

    const propsBody = match[1];
    const fetchCalls = propsBody.match(/await\s+\w+\([^)]*\)/g) || [];
    const returnProps = propsBody.match(/return\s*{([^}]*)}/s)[1];

    return {
      fetchCalls,
      props: this.parseObject(this.tokenizeEndpoint(returnProps), 0)
    };
  },
  tokenizeComponent(componentCode) {
    // Extract component name
    const nameMatch = componentCode.match(/(?:function|const)\s+([A-Z][a-zA-Z]*)/);
    const name = nameMatch ? nameMatch[1] : '';

    // Extract props with TypeScript types
    const propsMatch = componentCode.match(/(?:{[^}]*}:\s*([^)]*)\)|<([^>]*)>)/);
    const propsString = propsMatch ? (propsMatch[1] || propsMatch[2]) : '';
    const props = {};
    
    if (propsString) {
      const propMatches = propsString.match(/([a-zA-Z0-9_]+)(\?)?:\s*([^;,}]+)/g) || [];
      propMatches.forEach(prop => {
        const [key, optional, type] = prop.match(/([a-zA-Z0-9_]+)(\?)?:\s*([^;,}]+)/).slice(1);
        if (key) {
          props[key.trim()] = {
            required: !optional,
            type: type.trim(),
            isArray: type.includes('[]')
          };
        }
      });
    }

    // Extract JSX content
    const jsxMatch = componentCode.match(/return\s*\(\s*([\s\S]*?)\s*\);/);
    const jsxContent = jsxMatch ? jsxMatch[1] : '';

    // Extract hook dependencies
    const dependencies = [];
    const hookMatches = componentCode.match(/use[A-Z][a-zA-Z]*\([^)]*\)/g) || [];
    hookMatches.forEach(hook => {
      const depsMatch = hook.match(/\[(.*?)\]/);
      if (depsMatch) {
        dependencies.push(...depsMatch[1].split(',').map(d => d.trim()));
      }
    });

    return {
      name,
      props,
      jsxContent,
      dependencies: [...new Set(dependencies)]
    };
  },

  parseComponent(componentCode) {
    const {name, props, jsxContent, dependencies} = this.tokenizeComponent(componentCode);
    
    // Parse the JSX content into our expected format
    const jsx = this.parseJSX(jsxContent);
    
    // Extract component names from JSX to add to imports
    const componentNames = this.extractComponentNames(jsxContent);
    
    return {
      frontend: this.generateComponentCode(name, props, jsx, dependencies, componentNames),
      validation: this.generateComponentValidation(props),
      api: this.generateComponentApi(name, props)
    };
  },

  extractComponentNames(jsxContent) {
    // Find all component-style elements (starting with capital letter)
    const componentRegex = /<([A-Z][a-zA-Z]*)/g;
    const matches = [...jsxContent.matchAll(componentRegex)];
    return [...new Set(matches.map(m => m[1]))];
  },

  generateComponentCode(name, props, jsx, dependencies, componentNames) {
    // Add type imports
    const imports = [
      "import React, { FC } from 'react'",
      ...this.typeImports.custom,
      ...componentNames.map(component => 
        `import { ${component} } from '../components/${component}';`
      )
    ];

    const propsInterface = props && Object.keys(props).length ? `
interface ${name}Props {
  ${Object.entries(props).map(([key, value]) => 
    `${key}${value.required ? '' : '?'}: ${value.type || 'any'}[];`
  ).join('\n  ')}
}` : '';

    return `${imports.join('\n')}

${propsInterface}

export const ${name}: FC<${name}Props> = ({ ${Object.keys(props).join(', ')} }) => {
  return (
    ${jsx.elements ? jsx.elements.join('\n    ').trim() : ''}
  );
};`;
  },

  generateComponentValidation(props) {
    return `
      const componentPropTypes = {
        ${Object.entries(props).map(([key, value]) => 
          `${key}: ${value.required ? 'PropTypes.any.isRequired' : 'PropTypes.any'}`
        ).join(',\n        ')}
      };
    `;
  },

  parseJSX(jsx) {
    // More robust JSX parsing
    const cleanJsx = jsx.trim();
    const elements = cleanJsx.split(/\n\s*/).map(line => line.trim()).filter(Boolean);
    
    return {
      elements,
      hasClassName: jsx.includes('className'),
      hasChildren: jsx.includes('>')
    };
  },

  parseHook(hookCode) {
    const { name, params, dependencies, statements } = this.tokenizeHook(hookCode);
    
    return {
      frontend: this.generateHookCode(name, params, dependencies, statements),
      types: this.generateHookTypes(name, params)
    };
  },

  tokenizeHook(hookCode) {
    const nameMatch = hookCode.match(/^(use[A-Z][a-zA-Z]*)/);
    if (!nameMatch) throw new Error('Invalid hook name format');

    const paramsMatch = hookCode.match(/\((.*?)\)/);
    const depsMatch = hookCode.match(/\[(.*?)\]/);
    
    // Extract the function body between curly braces
    const bodyMatch = hookCode.match(/{([^}]*?)}/s);
    const statements = bodyMatch ? this.parseHookBody(bodyMatch[1]) : [];
    
    return {
      name: nameMatch[1],
      params: paramsMatch ? this.parseHookParams(paramsMatch[1]) : [],
      dependencies: depsMatch ? depsMatch[1].split(',').map(d => d.trim()) : [],
      statements
    };
  },

  parseHookBody(body) {
    const statements = [];
    const lines = body.split(';').map(line => line.trim()).filter(Boolean);
    
    for (const line of lines) {
      if (line.startsWith('const') || line.startsWith('let') || line.startsWith('var')) {
        statements.push({
          type: 'declaration',
          content: line
        });
      } else if (line.startsWith('useEffect') || line.startsWith('useMemo') || line.startsWith('useCallback')) {
        statements.push({
          type: 'hook',
          name: line.split('(')[0],
          content: line
        });
      } else if (line.startsWith('return')) {
        statements.push({
          type: 'return',
          content: line
        });
      } else if (line.startsWith('if') || line.startsWith('for') || line.startsWith('while')) {
        statements.push({
          type: 'control',
          content: line
        });
      } else {
        statements.push({
          type: 'expression',
          content: line
        });
      }
    }
    
    return statements;
  },

  parseHookParams(paramsString) {
    if (!paramsString.trim()) return [];
    return paramsString.split(',').map(param => {
      const [name, defaultValue] = param.trim().split('=').map(p => p.trim());
      return {
        name,
        defaultValue: defaultValue ? this.parseValue(this.tokenizeEndpoint(defaultValue), 0).value : undefined
      };
    });
  },

  generateHookCode(name, params, dependencies, statements) {
    const paramList = params.map(p => p.name).join(', ');
    const depsArray = dependencies.length ? `[${dependencies.join(', ')}]` : '[]';
    
    const bodyStatements = statements
      .map(stmt => {
        switch (stmt.type) {
          case 'declaration':
          case 'expression':
          case 'return':
            return `  ${stmt.content};`;
          case 'hook':
            return `  ${stmt.content};`;
          case 'control':
            return `  ${stmt.content}`;
          default:
            return '';
        }
      })
      .join('\n');

    return `
// Custom hook
const ${name} = (${paramList}) => {
${bodyStatements}
};`;
  },

  generateHookTypes(name, params) {
    return `
// Hook type definitions
type ${name}Params = {
  ${params.map(p => `${p.name}${p.defaultValue ? '?' : ''}: any;`).join('\n  ')}
};

type ${name}Return = any; // Update with actual return type
`;
  },

  // Add new method for Next.js project parsing
  parseNextProject(projectData) {
    return {
      // Project configuration
      config: {
        name: projectData.name,
        version: projectData.version || '0.1.0',
        dependencies: this.parseDependencies(projectData.dependencies),
        nextConfig: this.parseNextConfig(projectData.config)
      },
      
      // Directory structure
      structure: {
        pages: this.parsePages(projectData.pages),
        components: this.parseComponents(projectData.components),
        lib: this.parseLibFiles(projectData.lib),
        public: this.parsePublicAssets(projectData.public),
        styles: this.parseStyles(projectData.styles),
        hooks: this.parseHooks(projectData.hooks)
      },

      // Root files
      rootFiles: {
        env: this.generateEnvFile(projectData.env),
        packageJson: this.generatePackageJson(projectData),
        tsConfig: this.generateTsConfig(projectData.typescript),
        nextConfig: this.generateNextConfig(projectData.nextConfig)
      },

      // Add prop-types generation
      propTypes: this.generatePropTypes(projectData.pages),

      // Add types generation
      types: {
        models: this.generateModelTypes(projectData.models),
        api: this.generateApiTypes(projectData.endpoints),
        props: this.generatePropTypes(projectData.pages)
      },

      // Add server-side code
      server: {
        api: this.generateApiRoutes(projectData.endpoints),
        props: this.generateServerSideProps(projectData.pages)
      }
    };
  },

  parseNextConfig(config = {}) {
    return {
      reactStrictMode: config.reactStrictMode ?? true,
      env: config.env || {},
      publicRuntimeConfig: config.publicRuntimeConfig || {},
      serverRuntimeConfig: config.serverRuntimeConfig || {},
    };
  },

  generateNextConfig(config = {}) {
    return {
      reactStrictMode: config.reactStrictMode ?? true,
      env: config.env || {},
      publicRuntimeConfig: config.publicRuntimeConfig || {},
      serverRuntimeConfig: config.serverRuntimeConfig || {},
      // Add any additional Next.js config options
      webpack: config.webpack,
      images: config.images,
      i18n: config.i18n,
      async redirects() {
        return config.redirects || [];
      },
      async rewrites() {
        return config.rewrites || [];
      }
    };
  },

  parsePages(pages = {}) {
    const parsedPages = {};
    
    for (const [route, pageData] of Object.entries(pages)) {
        const cleanCode = pageData.code
            .replace(/^\s+/gm, '')  // Remove leading whitespace
            .trim();

        parsedPages[route] = {
            imports: [
                "import React from 'react'",
                "import { GetServerSideProps } from 'next'",
                ...this.parseImports(cleanCode)
            ],
            serverProps: this.parseGetServerSideProps(cleanCode),
            component: this.parseComponent(cleanCode),
            api: pageData.api ? this.parseApiRoute(pageData.api) : null
        };
    }
    
    return parsedPages;
  },

  parseComponents(components = {}) {
    const parsedComponents = {};
    
    for (const [name, componentData] of Object.entries(components)) {
      parsedComponents[name] = {
        code: this.parseComponent(componentData.code),
        styles: componentData.styles,
        tests: componentData.tests
      };
    }
    
    return parsedComponents;
  },

  parseLibFiles(lib = {}) {
    return {
      utils: lib.utils || {},
      api: lib.api || {},
      hooks: lib.hooks || {},
      context: lib.context || {},
      types: lib.types || {}
    };
  },

  generateProjectFiles(parsedProject) {
    return {
      'package.json': JSON.stringify(parsedProject.rootFiles.packageJson, null, 2),
      '.env': this.generateEnvFileContent(parsedProject.rootFiles.env),
      'next.config.js': this.generateNextConfigContent(parsedProject.rootFiles.nextConfig),
      'tsconfig.json': parsedProject.rootFiles.tsConfig ? 
        JSON.stringify(parsedProject.rootFiles.tsConfig, null, 2) : undefined,
      
      // Generate directory structure
      pages: this.generatePages(parsedProject.structure.pages),
      components: this.generateComponents(parsedProject.structure.components),
      lib: this.generateLibFiles(parsedProject.structure.lib),
      styles: this.generateStyles(parsedProject.structure.styles),
      public: parsedProject.structure.public,
      hooks: this.generateHooks(parsedProject.structure.hooks)
    };
  },

  parsePublicAssets(public = {}) {
    return {
      images: public.images || {},
      fonts: public.fonts || {},
      icons: public.icons || {},
      other: public.other || {}
    };
  },

  parseStyles(styles = {}) {
    return {
      global: styles.global || {},
      components: styles.components || {},
      themes: styles.themes || {}
    };
  },

  parseHooks(hooks = {}) {
    const parsedHooks = {};
    
    for (const [name, hookData] of Object.entries(hooks)) {
      parsedHooks[name] = this.parseHook(hookData);
    }
    
    return parsedHooks;
  },

  generatePages(pages) {
    const generatedPages = {};
    
    for (const [route, pageData] of Object.entries(pages)) {
      generatedPages[route] = {
        component: pageData.component,
        getServerSideProps: pageData.serverProps,
        styles: pageData.styles
      };
    }
    
    return generatedPages;
  },

  generateComponents(components) {
    const generatedComponents = {};
    
    for (const [name, componentData] of Object.entries(components)) {
      generatedComponents[name] = {
        code: componentData.code,
        styles: componentData.styles
      };
    }
    
    return generatedComponents;
  },

  generateLibFiles(lib) {
    return {
      utils: lib.utils || {},
      api: lib.api || {},
      hooks: lib.hooks || {},
      context: lib.context || {},
      types: lib.types || {}
    };
  },

  generateStyles(styles) {
    return {
      global: styles.global || {},
      components: styles.components || {},
      themes: styles.themes || {}
    };
  },

  generateEnvFileContent(env) {
    return Object.entries(env || {})
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  },

  generateNextConfigContent(config) {
    return `
module.exports = {
  reactStrictMode: ${config.reactStrictMode},
  env: ${JSON.stringify(config.env, null, 2)},
  publicRuntimeConfig: ${JSON.stringify(config.publicRuntimeConfig, null, 2)},
  serverRuntimeConfig: ${JSON.stringify(config.serverRuntimeConfig, null, 2)}
};`;
  },

  generateEnvFile(envConfig = {}) {
    return Object.entries(envConfig)
      .map(([key, value]) => `${key}=${value}`)
      .join('\n');
  },

  generatePackageJson(projectData) {
    return {
      name: projectData.name,
      version: projectData.version,
      private: true,
      scripts: {
        "dev": "next dev",
        "build": "next build",
        "start": "next start",
        "lint": "next lint"
      },
      dependencies: projectData.dependencies?.dependencies || {},
      devDependencies: projectData.dependencies?.devDependencies || {}
    };
  },

  generateTsConfig(typescript = {}) {
    if (!typescript) return null;
    
    return {
      compilerOptions: {
        target: "es5",
        lib: ["dom", "dom.iterable", "esnext"],
        allowJs: true,
        skipLibCheck: true,
        strict: true,
        forceConsistentCasingInFileNames: true,
        noEmit: true,
        esModuleInterop: true,
        module: "esnext",
        moduleResolution: "node",
        resolveJsonModule: true,
        isolatedModules: true,
        jsx: "preserve",
        incremental: true,
        ...typescript.compilerOptions
      },
      include: [
        "next-env.d.ts",
        "**/*.ts",
        "**/*.tsx"
      ],
      exclude: [
        "node_modules"
      ],
      ...typescript.extraConfig
    };
  },

  generateComponentApi(name, props) {
    const requiredProps = Object.entries(props)
      .filter(([_, value]) => value.required)
      .map(([key]) => key);

    if (!requiredProps.length) return null;

    return {
      get: `
// Get ${name} required data
router.get('/api/components/${name.toLowerCase()}', async (req, res) => {
  try {
    const data = await service.get${name}Data();
    res.json({
      success: true,
      data: {
        ${requiredProps.join(',\n        ')}
      }
    });
  } catch (error) {
    next(error);
  }
});`,
      
      post: `
// Update ${name} data
router.post('/api/components/${name.toLowerCase()}', async (req, res) => {
  try {
    const { ${requiredProps.join(', ')} } = req.body;
    
    // Validate required props
    ${requiredProps.map(prop => 
      `if (!${prop}) throw new Error('${prop} is required');`
    ).join('\n    ')}

    const result = await service.update${name}Data({
      ${requiredProps.join(',\n      ')}
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});`
    };
  },

  generatePropTypes(pages = {}) {
    const propTypes = {};
    
    for (const [route, pageData] of Object.entries(pages)) {
      const componentName = this.extractComponentName(route);
      const props = this.extractPropsFromCode(pageData.code);
      
      propTypes[componentName] = {
        imports: [
          "import PropTypes from 'prop-types'",
        ],
        types: this.generatePropTypeDefinitions(props),
        validation: this.generatePropTypeValidation(componentName, props)
      };
    }
    
    return propTypes;
  },

  extractComponentName(route) {
    // Convert route to component name (e.g., "posts/[id]" -> "Post")
    return route
      .split('/')
      .pop()
      .replace(/[\[\]]/g, '')
      .replace(/^\w/, c => c.toUpperCase());
  },

  extractPropsFromCode(code) {
    // Extract props from function parameters
    const propsMatch = code.match(/function\s+\w+\s*\(\s*{\s*([^}]+)\s*}\s*\)/);
    if (!propsMatch) return {};

    const propsString = propsMatch[1];
    const props = {};

    propsString.split(',').forEach(prop => {
      const [name, type] = prop.trim().split(':').map(p => p.trim());
      if (name) {
        props[name] = {
          type: type || 'any',
          required: code.includes(`if (!${name})`) || code.includes(`${name}.map(`),
          isArray: code.includes(`${name}.map(`) || type?.includes('[]'),
          shape: this.extractPropShape(code, name)
        };
      }
    });

    return props;
  },

  extractPropShape(code, propName) {
    // Look for type usage in the code to determine shape
    const shape = {};
    const usageRegex = new RegExp(`${propName}\\.(\\w+)`, 'g');
    const matches = [...code.matchAll(usageRegex)];
    
    matches.forEach(match => {
      const field = match[1];
      if (!['map', 'filter', 'reduce', 'forEach'].includes(field)) {
        shape[field] = 'any';
      }
    });
    
    return Object.keys(shape).length ? shape : null;
  },

  generatePropTypeDefinitions(props) {
    return Object.entries(props).map(([name, config]) => {
      if (config.shape) {
        return `
interface ${this.capitalize(name)}Type {
  ${Object.entries(config.shape)
    .map(([key, type]) => `${key}: ${type};`)
    .join('\n  ')}
}`;
      }
      return '';
    }).filter(Boolean).join('\n\n');
  },

  generatePropTypeValidation(componentName, props) {
    const validation = Object.entries(props).map(([name, config]) => {
      let propType = 'any';
      
      if (config.isArray) {
        propType = 'array';
      } else if (config.shape) {
        propType = 'shape';
      }
      
      if (config.shape) {
        return `  ${name}: PropTypes.shape({
    ${Object.keys(config.shape)
      .map(key => `${key}: PropTypes.any`)
      .join(',\n    ')}
  })${config.required ? '.isRequired' : ''}`;
      }
      
      return `  ${name}: PropTypes.${propType}${config.required ? '.isRequired' : ''}`;
    }).join(',\n');

    return `
${componentName}.propTypes = {
${validation}
};`;
  },

  capitalize(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  },

  generateModelTypes(models = {}) {
    return `
// Generated model types
${Object.entries(models).map(([name, fields]) => `
export interface ${name} {
  ${Object.entries(fields).map(([field, type]) => 
    `${field}: ${this.convertToTypeScript(type)};`
  ).join('\n  ')}
}`).join('\n\n')}
`;
  },

  generateApiTypes(endpoints = []) {
    return `
// Generated API types
${endpoints.map(endpoint => {
  const { method, path, params, response } = this.tokenizeEndpoint(endpoint);
  const typeName = this.getEndpointTypeName(method, path);
  
  return `
export interface ${typeName}Request {
  ${Object.entries(params).map(([param, type]) => 
    `${param}${type.endsWith('?') ? '?' : ''}: ${this.convertToTypeScript(type.replace('?', ''))};`
  ).join('\n  ')}
}

export interface ${typeName}Response {
  ${Object.entries(response).map(([field, type]) => 
    `${field}: ${this.convertToTypeScript(type)};`
  ).join('\n  ')}
}`;
}).join('\n\n')}
`;
  },

  generateServerSideProps(pages = {}) {
    return Object.entries(pages).map(([route, pageData]) => {
      const componentName = this.extractComponentName(route);
      const props = this.extractPropsFromCode(pageData.code);
      
      return `
// ${route} getServerSideProps
export const getServerSideProps: GetServerSideProps<${componentName}Props> = async (context) => {
  try {
    ${Object.keys(props).map(prop => `
    // Fetch ${prop}
    const ${prop}Res = await fetch(\`\${process.env.API_URL}/api/${prop}\`);
    const ${prop} = await ${prop}Res.json();
    `).join('\n')}

    return {
      props: {
        ${Object.keys(props).join(',\n        ')}
      }
    };
  } catch (error) {
    console.error('Error in getServerSideProps:', error);
    return {
      notFound: true
    };
  }
};`;
    }).join('\n\n');
  },

  convertToTypeScript(type) {
    // Convert API types to TypeScript types
    const typeMap = {
      'string': 'string',
      'number': 'number',
      'boolean': 'boolean',
      'object': 'Record<string, any>',
      'array': 'any[]'
    };

    if (type.includes('[]')) {
      const baseType = type.replace('[]', '');
      return `${this.convertToTypeScript(baseType)}[]`;
    }

    if (type.startsWith('{')) {
      // Handle object types
      const fields = this.parseObjectType(type);
      return `{
        ${Object.entries(fields).map(([key, value]) => 
          `${key}: ${this.convertToTypeScript(value)};`
        ).join('\n        ')}
      }`;
    }

    return typeMap[type] || 'any';
  },

  parseObjectType(type) {
    // Parse object type string into fields
    try {
      const obj = JSON.parse(type.replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":'));
      return obj;
    } catch {
      return {};
    }
  },

  getEndpointTypeName(method, path) {
    // Convert endpoint to type name (e.g., "GET /api/posts" -> "GetPostsRequest")
    return `${method.charAt(0).toUpperCase()}${method.slice(1).toLowerCase()}${
      path.split('/')
        .filter(Boolean)
        .map(part => part.charAt(0).toUpperCase() + part.slice(1))
        .join('')
    }`;
  },

  generateApiRoutes(endpoints = [], schema = {}) {
    if (!Array.isArray(endpoints)) {
      console.warn('No endpoints provided or invalid endpoints format');
      return '';
    }

    const routes = endpoints.map(endpoint => {
      try {
        const parsed = this.tokenizeEndpoint(endpoint);
        if (!parsed.method || !parsed.path) {
          console.warn('Invalid endpoint format:', endpoint);
          return '';
        }

        const typeName = this.getEndpointTypeName(parsed.method, parsed.path);
        const model = this.getModelFromPath(parsed.path);
        const modelClass = model ? this.capitalize(model.slice(0, -1)) : 'Base';

        return `
import { NextApiRequest, NextApiResponse } from 'next';
import { ${typeName}Request, ${typeName}Response } from '../types/api';
import ${modelClass} from '../models/${modelClass}';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<${typeName}Response>
) {
  if (req.method !== '${parsed.method}') {
    return res.status(405).end();
  }

  try {
    ${this.generateDbOperation(parsed.method, modelClass, parsed.params)}
    
    res.status(${parsed.method === 'POST' ? '201' : '200'}).json(result);
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}`;
      } catch (error) {
        console.warn('Error generating route for endpoint:', endpoint, error);
        return '';
      }
    }).filter(Boolean);

    return routes.join('\n\n');
  },

  generateDbOperation(method, model, params) {
    switch (method) {
      case 'GET':
        return `const result = await ${model}.query()
      ${Object.keys(params).map(param => 
        `.modify(builder => {
          if (${param}) builder.where('${param}', ${param});
        })`
      ).join('\n      ')};`;
      
      case 'POST':
        return `const result = await ${model}.query().insert(req.body);`;
      
      case 'PUT':
        return `const result = await ${model}.query()
      .findById(req.query.id)
      .patch(req.body);`;
      
      case 'DELETE':
        return `const result = await ${model}.query()
      .deleteById(req.query.id);`;
      
      default:
        return '';
    }
  },

  getModelFromPath(path) {
    if (!path) return null;
    
    const parts = path.split('/').filter(Boolean);
    // Return null if we don't have enough parts or if the first part isn't 'api'
    if (parts.length < 2 || parts[0] !== 'api') return null;
    
    // Return the model name (singular form)
    return parts[1];
  }
};

module.exports = BisonParser; 