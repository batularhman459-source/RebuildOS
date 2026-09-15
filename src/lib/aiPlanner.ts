import { UserProfile, FocusSessionLog } from '../types';

export interface GeneratedMission {
  title: string;
  description: string;
  category: string;
  type: 'PRIMARY' | 'SECONDARY' | 'BONUS';
  xpReward: number;
  durationMinutes: number;
  suggestedFocusMinutes: number;
  targetAttribute: string;
  badge?: string;
  tags?: string[];
  accentColor?: 'purple' | 'cyan' | 'amber' | 'emerald' | 'rose';
  adaptationNote?: string;
  reasoning?: string;
}

// Clean and extract meaningful keywords/topics
function extractCoreTopic(input: string): string {
  const clean = input
    .replace(/^(i want to|i need to|help me|plan to|i will|let's|please|how to)\s+/i, '')
    .trim();
  return clean || input.trim();
}

export function breakdownIntentionIntoMissions(
  intention: string,
  focusLogs: FocusSessionLog[] = [],
  _user?: UserProfile
): GeneratedMission[] {
  const clean = intention.trim();
  if (!clean) return [];

  const lower = clean.toLowerCase();
  const topic = extractCoreTopic(clean);

  // Compute adaptive focus based on recent session logs
  const recentDistractions = focusLogs
    .slice(0, 5)
    .filter((l) => l.completionStatus === 'DISTRACTED' || l.completionStatus === 'PARTIAL').length;

  const focusSprintDefault = recentDistractions >= 2 ? 15 : 25;

  // 1. Coding / Web / Engineering / Software
  if (
    lower.includes('code') ||
    lower.includes('web') ||
    lower.includes('app') ||
    lower.includes('build') ||
    lower.includes('bug') ||
    lower.includes('frontend') ||
    lower.includes('backend') ||
    lower.includes('feature') ||
    lower.includes('program') ||
    lower.includes('deploy') ||
    lower.includes('refactor') ||
    lower.includes('api') ||
    lower.includes('database') ||
    lower.includes('python') ||
    lower.includes('javascript') ||
    lower.includes('typescript') ||
    lower.includes('react')
  ) {
    const isBug = lower.includes('bug') || lower.includes('fix') || lower.includes('issue');
    const isDeploy = lower.includes('deploy') || lower.includes('ship') || lower.includes('release');

    if (isBug) {
      return [
        {
          title: '⚡ Root-Cause Isolation Sprint',
          description: 'Isolate error logs, reproduce the bug in dev mode, and trace the failing component.',
          category: 'Deep Work & Focus',
          type: 'PRIMARY',
          xpReward: 50,
          durationMinutes: 20,
          suggestedFocusMinutes: focusSprintDefault,
          targetAttribute: 'Focus',
          badge: '⚡ High Focus',
          tags: ['Debug', 'Zero Tab-Switching'],
          accentColor: 'rose',
        },
        {
          title: '🛠️ Targeted Patch & Regression Test',
          description: 'Apply the architectural fix and verify edge cases without breaking downstream modules.',
          category: 'Deep Work & Focus',
          type: 'SECONDARY',
          xpReward: 35,
          durationMinutes: 15,
          suggestedFocusMinutes: Math.min(15, focusSprintDefault),
          targetAttribute: 'Discipline',
          badge: '🎯 Verification',
          tags: ['Clean Fix', 'Regression Test'],
          accentColor: 'cyan',
        },
      ];
    }

    if (isDeploy) {
      return [
        {
          title: '🚀 Build Verification & Production Checks',
          description: 'Run production linters, compile bundles, and inspect environment variables.',
          category: 'Deep Work & Focus',
          type: 'PRIMARY',
          xpReward: 50,
          durationMinutes: 20,
          suggestedFocusMinutes: 20,
          targetAttribute: 'Consistency',
          badge: '🚀 Ship Ready',
          tags: ['Production', 'Zero Flaws'],
          accentColor: 'emerald',
        },
        {
          title: '📦 Final Release & Live Smoke Test',
          description: 'Trigger deployment workflow and verify live routes in incognito sandbox.',
          category: 'Purpose & Strategy',
          type: 'SECONDARY',
          xpReward: 40,
          durationMinutes: 10,
          suggestedFocusMinutes: 10,
          targetAttribute: 'Self-Trust',
          badge: '💎 Milestone',
          tags: ['Live Verification', 'Release'],
          accentColor: 'purple',
        },
      ];
    }

    return [
      {
        title: '⚡ Core Architecture & Functional Sprint',
        description: `Implement primary logic for "${topic}" with strict single-task immersion.`,
        category: 'Deep Work & Focus',
        type: 'PRIMARY',
        xpReward: 55,
        durationMinutes: 25,
        suggestedFocusMinutes: focusSprintDefault,
        targetAttribute: 'Focus',
        badge: '⚡ Deep Work',
        tags: ['Core Engine', 'Flow State'],
        accentColor: 'purple',
      },
      {
        title: '✨ Polish, UI States & Edge Cases',
        description: 'Refine responsive layouts, interactive feedback, and error state boundaries.',
        category: 'Deep Work & Focus',
        type: 'SECONDARY',
        xpReward: 35,
        durationMinutes: 15,
        suggestedFocusMinutes: Math.min(15, focusSprintDefault),
        targetAttribute: 'Consistency',
        badge: '💎 Precision',
        tags: ['UI Polish', 'Edge Cases'],
        accentColor: 'cyan',
      },
    ];
  }

  // 2. Presentations / Slides / Pitch / Meetings
  if (
    lower.includes('presentation') ||
    lower.includes('pitch') ||
    lower.includes('deck') ||
    lower.includes('slide') ||
    lower.includes('keynote') ||
    lower.includes('demo')
  ) {
    return [
      {
        title: '🎯 Narrative Flow & Slide Blueprint',
        description: 'Outline the 3 core takeaways, slide structure, and key story arc.',
        category: 'Purpose & Strategy',
        type: 'PRIMARY',
        xpReward: 50,
        durationMinutes: 25,
        suggestedFocusMinutes: focusSprintDefault,
        targetAttribute: 'Purpose',
        badge: '🎯 High Impact',
        tags: ['Story Arc', '3 Core Points'],
        accentColor: 'amber',
      },
      {
        title: '📊 Visual Asset & Slide Polish',
        description: 'Clean typography, trim dense bullet points, and highlight high-contrast metrics.',
        category: 'Deep Work & Focus',
        type: 'SECONDARY',
        xpReward: 35,
        durationMinutes: 15,
        suggestedFocusMinutes: 15,
        targetAttribute: 'Focus',
        badge: '✨ Aesthetic',
        tags: ['High Contrast', 'No Fluff'],
        accentColor: 'purple',
      },
    ];
  }

  // 3. Studying / Academic / Exams / Books
  if (
    lower.includes('exam') ||
    lower.includes('study') ||
    lower.includes('math') ||
    lower.includes('test') ||
    lower.includes('course') ||
    lower.includes('learn') ||
    lower.includes('lecture') ||
    lower.includes('reading') ||
    lower.includes('revision') ||
    lower.includes('flashcard') ||
    lower.includes('research') ||
    lower.includes('quiz')
  ) {
    return [
      {
        title: '🧠 High-Yield Active Recall Sprint',
        description: 'Review highest-yield formulas and concepts using closed-book retrieval.',
        category: 'Mind & Learning',
        type: 'PRIMARY',
        xpReward: 50,
        durationMinutes: 25,
        suggestedFocusMinutes: focusSprintDefault,
        targetAttribute: 'Focus',
        badge: '🧠 Active Recall',
        tags: ['Closed Book', 'High Yield'],
        accentColor: 'cyan',
      },
      {
        title: '✍️ Timed Practice Problem Drill',
        description: 'Complete 3 challenging practice problems under simulated exam timing.',
        category: 'Mind & Learning',
        type: 'SECONDARY',
        xpReward: 40,
        durationMinutes: 20,
        suggestedFocusMinutes: Math.min(20, focusSprintDefault),
        targetAttribute: 'Discipline',
        badge: '🔥 Timed Drill',
        tags: ['Exam Conditions', 'Zero Distraction'],
        accentColor: 'amber',
      },
    ];
  }

  // 4. Fitness / Gym / Strength / Cardio / Recovery
  if (
    lower.includes('workout') ||
    lower.includes('gym') ||
    lower.includes('fitness') ||
    lower.includes('exercise') ||
    lower.includes('health') ||
    lower.includes('run') ||
    lower.includes('lift') ||
    lower.includes('stretch') ||
    lower.includes('cardio') ||
    lower.includes('squat') ||
    lower.includes('bench') ||
    lower.includes('hiit') ||
    lower.includes('weights') ||
    lower.includes('training')
  ) {
    return [
      {
        title: '🔥 High-Intensity Compound Training',
        description: 'Execute targeted heavy sets with strict form and zero phone browsing between sets.',
        category: 'Movement & Fitness',
        type: 'PRIMARY',
        xpReward: 55,
        durationMinutes: 30,
        suggestedFocusMinutes: 30,
        targetAttribute: 'Health',
        badge: '🔥 Peak Effort',
        tags: ['Strict Form', 'No Phone'],
        accentColor: 'rose',
      },
      {
        title: '💧 Mobility, Cooldown & Hydration Reset',
        description: '5-minute deep stretching, foam rolling, and 750ml hydration intake.',
        category: 'Health & Vitality',
        type: 'SECONDARY',
        xpReward: 25,
        durationMinutes: 10,
        suggestedFocusMinutes: 10,
        targetAttribute: 'Resilience',
        badge: '💧 Recovery',
        tags: ['Mobility', '750ml Water'],
        accentColor: 'emerald',
      },
    ];
  }

  // 5. Writing / Content / Copy / Articles / Strategy
  if (
    lower.includes('write') ||
    lower.includes('essay') ||
    lower.includes('blog') ||
    lower.includes('article') ||
    lower.includes('book') ||
    lower.includes('report') ||
    lower.includes('script') ||
    lower.includes('content') ||
    lower.includes('copy') ||
    lower.includes('newsletter')
  ) {
    return [
      {
        title: '⚡ Unfiltered First Draft Sprint',
        description: `Write the main body for "${topic}" continuously without self-editing.`,
        category: 'Deep Work & Focus',
        type: 'PRIMARY',
        xpReward: 50,
        durationMinutes: 25,
        suggestedFocusMinutes: focusSprintDefault,
        targetAttribute: 'Focus',
        badge: '⚡ Rapid Draft',
        tags: ['Flow State', 'No Backspacing'],
        accentColor: 'purple',
      },
      {
        title: '✂️ Ruthless Edit & Hook Tightening',
        description: 'Trim passive voice, sharpen the opening hook, and format key pull quotes.',
        category: 'Purpose & Strategy',
        type: 'SECONDARY',
        xpReward: 35,
        durationMinutes: 15,
        suggestedFocusMinutes: 15,
        targetAttribute: 'Self-Trust',
        badge: '✂️ Editorial',
        tags: ['Punchy Hook', 'Clean Format'],
        accentColor: 'amber',
      },
    ];
  }

  // 6. Organization / Reset / Declutter / Admin
  if (
    lower.includes('clean') ||
    lower.includes('organize') ||
    lower.includes('room') ||
    lower.includes('desk') ||
    lower.includes('house') ||
    lower.includes('admin') ||
    lower.includes('inbox') ||
    lower.includes('declutter') ||
    lower.includes('tidy') ||
    lower.includes('reset')
  ) {
    return [
      {
        title: '🧹 Physical Workspace Zero-State',
        description: 'Clear desk surface, organize cables, and remove visual clutter.',
        category: 'Discipline & Routine',
        type: 'PRIMARY',
        xpReward: 45,
        durationMinutes: 15,
        suggestedFocusMinutes: 15,
        targetAttribute: 'Discipline',
        badge: '🧹 Zero State',
        tags: ['Clear Surface', 'Visual Reset'],
        accentColor: 'emerald',
      },
      {
        title: '📥 Digital Tab & Inbox Sweep',
        description: 'Close zombie browser tabs, empty downloads folder, and clear urgent inbox flags.',
        category: 'Discipline & Routine',
        type: 'SECONDARY',
        xpReward: 30,
        durationMinutes: 10,
        suggestedFocusMinutes: 10,
        targetAttribute: 'Consistency',
        badge: '📥 Clean Slate',
        tags: ['Inbox Zero', 'Close Tabs'],
        accentColor: 'cyan',
      },
    ];
  }

  // 7. Sales / Business / Outreach / Client Work
  if (
    lower.includes('client') ||
    lower.includes('sales') ||
    lower.includes('lead') ||
    lower.includes('call') ||
    lower.includes('proposal') ||
    lower.includes('invoice') ||
    lower.includes('customer') ||
    lower.includes('outreach') ||
    lower.includes('contract')
  ) {
    return [
      {
        title: '🎯 High-Value Client Deliverable Block',
        description: `Execute the primary deliverable for "${topic}" with strict accuracy.`,
        category: 'Purpose & Strategy',
        type: 'PRIMARY',
        xpReward: 55,
        durationMinutes: 25,
        suggestedFocusMinutes: focusSprintDefault,
        targetAttribute: 'Discipline',
        badge: '🎯 High Value',
        tags: ['Client Impact', 'Clear Scope'],
        accentColor: 'amber',
      },
      {
        title: '📨 Follow-Up & Next Step Lock',
        description: 'Send summary email, attach verified assets, and set calendar milestone.',
        category: 'Discipline & Routine',
        type: 'SECONDARY',
        xpReward: 30,
        durationMinutes: 10,
        suggestedFocusMinutes: 10,
        targetAttribute: 'Self-Trust',
        badge: '📨 Action Lock',
        tags: ['Next Steps', 'Fast Turnaround'],
        accentColor: 'emerald',
      },
    ];
  }

  // 8. Finance / Money / Budgeting
  if (
    lower.includes('money') ||
    lower.includes('budget') ||
    lower.includes('invest') ||
    lower.includes('expense') ||
    lower.includes('tax') ||
    lower.includes('crypto') ||
    lower.includes('bank') ||
    lower.includes('finance')
  ) {
    return [
      {
        title: '💳 Financial Audit & Ledger Review',
        description: 'Categorize recent transactions, calculate weekly burn rate, and flag anomalies.',
        category: 'Discipline & Routine',
        type: 'PRIMARY',
        xpReward: 50,
        durationMinutes: 20,
        suggestedFocusMinutes: 20,
        targetAttribute: 'Discipline',
        badge: '💳 Audit',
        tags: ['Exact Figures', 'No Guesswork'],
        accentColor: 'emerald',
      },
      {
        title: '🛡️ Capital Allocation & Goal Target',
        description: 'Transfer dedicated savings allocation and review upcoming subscriptions.',
        category: 'Purpose & Strategy',
        type: 'SECONDARY',
        xpReward: 30,
        durationMinutes: 10,
        suggestedFocusMinutes: 10,
        targetAttribute: 'Self-Trust',
        badge: '🛡️ Wealth Shield',
        tags: ['Automate Savings', 'Trim Waste'],
        accentColor: 'amber',
      },
    ];
  }

  // 9. Mindfulness / Meditation / Mental Reset
  if (
    lower.includes('meditat') ||
    lower.includes('mindful') ||
    lower.includes('breath') ||
    lower.includes('calm') ||
    lower.includes('anxiety') ||
    lower.includes('stress') ||
    lower.includes('walk') ||
    lower.includes('unwind')
  ) {
    return [
      {
        title: '🧘 Diaphragmatic Focus Reset',
        description: 'Execute 10 minutes of intentional box-breathing and nervous system down-regulation.',
        category: 'Health & Vitality',
        type: 'PRIMARY',
        xpReward: 40,
        durationMinutes: 15,
        suggestedFocusMinutes: 15,
        targetAttribute: 'Resilience',
        badge: '🧘 Grounding',
        tags: ['Box Breathing', 'Eyes Closed'],
        accentColor: 'cyan',
      },
      {
        title: '🌿 Mindful Screen-Free Walk',
        description: 'Unplugged outdoor movement without podcasts or phone notifications.',
        category: 'Health & Vitality',
        type: 'SECONDARY',
        xpReward: 30,
        durationMinutes: 15,
        suggestedFocusMinutes: 15,
        targetAttribute: 'Health',
        badge: '🌿 Offline',
        tags: ['Zero Screen', 'Fresh Air'],
        accentColor: 'emerald',
      },
    ];
  }

  // 10. Intelligent Contextual Fallback based on extracted topic
  const shortTitle = topic.length > 28 ? topic.slice(0, 25) + '...' : topic;
  const capitalizedTopic = shortTitle.charAt(0).toUpperCase() + shortTitle.slice(1);

  return [
    {
      title: `⚡ Initial Velocity Sprint: ${capitalizedTopic}`,
      description: `Knock out the single highest-leverage task for "${topic}" to build unstoppable momentum.`,
      category: 'Deep Work & Focus',
      type: 'PRIMARY',
      xpReward: 50,
      durationMinutes: 25,
      suggestedFocusMinutes: focusSprintDefault,
      targetAttribute: 'Focus',
      badge: '⚡ High Leverage',
      tags: ['Momentum Builder', 'Zero Delay'],
      accentColor: 'purple',
    },
    {
      title: `🎯 Completion & Quality Lock: ${capitalizedTopic}`,
      description: `Refine output, verify deliverable criteria, and wrap up "${topic}" decisively.`,
      category: 'Discipline & Routine',
      type: 'SECONDARY',
      xpReward: 35,
      durationMinutes: 15,
      suggestedFocusMinutes: Math.min(15, focusSprintDefault),
      targetAttribute: 'Consistency',
      badge: '🎯 Wrap Up',
      tags: ['Deliverable Check', 'Lock It In'],
      accentColor: 'cyan',
    },
  ];
}
