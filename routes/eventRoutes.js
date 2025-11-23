const { Router } = require("express");
const router = Router();

const multer = require('multer');
const storage = multer.memoryStorage(); // store in memory for Cloudinary
const upload = multer({ storage });

const eventController = require("../controllers/eventController");

// Verify token middleware
const verifyToken = require("../middlewares/verifyToken");

// Create event
router.post("/", verifyToken, upload.single('eventBanner'), eventController.createEvent);

// Get all events
router.get("/", eventController.getAllEvents);

// Get event by id
router.get("/:id", eventController.getEventById);

// Update event
router.put("/:id", verifyToken, eventController.updateEvent);

// Delete event
router.delete("/:id", verifyToken, eventController.deleteEvent);

module.exports = router;