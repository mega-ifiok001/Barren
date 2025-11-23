const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        // Use MONGODB_URI for consistency (supports both local and Atlas)
        const mongoURI = process.env.MONGODB_URI || process.env.MONGO_URI;

        if (!mongoURI) {
            throw new Error('MongoDB URI is not defined in environment variables');
        }

        const conn = await mongoose.connect(mongoURI, {
            // These options are recommended for MongoDB Atlas
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

        console.log(`MongoDB Connected: ${conn.connection.host}`);
        console.log(`Database: ${conn.connection.name}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;