// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = module.exports = express();

const { allowCrossDomain, validateRequest, jwtRequired, passUserFromJWT, adminRequired } = require("../../middlewares");

const { findAll, createPostLike, updatePostLike, deletePostLike, findByPkOr404 } = require("./postlikes-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain)

const PostLikeFields = {
    PostId: id,
    UserId: id
}
const PostLikeFieldKeys = Object.keys(PostLikeFields)

app.get("/postlikes", [
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
    let postlikes = await findAll(req.query); 
    return res.json({
        message: "success",
        code: 200,
        data: { postlikes }
    })
})

app.get("/postlikes/:postlike_id", [
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            postlike_id: param_id.required()
        })
    }))
], async (req,res) => {
    const postlike = await findByPkOr404(req.params.postlike_id);
    return res.json({
        code: 200,
        message: "sucess",
        data: { postlike }
    })
})


const CreatePostLikeFields = {};
PostLikeFieldKeys.map(key => CreatePostLikeFields[key] = PostLikeFields[key].required());
app.post("/postlikes",[
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(CreatePostLikeFields)
    }))
], async (req,res) => {
    let postlike = await createPostLike(req.body);
    return res.json({
        code: 200,
        message: "success",
        data: { postlike }
    })
})

app.patch("/postlikes/:postlike_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        requestBody: yup.object().shape(PostLikeFields),
        params: yup.object().shape({
            postlike_id: param_id.required()
        })
    }))
], async (req,res) => {
    let postlike = await updatePostLike({
        pk: req.params.postlike_id,
        data: req.body
    });
    return res.json({
        code: 200,
        message: "success",
        data: { postlike }
    })
})

app.delete("/postlikes/:postlike_id", [
    jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(yup.object().shape({
        params: yup.object().shape({
            postlike_id: param_id.required()
        })
    }))
], async (req,res) => {
    await deletePostLike(req.params.postlike_id)
    return res.json({
        code: 204,
        message: "success"
    })
})
