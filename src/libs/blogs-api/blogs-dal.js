const { randomUUID } = require("crypto");
const prisma = require("../../prisma");
const {
  findAll: findAllBlogPostCategories,
} = require("../blogpostcategories-dal");
const { getBlocks, setBlocks } = require("../blocks-dal");
const { transformPage } = require("../pages-api/pages-dal");
const { ErrorHandler } = require("../../utils/error");
const slugify = require('slugify');
const publickeysDal = require("../publickeys-api/publickeys-dal");
const pagesDal = require("../pages-api/pages-dal");


const transformBlog = async blog => {
  // console.log({ blog },222)
  // blog = JSON.parse(JSON.stringify(blog));
  blog.blocks = await getBlocks({ BlogId: blog.id })
  const key = await publickeysDal.findOne({
    BlogId: blog.id
  })
  blog.public_key = key.id;
  blog.pages = await pagesDal.findAll({ BlogId: blog.id });
  return blog;
}
const findByPkOr404 = async (pk) => {
  const blog = await prisma.blogs.findUnique({ where: { id: Number(pk) }})
  if (!blog) throw new ErrorHandler.get404("Blog")
  return await transformBlog(blog);
}

const getBlogByApiKey = async apikey => {
  const publickey = await publickeysDal.findOne(
    { id: apikey } 
  )
  if (!publickey) throw new ErrorHandler.gett404("Blog");
  const { BlogId } = publickey;
  const blog = await prisma.blogs.findUnique({
    where: { id: BlogId }
  })
  return blog;
}

const updateBlog = async ({ pk, data }) => {
  // let keys = Object.keys(data);
  // let blog = await findByPkOr404(pk);
  // for (let key of keys) {
  //   blog[key] = data[key];
  // }
  // // await blog.save();
  // const { id: blog_id } = blog;
  const blog = await prisma.blogs.update({
    where: { id: Number(pk) },
    data
  })
  return blog;
}

module.exports = {
  getBlogByApiKey,
  update_page_state: async ({ apikey, page_id, craftjs_json_state }) => {
    console.log({ apikey })
    const blog = await getBlogByApiKey(apikey)
    console.log(111)
    if (page_id === "index") {
      await updateBlog({ pk: blog.id, data: { craftjs_json_state }})
      blog.craftjs_json_state = craftjs_json_state;
      return blog;
    } else {
      const page = await pagesDal.findByPkOr404(page_id);
      if ( page.BlogId !== blog.id ) throw new ErrorHandler(401, "No access to page");
      await pagesDal.updatePage({
        pk: page.id,
        data: {
          craftjs_json_state
        }
      })
      page.craftjs_json_state = craftjs_json_state;
      return page;
    }
  },
  findByPkOr404,
  getBlogHeaderWidetData: async BlogId => {
    BlogId = Number(BlogId)
    const pages = await prisma.pages.findMany({ where: { BlogId }})
    const blog = await prisma.blogs.findUnique({ where: { id: BlogId }});
    await pages;await blog;
    await transformBlog(blog);
    return { blog, pages }
  },

  findBySlug: async (slug) => {
    const blog = await prisma.blogs.findUnique({ where: { slug }}) 
    await transformBlog(blog);
    return blog; 
  },
  findAll: async ({ page = 1, pageSize = 10, UserId }) => {
    page = Number(page)
    pageSize = Number(pageSize)
    const where = {};
    if (UserId) where.UserId = UserId;
    // if (query) where[Sequelize.Op.or] = [
    //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
    //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
    // ]
    const blogs = await prisma.blogs.findMany({
      where,
      skip: (page - 1) & page,
      take: pageSize,
    });
    for (let blog of blogs) {
      await transformBlog(blog);
    }
    return blogs;
  },
  createBlog: async ({ 
    name, slug, craftjs_json_state, description,
    logo_url, UserId, BlogCategoryId, blocks
  }) => {
    console.log({
      name, slug,
      craftjs_json_state,
      description,
      logo_url,
      UserId,
      BlogCategoryId,
    })
    if (!slug) slug = slugify(name)
    if (!description) description = "not set";
    const blog = await prisma.blogs.create({
      data: {
        name,
        slug,
        craftjs_json_state,
        description,
        logo_url,
        UserId, 
        BlogCategoryId,
      }
    })
    return blog;
  },
  updateBlog,
  deleteBlog: async (pk) =>
    await (await await findByPkOr404(pk)).destroy(),
  generateSecret: async (BlogId) => {
    const secretKey = await prisma.secretkeys.create({
      data: { id: randomUUID(), BlogId: Number(BlogId) },
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
    page = Number(page)
    pageSize = Number(pageSize)
    const pages = await prisma.pages.findMany({
      where: { BlogId },
      skip: (page - 1) & page,
      take: pageSize,
    })
    return await Promise.all(
      pages.map(page => transformPage(page))
    )
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
