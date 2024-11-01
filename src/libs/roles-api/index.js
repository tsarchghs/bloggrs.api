const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired, checkPermission } = require("../../middlewares");
const { findAll, createRole, updateRole, deleteRole, findByPkOr404 } = require("./roles-dal");
const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain);

const RoleFields = {
    name: yup.string().max(255).required(),
    value: yup.string().required(),
    description: yup.string().max(255).nullable(),
    isSystem: yup.boolean().default(false),
    permissions: yup.array().of(yup.string()),
}
const RoleFieldKeys = Object.keys(RoleFields);

app.get("/roles", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            page: yup.number().integer().positive().default(1),
            pageSize: yup.number().integer().positive().default(10),
            query: yup.string()
        })
    }))
], async (req, res) => {
    let roles = await findAll(req.query);
    return res.json({
        message: "success",
        code: 200,
        data: { roles }
    });
});

app.get("/roles/:role_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            role_id: param_id.required()
        })
    }))
], async (req, res) => {
    const role = await findByPkOr404(req.params.role_id);
    return res.json({
        code: 200,
        message: "success",
        data: { role }
    });
});

const CreateRoleFields = {};
RoleFieldKeys.map(key => CreateRoleFields[key] = RoleFields[key].required());
app.post("/roles", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreateRoleFields)
    }))
], async (req, res) => {
    let role = await createRole({ tenantId: 1,...req.body, UserId: req.user.id });
    return res.json({
        code: 200,
        message: "success",
        data: { role }
    });
});

app.patch("/roles/:role_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(RoleFields),
        params: yup.object().shape({
            role_id: param_id.required()
        })
    }))
], async (req, res) => {
    let role = await updateRole({
        pk: req.params.role_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { role }
    });
});

app.delete("/roles/:role_id", [
    jwtRequired, passUserFromJWT,
    checkPermission('roles', 'delete'),
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            role_id: param_id.required()
        })
    }))
], async (req, res) => {
    await deleteRole(req.params.role_id);
    return res.json({
        code: 204,
        message: "success"
    });
}); 