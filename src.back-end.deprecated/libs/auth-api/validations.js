const yup = require("yup");

const { email, password } = require("../utils/validations");

module.exports = {
    post_auth: yup.object().shape({
        requestBody: yup.object().shape({
            email: email.required(),
            password: password.required()
        }).required()
    })
}
