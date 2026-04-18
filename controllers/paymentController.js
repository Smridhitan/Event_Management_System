const { handleDbError } = require("../config/dbUtils");
const db = require("../config/db");

exports.simulatePayment = async (req, res) => {
  const { registration_id, payment_mode, status } = req.body;

  // Get amount
  const [result] = await db.query(`
    SELECT e.registration_fees
    FROM Event_Registration er
    JOIN Event e ON er.event_id = e.event_id
    WHERE er.registration_id = ?
  `, [registration_id]);

  const amount = result[0].registration_fees;

  // Insert payment
  await db.query(`
    INSERT INTO Payment (registration_id, amount, payment_mode, payment_status)
    VALUES (?, ?, ?, ?)
  `, [registration_id, amount, payment_mode, status]);
  
  if (status === 'Failed') {
    await db.query(`
      UPDATE Event_Registration
      SET registration_status = 'Cancelled'
      WHERE registration_id = ?
    `, [registration_id]);
  }

  res.json({
    message: `Payment ${status}`
  });
};