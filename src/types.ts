export interface RecoveryEvent {
  id: string;
  date: string; // YYYY-MM-DD
  daysInactive: number; // e.g. 0 (same day), 1, 2, 3...
  points: number; // 100, 95, 90, 82, 74, 65, 55, 45
  source?: 'mission' | 'emergency_reset';
}

export type MissionState = 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'MISSED';
export type MissionPriority = 'PRIMARY' | 'SECONDARY' | 'BONUS';

export interface ExecutionStats {
  totalMissionsCreated: number;
  totalMissionsCompleted: number;
  totalMissionsMissed: number;
  executionRate: number; // 0-100 percentage
  dailyCompletedCount: number;
  weeklyCompletedCount: number;
  totalFocusMinutes: number;
  totalSessionsCompleted: number;
}

export interface UserProfile {
  name: string;
  title: string;
  level: number;
  xp: number;
  xpToNextLevel: number;
  streak: number;
  bestStreak: number;
  recoveryRate: number; // percentage e.g. 92
  momentumScore: number; // 0-100
  joinedDate: string;
  lastAppOpenDate?: string;
  lastMissionCompletedDate?: string;
  lastActiveDate?: string;
  lastActionType?: StreakActionType;
  recoveryEvents?: RecoveryEvent[];
  avgRecoveryDays?: number;
  fastestRecoveryDays?: number;
  trialStartDate?: string; // ISO string e.g. "2026-08-09T08:00:00.000Z"
  subscriptionStatus?: 'trial' | 'active' | 'expired';
  subscriptionPlan?: 'monthly' | 'annual' | 'pro';
  executionStats?: ExecutionStats;
  totalFocusMinutes?: number;
  totalSessionsCompleted?: number;
  executionRate?: number;
}

export interface HabitRing {
  id: string;
  name: string;
  current: number;
  target: number;
  unit: string;
  color: string; // hex or tailwind class
  icon: string;
  lifeArea: string;
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  category?: string; // e.g. 'Focus', 'Health', 'Discipline', 'Mind', 'Fitness', 'Work', 'Personal'
  priority?: MissionPriority; // 'PRIMARY' | 'SECONDARY' | 'BONUS'
  type?: 'PRIMARY' | 'SECONDARY' | 'BONUS'; // backward compatibility
  state?: MissionState; // 'PLANNED' | 'ACTIVE' | 'COMPLETED' | 'MISSED'
  completed: boolean; // true when state === 'COMPLETED'
  xpReward: number;
  durationMinutes?: number;
  targetAttribute?: string;
  dueDate?: string; // YYYY-MM-DD
  dueTime?: string; // HH:MM (24h)
  createdAt?: string; // ISO string
  startedAt?: string; // ISO string
  completedAt?: string; // ISO string (recorded completion time)
  completedDate?: string; // YYYY-MM-DD (local completion date)
  archivedAt?: string; // ISO string when archived
  isArchived?: boolean;
  statBoost?: {
    stat: string;
    amount: number;
  };
}

export interface IdentityStat {
  id: string;
  name: string;
  score: number; // 0-100 (computed via sqrt(xp))
  xp?: number; // hidden XP e.g. 6724
  description: string;
  levelLabel: string;
  trend: 'up' | 'down' | 'stable';
  weeklyChange?: number; // e.g. +4, -2
}

export interface LifeArea {
  id: string;
  name: string;
  percentage: number; // 0-100
  focusTarget: string;
  iconName: string;
  color: string;
}

export interface JournalEntry {
  id: string;
  date: string; // YYYY-MM-DD
  biggestWin: string;
  lessonLearned: string;
  tomorrowsFocus: string;
  moodScore: number; // 1-5
  energyScore: number; // 1-5
}

export interface ResetLog {
  id: string;
  timestamp: string;
  completedSteps: number;
  triggerReason?: string;
}

export interface FocusSessionLog {
  id: string;
  missionId?: string;
  missionTitle: string;
  durationMinutes: number;
  date: string; // ISO string e.g. "2026-08-08T00:23:00.000Z"
  completionStatus: 'FINISHED' | 'PARTIAL' | 'DISTRACTED' | 'TOGGLED';
  distractionReason?: string;
}

export interface HeatmapDay {
  date: string; // YYYY-MM-DD
  count: number; // 0 to 4
  xpEarned: number;
}

export type RecoverySpeedCategory = 'SNAP_BACK' | 'SLOW_BOUNCE' | 'RE_ACTIVATION' | 'NONE';

export interface RecoveryBonusInfo {
  recoveryGapDays: number; // The number of missed calendar days (downtime duration)
  category: RecoverySpeedCategory; // SNAP_BACK, SLOW_BOUNCE, RE_ACTIVATION, NONE
  multiplier: number; // e.g., 0.50 (+50%), 0.30 (+30%), 0.10 (+10%), 0 (0%)
  bonusXp: number; // calculated bonus XP amount
  totalXp: number; // base XP + bonus XP
  title: string;
  badgeLabel: string;
  message: string;
}

export type StreakEvaluationStatus = 'STARTED' | 'INCREMENTED' | 'MAINTAINED' | 'RESET';

export type StreakActionType = 'MISSION' | 'EMERGENCY_RESET' | 'JOURNAL_LOG';

/**
 * Standard user streak tracking state model
 */
export interface UserStreakState {
  userId?: string;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // ISO date string (YYYY-MM-DD or full timestamp)
  lastActionType?: StreakActionType;
  updatedAt?: string;
}

export interface UserStreakRecord {
  userId: string;
  currentStreak: number;
  longestStreak: number;
  lastCompletedDate: string; // YYYY-MM-DD in user's local timezone
  lastActiveDate?: string; // Timestamp or YYYY-MM-DD
  lastActionType?: StreakActionType;
  updatedAt: string; // ISO UTC
}

export interface ActivityLogEntry {
  id: string;
  userId: string;
  actionType: StreakActionType;
  actionDetails?: string;
  completedAt: string; // ISO UTC
  userTimezone: string;
}

export interface MissionLogEntry {
  id: string;
  userId: string;
  missionId: string;
  completedAt: string; // ISO UTC
  userTimezone: string;
}

export interface StreakUpdateResult {
  userId: string;
  actionType: StreakActionType;
  currentStreak: number;
  longestStreak: number;
  lastActiveDate: string; // YYYY-MM-DD in local timezone
  status: StreakEvaluationStatus;
  message: string;
  recoveryBonus?: RecoveryBonusInfo | null;
  actionDetails?: string;
}

export interface StreakCompletionResult {
  userId: string;
  missionId: string;
  currentStreak: number;
  longestStreak: number;
  status: StreakEvaluationStatus;
  lastCompletedDate: string;
  message: string;
  recoveryBonus?: RecoveryBonusInfo | null;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface RebuildOSState {
  user: UserProfile;
  habits: HabitRing[];
  missions: Mission[];
  archivedMissions?: Mission[];
  identityStats: IdentityStat[];
  lifeAreas: LifeArea[];
  journalEntries: JournalEntry[];
  resetLogs: ResetLog[];
  heatmap: HeatmapDay[];
  chatHistory: ChatMessage[];
  focusLogs?: FocusSessionLog[];
  activeTab: 'home' | 'journal' | 'coach' | 'about' | 'reset';
  focusSession: {
    active: boolean;
    missionId?: string;
    missionTitle?: string;
    durationSeconds: number;
    remainingSeconds: number;
    paused: boolean;
  } | null;
}
