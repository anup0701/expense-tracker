const db = require("../config/database"); // Fixed path

class Category {
  // Get all categories
  static async getAll() {
    const [rows] = await db.pool.query(
      "SELECT * FROM categories ORDER BY type, name",
    );
    return rows;
  }

  // Get categories by type
  static async getByType(type) {
    const [rows] = await db.pool.query(
      "SELECT * FROM categories WHERE type = ? ORDER BY name",
      [type],
    );
    return rows;
  }

  // Get category by ID
  static async getById(id) {
    const [rows] = await db.pool.query(
      "SELECT * FROM categories WHERE id = ?",
      [id],
    );
    return rows[0];
  }

  // Create new category
  static async create(categoryData) {
    const { name, type, icon, color } = categoryData;
    const [result] = await db.pool.query(
      "INSERT INTO categories (name, type, icon, color) VALUES (?, ?, ?, ?)",
      [name, type, icon || "📦", color || "#64748b"],
    );
    return this.getById(result.insertId);
  }

  // Update category
  static async update(id, categoryData) {
    const { name, icon, color } = categoryData;
    await db.pool.query(
      "UPDATE categories SET name = ?, icon = ?, color = ? WHERE id = ?",
      [name, icon, color, id],
    );
    return this.getById(id);
  }

  // Delete category
  static async delete(id) {
    const [result] = await db.pool.query(
      "DELETE FROM categories WHERE id = ?",
      [id],
    );
    return result.affectedRows > 0;
  }

  // Check if category exists
  static async exists(name) {
    const [rows] = await db.pool.query(
      "SELECT id FROM categories WHERE name = ?",
      [name],
    );
    return rows.length > 0;
  }

  // Get category statistics
  static async getStats(id) {
    const [rows] = await db.pool.query(
      `SELECT 
         COUNT(*) as transaction_count,
         SUM(amount) as total_amount,
         AVG(amount) as average_amount
       FROM transactions 
       WHERE category_id = ?`,
      [id],
    );
    return rows[0];
  }
}

module.exports = Category;
