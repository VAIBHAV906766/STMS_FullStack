const express = require('express');
const {
  generateInvoice,
  getMyInvoices,
  getOwnerInvoices
} = require('../controllers/invoiceController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/generate', authMiddleware, allowRoles('OWNER'), generateInvoice);
router.get('/my', authMiddleware, allowRoles('CUSTOMER'), getMyInvoices);
router.get('/owner', authMiddleware, allowRoles('OWNER'), getOwnerInvoices);

module.exports = router;
