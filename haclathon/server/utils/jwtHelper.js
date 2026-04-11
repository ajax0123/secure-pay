// Module: jwtHelper | Responsibility: Issue and verify access and short-lived transaction authorization tokens.
const jwt = require('jsonwebtoken');
const env = require('../config/env');

const signAuthToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: env.jwtExpiresIn });
const verifyAuthToken = (token) => jwt.verify(token, env.jwtSecret);

const signPinToken = (payload) => jwt.sign(payload, env.jwtSecret, { expiresIn: '5m' });
const verifyPinToken = (token) => jwt.verify(token, env.jwtSecret);

module.exports = {
  signAuthToken,
  verifyAuthToken,
  signPinToken,
  verifyPinToken
};
