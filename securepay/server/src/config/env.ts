import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const requiredEnv = ['JWT_SECRET', 'ENCRYPTION_KEY', 'HMAC_SECRET'];

requiredEnv.forEach((key) => {
  if (!process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
});

const jwtSecret = process.env.JWT_SECRET as string;
const encryptionKeyRaw = process.env.ENCRYPTION_KEY as string;
const hmacSecret = process.env.HMAC_SECRET as string;

if (Buffer.from(encryptionKeyRaw, 'utf8').length !== 32) {
  throw new Error('ENCRYPTION_KEY must be exactly 32 bytes (UTF-8).');
}

const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

export const env = {
  mongoUri: process.env.MONGODB_URI || 'mongodb://localhost:27017/securepay',
  jwtSecret,
  hmacSecret,
  encryptionKey: Buffer.from(encryptionKeyRaw, 'utf8'),
  corsOrigins,
  encryption: {
    algorithm: 'aes-256-gcm' as const,
    keyDerivation: 'pbkdf2'
  },
  auth: {
    tokenExpiry: process.env.AUTH_TOKEN_EXPIRY || '24h'
  }
};
