const prisma = require("../../prisma");

module.exports = {
  findByPkOr404: (pk) => Category.findByPkOr404(pk),
  findAll: async ({ BlogId, page = 1, pageSize = 10 }) => {
    const where = {};
    if (BlogId) where.BlogId = BlogId;
    // if (query) where[Sequelize.Op.or] = [
    //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
    //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
    // ]
    return await prisma.categories.findMany({
      where,
      skip: (page - 1) & page,
      take: pageSize,
    });
  },
  createCategory: async ({ name }) =>
    await prisma.categories.create({
      data: { name }
    }),
  updateCategory: async ({ pk, data }) => {
    let keys = Object.keys(data);
    let category = await prisma.categories.findByPkOr404(pk);
    for (let key of keys) {
      category[key] = data[key];
    }
    await category.save();
    return category;
  },
  deleteCategory: async (pk) =>
    await (await await prisma.categories.findByPkOr404(pk)).destroy(),
};
