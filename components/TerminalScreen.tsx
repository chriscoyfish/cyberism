'use client';

import React, { useEffect, useRef } from 'react';
import { BANNER_TITLE } from '@/lib/prompt';
import { Dna, Dice1 as Dice, AlertTriangle, Skull } from 'lucide-react';

export interface TurnMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  text: string;
  diceRolls?: string[];
  timestamp: number;
}

interface TerminalScreenProps {
  messages: TurnMessage[];
  isGenerating: boolean;
  isGameOver: boolean;
}

export function TerminalScreen({ messages, isGenerating, isGameOver }: TerminalScreenProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isGenerating]);

  // Helper to format narrative text with dialogue highlight and action markers
  const formatNarrationText = (content: string) => {
    // Split into paragraphs
    const lines = content.split('\n');

    return lines.map((line, idx) => {
      if (!line.trim()) {
        return <div key={idx} style={{ height: '8px' }} />;
      }

      // Hide choice lines if present in text (they are displayed in the Action Console buttons)
      if (/^\s*(?:\d+[\.\)]\s*)?\{([^}]+)\}/.test(line)) {
        return null;
      }
      if (/^\s*(?:(?:what|how|which|where)\b[^.\n]*\??|\*?\*?(?:potential actions|actions|choices|options):?\*?\*?)\s*$/i.test(line.trim())) {
        return null;
      }

      // Check for headers (e.g. ### Header or **Header**)
      if (line.startsWith('###') || line.startsWith('##') || line.startsWith('#')) {
        const cleanHeader = line.replace(/^#+\s*/, '');
        return (
          <h3
            key={idx}
            style={{
              color: 'var(--neon-cyan)',
              fontFamily: 'var(--font-display)',
              fontSize: '15px',
              margin: '12px 0 6px 0',
              letterSpacing: '0.05em',
            }}
          >
            {cleanHeader}
          </h3>
        );
      }

      // Check for item acquisition/inventory tags e.g. [ITEM_ACQUIRED: Heavy SMG] or [INVENTORY: +Item]
      if (/^\s*\[(?:ITEM_ACQUIRED|INVENTORY:\s*\+|ACQUIRED|OBTAINED|GAINED|LOOTED|FOUND|ITEM\s*ADDED):\s*([^\]]+)\]\s*$/i.test(line)) {
        const item = line.replace(/^.*?:\s*|\s*\]$/g, '');
        return (
          <div
            key={idx}
            className="animate-fade-in"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              margin: '6px 0',
              padding: '6px 12px',
              background: 'rgba(0, 240, 255, 0.12)',
              border: '1px solid var(--neon-cyan)',
              boxShadow: '0 0 10px var(--neon-cyan-glow)',
              borderRadius: '4px',
              color: 'var(--neon-cyan)',
              fontFamily: 'var(--font-hud)',
              fontSize: '13px',
              fontWeight: 700,
              letterSpacing: '0.05em',
            }}
          >
            <span>✚ ITEM ACQUIRED:</span>
            <span style={{ color: '#fff' }}>{item}</span>
          </div>
        );
      }

      // Check for dice roll annotations e.g. (Rolled d10...)
      if (/^\s*\([^)]*(?:roll|dice|d10|vs\s*dv|critical|success|fail)[^)]*\)\s*$/i.test(line)) {
        return (
          <div
            key={idx}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              margin: '6px 0',
              padding: '4px 10px',
              background: 'rgba(0, 255, 102, 0.1)',
              border: '1px solid rgba(0, 255, 102, 0.4)',
              borderRadius: '4px',
              color: 'var(--neon-green)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            <Dice size={13} />
            <span>{line.replace(/^\(|\)$/g, '')}</span>
          </div>
        );
      }

      // Standard text: Highlight quoted speech in green and curly actions in amber
      const styledSpans = line.split(/("[^"]*"|\{[^}]*\}|<[^>]*>)/g).map((part, pIdx) => {
        if (part.startsWith('"') && part.endsWith('"')) {
          return (
            <span key={pIdx} style={{ color: '#86efac', fontWeight: 500, fontStyle: 'italic' }}>
              {part}
            </span>
          );
        }
        if (part.startsWith('{') && part.endsWith('}')) {
          return (
            <span key={pIdx} style={{ color: 'var(--neon-amber)', fontWeight: 600 }}>
              {part}
            </span>
          );
        }
        if (part.startsWith('<') && part.endsWith('>')) {
          return (
            <span key={pIdx} style={{ color: '#93c5fd', fontStyle: 'italic' }}>
              {part}
            </span>
          );
        }
        return <span key={pIdx}>{part}</span>;
      });

      return (
        <p key={idx} style={{ marginBottom: '8px', lineHeight: '1.65', color: 'var(--text-primary)' }}>
          {styledSpans}
        </p>
      );
    });
  };

  return (
    <div
      suppressHydrationWarning
      className="terminal-screen-container"
      style={{
        flex: 1,
        overflowY: 'auto',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        background: 'radial-gradient(ellipse at top, rgba(14, 20, 32, 0.5) 0%, rgba(7, 9, 14, 0.9) 100%)',
      }}
    >
      {/* ASCII Retro Title Banner */}
      <pre
        className="ascii-banner-pre"
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: '11px',
          color: 'var(--neon-cyan)',
          lineHeight: '1.2',
          userSelect: 'none',
          whiteSpace: 'pre-wrap',
          marginBottom: '10px',
          textShadow: '0 0 6px var(--neon-cyan-glow)',
          borderBottom: '1px dashed rgba(0, 240, 255, 0.3)',
          paddingBottom: '14px',
        }}
      >
        {BANNER_TITLE}
      </pre>

      {/* Messages */}
      {messages.map((msg) => {
        const isUser = msg.role === 'user';
        const isModel = msg.role === 'model';
        const isSys = msg.role === 'system';

        return (
          <div
            key={msg.id}
            className="animate-fade-in"
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              padding: isUser ? '12px 16px' : '16px 20px',
              borderRadius: '6px',
              background: isUser
                ? 'rgba(30, 41, 59, 0.6)'
                : isModel
                ? 'rgba(15, 23, 42, 0.75)'
                : 'rgba(255, 0, 85, 0.1)',
              border: isUser
                ? '1px solid rgba(0, 240, 255, 0.3)'
                : isModel
                ? '1px solid rgba(255, 255, 255, 0.08)'
                : '1px solid rgba(255, 0, 85, 0.4)',
              borderLeft: isUser
                ? '4px solid var(--neon-cyan)'
                : isModel
                ? '4px solid var(--neon-green)'
                : '4px solid var(--neon-crimson)',
              boxShadow: isUser
                ? '0 2px 10px rgba(0, 240, 255, 0.05)'
                : '0 4px 16px rgba(0, 0, 0, 0.4)',
            }}
          >
            {/* Sender Label */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              fontSize: '11px',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
              letterSpacing: '0.08em',
            }}>
              <span style={{
                color: isUser ? 'var(--neon-cyan)' : isModel ? 'var(--neon-green)' : 'var(--neon-crimson)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                {isUser ? '▶ OPERATIVE SENNA' : isModel ? '◈ NIGHT CITY GAME MASTER' : '⚠ SYSTEM DIRECTIVE'}
              </span>
              <span style={{ color: 'var(--text-muted)', fontSize: '10px', fontFamily: 'var(--font-mono)' }}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              </span>
            </div>

            {/* Content Body */}
            <div style={{ fontSize: '14px' }}>
              {isUser ? (
                <div style={{ color: '#fff', fontWeight: 500 }}>{msg.text}</div>
              ) : (
                formatNarrationText(msg.text)
              )}
            </div>
          </div>
        );
      })}

      {/* Generating Spinner */}
      {isGenerating && (
        <div
          className="animate-fade-in"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 16px',
            background: 'rgba(15, 23, 42, 0.75)',
            borderLeft: '4px solid var(--neon-amber)',
            borderRadius: '4px',
            color: 'var(--neon-amber)',
            fontFamily: 'var(--font-hud)',
            fontSize: '14px',
            fontWeight: 600,
          }}
        >
          <div style={{
            width: '14px',
            height: '14px',
            border: '2px solid var(--neon-amber)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <span>NEURAL REFEREE COMPUTING TURN...</span>
        </div>
      )}

      {/* Game Over Banner */}
      {isGameOver && (
        <div
          className="animate-fade-in"
          style={{
            margin: '20px 0',
            padding: '20px',
            background: 'rgba(255, 0, 85, 0.15)',
            border: '2px solid var(--neon-crimson)',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 0 30px var(--neon-crimson-glow)',
          }}
        >
          <Skull size={36} color="var(--neon-crimson)" style={{ margin: '0 auto 8px auto' }} />
          <h2 style={{
            fontFamily: 'var(--font-display)',
            fontSize: '24px',
            color: 'var(--neon-crimson)',
            letterSpacing: '0.15em',
            marginBottom: '6px',
          }}>
            FLATLINED // GAME OVER
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            Senna Bladesmith has become another ghost in the Night City datashards.
          </p>
        </div>
      )}

      <div ref={bottomRef} />

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
