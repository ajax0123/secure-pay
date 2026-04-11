import express from 'express';
import { register, login, getMe } from '../controllers/authController.ts';
import { getBalance, addFunds } from '../controllers/walletController.ts';
import { sendMoney, getHistory } from '../controllers/transactionController.ts';
import { protect, authorize } from '../middleware/authMiddleware.ts';

const router = express.Router();

// Auth
router.post('/auth/register', register);
router.post('/auth/login', login);
router.get('/auth/me', protect, getMe);

// Wallet
router.get('/wallet/balance', protect, getBalance);
router.post('/wallet/add-funds', protect, addFunds);

// Transactions
router.post('/transactions/send', protect, sendMoney);
router.get('/transactions/history', protect, getHistory);

// Admin (Mocked for demo)
router.get('/admin/fraud-logs', protect, authorize('admin'), async (req, res) => {
  // Implementation for fraud logs
  res.json({ success: true, data: [] });
});

export default router;
