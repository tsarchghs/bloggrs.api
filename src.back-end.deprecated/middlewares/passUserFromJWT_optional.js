
const { findUserByPk } = require("../libs/users-dal");
const { ErrorHandler } = require("../utils/error")

module.exports = async (req, res, next) => {
    if (req.auth){
        req.user = await findUserByPk(req.auth.userId)
    }
    next();
}