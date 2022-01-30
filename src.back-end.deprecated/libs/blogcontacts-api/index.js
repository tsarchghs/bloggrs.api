// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createBlogContact, updateBlogContact, deleteBlogContact, findByPkOr404 } = require("./blogcontacts-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const BlogContactFields = {
    name: yup.string()
}
const BlogContactFieldKeys = Object.keys(BlogContactFields)

app.get("/blogcontacts", [
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
    let blogcontacts = await findAll(req.query); 
    return res.json({
        message: "success",
        code: 200,
        data: { blogcontacts }
    })
})

app.get("/blogcontacts/:blogcontact_id", [
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            blogcontact_id: param_id.required()
        })
    }))
], async (req,res) => {
    const blogcontact = await findByPkOr404(req.params.blogcontact_id);
    return res.json({
        code: 200,
        message: "sucess",
        data: { blogcontact }
    })
})


const CreateBlogContactFields = {};
BlogContactFieldKeys.map(key => CreateBlogContactFields[key] = BlogContactFields[key].required());
app.post("/blogcontacts",[
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreateBlogContactFields)
    }))
], async (req,res) => {
    let blogcontact = await createBlogContact(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { blogcontact }
    })
})

app.patch("/blogcontacts/:blogcontact_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(BlogContactFields),
        params: yup.object().shape({
            blogcontact_id: param_id.required()
        })
    }))
], async (req,res) => {
    let blogcontact = await updateBlogContact({
        pk: req.params.blogcontact_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { blogcontact }
    })
})

app.delete("/blogcontacts/:blogcontact_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            blogcontact_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteBlogContact(req.params.blogcontact_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
