// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createTeamMember, updateTeamMember, deleteTeamMember, findByPkOr404 } = require("./teammebers-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const TeamMemberFields = {
    contract_type: yup.string().oneOf([
        "SIGN_CONTRACT", "FACEBOOK_CONTRACT", "YOUTUBE_CONTRACT", "DIGITAL_PLATFORM_CONTRACTS"
    ]),
    start_date: yup.date(),
    end_date: yup.date(),
    comment: yup.string(),
    file_url: yup.string(),
    ClientId: id
}
const TeamMemberFieldKeys = Object.keys(TeamMemberFields)

app.get("/teammembers", [
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
    let teammembers = await findAll(req.query); 
    return res.json({
        message: "success",
        code: 200,
        data: { teammembers }
    })
})

app.get("/teammembers/:teammember_id", [
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            teammember_id: param_id.required()
        })
    }))
], async (req,res) => {
    const teammember = await findByPkOr404(req.params.teammember_id);
    return res.json({
        code: 200,
        message: "sucess",
        data: { teammember }
    })
})


const CreateTeamMemberFields = {};
TeamMemberFieldKeys.map(key => CreateTeamMemberFields[key] = TeamMemberFields[key].required());
app.post("/teammembers",[
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreateTeamMemberFields)
    }))
], async (req,res) => {
    let teammember = await createTeamMember(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { teammember }
    })
})

app.patch("/teammembers/:teammember_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(TeamMemberFields),
        params: yup.object().shape({
            teammember_id: param_id.required()
        })
    }))
], async (req,res) => {
    let teammember = await updateTeamMember({
        pk: req.params.teammember_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { teammember }
    })
})

app.delete("/teammembers/:teammember_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            teammember_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteTeamMember(req.params.teammember_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
