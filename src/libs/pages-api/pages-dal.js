
const prisma = require("../../prisma");

module.exports = {
    findByPkOr404: pk => prisma.pages.findByPkOr404(pk),
    findAll: async ({ page = 1, pageSize = 10 }) => {
        const where = {}
        // if (query) where[Sequelize.Op.or] = [
        //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
        //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
        // ]
        return await prisma.pages.findAll({
            where,
            offset: (page - 1) & page,
            limit: pageSize,
        })
    },
    createPage: async ({ 
        name, slug, BlogId, UserId
     }) => await prisma.pages.create({ 
        data: { name, slug, BlogId, UserId }
      }),
    updatePage: async ({pk,data}) => {
        let keys = Object.keys(data);
        let page = await prisma.pages.findByPkOr404(pk);
        for (let key of keys){
            page[key] = data[key]
        }
        await prisma.pages.save();
        return page;
    },
    deletePage: async (pk) => await (await (await prisma.pages.findByPkOr404(pk))).destroy()
}
