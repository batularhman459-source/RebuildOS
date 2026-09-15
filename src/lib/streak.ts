import { DateTime } from 'luxon';
import {
  UserProfile,
  UserStreakState,
  StreakActionType,
  StreakEvaluationStatus,
  StreakUpdateResult,
  UserStreakRecord,
  ActivityLogEntry,
  RecoveryBonusInfo,
  StreakCompletionResult,
} from '../types';
import { calculateRecoveryBonus } from './recovery';

export const STREAK_STORAGE_KEY = 'rebuild_os_streak_record_v1';
export const ACTIVITY_LOGS_STORAGE_KEY = 'rebuild_os_activity_logs_v1';
export const MISSION_LOGS_STORAGE_KEY = 'rebuild_os_mission_logs_v1';

/**
 * Returns the user's local IANA timezone or defaults to UTC
 */
export function getUserTimezone(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC';
  } catch {
    return 'UTC';
  }
}

/**
 * Returns today's calendar date (YYYY-MM-DD) in the user's local timezone
 */
export function getLocalTodayDate(userTimezone: string = getUserTimezone()): string {
  try {
    return DateTime.now().setZone(userTimezone).toISODate() || new Date().toISOString().split('T')[0];
  } catch {
    return new Date().toISOString().split('T')[0];
  }
}

/**
 * Checks whether the user has already performed a qualifying action today
 */
export function isStreakActiveToday(
  lastActiveDate?: string,
  userTimezone: string = getUserTimezone()
): boolean {
  if (!lastActiveDate) return false;
  const todayLocal = getLocalTodayDate(userTimezone);
  const cleanLastDate = lastActiveDate.includes('T')
    ? (DateTime.fromISO(lastActiveDate, { zone: userTimezone }).toISODate() || lastActiveDate.split('T')[0])
    : lastActiveDate;
  return cleanLastDate === todayLocal;
}

export interface UpdateStreakOptions {
  userTimezone?: string;
  actionDetails?: string;
  baseBonusXp?: number;
  userId?: string;
}

/**
 * Core Modular Streak Evaluation Function
 *
 * Automatically updates user streak whenever a qualifying action is performed:
 * - Completing a Mission ('MISSION')
 * - Triggering an Emergency Reset ('EMERGENCY_RESET')
 * - Submitting a Journal Log ('JOURNAL_LOG')
 *
 * Rules:
 * - Daily Frequency Window: Increments at most once per calendar day (based on user timezone).
 * - Multi-Action Triggering: Any of the 3 actions qualifies as daily activity.
 *   Subsequent actions on the same day maintain the streak without incrementing twice.
 * - Consecutive Day (diffDays === 1): currentStreak += 1, updates longestStreak if exceeded.
 * - Same Day (diffDays === 0): currentStreak unchanged ('MAINTAINED').
 * - Missed Day (diffDays >= 2): currentStreak resets to 1 ('RESET') with recovery bonus calculation.
 * - First Activity (no prior date): currentStreak = 1, longestStreak = 1 ('STARTED').
 */
export function updateUserStreak(
  user: UserProfile | UserStreakState,
  actionType: StreakActionType,
  options: UpdateStreakOptions = {}
): StreakUpdateResult {
  const userTimezone = options.userTimezone || getUserTimezone();
  const todayLocal = getLocalTodayDate(userTimezone);
  const userId = options.userId || ('name' in user ? user.name : user.userId) || 'operator_user';
  const baseBonusXp = options.baseBonusXp ?? 30;

  // Extract previous streak variables
  const currentStreakVal = 'streak' in user ? (user.streak || 0) : (user.currentStreak || 0);
  const longestStreakVal = 'bestStreak' in user ? (user.bestStreak || currentStreakVal) : (user.longestStreak || currentStreakVal);
  const rawLastDate = user.lastActiveDate || ('lastMissionCompletedDate' in user ? user.lastMissionCompletedDate : '') || '';

  // Format last active date to YYYY-MM-DD
  let previousDateStr = '';
  if (rawLastDate) {
    try {
      if (rawLastDate.includes('T')) {
        previousDateStr = DateTime.fromISO(rawLastDate, { zone: userTimezone }).toISODate() || rawLastDate.split('T')[0];
      } else {
        previousDateStr = rawLastDate;
      }
    } catch {
      previousDateStr = rawLastDate.split('T')[0];
    }
  }

  let status: StreakEvaluationStatus;
  let newCurrent = currentStreakVal;
  let newLongest = longestStreakVal;
  let message = '';
  let recoveryBonus: RecoveryBonusInfo | null = null;

  const actionName =
    actionType === 'MISSION'
      ? 'Mission Completed'
      : actionType === 'EMERGENCY_RESET'
      ? 'Emergency Reset'
      : 'Journal Log Saved';

  if (!previousDateStr) {
    // 1. First qualifying action ever
    newCurrent = 1;
    newLongest = Math.max(newLongest, 1);
    status = 'STARTED';
    message = `${actionName}! Daily streak ignited (1 day) 🔥`;
  } else {
    try {
      const todayDt = DateTime.fromISO(todayLocal, { zone: userTimezone }).startOf('day');
      const lastDt = DateTime.fromISO(previousDateStr, { zone: userTimezone }).startOf('day');
      const diffDays = Math.round(todayDt.diff(lastDt, 'days').days);

      if (diffDays === 0) {
        // 2. Same Day: Multi-action safety -> streak is maintained, no double increment
        status = 'MAINTAINED';
        message = `Streak Protected! Daily streak already secured for today (${newCurrent} ${newCurrent === 1 ? 'day' : 'days'}).`;
      } else if (diffDays === 1) {
        // 3. Consecutive Day: Streak increments by +1
        newCurrent = (newCurrent || 0) + 1;
        newLongest = Math.max(newLongest, newCurrent);
        status = 'INCREMENTED';
        message = `Streak Extended! You are on a ${newCurrent}-day streak 🔥`;
      } else {
        // 4. Missed Day: > 24-48 hours (diffDays >= 2) -> Reset streak to 1 + award recovery bonus
        const recoveryGapDays = Math.max(1, diffDays - 1);
        recoveryBonus = calculateRecoveryBonus(recoveryGapDays, baseBonusXp);
        newCurrent = 1;
        status = 'RESET';
        message = recoveryBonus.message || `Streak restarted at 1 day. Keep showing up!`;
      }
    } catch {
      // Robust string fallback if luxon parsing encounters irregularities
      if (previousDateStr === todayLocal) {
        status = 'MAINTAINED';
        message = `Streak Protected! Daily streak already secured for today (${newCurrent} days).`;
      } else {
        newCurrent = (newCurrent || 0) + 1;
        newLongest = Math.max(newLongest, newCurrent);
        status = 'INCREMENTED';
        message = `Streak Extended to ${newCurrent} days! 🔥`;
      }
    }
  }

  // Persist updated streak record to LocalStorage
  const record: UserStreakRecord = {
    userId,
    currentStreak: newCurrent,
    longestStreak: newLongest,
    lastCompletedDate: todayLocal,
    lastActiveDate: new Date().toISOString(),
    lastActionType: actionType,
    updatedAt: new Date().toISOString(),
  };

  try {
    localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(record));

    // Append to activity log history
    const newActivityLog: ActivityLogEntry = {
      id: `act-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      actionType,
      actionDetails: options.actionDetails,
      completedAt: new Date().toISOString(),
      userTimezone,
    };
    const existingLogs: ActivityLogEntry[] = JSON.parse(
      localStorage.getItem(ACTIVITY_LOGS_STORAGE_KEY) || '[]'
    );
    existingLogs.unshift(newActivityLog);
    localStorage.setItem(ACTIVITY_LOGS_STORAGE_KEY, JSON.stringify(existingLogs.slice(0, 100)));
  } catch (e) {
    console.warn('Failed to persist local activity streak log:', e);
  }

  return {
    userId,
    actionType,
    currentStreak: newCurrent,
    longestStreak: newLongest,
    lastActiveDate: todayLocal,
    status,
    message,
    recoveryBonus,
    actionDetails: options.actionDetails,
  };
}

/**
 * Asynchronous Streak Updater with Server Sync & Local Fallback
 */
export async function updateUserStreakAsync(
  user: UserProfile | UserStreakState,
  actionType: StreakActionType,
  options: UpdateStreakOptions = {}
): Promise<StreakUpdateResult> {
  const userTimezone = options.userTimezone || getUserTimezone();
  const userId = options.userId || ('name' in user ? user.name : user.userId) || 'operator_user';
  const baseBonusXp = options.baseBonusXp ?? 30;

  try {
    const response = await fetch('/api/streak/update', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId,
        actionType,
        actionDetails: options.actionDetails,
        userTimezone,
        currentStreak: 'streak' in user ? user.streak : user.currentStreak,
        longestStreak: 'bestStreak' in user ? user.bestStreak : user.longestStreak,
        lastActiveDate: user.lastActiveDate || ('lastMissionCompletedDate' in user ? user.lastMissionCompletedDate : ''),
        baseBonusXp,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      if (data && typeof data.currentStreak === 'number' && data.status) {
        // Synchronize local storage record
        try {
          const record: UserStreakRecord = {
            userId,
            currentStreak: data.currentStreak,
            longestStreak: data.longestStreak || data.currentStreak,
            lastCompletedDate: data.lastActiveDate || getLocalTodayDate(userTimezone),
            lastActiveDate: new Date().toISOString(),
            lastActionType: actionType,
            updatedAt: new Date().toISOString(),
          };
          localStorage.setItem(STREAK_STORAGE_KEY, JSON.stringify(record));
        } catch {}
        return data as StreakUpdateResult;
      }
    }
  } catch (e) {
    console.warn('Backend /api/streak/update unreachable, falling back to client evaluation:', e);
  }

  // Fallback to local synchronous evaluation
  return updateUserStreak(user, actionType, options);
}

/**
 * Backward compatibility wrapper for mission streak completion
 */
export function evaluateStreakLocally(
  user: UserProfile,
  missionId: string,
  baseMissionXp: number = 30,
  userTimezone: string = getUserTimezone()
): StreakCompletionResult {
  const result = updateUserStreak(user, 'MISSION', {
    userTimezone,
    baseBonusXp: baseMissionXp,
    actionDetails: missionId,
  });

  return {
    userId: result.userId,
    missionId,
    currentStreak: result.currentStreak,
    longestStreak: result.longestStreak,
    status: result.status,
    lastCompletedDate: result.lastActiveDate,
    message: result.message,
    recoveryBonus: result.recoveryBonus,
  };
}

/**
 * Backward compatibility wrapper for mission events
 */
export async function completeMissionStreakEvent(
  user: UserProfile,
  missionId: string,
  baseMissionXp: number = 30,
  customTimezone?: string
): Promise<StreakCompletionResult> {
  const result = await updateUserStreakAsync(user, 'MISSION', {
    userTimezone: customTimezone,
    baseBonusXp: baseMissionXp,
    actionDetails: missionId,
  });

  return {
    userId: result.userId,
    missionId,
    currentStreak: result.currentStreak,
    longestStreak: result.longestStreak,
    status: result.status,
    lastCompletedDate: result.lastActiveDate,
    message: result.message,
    recoveryBonus: result.recoveryBonus,
  };
}
