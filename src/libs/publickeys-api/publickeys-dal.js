
const { randomUUID } = require("crypto");
const prisma = require("../../prisma")


module.exports = {
    findByPkOr404: pk => prisma.publickeys.findUnique({where: { id: pk }}),
    findAll: async ({ page = 1, pageSize = 10 }) => {
        const where = {}
        // if (query) where[Sequelize.Op.or] = [
        //     { contract_type: { [Sequelize.Op.like]: `%${query}%` } },
        //     { comment: { [Sequelize.Op.like]: `%${query}%` } }
        // ]
        return await prisma.publickeys.findAll({
            where,
            offset: (page - 1) & page,
            limit: pageSize,
        })
    },
    createPublicKey: async ({ 
        BlogId
     }) => await prisma.publickeys.create({ 
        data: { BlogId, id: randomUUID() }
      }),
    updatePublicKey: async ({pk,data}) => {
        let keys = Object.keys(data);
        let publicKey = await prisma.publickeys.findByPkOr404(pk);
        for (let key of keys){
            publicKey[key] = data[key]
        }
        await publicKey.save();
        return publicKey;
    },
    deletePublicKey: async (pk) => await (await (await prisma.publickeys.findByPkOr404(pk))).destroy()
}
