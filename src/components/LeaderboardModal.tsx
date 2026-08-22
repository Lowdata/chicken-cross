'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, X, RefreshCw, Flame } from 'lucide-react';
import { soundEngine } from '@/lib/game/soundEngine';
import { triggerHaptic } from '@/lib/game/haptics';

interface LeaderboardEntry {
  _id?: string;
  name: string;
  score: number;
  carrots: number;
  goldenCarrots?: number;
  skin?: string;
  createdAt?: string;
}

interface LeaderboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentHighScore: number;
}

export const LeaderboardModal: React.FC<LeaderboardModalProps> = ({
  isOpen,
  onClose,
  currentHighScore,
}) => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchLeaderboard = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/leaderboard');
      const data = await res.json();
      if (data && data.leaderboard) {
        setEntries(data.leaderboard);
      }
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchLeaderboard();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-md animate-fade-in select-none">
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl border-4 border-amber-300 max-w-md w-full p-4 sm:p-6 shadow-2xl relative max-h-[88dvh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center pb-3 border-b border-slate-100 flex-shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-2xl bg-amber-100 border border-amber-300 flex items-center justify-center">
              <Trophy className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-slate-800 flex items-center gap-1.5">
                Hall of Hoppers
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">Top global crossers &amp; carrot hoarders</p>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('tap');
                fetchLeaderboard();
              }}
              disabled={loading}
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-transform active:scale-90 cursor-pointer disabled:opacity-50"
              title="Refresh Leaderboard"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => {
                soundEngine.playClick();
                triggerHaptic('tap');
                onClose();
              }}
              className="w-9 h-9 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-transform active:scale-90 cursor-pointer"
              aria-label="Close Leaderboard"
            >
              <X className="w-5 h-5 stroke-[2.5]" />
            </button>
          </div>
        </div>

        {/* Your Highscore Pill */}
        <div className="my-2.5 bg-gradient-to-r from-amber-500 to-rose-500 text-white rounded-2xl p-2.5 px-3.5 flex items-center justify-between shadow-md flex-shrink-0">
          <div className="flex items-center gap-2">
            <Flame className="w-4 h-4 fill-white" />
            <span className="text-xs uppercase font-black tracking-wider">Your Personal Best</span>
          </div>
          <span className="text-lg font-black">{currentHighScore} pts</span>
        </div>

        {/* Leaderboard List */}
        <div className="overflow-y-auto flex-1 pr-1 space-y-1.5 my-1">
          {loading ? (
            <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-amber-500" />
              <span className="text-xs font-bold">Querying Mongo Cloud...</span>
            </div>
          ) : entries.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs font-semibold">
              No scores yet. Hop in and be the first champion!
            </div>
          ) : (
            entries.map((entry, index) => {
              const rank = index + 1;
              const medal =
                rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : `#${rank}`;
              const isTop3 = rank <= 3;

              return (
                <div
                  key={entry._id || index}
                  className={`flex items-center justify-between p-2.5 rounded-2xl border transition-all ${
                    isTop3
                      ? 'bg-amber-50/80 border-amber-200/80 shadow-sm'
                      : 'bg-slate-50 border-slate-200/70'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-7 text-center font-black text-sm text-slate-700 flex-shrink-0">
                      {medal}
                    </span>
                    <div className="min-w-0">
                      <div className="font-black text-xs sm:text-sm text-slate-800 truncate">
                        {entry.name}
                      </div>
                      <div className="text-[10px] text-slate-500 font-bold flex items-center gap-1.5">
                        <span>🥕 {entry.carrots} carrots</span>
                        {entry.goldenCarrots ? <span>• ✨ {entry.goldenCarrots} gold</span> : null}
                      </div>
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="font-black text-sm sm:text-base text-emerald-600">
                      {entry.score} <span className="text-[10px] uppercase font-bold text-slate-400">pts</span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="mt-2 pt-2 border-t border-slate-100 flex justify-end flex-shrink-0">
          <button
            onClick={() => {
              soundEngine.playClick();
              triggerHaptic('tap');
              onClose();
            }}
            className="w-full sm:w-auto px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white font-black text-xs rounded-xl shadow-md active:scale-95 transition-all cursor-pointer min-h-[38px]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
