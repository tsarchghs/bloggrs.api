
const prisma = require("../../prisma")

module.exports = {
    findUserByPk: async pk => await prisma.users.findUnique({ 
        where: { id: pk }
    })
}