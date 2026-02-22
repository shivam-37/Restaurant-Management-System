require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testPassword() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'admin@example.com';
        const password = 'password123'; // The known demo password

        const user = await User.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            console.log('User not found');
            process.exit(1);
        }

        const isMatch = await user.matchPassword(password);
        console.log(`Password match for ${email}:`, isMatch);

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

testPassword();
