import { IdentityStat, Mission, UserProfile, ExecutionStats } from '../types';

export interface ProgressionTier {
  minLevel: number;
  title: string;
  message: string;
}

export const PROGRESSION_TIERS: ProgressionTier[] = [
  { minLevel: 1, title: 'Starter', message: 'Welcome to RebuildOS. Your journey of identity reconstruction begins today.' },
  { minLevel: 5, title: 'Explorer', message: 'You are exploring your limits and establishing foundational daily momentum.' },
  { minLevel: 10, title: 'Builder', message: 'You earned the title Builder. Systems are taking form.' },
  { minLevel: 15, title: 'Apprentice', message: 'Mastering the craft of daily focus and intentional action.' },
  { minLevel: 20, title: 'Craftsman', message: 'Precision in execution is becoming your second nature.' },
  { minLevel: 25, title: 'Pathfinder', message: 'Forging new standards where others see obstacles.' },
  { minLevel: 30, title: 'Disciplined', message: "Discipline isn't something you chase anymore. You're becoming someone who lives it." },
  { minLevel: 35, title: 'Reliable', message: 'Your promises to yourself are non-negotiable.' },
  { minLevel: 40, title: 'Resilient', message: 'Setbacks no longer derail you—they refine you.' },
  { minLevel: 45, title: 'Committed', message: 'Unwavering commitment to the identity you are building.' },
  { minLevel: 50, title: 'Architect', message: 'Architect of your own reality and daily standards.' },
  { minLevel: 55, title: 'Strategist', message: 'Operating with high strategic intent and mental clarity.' },
  { minLevel: 60, title: 'Guardian', message: "Your consistency is no longer luck—it's part of who you are." },
  { minLevel: 65, title: 'Iron Will', message: 'Forged in the fire of daily discipline and kept promises.' },
  { minLevel: 70, title: 'Unshakeable', message: 'Grounded in deep internal trust and purpose.' },
  { minLevel: 75, title: 'Master', message: 'Mastery over mind, focus, and long-term execution.' },
  { minLevel: 80, title: 'Elite', message: 'Standing in the top tier of consistency and operational excellence.' },
  { minLevel: 85, title: 'Exceptional', message: 'Demonstrating exceptional standards day in and day out.' },
  { minLevel: 90, title: 'Legend', message: 'A living testament to the power of continuous daily progression.' },
  { minLevel: 95, title: 'Becoming Him', message: 'You are no longer striving. You are becoming the vision.' },
  { minLevel: 100, title: 'The Standard', message: "The Standard\n\nYou didn't finish the journey.\n\nYou became the kind of person who keeps walking." },
];

/**
 * XP required to advance from current level to next level
 * Formula: 100 + (Current Level * 20)
 */
export function getXpToNextLevel(level: number): number {
  return 100 + (level * 20);
}

/**
 * Total cumulative XP required to reach a specific level starting from level 1
 */
export function getCumulativeXpForLevel(targetLevel: number): number {
  let total = 0;
  for (let l = 1; l < targetLevel; l++) {
    total += getXpToNextLevel(l);
  }
  return total;
}

/**
 * Get title for a given level
 */
export function getTitleForLevel(level: number): string {
  let title = PROGRESSION_TIERS[0].title;
  for (const tier of PROGRESSION_TIERS) {
    if (level >= tier.minLevel) {
      title = tier.title;
    }
  }
  return title;
}

/**
 * Get progression tier info for a given level
 */
export function getTierForLevel(level: number): ProgressionTier {
  let matched = PROGRESSION_TIERS[0];
  for (const tier of PROGRESSION_TIERS) {
    if (level >= tier.minLevel) {
      matched = tier;
    }
  }
  return matched;
}

export function getMetricRatingLabel(score: number): { label: string; colorClass: string } {
  if (score >= 90) return { label: 'Excellent', colorClass: 'text-orange-400' };
  if (score >= 80) return { label: 'Strong', colorClass: 'text-orange-400' };
  if (score >= 70) return { label: 'Good', colorClass: 'text-orange-300' };
  if (score >= 60) return { label: 'Fair', colorClass: 'text-amber-400' };
  return { label: 'Rebuilding', colorClass: 'text-rose-400' };
}

/**
 * Momentum calculation formula
 * Momentum = Execution * 0.7 + Recovery * 0.3
 */
export function calculateMomentum(execution: number, recovery: number): number {
  return Math.min(100, Math.max(0, Math.round(execution * 0.7 + recovery * 0.3)));
}

/**
 * Standardized XP Rewards
 */
export const XP_REWARDS = {
  // Missions
  SMALL_MISSION: 20,
  MEDIUM_MISSION: 35,
  HARD_MISSION: 50,
  BONUS_CHALLENGE: 15,

  // Journal
  DAILY_JOURNAL: 15,
  WEEKLY_REVIEW: 50,

  // Recovery
  EMERGENCY_RESET: 25,
  RETURNED_AFTER_MISSING: 75,

  // Focus
  FOCUS_25_MIN: 20,
  FOCUS_50_MIN: 40,
  FOCUS_90_MIN: 60,

  // Milestones
  STREAK_7_DAY: 100,
  STREAK_30_DAY: 300,
  STREAK_100_DAY: 1000,
};

/**
 * Convert hidden XP to displayed stat score (0-99/100)
 * Uses square-root scaling: Display = floor(sqrt(XP))
 * Early progress (e.g. 20 -> 30) is fast, high progress (e.g. 90 -> 91) requires much more XP.
 */
export function xpToStatScore(xp: number): number {
  if (xp <= 0) return 10;
  const score = Math.floor(Math.sqrt(xp));
  return Math.min(99, Math.max(10, score));
}

/**
 * Convert stat score back to baseline hidden XP
 */
export function statScoreToXp(score: number): number {
  return score * score;
}

export type StatActionType =
  | 'COMPLETE_SMALL_MISSION'
  | 'COMPLETE_HARD_MISSION'
  | 'FINISH_FOCUS_SESSION'
  | 'JOURNAL_ENTRY'
  | 'WEEKLY_REVIEW'
  | 'EMERGENCY_RESET'
  | 'RETURN_AFTER_MISSING_DAYS';

/**
 * Action XP Rewards for hidden stat progression
 */
export const STAT_ACTION_XP: Record<StatActionType, Record<string, number>> = {
  COMPLETE_SMALL_MISSION: {
    Discipline: 5,
    Focus: 2,
    Consistency: 3,
    'Self-Trust': 1,
    Resilience: 0,
  },
  COMPLETE_HARD_MISSION: {
    Discipline: 12,
    Focus: 5,
    Consistency: 5,
    'Self-Trust': 8,
    Resilience: 2,
  },
  FINISH_FOCUS_SESSION: {
    Discipline: 3,
    Focus: 10,
    Consistency: 2,
    'Self-Trust': 2,
    Resilience: 0,
  },
  JOURNAL_ENTRY: {
    Discipline: 2,
    Focus: 0,
    Consistency: 5,
    'Self-Trust': 2,
    Resilience: 1,
  },
  WEEKLY_REVIEW: {
    Discipline: 4,
    Focus: 2,
    Consistency: 6,
    'Self-Trust': 3,
    Resilience: 2,
  },
  EMERGENCY_RESET: {
    Discipline: 1,
    Focus: 2,
    Consistency: 2,
    'Self-Trust': 3,
    Resilience: 10,
  },
  RETURN_AFTER_MISSING_DAYS: {
    Discipline: 2,
    Focus: 0,
    Consistency: 4,
    'Self-Trust': 4,
    Resilience: 15,
  },
};

export const CORE_ATTRIBUTES = [
  'Discipline',
  'Focus',
  'Consistency',
  'Resilience',
  'Self-Trust',
  'Self Respect',
  'Health',
  'Purpose',
];

/**
 * Apply XP earned directly to a chosen target attribute and update its score
 */
export function applyMissionXpToStat(
  stats: IdentityStat[],
  targetAttributeName: string | undefined,
  xpGain: number
): IdentityStat[] {
  const targetName = targetAttributeName || 'Discipline';

  return stats.map((stat) => {
    const isMatch =
      stat.name.toLowerCase() === targetName.toLowerCase() ||
      (targetName.toLowerCase() === 'self-trust' && stat.name.toLowerCase() === 'confidence') ||
      (targetName.toLowerCase() === 'confidence' && stat.name.toLowerCase() === 'self-trust');

    if (!isMatch) return stat;

    const currentXp = stat.xp ?? statScoreToXp(stat.score);
    const newXp = Math.max(0, currentXp + xpGain);
    const oldScore = stat.score;
    const newScore = xpToStatScore(newXp);
    const scoreDiff = newScore - oldScore;

    let trend: 'up' | 'down' | 'stable' = stat.trend;
    if (scoreDiff > 0) trend = 'up';
    else if (scoreDiff < 0) trend = 'down';

    return {
      ...stat,
      xp: newXp,
      score: newScore,
      weeklyChange: (stat.weeklyChange || 0) + (xpGain > 0 ? Math.max(1, scoreDiff) : scoreDiff),
      trend,
    };
  });
}

/**
 * Apply hidden XP gains to stats based on completed action
 */
export function applyActionToStats(
  stats: IdentityStat[],
  action: StatActionType
): IdentityStat[] {
  const gains = STAT_ACTION_XP[action] || {};

  return stats.map((stat) => {
    // Map Confidence or Self-Trust interchangeably
    const lookupKey = stat.name === 'Confidence' ? 'Self-Trust' : stat.name;
    const gainXp = gains[lookupKey] || 0;

    const currentXp = stat.xp ?? statScoreToXp(stat.score);
    const newXp = currentXp + gainXp;
    const oldScore = stat.score;
    const newScore = xpToStatScore(newXp);
    const scoreDiff = newScore - oldScore;

    let trend: 'up' | 'down' | 'stable' = stat.trend;
    if (scoreDiff > 0) trend = 'up';
    else if (scoreDiff < 0) trend = 'down';

    const statName = stat.name === 'Confidence' ? 'Self-Trust' : stat.name;

    return {
      ...stat,
      name: statName,
      xp: newXp,
      score: newScore,
      weeklyChange: (stat.weeklyChange || 0) + (gainXp > 0 ? Math.max(1, scoreDiff) : 0),
      trend,
    };
  });
}

/**
 * Apply protected decay for missed days.
 * Ensures hard-earned progress is preserved (e.g. 82 -> 81 max, never halving).
 */
export function applyMissedDaysDecay(
  stats: IdentityStat[],
  missedDays: number
): IdentityStat[] {
  if (missedDays <= 0) return stats;

  return stats.map((stat) => {
    const currentXp = stat.xp ?? statScoreToXp(stat.score);
    const currentScore = stat.score;
    // Cap maximum score drop to 1 point per missed day (max 2 points total)
    const minProtectedScore = Math.max(10, currentScore - Math.min(2, missedDays));
    const minProtectedXp = statScoreToXp(minProtectedScore);

    const xpLoss = missedDays * 12; // Small XP decay
    const newXp = Math.max(minProtectedXp, currentXp - xpLoss);
    const newScore = xpToStatScore(newXp);
    const scoreDiff = newScore - currentScore;

    const statName = stat.name === 'Confidence' ? 'Self-Trust' : stat.name;

    return {
      ...stat,
      name: statName,
      xp: newXp,
      score: newScore,
      weeklyChange: (stat.weeklyChange || 0) + scoreDiff,
      trend: newScore < currentScore ? 'down' : stat.trend,
    };
  });
}

export interface MissionCategoryDef {
  id: string;
  name: string;
  iconName: string;
  color: string;
  attribute: string;
}

export const MISSION_CATEGORIES: MissionCategoryDef[] = [
  { id: 'focus', name: 'Deep Work & Focus', iconName: 'Target', color: '#06B6D4', attribute: 'Focus' },
  { id: 'health', name: 'Health & Vitality', iconName: 'HeartPulse', color: '#5E1473', attribute: 'Health' },
  { id: 'discipline', name: 'Discipline & Routine', iconName: 'Shield', color: '#EC4899', attribute: 'Discipline' },
  { id: 'mind', name: 'Mind & Learning', iconName: 'Brain', color: '#A855F7', attribute: 'Consistency' },
  { id: 'fitness', name: 'Movement & Fitness', iconName: 'Activity', color: '#F97316', attribute: 'Health' },
  { id: 'purpose', name: 'Purpose & Strategy', iconName: 'Compass', color: '#EAB308', attribute: 'Purpose' },
  { id: 'selftrust', name: 'Self-Trust & Promises', iconName: 'Sparkles', color: '#3B82F6', attribute: 'Self-Trust' },
  { id: 'resilience', name: 'Resilience & Reset', iconName: 'RotateCcw', color: '#5E1473', attribute: 'Resilience' },
];

export interface MissionPriorityDef {
  id: 'PRIMARY' | 'SECONDARY' | 'BONUS';
  label: string;
  shortLabel: string;
  baseXp: number;
  color: string;
  badgeClass: string;
}

export const MISSION_PRIORITIES: MissionPriorityDef[] = [
  { id: 'PRIMARY', label: 'Core Priority', shortLabel: 'Critical', baseXp: 50, color: 'text-cyan-400', badgeClass: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' },
  { id: 'SECONDARY', label: 'Standard Priority', shortLabel: 'High', baseXp: 30, color: 'text-amber-400', badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40' },
  { id: 'BONUS', label: 'Micro / Bonus', shortLabel: 'Bonus', baseXp: 20, color: 'text-[#e472ff]', badgeClass: 'bg-[#5E1473]/30 text-[#e472ff] border-[#5E1473]/60' },
];

export function computeExecutionStats(missions: Mission[], user?: UserProfile): ExecutionStats {
  const totalCreated = missions.length;
  const completedMissions = missions.filter((m) => m.state === 'COMPLETED' || m.completed);
  const totalCompleted = completedMissions.length;
  const totalMissed = missions.filter((m) => m.state === 'MISSED').length;

  const finishedDecisive = totalCompleted + totalMissed;
  const executionRate =
    finishedDecisive > 0
      ? Math.round((totalCompleted / finishedDecisive) * 100)
      : totalCreated > 0
      ? Math.round((totalCompleted / totalCreated) * 100)
      : 100;

  const todayStr = new Date().toISOString().split('T')[0];
  const dailyCompleted = completedMissions.filter((m) => {
    if (m.completedAt) return m.completedAt.startsWith(todayStr);
    return true;
  }).length;

  const calculatedMissionsFocusMinutes = completedMissions.reduce(
    (sum, m) => sum + (m.durationMinutes || 25),
    0
  );

  const totalFocusMinutes = Math.max(user?.totalFocusMinutes || 0, calculatedMissionsFocusMinutes);
  const totalSessions = Math.max(user?.totalSessionsCompleted || 0, totalCompleted);

  return {
    totalMissionsCreated: totalCreated,
    totalMissionsCompleted: totalCompleted,
    totalMissionsMissed: totalMissed,
    executionRate: Math.min(100, Math.max(0, executionRate)),
    dailyCompletedCount: dailyCompleted,
    weeklyCompletedCount: totalCompleted,
    totalFocusMinutes,
    totalSessionsCompleted: totalSessions,
  };
}
