const mongoose = require('mongoose');

const TicketSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    transactionId: { type: String, required: true },
    qrCodeString: { type: String },  // what was encoded into the QR
    isUsed: { type: Boolean, default: false, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Ticket', TicketSchema);