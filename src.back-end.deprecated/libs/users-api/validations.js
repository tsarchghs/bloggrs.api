
const yup = require("yup");
const { email, password } = require("../utils/validations");

module.exports = {
    only_user_id_param_required: yup.object().shape({
        params: yup.object().shape({
            user_id: yup.string().test("is-number", val => !isNaN(Number(val)))
        })
    }),
    post_users: yup.object().shape({
        requestBody: yup.object().shape({
            email: email.required(),
            password: password.required(),
            first_name: yup.string().required().min(5),
            last_name: yup.string().required().min(5),
        })
    }),
    post_users_unrestricted: yup.object().shape({
        requestBody: yup.object().shape({
            email: email.required(),
            password: password.required(),
            first_name: yup.string().required().min(5),
            last_name: yup.string().required().min(5),
        })
    }),
    patch_users_unrestricted: yup.object().shape({
        requestBody: yup.object().shape({
            email: email,
            password: password,
            first_name: yup.string().min(5),
            last_name: yup.string().min(5)
        })
    })
}