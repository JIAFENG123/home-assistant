import { BrowserRouter, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { FamilyProvider, useFamily } from './context/FamilyContext';
import { Home, Package } from 'lucide-react';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Inventory from './pages/Inventory';
import './App.css';

function RequireAuth({ children }) {
  const { familyName } = useFamily();
  const location = useLocation();

  if (!familyName) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function Layout({ children }) {
    const location = useLocation();
    const isDashboard = location.pathname === '/';
    
    return (
        <div className="container">
            <main>
                {children}
            </main>
            <nav className="bottom-nav">
                <Link to="/" className={`nav-item ${isDashboard ? 'active' : ''}`}>
                    <Home size={24} />
                    <span>Control</span>
                </Link>
                <Link to="/inventory" className={`nav-item ${!isDashboard ? 'active' : ''}`}>
                    <Package size={24} />
                    <span>Items</span>
                </Link>
            </nav>
        </div>
    )
}

function App() {
  return (
    <FamilyProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/" element={
            <RequireAuth>
              <Layout><Dashboard /></Layout>
            </RequireAuth>
          } />
          <Route path="/inventory" element={
            <RequireAuth>
              <Layout><Inventory /></Layout>
            </RequireAuth>
          } />
        </Routes>
      </BrowserRouter>
    </FamilyProvider>
  );
}

export default App;
