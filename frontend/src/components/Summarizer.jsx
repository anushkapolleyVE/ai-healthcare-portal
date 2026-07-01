import React, { useState, useEffect, useRef } from 'react';
import { reportAPI } from '../services/api';
import { FileText, ShieldAlert, UploadCloud, Calendar, Clock, AlertCircle } from 'lucide-react';

export const Summarizer = () => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [history, setHistory] = useState([]);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);

  const loadHistory = async () => {
    try {
      const records = await reportAPI.getHistory();
      const sorted = [...records].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setHistory(sorted);
      if (sorted.length > 0 && !selectedRecord) {
        setSelectedRecord(sorted[0]);
      }
    } catch (err) {
      console.error("Failed to load report history", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setError('');
    if (file) {
      if (file.type !== 'application/pdf') {
        setError('Only PDF files are supported');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUploadSubmit = async (e) => {
    e.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError('');

    try {
      const result = await reportAPI.summarize(selectedFile);
      setSelectedRecord(result);
      setSelectedFile(null);
      await loadHistory();
    } catch (err) {
      console.error("Report summarization failed", err);
      const msg = err.response?.data?.detail || "AI model could not parse medical PDF. Ensure the PDF contains readable text and your Groq Key is valid.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="grid-2">
      {/* Left panel: PDF Upload & History List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <UploadCloud size={20} style={{ color: 'var(--accent-primary)' }} />
            Upload PDF Document
          </h3>

          <form onSubmit={handleUploadSubmit}>
            <div
              className="file-upload-zone"
              onClick={triggerFileInput}
              style={{ marginBottom: '20px' }}
            >
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                onChange={handleFileChange}
                accept="application/pdf"
                disabled={loading}
              />
              <FileText size={40} style={{ color: 'var(--accent-primary)', opacity: 0.8, margin: '0 auto 12px' }} />
              <strong style={{ display: 'block', color: '#fff', fontSize: '15px' }}>
                {selectedFile ? 'Change PDF File' : 'Select Medical Report PDF'}
              </strong>
              <p>Drag and drop or click to browse files</p>
              {selectedFile && (
                <div className="file-selected-name">
                  Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                </div>
              )}
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
              disabled={loading || !selectedFile}
            >
              {loading ? (
                <>
                  <span className="loading-spinner"></span>
                  Analyzing PDF text...
                </>
              ) : 'Summarize Report'}
            </button>
          </form>
        </div>

        {/* History of Report Summaries */}
        <div className="glass-card">
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff', marginBottom: '16px' }}>
            Summarized Documents
          </h3>

          {historyLoading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '20px' }}>
              <span className="loading-spinner"></span>
            </div>
          ) : history.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', fontSize: '14px', textAlign: 'center', padding: '10px 0' }}>
              Your summarized report history will appear here.
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
                    <span style={{ fontSize: '10px', color: 'var(--accent-primary)' }}>
                      PDF Summary
                    </span>
                  </div>
                  <div className="history-item-title">{item.filename}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right panel: Summary Details */}
      <div className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '20px', minHeight: '400px' }}>
        {selectedRecord ? (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px' }}>
              <div>
                <h2 style={{ fontSize: '18px', fontWeight: 600, color: '#fff', marginBottom: '4px' }}>
                  {selectedRecord.filename}
                </h2>
                <h3 style={{ fontSize: '13px', color: 'var(--text-secondary)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={14} />
                  Analyzed on {new Date(selectedRecord.created_at).toLocaleString()}
                </h3>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <strong style={{ fontSize: '13px', color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Summary & Next Steps
              </strong>
              <div className="report-summary-output">
                {selectedRecord.summary_text}
              </div>
            </div>

            <div className="chat-disclaimer" style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <span>
                Disclaimer: The AI summaries are generated using text extraction and should not be used as official medical statements. Please review with your doctor.
              </span>
            </div>
          </>
        ) : (
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justify: 'center', color: 'var(--text-secondary)', textAlign: 'center', padding: '40px 20px' }}>
            <FileText size={48} style={{ opacity: 0.15, marginBottom: '16px' }} />
            <h4 style={{ color: '#fff', marginBottom: '8px' }}>Select or Upload a PDF Report</h4>
            <p style={{ fontSize: '14px', maxWidth: '300px' }}>
              Upload lab results or hospital records on the left to display its summarized outline here.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
