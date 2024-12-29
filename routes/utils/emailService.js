const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.zoho.com',
    port: 587,
    secure: false, 
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false, // Allow self-signed certificates
    },
});


/**
 * Send an email.
 * @param {string} to 
 * @param {string} subject 
 * @param {string} text 
 * @param {string} html 
 */
const sendEmail = async (to, subject, text, html) => {
    try {
        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to,
            subject,
            text,
            html,
        });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Error sending email: ${error.message}`);
        throw new Error('Failed to send email');
    }
};

module.exports = sendEmail;
