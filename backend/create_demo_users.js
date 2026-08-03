const mongoose = require('mongoose');
const dotenv = require('dotenv');
const connectDB = require('./src/config/db');
const User = require('./src/models/User');

dotenv.config();

const createDemoUsers = async () => {
    try {
        await connectDB();
        
        const demoUsers = [
            {
                name: 'Demo User',
                email: 'demo_user@example.com',
                password: 'password123',
                role: 'user',
                isEmailVerified: true
            },
            {
                name: 'Demo Admin',
                email: 'demo_admin@example.com',
                password: 'password123',
                role: 'admin',
                isEmailVerified: true
            },
            {
                name: 'Demo Owner',
                email: 'demo_owner@example.com',
                password: 'password123',
                role: 'owner',
                isEmailVerified: true
            }
        ];

        for (const userData of demoUsers) {
            // Check if user exists
            let user = await User.findOne({ email: userData.email });
            if (user) {
                console.log(`User ${userData.email} already exists.`);
                // Reset password just in case
                user.password = userData.password;
                user.role = userData.role;
                await user.save();
                console.log(`Updated ${userData.email}.`);
            } else {
                user = new User(userData);
                await user.save();
                console.log(`Created user ${userData.email}.`);
            }
        }
        
        console.log('Demo users setup complete.');
        process.exit();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

createDemoUsers();
