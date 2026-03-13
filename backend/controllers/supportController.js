const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const createSupportQuery = asyncHandler(async (req, res) => {
  const subject = String(req.body.subject || '').trim();
  const message = String(req.body.message || '').trim();

  if (!subject || !message) {
    res.status(400);
    throw new Error('Subject and message are required.');
  }

  const query = await prisma.supportQuery.create({
    data: {
      customerId: req.user.id,
      subject,
      message
    }
  });

  res.status(201).json({
    message: 'Support query submitted successfully.',
    query
  });
});

const getMySupportQueries = asyncHandler(async (req, res) => {
  const queries = await prisma.supportQuery.findMany({
    where: { customerId: req.user.id },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ queries });
});

module.exports = {
  createSupportQuery,
  getMySupportQueries
};
