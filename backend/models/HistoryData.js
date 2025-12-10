const mongoose = require('mongoose');

const historyDataSchema = new mongoose.Schema({
  historyId: {
    type: String,
    required: true,
    unique: true
  },

  // Foreign key referencing CurrentData.coinId
  coinId: {
    type: String,
    required: true,
    ref: 'CurrentData'
  },

  name: { type: String, required: true },
  symbol: { type: String, required: true },
  priceUsd: { type: Number, required: true },
  marketCap: { type: Number, required: true },
  priceChange24h: { type: Number, required: true },

  recordedAt: {
    type: Date,
    default: Date.now
  }
});

// Index for fast history lookup per coin
historyDataSchema.index({ coinId: 1, recordedAt: -1 });

module.exports = mongoose.model('HistoryData', historyDataSchema);
