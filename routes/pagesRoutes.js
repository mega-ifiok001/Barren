const { Router } = require("express");
const router = Router();

// pagesController
const pagesController = require("../controllers/pagesController");

// Verify token middleware
const verifyToken = require("../middlewares/verifyToken");
const checkAuth = require("../middlewares/checkAuth");

// Auth Pages
router.get("/auth/register", checkAuth, pagesController.register);
router.get("/auth/login", checkAuth, pagesController.login);

// Event Pages
router.get("/event/create", verifyToken, pagesController.createEvent);
router.get("/event/create/venue", verifyToken, pagesController.createVenueEvent);
router.get("/event/create/online", verifyToken, pagesController.createOnlineEvent);
router.get("/events/explore", verifyToken, pagesController.exploreEvents);
router.get("/event/:id", verifyToken, pagesController.eventDetail);
router.get("/checkout", verifyToken, pagesController.checkout);
router.get("/booking_confirmed", verifyToken, pagesController.bookingConfirmed);
router.get("/invoice/:id", verifyToken, pagesController.viewTicket);
router.get("/my_invoices", verifyToken, pagesController.myInvoices);

module.exports = router; 