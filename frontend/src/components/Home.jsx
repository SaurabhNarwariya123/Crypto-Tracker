import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  TrendingUp,
  Coins,
  History,
  Bitcoin,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Zap,
  Shield,
  BarChart3
} from "lucide-react";

const Home = () => {
  const [coinInput, setCoinInput] = useState("");
  const navigate = useNavigate();
  
  // Popular coins list with more coins
  const popularCoins = [
    { id: "bitcoin", name: "Bitcoin", symbol: "BTC", color: "from-yellow-500 to-orange-500" },
    { id: "ethereum", name: "Ethereum", symbol: "ETH", color: "from-purple-500 to-blue-500" },
    { id: "solana", name: "Solana", symbol: "SOL", color: "from-pink-500 to-purple-500" },
    { id: "cardano", name: "Cardano", symbol: "ADA", color: "from-blue-400 to-cyan-400" },
    { id: "dogecoin", name: "Dogecoin", symbol: "DOGE", color: "from-yellow-400 to-amber-400" },
    { id: "ripple", name: "Ripple", symbol: "XRP", color: "from-gray-600 to-blue-600" },
    { id: "polkadot", name: "Polkadot", symbol: "DOT", color: "from-pink-600 to-red-600" },
    { id: "chainlink", name: "Chainlink", symbol: "LINK", color: "from-blue-500 to-cyan-500" },
    { id: "litecoin", name: "Litecoin", symbol: "LTC", color: "from-gray-400 to-blue-400" },
    { id: "binancecoin", name: "Binance Coin", symbol: "BNB", color: "from-yellow-500 to-yellow-600" },
    { id: "matic-network", name: "Polygon", symbol: "MATIC", color: "from-purple-600 to-pink-600" },
    { id: "stellar", name: "Stellar", symbol: "XLM", color: "from-gray-700 to-blue-700" }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (coinInput.trim()) {
      navigate(`/coins/${coinInput.trim().toLowerCase()}`);
    }
  };

  const handleQuickView = (coinId) => {
    navigate(`/coins/${coinId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex flex-col items-center justify-center p-4 md:p-8">
      
      {/* Main Hero Section */}
      <div className="w-full max-w-7xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 border border-gray-700 rounded-3xl shadow-2xl p-8 md:p-12 flex flex-col items-center text-center gap-8 backdrop-blur-xl relative overflow-hidden">
        
        {/* Background Glow Effects */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl translate-x-1/3 translate-y-1/3"></div>
        
        {/* Animated Logo */}
        <div className="relative z-10">
          <div className="h-44 w-44 rounded-full bg-gradient-to-tr from-blue-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-extrabold text-5xl shadow-2xl animate-pulse border-4 border-white/20">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-600 to-pink-500 rounded-full blur-xl opacity-50 animate-ping"></div>
              <span className="relative">SN</span>
            </div>
          </div>
          <div className="absolute -inset-4 bg-gradient-to-tr from-blue-500/30 via-purple-600/30 to-pink-500/30 blur-2xl rounded-full"></div>
        </div>

        {/* Main Heading */}
        <div className="space-y-4 z-10">
          <h1 className="text-4xl md:text-7xl font-extrabold leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
              Crypto Tracker Pro
            </span>
          </h1>
          <p className="text-gray-300 text-lg md:text-xl max-w-3xl leading-relaxed">
            Real-time cryptocurrency tracking with advanced analytics, historical data, 
            and portfolio management. Powered by <span className="text-yellow-400 font-semibold">CoinGecko API</span> 
            and <span className="text-green-400 font-semibold">MongoDB</span> for reliable data storage.
          </p>
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full max-w-4xl z-10">
          <Link to="/coins" className="group">
            <div className="bg-gradient-to-br from-blue-800/50 to-blue-900/50 border border-blue-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-blue-500 hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-blue-600/20 rounded-lg">
                  <Coins className="h-6 w-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white">All Coins</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">Browse 1000+ cryptocurrencies with real-time data</p>
              <div className="flex items-center text-blue-400 text-sm">
                <span>Explore Now</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <Link to="/history" className="group">
            <div className="bg-gradient-to-br from-purple-800/50 to-purple-900/50 border border-purple-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-purple-500 hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-purple-600/20 rounded-lg">
                  <History className="h-6 w-6 text-purple-400" />
                </div>
                <h3 className="text-lg font-bold text-white">History</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">View historical price data and trends</p>
              <div className="flex items-center text-purple-400 text-sm">
                <span>View History</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>

          <div onClick={() => handleQuickView("bitcoin")} className="group cursor-pointer">
            <div className="bg-gradient-to-br from-yellow-800/50 to-orange-900/50 border border-yellow-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-yellow-500 hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-yellow-600/20 rounded-lg">
                  <Bitcoin className="h-6 w-6 text-yellow-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Bitcoin</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">Explore Bitcoin's detailed price history</p>
              <div className="flex items-center text-yellow-400 text-sm">
                <span>View Details</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          <Link to="/coins/ethereum" className="group">
            <div className="bg-gradient-to-br from-cyan-800/50 to-blue-900/50 border border-cyan-700/50 rounded-2xl p-6 backdrop-blur-sm hover:border-cyan-500 hover:scale-[1.02] transition-all duration-300">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-cyan-600/20 rounded-lg">
                  <Sparkles className="h-6 w-6 text-cyan-400" />
                </div>
                <h3 className="text-lg font-bold text-white">Ethereum</h3>
              </div>
              <p className="text-gray-400 text-sm mb-3">Analyze Ethereum's market performance</p>
              <div className="flex items-center text-cyan-400 text-sm">
                <span>Explore ETH</span>
                <ArrowRight className="h-4 w-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </Link>
        </div>

        {/* SEARCH SECTION */}
        <div className="w-full max-w-3xl mt-8 p-8 bg-gradient-to-br from-gray-800/60 to-gray-900/60 rounded-2xl border border-gray-700 backdrop-blur-lg z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-r from-cyan-600 to-green-600 rounded-lg">
              <Search className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">
                Search Any Cryptocurrency
              </h2>
              <p className="text-gray-400 text-sm">Enter coin ID to view detailed analytics</p>
            </div>
          </div>
          
          {/* Search Form */}
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <input
                  type="text"
                  value={coinInput}
                  onChange={(e) => setCoinInput(e.target.value)}
                  placeholder="e.g., bitcoin, ethereum, solana, cardano, dogecoin..."
                  className="w-full px-6 py-4 bg-gray-900/80 border-2 border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20 transition-all"
                  autoComplete="off"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <TrendingUp className="h-5 w-5 text-gray-500" />
                </div>
              </div>
              
              <button
                type="submit"
                disabled={!coinInput.trim()}
                className={`px-8 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                  coinInput.trim()
                    ? 'bg-gradient-to-r from-cyan-600 to-green-600 hover:from-cyan-500 hover:to-green-500 hover:shadow-2xl hover:scale-105 text-white'
                    : 'bg-gray-800 text-gray-500 cursor-not-allowed'
                }`}
              >
                <Search className="h-5 w-5" />
                Search Coin
              </button>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <p className="text-gray-400">
                Coin ID must be lowercase. Example: <code className="bg-gray-900 px-2 py-1 rounded">bitcoin</code>
              </p>
              <p className="text-cyan-400">
                Powered by CoinGecko API
              </p>
            </div>
          </form>

          {/* Popular Coins Carousel */}
          <div className="mt-8 pt-8 border-t border-gray-700">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Popular Coins</h3>
              <Link to="/coins" className="text-sm text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
                View All <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {popularCoins.map((coin) => (
                <div
                  key={coin.id}
                  onClick={() => handleQuickView(coin.id)}
                  className="group cursor-pointer"
                >
                  <div className="bg-gray-900/60 hover:bg-gray-800/80 border border-gray-700 hover:border-cyan-500/30 rounded-xl p-4 transition-all duration-300 hover:scale-105 hover:shadow-xl">
                    <div className={`h-10 w-10 rounded-lg bg-gradient-to-br ${coin.color} flex items-center justify-center text-white font-bold text-sm mb-3 mx-auto`}>
                      {coin.symbol.slice(0, 3)}
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-semibold text-white truncate">{coin.symbol}</div>
                      <div className="text-xs text-gray-400 truncate mt-1">{coin.name}</div>
                    </div>
                    <div className="mt-3 text-xs text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity text-center">
                      Click to view →
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>     
      </div>
      <div className="mt-12 w-full max-w-4xl">
        <h3 className="text-2xl font-bold text-white text-center mb-8">
          <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Quick Navigation
          </span>
        </h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { id: "bitcoin", name: "Bitcoin Details", desc: "View BTC price history", icon: "₿", color: "from-yellow-500 to-orange-500" },
            { id: "ethereum", name: "Ethereum Analytics", desc: "ETH market analysis", icon: "Ξ", color: "from-purple-500 to-blue-500" },
            { id: "solana", name: "Solana Tracking", desc: "SOL performance charts", icon: "◎", color: "from-pink-500 to-purple-500" },
            { id: "cardano", name: "Cardano Insights", desc: "ADA historical data", icon: "A", color: "from-blue-400 to-cyan-400" },
            { id: "dogecoin", name: "Dogecoin Trends", desc: "DOGE price movements", icon: "Ð", color: "from-yellow-400 to-amber-400" },
            { id: "ripple", name: "Ripple Analysis", desc: "XRP market trends", icon: "X", color: "from-gray-600 to-blue-600" },
          ].map((coin) => (
            <div
              key={coin.id}
              onClick={() => handleQuickView(coin.id)}
              className="group cursor-pointer"
            >
              <div className="bg-gradient-to-br from-gray-800/60 to-gray-900/60 border border-gray-700 rounded-xl p-4 backdrop-blur-sm hover:border-cyan-500/50 hover:shadow-xl transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg bg-gradient-to-br ${coin.color} flex items-center justify-center text-white font-bold text-xl`}>
                    {coin.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold text-white">{coin.name}</h4>
                    <p className="text-sm text-gray-400">{coin.desc}</p>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-12 pt-8 border-t border-gray-800 w-full max-w-4xl text-center">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
          <div className="text-gray-400 text-sm">
            <p className="font-semibold text-gray-300">© 2024 Saurabh Narwaiya • Crypto Tracker Pro</p>
            <p>All cryptocurrency data provided by CoinGecko API</p>
          </div>
          
          
        </div>
        
        
      </footer>
    </div>
  );
};

export default Home;