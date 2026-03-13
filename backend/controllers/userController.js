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

module.exports = {
  getDrivers
};
