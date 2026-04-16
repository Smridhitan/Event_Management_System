const db = require("../config/db");

// ==========================================
// 1. EVENT MANAGEMENT
// ==========================================
exports.getEvents = async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT e.*, v.venue_name 
       FROM Event e 
       LEFT JOIN Venue v ON e.venue_id = v.venue_id 
       WHERE e.organizer_id = ?`,
      [req.user.user_id]
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createEvent = async (req, res) => {
  try {
    const { event_name, event_type, start_date, end_date, registration_fees, registration_deadline, description, venue_id, available_slots } = req.body;
    await db.query(
      `INSERT INTO Event (event_name, event_type, start_date, end_date, registration_fees, registration_deadline, event_status, description, venue_id, organizer_id, available_slots, total_registrations)
       VALUES (?, ?, ?, ?, ?, ?, 'Upcoming', ?, ?, ?, ?, 0)`,
      [event_name, event_type, start_date, end_date, registration_fees, registration_deadline, description, venue_id, req.user.user_id, available_slots || 0]
    );
    res.json({ message: "Event created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateEvent = async (req, res) => {
  try {
    const { event_name, event_type, start_date, end_date, registration_fees, description, venue_id } = req.body;
    await db.query(
      `UPDATE Event 
       SET event_name=?, event_type=?, start_date=?, end_date=?, registration_fees=?, description=?, venue_id=? 
       WHERE event_id=? AND organizer_id=?`,
      [event_name, event_type, start_date, end_date, registration_fees, description, venue_id, req.params.id, req.user.user_id]
    );
    res.json({ message: "Event updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;
    // Database trigger trg_cancel_event_registrations will auto-cancel registrations
    await db.query(`UPDATE Event SET event_status = 'Cancelled' WHERE event_id = ? AND organizer_id = ?`, [id, req.user.user_id]);
    res.json({ message: "Event cancelled successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 2. REGISTRATION MANAGEMENT
// ==========================================
exports.getEventAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const [attendees] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email_id, u.phone_no, er.registration_status, er.registration_date 
       FROM Event_Registration er
       JOIN Users u ON er.user_id = u.user_id
       JOIN Event e ON er.event_id = e.event_id
       WHERE e.event_id = ? AND e.organizer_id = ?`,
      [id, req.user.user_id]
    );
    res.json(attendees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionAttendees = async (req, res) => {
  try {
    const { id } = req.params;
    const [attendees] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email_id, u.phone_no, sr.session_registration_status as registration_status, sr.session_registration_date as registration_date 
       FROM Session_Registration sr
       JOIN Users u ON sr.user_id = u.user_id
       JOIN Session s ON sr.session_id = s.session_id
       JOIN Event e ON s.event_id = e.event_id
       WHERE s.session_id = ? AND e.organizer_id = ?`,
      [id, req.user.user_id]
    );
    res.json(attendees);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 3. ANALYTICS DASHBOARD
// ==========================================
exports.getAnalytics = async (req, res) => {
  try {
    // Total Revenue per event
    const [revenue] = await db.query(
      `SELECT e.event_name, SUM(p.amount) as total_revenue, COUNT(er.registration_id) as registrations
       FROM Event e
       LEFT JOIN Event_Registration er ON e.event_id = er.event_id AND er.registration_status = 'Confirmed'
       LEFT JOIN Payment p ON er.registration_id = p.registration_id AND p.payment_status = 'Success'
       WHERE e.organizer_id = ?
       GROUP BY e.event_id`,
      [req.user.user_id]
    );
    
    // Overall metrics
    const [globals] = await db.query(`SELECT SUM(total_registrations) as total_regs FROM Event WHERE organizer_id=?`, [req.user.user_id]);
    
    res.json({ metrics: revenue, overall: globals[0] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 4. SESSION MANAGEMENT
// ==========================================
exports.createSession = async (req, res) => {
  try {
    const { event_id, title, speaker_user_id, session_date, start_time, end_time, total_slots } = req.body;
    
    // Verify this organizer owns the event first
    const [event] = await db.query(`SELECT event_id FROM Event WHERE event_id=? AND organizer_id=?`, [event_id, req.user.user_id]);
    if (event.length === 0) return res.status(403).json({ error: "Access denied or Event not found" });

    await db.query(
      `INSERT INTO Session (event_id, speaker_user_id, title, session_date, start_time, end_time, total_slots)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [event_id, speaker_user_id, title, session_date, start_time, end_time, total_slots]
    );
    res.json({ message: "Session created successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 5. VENDOR & RESOURCE MANAGEMENT
// ==========================================
exports.getVendors = async (req, res) => {
  try {
    const [vendors] = await db.query(`SELECT * FROM Vendor`);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventVendors = async (req, res) => {
  try {
    const { id } = req.params;
    const [linked] = await db.query(
      `SELECT v.* FROM Vendor v JOIN Event_Vendor ev ON v.vendor_id = ev.vendor_id WHERE ev.event_id = ?`,
      [id]
    );
    res.json(linked);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.linkVendor = async (req, res) => {
  try {
    const { event_id, vendor_id } = req.body;
    const [event] = await db.query(`SELECT event_id FROM Event WHERE event_id=? AND organizer_id=?`, [event_id, req.user.user_id]);
    if (event.length === 0) return res.status(403).json({ error: "Access denied" });

    await db.query(`INSERT IGNORE INTO Event_Vendor (event_id, vendor_id) VALUES (?, ?)`, [event_id, vendor_id]);
    res.json({ message: "Vendor successfully synced to Event" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResources = async (req, res) => {
  try {
    const [resources] = await db.query(`SELECT * FROM Resource`);
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVenues = async (req, res) => {
  try {
    const [venues] = await db.query(`SELECT * FROM Venue WHERE venue_status='Available'`);
    res.json(venues);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDynamicVenues = async (req, res) => {
  try {
    const { start, end, city } = req.query;
    if (!start || !end || !city) return res.json([]);
    const [venues] = await db.query(
      `SELECT * FROM Venue 
       WHERE city = ? AND venue_status = 'Available'
         AND venue_id NOT IN (
            SELECT venue_id FROM Event 
            WHERE event_status <> 'Cancelled'
              AND NOT (end_date < ? OR start_date > ?)
         )`,
      [city, start, end]
    );
    res.json(venues);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionsForEvent = async (req, res) => {
  try {
    const [sessions] = await db.query(
      `SELECT s.*, u.first_name, u.last_name 
       FROM Session s 
       LEFT JOIN Users u ON s.speaker_user_id = u.user_id 
       WHERE s.event_id = ?`, 
       [req.params.id]
    );
    res.json(sessions);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSpeakers = async (req, res) => {
  try {
    const [speakers] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name 
       FROM Users u 
       JOIN User_Role ur ON u.user_id = ur.user_id 
       WHERE ur.role_type = 'Speaker'`
    );
    res.json(speakers);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
};

// ==========================================
// 6. RESOURCE ALLOCATION MANAGEMENT
// ==========================================
exports.getSessionAllocations = async (req, res) => {
  try {
    const { id } = req.params;
    const [allocations] = await db.query(
      `SELECT ra.*, r.resource_name, r.resource_type, r.available_quantity, r.total_quantity 
       FROM Resource_Allocation ra 
       JOIN Resource r ON ra.resource_id = r.resource_id 
       WHERE ra.session_id = ? AND ra.allocation_status = 'Allocated'`,
      [id]
    );
    res.json(allocations);
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
};

exports.allocateResource = async (req, res) => {
  try {
    const { id } = req.params;
    const { resource_id, quantity } = req.body;
    
    // Get session times
    const [sess] = await db.query(`SELECT start_time, end_time FROM Session WHERE session_id=?`, [id]);
    if (sess.length === 0) return res.status(404).json({ error: "Session not found" });

    // Triggers will validate availability
    await db.query(
      `INSERT INTO Resource_Allocation (session_id, resource_id, quantity_allocated, allocation_status, start_time, end_time, usage_completed) 
       VALUES (?, ?, ?, 'Allocated', ?, ?, FALSE)
       ON DUPLICATE KEY UPDATE 
       quantity_allocated = IF(usage_completed = TRUE, ?, quantity_allocated + ?), 
       usage_completed = FALSE,
       allocation_status = 'Allocated'`,
      [id, resource_id, quantity, sess[0].start_time, sess[0].end_time, quantity, quantity]
    );
    res.json({ message: "Resource correctly allocated to session" });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
};

exports.releaseResource = async (req, res) => {
  try {
    const { id, res_id } = req.params;
    // Toggling usage_completed triggers the DB to restock Furniture quantities
    await db.query(
      `UPDATE Resource_Allocation SET usage_completed = TRUE WHERE session_id = ? AND resource_id = ?`,
      [id, res_id]
    );
    res.json({ message: "Resource released actively" });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
};
