const express = require('express');
const { getDrivers } = require('../controllers/userController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.get('/drivers', authMiddleware, allowRoles('OWNER'), getDrivers);

module.exports = router;
