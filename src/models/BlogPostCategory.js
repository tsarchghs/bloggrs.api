"use strict";

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
  let options = {
    defaultScope: {},
    scopes: {},
  };
  let BlogPostCategory = sequelize.define("BlogPostCategory", {}, options);
  BlogPostCategory.findByPkOrError = async (pk) => {
    let blogPostCategory = await BlogPostCategory.findByPk(pk);
    if (!blogPostCategory) throw new ErrorHandler.get404("BlogPostCategory");
    return blogPostCategory;
  };
  BlogPostCategory.associate = (models) => {
    BlogPostCategory.belongsTo(models.Category);
    BlogPostCategory.belongsTo(models.Blog);
  };

  return BlogPostCategory;
};
