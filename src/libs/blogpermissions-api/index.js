const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT } = require("../../middlewares");
const { findAll, createBlogPermission, updateBlogPermission, deleteBlogPermission, findByPkOr404, deleteResourcePermissions } = require("./blogpermissions-dal");
const yup = require("yup");
const { param_id } = require("../utils/validations");

app.use(allowCrossDomain);

const BlogPermissionFields = {
    action: yup.string().max(255).required(),
    resourceId: yup.number().integer().positive().required(),
    resourceType: yup.string().max(255).required(),
    teammemberId: yup.number().integer().positive().required()
}
const BlogPermissionFieldKeys = Object.keys(BlogPermissionFields);

app.get("/blogpermissions", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            page: yup.number().integer().positive().default(1),
            pageSize: yup.number().integer().positive().default(10),
            teammemberId: yup.number().integer().positive(),
            resourceId: yup.number().integer().positive(),
            resourceType: yup.string()
        })
    }))
], async (req, res) => {
    let permissions = await findAll(req.query);
    return res.json({
        message: "success",
        code: 200,
        data: { blogpermissions: permissions .permissions, pagination: permissions.pagination }
    });
});

app.get("/blogpermissions/:permission_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            permission_id: param_id.required()
        })
    }))
], async (req, res) => {
    const blogpermission = await findByPkOr404(req.params.permission_id);
    return res.json({
        code: 200,
        message: "success",
        data: { blogpermission }
    });
});

const CreateBlogPermissionFields = {};
BlogPermissionFieldKeys.map(key => CreateBlogPermissionFields[key] = BlogPermissionFields[key]);

app.post("/blogpermissions", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreateBlogPermissionFields)
    }))
], async (req, res) => {
    let blogpermission = await createBlogPermission(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { blogpermission }
    });
});

app.patch("/blogpermissions/:permission_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(BlogPermissionFields),
        params: yup.object().shape({
            permission_id: param_id.required()
        })
    }))
], async (req, res) => {
    let blogpermission = await updateBlogPermission({
        pk: req.params.permission_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { blogpermission }
    });
});

app.delete("/blogpermissions/:permission_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            permission_id: param_id.required()
        })
    }))
], async (req, res) => {
    await deleteBlogPermission(req.params.permission_id);
    return res.json({
        code: 204,
        message: "success"
    });
});

app.delete("/blogpermissions/resource/:resourceId/:resourceType", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            resourceId: yup.number().integer().positive().required(),
            resourceType: yup.string().required()
        })
    }))
], async (req, res) => {
    await deleteResourcePermissions(
        req.params.resourceId,
        req.params.resourceType
    );
    return res.json({
        code: 204,
        message: "success"
    });
}); 