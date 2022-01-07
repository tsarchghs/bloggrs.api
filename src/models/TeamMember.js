"use strict"

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
    let options = { 
        defaultScope: {
        },
        scopes: {
        }
    }
    let TeamMember = sequelize.define('TeamMember', {

    }, options);
    TeamMember.findByPkOrError = async pk => {
        let teamMember = await TeamMember.findByPk(pk)
        if (!teamMember) throw new ErrorHandler.get404("TeamMember")
        return teamMember;
    }
    TeamMember.associate = models => {
        TeamMember.belongsTo(models.User, { foreignKey: { allowNull: false } });
        TeamMember.belongsTo(models.Blog, { foreignKey: { allowNull: false } });
    }
    
    return TeamMember;
};