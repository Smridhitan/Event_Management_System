import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';

const Home = () => {
  return (
    <div className="container animate-fade-in" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center' }}>
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem', padding: '0.5rem 1rem', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-full)', border: '1px solid var(--border-subtle)', marginBottom: '2rem' }}>
        <Sparkles size={16} color="var(--secondary)" />
        <span style={{ fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-muted)' }}>The future of event experiences</span>
      </div>
      
      <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fff 0%, var(--text-muted) 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
        Discover Incredible Events <br/> Near You
      </h1>
      
      <p style={{ fontSize: '1.25rem', color: 'var(--text-muted)', maxWidth: '600px', marginBottom: '3rem' }}>
        Join thousands exploring the best workshops, concerts, and conferences. Secure your spot in just a few clicks.
      </p>
      
      <div className="flex gap-4">
        <Link to="/events" className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          Explore Events <ArrowRight size={20} />
        </Link>
      </div>
    </div>
  );
};

export default Home;
