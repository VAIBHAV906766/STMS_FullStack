const express = require('express');
const { getDrivers, getOwners } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/drivers', authMiddleware, allowRoles('OWNER'), getDrivers);
router.get('/owners', authMiddleware, allowRoles('CUSTOMER'), getOwners);

module.exports = router;
