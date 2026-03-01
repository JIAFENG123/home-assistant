import { useState, useEffect } from 'react';
import { 
  LogOut, MessageSquare, AlertCircle, Trash2, Send
} from 'lucide-react';
import { useFamily } from '../context/FamilyContext';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import '../App.css';

function Dashboard() {
  const [status, setStatus] = useState(null);
  const [notes, setNotes] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const { familyName, logout } = useFamily();
  const navigate = useNavigate();

  const fetchData = async () => {
    try {
      const [statusRes, notesRes, itemsRes] = await Promise.all([
          api.get('/status'),
          api.get('/notes'),
          api.get('/items')
      ]);
      setStatus(statusRes.data);
      setNotes(notesRes.data);
      setLowStockItems(itemsRes.data.filter(i => i.quantity <= 2));
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
    const interval = setInterval(fetchData, 10000); // Polling every 10s
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
      logout();
      navigate('/login');
  }

  const addNote = async (e) => {
      e.preventDefault();
      if (!newNote.trim()) return;
      try {
          const res = await api.post('/notes', { content: newNote });
          setNotes([res.data, ...notes]);
          setNewNote('');
      } catch (err) { console.error(err); }
  }

  const deleteNote = async (id) => {
      try {
          await api.delete(`/notes/${id}`);
          setNotes(notes.filter(n => n.id !== id));
      } catch (err) { console.error(err); }
  }

  if (loading) return <div className="loading">Connecting to {familyName}'s Home...</div>;

  return (
    <section className="fade-in page-content">
      <header className="page-header">
        <div>
            <h2>Hello, {familyName}</h2>
            <div className="status-badge">Online</div>
        </div>
        <button onClick={handleLogout} className="icon-btn" aria-label="Logout">
            <LogOut size={20} />
        </button>
      </header>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
          <div className="alert-section">
            <h3>
                <AlertCircle size={16} color="#ff6b6b" /> 
                Low Stock
            </h3>
            <div className="chip-list">
                {lowStockItems.map(item => (
                    <span key={item.id} className="chip warning" onClick={() => navigate('/inventory')}>
                        {item.name} ({item.quantity})
                    </span>
                ))}
            </div>
          </div>
      )}

      {/* Family Board */}
      <div className="board-section">
          <h3>
              <MessageSquare size={16} />
              Family Board
          </h3>
          
          <form className="note-input" onSubmit={addNote}>
              <input 
                  placeholder="Leave a note..." 
                  value={newNote}
                  onChange={e => setNewNote(e.target.value)}
              />
              <button type="submit" disabled={!newNote.trim()}>
                  <Send size={16} />
              </button>
          </form>

          <div className="notes-list">
              {notes.length === 0 && <p className="empty-notes">No notes yet.</p>}
              {notes.map(note => (
                  <div key={note.id} className="note-card">
                      <p>{note.content}</p>
                      <button className="delete-note" onClick={() => deleteNote(note.id)}>
                          <Trash2 size={14} />
                      </button>
                  </div>
              ))}
          </div>
      </div>

    </section>
  );
}

export default Dashboard;
