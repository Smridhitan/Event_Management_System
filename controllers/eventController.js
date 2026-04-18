const { handleDbError } = require("../config/dbUtils");
const db = require("../config/db");


// 🔹 1. GET ALL EVENTS
exports.getEvents = async (req, res) => {
  try {
    const { city, date } = req.query;

    let query = `
      SELECT e.*, v.venue_name, v.city
      FROM Event e
      JOIN Venue v ON e.venue_id = v.venue_id
      WHERE 1=1
    `;

    const params = [];

    if (city) {
      query += " AND v.city = ?";
      params.push(city);
    }

    if (date) {
      query += " AND ? BETWEEN e.start_date AND e.end_date";
      params.push(date);
    }

    const [events] = await db.query(query, params);

    res.json(events);
  } catch (err) {
    return handleDbError(err, res);
  }
};



// 🔹 2. GET EVENT DETAILS
exports.getEventDetails = async (req, res) => {
  try {
    const { id } = req.params;

    const [event] = await db.query(`
      SELECT e.*, v.venue_name, v.city, v.street
      FROM Event e
      JOIN Venue v ON e.venue_id = v.venue_id
      WHERE e.event_id = ?
    `, [id]);

    if (event.length === 0) {
      return res.status(404).send("Event not found");
    }

    res.json(event[0]);
  } catch (err) {
    return handleDbError(err, res);
  }
};



// 🔹 3. REGISTER FOR EVENT
exports.registerEvent = async (req, res) => {
  try {
    const { event_id, govt_id_type, govt_id_number } = req.body;
    const user_id = req.user.user_id;

    // Check if already registered
    const [existing] = await db.query(`
      SELECT * FROM Event_Registration
      WHERE user_id = ? AND event_id = ?
    `, [user_id, event_id]);

    if (existing.length > 0) {
      const reg = existing[0];
      if (reg.registration_status === 'Confirmed') {
        return res.status(400).send("Already registered for this event");
      } else {
        // Reuse Pending or Cancelled registration
        await db.query(`
          UPDATE Event_Registration
          SET registration_status = 'Pending', registration_date = CURDATE()
          WHERE registration_id = ?
        `, [reg.registration_id]);

        return res.json({
          message: "Registration updated. Proceed to payment.",
          registration_id: reg.registration_id
        });
      }
    }

    // Insert registration
    const [result] = await db.query(`
      INSERT INTO Event_Registration 
      (user_id, event_id, registration_date, registration_status, govt_id_type, govt_id_number)
      VALUES (?, ?, CURDATE(), 'Pending', ?, ?)
    `, [user_id, event_id, govt_id_type, govt_id_number]);

    res.json({
      message: "Registration created. Proceed to payment.",
      registration_id: result.insertId
    });

  } catch (err) {
    return handleDbError(err, res);
  }
};



// 🔹 4. GET MY EVENTS
exports.getMyEvents = async (req, res) => {
  try {
    const user_id = req.user.user_id;

    const [events] = await db.query(`
      SELECT 
        er.registration_id,
        e.event_name,
        e.start_date,
        e.end_date,
        er.registration_status
      FROM Event_Registration er
      JOIN Event e ON er.event_id = e.event_id
      WHERE er.user_id = ? AND er.registration_status = 'Confirmed'
      ORDER BY e.start_date
    `, [user_id]);

    res.json(events);

  } catch (err) {
    return handleDbError(err, res);
  }
};



// 🔹 5. CANCEL EVENT REGISTRATION
exports.cancelEvent = async (req, res) => {
  try {
    const { registration_id } = req.body;

    // Check if exists
    const [existing] = await db.query(`
      SELECT * FROM Event_Registration
      WHERE registration_id = ?
    `, [registration_id]);

    if (existing.length === 0) {
      return res.status(404).send("Registration not found");
    }

    // Update status
    await db.query(`
      UPDATE Event_Registration
      SET registration_status = 'Cancelled'
      WHERE registration_id = ?
    `, [registration_id]);

    res.send("Event registration cancelled");

  } catch (err) {
    return handleDbError(err, res);
  }
};