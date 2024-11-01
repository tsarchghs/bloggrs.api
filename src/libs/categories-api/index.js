// if (global.docs_collector) docs_collector.generalAddYAML(__dirname + "/docs.yaml")

const express = require("express");
const app = (module.exports = express());

const {
  allowCrossDomain,
  validateRequest,
  jwtRequired,
  passUserFromJWT,
  adminRequired,
  checkPermission,
} = require("../../middlewares");

const {
  findAll,
  createCategory,
  updateCategory,
  deleteCategory,
  findByPkOr404,
} = require("./categories-dal");
const { ErrorHandler } = require("../../utils/error");

const yup = require("yup");
const { param_id, id } = require("../utils/validations");

app.use(allowCrossDomain);

const CategoryFields = {
  name: yup.string(),
  slug: yup.string(),
};
const CategoryFieldKeys = Object.keys(CategoryFields);

app.get(
  "/categories",
  [
    // jwtRequired, passUserFromJWT,
    validateRequest(
      yup.object().shape({
        query: yup.object().shape({
          page: yup.number().integer().positive().default(1),
          pageSize: yup.number().integer().positive().default(10),
          status: yup.string(),
          query: yup.string(),
          BlogId: param_id,
        }),
      })
    ),
  ],
  async (req, res) => {
    let categories = await findAll(req.query);
    return res.json({
      message: "success",
      code: 200,
      data: { categories },
    });
  }
);

app.get(
  "/categories/:category_id",
  [
    checkPermission('categories', 'read'),
    validateRequest(
      yup.object().shape({
        params: yup.object().shape({
          category_id: param_id.required(),
        }),
      })
    ),
  ],
  async (req, res) => {
    const category = await findByPkOr404(req.params.category_id);
    return res.json({
      code: 200,
      message: "sucess",
      data: { category },
    });
  }
);

const CreateCategoryFields = {};
CategoryFieldKeys.map(
  (key) => (CreateCategoryFields[key] = CategoryFields[key].required())
);
app.post(
  "/categories",
  [
    checkPermission('categories', 'create'),
    validateRequest(
      yup.object().shape({
        requestBody: yup.object().shape(CreateCategoryFields),
      })
    ),
  ],
  async (req, res) => {
    let category = await createCategory(req.body);
    return res.json({
      code: 200,
      message: "success",
      data: { category },
    });
  }
);

app.patch(
  "/categories/:category_id",
  [
    jwtRequired,
    passUserFromJWT,
    adminRequired,
    checkPermission('categories', 'update'),
    validateRequest(
      yup.object().shape({
        requestBody: yup.object().shape(CategoryFields),
        params: yup.object().shape({
          category_id: param_id.required(),
        }),
      })
    ),
  ],
  async (req, res) => {
    let category = await updateCategory({
      pk: req.params.category_id,
      data: req.body,
    });
    return res.json({
      code: 200,
      message: "success",
      data: { category },
    });
  }
);

app.delete(
  "/categories/:category_id",
  [
    jwtRequired,
    passUserFromJWT,
    adminRequired,
    checkPermission('categories', 'delete'),
    validateRequest(
      yup.object().shape({
        params: yup.object().shape({
          category_id: param_id.required(),
        }),
      })
    ),
  ],
  async (req, res) => {
    await deleteCategory(req.params.category_id);
    return res.json({
      code: 204,
      message: "success",
    });
  }
);
