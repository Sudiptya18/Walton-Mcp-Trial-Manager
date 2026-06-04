-- WALTON MCP Trial Manager — consolidated schema snapshot
-- Prefer: npm run migrate  (source of truth: server/migrations/*.js)
-- Existing business tables are unchanged; add yours before migration if any.

CREATE DATABASE IF NOT EXISTS walton_mcp_trial
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE walton_mcp_trial;

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(120) NOT NULL,
  username VARCHAR(60) NOT NULL UNIQUE,
  employee_id VARCHAR(40) DEFAULT NULL,
  phone VARCHAR(30) DEFAULT NULL,
  email VARCHAR(120) DEFAULT NULL,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
  status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_users_role (role),
  INDEX idx_users_status (status),
  UNIQUE INDEX idx_users_employee_id (employee_id)
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS login_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED DEFAULT NULL,
  username VARCHAR(60) NOT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  user_agent VARCHAR(512) DEFAULT NULL,
  success TINYINT(1) NOT NULL DEFAULT 0,
  failure_reason VARCHAR(255) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_login_logs_user (user_id),
  INDEX idx_login_logs_created (created_at),
  CONSTRAINT fk_login_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

CREATE TABLE IF NOT EXISTS activity_logs (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED DEFAULT NULL,
  action VARCHAR(80) NOT NULL,
  entity_type VARCHAR(60) DEFAULT NULL,
  entity_id VARCHAR(120) DEFAULT NULL,
  details JSON DEFAULT NULL,
  ip_address VARCHAR(45) DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_activity_user (user_id),
  INDEX idx_activity_action (action),
  INDEX idx_activity_created (created_at),
  CONSTRAINT fk_activity_logs_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB;

-- Trial form data (full form JSON from Trial Sheet save)
CREATE TABLE IF NOT EXISTS trial_records (
  id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  user_id INT UNSIGNED NOT NULL,
  filename VARCHAR(255) NOT NULL,
  product_name VARCHAR(255) DEFAULT NULL,
  trial_name VARCHAR(255) DEFAULT NULL,
  trial_date VARCHAR(20) DEFAULT NULL,
  trial_type VARCHAR(50) DEFAULT NULL,
  material_type VARCHAR(80) DEFAULT NULL,
  doc_num VARCHAR(120) DEFAULT NULL,
  required_by VARCHAR(120) DEFAULT NULL,
  purpose TEXT DEFAULT NULL,
  form_data JSON NOT NULL,
  saved_at TIMESTAMP NULL DEFAULT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_trial_user (user_id),
  INDEX idx_trial_product (product_name(100)),
  INDEX idx_trial_type (trial_type),
  INDEX idx_trial_saved (saved_at),
  CONSTRAINT fk_trial_records_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;
