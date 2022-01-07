"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
        },
        scopes: {
        }
    }
    let Page = sequelize.define('Page', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        slug: {
            type: DataTypes.STRING,
            allowNull: false
        }
    }, options);
    Page.findByPkOrError = async pk => {
        let page = await Page.findByPk(pk)
        if (!page) throw new ErrorHandler.get404("Page")
        return page;
    }
    Page.associate = models => {
        Page.belongsTo(models.Blog, { foreignKey: { allowNull: false } });
        Page.belongsTo(models.User, { foreignKey: { allowNull: false } });
    }
    
    return Page;
};