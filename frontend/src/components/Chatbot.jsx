import React, { useState, useEffect, useRef } from 'react';
import { chatAPI } from '../services/api';
import { MessageSquare, Send, AlertTriangle, ShieldAlert } from 'lucide-react';

export const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [loading, setLoading] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [error, setError] = useState('');
  const messagesEndRef = useRef(null);

  // Load chat history
  useEffect(() => {
    const loadHistory = async () => {
      try {
        const history = await chatAPI.getHistory();
        setMessages(history);
      } catch (err) {
        console.error("Failed to load chat history", err);
        setError("Could not load chat history. Make sure Groq & Pinecone are set up.");
      } finally {
        setHistoryLoading(false);
      }
    };
    loadHistory();
  }, []);

  // Scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const userMessageText = inputText;
    setInputText('');
    setError('');

    // Optimistically add user message
    const tempUserMsg = {
      id: Date.now(),
      role: 'user',
      message: userMessageText,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempUserMsg]);
    setLoading(true);

    try {
      const response = await chatAPI.sendMessage(userMessageText);
      // Replace or append reply from backend
      setMessages((prev) => [...prev, response]);
    } catch (err) {
      console.error("Failed to send message", err);
      setError("AI assistant encountered an issue. Ensure your Groq API key is valid.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card chat-window">
      {/* Header */}
      <div style={{ padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ color: 'var(--accent-primary)' }}>
          <MessageSquare size={20} />
        </div>
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 600, color: '#fff' }}>Medical Assistant Bot</h3>
          <p style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>Powered by Llama 3.3 RAG Knowledge Base</p>
        </div>
      </div>

      {/* Messages Viewport */}
      <div className="chat-messages">
        {historyLoading ? (
          <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <span className="loading-spinner"></span>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flex: 1, flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)', padding: '20px' }}>
            <MessageSquare size={48} style={{ opacity: 0.15, marginBottom: '16px' }} />
            <p style={{ fontSize: '14px', textAlign: 'center', maxWidth: '350px' }}>
              Hello! I am your AI Health Assistant. Ask me general health queries or describe what is on your mind.
            </p>
            <div className="chat-disclaimer" style={{ maxWidth: '400px', textAlign: 'center', marginTop: '24px' }}>
              <strong>Notice:</strong> This assistant is for informational purposes only. Do not use for emergency diagnoses.
            </div>
          </div>
        ) : (
          <>
            <div className="chat-disclaimer" style={{ maxWidth: '100%', marginBottom: '10px' }}>
              <strong>AI Disclaimer:</strong> I am an assistant, not a doctor. I cannot provide formal diagnoses. Suggesting Symptom Checker or Booking for serious concerns.
            </div>
            
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`chat-bubble ${msg.role === 'user' ? 'chat-bubble-user' : 'chat-bubble-ai'}`}
              >
                <div>{msg.message}</div>
                <span className="chat-timestamp">
                  {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </>
        )}

        {loading && (
          <div className="chat-bubble chat-bubble-ai" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ display: 'inline-block', width: '6px', height: '6px', backgroundColor: 'var(--text-secondary)', borderRadius: '50%', animation: 'spin 1s infinite linear' }}></span>
            <span>Thinking...</span>
          </div>
        )}

        {error && (
          <div className="chat-disclaimer" style={{ alignSelf: 'center', display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.2)', color: 'var(--danger)' }}>
            <ShieldAlert size={14} />
            <span>{error}</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <form onSubmit={handleSend} className="chat-input-area">
        <input
          type="text"
          className="chat-input"
          placeholder="Ask a medical question..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          disabled={loading || historyLoading}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{ width: '48px', height: '48px', padding: 0, borderRadius: '50%', flexShrink: 0 }}
          disabled={loading || historyLoading || !inputText.trim()}
        >
          <Send size={18} />
        </button>
      </form>
    </div>
  );
};
