import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '../src/components/Home'
import CoinTable from '../src/components/CoinTable'
import CoinDetail from '../src/components/CoinDetail'
import HistoryTable from '../src/components/HistoryTable'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
   <Router>
      <div className="p-6">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/coins" element={<CoinTable/>} />
          <Route path="/coins/:coinId" element={<CoinDetail />} />
          <Route path="/history" element={<HistoryTable />} />
        </Routes>
      </div>
    </Router>
  )
}

export default App
