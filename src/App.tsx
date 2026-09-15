import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { loadState, saveState, resetToDefaults, processDailyStreak, createFreshWorkspaceState } from './lib/storage';
import { processMissionCompletionRecovery, processEmergencyResetRecovery } from './lib/recovery';
import { getXpToNextLevel, getTitleForLevel, XP_REWARDS, applyActionToStats, applyMissionXpToStat, statScoreToXp, computeExecutionStats } from './lib/progression';
import { RebuildOSState, Mission, HabitRing, JournalEntry, FocusSessionLog, MissionState, MissionPriority } from './types';
import { Header } from './components/Header';
import { MissionsSection } from './components/MissionsSection';
import { AIInsightCard } from './components/AIInsightCard';
import { HeatmapGrid } from './components/HeatmapGrid';
import { FocusTimerModal } from './components/FocusTimerModal';
import { EmergencyResetModal } from './components/EmergencyResetModal';
import { LevelUpModal } from './components/LevelUpModal';
import { JournalTab } from './components/JournalTab';
import { AICoachTab } from './components/AICoachTab';
import { AboutTab } from './components/AboutTab';
import { BottomNav } from './components/BottomNav';
import { DesktopNav } from './components/DesktopNav';
import { ProfileModal } from './components/ProfileModal';
import { LiveBackground } from './components/LiveBackground';
import { StreakCelebrationModal, StreakProtectedToast } from './components/StreakCelebrationModal';
import { ComebackCelebrationModal } from './components/ComebackCelebrationModal';
import { StreakModal } from './components/StreakModal';
import { updateUserStreakAsync } from './lib/streak';
import { RecoveryBonusInfo, StreakActionType } from './types';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [state, setState] = useState<RebuildOSState>(() => {
    const loaded = loadState();
    // URL as state: initialize activeTab from URL search params if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get('tab');
      if (tabParam && ['home', 'journal', 'coach', 'about'].includes(tabParam)) {
        return { ...loaded, activeTab: tabParam as any };
      }
    }
    return loaded;
  });
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [showStreakModal, setShowStreakModal] = useState(false);
  const [activeFocusMission, setActiveFocusMission] = useState<Mission | null>(null);
  const [levelUpEvent, setLevelUpEvent] = useState<{ newLevel: number; title: string } | null>(null);
  const [streakCelebration, setStreakCelebration] = useState<{
    streak: number;
    longestStreak?: number;
    missionTitle?: string;
    status: 'STARTED' | 'INCREMENTED';
  } | null>(null);
  const [comebackCelebration, setComebackCelebration] = useState<{
    recoveryBonus: RecoveryBonusInfo;
    missionTitle?: string;
  } | null>(null);
  const [streakProtectedToast, setStreakProtectedToast] = useState<{ message: string } | null>(null);
  const [ariaAnnouncement, setAriaAnnouncement] = useState<string>('');

  useEffect(() => {
    document.documentElement.classList.add('dark');
  }, []);

  // Persist activeTab to URL search params (URL as state)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      if (state.activeTab && state.activeTab !== 'home') {
        url.searchParams.set('tab', state.activeTab);
      } else {
        url.searchParams.delete('tab');
      }
      window.history.replaceState({}, '', url.toString());
    }
  }, [state.activeTab]);

  // Global Escape key dismiss for modals and numeric tab shortcuts (1-5) on desktop
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement;
      const isInput =
        activeEl &&
        (activeEl.tagName === 'INPUT' ||
          activeEl.tagName === 'TEXTAREA' ||
          (activeEl as HTMLElement).isContentEditable);

      if (e.key === 'Escape') {
        if (streakCelebration) setStreakCelebration(null);
        else if (streakProtectedToast) setStreakProtectedToast(null);
        else if (showProfileModal) setShowProfileModal(false);
        else if (showResetModal) setShowResetModal(false);
        else if (activeFocusMission) setActiveFocusMission(null);
        else if (levelUpEvent) setLevelUpEvent(null);
        return;
      }

      // 1-4 navigation when not typing in an input
      if (!isInput && !e.metaKey && !e.ctrlKey && !e.altKey) {
        if (e.key === '1') setState((prev) => ({ ...prev, activeTab: 'home' }));
        else if (e.key === '2') setState((prev) => ({ ...prev, activeTab: 'journal' }));
        else if (e.key === '3') setState((prev) => ({ ...prev, activeTab: 'coach' }));
        else if (e.key === '4') setState((prev) => ({ ...prev, activeTab: 'about' }));
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showProfileModal, showResetModal, activeFocusMission, levelUpEvent, streakCelebration, streakProtectedToast]);

  // Auto save state to LocalStorage
  useEffect(() => {
    saveState(state);
  }, [state]);

  // Check and update streak when app tab comes into focus or new day begins
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        setState((prev) => processDailyStreak(prev));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  // Recalculate XP & Level up helper
  const addXp = (amount: number, prevState: RebuildOSState): RebuildOSState => {
    let newXp = prevState.user.xp + amount;
    let newLevel = prevState.user.level;
    let newXpToNext = getXpToNextLevel(newLevel);

    let didLevelUp = false;
    if (amount > 0) {
      while (newXp >= newXpToNext) {
        newXp -= newXpToNext;
        newLevel += 1;
        newXpToNext = getXpToNextLevel(newLevel);
        didLevelUp = true;
      }
    } else if (amount < 0) {
      while (newXp < 0 && newLevel > 1) {
        newLevel -= 1;
        newXpToNext = getXpToNextLevel(newLevel);
        newXp += newXpToNext;
      }
      if (newXp < 0 && newLevel === 1) {
        newXp = 0;
      }
    }

    const newTitle = getTitleForLevel(newLevel);

    if (didLevelUp) {
      setLevelUpEvent({ newLevel, title: newTitle });
    }

    // Update today's heatmap entry
    const todayStr = new Date().toISOString().split('T')[0];
    let foundToday = false;
    const newHeatmap = prevState.heatmap.map((d) => {
      if (d.date === todayStr) {
        foundToday = true;
        return {
          ...d,
          count: Math.max(0, d.count + (amount > 0 ? 1 : amount < 0 ? -1 : 0)),
          xpEarned: Math.max(0, d.xpEarned + amount),
        };
      }
      return d;
    });

    if (!foundToday) {
      newHeatmap.push({
        date: todayStr,
        count: amount > 0 ? 1 : 0,
        xpEarned: Math.max(0, amount),
      });
    }

    // Recalculate momentum score (0-100)
    const totalHabitCurrent = prevState.habits.reduce((acc, h) => acc + h.current, 0);
    const totalHabitTarget = prevState.habits.reduce((acc, h) => acc + h.target, 0);
    const habitRatio = totalHabitTarget > 0 ? totalHabitCurrent / totalHabitTarget : 0;
    const completedMissionsRatio =
      prevState.missions.length > 0
        ? prevState.missions.filter((m) => m.completed).length / prevState.missions.length
        : 0;

    const totalLogsCount = (prevState.focusLogs || []).length;
    const focusBonus = Math.min(15, totalLogsCount * 2);

    const calculatedMomentum = Math.min(
      100,
      Math.round(habitRatio * 40 + completedMissionsRatio * 35 + Math.min(10, prevState.user.streak * 2) + focusBonus)
    );

    return {
      ...prevState,
      user: {
        ...prevState.user,
        xp: newXp,
        level: newLevel,
        xpToNextLevel: newXpToNext,
        title: newTitle,
        momentumScore: calculatedMomentum,
      },
      heatmap: newHeatmap,
    };
  };

  // Handlers
  const handleIncrementHabit = (habitId: string) => {
    setState((prev) => {
      const updatedHabits = prev.habits.map((h) => {
        if (h.id === habitId) {
          return { ...h, current: h.current + 1 };
        }
        return h;
      });
      const newState = { ...prev, habits: updatedHabits };
      return addXp(15, newState);
    });
  };

  const handleAddHabit = (newHabit: Omit<HabitRing, 'id' | 'current'>) => {
    const created: HabitRing = {
      ...newHabit,
      id: `h-custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      current: 0,
    };
    setState((prev) => ({
      ...prev,
      habits: [...prev.habits, created],
    }));
  };

  const triggerActionStreakEvaluation = async (
    actionType: StreakActionType,
    options?: {
      actionDetails?: string;
      title?: string;
      baseBonusXp?: number;
    }
  ) => {
    try {
      const result = await updateUserStreakAsync(state.user, actionType, {
        actionDetails: options?.actionDetails,
        baseBonusXp: options?.baseBonusXp ?? 30,
      });

      setState((prev) => {
        let updatedState = { ...prev };

        // If a recovery bonus was granted, award bonus XP to the user
        if (result.recoveryBonus && result.recoveryBonus.bonusXp > 0) {
          updatedState = addXp(result.recoveryBonus.bonusXp, updatedState);
        }

        // Also process recovery metrics (rolling avg days, fastest days, recovery rate)
        const recoveryEvents = updatedState.user.recoveryEvents || [];
        const todayStr = result.lastActiveDate || new Date().toISOString().split('T')[0];

        let newEvents = [...recoveryEvents];
        if (result.recoveryBonus && result.recoveryBonus.recoveryGapDays > 0) {
          newEvents.push({
            id: `rec-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
            date: todayStr,
            daysInactive: result.recoveryBonus.recoveryGapDays,
            points: result.recoveryBonus.category === 'SNAP_BACK' ? 95 : result.recoveryBonus.category === 'SLOW_BOUNCE' ? 90 : 60,
            source: actionType.toLowerCase(),
          });
        }

        // Compute updated rolling recovery stats
        const recent5 = newEvents.slice(-5);
        const totalDays = recent5.reduce((acc, ev) => acc + ev.daysInactive, 0);
        const avgDays = recent5.length > 0 ? parseFloat((totalDays / recent5.length).toFixed(1)) : 1.1;
        const fastestDays = newEvents.length > 0 ? Math.min(...newEvents.map(e => e.daysInactive)) : 1;
        const totalPts = recent5.reduce((acc, ev) => acc + ev.points, 0);
        const recoveryRate = recent5.length > 0 ? Math.round(totalPts / recent5.length) : 95;

        return {
          ...updatedState,
          user: {
            ...updatedState.user,
            streak: result.currentStreak,
            bestStreak: Math.max(updatedState.user.bestStreak || 0, result.longestStreak),
            lastActiveDate: result.lastActiveDate,
            lastMissionCompletedDate: result.lastActiveDate,
            lastActionType: actionType,
            recoveryEvents: newEvents,
            avgRecoveryDays: avgDays,
            fastestRecoveryDays: fastestDays,
            recoveryRate,
          },
        };
      });

      const displayTitle = options?.title || (
        actionType === 'MISSION' ? 'Mission Complete' :
        actionType === 'EMERGENCY_RESET' ? 'Emergency Reset' :
        'Evening Reflection'
      );

      if (result.status === 'STARTED' || result.status === 'INCREMENTED') {
        setStreakCelebration({
          streak: result.currentStreak,
          longestStreak: result.longestStreak,
          missionTitle: displayTitle,
          status: result.status,
        });
        setAriaAnnouncement(`Daily activity recorded! Streak extended to ${result.currentStreak} days.`);
      } else if (result.status === 'RESET' && result.recoveryBonus) {
        // Trigger Comeback Celebration Pop-up!
        setComebackCelebration({
          recoveryBonus: result.recoveryBonus,
          missionTitle: displayTitle,
        });
        setAriaAnnouncement(`Resilience comeback registered! ${result.recoveryBonus.title}`);
      } else if (result.status === 'MAINTAINED') {
        setStreakProtectedToast({
          message: result.message || 'Streak Protected! Daily activity already secured for today.',
        });
        setAriaAnnouncement('Streak Protected! Daily activity already secured for today.');
      }
    } catch (e) {
      console.warn('Streak evaluation notification failed:', e);
    }
  };

  const handleSetMissionState = (missionId: string, nextState: MissionState) => {
    setState((prev) => {
      const targetMission = prev.missions.find((m) => m.id === missionId);
      if (!targetMission) return prev;

      const previousState = targetMission.state || (targetMission.completed ? 'COMPLETED' : 'PLANNED');
      if (previousState === nextState) return prev;

      const willBeCompleted = nextState === 'COMPLETED';
      const wasCompleted = previousState === 'COMPLETED';

      let deltaXp = 0;
      if (willBeCompleted && !wasCompleted) {
        deltaXp = targetMission.xpReward;
        // Trigger event-driven streak update for mission completion
        setTimeout(() => {
          triggerActionStreakEvaluation('MISSION', {
            actionDetails: targetMission.id,
            title: targetMission.title,
            baseBonusXp: targetMission.xpReward,
          });
        }, 50);
      } else if (!willBeCompleted && wasCompleted) {
        deltaXp = -targetMission.xpReward;
      }

      const targetAttribute = targetMission.targetAttribute || 'Focus';
      let newLogs = prev.focusLogs || [];

      if (willBeCompleted && !wasCompleted) {
        const completionLog: FocusSessionLog = {
          id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
          missionTitle: targetMission.title,
          durationMinutes: targetMission.durationMinutes || 25,
          date: new Date().toISOString(),
          completionStatus: 'FINISHED',
        };
        newLogs = [completionLog, ...newLogs];
      }

      const updatedMissions = prev.missions.map((m) => {
        if (m.id === missionId) {
          return {
            ...m,
            state: nextState,
            completed: willBeCompleted,
            completedAt: willBeCompleted ? new Date().toISOString() : m.completedAt,
            completedDate: willBeCompleted ? new Date().toISOString().split('T')[0] : undefined,
            startedAt: nextState === 'ACTIVE' ? (m.startedAt || new Date().toISOString()) : m.startedAt,
          };
        }
        return m;
      });

      const updatedStats = deltaXp !== 0 ? applyMissionXpToStat(prev.identityStats, targetAttribute, deltaXp) : prev.identityStats;
      let updatedUser = deltaXp > 0 ? processMissionCompletionRecovery(prev.user).updatedUser : prev.user;

      if (deltaXp > 0) {
        updatedUser = {
          ...updatedUser,
          totalFocusMinutes: (prev.user.totalFocusMinutes || 0) + (targetMission.durationMinutes || 25),
          totalSessionsCompleted: (prev.user.totalSessionsCompleted || 0) + 1,
          lastMissionCompletedDate: new Date().toISOString(),
        };
      }

      const execStats = computeExecutionStats(updatedMissions, updatedUser);
      updatedUser.executionStats = execStats;
      updatedUser.executionRate = execStats.executionRate;

      const newState = {
        ...prev,
        user: updatedUser,
        missions: updatedMissions,
        identityStats: updatedStats,
        focusLogs: newLogs,
      };

      return deltaXp !== 0 ? addXp(deltaXp, newState) : newState;
    });
  };

  const handleToggleMission = (missionId: string) => {
    const targetMission = state.missions.find((m) => m.id === missionId);
    if (!targetMission) return;
    const isCompleted = targetMission.state === 'COMPLETED' || targetMission.completed;
    handleSetMissionState(missionId, isCompleted ? 'PLANNED' : 'COMPLETED');
  };

  const handleUpdateMission = (updatedMission: Mission) => {
    setState((prev) => {
      const updatedMissions = prev.missions.map((m) => (m.id === updatedMission.id ? updatedMission : m));
      const execStats = computeExecutionStats(updatedMissions, prev.user);
      return {
        ...prev,
        user: {
          ...prev.user,
          executionStats: execStats,
          executionRate: execStats.executionRate,
        },
        missions: updatedMissions,
      };
    });
  };

  const handleUpdateMissionAttribute = (missionId: string, targetAttribute: string) => {
    setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) => (m.id === missionId ? { ...m, targetAttribute } : m)),
    }));
  };

  const handleAddMission = (newMission: Omit<Mission, 'id' | 'completed'>) => {
    let finalState: MissionState = newMission.state || 'ACTIVE';
    if (newMission.dueDate && newMission.dueTime) {
      try {
        const dueDateTime = new Date(`${newMission.dueDate}T${newMission.dueTime}:00`);
        if (!isNaN(dueDateTime.getTime()) && dueDateTime.getTime() < Date.now() && newMission.state !== 'COMPLETED') {
          finalState = 'MISSED';
        }
      } catch {
        // Keep finalState
      }
    }

    const created: Mission = {
      ...newMission,
      id: `m-custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      completed: finalState === 'COMPLETED',
      state: finalState,
      priority: newMission.priority || newMission.type || 'SECONDARY',
      type: newMission.priority || newMission.type || 'SECONDARY',
      category: newMission.category || 'Deep Work & Focus',
      createdAt: new Date().toISOString(),
    };
    setState((prev) => {
      const updatedMissions = [...prev.missions, created];
      const execStats = computeExecutionStats(updatedMissions, prev.user);
      return {
        ...prev,
        user: {
          ...prev.user,
          executionStats: execStats,
          executionRate: execStats.executionRate,
        },
        missions: updatedMissions,
      };
    });
  };

  const handleDeleteMission = (missionId: string) => {
    setState((prev) => {
      const target = prev.missions.find((m) => m.id === missionId);
      const updatedMissions = prev.missions.filter((m) => m.id !== missionId);
      const execStats = computeExecutionStats(updatedMissions, prev.user);
      const userWithStats = {
        ...prev.user,
        executionStats: execStats,
        executionRate: execStats.executionRate,
      };
      const newState = { ...prev, user: userWithStats, missions: updatedMissions };
      if (target && target.completed) {
        return addXp(-target.xpReward, newState);
      }
      return newState;
    });
  };

  const handleFocusComplete = (
    success: boolean,
    feedback?: {
      finishState: 'FINISHED' | 'PARTIAL' | 'DISTRACTED';
      distractionReason?: string;
      actualMinutesSpent?: number;
      missionId?: string;
    }
  ) => {
    const mins = activeFocusMission?.durationMinutes || 25;
    const targetAttribute = activeFocusMission?.targetAttribute || 'Focus';
    const isPartial = feedback?.finishState === 'PARTIAL';
    const currentMission = activeFocusMission;
    setActiveFocusMission(null);

    const logStatus: 'FINISHED' | 'PARTIAL' | 'DISTRACTED' = isPartial
      ? 'PARTIAL'
      : success
      ? 'FINISHED'
      : 'DISTRACTED';

    const durationSpent = feedback?.actualMinutesSpent !== undefined
      ? feedback.actualMinutesSpent
      : isPartial
      ? Math.max(1, Math.floor(mins / 2))
      : mins;

    const newLog: FocusSessionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      missionId: currentMission?.id || feedback?.missionId,
      missionTitle: currentMission?.title || 'Focus Session',
      durationMinutes: durationSpent,
      date: new Date().toISOString(),
      completionStatus: logStatus,
      distractionReason: feedback?.distractionReason,
    };

    if (success) {
      let focusXp = XP_REWARDS.FOCUS_25_MIN;
      if (mins >= 90) focusXp = XP_REWARDS.FOCUS_90_MIN;
      else if (mins >= 50) focusXp = XP_REWARDS.FOCUS_50_MIN;

      setState((prev) => {
        let earnedFocusXp = focusXp;
        let earnedMissionXp = 0;

        if (isPartial) {
          earnedFocusXp = Math.floor(focusXp / 2);
        } else if (currentMission && !currentMission.completed) {
          // Trigger streak evaluation on focus completion
          setTimeout(() => {
            triggerActionStreakEvaluation('MISSION', {
              actionDetails: currentMission.id,
              title: currentMission.title,
              baseBonusXp: currentMission.xpReward,
            });
          }, 50);
        }

        // Mark active focus mission as completed or handle partial win
        const updatedMissions = prev.missions.map((m) => {
          if (currentMission && m.id === currentMission.id) {
            if (isPartial) {
              earnedMissionXp = Math.floor(m.xpReward / 2);
              const remainingXp = Math.max(5, m.xpReward - earnedMissionXp);
              const remainingMins = Math.max(5, Math.floor((m.durationMinutes || 25) / 2));
              return {
                ...m,
                state: 'ACTIVE' as const,
                completed: false, // Mission stays active!
                xpReward: remainingXp, // Remaining XP halved
                durationMinutes: remainingMins, // Remaining duration halved
              };
            } else {
              if (!m.completed) {
                earnedMissionXp = m.xpReward;
              }
              return {
                ...m,
                state: 'COMPLETED' as const,
                completed: true,
                completedAt: new Date().toISOString(),
              };
            }
          }
          return m;
        });

        const totalGain = earnedFocusXp + earnedMissionXp;
        const updatedStats = applyMissionXpToStat(prev.identityStats, targetAttribute, totalGain);
        const execStats = computeExecutionStats(updatedMissions, prev.user);
        const updatedUser = {
          ...prev.user,
          executionStats: execStats,
          executionRate: execStats.executionRate,
          totalFocusMinutes: (prev.user.totalFocusMinutes || 0) + durationSpent,
          totalSessionsCompleted: (prev.user.totalSessionsCompleted || 0) + 1,
          lastMissionCompletedDate: new Date().toISOString(),
        };

        const intermediate = {
          ...prev,
          user: updatedUser,
          identityStats: updatedStats,
          missions: updatedMissions,
          focusLogs: [newLog, ...(prev.focusLogs || [])],
        };
        return addXp(totalGain, intermediate);
      });
    } else {
      // Record log even if distracted/stopped early without success
      setState((prev) => ({
        ...prev,
        user: {
          ...prev.user,
          totalFocusMinutes: (prev.user.totalFocusMinutes || 0) + durationSpent,
        },
        focusLogs: [newLog, ...(prev.focusLogs || [])],
      }));
    }
  };

  const handleCompleteReset = () => {
    // Trigger unified streak evaluation for Emergency Reset Action
    setTimeout(() => {
      triggerActionStreakEvaluation('EMERGENCY_RESET', {
        actionDetails: 'emergency_reset_protocol',
        title: 'Emergency Reset Protocol',
        baseBonusXp: 25,
      });
    }, 50);

    setState((prev) => {
      const lastReset = prev.resetLogs[0];
      const lastTime = lastReset ? new Date(lastReset.timestamp).getTime() : 0;
      const COOLDOWN_MS = 60 * 60 * 1000; // 1 hour cooldown for XP/Stats reward
      const isCooldown = lastTime > 0 && Date.now() - lastTime < COOLDOWN_MS;

      const newLog = {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toISOString(),
        completedSteps: 4,
        triggerReason: isCooldown
          ? 'User initiated Emergency Reset Protocol (Cooldown active - no bonus XP).'
          : 'User initiated Emergency Reset Protocol.',
      };

      if (isCooldown) {
        return {
          ...prev,
          resetLogs: [newLog, ...prev.resetLogs],
        };
      }

      const updatedStats = applyActionToStats(prev.identityStats, 'EMERGENCY_RESET');
      const updatedUser = processEmergencyResetRecovery(prev.user);

      const intermediate = {
        ...prev,
        identityStats: updatedStats,
        resetLogs: [newLog, ...prev.resetLogs],
        user: updatedUser,
      };

      return addXp(25, intermediate);
    });
  };

  const handleUpdateIdentityStat = (statId: string, newScore: number) => {
    setState((prev) => ({
      ...prev,
      identityStats: prev.identityStats.map((s) => {
        if (s.id === statId) {
          const newXp = statScoreToXp(newScore);
          return { ...s, score: newScore, xp: newXp };
        }
        return s;
      }),
    }));
  };

  const handleUpdateLifeArea = (areaId: string, newPercentage: number) => {
    setState((prev) => ({
      ...prev,
      lifeAreas: prev.lifeAreas.map((a) => (a.id === areaId ? { ...a, percentage: newPercentage } : a)),
    }));
  };

  const handleAddJournalEntry = (entry: Omit<JournalEntry, 'id'>) => {
    const newEntry: JournalEntry = {
      ...entry,
      id: `journal-${Date.now()}`,
    };

    // Trigger unified streak evaluation for Journal Submission Action
    setTimeout(() => {
      triggerActionStreakEvaluation('JOURNAL_LOG', {
        actionDetails: entry.date,
        title: 'Daily Reflection Log',
        baseBonusXp: 20,
      });
    }, 50);

    setState((prev) => {
      const filtered = prev.journalEntries.filter((j) => j.date !== entry.date);
      const journalText = `${entry.biggestWin || ''} ${entry.lessonLearned || ''} ${entry.tomorrowsFocus || ''}`;
      const isWeeklyReview = journalText.toLowerCase().includes('weekly') || journalText.toLowerCase().includes('review');
      const action = isWeeklyReview ? 'WEEKLY_REVIEW' : 'JOURNAL_ENTRY';
      const updatedStats = applyActionToStats(prev.identityStats, action);

      const intermediate = {
        ...prev,
        identityStats: updatedStats,
        journalEntries: [newEntry, ...filtered],
      };
      return addXp(20, intermediate);
    });
  };

  const handleDeleteJournalEntry = (entryId: string) => {
    setState((prev) => ({
      ...prev,
      journalEntries: prev.journalEntries.filter((j) => j.id !== entryId),
    }));
  };

  const handleSendCoachMessage = async (userText: string) => {
    const userMsg = {
      id: `msg-u-${Date.now()}`,
      sender: 'user' as const,
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    // Append user message immediately
    const updatedHistory = [...state.chatHistory, userMsg];
    setState((prev) => ({ ...prev, chatHistory: updatedHistory }));

    // Prepare rich context payload for AI Coach behavioral analysis aligned with Master System Prompt Section 7
    const completedMissions = state.missions.filter((m) => m.completed);
    const missedMissions = state.missions.filter((m) => !m.completed);
    const completedMissionsCount = completedMissions.length;
    const totalMissionsCount = state.missions.length;
    const missedMissionsCount = missedMissions.length;

    const completedHabitsCount = state.habits.filter((h) => h.current >= h.target).length;
    const totalHabitsCount = state.habits.length;

    const habitsSummary = state.habits.map((h) => `${h.name} (${h.current}/${h.target})`).join(', ') || 'None';
    const completedMissionsSummary = completedMissions.map((m) => `${m.title} (${m.durationMinutes}m)`).join(', ') || 'None yet';
    const missedMissionsSummary = missedMissions.map((m) => `${m.title} (${m.durationMinutes}m)`).join(', ') || 'None';
    
    const identityStatsSummary = state.identityStats.map((s) => `${s.name}: ${s.score}/100`).join(', ');
    const topStat = state.identityStats.reduce((max, s) => (s.score > max.score ? s : max), state.identityStats[0]);

    const journalLogsSummary = state.journalEntries.length > 0
      ? state.journalEntries.slice(0, 5).map((j) => `${j.date}: Mood ${j.moodScore}/5, Energy ${j.energyScore}/5 | Win: "${j.microWin}" | Note: "${j.lessonLearned}"`).join(' ; ')
      : 'No recent journal entries';

    const recentFocusLogsSummary = (state.focusLogs || []).length > 0
      ? state.focusLogs.slice(0, 5).map((f) => `${f.date}: ${f.missionTitle} (${f.durationMinutes}m, Status: ${f.completionStatus}${f.distractionReason ? `, Distraction: "${f.distractionReason}"` : ''})`).join(' ; ')
      : 'No recorded focus logs';

    const avgMood = state.journalEntries.length > 0
      ? (state.journalEntries.reduce((acc, j) => acc + j.moodScore, 0) / state.journalEntries.length).toFixed(1)
      : 'N/A';
    const avgEnergy = state.journalEntries.length > 0
      ? (state.journalEntries.reduce((acc, j) => acc + j.energyScore, 0) / state.journalEntries.length).toFixed(1)
      : 'N/A';

    const currentHour = new Date().getHours();
    const timeOfDay = currentHour < 12 ? 'morning' : currentHour < 17 ? 'afternoon' : currentHour < 21 ? 'evening' : 'night';
    const missionSuccessRate = totalMissionsCount > 0
      ? `${Math.round((completedMissionsCount / totalMissionsCount) * 100)}%`
      : '100%';

    const contextPayload = {
      name: state.user.name,
      level: state.user.level,
      title: state.user.title,
      xp: state.user.xp,
      streak: state.user.streak,
      bestStreak: state.user.bestStreak,
      timesRestarted: (state.user as any).timesRestarted || 0,
      recoveryRate: state.user.recoveryRate,
      momentumScore: state.user.momentumScore,
      identityStatsSummary,
      topIdentityStat: `${topStat.name} ${topStat.score}/100`,
      totalFocusMinutes: state.user.totalFocusMinutes || 0,
      totalSessionsCompleted: state.user.totalSessionsCompleted || 0,
      missionSuccessRate,
      currentDate: new Date().toISOString().split('T')[0],
      currentTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timeOfDay,
      totalMissionsCount,
      completedMissionsCount,
      missedMissionsCount,
      pendingMissions: missedMissions.map((m) => m.title),
      completedMissionsSummary,
      missedMissionsSummary,
      completedHabitsCount,
      totalHabitsCount,
      habitsSummary,
      todayXp: completedMissions.reduce((acc, m) => acc + m.xp, 0),
      journalLogsSummary,
      recentFocusLogsSummary,
      journalCount: state.journalEntries.length,
      avgMood,
      avgEnergy,
      weeklyCompletedCount: completedMissionsCount,
    };

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userText,
          history: updatedHistory.slice(-8),
          userContext: contextPayload,
        }),
      });

      const data = await res.json();
      const aiMsg = {
        id: `msg-a-${Date.now()}`,
        sender: 'ai' as const,
        text: data.text || 'Take the next right action. One step at a time.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setState((prev) => ({
        ...prev,
        chatHistory: [...prev.chatHistory, aiMsg],
      }));
    } catch (e) {
      console.error('Coach API call failed:', e);
    }
  };

  const handleRewardXp = (amount: number, reason: string) => {
    setState((prev) => {
      const updatedState = addXp(amount, prev);
      const newStats = applyMissionXpToStat(updatedState.identityStats, 'Discipline', amount);
      return {
        ...updatedState,
        identityStats: newStats,
      };
    });
  };

  const handleResetData = () => {
    const currentName = state.user?.name || 'Alex';
    const freshState = createFreshWorkspaceState(currentName);
    setState(freshState);
    saveState(freshState);
  };

  const totalMissionsCount = state.missions.length;
  const completedMissionsCount = state.missions.filter((m) => m.completed).length;
  const missionCompletionRate = totalMissionsCount > 0 ? Math.round((completedMissionsCount / totalMissionsCount) * 100) : 100;

  const totalFocusMinutes = state.user?.totalFocusMinutes ?? state.missions
    .filter((m) => m.completed)
    .reduce((acc, m) => acc + (m.durationMinutes || 25), 0);

  return (
    <div className="min-h-screen bg-[#0B0F17] text-foreground font-sans selection:bg-blue-600/30 selection:text-blue-200 relative overflow-x-hidden">
      {/* Skip to Content link for keyboard accessibility */}
      <a href="#main-content" className="sr-only focus:not-sr-only">
        Skip to main content
      </a>

      {/* Screen Reader Live Region for polite asynchronous state announcements */}
      <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {ariaAnnouncement}
      </div>

      {/* Sleek Dark Ambient Glow Live Background */}
      <LiveBackground />

      {/* Desktop Navigation Top Bar (hidden on mobile) */}
      <DesktopNav
        activeTab={state.activeTab}
        onSelectTab={(tab) => setState((prev) => ({ ...prev, activeTab: tab }))}
        onOpenResetModal={() => setShowResetModal(true)}
        onOpenProfile={() => setShowProfileModal(true)}
        onOpenStreakModal={() => setShowStreakModal(true)}
        user={state.user}
      />

      {/* Responsive App Frame Container */}
      <main
        id="main-content"
        tabIndex={-1}
        className={`relative z-10 w-full max-w-md md:max-w-4xl lg:max-w-6xl xl:max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 outline-none ${
          state.activeTab === 'coach'
            ? 'h-[calc(100dvh-64px)] md:h-[calc(100dvh-70px)] pt-3 pb-[80px] md:pb-6 flex flex-col'
            : 'py-4 md:py-6 space-y-4 pb-32 md:pb-12'
        }`}
      >

        {/* Tab 1: HOME DASHBOARD */}
        {state.activeTab === 'home' && (
          <div className="animate-in fade-in">
            {/* Responsive 2-Column Bento Grid for Desktop */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column (Momentum & Missions) */}
              <div className="lg:col-span-7 xl:col-span-7 space-y-5">
                <Header
                  user={state.user}
                  missions={state.missions}
                  missionRate={missionCompletionRate}
                  restartsCount={state.resetLogs.length}
                  onOpenProfile={() => setShowProfileModal(true)}
                />

                <MissionsSection
                  user={state.user}
                  missions={state.missions}
                  focusLogs={state.focusLogs || []}
                  onToggleMission={handleToggleMission}
                  onSetMissionState={handleSetMissionState}
                  onStartFocusSession={(mission) => setActiveFocusMission(mission)}
                  onAddMission={handleAddMission}
                  onUpdateMission={handleUpdateMission}
                  onDeleteMission={handleDeleteMission}
                  onUpdateMissionAttribute={handleUpdateMissionAttribute}
                  onOpenArchive={() => setState((prev) => ({ ...prev, activeTab: 'about' }))}
                />
              </div>

              {/* Right Column (AI Insights & Calendar/Heatmap Grid) */}
              <div className="lg:col-span-5 xl:col-span-5 space-y-5 lg:sticky lg:top-20">
                <AIInsightCard
                  user={state.user}
                  missions={state.missions}
                  habits={state.habits}
                  journalEntries={state.journalEntries}
                  focusLogs={state.focusLogs}
                  identityStats={state.identityStats}
                  heatmap={state.heatmap}
                  resetLogs={state.resetLogs}
                />

                <HeatmapGrid
                  heatmap={state.heatmap}
                  user={state.user}
                  totalFocusMinutes={totalFocusMinutes}
                  missionCompletionRate={missionCompletionRate}
                />
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: EVENING JOURNAL & EVOLUTION */}
        {state.activeTab === 'journal' && (
          <div className="animate-in fade-in">
            <JournalTab
              user={state.user}
              journalEntries={state.journalEntries}
              onAddJournalEntry={handleAddJournalEntry}
              onDeleteJournalEntry={handleDeleteJournalEntry}
            />
          </div>
        )}

        {/* Tab 3: AI MENTOR COACH */}
        {state.activeTab === 'coach' && (
          <div className="animate-in fade-in flex-1 flex flex-col min-h-0">
            <AICoachTab state={state} onSendMessage={handleSendCoachMessage} />
          </div>
        )}

        {/* Tab 4: ABOUT REBUILDOS & MISSION ARCHIVE */}
        {state.activeTab === 'about' && (
          <div className="animate-in fade-in">
            <AboutTab
              user={state.user}
              missions={state.missions}
              archivedMissions={state.archivedMissions || []}
            />
          </div>
        )}

        {/* Bottom Navigation (Mobile Only) */}
        <BottomNav
          activeTab={state.activeTab}
          onSelectTab={(tab) => setState((prev) => ({ ...prev, activeTab: tab }))}
          onOpenResetModal={() => setShowResetModal(true)}
        />
      </main>

      {/* Focus Timer Countdown Modal */}
      {activeFocusMission && (
        <FocusTimerModal
          missionId={activeFocusMission.id}
          missionTitle={activeFocusMission.title}
          durationMinutes={activeFocusMission.durationMinutes || 25}
          xpReward={activeFocusMission.xpReward}
          targetAttribute={activeFocusMission.targetAttribute || 'Focus'}
          onClose={() => setActiveFocusMission(null)}
          onComplete={handleFocusComplete}
        />
      )}

      {/* Emergency Reset Protocol Modal */}
      {showResetModal && (
        <EmergencyResetModal
          onClose={() => setShowResetModal(false)}
          onCompleteReset={handleCompleteReset}
          lastResetTimestamp={state.resetLogs[0]?.timestamp}
        />
      )}

      {/* Profile & Settings Modal */}
      {showProfileModal && (
        <ProfileModal
          user={state.user}
          onSaveUser={(updated) =>
            setState((prev) => ({
              ...prev,
              user: { ...prev.user, ...updated },
            }))
          }
          onResetData={handleResetData}
          onClose={() => setShowProfileModal(false)}
        />
      )}

      {/* Level Up Identity Celebration Modal */}
      <AnimatePresence>
        {levelUpEvent && (
          <LevelUpModal
            newLevel={levelUpEvent.newLevel}
            title={levelUpEvent.title}
            onClose={() => setLevelUpEvent(null)}
          />
        )}
      </AnimatePresence>

      {/* Streak Details Modal */}
      <AnimatePresence>
        {showStreakModal && (
          <StreakModal
            user={state.user}
            missions={state.missions}
            missionRate={missionCompletionRate}
            onClose={() => setShowStreakModal(false)}
          />
        )}
      </AnimatePresence>

      {/* First Mission of the Day Streak Celebration Modal */}
      <AnimatePresence>
        {streakCelebration && (
          <StreakCelebrationModal
            streak={streakCelebration.streak}
            longestStreak={streakCelebration.longestStreak}
            missionTitle={streakCelebration.missionTitle}
            status={streakCelebration.status}
            onClose={() => setStreakCelebration(null)}
          />
        )}
      </AnimatePresence>

      {/* Resilience Comeback Celebration Modal (Snap-Back / Slow Bounce / Re-Activation) */}
      <AnimatePresence>
        {comebackCelebration && (
          <ComebackCelebrationModal
            recoveryBonus={comebackCelebration.recoveryBonus}
            missionTitle={comebackCelebration.missionTitle}
            avgRecoveryDays={state.user.avgRecoveryDays}
            onClose={() => setComebackCelebration(null)}
          />
        )}
      </AnimatePresence>

      {/* Multi-Mission Safety: Streak Protected Toast */}
      <AnimatePresence>
        {streakProtectedToast && (
          <StreakProtectedToast
            message={streakProtectedToast.message}
            onDismiss={() => setStreakProtectedToast(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
