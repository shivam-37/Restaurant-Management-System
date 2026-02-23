const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const User = require('./src/models/User');
const Restaurant = require('./src/models/Restaurant');

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant-mgmt');
        console.log('Connected to DB');

        const owners = await User.find({ role: 'owner' });
        console.log('\n--- All Owners ---');
        console.log(JSON.stringify(owners, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
