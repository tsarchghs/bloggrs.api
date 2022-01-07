"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
        },
        scopes: {
        }
    }
    let PostLike = sequelize.define('PostLike', {

    }, options);
    PostLike.findByPkOrError = async pk => {
        let postLike = await PostLike.findByPk(pk)
        if (!postLike) throw new ErrorHandler.get404("PostLike")
        return postLike;
    }
    PostLike.associate = models => {
        PostLike.belongsTo(models.Post, { foreignKey: { allowNull: false }});
        PostLike.belongsTo(models.User, { foreignKey: { allowNull: false }});
    }
    
    return PostLike;
};