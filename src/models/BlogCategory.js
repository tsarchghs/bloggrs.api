"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
        },
        scopes: {
        }
    }
    let BlogCategory = sequelize.define('BlogCategory', {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true
        },
    }, options);
    BlogCategory.findByPkOrError = async pk => {
        let blogCategory = await BlogCategory.findByPk(pk)
        if (!blogCategory) throw new ErrorHandler.get404("BlogCategory")
        return blogCategory;
    }
    BlogCategory.associate = models => {
    }
    
    return BlogCategory;
};