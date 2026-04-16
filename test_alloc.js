const mysql = require('mysql2/promise');
async function run() {
  const db = await mysql.createConnection({ user: 'root', password: 'College@24', database: 'Dbms_Project' });
  try {
    const [sess] = await db.query(`SELECT start_time, end_time FROM Session WHERE session_id=6`);
    const start = sess[0].start_time;
    const end = sess[0].end_time;
    console.log("Session times:", start, end);
    
    await db.query(
      `INSERT INTO Resource_Allocation (session_id, resource_id, quantity_allocated, allocation_status, start_time, end_time) 
       VALUES (?, ?, ?, 'Allocated', ?, ?)`,
      [6, 1, 5, start, end] // session 6, resource 1 (Chairs), qty 5
    );
    console.log("Successfully allocated!");
  } catch (e) {
    console.error("DB Error:", e.message);
  } finally {
    db.end();
  }
}
run();
