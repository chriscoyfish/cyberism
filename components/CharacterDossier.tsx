'use client';

import React, { useState } from 'react';
import { Activity, Heart, Crosshair, Package, DollarSign, Database, Cpu, Plus } from 'lucide-react';

export interface CharacterStats {
  hp: number;
  maxHp: number;
  humanity: number;
  maxHumanity: number;
  eddies: number;
  ref: number;
  int: number;
  tech: number;
  cool: number;
  will: number;
  emp: number;
  body: number;
  inventory: string[];
  cyberware: string[];
  notes: string[];
}

export const DEFAULT_CHARACTER_STATS: CharacterStats = {
  hp: 35,
  maxHp: 35,
  humanity: 58,
  maxHumanity: 60,
  eddies: 850,
  ref: 8,
  int: 7,
  tech: 6,
  cool: 8,
  will: 6,
  emp: 6,
  body: 7,
  inventory: [
    'Militech Arms 9mm Heavy Pistol (12 rnds)',
    'Cyberpunk Agent HUD (Data-Pad)',
    'Kevlar Tactical Trenchcoat (SP 11)',
    'Pocket Flashlight & Lockpicks',
    'Trauma Team Silver Card',
  ],
  cyberware: [
    'Kiroshi Optics Mark III (Thermal & HUD overlay)',
    'Neural Link w/ Interface Plugs',
    'Subdermal Armor Plating (SP 4)',
  ],
  notes: [
    'Case #082: Corporate defection in Watson district',
    'Contact: Dex (The Afterlife bar, 22:00)',
  ],
};

interface CharacterDossierProps {
  stats: CharacterStats;
  onUpdateStats?: (newStats: CharacterStats) => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export function CharacterDossier({
  stats,
  onUpdateStats,
  isCollapsed = false,
  onToggleCollapse,
  isOpenMobile = false,
  onCloseMobile,
}: CharacterDossierProps) {
  const [activeTab, setActiveTab] = useState<'status' | 'inventory' | 'cyberware' | 'notes'>('status');
  const [newItemText, setNewItemText] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);

  const hpPercent = Math.max(0, Math.min(100, (stats.hp / stats.maxHp) * 100));
  const humanityPercent = Math.max(0, Math.min(100, (stats.humanity / stats.maxHumanity) * 100));

  // Determine Humanity status label
  const getHumanityStatus = () => {
    if (stats.humanity > 45) return { text: 'STABLE', color: 'var(--neon-green)' };
    if (stats.humanity > 25) return { text: 'NEURAL STRAIN', color: 'var(--neon-amber)' };
    return { text: 'CYBERPSYCHOSIS RISK', color: 'var(--neon-crimson)' };
  };

  const humanityStatus = getHumanityStatus();

  // If collapsed on desktop
  if (isCollapsed && !isOpenMobile) {
    return (
      <aside
        suppressHydrationWarning
        style={{
          width: '44px',
          height: '100%',
          borderLeft: '1px solid rgba(0, 240, 255, 0.2)',
          background: 'rgba(11, 15, 23, 0.95)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '12px 0',
          gap: '16px',
          flexShrink: 0,
          userSelect: 'none',
        }}
      >
        <button
          className="cyber-btn"
          onClick={onToggleCollapse}
          title="Expand Character Dossier"
          style={{ padding: '6px 8px', fontSize: '11px', border: '1px solid var(--neon-cyan)' }}
        >
          ◀
        </button>
        <div
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            fontFamily: 'var(--font-hud)',
            fontSize: '12px',
            fontWeight: 700,
            color: 'var(--neon-cyan)',
            letterSpacing: '0.15em',
            marginTop: '10px',
            cursor: 'pointer',
          }}
          onClick={onToggleCollapse}
        >
          // SENNA BLADESMITH // HP {stats.hp}/{stats.maxHp} // ₢{stats.eddies}
        </div>
      </aside>
    );
  }

  const handleAddItem = (type: 'inventory' | 'cyberware' | 'notes') => {
    if (!newItemText.trim() || !onUpdateStats) return;
    const text = newItemText.trim();
    if (type === 'inventory') {
      onUpdateStats({ ...stats, inventory: [...stats.inventory, text] });
    } else if (type === 'cyberware') {
      onUpdateStats({ ...stats, cyberware: [...stats.cyberware, text] });
    } else if (type === 'notes') {
      onUpdateStats({ ...stats, notes: [...stats.notes, text] });
    }
    setNewItemText('');
    setShowAddInput(false);
  };

  return (
    <aside
      suppressHydrationWarning
      className={`dossier-sidebar ${isOpenMobile ? 'dossier-open' : ''}`}
      style={{
        width: '320px',
        height: '100%',
        borderLeft: '1px solid rgba(0, 240, 255, 0.2)',
        background: 'rgba(11, 15, 23, 0.95)',
        display: 'flex',
        flexDirection: 'column',
        userSelect: 'none',
        flexShrink: 0,
      }}
    >
      {/* Dossier Header */}
      <div style={{
        padding: '12px 16px',
        borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
        background: 'rgba(15, 23, 42, 0.7)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{
            fontSize: '11px',
            fontFamily: 'var(--font-hud)',
            color: 'var(--neon-cyan)',
            letterSpacing: '0.1em',
            fontWeight: 700,
          }}>
            // DOSSIER // ID: 884-NC
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{
              fontSize: '10px',
              background: 'rgba(255, 170, 0, 0.15)',
              color: 'var(--neon-amber)',
              padding: '2px 6px',
              borderRadius: '2px',
              fontFamily: 'var(--font-hud)',
              fontWeight: 700,
            }}>
              SOLO / DETECTIVE
            </span>
            {onToggleCollapse && (
              <button
                onClick={onToggleCollapse}
                title="Collapse Dossier"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-secondary)',
                  cursor: 'pointer',
                  fontSize: '14px',
                  padding: '2px 6px',
                }}
              >
                ▶
              </button>
            )}
            {onCloseMobile && (
              <button
                onClick={onCloseMobile}
                title="Close Dossier"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--neon-crimson)',
                  cursor: 'pointer',
                  fontSize: '16px',
                  padding: '2px 6px',
                  fontWeight: 'bold',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>
        <div style={{
          marginTop: '6px',
          fontSize: '15px',
          fontFamily: 'var(--font-display)',
          fontWeight: 700,
          color: '#fff',
          letterSpacing: '0.05em',
        }}>
          SENNA BLADESMITH
        </div>
      </div>

      {/* Quick Vitals (HP & Humanity & Eddies) */}
      <div style={{ padding: '12px 16px', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
        {/* HP Bar */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--neon-crimson)', fontWeight: 600 }}>
              <Heart size={13} /> HIT POINTS
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: '#fff' }}>
              {stats.hp} / {stats.maxHp}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(255, 0, 85, 0.15)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${hpPercent}%`,
              height: '100%',
              background: hpPercent < 30 ? 'var(--neon-crimson)' : 'var(--neon-amber)',
              boxShadow: hpPercent < 30 ? '0 0 8px var(--neon-crimson)' : '0 0 6px var(--neon-amber)',
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Humanity Bar */}
        <div style={{ marginBottom: '10px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--neon-cyan)', fontWeight: 600 }}>
              <Activity size={13} /> HUMANITY ({humanityStatus.text})
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: humanityStatus.color, fontWeight: 700 }}>
              {stats.humanity} / {stats.maxHumanity}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '6px',
            background: 'rgba(0, 240, 255, 0.15)',
            borderRadius: '3px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: `${humanityPercent}%`,
              height: '100%',
              background: humanityStatus.color,
              boxShadow: `0 0 6px ${humanityStatus.color}`,
              transition: 'width 0.3s ease',
            }} />
          </div>
        </div>

        {/* Eddies Currency */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'rgba(0, 255, 102, 0.08)',
          border: '1px solid rgba(0, 255, 102, 0.25)',
          padding: '6px 10px',
          borderRadius: '4px',
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '5px', color: 'var(--neon-green)', fontSize: '12px', fontWeight: 600 }}>
            <DollarSign size={13} /> EURODOLLARS
          </span>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff', fontSize: '13px' }}>
            ₢ {stats.eddies.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        borderBottom: '1px solid rgba(0, 240, 255, 0.15)',
        background: 'rgba(15, 23, 42, 0.5)',
      }}>
        {[
          { id: 'status', label: 'STATS', icon: <Crosshair size={12} />, badge: null },
          { id: 'inventory', label: 'GEAR', icon: <Package size={12} />, badge: stats.inventory.length },
          { id: 'cyberware', label: 'CHROME', icon: <Cpu size={12} />, badge: stats.cyberware.length },
          { id: 'notes', label: 'LOGS', icon: <Database size={12} />, badge: stats.notes.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setActiveTab(tab.id as typeof activeTab);
              setShowAddInput(false);
            }}
            style={{
              padding: '8px 4px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '4px',
              border: 'none',
              background: activeTab === tab.id ? 'rgba(0, 240, 255, 0.15)' : 'transparent',
              color: activeTab === tab.id ? 'var(--neon-cyan)' : 'var(--text-muted)',
              borderBottom: activeTab === tab.id ? '2px solid var(--neon-cyan)' : '2px solid transparent',
              cursor: 'pointer',
              fontFamily: 'var(--font-hud)',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.05em',
              transition: 'all 0.2s',
            }}
          >
            {tab.icon}
            <span>
              {tab.label}
              {tab.badge !== null && (
                <span style={{ marginLeft: '3px', color: 'var(--neon-amber)', fontSize: '10px' }}>
                  ({tab.badge})
                </span>
              )}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 16px' }}>
        {activeTab === 'status' && (
          <div>
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-hud)',
              color: 'var(--text-secondary)',
              letterSpacing: '0.08em',
              marginBottom: '10px',
              fontWeight: 700,
            }}>
              CYBERPUNK RED ATTRIBUTES
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
              {[
                { name: 'REF (Reflexes)', key: 'ref', val: stats.ref, desc: 'Gunplay & Dodging' },
                { name: 'INT (Intelligence)', key: 'int', val: stats.int, desc: 'Hacking & Analysis' },
                { name: 'TECH (Technique)', key: 'tech', val: stats.tech, desc: 'Electronics & Repairs' },
                { name: 'COOL (Will/Street)', key: 'cool', val: stats.cool, desc: 'Composure & Influence' },
                { name: 'WILL (Willpower)', key: 'will', val: stats.will, desc: 'Grit & Courage' },
                { name: 'EMP (Empathy)', key: 'emp', val: stats.emp, desc: 'Human Connection' },
                { name: 'BODY (Constitution)', key: 'body', val: stats.body, desc: 'Health & Endurance' },
              ].map((stat) => (
                <div
                  key={stat.name}
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 255, 255, 0.08)',
                    padding: '8px 10px',
                    borderRadius: '4px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-secondary)', fontFamily: 'var(--font-hud)', fontWeight: 600 }}>
                      {stat.name.split(' ')[0]}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--neon-cyan)', fontFamily: 'var(--font-mono)' }}>
                      {stat.val}
                    </span>
                  </div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {stat.desc}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'inventory' && (
          <div>
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-hud)',
              color: 'var(--neon-cyan)',
              letterSpacing: '0.08em',
              marginBottom: '10px',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>EQUIPPED INVENTORY ({stats.inventory.length})</span>
              {onUpdateStats && (
                <button
                  onClick={() => setShowAddInput(!showAddInput)}
                  style={{
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: 'var(--neon-cyan)',
                    padding: '2px 6px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Plus size={10} /> ADD
                </button>
              )}
            </div>

            {showAddInput && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Item name..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem('inventory');
                  }}
                  className="cyber-input"
                  style={{ flex: 1, padding: '4px 8px', fontSize: '11px' }}
                />
                <button
                  onClick={() => handleAddItem('inventory')}
                  className="cyber-btn cyber-btn-cyan"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  Save
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {stats.inventory.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px' }}>
                  No items equipped in inventory.
                </div>
              ) : (
                stats.inventory.map((item, idx) => (
                  <div
                    key={idx}
                    className="animate-fade-in"
                    style={{
                      background: 'rgba(15, 23, 42, 0.85)',
                      border: '1px solid rgba(0, 240, 255, 0.25)',
                      padding: '8px 10px',
                      borderRadius: '4px',
                      fontSize: '12px',
                      color: 'var(--text-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ color: 'var(--neon-cyan)', fontSize: '12px' }}>▪</span>
                      <span>{item}</span>
                    </div>

                    {onUpdateStats && (
                      <button
                        onClick={() => {
                          const updated = stats.inventory.filter((_, i) => i !== idx);
                          onUpdateStats({ ...stats, inventory: updated });
                        }}
                        title="Discard item"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '2px 4px',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'cyberware' && (
          <div>
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-hud)',
              color: 'var(--neon-amber)',
              letterSpacing: '0.08em',
              marginBottom: '10px',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>INSTALLED CHROME ({stats.cyberware.length})</span>
              {onUpdateStats && (
                <button
                  onClick={() => setShowAddInput(!showAddInput)}
                  style={{
                    background: 'rgba(255, 170, 0, 0.1)',
                    border: '1px solid rgba(255, 170, 0, 0.3)',
                    color: 'var(--neon-amber)',
                    padding: '2px 6px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Plus size={10} /> INSTALL
                </button>
              )}
            </div>

            {showAddInput && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Cyberware name..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem('cyberware');
                  }}
                  className="cyber-input"
                  style={{ flex: 1, padding: '4px 8px', fontSize: '11px' }}
                />
                <button
                  onClick={() => handleAddItem('cyberware')}
                  className="cyber-btn cyber-btn-amber"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  Save
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {stats.cyberware.map((item, idx) => (
                <div
                  key={idx}
                  className="animate-fade-in"
                  style={{
                    background: 'rgba(15, 23, 42, 0.8)',
                    border: '1px solid rgba(255, 170, 0, 0.25)',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    fontSize: '12px',
                    color: 'var(--text-primary)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: '8px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Cpu size={14} color="var(--neon-amber)" />
                    <span>{item}</span>
                  </div>

                  {onUpdateStats && (
                    <button
                      onClick={() => {
                        const updated = stats.cyberware.filter((_, i) => i !== idx);
                        onUpdateStats({ ...stats, cyberware: updated });
                      }}
                      title="Uninstall cyberware"
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--text-muted)',
                        cursor: 'pointer',
                        fontSize: '12px',
                        padding: '2px 4px',
                      }}
                    >
                      ✕
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'notes' && (
          <div>
            <div style={{
              fontSize: '11px',
              fontFamily: 'var(--font-hud)',
              color: 'var(--neon-cyan)',
              letterSpacing: '0.08em',
              marginBottom: '10px',
              fontWeight: 700,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
              <span>CASE NOTES & CLUES ({stats.notes.length})</span>
              {onUpdateStats && (
                <button
                  onClick={() => setShowAddInput(!showAddInput)}
                  style={{
                    background: 'rgba(0, 240, 255, 0.1)',
                    border: '1px solid rgba(0, 240, 255, 0.3)',
                    color: 'var(--neon-cyan)',
                    padding: '2px 6px',
                    fontSize: '10px',
                    cursor: 'pointer',
                    borderRadius: '2px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '3px',
                  }}
                >
                  <Plus size={10} /> LOG
                </button>
              )}
            </div>

            {showAddInput && (
              <div style={{ display: 'flex', gap: '4px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="Case clue/note..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddItem('notes');
                  }}
                  className="cyber-input"
                  style={{ flex: 1, padding: '4px 8px', fontSize: '11px' }}
                />
                <button
                  onClick={() => handleAddItem('notes')}
                  className="cyber-btn cyber-btn-cyan"
                  style={{ padding: '4px 8px', fontSize: '11px' }}
                >
                  Save
                </button>
              </div>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.notes.length === 0 ? (
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', fontStyle: 'italic', padding: '10px' }}>
                  No case notes logged.
                </div>
              ) : (
                stats.notes.map((note, idx) => (
                  <div
                    key={idx}
                    className="animate-fade-in"
                    style={{
                      background: 'rgba(15, 23, 42, 0.8)',
                      borderLeft: '3px solid var(--neon-cyan)',
                      padding: '8px 10px',
                      fontSize: '12px',
                      color: 'var(--text-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '8px',
                    }}
                  >
                    <div>{note}</div>
                    {onUpdateStats && (
                      <button
                        onClick={() => {
                          const updated = stats.notes.filter((_, i) => i !== idx);
                          onUpdateStats({ ...stats, notes: updated });
                        }}
                        title="Delete note"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          fontSize: '12px',
                          padding: '2px 4px',
                        }}
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer System Specs */}
      <div style={{
        padding: '8px 16px',
        borderTop: '1px solid rgba(255, 255, 255, 0.06)',
        fontSize: '10px',
        color: 'var(--text-muted)',
        display: 'flex',
        justifyContent: 'space-between',
      }}>
        <span>EDGERUNNERS_INC_V4.2</span>
        <span style={{ color: 'var(--neon-green)' }}>ONLINE</span>
      </div>
    </aside>
  );
}
