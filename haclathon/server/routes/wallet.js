// Module: walletRoutes | Responsibility: Expose protected wallet and session management routes.
const express = require('express');
const { z } = require('zod');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/authMiddleware');
const {
  getBalance,
  sendMoney,
  getTransactions,
  verifyPin,
  toggleSecurityLock,
  freezeAccountSelf,
  getSessions,
  removeSession,
  downloadReceipt
} = require('../controllers/walletController');

const router = express.Router();

const verifyPinSchema = z.object({
  pin: z.string().regex(/^\d{4}$/)
});

const sendMoneySchema = z.object({
  receiverEmail: z.string().email(),
  amount: z.number().positive(),
  note: z.string().max(240).optional(),
  pinToken: z.string().min(20)
});

const securityLockSchema = z.object({
  enabled: z.boolean(),
  password: z.string().min(8).optional()
});

const freezeAccountSchema = z.object({
  reason: z.string().max(200).optional()
});

router.get('/balance', requireAuth, getBalance);
router.post('/verify-pin', requireAuth, validateRequest(verifyPinSchema), verifyPin);
router.post('/send', requireAuth, validateRequest(sendMoneySchema), sendMoney);
router.get('/transactions', requireAuth, getTransactions);
router.post('/security-lock', requireAuth, validateRequest(securityLockSchema), toggleSecurityLock);
router.post('/freeze-account', requireAuth, validateRequest(freezeAccountSchema), freezeAccountSelf);
router.get('/sessions', requireAuth, getSessions);
router.delete('/sessions/:id', requireAuth, removeSession);
router.get('/receipt/:transactionId', requireAuth, downloadReceipt);

module.exports = router;
