// Module: adminRoutes | Responsibility: Define privileged administrative routes for fraud and account controls.
const express = require('express');
const { z } = require('zod');
const validateRequest = require('../middleware/validateRequest');
const { requireAuth, requireAdmin } = require('../middleware/authMiddleware');
const {
  getFraudReports,
  freezeAccount,
  unfreezeAccount,
  closeCase,
  getUsers,
  getCaseTimeline
} = require('../controllers/adminController');

const router = express.Router();

const freezeSchema = z.object({
  userId: z.string().min(24),
  reason: z.string().min(3).max(200).optional()
});

const unfreezeSchema = z.object({
  userId: z.string().min(24)
});

const closeCaseSchema = z.object({
  disputeCaseId: z.string().min(24),
  adminNotes: z.string().max(1000).optional(),
  status: z.enum(['resolved', 'closed', 'under_review']).optional()
});

router.get('/fraud-reports', requireAuth, requireAdmin, getFraudReports);
router.post('/freeze-account', requireAuth, requireAdmin, validateRequest(freezeSchema), freezeAccount);
router.post('/unfreeze-account', requireAuth, requireAdmin, validateRequest(unfreezeSchema), unfreezeAccount);
router.post('/close-case', requireAuth, requireAdmin, validateRequest(closeCaseSchema), closeCase);
router.get('/users', requireAuth, requireAdmin, getUsers);
router.get('/case-timeline/:fraudReportId', requireAuth, requireAdmin, getCaseTimeline);

module.exports = router;
