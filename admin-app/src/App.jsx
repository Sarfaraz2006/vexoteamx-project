import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Phone, Cpu, Zap, Code, Database, 
  UserCheck, Award, Smile, Rocket, Bot, Video, 
  Layers, Settings, Check, Star, Mail, MapPin, 
  X, Trash, Plus, Edit2, Save, RefreshCw, Bell, 
  Calendar, CheckCircle2, AlertTriangle, PhoneCall,
  Volume2, VolumeX, Edit
} from 'lucide-react';
import './App.css';

// Dynamic API detection helpers.
const getInitialApiBase = () => {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem('VEXO_API_BASE');
    if (saved) return saved;
    const hn = window.location.hostname;
    // If local APK environment or localhost dev
    if (hn === 'localhost' || hn === '127.0.0.1' || hn === '' || hn.includes('local') || hn.startsWith('10.')) {
      return 'http://67.205.137.231:3001';
    }
    return `http://${hn}:3001`;
  }
  return 'http://67.205.137.231:3001';
};

export default function App() {
  const [apiBase, setApiBase] = useState(getInitialApiBase);
  const [tempApiUrl, setTempApiUrl] = useState(apiBase);
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard', 'bookings', 'calls', 'editor'

  const wsBase = apiBase.replace(/^http/, 'ws');
  
  // Re-expose API_BASE and WS_BASE locally so child components/hooks work seamlessly
  const API_BASE = apiBase;
  const WS_BASE = wsBase;
  
  // Real-Time States
  const [bookings, setBookings] = useState([]);
  const [calls, setCalls] = useState([]);
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Notification States
  const [notifications, setNotifications] = useState([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [latestAlert, setLatestAlert] = useState(null);

  // visual modals for adding/editing services/projects/testimonials
  const [editorModal, setEditorModal] = useState(null); // 'service_add', 'service_edit', 'project_add', 'project_edit', 'testimonial_add', 'testimonial_edit'
  const [modalItem, setModalItem] = useState(null); // stores item being edited

  // WebSocket Ref
  const wsRef = useRef(null);

  // Play Audible Notification Beep using Web Audio API (cross-platform, native, zero file loading required)
  const playNotificationBeep = () => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      const playBeep = (freq, duration, startTime) => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.setValueAtTime(freq, startTime);
        gain.gain.setValueAtTime(0.15, startTime);
        gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration - 0.05);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };

      const now = audioCtx.currentTime;
      playBeep(880, 0.15, now);
      playBeep(1100, 0.25, now + 0.18);
    } catch (e) {
      console.log("Audio contexts blocked or not supported on this device.", e);
    }
  };

  // Fetch Data from SQLite API
  const fetchData = async () => {
    setLoading(true);
    setError('');
    try {
      const configRes = await fetch(`${API_BASE}/api/config`);
      const bookingsRes = await fetch(`${API_BASE}/api/bookings`);
      const callsRes = await fetch(`${API_BASE}/api/calls`);
      
      if (!configRes.ok || !bookingsRes.ok || !callsRes.ok) {
        throw new Error("Failed to synchronize with database servers.");
      }

      const configData = await configRes.json();
      const bookingsData = await bookingsRes.json();
      const callsData = await callsRes.json();

      setConfig(configData);
      setBookings(bookingsData);
      setCalls(callsData);
    } catch (err) {
      setError(err.message || "Database connection offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();

    // Setup real-time WebSocket connection
    const connectWebSocket = () => {
      console.log("Connecting to WebSocket:", WS_BASE);
      const ws = new WebSocket(WS_BASE);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          console.log("WS message received:", message);
          
          if (message.type === 'NEW_BOOKING') {
            setBookings(prev => [message.data, ...prev]);
            setLatestAlert({ type: 'booking', data: message.data });
            setNotifications(prev => [
              { id: Date.now(), text: `New Booking: ${message.data.name} for ${message.data.service}`, time: new Date().toLocaleTimeString() },
              ...prev
            ]);
            playNotificationBeep();
          } else if (message.type === 'NEW_CALL') {
            setCalls(prev => [message.data, ...prev]);
            setLatestAlert({ type: 'call', data: message.data });
            setNotifications(prev => [
              { id: Date.now(), text: `Callback Request: ${message.data.name} (${message.data.phone})`, time: new Date().toLocaleTimeString() },
              ...prev
            ]);
            playNotificationBeep();
          } else if (message.type === 'CONFIG_UPDATED') {
            setConfig(message.data);
          } else if (message.type === 'BOOKING_UPDATED') {
            setBookings(prev => prev.map(b => b.id === message.data.id ? message.data : b));
          } else if (message.type === 'CALL_UPDATED') {
            setCalls(prev => prev.map(c => c.id === message.data.id ? message.data : c));
          }
        } catch (e) {
          console.error("Failed to parse WebSocket message", e);
        }
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected. Retrying connection in 5 seconds...");
        setTimeout(connectWebSocket, 5000);
      };

      ws.onerror = (err) => {
        console.error("WebSocket encountered an error:", err);
      };
    };

    connectWebSocket();

    return () => {
      if (wsRef.current) wsRef.current.close();
    };
  }, [apiBase]);

  // Update Booking Status API call
  const handleUpdateBookingStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setBookings(prev => prev.map(b => b.id === id ? updated : b));
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Delete Booking API call
  const handleDeleteBooking = async (id) => {
    if (!confirm("Are you sure you want to delete this booking record?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/bookings/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setBookings(prev => prev.filter(b => b.id !== id));
      }
    } catch (err) {
      alert("Failed to delete booking: " + err.message);
    }
  };

  // Update Call Callback Status
  const handleUpdateCallStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/api/calls/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        const updated = await res.json();
        setCalls(prev => prev.map(c => c.id === id ? updated : c));
      }
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  // Delete Call Request
  const handleDeleteCall = async (id) => {
    if (!confirm("Are you sure you want to delete this call callback request?")) return;
    try {
      const res = await fetch(`${API_BASE}/api/calls/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCalls(prev => prev.filter(c => c.id !== id));
      }
    } catch (err) {
      alert("Failed to delete request: " + err.message);
    }
  };

  // Save full configuration to SQLite Backend
  const handleSaveConfig = async (updatedConfig = config) => {
    try {
      const res = await fetch(`${API_BASE}/api/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedConfig)
      });
      if (res.ok) {
        const data = await res.json();
        setConfig(data.config);
        alert("Portfolio Configuration pushed and updated LIVE on the website successfully!");
      }
    } catch (err) {
      alert("Failed to publish config: " + err.message);
    }
  };

  // Modal actions handlers for Editor
  const openEditorModal = (type, item = null) => {
    setEditorModal(type);
    if (item) {
      setModalItem({ ...item });
    } else {
      // Set defaults for new item creation
      if (type === 'service_add') {
        setModalItem({ title: '', desc: '', icon: 'Zap', color: 'purple' });
      } else if (type === 'project_add') {
        setModalItem({ title: '', img: '/project_crm.jpg', tag: 'Click to Test Live Demo', type: 'crm' });
      } else if (type === 'testimonial_add') {
        setModalItem({ name: '', company: '', quote: '', avatar: 'CL', rating: 5 });
      }
    }
  };

  const handleModalSubmit = (e) => {
    e.preventDefault();
    if (!config) return;

    let updatedConfig = { ...config };

    if (editorModal === 'service_add') {
      const newId = config.services.length > 0 ? Math.max(...config.services.map(s => s.id)) + 1 : 1;
      updatedConfig.services = [...config.services, { ...modalItem, id: newId }];
    } else if (editorModal === 'service_edit') {
      updatedConfig.services = config.services.map(s => s.id === modalItem.id ? modalItem : s);
    } else if (editorModal === 'project_add') {
      const newId = config.projects.length > 0 ? Math.max(...config.projects.map(p => p.id)) + 1 : 1;
      updatedConfig.projects = [...config.projects, { ...modalItem, id: newId }];
    } else if (editorModal === 'project_edit') {
      updatedConfig.projects = config.projects.map(p => p.id === modalItem.id ? modalItem : p);
    } else if (editorModal === 'testimonial_add') {
      const newId = config.testimonials.length > 0 ? Math.max(...config.testimonials.map(t => t.id)) + 1 : 1;
      updatedConfig.testimonials = [...config.testimonials, { ...modalItem, id: newId }];
    } else if (editorModal === 'testimonial_edit') {
      updatedConfig.testimonials = config.testimonials.map(t => t.id === modalItem.id ? modalItem : t);
    }

    setConfig(updatedConfig);
    handleSaveConfig(updatedConfig);
    setEditorModal(null);
    setModalItem(null);
  };

  // Delete directly from array helper
  const handleDeleteConfigArrayItem = (arrayKey, id) => {
    if (!confirm("Are you sure you want to remove this item? This updates instantly.")) return;
    let updatedConfig = { ...config };
    updatedConfig[arrayKey] = config[arrayKey].filter(item => item.id !== id);
    setConfig(updatedConfig);
    handleSaveConfig(updatedConfig);
  };

  return (
    <div className="admin-app">
      {/* HEADER BAR */}
      <header className="admin-header">
        <div className="header-logo-section">
          <div className="status-indicator">
            <span className="dot-pulse"></span>
            <span className="dot"></span>
          </div>
          <div>
            <h1 className="header-title">VEXOTEAMX</h1>
            <span className="header-subtitle">Live Admin Panel</span>
          </div>
        </div>

        <div className="header-controls">
          <button 
            className="sound-toggle-btn"
            onClick={() => setSoundEnabled(!soundEnabled)}
            title={soundEnabled ? "Mute alert audio" : "Unmute alert audio"}
          >
            {soundEnabled ? <Volume2 size={18} /> : <VolumeX size={18} />}
          </button>
          <button className="sync-btn" onClick={fetchData} title="Re-sync Database">
            <RefreshCw size={18} className={loading ? 'spinning' : ''} />
          </button>
        </div>
      </header>

      {/* ERROR / DISCONNECT BARS */}
      {error && (
        <div className="admin-error-bar">
          <AlertTriangle size={16} />
          <span>{error}</span>
          <button onClick={fetchData} className="reconnect-link-btn">Retry Sync</button>
        </div>
      )}

      {/* OVERLAY REAL-TIME TOAST ALERTS */}
      <AnimatePresence>
        {latestAlert && (
          <motion.div 
            className="realtime-alert-toast"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ type: 'spring', damping: 15 }}
          >
            <div className="toast-header-bar">
              <span className="alert-badge pulse-anim">
                <Bell size={12} style={{ marginRight: '4px' }} />
                NEW REALTIME COORDINATES
              </span>
              <button className="toast-close" onClick={() => setLatestAlert(null)}><X size={14} /></button>
            </div>
            <div className="toast-body">
              <h4 style={{ color: '#fff', fontSize: '1rem', fontWeight: '700' }}>
                {latestAlert.type === 'booking' ? 'New Consultation Scheduled!' : 'New Callback Request!'}
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '4px' }}>
                {latestAlert.type === 'booking'
                  ? `${latestAlert.data.name} booked ${latestAlert.data.service} for ${latestAlert.data.date} at ${latestAlert.data.time}`
                  : `${latestAlert.data.name} requested callback on ${latestAlert.data.phone} (${latestAlert.data.service})`
                }
              </p>
            </div>
            <div className="toast-footer">
              <button 
                className="toast-action-btn"
                onClick={() => {
                  setActiveTab(latestAlert.type === 'booking' ? 'bookings' : 'calls');
                  setLatestAlert(null);
                }}
              >
                Open Dashboard Views
                <ArrowRight size={12} style={{ marginLeft: '4px' }} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MAIN VIEWPORT */}
      <main className="admin-main-content">
        {loading && !config ? (
          <div className="loading-center">
            <div className="spinner"></div>
            <p style={{ marginTop: '15px', color: 'var(--text-gray)' }}>Synchronizing Secure Database SQLite Engine...</p>
          </div>
        ) : (
          <div style={{ paddingBottom: '80px' }}>
            
            {/* 1. DASHBOARD VIEW */}
            {activeTab === 'dashboard' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-pane">
                {/* Stats Row */}
                <div className="stats-row">
                  <div className="dashboard-card border-purple">
                    <span className="stat-card-label">Total Bookings</span>
                    <div className="stat-card-value">{bookings.length}</div>
                    <span className="stat-card-sub">{bookings.filter(b => b.status === 'pending').length} Pending Review</span>
                  </div>
                  <div className="dashboard-card border-pink">
                    <span className="stat-card-label">Callbacks Requested</span>
                    <div className="stat-card-value">{calls.length}</div>
                    <span className="stat-card-sub">{calls.filter(c => c.status === 'pending').length} Pending Callbacks</span>
                  </div>
                  <div className="dashboard-card border-blue">
                    <span className="stat-card-label">Services Online</span>
                    <div className="stat-card-value">{config?.services.length || 0}</div>
                    <span className="stat-card-sub">Active on VexoteamX</span>
                  </div>
                </div>

                {/* Notifications Alert Center logs */}
                <div className="dashboard-section" style={{ marginTop: '30px' }}>
                  <h3 className="section-title-label">Live Activity Logs</h3>
                  <div className="logs-panel">
                    {notifications.length === 0 ? (
                      <p style={{ color: 'var(--text-gray-dark)', fontSize: '0.85rem', fontStyle: 'italic', textAlign: 'center', padding: '20px 0' }}>
                        No alerts in current session. Active Websocket listens to booking requests.
                      </p>
                    ) : (
                      <div className="logs-list">
                        {notifications.map(n => (
                          <div key={n.id} className="log-item-row">
                            <span className="log-time">{n.time}</span>
                            <span className="log-text">{n.text}</span>
                            <span className="log-badge-active">WebSocket</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Quick Info / Fast updates */}
                <div className="dashboard-quick-actions" style={{ marginTop: '30px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Latest Consultation</h3>
                    {bookings.length > 0 ? (
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{bookings[0].name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '4px' }}>
                          Service: {bookings[0].service} <br/>
                          Schedule: {bookings[0].date} @ {bookings[0].time}
                        </div>
                        <span className={`crm-status-tag ${bookings[0].status}`} style={{ display: 'inline-block', marginTop: '10px' }}>
                          {bookings[0].status}
                        </span>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-gray-dark)', fontSize: '0.85rem' }}>No bookings in SQLite table.</p>
                    )}
                  </div>

                  <div className="dashboard-card" style={{ background: 'rgba(255,255,255,0.01)' }}>
                    <h3 style={{ color: '#fff', fontSize: '1.1rem', marginBottom: '15px' }}>Latest Callback Request</h3>
                    {calls.length > 0 ? (
                      <div>
                        <div style={{ fontWeight: '700', color: '#fff' }}>{calls[0].name}</div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-gray)', marginTop: '4px' }}>
                          Phone: {calls[0].phone} <br/>
                          Service interest: {calls[0].service}
                        </div>
                        <span className={`crm-status-tag ${calls[0].status === 'pending' ? 'proposal' : 'won'}`} style={{ display: 'inline-block', marginTop: '10px' }}>
                          {calls[0].status}
                        </span>
                      </div>
                    ) : (
                      <p style={{ color: 'var(--text-gray-dark)', fontSize: '0.85rem' }}>No calls in table.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* 2. BOOKINGS VIEWER */}
            {activeTab === 'bookings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-pane">
                <div className="pane-header-row">
                  <h2 className="pane-title">Consultation Bookings</h2>
                  <span className="pane-subtitle">{bookings.length} records found in database</span>
                </div>

                <div className="bookings-vertical-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                  {bookings.length === 0 ? (
                    <div className="empty-state-view">
                      <Calendar size={48} style={{ color: 'var(--text-gray-dark)' }} />
                      <p style={{ marginTop: '15px', color: 'var(--text-gray)' }}>No booking registrations found.</p>
                    </div>
                  ) : (
                    bookings.map(booking => (
                      <div key={booking.id} className="booking-admin-card">
                        <div className="booking-card-main-info">
                          <div>
                            <span className="booking-card-service">{booking.service}</span>
                            <h3 className="booking-card-client">{booking.name}</h3>
                            <div className="booking-card-meta">
                              <span><Mail size={12} /> {booking.email || 'N/A'}</span>
                              <span><Phone size={12} /> {booking.phone}</span>
                            </div>
                            {booking.notes && (
                              <p className="booking-card-notes">
                                <strong>Notes:</strong> {booking.notes}
                              </p>
                            )}
                          </div>

                          <div className="booking-card-timing">
                            <span className="timing-badge">
                              <Calendar size={12} style={{ marginRight: '6px' }} />
                              {booking.date} @ {booking.time}
                            </span>
                            <span className={`crm-status-tag ${booking.status}`} style={{ textTransform: 'uppercase', fontSize: '0.75rem', padding: '4px 10px', marginTop: '10px', textAlign: 'center', display: 'block' }}>
                              {booking.status}
                            </span>
                          </div>
                        </div>

                        <div className="booking-card-action-bar">
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {booking.status === 'pending' && (
                              <button 
                                className="action-btn-mini btn-confirm"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'confirmed')}
                              >
                                Confirm
                              </button>
                            )}
                            {booking.status === 'confirmed' && (
                              <button 
                                className="action-btn-mini btn-confirm"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'completed')}
                              >
                                Mark Complete
                              </button>
                            )}
                            {booking.status !== 'cancelled' && booking.status !== 'completed' && (
                              <button 
                                className="action-btn-mini btn-cancel"
                                onClick={() => handleUpdateBookingStatus(booking.id, 'cancelled')}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                          <button 
                            className="delete-card-btn"
                            onClick={() => handleDeleteBooking(booking.id)}
                            title="Delete Record"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* 3. CALL CALLBACKS VIEWER */}
            {activeTab === 'calls' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-pane">
                <div className="pane-header-row">
                  <h2 className="pane-title">Callback Requests</h2>
                  <span className="pane-subtitle">{calls.length} entries queued</span>
                </div>

                <div className="bookings-vertical-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
                  {calls.length === 0 ? (
                    <div className="empty-state-view">
                      <PhoneCall size={48} style={{ color: 'var(--text-gray-dark)' }} />
                      <p style={{ marginTop: '15px', color: 'var(--text-gray)' }}>No call requests in the queue.</p>
                    </div>
                  ) : (
                    calls.map(call => (
                      <div key={call.id} className="booking-admin-card" style={{ borderLeft: call.status === 'pending' ? '3px solid var(--primary-pink)' : '3px solid #10b981' }}>
                        <div className="booking-card-main-info" style={{ alignItems: 'center' }}>
                          <div>
                            <span className="booking-card-service" style={{ color: 'var(--primary-pink)', background: 'rgba(236,72,153,0.1)' }}>{call.service}</span>
                            <h3 className="booking-card-client" style={{ marginTop: '5px' }}>{call.name}</h3>
                            <a href={`tel:${call.phone}`} className="call-dial-link" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '1rem', color: 'var(--primary-blue)', fontWeight: '700', marginTop: '6px' }}>
                              <PhoneCall size={14} />
                              {call.phone}
                            </a>
                          </div>

                          <div style={{ textAlign: 'right' }}>
                            <span className={`crm-status-tag ${call.status === 'pending' ? 'proposal' : 'won'}`} style={{ textTransform: 'uppercase', fontSize: '0.75rem', padding: '4px 10px' }}>
                              {call.status}
                            </span>
                            <span style={{ fontSize: '0.7rem', color: 'var(--text-gray-dark)', display: 'block', marginTop: '8px' }}>
                              Requested: {new Date(call.created_at).toLocaleString()}
                            </span>
                          </div>
                        </div>

                        <div className="booking-card-action-bar">
                          <div style={{ display: 'flex', gap: '8px' }}>
                            {call.status === 'pending' && (
                              <button 
                                className="action-btn-mini btn-confirm"
                                style={{ background: '#10b981' }}
                                onClick={() => handleUpdateCallStatus(call.id, 'completed')}
                              >
                                Mark Called
                              </button>
                            )}
                          </div>
                          <button 
                            className="delete-card-btn"
                            onClick={() => handleDeleteCall(call.id)}
                            title="Delete Request"
                          >
                            <Trash size={14} />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </motion.div>
            )}

            {/* 4. VISUAL EDITOR PANEL */}
            {activeTab === 'editor' && config && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-pane">
                <div className="pane-header-row">
                  <h2 className="pane-title">Portfolio Manager</h2>
                  <span className="pane-subtitle">Live website updates control</span>
                </div>

                <div className="editor-accordion-list" style={{ display: 'flex', flexDirection: 'column', gap: '25px', marginTop: '20px' }}>
                  
                  {/* Hero Settings */}
                  <div className="editor-card-section">
                    <h3 className="editor-section-title"><Rocket size={18} /> Hero Section Wording</h3>
                    <div className="crm-form" style={{ maxWidth: '100%', border: 'none', background: 'none', padding: '0', marginTop: '15px' }}>
                      <div className="crm-form-group">
                        <label>Main Headline Title</label>
                        <input 
                          type="text" 
                          value={config.hero_title}
                          onChange={(e) => setConfig({ ...config, hero_title: e.target.value })}
                          style={{ width: '100%' }}
                        />
                      </div>
                      <div className="crm-form-group" style={{ marginTop: '10px' }}>
                        <label>Subtext Description</label>
                        <textarea 
                          value={config.hero_desc}
                          onChange={(e) => setConfig({ ...config, hero_desc: e.target.value })}
                          rows="3"
                          style={{ width: '100%', background: '#08070d', border: '1px solid rgba(255,255,255,0.1)', color: '#fff', borderRadius: '8px', padding: '10px', fontFamily: 'inherit', resize: 'none' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Services Editor */}
                  <div className="editor-card-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="editor-section-title"><Zap size={18} /> Services Portfolio ({config.services.length})</h3>
                      <button className="add-item-btn" onClick={() => openEditorModal('service_add')}>
                        <Plus size={14} /> Add Service
                      </button>
                    </div>

                    <div className="editor-items-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                      {config.services.map(svc => (
                        <div key={svc.id} className="editor-item-box">
                          <div>
                            <h4 style={{ color: '#fff', fontWeight: '700' }}>{svc.title}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray)', marginTop: '4px' }}>{svc.desc}</p>
                            <span style={{ fontSize: '0.7rem', color: 'var(--primary-blue)', background: 'rgba(6,182,212,0.1)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block', marginTop: '8px' }}>
                              Icon: {svc.icon} ({svc.color})
                            </span>
                          </div>
                          <div className="item-box-actions">
                            <button className="item-action-edit" onClick={() => openEditorModal('service_edit', svc)}><Edit size={14} /></button>
                            <button className="item-action-delete" onClick={() => handleDeleteConfigArrayItem('services', svc.id)}><Trash size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Projects/Demos Editor */}
                  <div className="editor-card-section">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <h3 className="editor-section-title"><Code size={18} /> Projects & Case Studies ({config.projects.length})</h3>
                      <button className="add-item-btn" onClick={() => openEditorModal('project_add')}>
                        <Plus size={14} /> Add Project
                      </button>
                    </div>

                    <div className="editor-items-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', marginTop: '15px' }}>
                      {config.projects.map(proj => (
                        <div key={proj.id} className="editor-item-box">
                          <div>
                            <h4 style={{ color: '#fff', fontWeight: '700' }}>{proj.title}</h4>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-gray-dark)', marginTop: '4px' }}>Demo Type: {proj.type}</p>
                            <img src={proj.img} alt={proj.title} style={{ width: '80px', height: '45px', borderRadius: '4px', marginTop: '8px', objectFit: 'cover', border: '1px solid rgba(255,255,255,0.1)' }} />
                          </div>
                          <div className="item-box-actions">
                            <button className="item-action-edit" onClick={() => openEditorModal('project_edit', proj)}><Edit size={14} /></button>
                            <button className="item-action-delete" onClick={() => handleDeleteConfigArrayItem('projects', proj.id)}><Trash size={14} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Contact channels */}
                  <div className="editor-card-section">
                    <h3 className="editor-section-title"><Mail size={18} /> Contact Coordinates</h3>
                    <div className="crm-form" style={{ maxWidth: '100%', border: 'none', background: 'none', padding: '0', marginTop: '15px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                      <div className="crm-form-group">
                        <label>Business Email</label>
                        <input 
                          type="email" 
                          value={config.contact_email}
                          onChange={(e) => setConfig({ ...config, contact_email: e.target.value })}
                        />
                      </div>
                      <div className="crm-form-group">
                        <label>WhatsApp Number</label>
                        <input 
                          type="text" 
                          value={config.contact_phone}
                          onChange={(e) => setConfig({ ...config, contact_phone: e.target.value })}
                        />
                      </div>
                      <div className="crm-form-group" style={{ gridColumn: 'span 2' }}>
                        <label>Address / HQ Location</label>
                        <input 
                          type="text" 
                          value={config.contact_address}
                          onChange={(e) => setConfig({ ...config, contact_address: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Changes button */}
                  <button 
                    className="save-config-btn"
                    onClick={() => handleSaveConfig()}
                  >
                    <Save size={18} style={{ marginRight: '10px' }} />
                    Publish Configuration Changes Live
                  </button>
                </div>
              </motion.div>
            )}

            {/* 5. CONNECTION SETTINGS VIEW */}
            {activeTab === 'settings' && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="tab-pane">
                <div className="pane-header-row">
                  <h2 className="pane-title">Server Connection</h2>
                  <span className="pane-subtitle">Configure backend API connection coordinates</span>
                </div>

                <div className="editor-card-section" style={{ marginTop: '20px' }}>
                  <h3 className="editor-section-title"><Cpu size={18} /> API Endpoint URL</h3>
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.85rem', margin: '8px 0 20px 0', lineHeight: '1.5' }}>
                    Paste the production Backend URL (e.g., from Render, Railway, or your custom server). 
                    The mobile app will connect to this endpoint for all operations.
                  </p>

                  <div className="crm-form" style={{ maxWidth: '100%', border: 'none', background: 'none', padding: '0' }}>
                    <div className="crm-form-group">
                      <label>Backend URL (HTTPS or HTTP)</label>
                      <input 
                        type="url" 
                        placeholder="https://your-backend.onrender.com"
                        value={tempApiUrl}
                        onChange={(e) => setTempApiUrl(e.target.value)}
                        style={{ width: '100%', background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                      />
                    </div>

                    <div style={{ display: 'flex', gap: '12px', marginTop: '20px' }}>
                      <button 
                        type="button"
                        className="btn-cta btn-cta-primary" 
                        onClick={() => {
                          let formatted = tempApiUrl.trim();
                          if (formatted && !formatted.startsWith('http://') && !formatted.startsWith('https://')) {
                            formatted = 'https://' + formatted;
                          }
                          // Remove trailing slash
                          formatted = formatted.replace(/\/+$/, '');
                          localStorage.setItem('VEXO_API_BASE', formatted);
                          setApiBase(formatted);
                          alert("Backend URL saved successfully! Reconnecting services...");
                          fetchData();
                        }}
                      >
                        Save & Reconnect
                      </button>
                      <button 
                        type="button"
                        className="btn-hero btn-hero-secondary"
                        style={{ padding: '10px 20px' }}
                        onClick={() => {
                          const defaultUrl = 'http://67.205.137.231:3001';
                          setTempApiUrl(defaultUrl);
                          localStorage.setItem('VEXO_API_BASE', defaultUrl);
                          setApiBase(defaultUrl);
                          alert("Reset to default server IP. Reconnecting...");
                          fetchData();
                        }}
                      >
                        Reset to Default Server
                      </button>
                    </div>
                  </div>

                  <div className="console-line info" style={{ marginTop: '30px', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontWeight: 'bold' }}>Current Connection Status:</div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>Active Base API:</strong> <span className="text-purple">{apiBase}</span>
                    </div>
                    <div style={{ fontSize: '0.85rem' }}>
                      <strong>WebSocket Stream:</strong> <span className="text-pink">{apiBase.replace(/^http/, 'ws')}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

          </div>
        )}
      </main>

      {/* FOOTER TAB SELECTOR */}
      <footer className="admin-footer-tabs">
        <button 
          className={`tab-item ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <Cpu size={20} />
          <span>Dashboard</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookings')}
        >
          <Calendar size={20} />
          {bookings.filter(b => b.status === 'pending').length > 0 && <span className="tab-badge pulse">{bookings.filter(b => b.status === 'pending').length}</span>}
          <span>Bookings</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'calls' ? 'active' : ''}`}
          onClick={() => setActiveTab('calls')}
        >
          <PhoneCall size={20} />
          {calls.filter(c => c.status === 'pending').length > 0 && <span className="tab-badge pulse" style={{ background: 'var(--primary-pink)' }}>{calls.filter(c => c.status === 'pending').length}</span>}
          <span>Callbacks</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'editor' ? 'active' : ''}`}
          onClick={() => setActiveTab('editor')}
        >
          <Edit2 size={20} />
          <span>Edit Site</span>
        </button>
        <button 
          className={`tab-item ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings size={20} />
          <span>Connection</span>
        </button>
      </footer>

      {/* DYNAMIC MODALS FOR ADDING/EDITING SERVICES & PROJECTS */}
      <AnimatePresence>
        {editorModal && modalItem && (
          <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <motion.div 
              className="modal-container" 
              style={{ maxHeight: '520px', maxWidth: '500px' }}
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <div className="modal-header">
                <h3 className="modal-title" style={{ color: '#fff', fontSize: '1.2rem' }}>
                  {editorModal.includes('service') && (editorModal.includes('add') ? 'Add Portfolio Service' : 'Edit Portfolio Service')}
                  {editorModal.includes('project') && (editorModal.includes('add') ? 'Add Case Study Project' : 'Edit Case Study Project')}
                </h3>
                <button className="modal-close-btn" onClick={() => { setEditorModal(null); setModalItem(null); }}><X size={16} /></button>
              </div>
              <form onSubmit={handleModalSubmit} className="crm-form" style={{ border: 'none', background: 'none', padding: '24px', maxWidth: '100%' }}>
                
                {/* A. Service Form fields */}
                {editorModal.includes('service') && (
                  <>
                    <div className="crm-form-group">
                      <label>Service Title</label>
                      <input 
                        type="text" 
                        value={modalItem.title} 
                        onChange={(e) => setModalItem({ ...modalItem, title: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="crm-form-group">
                      <label>Description</label>
                      <input 
                        type="text" 
                        value={modalItem.desc} 
                        onChange={(e) => setModalItem({ ...modalItem, desc: e.target.value })}
                        required 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="crm-form-group">
                        <label>Icon Identifier</label>
                        <select 
                          value={modalItem.icon} 
                          onChange={(e) => setModalItem({ ...modalItem, icon: e.target.value })}
                        >
                          <option value="Zap">Zap</option>
                          <option value="Bot">Bot</option>
                          <option value="Code">Code</option>
                          <option value="Database">Database</option>
                          <option value="Video">Video</option>
                          <option value="Settings">Settings</option>
                        </select>
                      </div>
                      <div className="crm-form-group">
                        <label>Color Accent</label>
                        <select 
                          value={modalItem.color} 
                          onChange={(e) => setModalItem({ ...modalItem, color: e.target.value })}
                        >
                          <option value="purple">Purple</option>
                          <option value="pink">Pink</option>
                          <option value="blue">Blue</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                {/* B. Project Form fields */}
                {editorModal.includes('project') && (
                  <>
                    <div className="crm-form-group">
                      <label>Project Title</label>
                      <input 
                        type="text" 
                        value={modalItem.title} 
                        onChange={(e) => setModalItem({ ...modalItem, title: e.target.value })}
                        required 
                      />
                    </div>
                    <div className="crm-form-group">
                      <label>Static Image URL path</label>
                      <input 
                        type="text" 
                        value={modalItem.img} 
                        onChange={(e) => setModalItem({ ...modalItem, img: e.target.value })}
                        required 
                      />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                      <div className="crm-form-group">
                        <label>Card Tag / Subtitle</label>
                        <input 
                          type="text" 
                          value={modalItem.tag} 
                          onChange={(e) => setModalItem({ ...modalItem, tag: e.target.value })}
                          required 
                        />
                      </div>
                      <div className="crm-form-group">
                        <label>Demo Type Sandbox</label>
                        <select 
                          value={modalItem.type} 
                          onChange={(e) => setModalItem({ ...modalItem, type: e.target.value })}
                        >
                          <option value="builder">AI Builder Flow</option>
                          <option value="salon">Salon Stepper Simulator</option>
                          <option value="crm">Leads CRM funnel</option>
                        </select>
                      </div>
                    </div>
                  </>
                )}

                <button 
                  type="submit" 
                  className="btn-crm-action" 
                  style={{ width: '100%', padding: '12px', marginTop: '15px', justifyContent: 'center' }}
                >
                  Save & Publish Item
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
