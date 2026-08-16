const cron = require('node-cron');
const User = require('../models/User');
const Order = require('../models/Order');
const sendEmail = require('./emailService');

const startMarketingCron = () => {
    // Run every day at 10:00 AM
    cron.schedule('0 10 * * *', async () => {
        console.log('--- Running Daily CRM Marketing Check ---');
        try {
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

            // 1. Find users who HAVE ordered in the last 30 days
            const recentOrders = await Order.find({ createdAt: { $gte: thirtyDaysAgo } }).select('user');
            const recentUserIds = recentOrders.map(order => order.user.toString());

            // 2. Find users who have NOT ordered in the last 30 days, are regular users, and have emails
            const dormantUsers = await User.find({
                _id: { $nin: recentUserIds },
                role: 'user',
                email: { $exists: true, $ne: null }
            });

            console.log(`Found ${dormantUsers.length} dormant users to re-engage.`);

            // 3. Send "We Miss You" emails
            for (const user of dormantUsers) {
                // Check user.notificationPrefs.marketing if that field exists
                if (user.notificationPrefs && user.notificationPrefs.marketing === false) {
                    continue;
                }

                await sendEmail({
                    email: user.email,
                    subject: 'We Miss You at DineFlow! 🍕',
                    message: `Hi ${user.name},\n\nIt's been a while since your last order! We miss you. Use code MISSYOU10 for 10% off your next order.\n\nCheers,\nThe DineFlow Team`
                });
            }
        } catch (error) {
            console.error('Error running CRM Marketing Cron:', error);
        }
    });
    
    console.log('✅ CRM Marketing Cron Job scheduled (Runs daily at 10:00 AM)');
};

module.exports = { startMarketingCron };
