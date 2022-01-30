
const { User } = require("../../models")

module.exports = {
    findUserByPk: async pk => await User.findByPk(pk)
}