'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Header } from '@/components/Header';
import { CharacterDossier, CharacterStats, DEFAULT_CHARACTER_STATS } from '@/components/CharacterDossier';
import { TerminalScreen, TurnMessage } from '@/components/TerminalScreen';
import { ActionConsole } from '@/components/ActionConsole';
import { SaveManagerModal, SaveSlotData } from '@/components/SaveManagerModal';
import { AuthModal } from '@/components/AuthModal';
import { sound } from '@/lib/audio';

export default function CyberismGamePage() {
  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<{ id: string; username: string } | null>(null);
  const [messages, setMessages] = useState<TurnMessage[]>([]);
  const [choices, setChoices] = useState<string[]>([]);
  const [turnCount, setTurnCount] = useState<number>(0);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [stats, setStats] = useState<CharacterStats>(DEFAULT_CHARACTER_STATS);

  // Settings, Drawer & Modals
  const [crtEnabled, setCrtEnabled] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDossierCollapsed, setIsDossierCollapsed] = useState<boolean>(false);
  const [isDossierMobileOpen, setIsDossierMobileOpen] = useState<boolean>(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState<boolean>(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Check auth on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.authenticated && data.user) {
          setUser(data.user);
        }
      })
      .catch(() => {});
  }, []);

  // Submit action / prompt to Gemini AI Referee
  const handleAction = useCallback(async (inputText: string, currentHistory?: TurnMessage[]) => {
    const historyToUse = currentHistory || messages;
    setIsGenerating(true);

    const userMessage: TurnMessage = {
      id: 'usr_' + Date.now(),
      role: 'user',
      text: inputText,
      timestamp: Date.now(),
    };

    const newMessages = [...historyToUse, userMessage];
    setMessages(newMessages);

    try {
      const res = await fetch('/api/game/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: historyToUse.map((m) => ({ role: m.role, text: m.text })),
          message: inputText,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        sound.playError();
        const errorMessage: TurnMessage = {
          id: 'err_' + Date.now(),
          role: 'system',
          text: data.error || 'Neural connection lost. Please retry.',
          timestamp: Date.now(),
        };
        setMessages([...newMessages, errorMessage]);
      } else {
        const modelMessage: TurnMessage = {
          id: 'mod_' + Date.now(),
          role: 'model',
          text: data.text,
          diceRolls: data.diceRolls,
          timestamp: Date.now(),
        };

        let currentStatsToSave = stats;

        // Process comprehensive state updates (inventory, cyberware, notes, HP, humanity, stats, eddies)
        if (data.stateUpdates) {
          const {
            itemsAcquired = [],
            itemsRemoved = [],
            cyberwareAdded = [],
            cyberwareRemoved = [],
            notesAdded = [],
            eddiesChange = 0,
            hpChange = 0,
            hpSet,
            maxHpSet,
            humanityChange = 0,
            humanitySet,
            statChanges = {},
          } = data.stateUpdates;

          let updatedInventory = [...stats.inventory];
          let updatedCyberware = [...stats.cyberware];
          let updatedNotes = [...stats.notes];
          let statsChanged = false;

          // Items
          if (itemsAcquired.length > 0) {
            itemsAcquired.forEach((item: string) => {
              if (!updatedInventory.includes(item)) {
                updatedInventory.push(item);
                statsChanged = true;
              }
            });
          }
          if (itemsRemoved.length > 0) {
            updatedInventory = updatedInventory.filter((it) => !itemsRemoved.includes(it));
            statsChanged = true;
          }

          // Cyberware / Chrome
          if (cyberwareAdded.length > 0) {
            cyberwareAdded.forEach((c: string) => {
              if (!updatedCyberware.includes(c)) {
                updatedCyberware.push(c);
                statsChanged = true;
              }
            });
          }
          if (cyberwareRemoved.length > 0) {
            updatedCyberware = updatedCyberware.filter((c) => !cyberwareRemoved.includes(c));
            statsChanged = true;
          }

          // Notes
          if (notesAdded.length > 0) {
            notesAdded.forEach((n: string) => {
              if (!updatedNotes.includes(n)) {
                updatedNotes.push(n);
                statsChanged = true;
              }
            });
          }

          // HP
          const newMaxHp = maxHpSet !== undefined ? maxHpSet : stats.maxHp;
          let newHp = stats.hp;
          if (hpSet !== undefined) {
            newHp = hpSet;
          } else if (hpChange !== 0) {
            newHp = Math.max(0, Math.min(newMaxHp, stats.hp + hpChange));
          }

          // Humanity
          let newHumanity = stats.humanity;
          if (humanitySet !== undefined) {
            newHumanity = humanitySet;
          } else if (humanityChange !== 0) {
            newHumanity = Math.max(0, Math.min(stats.maxHumanity, stats.humanity + humanityChange));
          }

          // Eddies
          const newEddies = Math.max(0, stats.eddies + eddiesChange);

          // Attributes (REF, INT, TECH, COOL, WILL, EMP, BODY)
          const newStatsObj = {
            ref: Math.max(1, stats.ref + (statChanges.ref || 0)),
            int: Math.max(1, stats.int + (statChanges.int || 0)),
            tech: Math.max(1, stats.tech + (statChanges.tech || 0)),
            cool: Math.max(1, stats.cool + (statChanges.cool || 0)),
            will: Math.max(1, stats.will + (statChanges.will || 0)),
            emp: Math.max(1, stats.emp + (statChanges.emp || 0)),
            body: Math.max(1, stats.body + (statChanges.body || 0)),
          };

          const hasAttributeChange = Object.keys(statChanges).length > 0;
          if (
            eddiesChange !== 0 ||
            hpChange !== 0 ||
            hpSet !== undefined ||
            humanityChange !== 0 ||
            humanitySet !== undefined ||
            hasAttributeChange ||
            statsChanged
          ) {
            const nextStats: CharacterStats = {
              ...stats,
              ...newStatsObj,
              inventory: updatedInventory,
              cyberware: updatedCyberware,
              notes: updatedNotes,
              eddies: newEddies,
              hp: newHp,
              maxHp: newMaxHp,
              humanity: newHumanity,
            };
            setStats(nextStats);
            currentStatsToSave = nextStats;

            if (itemsAcquired.length > 0 || cyberwareAdded.length > 0) {
              sound.playItemAcquired();
            }
          }
        }

        const updatedMessages = [...newMessages, modelMessage];
        setMessages(updatedMessages);
        setChoices(data.choices || []);
        setTurnCount((prev) => prev + 1);

        if (data.diceRolls && data.diceRolls.length > 0) {
          sound.playDiceRoll();
        } else if (!data.stateUpdates?.itemsAcquired?.length) {
          sound.playTerminalBeep();
        }

        if (data.isGameOver) {
          setGameOver(true);
          sound.playGameOver();
        }

        // Autosave locally
        localStorage.setItem(
          'cyberism_autosave',
          JSON.stringify({
            messages: updatedMessages,
            choices: data.choices || [],
            turnCount: turnCount + 1,
            stats: currentStatsToSave,
            gameOver: data.isGameOver,
          })
        );
      }
    } catch {
      sound.playError();
      const errorMessage: TurnMessage = {
        id: 'err_' + Date.now(),
        role: 'system',
        text: 'Failed to communicate with neural mainframe.',
        timestamp: Date.now(),
      };
      setMessages([...newMessages, errorMessage]);
    } finally {
      setIsGenerating(false);
    }
  }, [messages, stats, turnCount]);

  // Start a new game
  const startNewGame = useCallback(async () => {
    setIsGenerating(true);
    setGameOver(false);
    setTurnCount(0);
    setStats(DEFAULT_CHARACTER_STATS);
    setMessages([]);
    setChoices([]);

    try {
      const res = await fetch('/api/game/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          history: [],
          message: '',
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        sound.playError();
        setMessages([
          {
            id: 'err_' + Date.now(),
            role: 'system',
            text: data.error || 'Failed to initialize game.',
            timestamp: Date.now(),
          },
        ]);
      } else {
        sound.playTerminalBeep();
        const initialMessage: TurnMessage = {
          id: 'mod_' + Date.now(),
          role: 'model',
          text: data.text,
          diceRolls: data.diceRolls,
          timestamp: Date.now(),
        };
        setMessages([initialMessage]);
        setChoices(data.choices || []);
        setTurnCount(1);

        localStorage.setItem(
          'cyberism_autosave',
          JSON.stringify({
            messages: [initialMessage],
            choices: data.choices || [],
            turnCount: 1,
            stats: DEFAULT_CHARACTER_STATS,
            gameOver: false,
          })
        );
      }
    } catch {
      sound.playError();
      setMessages([
        {
          id: 'err_' + Date.now(),
          role: 'system',
          text: 'Mainframe offline. Please check your Gemini API key or connection.',
          timestamp: Date.now(),
        },
      ]);
    } finally {
      setIsGenerating(false);
    }
  }, []);

  // On initial mount, restore autosave or start new game
  useEffect(() => {
    try {
      const saved = localStorage.getItem('cyberism_autosave');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages && parsed.messages.length > 0) {
          setMessages(parsed.messages);
          setChoices(parsed.choices || []);
          setTurnCount(parsed.turnCount || 1);
          setStats(parsed.stats || DEFAULT_CHARACTER_STATS);
          setGameOver(parsed.gameOver || false);
          return;
        }
      }
    } catch (e) {
      console.error(e);
    }

    startNewGame();
  }, [startNewGame]);

  const handleLogout = async () => {
    sound.playKeyClick();
    await fetch('/api/auth/logout', { method: 'POST' });
    setUser(null);
  };

  const handleLoadSave = (save: SaveSlotData) => {
    setMessages(save.messages || []);
    setTurnCount(save.turnCount || 0);
    setStats(save.characterData || DEFAULT_CHARACTER_STATS);
    setGameOver(false);

    // Extract choices from last message
    const lastModelMsg = [...(save.messages || [])].reverse().find((m) => m.role === 'model')?.text || '';
    const regex = /(?:(?:\d+\.|\d+\))\s*)?\{([^}]+)\}/g;
    const extracted: string[] = [];
    let match;
    while ((match = regex.exec(lastModelMsg)) !== null) {
      if (match[1].trim()) extracted.push(match[1].trim());
    }
    setChoices(extracted.slice(0, 5));
  };

  if (!mounted) {
    return (
      <main
        suppressHydrationWarning
        style={{
          width: '100vw',
          height: '100vh',
          background: 'var(--bg-core)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--neon-cyan)',
          fontFamily: 'var(--font-hud)',
          fontSize: '16px',
          letterSpacing: '0.1em',
        }}
      >
        INITIALIZING NEURAL INTERFACE...
      </main>
    );
  }

  return (
    <main
      suppressHydrationWarning
      style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
    >
      {/* Optional CRT scanlines filter */}
      {crtEnabled && (
        <>
          <div className="crt-overlay" />
          <div className="crt-vignette" />
        </>
      )}

      {/* Mobile Backdrop for Dossier Drawer */}
      {isDossierMobileOpen && (
        <div
          className="dossier-backdrop"
          onClick={() => setIsDossierMobileOpen(false)}
        />
      )}

      {/* Top Header */}
      <Header
        user={user}
        turnCount={turnCount}
        stats={stats}
        soundEnabled={soundEnabled}
        setSoundEnabled={setSoundEnabled}
        crtEnabled={crtEnabled}
        setCrtEnabled={setCrtEnabled}
        onOpenSaveModal={() => setIsSaveModalOpen(true)}
        onOpenAuthModal={() => setIsAuthModalOpen(true)}
        onLogout={handleLogout}
        onNewGame={startNewGame}
        isGenerating={isGenerating}
        onToggleDossierMobile={() => setIsDossierMobileOpen(!isDossierMobileOpen)}
      />

      {/* Main Body */}
      <div style={{ flex: 1, display: 'flex', overflow: 'hidden', position: 'relative' }}>
        {/* Left / Center: Story Narration & Action Console */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
          <TerminalScreen
            messages={messages}
            isGenerating={isGenerating}
            isGameOver={gameOver}
          />

          <ActionConsole
            choices={choices}
            onSubmitAction={(text) => handleAction(text)}
            disabled={isGenerating || gameOver}
          />
        </div>

        {/* Right: Collapsible Character Dossier & Inventory */}
        <CharacterDossier
          stats={stats}
          onUpdateStats={setStats}
          isCollapsed={isDossierCollapsed}
          onToggleCollapse={() => setIsDossierCollapsed(!isDossierCollapsed)}
          isOpenMobile={isDossierMobileOpen}
          onCloseMobile={() => setIsDossierMobileOpen(false)}
        />
      </div>

      {/* Modals */}
      <SaveManagerModal
        isOpen={isSaveModalOpen}
        onClose={() => setIsSaveModalOpen(false)}
        user={user}
        currentTurnCount={turnCount}
        currentStats={stats}
        currentMessages={messages}
        onLoadSave={handleLoadSave}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(newUser) => setUser(newUser)}
      />
    </main>
  );
}
