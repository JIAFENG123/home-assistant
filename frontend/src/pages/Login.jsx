import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useFamily } from '../context/FamilyContext';
import { Home } from 'lucide-react';
import '../App.css'; // Reuse styles or make new ones

function Login() {
  const [name, setName] = useState('');
  const { login } = useFamily();
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    login(name.trim());
    navigate('/');
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">
          <Home size={48} color="#4dabf7" />
        </div>
        <h1>Welcome Home</h1>
        <p>Enter your Family Name to access your dashboard.</p>
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Family Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="login-input"
          />
          <button type="submit" className="login-btn">
            Enter
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
