
const yup = require("yup");

module.exports = {
    id: yup.number().integer().positive(),
    email: yup.string().email(),
    password: yup.string().min(8),
    positive_integer_as_string: yup.string().test("is-integer", val => !val || !isNaN(Number(val))),
    param_id: yup.string()
        .test(val => val === undefined || !isNaN(Number(val)))
        .test(val => val === undefined || Number(val) > 0),
}