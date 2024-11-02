
const prisma = require("../../prisma")

module.exports = {
    findByPkOr404: pk => prisma.blogcategories.findByPkOr404(pk),
    findAll: async ({ query, page = 1, pageSize = 10 }) => {
        const where = {}
        if (query) where.name = { contains: query }
        return await prisma.blogcategories.findMany({
            where,
            skip: (page - 1) & page,
            take: pageSize,
        })
    },
    createBlogCategory: async ({ 
        name,
        blog_id
     }) => await prisma.blogcategories.create({ 
        data: { name, blogs: { connect: { id: blog_id } } }
      }),
    updateBlogCategory: async ({pk,data}) => {
        let keys = Object.keys(data);
        let blogCategory = await prisma.blogcategories.findByPkOr404(pk);
        for (let key of keys){
            blogCategory[key] = data[key]
        }
        await blogCategory.save();
        return blogCategory;
    },
    deleteBlogCategory: async (pk) => await (await (await prisma.blogcategories.findByPkOr404(pk))).destroy()
}
