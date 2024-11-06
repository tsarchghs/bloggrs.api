const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT } = require("../../middlewares");
const { findAll, createPermission, updatePermission, deletePermission, findByPkOr404, deleteRolePermissions, deleteTenantPermissions } = require("./permissions-dal");
const yup = require("yup");
const { param_id } = require("../utils/validations");

app.use(allowCrossDomain);

const PermissionFields = {
    name: yup.string().max(255).required(),
    action: yup.string().max(255).required(),
    resource: yup.string().max(255).required(),
    description: yup.string().max(255).nullable(),
    isSystem: yup.boolean().default(false),
    roleId: yup.number().integer().positive().nullable(),
    tenantId: yup.number().integer().positive().nullable(),
};
const PermissionFieldKeys = Object.keys(PermissionFields);

app.get("/permissions", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            page: yup.number().integer().positive().default(1),
            pageSize: yup.number().integer().positive().default(10),
            roleId: yup.number().integer().positive(),
            tenantId: yup.number().integer().positive(),
            isSystem: yup.boolean(),
        })
    }))
], async (req, res) => {
    let result = await findAll(req.query);
    return res.json({
        message: "success",
        code: 200,
        data: { permissions: result.permissions, pagination: result.pagination }
    });
});

app.get("/permissions/:permission_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            permission_id: param_id.required()
        })
    }))
], async (req, res) => {
    const permission = await findByPkOr404(Number(req.params.permission_id));
    return res.json({
        code: 200,
        message: "success",
        data: { permission }
    });
});

const CreatePermissionFields = {};
PermissionFieldKeys.map(key => CreatePermissionFields[key] = PermissionFields[key]);

app.post("/permissions", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreatePermissionFields)
    }))
], async (req, res) => {
    let permission = await createPermission(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { permission }
    });
});

app.patch("/permissions/:permission_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(PermissionFields),
        params: yup.object().shape({
            permission_id: param_id.required()
        })
    }))
], async (req, res) => {
    let permission = await updatePermission(Number(req.params.permission_id), req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { permission }
    });
});

app.delete("/permissions/:permission_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            permission_id: param_id.required()
        })
    }))
], async (req, res) => {
    await deletePermission(Number(req.params.permission_id));
    return res.json({
        code: 204,
        message: "success"
    });
});

app.delete("/permissions/role/:roleId", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            roleId: param_id.required()
        })
    }))
], async (req, res) => {
    await deleteRolePermissions(Number(req.params.roleId));
    return res.json({
        code: 204,
        message: "success"
    });
});

app.delete("/permissions/tenant/:tenantId", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            tenantId: param_id.required()
        })
    }))
], async (req, res) => {
    await deleteTenantPermissions(Number(req.params.tenantId));
    return res.json({
        code: 204,
        message: "success"
    });
}); 