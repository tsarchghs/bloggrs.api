
const prisma = require("../../prisma");

module.exports = {
    findByPkOr404: pk => prisma.postcomments.findByPkOr404(pk),
    findAll: async ({ page = 1, pageSize = 10, PostId }) => {
        const where = {}
        if (PostId) where.PostId = Number(PostId);
        // if (query) where[Sequelize.Op.or] = [
        //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
        //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
        // ]
        return await prisma.postcomments.findMany({
            where,
            skip: (page - 1) & page,
            take: pageSize,
        })
    },
    createPostComment: async ({ 
        content, PostId, UserId
     }) => await prisma.postcomments.create({ 
        data: { content, PostId, UserId }
      }),
    updatePostComment: async ({pk,data}) => {
        let keys = Object.keys(data);
        let postComment = await prisma.postcomments.findByPkOr404(pk);
        for (let key of keys){
            postComment[key] = data[key]
        }
        await postcomments.save();
        return postComment;
    },
    deletePostComment: async (pk) => await (await (await prisma.postcomments.findByPkOr404(pk))).destroy()
}
