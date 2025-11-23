const Event = require('../models/event');
const uploadToCloudinary = require('../utils/fileUpload');
const cloudinary = require('../config/cloudinaryConfig');
const path = require('path');

const streamifier = require('streamifier');

const eventController = {
    async createEvent(req, res) {
        try {
            const {
                eventName,
                category,
                eventDate,
                eventTime,
                eventDuration,
                eventDescription,
                eventOrganizer,
                venue,
                addressLine1,
                addressLine2,
                country,
                state,
                city,
                zipCode,
                tickets
            } = req.body;

            let eventBannerUrl = null;

            if (req.file) {
                // Upload file to Cloudinary and get secure_url
                eventBannerUrl = await new Promise((resolve, reject) => {
                    const uploadStream = cloudinary.uploader.upload_stream(
                        { folder: 'event-banners' },
                        (error, result) => {
                            if (error) return reject(error);
                            console.log(result);

                            resolve(result.secure_url); // <-- THIS IS IMPORTANT
                        }
                    );
                    streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
                });
            }

            const event = await Event.create({
                eventName,
                category,
                eventDate,
                eventTime,
                eventDuration,
                eventBanner: eventBannerUrl,
                eventDescription,
                eventOrganizer,
                venue,
                addressLine1,
                addressLine2,
                country,
                state,
                city,
                zipCode,
                tickets: JSON.parse(tickets)
            });

            res.status(201).json({
                success: true,
                message: 'Event created successfully',
                event
            });
        } catch (error) {
            console.error(error);
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
            return res.render(path.join(__dirname, '../pages/venue_event_detail_view'));
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