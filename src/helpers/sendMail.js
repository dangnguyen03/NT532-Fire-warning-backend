require('dotenv').config();

const nodemailer = require('nodemailer');

const sendMail = async ({email, subject, html}) =>
{
    const transporter = nodemailer.createTransport({
        host: "smtp.gmail.com",
        service: 'Gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        }
    });
    const message = {
        from: 'Nhom 2 IoTs',
        to: email,
        subject: subject,
        html: html
    }
    const result = await transporter.sendMail(message)
    return result;
}
module.exports = sendMail;