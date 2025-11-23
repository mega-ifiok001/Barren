const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    eventId: { type: mongoose.Schema.Types.ObjectId, ref: "Event", required: true },

    amount: Number,
    reference: String,
    channel: String,
    currency: String,
    ip: String,
    status: String, // success / failed

    eventDetails: {
        name: String,
        email: String,
        date: String,
        time: String,
        image: String,
        price: Number,
        quantity: Number
    },

    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Transaction", transactionSchema);