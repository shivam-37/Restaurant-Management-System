require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./src/models/User');

async function testFlow() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const email = 'test_flow@example.com';
        const password = 'testpassword123';

        // 1. Delete if exists
        await User.deleteOne({ email });

        // 2. Create user (simulates register)
        const user = await User.create({
            name: 'Test Flow',
            email: email,
            password: password,
            role: 'user'
        });
        console.log('User created');

        // 3. Find user (simulates login check)
        const foundUser = await User.findOne({ email: email.toLowerCase() });
        if (!foundUser) throw new Error('User not found after creation');

        // 4. Match password
        const isMatch = await foundUser.matchPassword(password);
        console.log('Password match results:', isMatch);

        if (isMatch) {
            console.log('SUCCESS: Flow is working correctly in script.');
        } else {
            console.error('FAILURE: Password did not match even after fresh creation.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Flow Error:', error);
        process.exit(1);
    }
}

testFlow();
