const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const ownerSelect = {
  id: true,
  name: true,
  email: true,
  role: true,
  ownerVerified: true,
  companyName: true,
  companyLicenseNumber: true,
  companyAddress: true,
  verificationRequestedAt: true,
  createdAt: true
};

const requestVerification = asyncHandler(async (req, res) => {
  const companyName = String(req.body.companyName || '').trim();
  const companyLicenseNumber = String(req.body.companyLicenseNumber || '').trim();
  const companyAddress = String(req.body.companyAddress || '').trim();

  if (!companyName || !companyLicenseNumber || !companyAddress) {
    res.status(400);
    throw new Error('Company name, license number, and company address are required.');
  }

  const owner = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: ownerSelect
  });

  if (!owner || owner.role !== 'OWNER') {
    res.status(403);
    throw new Error('Only owners can request verification.');
  }

  if (owner.ownerVerified) {
    res.status(409);
    throw new Error('Your account is already verified.');
  }

  const updatedOwner = await prisma.user.update({
    where: { id: req.user.id },
    data: {
      companyName,
      companyLicenseNumber,
      companyAddress,
      verificationRequestedAt: new Date(),
      ownerVerified: false
    },
    select: ownerSelect
  });

  res.status(200).json({
    message: 'Verification request submitted successfully.',
    owner: updatedOwner
  });
});

const getMyVerificationStatus = asyncHandler(async (req, res) => {
  const owner = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: ownerSelect
  });

  if (!owner || owner.role !== 'OWNER') {
    res.status(403);
    throw new Error('Only owners can access verification status.');
  }

  res.status(200).json({ owner });
});

module.exports = {
  requestVerification,
  getMyVerificationStatus
};
