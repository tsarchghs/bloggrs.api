const prisma = require("../../prisma")

module.exports = {
  findByPkOr404: (pk) => prisma.blogpostcategories.findByPkOr404(pk),
  findAll: async ({ page = 1, pageSize = 10 }) => {
    const where = {};
    // if (query) where[Sequelize.Op.or] = [
    //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
    //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
    // ]
    return await prisma.blogpostcategories.findMany({
      where,
      skip: (page - 1) & page,
      take: pageSize,
    });
  },
  createBlogPostCategory: async ({ BlogId, CategoryId }) =>
    await prisma.blogpostcategories.create({
      data: {
        BlogId,
        CategoryId,
      }
    }),
  updateBlogPostCategory: async ({ pk, data }) => {
    let keys = Object.keys(data);
    let blogPostCategory = await prisma.blogpostcategories.findByPkOr404(pk);
    for (let key of keys) {
      blogPostCategory[key] = data[key];
    }
    await blogPostCategory.save();
    return blogPostCategory;
  },
  deleteBlogPostCategory: async (pk) =>
    await (await await prisma.blogpostcategories.findByPkOr404(pk)).destroy(),
};
