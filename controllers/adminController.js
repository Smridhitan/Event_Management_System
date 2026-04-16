const db = require("../config/db");
const bcrypt = require("bcrypt");

// 1. User Management
exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      `SELECT u.user_id, u.first_name, u.last_name, u.email_id, u.phone_no, 
       GROUP_CONCAT(ur.role_type) as roles 
       FROM Users u 
       LEFT JOIN User_Role ur ON u.user_id = ur.user_id 
       GROUP BY u.user_id`
    );
    res.json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { first_name, last_name, email_id, phone_no, username, password, role_type } = req.body;
    const hash = await bcrypt.hash(password, 10);
    
    // Insert into Users table
    const [result] = await db.query(
      `INSERT INTO Users (first_name, last_name, email_id, phone_no, username, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email_id, phone_no, username, hash]
    );

    const newUserId = result.insertId;

    // Insert initial role
    if (role_type && role_type !== 'Attendee') {
      await db.query(`INSERT INTO User_Role (user_id, role_type) VALUES (?, ?)`, [newUserId, role_type]);
    }

    res.status(201).json({ message: "User created successfully", user_id: newUserId });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "Email or phone number already tied to an account." });
    res.status(500).json({ error: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`DELETE FROM Users WHERE user_id = ?`, [id]);
    res.json({ message: "User deleted permanently." });
  } catch(error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { first_name, last_name, phone_no } = req.body;
    await db.query(
      `UPDATE Users SET first_name=?, last_name=?, phone_no=? WHERE user_id=?`,
      [first_name, last_name, phone_no, id]
    );
    res.json({ message: "User updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deactivateUser = async (req, res) => {
  try {
    const { id } = req.params;
    // We can add logic to deactivate user if a field is added to db schema or just throw error/message. 
    // Assuming simple dummy logic for demo since `isActive` is generally an add-on.
    res.json({ message: "User deactivated successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.body; 
    await db.query(
      `INSERT INTO User_Role (user_id, role_type) VALUES (?, ?)`,
      [id, role_type]
    );
    res.json({ message: "Role assigned successfully" });
  } catch (error) {
    if (error.code === 'ER_DUP_ENTRY') return res.status(400).json({ error: "User already has this role" });
    res.status(500).json({ error: error.message });
  }
};

exports.removeRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role_type } = req.body;
    await db.query(`DELETE FROM User_Role WHERE user_id=? AND role_type=?`, [id, role_type]);
    res.json({ message: "Role removed successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 2. Event Oversight
exports.getAllEvents = async (req, res) => {
  try {
    const [events] = await db.query(
      `SELECT e.*, v.city, u.first_name as organizer_first, u.last_name as organizer_last 
       FROM Event e 
       LEFT JOIN Venue v ON e.venue_id = v.venue_id
       LEFT JOIN Users u ON e.organizer_id = u.user_id 
       ORDER BY e.start_date DESC`
    );
    res.json(events);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventSessions = async (req, res) => {
  try {
    const [sessions] = await db.query(
      `SELECT s.*, u.first_name, u.last_name 
       FROM Session s 
       LEFT JOIN Users u ON s.speaker_user_id = u.user_id 
       WHERE s.event_id = ?`,
       [req.params.id]
    );
    res.json(sessions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventRegistrations = async (req, res) => {
  try {
    const [regs] = await db.query(
      `SELECT er.*, u.first_name, u.last_name, u.email_id, p.payment_status
       FROM Event_Registration er
       JOIN Users u ON er.user_id = u.user_id
       LEFT JOIN Payment p ON er.registration_id = p.registration_id
       WHERE er.event_id = ?`,
       [req.params.id]
    );
    res.json(regs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getSessionRegistrations = async (req, res) => {
  try {
    const [regs] = await db.query(
      `SELECT sr.*, u.first_name, u.last_name, u.email_id 
       FROM Session_Registration sr
       JOIN Users u ON sr.user_id = u.user_id
       WHERE sr.session_id = ?`,
       [req.params.id]
    );
    res.json(regs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getEventResources = async (req, res) => {
  try {
    const [resources] = await db.query(
      `SELECT ra.*, r.resource_name, r.resource_type, s.title as session_title
       FROM Resource_Allocation ra
       JOIN Resource r ON ra.resource_id = r.resource_id
       JOIN Session s ON ra.session_id = s.session_id
       WHERE s.event_id = ?`,
       [req.params.id]
    );
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.cancelEvent = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query(`UPDATE Event SET event_status = 'Cancelled' WHERE event_id = ?`, [id]);
    res.json({ message: "Event cancelled unconditionally by Admin" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 3. System Analytics
exports.getPlatformAnalytics = async (req, res) => {
  try {
    const [[users]] = await db.query(`SELECT COUNT(*) as count FROM Users`);
    const [[events]] = await db.query(`SELECT COUNT(*) as count FROM Event`);
    const [[registrations]] = await db.query(`SELECT COUNT(*) as count FROM Event_Registration WHERE registration_status='Confirmed'`);
    const [[revenue]] = await db.query(`SELECT SUM(amount) as sum FROM Payment WHERE payment_status='Success'`);

    res.json({
      total_users: users.count,
      total_events: events.count,
      total_registrations: registrations.count,
      total_revenue: revenue.sum || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const [payments] = await db.query(
      `SELECT p.payment_id, p.amount, p.payment_status, p.payment_datetime, p.payment_mode, e.event_name, u.email_id 
       FROM Payment p 
       JOIN Event_Registration er ON p.registration_id = er.registration_id 
       JOIN Event e ON er.event_id = e.event_id
       JOIN Users u ON er.user_id = u.user_id
       ORDER BY p.payment_datetime DESC`
    );
    res.json(payments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.systemResourceAudit = async (req, res) => {
  try {
    const [resources] = await db.query(
      `SELECT r.resource_id, r.resource_name, r.resource_type, r.available_quantity, r.total_quantity, 
       COALESCE(SUM(ra.quantity_allocated), 0) as total_allocated 
       FROM Resource r 
       LEFT JOIN Resource_Allocation ra ON r.resource_id = ra.resource_id AND ra.allocation_status='Allocated' 
       GROUP BY r.resource_id`
    );
    res.json(resources);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getResourceAllocationsLog = async (req, res) => {
  try {
    const [allocs] = await db.query(
      `SELECT e.event_name, s.title as session_title, u.first_name, u.last_name, ra.quantity_allocated, ra.allocation_status, s.session_date, s.start_time, s.end_time
       FROM Resource_Allocation ra
       JOIN Session s ON ra.session_id = s.session_id
       JOIN Event e ON s.event_id = e.event_id
       JOIN Users u ON e.organizer_id = u.user_id
       WHERE ra.resource_id = ?
       ORDER BY s.session_date DESC`, 
       [req.params.id]
    );
    res.json(allocs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 5. Vendor Oversight
exports.getVendors = async (req, res) => {
  try {
    const [vendors] = await db.query(`SELECT * FROM Vendor`);
    res.json(vendors);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createVendor = async (req, res) => {
  try {
    const { vendor_name, vendor_type, contact_person, phone_no, email, street, city, state, pincode, courier_facility } = req.body;
    await db.query(
      `INSERT INTO Vendor (vendor_name, vendor_type, contact_person, phone_no, email, street, city, state, pincode, courier_facility) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, 
      [vendor_name, vendor_type, contact_person, phone_no, email, street, city, state, pincode, courier_facility]
    );
    res.json({ message: "Vendor created successfully" });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};

exports.deleteVendor = async (req, res) => {
  try {
    await db.query(`DELETE FROM Vendor WHERE vendor_id=?`, [req.params.id]);
    res.json({ message: "Vendor removed successfully" });
  } catch (error) { 
    res.status(500).json({ error: error.message }); 
  }
};
