const express = require("express");
const router = express.Router();
const { body } = require("express-validator");
const transactionController = require("../controllers/transactionController"); // Fixed path

// Validation rules
const transactionValidation = [
  body("amount")
    .isNumeric()
    .withMessage("Amount must be a number")
    .custom((value) => value > 0)
    .withMessage("Amount must be greater than 0"),
  body("type")
    .isIn(["income", "expense"])
    .withMessage("Type must be income or expense"),
  body("transaction_date").isDate().withMessage("Valid date is required"),
  body("description").optional().trim(),
];

// Routes
router.get("/", transactionController.getAllTransactions);
router.get("/:id", transactionController.getTransaction);
router.post(
  "/",
  transactionValidation,
  transactionController.createTransaction,
);
router.put(
  "/:id",
  transactionValidation,
  transactionController.updateTransaction,
);
router.delete("/:id", transactionController.deleteTransaction);

module.exports = router;
