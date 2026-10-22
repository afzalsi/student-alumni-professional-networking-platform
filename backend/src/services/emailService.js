const config = require('../config/env');
const nodemailer = require('nodemailer');

let transporter = null;

if (config.email.isConfigured) {
  transporter = nodemailer.createTransport({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465,
    auth: {
      user: config.email.user,
      pass: config.email.password
    }
  });
}

const sendEmail = async ({ to, subject, html, text }) => {
  if (transporter) {
    try {
      const info = await transporter.sendMail({
        from: config.email.from,
        to,
        subject,
        text,
        html
      });
      console.log(`[Email Sent] Message ID: ${info.messageId} to ${to}`);
      return info;
    } catch (error) {
      console.error(`[Email Error] Failed to send to ${to}:`, error.message);
    }
  } else {
    // Elegant fallback logger in dev/mock mode
    console.log(`[Mock Email Service]: To: ${to} | Subject: ${subject}`);
    return { mock: true, delivered: true };
  }
};

module.exports = { sendEmail };
