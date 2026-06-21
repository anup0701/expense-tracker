const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const categoryController = require("../controllers/categoryController"); // Fixed path

// Validation rules
const categoryValidation = [
  body("name").notEmpty().withMessage("Category name is required"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("icon").optional(),
  body("color")
    .optional()
    .matches(/^#[0-9A-F]{6}$/i)
    .withMessage("Invalid color format"),
];

// Routes
router.get("/", categoryController.getAllCategories);
router.get("/type/:type", categoryController.getCategoriesByType);
router.get("/:id", categoryController.getCategory);
router.post("/", categoryValidation, categoryController.createCategory);
router.put("/:id", categoryController.updateCategory);
router.delete("/:id", categoryController.deleteCategory);

module.exports = router;
