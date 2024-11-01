const { PrismaClient } = require("@prisma/client");
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
    },
  });
}

async function createBlogPostCategory(data) {
  return await prisma.blogpostcategories.create({
    data,
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
