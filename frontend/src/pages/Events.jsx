import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Users, Search } from 'lucide-react';
import api from '../api';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const res = await api.get('/events');
        setEvents(res.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching events", err);
        setLoading(false);
      }
    };
    fetchEvents();
  }, []);

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-center" style={{ marginBottom: '2rem' }}>
        <div>
          <h2>Discover Events</h2>
          <p style={{ color: 'var(--text-muted)' }}>Find and book the best experiences</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <input type="text" className="input-field" placeholder="Search events..." style={{ paddingLeft: '2.5rem' }} />
          <Search size={18} style={{ position: 'absolute', left: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading events...</p>
        ) : (
          events.map(event => (
            <Link to={`/events/${event.event_id}`} key={event.event_id}>
              <div className="card" style={{ padding: 0, overflow: 'hidden', height: '100%', display: 'flex', flexDirection: 'column' }}>
                <div style={{ height: '200px', backgroundImage: `url(https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&q=80)`, backgroundSize: 'cover', backgroundPosition: 'center', borderBottom: '1px solid var(--border-subtle)' }} />
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.25rem', marginBottom: 0 }}>{event.event_name}</h3>
                    <span style={{ fontWeight: 600, color: 'var(--accent)', background: 'rgba(20, 184, 166, 0.1)', padding: '0.25rem 0.75rem', borderRadius: 'var(--border-radius-full)', fontSize: '0.875rem' }}>
                      {event.registration_fees === 0 ? 'Free' : `$${event.registration_fees}`}
                    </span>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem' }}>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <Calendar size={16} /> <span>{new Date(event.start_date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <MapPin size={16} /> <span>{event.venue_name || event.city}</span>
                    </div>
                    <div className="flex items-center gap-2" style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                      <Users size={16} /> <span>Capacity: {event.max_capacity}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
};

export default Events;
