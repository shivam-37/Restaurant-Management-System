const sendSms = async (options) => {
    let { phone, message } = options;
    if (!phone) return false;
    
    // Default to simulation if Twilio SID is missing or placeholder
    if (!process.env.TWILIO_ACCOUNT_SID || process.env.TWILIO_ACCOUNT_SID === 'test') {
        console.log(`\n========================================`);
        console.log(`[SIMULATED SMS] To: ${phone}`);
        console.log(`[SIMULATED SMS] Content: ${message}`);
        console.log(`========================================\n`);
        return true;
    }

    try {
        // Strip spaces, dashes, and parentheses to ensure clean E.164 format
        let cleanPhone = phone.replace(/[\s\-\(\)]/g, '').trim();
        if (!cleanPhone.startsWith('+')) {
            cleanPhone = `+${cleanPhone.replace(/\D/g, '')}`;
        }

        const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID.trim(), process.env.TWILIO_AUTH_TOKEN.trim());
        await client.messages.create({
            body: message,
            from: process.env.TWILIO_PHONE_NUMBER.trim(),
            to: cleanPhone
        });
        console.log(`\n========================================`);
        console.log(`[SMS SENT SUCCESS] To: ${cleanPhone}`);
        console.log(`========================================\n`);
        return true;
    } catch (error) {
        console.error('\n[SMS SENDING FAILED]:', error.message);
        if (error.code === 21608) {
            console.error('👉 TIP: Twilio Trial accounts can only send SMS to numbers verified in Twilio Console.');
            console.error('   Verify this phone number at: https://console.twilio.com/us1/develop/phone-numbers/manage/verified');
        }
        console.log(`[FALLBACK SMS LOG] To: ${phone} | Content: ${message}\n`);
        return false;
    }
};

module.exports = sendSms;
