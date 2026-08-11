import { RecoveryEvent, UserProfile, RebuildOSState } from '../types';

export const INITIAL_RECOVERY_EVENTS: RecoveryEvent[] = [
  { id: 'rec-1', date: '2026-07-12', daysInactive: 1, points: 95, source: 'mission' },
  { id: 'rec-2', date: '2026-07-19', daysInactive: 0, points: 100, source: 'emergency_reset' },
  { id: 'rec-3', date: '2026-07-26', daysInactive: 2, points: 90, source: 'mission' },
  { id: 'rec-4', date: '2026-08-02', daysInactive: 1, points: 95, source: 'mission' },
];

/**
 * Recovery Points mapping based on days inactive:
 * Same day: 100
  1 day: 95
  2 days: 90
  3 days: 82
  4 days: 74
  5 days: 65
  6 days: 55
  7+ days: 45
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
 * Formats recovery days for display (e.g. 0 -> "Same day", 1 -> "1 day", 1.2 -> "1.2 days")
 */
export function formatRecoveryDays(days: number): string {
  if (days === 0) return 'Same day';
  if (days === 1) return '1 day';
  return `${days} days`;
}

/**
 * Processes a meaningful mission completion to check for a setback recovery.
 * Note: 1 missed day is treated as a grace period. 2+ days without completed missions
 * (diffDays >= 2) triggers a recovery event upon return.
 */
export function processMissionCompletionRecovery(user: UserProfile): UserProfile {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastDateStr = user.lastMissionCompletedDate || todayStr;

  const currentEvents = user.recoveryEvents && user.recoveryEvents.length > 0
    ? user.recoveryEvents
    : INITIAL_RECOVERY_EVENTS;

  if (lastDateStr === todayStr) {
    // Already completed a mission today
    const metrics = computeRecoveryMetrics(currentEvents);
    return {
      ...user,
      lastMissionCompletedDate: todayStr,
      recoveryEvents: currentEvents,
      ...metrics,
    };
  }

  const lastDate = new Date(lastDateStr + 'T00:00:00');
  const todayDate = new Date(todayStr + 'T00:00:00');
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let updatedEvents = [...currentEvents];
  // One missed day is grace period (diffDays <= 1).
  // diffDays >= 2 means 2+ missed days (e.g. 2 days inactive), starting a recovery state.
  if (diffDays >= 2) {
    const daysInactive = diffDays - 1; // Deducing 1-day grace period
    const points = calculateRecoveryPoints(daysInactive);
    const newEvent: RecoveryEvent = {
      id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      date: todayStr,
      daysInactive,
      points,
      source: 'mission',
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

/**
 * Processes Emergency Reset Protocol completion to record a recovery event.
 * Anti-exploit guard: Emergency Reset triggers a recovery event ONLY when the user
 * is actually in a recovery state (missed 2+ consecutive days, diffDays >= 2).
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

  // ANTI-EXPLOIT: Only record a recovery event if the user was in a true recovery state (2+ missed days)
  if (diffDays >= 2) {
    const daysInactive = diffDays - 1; // Subtract 1-day grace period
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
