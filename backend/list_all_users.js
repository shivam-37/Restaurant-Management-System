require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function listUsers() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        console.log('USERS_LIST_START');
        users.forEach(u => {
            console.log(`EMAIL: ${u.email} | NAME: ${u.name} | ROLE: ${u.role}`);
        });
        console.log('USERS_LIST_END');
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

listUsers();
