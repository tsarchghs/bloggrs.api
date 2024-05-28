
const prisma = require("../../prisma")

module.exports = {
    findByPkOr404: pk => prisma.blogthemes.findByPkOr404(pk),
    findAll: async ({ page = 1, pageSize = 10 }) => {
        const where = {}
        // if (query) where[Sequelize.Op.or] = [
        //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
        //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
        // ]
        return await prisma.blogthemes.findMany({
            where,
            skip: (page - 1) * pageSize,
            take: pageSize,
        })
    },
    createBlogTheme: async ({ 
        name, description, theme_url, BlogId
     }) => await prisma.blogthemes.create({ 
        data: { name, description, theme_url, BlogId }
      }),
    updateBlogTheme: async ({pk,data}) => {
        let keys = Object.keys(data);
        let blogtheme = await prisma.blogthemes.findByPkOr404(pk);
        for (let key of keys){
            blogtheme[key] = data[key]
        }
        await blogtheme.save();
        return blogtheme;
    },
    deleteBlogTheme: async (pk) => await (await (await prisma.blogthemes.findByPkOr404(pk))).destroy()
}
