require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function debugLogin() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const users = await User.find({});
        console.log('\nExisting Users in DB:');
        users.forEach(u => {
            console.log(`- Email: "${u.email}", Name: "${u.name}", Role: "${u.role}"`);
        });

        // Test login logic for a specific email
        const testEmail = 'admin@example.com';
        const normalizedEmail = testEmail.toLowerCase().trim();
        const user = await User.findOne({ email: normalizedEmail });

        if (user) {
            console.log(`\nFound user for "${testEmail}":`, user.email);
            // We can't easily check password here without the actual plain text, 
            // but we can verify if the query works.
        } else {
            console.log(`\nUser NOT found for "${testEmail}" (normalized: "${normalizedEmail}")`);
        }

        process.exit(0);
    } catch (error) {
        console.error('Debug Error:', error);
        process.exit(1);
    }
}

debugLogin();
