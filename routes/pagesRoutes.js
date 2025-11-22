const { Router } = require("express");
const router = Router();

// pagesController
const pagesController = require("../controllers/pagesController");

// Auth Pages
router.get("/auth/register", pagesController.register);
router.get("/auth/login", pagesController.login);

// Event Pages
router.get("/event/create", pagesController.createEvent);
router.get("/event/create/venue", pagesController.createVenueEvent);
router.get("/event/create/online", pagesController.createOnlineEvent);

module.exports = router; 