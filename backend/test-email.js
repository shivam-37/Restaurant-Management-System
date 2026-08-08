require('dotenv').config({ path: __dirname + '/.env' });
const nodemailer = require('nodemailer');

async function testEmail() {
    const mailHost = process.env.MAIL_HOST;
    const mailUser = process.env.MAIL_USER;
    const port = parseInt(process.env.MAIL_PORT) || 587;
    
    console.log('Host:', mailHost);
    console.log('User:', mailUser);
    
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

    try {
        console.log('Sending test email...');
        const info = await transporter.sendMail({
            from: `"${process.env.FROM_NAME || 'DineFlow'}" <${mailUser}>`,
            to: mailUser, // send to self to test
            subject: 'Test Email',
            text: 'This is a test email from DineFlow',
        });
        console.log('Success! MessageID:', info.messageId);
    } catch (error) {
        console.error('Nodemailer Error:', error.message);
    }
}
testEmail();
