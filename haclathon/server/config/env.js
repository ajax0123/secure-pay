// Module: env | Responsibility: Load and validate runtime environment variables.
const dotenv = require('dotenv');

const path = require('path');
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const required = [
  'PORT',
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES_IN',
  'AES_SECRET_KEY',
  'EMAIL_USER',
  'EMAIL_PASS',
  'ADMIN_EMAIL',
  'CLIENT_URL'
];

required.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required env variable: ${key}`);
  }
});

if (!/^[a-fA-F0-9]{64}$/.test(process.env.AES_SECRET_KEY)) {
  throw new Error('AES_SECRET_KEY must be a 32-byte hex string (64 hex chars).');
}

module.exports = {
  port: Number(process.env.PORT) || 5000,
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN,
  aesSecretKey: process.env.AES_SECRET_KEY,
  emailUser: process.env.EMAIL_USER,
  emailPass: process.env.EMAIL_PASS,
  adminEmail: process.env.ADMIN_EMAIL,
  clientUrl: process.env.CLIENT_URL
};
