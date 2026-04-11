// Module: authRoutes | Responsibility: Define authentication and KYC API routes with validation and login throttling.
const express = require('express');
const { z } = require('zod');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/authMiddleware');
const { loginLimiter } = require('../middleware/rateLimiter');
const { signup, login, kyc, logout } = require('../controllers/authController');

const router = express.Router();

const signupSchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  transactionPin: z.string().regex(/^\d{4}$/)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

const kycSchema = z.object({
  identityNumber: z.string().min(4).max(64)
});

const logoutSchema = z.object({
  sessionId: z.string().optional()
});

router.post('/signup', validateRequest(signupSchema), signup);
router.post('/login', loginLimiter, validateRequest(loginSchema), login);
router.post('/kyc', requireAuth, validateRequest(kycSchema), kyc);
router.post('/logout', requireAuth, validateRequest(logoutSchema), logout);

module.exports = router;
