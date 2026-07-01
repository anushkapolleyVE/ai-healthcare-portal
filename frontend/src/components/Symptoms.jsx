import React, { useState, useEffect } from 'react';
import { symptomAPI } from '../services/api';
import { Activity, ShieldAlert, Heart, Calendar, Clock } from 'lucide-react';

export const Symptoms = () => {
  const [symptomsInput, setSymptomsInput] = useState('');
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');

  // Load symptom checks history
  const loadHistory = async () => {
    try {
      const records = await symptomAPI.getHistory();
      // sort latest first
      const sorted = [...records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistory(sorted);
      if (sorted.length > 0 && !selectedRecord) {
        setSelectedRecord(sorted[0]);
      }
    } catch (err) {
      console.error("Failed to load symptom history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!symptomsInput.trim()) return;

    setLoading(true);
    setError('');

    try {
      const result = await symptomAPI.check(symptomsInput);
      setSelectedRecord(result);
      setSymptomsInput('');
      await loadHistory();
    } catch (err) {
      console.error("Symptom check failed", err);
      setError("AI model could not process symptom check. Verify your Groq Key.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to extract urgency level (non-diagnostic estimation based on content keywords)
  const getUrgency = (text) => {
    if (!text) return 'low';
    const lower = text.toLowerCase();
    if (lower.includes('emergency') || lower.includes('immediate') || lower.includes('urgent care') || lower.includes('911') || lower.includes('chest pain') || lower.includes('breathing')) {
      return 'high';
    }
    if (lower.includes('should see') || lower.includes('recommend a doctor') || lower.includes('consult a doctor soon')) {
      return 'medium';
    }
    return 'low';
  };

  const currentUrgency = selectedRecord ? getUrgency(selectedRecord.ai_response) : 'low';

  return (
    <div className="grid-2">
      {/* Left panel: Form and history lists */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Activity size={20} style={{ color: 'var(--accent-primary)' }} />
            New Symptom Evaluation
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="symptoms">Describe how you are feeling</label>
              <textarea
                id="symptoms"
                className="form-input"
                style={{ height: '120px', resize: 'none', lineHeight: '1.5' }}
                placeholder="Example: I have had a mild headache and throat irritation for 2 days. No breathing difficulties, but feeling fatigued."
                value={symptomsInput}
                onChange={(e) => setSymptomsInput(e.target.value)}
                required
                disabled={loading}
              />
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '8px', display: 'block' }}>
                Please be specific. Describe symptoms, durations, and if any pain is severe.
              </span>
            </div>

            {error && (
              <div className="chat-disclaimer" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16, color: 'var(--danger)', background: 'rgba(239, 68, 68, 0.1)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                <ShieldAlert size={16} />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%' }}
              disabled={loading || !symptomsInput.trim()}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing symptoms...
                </>
              ) : 'Analyze Symptoms'}
            </button>
          </form>
        </div>

        {/* History list */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Past Evaluations
          </h3>

          {historyLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <span className="loading-spinner"></span>
            </div>
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '10px 0' }}>
              Your past evaluations will show up here.
            </p>
          ) : (
            <div className="history-list">
              {history.map((item) => (
                <div
                  key={item.id}
                  onClick={() => setSelectedRecord(item)}
                  className={`history-item ${selectedRecord?.id === item.id ? 'active' : ''}`}
                >
                  <div className="history-item-header">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} />
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ textTransform: 'uppercase', fontSize: '10px', color: getUrgency(item.ai_response) === 'high' ? 'var(--danger)' : getUrgency(item.ai_response) === 'medium' ? 'var(--warning)' : 'var(--success)' }}>
                      {getUrgency(item.ai_response)} priority
                    </span>
                  </div>
                  <div className="history-item-title">{item.symptoms_text}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Details of selected check */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '400px' }}>
        {selectedRecord ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <span className={`urgency-badge urgency-${currentUrgency}`}>
                  Est. Urgency: {currentUrgency}
                </span>
                <h3 style={{ fontSize: '16px', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  Checked on {new Date(selectedRecord.created_at).toLocaleString()}
                </h3>
              </div>
            </div>

            <div style={{ padding: '16px', background: 'rgba(255, 255, 255, 0.02)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ fontSize: '13px', color: 'var(--accent-primary)', display: 'block', marginBottom: '6px', textTransform: 'uppercase' }}>
                Your Description
              </strong>
              <p style={{ fontStyle: 'italic', fontSize: '14px', color: 'var(--text-primary)', lineHeight: 1.5 }}>
                "{selectedRecord.symptoms_text}"
              </p>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--accent-primary)', textTransform: 'uppercase' }}>
                AI Assistant Review
              </strong>
              <div className="symptom-output">
                {selectedRecord.ai_response}
              </div>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justify: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 20px' }}>
            <Heart size={48} style={{ opacity: 0.15, marginBottom: '16px' }} />
            <h4 style={{ color: '#fff', marginBottom: '8px' }}>Select or Run an Evaluation</h4>
            <p style={{ fontSize: '14px', maxWidth: '300px' }}>
              Submit symptoms on the left to see the AI analysis here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
