const express = require("express");
const router = express.Router();
const { authMiddleware, hasAnyRole } = require("../middleware/authMiddleware");
const participantController = require("../controllers/participantController");

// Apply strictly read-only bindings tied exclusively to Speaker or Performer
router.use(authMiddleware);
router.use(hasAnyRole(['Speaker', 'Performer']));

// Endpoints
router.get("/metrics", participantController.getDashboardMetrics);
router.get("/events", participantController.getAssignedEvents);
router.get("/sessions", participantController.getAssignedSessions);
router.get("/sessions/:sessionId/guests", participantController.getGuestList);

module.exports = router;
