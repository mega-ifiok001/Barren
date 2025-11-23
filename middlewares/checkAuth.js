const jwt = require('jsonwebtoken');
const User = require('../models/user');

const checkAuth = async (req, res, next) => {
    try {
        const token = req.cookies['barren-token'];
        if (!token) {
            console.log('No token found');
            req.user = null;
            return next();
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId).select('-password');
        req.user = user;
        next();
    } catch (error) {
        req.user = null;
        next();
    }
};
module.exports = checkAuth;
