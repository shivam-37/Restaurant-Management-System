require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function setPassword() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        const user = await User.findOne({ email: 'shiwammaxx@gmail.com' });
        if (user) {
            user.password = 'password123';
            await user.save();
            console.log('Password updated successfully');
        } else {
            console.log('User not found');
        }
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
setPassword();
