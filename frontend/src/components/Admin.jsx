import React, { useState, useEffect } from 'react';
import { doctorAPI } from '../services/api';
import { PlusCircle, Award, Calendar, CheckCircle, ShieldAlert } from 'lucide-react';

export const Admin = () => {
  // Doctor form state
  const [docName, setDocName] = useState('');
  const [docEmail, setDocEmail] = useState('');
  const [docSpeciality, setDocSpeciality] = useState('Cardiologist');
  const [docQualification, setDocQualification] = useState('');
  const [docExperience, setDocExperience] = useState(5);
  const [docHospital, setDocHospital] = useState('');

  // Slot form state
  const [selectedDocId, setSelectedDocId] = useState('');
  const [slotDate, setSlotDate] = useState('');
  const [slotTime, setSlotTime] = useState('09:00');

  const [doctors, setDoctors] = useState([]);
  const [loadingDoctors, setLoadingDoctors] = useState(true);
  const [submittingDoc, setSubmittingDoc] = useState(false);
  const [submittingSlot, setSubmittingSlot] = useState(false);

  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const specialties = [
    'Cardiologist',
    'Dermatologist',
    'Neurologist',
    'Pediatrician',
    'General Physician',
    'Orthopedic',
    'Gynecologist'
  ];

  const times = [
    '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
  ];

  const loadDoctors = async () => {
    setLoadingDoctors(true);
    try {
      const data = await doctorAPI.list();
      setDoctors(data);
      if (data.length > 0) {
        setSelectedDocId(data[0].id.toString());
      }
    } catch (err) {
      console.error("Failed to load doctors", err);
    } finally {
      setLoadingDoctors(false);
    }
  };

  useEffect(() => {
    loadDoctors();
    // Default slot date to tomorrow
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    setSlotDate(tomorrow.toISOString().split('T')[0]);
  }, []);

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!docName || !docEmail || !docQualification || !docHospital) {
      setError('Please fill in all doctor details');
      return;
    }
    setSubmittingDoc(true);

    try {
      const newDoc = await doctorAPI.createDoctor({
        name: docName,
        email: docEmail,
        speciality: docSpeciality,
        qualification: docQualification,
        experience: parseInt(docExperience),
        hospital: docHospital
      });
      setSuccess(`Doctor ${newDoc.name} registered successfully!`);
      // Reset form
      setDocName('');
      setDocEmail('');
      setDocQualification('');
      setDocHospital('');
      await loadDoctors();
    } catch (err) {
      console.error("Failed to register doctor", err);
      setError(err.response?.data?.detail || 'Registration failed. Email might already exist.');
    } finally {
      setSubmittingDoc(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!selectedDocId || !slotDate || !slotTime) {
      setError('Please select a doctor, date and time slot');
      return;
    }
    setSubmittingSlot(true);

    try {
      await doctorAPI.createSlot({
        doctor_id: parseInt(selectedDocId),
        slot_date: slotDate,
        slot_time: `${slotTime}:00` // backend expects HH:MM:SS format or similar
      });
      setSuccess(`Slot successfully registered for ${slotDate} at ${slotTime}!`);
    } catch (err) {
      console.error("Failed to add slot", err);
      setError(err.response?.data?.detail || 'Failed to register availability slot.');
    } finally {
      setSubmittingSlot(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="glass-card" style={{ padding: '20px 24px', borderLeft: '4px solid var(--accent-primary)' }}>
        <h4 style={{ color: '#fff', fontSize: '15px', fontWeight: 600, marginBottom: '6px' }}>Demo System Seeder Tool</h4>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: 1.4 }}>
          Since this is a new local healthcare environment, use these helper modules to add dummy Doctors and Availability Schedules. You can then toggle back to the <strong>Appointments</strong> panel to book consultations.
        </p>
      </div>

      {success && (
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
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="chat-disclaimer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <ShieldAlert size={16} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Register Doctor */}
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Award size={18} style={{ color: 'var(--accent-primary)' }} />
            Add Doctor to Registry
          </h3>

          <form onSubmit={handleAddDoctor}>
            <div className="form-group">
              <label className="form-label" htmlFor="docName">Full Name</label>
              <input
                id="docName"
                type="text"
                className="form-input"
                placeholder="Dr. Sarah Jenkins"
                value={docName}
                onChange={(e) => setDocName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="docEmail">Doctor Email</label>
              <input
                id="docEmail"
                type="email"
                className="form-input"
                placeholder="sarah.jenkins@hospital.com"
                value={docEmail}
                onChange={(e) => setDocEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid-2" style={{ gap: '16px', marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="speciality">Speciality</label>
                <select
                  id="speciality"
                  className="form-select"
                  value={docSpeciality}
                  onChange={(e) => setDocSpeciality(e.target.value)}
                >
                  {specialties.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="experience">Years of Experience</label>
                <input
                  id="experience"
                  type="number"
                  className="form-input"
                  min="1"
                  max="50"
                  value={docExperience}
                  onChange={(e) => setDocExperience(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="qualification">Qualifications</label>
              <input
                id="qualification"
                type="text"
                className="form-input"
                placeholder="MD, FACC"
                value={docQualification}
                onChange={(e) => setDocQualification(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="hospital">Hospital affiliation</label>
              <input
                id="hospital"
                type="text"
                className="form-input"
                placeholder="City General Medical Center"
                value={docHospital}
                onChange={(e) => setDocHospital(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={submittingDoc}
            >
              {submittingDoc ? <span className="loading-spinner"></span> : 'Add Doctor'}
            </button>
          </form>
        </div>

        {/* Schedule Slots */}
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Calendar size={18} style={{ color: 'var(--accent-primary)' }} />
            Create Availability Slot
          </h3>

          <form onSubmit={handleAddSlot}>
            <div className="form-group">
              <label className="form-label" htmlFor="doctor_id">Select Doctor</label>
              {loadingDoctors ? (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--text-secondary)' }}>
                  Loading doctors list...
                </div>
              ) : doctors.length === 0 ? (
                <div style={{ padding: '12px', background: 'rgba(255,255,255,0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', color: 'var(--danger)' }}>
                  Please register a doctor first!
                </div>
              ) : (
                <select
                  id="doctor_id"
                  className="form-select"
                  value={selectedDocId}
                  onChange={(e) => setSelectedDocId(e.target.value)}
                >
                  {doctors.map(d => <option key={d.id} value={d.id}>{d.name} ({d.speciality})</option>)}
                </select>
              )}
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="slot_date">Slot Date</label>
              <input
                id="slot_date"
                type="date"
                className="form-input"
                value={slotDate}
                onChange={(e) => setSlotDate(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="slot_time">Slot Time</label>
              <select
                id="slot_time"
                className="form-select"
                value={slotTime}
                onChange={(e) => setSlotTime(e.target.value)}
              >
                {times.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '32px' }}
              disabled={submittingSlot || doctors.length === 0}
            >
              {submittingSlot ? <span className="loading-spinner"></span> : 'Register Availability Slot'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
