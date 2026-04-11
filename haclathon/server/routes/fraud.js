// Module: fraudRoutes | Responsibility: Define user fraud reporting and fraud-log retrieval routes.
const express = require('express');
const { z } = require('zod');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/authMiddleware');
const { reportFraud, getFraudLogs } = require('../controllers/fraudController');

const router = express.Router();

const reportFraudSchema = z.object({
  transactionId: z.string().min(24),
  reason: z.string().min(5).max(500)
});

router.post('/report', requireAuth, validateRequest(reportFraudSchema), reportFraud);
router.get('/logs', requireAuth, getFraudLogs);

module.exports = router;
