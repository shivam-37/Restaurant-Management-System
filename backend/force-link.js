const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

async function run() {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/restaurant-mgmt');
        console.log('Connected to DB');

        const User = mongoose.model('User', new mongoose.Schema({}, { strict: false }));
        const Restaurant = mongoose.model('Restaurant', new mongoose.Schema({}, { strict: false }));

        const owner = await User.findOne({ email: 'abc@gmail.com' });
        if (!owner) {
            console.log('Owner not found');
            process.exit(1);
        }

        const restaurant = await Restaurant.findOne({ name: 'Chamn' });
        if (!restaurant) {
            console.log('Restaurant Chamn not found');
            process.exit(1);
        }

        console.log(`Force linking User ${owner._id} to Restaurant ${restaurant._id}`);

        await User.updateOne({ _id: owner._id }, { $set: { restaurant: restaurant._id } });
        await Restaurant.updateMany({ owner: { $exists: false } }, { $set: { owner: owner._id } });
        await Restaurant.updateOne({ _id: restaurant._id }, { $set: { owner: owner._id } });

        console.log('Force linkage complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
