const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const loanRoutes = require('./routes/loanRoutes');
const cors = require('cors');
const { updatePendingTransactions } = require('./utils/transactionChecker');
require('dotenv').config();

const app = express();

app.set('trust proxy', 1);

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts'
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

// Body parsing
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/auth', authLimiter, require('./routes/auth'));
app.use('/api/transactions', apiLimiter, require('./routes/transactions'));
app.use('/api/wallet', apiLimiter, require('./routes/wallet'));
app.use('/api/admin', apiLimiter, require('./routes/admin'));
app.use('/api/loans', loanRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB connected');
    
    // Start background job to check and update pending transactions
    console.log('🔄 Starting transaction status checker...');
    
    // Check immediately on startup
    updatePendingTransactions();
    
    // Then check every 30 seconds
    setInterval(async () => {
      await updatePendingTransactions();
    }, 30000); // 30 seconds
    
    console.log('✅ Transaction status checker active (checking every 30s)');
  })
  .catch(err => console.error('❌ MongoDB connection error:', err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
