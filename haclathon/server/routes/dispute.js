// Module: disputeRoutes | Responsibility: Define dispute creation and status routes linked to fraud reports.
const express = require('express');
const { z } = require('zod');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth } = require('../middleware/authMiddleware');
const { createDisputeCase, getDisputeStatus, getUserDisputes } = require('../controllers/fraudController');

const router = express.Router();

const createDisputeSchema = z.object({
  transactionId: z.string().min(24),
  fraudReportId: z.string().min(24),
  message: z.string().min(5).max(1000)
});

router.post('/create', requireAuth, validateRequest(createDisputeSchema), createDisputeCase);
router.get('/status/:id', requireAuth, getDisputeStatus);
router.get('/my', requireAuth, getUserDisputes);

module.exports = router;
