import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Compass, User, Calendar, LogIn } from 'lucide-react';

const parseJwt = (token) => {
  try { return JSON.parse(atob(token.split('.')[1])); } catch (e) { return null; }
};

const Navbar = () => {
  const location = useLocation();
  const token = localStorage.getItem('token');
  const isAuthenticated = !!token;
  const userPayload = token ? parseJwt(token) : null;
  const role = userPayload?.role;

  return (
    <nav className="glass-panel" style={{ 
      position: 'fixed', top: '1rem', left: '50%', transform: 'translateX(-50%)', 
      width: 'calc(100% - 4rem)', maxWidth: '1280px', zIndex: 50, padding: '0.75rem 1.5rem',
      display: 'flex', justifyContent: 'space-between', alignItems: 'center'
    }}>
      <Link to="/" className="flex items-center gap-2" style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '1.25rem' }}>
        <Compass size={24} />
        <span>EventFlow</span>
      </Link>
      
      <div className="flex items-center gap-6">
        {isAuthenticated && role === 'Attendee' && (
          <Link to="/events" className="flex items-center gap-2" style={{ color: 'var(--text-main)' }}>
            <Calendar size={18} />
            <span>Events</span>
          </Link>
        )}
        
        {isAuthenticated ? (
          <Link to="/dashboard" className="btn btn-secondary">
            <User size={18} />
            <span>Dashboard</span>
          </Link>
        ) : (
          <Link to="/login" className="btn btn-primary">
            <LogIn size={18} />
            <span>Login</span>
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
