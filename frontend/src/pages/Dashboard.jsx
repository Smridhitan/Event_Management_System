import React, { useState, useEffect } from 'react';
import { LogOut, Calendar, Ticket, DollarSign, Users, Briefcase, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const parseJwt = (token) => {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch (e) {
    return null;
  }
};

const Dashboard = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');
  const userPayload = parseJwt(token);
  const role = userPayload?.role || 'Attendee';

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login');
  };

  return (
    <div className="container animate-fade-in">
      <div className="flex justify-between items-end" style={{ marginBottom: '3rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
        <div>
          <h1 style={{ marginBottom: '0.5rem' }}>{role} Dashboard</h1>
          <p style={{ color: 'var(--text-muted)' }}>Welcome back! Manage your system activities here.</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary" style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: '#ef4444' }}>
          <LogOut size={16} /> Logout
        </button>
      </div>

      {role === 'Attendee' && <AttendeeView />}
      {role === 'Organizer' && <OrganizerView />}
      {(role === 'Speaker' || role === 'Performer') && <ParticipantView />}
      {role === 'Admin' && <AdminView />}
    </div>
  );
};

// ---------------------------
// ROLE-SPECIFIC VIEWS
// ---------------------------

const AttendeeView = () => {
  const [activeTab, setActiveTab] = useState('events');
  const [myEvents, setMyEvents] = useState([]);
  const [mySessions, setMySessions] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, sessionsRes] = await Promise.all([
          api.get('/events/my'),
          api.get('/sessions/my')
        ]);
        setMyEvents(eventsRes.data);
        setMySessions(sessionsRes.data);
      } catch (err) {
        console.error("Error", err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="grid grid-cols-4 gap-6">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('events')}>
          <Calendar size={18} /> My Events
        </button>
        <button className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`} style={{ justifyContent: 'flex-start' }} onClick={() => setActiveTab('sessions')}>
          <Ticket size={18} /> My Sessions
        </button>
      </div>

      <div className="card" style={{ gridColumn: 'span 3', minHeight: '400px' }}>
        {activeTab === 'events' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={20} color="var(--primary)" /> Registered Events</h3>
            {myEvents.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No registrations.</p> : (
              <div className="grid gap-4">
                {myEvents.map(ev => (
                  <div key={ev.registration_id} style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)' }}>
                    <div className="flex justify-between">
                      <h4>{ev.event_name}</h4>
                      <span style={{ color: 'var(--accent)' }}>Payment Complete ✓</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'sessions' && (
          <div>
            <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Ticket size={20} color="var(--secondary)" /> Opted Sessions</h3>
            {mySessions.length === 0 ? <p style={{ color: 'var(--text-muted)' }}>No sessions.</p> : (
              <div className="grid gap-4">
                {mySessions.map(ses => (
                  <div key={ses.session_registration_no} style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)' }}>
                    <div className="flex justify-between">
                      <h4>{ses.title} ({ses.event_name})</h4>
                      <span style={{ color: ses.session_registration_status === 'Registered' ? 'var(--accent)' : 'var(--text-muted)' }}>{ses.session_registration_status}</span>
                    </div>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{new Date(ses.session_date).toLocaleDateString()} at {ses.start_time}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const OrganizerView = () => {
  const [activeTab, setActiveTab] = useState('analytics');

  return (
    <div className="grid grid-cols-4 gap-6">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button className={`btn ${activeTab === 'analytics' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('analytics')} style={{ justifyContent: 'flex-start' }}><DollarSign size={18} /> Analytics</button>
        <button className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('events')} style={{ justifyContent: 'flex-start' }}><Calendar size={18} /> Event Hub</button>
        <button className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('sessions')} style={{ justifyContent: 'flex-start' }}><Calendar size={18} /> Session Hub</button>
        <button className={`btn ${activeTab === 'vendors' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('vendors')} style={{ justifyContent: 'flex-start' }}><Briefcase size={18} /> Vendors</button>
        <button className={`btn ${activeTab === 'guests' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('guests')} style={{ justifyContent: 'flex-start' }}><Users size={18} /> Guest Lists</button>
      </div>
      <div className="card" style={{ gridColumn: 'span 3', minHeight: '400px', padding: '2rem' }}>
        {activeTab === 'analytics' && <OrgAnalytics />}
        {activeTab === 'events' && <OrgEvents />}
        {activeTab === 'sessions' && <OrgSessionHub />}
        {activeTab === 'vendors' && <OrgVendors />}
        {activeTab === 'guests' && <OrgGuests />}
      </div>
    </div>
  );
};

const OrgAnalytics = () => {
  const [data, setData] = useState(null);
  const [sortBy, setSortBy] = useState('revenue_desc');
  
  useEffect(() => {
    api.get('/organizer/analytics').then(res => setData(res.data)).catch(console.error);
  }, []);
  
  if (!data) return <p>Loading analytics...</p>;

  let sortedMetrics = [...data.metrics];
  if (sortBy === 'revenue_desc') sortedMetrics.sort((a,b) => (b.total_revenue || 0) - (a.total_revenue || 0));
  if (sortBy === 'revenue_asc') sortedMetrics.sort((a,b) => (a.total_revenue || 0) - (b.total_revenue || 0));
  if (sortBy === 'regs_desc') sortedMetrics.sort((a,b) => (b.registrations || 0) - (a.registrations || 0));
  if (sortBy === 'regs_asc') sortedMetrics.sort((a,b) => (a.registrations || 0) - (b.registrations || 0));
  
  const maxRevenueEvent = [...data.metrics].sort((a,b) => (b.total_revenue || 0) - (a.total_revenue || 0))[0];
  const maxRegEvent = [...data.metrics].sort((a,b) => (b.registrations || 0) - (a.registrations || 0))[0];
  const totalRevenue = data.metrics.reduce((sum, m) => sum + Number(m.total_revenue || 0), 0);

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
        <h3>Revenue Insights</h3>
        <select className="input" style={{ width: 'auto', padding: '0.5rem', background: 'var(--bg-elevated)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }} value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="revenue_desc">Revenue (High to Low)</option>
          <option value="revenue_asc">Revenue (Low to High)</option>
          <option value="regs_desc">Registrations (High to Low)</option>
          <option value="regs_asc">Registrations (Low to High)</option>
        </select>
      </div>

      <div className="grid grid-cols-3 gap-6" style={{ marginBottom: '2rem' }}>
        <div style={{ padding: '1.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Total System Revenue</p>
          <h2>${totalRevenue}</h2>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Highest Revenue Event</p>
          <h4 style={{ margin: '0.5rem 0 0 0' }}>{maxRevenueEvent?.event_name || 'N/A'}</h4>
          <p className="text-muted" style={{ margin: 0 }}>${maxRevenueEvent?.total_revenue || 0}</p>
        </div>
        <div style={{ padding: '1.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)' }}>
          <p className="text-muted" style={{ margin: 0, fontSize: '0.9rem' }}>Highest Attendance Event</p>
          <h4 style={{ margin: '0.5rem 0 0 0' }}>{maxRegEvent?.event_name || 'N/A'}</h4>
          <p className="text-muted" style={{ margin: 0 }}>{maxRegEvent?.registrations || 0} Regs</p>
        </div>
      </div>

      <div className="grid gap-4">
        {sortedMetrics.map(m => (
          <div key={m.event_name} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)' }}>
             <div>
               <strong>{m.event_name}</strong>
               <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Registrations: {m.registrations}</p>
             </div>
             <div style={{ fontSize: '1.25rem', color: 'var(--accent)', fontWeight: 'bold' }}>
               ${m.total_revenue || 0}
             </div>
          </div>
        ))}
        {sortedMetrics.length === 0 && <p className="text-muted">No revenue data found.</p>}
      </div>
    </div>
  );
};

const OrgEvents = () => {
  const [events, setEvents] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [venues, setVenues] = useState([]);
  
  const [formData, setFormData] = useState({
    event_name: '', event_type: 'Workshop', start_date: '', end_date: '', registration_fees: 0, registration_deadline: '', description: '', venue_id: '', available_slots: 100, city: ''
  });

  const fetchEvents = () => {
    api.get('/organizer/events').then(res => setEvents(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    if (formData.start_date && formData.end_date && formData.city) {
      api.get(`/organizer/venues-dynamic?start=${formData.start_date}&end=${formData.end_date}&city=${formData.city}`)
         .then(res => setVenues(res.data)).catch(console.error);
    } else {
      setVenues([]);
    }
  }, [formData.start_date, formData.end_date, formData.city]);

  const handleCancel = async (id) => {
    if (window.confirm("Are you sure you want to cancel this event? This will cancel all related sessions and registrations.")) {
      try {
        await api.post(`/organizer/events/${id}/cancel`);
        setEvents(events.map(ev => ev.event_id === id ? { ...ev, event_status: 'Cancelled' } : ev));
      } catch(err) { alert("Failed: " + (err.response?.data?.error || err.message)); }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const formatYMD = (val) => {
        if (!val) return '';
        try { return new Date(val).toISOString().split('T')[0]; } catch(err) { return val; }
      };

      if (!formData.venue_id) return alert("Please select an available venue");

      const payload = {
        ...formData,
        start_date: formatYMD(formData.start_date),
        end_date: formatYMD(formData.end_date),
        registration_deadline: formatYMD(formData.registration_deadline)
      };

      if (isEditing) {
        await api.put(`/organizer/events/${editId}`, payload);
        alert("Event updated successfully!");
      } else {
        await api.post('/organizer/events', payload);
        alert("Event drafted successfully!");
      }
      
      setShowModal(false);
      fetchEvents();
    } catch(err) {
      alert("Error: " + (err.response?.data?.error || err.message));
    }
  };

  const todayStr = new Date().toISOString().split('T')[0];
  const getYesterday = (dateStr) => {
    if (!dateStr) return undefined;
    const d = new Date(dateStr);
    d.setDate(d.getDate() - 1);
    return d.toISOString().split('T')[0];
  };

  const openNew = () => {
    setFormData({
      event_name: '', event_type: 'Workshop', start_date: '', end_date: '', registration_fees: 0, registration_deadline: '', description: '', venue_id: '', available_slots: 100, city: ''
    });
    setIsEditing(false);
    setEditId(null);
    setShowModal(true);
  };

  const openEdit = (ev) => {
    const extractYMD = (dateString) => {
      if (!dateString) return '';
      try { return new Date(dateString).toISOString().split('T')[0]; } catch(e) { return dateString; }
    };
    setFormData({
      event_name: ev.event_name,
      event_type: ev.event_type || 'Workshop',
      start_date: extractYMD(ev.start_date),
      end_date: extractYMD(ev.end_date),
      registration_fees: ev.registration_fees,
      registration_deadline: extractYMD(ev.registration_deadline),
      description: ev.description || '',
      venue_id: ev.venue_id,
      available_slots: ev.available_slots,
      city: ev.city || '' 
    });
    setIsEditing(true);
    setEditId(ev.event_id);
    setShowModal(true);
  };

  return (
    <div>
      <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem' }}>
         <h3>My Events</h3>
         <button className="btn btn-primary btn-sm" onClick={openNew}>+ Draft New Event</button>
      </div>

      {showModal && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-elevated)' }}>
          <h4 style={{ marginBottom: '1rem' }}>{isEditing ? 'Edit Event Properties' : 'Create New Event'}</h4>
          <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-4">
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Name</label>
                <input required placeholder="e.g. AI Summit 2026" className="input" value={formData.event_name} onChange={e => setFormData({...formData, event_name: e.target.value})} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Type</label>
                <select required className="input" value={formData.event_type} onChange={e => setFormData({...formData, event_type: e.target.value})}>
                   <option value="Keynote Talk">Keynote Talk</option>
                   <option value="Performance">Performance</option>
                   <option value="Panel Discussion">Panel Discussion</option>
                   <option value="Workshop">Workshop</option>
                </select>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start Date</label>
                <input required type="date" className="input" value={formData.start_date} onChange={e => setFormData({...formData, start_date: e.target.value})} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>End Date</label>
                <input required type="date" min={formData.start_date || undefined} className="input" value={formData.end_date} onChange={e => setFormData({...formData, end_date: e.target.value})} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registration Fees ($)</label>
                <input required type="number" step="0.01" min="0" placeholder="0.00" className="input" value={formData.registration_fees} onChange={e => setFormData({...formData, registration_fees: e.target.value})} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Registration Deadline</label>
                <input required type="date" className="input" min={todayStr} max={getYesterday(formData.start_date)} value={formData.registration_deadline} onChange={e => setFormData({...formData, registration_deadline: e.target.value})} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event City</label>
                <select required className="input" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value, venue_id: ''})}>
                   <option value="" disabled>Select City</option>
                   <option value="Delhi">Delhi</option>
                   <option value="Bangalore">Bangalore</option>
                   <option value="Mumbai">Mumbai</option>
                   <option value="Pune">Pune</option>
                   <option value="Chennai">Chennai</option>
                   <option value="Kolkata">Kolkata</option>
                   <option value="Jaipur">Jaipur</option>
                   <option value="Hyderabad">Hyderabad</option>
                   <option value="Ahmedabad">Ahmedabad</option>
                </select>
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Total Slots (Capacity)</label>
                <input required type="number" min="1" className="input" value={formData.available_slots} onChange={e => setFormData({...formData, available_slots: e.target.value})} />
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Event Venue</label>
                {formData.start_date && formData.end_date && formData.city ? (
                  venues.length > 0 ? (
                    <select required className="input" value={formData.venue_id} onChange={e => setFormData({...formData, venue_id: e.target.value})}>
                       <option value="" disabled>Select Confirmed Venue</option>
                       {venues.map(v => <option key={v.venue_id} value={v.venue_id}>{v.venue_name} - {v.street}, {v.city}</option>)}
                    </select>
                  ) : (
                    <p style={{ color: '#ef4444', fontSize: '0.9rem', margin: '0.5rem 0' }}>No venue available in these dates for {formData.city}.</p>
                  )
                ) : (
                  <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0.5rem 0' }}>Select dates and city first to see available venues.</p>
                )}
             </div>
             <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', gridColumn: 'span 2' }}>
                <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Description</label>
                <input placeholder="Short Description" className="input" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
             </div>
             
             <div style={{ gridColumn: 'span 2', display: 'flex', gap: '1rem', marginTop: '0.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={!formData.venue_id}>{isEditing ? 'Save Changes' : 'Create Event'}</button>
             </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
        {events.map(ev => (
          <div key={ev.event_id} style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <strong>{ev.event_name}</strong>
              <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>{new Date(ev.start_date).toLocaleDateString()} | Slots: {ev.available_slots}/{ev.total_registrations + ev.available_slots}</p>
            </div>
            <div className="flex gap-2">
               <span style={{ padding: '0.25rem 0.5rem', background: 'var(--bg-elevated)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.85rem', color: ev.event_status === 'Cancelled' ? '#ef4444' : 'inherit' }}>{ev.event_status}</span>
               {ev.event_status !== 'Cancelled' && (
                 <>
                   <button className="btn btn-secondary btn-sm" onClick={() => openEdit(ev)}>Edit</button>
                   <button className="btn btn-secondary btn-sm" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleCancel(ev.event_id)}>Cancel</button>
                 </>
               )}
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-muted">You do not manage any events yet.</p>}
      </div>
    </div>
  );
};

const OrgSessionHub = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState("");
  
  const [sessions, setSessions] = useState([]);
  const [speakers, setSpeakers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [activeResourceSession, setActiveResourceSession] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '', speaker_user_id: '', session_date: '', start_time: '', end_time: '', total_slots: 50
  });

  useEffect(() => {
    api.get('/organizer/events').then(res => setEvents(res.data)).catch(console.error);
    api.get('/organizer/speakers').then(res => setSpeakers(res.data)).catch(console.error);
  }, []);

  const fetchSessions = (id) => {
    api.get(`/organizer/events/${id}/sessions`).then(res => setSessions(res.data)).catch(console.error);
  };

  useEffect(() => {
    if (selectedEventId) fetchSessions(selectedEventId);
  }, [selectedEventId]);

  const event = events.find(ev => ev.event_id === parseInt(selectedEventId)) || null;

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      const formatYMD = (val) => new Date(val).toISOString().split('T')[0];
      const payload = {
        ...formData,
        event_id: event.event_id,
        session_date: formatYMD(formData.session_date)
      };
      await api.post('/organizer/sessions', payload);
      setShowModal(false);
      fetchSessions(event.event_id);
      alert("Session officially added successfully!");
    } catch(err) {
      alert("Failed to create session. Ensure there are no overlapping times.");
    }
  };

  const minDate = event ? new Date(event.start_date).toISOString().split('T')[0] : '';
  const maxDate = event ? new Date(event.end_date).toISOString().split('T')[0] : '';

  if (activeResourceSession) {
    return <OrgSessionResources session={activeResourceSession} onBack={() => setActiveResourceSession(null)} />;
  }

  return (
    <div className="animate-fade-in">
      <h3 style={{ marginBottom: '1.5rem' }}>Session Hub</h3>
      
      <select className="input" style={{ width: '100%', marginBottom: '1.5rem', padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }} value={selectedEventId} onChange={e => setSelectedEventId(e.target.value)}>
         <option value="" disabled>Select an Event to Manage Sessions</option>
         {events.filter(ev => ev.event_status !== 'Cancelled').map(ev => <option key={ev.event_id} value={ev.event_id}>{ev.event_name}</option>)}
      </select>

      {event && (
        <>
          <div className="flex justify-between items-center" style={{ marginBottom: '1.5rem', marginTop: '1rem' }}>
             <h4 style={{ margin: 0 }}>Sessions mapped to {event.event_name}</h4>
             <button className="btn btn-primary btn-sm" onClick={() => setShowModal(!showModal)}>+ Add Session</button>
          </div>

          {showModal && (
            <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-elevated)' }}>
              <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Session Title</label>
                    <input required className="input" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Speaker</label>
                    <select required className="input" value={formData.speaker_user_id} onChange={e => setFormData({...formData, speaker_user_id: e.target.value})}>
                       <option value="" disabled>Select Speaker</option>
                       {speakers.map(s => <option key={s.user_id} value={s.user_id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Date</label>
                    <input required type="date" min={minDate} max={maxDate} className="input" value={formData.session_date} onChange={e => setFormData({...formData, session_date: e.target.value})} />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Capacity</label>
                    <input required type="number" min="1" className="input" value={formData.total_slots} onChange={e => setFormData({...formData, total_slots: e.target.value})} />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Start Time</label>
                    <input required type="time" className="input" value={formData.start_time} onChange={e => setFormData({...formData, start_time: e.target.value})} />
                 </div>
                 <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>End Time</label>
                    <input required type="time" className="input" value={formData.end_time} onChange={e => setFormData({...formData, end_time: e.target.value})} />
                 </div>
                 <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
                    <button type="submit" className="btn btn-primary">Create Session</button>
                 </div>
              </form>
            </div>
          )}

          <div className="grid gap-4">
            {sessions.map(s => (
              <div key={s.session_id} style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)', position: 'relative', opacity: s.session_status === 'Cancelled' ? 0.6 : 1 }}>
                 <strong>{s.title}</strong>
                 {s.session_status === 'Cancelled' && <span style={{ marginLeft: '1rem', background: 'var(--error)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>CANCELLED</span>}
                 <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Speaker/Performer: {s.first_name} {s.last_name}</p>
                 <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>{new Date(s.session_date).toLocaleDateString()} | {s.start_time} - {s.end_time}</p>
                 <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Capacity: {s.slots_filled}/{s.total_slots}</p>
                 <div style={{ marginTop: '0.75rem' }}>
                    <button className="btn btn-secondary btn-sm" disabled={s.session_status === 'Cancelled'} onClick={() => setActiveResourceSession(s)}>Manage Resources</button>
                 </div>
              </div>
            ))}
            {sessions.length === 0 && <p className="text-muted">No sessions created for this event yet.</p>}
          </div>
        </>
      )}
    </div>
  );
};

const OrgSessionResources = ({ session, onBack }) => {
  const [allocations, setAllocations] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [formData, setFormData] = useState({ category: '', resource_id: '', quantity: 1 });

  const fetchAllocations = () => {
    api.get(`/organizer/sessions/${session.session_id}/allocations`).then(res => setAllocations(res.data)).catch(console.error);
  };
  const fetchInventory = () => {
    api.get('/organizer/resources').then(res => setInventory(res.data)).catch(console.error);
  };

  useEffect(() => {
    fetchAllocations();
    fetchInventory();
  }, [session.session_id]);

  const handleAllocate = async (e) => {
    e.preventDefault();
    try {
      await api.post(`/organizer/sessions/${session.session_id}/allocations`, {
        resource_id: formData.resource_id,
        quantity: formData.quantity
      });
      fetchAllocations();
      fetchInventory();
      alert("Resource successfully allocated!");
    } catch(err) {
      const msg = err.response?.data?.error || err.message;
      if (msg.includes('Duplicate entry')) {
        alert("Failed to allocate: This resource is already allocated to this session! Release it first to adjust quantities.");
      } else {
        alert("Failed to allocate: " + msg);
      }
    }
  };

  const handleRelease = async (res_id) => {
    try {
      await api.put(`/organizer/sessions/${session.session_id}/allocations/${res_id}/release`);
      fetchAllocations();
      fetchInventory();
    } catch(err) {
      alert("Failed to release resource: " + (err.response?.data?.error || err.message));
    }
  };

  return (
    <div className="animate-fade-in">
      <div className="flex items-center gap-4" style={{ marginBottom: '1.5rem' }}>
         <button className="btn btn-secondary btn-sm" onClick={onBack}>← Back</button>
         <h4 style={{ margin: 0 }}>Resource Management for '{session.title}'</h4>
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-elevated)' }}>
        <h4 style={{ marginBottom: '1rem' }}>Allocate New Resource</h4>
        <form onSubmit={handleAllocate} className="flex gap-4 items-end">
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
             <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Category</label>
             <select required className="input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value, resource_id: ''})}>
                <option value="" disabled>Select Category</option>
                {[...new Set(inventory.filter(r => r.status === 'Available' && r.available_quantity > 0).map(r => r.resource_type))].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
             </select>
          </div>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
             <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Resource</label>
             <select required className="input" value={formData.resource_id} onChange={e => setFormData({...formData, resource_id: e.target.value})} disabled={!formData.category}>
                <option value="" disabled>Select Resource</option>
                {inventory.filter(r => r.status === 'Available' && r.available_quantity > 0 && r.resource_type === formData.category).map(r => (
                  <option key={r.resource_id} value={r.resource_id}>
                    {r.resource_name} - Available: {r.available_quantity} / {r.total_quantity}
                  </option>
                ))}
             </select>
          </div>
          <div style={{ width: '120px', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
             <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Amount</label>
             <input required type="number" min="1" className="input" value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || ''})} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={!formData.resource_id}>Allocate</button>
        </form>
      </div>

      <h4 style={{ marginBottom: '1rem' }}>Allocated Resources</h4>
      <div className="grid gap-4">
        {allocations.map(a => (
          <div key={a.resource_id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)', background: a.allocation_status === 'Released' ? 'var(--bg-base)' : 'inherit' }}>
             <div>
                <strong>{a.resource_name}</strong>
                <span style={{ fontSize: '0.8rem', marginLeft: '0.5rem', background: 'var(--bg-elevated)', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>{a.resource_type}</span>
                <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>Quantity Allocated: {a.quantity_allocated}</p>
             </div>
             {a.allocation_status === 'Allocated' ? (
                <button className="btn btn-secondary btn-sm" onClick={() => handleRelease(a.resource_id)}>Release</button>
             ) : (
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Released</span>
             )}
          </div>
        ))}
        {allocations.length === 0 && <p className="text-muted">No resources currently allocated.</p>}
      </div>
    </div>
  );
};

const OrgVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [typeFilter, setTypeFilter] = useState('');
  const [cityFilter, setCityFilter] = useState('');

  useEffect(() => {
    api.get('/organizer/vendors').then(res => setVendors(res.data)).catch(console.error);
  }, []);

  const types = [...new Set(vendors.map(v => v.vendor_type))];
  const cities = [...new Set(vendors.map(v => v.city))];

  const filtered = vendors.filter(v => {
    return (!typeFilter || v.vendor_type === typeFilter) && (!cityFilter || v.city === cityFilter);
  });

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem' }}>Global Vendor Directory</h3>
      
      <div className="flex gap-4" style={{ marginBottom: '1.5rem' }}>
        <select className="input" style={{ width: '50%', padding: '0.75rem', background: 'var(--bg-elevated)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }} value={typeFilter} onChange={e => setTypeFilter(e.target.value)}>
          <option value="">All Products/Services</option>
          {types.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className="input" style={{ width: '50%', padding: '0.75rem', background: 'var(--bg-elevated)', color: 'var(--text-main)', border: '1px solid var(--border-subtle)' }} value={cityFilter} onChange={e => setCityFilter(e.target.value)}>
          <option value="">All Cities</option>
          {cities.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {filtered.map(v => (
          <div key={v.vendor_id} style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: 'var(--border-radius-sm)' }}>
             <strong>{v.vendor_name}</strong>
             <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>{v.vendor_type} | {v.city}</p>
             <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>{v.contact_person} ({v.phone_no})</p>
          </div>
        ))}
        {filtered.length === 0 && <p className="text-muted">No vendors match your filters.</p>}
      </div>
    </div>
  );
};

const OrgGuests = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState("");
  const [sessions, setSessions] = useState([]);
  const [selectedSession, setSelectedSession] = useState("");
  const [guests, setGuests] = useState([]);
  
  useEffect(() => {
    api.get('/organizer/events').then(res => setEvents(res.data)).catch(console.error);
  }, []);
  
  useEffect(() => {
    if (selectedEvent) {
      if (!selectedSession) {
        api.get(`/organizer/events/${selectedEvent}/attendees`).then(res => setGuests(res.data)).catch(console.error);
      }
      api.get(`/organizer/events/${selectedEvent}/sessions`).then(res => setSessions(res.data)).catch(console.error);
    } else {
      setSessions([]);
      setGuests([]);
    }
  }, [selectedEvent]);

  useEffect(() => {
    if (selectedSession) {
      api.get(`/organizer/sessions/${selectedSession}/attendees`).then(res => setGuests(res.data)).catch(console.error);
    } else if (selectedEvent) {
      api.get(`/organizer/events/${selectedEvent}/attendees`).then(res => setGuests(res.data)).catch(console.error);
    }
  }, [selectedSession]);

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem' }}>Guest List Extraction</h3>
      <div className="flex gap-4" style={{ marginBottom: '1.5rem' }}>
        <select className="input" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }} value={selectedEvent} onChange={e => { setSelectedEvent(e.target.value); setSelectedSession(""); }}>
           <option value="" disabled>Select an Event</option>
           {events.filter(ev => ev.event_status !== 'Cancelled').map(ev => <option key={ev.event_id} value={ev.event_id}>{ev.event_name}</option>)}
        </select>
        
        <select className="input" style={{ flex: 1, padding: '0.75rem', borderRadius: 'var(--border-radius-sm)', background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)', color: 'var(--text-main)' }} value={selectedSession} onChange={e => setSelectedSession(e.target.value)} disabled={!selectedEvent || sessions.length === 0}>
           <option value="">All Event Attendees</option>
           {sessions.map(s => <option key={s.session_id} value={s.session_id}>{s.title} ({new Date(s.session_date).toLocaleDateString()})</option>)}
        </select>
      </div>
      
      {selectedEvent && (
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
           {guests.length === 0 ? <p className="text-muted">No registrations found.</p> : null}
           {guests.map((g, i) => (
             <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', borderBottom: '1px solid var(--border-subtle)' }}>
               <div>
                  <strong>{g.first_name} {g.last_name}</strong>
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{g.email_id} | {g.phone_no}</div>
               </div>
               <span style={{ fontSize: '0.85rem', color: g.registration_status === 'Confirmed' ? 'var(--accent)' : 'var(--text-muted)' }}>{g.registration_status}</span>
             </div>
           ))}
        </div>
      )}
    </div>
  );
};

const ParticipantView = () => {
  const [activeTab, setActiveTab] = useState('overview');

  return (
    <div className="grid grid-cols-4 gap-6 animate-fade-in">
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <button className={`btn ${activeTab === 'overview' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('overview')} style={{ justifyContent: 'flex-start' }}><DollarSign size={18} /> Overview</button>
        <button className={`btn ${activeTab === 'events' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('events')} style={{ justifyContent: 'flex-start' }}><Calendar size={18} /> Assigned Events</button>
        <button className={`btn ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTab('sessions')} style={{ justifyContent: 'flex-start' }}><Ticket size={18} /> My Sessions</button>
      </div>
      <div className="card" style={{ gridColumn: 'span 3', minHeight: '400px', padding: '2rem' }}>
        {activeTab === 'overview' && <ParticipantOverview />}
        {activeTab === 'events' && <ParticipantEvents />}
        {activeTab === 'sessions' && <ParticipantSessions />}
      </div>
    </div>
  );
};

const ParticipantOverview = () => {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => { api.get('/participant/metrics').then(res => setMetrics(res.data)).catch(console.error); }, []);

  if (!metrics) return <p className="text-muted">Loading metrics...</p>;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
         <Ticket size={24} style={{ marginBottom: '1rem', color: 'var(--accent)' }} />
         <h3>Assigned Sessions</h3>
         <h1 style={{ fontSize: '2.5rem' }}>{metrics.total_sessions}</h1>
      </div>
      <div className="card" style={{ background: 'var(--bg-elevated)', border: '1px solid var(--border-subtle)' }}>
         <Users size={24} style={{ marginBottom: '1rem', color: 'var(--accent)' }} />
         <h3>Expected Attendees</h3>
         <h1 style={{ fontSize: '2.5rem' }}>{metrics.total_attendees}</h1>
      </div>
      <div className="card" style={{ gridColumn: 'span 2', background: 'var(--bg-subtle)' }}>
         <DollarSign size={24} style={{ marginBottom: '1rem', color: 'var(--text-main)' }} />
         <h3>Event Revenue Influence (Read-Only)</h3>
         <h1 style={{ fontSize: '2.5rem' }}>₹{metrics.total_revenue}</h1>
         <p className="text-muted" style={{ fontSize: '0.85rem' }}>Cumulative generated revenue of all overarching events you are participating in.</p>
      </div>
    </div>
  );
};

const ParticipantEvents = () => {
  const [events, setEvents] = useState([]);
  useEffect(() => { api.get('/participant/events').then(res => setEvents(res.data)).catch(console.error); }, []);

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Calendar size={20} color="var(--accent)" /> Assigned Events</h3>
      <div className="grid gap-4">
        {events.map(ev => (
          <div key={ev.event_id} style={{ padding: '1.5rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--bg-elevated)' }}>
            <div className="flex justify-between" style={{ marginBottom: '1rem' }}>
              <h4 style={{ margin: 0, fontSize: '1.2rem' }}>{ev.event_name}</h4>
              <span style={{ color: ev.event_status === 'Upcoming' ? 'var(--accent)' : 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 'bold' }}>{ev.event_status}</span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-muted" style={{ fontSize: '0.9rem' }}>
               <p style={{ margin: 0 }}>📅 {new Date(ev.start_date).toLocaleDateString()} - {new Date(ev.end_date).toLocaleDateString()}</p>
               <p style={{ margin: 0 }}>📍 Venue: {ev.venue_name || 'TBD'} ({ev.city || 'TBD'})</p>
               <p style={{ margin: 0 }}>👤 Organizer: {ev.organizer_first} {ev.organizer_last}</p>
               <p style={{ margin: 0 }}>🏷️ Type: {ev.event_type}</p>
            </div>
          </div>
        ))}
        {events.length === 0 && <p className="text-muted">You are not mapped to any active events.</p>}
      </div>
    </div>
  );
};

const ParticipantSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [guestList, setGuestList] = useState({ show: false, sessionId: null, data: [] });

  useEffect(() => { api.get('/participant/sessions').then(res => setSessions(res.data)).catch(console.error); }, []);

  const loadGuestList = async (sessionId) => {
    try {
      const { data } = await api.get(`/participant/sessions/${sessionId}/guests`);
      setGuestList({ show: true, sessionId, data });
    } catch(err) { console.error(err); }
  };

  return (
    <div>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}><Ticket size={20} color="var(--accent)" /> My Assigned Schedule</h3>
      
      {!guestList.show ? (
        <div className="grid gap-4">
          {sessions.map(s => (
            <div key={s.session_id} style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--bg-elevated)' }}>
               <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                 <h4 style={{ margin: 0 }}>{s.title}</h4>
                 <button className="btn btn-secondary btn-sm" onClick={() => loadGuestList(s.session_id)}>View Guest List</button>
               </div>
               <p className="text-muted" style={{ margin: '0 0 0.5rem 0', fontSize: '0.85rem' }}>{s.event_name}</p>
               <div style={{ display: 'flex', gap: '2rem', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                 <span>📅 {new Date(s.session_date).toLocaleDateString()}</span>
                 <span>⏰ {s.start_time} - {s.end_time}</span>
                 <span>🎫 Registered: {s.slots_filled} / {s.total_slots}</span>
               </div>
            </div>
          ))}
          {sessions.length === 0 && <p className="text-muted">No scheduled sessions mapped to your identity.</p>}
        </div>
      ) : (
        <div className="animate-fade-in">
           <button className="btn btn-secondary btn-sm" style={{ marginBottom: '1.5rem' }} onClick={() => setGuestList({ show: false, sessionId: null, data: [] })}>
             ← Back to Schedule
           </button>
           <div className="grid grid-cols-2 gap-4">
             {guestList.data.map(g => (
               <div key={g.user_id} style={{ padding: '1rem', borderLeft: '4px solid var(--accent)', background: 'var(--bg-subtle)', borderRadius: '0 8px 8px 0' }}>
                 <div className="flex justify-between" style={{ marginBottom: '0.5rem' }}>
                   <strong style={{ margin: 0 }}>{g.first_name} {g.last_name}</strong>
                   <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: 'var(--bg-success)', color: 'var(--accent)', borderRadius: '4px' }}>Registered</span>
                 </div>
                 <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>📧 {g.email_id}</p>
                 <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>📅 Since: {new Date(g.session_registration_date).toLocaleDateString()}</p>
               </div>
             ))}
             {guestList.data.length === 0 && <p className="text-muted" style={{ gridColumn: 'span 2' }}>No attendees have checked-in to this session yet.</p>}
           </div>
        </div>
      )}
    </div>
  );
};

const AdminOverview = () => {
  const [metrics, setMetrics] = useState(null);
  useEffect(() => {
    api.get('/admin/analytics').then(res => setMetrics(res.data)).catch(console.error);
  }, []);

  if (!metrics) return <p>Loading analytics...</p>;
  return (
    <div className="grid grid-cols-2 gap-4">
      <div className="card">
         <Users size={24} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
         <h3>Total Users</h3>
         <h1 style={{ fontSize: '2.5rem' }}>{metrics.total_users}</h1>
      </div>
      <div className="card">
         <Calendar size={24} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
         <h3>Total Events</h3>
         <h1 style={{ fontSize: '2.5rem' }}>{metrics.total_events}</h1>
      </div>
      <div className="card">
         <Ticket size={24} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
         <h3>Total Registrations</h3>
         <h1 style={{ fontSize: '2.5rem' }}>{metrics.total_registrations}</h1>
      </div>
      <div className="card">
         <DollarSign size={24} style={{ marginBottom: '1rem', color: 'var(--primary)' }} />
         <h3>System Revenue</h3>
         <h1 style={{ fontSize: '2.5rem', color: 'var(--accent)' }}>${metrics.total_revenue}</h1>
      </div>
    </div>
  );
};

const AdminUsers = () => {
  const [activeSubTab, setActiveSubTab] = useState('list');
  const [users, setUsers] = useState([]);
  const [roleFilter, setRoleFilter] = useState('All');
  const [selectedUser, setSelectedUser] = useState(null); 
  
  const initialForm = { first_name: '', last_name: '', email_id: '', phone_no: '', username: '', password: '', role_type: 'Attendee' };
  const [formData, setFormData] = useState(initialForm);

  const fetchUsers = () => api.get('/admin/users').then(res => setUsers(res.data)).catch(console.error);
  useEffect(() => { fetchUsers(); }, []);

  const handleRole = async (id, role, action) => {
    try {
      if (action === 'assign') await api.post(`/admin/users/${id}/roles`, { role_type: role });
      if (action === 'remove') await api.delete(`/admin/users/${id}/roles`, { data: { role_type: role } });
      fetchUsers();
    } catch(err) {
      alert("Failed to modify role: " + (err.response?.data?.error || err.message));
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/users', formData);
      alert("User created successfully!");
      setFormData(initialForm);
      setActiveSubTab('list');
      fetchUsers();
    } catch(err) {
      alert("Failed to create user: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDeleteUser = async (id) => {
    if(window.confirm("CRITICAL WARNING: This will permanently delete the user and all associated data from the database. Proceed?")) {
      try {
        await api.delete(`/admin/users/${id}/permanent`);
        setSelectedUser(null);
        fetchUsers();
      } catch(err) {
        alert("Failed to delete user: " + (err.response?.data?.error || err.message));
      }
    }
  };

  const filteredUsers = users.filter(u => {
    if (roleFilter === 'All') return true;
    if (roleFilter === 'Attendee') return true; // Every identity is fundamentally an attendee
    return u.roles && u.roles.includes(roleFilter);
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.5rem', marginBottom: '1.5rem' }}>
        <button className={`nav-tab ${activeSubTab === 'list' ? 'active' : ''}`} onClick={() => setActiveSubTab('list')}>View Users</button>
        <button className={`nav-tab ${activeSubTab === 'add' ? 'active' : ''}`} onClick={() => setActiveSubTab('add')}>Add User</button>
      </div>

      {activeSubTab === 'list' && (
        <>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
            <h3 style={{ margin: 0 }}>User Management</h3>
            <select className="input" value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ padding: '0.4rem', width: '200px' }}>
              <option value="All">Filter by Role: All</option>
              <option value="Admin">Admin</option>
              <option value="Organizer">Organizer</option>
              <option value="Speaker">Speaker</option>
              <option value="Performer">Performer</option>
              <option value="Attendee">Attendee</option>
            </select>
          </div>
          
          <table className="w-full" style={{ textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
                 <th style={{ padding: '1rem 0.5rem' }}>User</th>
                 <th style={{ padding: '1rem 0.5rem' }}>Email</th>
                 <th style={{ padding: '1rem 0.5rem' }}>Phone</th>
                 <th style={{ padding: '1rem 0.5rem' }}>Roles</th>
                 <th style={{ padding: '1rem 0.5rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map(u => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '1.25rem 0.5rem' }}>{u.first_name} {u.last_name}</td>
                  <td style={{ padding: '1.25rem 0.5rem' }}>{u.email_id}</td>
                  <td style={{ padding: '1.25rem 0.5rem', color: 'var(--text-muted)' }}>{u.phone_no}</td>
                  <td style={{ padding: '1.25rem 0.5rem' }}>{(u.roles || 'Attendee').split(',').map(r => <span key={r} style={{ margin: '0.2rem', padding: '0.2rem 0.5rem', background: 'var(--bg-elevated)', borderRadius: '4px', fontSize: '0.85rem' }}>{r}</span>)}</td>
                  <td style={{ padding: '1.25rem 0.5rem' }}>
                     <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(u)}>
                       Manage / Remove
                     </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}

      {activeSubTab === 'add' && (
        <>
          <h3 style={{ marginBottom: '1rem' }}>Register New User</h3>
          <form onSubmit={handleCreateUser} className="grid grid-cols-2 gap-4">
             <input required placeholder="First Name" className="input" value={formData.first_name} onChange={e=>setFormData({...formData, first_name: e.target.value})} />
             <input required placeholder="Last Name" className="input" value={formData.last_name} onChange={e=>setFormData({...formData, last_name: e.target.value})} />
             <input required type="email" placeholder="Email" className="input" value={formData.email_id} onChange={e=>setFormData({...formData, email_id: e.target.value})} />
             <input required placeholder="Phone" className="input" value={formData.phone_no} onChange={e=>setFormData({...formData, phone_no: e.target.value})} />
             <input required placeholder="Username" className="input" value={formData.username} onChange={e=>setFormData({...formData, username: e.target.value})} />
             <input required type="password" placeholder="Password" className="input" value={formData.password} onChange={e=>setFormData({...formData, password: e.target.value})} />
             <select className="input" style={{ gridColumn: 'span 2' }} value={formData.role_type} onChange={e=>setFormData({...formData, role_type: e.target.value})}>
                <option value="Attendee">Attendee (Default)</option>
                <option value="Organizer">Organizer</option>
                <option value="Speaker">Speaker</option>
                <option value="Performer">Performer</option>
                <option value="Admin">Admin</option>
             </select>
             <button type="submit" className="btn btn-primary" style={{ gridColumn: 'span 2' }}>Create Database User</button>
          </form>
        </>
      )}

      {selectedUser && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000}}>
           <div className="card" style={{ width: '500px', backgroundColor: 'var(--bg-base)' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ margin: 0 }}>Manage User Roles: {selectedUser.first_name}</h3>
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedUser(null)}>X</button>
             </div>
             
             <div style={{ marginBottom: '1.5rem', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
               <h4 style={{ marginBottom: '0.5rem' }}>Active Roles</h4>
               {(selectedUser.roles || 'Attendee').split(',').map(r => (
                  <div key={r} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid var(--border-subtle)', alignItems: 'center' }}>
                     <span>{r}</span>
                     <button className="btn btn-secondary btn-sm" onClick={() => {
                        if (window.confirm(`Are you sure you want to revoke the ${r} role for this user?`)) {
                          handleRole(selectedUser.user_id, r, 'remove');
                          setSelectedUser({...selectedUser, roles: selectedUser.roles.replace(r, '').replace(',,', ',').replace(/(^,)|(,$)/g, '')});
                        }
                     }}>
                       Revoke
                     </button>
                  </div>
               ))}
               
               <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
                 <select className="input" style={{ flex: 1 }} id="modal-assign-role">
                   <option value="">Select Role to Assign...</option>
                   <option value="Organizer">Organizer</option>
                   <option value="Speaker">Speaker</option>
                   <option value="Performer">Performer</option>
                   <option value="Admin">Admin</option>
                 </select>
                 <button className="btn btn-primary" onClick={() => {
                   const r = document.getElementById('modal-assign-role').value;
                   if (r) {
                      handleRole(selectedUser.user_id, r, 'assign');
                      setSelectedUser({...selectedUser, roles: selectedUser.roles ? selectedUser.roles+','+r : r});
                   }
                 }}>Add</button>
               </div>
             </div>

             <div style={{ borderTop: '1px solid var(--error)', paddingTop: '1rem' }}>
                <button className="btn btn-primary w-full" style={{ backgroundColor: 'transparent', color: 'var(--error)', border: '1px solid var(--error)' }} onClick={() => handleDeleteUser(selectedUser.user_id)}>
                  Destroy Identity Permanently
                </button>
             </div>
           </div>
        </div>
      )}
    </div>
  );
};

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [cityFilter, setCityFilter] = useState('');
  const [orgFilter, setOrgFilter] = useState('');
  
  const [viewDetails, setViewDetails] = useState({ type: null, data: null, title: '' });

  const fetchEvents = () => api.get('/admin/events').then(res => setEvents(res.data)).catch(console.error);
  useEffect(() => { fetchEvents(); }, []);

  const handleCancel = async (id) => {
    if(window.confirm("Admin forced cancellation: Nullify this event?")) {
      await api.post(`/admin/events/${id}/cancel`).catch(console.error);
      fetchEvents();
    }
  };

  const loadSessions = async (ev) => {
    try {
      const { data } = await api.get(`/admin/events/${ev.event_id}/sessions`);
      setViewDetails({ type: 'sessions', data, title: `Sessions for ${ev.event_name}` });
    } catch(err) { console.error(err); }
  };

  const loadEventRegistrations = async (ev) => {
    try {
      const { data } = await api.get(`/admin/events/${ev.event_id}/registrations`);
      setViewDetails({ type: 'event_regs', data, title: `Registrations for ${ev.event_name}` });
    } catch(err) { console.error(err); }
  };

  const loadSessionRegistrations = async (s) => {
    try {
      const { data } = await api.get(`/admin/sessions/${s.session_id}/registrations`);
      setViewDetails({ type: 'session_regs', data, title: `Registrations for Session: ${s.title}` });
    } catch(err) { console.error(err); }
  };

  const loadEventResources = async (ev) => {
    try {
      const { data } = await api.get(`/admin/events/${ev.event_id}/resources`);
      setViewDetails({ type: 'event_resources', data, title: `Allocated Resources for ${ev.event_name}` });
    } catch(err) { console.error(err); }
  };

  const cities = [...new Set(events.map(e => e.city).filter(Boolean))];
  const organizers = [...new Set(events.map(e => `${e.organizer_first} ${e.organizer_last}`))];

  const filteredEvents = events.filter(e => {
    if (cityFilter && e.city !== cityFilter) return false;
    if (orgFilter && `${e.organizer_first} ${e.organizer_last}` !== orgFilter) return false;
    return true;
  });

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>Global Event Oversight</h3>
         {!viewDetails.type ? (
        <>
          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
             <select className="input" value={cityFilter} onChange={e=>setCityFilter(e.target.value)} style={{ flex: 1, padding: '0.5rem' }}>
                <option value="">Filter by City: All</option>
                {cities.map(c => <option key={c} value={c}>{c}</option>)}
             </select>
             <select className="input" value={orgFilter} onChange={e=>setOrgFilter(e.target.value)} style={{ flex: 1, padding: '0.5rem' }}>
                <option value="">Filter by Organizer: All</option>
                {organizers.map(o => <option key={o} value={o}>{o}</option>)}
             </select>
          </div>

          <div className="grid gap-4">
             {filteredEvents.map(ev => (
               <div key={ev.event_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                  <div>
                     <strong>{ev.event_name}</strong>
                     <div className="text-muted" style={{ fontSize: '0.85rem' }}>Type: {ev.event_type} | Status: <span style={{ color: ev.event_status==='Cancelled' ? 'var(--error)' : 'inherit' }}>{ev.event_status}</span></div>
                     <div className="text-muted" style={{ fontSize: '0.85rem' }}>Organizer: {ev.organizer_first} {ev.organizer_last} | City: {ev.city || 'N/A'}</div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                     <button className="btn btn-secondary btn-sm" onClick={() => loadSessions(ev)}>View Sessions</button>
                     <button className="btn btn-secondary btn-sm" onClick={() => loadEventRegistrations(ev)}>View Registrations</button>
                     <button className="btn btn-secondary btn-sm" onClick={() => loadEventResources(ev)}>View Resources</button>
                     {ev.event_status !== 'Cancelled' && <button className="btn btn-primary btn-sm" style={{ background: 'var(--error)' }} onClick={() => handleCancel(ev.event_id)}>Force Cancel</button>}
                  </div>
               </div>
             ))}
          </div>
        </>
      ) : (
        <div className="animate-fade-in">
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewDetails({type: null, data: null, title: ''})}>
                ← Back
              </button>
              <h3 style={{ margin: 0 }}>{viewDetails.title}</h3>
           </div>

           {viewDetails.type === 'sessions' && (
             <div className="grid gap-4">
               {viewDetails.data.map(s => (
                 <div key={s.session_id} style={{ padding: '1.25rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', position: 'relative', opacity: s.session_status === 'Cancelled' ? 0.6 : 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                       {s.title}
                       {s.session_status === 'Cancelled' && <span style={{ background: 'var(--error)', color: 'white', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem' }}>CANCELLED</span>}
                     </h4>
                     <p className="text-muted" style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>📅 {new Date(s.session_date).toLocaleDateString()} | ⏰ {s.start_time} - {s.end_time}</p>
                     <p className="text-muted" style={{ margin: 0, fontSize: '0.85rem' }}>🎤 Speaker/Performer: <strong>{s.first_name} {s.last_name}</strong> | 🎫 Capacity: <strong>{s.slots_filled}/{s.total_slots}</strong></p>
                   </div>
                   <div>
                     <button className="btn btn-secondary btn-sm" disabled={s.session_status === 'Cancelled'} onClick={() => loadSessionRegistrations(s)}>View Attendee Log</button>
                   </div>
                 </div>
               ))}
             </div>
           )}

           {viewDetails.type === 'event_regs' && (
             <div className="grid grid-cols-2 gap-4">
               {viewDetails.data.map(r => (
                 <div key={r.registration_id} style={{ borderLeft: r.registration_status === 'Cancelled' ? '4px solid var(--error)' : '4px solid var(--accent)', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0 8px 8px 0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                     <strong>{r.first_name} {r.last_name}</strong>
                     <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: r.registration_status === 'Cancelled' ? 'var(--error)' : 'var(--bg-success)', color: r.registration_status === 'Cancelled' ? 'white' : 'var(--accent)', borderRadius: '4px' }}>
                       {r.registration_status}
                     </span>
                   </div>
                   <p className="text-muted" style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>📧 {r.email_id}</p>
                   <p className="text-muted" style={{ margin: '0', fontSize: '0.85rem' }}>💳 Payment: {r.payment_status || 'N/A'} | 📅 Date: {new Date(r.registration_date).toLocaleDateString()}</p>
                 </div>
               ))}
             </div>
           )}

           {viewDetails.type === 'session_regs' && (
             <div className="grid grid-cols-2 gap-4">
               {viewDetails.data.map(r => (
                 <div key={r.session_registration_no} style={{ borderLeft: r.session_registration_status === 'Cancelled' ? '4px solid var(--error)' : '4px solid #10b981', padding: '1rem', background: 'var(--bg-elevated)', borderRadius: '0 8px 8px 0' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                     <strong>{r.first_name} {r.last_name}</strong>
                     <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: r.session_registration_status === 'Cancelled' ? 'var(--error)' : '#d1fae5', color: r.session_registration_status === 'Cancelled' ? 'white' : '#047857', borderRadius: '4px' }}>
                       {r.session_registration_status}
                     </span>
                   </div>
                   <p className="text-muted" style={{ margin: '0 0 0.25rem 0', fontSize: '0.85rem' }}>📧 {r.email_id}</p>
                   <p className="text-muted" style={{ margin: '0', fontSize: '0.85rem' }}>📅 Checked-in: {new Date(r.session_registration_date).toLocaleDateString()}</p>
                 </div>
               ))}
             </div>
           )}

           {viewDetails.type === 'event_resources' && (
             <div className="grid gap-4">
               {viewDetails.data.map(r => (
                 <div key={`${r.session_id}-${r.resource_id}`} style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                   <div>
                     <strong>{r.resource_name}</strong> <span className="text-muted" style={{ fontSize: '0.85rem' }}>({r.resource_type})</span>
                     <p className="text-muted" style={{ margin: '0.25rem 0 0 0', fontSize: '0.85rem' }}>Session: {r.session_title}</p>
                   </div>
                   <div style={{ textAlign: 'right' }}>
                     <span style={{ padding: '0.2rem 0.5rem', background: r.allocation_status === 'Allocated' ? '#d1fae5' : 'var(--bg-subtle)', color: r.allocation_status === 'Allocated' ? '#047857' : 'inherit', borderRadius: '4px', fontSize: '0.85rem' }}>{r.allocation_status}</span>
                     <p style={{ margin: '0.25rem 0 0 0', fontWeight: 'bold' }}>Qty: {r.quantity_allocated}</p>
                   </div>
                 </div>
               ))}
             </div>
           )}

           {viewDetails.data && viewDetails.data.length === 0 && (
             <div style={{ padding: '3rem', textAlign: 'center', background: 'var(--bg-elevated)', borderRadius: '8px' }}>
               <p className="text-muted" style={{ margin: 0 }}>No records found in the database.</p>
             </div>
           )}
        </div>
      )}
    </div>
  );
};

const AdminPayments = () => {
  const [payments, setPayments] = useState([]);
  const [eventFilter, setEventFilter] = useState('');
  useEffect(() => { api.get('/admin/payments').then(res => setPayments(res.data)).catch(console.error); }, []);

  const events = [...new Set(payments.map(p => p.event_name).filter(Boolean))];
  const filteredPayments = payments.filter(p => eventFilter === '' || p.event_name === eventFilter);

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>Financial Ledger</h3>

      <div style={{ marginBottom: '1.5rem' }}>
         <select className="input" value={eventFilter} onChange={e=>setEventFilter(e.target.value)} style={{ width: '300px', padding: '0.5rem' }}>
            <option value="">Filter by Event: All</option>
            {events.map(e => <option key={e} value={e}>{e}</option>)}
         </select>
      </div>

      <table className="w-full" style={{ textAlign: 'left', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid var(--border-subtle)' }}>
             <th style={{ padding: '1rem 0.5rem' }}>Transaction ID</th>
             <th style={{ padding: '1rem 0.5rem' }}>Event</th>
             <th style={{ padding: '1rem 0.5rem' }}>User Email</th>
             <th style={{ padding: '1rem 0.5rem' }}>Amount</th>
             <th style={{ padding: '1rem 0.5rem' }}>Mode</th>
             <th style={{ padding: '1rem 0.5rem' }}>Status</th>
             <th style={{ padding: '1rem 0.5rem' }}>Date</th>
          </tr>
        </thead>
        <tbody>
           {filteredPayments.map(p => (
             <tr key={p.payment_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                <td style={{ padding: '1.25rem 0.5rem' }}><strong>{p.payment_id}</strong></td>
                <td style={{ padding: '1.25rem 0.5rem' }}>{p.event_name}</td>
                <td style={{ padding: '1.25rem 0.5rem', color: 'var(--text-muted)' }}>{p.email_id}</td>
                <td style={{ padding: '1.25rem 0.5rem', fontWeight: 'bold' }}>₹{p.amount}</td>
                <td style={{ padding: '1.25rem 0.5rem' }}>{p.payment_mode}</td>
                <td style={{ padding: '1.25rem 0.5rem' }}>
                  <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', background: p.payment_status === 'Failed' ? 'var(--error)' : p.payment_status === 'Pending' ? '#f59e0b' : '#d1fae5', color: p.payment_status === 'Failed' ? 'white' : p.payment_status === 'Pending' ? 'white' : '#047857', borderRadius: '4px' }}>
                     {p.payment_status}
                  </span>
                </td>
                <td style={{ padding: '1.25rem 0.5rem', fontSize: '0.85rem' }}>{new Date(p.payment_datetime).toLocaleString()}</td>
             </tr>
           ))}
        </tbody>
      </table>
      {filteredPayments.length === 0 && <p className="text-muted" style={{ marginTop: '1rem' }}>No payment records found.</p>}
    </div>
  );
};

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [viewDetails, setViewDetails] = useState({ show: false, data: [], title: '' });

  useEffect(() => { api.get('/admin/resources').then(res => setResources(res.data)).catch(console.error); }, []);

  const loadResourceAllocations = async (r) => {
    try {
      const { data } = await api.get(`/admin/resources/${r.resource_id}/allocations`);
      setViewDetails({ show: true, data, title: `Allocations for ${r.resource_name}` });
    } catch(err) { console.error(err); }
  };

  return (
    <div className="card">
      <h3 style={{ marginBottom: '1rem' }}>Global Inventory Audit</h3>
      {!viewDetails.show ? (
        <div className="grid gap-4">
           {resources.map(r => (
             <div key={r.resource_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                <div>
                   <strong>{r.resource_name}</strong> <span className="text-muted" style={{ fontSize: '0.85rem' }}>({r.resource_type})</span>
                   <div style={{ marginTop: '0.5rem' }}>Total System Allocation: <strong>{r.total_allocated}</strong></div>
                </div>
                <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '0.5rem', alignItems: 'flex-end' }}>
                   <div>Available: {r.available_quantity} / {r.total_quantity}</div>
                   <button className="btn btn-secondary btn-sm" onClick={() => loadResourceAllocations(r)}>View Event Distribution</button>
                </div>
             </div>
           ))}
        </div>
      ) : (
        <div className="animate-fade-in">
           <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '1rem' }}>
              <button className="btn btn-secondary btn-sm" onClick={() => setViewDetails({show: false, data: [], title: ''})}>
                ← Back
              </button>
              <h3 style={{ margin: 0 }}>{viewDetails.title}</h3>
           </div>
           
           <div className="grid gap-4">
             {viewDetails.data.map((r, idx) => (
               <div key={idx} style={{ padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--bg-elevated)', display: 'flex', justifyContent: 'space-between' }}>
                  <div>
                    <strong>{r.event_name}</strong> <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>({r.session_title})</span>
                    <div style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>👤 Organizer: {r.first_name} {r.last_name} | 📅 {new Date(r.session_date).toLocaleDateString()} {r.start_time}-{r.end_time}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <span style={{ padding: '0.2rem 0.5rem', background: r.allocation_status === 'Allocated' ? '#d1fae5' : 'var(--bg-subtle)', color: r.allocation_status === 'Allocated' ? '#047857' : 'inherit', borderRadius: '4px', fontSize: '0.85rem' }}>{r.allocation_status}</span>
                    <div style={{ marginTop: '0.25rem', fontWeight: 'bold' }}>Qty: {r.quantity_allocated}</div>
                  </div>
               </div>
             ))}
             {viewDetails.data.length === 0 && <p className="text-muted">This resource is not currently allocated to any events.</p>}
           </div>
        </div>
      )}
    </div>
  );
};

const AdminVendors = () => {
  const [vendors, setVendors] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [vendorCityFilter, setVendorCityFilter] = useState('');
  const [vendorTypeFilter, setVendorTypeFilter] = useState('');
  
  const cityToState = {
    'Delhi': 'Delhi',
    'Bangalore': 'Karnataka',
    'Mumbai': 'Maharashtra',
    'Pune': 'Maharashtra',
    'Chennai': 'Tamil Nadu',
    'Kolkata': 'West Bengal',
    'Jaipur': 'Rajasthan',
    'Hyderabad': 'Telangana',
    'Ahmedabad': 'Gujarat'
  };

  const [formData, setFormData] = useState({
    vendor_name: '', vendor_type: 'Other', contact_person: '', phone_no: '', email: '', street: '', city: 'Delhi', state: 'Delhi', pincode: '', courier_facility: 0
  });

  const fetchVendors = () => api.get('/admin/vendors').then(res => setVendors(res.data)).catch(console.error);
  useEffect(() => { fetchVendors(); }, []);

  const handleDelete = async (id) => {
    if(window.confirm("Permanently remove this Vendor from the system?")) {
      await api.delete(`/admin/vendors/${id}`).catch(console.error);
      fetchVendors();
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await api.post('/admin/vendors', formData);
      fetchVendors();
      setShowModal(false);
      setFormData({ vendor_name: '', vendor_type: 'Other', contact_person: '', phone_no: '', email: '', street: '', city: 'Delhi', state: 'Delhi', pincode: '', courier_facility: 0 });
    } catch(err) {
      alert("Failed to add vendor: " + (err.response?.data?.error || err.message));
    }
  };

  const vendorCities = [...new Set(vendors.map(v => v.city).filter(Boolean))];
  const vendorTypes = [...new Set(vendors.map(v => v.vendor_type).filter(Boolean))];
  const filteredVendors = vendors.filter(v => {
    if (vendorCityFilter && v.city !== vendorCityFilter) return false;
    if (vendorTypeFilter && v.vendor_type !== vendorTypeFilter) return false;
    return true;
  });

  return (
    <div className="card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
         <h3 style={{ margin: 0 }}>Vendor Partnerships</h3>
         <button className="btn btn-primary btn-sm" onClick={() => setShowModal(!showModal)}>+ Add Vendor</button>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
         <select className="input" value={vendorCityFilter} onChange={e=>setVendorCityFilter(e.target.value)} style={{ flex: 1, padding: '0.5rem' }}>
            <option value="">Filter by City: All</option>
            {vendorCities.map(c => <option key={c} value={c}>{c}</option>)}
         </select>
         <select className="input" value={vendorTypeFilter} onChange={e=>setVendorTypeFilter(e.target.value)} style={{ flex: 1, padding: '0.5rem' }}>
            <option value="">Filter by Type: All</option>
            {vendorTypes.map(t => <option key={t} value={t}>{t}</option>)}
         </select>
      </div>

      {showModal && (
        <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--bg-elevated)' }}>
          <form onSubmit={handleCreate} className="grid grid-cols-2 gap-4">
            <input required className="input" placeholder="Vendor Name (e.g. Beats Audio)" value={formData.vendor_name} onChange={e=>setFormData({...formData, vendor_name: e.target.value})} />
            <select className="input" value={formData.vendor_type} onChange={e=>setFormData({...formData, vendor_type: e.target.value})}>
               <option value="Stationery">Stationery</option>
               <option value="Music">Music</option>
               <option value="Food">Food</option>
               <option value="Decoration">Decoration</option>
               <option value="Technical">Technical</option>
               <option value="Other">Other</option>
            </select>
            <input required className="input" placeholder="Contact Person" value={formData.contact_person} onChange={e=>setFormData({...formData, contact_person: e.target.value})} />
            <input required className="input" placeholder="Phone (10 digits)" pattern="[0-9]{10}" value={formData.phone_no} onChange={e=>setFormData({...formData, phone_no: e.target.value})} />
            <input type="email" className="input" placeholder="Email Address" value={formData.email} onChange={e=>setFormData({...formData, email: e.target.value})} />
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Courier Facility:</span>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                 <input type="radio" name="courier" checked={formData.courier_facility === 1} onChange={() => setFormData({...formData, courier_facility: 1})} />
                 Yes
               </label>
               <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', cursor: 'pointer' }}>
                 <input type="radio" name="courier" checked={formData.courier_facility === 0} onChange={() => setFormData({...formData, courier_facility: 0})} />
                 No
               </label>
            </div>
            <input required className="input" placeholder="Street Address" value={formData.street} onChange={e=>setFormData({...formData, street: e.target.value})} />
            <select required className="input" value={formData.city} onChange={e=>setFormData({...formData, city: e.target.value, state: cityToState[e.target.value] || ''})}>
              {Object.keys(cityToState).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input required className="input" placeholder="State" value={formData.state} readOnly style={{ background: 'var(--bg-subtle)', color: 'var(--text-main)', opacity: 1 }} />
            <input required className="input" placeholder="Pincode" value={formData.pincode} onChange={e=>setFormData({...formData, pincode: e.target.value})} />
            <div style={{ gridColumn: 'span 2', marginTop: '0.5rem' }}>
               <button type="submit" className="btn btn-primary w-full">Register Vendor Contract</button>
            </div>
          </form>
        </div>
      )}

      <div className="grid gap-4">
         {filteredVendors.map(v => (
           <div key={v.vendor_id} style={{ display: 'flex', justifyContent: 'space-between', padding: '1rem', border: '1px solid var(--border-subtle)', borderRadius: '8px', background: 'var(--bg-elevated)' }}>
              <div>
                 <h4 style={{ margin: '0 0 0.25rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    {v.vendor_name} <span style={{ padding: '0.1rem 0.4rem', fontSize: '0.7rem', background: 'var(--bg-subtle)', borderRadius: '4px' }}>{v.vendor_type}</span>
                 </h4>
                 <div className="text-muted" style={{ fontSize: '0.85rem' }}>👤 {v.contact_person} | 📞 {v.phone_no} | 📧 {v.email || 'N/A'}</div>
                 <div className="text-muted" style={{ fontSize: '0.85rem', marginTop: '0.25rem' }}>📍 {v.street}, {v.city}, {v.state} - {v.pincode} {v.courier_facility ? ' | 🚚 Courier Ready' : ''}</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                 <button className="btn btn-secondary btn-sm" style={{ color: 'var(--error)', borderColor: 'var(--error)' }} onClick={() => handleDelete(v.vendor_id)}>Revoke Contract</button>
              </div>
           </div>
         ))}
         {filteredVendors.length === 0 && <p className="text-muted">No external vendors matched the filters.</p>}
      </div>
    </div>
  );
};

const AdminView = () => {
  const [activeTab, setActiveTab] = useState('overview');
  return (
    <div className="animate-fade-in">
      <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '2.5rem', padding: '0.5rem', background: 'var(--bg-elevated)', borderRadius: '12px', overflowX: 'auto', border: '1px solid var(--border-subtle)' }}>
        {[
          { id: 'overview', icon: '📊', label: 'Overview' },
          { id: 'users', icon: '👥', label: 'Users' },
          { id: 'events', icon: '📅', label: 'Events' },
          { id: 'payments', icon: '💳', label: 'Payments' },
          { id: 'resources', icon: '📦', label: 'Resources' },
          { id: 'vendors', icon: '💼', label: 'Vendors' }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              whiteSpace: 'nowrap',
              background: activeTab === tab.id ? 'var(--accent)' : 'transparent',
              color: activeTab === tab.id ? '#ffffff' : 'var(--text-muted)'
            }}
            onMouseOver={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'var(--bg-subtle)';
                e.currentTarget.style.color = 'var(--text-main)';
              }
            }}
            onMouseOut={(e) => {
              if (activeTab !== tab.id) {
                e.currentTarget.style.background = 'transparent';
                e.currentTarget.style.color = 'var(--text-muted)';
              }
            }}
          >
            <span style={{ fontSize: '1.1rem' }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && <AdminOverview />}
      {activeTab === 'users' && <AdminUsers />}
      {activeTab === 'events' && <AdminEvents />}
      {activeTab === 'payments' && <AdminPayments />}
      {activeTab === 'resources' && <AdminResources />}
      {activeTab === 'vendors' && <AdminVendors />}
    </div>
  );
};

export default Dashboard;
