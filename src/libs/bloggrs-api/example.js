const BisonParser = require('./parser');
const fs = require('fs').promises;
const path = require('path');

// Example usage of the BisonParser
async function generateBlogProject() {
  // Add project data configuration
  const projectData = {
    name: "blog-project",
    version: "1.0.0",
    dependencies: {
      dependencies: {
        "next": "^12.0.0",
        "react": "^17.0.2",
        "react-dom": "^17.0.2",
        "sqlite3": "^5.0.2",
        "knex": "^0.95.11"
      },
      devDependencies: {
        "@types/react": "^17.0.27",
        "@types/node": "^16.10.3",
        "typescript": "^4.4.3"
      }
    },
    config: {
      reactStrictMode: true,
      env: {
        API_URL: "http://localhost:3000"
      }
    }
  };

  // Define output path
  const outputPath = './generated-blog';

  // Define database schema
  const dbSchema = {
    users: {
      fields: {
        id: { type: 'number', primary: true },
        name: { type: 'string' },
        email: { type: 'string', unique: true },
        password: { type: 'string' },
        role: { type: 'string', default: 'user' }
      },
      relationships: {
        posts: { type: 'hasMany', model: 'posts' },
        comments: { type: 'hasMany', model: 'comments' }
      },
      indexes: [
        { fields: ['email'], unique: true }
      ]
    },
    posts: {
      fields: {
        id: { type: 'number', primary: true },
        title: { type: 'string' },
        content: { type: 'string' },
        published: { type: 'boolean', default: false },
        user_id: { type: 'number' }
      },
      relationships: {
        author: { type: 'belongsTo', model: 'users', foreignKey: 'user_id' },
        comments: { type: 'hasMany', model: 'comments' },
        categories: { type: 'belongsToMany', model: 'categories', through: 'post_categories' }
      }
    },
    categories: {
      fields: {
        id: { type: 'number', primary: true },
        name: { type: 'string', unique: true },
        slug: { type: 'string', unique: true }
      },
      relationships: {
        posts: { type: 'belongsToMany', model: 'posts', through: 'post_categories' }
      }
    },
    comments: {
      fields: {
        id: { type: 'number', primary: true },
        content: { type: 'string' },
        user_id: { type: 'number' },
        post_id: { type: 'number' }
      },
      relationships: {
        author: { type: 'belongsTo', model: 'users', foreignKey: 'user_id' },
        post: { type: 'belongsTo', model: 'posts', foreignKey: 'post_id' }
      }
    }
  };

  // Define API endpoints with database operations
  const endpoints = [
    {
      method: 'GET',
      path: '/api/posts',
      params: {
        page: 'number?',
        limit: 'number?',
        categoryId: 'number?',
        userId: 'number?'
      },
      response: {
        data: [{
          id: 'number',
          title: 'string',
          content: 'string',
          published: 'boolean',
          author: {
            id: 'number',
            name: 'string'
          },
          categories: [{
            id: 'number',
            name: 'string'
          }]
        }],
        meta: {
          total: 'number',
          page: 'number',
          lastPage: 'number'
        }
      }
    },
    
    {
      method: 'POST',
      path: '/api/posts',
      params: {
        title: 'string',
        content: 'string',
        published: 'boolean?',
        categoryIds: 'number[]?'
      },
      response: {
        id: 'number',
        title: 'string',
        content: 'string',
        published: 'boolean',
        createdAt: 'string'
      }
    },
    
    {
      method: 'GET',
      path: '/api/posts/{id}',
      params: {
        id: 'number'
      },
      response: {
        id: 'number',
        title: 'string',
        content: 'string',
        published: 'boolean',
        author: {
          id: 'number',
          name: 'string'
        },
        categories: [{
          id: 'number',
          name: 'string'
        }],
        comments: [{
          id: 'number',
          content: 'string',
          author: {
            id: 'number',
            name: 'string'
          }
        }]
      }
    }
  ];

  // Parse and generate code
  const parsedProject = BisonParser.parseNextProject({
    ...projectData,
    database: {
      schema: dbSchema,
      config: {
        client: 'sqlite3',
        migrations: true,
        seeders: true
      }
    }
  });

  // Generate project files
  await generateProjectFiles(outputPath, parsedProject, endpoints, dbSchema);
}

async function generateProjectFiles(outputPath, parsedProject, endpoints, dbSchema) {
  try {
    // Create all necessary directories first
    const directories = [
      outputPath,
      path.join(outputPath, 'pages'),
      path.join(outputPath, 'pages', 'api'),
      path.join(outputPath, 'components'),
      path.join(outputPath, 'lib'),
      path.join(outputPath, 'types'),
      path.join(outputPath, 'styles'),
      path.join(outputPath, 'public')
    ];

    // Create all directories
    for (const dir of directories) {
      await fs.mkdir(dir, { recursive: true });
    }

    // Generate root files
    await fs.writeFile(
      path.join(outputPath, 'package.json'),
      JSON.stringify(parsedProject.rootFiles.packageJson, null, 2)
    );

    // Convert env object to string before writing
    const envContent = typeof parsedProject.rootFiles.env === 'string' 
      ? parsedProject.rootFiles.env 
      : Object.entries(parsedProject.rootFiles.env || {})
          .map(([key, value]) => `${key}=${value}`)
          .join('\n');

    await fs.writeFile(
      path.join(outputPath, '.env'),
      envContent
    );

    // Convert next.config.js to string before writing
    const nextConfigContent = typeof parsedProject.rootFiles.nextConfig === 'string'
      ? parsedProject.rootFiles.nextConfig
      : `module.exports = ${JSON.stringify(parsedProject.rootFiles.nextConfig, null, 2)}`;

    await fs.writeFile(
      path.join(outputPath, 'next.config.js'),
      nextConfigContent
    );

    if (parsedProject.rootFiles.tsConfig) {
      await fs.writeFile(
        path.join(outputPath, 'tsconfig.json'),
        JSON.stringify(parsedProject.rootFiles.tsConfig, null, 2)
      );
    }

    // Generate API endpoints
    const apiCode = BisonParser.generateApiRoutes(endpoints, dbSchema);
    await fs.writeFile(
      path.join(outputPath, 'pages', 'api', 'index.ts'),
      apiCode
    );

    // Generate components first
    if (parsedProject.structure && parsedProject.structure.pages) {
      // Create components directory
      await fs.mkdir(path.join(outputPath, 'components'), { recursive: true });
      
      // Generate PostsList component
      await fs.writeFile(
        path.join(outputPath, 'components', 'PostsList.tsx'),
        `import React from 'react';
import PropTypes from 'prop-types';

interface PostsListProps {
  posts: any[];
}

export function PostsList({ posts }: PostsListProps) {
  return (
    <div className="space-y-6">
      {posts.map(post => (
        <div key={post.id} className="post-card">
          <h2>{post.title}</h2>
          <p>{post.excerpt}</p>
        </div>
      ))}
    </div>
  );
}

PostsList.propTypes = {
  posts: PropTypes.array.isRequired
};`
      );

      // Generate CategoriesSidebar component
      await fs.writeFile(
        path.join(outputPath, 'components', 'CategoriesSidebar.tsx'),
        `import React from 'react';
import PropTypes from 'prop-types';

interface CategoriesSidebarProps {
  categories: any[];
}

export function CategoriesSidebar({ categories }: CategoriesSidebarProps) {
  return (
    <div className="categories-sidebar">
      <h3>Categories</h3>
      <ul>
        {categories.map(category => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>
    </div>
  );
}

CategoriesSidebar.propTypes = {
  categories: PropTypes.array.isRequired
};`
      );
    }

    // Then generate pages
    if (parsedProject.structure && parsedProject.structure.pages) {
      for (const [route, pageData] of Object.entries(parsedProject.structure.pages)) {
        if (pageData && pageData.component && pageData.component.frontend) {
          const pagePath = path.join(outputPath, 'pages', `${route}.tsx`);
          await fs.mkdir(path.dirname(pagePath), { recursive: true });
          await fs.writeFile(pagePath, pageData.component.frontend);
        }
      }
    }

    // Generate prop-types
    if (parsedProject.propTypes) {
      for (const [componentName, propTypeData] of Object.entries(parsedProject.propTypes)) {
        const propTypesContent = `${propTypeData.imports.join('\n')}

${propTypeData.types}

${propTypeData.validation}
`;
        
        await fs.writeFile(
          path.join(outputPath, 'types', `${componentName}.types.ts`),
          propTypesContent
        );
      }
    }

    // Generate database files
    const dbDir = path.join(outputPath, 'db');
    await fs.mkdir(dbDir, { recursive: true });
    await fs.mkdir(path.join(dbDir, 'migrations'), { recursive: true });
    await fs.mkdir(path.join(dbDir, 'models'), { recursive: true });
    await fs.mkdir(path.join(dbDir, 'seeds'), { recursive: true });

    // Generate database configuration
    await fs.writeFile(
      path.join(outputPath, 'knexfile.js'),
      BisonParser.generateDbConfig()
    );

    // Generate migrations
    const migrations = BisonParser.generateMigrations(dbSchema);
    for (const migration of migrations.split('\n\n')) {
      const timestamp = Date.now();
      await fs.writeFile(
        path.join(dbDir, 'migrations', `${timestamp}_migration.js`),
        migration
      );
    }

    // Generate models
    const models = BisonParser.generateModels(dbSchema);
    if (models) {
      const modelStrings = models.split('\n\n');
      for (const model of modelStrings) {
        const modelNameMatch = model.match(/class\s+(\w+)\s+extends/);
        if (modelNameMatch && modelNameMatch[1]) {
          const modelName = modelNameMatch[1];
          await fs.writeFile(
            path.join(dbDir, 'models', `${modelName}.js`),
            model
          );
        }
      }
    }

    console.log(`Project generated successfully at ${outputPath}`);
  } catch (error) {
    console.error('Error generating project:', error);
    throw error; // Re-throw to maintain error handling
  }
}

// Run the generator
generateBlogProject().catch(console.error); 