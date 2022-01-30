const { ErrorHandler } = require("../../utils/error")
const bcrypt = require("bcryptjs")

let { User } = require("../../models")

const INVALID_CREDENTIALS_ERROR = new ErrorHandler(400, "Invalid credentials", [
    "Email or password is incorrect. Please try again."
])

module.exports = async ({ email, password }) => {
    let user = await User.scope('withPassword').findOne({ where: { email } })
    if (!user) throw INVALID_CREDENTIALS_ERROR
    const match = await bcrypt.compare(password, user.password);
    user.password = undefined
    if (match) return user;
    else throw INVALID_CREDENTIALS_ERROR
}
