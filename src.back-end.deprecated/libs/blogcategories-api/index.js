// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createBlogCategory, updateBlogCategory, deleteBlogCategory, findByPkOr404 } = require("./blogcategories-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const BlogCategoryFields = {
    name: yup.string()
}
const BlogCategoryFieldKeys = Object.keys(BlogCategoryFields)

app.get("/blogcategories", [
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
    let blogcategories = await findAll(req.query); 
    return res.json({
        message: "success",
        code: 200,
        data: { blogcategories }
    })
})

app.get("/blogcategories/:blogcategory_id", [
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            blogcategory_id: param_id.required()
        })
    }))
], async (req,res) => {
    const blogcategory = await findByPkOr404(req.params.blogcategory_id);
    return res.json({
        code: 200,
        message: "sucess",
        data: { blogcategory }
    })
})


const CreateBlogCategoryFields = {};
BlogCategoryFieldKeys.map(key => CreateBlogCategoryFields[key] = BlogCategoryFields[key].required());
app.post("/blogcategories",[
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreateBlogCategoryFields)
    }))
], async (req,res) => {
    let blogcategory = await createBlogCategory(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { blogcategory }
    })
})

app.patch("/blogcategories/:blogcategory_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(BlogCategoryFields),
        params: yup.object().shape({
            blogcategory_id: param_id.required()
        })
    }))
], async (req,res) => {
    let blogcategory = await updateBlogCategory({
        pk: req.params.blogcategory_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { blogcategory }
    })
})

app.delete("/blogcategories/:blogcategory_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            blogcategory_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deleteBlogCategory(req.params.blogcategory_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
