-- Car Inventory Management System Database Schema

-- Create database
CREATE DATABASE IF NOT EXISTS car_inventory_db;
USE car_inventory_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'staff') DEFAULT 'staff',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Vehicles table
CREATE TABLE IF NOT EXISTS vehicles (
  id INT PRIMARY KEY AUTO_INCREMENT,
  stock_number VARCHAR(50) UNIQUE NOT NULL,
  brand VARCHAR(50) NOT NULL,
  model VARCHAR(100) NOT NULL,
  year INT NOT NULL,
  variant VARCHAR(100),
  color VARCHAR(50),
  transmission ENUM('Manual', 'Automatic') DEFAULT 'Automatic',
  fuel_type ENUM('Petrol', 'Diesel', 'Hybrid', 'Electric') DEFAULT 'Petrol',
  mileage INT DEFAULT 0,
  purchase_price DECIMAL(10, 2),
  selling_price DECIMAL(10, 2) NOT NULL,
  status ENUM('Available', 'Reserved', 'Sold') DEFAULT 'Available',
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vehicle_id INT NOT NULL,
  buyer_name VARCHAR(100) NOT NULL,
  sale_price DECIMAL(10, 2) NOT NULL,
  payment_method ENUM('Cash', 'Financing', 'Cheque') DEFAULT 'Cash',
  sale_date DATE NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX idx_vehicle_status ON vehicles(status);
CREATE INDEX idx_vehicle_brand ON vehicles(brand);
CREATE INDEX idx_vehicle_year ON vehicles(year);
CREATE INDEX idx_sales_vehicle ON sales(vehicle_id);
CREATE INDEX idx_sales_date ON sales(sale_date);

-- Insert sample admin user (password: admin123)
INSERT INTO users (name, email, password, role) VALUES 
('Admin User', 'admin@cardealer.com', '$2a$10$UMQAFfh1r0Kqhq2nUbp5aOFKrEZxVhAm6t7C6gy5fKqL5yP5yH3q2', 'admin');

-- Insert sample staff user (password: staff123)
INSERT INTO users (name, email, password, role) VALUES 
('Staff Member', 'staff@cardealer.com', '$2a$10$Y6f0Kp2Vy5R8n3T9L2M8.eZ0f1K4q7v0Z3D5N6B2H8F1C4E9G1P0', 'staff');
