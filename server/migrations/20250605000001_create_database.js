export const name = 'create_database';

export async function up(conn, { database }) {
  await conn.query(
    `CREATE DATABASE IF NOT EXISTS \`${database}\`
     CHARACTER SET utf8mb4
     COLLATE utf8mb4_unicode_ci`
  );
}

export async function down(conn, { database }) {
  await conn.query(`DROP DATABASE IF EXISTS \`${database}\``);
}
