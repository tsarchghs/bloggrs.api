const { findUserByPk, createGuestUser } = require("../libs/users-dal");
const { ErrorHandler } = require("../utils/error")

module.exports = async (req, res, next) => {
    if (req.auth) req.user = await findUserByPk(req.auth.userId)
    if (!req.user) req.user = await createGuestUser()
    return next();
}