const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const getDrivers = asyncHandler(async (req, res) => {
  const drivers = await prisma.user.findMany({
    where: { role: 'DRIVER' },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true
    },
    orderBy: { name: 'asc' }
  });

  res.status(200).json({ drivers });
});

const getOwners = asyncHandler(async (req, res) => {
  const owners = await prisma.user.findMany({
    where: { role: 'OWNER' },
    select: {
      id: true,
      name: true,
      email: true,
      companyName: true,
      ownerVerified: true,
      createdAt: true
    },
    orderBy: { name: 'asc' }
  });

  res.status(200).json({ owners });
});

module.exports = {
  getDrivers,
  getOwners
};
