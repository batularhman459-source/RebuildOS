export interface RecoveryEvent {
  id: string;
  date: string; // YYYY-MM-DD
  daysInactive: number; // e.g. 0 (same day), 1, 2, 3...
  points: number; // 100, 95, 90, 82, 74, 65, 55, 45
  source?: 'mission' | 'emergency_reset';
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
  recoveryEvents?: RecoveryEvent[];
  avgRecoveryDays?: number;
  fastestRecoveryDays?: number;
  trialStartDate?: string; // ISO string e.g. "2026-08-09T08:00:00.000Z"
  subscriptionStatus?: 'trial' | 'active' | 'expired';
  subscriptionPlan?: 'monthly' | 'annual' | 'pro';
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
  type: 'PRIMARY' | 'SECONDARY' | 'BONUS';
  title: string;
  description: string;
  completed: boolean;
  xpReward: number;
  durationMinutes?: number;
  targetAttribute?: string;
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
  identityStats: IdentityStat[];
  lifeAreas: LifeArea[];
  journalEntries: JournalEntry[];
  resetLogs: ResetLog[];
  heatmap: HeatmapDay[];
  chatHistory: ChatMessage[];
  focusLogs?: FocusSessionLog[];
  activeTab: 'home' | 'identity' | 'journal' | 'coach' | 'reset';
  focusSession: {
    active: boolean;
    missionId?: string;
    missionTitle?: string;
    durationSeconds: number;
    remainingSeconds: number;
    paused: boolean;
  } | null;
}
