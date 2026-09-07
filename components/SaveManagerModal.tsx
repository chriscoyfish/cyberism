'use client';

import React, { useState, useEffect } from 'react';
import { X, Save, Download, Upload, Trash2, Clock, Play } from 'lucide-react';
import { sound } from '@/lib/audio';
import { TurnMessage } from './TerminalScreen';
import { CharacterStats } from './CharacterDossier';

export interface SaveSlotData {
  id: string;
  slotNumber: number;
  title: string;
  summary: string;
  characterData: CharacterStats;
  messages: TurnMessage[];
  turnCount: number;
  updatedAt: number;
}

interface SaveManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: { id: string; username: string } | null;
  currentTurnCount: number;
  currentStats: CharacterStats;
  currentMessages: TurnMessage[];
  onLoadSave: (save: SaveSlotData) => void;
}

export function SaveManagerModal({
  isOpen,
  onClose,
  user,
  currentTurnCount,
  currentStats,
  currentMessages,
  onLoadSave,
}: SaveManagerModalProps) {
  const [saveSlots, setSaveSlots] = useState<SaveSlotData[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // Fetch saves when modal opens
  useEffect(() => {
    if (!isOpen) return;

    const fetchSaves = async () => {
      setLoading(true);
      setStatusMessage(null);

      if (user) {
        // Fetch from server DB
        try {
          const res = await fetch('/api/game/saves');
          if (res.ok) {
            const data = await res.json();
            setSaveSlots(data.saves || []);
          }
        } catch (e) {
          console.error('Failed to load saves from server', e);
        }
      } else {
        // Load from local storage for guest
        try {
          const localSaves = localStorage.getItem('cyberism_local_saves');
          if (localSaves) {
            setSaveSlots(JSON.parse(localSaves));
          } else {
            setSaveSlots([]);
          }
        } catch (e) {
          console.error('Failed to load local saves', e);
        }
      }
      setLoading(false);
    };

    fetchSaves();
  }, [isOpen, user]);

  if (!isOpen) return null;

  const handleSaveToSlot = async (slotNumber: number) => {
    sound.playKeyClick();
    setLoading(true);

    const latestAssistantMessage = [...currentMessages].reverse().find((m) => m.role === 'model')?.text || '';
    const summary = latestAssistantMessage.slice(0, 100).replace(/\n/g, ' ') + '...';
    const title = `Night City Chronicle - Turn ${currentTurnCount}`;

    const newSave: SaveSlotData = {
      id: user ? `save_${user.id}_slot_${slotNumber}` : `local_slot_${slotNumber}`,
      slotNumber,
      title,
      summary,
      characterData: currentStats,
      messages: currentMessages,
      turnCount: currentTurnCount,
      updatedAt: Date.now(),
    };

    if (user) {
      try {
        const res = await fetch('/api/game/saves', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(newSave),
        });
        if (res.ok) {
          setStatusMessage(`State successfully synchronized to Neural Databank (Slot ${slotNumber})`);
          // Refresh
          const updated = [...saveSlots.filter((s) => s.slotNumber !== slotNumber), newSave].sort(
            (a, b) => a.slotNumber - b.slotNumber
          );
          setSaveSlots(updated);
        }
      } catch (err) {
        setStatusMessage('Error synchronizing save data to server');
      }
    } else {
      // Local storage
      const updated = [...saveSlots.filter((s) => s.slotNumber !== slotNumber), newSave].sort(
        (a, b) => a.slotNumber - b.slotNumber
      );
      setSaveSlots(updated);
      localStorage.setItem('cyberism_local_saves', JSON.stringify(updated));
      setStatusMessage(`State saved locally to memory matrix (Slot ${slotNumber})`);
    }

    setLoading(false);
  };

  const handleDeleteSlot = async (slotNumber: number) => {
    sound.playKeyClick();
    if (user) {
      try {
        await fetch(`/api/game/saves?slot=${slotNumber}`, { method: 'DELETE' });
      } catch (e) {
        console.error(e);
      }
    }
    const updated = saveSlots.filter((s) => s.slotNumber !== slotNumber);
    setSaveSlots(updated);
    if (!user) {
      localStorage.setItem('cyberism_local_saves', JSON.stringify(updated));
    }
    setStatusMessage(`Slot ${slotNumber} purge complete.`);
  };

  const handleExportJson = () => {
    sound.playKeyClick();
    const exportData = {
      version: '2.0',
      exportedAt: new Date().toISOString(),
      turnCount: currentTurnCount,
      stats: currentStats,
      messages: currentMessages,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `cyberism_save_turn_${currentTurnCount}_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setStatusMessage('Save shard exported as JSON datashard file.');
  };

  const handleImportJson = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    sound.playKeyClick();
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (parsed.messages && Array.isArray(parsed.messages)) {
          onLoadSave({
            id: 'imported',
            slotNumber: 0,
            title: 'Imported Datashard',
            summary: 'Loaded from external datashard',
            characterData: parsed.stats || currentStats,
            messages: parsed.messages,
            turnCount: parsed.turnCount || parsed.messages.length,
            updatedAt: Date.now(),
          });
          onClose();
        } else {
          setStatusMessage('Invalid datashard structure.');
        }
      } catch {
        setStatusMessage('Corrupt datashard file.');
      }
    };
    reader.readAsText(file);
  };

  const totalSlots = [1, 2, 3, 4, 5];

  return (
    <div className="modal-backdrop">
      <div
        className="cyber-panel animate-fade-in"
        style={{
          width: '540px',
          maxHeight: '85vh',
          display: 'flex',
          flexDirection: 'column',
          border: '1px solid rgba(0, 240, 255, 0.4)',
          boxShadow: '0 0 30px rgba(0, 240, 255, 0.2)',
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
            background: 'rgba(15, 23, 42, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={18} color="var(--neon-cyan)" />
            <h2
              style={{
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                letterSpacing: '0.08em',
                color: '#fff',
              }}
            >
              CHRONICLE MEMORY MATRIX // SAVE & LOAD
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

        {/* Status Message */}
        {statusMessage && (
          <div
            style={{
              padding: '8px 20px',
              background: 'rgba(0, 255, 102, 0.1)',
              borderBottom: '1px solid rgba(0, 255, 102, 0.3)',
              color: 'var(--neon-green)',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {statusMessage}
          </div>
        )}

        {/* Slot List */}
        <div style={{ padding: '20px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {totalSlots.map((slotNum) => {
            const slotData = saveSlots.find((s) => s.slotNumber === slotNum);

            return (
              <div
                key={slotNum}
                style={{
                  background: 'rgba(15, 23, 42, 0.65)',
                  border: slotData ? '1px solid rgba(0, 240, 255, 0.3)' : '1px dashed rgba(255, 255, 255, 0.15)',
                  borderRadius: '6px',
                  padding: '12px 14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '12px',
                }}
              >
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span
                      style={{
                        background: slotData ? 'rgba(0, 240, 255, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                        color: slotData ? 'var(--neon-cyan)' : 'var(--text-muted)',
                        padding: '2px 6px',
                        borderRadius: '3px',
                        fontSize: '11px',
                        fontFamily: 'var(--font-hud)',
                        fontWeight: 700,
                      }}
                    >
                      SLOT {slotNum}
                    </span>
                    <span
                      style={{
                        fontSize: '13px',
                        fontWeight: 600,
                        color: slotData ? '#fff' : 'var(--text-muted)',
                      }}
                    >
                      {slotData ? slotData.title : '--- EMPTY DATASLOT ---'}
                    </span>
                  </div>

                  {slotData && (
                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                      <div style={{ marginBottom: '2px' }}>{slotData.summary}</div>
                      <div style={{ display: 'flex', gap: '10px', color: 'var(--text-muted)', fontSize: '10px' }}>
                        <span>Turn: {slotData.turnCount}</span>
                        <span>•</span>
                        <span>{new Date(slotData.updatedAt).toLocaleString()}</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button
                    className="cyber-btn cyber-btn-amber"
                    style={{ padding: '6px 10px', fontSize: '12px' }}
                    onClick={() => handleSaveToSlot(slotNum)}
                    disabled={loading}
                    title="Overwrite / Save current state to this slot"
                  >
                    <Save size={12} />
                    SAVE
                  </button>

                  {slotData && (
                    <>
                      <button
                        className="cyber-btn cyber-btn-green"
                        style={{ padding: '6px 10px', fontSize: '12px' }}
                        onClick={() => {
                          sound.playTerminalBeep();
                          onLoadSave(slotData);
                          onClose();
                        }}
                        title="Resume game from this slot"
                      >
                        <Play size={12} />
                        LOAD
                      </button>

                      <button
                        className="cyber-btn cyber-btn-crimson"
                        style={{ padding: '6px 8px', fontSize: '12px' }}
                        onClick={() => handleDeleteSlot(slotNum)}
                        title="Purge save data"
                      >
                        <Trash2 size={12} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Backup Tools */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid rgba(0, 240, 255, 0.2)',
            background: 'rgba(15, 23, 42, 0.8)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              className="cyber-btn"
              style={{ padding: '6px 10px', fontSize: '12px' }}
              onClick={handleExportJson}
            >
              <Download size={13} />
              EXPORT SHARD (.JSON)
            </button>

            <label className="cyber-btn" style={{ padding: '6px 10px', fontSize: '12px', cursor: 'pointer' }}>
              <Upload size={13} />
              IMPORT SHARD
              <input type="file" accept=".json" onChange={handleImportJson} style={{ display: 'none' }} />
            </label>
          </div>

          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
            {user ? `Logged in as ${user.username}` : 'Guest Mode (Local DB)'}
          </div>
        </div>
      </div>
    </div>
  );
}
