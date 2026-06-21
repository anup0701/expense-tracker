const Transaction = require("../models/Transaction");

// Get total balance (all-time)
exports.getTotalBalance = async (req, res) => {
  try {
    const summary = await Transaction.getTotalBalance();

    res.json({
      success: true,
      data: summary,
    });
  } catch (error) {
    console.error("Error in getTotalBalance:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch total balance",
      error: error.message,
    });
  }
};

// Get dashboard summary
exports.getSummary = async (req, res) => {
  try {
    const { month, year } = req.query;
    const currentDate = new Date();
    const queryMonth = month ? parseInt(month) : currentDate.getMonth() + 1;
    const queryYear = year ? parseInt(year) : currentDate.getFullYear();

    // Get monthly summary
    const summary = await Transaction.getMonthlySummary(queryMonth, queryYear);

    // Get expense breakdown by category
    const expenseByCategory = await Transaction.getCategoryBreakdown(
      "expense",
      queryMonth,
      queryYear,
    );

    // Get income breakdown by category
    const incomeByCategory = await Transaction.getCategoryBreakdown(
      "income",
      queryMonth,
      queryYear,
    );

    // Get daily trend
    const dailyTrend = await Transaction.getDailyTrend(queryMonth, queryYear);

    // Get recent transactions
    const recentTransactions = await Transaction.getAll({ limit: 10 });

    res.json({
      success: true,
      data: {
        summary,
        expense_by_category: expenseByCategory,
        income_by_category: incomeByCategory,
        daily_trend: dailyTrend,
        recent_transactions: recentTransactions,
      },
    });
  } catch (error) {
    console.error("Error in getSummary:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch analytics summary",
      error: error.message,
    });
  }
};

// Get monthly report
exports.getMonthlyReport = async (req, res) => {
  try {
    const { year } = req.query;
    const queryYear = year ? parseInt(year) : new Date().getFullYear();

    const monthlyData = await Transaction.getYearlySummary(queryYear);

    res.json({
      success: true,
      data: monthlyData,
    });
  } catch (error) {
    console.error("Error in getMonthlyReport:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch monthly report",
      error: error.message,
    });
  }
};

// Export transactions
exports.exportTransactions = async (req, res) => {
  try {
    const { start_date, end_date, format = "json" } = req.query;

    const filters = {};
    if (start_date && end_date) {
      filters.start_date = start_date;
      filters.end_date = end_date;
    }

    const transactions = await Transaction.getAll(filters);

    if (format === "csv") {
      // Convert to CSV
      const headers = [
        "ID",
        "Date",
        "Type",
        "Category",
        "Amount",
        "Description",
      ];
      const csvRows = [headers.join(",")];

      transactions.forEach((row) => {
        csvRows.push(
          [
            row.id,
            row.transaction_date,
            row.type,
            row.category_name || "Uncategorized",
            row.amount,
            `"${(row.description || "").replace(/"/g, '""')}"`,
          ].join(","),
        );
      });

      res.setHeader("Content-Type", "text/csv");
      res.setHeader(
        "Content-Disposition",
        "attachment; filename=transactions.csv",
      );
      res.send(csvRows.join("\n"));
    } else {
      res.json({
        success: true,
        count: transactions.length,
        data: transactions,
      });
    }
  } catch (error) {
    console.error("Error in exportTransactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to export transactions",
      error: error.message,
    });
  }
};
