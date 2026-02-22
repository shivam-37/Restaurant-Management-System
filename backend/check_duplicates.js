require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function checkDuplicates() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const users = await User.find({});
        const emails = users.map(u => u.email.toLowerCase());
        const duplicates = emails.filter((email, index) => emails.indexOf(email) !== index);

        console.log('Total Users:', users.length);
        if (duplicates.length > 0) {
            console.log('Duplicate Emails Found:', duplicates);
        } else {
            console.log('No duplicate emails found.');
        }
        process.exit(0);
    } catch (e) {
        console.error(e);
        process.exit(1);
    }
}
checkDuplicates();
