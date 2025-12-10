// historyRoutes.js
const express = require('express');
const router = express.Router();

const {
  storeHistory,
  getCoinHistory,
  getAllHistory,
  deleteHistory
} = require('../controllers/cryptoController');

router.post('/', storeHistory); 
router.get('/', getAllHistory); 
router.get('/:coinId', getCoinHistory); 
router.delete('/:historyId', deleteHistory); 

module.exports = router;