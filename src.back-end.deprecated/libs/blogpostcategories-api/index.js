// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = (module.exports = express());

const {
  allowCrossDomain,
  validateRequest,
  jwtRequired,
  passUserFromJWT,
  adminRequired,
} = require("../../middlewares");

const {
  findAll,
  createBlogPostCategory,
  updateBlogPostCategory,
  deleteBlogPostCategory,
  findByPkOr404,
} = require("./blogpostcategories-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain);

const BlogPostCategoryFields = {
  BlogId: id,
  CategoryId: id,
};
const BlogPostCategoryFieldKeys = Object.keys(BlogPostCategoryFields);

app.get(
  "/blogpostcategories",
  [
    jwtRequired,
    passUserFromJWT,
    validateRequest(
      yup.object().shape({
        query: yup.object().shape({
          page: yup.number().integer().positive().default(1),
          pageSize: yup.number().integer().positive().default(10),
          status: yup.string(),
          query: yup.string(),
        }),
      })
    ),
  ],
  async (req, res) => {
    let blogpostcategories = await findAll(req.query);
    return res.json({
      message: "success",
      code: 200,
      data: { blogpostcategories },
    });
  }
);

app.get(
  "/blogpostcategories/:blogpostcategory_id",
  [
    validateRequest(
      yup.object().shape({
        params: yup.object().shape({
          blogpostcategory_id: param_id.required(),
        }),
      })
    ),
  ],
  async (req, res) => {
    const blogpostcategory = await findByPkOr404(
      req.params.blogpostcategory_id
    );
    return res.json({
      code: 200,
      message: "sucess",
      data: { blogpostcategory },
    });
  }
);

const CreateBlogPostCategoryFields = {};
BlogPostCategoryFieldKeys.map(
  (key) =>
    (CreateBlogPostCategoryFields[key] = BlogPostCategoryFields[key].required())
);
app.post(
  "/blogpostcategories",
  [
    // jwtRequired, passUserFromJWT, adminRequired,
    validateRequest(
      yup.object().shape({
        requestBody: yup.object().shape(CreateBlogPostCategoryFields),
      })
    ),
  ],
  async (req, res) => {
    let blogpostcategory = await createBlogPostCategory(req.body);
    return res.json({
      code: 200,
      message: "success",
      data: { blogpostcategory },
    });
  }
);

app.patch(
  "/blogpostcategories/:blogpostcategory_id",
  [
    jwtRequired,
    passUserFromJWT,
    adminRequired,
    validateRequest(
      yup.object().shape({
        requestBody: yup.object().shape(BlogPostCategoryFields),
        params: yup.object().shape({
          blogpostcategory_id: param_id.required(),
        }),
      })
    ),
  ],
  async (req, res) => {
    let blogpostcategory = await updateBlogPostCategory({
      pk: req.params.blogpostcategory_id,
      data: req.body,
    });
    return res.json({
      code: 200,
      message: "success",
      data: { blogpostcategory },
    });
  }
);

app.delete(
  "/blogpostcategories/:blogpostcategory_id",
  [
    jwtRequired,
    passUserFromJWT,
    adminRequired,
    validateRequest(
      yup.object().shape({
        params: yup.object().shape({
          blogpostcategory_id: param_id.required(),
        }),
      })
    ),
  ],
  async (req, res) => {
    await deleteBlogPostCategory(req.params.blogpostcategory_id);
    return res.json({
      code: 204,
      message: "success",
    });
  }
);
