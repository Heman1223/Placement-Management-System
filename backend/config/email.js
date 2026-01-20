const nodemailer = require('nodemailer');

// Create transporter
const createTransporter = () => {
    // For development, use Ethereal (fake SMTP)
    // For production, use real SMTP (Gmail, SendGrid, etc.)
    
    if (process.env.NODE_ENV === 'production' && process.env.EMAIL_HOST) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT || 587,
            secure: process.env.EMAIL_SECURE === 'true',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });
    }

    // Development: Log emails to console
    return nodemailer.createTransport({
        host: 'smtp.ethereal.email',
        port: 587,
        auth: {
            user: process.env.EMAIL_USER || 'test@ethereal.email',
            pass: process.env.EMAIL_PASSWORD || 'test'
        }
    });
};

const transporter = createTransporter();

// Send email function
const sendEmail = async ({ to, subject, html, text }) => {
    try {
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Placement System" <noreply@placement.com>',
            to,
            subject,
            html,
            text: text || html.replace(/<[^>]*>/g, '') // Strip HTML for text version
        };

        const info = await transporter.sendMail(mailOptions);

        if (process.env.NODE_ENV !== 'production') {
            console.log('Email sent:', nodemailer.getTestMessageUrl(info));
        }

        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Email send error:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendEmail,
    transporter
};
