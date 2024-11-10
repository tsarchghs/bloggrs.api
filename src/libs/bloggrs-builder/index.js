const { PrismaClient } = require('@prisma/client');
const parser = require('@typescript-eslint/parser');
const fs = require('fs');
const typescript = require('typescript');

const prisma = new PrismaClient();

// Add TypeScript version check
const tsVersion = typescript.version;
const MIN_TS_VERSION = '4.7.4';
const MAX_TS_VERSION = '5.7.0';

async function parseAndStoreFile(filePath) {
  // Add version check before processing
  if (!checkTypeScriptVersion(tsVersion, MIN_TS_VERSION, MAX_TS_VERSION)) {
    console.warn(`
WARNING: Unsupported TypeScript version ${tsVersion}.
Supported versions: >=${MIN_TS_VERSION} <${MAX_TS_VERSION}
Continuing execution, but parsing may fail.
`);
  }

  try {
    console.log('Starting to parse file:', filePath);
    
    // Clear existing data
    await prisma.jsfunctionparams.deleteMany({});
    await prisma.jsclassmethods.deleteMany({});
    await prisma.jsclassproperties.deleteMany({});
    await prisma.jscodeblocks.deleteMany({});
    await prisma.jsimports.deleteMany({});
    await prisma.jsexports.deleteMany({});
    await prisma.jsfiles.deleteMany({});
    
    console.log('Cleared existing data');

    // Add file existence check
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    console.log('File content length:', fileContent.length);
    console.log('First 100 characters:', fileContent.substring(0, 100));

    const ast = parser.parse(fileContent, {
      sourceType: 'module',
      ecmaVersion: 2020,
      range: true,
      loc: true,
      tokens: true,
      comment: true,
      useJSXTextNode: true,
      errorOnUnknownASTType: false,
    });

    console.log('AST:', JSON.stringify(ast, null, 2).substring(0, 500));

    // Add file type validation
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.js')) {
      throw new Error('Only .ts and .js files are supported');
    }

    // Create file record
    const file = await prisma.jsfiles.create({
      data: {
        filename: filePath,
      },
    });
    console.log('Created file record:', file.id);

    // Parse imports
    const imports = ast.body.filter(node => node.type === 'ImportDeclaration');
    for (const imp of imports) {
      for (const specifier of imp.specifiers) {
        await prisma.jsimports.create({
          data: {
            fileId: file.id,
            importSource: imp.source.value,
            importType: specifier.type === 'ImportDefaultSpecifier' ? 'default' : 'named',
            importedName: specifier.local.name,
          },
        });
      }
    }
    console.log('Found imports:', imports.length);

    // Parse all code blocks with expanded node types
    const codeBlocks = ast.body.filter(node => {
      // Handle export declarations by looking at their declarations
      if (node.type === 'ExportNamedDeclaration' || node.type === 'ExportDefaultDeclaration') {
        const declaration = node.declaration;
        return declaration && (
          declaration.type === 'ClassDeclaration' ||
          declaration.type === 'FunctionDeclaration' ||
          declaration.type === 'VariableDeclaration'
        );
      }
      
      // Direct declarations
      return (
        node.type === 'ClassDeclaration' ||
        node.type === 'FunctionDeclaration' ||
        node.type === 'VariableDeclaration' ||
        // Include function expressions and arrow functions
        (node.type === 'ExpressionStatement' && 
         (node.expression.type === 'FunctionExpression' ||
          node.expression.type === 'ArrowFunctionExpression'))
      ) && node.type !== 'ImportDeclaration';
    });

    console.log('Processing code blocks:', codeBlocks.length);

    for (const block of codeBlocks) {
      let actualBlock = block;
      
      // Handle different export types
      if (block.type === 'ExportNamedDeclaration' || block.type === 'ExportDefaultDeclaration') {
        actualBlock = block.declaration;
      }
      
      // Handle expression statements
      if (block.type === 'ExpressionStatement') {
        actualBlock = block.expression;
      }

      if (!actualBlock || actualBlock.type === 'ImportDeclaration') continue;

      // Create the code block record with improved type detection
      const blockContent = actualBlock.type === 'ClassDeclaration' 
        ? extractClassContent(actualBlock, fileContent)
        : fileContent.slice(actualBlock.start, actualBlock.end);

      const codeBlock = await prisma.jscodeblocks.create({
        data: {
          fileId: file.id,
          blockType: getBlockType(actualBlock),
          blockName: getBlockName(actualBlock),
          content: blockContent,
          startLine: actualBlock.loc.start.line,
          endLine: actualBlock.loc.end.line,
        },
      });

      // Handle function parameters for both standalone functions and class methods
      if (actualBlock.type === 'FunctionDeclaration' || actualBlock.type === 'VariableDeclaration') {
        const params = actualBlock.params || 
                      (actualBlock.declarations?.[0]?.init?.params) || [];
        
        for (const param of params) {
          await prisma.jsfunctionparams.create({
            data: {
              paramName: param.name || (param.left && param.left.name) || 'unknown',
              paramType: param.typeAnnotation?.typeAnnotation?.type || 'any',
              defaultValue: param.right ? fileContent.slice(param.right.start, param.right.end) : null,
              codeBlock: {
                connect: {
                  id: codeBlock.id
                }
              }
            }
          });
        }
      }

      // Handle class-specific elements
      if (actualBlock.type === 'ClassDeclaration') {
        // Store class properties (including class field declarations)
        for (const property of actualBlock.body.body) {
          // Handle class fields/properties
          if (property.type === 'ClassProperty' || property.type === 'PropertyDefinition') {
            await prisma.jsclassproperties.create({
              data: {
                codeBlockId: codeBlock.id,
                propertyName: property.key.name,
                propertyType: property.typeAnnotation?.typeAnnotation?.type || 'any',
                isStatic: !!property.static,
                visibility: 'public',
                initialValue: property.value ? fileContent.slice(property.value.start, property.value.end) : null
              }
            });

            // Create code block for property initialization if it's a function
            if (property.value && (
              property.value.type === 'FunctionExpression' ||
              property.value.type === 'ArrowFunctionExpression'
            )) {
              await prisma.jscodeblocks.create({
                data: {
                  fileId: file.id,
                  blockType: 'function',
                  blockName: `${property.key.name}_initializer`,
                  content: fileContent.slice(property.value.start, property.value.end),
                  startLine: property.value.loc.start.line,
                  endLine: property.value.loc.end.line,
                  parentBlockId: codeBlock.id
                }
              });
            }
          }
          
          // Enhanced method handling
          if (property.type === 'MethodDefinition' || 
              (property.type === 'ClassProperty' && property.value?.type === 'ArrowFunctionExpression') ||
              (property.type === 'PropertyDefinition' && property.value?.type === 'ArrowFunctionExpression')) {
            const method = await prisma.jsclassmethods.create({
              data: {
                codeBlockId: codeBlock.id,
                methodName: property.key.name,
                isStatic: !!property.static,
                isAsync: property.value?.async || property.async || false,
                isArrowFunction: property.value?.type === 'ArrowFunctionExpression',
                content: fileContent.slice(property.start, property.end),
                documentation: property.leadingComments?.map(c => c.value).join('\n') || null
              }
            });

            // Create code block for method body
            const methodBody = property.value?.body || property.body;
            if (methodBody) {
              await prisma.jscodeblocks.create({
                data: {
                  fileId: file.id,
                  blockType: 'method_body',
                  blockName: `${property.key.name}_body`,
                  content: fileContent.slice(methodBody.start, methodBody.end),
                  startLine: methodBody.loc.start.line,
                  endLine: methodBody.loc.end.line,
                  parentBlockId: codeBlock.id,
                  methodId: method.id
                }
              });

              // Parse nested functions within method body
              if (methodBody.body) {
                for (const statement of methodBody.body) {
                  if (statement.type === 'FunctionDeclaration' ||
                      (statement.type === 'VariableDeclaration' && 
                       statement.declarations[0]?.init?.type === 'FunctionExpression') ||
                      statement.type === 'ArrowFunctionExpression') {
                    await prisma.jscodeblocks.create({
                      data: {
                        fileId: file.id,
                        blockType: 'nested_function',
                        blockName: statement.id?.name || 'anonymous',
                        content: fileContent.slice(statement.start, statement.end),
                        startLine: statement.loc.start.line,
                        endLine: statement.loc.end.line,
                        parentBlockId: codeBlock.id,
                        methodId: method.id
                      }
                    });
                  }
                }
              }
            }

            // Enhanced parameter handling
            const params = property.value?.params || property.params || [];
            for (const param of params) {
              await prisma.jsfunctionparams.create({
                data: {
                  paramName: param.name || (param.left && param.left.name) || 'unknown',
                  paramType: param.typeAnnotation?.typeAnnotation?.type || 'any',
                  defaultValue: param.right ? fileContent.slice(param.right.start, param.right.end) : null,
                  codeBlock: {
                    connect: {
                      id: codeBlock.id
                    }
                  },
                  method: {
                    connect: {
                      id: method.id  // Connect to the previously created method
                    }
                  }
                }
              });
            }
          }
        }
      }
    }

    // Store exports
    const exports = ast.body.filter(node => node.type === 'ExportNamedDeclaration');
    for (const exp of exports) {
      await prisma.jsexports.create({
        data: {
          fileId: file.id,
          exportType: 'named',
          exportedName: exp.declaration?.id?.name,
        },
      });
    }

    const result = await prisma.jsfiles.findFirst({
      where: { id: file.id },
      include: {
        codeblocks: true,
        imports: true,
        exports: true
      }
    });
    
    console.log('Final result:', {
      fileId: result.id,
      codeBlocksCount: result.codeblocks.length,
      importsCount: result.imports.length,
      exportsCount: result.exports.length
    });
    
    return result;
  } catch (error) {
    console.error('Failed to parse file:', error);
    throw error;
  }
}

async function generateMainTS(filePath) {
  // Get file data from database
  const file = await prisma.jsfiles.findFirst({
    where: { filename: filePath },
    include: {
      imports: true,
      exports: true,
      codeblocks: {
        include: {
          properties: true,
          methods: true,
        }
      }
    }
  });

  let output = '';
  
  // Generate imports section once at the top
  file.imports.forEach(imp => {
    output += `import { ${imp.importedName} } from '${imp.importSource}';\n`;
  });
  output += '\n';

  // Generate class once
  const classBlock = file.codeblocks.find(block => block.blockType === 'class');
  if (classBlock) {
    output += '/**\n * Bloggrs class\n */\n\n';
    output += 'export class Bloggrs {\n';
    
    // Properties
    classBlock.properties.forEach(prop => {
      output += `  ${prop.propertyName} = ${prop.initialValue || 'null'};\n`;
    });
    output += '\n';
    
    // Methods
    classBlock.methods.forEach(method => {
      if (method.documentation) {
        output += `  /**\n   * ${method.documentation}\n   */\n`;
      }
      const asyncMod = method.isAsync ? 'async ' : '';
      output += `  ${method.methodName}${asyncMod}() {\n`;
      output += `    ${method.content}\n`;
      output += '  }\n\n';
    });
    
    output += '}\n';
  }

  return output;
}

async function main() {
  try {
    const path = require('path');
    const filePath = path.resolve('C:\\Users\\Gjergj\\Desktop\\Projects\\bloggrs\\bloggrs\\src\\main.ts');
    console.log('Attempting to parse file:', filePath);
    
    const fileData = await parseAndStoreFile(filePath);
    
    // Generate and save the TypeScript output
    const generatedCode = await generateMainTS(filePath);
    const outputPath = path.join(path.dirname(filePath), 'generated.ts');
    fs.writeFileSync(outputPath, generatedCode, 'utf-8');
    
    console.log('Successfully processed file and generated output at:', outputPath);
    return fileData;
  } catch (err) {
    console.error('Error processing file:', err);
    throw err;
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

// Add helper function for version checking
function checkTypeScriptVersion(current, min, max) {
  const normalize = v => v.split('.').map(Number);
  const currentParts = normalize(current);
  const minParts = normalize(min);
  const maxParts = normalize(max);
  
  for (let i = 0; i < 3; i++) {
    if (currentParts[i] < minParts[i]) return false;
    if (currentParts[i] > minParts[i]) break;
  }
  
  for (let i = 0; i < 3; i++) {
    if (currentParts[i] > maxParts[i]) return false;
    if (currentParts[i] < maxParts[i]) break;
  }
  
  return true;
}

// Add these helper functions at the bottom
function getBlockType(block) {
  if (block.type === 'ClassDeclaration') return 'class';
  if (block.type === 'FunctionDeclaration') return 'function';
  if (block.type === 'VariableDeclaration') {
    const declaration = block.declarations[0];
    if (declaration?.init?.type === 'ArrowFunctionExpression' || 
        declaration?.init?.type === 'FunctionExpression') {
      return 'function';
    }
    return 'variable';
  }
  return 'other';
}

function getBlockName(block) {
  if (block.id?.name) return block.id.name;
  if (block.type === 'VariableDeclaration') {
    return block.declarations[0]?.id?.name || 'anonymous';
  }
  return 'anonymous';
}

function extractClassContent(classNode, fileContent) {
  // Find the actual class declaration start (after imports and comments)
  const classStart = fileContent.indexOf('export class', classNode.start);
  if (classStart === -1) return fileContent.slice(classNode.start, classNode.end);
  
  return fileContent.slice(classStart, classNode.end);
}
