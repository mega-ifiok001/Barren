const jwt = require('jsonwebtoken');
const User = require('../models/user');

async function verifyToken(req, res, next) {
    const token = req.cookies['barren-token'];

    if (!token) {
        console.log("No token found");
        return res.redirect("/auth/login");
    }

    try {
        const verified = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(verified.userId).select('-password');

        if (!user) {
            console.log("User not found");
            return res.redirect("/auth/login");
        }

        req.user = user; // Attach user info to request
        next();
    } catch (error) {
        console.log("Invalid token");
        res.redirect("/auth/login");
    }
}
module.exports = verifyToken;