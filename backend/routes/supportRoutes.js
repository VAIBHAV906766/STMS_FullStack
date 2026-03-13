const express = require('express');
const { createSupportQuery, getMySupportQueries } = require('../controllers/supportController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/query', authMiddleware, allowRoles('CUSTOMER'), createSupportQuery);
router.get('/my-queries', authMiddleware, allowRoles('CUSTOMER'), getMySupportQueries);

module.exports = router;
