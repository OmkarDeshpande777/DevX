// Load environment variables first
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { testConnection } = require('./config/database');
const { initializeSampleData } = require('./models/database');

const app = express();
const PORT = process.env.PORT || 3001;

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:3001', 
    'http://localhost:3002',
    'http://192.168.1.226:3001',
    'http://192.168.1.226:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(compression());
app.use(morgan('combined'));
app.use(limiter);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Import routes
const authRoutes = require('./routes/auth');
const dashboardRoutes = require('./routes/dashboard');
const userRoutes = require('./routes/users');
const chatbotRoutes = require('./routes/chatbot');
const healthmapRoutes = require('./routes/healthmap');
const cropCalendarRoutes = require('./routes/crop-calendar');
const soilAnalysisRoutes = require('./routes/soil-analysis');
const yieldRecommendorRoutes = require('./routes/yield-recommendor');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/healthmap', healthmapRoutes);
app.use('/api/crop-calendar', cropCalendarRoutes);
app.use('/api/soil-analysis', soilAnalysisRoutes);
app.use('/api/yield-recommendor', yieldRecommendorRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    service: 'CropAI Backend'
  });
});

// Basic API endpoints
app.get('/', (req, res) => {
  res.json({
    message: 'CropAI Express.js Backend API',
    version: '2.0.0',
    description: 'Comprehensive agricultural assistance and analytics API for farmers',
    status: 'running'
  });
});

// Dashboard stats endpoint
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    // Return minimal stats since analytics is removed
    const stats = [
      { label: 'Active Users', value: '1,234', trend: '+12.5%', positive: true },
      { label: 'Crop Predictions', value: '856', trend: '+8.2%', positive: true },
      { label: 'Success Rate', value: '94.2%', trend: '+2.1%', positive: true },
      { label: 'Farm Area Monitored', value: '2,847 acres', trend: '+15.3%', positive: true }
    ];

    res.json({
      success: true,
      data: stats,
      generatedAt: new Date().toISOString()
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch dashboard stats', 
      message: error.message 
    });
  }
});

// Market Prices endpoint (replacing Analytics)
try {
  const marketPricesRoutes = require('./routes/marketPrices');
  app.use('/api/market-prices', marketPricesRoutes);
  console.log('💰 Market Prices API: http://localhost:' + PORT + '/api/market-prices');
} catch (error) {
  console.error('❌ Failed to load Market Prices routes:', error.message);
}

// Enhanced Farmer Market Prices API
try {
  const farmerMarketPricesRoutes = require('./routes/farmerMarketPrices');
  app.use('/api/farmer-market', farmerMarketPricesRoutes);
  console.log('🚜 Farmer Market API: http://localhost:' + PORT + '/api/farmer-market');
} catch (error) {
  console.error('❌ Failed to load Farmer Market routes:', error.message);
}

// Import and use AI Chat routes (Multilingual) - Using simple working implementation
try {
  const aiChatRoutes = require('./routes/simple-multilingual-chat');
  app.use('/api/ai-chat', aiChatRoutes);
  console.log('🤖 AI Chat API: http://localhost:' + PORT + '/api/ai-chat');
} catch (error) {
  console.error('❌ Failed to load AI Chat routes:', error.message);
}

// Weather routes
try {
  const weatherRoutes = require('./routes/weather');
  app.use('/api/weather', weatherRoutes);
  console.log('🌤️ Weather API: http://localhost:' + PORT + '/api/weather');
} catch (error) {
  console.error('❌ Failed to load Weather routes:', error.message);
}

// Government Schemes routes
try {
  const schemesRoutes = require('./routes/schemes');
  app.use('/api/schemes', schemesRoutes);
  console.log('🏛️ Government Schemes API: http://localhost:' + PORT + '/api/schemes');
} catch (error) {
  console.error('❌ Failed to load Schemes routes:', error.message);
}

// Live Crop Prices routes (Real-time with scraping simulation)
try {
  const liveCropPricesRoutes = require('./routes/liveCropPrices');
  app.use('/api/live-prices', liveCropPricesRoutes);
  console.log('📈 Live Crop Prices API: http://localhost:' + PORT + '/api/live-prices');
} catch (error) {
  console.error('❌ Failed to load Live Crop Prices routes:', error.message);
}

// Farm Finance routes
try {
  const farmFinanceRoutes = require('./routes/farmFinance');
  app.use('/api/farm-finance', farmFinanceRoutes);
  console.log('💰 Farm Finance API: http://localhost:' + PORT + '/api/farm-finance');
} catch (error) {
  console.error('❌ Failed to load Farm Finance routes:', error.message);
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist on this server.`
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await testConnection();
    
    // Initialize sample data if needed
    await initializeSampleData();
    
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`🚀 CropAI Backend Server running on port ${PORT}`);
      console.log(`🌐 Server accessible at: http://localhost:${PORT}`);
      console.log(`🌐 Server accessible at: http://0.0.0.0:${PORT}`);
      console.log(`🔐 Auth API: http://localhost:${PORT}/api/auth`);
      console.log(` Dashboard API: http://localhost:${PORT}/api/dashboard`);
      console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
      console.log(`🗺️ HealthMap API: http://localhost:${PORT}/api/healthmap`);
      console.log(`📅 Crop Calendar API: http://localhost:${PORT}/api/crop-calendar`);
      console.log(`� Farm Finance API: http://localhost:${PORT}/api/farm-finance`);
      console.log(`�💚 Health Check: http://localhost:${PORT}/health`);
      console.log(`🗄️  Database: MySQL connected with real data`);
    });

    server.on('error', (error) => {
      console.error('❌ Server error:', error);
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${PORT} is already in use`);
      }
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

module.exports = app;
