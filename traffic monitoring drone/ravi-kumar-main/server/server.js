const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { logActivity } = require('./middleware/logger');
const RealTimeService = require('./services/realTimeService');

// Import routes
const authRoutes = require('./routes/auth');
const droneRoutes = require('./routes/drones');
const alertRoutes = require('./routes/alerts');
const trafficLightRoutes = require('./routes/traffic-lights');
const analyticsRoutes = require('./routes/analytics');

const app = express();
const server = http.createServer(app);

// Socket.IO setup with CORS
const io = socketIo(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Initialize real-time service
const realTimeService = new RealTimeService(io);
realTimeService.initialize();

// Security middleware
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', limiter);

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173",
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
if (process.env.NODE_ENV !== 'production') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Activity logging middleware
app.use(logActivity);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Traffic Monitoring API is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    connectedUsers: realTimeService.getConnectedUsersCount()
  });
});

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/drones', droneRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/traffic-lights', trafficLightRoutes);
app.use('/api/analytics', analyticsRoutes);

// System status endpoint
app.get('/api/system/status', (req, res) => {
  const userStats = realTimeService.getUserStatistics();
  
  res.json({
    success: true,
    data: {
      server: {
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        version: process.version,
        environment: process.env.NODE_ENV || 'development'
      },
      realTime: {
        connectedUsers: userStats.total,
        userRoles: userStats.roles,
        averageSessionTime: Math.round(userStats.averageSessionTime)
      },
      timestamp: new Date().toISOString()
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'API endpoint not found',
    path: req.originalUrl
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error handler:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Internal server error' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// Start server
const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    // Test database connection
    const dbConnected = await testConnection();
    if (!dbConnected) {
      console.error('❌ Failed to connect to database. Please check your configuration.');
      process.exit(1);
    }

    server.listen(PORT, () => {
      console.log('🚀 Traffic Monitoring API Server Started');
      console.log(`📡 Server running on port ${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🔗 Health check: http://localhost:${PORT}/health`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
      console.log('⚡ Real-time updates enabled via Socket.IO');
      console.log('');
      console.log('📋 Available endpoints:');
      console.log('   POST /api/auth/login - User authentication');
      console.log('   GET  /api/drones - Get all drones');
      console.log('   GET  /api/alerts - Get alerts');
      console.log('   GET  /api/traffic-lights - Get traffic lights');
      console.log('   GET  /api/analytics/overview - Get system overview');
      console.log('');
      console.log('🔧 To initialize database, run: npm run init-db');
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received. Shutting down gracefully...');
  server.close(() => {
    console.log('Server closed.');
    process.exit(0);
  });
});

startServer();