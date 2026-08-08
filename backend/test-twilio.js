require('dotenv').config({ path: __dirname + '/.env' });
const twilio = require('twilio');

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioPhoneNumber = process.env.TWILIO_PHONE_NUMBER;

console.log('SID:', accountSid);
console.log('Phone:', twilioPhoneNumber);

const client = twilio(accountSid, authToken);

async function testSMS() {
    try {
        console.log('Sending test SMS...');
        const message = await client.messages.create({
            body: 'Test SMS from DineFlow',
            from: twilioPhoneNumber,
            to: '+919999999999' // I will replace this with whatever the user is logging in with if I knew, but let's just see if it auths correctly or complains about unverified number. Wait, better yet, what is the user's phone number? Let's check the database!
        });
        console.log('Success!', message.sid);
    } catch (error) {
        console.error('Twilio Error:', error.message);
    }
}
testSMS();
