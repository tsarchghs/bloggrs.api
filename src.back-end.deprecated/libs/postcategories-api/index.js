// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createPostCategory, updatePostCategory, deletePostCategory, findByPkOr404 } = require("./postcategories-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const PostFields = {
    name: yup.string()
}
const PostCategoryFieldKeys = Object.keys(PostFields)

app.get("/postcategories", [
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
    let postcategories = await findAll(req.query); 
    return res.json({
        message: "success",
        code: 200,
        data: { postcategories }
    })
})

app.get("/postcategories/:postcategory_id", [
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            postcategory_id: param_id.required()
        })
    }))
], async (req,res) => {
    const postcategory = await findByPkOr404(req.params.postcategory_id);
    return res.json({
        code: 200,
        message: "sucess",
        data: { postcategory }
    })
})


const CreatePostFields = {};
PostCategoryFieldKeys.map(key => CreatePostFields[key] = PostFields[key].required());
app.post("/postcategories",[
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreatePostFields)
    }))
], async (req,res) => {
    let postcategory = await createPostCategory(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { postcategory }
    })
})

app.patch("/postcategories/:postcategory_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(PostFields),
        params: yup.object().shape({
            postcategory_id: param_id.required()
        })
    }))
], async (req,res) => {
    let postcategory = await updatePostCategory({
        pk: req.params.postcategory_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { postcategory }
    })
})

app.delete("/postcategories/:postcategory_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            postcategory_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deletePostCategory(req.params.postcategory_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
