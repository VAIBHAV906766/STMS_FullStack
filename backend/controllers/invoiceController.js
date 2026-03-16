const { randomUUID } = require('crypto');
const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const generateInvoice = asyncHandler(async (req, res) => {
  const { bookingId, ratePerKm } = req.body;

  const parsedBookingId = Number(bookingId);
  const parsedRate = ratePerKm !== undefined ? Number(ratePerKm) : 20;

  if (Number.isNaN(parsedBookingId)) {
    res.status(400);
    throw new Error('Booking ID is required and must be valid.');
  }

  if (Number.isNaN(parsedRate) || parsedRate <= 0) {
    res.status(400);
    throw new Error('Rate per km must be a positive number.');
  }

  const booking = await prisma.booking.findUnique({
    where: { id: parsedBookingId },
    include: { invoice: true }
  });

  if (!booking) {
    res.status(404);
    throw new Error('Booking not found.');
  }

  if (booking.ownerId !== req.user.id) {
    res.status(403);
    throw new Error('You can only generate invoices for your assigned bookings.');
  }

  if (booking.status !== 'APPROVED') {
    res.status(400);
    throw new Error('Only approved bookings can be invoiced.');
  }

  if (booking.invoice) {
    res.status(409);
    throw new Error('Invoice already exists for this booking.');
  }

  const totalAmount = Number((booking.distanceKm * parsedRate).toFixed(2));

  const invoice = await prisma.invoice.create({
    data: {
      bookingId: booking.id,
      customerId: booking.customerId,
      qrCode: randomUUID(),
      distanceKm: booking.distanceKm,
      ratePerKm: parsedRate,
      totalAmount
    },
    include: {
      booking: true,
      customer: { select: { id: true, name: true, email: true } }
    }
  });

  res.status(201).json({
    message: 'Invoice generated successfully.',
    invoice
  });
});

const getMyInvoices = asyncHandler(async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    where: { customerId: req.user.id },
    include: {
      customer: { select: { id: true, name: true, email: true } },
      booking: {
        include: {
          approvedByOwner: {
            select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
          },
          deliveryStops: { orderBy: { stopOrder: 'asc' } }
        }
      },
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ invoices });
});

const getOwnerInvoices = asyncHandler(async (req, res) => {
  const invoices = await prisma.invoice.findMany({
    where: {
      booking: {
        ownerId: req.user.id
      }
    },
    include: {
      booking: {
        include: {
          owner: {
            select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
          },
          customer: { select: { id: true, name: true, email: true } },
          driver: { select: { id: true, name: true, email: true } },
          approvedByOwner: {
            select: { id: true, name: true, email: true, ownerVerified: true, companyName: true }
          },
          deliveryStops: { orderBy: { stopOrder: 'asc' } }
        }
      },
      customer: { select: { id: true, name: true, email: true } },
      payments: true
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ invoices });
});

module.exports = {
  generateInvoice,
  getMyInvoices,
  getOwnerInvoices
};
