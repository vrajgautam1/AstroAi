//emailService.js

import nodemailer from 'nodemailer';
import 'dotenv/config';

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT, 10),
    secure: false, // use false for STARTTLS; true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

export async function sendVerificationEmail(email, token) {
    const verificationUrl = `http://localhost:3000/auth/verify?token=${token}`;

    await transporter.sendMail({
        from: '"AstroAI" <' + process.env.SMTP_USER + '>', // sender address
        to: email, // list of receivers
        subject: "Verify Your Email - AstroAI", // Subject line
        text: `Click this link to verify your email:\n${verificationUrl}`, // plain text body
    });
}
