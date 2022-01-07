"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
        },
        scopes: {
        }
    }
    let SecretKey = sequelize.define('SecretKey', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
          },
    }, options);
    SecretKey.findByPkOrError = async pk => {
        let secretKey = await SecretKey.findByPk(pk)
        if (!secretKey) throw new ErrorHandler.get404("SecretKey")
        return secretKey;
    }
    SecretKey.associate = models => {
        SecretKey.belongsTo(models.Blog, {
            foreignKey: { allowNull: false }
        })
    }
    
    return SecretKey;
};