const axios = require("axios");
const Transaction = require("../models/transactions.js");
const Event = require("../models/event.js");
const Ticket = require("../models/ticket.js");

const PAYSTACK_SECRET = process.env.PAYSTACK_TEST_SECRET_KEY;

const initializePayment = async (email, amount, metadata) => {
    const response = await axios.post(
        "https://api.paystack.co/transaction/initialize",
        {
            email,
            amount: amount * 100, // Paystack uses kobo
            metadata
        },
        {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`,
                "Content-Type": "application/json"
            }
        }
    );

    return response.data;
};

const verifyPayment = async (reference) => {
    const response = await axios.get(
        `https://api.paystack.co/transaction/verify/${reference}`,
        {
            headers: {
                Authorization: `Bearer ${PAYSTACK_SECRET}`
            }
        }
    );

    const data = response.data.data;

    if (data.status !== "success") {
        return {
            data: {
                status: "failed",
                message: "Payment failed"
            }
        };
    }

    // Check if transaction already exists
    let transaction = await Transaction.findOne({ reference }).populate("eventId");

    if (!transaction) {
        // SAVE NEW TRANSACTION
        const event = await Event.findById(data.metadata.eventId);

        transaction = await Transaction.create({
            userId: data.metadata.userId,
            eventId: event._id,
            reference,
            channel: data.channel,
            currency: data.currency,
            ip: data.ip,
            amount: data.amount / 100,
            status: data.status,
            eventDetails: {
                name: event.eventName,
                date: event.eventDate,
                time: event.eventTime,
                image: event.banner,
                price: event.ticketPrice,
                quantity: 1
            }
        });

        // CREATE NEW TICKET
        const ticket = await Ticket.create({
            userId: data.metadata.userId,
            eventId: event._id,
            transactionId: transaction._id,
            isUsed: false
        });

        ticket.qrCodeString = `8prsfpp6-3000.uks1.devtunnels.ms/api/ticket/${ticket._id}`;
        await ticket.save();
    }

    return response.data;
};

module.exports = {
    initializePayment,
    verifyPayment
};