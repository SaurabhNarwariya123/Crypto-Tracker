const express = require('express');
const router = express.Router();

const {
  getCoins,
  storeHistory,
  getCoinHistory
} = require('../controllers/cryptoController');

// ROUTES
router.get('/', getCoins);
router.post('/history', storeHistory);
router.get('/history/:coinId', getCoinHistory);

module.exports = router;
