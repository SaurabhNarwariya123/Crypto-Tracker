import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  ArrowLeft,
  Calendar,
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  RefreshCw,
  Download,
  Clock,
  Activity,
  ChevronRight,
  Info,
  ExternalLink,
  Database,
  Hash,
  Layers,
  ArrowUpDown,
  Percent,
  Globe,
  Users,
  Target,
  AlertCircle,
  LineChart
} from 'lucide-react';

const CoinDetail = () => {
  const { coinId } = useParams();
  const navigate = useNavigate();
  const [historyData, setHistoryData] = useState([]);
  const [currentData, setCurrentData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [timeRange, setTimeRange] = useState('7d');
  const [sortBy, setSortBy] = useState('recordedAt');
  const [sortOrder, setSortOrder] = useState('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // ✅ BACKEND API ENDPOINTS - आपके actual endpoints के according adjust करें
  const API_BASE_URL = 'http://localhost:5000/api';
  
  // 1. Fetch coin history from MongoDB
  const fetchCoinHistory = async () => {
    try {
      console.log('Fetching history for coin:', coinId);
      
      // यहाँ आपकी history API endpoint होगी
      // आपके data के according endpoint adjust करें
      const response = await axios.get(`${API_BASE_URL}/history/${coinId}`);
      // या फिर: const response = await axios.get(`${API_BASE_URL}/history/coin/${coinId}`);
      // या फिर: const response = await axios.get(`${API_BASE_URL}/history?coinId=${coinId}`);
      
      console.log('History API Response:', response.data);
      
      let data = [];
      
      // Different response formats handling
      if (response.data && response.data.success) {
        data = response.data.data || response.data.history || [];
      } else if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (response.data && response.data.history) {
        data = response.data.history;
      }
      
      // Filter only data for this specific coin
      data = data.filter(item => item.coinId === coinId);
      
      console.log('Filtered history data:', data);
      
      // Sort data
      if (sortBy === 'recordedAt') {
        data.sort((a, b) => {
          const dateA = new Date(a.recordedAt);
          const dateB = new Date(b.recordedAt);
          return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
        });
      } else if (sortBy === 'priceUsd') {
        data.sort((a, b) => {
          return sortOrder === 'desc' ? b.priceUsd - a.priceUsd : a.priceUsd - b.priceUsd;
        });
      } else if (sortBy === 'priceChange24h') {
        data.sort((a, b) => {
          return sortOrder === 'desc' ? b.priceChange24h - a.priceChange24h : a.priceChange24h - b.priceChange24h;
        });
      }
      
      setHistoryData(data);
      
      // Set current data from latest record if available
      if (data.length > 0) {
        const latestRecord = sortOrder === 'desc' ? data[0] : data[data.length - 1];
        setCurrentData({
          name: latestRecord.name,
          symbol: latestRecord.symbol,
          priceUsd: latestRecord.priceUsd,
          priceChange24h: latestRecord.priceChange24h,
          marketCap: latestRecord.marketCap,
          coinId: latestRecord.coinId
        });
      }
      
    } catch (err) {
      console.error('Error fetching coin history:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch coin history');
    }
  };

  // 2. Fetch current coin price from coins endpoint
  const fetchCurrentCoinData = async () => {
    try {
      console.log('Fetching current data for coin:', coinId);
      
      // Try to get current price from /api/coins endpoint
      const response = await axios.get(`${API_BASE_URL}/coins`);
      
      console.log('Current coins response:', response.data);
      
      if (Array.isArray(response.data)) {
        const coin = response.data.find(c => c.coinId === coinId);
        if (coin) {
          setCurrentData(prev => ({
            ...prev,
            name: coin.name,
            symbol: coin.symbol,
            priceUsd: coin.priceUsd,
            priceChange24h: coin.priceChange24h,
            marketCap: coin.marketCap,
            coinId: coin.coinId
          }));
        }
      } else if (response.data && Array.isArray(response.data.data)) {
        const coin = response.data.data.find(c => c.coinId === coinId);
        if (coin) {
          setCurrentData(prev => ({
            ...prev,
            name: coin.name,
            symbol: coin.symbol,
            priceUsd: coin.priceUsd,
            priceChange24h: coin.priceChange24h,
            marketCap: coin.marketCap,
            coinId: coin.coinId
          }));
        }
      }
      
    } catch (err) {
      console.error('Error fetching current coin data:', err);
      // Silently fail, we'll use history data
    }
  };

  // 3. Fetch all data
  const fetchAllData = async () => {
    try {
      setLoading(true);
      setError('');
      
      await Promise.all([
        fetchCoinHistory(),
        fetchCurrentCoinData()
      ]);
      
    } catch (err) {
      console.error('Error fetching all data:', err);
      setError('Failed to load coin data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // ✅ Calculate statistics
  const calculateStats = () => {
    if (historyData.length === 0) return null;
    
    const prices = historyData.map(d => d.priceUsd);
    const changes = historyData.map(d => d.priceChange24h);
    const marketCaps = historyData.map(d => d.marketCap);
    
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
    const avgChange = changes.reduce((a, b) => a + b, 0) / changes.length;
    const avgMarketCap = marketCaps.reduce((a, b) => a + b, 0) / marketCaps.length;
    
    // Price changes for volatility calculation
    const priceChanges = [];
    for (let i = 1; i < prices.length; i++) {
      const change = ((prices[i] - prices[i-1]) / prices[i-1]) * 100;
      priceChanges.push(change);
    }
    
    const meanChange = priceChanges.length > 0 
      ? priceChanges.reduce((a, b) => a + b, 0) / priceChanges.length 
      : 0;
    
    const squaredDiffs = priceChanges.map(change => Math.pow(change - meanChange, 2));
    const variance = squaredDiffs.length > 0 
      ? squaredDiffs.reduce((a, b) => a + b, 0) / squaredDiffs.length 
      : 0;
    
    const volatility = Math.sqrt(variance);
    
    // Find first and last dates
    const sortedByDate = [...historyData].sort((a, b) => 
      new Date(a.recordedAt) - new Date(b.recordedAt)
    );
    
    return {
      minPrice,
      maxPrice,
      avgPrice,
      avgChange,
      avgMarketCap,
      priceRange: maxPrice - minPrice,
      volatility: isNaN(volatility) ? 0 : volatility,
      totalRecords: historyData.length,
      firstDate: sortedByDate.length > 0 ? new Date(sortedByDate[0].recordedAt) : null,
      lastDate: sortedByDate.length > 0 ? new Date(sortedByDate[sortedByDate.length - 1].recordedAt) : null
    };
  };

  // ✅ Filter data by time range
  const getFilteredData = () => {
    if (timeRange === 'all' || historyData.length === 0) return historyData;
    
    const now = new Date();
    let cutoffDate = new Date();
    
    switch (timeRange) {
      case '7d':
        cutoffDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        cutoffDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        cutoffDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        cutoffDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        return historyData;
    }
    
    return historyData.filter(record => new Date(record.recordedAt) >= cutoffDate);
  };

  // ✅ Format currency
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '$0.00';
    if (value >= 1e12) return `$${(value / 1e12).toFixed(2)}T`;
    if (value >= 1e9) return `$${(value / 1e9).toFixed(2)}B`;
    if (value >= 1e6) return `$${(value / 1e6).toFixed(2)}M`;
    if (value >= 1e3) return `$${(value / 1e3).toFixed(2)}K`;
    if (value >= 1) return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    return `$${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })}`;
  };

  // ✅ Format percentage
  const formatPercentage = (value) => {
    if (!value || isNaN(value)) return '0.00%';
    const num = parseFloat(value);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // ✅ Format date
  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // ✅ Format date with time
  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // ✅ Get color for price change
  const getChangeColor = (value) => {
    if (!value || isNaN(value)) return 'text-gray-500';
    const num = parseFloat(value);
    return num >= 0 ? 'text-green-500' : 'text-red-500';
  };

  // ✅ Get background color for price change
  const getChangeBgColor = (value) => {
    if (!value || isNaN(value)) return 'bg-gray-900';
    const num = parseFloat(value);
    return num >= 0 ? 'bg-green-900/30' : 'bg-red-900/30';
  };

  // ✅ Initialize
  useEffect(() => {
    if (coinId) {
      fetchAllData();
    }
  }, [coinId, sortBy, sortOrder]);

  // ✅ Refresh data
  const refreshData = () => {
    setLoading(true);
    fetchAllData();
  };

  // ✅ Handle sort
  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  // ✅ Pagination
  const totalPages = Math.ceil(historyData.length / itemsPerPage);
  const paginatedData = historyData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const stats = calculateStats();
  const filteredData = getFilteredData();

  // ✅ DEBUG: Console log for troubleshooting
  useEffect(() => {
    console.log('Current coinId:', coinId);
    console.log('Current data:', currentData);
    console.log('History data length:', historyData.length);
    console.log('Filtered data length:', filteredData.length);
  }, [coinId, currentData, historyData, filteredData]);

  // ✅ Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-96">
            <div className="relative">
              <RefreshCw className="h-16 w-16 text-cyan-500 animate-spin mb-4" />
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full"></div>
            </div>
            <h2 className="text-2xl font-semibold text-white mt-6">
              Loading {coinId ? coinId.charAt(0).toUpperCase() + coinId.slice(1) : 'Coin'} Data
            </h2>
            <p className="text-gray-400 mt-2">Fetching data from database...</p>
            <div className="mt-4 flex items-center gap-2">
              <Database className="h-4 w-4 text-gray-500" />
              <span className="text-sm text-gray-500">Querying MongoDB for history</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ Error State with debugging info
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-red-900/20 border-l-4 border-red-500 p-6 rounded-lg backdrop-blur-sm">
            <div className="flex items-start">
              <AlertCircle className="h-8 w-8 text-red-400 mr-3 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-300 mb-2">Database Error</h3>
                <p className="text-red-200 mb-4">{error}</p>
                
                <div className="bg-gray-900/50 p-4 rounded-lg mb-4">
                  <p className="text-gray-300 text-sm mb-2">Debug Information:</p>
                  <div className="space-y-1">
                    <p className="text-gray-400 text-sm">
                      Coin ID: <code className="bg-gray-800 px-2 py-1 rounded ml-2">{coinId}</code>
                    </p>
                    <p className="text-gray-400 text-sm">
                      API Endpoint: <code className="bg-gray-800 px-2 py-1 rounded ml-2">
                        {API_BASE_URL}/history/{coinId}
                      </code>
                    </p>
                    <p className="text-gray-400 text-sm">
                      Alternative Endpoints to try:
                    </p>
                    <ul className="text-gray-400 text-sm ml-4 space-y-1">
                      <li><code className="bg-gray-800 px-2 py-1 rounded text-xs">{API_BASE_URL}/history/coin/{coinId}</code></li>
                      <li><code className="bg-gray-800 px-2 py-1 rounded text-xs">{API_BASE_URL}/history?coinId={coinId}</code></li>
                      <li><code className="bg-gray-800 px-2 py-1 rounded text-xs">{API_BASE_URL}/coins/{coinId}/history</code></li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={refreshData}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 flex items-center gap-2"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry
                  </button>
                  <button
                    onClick={() => navigate('/coins')}
                    className="px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600"
                  >
                    Back to All Coins
                  </button>
                  <button
                    onClick={() => navigate('/history')}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    View History Table
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ✅ No Data State
  if (historyData.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center mb-8">
            <button
              onClick={() => navigate('/coins')}
              className="flex items-center text-gray-400 hover:text-white group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Coins
            </button>
          </div>
          
          <div className="bg-gray-800/40 rounded-2xl border-2 border-dashed border-gray-700 p-12 text-center backdrop-blur-sm">
            <Database className="h-20 w-20 text-gray-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold text-white mb-3">
              No History Data Found
            </h2>
            <p className="text-gray-400 mb-6 max-w-md mx-auto">
              No historical records found for <span className="font-semibold text-cyan-400">{coinId}</span>.
            </p>
            
            <div className="bg-gray-900/50 p-4 rounded-lg max-w-md mx-auto mb-6">
              <p className="text-sm text-gray-300 mb-2">Suggested actions:</p>
              <ul className="text-sm text-gray-400 space-y-2 text-left">
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-gray-600 rounded-full mt-1.5"></div>
                  Check if the coin ID is correct: <code className="bg-gray-800 px-2 py-1 rounded ml-2">{coinId}</code>
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-gray-600 rounded-full mt-1.5"></div>
                  Verify that history data is being recorded for this coin
                </li>
                <li className="flex items-start gap-2">
                  <div className="h-1.5 w-1.5 bg-gray-600 rounded-full mt-1.5"></div>
                  Try popular coins: Bitcoin, Ethereum, Solana
                </li>
              </ul>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={() => navigate('/coins')}
                className="px-6 py-3 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 w-full max-w-xs"
              >
                Browse Available Coins
              </button>
              <button
                onClick={() => navigate(`/coins/bitcoin`)}
                className="px-6 py-3 bg-yellow-600/20 text-yellow-400 border border-yellow-600/30 rounded-lg hover:bg-yellow-600/30 w-full max-w-xs"
              >
                View Bitcoin Example
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/coins')}
              className="flex items-center text-gray-400 hover:text-white mr-4 group"
            >
              <ArrowLeft className="h-5 w-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              Back to Coins
            </button>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  {currentData?.name || coinId?.charAt(0).toUpperCase() + coinId?.slice(1)}
                </h1>
                <span className="text-xl text-gray-400">
                  ({currentData?.symbol?.toUpperCase() || coinId?.toUpperCase()})
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <div className="flex items-center text-sm text-gray-400">
                  <Hash className="h-4 w-4 mr-1" />
                  <span className="font-mono bg-gray-800 px-2 py-1 rounded">{coinId}</span>
                </div>
                <div className="flex items-center text-sm text-gray-400">
                  <Database className="h-4 w-4 mr-1" />
                  <span>{historyData.length} historical records</span>
                </div>
                {currentData?.marketCap && (
                  <div className="flex items-center text-sm text-gray-400">
                    <Globe className="h-4 w-4 mr-1" />
                    <span>Market Cap: {formatCurrency(currentData.marketCap)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={refreshData}
              className="px-4 py-2 border border-gray-700 rounded-lg hover:bg-gray-800 flex items-center gap-2"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
            <a
              href={`https://www.coingecko.com/en/coins/${coinId}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 text-white rounded-lg hover:from-cyan-500 hover:to-blue-500 flex items-center gap-2"
            >
              <ExternalLink className="h-4 w-4" />
              CoinGecko
            </a>
          </div>
        </div>

        {/* Current Price & Stats */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          {/* Current Price Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-300">Current Price</h3>
              <DollarSign className="h-5 w-5 text-cyan-400" />
            </div>
            <div className="text-3xl font-bold text-white mb-2">
              {formatCurrency(currentData?.priceUsd || stats?.avgPrice || 0)}
            </div>
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getChangeBgColor(currentData?.priceChange24h)} ${getChangeColor(currentData?.priceChange24h)}`}>
              {currentData?.priceChange24h >= 0 ? (
                <TrendingUp className="h-4 w-4 mr-1" />
              ) : (
                <TrendingDown className="h-4 w-4 mr-1" />
              )}
              {formatPercentage(currentData?.priceChange24h || 0)}
            </div>
          </div>

          {/* Price Range Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-300">Price Range</h3>
              <Activity className="h-5 w-5 text-green-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Highest</span>
                <span className="font-semibold text-green-400">{formatCurrency(stats?.maxPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Lowest</span>
                <span className="font-semibold text-red-400">{formatCurrency(stats?.minPrice)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Average</span>
                <span className="font-semibold text-cyan-400">{formatCurrency(stats?.avgPrice)}</span>
              </div>
            </div>
          </div>

          {/* Tracking Period Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-300">Tracking Period</h3>
              <Calendar className="h-5 w-5 text-purple-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">First Record</span>
                <span className="font-medium">{formatDate(stats?.firstDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Last Record</span>
                <span className="font-medium">{formatDate(stats?.lastDate)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Total Records</span>
                <span className="font-medium">{historyData.length}</span>
              </div>
            </div>
          </div>

          {/* Market Stats Card */}
          <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-300">Market Stats</h3>
              <BarChart3 className="h-5 w-5 text-yellow-400" />
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg Market Cap</span>
                <span className="font-medium">{formatCurrency(stats?.avgMarketCap)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Avg 24h Change</span>
                <span className={`font-medium ${getChangeColor(stats?.avgChange)}`}>
                  {formatPercentage(stats?.avgChange)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-400">Volatility</span>
                <span className="font-medium">{stats?.volatility?.toFixed(2)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Chart Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden mb-8 backdrop-blur-sm">
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-300">Price History</h3>
              <p className="text-gray-500 text-sm">
                {filteredData.length} records • {formatDate(stats?.firstDate)} to {formatDate(stats?.lastDate)}
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center space-x-2">
                {['7d', '30d', '90d', '1y', 'all'].map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 text-sm rounded-lg transition-all ${
                      timeRange === range 
                        ? 'bg-cyan-600 text-white font-medium' 
                        : 'text-gray-400 hover:bg-gray-800'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : 
                     range === '30d' ? '30 Days' : 
                     range === '90d' ? '90 Days' : 
                     range === '1y' ? '1 Year' : 'All Time'}
                  </button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="p-6">
            {filteredData.length > 0 ? (
              <div className="h-64 relative">
                <div className="flex items-end h-full space-x-1">
                  {filteredData.slice(-50).map((record, index) => {
                    const prices = filteredData.slice(-50).map(d => d.priceUsd);
                    const maxPrice = Math.max(...prices);
                    const minPrice = Math.min(...prices);
                    const priceRange = maxPrice - minPrice;
                    const height = priceRange > 0 
                      ? ((record.priceUsd - minPrice) / priceRange) * 100 
                      : 50;
                    
                    return (
                      <div
                        key={index}
                        className="flex-1 group relative"
                        style={{ height: '100%' }}
                      >
                        <div
                          className={`w-full ${record.priceChange24h >= 0 ? 'bg-gradient-to-t from-green-500 to-green-600' : 'bg-gradient-to-t from-red-500 to-red-600'} rounded-t transition-all duration-300 hover:opacity-80 cursor-pointer`}
                          style={{ height: `${height}%` }}
                          title={`${formatCurrency(record.priceUsd)} • ${formatDate(record.recordedAt)}`}
                        >
                          <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 shadow-xl border border-gray-700">
                            <div className="font-bold">{formatCurrency(record.priceUsd)}</div>
                            <div className="text-gray-400">{formatDate(record.recordedAt)}</div>
                            <div className={`mt-1 ${getChangeColor(record.priceChange24h)}`}>
                              {formatPercentage(record.priceChange24h)}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-700">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-t from-green-500 to-green-600 rounded"></div>
                      <span className="text-sm text-gray-400">Price Increase</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 bg-gradient-to-t from-red-500 to-red-600 rounded"></div>
                      <span className="text-sm text-gray-400">Price Decrease</span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-500">
                    {filteredData.length} data points shown
                  </div>
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <LineChart className="h-12 w-12 text-gray-600 mx-auto mb-4" />
                  <p className="text-gray-500">No data available for selected time range</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Data Table */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl border border-gray-700 overflow-hidden backdrop-blur-sm mb-8">
          <div className="px-6 py-4 bg-gray-800/50 border-b border-gray-700 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <h3 className="text-lg font-semibold text-gray-300">Historical Records</h3>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-400">Sort by:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="bg-gray-900 border border-gray-700 rounded px-3 py-2 text-sm text-white"
                >
                  <option value="recordedAt">Date</option>
                  <option value="priceUsd">Price</option>
                  <option value="priceChange24h">24h Change</option>
                </select>
                <button
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                  className="px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm flex items-center gap-1"
                >
                  {sortOrder === 'desc' ? 'Desc ↓' : 'Asc ↑'}
                </button>
              </div>
              <span className="text-sm text-gray-500">
                Page {currentPage} of {totalPages} • {historyData.length} total records
              </span>
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-800/50">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800/70 transition-colors"
                    onClick={() => handleSort('recordedAt')}
                  >
                    <div className="flex items-center">
                      Date & Time
                      {sortBy === 'recordedAt' && (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800/70 transition-colors"
                    onClick={() => handleSort('priceUsd')}
                  >
                    <div className="flex items-center">
                      Price (USD)
                      {sortBy === 'priceUsd' && (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-800/70 transition-colors"
                    onClick={() => handleSort('priceChange24h')}
                  >
                    <div className="flex items-center">
                      24h Change
                      {sortBy === 'priceChange24h' && (
                        <ArrowUpDown className="h-3 w-3 ml-1" />
                      )}
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Market Cap
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                    Symbol
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {paginatedData.map((record, index) => (
                  <tr key={index} className="hover:bg-gray-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 text-gray-500 mr-2" />
                        <div>
                          <div className="text-sm font-medium text-white">
                            {formatDate(record.recordedAt)}
                          </div>
                          <div className="text-xs text-gray-500">
                            {new Date(record.recordedAt).toLocaleTimeString([], { 
                              hour: '2-digit', 
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-white">
                        {formatCurrency(record.priceUsd)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm ${getChangeBgColor(record.priceChange24h)} ${getChangeColor(record.priceChange24h)}`}>
                        {record.priceChange24h >= 0 ? (
                          <TrendingUp className="h-4 w-4 mr-1" />
                        ) : (
                          <TrendingDown className="h-4 w-4 mr-1" />
                        )}
                        {formatPercentage(record.priceChange24h)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-300">
                        {formatCurrency(record.marketCap)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-400">
                        {record.symbol?.toUpperCase()}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 bg-gray-800/50 border-t border-gray-700">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    currentPage === 1 
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Previous
                </button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-10 h-10 rounded flex items-center justify-center ${
                          currentPage === pageNum 
                            ? 'bg-cyan-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                  
                  {totalPages > 5 && (
                    <>
                      <span className="text-gray-500 mx-1">...</span>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        className={`w-10 h-10 rounded flex items-center justify-center ${
                          currentPage === totalPages 
                            ? 'bg-cyan-600 text-white' 
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                        }`}
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>
                
                <button
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className={`px-4 py-2 rounded-lg flex items-center gap-2 ${
                    currentPage === totalPages 
                      ? 'bg-gray-900 text-gray-600 cursor-not-allowed' 
                      : 'bg-gray-800 text-white hover:bg-gray-700'
                  }`}
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Export Section */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-xl border border-gray-700 p-6 backdrop-blur-sm">
          <h3 className="text-lg font-semibold text-gray-300 mb-4">Export Data</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => {
                const csvContent = [
                  ['Date', 'Time', 'Price (USD)', '24h Change (%)', 'Market Cap (USD)', 'Coin ID', 'Name', 'Symbol'],
                  ...historyData.map(record => [
                    new Date(record.recordedAt).toLocaleDateString(),
                    new Date(record.recordedAt).toLocaleTimeString(),
                    record.priceUsd,
                    record.priceChange24h,
                    record.marketCap,
                    record.coinId,
                    record.name,
                    record.symbol
                  ])
                ].map(row => row.join(',')).join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${coinId}-history-${new Date().toISOString().split('T')[0]}.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export as CSV
            </button>
            
            <button
              onClick={() => {
                const jsonStr = JSON.stringify(historyData, null, 2);
                const blob = new Blob([jsonStr], { type: 'application/json' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `${coinId}-history-${new Date().toISOString().split('T')[0]}.json`;
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
            >
              <Download className="h-4 w-4" />
              Export as JSON
            </button>
            
            <button
              onClick={() => {
                const sampleData = historyData.slice(0, 5);
                const jsonStr = JSON.stringify(sampleData, null, 2);
                navigator.clipboard.writeText(jsonStr);
                alert('First 5 records copied to clipboard!');
              }}
              className="px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2"
            >
              <Layers className="h-4 w-4" />
              Copy Sample Data
            </button>
          </div>
          
          <div className="mt-4 pt-4 border-t border-gray-700">
            <p className="text-sm text-gray-400">
              Database Info: {historyData.length} records • Updated: {formatDateTime(stats?.lastDate)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;