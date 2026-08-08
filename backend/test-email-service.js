require('dotenv').config({ path: __dirname + '/.env' });
const sendEmail = require('./src/services/emailService');

async function testEmail() {
    try {
        console.log('Calling sendEmail...');
        const success = await sendEmail({
            email: process.env.MAIL_USER,
            subject: 'Test Email Service',
            message: 'Testing if emailService.js works'
        });
        console.log('sendEmail returned:', success);
    } catch (err) {
        console.error('Error in test:', err);
    }
}
testEmail();
