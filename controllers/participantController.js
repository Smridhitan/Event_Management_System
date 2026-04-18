const { handleDbError } = require("../config/dbUtils");
const db = require("../config/db");

// 1. Get Dashboard Metrics (Assigned Sessions, Expected Attendees, Global Revenue)
exports.getDashboardMetrics = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [[sessionsMetrics]] = await db.query(
      `SELECT COUNT(session_id) as total_sessions, COALESCE(SUM(slots_filled), 0) as total_attendees 
       FROM Session 
       WHERE speaker_user_id = ?`,
      [userId]
    );

    const [[revenueMetrics]] = await db.query(
      `SELECT COALESCE(SUM(p.amount), 0) as total_revenue
       FROM Event e
       JOIN Session s ON e.event_id = s.event_id
       JOIN Event_Registration er ON e.event_id = er.event_id
       JOIN Payment p ON er.registration_id = p.registration_id
       WHERE s.speaker_user_id = ? AND p.payment_status = 'Success'`,
      [userId]
    );

    res.json({
      total_sessions: sessionsMetrics.total_sessions || 0,
      total_attendees: sessionsMetrics.total_attendees || 0,
      total_revenue: revenueMetrics.total_revenue || 0
    });
  } catch (error) {
    return handleDbError(error, res);
  }
};

// 2. Get Assigned Events
exports.getAssignedEvents = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [events] = await db.query(
      `SELECT DISTINCT e.*, 
              org.first_name as organizer_first, org.last_name as organizer_last,
              v.venue_name, v.city
       FROM Event e
       JOIN Session s ON e.event_id = s.event_id
       LEFT JOIN Venue v ON e.venue_id = v.venue_id
       LEFT JOIN User_Role ur ON ur.role_type = 'Organizer'
       LEFT JOIN Users org ON ur.user_id = org.user_id
       WHERE s.speaker_user_id = ?`,
      [userId]
    );

    res.json(events);
  } catch (error) {
    return handleDbError(error, res);
  }
};

// 3. Get Assigned Sessions
exports.getAssignedSessions = async (req, res) => {
  const userId = req.user.user_id;

  try {
    const [sessions] = await db.query(
      `SELECT s.*, e.event_name, e.event_id
       FROM Session s
       JOIN Event e ON s.event_id = e.event_id
       WHERE s.speaker_user_id = ?
       ORDER BY s.session_date, s.start_time`,
      [userId]
    );
    res.json(sessions);
  } catch (error) {
    return handleDbError(error, res);
  }
};

// 4. Get Guest List for a specific assigned session
exports.getGuestList = async (req, res) => {
  const userId = req.user.user_id;
  const { sessionId } = req.params;

  try {
    // 1. Verify this session actually belongs to the caller -> Security Constraint
    const [sessionAuth] = await db.query(
      `SELECT session_id FROM Session WHERE session_id = ? AND speaker_user_id = ?`,
      [sessionId, userId]
    );

    if (sessionAuth.length === 0) {
      return res.status(403).json({ message: "Forbidden: You are not assigned to this session." });
    }

    // 2. Fetch the Guest List
    const [guests] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email_id, sr.session_registration_status, sr.session_registration_date
       FROM Session_Registration sr
       JOIN Users u ON sr.user_id = u.user_id
       WHERE sr.session_id = ? AND sr.session_registration_status = 'Registered'`,
      [sessionId]
    );

    res.json(guests);
  } catch (error) {
    return handleDbError(error, res);
  }
};
