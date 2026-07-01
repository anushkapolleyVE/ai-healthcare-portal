import React from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  MessageSquare, 
  HeartPulse, 
  FileText, 
  CalendarRange, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Activity 
} from 'lucide-react';

export const DashboardLayout = ({ activeTab, setActiveTab, children }) => {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'chatbot', label: 'Medical Chatbot', icon: MessageSquare },
    { id: 'symptoms', label: 'Symptom Checker', icon: HeartPulse },
    { id: 'summarizer', label: 'Report Summarizer', icon: FileText },
    { id: 'appointments', label: 'Appointments', icon: CalendarRange },
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'admin', label: 'Admin Setup', icon: PlusCircle },
  ];

  const getPageTitle = () => {
    switch (activeTab) {
      case 'overview': return 'Dashboard Overview';
      case 'chatbot': return 'AI Medical Assistant';
      case 'symptoms': return 'AI Symptom Analyzer';
      case 'summarizer': return 'PDF Report Summarizer';
      case 'appointments': return 'Doctor & Appointment Booking';
      case 'settings': return 'Profile Settings';
      case 'admin': return 'Doctor Setup & Seeding';
      default: return 'Healthcare Portal';
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div style={{ color: '#06b6d4' }}>
            <Activity size={24} />
          </div>
          <h2>Health Portal</h2>
        </div>

        <nav className="sidebar-nav">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isAdminItem = item.id === 'admin';
            return (
              <React.Fragment key={item.id}>
                {isAdminItem && (
                  <div style={{
                    margin: '8px 12px 4px',
                    fontSize: '10px',
                    color: 'var(--text-muted)',
                    fontWeight: 700,
                    letterSpacing: '0.08em',
                    textTransform: 'uppercase'
                  }}>
                    Demo Tools
                  </div>
                )}
                <button
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-link ${activeTab === item.id ? 'active' : ''}`}
                  style={{ border: 'none', background: 'none', width: '100%', textAlign: 'left' }}
                >
                  <Icon size={18} />
                  {item.label}
                </button>
              </React.Fragment>
            );
          })}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info" style={{ marginBottom: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '14px',
                fontWeight: 700,
                color: '#fff',
                flexShrink: 0
              }}>
                {(user?.name || 'U')[0].toUpperCase()}
              </div>
              <div>
                <span className="user-name" style={{ display: 'block' }}>{user?.name || 'User'}</span>
                <span className="user-role">{user?.role || 'patient'}</span>
              </div>
            </div>
          </div>
          <button
            onClick={logout}
            className="btn btn-secondary btn-sm"
            style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
          >
            <LogOut size={14} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Panel Viewport */}
      <main className="main-content">
        <header className="top-bar">
          <h1 className="page-title">{getPageTitle()}</h1>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', fontSize: '13px' }}>
              <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>System Status</span>
              <span style={{ color: 'var(--success)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--success)',
                  display: 'inline-block',
                  boxShadow: '0 0 6px var(--success)'
                }}></span>
                Online
              </span>
            </div>
          </div>
        </header>
        <div className="panel-container">
          {children}
        </div>
      </main>
    </div>
  );
};
