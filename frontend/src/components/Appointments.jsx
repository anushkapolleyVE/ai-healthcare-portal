import React, { useState, useEffect } from 'react';
import { doctorAPI, appointmentAPI } from '../services/api';
import { Calendar, User, Clock, CheckCircle, ShieldAlert, Award, Building2 } from 'lucide-react';

export const Appointments = () => {
  const [activeSubTab, setActiveSubTab] = useState('book'); // 'book' | 'my-bookings'
  const [doctors, setDoctors] = useState([]);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [slots, setSlots] = useState([]);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [myAppointments, setMyAppointments] = useState([]);
  
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [loadingMyAppts, setLoadingMyAppts] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);

  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Load doctors list
  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const data = await doctorAPI.list();
      setDoctors(data);
      if (data.length > 0 && !selectedDoctor) {
        setSelectedDoctor(data[0]);
      }
    } catch (err) {
      console.error("Failed to load doctors", err);
      setError("Could not load doctor registry.");
    } finally {
      setLoadingDoctors(false);
    }
  };

  // Load patient's appointments
  const loadMyAppointments = async () => {
    setLoadingMyAppts(true);
    try {
      const data = await appointmentAPI.listMine();
      // Sort: Booked first, then Cancelled, then chronological
      const sorted = [...data].sort((a, b) => {
        if (a.status === 'Booked' && b.status !== 'Booked') return -1;
        if (a.status !== 'Booked' && b.status === 'Booked') return 1;
        return new Date(`${b.appointment_date}T${b.appointment_time}`) - new Date(`${a.appointment_date}T${a.appointment_time}`);
      });
      setMyAppointments(sorted);
    } catch (err) {
      console.error("Failed to load appointments", err);
    } finally {
      setLoadingMyAppts(false);
    }
  };

  // Load availability slots for selected doctor
  const loadDoctorSlots = async (docId) => {
    if (!docId) return;
    setLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const data = await doctorAPI.getSlots(docId);
      // Filter for available slots only
      setSlots(data.filter(s => s.available));
    } catch (err) {
      console.error("Failed to load slots", err);
    } finally {
      setLoadingSlots(false);
    }
  };

  useEffect(() => {
    loadDoctors();
    loadMyAppointments();
  }, []);

  useEffect(() => {
    if (selectedDoctor) {
      loadDoctorSlots(selectedDoctor.id);
    }
  }, [selectedDoctor]);

  const handleBook = async () => {
    if (!selectedDoctor || !selectedSlot) return;
    setBookingLoading(true);
    setError('');
    setSuccessMsg('');

    try {
      await appointmentAPI.book(
        selectedDoctor.id,
        selectedSlot.slot_date,
        selectedSlot.slot_time
      );
      setSuccessMsg(`Success! Appointment booked for ${selectedSlot.slot_date} at ${selectedSlot.slot_time}.`);
      setSelectedSlot(null);
      // Refresh slot list and my appointments list
      await Promise.all([
        loadDoctorSlots(selectedDoctor.id),
        loadMyAppointments()
      ]);
    } catch (err) {
      console.error("Booking error", err);
      setError(err.response?.data?.detail || "Booking failed. Slot may already be claimed.");
    } finally {
      setBookingLoading(false);
    }
  };

  const handleCancel = async (apptId) => {
    if (!window.confirm("Are you sure you want to cancel this appointment?")) return;
    setError('');
    setSuccessMsg('');

    try {
      await appointmentAPI.cancel(apptId);
      setSuccessMsg("Appointment successfully cancelled.");
      await Promise.all([
        loadMyAppointments(),
        selectedDoctor ? loadDoctorSlots(selectedDoctor.id) : Promise.resolve()
      ]);
    } catch (err) {
      console.error("Cancellation failed", err);
      setError(err.response?.data?.detail || "Could not cancel appointment.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Sub Tabs */}
      <div className="tab-row">
        <button
          className={`tab-item ${activeSubTab === 'book' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('book'); setError(''); setSuccessMsg(''); }}
          style={{ background: 'none', border: 'none' }}
        >
          Book Consultation
        </button>
        <button
          className={`tab-item ${activeSubTab === 'my-bookings' ? 'active' : ''}`}
          onClick={() => { setActiveSubTab('my-bookings'); setError(''); setSuccessMsg(''); }}
          style={{ background: 'none', border: 'none' }}
        >
          My Bookings ({myAppointments.filter(a => a.status === 'Booked').length})
        </button>
      </div>

      {successMsg && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          padding: '12px 16px',
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.3)',
          borderRadius: 'var(--radius-sm)',
          color: 'var(--success)',
          fontSize: '14px'
        }}>
          <CheckCircle size={18} />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="chat-disclaimer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      {activeSubTab === 'book' ? (
        <div className="grid-2">
          {/* Left Side: Select Doctor */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
            <div className="glass-card">
              <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <User size={18} style={{ color: 'var(--accent-primary)' }} />
                Select Specialist
              </h3>

              {loadingDoctors ? (
                <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
                  <span className="loading-spinner"></span>
                </div>
              ) : doctors.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                  No doctors registered yet. Switch to the <strong>Admin Setup</strong> tab to seed doctors and slot times.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {doctors.map((doc) => (
                    <div
                      key={doc.id}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`history-item doctor-card ${selectedDoctor?.id === doc.id ? 'active' : ''}`}
                    >
                      <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>{doc.name}</h4>
                      <div className="doctor-meta">
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--accent-primary)' }}>
                          <Award size={12} /> {doc.speciality} | {doc.qualification}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building2 size={12} /> {doc.hospital} ({doc.experience} Years Exp)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Side: Select Slot and Book */}
          <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
              Available Time Slots
            </h3>

            {selectedDoctor ? (
              <>
                <div style={{ paddingBottom: '16px', borderBottom: '1px solid var(--border-color)' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Selected Provider</span>
                  <h4 style={{ color: '#fff', fontSize: '16px', fontWeight: 600, marginTop: '4px' }}>{selectedDoctor.name}</h4>
                  <span style={{ fontSize: '13px', color: 'var(--accent-primary)' }}>{selectedDoctor.speciality}</span>
                </div>

                {loadingSlots ? (
                  <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
                    <span className="loading-spinner"></span>
                  </div>
                ) : slots.length === 0 ? (
                  <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)', fontSize: '14px' }}>
                    No availability slots registered for this doctor. Register new slots via the <strong>Admin Setup</strong> tab.
                  </div>
                ) : (
                  <div>
                    <span className="form-label">Choose Date & Time</span>
                    <div className="slots-grid">
                      {slots.map((slot) => (
                        <div
                          key={slot.id}
                          onClick={() => setSelectedSlot(slot)}
                          className={`slot-pill ${selectedSlot?.id === slot.id ? 'selected' : ''}`}
                        >
                          <div style={{ fontWeight: 600 }}>{slot.slot_time.substring(0, 5)}</div>
                          <div style={{ fontSize: '10px', opacity: 0.8, marginTop: '2px' }}>{slot.slot_date}</div>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={handleBook}
                      className="btn btn-primary"
                      style={{ width: '100%', marginTop: '32px' }}
                      disabled={bookingLoading || !selectedSlot}
                    >
                      {bookingLoading ? (
                        <>
                          <span className="loading-spinner"></span>
                          Claiming slot & sending email invite...
                        </>
                      ) : selectedSlot ? `Book Consultation for ${selectedSlot.slot_time.substring(0, 5)}` : 'Select a Slot to Book'}
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justify: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 0' }}>
                <Clock size={40} style={{ opacity: 0.15, marginBottom: '12px' }} />
                <p style={{ fontSize: '14px' }}>Please select a physician on the left to see their open schedules.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        /* My Bookings List */
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
            Booked Schedule Overview
          </h3>

          {loadingMyAppts ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '30px' }}>
              <span className="loading-spinner"></span>
            </div>
          ) : myAppointments.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-secondary)' }}>
              <p style={{ marginBottom: '16px', fontSize: '14px' }}>You do not have any appointments on record.</p>
              <button onClick={() => setActiveSubTab('book')} className="btn btn-primary btn-sm">
                Book consultation now
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {myAppointments.map((appt) => {
                // Find doctor name from doctors list if we have it loaded
                const doctorInfo = doctors.find(d => d.id === appt.doctor_id);
                return (
                  <div key={appt.id} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '16px 20px',
                    background: 'rgba(255, 255, 255, 0.02)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)'
                  }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600 }}>
                        Consultation with {doctorInfo ? doctorInfo.name : `Doctor ID: ${appt.doctor_id}`}
                      </h4>
                      {doctorInfo && (
                        <span style={{ fontSize: '12px', color: 'var(--accent-primary)', textTransform: 'uppercase', fontWeight: 500 }}>
                          {doctorInfo.speciality} | {doctorInfo.hospital}
                        </span>
                      )}
                      <div style={{ display: 'flex', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                        <span>Date: {appt.appointment_date}</span>
                        <span>Time: {appt.appointment_time}</span>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      <span className={`badge ${appt.status === 'Booked' ? 'badge-success' : 'badge-danger'}`}>
                        {appt.status}
                      </span>
                      {appt.status === 'Booked' && (
                        <button
                          onClick={() => handleCancel(appt.id)}
                          className="btn btn-secondary btn-sm"
                          style={{ borderColor: 'rgba(239, 68, 68, 0.3)', color: 'var(--danger)', padding: '6px 12px' }}
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
