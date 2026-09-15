import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Brain } from 'lucide-react';
import { UserProfile, Mission, HabitRing, JournalEntry, FocusSessionLog, IdentityStat, HeatmapDay, ResetLog } from '../types';

interface AIInsightCardProps {
  user: UserProfile;
  missions: Mission[];
  habits: HabitRing[];
  journalEntries?: JournalEntry[];
  focusLogs?: FocusSessionLog[];
  identityStats?: IdentityStat[];
  heatmap?: HeatmapDay[];
  resetLogs?: ResetLog[];
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  user,
  missions,
  habits,
  journalEntries = [],
  focusLogs = [],
  identityStats = [],
  heatmap = [],
  resetLogs = [],
}) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const completedMissionsCount = Array.isArray(missions) ? missions.filter(m => m.completed).length : 0;
  const totalMissionsCount = Array.isArray(missions) ? missions.length : 0;

  const fetchInsight = useCallback(async (forceRefresh = false) => {
    setLoading(true);
    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user,
          missions,
          habits,
          journalEntries,
          focusLogs,
          identityStats,
          heatmap,
          resetLogs,
          forceRefresh,
        }),
      });
      if (!response.ok) {
        throw new Error(`Insight endpoint returned status ${response.status}`);
      }
      const data = await response.json();
      if (data && data.insight) {
        setInsight(data.insight);
      } else {
        setInsight("No clear pattern yet. Keep showing up.");
      }
    } catch (err) {
      console.warn("Notice: AI insight fetch fallback:", err);
      setInsight("No clear pattern yet. Keep showing up.");
    } finally {
      setLoading(false);
    }
  }, [
    user?.level,
    user?.streak,
    user?.momentumScore,
    user?.recoveryRate,
    completedMissionsCount,
    totalMissionsCount,
    habits?.length,
    journalEntries?.length,
    focusLogs?.length,
  ]);

  useEffect(() => {
    fetchInsight(false);
  }, [fetchInsight]);

  return (
    <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.03] backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_15px_35px_rgba(0,0,0,0.35)] transition-all text-white">
      {/* Specular Top Rim Highlight */}
      <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />

      <div className="relative z-10 space-y-3 sm:space-y-4">
        {/* Minimal Header Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-white/90 shadow-sm">
              <Brain className="w-3.5 h-3.5 stroke-[2]" />
            </div>
            <span className="text-xs sm:text-sm font-medium tracking-wide text-white/90">
              Pattern check
            </span>
          </div>

          <button
            type="button"
            onClick={() => fetchInsight(true)}
            disabled={loading}
            title="Check again"
            className="w-7 h-7 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 backdrop-blur-md flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer active:scale-95 disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 stroke-[2] ${loading ? 'animate-spin text-white' : ''}`} />
          </button>
        </div>

        {/* Insight Quote Body */}
        <div className="min-h-[44px] flex flex-col justify-center">
          {loading ? (
            <div className="space-y-2 w-full animate-pulse py-1">
              <div className="h-3.5 bg-white/10 rounded-lg w-10/12"></div>
              <div className="h-3.5 bg-white/10 rounded-lg w-6/12"></div>
            </div>
          ) : (
            <p className="text-xs sm:text-sm font-normal text-white/90 leading-relaxed font-sans">
              "{insight || 'No clear pattern yet. Keep showing up.'}"
            </p>
          )}
        </div>
      </div>
    </div>
  );
};


