const path = require('path');

const pagesController = {
    register(req, res) {
        return res.sendFile(path.join(__dirname, '../pages/sign_up.html'));
    },
    login(req, res) {
        return res.sendFile(path.join(__dirname, '../pages/sign_in.html'));
    }
}

module.exports = pagesController;