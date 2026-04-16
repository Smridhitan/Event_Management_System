const mysql = require('mysql2/promise');
const bcrypt = require('bcrypt');

async function fixPassword() {
  try {
    const db = await mysql.createConnection({ user: 'root', password: 'College@24', database: 'Dbms_Project' });
    const hash = await bcrypt.hash('password', 10);

    await db.query(`UPDATE Users SET password_hash = ? WHERE email_id = 'ross@email.com'`, [hash]);
    console.log("Password hash fixed natively via Node wrapper.");
    db.end();
  } catch (e) {
    console.error(e);
  }
}

fixPassword();
