// Module: encryption | Responsibility: Provide AES encryption and identity hashing helpers for sensitive wallet data.
const crypto = require('crypto');
const env = require('../config/env');

const key = Buffer.from(env.aesSecretKey, 'hex');

const encrypt = (text) => {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  const encrypted = Buffer.concat([cipher.update(String(text), 'utf8'), cipher.final()]);
  const authTag = cipher.getAuthTag();
  // LAYER 2: AES-256-GCM ensures balance is never stored in plaintext
  return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted.toString('hex')}`;
};

const decrypt = (ciphertext) => {
  const [ivHex, authTagHex, encryptedHex] = String(ciphertext).split(':');
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(ivHex, 'hex'));
  decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, 'hex')),
    decipher.final()
  ]);
  return decrypted.toString('utf8');
};

const identityToHash = (rawIdentity) => {
  // LAYER 6: Raw identity never persists - only its SHA-256 hash
  return crypto.createHash('sha256').update(String(rawIdentity)).digest('hex');
};

module.exports = {
  encrypt,
  decrypt,
  identityToHash
};
