const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const createBooking = asyncHandler(async (req, res) => {
  const {
    pickupLocation,
    dropLocation,
    goodsType,
    vehicleType,
    distanceKm,
    deliveryStops = []
  } = req.body;

  if (!pickupLocation || !dropLocation || !goodsType || !vehicleType || distanceKm === undefined) {
    res.status(400);
    throw new Error('All booking fields are required.');
  }

  const distance = Number(distanceKm);

  if (Number.isNaN(distance) || distance <= 0) {
    res.status(400);
    throw new Error('Distance must be a positive number.');
  }

  if (!Array.isArray(deliveryStops)) {
    res.status(400);
    throw new Error('deliveryStops must be an array.');
  }

  const normalizedStops = deliveryStops.map((stop, index) => {
    if (!stop || typeof stop !== 'object') {
      res.status(400);
      throw new Error(`Stop #${index + 1} is invalid.`);
    }

    const location = String(stop.location || '').trim();

    if (!location) {
      res.status(400);
      throw new Error(`Stop #${index + 1} location is required.`);
    }

    const notes = stop.notes ? String(stop.notes).trim() : null;

    return {
      stopOrder: index + 1,
      location,
      notes: notes || null
    };
  });

  const booking = await prisma.booking.create({
    data: {
      customerId: req.user.id,
      pickupLocation,
      dropLocation,
      goodsType,
      vehicleType,
      distanceKm: distance,
      deliveryStops: normalizedStops.length ? { create: normalizedStops } : undefined
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      driver: { select: { id: true, name: true, email: true } },
      approvedByOwner: {
        select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
      },
      deliveryStops: { orderBy: { stopOrder: 'asc' } }
    }
  });

  res.status(201).json({
    message: 'Booking created successfully.',
    booking
  });
});

const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { customerId: req.user.id },
    include: {
      invoice: true,
      driver: { select: { id: true, name: true, email: true } },
      approvedByOwner: {
        select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
      },
      deliveryStops: { orderBy: { stopOrder: 'asc' } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ bookings });
});

const getPendingBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: { status: 'PENDING' },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      driver: { select: { id: true, name: true, email: true } },
      approvedByOwner: {
        select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
      },
      deliveryStops: { orderBy: { stopOrder: 'asc' } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ bookings });
});

const getApprovedUninvoicedBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: {
      status: 'APPROVED',
      invoice: null
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      driver: { select: { id: true, name: true, email: true } },
      approvedByOwner: {
        select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
      },
      deliveryStops: { orderBy: { stopOrder: 'asc' } }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ bookings });
});

const updateBookingStatus = asyncHandler(async (req, res) => {
  const bookingId = Number(req.params.id);
  const { status, driverId } = req.body;

  if (Number.isNaN(bookingId)) {
    res.status(400);
    throw new Error('Invalid booking ID.');
  }

  if (!status || !['APPROVED', 'REJECTED'].includes(status)) {
    res.status(400);
    throw new Error('Status must be either APPROVED or REJECTED.');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      invoice: true
    }
  });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }

  let finalDriverId = null;

  if (status === 'APPROVED') {
    if (driverId !== undefined && driverId !== null && driverId !== '') {
      const parsedDriverId = Number(driverId);

      if (Number.isNaN(parsedDriverId)) {
        res.status(400);
        throw new Error('Driver ID must be a number.');
      }

      const driver = await prisma.user.findUnique({ where: { id: parsedDriverId } });

      if (!driver || driver.role !== 'DRIVER') {
        res.status(400);
        throw new Error('Selected driver is invalid.');
      }

      finalDriverId = driver.id;
    } else {
      const fallbackDriver = await prisma.user.findFirst({
        where: { role: 'DRIVER' },
        orderBy: { id: 'asc' }
      });

      finalDriverId = fallbackDriver ? fallbackDriver.id : null;
    }
  }

  const updatedBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      status,
      driverId: status === 'APPROVED' ? finalDriverId : null,
      approvedByOwnerId: status === 'APPROVED' ? req.user.id : null
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      driver: { select: { id: true, name: true, email: true } },
      approvedByOwner: {
        select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
      },
      deliveryStops: { orderBy: { stopOrder: 'asc' } },
      invoice: true
    }
  });

  res.status(200).json({
    message: `Booking ${status.toLowerCase()} successfully.`,
    booking: updatedBooking
  });
});

const getAssignedTrips = asyncHandler(async (req, res) => {
  const trips = await prisma.booking.findMany({
    where: {
      driverId: req.user.id,
      status: 'APPROVED'
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      approvedByOwner: {
        select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
      },
      deliveryStops: { orderBy: { stopOrder: 'asc' } },
      invoice: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ trips });
});

module.exports = {
  createBooking,
  getMyBookings,
  getPendingBookings,
  getApprovedUninvoicedBookings,
  updateBookingStatus,
  getAssignedTrips
};
