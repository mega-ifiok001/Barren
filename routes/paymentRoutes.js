const { Router } = require("express");
const router = Router();

const paymentController = require("../controllers/paymentController");

router.post("/pay", paymentController.startPayment);
router.post("/verify", paymentController.confirmPayment);
router.get("/verify-payment", paymentController.verifypayment);

module.exports = router;