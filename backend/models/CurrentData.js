const mongoose = require('mongoose');

const currentDataSchema = new mongoose.Schema({
  coinId: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    required: true
  },
  symbol: {
    type: String,
    required: true
  },
  priceUsd: {
    type: Number,
    required: true
  },
  marketCap: {
    type: Number,
    required: true
  },
  priceChange24h: {
    type: Number,
    required: true
  },
  image: {
    type: String
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('CurrentData', currentDataSchema);