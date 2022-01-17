// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createPublicKey, updatePublicKey, deletePublicKey, findByPkOr404 } = require("./publickeys-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const PublicKeyFields = {

}
const PublicKeyFieldKeys = Object.keys(PublicKeyFields)

app.get("/publickeys", [
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
    let publickeys = await findAll(req.query); 
    return res.json({
        message: "success",
        code: 200,
        data: { publickeys }
    })
})

app.get("/publickeys/:publickey_id", [
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            publickey_id: param_id.required()
        })
    }))
], async (req,res) => {
    const publickey = await findByPkOr404(req.params.publickey_id);
    return res.json({
        code: 200,
        message: "sucess",
        data: { publickey }
    })
})


const CreatePublicKeyFields = {};
PublicKeyFieldKeys.map(key => CreatePublicKeyFields[key] = PublicKeyFields[key].required());
app.post("/publickeys",[
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreatePublicKeyFields)
    }))
], async (req,res) => {
    let publickey = await createPublicKey(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { publickey }
    })
})

app.patch("/publickeys/:publickey_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(PublicKeyFields),
        params: yup.object().shape({
            publickey_id: param_id.required()
        })
    }))
], async (req,res) => {
    let publickey = await updatePublicKey({
        pk: req.params.publickey_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { publickey }
    })
})

app.delete("/publickeys/:publickey_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            publickey_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deletePublicKey(req.params.publickey_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
