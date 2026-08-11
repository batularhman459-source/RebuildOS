import { RebuildOSState, UserProfile, HabitRing, Mission, IdentityStat, LifeArea, JournalEntry, HeatmapDay } from '../types';
import { getTitleForLevel, getXpToNextLevel } from './progression';
import { INITIAL_RECOVERY_EVENTS, computeRecoveryMetrics } from './recovery';

const STORAGE_KEY = 'rebuild_os_state_v6';

const initialRecoveryData = computeRecoveryMetrics(INITIAL_RECOVERY_EVENTS);

export const INITIAL_USER: UserProfile = {
  name: 'Alex',
  title: getTitleForLevel(7),
  level: 7,
  xp: 140,
  xpToNextLevel: getXpToNextLevel(7),
  streak: 8,
  bestStreak: 15,
  recoveryRate: initialRecoveryData.recoveryRate,
  momentumScore: 88,
  joinedDate: '2026-07-01',
  lastAppOpenDate: new Date().toISOString().split('T')[0],
  lastMissionCompletedDate: new Date().toISOString().split('T')[0],
  recoveryEvents: INITIAL_RECOVERY_EVENTS,
  avgRecoveryDays: initialRecoveryData.avgRecoveryDays,
  fastestRecoveryDays: initialRecoveryData.fastestRecoveryDays,
  trialStartDate: new Date().toISOString(),
  subscriptionStatus: 'trial',
};

export const INITIAL_HABITS: HabitRing[] = [
  {
    id: 'habit-1',
    name: 'Hydrate',
    current: 6,
    target: 8,
    unit: 'glasses',
    color: '#0088FF', // Cyan Blue
    icon: 'Droplets',
    lifeArea: 'Health',
  },
  {
    id: 'habit-2',
    name: 'Move',
    current: 30,
    target: 30,
    unit: 'mins',
    color: '#22C55E', // Neon Green
    icon: 'Activity',
    lifeArea: 'Health',
  },
  {
    id: 'habit-3',
    name: 'Read',
    current: 15,
    target: 20,
    unit: 'pages',
    color: '#F59E0B', // Warm Amber
    icon: 'BookOpen',
    lifeArea: 'Mind',
  },
  {
    id: 'habit-4',
    name: 'Meditate',
    current: 10,
    target: 10,
    unit: 'mins',
    color: '#A855F7', // Purple
    icon: 'Wind',
    lifeArea: 'Mind',
  },
  {
    id: 'habit-5',
    name: 'Stretch',
    current: 1,
    target: 1,
    unit: 'session',
    color: '#EF4444', // Coral Red
    icon: 'Zap',
    lifeArea: 'Health',
  },
];

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'mission-1',
    type: 'PRIMARY',
    title: 'Deep Focus Block',
    description: 'Execute 50 minutes of single-task priority work with zero tabs or notifications.',
    completed: true,
    xpReward: 40,
    durationMinutes: 50,
    targetAttribute: 'Focus',
    statBoost: { stat: 'Focus', amount: 5 },
  },
  {
    id: 'mission-2',
    type: 'SECONDARY',
    title: 'Hydrate & Electrolytes',
    description: 'Drink 4 full glasses of water before 12:00 PM.',
    completed: true,
    xpReward: 20,
    durationMinutes: 10,
    targetAttribute: 'Health',
    statBoost: { stat: 'Health', amount: 3 },
  },
  {
    id: 'mission-3',
    type: 'BONUS',
    title: 'Evening Reflection Journal',
    description: 'Complete daily journal logging wins, lessons, and tomorrow priorities.',
    completed: true,
    xpReward: 15,
    durationMinutes: 10,
    targetAttribute: 'Consistency',
    statBoost: { stat: 'Consistency', amount: 4 },
  },
];

export const INITIAL_IDENTITY_STATS: IdentityStat[] = [
  {
    id: 'stat-1',
    name: 'Discipline',
    score: 82,
    xp: 6724,
    description: 'Capacity to execute planned commitments regardless of emotional resistance.',
    levelLabel: 'Iron Will',
    trend: 'up',
    weeklyChange: 4,
  },
  {
    id: 'stat-2',
    name: 'Focus',
    score: 67,
    xp: 4489,
    description: 'Sustained attention depth without task-switching or micro-distractions.',
    levelLabel: 'Laser Focus',
    trend: 'down',
    weeklyChange: -2,
  },
  {
    id: 'stat-3',
    name: 'Consistency',
    score: 85,
    xp: 7225,
    description: 'Daily operational baseline showing minimal variance between peak and off days.',
    levelLabel: 'Clockwork',
    trend: 'up',
    weeklyChange: 3,
  },
  {
    id: 'stat-4',
    name: 'Resilience',
    score: 88,
    xp: 7744,
    description: 'Speed of recovery following friction, setbacks, or unexpected interruptions.',
    levelLabel: 'Unshakable',
    trend: 'up',
    weeklyChange: 5,
  },
  {
    id: 'stat-5',
    name: 'Self-Trust',
    score: 74,
    xp: 5476,
    description: 'Internal trust derived from kept self-promises and completed missions.',
    levelLabel: 'Grounded Trust',
    trend: 'up',
    weeklyChange: 2,
  },
  {
    id: 'stat-6',
    name: 'Self Respect',
    score: 80,
    xp: 6400,
    description: 'Alignment between core personal standards and daily behavioral choices.',
    levelLabel: 'High Alignment',
    trend: 'up',
    weeklyChange: 3,
  },
  {
    id: 'stat-7',
    name: 'Health',
    score: 84,
    xp: 7056,
    description: 'Physical vitality, hydration, movement cadence, and physiological recovery.',
    levelLabel: 'Vibrant Vitality',
    trend: 'up',
    weeklyChange: 1,
  },
  {
    id: 'stat-8',
    name: 'Purpose',
    score: 86,
    xp: 7396,
    description: 'Clarity of long-term vision driving daily tactical priorities.',
    levelLabel: 'North Star',
    trend: 'stable',
    weeklyChange: 0,
  },
];

export const INITIAL_LIFE_AREAS: LifeArea[] = [
  {
    id: 'area-1',
    name: 'Mind',
    percentage: 84,
    focusTarget: '20 pages reading & 10m daily meditation',
    iconName: 'Brain',
    color: '#A855F7',
  },
  {
    id: 'area-2',
    name: 'Health',
    percentage: 88,
    focusTarget: '8 glasses water & 30m active movement',
    iconName: 'HeartPulse',
    color: '#22C55E',
  },
  {
    id: 'area-3',
    name: 'Work',
    percentage: 90,
    focusTarget: 'Deep focus block executed by 11:00 AM',
    iconName: 'Briefcase',
    color: '#0088FF',
  },
  {
    id: 'area-4',
    name: 'Money',
    percentage: 76,
    focusTarget: 'Zero impulse spending & weekly review',
    iconName: 'Wallet',
    color: '#F59E0B',
  },
  {
    id: 'area-5',
    name: 'Faith',
    percentage: 72,
    focusTarget: '10m morning quiet reflection & stillness',
    iconName: 'Compass',
    color: '#EC4899',
  },
  {
    id: 'area-6',
    name: 'Relationships',
    percentage: 85,
    focusTarget: 'Presence with loved ones & active check-in',
    iconName: 'Users',
    color: '#10B981',
  },
];

export const INITIAL_JOURNAL: JournalEntry[] = [
  {
    id: 'j-1',
    date: new Date().toISOString().split('T')[0],
    biggestWin: 'Executed 50-minute deep focus block with zero distractions and finished core mission early.',
    lessonLearned: 'Starting the highest friction task first thing in the morning sets the tone for the entire day.',
    tomorrowsFocus: 'Maintain hydration baseline and execute morning 50m focus session.',
    moodScore: 5,
    energyScore: 5,
  },
];

// Helper to generate realistic contribution heatmap
export function generateSampleHeatmap(): HeatmapDay[] {
  const days: HeatmapDay[] = [];
  const today = new Date();

  for (let i = 111; i >= 0; i--) {
    const d = new Date();
    d.setDate(today.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    // Generate active pattern with consistency
    let count = 0;
    let xpEarned = 0;

    if (i === 0) {
      // Today starts empty and accumulates real XP during the session
      count = 0;
      xpEarned = 0;
    } else if (i < 28) {
      // Very active last month
      const mod = i % 7;
      if (mod !== 0) {
        count = (i % 3) + 2;
        xpEarned = count * 35;
      } else {
        count = 1;
        xpEarned = 20;
      }
    } else {
      // Historical consistency
      if ((i * 3 + 7) % 5 !== 0) {
        count = (i % 3) + 1;
        xpEarned = count * 25;
      }
    }

    days.push({
      date: dateStr,
      count,
      xpEarned,
    });
  }

  return days;
}

export const INITIAL_STATE: RebuildOSState = {
  user: INITIAL_USER,
  habits: INITIAL_HABITS,
  missions: INITIAL_MISSIONS,
  identityStats: INITIAL_IDENTITY_STATS,
  lifeAreas: INITIAL_LIFE_AREAS,
  journalEntries: INITIAL_JOURNAL,
  resetLogs: [],
  heatmap: generateSampleHeatmap(),
  chatHistory: [
    {
      id: 'msg-1',
      sender: 'ai',
      text: `Welcome back, Alex. You are at Level ${INITIAL_USER.level} (${INITIAL_USER.title}). Your streak is ${INITIAL_USER.streak} days strong. What is your focus today?`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ],
  focusLogs: [],
  activeTab: 'home',
  focusSession: null,
};

export function processDailyStreak(rawState: RebuildOSState): RebuildOSState {
  const todayStr = new Date().toISOString().split('T')[0];
  const lastOpen = rawState.user.lastAppOpenDate;

  if (!lastOpen) {
    return {
      ...rawState,
      user: {
        ...rawState.user,
        lastAppOpenDate: todayStr,
      },
    };
  }

  if (lastOpen === todayStr) {
    return rawState;
  }

  const lastDate = new Date(lastOpen + 'T00:00:00');
  const todayDate = new Date(todayStr + 'T00:00:00');
  const diffTime = todayDate.getTime() - lastDate.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  let newStreak = rawState.user.streak;
  if (diffDays === 1) {
    newStreak += 1;
  } else if (diffDays > 1) {
    newStreak = 1;
  }

  const newBestStreak = Math.max(rawState.user.bestStreak || 0, newStreak);

  return {
    ...rawState,
    user: {
      ...rawState.user,
      streak: newStreak,
      bestStreak: newBestStreak,
      lastAppOpenDate: todayStr,
    },
  };
}

export function loadState(): RebuildOSState {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      const userMerged = { ...INITIAL_USER, ...(parsed.user || {}) };
      const recoveryMetrics = computeRecoveryMetrics(
        userMerged.recoveryEvents && userMerged.recoveryEvents.length > 0
          ? userMerged.recoveryEvents
          : INITIAL_RECOVERY_EVENTS
      );

      const loadedState = {
        ...INITIAL_STATE,
        ...parsed,
        user: {
          ...userMerged,
          ...recoveryMetrics,
        },
      };

      // Ensure all missions have unique IDs even if duplicates were saved previously
      if (Array.isArray(loadedState.missions)) {
        const seenIds = new Set<string>();
        loadedState.missions = loadedState.missions.map((m: Mission, idx: number) => {
          if (!m.id || seenIds.has(m.id)) {
            const uniqueId = `m-custom-${Date.now()}-${idx}-${Math.random().toString(36).substring(2, 7)}`;
            seenIds.add(uniqueId);
            return { ...m, id: uniqueId };
          }
          seenIds.add(m.id);
          return m;
        });
      }

      const updatedWithStreak = processDailyStreak(loadedState);
      saveState(updatedWithStreak);
      return updatedWithStreak;
    }
  } catch (e) {
    console.error('Failed to load state from LocalStorage:', e);
  }
  const initialStateProcessed = processDailyStreak(INITIAL_STATE);
  saveState(initialStateProcessed);
  return initialStateProcessed;
}

export function saveState(state: RebuildOSState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (e) {
    console.error('Failed to save state to LocalStorage:', e);
  }
}

export function createFreshWorkspaceState(userName?: string): RebuildOSState {
  const today = new Date().toISOString().split('T')[0];
  const name = userName && userName.trim() ? userName.trim() : 'Operator';

  const freshUser: UserProfile = {
    name,
    title: getTitleForLevel(1),
    level: 1,
    xp: 0,
    xpToNextLevel: getXpToNextLevel(1),
    streak: 1,
    bestStreak: 1,
    recoveryRate: 100,
    momentumScore: 50,
    joinedDate: today,
    lastAppOpenDate: today,
    lastMissionCompletedDate: '',
    recoveryEvents: [],
    avgRecoveryDays: 0,
    fastestRecoveryDays: 0,
    trialStartDate: new Date().toISOString(),
    subscriptionStatus: 'trial',
  };

  const freshHabits: HabitRing[] = [
    { id: 'habit-1', name: 'Hydrate', current: 0, target: 8, unit: 'glasses', color: '#0088FF', icon: 'Droplets', lifeArea: 'Health' },
    { id: 'habit-2', name: 'Move', current: 0, target: 30, unit: 'mins', color: '#22C55E', icon: 'Activity', lifeArea: 'Health' },
    { id: 'habit-3', name: 'Read', current: 0, target: 20, unit: 'pages', color: '#F59E0B', icon: 'BookOpen', lifeArea: 'Mind' },
    { id: 'habit-4', name: 'Meditate', current: 0, target: 10, unit: 'mins', color: '#A855F7', icon: 'Wind', lifeArea: 'Mind' },
    { id: 'habit-5', name: 'Stretch', current: 0, target: 1, unit: 'session', color: '#EF4444', icon: 'Zap', lifeArea: 'Health' },
  ];

  const freshMissions: Mission[] = [
    {
      id: `m-fresh-1`,
      type: 'PRIMARY',
      title: 'Execute First Deep Focus Sprint',
      description: 'Execute a 25-minute single-task focus block without opening distractions.',
      completed: false,
      xpReward: 50,
      durationMinutes: 25,
      targetAttribute: 'Focus',
      statBoost: { stat: 'Focus', amount: 5 },
    },
    {
      id: `m-fresh-2`,
      type: 'SECONDARY',
      title: 'Hydrate & Complete Movement Habit',
      description: 'Log your morning hydration and complete 30 minutes of physical movement.',
      completed: false,
      xpReward: 30,
      durationMinutes: 30,
      targetAttribute: 'Health',
      statBoost: { stat: 'Health', amount: 4 },
    },
    {
      id: `m-fresh-3`,
      type: 'BONUS',
      title: 'Complete First Evening Reflection',
      description: 'Record your primary win, lesson learned, and tomorrow priority in your journal.',
      completed: false,
      xpReward: 25,
      durationMinutes: 10,
      targetAttribute: 'Consistency',
      statBoost: { stat: 'Consistency', amount: 4 },
    },
  ];

  const freshIdentityStats: IdentityStat[] = [
    { id: 'stat-1', name: 'Discipline', score: 50, xp: 2500, description: 'Capacity to execute planned commitments regardless of emotional resistance.', levelLabel: 'Initiate Base', trend: 'stable', weeklyChange: 0 },
    { id: 'stat-2', name: 'Focus', score: 50, xp: 2500, description: 'Sustained attention depth without task-switching or micro-distractions.', levelLabel: 'Initiate Base', trend: 'stable', weeklyChange: 0 },
    { id: 'stat-3', name: 'Consistency', score: 50, xp: 2500, description: 'Daily operational baseline showing minimal variance between peak and off days.', levelLabel: 'Initiate Base', trend: 'stable', weeklyChange: 0 },
    { id: 'stat-4', name: 'Resilience', score: 50, xp: 2500, description: 'Speed of recovery following friction, setbacks, or unexpected interruptions.', levelLabel: 'Initiate Base', trend: 'stable', weeklyChange: 0 },
    { id: 'stat-5', name: 'Self-Trust', score: 50, xp: 2500, description: 'Internal trust derived from kept self-promises and completed missions.', levelLabel: 'Initiate Base', trend: 'stable', weeklyChange: 0 },
    { id: 'stat-6', name: 'Self Respect', score: 50, xp: 2500, description: 'Alignment between core personal standards and daily behavioral choices.', levelLabel: 'Initiate Base', trend: 'stable', weeklyChange: 0 },
    { id: 'stat-7', name: 'Health', score: 50, xp: 2500, description: 'Physical vitality, hydration, movement cadence, and physiological recovery.', levelLabel: 'Initiate Base', trend: 'stable', weeklyChange: 0 },
    { id: 'stat-8', name: 'Purpose', score: 50, xp: 2500, description: 'Clarity of long-term vision driving daily tactical priorities.', levelLabel: 'Initiate Base', trend: 'stable', weeklyChange: 0 },
  ];

  const freshLifeAreas: LifeArea[] = [
    { id: 'area-1', name: 'Mind', percentage: 50, focusTarget: 'Daily reading & meditation habits', iconName: 'Brain', color: '#A855F7' },
    { id: 'area-2', name: 'Health', percentage: 50, focusTarget: 'Hydration baseline & active movement', iconName: 'HeartPulse', color: '#22C55E' },
    { id: 'area-3', name: 'Work', percentage: 50, focusTarget: 'Execute daily primary focus mission', iconName: 'Briefcase', color: '#0088FF' },
    { id: 'area-4', name: 'Money', percentage: 50, focusTarget: 'Zero impulse spending', iconName: 'Wallet', color: '#F59E0B' },
    { id: 'area-5', name: 'Faith', percentage: 50, focusTarget: '10m quiet reflection & stillness', iconName: 'Compass', color: '#EC4899' },
    { id: 'area-6', name: 'Relationships', percentage: 50, focusTarget: 'Presence with loved ones', iconName: 'Users', color: '#10B981' },
  ];

  const freshHeatmap: HeatmapDay[] = [];
  const todayDate = new Date();
  for (let i = 111; i >= 0; i--) {
    const d = new Date();
    d.setDate(todayDate.getDate() - i);
    freshHeatmap.push({
      date: d.toISOString().split('T')[0],
      count: 0,
      xpEarned: 0,
    });
  }

  return {
    user: freshUser,
    habits: freshHabits,
    missions: freshMissions,
    identityStats: freshIdentityStats,
    lifeAreas: freshLifeAreas,
    journalEntries: [],
    resetLogs: [],
    heatmap: freshHeatmap,
    chatHistory: [
      {
        id: 'msg-fresh-1',
        sender: 'ai',
        text: `Welcome to RebuildOS, ${name}. Your personal workspace is initialized at Level 1 (Initiate). Choose your primary focus mission to begin building your streak and gaining momentum today.`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
    ],
    focusLogs: [],
    activeTab: 'home',
    focusSession: null,
  };
}

export function resetToDefaults(): RebuildOSState {
  const fresh = createFreshWorkspaceState('Operator');
  saveState(fresh);
  return fresh;
}
