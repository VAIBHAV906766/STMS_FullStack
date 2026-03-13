const express = require('express');
const { payInvoice } = require('../controllers/paymentController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/pay', authMiddleware, allowRoles('CUSTOMER'), payInvoice);

module.exports = router;
