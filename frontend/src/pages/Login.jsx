import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Key, Mail } from 'lucide-react';
import api from '../api';

const Login = () => {
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        email: e.target.email.value,
        password: e.target.password.value,
      };

      if (!isLogin) {
        payload.first_name = e.target.fullName.value.split(' ')[0];
        payload.last_name = e.target.fullName.value.split(' ').slice(1).join(' ') || '';
        payload.phone = e.target.phone.value;
        payload.username = e.target.fullName.value.split(' ')[0].toLowerCase() + Math.floor(Math.random() * 1000);
        payload.role = e.target.role.value;
        
        await api.post('/auth/register', payload);
        alert('Registration successful. Please log in.');
        setIsLogin(true);
      } else {
        const res = await api.post('/auth/login', { email: e.target.email.value, password: payload.password });
        if(res.data.token) {
          localStorage.setItem('token', res.data.token);
          navigate('/dashboard');
        } else {
          alert('Login failed: ' + res.data);
        }
      }
    } catch (err) {
      console.error(err);
      alert('An error occurred');
    }
  };

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '1rem', color: 'var(--primary)' }}>
            <LogIn size={32} />
          </div>
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p style={{ color: 'var(--text-muted)' }}>
            {isLogin ? 'Enter your credentials to access your account' : 'Sign up to start booking events'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" name="fullName" className="input-field" placeholder="John Doe" required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Phone</label>
                <div style={{ position: 'relative' }}>
                  <input type="text" name="phone" className="input-field" placeholder="+1234567890" required />
                </div>
              </div>
              <div className="input-group">
                <label className="input-label">Role</label>
                <div style={{ position: 'relative' }}>
                  <select name="role" className="input-field" defaultValue="Attendee" required style={{ paddingLeft: '1rem', appearance: 'auto' }}>
                    <option value="Attendee">Attendee</option>
                    <option value="Organizer">Organizer</option>
                    <option value="Speaker">Speaker</option>
                    <option value="Performer">Performer</option>
                  </select>
                </div>
              </div>
            </>
          )}
          
          <div className="input-group">
            <label className="input-label">Email (Username prefix used for login)</label>
            <div style={{ position: 'relative' }}>
              <input type="email" name="email" className="input-field" placeholder="you@example.com" required style={{ paddingLeft: '2.5rem' }} />
              <Mail size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
          
          <div className="input-group">
            <label className="input-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input type="password" name="password" className="input-field" placeholder="••••••••" required style={{ paddingLeft: '2.5rem' }} />
              <Key size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            </div>
          </div>
          
          <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
            {isLogin ? 'Sign In' : 'Sign Up'}
          </button>
        </form>
        
        <div style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <button 
            type="button" 
            onClick={() => setIsLogin(!isLogin)} 
            style={{ color: 'var(--primary)', background: 'none', fontWeight: 500 }}
          >
            {isLogin ? 'Register' : 'Login'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
