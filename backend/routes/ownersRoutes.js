const express = require('express');
const { requestVerification, getMyVerificationStatus } = require('../controllers/ownerController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/request-verification', authMiddleware, allowRoles('OWNER'), requestVerification);
router.get('/my-verification', authMiddleware, allowRoles('OWNER'), getMyVerificationStatus);

module.exports = router;
