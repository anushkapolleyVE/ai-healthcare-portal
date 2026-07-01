import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Login } from './components/Login';
import { Signup } from './components/Signup';
import { DashboardLayout } from './components/DashboardLayout';
import { Overview } from './components/Overview';
import { Chatbot } from './components/Chatbot';
import { Symptoms } from './components/Symptoms';
import { Summarizer } from './components/Summarizer';
import { Appointments } from './components/Appointments';
import { ProfileSettings } from './components/Settings';
import { Admin } from './components/Admin';

const AppContent = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isLoginView, setIsLoginView] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Loading Splash Screen
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: '#080c14',
        color: '#fff',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <span className="loading-spinner" style={{ width: '40px', height: '40px', borderWidth: '4px' }}></span>
        <h2 style={{ fontSize: '18px', fontWeight: 500, letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>
          SECURE HEALTH PORTAL
        </h2>
      </div>
    );
  }

  // Not Logged In - Auth Flow
  if (!isAuthenticated) {
    return isLoginView ? (
      <Login onToggleMode={() => setIsLoginView(false)} />
    ) : (
      <Signup onToggleMode={() => setIsLoginView(true)} />
    );
  }

  // Logged In - Dashboard
  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return <Overview setActiveTab={setActiveTab} />;
      case 'chatbot':
        return <Chatbot />;
      case 'symptoms':
        return <Symptoms />;
      case 'summarizer':
        return <Summarizer />;
      case 'appointments':
        return <Appointments />;
      case 'settings':
        return <ProfileSettings />;
      case 'admin':
        return <Admin />;
      default:
        return <Overview setActiveTab={setActiveTab} />;
    }
  };

  return (
    <DashboardLayout activeTab={activeTab} setActiveTab={setActiveTab}>
      {renderTabContent()}
    </DashboardLayout>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
