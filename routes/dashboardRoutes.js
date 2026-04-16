const express = require("express");
const router = express.Router();
const { authMiddleware, hasRole } = require("../middleware/authMiddleware");
const { getOrganizerDashboard, getSpeakerDashboard, getAdminDashboard } = require("../controllers/dashboardController");

router.get("/organizer", authMiddleware, hasRole("Organizer"), getOrganizerDashboard);
router.get("/speaker", authMiddleware, hasRole("Speaker"), getSpeakerDashboard);
router.get("/admin", authMiddleware, hasRole("Admin"), getAdminDashboard);

module.exports = router;
