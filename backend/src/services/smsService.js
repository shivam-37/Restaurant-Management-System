const sendSms = async (options) => {
    const { phone, message } = options;
    
    // Default to simulation if Twilio/other provider isn't configured
    if (!process.env.TWILIO_ACCOUNT_SID) {
        console.log(`[SIMULATED SMS] To: ${phone}`);
        console.log(`[SIMULATED SMS] Content: ${message}`);
        return true;
    }

    // Add actual Twilio/Firebase backend logic here if needed in the future
    // Example:
    
    const client = require('twilio')(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
    await client.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to: phone
    });
    
   
    return true;
};

module.exports = sendSms;
