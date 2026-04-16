const express = require("express");
const router = express.Router();

const { simulatePayment } = require("../controllers/paymentController");
const { authMiddleware } = require("../middleware/authMiddleware");

// Simulate payment
router.post("/simulate", authMiddleware, simulatePayment);

module.exports = router;