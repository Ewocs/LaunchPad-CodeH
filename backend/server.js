const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const emailRoutes = require('./routes/emails');
const subscriptionRoutes = require('./routes/subscriptions');
const breachCheckRoutes = require('./routes/breachCheck');
const surfaceRoutes = require('./routes/surface');
const MigrationService = require('./services/migrationService');

/* ===============================
   App Initialization
================================ */
const app = express();
app.set('trust proxy', true);

/* ===============================
   Security Middleware
================================ */
app.use(
  helmet({
    crossOriginResourcePolicy: false,
  })
);

/* ===============================
   Rate Limiting
================================ */
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    statusCode: 429,
    error: 'Too many requests from this IP, please try again later.',
  },
});
app.use(limiter);

/* ===============================
   CORS Configuration
   (credentials required for CSRF cookies)
================================ */
app.use(
  cors({
    origin: [
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      process.env.FRONTEND_URL,
    ].filter(Boolean),
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token'],
    optionsSuccessStatus: 204,
  })
);

/* ===============================
   Body & Cookie Parsing
================================ */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ===============================
   CSRF Protection Setup
================================ */
/**
 * CSRF Protection Strategy:
 * - Enabled only for state-changing requests
 * - Uses double-submit cookie pattern
 * - Safe methods (GET, HEAD, OPTIONS) are excluded
 */
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});

/**
 * CSRF Token Endpoint
 * Frontend must call this once and store token
 */
app.get('/api/csrf-token', csrfProtection, (req, res) => {
  res.status(200).json({
    csrfToken: req.csrfToken(),
  });
});

/* ===============================
   Apply CSRF Protection
   (Only to authenticated / API routes)
================================ */
app.use('/api', csrfProtection);

/* ===============================
   Routes
================================ */
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/breach-check', breachCheckRoutes);
app.use('/api/surface', surfaceRoutes);

/* ===============================
   Health & Status Routes
   (Public, no CSRF needed)
================================ */
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    environment: process.env.NODE_ENV || 'development',
    timestamp: new Date().toISOString(),
  });
});

app.get('/api/status', (req, res) => {
  res.status(200).json({
    message: 'Gmail Subscription Manager API is running',
    version: '1.0.0',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

/* ===============================
   404 Handler
================================ */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

/* ===============================
   Global Error Handler
================================ */
app.use((err, req, res, next) => {
  console.error(err);

  // CSRF-specific error handling
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token',
    });
  }

  const statusCode = err.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
});

/* ===============================
   Database Connection
================================ */
mongoose
  .connect(
    process.env.MONGODB_URI ||
      'mongodb://localhost:27017/gmail-subscription-manager',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(async () => {
    console.log('Connected to MongoDB');
    await MigrationService.runMigrations();
  })
  .catch((error) => {
    console.error('MongoDB connection failed:', error);
    process.exit(1);
  });

/* ===============================
   Server Start
================================ */
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌱 Environment: ${process.env.NODE_ENV || 'development'}`);
});

module.exports = app;
