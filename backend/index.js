const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const authRoutes = require('./src/routes/authRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const planRoutes = require('./src/routes/planRoutes');
const subscriptionRoutes = require('./src/routes/subscriptionRoutes');
const renewalRoutes = require('./src/routes/renewalRoutes');
const usageRoutes = require('./src/routes/usageRoutes');
const supportRoutes = require('./src/routes/supportRoutes');
const churnRuleRoutes = require('./src/routes/churnRuleRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const aiRoutes = require('./src/routes/aiRoutes');
const userRoutes = require('./src/routes/userRoutes');
const { initCronJobs } = require('./src/services/cronJobs');
const { seedDatabase } = require('./src/seed');
const User = require('./src/models/User');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI =
  process.env.MONGO_URI ||
  process.env.MONGODB_URI ||
  'mongodb://127.0.0.1:27017/subscriptiq';

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SubscriptIQ API',
    time: new Date().toISOString(),
    aiModel: process.env.OPENROUTER_MODEL || 'nvidia/llama-3.1-nemotron-70b-instruct:free',
    hasOpenRouterKey: Boolean(process.env.OPENROUTER_API_KEY && process.env.OPENROUTER_API_KEY.length > 5),
    mongoConnected: mongoose.connection.readyState === 1,
  });
});

// Seed API endpoint for instant UI reset/re-seed
app.post('/api/v1/seed', async (req, res) => {
  try {
    await seedDatabase();
    res.json({ message: 'Database successfully seeded with demo SaaS records.' });
  } catch (err) {
    console.error('Seed API error:', err);
    res.status(500).json({ message: 'Seeding failed.', error: err.message });
  }
});

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/customers', customerRoutes);
app.use('/api/v1/plans', planRoutes);
app.use('/api/v1/subscriptions', subscriptionRoutes);
app.use('/api/v1/renewals', renewalRoutes);
app.use('/api/v1/usage-events', usageRoutes);
app.use('/api/v1/support-notes', supportRoutes);
app.use('/api/v1/churn-rules', churnRuleRoutes);
app.use('/api/v1/analytics', analyticsRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/users', userRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: `API route not found: ${req.method} ${req.originalUrl}` });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({ message: 'Internal server error.', error: err.message });
});

// Database connection & Startup
mongoose
  .connect(MONGODB_URI)
  .then(async () => {
    console.log(`✓ Connected to MongoDB`);

    // Auto-seed if User collection is empty
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        console.log('No users found. Auto-seeding default demo dataset...');
        await seedDatabase();
      }
    } catch (seedErr) {
      console.warn('Auto-seed check notice:', seedErr.message);
    }

    // Initialize scheduled cron jobs
    initCronJobs();

    app.listen(PORT, () => {
      console.log(`✓ SubscriptIQ Server running on port ${PORT} (http://localhost:${PORT})`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    console.log('Running Express server in standalone mode (database queries will retry upon Mongo availability)...');

    app.listen(PORT, () => {
      console.log(`✓ SubscriptIQ Server running on port ${PORT} (Standalone mode)`);
    });
  });
