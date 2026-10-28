const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    const mailHost = process.env.MAIL_HOST;
    const mailUser = process.env.MAIL_USER ? process.env.MAIL_USER.trim() : '';
    const mailPass = process.env.MAIL_PASS ? process.env.MAIL_PASS.trim() : '';
    
    const isSimulation = !mailHost || mailHost === 'test' || mailPass === 'testpass';

    if (isSimulation) {
        console.log(`\n========================================`);
        console.log(`[SIMULATED EMAIL] To: ${options.email}`);
        console.log(`[SIMULATED EMAIL] Subject: ${options.subject}`);
        console.log(`[SIMULATED EMAIL] Content: ${options.message}`);
        console.log(`========================================\n`);
        return true;
    }

    try {
        const isGmail = mailHost === 'smtp.gmail.com' || (mailUser && mailUser.endsWith('@gmail.com'));
        
        let transporterConfig;
        if (isGmail) {
            // Gmail service automatically utilizes secure connection on port 465
            // which prevents connection timeout / port blocks on hosting providers like Render
            transporterConfig = {
                service: 'gmail',
                auth: {
                    user: mailUser,
                    pass: mailPass,
                }
            };
        } else {
            const port = parseInt(process.env.MAIL_PORT) || 465;
            transporterConfig = {
                host: mailHost,
                port: port,
                secure: port === 465,
                auth: {
                    user: mailUser,
                    pass: mailPass,
                },
                tls: {
                    rejectUnauthorized: false
                }
            };
        }

        const transporter = nodemailer.createTransport(transporterConfig);

        const message = {
            from: `"${process.env.FROM_NAME || 'DineFlow'}" <${mailUser}>`,
            to: options.email,
            subject: options.subject,
            text: options.message,
            html: options.html || `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #fed7aa; border-radius: 12px; background: #fffaf5;">
                    <h2 style="color: #ea580c; margin-top: 0;">DineFlow Verification</h2>
                    <p style="font-size: 16px; color: #334155;">${options.message.replace(/\n/g, '<br/>')}</p>
                    <p style="font-size: 12px; color: #94a3b8; margin-top: 24px;">If you did not request this verification code, please ignore this email.</p>
                </div>
            `
        };

        const info = await transporter.sendMail(message);
        console.log(`\n========================================`);
        console.log(`[EMAIL SENT SUCCESS] To: ${options.email} | MessageID: ${info.messageId}`);
        console.log(`========================================\n`);
        return true;
    } catch (error) {
        console.error('\n[EMAIL SENDING FAILED]:', error.message);
        if (error.code === 'EAUTH' || (error.message && error.message.includes('BadCredentials'))) {
            console.error('👉 TIP: Google rejected the App Password. Generate a new 16-character App Password at: https://myaccount.google.com/apppasswords and update MAIL_PASS.');
        }
        console.log(`[FALLBACK EMAIL LOG] To: ${options.email} | Content: ${options.message}\n`);
        return false;
    }
};

module.exports = sendEmail;
