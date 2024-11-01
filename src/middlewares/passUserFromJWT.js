
const { findUserByPk } = require("../libs/users-dal");
const { ErrorHandler } = require("../utils/error")

module.exports = async (req, res, next) => {
    if (!req.auth || !req.auth.userId) throw new ErrorHandler(401, "Unauthorized") 
    req.user = await findUserByPk(req.auth.userId)
    if (!req.user) throw new ErrorHandler(401, "Unauthorized")
    next();
}