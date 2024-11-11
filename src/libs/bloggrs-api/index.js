const express = require('express');
const { allowCrossDomain, validateRequest } = require('../../middlewares');
const BisonParser = require('./parser');

const app = express();
app.use(allowCrossDomain);

// Playground configuration store
const playgroundStore = {
  components: new Map(),
  apis: new Map(),
  pages: new Map(),
  themes: new Map()
};

// Component playground endpoints
app.post('/playground/components', validateRequest({
  body: ['name', 'code', 'props', 'style']
}), async (req, res) => {
  try {
    const { name, code, props, style } = req.body;
    const parsed = BisonParser.parseComponent(code);
    
    playgroundStore.components.set(name, {
      code: parsed.frontend,
      validation: parsed.validation,
      api: parsed.api,
      style,
      props
    });

    res.json({
      success: true,
      data: parsed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// API playground endpoints
app.post('/playground/apis', validateRequest({
  body: ['endpoint', 'schema']
}), async (req, res) => {
  try {
    const { endpoint, schema } = req.body;
    const parsed = BisonParser.parseEndpoint(endpoint);
    
    // Generate database models if schema provided
    let dbCode = {};
    if (schema) {
      const models = BisonParser.parseDbSchema(schema);
      dbCode = {
        migrations: BisonParser.generateMigrations(models),
        models: BisonParser.generateModels(models),
        config: BisonParser.generateDbConfig()
      };
    }

    playgroundStore.apis.set(endpoint.path, {
      frontend: parsed.frontend,
      backend: parsed.backend,
      db: dbCode
    });

    res.json({
      success: true,
      data: {
        ...parsed,
        db: dbCode
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Page playground endpoints
app.post('/playground/pages', validateRequest({
  body: ['route', 'code', 'apis']
}), async (req, res) => {
  try {
    const { route, code, apis } = req.body;
    const parsed = BisonParser.parseNextPage(code);
    
    // Generate API types and server-side props
    const apiTypes = apis ? BisonParser.generateApiTypes(apis) : '';
    const serverProps = BisonParser.generateServerSideProps({ [route]: { code } });

    playgroundStore.pages.set(route, {
      ...parsed,
      apiTypes,
      serverProps
    });

    res.json({
      success: true,
      data: {
        ...parsed,
        apiTypes,
        serverProps
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Theme playground endpoints
app.post('/playground/themes', validateRequest({
  body: ['name', 'styles']
}), async (req, res) => {
  try {
    const { name, styles } = req.body;
    playgroundStore.themes.set(name, styles);
    
    res.json({
      success: true,
      data: { name, styles }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate full project
app.post('/playground/generate', validateRequest({
  body: ['name', 'components', 'apis', 'pages', 'theme']
}), async (req, res) => {
  try {
    const { name, components, apis, pages, theme } = req.body;
    
    const projectData = {
      name,
      version: '1.0.0',
      dependencies: {
        dependencies: {
          'next': '^12.0.0',
          'react': '^17.0.2',
          'react-dom': '^17.0.2',
          'axios': '^0.24.0'
        },
        devDependencies: {
          'typescript': '^4.5.0',
          '@types/react': '^17.0.0',
          '@types/node': '^16.0.0'
        }
      },
      pages: Object.fromEntries(playgroundStore.pages),
      components: Object.fromEntries(playgroundStore.components),
      endpoints: Array.from(playgroundStore.apis.values()),
      theme: playgroundStore.themes.get(theme)
    };

    const generatedProject = BisonParser.parseNextProject(projectData);

    res.json({
      success: true,
      data: generatedProject
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get playground state
app.get('/playground/state', async (req, res) => {
  try {
    const state = {
      components: Object.fromEntries(playgroundStore.components),
      apis: Object.fromEntries(playgroundStore.apis),
      pages: Object.fromEntries(playgroundStore.pages),
      themes: Object.fromEntries(playgroundStore.themes)
    };
    
    res.json({
      success: true,
      data: state
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = app;