export const name = 'add_employee_id_to_users';

export async function up(conn) {
  const [cols] = await conn.query(
    `SELECT COLUMN_NAME FROM information_schema.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'users' AND COLUMN_NAME = 'employee_id'`
  );
  if (cols.length) return;

  await conn.query(`
    ALTER TABLE users
      ADD COLUMN employee_id VARCHAR(40) DEFAULT NULL AFTER username,
      ADD UNIQUE INDEX idx_users_employee_id (employee_id)
  `);
}

export async function down(conn) {
  await conn.query(`
    ALTER TABLE users
      DROP INDEX idx_users_employee_id,
      DROP COLUMN employee_id
  `);
}
