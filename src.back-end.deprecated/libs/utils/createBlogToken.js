const jwt = require("jsonwebtoken")

module.exports = (blogId, extra = {}, expiresIn, explicit_jwt_secret) => {
    let options = {}
    if (expiresIn) options.expiresIn = expiresIn;
    const token = jwt.sign({
        blogId: blogId,
        ...extra
    }, explicit_jwt_secret || process.env.JWT_SECRET, options);
    return token
}