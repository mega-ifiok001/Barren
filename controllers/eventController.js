const Event = require('../models/event');

const eventController = {
    async createEvent(req, res) {
        try {
            const event = await Event.create(req.body);
            res.status(201).json({ success: true, message: "Event created successfully", event });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getAllEvents(req, res) {
        try {
            const events = await Event.find();
            res.status(200).json({ success: true, events });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async getEventById(req, res) {
        try {
            const event = await Event.findById(req.params.id);
            res.status(200).json({ success: true, event });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async updateEvent(req, res) {
        try {
            const event = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.status(200).json({ success: true, event });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    },
    async deleteEvent(req, res) {
        try {
            const event = await Event.findByIdAndDelete(req.params.id);
            res.status(200).json({ success: true, event });
        } catch (error) {
            res.status(500).json({ success: false, message: error.message });
        }
    }
}

module.exports = eventController;