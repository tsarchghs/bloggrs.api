const express = require("express");
const app = module.exports = express();

const swaggerUi = require('swagger-ui-express');

// const swaggerDocument = YAML.load(swagger_path);
const swaggerDocument = require("./swagger.json")

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
