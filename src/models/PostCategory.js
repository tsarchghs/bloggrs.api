"use strict";

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
  let options = {
    defaultScope: {},
    scopes: {},
  };
  let PostCategory = sequelize.define("PostCategory", {}, options);
  PostCategory.findByPkOrError = async (pk) => {
    let postCategory = await PostCategory.findByPk(pk);
    if (!postCategory) throw new ErrorHandler.get404("PostCategory");
    return postCategory;
  };
  PostCategory.associate = (models) => {
    PostCategory.belongsTo(models.Post);
    PostCategory.belongsTo(models.Category);
  };

  return PostCategory;
};
