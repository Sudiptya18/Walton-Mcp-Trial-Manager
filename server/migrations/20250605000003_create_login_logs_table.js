export const name = 'create_login_logs_table';

export async function up(conn) {
  await conn.query(`
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
    ) ENGINE=InnoDB
  `);
}

export async function down(conn) {
  await conn.query('DROP TABLE IF EXISTS login_logs');
}
