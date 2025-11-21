const { Router } = require("express");
const router = Router();

const eventController = require("../controllers/eventController");

// Create event
router.post("/", eventController.createEvent);

// Get all events
router.get("/", eventController.getAllEvents);

// Get event by id
router.get("/:id", eventController.getEventById);

// Update event
router.put("/:id", eventController.updateEvent);

// Delete event
router.delete("/:id", eventController.deleteEvent);

module.exports = router;