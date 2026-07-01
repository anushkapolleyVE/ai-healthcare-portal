import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { appointmentAPI, doctorAPI } from '../services/api';
import { Calendar, User, Clock, Heart, Activity, FileText } from 'lucide-react';

export const Overview = ({ setActiveTab }) => {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [doctorsCount, setDoctorsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [appts, docs] = await Promise.all([
          appointmentAPI.listMine(),
          doctorAPI.list()
        ]);
        setAppointments(appts.filter(a => a.status === 'Booked'));
        setDoctorsCount(docs.length);
      } catch (err) {
        console.error("Failed to load dashboard overview data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {/* Welcome banner */}
      <div className="glass-card" style={{ 
        background: 'linear-gradient(135deg, rgba(15, 22, 38, 0.8) 0%, rgba(6, 182, 212, 0.1) 100%)',
        padding: '32px'
      }}>
        <h2 style={{ fontSize: '26px', fontWeight: 600, marginBottom: '8px', color: '#fff' }}>
          Welcome back, {user?.name || 'Patient'}!
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '15px', maxWidth: '600px', lineHeight: 1.5 }}>
          Access AI health insights, consult our symptom checkers, get medical reports summarized in plain language, or book an appointment with our specialist physicians.
        </p>
      </div>

      {/* Quick stats widgets */}
      <div className="grid-3">
        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ color: 'var(--accent-primary)', backgroundColor: 'rgba(6, 182, 212, 0.1)' }}>
            <Calendar size={22} />
          </div>
          <div className="stat-info">
            <h4>Active Bookings</h4>
            <p>{appointments.length}</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ color: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)' }}>
            <User size={22} />
          </div>
          <div className="stat-info">
            <h4>Available Doctors</h4>
            <p>{doctorsCount}</p>
          </div>
        </div>

        <div className="glass-card stat-card">
          <div className="stat-icon" style={{ color: '#3b82f6', backgroundColor: 'rgba(59, 130, 246, 0.1)' }}>
            <Activity size={22} />
          </div>
          <div className="stat-info">
            <h4>AI Health Engines</h4>
            <p>3 Active</p>
          </div>
        </div>
      </div>

      {/* Main dashboard content */}
      <div className="grid-2">
        {/* Next Appointments */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={18} style={{ color: 'var(--accent-primary)' }} />
            Upcoming Appointments
          </h3>

          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <span className="loading-spinner"></span>
            </div>
          ) : appointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '30px 20px', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '16px', fontSize: '14px' }}>No upcoming appointments scheduled.</p>
              <button onClick={() => setActiveTab('appointments')} className="btn btn-primary btn-sm">
                Book Appointment
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {appointments.slice(0, 3).map((appt) => (
                <div key={appt.id} style={{ 
                  display: 'flex', 
                  justifyContent: 'between', 
                  alignItems: 'center',
                  padding: '12px 16px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-md)'
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px', color: '#fff' }}>
                      Appointment (ID: {appt.id})
                    </span>
                    <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      Date: {appt.appointment_date} | Time: {appt.appointment_time}
                    </span>
                  </div>
                  <span className="badge badge-success">Booked</span>
                </div>
              ))}
              {appointments.length > 3 && (
                <button 
                  onClick={() => setActiveTab('appointments')}
                  style={{ background: 'none', border: 'none', color: 'var(--accent-primary)', fontSize: '13px', alignSelf: 'flex-start', cursor: 'pointer' }}
                >
                  View all {appointments.length} appointments
                </button>
              )}
            </div>
          )}
        </div>

        {/* AI Quick Access shortcuts */}
        <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Heart size={18} style={{ color: 'var(--danger)' }} />
            Quick AI Tools
          </h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div 
              onClick={() => setActiveTab('chatbot')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '14px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              className="shortcut-card"
            >
              <div style={{ color: 'var(--accent-primary)' }}>
                <Heart size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Consult AI Assistant</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Have a conversation about symptoms and health general questions.</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('symptoms')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '14px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              className="shortcut-card"
            >
              <div style={{ color: 'var(--warning)' }}>
                <Activity size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>Symptom Checker</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Enter symptoms to receive a list of possible explanations and recommendations.</p>
              </div>
            </div>

            <div 
              onClick={() => setActiveTab('summarizer')}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '16px', 
                padding: '14px', 
                borderRadius: 'var(--radius-md)', 
                background: 'rgba(255, 255, 255, 0.02)', 
                border: '1px solid var(--border-color)',
                cursor: 'pointer',
                transition: 'var(--transition-smooth)'
              }}
              className="shortcut-card"
            >
              <div style={{ color: '#a78bfa' }}>
                <FileText size={20} />
              </div>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 600, color: '#fff' }}>PDF Report Summarizer</h4>
                <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Upload lab results or medical report PDFs to get an instant plain summary.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
