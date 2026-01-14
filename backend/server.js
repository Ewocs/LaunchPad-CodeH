const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const csrf = require('csurf');
require('dotenv').config();

/* ===============================
   Import Routes (Unversioned)
================================ */
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
   CSRF Protection
================================ */
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  },
  ignoreMethods: ['GET', 'HEAD', 'OPTIONS'],
});

/**
 * CSRF token endpoint (versioned)
 */
app.get('/api/v1/csrf-token', csrfProtection, (req, res) => {
  res.status(200).json({ csrfToken: req.csrfToken() });
});

/* ===============================
   API VERSIONING SETUP
================================ */
/**
 * All current APIs are exposed under /api/v1
 * Future versions (v2, v3...) can coexist safely
 */
const v1Router = express.Router();

/* Apply CSRF only to versioned APIs */
v1Router.use(csrfProtection);

/* ===============================
   V1 ROUTES
================================ */
v1Router.use('/auth', authRoutes);
v1Router.use('/dashboard', dashboardRoutes);
v1Router.use('/emails', emailRoutes);
v1Router.use('/subscriptions', subscriptionRoutes);
v1Router.use('/breach-check', breachCheckRoutes);
v1Router.use('/surface', surfaceRoutes);

/* Mount versioned router */
app.use('/api/v1', v1Router);

/* ===============================
   Backward Compatibility (Optional)
   Redirect old /api/* → /api/v1/*
================================ */
/**
 * This ensures existing clients don’t break immediately.
 * Can be removed in future after deprecation period.
 */
app.use('/api', (req, res) => {
  res.status(410).json({
    message:
      'Unversioned API is deprecated. Please use /api/v1/* endpoints.',
  });
});

/* ===============================
   Health & Status Routes
   (Non-versioned, public)
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
    activeVersion: 'v1',
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

  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({
      success: false,
      message: 'Invalid or missing CSRF token',
    });
  }

  res.status(err.statusCode || 500).json({
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
