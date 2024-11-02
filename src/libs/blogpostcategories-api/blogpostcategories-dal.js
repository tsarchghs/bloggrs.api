const { PrismaClient } = require("@prisma/client");
const { connect } = require("http2");
const prisma = new PrismaClient();

async function findAll({ page = 1, pageSize = 10, status, query }) {
  const where = {};
  if (status) where.status = status;
  if (query) {
    where.OR = [
      { BlogId: { contains: query } },
      { CategoryId: { contains: query } },
    ];
  }

  return await prisma.blogpostcategories.findMany({
    where,
    skip: (page - 1) * pageSize,
    take: pageSize,
    include: {
      blogs: true,
      categories: true,
    }
  });
}

async function createBlogPostCategory(data) {
  // Create category if it doesn't exist
  let category = await prisma.categories.findFirst({
    where: { name: data.CategoryId }
  });

  if (!category) {
    // Generate a unique slug from the name
    const slug = data.CategoryId.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');

    // Check if slug exists and append number if needed
    let uniqueSlug = slug;
    let counter = 1;
    while (await prisma.categories.findFirst({ where: { slug: uniqueSlug } })) {
      uniqueSlug = `${slug}-${counter}`;
      counter++;
    }

    category = await prisma.categories.create({
      data: {
        name: data.CategoryId,
        slug: uniqueSlug,
      }
    });
  }

  // Use the category's id for the blog post category
  const blogPostCategoryData = {
    ...data,
    CategoryId: category.id,
    BlogId: data.BlogId,
  };

  return await prisma.blogpostcategories.create({
    data: blogPostCategoryData,
    include: {
      blogs: true,
      categories: true,
      

    },
  });
}

async function updateBlogPostCategory({ pk, data }) {
  const [CategoryId, BlogId] = pk.split(',').map(Number);
  return await prisma.blogpostcategories.update({
    where: { CategoryId_BlogId: { CategoryId, BlogId } },
    data,
    include: {
      blogs: true,
      categories: true,
    },
  });
}

async function deleteBlogPostCategory(pk) {
  const [CategoryId, BlogId] = pk.split(',').map(Number);
  return await prisma.blogpostcategories.delete({
    where: { CategoryId_BlogId: { CategoryId, BlogId } },
  });
}

async function findByPkOr404(pk) {
  const [CategoryId, BlogId] = pk.split(',').map(Number);
  const blogpostcategory = await prisma.blogpostcategories.findUnique({
    where: { CategoryId_BlogId: { CategoryId, BlogId } },
    include: {
      blogs: true,
      categories: true,
    },
  });

  if (!blogpostcategory) {
    throw new ErrorHandler(404, "BlogPostCategory not found");
  }

  return blogpostcategory;
}

module.exports = {
  findAll,
  createBlogPostCategory,
  updateBlogPostCategory,
  deleteBlogPostCategory,
  findByPkOr404,
};
