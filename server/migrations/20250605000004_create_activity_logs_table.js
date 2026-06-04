export const name = 'create_activity_logs_table';

export async function up(conn) {
  await conn.query(`
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
    ) ENGINE=InnoDB
  `);
}

export async function down(conn) {
  await conn.query('DROP TABLE IF EXISTS activity_logs');
}
