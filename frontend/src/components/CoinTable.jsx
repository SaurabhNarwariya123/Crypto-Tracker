// ...existing code...
import React, { useEffect, useState, useMemo } from 'react';

// If using Vite:
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function CoinTable() {
  const [coins, setCoins] = useState([]);
  const [query, setQuery] = useState('');
  const [sortKey, setSortKey] = useState('marketCap');
  const [direction, setDirection] = useState('desc');
  const [loading, setLoading] = useState(false);

  async function fetchCoins() {
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/api/coins`);
      if (!res.ok) {
        console.error("API Error:", res.status);
        return;
      }
      const data = await res.json();
      setCoins(data);
    } catch (err) {
      console.error("fetchCoins error", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchCoins();
    const interval = setInterval(fetchCoins, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = coins.filter(c =>
      !q || (c.name + c.symbol).toLowerCase().includes(q)
    );

    list.sort((a, b) => {
      const dir = direction === "asc" ? 1 : -1;
      const A = a[sortKey] ?? 0;
      const B = b[sortKey] ?? 0;
      return A < B ? -1 * dir : A > B ? 1 * dir : 0;
    });

    return list;
  }, [coins, query, sortKey, direction]);

  function toggleSort(key) {
    if (sortKey === key) {
      setDirection(d => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setDirection("desc");
    }
  }

  function renderSortIcon(key) {
    if (key !== sortKey) return <span style={{ opacity: 0.45, marginLeft: 6 }}>↕</span>;
    return direction === 'asc' ? <span style={{ marginLeft: 6 }}>▲</span> : <span style={{ marginLeft: 6 }}>▼</span>;
  }

  // Styles
  const containerStyle = {
    background: 'linear-gradient(180deg, #0f172a 0%, #071029 100%)', // darker bg for contrast
    padding: 24,
    borderRadius: 12,
    boxShadow: '0 10px 30px rgba(2,6,23,0.6)',
    color: '#e6eef8'
  };

  const innerStyle = {
    background: 'linear-gradient(180deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))',
    padding: 16,
    borderRadius: 10
  };

  const headerStyle = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14
  };

  const titleStyle = { margin: 0, fontSize: 20, color: '#e6eef8' };

  const controlsStyle = {
    display: 'flex',
    gap: 12,
    alignItems: 'center'
  };

  const searchWrap = {
    position: 'relative',
    display: 'flex',
    alignItems: 'center'
  };

  const searchInput = {
    padding: '10px 14px 10px 40px',
    width: 340,
    borderRadius: 999,
    border: '1px solid rgba(255,255,255,0.06)',
    background: 'rgba(255,255,255,0.02)',
    color: '#e6eef8',
    outline: 'none',
    transition: 'box-shadow 150ms ease'
  };

  const searchIcon = {
    position: 'absolute',
    left: 12,
    width: 16,
    height: 16,
    color: '#99a3b8'
  };

  const refreshBtn = {
    background: 'linear-gradient(90deg,#06b6d4,#3b82f6)',
    color: '#fff',
    border: 'none',
    padding: '8px 12px',
    borderRadius: 8,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    boxShadow: '0 6px 18px rgba(59,130,246,0.2)'
  };

  const tableStyle = {
    width: '100%',
    borderCollapse: 'separate',
    borderSpacing: 0,
    background: 'transparent',
    borderRadius: 8,
    overflow: 'hidden',
    color: '#cfe8ff'
  };

  const theadStyle = {
    background: 'linear-gradient(90deg, rgba(10,132,255,0.95), rgba(59,130,246,0.95))',
    color: '#fff',
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.7
  };

  const thBase = {
    padding: '12px 14px',
    cursor: 'pointer',
    userSelect: 'none',
    fontWeight: 600,
    textAlign: 'left',
    color: 'rgba(255,255,255,0.95)'
  };

  const tdBase = {
    padding: 12,
    verticalAlign: 'middle',
    color: '#dbeeff'
  };

  return (
    <div style={containerStyle}>
      <div style={innerStyle}>
        <div style={headerStyle}>
          <div>
            <h3 style={titleStyle}>Top 10 Cryptocurrencies</h3>
            <div style={{ color: '#9fb3d6', fontSize: 13 }}>Auto-refresh every 30 minutes · Data from CoinGecko</div>
          </div>

          <div style={controlsStyle}>
            <div style={searchWrap}>
              <svg style={searchIcon} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M21 21l-4.35-4.35" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6"/>
              </svg>

              <input
                placeholder="Search name or symbol..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                style={searchInput}
                onFocus={e => e.currentTarget.style.boxShadow = '0 8px 30px rgba(3,105,161,0.18)'}
                onBlur={e => e.currentTarget.style.boxShadow = 'none'}
              />
            </div>

            <button
              style={refreshBtn}
              onClick={fetchCoins}
              title="Refresh now"
            >
              <span style={{ transform: 'rotate(0deg)' }}>⟳</span>
              Refresh
            </button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: 24, color: '#9fb3d6' }}>Loading...</div>
        ) : (
          <table style={tableStyle}>
            <thead style={theadStyle}>
              <tr>
                <th style={{ ...thBase, width: '30%', borderRight: '1px solid rgba(255,255,255,0.06)' }} onClick={() => toggleSort('name')}>
                  Name {renderSortIcon('name')}
                </th>
                <th style={{ ...thBase, width: '10%', borderRight: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }} onClick={() => toggleSort('symbol')}>
                  Symbol {renderSortIcon('symbol')}
                </th>
                <th style={{ ...thBase, width: '20%', borderRight: '1px solid rgba(255,255,255,0.06)' }} onClick={() => toggleSort('priceUsd')}>
                  Price (USD) {renderSortIcon('priceUsd')}
                </th>
                <th style={{ ...thBase, width: '20%', borderRight: '1px solid rgba(255,255,255,0.06)' }} onClick={() => toggleSort('marketCap')}>
                  Market Cap {renderSortIcon('marketCap')}
                </th>
                <th style={{ ...thBase, width: '10%', borderRight: '1px solid rgba(255,255,255,0.06)', textAlign: 'center' }} onClick={() => toggleSort('priceChange24h')}>
                  24h % {renderSortIcon('priceChange24h')}
                </th>
                <th style={{ ...thBase, width: '10%', textAlign: 'center' }} onClick={() => toggleSort('lastUpdated')}>
                  Last Updated {renderSortIcon('lastUpdated')}
                </th>
              </tr>
            </thead>

            <tbody>
              {filtered.map((c, idx) => (
                <tr key={c.coinId} style={{
                  borderTop: "1px solid rgba(255,255,255,0.03)",
                  background: idx % 2 ? 'linear-gradient(180deg, rgba(255,255,255,0.01), transparent)' : 'transparent'
                }}>
                  <td style={{ ...tdBase, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <img src={c.image} alt="" width="28" style={{ borderRadius: 6, background: '#fff', padding: 2 }} />
                    <div>
                      <div style={{ fontWeight: 700, color: '#eaf6ff' }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: '#9fb3d6' }}>{c.symbol.toUpperCase()}</div>
                    </div>
                  </td>

                  <td style={{ ...tdBase, textAlign: 'center', textTransform: 'uppercase' }}>{c.symbol}</td>

                  <td style={{ ...tdBase }}>
                    {c.priceUsd?.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'USD'
                    })}
                  </td>

                  <td style={{ ...tdBase }}>{c.marketCap?.toLocaleString()}</td>

                  <td style={{ ...tdBase, textAlign: 'center', color: (c.priceChange24h ?? 0) >= 0 ? "#5eead4" : "#ff7a7a" }}>
                    {c.priceChange24h?.toFixed(2)}%
                  </td>

                  <td style={{ ...tdBase, textAlign: 'center' }}>
                    {c.lastUpdated ? new Date(c.lastUpdated).toLocaleString() : '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
// ...existing code...