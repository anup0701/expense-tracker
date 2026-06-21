const express = require("express");
const router = express.Router();
const analyticsController = require("../controllers/analyticsController"); // Fixed path

// Routes
router.get("/balance", analyticsController.getTotalBalance);
router.get("/summary", analyticsController.getSummary);
router.get("/monthly", analyticsController.getMonthlyReport);
router.get("/export", analyticsController.exportTransactions);

module.exports = router;
