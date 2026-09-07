'use client';

import React, { useState } from 'react';
import { X, Lock, User, UserPlus, LogIn, AlertCircle } from 'lucide-react';
import { sound } from '@/lib/audio';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (user: { id: string; username: string }) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        sound.playError();
        setError(data.error || 'Authentication handshake rejected.');
      } else {
        sound.playTerminalBeep();
        onSuccess(data.user);
        onClose();
      }
    } catch {
      sound.playError();
      setError('Neural netlink failed to connect to auth mainframe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div
        className="cyber-panel animate-fade-in"
        style={{
          width: '400px',
          border: '1px solid var(--neon-cyan)',
          boxShadow: '0 0 30px var(--neon-cyan-glow)',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
            borderBottom: '1px solid rgba(0, 240, 255, 0.2)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            background: 'rgba(15, 23, 42, 0.85)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={16} color="var(--neon-cyan)" />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '15px',
                letterSpacing: '0.08em',
                color: '#fff',
              }}
            >
              {isRegister ? 'OPERATIVE REGISTRATION' : 'AGENT AUTHENTICATION'}
            </h2>
          </div>
          <button
            onClick={() => {
              sound.playKeyClick();
              onClose();
            }}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {error && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                background: 'rgba(255, 0, 85, 0.15)',
                border: '1px solid var(--neon-crimson)',
                borderRadius: '4px',
                color: 'var(--neon-crimson)',
                fontSize: '12px',
              }}
            >
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-hud)', color: 'var(--neon-cyan)', marginBottom: '4px', fontWeight: 700 }}>
              OPERATIVE HANDLE / USERNAME
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '4px', padding: '6px 10px' }}>
              <User size={14} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="e.g. bladesmith_v"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  width: '100%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '11px', fontFamily: 'var(--font-hud)', color: 'var(--neon-cyan)', marginBottom: '4px', fontWeight: 700 }}>
              SECURITY CIPHER / PASSWORD
            </label>
            <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(15, 23, 42, 0.9)', border: '1px solid rgba(0, 240, 255, 0.3)', borderRadius: '4px', padding: '6px 10px' }}>
              <Lock size={14} color="var(--text-muted)" style={{ marginRight: '8px' }} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  width: '100%',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="cyber-btn cyber-btn-green"
            style={{ width: '100%', padding: '10px', marginTop: '6px' }}
          >
            {isRegister ? <UserPlus size={15} /> : <LogIn size={15} />}
            <span>{loading ? 'AUTHENTICATING...' : isRegister ? 'INITIALIZE OPERATIVE PROFILE' : 'CONNECT TO MAINFRAME'}</span>
          </button>

          {/* Switch Register/Login */}
          <div style={{ textAlign: 'center', marginTop: '4px' }}>
            <button
              type="button"
              onClick={() => {
                sound.playKeyClick();
                setIsRegister(!isRegister);
                setError(null);
              }}
              style={{
                background: 'transparent',
                border: 'none',
                color: 'var(--text-cyan)',
                fontSize: '12px',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              {isRegister
                ? 'Already have an operative cipher? Log In'
                : 'Need a new operative profile? Register'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
