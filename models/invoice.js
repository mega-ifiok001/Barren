const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    invoiceNumber: { type: String, required: true, unique: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },
    transactionId: { type: mongoose.Schema.Types.ObjectId, ref: "Transaction", required: true },

    amount: Number,
    currency: { type: String, default: "NGN" },

    items: [
        {
            eventName: String,
            eventType: String,
            ticketPrice: Number,
            ticketQuantity: Number,
            ticketTotal: Number
        }
    ],

    issueDate: { type: Date, default: Date.now },
    status: { type: String, enum: ["PAID", "UNPAID"], default: "PAID" },

    reference: String // paystack reference
});

module.exports = mongoose.model("Invoice", invoiceSchema);