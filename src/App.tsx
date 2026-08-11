import React, { useState, useEffect } from 'react';
import { Zap } from 'lucide-react';
import { loadState, saveState, resetToDefaults, processDailyStreak, createFreshWorkspaceState } from './lib/storage';
import { processMissionCompletionRecovery, processEmergencyResetRecovery } from './lib/recovery';
import { getXpToNextLevel, getTitleForLevel, XP_REWARDS, applyActionToStats, applyMissionXpToStat, statScoreToXp } from './lib/progression';
import { RebuildOSState, Mission, HabitRing, JournalEntry, FocusSessionLog } from './types';
import { Header } from './components/Header';
import { IdentitySnapshot } from './components/IdentitySnapshot';
import { MissionsSection } from './components/MissionsSection';
import { AIInsightCard } from './components/AIInsightCard';
import { HeatmapGrid } from './components/HeatmapGrid';
import { FocusTimerModal } from './components/FocusTimerModal';
import { EmergencyResetModal } from './components/EmergencyResetModal';
import { LevelUpModal } from './components/LevelUpModal';
import { IdentityTab } from './components/IdentityTab';
import { JournalTab } from './components/JournalTab';
import { AICoachTab } from './components/AICoachTab';
import { BottomNav } from './components/BottomNav';
import { ProfileModal } from './components/ProfileModal';
import { LiveBackground } from './components/LiveBackground';
import { AnimatePresence } from 'motion/react';

export default function App() {
  const [state, setState] = useState<RebuildOSState>(() => loadState());
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);
  const [activeFocusMission, setActiveFocusMission] = useState<Mission | null>(null);
  const [levelUpEvent, setLevelUpEvent] = useState<{ newLevel: number; title: string } | null>(null);

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

  const handleToggleMission = (missionId: string) => {
    setState((prev) => {
      let deltaXp = 0;
      let targetAttribute = 'Discipline';
      let newLogs = prev.focusLogs || [];

      const targetMission = prev.missions.find((m) => m.id === missionId);
      if (targetMission) {
        targetAttribute = targetMission.targetAttribute || 'Discipline';
        if (!targetMission.completed) {
          const toggleLog: FocusSessionLog = {
            id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
            missionTitle: targetMission.title,
            durationMinutes: targetMission.durationMinutes || 25,
            date: new Date().toISOString(),
            completionStatus: 'FINISHED',
          };
          newLogs = [toggleLog, ...newLogs];
        }
      }

      const updatedMissions = prev.missions.map((m) => {
        if (m.id === missionId) {
          const nextVal = !m.completed;
          deltaXp = nextVal ? m.xpReward : -m.xpReward;
          return { ...m, completed: nextVal };
        }
        return m;
      });

      const updatedStats = applyMissionXpToStat(prev.identityStats, targetAttribute, deltaXp);
      let updatedUser = deltaXp > 0 ? processMissionCompletionRecovery(prev.user) : prev.user;

      if (deltaXp > 0) {
        updatedUser = {
          ...updatedUser,
          totalFocusMinutes: (prev.user.totalFocusMinutes || 0) + (targetMission?.durationMinutes || 25),
          totalSessionsCompleted: (prev.user.totalSessionsCompleted || 0) + 1,
          lastMissionCompletedDate: new Date().toISOString(),
        };
      }

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

  const handleUpdateMissionAttribute = (missionId: string, targetAttribute: string) => {
    setState((prev) => ({
      ...prev,
      missions: prev.missions.map((m) => (m.id === missionId ? { ...m, targetAttribute } : m)),
    }));
  };

  const handleAddMission = (newMission: Omit<Mission, 'id' | 'completed'>) => {
    const created: Mission = {
      ...newMission,
      id: `m-custom-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      completed: false,
    };
    setState((prev) => ({
      ...prev,
      missions: [...prev.missions, created],
    }));
  };

  const handleDeleteMission = (missionId: string) => {
    setState((prev) => {
      const target = prev.missions.find((m) => m.id === missionId);
      const updatedMissions = prev.missions.filter((m) => m.id !== missionId);
      const newState = { ...prev, missions: updatedMissions };
      if (target && target.completed) {
        return addXp(-target.xpReward, newState);
      }
      return newState;
    });
  };

  const handleFocusComplete = (
    success: boolean,
    feedback?: { finishState: string; distractionReason?: string }
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

    const durationSpent = isPartial ? Math.max(1, Math.floor(mins / 2)) : mins;

    const newLog: FocusSessionLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
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
                completed: false, // Mission stays active!
                xpReward: remainingXp, // Remaining XP halved
                durationMinutes: remainingMins, // Remaining duration halved
              };
            } else {
              if (!m.completed) {
                earnedMissionXp = m.xpReward;
              }
              return { ...m, completed: true };
            }
          }
          return m;
        });

        const totalGain = earnedFocusXp + earnedMissionXp;
        const updatedStats = applyMissionXpToStat(prev.identityStats, targetAttribute, totalGain);
        const baseUser = processMissionCompletionRecovery(prev.user);
        const updatedUser = {
          ...baseUser,
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

    // Prepare rich context payload for AI Coach behavioral analysis
    const completedMissions = state.missions.filter((m) => m.completed);
    const missedMissions = state.missions.filter((m) => !m.completed);
    const completedMissionsCount = completedMissions.length;
    const totalMissionsCount = state.missions.length;

    const completedHabitsCount = state.habits.filter((h) => h.current >= h.target).length;
    const totalHabitsCount = state.habits.length;

    const habitsSummary = state.habits.map((h) => `${h.name} (${h.current}/${h.target})`).join(', ');
    const completedMissionsSummary = completedMissions.map((m) => `${m.title} (${m.durationMinutes}m)`).join(', ') || 'None yet';
    const missedMissionsSummary = missedMissions.map((m) => `${m.title} [Priority: ${m.type}, Est: ${m.durationMinutes}m]`).join(', ') || 'None';
    
    const topStat = state.identityStats.reduce((max, s) => (s.score > max.score ? s : max), state.identityStats[0]);

    const journalLogsSummary = state.journalEntries.length > 0
      ? state.journalEntries.slice(0, 5).map((j) => `${j.date}: Mood ${j.moodScore}/5, Energy ${j.energyScore}/5 | MicroWin: "${j.microWin}" | Lesson/Trigger: "${j.lessonLearned}"`).join(' ; ')
      : 'No previous journal entries';

    const recentFocusLogsSummary = (state.focusLogs || []).length > 0
      ? state.focusLogs.slice(0, 5).map((f) => `${f.date}: ${f.missionTitle} (${f.durationMinutes}m, Status: ${f.completionStatus}${f.distractionReason ? `, Distraction: "${f.distractionReason}"` : ''})`).join(' ; ')
      : 'No recorded focus logs';

    const avgMood = state.journalEntries.length > 0
      ? (state.journalEntries.reduce((acc, j) => acc + j.moodScore, 0) / state.journalEntries.length).toFixed(1)
      : 'N/A';
    const avgEnergy = state.journalEntries.length > 0
      ? (state.journalEntries.reduce((acc, j) => acc + j.energyScore, 0) / state.journalEntries.length).toFixed(1)
      : 'N/A';

    const contextPayload = {
      name: state.user.name,
      level: state.user.level,
      title: state.user.title,
      xp: state.user.xp,
      streak: state.user.streak,
      bestStreak: state.user.bestStreak,
      recoveryRate: state.user.recoveryRate,
      momentumScore: state.user.momentumScore,
      totalFocusMinutes: state.user.totalFocusMinutes || 0,
      totalSessionsCompleted: state.user.totalSessionsCompleted || 0,
      completedMissionsCount,
      totalMissionsCount,
      completedMissionsSummary,
      missedMissionsSummary,
      completedHabitsCount,
      totalHabitsCount,
      habitsSummary,
      topIdentityStat: `${topStat.name} ${topStat.score}/100`,
      journalLogsSummary,
      recentFocusLogsSummary,
      avgMood,
      avgEnergy,
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
        text: data.text || 'Keep pressing forward. Small winscompound into massive momentum.',
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
    const currentName = state.user?.name || 'Operator';
    const freshState = createFreshWorkspaceState(currentName);
    setState(freshState);
    saveState(freshState);
  };

  const totalMissionsCount = state.missions.length;
  const completedMissionsCount = state.missions.filter((m) => m.completed).length;
  const missionCompletionRate = totalMissionsCount > 0 ? Math.round((completedMissionsCount / totalMissionsCount) * 100) : 100;

  const totalFocusMinutes = state.missions
    .filter((m) => m.completed)
    .reduce((acc, m) => acc + (m.durationMinutes || 25), 0);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500 selection:text-black relative overflow-x-hidden">
      {/* Sleek Dark Ambient Glow Live Background */}
      <LiveBackground />

      {/* Mobile-First Frame Container */}
      <div className="relative z-10 max-w-md mx-auto px-4 py-6 space-y-6 pb-28">

        {/* Tab 1: HOME DASHBOARD */}
        {state.activeTab === 'home' && (
          <div className="space-y-6 animate-in fade-in">
            <Header
              user={state.user}
              missionRate={missionCompletionRate}
              restartsCount={state.resetLogs.length}
              onOpenProfile={() => setShowProfileModal(true)}
            />

            <MissionsSection
              user={state.user}
              missions={state.missions}
              focusLogs={state.focusLogs || []}
              onToggleMission={handleToggleMission}
              onStartFocusSession={(mission) => setActiveFocusMission(mission)}
              onAddMission={handleAddMission}
              onDeleteMission={handleDeleteMission}
              onUpdateMissionAttribute={handleUpdateMissionAttribute}
            />

            <AIInsightCard
              user={state.user}
              missions={state.missions}
              habits={state.habits}
            />

            <IdentitySnapshot
              identityStats={state.identityStats}
              onNavigateToIdentity={() => setState((prev) => ({ ...prev, activeTab: 'identity' }))}
            />

            <HeatmapGrid
              heatmap={state.heatmap}
              user={state.user}
              totalFocusMinutes={totalFocusMinutes}
              missionCompletionRate={missionCompletionRate}
            />
          </div>
        )}

        {/* Tab 2: IDENTITY STATS */}
        {state.activeTab === 'identity' && (
          <div className="animate-in fade-in">
            <IdentityTab
              identityStats={state.identityStats}
            />
          </div>
        )}

        {/* Tab 3: EVENING JOURNAL & EVOLUTION */}
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

        {/* Tab 4: AI MENTOR COACH */}
        {state.activeTab === 'coach' && (
          <div className="animate-in fade-in -mb-16">
            <AICoachTab state={state} onSendMessage={handleSendCoachMessage} />
          </div>
        )}

        {/* Bottom Navigation */}
        <BottomNav
          activeTab={state.activeTab}
          onSelectTab={(tab) => setState((prev) => ({ ...prev, activeTab: tab }))}
          onOpenResetModal={() => setShowResetModal(true)}
        />
      </div>

      {/* Focus Timer Countdown Modal */}
      {activeFocusMission && (
        <FocusTimerModal
          missionTitle={activeFocusMission.title}
          durationMinutes={activeFocusMission.durationMinutes || 25}
          xpReward={activeFocusMission.xpReward}
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
    </div>
  );
}
