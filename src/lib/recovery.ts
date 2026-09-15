import { RecoveryEvent, UserProfile, RebuildOSState, RecoveryBonusInfo, RecoverySpeedCategory } from '../types';

export const INITIAL_RECOVERY_EVENTS: RecoveryEvent[] = [
  { id: 'rec-1', date: '2026-08-01', daysInactive: 1, points: 95, source: 'mission' },
  { id: 'rec-2', date: '2026-08-10', daysInactive: 2, points: 90, source: 'emergency_reset' },
  { id: 'rec-3', date: '2026-08-18', daysInactive: 1, points: 95, source: 'mission' },
];

/**
 * Calculates Recovery Speed Bonus based on Downtime Duration (the recovery gap in calendar days):
 *
 * 1. ⚡ The Snap-Back (1-Day Gap):
 *    - User missed exactly 1 deadline day and returned immediately the next calendar day.
 *    - Multiplier: +50% Bonus XP (0.50)
 *    - Framing: "Epic Recovery! You only missed 1 day and bounced right back. Here is a +50% XP Speed Bonus for your resilience! 🔥"
 *
 * 2. 🐢 The Slow Bounce (2 to 7-Day Gap):
 *    - User was gone for a few days or a week, but didn't abandon the app.
 *    - Multipliers:
 *      * Missed 2 Days: +30% Bonus XP (0.30)
 *      * Missed 3 Days: +10% Bonus XP (0.10)
 *      * Missed 4 to 7 Days: No speed bonus, but recognized as a Slow Bounce restart
 *
 * 3. 🍂 The Re-Activation (> 7-Day Gap):
 *    - Inactive for over a week (>7 days).
 *    - Treated as a fresh restart. Standard mission XP with "Welcome Back" greeting.
 */
export function calculateRecoveryBonus(
  recoveryGapDays: number,
  baseMissionXp: number = 30
): RecoveryBonusInfo {
  // If no gap (e.g. same day 0 or negative), no recovery speed bonus
  if (recoveryGapDays <= 0) {
    return {
      recoveryGapDays: 0,
      category: 'NONE',
      multiplier: 0,
      bonusXp: 0,
      totalXp: baseMissionXp,
      title: 'Standard Mission',
      badgeLabel: 'Active Streak',
      message: 'Keep stacking daily consistency!',
    };
  }

  if (recoveryGapDays === 1) {
    // ⚡ The Snap-Back (1-Day Gap): +50% Bonus XP
    const multiplier = 0.5;
    const bonusXp = Math.round(baseMissionXp * multiplier);
    return {
      recoveryGapDays: 1,
      category: 'SNAP_BACK',
      multiplier,
      bonusXp,
      totalXp: baseMissionXp + bonusXp,
      title: '⚡ Epic Snap-Back Comeback',
      badgeLabel: '+50% SPEED BONUS',
      message: 'Epic Recovery! You only missed 1 day and bounced right back. Here is a +50% XP Speed Bonus for your resilience! 🔥',
    };
  }

  if (recoveryGapDays >= 2 && recoveryGapDays <= 3) {
    // 🐢 The Slow Bounce (2-3 Days Gap): +30% Bonus XP
    const multiplier = 0.3;
    const bonusXp = Math.round(baseMissionXp * multiplier);
    return {
      recoveryGapDays,
      category: 'SLOW_BOUNCE',
      multiplier,
      bonusXp,
      totalXp: baseMissionXp + bonusXp,
      title: '🐢 Slow Bounce Comeback',
      badgeLabel: '+30% SPEED BONUS',
      message: `Great resilience! You bounced back after ${recoveryGapDays} days. Here is a +30% XP Speed Bonus for getting back on track! 🔥`,
    };
  }

  if (recoveryGapDays >= 4 && recoveryGapDays <= 7) {
    // 🐢 The Slow Bounce (4-7 Days Gap): Standard XP
    return {
      recoveryGapDays,
      category: 'SLOW_BOUNCE',
      multiplier: 0,
      bonusXp: 0,
      totalXp: baseMissionXp,
      title: '🐢 Momentum Rebuilt',
      badgeLabel: 'RESILIENCE BOUNCE',
      message: `Welcome back! You overcame a ${recoveryGapDays}-day hiatus and re-anchored your habit today.`,
    };
  }

  // 🍂 The Re-Activation (> 7 Days Gap): Fresh Restart
  return {
    recoveryGapDays,
    category: 'RE_ACTIVATION',
    multiplier: 0,
    bonusXp: 0,
    totalXp: baseMissionXp,
    title: '🍂 System Re-Activation',
    badgeLabel: 'WELCOME BACK',
    message: 'Welcome back! Today is a clean slate. Your baseline identity is ready to rebuild.',
  };
}

/**
 * Recovery Points mapping based on days inactive:
 * Same day: 100
 * 1 day: 95
 * 2 days: 90
 * 3 days: 82
 * 4 days: 74
 * 5 days: 65
 * 6 days: 55
 * 7+ days: 45
 */
export function calculateRecoveryPoints(daysInactive: number): number {
  if (daysInactive <= 0) return 100;
  if (daysInactive === 1) return 95;
  if (daysInactive === 2) return 90;
  if (daysInactive === 3) return 82;
  if (daysInactive === 4) return 74;
  if (daysInactive === 5) return 65;
  if (daysInactive === 6) return 55;
  return 45;
}

/**
 * Calculates rolling average Recovery Rate, Avg Recovery Days, and Fastest Recovery Days
 * from the user's last 5 recovery events.
 */
export function computeRecoveryMetrics(events: RecoveryEvent[]) {
  const list = events && events.length > 0 ? events : INITIAL_RECOVERY_EVENTS;
  const recentEvents = list.slice(-5); // Rolling 5-event window

  const totalPoints = recentEvents.reduce((acc, e) => acc + e.points, 0);
  const avgRate = Math.round(totalPoints / recentEvents.length);

  const totalDays = recentEvents.reduce((acc, e) => acc + e.daysInactive, 0);
  const avgDays = parseFloat((totalDays / recentEvents.length).toFixed(1));

  const fastestDays = Math.min(...list.map((e) => e.daysInactive));

  return {
    recoveryRate: Math.min(100, Math.max(0, avgRate)),
    avgRecoveryDays: avgDays,
    fastestRecoveryDays: fastestDays,
  };
}

/**
 * Returns a textual rating label based on recovery score percentage
 */
export function getRecoveryRatingLabel(score: number): string {
  if (score >= 92) return 'Excellent';
  if (score >= 85) return 'Strong';
  if (score >= 75) return 'Steady';
  if (score >= 60) return 'Building';
  return 'Resetting';
}

/**
 * Formats recovery days for display (e.g. 0 -> "Same day", 1 -> "1 day", 1.1 -> "1.1 days")
 */
export function formatRecoveryDays(days: number): string {
  if (days === 0) return 'Same day';
  if (days === 1) return '1 day';
  return `${days} days`;
}

/**
 * Processes a meaningful mission completion to check for a setback recovery.
 * If diffDays is not provided, it calculates diffDays from user's lastMissionCompletedDate.
 */
export function processMissionCompletionRecovery(user: UserProfile, explicitDiffDays?: number): {
  updatedUser: UserProfile;
  recoveryBonus: RecoveryBonusInfo | null;
} {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDateStr = user.lastMissionCompletedDate || todayStr;

  let diffDays = explicitDiffDays;
  if (typeof diffDays !== 'number') {
    const lastDate = new Date(lastDateStr + 'T00:00:00');
    const todayDate = new Date(todayStr + 'T00:00:00');
    const diffTime = Math.max(0, todayDate.getTime() - lastDate.getTime());
    diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
  }

  const currentEvents = user.recoveryEvents && user.recoveryEvents.length > 0
    ? user.recoveryEvents
    : INITIAL_RECOVERY_EVENTS;

  // If diffDays <= 1, streak was maintained or consecutively incremented (no recovery gap)
  if (diffDays <= 1) {
    const metrics = computeRecoveryMetrics(currentEvents);
    return {
      updatedUser: {
        ...user,
        lastMissionCompletedDate: todayStr,
        recoveryEvents: currentEvents,
        ...metrics,
      },
      recoveryBonus: null,
    };
  }

  // Downtime Duration (Missed deadline days) = diffDays - 1
  const recoveryGapDays = diffDays - 1;
  const points = calculateRecoveryPoints(recoveryGapDays);
  
  const newEvent: RecoveryEvent = {
    id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    date: todayStr,
    daysInactive: recoveryGapDays,
    points,
    source: 'mission',
  };

  const updatedEvents = [...currentEvents, newEvent];
  const metrics = computeRecoveryMetrics(updatedEvents);
  const recoveryBonus = calculateRecoveryBonus(recoveryGapDays, 30);

  return {
    updatedUser: {
      ...user,
      lastMissionCompletedDate: todayStr,
      recoveryEvents: updatedEvents,
      ...metrics,
    },
    recoveryBonus,
  };
}

/**
 * Processes Emergency Reset Protocol completion to record a recovery event.
 */
export function processEmergencyResetRecovery(user: UserProfile): UserProfile {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDateStr = user.lastMissionCompletedDate || todayStr;

  const lastDate = new Date(lastDateStr + 'T00:00:00');
  const todayDate = new Date(todayStr + 'T00:00:00');
  const diffTime = Math.max(0, todayDate.getTime() - lastDate.getTime());
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  const currentEvents = user.recoveryEvents && user.recoveryEvents.length > 0
    ? user.recoveryEvents
    : INITIAL_RECOVERY_EVENTS;

  let updatedEvents = [...currentEvents];

  if (diffDays >= 2) {
    const daysInactive = diffDays - 1;
    const points = calculateRecoveryPoints(daysInactive);
    const newEvent: RecoveryEvent = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: todayStr,
      daysInactive,
      points,
      source: 'emergency_reset',
    };
    updatedEvents.push(newEvent);
  }

  const metrics = computeRecoveryMetrics(updatedEvents);

  return {
    ...user,
    lastMissionCompletedDate: todayStr,
    recoveryEvents: updatedEvents,
    ...metrics,
  };
}
