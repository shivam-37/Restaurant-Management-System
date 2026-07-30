const sendSms = async (options) => {
    const { phone, message } = options;
    
    // Default to simulation if Twilio SID is missing or placeholder
    if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'test') {
        console.log(`\n========================================`);
        console.log(`[SIMULATED SMS] To: ${phone}`);
        console.log(`[SIMULATED SMS] Content: ${message}`);
        console.log(`========================================\n`);
        return true;
    }

    try {
        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER,
            to: phone
        });
        console.log(`\n========================================`);
        console.log(`[SMS SENT SUCCESS] To: ${phone}`);
        console.log(`========================================\n`);
        return true;
    } catch (error) {
        console.error('\n[SMS SENDING FAILED]:', error.message);
        console.log(`[FALLBACK SMS LOG] To: ${phone} | Content: ${message}\n`);
        return false;
    }
};

module.exports = sendSms;
