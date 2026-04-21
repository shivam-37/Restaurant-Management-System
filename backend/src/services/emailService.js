const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Check if we have real SMTP credentials in .env, otherwise simulate
    const mailHost = process.env.MAIL_HOST;
    const mailUser = process.env.MAIL_USER;
    
    // Simulate if there's no auth info or if it's explicitly set to test
    const isSimulation = !mailHost || mailHost === 'test' || process.env.MAIL_PASS === 'testpass';

    if (isSimulation) {
        console.log(`[SIMULATED EMAIL] To: ${options.email}, Subject: ${options.subject}`);
        console.log(`[SIMULATED EMAIL] Content: ${options.message}`);
        return true;
    }

    try {
        const port = parseInt(process.env.MAIL_PORT) || 587;
        const transporter = nodemailer.createTransport({
            host: mailHost,
            port: port,
            auth: {
                user: mailUser,
                pass: process.env.MAIL_PASS,
            },
        });

        const message = {
            from: `${process.env.FROM_NAME || 'Restaurant Admin'} <${process.env.FROM_EMAIL || 'noreply@example.com'}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        return true;
    } catch (error) {
        console.error('Email sending failed:', error.message);
        // Don't throw if we want the app to keep working in dev
        return false;
    }
};

module.exports = sendEmail;
