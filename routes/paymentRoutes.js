const express = require("express");
const router = express.Router();

const paymentController = require("../controllers/paymentController");

// Payment initialization (called from backend if you decide to use it)
router.post("/pay", paymentController.startPayment);

// Manual verification endpoint (can be used from frontend or webhook)
router.post("/verify", paymentController.verifypayment);

// Main endpoint used by booking_confirmed page
router.get("/booking-details", paymentController.getBookingDetails);

// Optional debug endpoint (you can remove later)
router.get("/debug-transaction/:ref", async (req, res) => {
  try {
    const tx = await require("../models/transactions").findOne({ reference: req.params.ref });
    if (!tx) return res.status(404).json({ error: "Not found", ref: req.params.ref });
    res.json(tx);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
