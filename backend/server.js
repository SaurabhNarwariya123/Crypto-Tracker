const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cron = require('node-cron');
const axios = require('axios');
const connectDB = require('./config/db');
const cryptoRoutes = require('./routes/cryptoRoutes');
const historyRoutes = require('./routes/historyRoutes');

// Load environment variables
dotenv.config();

// Connect to MongoDB
connectDB();

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/coins', cryptoRoutes);
app.use('/api/history', historyRoutes);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});