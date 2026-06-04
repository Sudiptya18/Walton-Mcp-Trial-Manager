export const name = 'create_users_table';

export async function up(conn) {
  await conn.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(120) NOT NULL,
      username VARCHAR(60) NOT NULL UNIQUE,
      phone VARCHAR(30) DEFAULT NULL,
      email VARCHAR(120) DEFAULT NULL,
      password VARCHAR(255) NOT NULL,
      role ENUM('admin', 'user') NOT NULL DEFAULT 'user',
      status ENUM('active', 'disabled') NOT NULL DEFAULT 'active',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      INDEX idx_users_role (role),
      INDEX idx_users_status (status)
    ) ENGINE=InnoDB
  `);
}

export async function down(conn) {
  await conn.query('DROP TABLE IF EXISTS users');
}
