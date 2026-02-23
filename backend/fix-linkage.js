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

        const owner = await User.findOne({ email: 'abc@gmail.com' });
        if (!owner) {
            console.log('Owner abc@gmail.com not found');
            process.exit(1);
        }

        const restaurants = await Restaurant.find({ owner: { $exists: false } });
        if (restaurants.length === 0) {
            console.log('No unowned restaurants found');
        } else {
            for (const r of restaurants) {
                console.log(`Linking restaurant ${r.name} to owner ${owner.name}`);
                r.owner = owner._id;
                await r.save();

                if (!owner.restaurant) {
                    owner.restaurant = r._id;
                    await owner.save();
                    console.log(`Updated owner's primary restaurant link to ${r.name}`);
                }
            }
        }

        console.log('Linkage fix complete');
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

run();
