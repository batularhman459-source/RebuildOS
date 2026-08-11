import { UserProfile, FocusSessionLog } from '../types';

export interface GeneratedMission {
  title: string;
  description: string;
  type: 'PRIMARY' | 'SECONDARY' | 'BONUS';
  xpReward: number;
  durationMinutes: number;
  suggestedFocusMinutes: number;
  targetAttribute: string;
  isGoalTooLarge?: boolean;
  adaptationNote?: string;
}

export function breakdownIntentionIntoMissions(
  intention: string,
  focusLogs: FocusSessionLog[] = [],
  _user?: UserProfile
): GeneratedMission[] {
  const clean = intention.trim();
  if (!clean) return [];

  const lower = clean.toLowerCase();

  // Check recent execution data for adaptivity
  const recentDistractions = focusLogs
    .slice(0, 5)
    .filter((l) => l.completionStatus === 'DISTRACTED' || l.completionStatus === 'PARTIAL').length;

  const needsShorterSprint = recentDistractions >= 2;
  const focusSprintDefault = needsShorterSprint ? 15 : 25;
  const adaptationMsg = needsShorterSprint
    ? '⚡ Suggested focus session shortened based on recent execution.'
    : undefined;

  // Keyword categorization & decomposition into 2 small micro-missions
  if (lower.includes('website') || lower.includes('web') || lower.includes('app') || lower.includes('code') || lower.includes('build')) {
    return [
      {
        title: 'Build primary UI section (Part 1)',
        description: '',
        type: 'PRIMARY',
        xpReward: 50,
        durationMinutes: 25,
        suggestedFocusMinutes: focusSprintDefault,
        targetAttribute: 'Focus',
        isGoalTooLarge: true,
        adaptationNote: adaptationMsg || 'Large goal detected: split into 2 small micro-missions.',
      },
      {
        title: 'Test responsive layout & polish (Part 2)',
        description: '',
        type: 'SECONDARY',
        xpReward: 30,
        durationMinutes: 20,
        suggestedFocusMinutes: Math.min(20, focusSprintDefault),
        targetAttribute: 'Execution',
        adaptationNote: adaptationMsg,
      },
    ];
  }

  if (lower.includes('exam') || lower.includes('study') || lower.includes('math') || lower.includes('test') || lower.includes('course')) {
    return [
      {
        title: 'Review Chapter core formulas (Part 1)',
        description: '',
        type: 'PRIMARY',
        xpReward: 50,
        durationMinutes: 25,
        suggestedFocusMinutes: focusSprintDefault,
        targetAttribute: 'Focus',
        isGoalTooLarge: true,
        adaptationNote: adaptationMsg || 'Large goal detected: split into 2 small micro-missions.',
      },
      {
        title: 'Complete 3 practice problems (Part 2)',
        description: '',
        type: 'SECONDARY',
        xpReward: 30,
        durationMinutes: 20,
        suggestedFocusMinutes: Math.min(20, focusSprintDefault),
        targetAttribute: 'Discipline',
        adaptationNote: adaptationMsg,
      },
    ];
  }

  if (lower.includes('workout') || lower.includes('gym') || lower.includes('fitness') || lower.includes('exercise') || lower.includes('health') || lower.includes('run')) {
    return [
      {
        title: 'Targeted resistance workout (Part 1)',
        description: '',
        type: 'PRIMARY',
        xpReward: 50,
        durationMinutes: 25,
        suggestedFocusMinutes: 25,
        targetAttribute: 'Health',
        isGoalTooLarge: false,
        adaptationNote: adaptationMsg,
      },
      {
        title: 'Post-workout mobility & cooldown (Part 2)',
        description: '',
        type: 'SECONDARY',
        xpReward: 30,
        durationMinutes: 10,
        suggestedFocusMinutes: 10,
        targetAttribute: 'Resilience',
      },
    ];
  }

  if (lower.includes('clean') || lower.includes('organize') || lower.includes('room') || lower.includes('desk') || lower.includes('house')) {
    return [
      {
        title: 'Clear main desk surface (Part 1)',
        description: '',
        type: 'PRIMARY',
        xpReward: 50,
        durationMinutes: 20,
        suggestedFocusMinutes: 15,
        targetAttribute: 'Discipline',
        isGoalTooLarge: false,
        adaptationNote: adaptationMsg,
      },
      {
        title: 'Organize digital desktop & files (Part 2)',
        description: '',
        type: 'SECONDARY',
        xpReward: 30,
        durationMinutes: 15,
        suggestedFocusMinutes: 10,
        targetAttribute: 'Execution',
      },
    ];
  }

  if (lower.includes('write') || lower.includes('essay') || lower.includes('blog') || lower.includes('article') || lower.includes('book') || lower.includes('report')) {
    return [
      {
        title: 'Draft core outline & thesis (Part 1)',
        description: '',
        type: 'PRIMARY',
        xpReward: 50,
        durationMinutes: 25,
        suggestedFocusMinutes: focusSprintDefault,
        targetAttribute: 'Focus',
        isGoalTooLarge: true,
        adaptationNote: adaptationMsg || 'Large goal detected: split into 2 small micro-missions.',
      },
      {
        title: 'Write Section 1 draft (Part 2)',
        description: '',
        type: 'SECONDARY',
        xpReward: 30,
        durationMinutes: 20,
        suggestedFocusMinutes: Math.min(20, focusSprintDefault),
        targetAttribute: 'Execution',
      },
    ];
  }

  // Fallback for general custom goals (splits into 2 small micro-missions)
  const capitalizedTitle = clean.charAt(0).toUpperCase() + clean.slice(1);
  return [
    {
      title: `${capitalizedTitle} — Immediate Step (Part 1)`,
      description: '',
      type: 'PRIMARY',
      xpReward: 50,
      durationMinutes: 25,
      suggestedFocusMinutes: focusSprintDefault,
      targetAttribute: 'Focus',
      isGoalTooLarge: true,
      adaptationNote: adaptationMsg || 'Split into 2 small micro-missions.',
    },
    {
      title: `${capitalizedTitle} — Follow-up Review (Part 2)`,
      description: '',
      type: 'SECONDARY',
      xpReward: 30,
      durationMinutes: 15,
      suggestedFocusMinutes: Math.min(15, focusSprintDefault),
      targetAttribute: 'Execution',
    },
  ];
}
