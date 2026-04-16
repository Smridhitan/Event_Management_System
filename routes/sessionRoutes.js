const express = require("express");
const router = express.Router();

const {
  getSessionsByEvent,
  registerSession,
  getMySessions,
  cancelSession
} = require("../controllers/sessionController");
const { authMiddleware } = require("../middleware/authMiddleware");

// 🔹 Get all sessions for a specific event
router.get("/event/:event_id", getSessionsByEvent);

// 🔹 Register for a session
router.post("/register", authMiddleware, registerSession);

// 🔹 Get sessions booked by a user
router.get("/my", authMiddleware, getMySessions);

// 🔹 Cancel session registration
router.post("/cancel", authMiddleware, cancelSession);

module.exports = router;