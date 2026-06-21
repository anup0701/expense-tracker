-- Initialize expense_tracker database
-- This script creates the database, user, and grants privileges
-- Create database if not exists
CREATE DATABASE IF NOT EXISTS expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- Create user for the application
CREATE USER IF NOT EXISTS 'expense_user' @'%' IDENTIFIED BY 'expense123';
-- Grant privileges
GRANT ALL PRIVILEGES ON expense_tracker.* TO 'expense_user' @'%';
FLUSH PRIVILEGES;
-- Use the database
USE expense_tracker;
-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    type ENUM('income', 'expense') NOT NULL,
    icon VARCHAR(50) DEFAULT '📦',
    color VARCHAR(20) DEFAULT '#64748b',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_type (type)
);
-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    amount DECIMAL(10, 2) NOT NULL,
    type ENUM('income', 'expense') NOT NULL,
    category_id INT,
    description TEXT,
    transaction_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE
    SET NULL,
        INDEX idx_date (transaction_date),
        INDEX idx_type (type),
        INDEX idx_category (category_id)
);
-- Default categories and sample transactions are now handled by the backend
-- during initialization to ensure correct character encoding (UTF-8).