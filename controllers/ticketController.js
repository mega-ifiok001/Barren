const mongoose = require('mongoose');
const Ticket = require('../models/ticket');
const Event = require('../models/event');
const User = require('../models/user');
const path = require('path');

const validateTicket = async (req, res) => {
    const { ticketId } = req.params;

    // Validate ObjectId before querying
    if (!mongoose.Types.ObjectId.isValid(ticketId)) {
        return res.render(path.join(__dirname, "../pages/ticket_details"), {
            valid: false,
            message: "Invalid ticket ID format",
            event: null,
            ticket: null,
            user: null
        });
    }

    const ticket = await Ticket.findById(ticketId);

    if (!ticket) {
        console.log("Invalid Ticket");
        return res.render(path.join(__dirname, "../pages/ticket_details"), {
            valid: false,
            message: "Invalid Ticket",
            event: null,
            ticket: null,
            user: null
        });
    };

    // Get event and user details for context (even if used)
    const event = await Event.findById(ticket.eventId);
    const user = await User.findById(ticket.userId);

    if (ticket.isUsed) {
        console.log("Ticket Already Used");
        return res.render(path.join(__dirname, "../pages/ticket_details"), {
            valid: false,
            message: "Ticket Already Used",
            ticket,
            event,
            user
        });
    };

    ticket.isUsed = true; // mark as used
    await ticket.save();

    console.log(event);
    console.log(user);
    console.log(ticket);

    return res.render(path.join(__dirname, "../pages/ticket_details"), {
        valid: true,
        ticket,
        event,
        user
    });
};

module.exports = {
    validateTicket
};