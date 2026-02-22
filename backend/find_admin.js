const mongoose = require('mongoose');
const User = require('./src/models/User');
require('dotenv').config();

const findAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const admin = await User.findOne({ role: 'admin' });
        if (admin) {
            console.log('ID:', admin._id);
            console.log('Email:', admin.email);
        } else {
            console.log('No admin found');
        }
        await mongoose.connection.close();
    } catch (err) {
        console.error(err);
    }
};

findAdmin();
