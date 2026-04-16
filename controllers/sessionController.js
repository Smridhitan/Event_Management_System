const db = require("../config/db");


// 🔹 1. GET SESSIONS BY EVENT
exports.getSessionsByEvent = async (req, res) => {
  try {
    const { event_id } = req.params;

    const [sessions] = await db.query(`
      SELECT 
        s.session_id,
        s.title,
        s.session_date,
        s.start_time,
        s.end_time,
        s.total_slots,
        s.slots_filled,
        u.first_name AS speaker_first_name,
        u.last_name AS speaker_last_name
      FROM Session s
      LEFT JOIN Users u ON s.speaker_user_id = u.user_id
      WHERE s.event_id = ?
      ORDER BY s.session_date, s.start_time
    `, [event_id]);

    res.json(sessions);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching sessions");
  }
};



// 🔹 2. REGISTER FOR SESSION
exports.registerSession = async (req, res) => {
  try {
    const { session_id, govt_id_type, govt_id_number } = req.body;
    const user_id = req.user.user_id;

    // Check duplicate registration
    const [existing] = await db.query(`
      SELECT * FROM Session_Registration
      WHERE user_id = ? AND session_id = ?
    `, [user_id, session_id]);

    if (existing.length > 0) {
      return res.status(400).send("Already registered for this session");
    }

    // Insert registration
    await db.query(`
      INSERT INTO Session_Registration
      (user_id, session_id, session_registration_date, session_registration_status, govt_id_type, govt_id_number)
      VALUES (?, ?, CURDATE(), 'Registered', ?, ?)
    `, [user_id, session_id, govt_id_type, govt_id_number]);

    // 👉 Your DB trigger will:
    // - check event registration exists
    // - prevent overbooking
    // - update slots_filled

    res.send("Session registered successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error registering for session");
  }
};



// 🔹 3. GET MY SESSIONS
exports.getMySessions = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [sessions] = await db.query(`
      SELECT 
        sr.session_registration_no,
        s.title,
        s.session_date,
        s.start_time,
        s.end_time,
        sr.session_registration_status,
        e.event_name
      FROM Session_Registration sr
      JOIN Session s ON sr.session_id = s.session_id
      JOIN Event e ON s.event_id = e.event_id
      WHERE sr.user_id = ?
      ORDER BY s.session_date, s.start_time
    `, [user_id]);

    res.json(sessions);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching user sessions");
  }
};



// 🔹 4. CANCEL SESSION
exports.cancelSession = async (req, res) => {
  try {
    const { session_registration_no } = req.body;

    // Check if exists
    const [existing] = await db.query(`
      SELECT * FROM Session_Registration
      WHERE session_registration_no = ?
    `, [session_registration_no]);

    if (existing.length === 0) {
      return res.status(404).send("Session registration not found");
    }

    // Update status
    await db.query(`
      UPDATE Session_Registration
      SET session_registration_status = 'Cancelled'
      WHERE session_registration_no = ?
    `, [session_registration_no]);

    res.send("Session cancelled successfully");

  } catch (err) {
    console.error(err);
    res.status(500).send("Error cancelling session");
  }
};