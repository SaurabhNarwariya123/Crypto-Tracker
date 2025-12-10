import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Trash2, 
  Download, 
  Filter, 
  AlertCircle,
  RefreshCw,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Server,
  Database,
  CheckCircle,
  XCircle,
  PlusCircle,
  Search
} from 'lucide-react';

// ✅ Correct API URL
const API_BASE_URL = 'http://localhost:5000';

const HistoryTable = () => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCoin, setSelectedCoin] = useState('all');
  const [coinsList, setCoinsList] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [backendConnected, setBackendConnected] = useState(false);
  const [showDebug, setShowDebug] = useState(false);

  // Test backend connection
  const testBackendConnection = async () => {
    try {
      console.log('🔍 Testing backend connection...');
      const response = await axios.get(`${API_BASE_URL}/api/coins`, {
        timeout: 5000
      });
      console.log('✅ Backend connected! Status:', response.status);
      setBackendConnected(true);
      return true;
    } catch (err) {
      console.error('❌ Backend connection failed:', err.message);
      setBackendConnected(false);
      return false;
    }
  };

  // Fetch history data
  const fetchHistory = async (coinId = 'all') => {
    try {
      setLoading(true);
      setError('');
      
      let url;
      if (coinId === 'all') {
        url = `${API_BASE_URL}/api/history`;
      } else {
        url = `${API_BASE_URL}/api/history/${coinId}`;
      }
      
      console.log('📡 Fetching history from:', url);
      
      const response = await axios.get(url, { timeout: 10000 });
      console.log('✅ History response:', response.data);
      
      // Handle response data
      let data = [];
      
      // Case 1: { success: true, data: [...] }
      if (response.data && response.data.success === true && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      // Case 2: Direct array [...]
      else if (Array.isArray(response.data)) {
        data = response.data;
      }
      // Case 3: { data: [...] } without success field
      else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      }
      
      console.log(`📊 Extracted ${data.length} records`);
      setHistoryData(data);
      setBackendConnected(true);
      
    } catch (err) {
      console.error('❌ Error fetching history:', err);
      
      let errorMsg = '';
      if (err.code === 'ECONNREFUSED') {
        errorMsg = `Cannot connect to backend at ${API_BASE_URL}`;
      } else if (err.response?.status === 404) {
        errorMsg = `API endpoint not found: ${err.config.url}\n\nMake sure your backend routes are configured correctly.`;
      } else if (err.message.includes('Network Error')) {
        errorMsg = 'Network error. Check if backend is running.';
      } else {
        errorMsg = err.response?.data?.error || err.message || 'Failed to fetch history';
      }
      
      setError(errorMsg);
      setBackendConnected(false);
      setHistoryData([]);
    } finally {
      setLoading(false);
    }
  };

  // Fetch coins list for filter dropdown
  const fetchCoinsList = async () => {
    try {
      console.log('📡 Fetching coins list...');
      const response = await axios.get(`${API_BASE_URL}/api/coins`, { timeout: 10000 });
      console.log('✅ Coins list:', response.data);
      
      if (Array.isArray(response.data)) {
        setCoinsList(response.data);
      } else if (response.data && Array.isArray(response.data.data)) {
        setCoinsList(response.data.data);
      } else {
        console.warn('Unexpected coins format:', response.data);
        setCoinsList([]);
      }
    } catch (err) {
      console.error('❌ Error fetching coins:', err);
      setCoinsList([]);
    }
  };

  // Store current snapshot
  const storeCurrentSnapshot = async () => {
    try {
      setIsSaving(true);
      console.log('💾 Saving snapshot to /api/history...');
      
      const response = await axios.post(`${API_BASE_URL}/api/history`, {}, {
        headers: { 'Content-Type': 'application/json' }
      });
      
      console.log('✅ Snapshot response:', response.data);
      
      if (response.data && response.data.success) {
        alert(`✅ ${response.data.message || 'Snapshot saved successfully!'}`);
      } else {
        alert('✅ Snapshot saved!');
      }
      
      // Refresh data after a short delay
      setTimeout(() => {
        fetchHistory(selectedCoin);
      }, 1000);
      
    } catch (err) {
      console.error('❌ Error saving snapshot:', err);
      
      let errorMsg = 'Failed to save snapshot';
      if (err.response?.status === 404) {
        errorMsg = `POST /api/history not found (404)\n\nMake sure:\n1. Backend is running\n2. Route is configured:\n   app.use('/api/history', historyRoutes)\n   router.post('/', storeHistory)`;
      } else if (err.response?.data?.error) {
        errorMsg = err.response.data.error;
      }
      
      alert(`❌ ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Delete a record
  const deleteRecord = async (recordId) => {
    if (!recordId) {
      alert('Invalid record ID');
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this record?')) {
      try {
        console.log('🗑️ Deleting record:', recordId);
        
        const response = await axios.delete(`${API_BASE_URL}/api/history/${recordId}`);
        console.log('✅ Delete response:', response.data);
        
        if (response.data && response.data.success) {
          alert('✅ Record deleted successfully!');
          fetchHistory(selectedCoin);
        } else {
          alert('❌ Failed to delete record');
        }
      } catch (err) {
        console.error('❌ Error deleting record:', err);
        alert(err.response?.data?.error || '❌ Failed to delete record');
      }
    }
  };

  // Refresh all data
  const refreshData = async () => {
    setLoading(true);
    const connected = await testBackendConnection();
    if (connected) {
      await Promise.all([
        fetchHistory(selectedCoin),
        fetchCoinsList()
      ]);
    } else {
      setLoading(false);
    }
  };

  // Initialize component
  useEffect(() => {
    refreshData();
  }, []);

  // When selectedCoin changes
  useEffect(() => {
    if (backendConnected) {
      fetchHistory(selectedCoin);
    }
  }, [selectedCoin]);

  // Format currency
  const formatCurrency = (value) => {
    if (!value || isNaN(value)) return '$0.00';
    const num = parseFloat(value);
    
    if (num >= 1e9) return `$${(num / 1e9).toFixed(2)}B`;
    if (num >= 1e6) return `$${(num / 1e6).toFixed(2)}M`;
    if (num >= 1e3) return `$${(num / 1e3).toFixed(2)}K`;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 6
    }).format(num);
  };

  // Format percentage
  const formatPercentage = (value) => {
    if (!value || isNaN(value)) return '0.00%';
    const num = parseFloat(value);
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Format date
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffHours = Math.floor((now - date) / (1000 * 60 * 60));
      
      if (diffHours < 24) {
        return `${diffHours} hour${diffHours !== 1 ? 's' : ''} ago`;
      }
      
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch (err) {
      return 'Invalid Date';
    }
  };

  // Get color for price change
  const getChangeColor = (value) => {
    if (!value || isNaN(value)) return 'text-gray-500';
    const num = parseFloat(value);
    return num >= 0 ? 'text-green-600' : 'text-red-600';
  };

  // Get background color for price change
  const getChangeBgColor = (value) => {
    if (!value || isNaN(value)) return 'bg-gray-100';
    const num = parseFloat(value);
    return num >= 0 ? 'bg-green-50' : 'bg-red-50';
  };

  // Get unique record ID
  const getRecordId = (record) => {
    return record.historyId || record._id || record.id || `${record.coinId}-${record.recordedAt}`;
  };

  // Filtered data based on search
  const filteredData = historyData.filter(record => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      record.name?.toLowerCase().includes(term) ||
      record.symbol?.toLowerCase().includes(term) ||
      record.coinId?.toLowerCase().includes(term)
    );
  });

  // Connection Status Component
  const ConnectionStatus = () => (
    <div className={`flex items-center justify-between px-4 py-3 rounded-lg ${backendConnected ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
      <div className="flex items-center">
        {backendConnected ? (
          <>
            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
            <div>
              <span className="font-medium text-green-800">Connected to Backend</span>
              <span className="text-sm text-green-600 ml-2">({API_BASE_URL})</span>
            </div>
          </>
        ) : (
          <>
            <XCircle className="h-5 w-5 text-red-600 mr-2" />
            <span className="font-medium text-red-800">Backend Disconnected</span>
          </>
        )}
      </div>
      <button
        onClick={() => setShowDebug(!showDebug)}
        className="text-sm text-gray-500 hover:text-gray-700"
      >
        {showDebug ? 'Hide Debug' : 'Show Debug'}
      </button>
    </div>
  );

  // Debug Info Component
  const DebugInfo = () => (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <h4 className="text-sm font-semibold text-gray-800 mb-2">Debug Information</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div>
          <p className="font-medium">API Endpoints:</p>
          <ul className="mt-1 space-y-1">
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${backendConnected ? 'bg-green-500' : 'bg-red-500'} mr-2`}></div>
              <code>GET {API_BASE_URL}/api/coins</code>
            </li>
            <li className="flex items-center">
              <div className={`w-2 h-2 rounded-full ${historyData.length > 0 ? 'bg-green-500' : 'bg-yellow-500'} mr-2`}></div>
              <code>GET {API_BASE_URL}/api/history</code>
            </li>
            <li className="flex items-center">
              <div className="w-2 h-2 rounded-full bg-blue-500 mr-2"></div>
              <code>POST {API_BASE_URL}/api/history</code>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-medium">Status:</p>
          <ul className="mt-1 space-y-1">
            <li>Backend: <span className={backendConnected ? 'text-green-600 font-medium' : 'text-red-600 font-medium'}>
              {backendConnected ? 'Connected' : 'Disconnected'}
            </span></li>
            <li>Records: <span className="font-medium">{historyData.length}</span></li>
            <li>Coins in list: <span className="font-medium">{coinsList.length}</span></li>
            <li>Selected coin: <span className="font-medium">{selectedCoin === 'all' ? 'All' : selectedCoin}</span></li>
          </ul>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col items-center justify-center h-96">
            <RefreshCw className="h-12 w-12 text-blue-500 animate-spin mb-6" />
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Initializing History Tracker</h2>
            <p className="text-gray-600">Connecting to backend server...</p>
            <ConnectionStatus />
          </div>
        </div>
      </div>
    );
  }

  if (error && !backendConnected) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <ConnectionStatus />
          
          <div className="mt-8 bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
            <div className="flex items-start">
              <AlertCircle className="h-8 w-8 text-red-500 mr-3 mt-1 flex-shrink-0" />
              <div>
                <h3 className="text-lg font-semibold text-red-800 mb-2">Connection Error</h3>
                <div className="text-red-700 whitespace-pre-line mb-6">{error}</div>
                
                <div className="bg-red-100 p-4 rounded-lg mb-6">
                  <h4 className="font-medium text-red-800 mb-3">Troubleshooting Steps:</h4>
                  <ol className="list-decimal list-inside text-red-700 space-y-2">
                    <li className="flex items-start">
                      <span className="mr-2">1.</span>
                      <span>Make sure backend is running:<br/>
                        <code className="bg-red-200 px-2 py-1 rounded text-sm mt-1 inline-block">npm start</code> in backend folder
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">2.</span>
                      <span>Check backend console for errors</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">3.</span>
                      <span>Test backend manually:<br/>
                        <a href={`${API_BASE_URL}/api/coins`} target="_blank" rel="noopener noreferrer" 
                           className="text-blue-600 hover:text-blue-800 underline">
                          Open {API_BASE_URL}/api/coins
                        </a>
                      </span>
                    </li>
                  </ol>
                </div>
                
                <div className="flex flex-wrap gap-3">
                  <button
                    onClick={refreshData}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center"
                  >
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Retry Connection
                  </button>
                  <button
                    onClick={storeCurrentSnapshot}
                    disabled={isSaving}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center disabled:opacity-50"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Test POST Request
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {showDebug && <DebugInfo />}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Connection Status */}
        <ConnectionStatus />
        
        {showDebug && <DebugInfo />}

        {/* Header */}
        <div className="mt-8 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
          <div>
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900">Cryptocurrency History Tracker</h1>
            <p className="text-gray-600 mt-2">Save and analyze historical price data</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full lg:w-auto">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search coins..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 w-full sm:w-64 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={refreshData}
                className="px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center justify-center whitespace-nowrap"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </button>
              
              <button
                onClick={storeCurrentSnapshot}
                disabled={isSaving || !backendConnected}
                className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center whitespace-nowrap"
              >
                {isSaving ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Take Snapshot
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-800">History Records</h3>
              <p className="text-gray-600 text-sm mt-1">
                {filteredData.length} record{filteredData.length !== 1 ? 's' : ''}
                {searchTerm && ` matching "${searchTerm}"`}
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center">
                <Filter className="h-5 w-5 text-gray-400 mr-2" />
                <select
                  value={selectedCoin}
                  onChange={(e) => setSelectedCoin(e.target.value)}
                  className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Coins</option>
                  {coinsList.map(coin => (
                    <option key={coin.coinId} value={coin.coinId}>
                      {coin.name} ({coin.symbol?.toUpperCase()})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {historyData.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="h-20 w-20 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <BarChart3 className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-3">No History Data Yet</h3>
              <p className="text-gray-600 mb-8">
                Take your first snapshot to start tracking cryptocurrency prices over time.
                This will save the current market data from CoinGecko.
              </p>
              <div className="space-y-4">
                <button
                  onClick={storeCurrentSnapshot}
                  disabled={isSaving || !backendConnected}
                  className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {isSaving ? (
                    <>
                      <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                      Taking Snapshot...
                    </>
                  ) : (
                    <>
                      <PlusCircle className="h-5 w-5 mr-2" />
                      Take First Snapshot
                    </>
                  )}
                </button>
                <button
                  onClick={refreshData}
                  className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 flex items-center justify-center"
                >
                  <RefreshCw className="h-5 w-5 mr-2" />
                  Refresh Data
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            {/* Table Header */}
            <div className="px-6 py-4 bg-gray-50 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-800">History Records</h3>
                <p className="text-gray-600 text-sm">
                  {filteredData.length} of {historyData.length} records shown
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm('')}
                    className="text-sm text-gray-600 hover:text-gray-800"
                  >
                    Clear search
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coin</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (USD)</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">24h Change</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Market Cap</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredData.map((record, index) => (
                    <tr key={getRecordId(record)} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{formatDate(record.recordedAt)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-sm font-bold text-blue-600">
                              {record.symbol?.charAt(0).toUpperCase() || 'C'}
                            </span>
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-gray-900">{record.name}</div>
                            <div className="text-xs text-gray-500">{record.symbol?.toUpperCase()}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-900">
                          {formatCurrency(record.priceUsd)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getChangeBgColor(record.priceChange24h)} ${getChangeColor(record.priceChange24h)}`}>
                          {record.priceChange24h >= 0 ? (
                            <TrendingUp className="h-4 w-4 mr-1" />
                          ) : (
                            <TrendingDown className="h-4 w-4 mr-1" />
                          )}
                          {formatPercentage(record.priceChange24h)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-700">
                          {formatCurrency(record.marketCap)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => deleteRecord(getRecordId(record))}
                          className="text-red-600 hover:text-red-800 flex items-center"
                        >
                          <Trash2 className="h-4 w-4 mr-1" />
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Table Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t">
              <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                <div className="text-sm text-gray-600">
                  Showing {filteredData.length} of {historyData.length} records
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Back to Top
                  </button>
                  <button
                    onClick={storeCurrentSnapshot}
                    disabled={isSaving}
                    className="px-4 py-2 text-sm text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg hover:from-blue-700 hover:to-blue-800 disabled:opacity-50"
                  >
                    {isSaving ? 'Saving...' : 'New Snapshot'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        
        
      </div>
    </div>
  );
};

export default HistoryTable;