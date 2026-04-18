const db = require("../config/db");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { handleDbError } = require("../config/dbUtils");

exports.register = async (req, res) => {
  try {
    const { first_name, last_name, email, phone, username, password, role } = req.body;

    const hash = await bcrypt.hash(password, 10);

    const [result] = await db.query(
      `INSERT INTO Users (first_name, last_name, email_id, phone_no, username, password_hash)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [first_name, last_name, email, phone, username, hash]
    );

    const userId = result.insertId;
    const primaryRole = role || 'Attendee';

    await db.query(`INSERT INTO User_Role (user_id, role_type) VALUES (?, ?)`, [userId, 'Attendee']);
    
    if (primaryRole !== 'Attendee' && ['Organizer', 'Speaker', 'Performer'].includes(primaryRole)) {
      await db.query(`INSERT INTO User_Role (user_id, role_type) VALUES (?, ?)`, [userId, primaryRole]);
    }

    res.send("User registered");
  } catch (error) {
    return handleDbError(error, res);
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  const [user] = await db.query(
    `SELECT u.*, ur.role_type 
     FROM Users u 
     LEFT JOIN User_Role ur ON u.user_id = ur.user_id 
     WHERE u.email_id = ?
     ORDER BY CASE ur.role_type 
        WHEN 'Admin' THEN 1 
        WHEN 'Organizer' THEN 2 
        WHEN 'Speaker' THEN 3 
        WHEN 'Performer' THEN 4 
        ELSE 5 
     END`,
    [email]
  );

  if (user.length === 0) return res.send("User not found");

  const valid = await bcrypt.compare(password, user[0].password_hash);
  if (!valid) return res.send("Wrong password");

  const token = jwt.sign(
    { user_id: user[0].user_id, role: user[0].role_type || 'Attendee' },
    "secret"
  );

  res.json({ token });
};

