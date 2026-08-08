require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkUsers() {
    try {
        await mongoose.connect(process.env.DATABASE_URL);
        console.log('Connected to DB');
        const users = await User.find({}).select('name email phone role');
        console.log('Users in DB:');
        users.forEach(u => console.log(`- ${u.name} | ${u.email} | ${u.phone} | ${u.role}`));
        mongoose.disconnect();
    } catch (err) {
        console.error(err);
    }
}
checkUsers();
