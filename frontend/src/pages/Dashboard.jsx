import { useState, useEffect } from 'react';
import { 
  Sun, Moon, Thermometer, Droplets, Power, LogOut
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../App.css';

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const { familyName, logout } = useFamily();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const res = await api.get('/status');
      setStatus(res.data);
    } catch (err) {
      console.error("Failed to fetch data", err);
      if (err.response?.status === 400) {
          logout();
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const toggleLights = async () => {
    try {
      await api.post('/toggle', { device: 'lights' });
      fetchData();
    } catch (err) { console.error(err); }
  };

  const setMode = async (mode) => {
      try {
          await api.post('/mode', { mode });
          fetchData();
      } catch (err) { console.error(err); }
  }

  const handleLogout = () => {
      logout();
      navigate('/login');
  }

  if (loading) return <div className="loading">Connecting to {familyName}'s Home...</div>;

  return (
    <section className="fade-in page-content">
      <header className="page-header">
        <div>
            <h2>Hello, {familyName}</h2>
            <div className="status-badge">{status?.mode}</div>
        </div>
        <button onClick={handleLogout} className="icon-btn" aria-label="Logout">
            <LogOut size={20} />
        </button>
      </header>

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
            <button 
                key={m} 
                className={status?.mode === m ? 'active' : ''} 
                onClick={() => setMode(m)}
            >
              {m}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Dashboard;
