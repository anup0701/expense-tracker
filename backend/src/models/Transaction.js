const db = require("../config/database"); // Fixed path
const moment = require("moment");

class Transaction {
  // Get all transactions with filters
  static async getAll(filters = {}) {
    let query = `
      SELECT 
        t.*,
        c.name as category_name,
        c.icon as category_icon,
        c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
    `;

    const params = [];
    const conditions = [];

    // Apply filters
    if (filters.month && filters.year) {
      conditions.push(
        "MONTH(t.transaction_date) = ? AND YEAR(t.transaction_date) = ?",
      );
      params.push(filters.month, filters.year);
    } else if (filters.year) {
      conditions.push("YEAR(t.transaction_date) = ?");
      params.push(filters.year);
    }

    if (filters.type) {
      conditions.push("t.type = ?");
      params.push(filters.type);
    }

    if (filters.category_id) {
      conditions.push("t.category_id = ?");
      params.push(filters.category_id);
    }

    if (filters.start_date && filters.end_date) {
      conditions.push("t.transaction_date BETWEEN ? AND ?");
      params.push(filters.start_date, filters.end_date);
    }

    if (conditions.length > 0) {
      query += " WHERE " + conditions.join(" AND ");
    }

    query += " ORDER BY t.transaction_date DESC, t.created_at DESC";

    if (filters.limit) {
      query += " LIMIT ?";
      params.push(parseInt(filters.limit));
    }

    const [rows] = await db.pool.query(query, params);
    return rows;
  }

  // Get transaction by ID
  static async getById(id) {
    const [rows] = await db.pool.query(
      `SELECT 
         t.*,
         c.name as category_name,
         c.icon as category_icon,
         c.color as category_color
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.id = ?`,
      [id],
    );
    return rows[0];
  }

  // Create new transaction
  static async create(transactionData) {
    const { amount, type, category_id, description, transaction_date } =
      transactionData;

    const [result] = await db.pool.query(
      `INSERT INTO transactions 
       (amount, type, category_id, description, transaction_date) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        amount,
        type,
        category_id || null,
        description || null,
        transaction_date,
      ],
    );

    return this.getById(result.insertId);
  }

  // Update transaction
  static async update(id, transactionData) {
    const { amount, type, category_id, description, transaction_date } =
      transactionData;

    await db.pool.query(
      `UPDATE transactions 
       SET amount = ?, type = ?, category_id = ?, description = ?, transaction_date = ?
       WHERE id = ?`,
      [amount, type, category_id, description, transaction_date, id],
    );

    return this.getById(id);
  }

  // Delete transaction
  static async delete(id) {
    const [result] = await db.pool.query(
      "DELETE FROM transactions WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }

  // Get total balance (all-time)
  static async getTotalBalance() {
    const [rows] = await db.pool.query(
      `SELECT 
         COALESCE(SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END), 0) as total_income,
         COALESCE(SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END), 0) as total_expense,
         COALESCE(COUNT(*), 0) as transaction_count
       FROM transactions`,
    );

    const totalIncome = parseFloat(rows[0].total_income) || 0;
    const totalExpense = parseFloat(rows[0].total_expense) || 0;

    return {
      total_income: totalIncome,
      total_expense: totalExpense,
      balance: totalIncome - totalExpense,
      transaction_count: rows[0].transaction_count || 0,
    };
  }

  // Get monthly summary
  static async getMonthlySummary(month, year) {
    const [rows] = await db.pool.query(
      `SELECT 
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
         COUNT(*) as transaction_count
       FROM transactions
       WHERE MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?`,
      [month, year],
    );

    return {
      total_income: parseFloat(rows[0].total_income) || 0,
      total_expense: parseFloat(rows[0].total_expense) || 0,
      balance:
        (parseFloat(rows[0].total_income) || 0) -
        (parseFloat(rows[0].total_expense) || 0),
      transaction_count: rows[0].transaction_count || 0,
    };
  }

  // Get category breakdown
  static async getCategoryBreakdown(type, month, year) {
    const [rows] = await db.pool.query(
      `SELECT 
         c.id,
         c.name,
         c.icon,
         c.color,
         SUM(t.amount) as total,
         COUNT(*) as count
       FROM transactions t
       JOIN categories c ON t.category_id = c.id
       WHERE t.type = ? 
         AND MONTH(t.transaction_date) = ? 
         AND YEAR(t.transaction_date) = ?
       GROUP BY c.id, c.name, c.icon, c.color
       ORDER BY total DESC`,
      [type, month, year],
    );

    return rows.map((row) => ({
      ...row,
      total: parseFloat(row.total) || 0,
    }));
  }

  // Get daily trend
  static async getDailyTrend(month, year) {
    const [rows] = await db.pool.query(
      `SELECT 
         DAY(transaction_date) as day,
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
       FROM transactions
       WHERE MONTH(transaction_date) = ? AND YEAR(transaction_date) = ?
       GROUP BY DAY(transaction_date)
       ORDER BY day`,
      [month, year],
    );

    return rows.map((row) => ({
      day: row.day,
      income: parseFloat(row.income) || 0,
      expense: parseFloat(row.expense) || 0,
    }));
  }

  // Get yearly summary
  static async getYearlySummary(year) {
    const [rows] = await db.pool.query(
      `SELECT 
         MONTH(transaction_date) as month,
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
         COUNT(*) as transactions
       FROM transactions
       WHERE YEAR(transaction_date) = ?
       GROUP BY MONTH(transaction_date)
       ORDER BY month`,
      [year],
    );

    return rows.map((row) => ({
      month: row.month,
      income: parseFloat(row.income) || 0,
      expense: parseFloat(row.expense) || 0,
      transactions: row.transactions || 0,
    }));
  }
}

module.exports = Transaction;
