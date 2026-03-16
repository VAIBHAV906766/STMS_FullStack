const express = require('express');
const {
  createBooking,
  getMyBookings,
  getPendingBookings,
  getReversibleBookings,
  getApprovedUninvoicedBookings,
  updateBookingStatus,
  getAssignedTrips
} = require('../controllers/bookingController');
const authMiddleware = require('../middleware/authMiddleware');
const allowRoles = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', authMiddleware, allowRoles('CUSTOMER'), createBooking);
router.get('/my', authMiddleware, allowRoles('CUSTOMER'), getMyBookings);
router.get('/pending', authMiddleware, allowRoles('OWNER'), getPendingBookings);
router.get('/reversible', authMiddleware, allowRoles('OWNER'), getReversibleBookings);
router.get('/approved-uninvoiced', authMiddleware, allowRoles('OWNER'), getApprovedUninvoicedBookings);
router.get('/assigned', authMiddleware, allowRoles('DRIVER'), getAssignedTrips);
router.patch('/:id/status', authMiddleware, allowRoles('OWNER'), updateBookingStatus);

module.exports = router;
