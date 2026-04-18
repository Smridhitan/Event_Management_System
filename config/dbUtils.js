const handleDbError = (err, res) => {
  let message = err.sqlMessage || err.message || "An unexpected database error occurred.";

  // 1. Intercept Check Constraints
  if (message.includes("Check constraint")) {
    if (message.includes("chk_phone_numeric")) message = "Phone number must be exactly 10 digits.";
    else if (message.includes("chk_first_name") || message.includes("chk_last_name")) message = "Names must contain only alphabetic characters.";
    else if (message.includes("Event")) message = "Event registration or date limits violated.";
    else if (message.includes("Session")) message = "Session slot capacity limits violated.";
    else message = "A system data validation constraint was violated.";
  }

  // 2. Extract strictly the MESSAGE_TEXT of MySQL triggers if it matches the standard pattern
  if (message.includes("ER_SIGNAL_EXCEPTION")) {
    // Sometimes err.sqlMessage is simply the message itself if thrown locally from SIGNAL SQLSTATE '45000'
    const parts = message.split(":");
    message = parts[parts.length - 1].trim(); 
  }

  console.error("DB Error Caught:", message);
  return res.status(400).json({ error: message, raw: err.sqlMessage });
};

module.exports = { handleDbError };
