import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CreditCard, CheckCircle, XCircle } from 'lucide-react';
import api from '../api';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [status, setStatus] = useState('pending'); // pending, success, failed
  
  // Simulated data
  // Simulated data from route
  const amount = location.state?.amount || 199.99;
  const eventName = location.state?.eventName || 'Tech Conference';
  const registration_id = location.state?.registration_id;

  const handleCancel = async () => {
    if (registration_id) {
      try {
         await api.post('/events/cancel', { registration_id });
      } catch(err) {
         console.error(err);
      }
    }
    navigate(-1);
  };

  const simulatePayment = async (success) => {
    setStatus('processing');
    try {
      if (registration_id) {
        await api.post('/payment/simulate', {
          registration_id,
          payment_mode: 'UPI',
          status: success ? 'Success' : 'Failed'
        });
      }
      setTimeout(() => {
        setStatus(success ? 'success' : 'failed');
      }, 1000);
    } catch (err) {
       setStatus('failed');
    }
  };

  if (status === 'success') {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
          <CheckCircle size={64} color="var(--accent)" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ marginBottom: '1rem' }}>Payment Successful!</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>You are now registered for {eventName}. A confirmation email has been sent to you.</p>
          <button className="btn btn-primary" onClick={() => navigate('/dashboard')} style={{ width: '100%' }}>Go to Dashboard</button>
        </div>
      </div>
    );
  }

  if (status === 'failed') {
    return (
      <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <div className="card" style={{ width: '100%', maxWidth: '400px', textAlign: 'center', padding: '3rem' }}>
          <XCircle size={64} color="#ef4444" style={{ margin: '0 auto 1.5rem auto' }} />
          <h2 style={{ marginBottom: '1rem' }}>Payment Failed</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>We couldn't process your payment at this time. Please try another payment method.</p>
          <div className="flex gap-4">
            <button className="btn btn-secondary" onClick={() => navigate(-1)} style={{ flex: 1 }}>Go Back</button>
            <button className="btn btn-primary" onClick={() => setStatus('pending')} style={{ flex: 1 }}>Try Again</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container animate-fade-in" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ display: 'inline-flex', padding: '1rem', background: 'rgba(99, 102, 241, 0.1)', borderRadius: '50%', marginBottom: '1rem', color: 'var(--primary)' }}>
             <CreditCard size={32} />
          </div>
          <h2>Payment Simulator</h2>
          <p style={{ color: 'var(--text-muted)' }}>Complete checkout for <strong>{eventName}</strong></p>
        </div>

        <div style={{ background: 'var(--bg-base)', padding: '1.5rem', borderRadius: 'var(--border-radius-sm)', marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: 'var(--text-muted)' }}>Total Amount</span>
          <span style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)' }}>${amount}</span>
        </div>

        <div className="flex gap-4">
          <button 
            className="btn btn-primary" 
            onClick={() => simulatePayment(true)} 
            style={{ flex: 1 }}
            disabled={status === 'processing'}
          >
            {status === 'processing' ? 'Processing...' : 'Simulate Success'}
          </button>
          <button 
            className="btn btn-secondary" 
            onClick={() => simulatePayment(false)} 
            style={{ flex: 1, borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}
            disabled={status === 'processing'}
          >
            Simulate Failure
          </button>
        </div>
        <button 
          className="btn" 
          onClick={handleCancel} 
          style={{ width: '100%', marginTop: '1rem', background: 'transparent', color: 'var(--text-muted)' }}
        >
          Cancel Transaction (Go Back)
        </button>
      </div>
    </div>
  );
};

export default Payment;
