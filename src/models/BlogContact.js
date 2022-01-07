"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
        },
        scopes: {
        }
    }
    let BlogContact = sequelize.define('BlogContact', {
        first_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        content: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        }
    }, options);
    BlogContact.findByPkOrError = async pk => {
        let blogContact = await BlogContact.findByPk(pk)
        if (!blogContact) throw new ErrorHandler.get404("BlogContact")
        return blogContact;
    }
    BlogContact.associate = models => {
        BlogContact.belongsTo(models.Blog, { foreignKey: { allowNull: false }})
    }
    
    return BlogContact;
};