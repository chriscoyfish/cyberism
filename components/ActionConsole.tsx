'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Send, CornerDownLeft, Sparkles, MessageSquare, Flame, HelpCircle } from 'lucide-react';
import { sound } from '@/lib/audio';

interface ActionConsoleProps {
  choices: string[];
  onSubmitAction: (actionText: string) => void;
  disabled: boolean;
}

export function ActionConsole({ choices, onSubmitAction, disabled }: ActionConsoleProps) {
  const [inputText, setInputText] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut listener for numbers 1 to 5
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input field
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') {
        return;
      }

      if (disabled) return;

      const num = parseInt(e.key, 10);
      if (!isNaN(num) && num >= 1 && num <= choices.length) {
        e.preventDefault();
        const selected = choices[num - 1];
        sound.playTerminalBeep();
        onSubmitAction(`{${selected}}`);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [choices, disabled, onSubmitAction]);

  const handleSend = () => {
    if (!inputText.trim() || disabled) return;
    sound.playTerminalBeep();
    onSubmitAction(inputText.trim());
    setInputText('');
  };

  const handleInsertSyntax = (wrapType: 'quotes' | 'braces' | 'angles') => {
    sound.playKeyClick();
    if (wrapType === 'quotes') {
      setInputText((prev) => (prev ? `"${prev}"` : '""'));
    } else if (wrapType === 'braces') {
      setInputText((prev) => (prev ? `{${prev}}` : '{}'));
    } else if (wrapType === 'angles') {
      setInputText((prev) => (prev ? `<${prev}>` : '<>'));
    }
    inputRef.current?.focus();
  };

  return (
    <div
      suppressHydrationWarning
      className="action-console-container"
      style={{
        borderTop: '1px solid rgba(0, 240, 255, 0.25)',
        background: 'rgba(10, 14, 22, 0.95)',
        backdropFilter: 'blur(10px)',
        padding: '14px 20px',
        display: 'flex',
        flexDirection: 'column',
        gap: '10px',
      }}
    >
      {/* 5 Dynamic Choice Deck */}
      {choices.length > 0 && (
        <div>
          <div
            style={{
              fontSize: '11px',
              fontFamily: 'var(--font-hud)',
              color: 'var(--neon-cyan)',
              letterSpacing: '0.08em',
              fontWeight: 700,
              marginBottom: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>TACTICAL ACTION CHOICES (PRESS 1-{choices.length} OR TAP)</span>
            <span style={{ color: 'var(--text-muted)', fontSize: '10px' }}>AI OPTIONS</span>
          </div>

          <div
            className="action-deck-grid"
            style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '6px' }}
          >
            {choices.map((choice, idx) => (
              <button
                key={idx}
                disabled={disabled}
                onClick={() => {
                  sound.playTerminalBeep();
                  onSubmitAction(`{${choice}}`);
                }}
                className="cyber-btn"
                style={{
                  justifyContent: 'flex-start',
                  textAlign: 'left',
                  padding: '8px 12px',
                  fontSize: '13px',
                  lineHeight: '1.4',
                  textTransform: 'none',
                  background: 'rgba(15, 23, 42, 0.85)',
                  border: '1px solid rgba(0, 240, 255, 0.3)',
                  whiteSpace: 'normal',
                  height: 'auto',
                }}
              >
                <span
                  style={{
                    background: 'rgba(0, 240, 255, 0.2)',
                    color: 'var(--neon-cyan)',
                    padding: '2px 7px',
                    borderRadius: '3px',
                    fontFamily: 'var(--font-display)',
                    fontWeight: 700,
                    fontSize: '12px',
                    marginRight: '6px',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-mono)' }}>
                  {choice}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Syntax Quick Buttons */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
        <span style={{ fontSize: '11px', fontFamily: 'var(--font-hud)', color: 'var(--text-muted)', fontWeight: 600 }}>
          SYNTAX HELPERS:
        </span>
        <button
          className="cyber-btn"
          disabled={disabled}
          onClick={() => handleInsertSyntax('quotes')}
          style={{ padding: '3px 8px', fontSize: '11px' }}
          title='Dialogue: "Say something to an NPC"'
        >
          <MessageSquare size={11} />
          "SPEECH"
        </button>
        <button
          className="cyber-btn cyber-btn-amber"
          disabled={disabled}
          onClick={() => handleInsertSyntax('braces')}
          style={{ padding: '3px 8px', fontSize: '11px' }}
          title='Custom Action: {Hack the terminal / Draw pistol}'
        >
          <Flame size={11} />
          &#123;ACTION&#125;
        </button>
        <button
          className="cyber-btn"
          disabled={disabled}
          onClick={() => handleInsertSyntax('angles')}
          style={{ padding: '3px 8px', fontSize: '11px' }}
          title='Out of Character: <Ask Referee a rules question>'
        >
          <HelpCircle size={11} />
          &lt;OOC / RULES&gt;
        </button>
      </div>

      {/* Main Terminal Input Line */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'rgba(15, 23, 42, 0.95)',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          borderRadius: '6px',
          padding: '6px 12px',
          boxShadow: '0 0 15px rgba(0, 240, 255, 0.08)',
        }}
      >
        <span style={{ color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: '16px' }}>
          ▶
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            disabled
              ? 'Awaiting Neural Referee response...'
              : 'Enter action {like this}, speech "like this", OOC <like this>, or choice (1-5)...'
          }
          disabled={disabled}
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: '#fff',
            fontFamily: 'var(--font-mono)',
            fontSize: '14px',
          }}
        />
        <button
          type="submit"
          disabled={disabled || !inputText.trim()}
          className="cyber-btn"
          style={{ padding: '6px 16px', fontSize: '13px' }}
        >
          <span>TRANSMIT</span>
          <Send size={13} />
        </button>
      </form>
    </div>
  );
}
