
const expressJwt = require('express-jwt'); 

module.exports = expressJwt({
    secret: process.env.JWT_SECRET,
    credentialsRequired: true,
    requestProperty: "auth",
    algorithms: ['HS256']
})