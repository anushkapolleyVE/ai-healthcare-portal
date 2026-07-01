import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import { Settings, ShieldCheck, ShieldAlert, AlertTriangle, Key } from 'lucide-react';

export const ProfileSettings = () => {
  const { user, updateProfile, deleteAccount, error: authError } = useAuth();
  
  // Profile edit fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [dob, setDob] = useState('');
  const [gender, setGender] = useState('Male');
  const [address, setAddress] = useState('');
  
  // Password edit fields
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);
  
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setDob(user.date_of_birth || '');
      setGender(user.gender || 'Male');
      setAddress(user.address || '');
    }
  }, [user]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    setLoadingProfile(true);

    try {
      await updateProfile({
        name,
        email,
        phone: phone || null,
        date_of_birth: dob || null,
        gender: gender || null,
        address: address || null
      });
      setSuccess("Profile settings updated successfully!");
    } catch (err) {
      console.error("Update failed", err);
      setError(err.message || "Failed to update profile.");
    } finally {
      setLoadingProfile(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setSuccess('');
    setError('');
    if (!oldPassword || !newPassword) {
      setError("Please fill in old and new password fields.");
      return;
    }
    setLoadingPassword(true);

    try {
      await authAPI.changePassword(oldPassword, newPassword);
      setSuccess("Password updated successfully!");
      setOldPassword('');
      setNewPassword('');
    } catch (err) {
      console.error("Password update failed", err);
      setError(err.response?.data?.detail || "Old password incorrect.");
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm("WARNING: Are you absolutely sure you want to delete your account? This action is permanent and cannot be undone.")) {
      return;
    }
    setError('');
    try {
      await deleteAccount();
    } catch (err) {
      console.error("Delete failed", err);
      setError("Failed to delete account.");
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
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
          <ShieldCheck size={18} />
          <span>{success}</span>
        </div>
      )}

      {(error || authError) && (
        <div className="chat-disclaimer" style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
          <ShieldAlert size={16} />
          <span>{error || authError}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Personal Details Form */}
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Settings size={18} style={{ color: 'var(--accent-primary)' }} />
            Personal Details
          </h3>

          <form onSubmit={handleUpdateProfile}>
            <div className="form-group">
              <label className="form-label" htmlFor="name">Full Name</label>
              <input
                id="name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                className="form-input"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="grid-2" style={{ gap: '16px', marginBottom: 0 }}>
              <div className="form-group">
                <label className="form-label" htmlFor="phone">Phone Number</label>
                <input
                  id="phone"
                  type="tel"
                  className="form-input"
                  placeholder="+1 (555) 019-2834"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="gender">Gender</label>
                <select
                  id="gender"
                  className="form-select"
                  value={gender}
                  onChange={(e) => setGender(e.target.value)}
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="dob">Date of Birth</label>
              <input
                id="dob"
                type="date"
                className="form-input"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="address">Residential Address</label>
              <input
                id="address"
                type="text"
                className="form-input"
                placeholder="123 Health Ave, Medical City"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loadingProfile}
            >
              {loadingProfile ? <span className="loading-spinner"></span> : 'Update Profile Info'}
            </button>
          </form>
        </div>

        {/* Security & Danger Zone */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* Change Password */}
          <div className="glass-card">
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Key size={18} style={{ color: 'var(--accent-primary)' }} />
              Security Settings
            </h3>

            <form onSubmit={handleChangePassword}>
              <div className="form-group">
                <label className="form-label" htmlFor="oldPassword">Current Password</label>
                <input
                  id="oldPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="newPassword">New Password</label>
                <input
                  id="newPassword"
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '16px' }}
                disabled={loadingPassword}
              >
                {loadingPassword ? <span className="loading-spinner"></span> : 'Update Password'}
              </button>
            </form>
          </div>

          {/* Delete Account */}
          <div className="glass-card" style={{ border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            <h3 style={{ fontSize: '18px', fontWeight: 600, color: 'var(--danger)', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={18} />
              Danger Zone
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '20px', lineHeight: 1.4 }}>
              Deleting your account will purge all chat histories, symptom files, appointments, and credentials from the system database. This is permanent.
            </p>
            <button
              onClick={handleDeleteAccount}
              className="btn btn-danger"
              style={{ width: '100%' }}
            >
              Delete Account Permanently
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
