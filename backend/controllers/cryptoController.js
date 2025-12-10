const axios = require('axios');
const CurrentData = require('../models/CurrentData');
const HistoryData = require('../models/HistoryData');

const COINGECKO_URL =
  process.env.COINGECKO_URL ||
  'https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&page=1';


exports.getCoins = async (req, res) => {
  try {
    const resp = await axios.get(COINGECKO_URL);

    const coins = resp.data.map(c => ({
      coinId: c.id,
      name: c.name,
      symbol: c.symbol,
      priceUsd: c.current_price,
      marketCap: c.market_cap,
      priceChange24h: c.price_change_percentage_24h,
      image: c.image,
      lastUpdated: c.last_updated
    }));

    // BULK UPSERT INTO CurrentData
    const ops = coins.map(c => ({
      updateOne: {
        filter: { coinId: c.coinId },
        update: { $set: c },
        upsert: true,
      }
    }));

    if (ops.length > 0) await CurrentData.bulkWrite(ops);

    res.json(coins);
  } catch (err) {
    console.error("GET /api/coins error:", err);
    res.status(500).json({ error: "Failed to fetch coins" });
  }
};

exports.getCurrentCoins = async (req, res) => {
  try {
    const data = await CurrentData.find()
      .select('coinId name symbol')
      .lean();
    res.json(data);
  } catch (err) {
    console.error('GET /api/coins/current error:', err);
    res.status(500).json({ error: 'Failed to fetch current data' });
  }
};


exports.storeHistory = async (req, res) => {
  try {
    let coins = req.body.coins;

    // If no coins provided → dump CurrentData
    if (!coins) {
      coins = await CurrentData.find().lean();
    }

    const docs = coins.map(c => ({
      historyId: `${c.coinId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      coinId: c.coinId,
      name: c.name,
      symbol: c.symbol,
      priceUsd: c.priceUsd,
      marketCap: c.marketCap,
      priceChange24h: c.priceChange24h,
      recordedAt: new Date()
    }));

    if (docs.length) await HistoryData.insertMany(docs);

    res.json({ 
      success: true, 
      count: docs.length,
      message: `Saved ${docs.length} coin snapshot${docs.length !== 1 ? 's' : ''}`
    });
  } catch (err) {
    console.error("POST /api/history error:", err);
    res.status(500).json({ error: "Failed to store history" });
  }
};

exports.getCoinHistory = async (req, res) => {
  try {
    const { coinId } = req.params;
    const limit = parseInt(req.query.limit || "200", 10);

    const data = await HistoryData.find({ coinId })
      .sort({ recordedAt: -1 })
      .limit(limit)
      .lean();

    res.json({ 
      success: true, 
      data,
      count: data.length 
    });
  } catch (err) {
    console.error("GET /api/history/:coinId error:", err);
    res.status(500).json({ error: "Failed to fetch history" });
  }
};

exports.getAllHistory = async (req, res) => {
  try {
    const { coinId, limit = 100, sort = '-recordedAt' } = req.query;
    
    let query = {};
    if (coinId && coinId !== 'all') {
      query.coinId = coinId;
    }
    
    const data = await HistoryData.find(query)
      .sort(sort)
      .limit(parseInt(limit))
      .lean();
    
    res.json({ 
      success: true, 
      data,
      count: data.length,
      timestamp: new Date().toISOString()
    });
  } catch (err) {
    console.error('GET /api/history error:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to fetch history',
      message: err.message 
    });
  }
};

exports.deleteHistory = async (req, res) => {
  try {
    const { historyId } = req.params;
    const result = await HistoryData.deleteOne({ historyId });
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ 
        success: false, 
        error: 'Record not found' 
      });
    }
    
    res.json({ 
      success: true, 
      message: 'Record deleted successfully',
      deletedCount: result.deletedCount
    });
  } catch (err) {
    console.error('DELETE /api/history/:historyId error:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to delete record' 
    });
  }
};