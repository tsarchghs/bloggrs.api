"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
        },
        scopes: {
        }
    }
    let PostComment = sequelize.define('PostComment', {
        content: {
            type: DataTypes.TEXT('medium'),
            allowNull: false
        }
    }, options);
    PostComment.findByPkOrError = async pk => {
        let postComment = await PostComment.findByPk(pk)
        if (!postComment) throw new ErrorHandler.get404("PostComment")
        return postComment;
    }
    PostComment.associate = models => {
        PostComment.belongsTo(models.Post, { foreignKey: { allowNull: false } });
        PostComment.belongsTo(models.User, { foreignKey: { allowNull: false } });
    }
    
    return PostComment;
};