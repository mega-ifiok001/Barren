const path = require('path');
const QRCode = require('qrcode');
const Event = require('../models/event');
const Invoice = require('../models/invoice');
const User = require('../models/user');
const Transaction = require('../models/transactions');
const Ticket = require('../models/ticket');

const pagesController = {
    register(req, res) {
        return res.render(path.join(__dirname, '../pages/sign_up'));
    },
    login(req, res) {
        return res.render(path.join(__dirname, '../pages/sign_in'));
    },
    createEvent(req, res) {
        return res.render(path.join(__dirname, '../pages/create'), { user: req.user });
    },
    createVenueEvent(req, res) {
        return res.render(path.join(__dirname, '../pages/create_venue_event'), { user: req.user });
    },
    createOnlineEvent(req, res) {
        return res.render(path.join(__dirname, '../pages/create_online_event'), { user: req.user });
    },
    async eventDetail(req, res) {
        try {
            const event = await Event.findById(req.params.id);
            console.log(event);
            return res.render(path.join(__dirname, '../pages/venue_event_detail_view'), { event, user: req.user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    exploreEvents(req, res) {
        return res.render(path.join(__dirname, '../pages/explore_events'), { user: req.user });
    },
    checkout(req, res) {
        console.log(req.user);
        return res.render(path.join(__dirname, '../pages/checkout'), { userId: req.user._id, user: req.user });
    },
    bookingConfirmed(req, res) {
        const transactionReference = req.query.reference;
        return res.render(path.join(__dirname, '../pages/booking_confirmed'), { transactionReference, userId: req.user._id, user: req.user });
    },
    async viewTicket(req, res) {
        try {
            const invoiceId = req.params.id;

            // Get invoice by ID
            const invoice = await Invoice.findById(invoiceId);
            console.log(invoice);

            if (!invoice) {
                return res.status(404).render(path.join(__dirname, '../pages/error'), { message: "Invoice not found" });
            }

            // Get user by ID
            const user = await User.findById(invoice.userId);
            console.log(user);

            // Get event by ID
            const event = await Event.findById(invoice.eventId);
            console.log(event);

            // Get the transaction by ID
            const transaction = await Transaction.findById(invoice.transactionId);
            console.log(transaction);

            // Get ticket by ID
            const ticket = await Ticket.findOne({ transactionId: transaction._id });
            console.log(ticket);

            let ticketQrCode = await QRCode.toDataURL(ticket.qrCodeString);
            console.log(ticketQrCode);

            return res.render(path.join(__dirname, '../pages/invoice'), { invoice, user, event, ticketQrCode });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async myInvoices(req, res) {
        try {
            const invoices = await Invoice.find({ userId: req.user.userId }).sort({ issueDate: -1 });
            console.log(invoices);

            return res.render(path.join(__dirname, '../pages/my_invoices'), { invoices, user: req.user });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = pagesController;