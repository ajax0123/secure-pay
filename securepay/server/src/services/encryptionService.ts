import crypto from 'crypto';
import { env } from '../config/env.ts';

const ENCRYPTION_KEY = env.encryptionKey;
const HMAC_SECRET = env.hmacSecret;
const GCM_IV_LENGTH = 12;

export const encrypt = (text: string): string => {
  const iv = crypto.randomBytes(GCM_IV_LENGTH);
  const cipher = crypto.createCipheriv(env.encryption.algorithm, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  const authTag = cipher.getAuthTag();
  return `gcm:${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
};

export const decrypt = (text: string): string => {
  const textParts = text.split(':');

  if (textParts[0] === 'gcm' && textParts.length === 4) {
    const iv = Buffer.from(textParts[1], 'hex');
    const authTag = Buffer.from(textParts[2], 'hex');
    const encryptedText = Buffer.from(textParts[3], 'hex');
    const decipher = crypto.createDecipheriv(env.encryption.algorithm, ENCRYPTION_KEY, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  // Backward compatibility for previously stored CBC payloads.
  if (textParts.length === 2) {
    const iv = Buffer.from(textParts[0], 'hex');
    const encryptedText = Buffer.from(textParts[1], 'hex');
    const decipher = crypto.createDecipheriv('aes-256-cbc', ENCRYPTION_KEY, iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  }

  throw new Error('Unsupported encrypted payload format.');
};

export const signTransaction = (data: any): string => {
  return crypto.createHmac('sha256', HMAC_SECRET)
    .update(JSON.stringify(data))
    .digest('hex');
};

export const hashKYC = (id: string, salt: string): string => {
  return crypto.createHash('sha256')
    .update(id + salt)
    .digest('hex');
};
