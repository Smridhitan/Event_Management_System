const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventDetails,
  registerEvent,
  getMyEvents,
  cancelEvent
} = require("../controllers/eventController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Get all events
router.get("/", getEvents);

// Get my events
router.get("/my", authMiddleware, getMyEvents);

// Get event details
router.get("/:id", getEventDetails);

// Register for event
router.post("/register", authMiddleware, registerEvent);

// Cancel event
router.post("/cancel", authMiddleware, cancelEvent);

module.exports = router;