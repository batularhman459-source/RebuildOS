import React, { useState, useEffect, useCallback } from 'react';
import { Sparkles, RefreshCw, AlertTriangle } from 'lucide-react';
import { UserProfile, Mission, HabitRing } from '../types';

interface AIInsightCardProps {
  user: UserProfile;
  missions: Mission[];
  habits: HabitRing[];
}

export const AIInsightCard: React.FC<AIInsightCardProps> = ({
  user,
  missions,
  habits,
}) => {
  const [insight, setInsight] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  const completedMissionsCount = missions.filter((m) => m.completed).length;
  const streakDays = user.streak || 1;
  // Compute days of data collected
  const daysOfData = Math.max(
    streakDays,
    completedMissionsCount >= 3 ? 3 : completedMissionsCount > 0 ? 2 : 1
  );
  const isDataSufficient = daysOfData >= 3;
  const isFirstWeek = daysOfData < 7;

  const fetchInsight = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/insight', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user, missions, habits }),
      });
      const data = await response.json();
      if (data && data.insight) {
        setInsight(data.insight);
      } else {
        if (!isDataSufficient) {
          setInsight(
            `Insufficient data for personalized AI results. Log activity for at least 3 days to unlock personalized insights! Current data: Day ${daysOfData} of 3.`
          );
        } else {
          setInsight("You've been most productive before 11 AM over your recorded focus sessions.");
        }
      }
    } catch (err) {
      console.error("Failed to fetch AI insight:", err);
      if (!isDataSufficient) {
        setInsight(
          `Insufficient data for personalized AI results. Log activity for at least 3 days to unlock personalized insights! Current data: Day ${daysOfData} of 3.`
        );
      } else {
        setInsight("You recover quickly after setbacks. Protect that daily habit discipline.");
      }
    } finally {
      setLoading(false);
    }
  }, [user.level, user.streak, user.momentumScore, isDataSufficient, daysOfData]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return (
    <div className="bg-black/60 backdrop-blur-2xl border border-white/10 rounded-[26px] p-4 sm:p-5 space-y-3 relative overflow-hidden shadow-[0_8px_30px_rgb(0,0,0,0.5)] group before:absolute before:inset-x-0 before:top-0 before:h-[1px] before:bg-gradient-to-r before:from-transparent before:via-purple-500/40 before:to-transparent">
      {/* Top Header Row */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-xs font-mono font-bold tracking-wider text-neutral-300 uppercase">
              AI INSIGHT
            </h3>
            {!isDataSufficient ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-amber-500/15 border border-amber-500/30 text-amber-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                Data Gathering (Day {daysOfData}/3)
              </span>
            ) : isFirstWeek ? (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
                Daily Adaptive (Day {daysOfData}/7)
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                AI Insight Active
              </span>
            )}
          </div>
        </div>

        <button
          onClick={fetchInsight}
          disabled={loading}
          title="Refresh AI Analysis"
          className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-neutral-400 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-purple-400' : ''}`} />
        </button>
      </div>

      {/* Main View: Dynamic Insight */}
      <div className="min-h-[50px] flex flex-col justify-center space-y-2">
        {loading ? (
          <div className="space-y-2 w-full animate-pulse">
            <div className="h-4 bg-white/10 rounded-md w-11/12"></div>
            <div className="h-4 bg-white/5 rounded-md w-2/3"></div>
          </div>
        ) : !isDataSufficient ? (
          <div className="space-y-2.5 bg-neutral-900/60 border border-amber-500/20 rounded-2xl p-3.5">
            <div className="flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
              <p className="text-xs sm:text-sm text-neutral-200 leading-relaxed font-sans">
                You don't have sufficient data yet for personalized AI results. Complete missions and log daily entries for <strong className="text-amber-300 font-semibold">at least 3 days</strong> to unlock personalized insights!
              </p>
            </div>

            {/* 3-Day Progress Bar */}
            <div className="pt-1 space-y-1">
              <div className="flex items-center justify-between text-[10px] font-mono text-neutral-400">
                <span>DATA COLLECTION PROGRESS</span>
                <span className="text-amber-400 font-bold">DAY {daysOfData} OF 3</span>
              </div>
              <div className="w-full h-2 bg-black/60 rounded-full overflow-hidden border border-white/10">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-purple-500 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.round((daysOfData / 3) * 100))}%` }}
                />
              </div>
            </div>
          </div>
        ) : (
          <p className="text-sm sm:text-base font-medium text-neutral-100 leading-relaxed font-sans">
            "{insight}"
          </p>
        )}
      </div>
    </div>
  );
};

