const User = require('../models/user');
const signToken = require('../utils/jwt');

const path = require('path');

const authController = {
    async register(req, res) {
        try {
            const { firstName, lastName, email, password } = req.body;

            // Check if all details were provided
            if (!firstName || !lastName || !email || !password) {
                console.log('Please provide all details');
                return res.status(400).json({ success: false, message: 'Please provide all details' });
            }

            // Check if email already exist
            const emailExist = await User.findOne({ email });
            console.log(emailExist);

            if (emailExist) {
                console.log('Email already exist');
                return res.status(400).json({ success: false, message: 'Email already exist' });
            }

            const user = await User.create({ firstName, lastName, email, password });
            console.log(`User "${user.firstName} ${user.lastName}" registered.`);
            console.log(user);

            // const token = signToken(user._id);
            return res.status(201).json({ success: true, message: 'User registered successfully.', user: { username: user.username } });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    async login(req, res) {
        try {
            const { email, password } = req.body;

            // Check if all details were provided
            if (!email || !password) {
                console.log('Please provide all details');
                return res.status(400).json({ success: false, message: 'Please provide all details' });
            }

            const user = await User.findOne({ email, password });
            if (!user) {
                console.log('Invalid credentials');
                return res.status(400).json({ success: false, message: 'Invalid credentials' });
            }

            const token = signToken({ userId: user._id });

            res.cookie('barren-token', token, {
                httpOnly: true,
                secure: true,
                sameSite: 'strict',
                maxAge: 24 * 60 * 60 * 1000 // 1 day
            });

            console.log(`User "${user.firstName} ${user.lastName}" logged in.`);
            console.log(user);
            return res.status(201).json({ success: true, message: 'User logged in successfully.', user: { username: user.username }, token });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },

    async logout(req, res) {
        try {
            console.log(`User "${req.user.username}" logged out.`);
            return res.status(201).json({ success: true, message: 'User logged out successfully.' });
        } catch (error) {
            console.log(error);
            return res.status(500).json({ success: false, message: 'Internal server error' });
        }
    }
};

module.exports = authController;