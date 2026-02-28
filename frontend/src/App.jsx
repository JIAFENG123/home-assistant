import { useState, useEffect } from 'react'
import axios from 'axios'
import { 
  Sun, Moon, Thermometer, Droplets, Power, Home, 
  Package, Plus, Trash2, Search, MapPin
} from 'lucide-react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

function App() {
  const [activeTab, setActiveTab] = useState('home')
  const [status, setStatus] = useState(null)
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [showAddForm, setShowAddForm] = useState(false)
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'pcs', location: '', category: 'Grocery' })

  const fetchData = async () => {
    try {
      const [statusRes, itemsRes] = await Promise.all([
        axios.get(`${API_URL}/status`),
        axios.get(`${API_URL}/items`)
      ])
      setStatus(statusRes.data)
      setItems(itemsRes.data)
    } catch (err) {
      console.error("Failed to fetch data", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const toggleLights = async () => {
    try {
      await axios.post(`${API_URL}/toggle`, { device: 'lights' })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const addItem = async (e) => {
    e.preventDefault()
    try {
      await axios.post(`${API_URL}/items`, newItem)
      setShowAddForm(false)
      setNewItem({ name: '', quantity: 1, unit: 'pcs', location: '', category: 'Grocery' })
      fetchData()
    } catch (err) { console.error(err) }
  }

  const deleteItem = async (id) => {
    try {
      await axios.delete(`${API_URL}/items/${id}`)
      fetchData()
    } catch (err) { console.error(err) }
  }

  const updateQuantity = async (id, newQty) => {
    if (newQty < 0) return
    try {
      await axios.patch(`${API_URL}/items/${id}`, { quantity: newQty })
      fetchData()
    } catch (err) { console.error(err) }
  }

  if (loading) return <div className="loading">Initializing Smart Home...</div>

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.location.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="container">
      <header>
        <h1>{activeTab === 'home' ? 'Smart Home' : 'Inventory'}</h1>
        <div className="status-badge">{status?.mode}</div>
      </header>

      {activeTab === 'home' ? (
        <section className="fade-in">
          <div className="grid">
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
                <span className="label">Lights</span>
                <span className="status-text">{status?.lights ? 'ON' : 'OFF'}</span>
              </div>
            </div>
          </div>
          <div className="modes">
            <h3>Quick Scenes</h3>
            <div className="mode-buttons">
              {['Home', 'Away', 'Night'].map(m => (
                <button key={m} className={status?.mode === m ? 'active' : ''} onClick={() => axios.post(`${API_URL}/mode`, { mode: m }).then(fetchData)}>
                  {m}
                </button>
              ))}
            </div>
          </div>
        </section>
      ) : (
        <section className="fade-in">
          <div className="search-bar">
            <Search size={18} />
            <input 
              placeholder="Search items or locations..." 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <button className="add-btn" onClick={() => setShowAddForm(!showAddForm)}>
              <Plus size={20} />
            </button>
          </div>

          {showAddForm && (
            <form className="add-form card" onSubmit={addItem}>
              <input placeholder="Item Name" required value={newItem.name} onChange={e => setNewItem({...newItem, name: e.target.value})} />
              <div className="row">
                <input type="number" placeholder="Qty" required value={newItem.quantity} onChange={e => setNewItem({...newItem, quantity: parseFloat(e.target.value)})} />
                <input placeholder="Unit" value={newItem.unit} onChange={e => setNewItem({...newItem, unit: e.target.value})} />
              </div>
              <input placeholder="Location" required value={newItem.location} onChange={e => setNewItem({...newItem, location: e.target.value})} />
              <button type="submit">Save Item</button>
            </form>
          )}

          <div className="items-list">
            {filteredItems.map(item => (
              <div key={item.id} className="item-card card">
                <div className="item-main">
                  <div className="item-details">
                    <span className="item-name">{item.name}</span>
                    <span className="item-loc"><MapPin size={12} /> {item.location}</span>
                  </div>
                  <div className="item-qty">
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <span>{item.quantity} {item.unit}</span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                </div>
                <button className="delete-btn" onClick={() => deleteItem(item.id)}><Trash2 size={16} /></button>
              </div>
            ))}
          </div>
        </section>
      )}

      <nav className="bottom-nav">
        <button className={`nav-item ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Home size={24} />
          <span>Control</span>
        </button>
        <button className={`nav-item ${activeTab === 'items' ? 'active' : ''}`} onClick={() => setActiveTab('items')}>
          <Package size={24} />
          <span>Items</span>
        </button>
      </nav>
    </div>
  )
}

export default App
