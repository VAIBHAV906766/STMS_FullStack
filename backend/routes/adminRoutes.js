const express = require('express');
const {
  getVerificationRequests,
  verifyOwner,
  getSupportQueries,
  updateSupportQueryStatus
} = require('../controllers/adminController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/verification-requests', authMiddleware, allowRoles('ADMIN'), getVerificationRequests);
router.patch('/verify-owner/:ownerId', authMiddleware, allowRoles('ADMIN'), verifyOwner);
router.get('/support-queries', authMiddleware, allowRoles('ADMIN'), getSupportQueries);
router.patch('/support/:id/status', authMiddleware, allowRoles('ADMIN'), updateSupportQueryStatus);

module.exports = router;
