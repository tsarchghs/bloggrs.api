const prisma = require("../../prisma")

module.exports = {
  findAll: async ({ BlogId, page = 1, pageSize = 10 }) => {
    const where = {};
    if (BlogId) where.BlogId = Number(BlogId);
    // if (query) where[Sequelize.Op.or] = [
    //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
    //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
    // ]
    console.log({
      where,
      skip: (page - 1) & page,
      take: pageSize,
    })
    return await prisma.blogpostcategories.findMany({
      where,
      skip: (page - 1) & page,
      take: pageSize,
      include: {
        categories: true
      }
    });
  },
};
