let fs = require("fs");
var path = require('path');
var basename = path.basename(__filename);

let middlewares = {}

fs.readdirSync(__dirname)
    .filter(file => {
        return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
    })
    .forEach(file => {
        const middleware = require(path.join(__dirname, file))
        middlewares[file.split(".")[0]] = middleware;
    });

module.exports = middlewares