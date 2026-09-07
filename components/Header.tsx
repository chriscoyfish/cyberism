'use client';

import React from 'react';
import { Shield, Volume2, VolumeX, Monitor, Save, User, LogOut, RotateCcw, Activity } from 'lucide-react';
import { sound } from '@/lib/audio';
import { CharacterStats } from './CharacterDossier';

interface HeaderProps {
  user: { id: string; username: string } | null;
  turnCount: number;
  stats: CharacterStats;
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;
  crtEnabled: boolean;
  setCrtEnabled: (val: boolean) => void;
  onOpenSaveModal: () => void;
  onOpenAuthModal: () => void;
  onLogout: () => void;
  onNewGame: () => void;
  isGenerating: boolean;
  onToggleDossierMobile: () => void;
}

export function Header({
  user,
  turnCount,
  stats,
  soundEnabled,
  setSoundEnabled,
  crtEnabled,
  setCrtEnabled,
  onOpenSaveModal,
  onOpenAuthModal,
  onLogout,
  onNewGame,
  isGenerating,
  onToggleDossierMobile,
}: HeaderProps) {
  return (
    <header
      suppressHydrationWarning
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '10px 16px',
        borderBottom: '1px solid rgba(0, 240, 255, 0.25)',
        background: 'rgba(7, 9, 14, 0.95)',
        backdropFilter: 'blur(10px)',
        position: 'relative',
        zIndex: 100,
        flexWrap: 'wrap',
        gap: '8px',
      }}
    >
      {/* Left: Game Title & Terminal Link Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Shield size={18} color="var(--neon-cyan)" />
          <h1
            className="header-title-text"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: '17px',
              fontWeight: 800,
              letterSpacing: '0.12em',
              color: 'var(--neon-cyan)',
              textShadow: '0 0 10px var(--neon-cyan-glow)',
            }}
          >
            CYBERISM
          </h1>
          <span
            style={{
              fontSize: '10px',
              background: 'rgba(0, 240, 255, 0.1)',
              color: 'var(--neon-cyan)',
              padding: '2px 5px',
              border: '1px solid rgba(0, 240, 255, 0.3)',
              borderRadius: '2px',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}
          >
            V2.0
          </span>
        </div>

        {/* Status Indicator */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: 'var(--text-secondary)' }}>
          <span
            style={{
              width: '7px',
              height: '7px',
              borderRadius: '50%',
              backgroundColor: isGenerating ? 'var(--neon-amber)' : 'var(--neon-green)',
              boxShadow: isGenerating ? '0 0 8px var(--neon-amber)' : '0 0 8px var(--neon-green)',
              display: 'inline-block',
            }}
          />
          <span className="header-btn-text">{isGenerating ? 'COMPUTE' : 'NETLINK'}</span>
        </div>
      </div>

      {/* Center: Turn Counter & Character Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          fontFamily: 'var(--font-hud)',
          fontSize: '13px',
          fontWeight: 600,
        }}
      >
        <div
          className="header-operative-badge"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '3px 10px',
            border: '1px solid rgba(255, 170, 0, 0.3)',
            borderRadius: '4px',
            color: 'var(--neon-amber)',
          }}
        >
          SENNA BLADESMITH
        </div>
        <div
          className="header-turn-badge"
          style={{
            background: 'rgba(15, 23, 42, 0.8)',
            padding: '3px 10px',
            border: '1px solid rgba(0, 240, 255, 0.3)',
            borderRadius: '4px',
            color: 'var(--text-secondary)',
          }}
        >
          TURN <span style={{ color: 'var(--neon-cyan)', fontWeight: 700 }}>{turnCount}</span>
        </div>

        {/* Mobile / Tablet Dossier Button */}
        <button
          className="cyber-btn cyber-btn-amber"
          style={{ padding: '4px 8px', fontSize: '12px' }}
          onClick={() => {
            sound.playKeyClick();
            onToggleDossierMobile();
          }}
          title="Toggle Character Dossier & Vitals"
        >
          <Activity size={13} />
          <span className="header-btn-text">VITALS ({stats.hp}/{stats.maxHp})</span>
          <span style={{ display: 'inline', fontSize: '11px' }}>HP:{stats.hp}</span>
        </button>
      </div>

      {/* Right: Controls & User Profile */}
      <div className="header-controls" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {/* CRT Scanlines Toggle */}
        <button
          className="cyber-btn"
          title="Toggle CRT Retro Filter"
          style={{ padding: '6px 9px', fontSize: '12px' }}
          onClick={() => {
            setCrtEnabled(!crtEnabled);
            sound.playKeyClick();
          }}
        >
          <Monitor size={14} />
          <span className="header-btn-text">{crtEnabled ? 'CRT' : 'NO CRT'}</span>
        </button>

        {/* Audio FX Toggle */}
        <button
          className="cyber-btn"
          title="Toggle Sound Effects"
          style={{ padding: '6px 9px', fontSize: '12px' }}
          onClick={() => {
            const next = !soundEnabled;
            setSoundEnabled(next);
            sound.enabled = next;
            if (next) sound.playTerminalBeep();
          }}
        >
          {soundEnabled ? <Volume2 size={14} /> : <VolumeX size={14} />}
        </button>

        {/* Save/Load Button */}
        <button
          className="cyber-btn cyber-btn-amber"
          style={{ padding: '6px 10px', fontSize: '12px' }}
          onClick={() => {
            sound.playKeyClick();
            onOpenSaveModal();
          }}
          title="Save & Load Game Matrix"
        >
          <Save size={13} />
          <span className="header-btn-text">SAVE/LOAD</span>
        </button>

        {/* New Game Button */}
        <button
          className="cyber-btn cyber-btn-crimson"
          style={{ padding: '6px 10px', fontSize: '12px' }}
          onClick={() => {
            sound.playKeyClick();
            onNewGame();
          }}
          title="Reboot / New Run"
        >
          <RotateCcw size={13} />
          <span className="header-btn-text">REBOOT</span>
        </button>

        {/* Auth / Account Profile */}
        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div
              style={{
                background: 'rgba(0, 255, 102, 0.1)',
                border: '1px solid rgba(0, 255, 102, 0.4)',
                color: 'var(--neon-green)',
                padding: '4px 8px',
                borderRadius: '4px',
                fontSize: '11px',
                fontFamily: 'var(--font-hud)',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <User size={12} />
              <span className="header-btn-text">{user.username.toUpperCase()}</span>
            </div>
            <button
              className="cyber-btn"
              title="Disconnect / Logout"
              style={{ padding: '5px 7px' }}
              onClick={onLogout}
            >
              <LogOut size={12} />
            </button>
          </div>
        ) : (
          <button
            className="cyber-btn cyber-btn-green"
            style={{ padding: '6px 10px', fontSize: '12px' }}
            onClick={() => {
              sound.playKeyClick();
              onOpenAuthModal();
            }}
            title="Agent Login / Register"
          >
            <User size={13} />
            <span className="header-btn-text">LOGIN</span>
          </button>
        )}
      </div>
    </header>
  );
}
