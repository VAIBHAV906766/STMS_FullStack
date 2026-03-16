const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const createBooking = asyncHandler(async (req, res) => {
  const {
    ownerId,
    pickupLocation,
    dropLocation,
    goodsType,
    vehicleType,
    distanceKm,
    deliveryStops = []
  } = req.body;

  if (
    ownerId === undefined ||
    ownerId === null ||
    !pickupLocation ||
    !dropLocation ||
    !goodsType ||
    !vehicleType ||
    distanceKm === undefined
  ) {
    res.status(400);
    throw new Error('ownerId, route, goods, vehicle, and distance are required.');
  }

  const parsedOwnerId = Number(ownerId);
  const distance = Number(distanceKm);

  if (Number.isNaN(parsedOwnerId)) {
    res.status(400);
    throw new Error('ownerId must be a valid number.');
  }

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

  const owner = await prisma.user.findUnique({
    where: { id: parsedOwnerId },
    select: { id: true, role: true }
  });

  if (!owner || owner.role !== 'OWNER') {
    res.status(400);
    throw new Error('Selected owner is invalid.');
  }

  const booking = await prisma.booking.create({
    data: {
      customerId: req.user.id,
      ownerId: parsedOwnerId,
      pickupLocation,
      dropLocation,
      goodsType,
      vehicleType,
      distanceKm: distance,
      deliveryStops: normalizedStops.length ? { create: normalizedStops } : undefined
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      owner: { select: { id: true, name: true, email: true, ownerVerified: true, companyName: true } },
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
      owner: { select: { id: true, name: true, email: true, ownerVerified: true, companyName: true } },
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
    where: {
      status: 'PENDING',
      ownerId: req.user.id
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      owner: { select: { id: true, name: true, email: true, ownerVerified: true, companyName: true } },
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

const getReversibleBookings = asyncHandler(async (req, res) => {
  const bookings = await prisma.booking.findMany({
    where: {
      status: { in: ['APPROVED', 'REJECTED'] },
      ownerId: req.user.id,
      invoice: null
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      owner: { select: { id: true, name: true, email: true, ownerVerified: true, companyName: true } },
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
      ownerId: req.user.id,
      invoice: null
    },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      owner: { select: { id: true, name: true, email: true, ownerVerified: true, companyName: true } },
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

  if (!status || !['PENDING', 'APPROVED', 'REJECTED'].includes(status)) {
    res.status(400);
    throw new Error('Status must be PENDING, APPROVED, or REJECTED.');
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

  if (booking.ownerId !== req.user.id) {
    res.status(403);
    throw new Error('You can only manage bookings assigned to your owner account.');
  }

  if (status === booking.status) {
    res.status(200).json({
      message: `Booking is already ${status.toLowerCase()}.`,
      booking
    });
    return;
  }

  if (status === 'PENDING' && booking.invoice) {
    res.status(400);
    throw new Error('Cannot revert booking to pending after invoice generation.');
  }

  if (status === 'REJECTED' && booking.invoice) {
    res.status(400);
    throw new Error('Cannot reject booking after invoice generation.');
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
      owner: { select: { id: true, name: true, email: true, ownerVerified: true, companyName: true } },
      driver: { select: { id: true, name: true, email: true } },
      approvedByOwner: {
        select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
      },
      deliveryStops: { orderBy: { stopOrder: 'asc' } },
      invoice: true
    }
  });

  res.status(200).json({
    message:
      status === 'PENDING'
        ? 'Booking moved back to pending successfully.'
        : `Booking ${status.toLowerCase()} successfully.`,
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
  getReversibleBookings,
  getApprovedUninvoicedBookings,
  updateBookingStatus,
  getAssignedTrips
};
