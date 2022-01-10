const prisma = require("../../prisma");
const {
  findAll: findAllBlogPostCategories,
} = require("../blogpostcategories-dal");

module.exports = {
  findByPkOr404: (pk) => prisma.blogs.findUnique({ where: { id: Number(pk) }}),
  findAll: async ({ page = 1, pageSize = 10 }) => {
    const where = {};
    // if (query) where[Sequelize.Op.or] = [
    //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
    //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
    // ]
    return await prisma.blogs.findMany({
      where,
      skip: (page - 1) & page,
      take: pageSize,
    });
  },
  createBlog: async ({ name, description, logo_url, UserId, BlogCategoryId }) =>
    await prisma.blogs.create({
      data: {
        name,
        description,
        logo_url,
        UserId,
        BlogCategoryId,  
      }
    }),
  updateBlog: async ({ pk, data }) => {
    let keys = Object.keys(data);
    let blog = await prisma.blogs.findByPkOr404(pk);
    for (let key of keys) {
      blog[key] = data[key];
    }
    await blog.save();
    return blog;
  },
  deleteBlog: async (pk) =>
    await (await await prisma.blogs.findByPkOr404(pk)).destroy(),
  generateSecret: async (BlogId) => {
    const secretKey = await prisma.secretkeys.create({
      BlogId,
    });
    return secretKey.id;
  },
  getBlogCategories: async (BlogId) => {
    const blogpostcategories = await findAllBlogPostCategories({ BlogId });
    let categories = blogpostcategories.map((bpc) => bpc.Category);
    categories = categories.map(async (ctg) => {
      ctg = JSON.parse(JSON.stringify(ctg));
      ctg.meta = {};
      ctg.meta.posts_count = await prisma.postcategories.count({
        where: { CategoryId: ctg.id },
        include: {
          model: Post,
          where: { BlogId },
        },
      });
      return ctg;
    });
    return Promise.all(categories);
  },
  getBlogPages: async (BlogId) => {
      const pages = await prisma.pages.findAll({
          where: { BlogId }
      })
      return pages;
  }
};
