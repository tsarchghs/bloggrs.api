const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT } = require("../../middlewares");
const { 
    findAll,
    createResourcePolicy,
    updateResourcePolicy,
    deleteResourcePolicy,
    findByPkOr404,
    getPoliciesForResource,
    deleteResourcePolicies
} = require("./resourcepolicies-dal");
const yup = require("yup");

app.use(allowCrossDomain);

const ResourcePolicyFields = {
    resourceType: yup.string().required(),
    resourceId: yup.number().integer().positive().required(),
    roleId: yup.number().integer().positive().required(),
    permissions: yup.string().required(),
    priority: yup.number().integer().min(0).default(0)
}

// Get all resource policies with filters
app.get("/resourcepolicies", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            page: yup.number().integer().positive().default(1),
            pageSize: yup.number().integer().positive().default(10),
            resourceType: yup.string(),
            resourceId: yup.number().integer().positive(),
            roleId: yup.number().integer().positive(),
            priority: yup.number().integer().min(0)
        })
    }))
], async (req, res) => {
    const result = await findAll(req.query);
    return res.json({
        message: "success",
        code: 200,
        data: { resourcePolicies: result.resourcePolicies, pagination: result.pagination }
    });
});

// Get policies for specific resource
app.get("/resourcepolicies/resource/:resourceType/:resourceId", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            resourceType: yup.string().required(),
            resourceId: yup.number().integer().positive().required()
        })
    }))
], async (req, res) => {
    const { resourceType, resourceId } = req.params;
    const resourcePolicies = await getPoliciesForResource(resourceType, resourceId);
    return res.json({
        code: 200,
        message: "success",
        data: { resourcePolicies }
    });
});

// Get single resource policy
app.get("/resourcepolicies/:policy_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            policy_id: yup.number().integer().positive().required()
        })
    }))
], async (req, res) => {
    const resourcePolicy = await findByPkOr404(Number(req.params.policy_id));
    return res.json({
        code: 200,
        message: "success",
        data: { resourcePolicy }
    });
});

// Create resource policy
app.post("/resourcepolicies", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(ResourcePolicyFields)
    }))
], async (req, res) => {
    const resourcePolicy = await createResourcePolicy(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { resourcePolicy }
    });
});

// Update resource policy
app.patch("/resourcepolicies/:policy_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(ResourcePolicyFields),
        params: yup.object().shape({
            policy_id: yup.number().integer().positive().required()
        })
    }))
], async (req, res) => {
    const resourcePolicy = await updateResourcePolicy(Number(req.params.policy_id), req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { resourcePolicy }
    });
});

// Delete single resource policy
app.delete("/resourcepolicies/:policy_id", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            policy_id: yup.number().integer().positive().required()
        })
    }))
], async (req, res) => {
    await deleteResourcePolicy(Number(req.params.policy_id));
    return res.json({
        code: 204,
        message: "success"
    });
});

// Delete all policies for a specific resource
app.delete("/resourcepolicies/resource/:resourceType/:resourceId", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            resourceType: yup.string().required(),
            resourceId: yup.number().integer().positive().required()
        })
    }))
], async (req, res) => {
    const { resourceType, resourceId } = req.params;
    await deleteResourcePolicies(resourceType, resourceId);
    return res.json({
        code: 204,
        message: "success"
    });
});
