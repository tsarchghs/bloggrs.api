"use strict";

const { ErrorHandler } = require("../utils/error");

module.exports = (sequelize, DataTypes) => {
  let options = {
    defaultScope: {},
    scopes: {},
  };
  let Category = sequelize.define(
    "Category",
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
    },
    options
  );
  Category.findByPkOrError = async (pk) => {
    let category = await Category.findByPk(pk);
    if (!category) throw new ErrorHandler.get404("Category");
    return category;
  };
  Category.associate = (models) => {
    Category.belongsToMany(models.Post, { through: models.PostCategory });
    Category.belongsToMany(models.Blog, { through: models.BlogPostCategory });
  };

  return Category;
};
