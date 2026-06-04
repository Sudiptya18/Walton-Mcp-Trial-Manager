-- DEPRECATED: use npm run migrate (20250605000005_create_trial_records_table.js)
-- Trial form data storage (JSON payload from legacy Trial Sheet)
USE walton_mcp_trial;

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
