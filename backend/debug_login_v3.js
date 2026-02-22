require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function debugLogin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log('---START_USER_DATA---');
        users.forEach(u => {
            console.log(JSON.stringify({
                email: u.email,
                name: u.name,
                role: u.role,
                hasPassword: !!u.password,
                id: u._id
            }));
        });
        console.log('---END_USER_DATA---');
        process.exit(0);
    } catch (error) {
        console.error('Debug Error:', error);
        process.exit(1);
    }
}

debugLogin();
