const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const connectDB = require('./config/db');
const path = require('path');
const { createAuditLog } = require('./utils/auditLogger');
const { sanitizeRequest: xssSanitize } = require('./utils/sanitize');
require('dotenv').config();

// Connect to database
connectDB();

const app = express();

// Body parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// Security headers with Helmet
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
  exposedHeaders: ['X-Total-Count']
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 10 * 60 * 1000, // 10 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    createAuditLog({
      action: 'RATE_LIMIT_EXCEEDED',
      actionType: 'READ',
      user: req.user ? req.user.id : null,
      targetModel: 'Security',
      targetId: null,
      ip: req.ip,
      userAgent: req.headers['user-agent']
    }).catch(err => console.error('Error logging rate limit:', err));
    
    res.status(options.statusCode).json({
      success: false,
      message: options.message
    });
  }
});

// Apply rate limiter to all routes
app.use(limiter);

// XSS protection middleware
app.use(xssSanitize);

// Mount 
app.use('/api/public', require('./routes/public'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/audit', require('./routes/audit'));
app.use('/api', require('./routes/api'));

// Global error handler
app.use((err, req, res, next) => {
  // Log error
  createAuditLog({
    action: 'SYSTEM_ERROR',
    actionType: 'READ',
    user: req.user ? req.user.id : null,
    targetModel: 'Error',
    targetId: null,
    ip: req.ip,
    userAgent: req.headers['user-agent'],
    details: {
      error: err.message,
      stack: process.env.NODE_ENV === 'production' ? null : err.stack
    }
  }).catch(logErr => console.error('Error logging error:', logErr));

  console.error(err.stack);

  res.status(err.statusCode || 500).json({
    success: false,
    error: err.message || 'Server Error',
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// Serve static assets if in production
if (process.env.NODE_ENV === 'production') {
  // Set static folder
  app.use(express.static(path.join(__dirname, '../client/build')));

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });
}

// Handle 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Resource not found'
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.error(`Error: ${err.message}`);
  
  // Log to audit
  createAuditLog({
    action: 'SYSTEM_ERROR',
    actionType: 'READ',
    targetModel: 'System',
    targetId: null,
    details: {
      error: err.message,
      stack: err.stack
    }
  }).catch(logErr => console.error('Error logging system error:', logErr));
  
  // Close server & exit process
  server.close(() => process.exit(1));
});