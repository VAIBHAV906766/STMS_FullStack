const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const supportStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED'];

const getVerificationRequests = asyncHandler(async (req, res) => {
  const owners = await prisma.user.findMany({
    where: {
      role: 'OWNER',
      OR: [{ verificationRequestedAt: { not: null } }, { ownerVerified: true }]
    },
    select: {
      id: true,
      name: true,
      email: true,
      ownerVerified: true,
      companyName: true,
      companyLicenseNumber: true,
      companyAddress: true,
      verificationRequestedAt: true,
      createdAt: true
    },
    orderBy: [{ ownerVerified: 'asc' }, { verificationRequestedAt: 'desc' }]
  });

  res.status(200).json({ owners });
});

const verifyOwner = asyncHandler(async (req, res) => {
  const ownerId = Number(req.params.ownerId);

  if (Number.isNaN(ownerId)) {
    res.status(400);
    throw new Error('Owner ID must be a valid number.');
  }

  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
    select: {
      id: true,
      role: true,
      ownerVerified: true,
      companyName: true,
      companyLicenseNumber: true,
      companyAddress: true,
      verificationRequestedAt: true
    }
  });

  if (!owner || owner.role !== 'OWNER') {
    res.status(404);
    throw new Error('Owner not found.');
  }

  if (!owner.verificationRequestedAt) {
    res.status(400);
    throw new Error('Owner has not submitted a verification request.');
  }

  if (!owner.companyName || !owner.companyLicenseNumber || !owner.companyAddress) {
    res.status(400);
    throw new Error('Owner company details are incomplete.');
  }

  if (owner.ownerVerified) {
    res.status(409);
    throw new Error('Owner is already verified.');
  }

  const updatedOwner = await prisma.user.update({
    where: { id: ownerId },
    data: { ownerVerified: true },
    select: {
      id: true,
      name: true,
      email: true,
      ownerVerified: true,
      companyName: true,
      companyLicenseNumber: true,
      companyAddress: true,
      verificationRequestedAt: true
    }
  });

  res.status(200).json({
    message: 'Owner verified successfully.',
    owner: updatedOwner
  });
});

const getSupportQueries = asyncHandler(async (req, res) => {
  const queries = await prisma.supportQuery.findMany({
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  });

  res.status(200).json({ queries });
});

const updateSupportQueryStatus = asyncHandler(async (req, res) => {
  const queryId = Number(req.params.id);
  const status = String(req.body.status || '').toUpperCase();

  if (Number.isNaN(queryId)) {
    res.status(400);
    throw new Error('Query ID must be a valid number.');
  }

  if (!supportStatuses.includes(status)) {
    res.status(400);
    throw new Error('Status must be OPEN, IN_PROGRESS, or RESOLVED.');
  }

  const existingQuery = await prisma.supportQuery.findUnique({
    where: { id: queryId }
  });

  if (!existingQuery) {
    res.status(404);
    throw new Error('Support query not found.');
  }

  const updatedQuery = await prisma.supportQuery.update({
    where: { id: queryId },
    data: { status },
    include: {
      customer: {
        select: { id: true, name: true, email: true }
      }
    }
  });

  res.status(200).json({
    message: 'Support query status updated successfully.',
    query: updatedQuery
  });
});

module.exports = {
  getVerificationRequests,
  verifyOwner,
  getSupportQueries,
  updateSupportQueryStatus
};
