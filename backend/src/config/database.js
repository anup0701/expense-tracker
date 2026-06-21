const mysql = require("mysql2");
require("dotenv").config();

// Create connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "password123",
  database: process.env.DB_NAME || "expense_tracker",
  port: process.env.DB_PORT || 3306,
  charset: "utf8mb4",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
});

// Convert pool to use promises
const promisePool = pool.promise();

// Test database connection
const testConnection = async () => {
  try {
    const connection = await promisePool.getConnection();
    console.log("✅ Database connected successfully");
    connection.release();
    return true;
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);
    return false;
  }
};

// Initialize database tables
const initializeDatabase = async () => {
  try {
    // Create categories table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS categories (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(50) NOT NULL UNIQUE,
        type ENUM('income', 'expense') NOT NULL,
        icon VARCHAR(50) DEFAULT '📦',
        color VARCHAR(20) DEFAULT '#64748b',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        INDEX idx_type (type)
      )
    `);
    console.log("✅ Categories table ready");

    // Create transactions table
    await promisePool.query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        amount DECIMAL(10,2) NOT NULL,
        type ENUM('income', 'expense') NOT NULL,
        category_id INT,
        description TEXT,
        transaction_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL,
        INDEX idx_date (transaction_date),
        INDEX idx_type (type),
        INDEX idx_category (category_id)
      )
    `);
    console.log("✅ Transactions table ready");

    // Force reset if requested via environment variable
    if (process.env.FORCE_DB_RESET === "true") {
      console.log("⚠️ FORCE_DB_RESET is true. Clearing tables...");
      await promisePool.query("SET FOREIGN_KEY_CHECKS = 0");
      await promisePool.query("TRUNCATE transactions");
      await promisePool.query("TRUNCATE categories");
      await promisePool.query("SET FOREIGN_KEY_CHECKS = 1");
      console.log("✅ Tables cleared for fresh initialization");
    }

    // Insert default categories if none exist
    const [categories] = await promisePool.query(
      "SELECT COUNT(*) as count FROM categories",
    );
    if (categories[0].count === 0) {
      const defaultCategories = [
        // Income categories
        ["Salary", "income", "LuWallet", "#22c55e"],
        ["Freelance", "income", "LuLaptop", "#3b82f6"],
        ["Investment", "income", "LuTrendingUp", "#8b5cf6"],
        ["Business", "income", "LuBuilding2", "#f97316"],
        ["Rental", "income", "LuHome", "#14b8a6"],
        ["Other Income", "income", "LuGift", "#6b7280"],

        // Expense categories
        ["Food & Dining", "expense", "LuUtensils", "#ef4444"],
        ["Shopping", "expense", "LuShoppingBag", "#ec4899"],
        ["Transportation", "expense", "LuCar", "#eab308"],
        ["Entertainment", "expense", "LuClapperboard", "#8b5cf6"],
        ["Bills & Utilities", "expense", "LuLightbulb", "#6b7280"],
        ["Healthcare", "expense", "LuStethoscope", "#06b6d4"],
        ["Education", "expense", "LuGraduationCap", "#14b8a6"],
        ["Travel", "expense", "LuPlane", "#3b82f6"],
        ["Groceries", "expense", "LuShoppingCart", "#f97316"],
        ["Rent", "expense", "LuHome", "#64748b"],
      ];

      for (const cat of defaultCategories) {
        await promisePool.query(
          "INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)",
          cat,
        );
      }
      console.log("✅ Default categories created");
    }

    // Insert sample transactions if none exist
    const [transactions] = await promisePool.query(
      "SELECT COUNT(*) as count FROM transactions",
    );
    if (transactions[0].count === 0) {
      // Get category IDs
      const [cats] = await promisePool.query("SELECT id, name FROM categories");
      const catMap = {};
      cats.forEach((c) => {
        catMap[c.name] = c.id;
      });

      const sampleTransactions = [
        [5000.0, "income", catMap["Salary"], "Monthly salary", "2024-03-01"],
        [
          150.0,
          "expense",
          catMap["Food & Dining"],
          "Restaurant dinner",
          "2024-03-02",
        ],
        [200.0, "expense", catMap["Shopping"], "New clothes", "2024-03-03"],
        [
          1000.0,
          "income",
          catMap["Freelance"],
          "Web development project",
          "2024-03-04",
        ],
        [75.0, "expense", catMap["Transportation"], "Uber rides", "2024-03-05"],
        [
          300.0,
          "expense",
          catMap["Entertainment"],
          "Concert tickets",
          "2024-03-06",
        ],
        [
          2000.0,
          "income",
          catMap["Investment"],
          "Stock dividends",
          "2024-03-07",
        ],
        [
          500.0,
          "expense",
          catMap["Groceries"],
          "Grocery shopping",
          "2024-03-08",
        ],
        [1200.0, "expense", catMap["Rent"], "Monthly rent", "2024-03-09"],
        [
          100.0,
          "expense",
          catMap["Bills & Utilities"],
          "Electricity bill",
          "2024-03-10",
        ],
      ];

      for (const trans of sampleTransactions) {
        await promisePool.query(
          "INSERT INTO transactions (amount, type, category_id, description, transaction_date) VALUES (?, ?, ?, ?, ?)",
          trans,
        );
      }
      console.log("✅ Sample transactions created");
    }

    return true;
  } catch (error) {
    console.error("❌ Database initialization failed:", error.message);
    throw error;
  }
};

module.exports = {
  pool: promisePool,
  testConnection,
  initializeDatabase,
};
