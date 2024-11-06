const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT } = require("../../middlewares");
const { 
    findAll, 
    createTeamMemberPermission, 
    updateTeamMemberPermission, 
    deleteTeamMemberPermission, 
    findByPkOr404,
    deleteTeamMemberPermissions,
    deleteSpecificTeamMemberPermission
} = require("./teammemberspermissions-dal");
const yup = require("yup");
const { param_id } = require("../utils/validations");

app.use(allowCrossDomain);

const UserPermissionFields = {
    teammemberId: yup.number().integer().positive().required(),
    permissionId: yup.number().integer().positive().required(),
    isCustom: yup.boolean().default(false)
}
const UserPermissionFieldKeys = Object.keys(UserPermissionFields);

// Get all user permissions with filters
app.get("/teammemberpermissions", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            page: yup.number().integer().positive().default(1),
            pageSize: yup.number().integer().positive().default(10),
            teammemberId: yup.number().integer().positive(),
            permissionId: yup.number().integer().positive(),
            isCustom: yup.boolean()
        })
    }))
], async (req, res) => {
    const result = await findAll(req.query);
    return res.json({
        message: "success",
        code: 200,
        data: { teammemberspermissions: result.teamMemberPermissions, pagination: result.pagination }
    });
});

// Get single user permission
app.get("/teammemberpermissions/:permission_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            permission_id: param_id.required()
        })
    }))
], async (req, res) => {
    const userPermission = await findByPkOr404(req.params.permission_id);
    return res.json({
        code: 200,
        message: "success",
        data: { userPermission }
    });
});

// Create user permission
app.post("/teammemberpermissions", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(UserPermissionFields)
    }))
], async (req, res) => {
    const userPermission = await createTeamMemberPermission(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { userPermission }
    });
});

// Update user permission
app.patch("/teammemberpermissions/:permission_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(UserPermissionFields),
        params: yup.object().shape({
            permission_id: param_id.required()
        })
    }))
], async (req, res) => {
    const userPermission = await updateTeamMemberPermission(req.params.permission_id, req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { userPermission }
    });
});

// Delete single user permission
app.delete("/teammemberpermissions/:permission_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            permission_id: param_id.required()
        })
    }))
], async (req, res) => {
    await deleteTeamMemberPermission(req.params.permission_id);
    return res.json({
        code: 204,
        message: "success"
    });
});

// Delete all permissions for a user
app.delete("/teammemberpermissions/user/:userId", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            userId: yup.number().integer().positive().required()
        })
    }))
], async (req, res) => {
    await deleteTeamMemberPermissions(req.params.userId);
    return res.json({
        code: 204,
        message: "success"
    });
});

// Delete specific permission for a user
app.delete("/teammemberpermissions/user/:userId/permission/:permissionId", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            userId: yup.number().integer().positive().required(),
            permissionId: yup.number().integer().positive().required()
        })
    }))
], async (req, res) => {
    await deleteSpecificTeamMemberPermission(req.params.userId, req.params.permissionId);
    return res.json({
        code: 204,
        message: "success"
    });
}); 