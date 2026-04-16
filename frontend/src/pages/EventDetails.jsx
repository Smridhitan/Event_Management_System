import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, MapPin, Clock, CreditCard } from 'lucide-react';
import api from '../api';

const EventDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEventData = async () => {
      try {
        const [eventRes, sessionRes] = await Promise.all([
          api.get(`/events/${id}`),
          api.get(`/sessions/event/${id}`)
        ]);
        setEvent(eventRes.data);
        setSessions(sessionRes.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching event details", err);
        setLoading(false);
      }
    };
    fetchEventData();
  }, [id]);

  const handleRegisterEvent = async () => {
    try {
      const randomId = 'ID-' + Math.floor(Math.random() * 10000000);
      const res = await api.post('/events/register', { event_id: id, govt_id_type: 'Passport', govt_id_number: randomId });
      navigate('/payment', { state: { registration_id: res.data.registration_id, amount: event.registration_fees, eventName: event.event_name } });
    } catch (err) {
      alert(err.response?.data || "Registration failed");
    }
  };

  const handleRegisterSession = async (session_id) => {
    try {
      const randomId = 'SID-' + Math.floor(Math.random() * 10000000);
      await api.post('/sessions/register', { session_id, govt_id_type: 'Passport', govt_id_number: randomId });
      alert('Registered for session successfully!');
    } catch (err) {
      alert(err.response?.data || "Session registration failed");
    }
  };

  if (loading) return <div className="container animate-fade-in"><p>Loading...</p></div>;
  if (!event) return <div className="container animate-fade-in"><p>Event not found.</p></div>;

  return (
    <div className="container animate-fade-in">
      <div className="card" style={{ marginBottom: '2rem', padding: '3rem', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'radial-gradient(circle at top right, rgba(99, 102, 241, 0.15), transparent 50%)', pointerEvents: 'none' }} />
        <Link to="/events" style={{ display: 'inline-block', marginBottom: '1rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
          ← Back to Events
        </Link>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem' }}>{event.event_name}</h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem', maxWidth: '800px', marginBottom: '2rem' }}>
          {event.description || 'Welcome to this incredible event.'}
        </p>
        
        <div className="flex gap-6" style={{ marginBottom: '2rem' }}>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><Calendar size={20} color="var(--primary)" /> {new Date(event.start_date).toLocaleDateString()} - {new Date(event.end_date).toLocaleDateString()}</div>
          <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)' }}><MapPin size={20} color="var(--primary)" /> {event.venue_name}, {event.city}</div>
        </div>
        
        <button onClick={handleRegisterEvent} className="btn btn-primary" style={{ padding: '1rem 2rem', fontSize: '1.1rem' }}>
          <CreditCard size={20} /> Register & Pay (${event.registration_fees})
        </button>
      </div>

      <h3 style={{ marginBottom: '1rem' }}>Event Sessions</h3>
      <div className="grid grid-cols-2 gap-4">
        {sessions.map(session => (
          <div key={session.session_id} className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h4 style={{ marginBottom: '0.25rem' }}>{session.title}</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>Speaker: {session.speaker_first_name} {session.speaker_last_name}</p>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>Slots: {session.slots_filled}/{session.total_slots}</p>
            </div>
            <div className="flex flex-col items-end">
              <span style={{ fontWeight: 500, color: 'var(--primary)', marginBottom: '0.5rem' }}>{session.start_time} - {session.end_time}</span>
              <button onClick={() => handleRegisterSession(session.session_id)} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}>
                Opt-in Session
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventDetails;
