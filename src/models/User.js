"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
            attributes: { exclude: [ "password" ] },
        },
        scopes: {
            withPassword: {
                attributes: {},
            },
        }
    }
    let User = sequelize.define('User', {
        email: {
            type: DataTypes.STRING,
            unique: true,
            allowNull: false
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        first_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        last_name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        isGuest: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
        }
    }, options);
    User.findByPkOrError = async pk => {
        let user = await User.findByPk(pk)
        if (!user) throw new ErrorHandler.get404("User")
        return user;
    }
    User.associate = models => {
        User.hasOne(models.Referral)
    }
    
    return User;
};