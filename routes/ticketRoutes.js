const express = require("express");
const router = express.Router();

const { validateTicket } = require("../controllers/ticketController");

router.get("/:ticketId", validateTicket);

module.exports = router;