const jwt = require("jsonwebtoken")

module.exports = (userId, extra = {}, expiresIn, explicit_jwt_secret) => {
    let options = {}
    if (expiresIn) options.expiresIn = expiresIn;
    const token = jwt.sign({
        userId: userId,
        ...extra
    }, explicit_jwt_secret || process.env.JWT_SECRET, options);
    return token
}