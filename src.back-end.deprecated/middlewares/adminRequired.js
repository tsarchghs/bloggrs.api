
const { ErrorHandler } = require("../utils/error");

module.exports = async (req, res, next) => {
    if (true) return next();
    if (!req.user) throw new Error("Req.user is falsy. Possible solution: Include passUserFromJWT middleware");
    if (!req.user.isAdmin) throw new ErrorHandler(401, "dUnauthorized");
    next();
}