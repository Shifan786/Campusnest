const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a test account if using ethereal or use actual SMTP
    let transporter;
    
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        transporter = nodemailer.createTransport({
            service: 'gmail', // or your email service
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Fallback to ethereal email for testing if no credentials provided
        const testAccount = await nodemailer.createTestAccount();
        transporter = nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }

    const mailOptions = {
        from: '"CampusNest Admin" <noreply@campusnest.com>',
        to: options.email,
        subject: options.subject,
        html: options.html
    };

    const info = await transporter.sendMail(mailOptions);
    
    // Log preview URL if using ethereal email
    if (!process.env.EMAIL_USER) {
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    }
};

module.exports = sendEmail;
