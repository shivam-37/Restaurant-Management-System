const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URL || process.env.DATABASE_URL);
        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Automatically clean up any legacy null or empty string values in unique sparse fields and sync indexes
        try {
            const db = conn.connection.db;
            const usersCollection = db.collection('users');
            await usersCollection.updateMany(
                { $or: [{ email: null }, { email: '' }] },
                { $unset: { email: "" } }
            );
            await usersCollection.updateMany(
                { $or: [{ phone: null }, { phone: '' }] },
                { $unset: { phone: "" } }
            );
            await usersCollection.updateMany(
                { $or: [{ googleId: null }, { googleId: '' }] },
                { $unset: { googleId: "" } }
            );

            if (mongoose.models.User) {
                await mongoose.models.User.syncIndexes();
            } else {
                const User = require('../models/User');
                await User.syncIndexes();
            }
        } catch (idxErr) {
            console.error('Note: Index sync/cleanup warning:', idxErr.message);
        }
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;
