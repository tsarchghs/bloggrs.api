// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createSecretKey, updateSecretKey, deleteSecretKey, findByPkOr404 } = require("./secretkeys-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const SecretKeyFields = {

}
const SecretKeyFieldKeys = Object.keys(SecretKeyFields)

app.get("/secretkeys", [
    jwtRequired, passUserFromJWT,
    validateRequest(yup.object().shape({
        query: yup.object().shape({
            page: yup.number().integer().positive().default(1),
            pageSize: yup.number().integer().positive().default(10),
            status: yup.string(),
            query: yup.string()
        })
    }))
], async (req,res) => {
    let secretkeys = await findAll(req.query); 
    return res.json({
        message: "success",
        code: 200,
        data: { secretkeys }
    })
})

app.get("/secretkeys/:secretkey_id", [
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            secretkey_id: param_id.required()
        })
    }))
], async (req,res) => {
    const secretkey = await findByPkOr404(req.params.secretkey_id);
    return res.json({
        code: 200,
        message: "sucess",
        data: { secretkey }
    })
})


const CreateSecretKeyFields = {};
SecretKeyFieldKeys.map(key => CreateSecretKeyFields[key] = SecretKeyFields[key].required());
app.post("/secretkeys",[
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreateSecretKeyFields)
    }))
], async (req,res) => {
    let secretkey = await createSecretKey(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { secretkey }
    })
})

app.patch("/secretkeys/:secretkey_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(SecretKeyFields),
        params: yup.object().shape({
            secretkey_id: param_id.required()
        })
    }))
], async (req,res) => {
    let secretkey = await updateSecretKey({
        pk: req.params.secretkey_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { secretkey }
    })
})

app.delete("/secretkeys/:secretkey_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            secretkey_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteSecretKey(req.params.secretkey_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
