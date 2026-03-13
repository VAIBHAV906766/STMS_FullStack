require('dotenv').config();

const express = require('express');
const cors = require('cors');
const prisma = require('./config/prisma');
const authRoutes = require('./routes/authRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const userRoutes = require('./routes/userRoutes');
const ownersRoutes = require('./routes/ownersRoutes');
const adminRoutes = require('./routes/adminRoutes');
const supportRoutes = require('./routes/supportRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();
const isProduction = process.env.NODE_ENV === 'production';

const configuredOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(',').map((origin) => origin.trim().replace(/\/$/, ''))
  : [];

const isLocalDevOrigin = (origin) => /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);

const corsOrigin = (origin, callback) => {
  if (!isProduction) {
    return callback(null, true);
  }

  if (!origin) {
    return callback(null, true);
  }

  const normalizedOrigin = origin.replace(/\/$/, '');

  if (configuredOrigins.includes(normalizedOrigin) || isLocalDevOrigin(normalizedOrigin)) {
    return callback(null, true);
  }

  return callback(new Error('Not allowed by CORS'));
};

app.use(
  cors({
    origin: corsOrigin
  })
);
app.use(express.json());

app.get('/api/health', (req, res) => {
  res.status(200).json({ message: 'STMS API is running.' });
});

app.use('/api/auth', authRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/users', userRoutes);
app.use('/api/owners', ownersRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/support', supportRoutes);

app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

const shutdown = async () => {
  await prisma.$disconnect();
  server.close(() => process.exit(0));
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
