import { useState, useEffect } from 'react';
import { 
  Package, Plus, Trash2, Search, MapPin
} from 'lucide-react';
import api from '../api';
import { useFamily } from '../context/FamilyContext';
import '../App.css';

function Inventory() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [newItem, setNewItem] = useState({ name: '', quantity: 1, unit: 'pcs', location: '', category: 'Grocery' });
  const { familyName } = useFamily();

  const fetchItems = async () => {
    try {
      const res = await api.get('/items');
      setItems(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const addItem = async (e) => {
    e.preventDefault();
    try {
      await api.post('/items', newItem);
      setShowAddForm(false);
      setNewItem({ name: '', quantity: 1, unit: 'pcs', location: '', category: 'Grocery' });
      fetchItems();
    } catch (err) { console.error(err); }
  };

  const deleteItem = async (id) => {
    if(!window.confirm("Delete this item?")) return;
    try {
      await api.delete(`/items/${id}`);
      fetchItems();
    } catch (err) { console.error(err); }
  };

  const updateQuantity = async (id, newQty) => {
    if (newQty < 0) return;
    // Optimistic update
    setItems(items.map(i => i.id === id ? {...i, quantity: newQty} : i));
    try {
      await api.patch(`/items/${id}`, { quantity: newQty });
    } catch (err) { 
        console.error(err);
        fetchItems(); // Revert on error
    }
  };

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase()) || 
    item.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <section className="fade-in page-content">
      <header className="page-header">
          <h2>Family Inventory</h2>
          <span className="subtitle">{filteredItems.length} items</span>
      </header>
      
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
          <div className="form-actions">
            <button type="button" className="cancel-btn" onClick={() => setShowAddForm(false)}>Cancel</button>
            <button type="submit">Save</button>
          </div>
        </form>
      )}

      <div className="items-list">
        {loading ? <p>Loading items...</p> : filteredItems.map(item => (
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
        {!loading && filteredItems.length === 0 && (
            <div className="empty-state">
                <Package size={48} color="#dee2e6" />
                <p>No items found.</p>
            </div>
        )}
      </div>
    </section>
  );
}

export default Inventory;
