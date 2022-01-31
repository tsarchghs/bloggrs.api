const { randomUUID } = require("crypto");
const prisma = require("../../prisma");
const {
  findAll: findAllBlogPostCategories,
} = require("../blogpostcategories-dal");

module.exports = {
  getBlogHeaderWidetData: async BlogId => {
    BlogId = Number(BlogId)
    const pages = await prisma.pages.findMany({ where: { BlogId }})
    const blog = await prisma.blogs.findUnique({ where: { id: BlogId }});
    await pages;await blog;
    return { blog, pages }
  },
  findByPkOr404: (pk) => prisma.blogs.findUnique({ where: { id: Number(pk) }}),
  findBySlug: (slug) => prisma.blogs.findUnique({ where: { slug }}),
  findAll: async ({ page = 1, pageSize = 10 }) => {
    page = Number(page)
    pageSize = Number(pageSize)
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
      data: { id: randomUUID() ,BlogId: Number(BlogId) },
    });
    return secretKey.id;
  },
  generatePublicKey: async (BlogId) => {
    const publickey = await prisma.publickeys.create({
      data: { id: randomUUID() ,BlogId: Number(BlogId) },
    });
    return publickey.id;
  },
  getBlogCategories: async (BlogId, { page = 1, pageSize = 10 }) => {
    BlogId = Number(BlogId)
    page = Number(page)
    pageSize = Number(pageSize)
    const blogpostcategories = await findAllBlogPostCategories({ BlogId, page, pageSize });
    let categories = blogpostcategories.map((bpc) => bpc.categories);
    console.log(categories,'categories')
    categories = categories.map(async (ctg) => {
      ctg = JSON.parse(JSON.stringify(ctg));
      ctg.meta = {};
      ctg.meta.posts_count = await prisma.postcategories.count({
        where: { CategoryId: ctg.id },
      });
      return ctg;
    });
    return Promise.all(categories);
  },
  getBlogPages: async (BlogId, { page = 1, pageSize = 10 }) => {
    BlogId = Number(BlogId)
    page = Number(BlogId)
    pageSize = Number(pageSize)
    const pages = await prisma.pages.findMany({
      where: { BlogId },
      skip: (page - 1) & page,
      take: pageSize,
    })
    return pages;
  },
  likeBlogPostHandler: async ({ PostId, UserId, action }) => {
    PostId = Number(PostId)
    UserId = Number(UserId)
    switch (action) {
      case "like": await prisma.postlikes.create({ data: { PostId, UserId } }); break;
      case "unlike": await prisma.postlikes.deleteMany({ where: { PostId, UserId } }); break; 
    }
    return true;
  }
};
