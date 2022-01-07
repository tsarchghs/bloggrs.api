
const prisma = require("../../prisma");

module.exports = {
    findByPkOr404: pk => prisma.posts.findByPkOr404(pk),
    findAll: async ({ page = 1, pageSize = 10 }) => {
        const where = {}
        // if (query) where[Sequelize.Op.or] = [
        //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
        //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
        // ]
        return await prisma.posts.findAll({
            where,
            offset: (page - 1) & page,
            limit: pageSize,
        })
    },
    createPost: async ({ 
        title, slug, html_content, status,
        BlogId, UserId
     }) => await prisma.posts.create({ 
         data: {
            title, slug, html_content, status,
            BlogId, UserId
         }
      }),
    updatePost: async ({pk,data}) => {
        let keys = Object.keys(data);
        let post = await prisma.posts.findByPkOr404(pk);
        for (let key of keys){
            post[key] = data[key]
        }
        await posts.save();
        return post;
    },
    deletePost: async (pk) => await (await (await prisma.posts.findByPkOr404(pk))).destroy()
}
