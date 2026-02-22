require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function resetPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'admin@example.com';
        const newPassword = 'password123';

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        user.password = newPassword;
        await user.save();
        console.log(`Password reset successfully for ${email}`);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

resetPassword();
