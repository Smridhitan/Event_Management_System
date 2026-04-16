const db = require("../config/db");

exports.getOrganizerDashboard = async (req, res) => {
  try {
    const [revenue] = await db.query(`
      SELECT e.event_name, SUM(p.amount) AS total_revenue
      FROM Event e
      JOIN Event_Registration er ON e.event_id=er.event_id
      JOIN Payment p ON er.registration_id=p.registration_id
      WHERE p.payment_status='Success'
      GROUP BY e.event_name
    `);

    const [vendors] = await db.query(`
      SELECT vendor_name, city, vendor_type FROM Vendor
    `);

    res.json({ revenue, vendors });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch organizer dashboard" });
  }
};

exports.getSpeakerDashboard = async (req, res) => {
  try {
    const user_id = req.user.user_id;
    // Find sessions where this user is speaker, then guest list
    const [guestList] = await db.query(`
      SELECT s.title, u.first_name, u.last_name, u.email_id
      FROM Session s
      JOIN Session_Registration sr ON s.session_id = sr.session_id
      JOIN Users u ON sr.user_id = u.user_id
      WHERE s.speaker_user_id = ? AND sr.session_registration_status = 'Registered'
    `, [user_id]);

    res.json({ guestList });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch speaker dashboard" });
  }
};

exports.getAdminDashboard = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.user_id, u.first_name, u.last_name, u.email_id, ur.role_type
      FROM Users u
      LEFT JOIN User_Role ur ON u.user_id = ur.user_id
    `);
    
    // Quick aggregated stats
    const [eventsStats] = await db.query(`SELECT COUNT(*) as count FROM Event`);

    res.json({ users, totalEvents: eventsStats[0].count });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch admin dashboard" });
  }
};
