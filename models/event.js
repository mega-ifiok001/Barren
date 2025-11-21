const mongoose = require("mongoose");

// Ticket Subdocument Schema
const ticketSchema = new mongoose.Schema({
    ticketName: { type: String, required: true },
    ticketOrder: Number,
    ticketDescription: String,
    ticketPrice: Number,
    variationName: String,
});

// Event Schema
const eventSchema = new mongoose.Schema({
    eventName: { type: String, required: true },
    category: String,
    eventDate: String,
    eventTime: String,
    eventDuration: String,
    eventBanner: String,
    eventDescription: String,
    venue: String,
    addressLine1: String,
    addressLine2: String,
    country: String,
    state: String,
    city: String,
    zipCode: String,

    // Embedded tickets
    tickets: [ticketSchema]
});

module.exports = mongoose.model("Event", eventSchema);