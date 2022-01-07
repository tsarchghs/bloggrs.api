// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createPostComment, updatePostComment, deletePostComment, findByPkOr404 } = require("./postcomments-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const PostCommentFields = {
    contract_type: yup.string().oneOf([
        "SIGN_CONTRACT", "FACEBOOK_CONTRACT", "YOUTUBE_CONTRACT", "DIGITAL_PLATFORM_CONTRACTS"
    ]),
    start_date: yup.date(),
    end_date: yup.date(),
    comment: yup.string(),
    file_url: yup.string(),
    ClientId: id
}
const PostCommentFieldKeys = Object.keys(PostCommentFields)

app.get("/postcomments", [
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
    let postcomments = await findAll(req.query); 
    return res.json({
        message: "success",
        code: 200,
        data: { postcomments }
    })
})

app.get("/postcomments/:postcomment_id", [
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            postcomment_id: param_id.required()
        })
    }))
], async (req,res) => {
    const postcomment = await findByPkOr404(req.params.postcomment_id);
    return res.json({
        code: 200,
        message: "sucess",
        data: { postcomment }
    })
})


const CreatePostCommentFields = {};
PostCommentFieldKeys.map(key => CreatePostCommentFields[key] = PostCommentFields[key].required());
app.post("/postcomments",[
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreatePostCommentFields)
    }))
], async (req,res) => {
    let postcomment = await createPostComment(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { postcomment }
    })
})

app.patch("/postcomments/:postcomment_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(PostCommentFields),
        params: yup.object().shape({
            postcomment_id: param_id.required()
        })
    }))
], async (req,res) => {
    let postcomment = await updatePostComment({
        pk: req.params.postcomment_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { postcomment }
    })
})

app.delete("/postcomments/:postcomment_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            postcomment_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deletePostComment(req.params.postcomment_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
