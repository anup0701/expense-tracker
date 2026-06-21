const Transaction = require("../models/Transaction");
const { validationResult } = require("express-validator");
const moment = require("moment");

// Get all transactions
exports.getAllTransactions = async (req, res) => {
  try {
    const { month, year, type, category_id, start_date, end_date, limit } =
      req.query;

    const filters = {
      month: month ? parseInt(month) : null,
      year: year ? parseInt(year) : null,
      type,
      category_id: category_id ? parseInt(category_id) : null,
      start_date,
      end_date,
      limit: limit ? parseInt(limit) : null,
    };

    const transactions = await Transaction.getAll(filters);

    res.json({
      success: true,
      count: transactions.length,
      data: transactions,
    });
  } catch (error) {
    console.error("Error in getAllTransactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
      error: error.message,
    });
  }
};

// Get single transaction
exports.getTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.getById(id);

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error in getTransaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
      error: error.message,
    });
  }
};

// Create transaction
exports.createTransaction = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        errors: errors.array(),
      });
    }

    const { amount, type, category_id, description, transaction_date } =
      req.body;

    const transaction = await Transaction.create({
      amount,
      type,
      category_id,
      description,
      transaction_date,
    });

    res.status(201).json({
      success: true,
      message: "Transaction created successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error in createTransaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create transaction",
      error: error.message,
    });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { amount, type, category_id, description, transaction_date } =
      req.body;

    // Check if transaction exists
    const existingTransaction = await Transaction.getById(id);
    if (!existingTransaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const transaction = await Transaction.update(id, {
      amount,
      type,
      category_id,
      description,
      transaction_date,
    });

    res.json({
      success: true,
      message: "Transaction updated successfully",
      data: transaction,
    });
  } catch (error) {
    console.error("Error in updateTransaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update transaction",
      error: error.message,
    });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if transaction exists
    const transaction = await Transaction.getById(id);
    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    const deleted = await Transaction.delete(id);

    if (deleted) {
      res.json({
        success: true,
        message: "Transaction deleted successfully",
      });
    } else {
      res.status(500).json({
        success: false,
        message: "Failed to delete transaction",
      });
    }
  } catch (error) {
    console.error("Error in deleteTransaction:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete transaction",
      error: error.message,
    });
  }
};
