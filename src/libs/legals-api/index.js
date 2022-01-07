// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createLegal, updateLegal, deleteLegal, findByPkOr404 } = require("./legals-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const LegalFields = {
    contract_type: yup.string().oneOf([
        "SIGN_CONTRACT", "FACEBOOK_CONTRACT", "YOUTUBE_CONTRACT", "DIGITAL_PLATFORM_CONTRACTS"
    ]),
    start_date: yup.date(),
    end_date: yup.date(),
    comment: yup.string(),
    file_url: yup.string(),
    ClientId: id
}
const LegalFieldKeys = Object.keys(LegalFields)

app.get("/legals", [
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
    let legals = await findAll(req.query); 
    return res.json({
        message: "success",
        code: 200,
        data: { legals }
    })
})

app.get("/legals/:legal_id", [
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            legal_id: param_id.required()
        })
    }))
], async (req,res) => {
    const legal = await findByPkOr404(req.params.legal_id);
    return res.json({
        code: 200,
        message: "sucess",
        data: { legal }
    })
})


const CreateLegalFields = {};
LegalFieldKeys.map(key => CreateLegalFields[key] = LegalFields[key].required());
app.post("/legals",[
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreateLegalFields)
    }))
], async (req,res) => {
    let legal = await createLegal(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { legal }
    })
})

app.patch("/legals/:legal_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(LegalFields),
        params: yup.object().shape({
            legal_id: param_id.required()
        })
    }))
], async (req,res) => {
    let legal = await updateLegal({
        pk: req.params.legal_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { legal }
    })
})

app.delete("/legals/:legal_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            legal_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteLegal(req.params.legal_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
