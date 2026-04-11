// Module: sessionService | Responsibility: Create and analyze user sessions for device anomaly detection.
const Session = require('../models/Session');
const User = require('../models/User');
const { sendEmail, emailTemplates } = require('./notificationService');

const parseUserAgent = (ua = '') => {
  const agent = ua.toLowerCase();
  const browser = agent.includes('chrome')
    ? 'Chrome'
    : agent.includes('firefox')
      ? 'Firefox'
      : agent.includes('safari')
        ? 'Safari'
        : 'Unknown Browser';

  const device = agent.includes('mobile') ? 'Mobile' : 'Desktop';
  return { device, browser };
};

const createSession = async (userId, req) => {
  const ua = req.headers['user-agent'] || '';
  const { device, browser } = parseUserAgent(ua);
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';

  const session = await Session.create({
    user_id: userId,
    device,
    browser,
    ip_address: Array.isArray(ip) ? ip[0] : String(ip).split(',')[0].trim(),
    location: 'Unknown',
    login_time: new Date(),
    last_active: new Date(),
    is_active: true
  });

  return session;
};

const detectNewDevice = async (userId, currentDevice) => {
  const existing = await Session.findOne({ user_id: userId, device: currentDevice });
  return !existing;
};

const notifyIfNewDevice = async (userId, req) => {
  const ua = req.headers['user-agent'] || '';
  const { device, browser } = parseUserAgent(ua);
  const isNew = await detectNewDevice(userId, device);

  if (!isNew) {
    return;
  }

  const user = await User.findById(userId);
  if (!user) {
    return;
  }

  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress || 'Unknown';
  const safeIp = Array.isArray(ip) ? ip[0] : String(ip).split(',')[0].trim();

  await sendEmail(
    decrypt(user.email_encrypted),
    'Suspicious Login Alert',
    emailTemplates.new_device_login({ device, browser, ip: safeIp })
  );
};

module.exports = {
  createSession,
  detectNewDevice,
  notifyIfNewDevice,
  parseUserAgent
};
