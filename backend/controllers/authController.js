const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const prisma = require('../config/prisma');
const asyncHandler = require('../middleware/asyncHandler');

const ALL_ROLES = ['CUSTOMER', 'OWNER', 'DRIVER', 'ADMIN'];
const PUBLIC_SIGNUP_ROLES = ['CUSTOMER', 'OWNER', 'DRIVER'];

const generateToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      role: user.role,
      name: user.name,
      email: user.email
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' }
  );

const register = asyncHandler(async (req, res) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const role = String(req.body.role || '').toUpperCase();

  if (!name || !email || !password || !role) {
    res.status(400);
    throw new Error('Name, email, password, and role are required.');
  }

  if (!ALL_ROLES.includes(role)) {
    res.status(400);
    throw new Error('Invalid role selected.');
  }

  if (!PUBLIC_SIGNUP_ROLES.includes(role)) {
    res.status(403);
    throw new Error('Public signup supports only CUSTOMER, OWNER, and DRIVER roles.');
  }

  if (password.length < 6) {
    res.status(400);
    throw new Error('Password must be at least 6 characters long.');
  }

  const existingUser = await prisma.user.findUnique({ where: { email } });

  if (existingUser) {
    res.status(409);
    throw new Error('An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      passwordHash,
      role
    },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      createdAt: true
    }
  });

  const token = generateToken(user);

  res.status(201).json({
    message: 'Registration successful.',
    token,
    user
  });
});

const login = asyncHandler(async (req, res) => {
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required.');
  }

  const user = await prisma.user.findUnique({
    where: { email },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      passwordHash: true,
      createdAt: true
    }
  });

  if (!user) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

  if (!isPasswordValid) {
    res.status(401);
    throw new Error('Invalid email or password.');
  }

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt
  };

  const token = generateToken(safeUser);

  res.status(200).json({
    message: 'Login successful.',
    token,
    user: safeUser
  });
});

module.exports = {
  register,
  login
};
