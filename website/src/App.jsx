import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, Phone, Cpu, Zap, Code, Database, 
  Play, Link2, UserCheck, Award, Smile, Rocket, 
  Bot, Video, Layers, Settings, Check, Star, 
  Mail, MapPin, Menu, X, MessageSquare, ExternalLink,
  Plus, Calendar, ShieldCheck, ChevronRight, PlayCircle,
  Clock, CheckCircle, AlertCircle
} from 'lucide-react';
import './App.css';

// Dynamic API Base URL detection
const API_BASE = typeof window !== 'undefined'
  ? `${window.location.protocol}//${window.location.hostname}:3001`
  : 'http://localhost:3001';

// Custom Confetti Component
const ConfettiEffect = () => {
  const colors = ['#8b5cf6', '#ec4899', '#06b6d4', '#10b981', '#dfba73', '#f59e0b'];
  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', overflow: 'hidden', zIndex: 100 }}>
      {[...Array(40)].map((_, i) => {
        const size = Math.random() * 8 + 4;
        const color = colors[Math.floor(Math.random() * colors.length)];
        const left = Math.random() * 100;
        const delay = Math.random() * 0.3;
        const duration = Math.random() * 1.5 + 1.2;
        return (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              top: '-10px',
              left: `${left}%`,
              width: size,
              height: size,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            }}
            animate={{
              y: ['0px', '500px'],
              x: ['0px', `${Math.random() * 60 - 30}px`],
              rotate: [0, Math.random() * 360],
              opacity: [1, 1, 0]
            }}
            transition={{
              duration: duration,
              delay: delay,
              ease: 'easeOut',
            }}
          />
        );
      })}
    </div>
  );
};

export default function App() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  // Navigation State: 'home', 'services', 'projects', 'booking', 'contact'
  const [currentPage, setCurrentPage] = useState('home');
  
  // Dynamic Portfolio Configuration
  const [config, setConfig] = useState({
    hero_title: "We Build, Automate & Scale Businesses With AI & Technology.",
    hero_desc: "I help businesses and startups streamline operations, automate workflows, build custom AI agents, and create high-converting websites that drive real results.",
    stats_projects: "50+",
    stats_clients: "30+",
    stats_experience: "5+",
    trusted_logos: ["brightwave", "NextGen SOLUTIONS", "GrowthLab", "Launchify", "VisionX", "AutomatePro"],
    services: [
      { id: 1, title: "AI Automation", desc: "Automate workflows and business operations using AI.", icon: "Zap", color: "purple" },
      { id: 2, title: "AI Agents", desc: "Custom AI agents that handle tasks, chat, bookings & support.", icon: "Bot", color: "pink" },
      { id: 3, title: "Web Development", desc: "High-performing websites that look premium & convert.", icon: "Code", color: "blue" },
      { id: 4, title: "CRM Development", desc: "Custom CRM systems to manage leads, clients and sales.", icon: "Database", color: "purple" },
      { id: 5, title: "UGC Ads", desc: "High-converting UGC ads that build trust & drive more sales.", icon: "Video", color: "pink" },
      { id: 6, title: "API Integrations", desc: "Connect tools and automate with powerful integrations.", icon: "Settings", color: "blue" }
    ],
    projects: [
      { id: 1, title: "AI Automation Platform", img: "/project_ai_automation.jpg", tag: "Click to Test Live Demo", type: "builder" },
      { id: 2, title: "Hair By Dar Salon Website", img: "/project_hair_salon.jpg", tag: "Click to Test Live Demo", type: "salon" },
      { id: 3, title: "CRM Development", img: "/project_crm.jpg", tag: "Click to Test Live Demo", type: "crm" }
    ],
    testimonials: [
      { id: 1, name: "James Carter", company: "CEO, Brightwave", quote: "VexoteamX transformed our business with AI automation. Highly recommended!", avatar: "JC", rating: 5 },
      { id: 2, name: "Sarah Mitchell", company: "Founder, NextGen", quote: "Professional, fast, and understood exactly what we needed.", avatar: "SM", rating: 5 },
      { id: 3, name: "Siddharth Sharma", company: "CTO, GrowthLab", quote: "The customized CRM system is robust and has streamlined our sales pipeline completely.", avatar: "SS", rating: 5 }
    ],
    contact_phone: "+91 87951 75243",
    contact_email: "hello@vexoteamx.com",
    contact_address: "Mumbai, India"
  });

  // Modal Popup States for live project sandbox demos
  const [activeModal, setActiveModal] = useState(null); // 'crm', 'salon', 'builder'

  // CRM Demo States
  const [crmTab, setCrmTab] = useState('dashboard');
  const [leads, setLeads] = useState([
    { id: 1, name: 'Aarav Sharma', company: 'Global Tech Corp', value: '$12,500', status: 'prospect' },
    { id: 2, name: 'Pooja Patel', company: 'Zenith Retailers', value: '$8,200', status: 'proposal' },
    { id: 3, name: 'Siddharth Rao', company: 'Innovate AI Ltd', value: '$45,000', status: 'won' },
    { id: 4, name: 'Ananya Sen', company: 'Apex Builders', value: '$19,000', status: 'proposal' },
  ]);
  const [newLead, setNewLead] = useState({ name: '', company: '', value: '', status: 'prospect' });

  // Salon Demo States
  const [salonStep, setSalonStep] = useState(1);
  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);

  const salonServices = [
    { id: 1, name: 'Signature Precision Haircut', duration: '45 mins', price: '$80' },
    { id: 2, name: 'Lux Custom Balayage & Styling', duration: '150 mins', price: '$185' },
    { id: 3, name: 'Organic Hydra Keratin Blowout', duration: '90 mins', price: '$120' },
  ];

  const dates = [
    { day: 'Mon', num: 12 },
    { day: 'Tue', num: 13 },
    { day: 'Wed', num: 14 },
    { day: 'Thu', num: 15 },
  ];

  const slots = ['10:00 AM', '12:30 PM', '03:00 PM', '05:30 PM'];

  // AI Builder States
  const [activeNode, setActiveNode] = useState('trigger');
  const [nodeConfig, setNodeConfig] = useState({
    trigger: { type: 'New CRM Lead', value: 'vexo-leads-webhook' },
    action: { type: 'AI Lead Scorer', model: 'Gemini 3.5 Flash' },
    output: { type: 'Send Slack Notification', channel: '#leads-alert' }
  });
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState(['Console initialized. Ready to execute workflow.']);

  // Actual Booking System Form States
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    phone: '',
    service: '',
    date: '',
    time: '',
    notes: ''
  });
  const [bookingStep, setBookingStep] = useState(1); // 1: Form, 2: Loading, 3: Success
  const [bookingError, setBookingError] = useState('');

  // Contact/Call Form States
  const [contactForm, setContactForm] = useState({
    name: '',
    phone: '',
    service: 'General Inquiry'
  });
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);

  // Load configuration from Backend API on mount
  useEffect(() => {
    fetch(`${API_BASE}/api/config`)
      .then(res => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then(data => {
        if (data) setConfig(data);
      })
      .catch(err => console.log("Backend not active, running in standalone mode with default config.", err));
  }, []);

  // Listen to window scroll to style header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Page Routing Scroll to Top
  const navigateTo = (pageName) => {
    setCurrentPage(pageName);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Icon selector component helper
  const renderIcon = (iconName, colorClass) => {
    const props = { size: 22 };
    switch (iconName) {
      case 'Zap': return <Zap {...props} />;
      case 'Bot': return <Bot {...props} />;
      case 'Code': return <Code {...props} />;
      case 'Database': return <Database {...props} />;
      case 'Video': return <Video {...props} />;
      case 'Settings': return <Settings {...props} />;
      default: return <Zap {...props} />;
    }
  };

  // Interactive CRM Demo
  const handleAddLead = (e) => {
    e.preventDefault();
    if (!newLead.name || !newLead.company) return;
    const value = newLead.value.startsWith('$') ? newLead.value : `$${newLead.value}`;
    const newEntry = {
      id: Date.now(),
      name: newLead.name,
      company: newLead.company,
      value: value || '$0',
      status: newLead.status
    };
    setLeads([newEntry, ...leads]);
    setNewLead({ name: '', company: '', value: '', status: 'prospect' });
    setCrmTab('leads');
  };

  const resetSalonBooking = () => {
    setSalonStep(1);
    setSelectedService(null);
    setSelectedDate(null);
    setSelectedSlot(null);
  };

  // Running workflow demo inside AI Automation Builder
  const runWorkflow = () => {
    if (isRunning) return;
    setIsRunning(true);
    setLogs([]);
    const timeline = [
      { t: 0, m: `[🚀 RUNNING] Executing AI Automation Workflow...` },
      { t: 800, m: `[🔌 TRIGGER] Received event from Webhook: "${nodeConfig.trigger.type}" (${nodeConfig.trigger.value}).` },
      { t: 1600, m: `[🧠 ACTION] Invoking AI Processor: "${nodeConfig.action.type}" via ${nodeConfig.action.model}.` },
      { t: 2400, m: `[🧠 AI RESPONSE] Data analyzed. Score assigned: 94/100 (High Intent User).` },
      { t: 3200, m: `[📤 OUTPUT] Dispatched output event: "${nodeConfig.output.type}" to ${nodeConfig.output.channel}.` },
      { t: 4000, m: `[✅ SUCCESS] Workflow execution completed successfully in 4.0s.` }
    ];

    timeline.forEach(step => {
      setTimeout(() => {
        setLogs(prev => [...prev, step.m]);
        if (step.t === 4000) {
          setIsRunning(false);
        }
      }, step.t);
    });
  };

  // Handle actual booking form submission to backend sqlite API
  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setBookingError('');
    setBookingStep(2); // Loading

    try {
      const response = await fetch(`${API_BASE}/api/bookings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingForm)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to make a booking");
      }

      setBookingStep(3); // Success Screen
    } catch (err) {
      setBookingStep(1); // Form page
      setBookingError(err.message || 'Server error. Please try again.');
    }
  };

  // Handle contact/call request submission
  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setContactError('');
    setContactSuccess(false);
    setIsSubmittingContact(true);

    try {
      const response = await fetch(`${API_BASE}/api/calls`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm)
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error || "Failed to submit request");
      }

      setContactSuccess(true);
      setContactForm({ name: '', phone: '', service: 'General Inquiry' });
    } catch (err) {
      setContactError(err.message || 'Server error. Please try again.');
    } finally {
      setIsSubmittingContact(false);
    }
  };

  const cardRefs = [useRef(null), useRef(null), useRef(null), useRef(null), useRef(null), useRef(null)];

  const handleMouseMove = (e, cardRef) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    cardRef.current.style.setProperty('--mouse-x', `${x}px`);
    cardRef.current.style.setProperty('--mouse-y', `${y}px`);
  };

  return (
    <div className="portfolio-app">
      {/* HEADER / NAVIGATION */}
      <header className={`header ${scrolled ? 'scrolled' : ''}`}>
        <div className="container nav-container">
          <div className="logo-wrapper" style={{ cursor: 'pointer' }} onClick={() => navigateTo('home')}>
            <div className="logo-main">
              VEXOTEAMX
              <div className="status-dot-wrapper">
                <span className="status-dot-pulse"></span>
                <span className="status-dot"></span>
              </div>
            </div>
            <div className="logo-subtitle">AI • AUTOMATION • WEB</div>
          </div>

          <nav className={`nav-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <button 
              className={`nav-link ${currentPage === 'home' ? 'active' : ''}`}
              onClick={() => navigateTo('home')}
            >
              Home
            </button>
            <button 
              className={`nav-link ${currentPage === 'services' ? 'active' : ''}`}
              onClick={() => navigateTo('services')}
            >
              Services
            </button>
            <button 
              className={`nav-link ${currentPage === 'projects' ? 'active' : ''}`}
              onClick={() => navigateTo('projects')}
            >
              Projects
            </button>
            <button 
              className={`nav-link ${currentPage === 'booking' ? 'active' : ''}`}
              onClick={() => navigateTo('booking')}
            >
              Booking System
            </button>
            <button 
              className={`nav-link ${currentPage === 'contact' ? 'active' : ''}`}
              onClick={() => navigateTo('contact')}
            >
              Contact Us
            </button>
          </nav>

          <div className="nav-actions">
            <button className="btn-cta btn-cta-primary" onClick={() => navigateTo('booking')}>
              Book Consultation
              <ArrowRight size={16} />
            </button>
            <button 
              className={`hamburger ${mobileMenuOpen ? 'open' : ''}`} 
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle menu"
            >
              <span></span>
              <span></span>
              <span></span>
            </button>
          </div>
        </div>
      </header>

      {/* RENDER PAGES WITH ANIMATION */}
      <div className="page-content-wrapper" style={{ paddingTop: '80px', minHeight: 'calc(100vh - 80px)' }}>
        <AnimatePresence mode="wait">
          {currentPage === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.4 }}
            >
              {/* HERO SECTION */}
              <section id="home" className="hero-section" style={{ padding: '60px 0 100px 0' }}>
                <div className="container hero-grid">
                  <div className="hero-text-content">
                    <div className="hero-badge">
                      <span className="green-dot"></span>
                      AI-POWERED DIGITAL SOLUTIONS
                    </div>
                    
                    <h1 className="hero-title">
                      {config.hero_title.split("AI & Technology")[0] || "We Build, Automate & Scale Businesses With "}
                      <span className="title-glow-wrap">AI & Technology.</span>
                    </h1>
                    
                    <p className="hero-desc">
                      {config.hero_desc}
                    </p>
                    
                    <div className="hero-buttons">
                      <button className="btn-hero btn-hero-primary" onClick={() => navigateTo('booking')}>
                        Book a Free Call
                        <Phone size={18} />
                      </button>
                      <button className="btn-hero btn-hero-secondary" onClick={() => navigateTo('projects')}>
                        View My Work
                        <ArrowRight size={18} />
                      </button>
                    </div>

                    <div className="trusted-section">
                      <span className="trusted-text">TRUSTED BY BUSINESSES WORLDWIDE</span>
                      <div className="trusted-logos">
                        {config.trusted_logos.map((logo, i) => (
                          <span key={i} className="logo-item">{logo}</span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="hero-image-container">
                    <div className="hero-wide-image-wrapper">
                      <img 
                        src="/founder_avatar.png" 
                        alt="Sarfaraz Ahmad - Founder & CEO" 
                        className="hero-wide-image" 
                      />
                    </div>
                  </div>
                </div>
              </section>

              {/* STATS BAR */}
              <section className="stats-bar-section" style={{ padding: '0 0 60px 0' }}>
                <div className="container">
                  <div className="stats-grid">
                    <div className="stat-item">
                      <div className="stat-icon-wrapper">
                        <Rocket size={22} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{config.stats_projects}</span>
                        <span className="stat-label">Projects Completed</span>
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-icon-wrapper" style={{ color: 'var(--primary-pink)' }}>
                        <UserCheck size={22} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{config.stats_clients}</span>
                        <span className="stat-label">Happy Clients</span>
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-icon-wrapper" style={{ color: 'var(--primary-blue)' }}>
                        <Award size={22} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">{config.stats_experience}</span>
                        <span className="stat-label">Years Experience</span>
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-icon-wrapper">
                        <Smile size={22} />
                      </div>
                      <div className="stat-info">
                        <span className="stat-number">100%</span>
                        <span className="stat-label">Satisfaction</span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* SERVICES MINI SECTION */}
              <section id="services-preview" style={{ padding: '60px 0' }}>
                <div className="container">
                  <div className="section-header">
                    <div className="section-title-wrap">
                      <span className="section-tag">What We Excel At</span>
                      <h2 className="section-title">AI & Premium Web Solutions</h2>
                    </div>
                    <button className="section-btn-link" onClick={() => navigateTo('services')}>
                      View All Services
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="services-grid">
                    {config.services.slice(0, 3).map((service, index) => (
                      <div 
                        key={service.id} 
                        className="service-card"
                        ref={cardRefs[index]}
                        onMouseMove={(e) => handleMouseMove(e, cardRefs[index])}
                      >
                        <div className={`service-icon-box`} style={{ color: service.color === 'pink' ? 'var(--primary-pink)' : service.color === 'blue' ? 'var(--primary-blue)' : 'var(--primary-purple)' }}>
                          {renderIcon(service.icon)}
                        </div>
                        <h3 className="service-title">{service.title}</h3>
                        <p className="service-desc">{service.desc}</p>
                        <div className="service-arrow" onClick={() => navigateTo('booking')}>
                          <ArrowRight size={18} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* PROJECTS PREVIEW */}
              <section id="work-preview" style={{ padding: '60px 0' }}>
                <div className="container">
                  <div className="section-header">
                    <div className="section-title-wrap">
                      <span className="section-tag">Recent Work</span>
                      <h2 className="section-title">Case Studies & Sandbox Demos</h2>
                    </div>
                    <button className="section-btn-link" onClick={() => navigateTo('projects')}>
                      Explore All Projects
                      <ArrowRight size={16} />
                    </button>
                  </div>

                  <div className="projects-grid">
                    {config.projects.map((project) => (
                      <div 
                        key={project.id} 
                        className="project-card"
                        onClick={() => setActiveModal(project.type)}
                      >
                        <div className="project-img-wrapper">
                          <img 
                            src={project.img} 
                            alt={project.title} 
                            className="project-img"
                          />
                          <span className="project-tag">{project.tag}</span>
                        </div>
                        <div className="project-details">
                          <h3 className="project-title">{project.title}</h3>
                          <div className="project-link-btn">
                            <PlayCircle size={18} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* WHY WORK WITH US */}
              <section id="why-me" className="why-section" style={{ padding: '60px 0' }}>
                <div className="container why-grid">
                  <div className="why-image-wrapper">
                    <div className="why-glow-frame"></div>
                    <div className="why-glow-frame-inner"></div>
                    <div className="why-img-container">
                      <img 
                        src="/why_work_with_me.png" 
                        alt="Workspace and development" 
                        className="why-img"
                      />
                    </div>
                  </div>

                  <div className="why-text-container">
                    <span className="section-tag">Why Work With Us?</span>
                    <h2 className="why-title">We turn ideas into intelligent systems that automate scaling.</h2>
                    
                    <div className="why-points-grid">
                      <div className="why-point">
                        <div className="why-check-circle"><Check size={12} /></div>
                        <span className="why-point-text">Results-driven design system</span>
                      </div>
                      <div className="why-point">
                        <div className="why-check-circle" style={{ color: 'var(--primary-pink)', background: 'rgba(236, 72, 153, 0.15)' }}><Check size={12} /></div>
                        <span className="why-point-text">24/7 Connected API & Webhooks</span>
                      </div>
                      <div className="why-point">
                        <div className="why-check-circle" style={{ color: 'var(--primary-blue)', background: 'rgba(6, 182, 212, 0.15)' }}><Check size={12} /></div>
                        <span className="why-point-text">Clean & scalable architecture</span>
                      </div>
                      <div className="why-point">
                        <div className="why-check-circle"><Check size={12} /></div>
                        <span className="why-point-text">Modern Bun/Node fast backend</span>
                      </div>
                    </div>

                    <div className="hand-mesh-wrapper">
                      <svg width="220" height="90" viewBox="0 0 220 90" fill="none">
                        <path d="M10 45 C 30 20, 60 20, 90 45 S 120 70, 150 45 S 190 20, 210 45" stroke="rgba(6, 182, 212, 0.25)" strokeWidth="1" strokeDasharray="3,3" />
                        <path d="M10 45 C 40 45, 50 15, 90 25 S 130 75, 170 65 S 190 45, 210 45" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1.5" />
                        <circle cx="10" cy="45" r="3.5" fill="var(--primary-blue)" />
                        <circle cx="50" cy="20" r="2.5" fill="var(--primary-purple)" />
                        <circle cx="90" cy="25" r="4" fill="var(--primary-pink)" />
                        <circle cx="130" cy="65" r="3" fill="var(--primary-blue)" />
                        <circle cx="170" cy="65" r="4.5" fill="var(--primary-purple)" />
                        <circle cx="210" cy="45" r="3.5" fill="var(--primary-pink)" />
                      </svg>
                    </div>
                  </div>
                </div>
              </section>

              {/* TESTIMONIALS SECTION */}
              <section id="testimonials" style={{ padding: '60px 0' }}>
                <div className="container">
                  <div className="section-header">
                    <div className="section-title-wrap">
                      <span className="section-tag">What Clients Say</span>
                      <h2 className="section-title">Testimonials</h2>
                    </div>
                  </div>

                  <div className="testimonials-grid">
                    {config.testimonials.map((test) => (
                      <div key={test.id} className="testimonial-card">
                        <div className="client-rating">
                          {[...Array(test.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                        </div>
                        <p className="client-quote">"{test.quote}"</p>
                        <div className="client-profile">
                          <div className="client-avatar" style={{ background: test.id % 2 === 0 ? 'linear-gradient(135deg, var(--primary-pink) 0%, var(--primary-purple) 100%)' : 'linear-gradient(135deg, var(--primary-blue) 0%, var(--primary-pink) 100%)' }}>
                            {test.avatar}
                          </div>
                          <div className="client-info">
                            <span className="client-name">{test.name}</span>
                            <span className="client-company">{test.company}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* CALL TO ACTION BOX */}
              <section className="cta-section" style={{ padding: '60px 0 100px 0' }}>
                <div className="container">
                  <div className="cta-box">
                    <div className="cta-glow-sphere-1"></div>
                    <div className="cta-glow-sphere-2"></div>
                    
                    <div className="cta-content">
                      <div className="cta-icon-box">
                        <Zap size={24} />
                      </div>
                      <h2 className="cta-title">Let's Build Something Amazing Together</h2>
                      <p className="cta-desc">
                        Have a project in mind? Let's discuss how we can automate, scale & grow your business.
                      </p>
                      <div className="cta-buttons">
                        <button className="btn-hero btn-hero-primary btn-cta-big" onClick={() => navigateTo('booking')}>
                          Start Your Project
                          <ArrowRight size={16} />
                        </button>
                        <button className="btn-hero btn-hero-secondary btn-cta-big" onClick={() => navigateTo('contact')}>
                          Get callback Callback
                          <Phone size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            </motion.div>
          )}

          {/* DEDICATED SERVICES PAGE */}
          {currentPage === 'services' && (
            <motion.div
              key="services"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="container"
              style={{ paddingBottom: '100px' }}
            >
              <div className="page-header" style={{ textAlign: 'center', margin: '40px 0 60px 0' }}>
                <span className="section-tag">Services Overview</span>
                <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: '800', marginTop: '10px' }}>What We Do Best</h1>
                <p style={{ maxWidth: '600px', margin: '15px auto 0 auto', color: 'var(--text-gray)' }}>
                  We design, develop, and automate. Our tech solutions are tailor-made to reduce overhead, increase lead rates, and scale.
                </p>
              </div>

              <div className="services-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '30px' }}>
                {config.services.map((service, index) => (
                  <div 
                    key={service.id} 
                    className="service-card"
                    style={{ minHeight: '280px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
                  >
                    <div>
                      <div className="service-icon-box" style={{ color: service.color === 'pink' ? 'var(--primary-pink)' : service.color === 'blue' ? 'var(--primary-blue)' : 'var(--primary-purple)' }}>
                        {renderIcon(service.icon)}
                      </div>
                      <h3 className="service-title" style={{ fontSize: '1.4rem', marginTop: '15px' }}>{service.title}</h3>
                      <p className="service-desc" style={{ fontSize: '0.95rem', color: 'var(--text-gray)', marginTop: '10px' }}>{service.desc}</p>
                    </div>
                    
                    <button 
                      className="btn-hero btn-hero-secondary" 
                      style={{ marginTop: '20px', padding: '10px 15px', fontSize: '0.85rem', width: 'fit-content' }}
                      onClick={() => {
                        setBookingForm({ ...bookingForm, service: service.title });
                        navigateTo('booking');
                      }}
                    >
                      Book This Service
                      <ArrowRight size={14} style={{ marginLeft: '6px' }} />
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DEDICATED PROJECTS PAGE */}
          {currentPage === 'projects' && (
            <motion.div
              key="projects"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="container"
              style={{ paddingBottom: '100px' }}
            >
              <div className="page-header" style={{ textAlign: 'center', margin: '40px 0 60px 0' }}>
                <span className="section-tag">Case Studies</span>
                <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: '800', marginTop: '10px' }}>Our Recent Creations</h1>
                <p style={{ maxWidth: '600px', margin: '15px auto 0 auto', color: 'var(--text-gray)' }}>
                  Click on any project to test their **Interactive Live Demos** inside our developer sandbox.
                </p>
              </div>

              <div className="projects-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))', gap: '30px' }}>
                {config.projects.map((project) => (
                  <div 
                    key={project.id} 
                    className="project-card"
                    onClick={() => setActiveModal(project.type)}
                    style={{ cursor: 'pointer' }}
                  >
                    <div className="project-img-wrapper" style={{ height: '240px' }}>
                      <img 
                        src={project.img} 
                        alt={project.title} 
                        className="project-img"
                        style={{ height: '100%', objectFit: 'cover' }}
                      />
                      <span className="project-tag" style={{ background: 'var(--primary-purple)' }}>{project.tag}</span>
                    </div>
                    <div className="project-details" style={{ padding: '20px' }}>
                      <h3 className="project-title" style={{ fontSize: '1.3rem' }}>{project.title}</h3>
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-gray-dark)', marginTop: '5px' }}>
                        Designed & Automated by VexoteamX
                      </p>
                      <div style={{ display: 'flex', gap: '8px', marginTop: '15px' }}>
                        <span className="crm-status-tag won" style={{ fontSize: '0.7rem' }}>React</span>
                        <span className="crm-status-tag prospect" style={{ fontSize: '0.7rem' }}>API Integrations</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* DEDICATED BOOKING PAGE */}
          {currentPage === 'booking' && (
            <motion.div
              key="booking"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="container"
              style={{ paddingBottom: '100px' }}
            >
              <div className="page-header" style={{ textAlign: 'center', margin: '40px 0 40px 0' }}>
                <span className="section-tag">Booking System</span>
                <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: '800', marginTop: '10px' }}>Schedule a Consultation</h1>
                <p style={{ maxWidth: '600px', margin: '15px auto 0 auto', color: 'var(--text-gray)' }}>
                  Pick your service, date & time. Our booking hooks instantly into our administration alert dashboard.
                </p>
              </div>

              <div className="booking-page-container" style={{ maxWidth: '700px', margin: '0 auto' }}>
                {bookingStep === 1 && (
                  <motion.div 
                    className="crm-table-container" 
                    style={{ padding: '40px', background: 'rgba(255,255,255,0.02)', borderRadius: '16px', border: '1px solid var(--border-color)' }}
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <h3 style={{ color: '#fff', marginBottom: '25px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <Calendar className="text-purple" />
                      Consultation Details
                    </h3>

                    {bookingError && (
                      <div className="console-line error" style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                        <AlertCircle size={18} />
                        <span>{bookingError}</span>
                      </div>
                    )}

                    <form onSubmit={handleBookingSubmit} className="crm-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="crm-form-group">
                          <label>Full Name</label>
                          <input 
                            type="text" 
                            placeholder="Enter your name"
                            value={bookingForm.name}
                            onChange={(e) => setBookingForm({ ...bookingForm, name: e.target.value })}
                            required
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                          />
                        </div>
                        <div className="crm-form-group">
                          <label>Email Address</label>
                          <input 
                            type="email" 
                            placeholder="Enter your email"
                            value={bookingForm.email}
                            onChange={(e) => setBookingForm({ ...bookingForm, email: e.target.value })}
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                          />
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="crm-form-group">
                          <label>Phone Number (WhatsApp)</label>
                          <input 
                            type="tel" 
                            placeholder="+91 XXXXX XXXXX"
                            value={bookingForm.phone}
                            onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                            required
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                          />
                        </div>
                        <div className="crm-form-group">
                          <label>Select Service</label>
                          <select 
                            value={bookingForm.service}
                            onChange={(e) => setBookingForm({ ...bookingForm, service: e.target.value })}
                            required
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                          >
                            <option value="">-- Choose a service --</option>
                            {config.services.map(s => (
                              <option key={s.id} value={s.title}>{s.title}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                        <div className="crm-form-group">
                          <label>Select Date</label>
                          <input 
                            type="date" 
                            value={bookingForm.date}
                            onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                            required
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                          />
                        </div>
                        <div className="crm-form-group">
                          <label>Preferred Time Slot</label>
                          <select 
                            value={bookingForm.time}
                            onChange={(e) => setBookingForm({ ...bookingForm, time: e.target.value })}
                            required
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                          >
                            <option value="">-- Select Slot --</option>
                            {slots.map(slot => (
                              <option key={slot} value={slot}>{slot}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="crm-form-group">
                        <label>Project Requirements / Notes</label>
                        <textarea 
                          placeholder="Tell us briefly about your business needs..."
                          rows="4"
                          value={bookingForm.notes}
                          onChange={(e) => setBookingForm({ ...bookingForm, notes: e.target.value })}
                          style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px', width: '100%', resize: 'none', fontFamily: 'inherit' }}
                        />
                      </div>

                      <button 
                        type="submit" 
                        className="btn-cta btn-cta-primary" 
                        style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '1rem', marginTop: '10px' }}
                      >
                        Confirm and Schedule Booking
                        <Check size={18} style={{ marginLeft: '10px' }} />
                      </button>
                    </form>
                  </motion.div>
                )}

                {bookingStep === 2 && (
                  <div style={{ textAlign: 'center', padding: '60px 0' }}>
                    <div style={{ width: '40px', height: '40px', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: 'var(--primary-purple)', borderRadius: '50%', margin: '0 auto 20px auto', animation: 'spin 1s linear infinite' }} />
                    <p style={{ color: 'var(--text-gray)' }}>Sending booking coordinates to admin app...</p>
                  </div>
                )}

                {bookingStep === 3 && (
                  <motion.div 
                    className="salon-success-view"
                    style={{ background: 'rgba(255,255,255,0.02)', padding: '50px', borderRadius: '16px', border: '1px solid var(--border-color)', textAlign: 'center' }}
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                  >
                    <ConfettiEffect />
                    <div className="salon-success-icon" style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', width: '60px', height: '60px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px auto' }}>
                      <CheckCircle size={32} />
                    </div>
                    <h2 className="gradient-text" style={{ fontSize: '2rem', fontWeight: '800' }}>Booking Confirmed!</h2>
                    <p style={{ color: 'var(--text-gray)', margin: '15px auto', maxWidth: '450px', lineHeight: '1.6' }}>
                      Thank you <strong>{bookingForm.name}</strong>. Your consultation for <strong>{bookingForm.service}</strong> has been received for <strong>{bookingForm.date}</strong> at <strong>{bookingForm.time}</strong>.
                    </p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-gray-dark)' }}>
                      We have pushed a real-time notification to the administrator's dashboard. We will connect with you shortly.
                    </p>
                    <button 
                      className="btn-hero btn-hero-primary" 
                      style={{ marginTop: '25px' }}
                      onClick={() => {
                        setBookingForm({ name: '', email: '', phone: '', service: '', date: '', time: '', notes: '' });
                        setBookingStep(1);
                      }}
                    >
                      Schedule Another Call
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* DEDICATED CONTACT US PAGE */}
          {currentPage === 'contact' && (
            <motion.div
              key="contact"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.3 }}
              className="container"
              style={{ paddingBottom: '100px' }}
            >
              <div className="page-header" style={{ textAlign: 'center', margin: '40px 0 60px 0' }}>
                <span className="section-tag">Get In Touch</span>
                <h1 className="gradient-text" style={{ fontSize: '3rem', fontWeight: '800', marginTop: '10px' }}>Contact VexoteamX</h1>
                <p style={{ maxWidth: '600px', margin: '15px auto 0 auto', color: 'var(--text-gray)' }}>
                  Have quick questions? Request an instant call-back or reach out directly.
                </p>
              </div>

              <div className="contact-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '50px', alignItems: 'start' }}>
                {/* Contact Information */}
                <div className="contact-info-panel" style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                  <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '800' }}>Direct Channels</h2>
                  <p style={{ color: 'var(--text-gray)', lineHeight: '1.6' }}>
                    Connect with our technical advisory team. Our typical response latency is less than 60 minutes during standard business hours.
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="stat-item" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
                      <div className="stat-icon-wrapper" style={{ color: 'var(--primary-purple)' }}>
                        <Mail size={22} />
                      </div>
                      <div className="stat-info" style={{ marginLeft: '15px' }}>
                        <span className="stat-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Email Support</span>
                        <span className="stat-number" style={{ fontSize: '1.2rem', marginTop: '2px', color: '#fff' }}>{config.contact_email}</span>
                      </div>
                    </div>

                    <div className="stat-item" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
                      <div className="stat-icon-wrapper" style={{ color: 'var(--primary-pink)' }}>
                        <Phone size={22} />
                      </div>
                      <div className="stat-info" style={{ marginLeft: '15px' }}>
                        <span className="stat-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>WhatsApp Call</span>
                        <span className="stat-number" style={{ fontSize: '1.2rem', marginTop: '2px', color: '#fff' }}>{config.contact_phone}</span>
                      </div>
                    </div>

                    <div className="stat-item" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px' }}>
                      <div className="stat-icon-wrapper" style={{ color: 'var(--primary-blue)' }}>
                        <MapPin size={22} />
                      </div>
                      <div className="stat-info" style={{ marginLeft: '15px' }}>
                        <span className="stat-label" style={{ fontSize: '0.8rem', textTransform: 'uppercase' }}>Office HQ</span>
                        <span className="stat-number" style={{ fontSize: '1.2rem', marginTop: '2px', color: '#fff' }}>{config.contact_address}</span>
                      </div>
                    </div>
                  </div>

                  <div className="qr-code-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '15px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '20px', borderRadius: '12px', width: 'fit-content' }}>
                    <svg className="qr-code-svg" viewBox="0 0 100 100" style={{ width: '60px', height: '60px' }}>
                      <rect x="5" y="5" width="22" height="22" fill="none" stroke="#000" strokeWidth="6" />
                      <rect x="11" y="11" width="10" height="10" fill="#000" />
                      <rect x="73" y="5" width="22" height="22" fill="none" stroke="#000" strokeWidth="6" />
                      <rect x="79" y="11" width="10" height="10" fill="#000" />
                      <rect x="5" y="73" width="22" height="22" fill="none" stroke="#000" strokeWidth="6" />
                      <rect x="11" y="79" width="10" height="10" fill="#000" />
                      <rect x="79" y="79" width="10" height="10" fill="#000" />
                      <circle cx="50" cy="50" r="10" fill="#25d366" />
                    </svg>
                    <div>
                      <h4 style={{ color: '#fff', fontSize: '0.95rem' }}>Instant WhatsApp</h4>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-gray-dark)' }}>Scan QR or click call button</p>
                    </div>
                  </div>
                </div>

                {/* Call-back Form */}
                <div className="contact-form-panel" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-color)', padding: '40px', borderRadius: '16px' }}>
                  <h2 style={{ color: '#fff', fontSize: '1.8rem', fontWeight: '800', marginBottom: '10px' }}>Request Callback</h2>
                  <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem', marginBottom: '25px' }}>
                    Submit your number, and our mobile notification pipeline will instantly alert the lead manager.
                  </p>

                  {contactError && (
                    <div className="console-line error" style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px' }}>
                      {contactError}
                    </div>
                  )}

                  {contactSuccess && (
                    <div className="console-line success" style={{ padding: '12px', borderRadius: '8px', marginBottom: '20px', display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <CheckCircle size={18} />
                      <span>Callback requested! We will call you shortly.</span>
                    </div>
                  )}

                  <form onSubmit={handleContactSubmit} className="crm-form" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div className="crm-form-group">
                      <label>Your Name</label>
                      <input 
                        type="text" 
                        placeholder="Enter full name"
                        value={contactForm.name}
                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                        required
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                      />
                    </div>

                    <div className="crm-form-group">
                      <label>Phone Number (with country code)</label>
                      <input 
                        type="tel" 
                        placeholder="+91 XXXXX XXXXX"
                        value={contactForm.phone}
                        onChange={(e) => setContactForm({ ...contactForm, phone: e.target.value })}
                        required
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                      />
                    </div>

                    <div className="crm-form-group">
                      <label>Service of Interest</label>
                      <select
                        value={contactForm.service}
                        onChange={(e) => setContactForm({ ...contactForm, service: e.target.value })}
                        style={{ background: 'rgba(255,255,255,0.04)', color: '#fff', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '12px' }}
                      >
                        <option value="General Inquiry">General Inquiry</option>
                        {config.services.map(s => (
                          <option key={s.id} value={s.title}>{s.title}</option>
                        ))}
                      </select>
                    </div>

                    <button 
                      type="submit" 
                      className="btn-cta btn-cta-primary" 
                      disabled={isSubmittingContact}
                      style={{ width: '100%', justifyContent: 'center', padding: '15px', fontSize: '1rem', opacity: isSubmittingContact ? 0.7 : 1 }}
                    >
                      {isSubmittingContact ? 'Requesting...' : 'Request Instant Callback'}
                      <Phone size={18} style={{ marginLeft: '10px' }} />
                    </button>
                  </form>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <div className="container">
          <div className="footer-grid">
            <div className="footer-logo-col">
              <div className="logo-wrapper">
                <div className="logo-main">
                  VEXOTEAMX
                  <div className="status-dot-wrapper">
                    <span className="status-dot-pulse"></span>
                    <span className="status-dot"></span>
                  </div>
                </div>
                <div className="logo-subtitle">AI • AUTOMATION • WEB</div>
              </div>
              <p className="footer-desc">
                Building AI-powered digital solutions that automate, scale & grow businesses.
              </p>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-title">Pages</h4>
              <ul className="footer-links">
                <li><button onClick={() => navigateTo('home')} className="footer-link-btn-text">Home</button></li>
                <li><button onClick={() => navigateTo('services')} className="footer-link-btn-text">Services</button></li>
                <li><button onClick={() => navigateTo('projects')} className="footer-link-btn-text">Projects</button></li>
                <li><button onClick={() => navigateTo('booking')} className="footer-link-btn-text">Booking System</button></li>
                <li><button onClick={() => navigateTo('contact')} className="footer-link-btn-text">Contact Us</button></li>
              </ul>
            </div>

            <div className="footer-links-col">
              <h4 className="footer-title">Contact info</h4>
              <div className="footer-contact-info">
                <div className="contact-item">
                  <Mail size={14} className="contact-item-icon" />
                  <span>{config.contact_email}</span>
                </div>
                <div className="contact-item">
                  <Phone size={14} className="contact-item-icon" />
                  <span>{config.contact_phone}</span>
                </div>
                <div className="contact-item">
                  <MapPin size={14} className="contact-item-icon" />
                  <span>{config.contact_address}</span>
                </div>
              </div>
            </div>

            <div className="footer-connect-col">
              <h4 className="footer-title">Let's Connect</h4>
              <div className="qr-code-wrapper" style={{ cursor: 'pointer' }} onClick={() => navigateTo('contact')}>
                <svg className="qr-code-svg" viewBox="0 0 100 100">
                  <rect x="5" y="5" width="22" height="22" fill="none" stroke="#000" strokeWidth="6" />
                  <rect x="11" y="11" width="10" height="10" fill="#000" />
                  <rect x="73" y="5" width="22" height="22" fill="none" stroke="#000" strokeWidth="6" />
                  <rect x="79" y="11" width="10" height="10" fill="#000" />
                  <rect x="5" y="73" width="22" height="22" fill="none" stroke="#000" strokeWidth="6" />
                  <rect x="11" y="79" width="10" height="10" fill="#000" />
                  <rect x="79" y="79" width="10" height="10" fill="#000" />
                  <circle cx="50" cy="50" r="10" fill="#25d366" />
                </svg>
                <span className="qr-text">Scan for WhatsApp</span>
              </div>
            </div>
          </div>

          <div className="footer-bottom">
            <span className="footer-copyright">
              © 2026 VexoteamX. All rights reserved.
            </span>
            <span className="footer-bottom-text">
              Designed with Passion • Built with AI
            </span>
          </div>
        </div>
      </footer>

      {/* ========================================= */}
      {/* INTERACTIVE DEMOS MODAL CONTAINER POPUPS  */}
      {/* ========================================= */}
      <AnimatePresence>
        {activeModal && (
          <motion.div 
            className="modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setActiveModal(null)}
          >
            <motion.div 
              className="modal-container"
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* MODAL HEADER */}
              <div className="modal-header">
                <div className="modal-title-area">
                  <div className="modal-icon-badge">
                    {activeModal === 'crm' && <Database size={20} />}
                    {activeModal === 'salon' && <Calendar size={20} />}
                    {activeModal === 'builder' && <Cpu size={20} />}
                  </div>
                  <div>
                    <div className="modal-title">
                      {activeModal === 'crm' && 'Interactive CRM System Dashboard'}
                      {activeModal === 'salon' && 'Luxury Salon Booking Simulator'}
                      {activeModal === 'builder' && 'Interactive AI Automation Flow Builder'}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', marginTop: '4px', alignItems: 'center' }}>
                      <span className="modal-tag">VexoteamX Labs</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-gray-dark)' }}>Live Sandbox Demo</span>
                    </div>
                  </div>
                </div>
                <button className="modal-close-btn" onClick={() => setActiveModal(null)}>
                  <X size={18} />
                </button>
              </div>

              {/* MODAL MAIN CONTENT */}
              <div className="modal-content-scroll" style={{ padding: activeModal === 'crm' ? '0' : '32px' }}>
                
                {/* 1. CRM DYNAMIC DEMO */}
                {activeModal === 'crm' && (
                  <div className="crm-demo">
                    <div className="crm-sidebar">
                      <button 
                        className={`crm-nav-btn ${crmTab === 'dashboard' ? 'active' : ''}`}
                        onClick={() => setCrmTab('dashboard')}
                      >
                        <Layers size={16} />
                        Dashboard
                      </button>
                      <button 
                        className={`crm-nav-btn ${crmTab === 'leads' ? 'active' : ''}`}
                        onClick={() => setCrmTab('leads')}
                      >
                        <UserCheck size={16} />
                        Active Leads ({leads.length})
                      </button>
                      <button 
                        className={`crm-nav-btn ${crmTab === 'add' ? 'active' : ''}`}
                        onClick={() => setCrmTab('add')}
                      >
                        <Plus size={16} />
                        Add New Lead
                      </button>
                    </div>
                    
                    <div className="crm-workspace">
                      {crmTab === 'dashboard' && (
                        <>
                          <div className="crm-action-header">
                            <h3 style={{ color: '#fff' }}>Performance Metrics</h3>
                            <button className="btn-crm-action" onClick={() => setCrmTab('add')}>
                              <Plus size={16} /> Add Lead
                            </button>
                          </div>
                          
                          <div className="crm-stats-row">
                            <div className="crm-mini-card">
                              <span className="crm-mini-label">Total Lead Value</span>
                              <div className="crm-mini-value">
                                ${leads.reduce((sum, item) => sum + parseInt(item.value.replace(/[^0-9]/g, '') || 0), 0).toLocaleString()}
                              </div>
                              <span className="crm-mini-subtext">▲ 14.8% vs last month</span>
                            </div>
                            <div className="crm-mini-card" style={{ borderLeftColor: 'var(--primary-pink)' }}>
                              <span className="crm-mini-label">Won Conversions</span>
                              <div className="crm-mini-value">
                                {leads.filter(l => l.status === 'won').length} / {leads.length}
                              </div>
                              <span className="crm-mini-subtext" style={{ color: 'var(--primary-pink)' }}>Rating: Outstanding</span>
                            </div>
                            <div className="crm-mini-card" style={{ borderLeftColor: 'var(--primary-blue)' }}>
                              <span className="crm-mini-label">Active Prospects</span>
                              <div className="crm-mini-value">
                                {leads.filter(l => l.status === 'prospect').length} Leads
                              </div>
                              <span className="crm-mini-subtext" style={{ color: 'var(--primary-blue)' }}>Pipeline healthy</span>
                            </div>
                          </div>

                          <div className="crm-table-container">
                            <div style={{ padding: '16px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.06)', color: '#fff' }}>
                              Sales Funnel Pipeline
                            </div>
                            <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                              {['prospect', 'proposal', 'won'].map(status => {
                                const count = leads.filter(l => l.status === status).length;
                                const maxCount = Math.max(...['prospect', 'proposal', 'won'].map(s => leads.filter(l => l.status === s).length));
                                const pct = maxCount > 0 ? (count / maxCount) * 100 : 0;
                                const val = leads.filter(l => l.status === status).reduce((sum, item) => sum + parseInt(item.value.replace(/[^0-9]/g, '') || 0), 0);
                                return (
                                  <div key={status} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', textTransform: 'uppercase', fontWeight: '700' }}>
                                      <span>{status} ({count})</span>
                                      <span style={{ color: '#fff' }}>${val.toLocaleString()}</span>
                                    </div>
                                    <div style={{ width: '100%', height: '8px', background: 'rgba(255,255,255,0.04)', borderRadius: '4px', overflow: 'hidden' }}>
                                      <motion.div 
                                        style={{ 
                                          height: '100%', 
                                          background: status === 'won' ? '#10b981' : status === 'proposal' ? 'var(--primary-pink)' : 'var(--primary-blue)', 
                                          borderRadius: '4px' 
                                        }}
                                        initial={{ width: 0 }}
                                        animate={{ width: `${pct}%` }}
                                        transition={{ duration: 1 }}
                                      />
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </>
                      )}

                      {crmTab === 'leads' && (
                        <>
                          <div className="crm-action-header">
                            <h3 style={{ color: '#fff' }}>CRM Leads database</h3>
                            <button className="btn-crm-action" onClick={() => setCrmTab('add')}>
                              <Plus size={16} /> New Lead
                            </button>
                          </div>
                          
                          <div className="crm-table-container">
                            <table className="crm-table">
                              <thead>
                                <tr>
                                  <th>Contact Name</th>
                                  <th>Company</th>
                                  <th>Project Value</th>
                                  <th>Funnel Status</th>
                                </tr>
                              </thead>
                              <tbody>
                                {leads.map(lead => (
                                  <tr key={lead.id}>
                                    <td style={{ fontWeight: '700', color: '#fff' }}>{lead.name}</td>
                                    <td>{lead.company}</td>
                                    <td style={{ color: 'var(--primary-purple)', fontWeight: '700' }}>{lead.value}</td>
                                    <td>
                                      <span className={`crm-status-tag ${lead.status}`}>
                                        {lead.status}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </>
                      )}

                      {crmTab === 'add' && (
                        <>
                          <h3 style={{ color: '#fff' }}>Register New Sales Lead</h3>
                          <form className="crm-form" onSubmit={handleAddLead}>
                            <div className="crm-form-group">
                              <label>Lead Contact Name</label>
                              <input 
                                type="text" 
                                placeholder="Enter full name" 
                                value={newLead.name} 
                                onChange={(e) => setNewLead({ ...newLead, name: e.target.value })}
                                required
                              />
                            </div>
                            <div className="crm-form-group">
                              <label>Company / Brand Name</label>
                              <input 
                                type="text" 
                                placeholder="Enter company name" 
                                value={newLead.company} 
                                onChange={(e) => setNewLead({ ...newLead, company: e.target.value })}
                                required
                              />
                            </div>
                            <div className="crm-form-group">
                              <label>Estimated Project Value (USD)</label>
                              <input 
                                type="number" 
                                placeholder="e.g. 15000" 
                                value={newLead.value} 
                                onChange={(e) => setNewLead({ ...newLead, value: e.target.value })}
                                required
                              />
                            </div>
                            <div className="crm-form-group">
                              <label>Initial Pipeline Stage</label>
                              <select 
                                value={newLead.status} 
                                onChange={(e) => setNewLead({ ...newLead, status: e.target.value })}
                              >
                                <option value="prospect">Prospect (Initial Lead)</option>
                                <option value="proposal">Proposal (Offer Sent)</option>
                                <option value="won">Won (Deal Closed)</option>
                              </select>
                            </div>
                            <button type="submit" className="btn-crm-action" style={{ width: '100%', justifyContent: 'center', padding: '12px' }}>
                              Add Lead to Pipeline
                            </button>
                          </form>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* 2. SALON BOOKING DYNAMIC DEMO */}
                {activeModal === 'salon' && (
                  <div className="salon-demo">
                    <div className="salon-banner">
                      <h3 className="salon-title">DAR SALON</h3>
                      <span className="salon-subtitle">Luxury Hair Artistry</span>
                    </div>

                    {salonStep === 1 && (
                      <div>
                        <h4 className="salon-step-title">Step 1: Select Your Styling Service</h4>
                        <div className="salon-services-list">
                          {salonServices.map(svc => (
                            <div 
                              key={svc.id} 
                              className={`salon-service-item ${selectedService?.id === svc.id ? 'selected' : ''}`}
                              onClick={() => setSelectedService(svc)}
                            >
                              <div>
                                <div className="salon-svc-name">{svc.name}</div>
                                <div className="salon-svc-duration">{svc.duration} session</div>
                              </div>
                              <div className="salon-svc-price">{svc.price}</div>
                            </div>
                          ))}
                        </div>
                        <button 
                          className="btn-salon-submit" 
                          disabled={!selectedService}
                          style={{ opacity: selectedService ? 1 : 0.5, cursor: selectedService ? 'pointer' : 'not-allowed' }}
                          onClick={() => setSalonStep(2)}
                        >
                          Next Step: Choose Time Slot
                        </button>
                      </div>
                    )}

                    {salonStep === 2 && (
                      <div>
                        <h4 className="salon-step-title">Step 2: Choose Date & Time</h4>
                        
                        <div className="salon-grid-dates">
                          {dates.map(d => (
                            <div 
                              key={d.num} 
                              className={`salon-date-card ${selectedDate?.num === d.num ? 'selected' : ''}`}
                              onClick={() => setSelectedDate(d)}
                            >
                              <div className="salon-date-day">{d.day}</div>
                              <div className="salon-date-num">{d.num}</div>
                            </div>
                          ))}
                        </div>

                        {selectedDate && (
                          <div className="salon-slots-grid">
                            {slots.map(slot => (
                              <button 
                                key={slot}
                                className={`salon-slot ${selectedSlot === slot ? 'selected' : ''}`}
                                onClick={() => setSelectedSlot(slot)}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        )}

                        <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
                          <button className="btn-salon-submit" style={{ background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.1)' }} onClick={() => setSalonStep(1)}>
                            Back
                          </button>
                          <button 
                            className="btn-salon-submit" 
                            disabled={!selectedSlot}
                            style={{ opacity: selectedSlot ? 1 : 0.5, cursor: selectedSlot ? 'pointer' : 'not-allowed' }}
                            onClick={() => setSalonStep(3)}
                          >
                            Confirm Appointment
                          </button>
                        </div>
                      </div>
                    )}

                    {salonStep === 3 && (
                      <div className="salon-success-view">
                        <ConfettiEffect />
                        <div className="salon-success-icon">
                          <Check size={28} />
                        </div>
                        <h4 style={{ fontFamily: 'serif', fontSize: '1.8rem', color: '#dfba73' }}>Appointment Reserved!</h4>
                        <p style={{ fontSize: '0.95rem', color: 'var(--text-gray)', maxWidth: '400px', lineHeight: '1.6' }}>
                          We have reserved your session for <strong>{selectedService?.name}</strong> on <strong>July {selectedDate?.num} at {selectedSlot}</strong>.
                        </p>
                        <div style={{ background: 'rgba(255,255,255,0.02)', padding: '16px 24px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)', width: '100%', maxWidth: '320px', marginTop: '12px' }}>
                          <div style={{ fontSize: '0.7rem', textTransform: 'uppercase', color: 'var(--text-gray-dark)' }}>Booking ID</div>
                          <div style={{ fontStyle: 'monospace', fontWeight: '800', fontSize: '1.1rem', color: '#dfba73', marginTop: '2px' }}>DAR-{Math.floor(Math.random() * 90000 + 10000)}</div>
                        </div>
                        <button className="btn-salon-submit" onClick={resetSalonBooking}>
                          Book Another Styling Session
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* 3. AI AUTOMATION BUILDER DYNAMIC DEMO */}
                {activeModal === 'builder' && (
                  <div className="builder-demo">
                    <div style={{ textAlign: 'center' }}>
                      <p style={{ color: 'var(--text-gray)', fontSize: '0.9rem' }}>
                        Configure the nodes by clicking on them, then hit **"Run Workflow"** to test the automation flow.
                      </p>
                    </div>

                    <div className="builder-canvas">
                      <svg className="builder-connector-svg">
                        <path d="M 210,120 L 370,120" className="builder-line" />
                        <path d="M 210,120 L 370,120" className={`builder-line-pulse ${isRunning ? 'running' : ''}`} />
                        <path d="M 550,120 L 710,120" className="builder-line" />
                        <path d="M 550,120 L 710,120" className={`builder-line-pulse ${isRunning ? 'running' : ''}`} />
                      </svg>

                      {/* Node 1: Trigger */}
                      <div 
                        className={`builder-node ${activeNode === 'trigger' ? 'active' : ''}`}
                        onClick={() => setActiveNode('trigger')}
                      >
                        <div className="node-type-label">Trigger</div>
                        <div className="node-name">{nodeConfig.trigger.type}</div>
                        <div className="node-desc">{nodeConfig.trigger.value}</div>
                      </div>

                      {/* Node 2: Action */}
                      <div 
                        className={`builder-node ${activeNode === 'action' ? 'active' : ''}`}
                        onClick={() => setActiveNode('action')}
                      >
                        <div className="node-type-label" style={{ color: 'var(--primary-pink)' }}>AI Action</div>
                        <div className="node-name">{nodeConfig.action.type}</div>
                        <div className="node-desc">{nodeConfig.action.model}</div>
                      </div>

                      {/* Node 3: Output */}
                      <div 
                        className={`builder-node ${activeNode === 'output' ? 'active' : ''}`}
                        onClick={() => setActiveNode('output')}
                      >
                        <div className="node-type-label" style={{ color: 'var(--primary-blue)' }}>Output Event</div>
                        <div className="node-name">{nodeConfig.output.type}</div>
                        <div className="node-desc">{nodeConfig.output.channel}</div>
                      </div>
                    </div>

                    {/* CONFIG PANEL */}
                    <div className="builder-panel">
                      <h4 style={{ color: '#fff', fontSize: '0.95rem', textTransform: 'uppercase', marginBottom: '12px' }}>
                        Configure: {activeNode.toUpperCase()} NODE
                      </h4>

                      {activeNode === 'trigger' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="crm-form-group">
                            <label>Trigger Event Type</label>
                            <select 
                              value={nodeConfig.trigger.type}
                              onChange={(e) => setNodeConfig({
                                ...nodeConfig,
                                trigger: { ...nodeConfig.trigger, type: e.target.value }
                              })}
                            >
                              <option value="New CRM Lead">New CRM Lead</option>
                              <option value="Incoming Email">Incoming Email</option>
                              <option value="Webhook Received">Webhook Received</option>
                            </select>
                          </div>
                          <div className="crm-form-group">
                            <label>Source Endpoint</label>
                            <input 
                              type="text" 
                              value={nodeConfig.trigger.value}
                              onChange={(e) => setNodeConfig({
                                ...nodeConfig,
                                trigger: { ...nodeConfig.trigger, value: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      )}

                      {activeNode === 'action' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="crm-form-group">
                            <label>AI Processing Task</label>
                            <select 
                              value={nodeConfig.action.type}
                              onChange={(e) => setNodeConfig({
                                ...nodeConfig,
                                action: { ...nodeConfig.action, type: e.target.value }
                              })}
                            >
                              <option value="AI Lead Scorer">AI Lead Scorer</option>
                              <option value="AI Auto-Responder">AI Auto-Responder</option>
                              <option value="Extract Key Facts">Extract Key Facts</option>
                            </select>
                          </div>
                          <div className="crm-form-group">
                            <label>AI LLM Engine</label>
                            <select 
                              value={nodeConfig.action.model}
                              onChange={(e) => setNodeConfig({
                                ...nodeConfig,
                                action: { ...nodeConfig.action, model: e.target.value }
                              })}
                            >
                              <option value="Gemini 3.5 Flash">Gemini 3.5 Flash</option>
                              <option value="Gemini 3.5 Pro">Gemini 3.5 Pro</option>
                              <option value="GPT-4o Agentic">GPT-4o Agentic</option>
                            </select>
                          </div>
                        </div>
                      )}

                      {activeNode === 'output' && (
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                          <div className="crm-form-group">
                            <label>Output Integration Action</label>
                            <select 
                              value={nodeConfig.output.type}
                              onChange={(e) => setNodeConfig({
                                ...nodeConfig,
                                output: { ...nodeConfig.output, type: e.target.value }
                              })}
                            >
                              <option value="Send Slack Notification">Send Slack Notification</option>
                              <option value="Send WhatsApp Message">Send WhatsApp Message</option>
                              <option value="Update Google Sheets">Update Google Sheets</option>
                            </select>
                          </div>
                          <div className="crm-form-group">
                            <label>Destination Target</label>
                            <input 
                              type="text" 
                              value={nodeConfig.output.channel}
                              onChange={(e) => setNodeConfig({
                                ...nodeConfig,
                                output: { ...nodeConfig.output, channel: e.target.value }
                              })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* RUN TRIGGER */}
                    <div className="builder-actions">
                      <button 
                        className="btn-builder-run" 
                        onClick={runWorkflow}
                        disabled={isRunning}
                        style={{ opacity: isRunning ? 0.7 : 1, cursor: isRunning ? 'not-allowed' : 'pointer' }}
                      >
                        <Play size={16} />
                        {isRunning ? 'Executing Flow...' : 'Run Workflow'}
                      </button>
                    </div>

                    {/* CONSOLE TERMINAL OUTPUT */}
                    <div className="builder-console">
                      {logs.map((log, index) => {
                        const isSuccess = log.includes('SUCCESS');
                        const isInfo = log.includes('RUNNING') || log.includes('initialized');
                        const lineClass = isSuccess ? 'console-line success' : isInfo ? 'console-line info' : 'console-line';
                        return (
                          <div key={index} className={lineClass}>
                            {log}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
