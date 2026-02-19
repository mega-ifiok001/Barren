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

    console.log(`[BOOKING-DETAILS] Request received at ${new Date().toISOString()}`);
    console.log(`[BOOKING-DETAILS] Reference: ${reference || 'MISSING'}`);
    console.log(`[BOOKING-DETAILS] Remote IP: ${req.ip || req.connection.remoteAddress || 'unknown'}`);

    if (!reference) {
      console.warn("[BOOKING-DETAILS] No reference provided in query");
      return res.status(400).json({ 
        success: false,
        error: "Reference is required" 
      });
    }

    // Step 1: Try to find existing transaction
    console.log("[BOOKING-DETAILS] Searching for existing transaction...");
    let transaction = await Transaction.findOne({ reference });

    if (transaction) {
      console.log(`[BOOKING-DETAILS] Found existing transaction → status: ${transaction.status}`);
    } else {
      console.log(`[BOOKING-DETAILS] No transaction found → entering fallback creation mode`);
      
      // Check if Paystack secret key exists
      if (!process.env.PAYSTACK_SECRET_KEY) {
        console.error("[CRITICAL] PAYSTACK_SECRET_KEY is not set in environment variables");
        return res.status(500).json({
          success: false,
          error: "Server configuration error",
          message: "Paystack secret key is missing on the server"
        });
      }

      let paystackResult;
      try {
        console.log("[BOOKING-DETAILS] Calling Paystack verifyPayment...");
        paystackResult = await verifyPayment(reference);
        console.log("[BOOKING-DETAILS] Paystack verify response received");
      } catch (paystackErr) {
        console.error("[PAYSTACK-VERIFY-ERROR]", {
          message: paystackErr.message,
          stack: paystackErr.stack?.substring(0, 300),
          reference
        });
        return res.status(500).json({
          success: false,
          error: "Failed to verify payment with Paystack",
          message: paystackErr.message || "Paystack service unavailable"
        });
      }

      if (!paystackResult || !paystackResult.data) {
        console.error("[BOOKING-DETAILS] Invalid or empty Paystack response", paystackResult);
        return res.status(500).json({
          success: false,
          error: "Invalid response from Paystack"
        });
      }

      if (paystackResult.data.status !== "success") {
        console.log(`[BOOKING-DETAILS] Payment not successful → ${paystackResult.data.gateway_response || 'no message'}`);
        return res.status(400).json({
          success: false,
          message: paystackResult.data.gateway_response || "Payment not completed or not found",
          paystackStatus: paystackResult.data.status
        });
      }

      // Payment is successful → create transaction record
      const metadata = paystackResult.data.metadata || {};
      const amount = paystackResult.data.amount / 100;

      console.log("[BOOKING-DETAILS] Creating fallback transaction record");

      transaction = new Transaction({
        reference,
        userId: metadata.userId || null,
        eventId: metadata.eventId || null,
        amount,
        currency: paystackResult.data.currency || "NGN",
        status: "success",
        channel: paystackResult.data.channel || "unknown",
        ip: paystackResult.data.ip_address || req.ip || "unknown",
        eventDetails: {
          name: metadata.eventName || "Event (auto-created)",
          date: metadata.eventDate || "",
          time: metadata.eventTime || "",
          quantity: Number(metadata.quantity) || 1,
          image: metadata.eventImage || "",
        },
        metadata: metadata,
        createdAt: new Date(paystackResult.data.transaction_date || Date.now()),
      });

      await transaction.save();
      console.log(`[BOOKING-DETAILS] Fallback transaction created successfully → _id: ${transaction._id}`);
    }

    // Step 2: Populate relations
    console.log("[BOOKING-DETAILS] Populating user and event references...");
    transaction = await Transaction.findOne({ reference })
      .populate("eventId")
      .populate("userId", "firstName lastName email");

    if (!transaction) {
      console.warn("[BOOKING-DETAILS] Transaction disappeared after save/populate");
      return res.status(404).json({ 
        success: false,
        error: "Transaction could not be loaded after creation" 
      });
    }

    // Step 3: Create invoice if missing
    let invoice = await Invoice.findOne({ reference });
    if (!invoice && transaction.eventId && transaction.userId) {
      console.log("[BOOKING-DETAILS] Creating missing invoice...");
      invoice = new Invoice({
        invoiceNumber: generateInvoiceNumber(),
        userId: transaction.userId._id || transaction.userId,
        eventId: transaction.eventId._id || transaction.eventId,
        transactionId: transaction._id,
        amount: transaction.amount,
        currency: transaction.currency || "NGN",
        items: [{
          eventName: transaction.eventDetails?.name || 
                     (transaction.eventId?.eventName || "Event"),
          ticketQuantity: transaction.eventDetails?.quantity || 1,
          ticketTotal: transaction.amount,
        }],
        status: "PAID",
        reference,
      });
      await invoice.save();
      console.log(`[BOOKING-DETAILS] Invoice created → ${invoice.invoiceNumber}`);
    }

    // Step 4: Create ticket if missing
    let ticket = await Ticket.findOne({ transactionId: transaction._id });
    if (!ticket && transaction.userId && transaction.eventId) {
      console.log("[BOOKING-DETAILS] Creating missing ticket...");
      ticket = new Ticket({
        userId: transaction.userId._id || transaction.userId,
        eventId: transaction.eventId._id || transaction.eventId,
        transactionId: transaction._id,
        qrCodeString: `ticket-${transaction._id}-${Date.now()}`,
        isUsed: false,
      });
      await ticket.save();
      console.log(`[BOOKING-DETAILS] Ticket created → ${ticket._id}`);
    }

    // Step 5: Send email (non-blocking)
    if (ticket && invoice && transaction.userId?.email) {
      console.log("[BOOKING-DETAILS] Attempting to send ticket email...");
      try {
        const baseUrl = process.env.APP_URL || "https://barren-sbti.onrender.com";
        const invoiceUrl = `${baseUrl}/invoice/${invoice._id}`;
        
        await sendTicketEmail(
          transaction.userId.email,
          ticket,
          invoiceUrl,
          transaction.eventId
        );
        console.log("[BOOKING-DETAILS] Ticket email sent successfully");
      } catch (emailErr) {
        console.warn("[BOOKING-DETAILS] Email sending failed (non-critical):", emailErr.message);
      }
    }

    // Step 6: Final response
    console.log("[BOOKING-DETAILS] Request completed successfully");
    res.json({
      success: true,
      transaction,
      user: transaction.userId,
      event: transaction.eventId,
      invoice,
      ticket,
    });

  } catch (error) {
    console.error("[BOOKING-DETAILS] CRITICAL ERROR:", {
      message: error.message,
      stack: error.stack?.substring(0, 500),
      reference: req.query?.reference || 'unknown',
      time: new Date().toISOString()
    });

    res.status(500).json({
      success: false,
      error: "Failed to load booking details",
      message: error.message || "Internal server error - check server logs",
      // Do NOT expose stack in production response
    });
  }
};

module.exports = {
  startPayment,
  verifypayment,
  getBookingDetails,
};