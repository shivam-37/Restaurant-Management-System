require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function resetAllPasswords() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        const users = await User.find({});
        for (const user of users) {
            user.password = 'password123';
            await user.save();
        }
        console.log(`Successfully reset passwords for ${users.length} users to 'password123'.`);
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
resetAllPasswords();
