'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { ThreeGameEngine } from '@/lib/game/threeGameEngine';
import { soundEngine } from '@/lib/game/soundEngine';
import { GameStatus, CarrotFloatingText } from '@/lib/game/types';
import {
  loadDailyLives,
  consumeLife,
  addLife,
  EXTRA_LIFE_CARROT_COST,
} from '@/lib/game/livesManager';
import { HUD } from './HUD';
import { TouchControls } from './TouchControls';
import { SkinWardrobeModal } from './SkinWardrobeModal';
import { StartOverlay, GameOverOverlay, PauseOverlay } from './OverlayScreens';
import { FloatingCarrotFx } from './FloatingCarrotFx';

const STORAGE_KEYS = {
  HIGH_SCORE: 'bunnyhop_highscore',
  TOTAL_CARROTS: 'bunnyhop_total_carrots',
  UNLOCKED_SKINS: 'bunnyhop_unlocked_skins',
  SELECTED_SKIN: 'bunnyhop_selected_skin',
  SOUND_ENABLED: 'bunnyhop_sound_enabled',
};

export const GameContainer: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<ThreeGameEngine | null>(null);

  // Game UI State
  const [gameStatus, setGameStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState<number>(0);
  const [sessionCarrots, setSessionCarrots] = useState<number>(0);
  const [sessionGoldenCarrots, setSessionGoldenCarrots] = useState<number>(0);
  const [isNewHigh, setIsNewHigh] = useState<boolean>(false);

  // Difficulty scaling (every 5 seconds)
  const [difficultyLevel, setDifficultyLevel] = useState<number>(1);
  const [difficultyMultiplier, setDifficultyMultiplier] = useState<number>(1.0);

  // Daily Lives (max 5 per day)
  const [lives, setLives] = useState<number>(5);

  // Floating notifications
  const [floatingTexts, setFloatingTexts] = useState<CarrotFloatingText[]>([]);

  // Persistent User Data
  const [highScore, setHighScore] = useState<number>(0);
  const [totalCarrots, setTotalCarrots] = useState<number>(0);
  const [unlockedSkins, setUnlockedSkins] = useState<string[]>(['classic']);
  const [selectedSkin, setSelectedSkin] = useState<string>('classic');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals
  const [isWardrobeOpen, setIsWardrobeOpen] = useState<boolean>(false);

  // Load persistent stats and daily lives on mount
  useEffect(() => {
    try {
      const savedHigh = parseInt(localStorage.getItem(STORAGE_KEYS.HIGH_SCORE) || '0', 10);
      const savedCarrots = parseInt(localStorage.getItem(STORAGE_KEYS.TOTAL_CARROTS) || '0', 10);
      const savedSkins = JSON.parse(localStorage.getItem(STORAGE_KEYS.UNLOCKED_SKINS) || '["classic"]');
      const savedSelected = localStorage.getItem(STORAGE_KEYS.SELECTED_SKIN) || 'classic';
      const savedSound = localStorage.getItem(STORAGE_KEYS.SOUND_ENABLED) !== 'false';

      setHighScore(savedHigh);
      setTotalCarrots(savedCarrots);
      setUnlockedSkins(savedSkins);
      setSelectedSkin(savedSelected);
      setSoundEnabled(savedSound);
      soundEngine.setEnabled(savedSound);

      // Load daily lives
      const livesState = loadDailyLives();
      setLives(livesState.lives);
    } catch {
      // Fallback
    }
  }, []);

  // Initialize Three.js Engine
  useEffect(() => {
    if (!containerRef.current) return;

    const engine = new ThreeGameEngine(
      containerRef.current,
      {
        onScoreUpdate: (newScore) => {
          setScore(newScore);
        },
        onDifficultyUpdate: (level, multiplier) => {
          setDifficultyLevel(level);
          setDifficultyMultiplier(multiplier);
        },
        onCarrotCollected: (isGolden, currentSessionTotal, screenPos) => {
          setSessionCarrots(currentSessionTotal);
          if (isGolden) {
            setSessionGoldenCarrots((prev) => prev + 1);
          }

          // Add floating text badge
          const newId = Date.now() + Math.random();
          setFloatingTexts((prev) => [
            ...prev,
            {
              id: newId,
              x: screenPos.x,
              y: screenPos.y,
              text: isGolden ? '+5' : '+1',
              isGolden,
            },
          ]);

          setTimeout(() => {
            setFloatingTexts((prev) => prev.filter((item) => item.id !== newId));
          }, 900);
        },
        onGameOver: (finalScore, sessionCarrotsGathered, goldenCarrotsGathered) => {
          const runBonus = sessionCarrotsGathered * 5;
          const totalRunPoints = finalScore + runBonus;

          // Update Highscore
          let newRecord = false;
          setHighScore((prevHigh) => {
            if (totalRunPoints > prevHigh) {
              localStorage.setItem(STORAGE_KEYS.HIGH_SCORE, String(totalRunPoints));
              newRecord = true;
              return totalRunPoints;
            }
            return prevHigh;
          });
          setIsNewHigh(newRecord);

          // Bank Carrots
          setTotalCarrots((prev) => {
            const updated = prev + sessionCarrotsGathered;
            localStorage.setItem(STORAGE_KEYS.TOTAL_CARROTS, String(updated));
            return updated;
          });

          setGameStatus('gameover');
        },
      },
      selectedSkin
    );

    engineRef.current = engine;

    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, []);

  // Sync Skin Changes
  const handleSelectSkin = useCallback((skinId: string) => {
    setSelectedSkin(skinId);
    localStorage.setItem(STORAGE_KEYS.SELECTED_SKIN, skinId);
    if (engineRef.current) {
      engineRef.current.setSkin(skinId);
    }
  }, []);

  // Unlock Skin
  const handleUnlockSkin = useCallback((skinId: string, cost: number) => {
    setTotalCarrots((prev) => {
      const updated = Math.max(0, prev - cost);
      localStorage.setItem(STORAGE_KEYS.TOTAL_CARROTS, String(updated));
      return updated;
    });

    setUnlockedSkins((prev) => {
      if (!prev.includes(skinId)) {
        const updated = [...prev, skinId];
        localStorage.setItem(STORAGE_KEYS.UNLOCKED_SKINS, JSON.stringify(updated));
        return updated;
      }
      return prev;
    });
  }, []);

  // Buy +1 Extra Life with Carrots
  const handleBuyLife = useCallback(() => {
    if (totalCarrots < EXTRA_LIFE_CARROT_COST) return;

    soundEngine.playCarrot();
    setTotalCarrots((prev) => {
      const updated = Math.max(0, prev - EXTRA_LIFE_CARROT_COST);
      localStorage.setItem(STORAGE_KEYS.TOTAL_CARROTS, String(updated));
      return updated;
    });

    const newState = addLife();
    setLives(newState.lives);
  }, [totalCarrots]);

  // Toggle Sound
  const handleToggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const updated = !prev;
      soundEngine.setEnabled(updated);
      localStorage.setItem(STORAGE_KEYS.SOUND_ENABLED, String(updated));
      return updated;
    });
  }, []);

  // Game Control Handlers
  const handleStartGame = useCallback(() => {
    if (!engineRef.current) return;

    // Check lives
    const currentLivesState = loadDailyLives();
    if (currentLivesState.lives <= 0) {
      setLives(0);
      return;
    }

    // Deduct 1 life for this run
    const updatedLives = consumeLife();
    setLives(updatedLives.lives);

    setScore(0);
    setSessionCarrots(0);
    setSessionGoldenCarrots(0);
    setIsNewHigh(false);
    setDifficultyLevel(1);
    setDifficultyMultiplier(1.0);

    engineRef.current.resetWorld();
    engineRef.current.start();
    setGameStatus('playing');
  }, []);

  const handlePause = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.pause();
    setGameStatus('paused');
  }, []);

  const handleResume = useCallback(() => {
    if (!engineRef.current) return;
    engineRef.current.resume();
    setGameStatus('playing');
  }, []);

  const handleMove = useCallback((direction: 'up' | 'down' | 'left' | 'right') => {
    if (!engineRef.current) return;
    engineRef.current.attemptMove(direction);
  }, []);

  // Global Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isWardrobeOpen) {
        if (e.key === 'Escape') setIsWardrobeOpen(false);
        return;
      }

      if (gameStatus === 'idle') {
        if (e.key === ' ' || e.key === 'Enter' || e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
          handleStartGame();
        }
        return;
      }

      if (gameStatus === 'gameover') {
        if (e.key === ' ' || e.key === 'Enter') {
          handleStartGame();
        }
        return;
      }

      if (gameStatus === 'playing') {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            e.preventDefault();
            handleMove('up');
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            e.preventDefault();
            handleMove('down');
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            e.preventDefault();
            handleMove('left');
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            e.preventDefault();
            handleMove('right');
            break;
          case 'Escape':
          case 'p':
          case 'P':
            e.preventDefault();
            handlePause();
            break;
        }
      } else if (gameStatus === 'paused') {
        if (e.key === 'Escape' || e.key === ' ' || e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          handleResume();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameStatus, isWardrobeOpen, handleStartGame, handleMove, handlePause, handleResume]);

  // Touch Swipe on Canvas
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      touchStartRef.current = {
        x: e.touches[0].clientX,
        y: e.touches[0].clientY,
      };
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const dx = e.changedTouches[0].clientX - touchStartRef.current.x;
    const dy = e.changedTouches[0].clientY - touchStartRef.current.y;
    touchStartRef.current = null;

    const absX = Math.abs(dx);
    const absY = Math.abs(dy);
    const THRESHOLD = 22;

    if (Math.max(absX, absY) > THRESHOLD && gameStatus === 'playing') {
      if (absX > absY) {
        handleMove(dx > 0 ? 'right' : 'left');
      } else {
        handleMove(dy > 0 ? 'down' : 'up');
      }
    }
  };

  return (
    <div
      className="relative w-full h-full min-h-screen overflow-hidden select-none bg-sky-200"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* 3D WebGL Canvas Container */}
      <div ref={containerRef} className="absolute inset-0 w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Carrot Pickup Badges */}
      <FloatingCarrotFx items={floatingTexts} />

      {/* Top HUD */}
      <HUD
        score={score}
        sessionCarrots={sessionCarrots}
        totalCarrots={totalCarrots}
        highScore={highScore}
        lives={lives}
        difficultyLevel={difficultyLevel}
        difficultyMultiplier={difficultyMultiplier}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
        onOpenWardrobe={() => setIsWardrobeOpen(true)}
        onPause={handlePause}
        gameStatus={gameStatus}
      />

      {/* Mobile Touch D-Pad */}
      {gameStatus === 'playing' && <TouchControls onMove={handleMove} />}

      {/* Overlay Screens */}
      {gameStatus === 'idle' && (
        <StartOverlay
          onStart={handleStartGame}
          onOpenWardrobe={() => setIsWardrobeOpen(true)}
          selectedSkin={selectedSkin}
          totalCarrots={totalCarrots}
          lives={lives}
          onBuyLife={handleBuyLife}
        />
      )}

      {gameStatus === 'gameover' && (
        <GameOverOverlay
          score={score}
          sessionCarrots={sessionCarrots}
          goldenCarrots={sessionGoldenCarrots}
          totalCarrots={totalCarrots}
          highScore={highScore}
          isNewHigh={isNewHigh}
          lives={lives}
          onRetry={handleStartGame}
          onOpenWardrobe={() => setIsWardrobeOpen(true)}
          onBuyLife={handleBuyLife}
        />
      )}

      {gameStatus === 'paused' && (
        <PauseOverlay
          onResume={handleResume}
          onRestart={handleStartGame}
          onOpenWardrobe={() => setIsWardrobeOpen(true)}
        />
      )}

      {/* Bunny Wardrobe Shop Modal */}
      <SkinWardrobeModal
        isOpen={isWardrobeOpen}
        onClose={() => setIsWardrobeOpen(false)}
        totalCarrots={totalCarrots}
        unlockedSkins={unlockedSkins}
        selectedSkin={selectedSkin}
        onSelectSkin={handleSelectSkin}
        onUnlockSkin={handleUnlockSkin}
      />
    </div>
  );
};
