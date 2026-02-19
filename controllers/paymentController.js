const { initializePayment, verifyPayment } = require("../services/paystackService");

const Transaction = require("../models/transactions");
const User = require("../models/user");
const Invoice = require("../models/invoice");
const Ticket = require("../models/ticket");
const Event = require("../models/event"); // assuming you have an Event model
const generateInvoiceNumber = require("../utils/generateInvoiceNumber");
const { sendTicketEmail } = require("../utils/emailService");

const startPayment = async (req, res) => {
  try {
    const { email, amount, metadata } = req.body;

    if (!email || !amount || !metadata?.userId || !metadata?.eventId) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const result = await initializePayment(email, amount, metadata);

    const transaction = new Transaction({
      reference: result.data.reference,
      userId: metadata.userId,
      eventId: metadata.eventId,
      amount,
      currency: "NGN",
      status: "pending",
      eventDetails: {
        name: metadata.eventName || "Unknown Event",
        date: metadata.eventDate || "",
        time: metadata.eventTime || "",
        quantity: metadata.quantity || 1,
      },
      metadata,
    });

    await transaction.save();

    res.json({
      status: "success",
      authorization_url: result.data.authorization_url,
      reference: result.data.reference,
    });
  } catch (error) {
    console.error("startPayment error:", error);
    res.status(500).json({ error: "Payment initialization failed" });
  }
};

const verifypayment = async (req, res) => {
  try {
    const { reference } = req.body;
    if (!reference) return res.status(400).json({ error: "Reference required" });

    const paystackResult = await verifyPayment(reference);

    if (paystackResult.data?.status !== "success") {
      return res.status(400).json({
        success: false,
        message: paystackResult.data?.gateway_response || "Payment not successful",
      });
    }

    let transaction = await Transaction.findOne({ reference });

    if (!transaction) {
      // Fallback creation during manual verify
      const metadata = paystackResult.data.metadata || {};
      transaction = new Transaction({
        reference,
        userId: metadata.userId || null,
        eventId: metadata.eventId || null,
        amount: paystackResult.data.amount / 100,
        currency: paystackResult.data.currency || "NGN",
        status: "success",
        channel: paystackResult.data.channel,
        ip: paystackResult.data.ip_address,
        eventDetails: {
          name: metadata.eventName || "Unknown",
          quantity: metadata.quantity || 1,
        },
        metadata,
      });
      await transaction.save();
    } else if (transaction.status !== "success") {
      transaction.status = "success";
      transaction.channel = paystackResult.data.channel;
      transaction.ip = paystackResult.data.ip_address;
      await transaction.save();
    }

    res.json({ success: true, transaction });
  } catch (error) {
    console.error("verifypayment error:", error);
    res.status(500).json({ error: "Verification failed" });
  }
};

const getBookingDetails = async (req, res) => {
  try {
    const { reference } = req.query;
    if (!reference) {
      return res.status(400).json({ error: "Reference is required" });
    }

    let transaction = await Transaction.findOne({ reference });

    // ── FALLBACK: If transaction doesn't exist → verify and create it ─────────────
    if (!transaction) {
      console.log(`[FALLBACK] No transaction found for ref ${reference} → verifying with Paystack`);

      const paystackResult = await verifyPayment(reference);

      if (paystackResult.data?.status !== "success") {
        return res.status(400).json({
          success: false,
          message: paystackResult.data?.gateway_response || "Payment not completed",
        });
      }

      const metadata = paystackResult.data.metadata || {};
      const amount = paystackResult.data.amount / 100;

      transaction = new Transaction({
        reference,
        userId: metadata.userId || null,
        eventId: metadata.eventId || null,
        amount,
        currency: paystackResult.data.currency || "NGN",
        status: "success",
        channel: paystackResult.data.channel,
        ip: paystackResult.data.ip_address,
        eventDetails: {
          name: metadata.eventName || "Event (fallback)",
          date: "",
          time: "",
          quantity: metadata.quantity || 1,
          image: "", // can be updated later if needed
        },
        metadata: metadata || {},
      });

      await transaction.save();
      console.log(`[FALLBACK] Created transaction for ${reference}`);
    }

    // Reload with populated fields
    transaction = await Transaction.findOne({ reference })
      .populate("eventId")
      .populate("userId", "firstName lastName email");

    if (!transaction) {
      return res.status(404).json({ error: "Transaction could not be loaded" });
    }

    // Create invoice if missing
    let invoice = await Invoice.findOne({ reference });
    if (!invoice && transaction.eventId && transaction.userId) {
      invoice = new Invoice({
        invoiceNumber: generateInvoiceNumber(),
        userId: transaction.userId._id || transaction.userId,
        eventId: transaction.eventId._id || transaction.eventId,
        transactionId: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency || "NGN",
        items: [{
          eventName: transaction.eventDetails?.name || transaction.eventId?.eventName || "Event",
          ticketQuantity: transaction.eventDetails?.quantity || 1,
          ticketTotal: transaction.amount,
        }],
        status: "PAID",
        reference,
      });
      await invoice.save();
    }

    // Create ticket if missing (simplified)
    let ticket = await Ticket.findOne({ transactionId: transaction._id });
    if (!ticket && transaction.userId && transaction.eventId) {
      ticket = new Ticket({
        userId: transaction.userId._id || transaction.userId,
        eventId: transaction.eventId._id || transaction.eventId,
        transactionId: transaction._id,
        qrCodeString: `ticket-${transaction._id}-${Date.now()}`,
        isUsed: false,
      });
      await ticket.save();
    }

    // Optional: send email (non-blocking)
    if (ticket && invoice && transaction.userId?.email) {
      try {
        const invoiceUrl = `${process.env.APP_URL || "http://localhost:3000"}/invoice/${invoice._id}`;
        await sendTicketEmail(transaction.userId.email, ticket, invoiceUrl, transaction.eventId);
      } catch (emailErr) {
        console.warn("Email failed (non-critical):", emailErr.message);
      }
    }

    res.json({
      success: true,
      transaction,
      user: transaction.userId,
      event: transaction.eventId,
      invoice,
      ticket,
    });
  } catch (error) {
    console.error("[getBookingDetails] Error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to load booking details",
      message: error.message,
    });
  }
};

module.exports = {
  startPayment,
  verifypayment,
  getBookingDetails,
};