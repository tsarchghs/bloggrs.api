"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
        },
        scopes: {
        }
    }
    let Referral = sequelize.define('Referral', {
        type: {
            type: DataTypes.ENUM("BLOG")
        }
    }, options);
    Referral.findByPkOrError = async pk => {
        let referral = await Referral.findByPk(pk)
        if (!referral) throw new ErrorHandler.get404("Referral")
        return referral;
    }
    Referral.associate = models => {
        Referral.belongsTo(models.Blog)
        Referral.belongsTo(models.User, { foreignKey: { allowNull: false }})
    }
    
    return Referral;
};