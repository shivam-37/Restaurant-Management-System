const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const mailHost = process.env.MAIL_HOST;
    const mailUser = process.env.MAIL_USER;
    
    const isSimulation = !mailHost || mailHost === 'test' || process.env.MAIL_PASS === 'testpass';

    if (isSimulation) {
        console.log(`\n========================================`);
        console.log(`[SIMULATED EMAIL] To: ${options.email}`);
        console.log(`[SIMULATED EMAIL] Subject: ${options.subject}`);
        console.log(`[SIMULATED EMAIL] Content: ${options.message}`);
        console.log(`========================================\n`);
        return true;
    }

    try {
        const port = parseInt(process.env.MAIL_PORT) || 587;
        const transporter = nodemailer.createTransport({
            host: mailHost,
            port: port,
            secure: port === 465,
            auth: {
                user: mailUser,
                pass: process.env.MAIL_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const message = {
            from: `"${process.env.FROM_NAME || 'DineFlow'}" <${mailUser}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
        };

        const info = await transporter.sendMail(message);
        console.log(`\n========================================`);
        console.log(`[EMAIL SENT SUCCESS] To: ${options.email} | MessageID: ${info.messageId}`);
        console.log(`========================================\n`);
        return true;
    } catch (error) {
        console.error('\n[EMAIL SENDING FAILED]:', error.message);
        console.log(`[FALLBACK EMAIL LOG] To: ${options.email} | Content: ${options.message}\n`);
        return false;
    }
};

module.exports = sendEmail;
