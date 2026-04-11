// Module: notificationService | Responsibility: Send transactional and security email alerts to users.
const nodemailer = require('nodemailer');
const env = require('../config/env');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.emailUser,
    pass: env.emailPass
  }
});

const sendEmail = async (to, subject, body) => {
  await transporter.sendMail({
    from: env.emailUser,
    to,
    subject,
    text: body
  });
};

const emailTemplates = {
  send_money: ({ amount, receiver, time }) =>
    `You sent ₹${amount} to ${receiver} at ${time}. If this was not you, report fraud immediately.`,
  receive_money: ({ amount, sender, time }) =>
    `You received ₹${amount} from ${sender} at ${time}. If this was unexpected, review account activity now.`,
  fraud_report: ({ transactionId }) =>
    `Your fraud report for transaction ${transactionId} has been received and is under review.`,
  account_freeze: () =>
    'Your account has been frozen due to fraud investigation. Please contact support if this was unexpected.',
  new_device_login: ({ device, browser, ip }) =>
    `New device login detected: ${device} (${browser}) from IP ${ip}. If this was not you, secure your account immediately.`
};

module.exports = {
  sendEmail,
  emailTemplates
};
