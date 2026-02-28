import { useState, useEffect } from 'react'
import axios from 'axios'
import { Sun, Moon, Thermometer, Droplets, Power, Home, User, Settings } from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function App() {
  const [status, setStatus] = useState(null)
  const [loading, setLoading] = useState(true)

  const fetchStatus = async () => {
    try {
      const res = await axios.get(`${API_URL}/status`)
      setStatus(res.data)
    } catch (err) {
      console.error("Failed to fetch status", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchStatus()
    const interval = setInterval(fetchStatus, 5000)
    return () => clearInterval(interval)
  }, [])

  const toggleLights = async () => {
    try {
      await axios.post(`${API_URL}/toggle`, { device: 'lights' })
      fetchStatus()
    } catch (err) {
      console.error("Failed to toggle lights", err)
    }
  }

  const setMode = async (mode) => {
    try {
      await axios.post(`${API_URL}/mode`, { mode })
      fetchStatus()
    } catch (err) {
      console.error("Failed to set mode", err)
    }
  }

  if (loading) return <div className="loading">Loading Home Assistant...</div>

  return (
    <div className="container">
      <header>
        <h1>My Home</h1>
        <div className="status-badge">{status?.mode} Mode</div>
      </header>

      <main className="grid">
        <div className="card stat-card">
          <Thermometer size={24} color="#ff6b6b" />
          <div className="stat-info">
            <span className="label">Temperature</span>
            <span className="value">{status?.temperature}°C</span>
          </div>
        </div>

        <div className="card stat-card">
          <Droplets size={24} color="#4dabf7" />
          <div className="stat-info">
            <span className="label">Humidity</span>
            <span className="value">{status?.humidity}%</span>
          </div>
        </div>

        <div className={`card control-card ${status?.lights ? 'active' : ''}`} onClick={toggleLights}>
          <Power size={24} color={status?.lights ? '#ffd43b' : '#868e96'} />
          <div className="control-info">
            <span className="label">Living Room Lights</span>
            <span className="status-text">{status?.lights ? 'ON' : 'OFF'}</span>
          </div>
        </div>
      </main>

      <section className="modes">
        <h3>Scenes</h3>
        <div className="mode-buttons">
          <button className={status?.mode === 'Home' ? 'active' : ''} onClick={() => setMode('Home')}>
            <Home size={18} /> Home
          </button>
          <button className={status?.mode === 'Away' ? 'active' : ''} onClick={() => setMode('Away')}>
            <User size={18} /> Away
          </button>
          <button className={status?.mode === 'Night' ? 'active' : ''} onClick={() => setMode('Night')}>
            <Moon size={18} /> Night
          </button>
        </div>
      </section>

      <nav className="bottom-nav">
        <button className="nav-item active"><Home size={24} /><span>Home</span></button>
        <button className="nav-item"><Settings size={24} /><span>Settings</span></button>
      </nav>
    </div>
  )
}

export default App
