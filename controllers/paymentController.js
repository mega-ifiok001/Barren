const { initializePayment, verifyPayment } = require("../services/paystackService.js");

const Transaction = require("../models/transactions.js");
const User = require("../models/user.js");
const Invoice = require("../models/invoice.js");
const generateInvoiceNumber = require("../utils/generateInvoiceNumber.js");
const Ticket = require("../models/ticket.js");
const { sendTicketEmail } = require("../utils/emailService.js");

const startPayment = async (req, res) => {
    try {
        const { email, amount, metadata } = req.body;

        const result = await initializePayment(email, amount, metadata);

        res.json({
            status: "success",
            authorization_url: result.data.authorization_url,
            reference: result.data.reference
        });
    } catch (error) {
        console.log(error.response?.data || error);
        res.status(500).json({ error: "Payment initialization failed" });
    }
};

const confirmPayment = async (req, res) => {
    try {
        const { reference } = req.body;

        const result = await verifyPayment(reference);
        console.log(result);

        if (result.data.status === "success") {
            return res.json({
                status: "success",
                message: "Payment verified",
                data: result.data
            });
        }

        return res.status(400).json({ status: "failed" });
    } catch (error) {
        console.log(error.response?.data || error);
        res.status(500).json({ error: "Verification failed" });
    }
};

const verifypayment = async (req, res) => {
    try {
        const { reference } = req.query;

        const result = await verifyPayment(reference);

        if (result.data.status === "success") {
            let transaction = await Transaction.findOne({ reference }).populate("eventId");

            // Get user details
            let user = await User.findById(transaction.userId).select("firstName lastName email");
            console.log(transaction);
            console.log(user);

            // Check if invoice already exists
            let invoice = await Invoice.findOne({ reference });

            if (!invoice) {
                // Create new invoice
                invoice = new Invoice({
                    invoiceNumber: generateInvoiceNumber(),
                    userId: user._id,
                    eventId: transaction.eventId._id,
                    transactionId: transaction._id,
                    amount: transaction.amount,
                    currency: transaction.currency || "NGN",
                    items: [
                        {
                            eventName: transaction.eventDetails.name,
                            eventType: transaction.eventDetails.type || "Venue",
                            ticketPrice: transaction.eventId.tickets[0].price,
                            ticketQuantity: transaction.eventDetails.quantity,
                            ticketTotal: transaction.amount
                        }
                    ],
                    status: "PAID",
                    reference: reference
                });

                await invoice.save();
            }

            // Check if Ticket exists
            let ticket = await Ticket.findOne({ transactionId: transaction._id });

            // Send Email
            console.log('Sending email for ticket...');

            const invoiceUrl = `${process.env.APP_URL || 'http://localhost:3000'}/invoice/${invoice._id}`;
            await sendTicketEmail(user.email, ticket, invoiceUrl, transaction.eventId);

            if (!ticket) {
                ticket = new Ticket({
                    userId: user._id,
                    eventId: transaction.eventId._id,
                    transactionId: transaction._id,
                    qrCodeString: transaction._id.toString(), // Simple QR string for now
                    isUsed: false
                });
                await ticket.save();

                // Send Email
                console.log('Sending email for ticket...');

                const invoiceUrl = `${process.env.APP_URL || 'http://localhost:3000'}/invoice/${invoice._id}`;
                await sendTicketEmail(user.email, ticket, invoiceUrl, transaction.eventId);
            }

            // Return event + transaction details to frontend
            return res.json({
                success: true,
                transaction,
                user,
                invoice,
                ticket
            });
        }

        return res.status(400).json({ status: "failed" });
    } catch (error) {
        console.log(error.response?.data || error);
        res.status(500).json({ error: "Verification failed" });
    }
};

module.exports = {
    startPayment,
    confirmPayment,
    verifypayment
};