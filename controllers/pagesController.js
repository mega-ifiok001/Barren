const path = require('path');

const pagesController = {
    register(req, res) {
        return res.sendFile(path.join(__dirname, '../pages/sign_up.html'));
    },
    login(req, res) {
        return res.sendFile(path.join(__dirname, '../pages/sign_in.html'));
    },
    createEvent(req, res) {
        return res.sendFile(path.join(__dirname, '../pages/create.html'));
    },
    createVenueEvent(req, res) {
        return res.sendFile(path.join(__dirname, '../pages/create_venue_event.html'));
    },
    createOnlineEvent(req, res) {
        return res.sendFile(path.join(__dirname, '../pages/create_online_event.html'));
    }
}

module.exports = pagesController;