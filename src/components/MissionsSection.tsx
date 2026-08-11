import React, { useState } from 'react';
import { Mission, UserProfile, FocusSessionLog } from '../types';
import { Target, Play, Plus, Zap, Check, Clock, Trash2, ChevronDown, ChevronUp, RotateCcw, Shield, Sparkles, Wand2, Bot, AlertTriangle, Calendar, Edit3, ArrowRight } from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMicroWinTone } from '../lib/sound';
import { motion, AnimatePresence } from 'motion/react';
import { CORE_ATTRIBUTES } from '../lib/progression';
import { breakdownIntentionIntoMissions, GeneratedMission } from '../lib/aiPlanner';

interface MissionsSectionProps {
  user?: UserProfile;
  missions: Mission[];
  focusLogs?: FocusSessionLog[];
  onToggleMission: (missionId: string) => void;
  onStartFocusSession: (mission: Mission) => void;
  onAddMission: (mission: Omit<Mission, 'id' | 'completed'>) => void;
  onDeleteMission?: (missionId: string) => void;
  onUpdateMissionAttribute?: (missionId: string, targetAttribute: string) => void;
}

export const MissionsSection: React.FC<MissionsSectionProps> = ({
  user,
  missions,
  focusLogs = [],
  onToggleMission,
  onStartFocusSession,
  onAddMission,
  onDeleteMission,
  onUpdateMissionAttribute,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showPlannerModal, setShowPlannerModal] = useState(false);
  const [showCompleted, setShowCompleted] = useState(false);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newType, setNewType] = useState<'PRIMARY' | 'SECONDARY' | 'BONUS'>('SECONDARY');
  const [newDurationMinutes, setNewDurationMinutes] = useState(25);
  const [newAttribute, setNewAttribute] = useState('Focus');

  // AI Mission Planner State
  const [intentionInput, setIntentionInput] = useState('I need to work on my website.');
  const [generatedMissions, setGeneratedMissions] = useState<GeneratedMission[]>([]);
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [pendingGeneratedIndex, setPendingGeneratedIndex] = useState<number | null>(null);
  const [showRecommendedStack, setShowRecommendedStack] = useState(false);

  const activeMissions = missions.filter((m) => !m.completed);
  const completedMissions = missions.filter((m) => m.completed);

  const completedCount = completedMissions.length;
  const totalCount = missions.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Compute active data days
  const streakDays = user?.streak || 1;
  const daysOfData = Math.max(
    streakDays,
    completedCount >= 3 ? 3 : completedCount > 0 ? 2 : 1
  );
  const isDataSufficient = daysOfData >= 3;
  const isFirstWeek = daysOfData < 7;

  // AI Mission Planner Dynamic Trio based on Data Phase
  const RECOMMENDED_TRIO: Array<Omit<Mission, 'id' | 'completed'>> = !isDataSufficient
    ? [
        {
          title: '25-Minute Baseline Focus Sprint',
          description: 'Single-task focus block to establish your baseline execution velocity (Day ' + daysOfData + '/3).',
          type: 'PRIMARY',
          xpReward: 50,
          durationMinutes: 25,
          targetAttribute: 'Focus',
        },
        {
          title: '15-Minute Health & Movement Protocol',
          description: 'Light exercise or movement session to build your physical health baseline.',
          type: 'SECONDARY',
          xpReward: 30,
          durationMinutes: 15,
          targetAttribute: 'Health',
        },
        {
          title: 'Evening System Audit & Journal Entry',
          description: 'Log 1 win and 1 friction point in your evening reflection to build 3-day data history.',
          type: 'BONUS',
          xpReward: 25,
          durationMinutes: 10,
          targetAttribute: 'Discipline',
        },
      ]
    : isFirstWeek
    ? [
        {
          title: 'Daily Adaptive Deep Work Sprint',
          description: '45 minutes of uninterrupted execution tailored to your last ' + daysOfData + ' days of momentum.',
          type: 'PRIMARY',
          xpReward: 50,
          durationMinutes: 45,
          targetAttribute: 'Focus',
        },
        {
          title: 'Daily Energy Reset & Workout',
          description: '30 minutes of high-intensity movement to maintain neuro-plasticity and physical health.',
          type: 'SECONDARY',
          xpReward: 30,
          durationMinutes: 30,
          targetAttribute: 'Health',
        },
        {
          title: 'Daily Reflection & Priority Anchor',
          description: '10 minutes reviewing today win rate and reinforcing self-trust.',
          type: 'BONUS',
          xpReward: 25,
          durationMinutes: 10,
          targetAttribute: 'Self-Trust',
        },
      ]
    : [
        {
          title: 'Weekly Focus & Execution Block',
          description: '60 minutes targeting your primary leverage goal based on your rolling performance.',
          type: 'PRIMARY',
          xpReward: 50,
          durationMinutes: 60,
          targetAttribute: 'Focus',
        },
        {
          title: 'Weekly Health Mastery Protocol',
          description: '45 minutes of intensive physical training to sustain high health and energy.',
          type: 'SECONDARY',
          xpReward: 30,
          durationMinutes: 45,
          targetAttribute: 'Health',
        },
        {
          title: 'Weekly Strategic Reflection & Audit',
          description: '15 minutes auditing habit completion rates and recovery shields.',
          type: 'BONUS',
          xpReward: 25,
          durationMinutes: 15,
          targetAttribute: 'Resilience',
        },
      ];

  const handleSynthesizeIntention = (customText?: string) => {
    const textToUse = customText !== undefined ? customText : intentionInput;
    if (!textToUse.trim()) return;

    setIsSynthesizing(true);
    setTimeout(() => {
      const results = breakdownIntentionIntoMissions(textToUse, focusLogs, user);
      setGeneratedMissions(results);
      setIsSynthesizing(false);
    }, 350);
  };

  const handleOpenAddModalForGenerated = (gen: GeneratedMission, index: number) => {
    setNewTitle(gen.title);
    setNewDesc(gen.description || '');
    setNewType(gen.type || 'SECONDARY');
    setNewDurationMinutes(gen.suggestedFocusMinutes || gen.durationMinutes || 25);
    setNewAttribute(gen.targetAttribute || 'Focus');
    setPendingGeneratedIndex(index);
    setShowAddModal(true);
  };

  const handleOpenManualAddModal = () => {
    setNewTitle('');
    setNewDesc('');
    setNewType('SECONDARY');
    setNewDurationMinutes(25);
    setNewAttribute('Focus');
    setPendingGeneratedIndex(null);
    setShowAddModal(true);
  };

  const handleApproveAllGenerated = () => {
    generatedMissions.forEach((gen) => {
      onAddMission({
        title: gen.title,
        description: gen.description,
        type: gen.type,
        xpReward: gen.xpReward,
        durationMinutes: gen.suggestedFocusMinutes || gen.durationMinutes,
        targetAttribute: gen.targetAttribute || 'Focus',
      });
    });
    playMicroWinTone();
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    setGeneratedMissions([]);
  };

  const handleInstantiateAllMissions = () => {
    RECOMMENDED_TRIO.forEach((m) => onAddMission(m));
    setShowPlannerModal(false);
    playMicroWinTone();
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.6 },
      colors: ['#06B6D4', '#22C55E', '#A855F7'],
    });
  };

  const handleToggle = (mission: Mission) => {
    onToggleMission(mission.id);

    if (!mission.completed) {
      playMicroWinTone();
      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 },
        colors: ['#22C55E', '#0088FF', '#F59E0B'],
      });
    }
  };

  const handleCreateMission = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const priorityXp = newType === 'PRIMARY' ? 50 : newType === 'SECONDARY' ? 30 : 25;

    onAddMission({
      title: newTitle.trim(),
      description: newDesc.trim() || 'Custom micro-mission for identity alignment.',
      type: newType,
      xpReward: priorityXp,
      durationMinutes: Number(newDurationMinutes) || 25,
      targetAttribute: newAttribute,
    });

    playMicroWinTone();

    if (pendingGeneratedIndex !== null) {
      setGeneratedMissions((prev) => prev.filter((_, i) => i !== pendingGeneratedIndex));
      setPendingGeneratedIndex(null);
    }

    setNewTitle('');
    setNewDesc('');
    setShowAddModal(false);
  };

  const renderMissionCard = (mission: Mission, isCompletedSection = false) => {
    if (isCompletedSection) {
      return (
        <motion.div
          key={mission.id}
          layout
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, x: -30 }}
          className="flex items-center justify-between p-3.5 px-4 rounded-2xl bg-black/40 border border-emerald-500/20 backdrop-blur-md gap-3"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <Check className="w-4 h-4 text-[#00e599] flex-shrink-0" />
            <span className="text-xs sm:text-sm font-light text-neutral-300 line-through truncate">
              {mission.title}
            </span>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => handleToggle(mission)}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-light text-neutral-300 hover:text-white transition-all flex items-center gap-1.5 active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5 text-neutral-400" />
              <span>Undo</span>
            </button>
            {onDeleteMission && (
              <button
                onClick={() => setMissionToDelete(mission)}
                title="Remove Mission"
                className="p-1.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>
      );
    }

    const isPrimary = mission.type === 'PRIMARY';
    const isBonus = mission.type === 'BONUS';

    return (
      <motion.div
        key={mission.id}
        layout
        initial={{ opacity: 0, y: 15, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1, x: 0 }}
        exit={{
          x: 350,
          opacity: 0,
          scale: 0.92,
          transition: { duration: 0.35, ease: [0.32, 0.72, 0, 1] },
        }}
        className={`backdrop-blur-2xl border rounded-[26px] p-5 space-y-3.5 transition-colors relative overflow-hidden ${
          mission.completed
            ? 'border-emerald-500/30 bg-emerald-950/20 opacity-80 shadow-[0_8px_30px_rgb(0,0,0,0.4)]'
            : isPrimary
            ? 'border-cyan-500/40 bg-gradient-to-b from-cyan-950/40 via-black/80 to-black/80 shadow-[0_12px_40px_rgba(6,182,212,0.2)]'
            : 'bg-black/60 border-white/10 hover:border-white/25 shadow-[0_8px_30px_rgb(0,0,0,0.5)]'
        }`}
      >
        {/* Top-Right Trash Icon Button */}
        {onDeleteMission && (
          <button
            onClick={() => setMissionToDelete(mission)}
            title="Remove Mission"
            className="absolute top-4 right-4 p-1.5 rounded-xl text-neutral-500 hover:text-red-400 hover:bg-red-500/10 transition-all active:scale-95 z-10"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        )}

        {/* Top Row: Target Icon + Type, Priority Badge & Title */}
        <div className="flex items-start gap-3.5 pr-8">
          {/* Custom Concentric Target Badge Icon */}
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 border ${
              mission.completed
                ? 'bg-[#0c241a] text-[#00e599] border-emerald-500/30'
                : isPrimary
                ? 'bg-cyan-950/80 text-cyan-300 border-2 border-cyan-500/50 shadow-md shadow-cyan-500/25'
                : isBonus
                ? 'bg-[#261f0c] text-amber-400 border-amber-500/30'
                : 'bg-[#181818] text-neutral-300 border-white/10'
            }`}
          >
            {isBonus ? (
              <Zap className="w-6 h-6" />
            ) : (
              <div className="relative flex items-center justify-center w-6 h-6">
                <div className="w-6 h-6 rounded-full border-2 border-current flex items-center justify-center">
                  <div className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center">
                    <div className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Mission Header Details */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isPrimary ? (
                <span className="px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-mono font-black tracking-wider uppercase bg-cyan-500/15 border border-cyan-500/35 text-cyan-300 flex items-center gap-1.5 shadow-sm shadow-cyan-500/20 whitespace-nowrap">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  CORE PRIORITY
                </span>
              ) : (
                <span
                  className={`text-[11px] font-mono font-bold uppercase tracking-wider block ${
                    isBonus ? 'text-amber-400' : 'text-neutral-400'
                  }`}
                >
                  {mission.type} MISSION
                </span>
              )}
            </div>

            <h4
              className={`font-bold text-white tracking-tight ${
                isPrimary ? 'text-lg sm:text-2xl font-black' : 'text-xl'
              } ${mission.completed ? 'line-through text-neutral-400' : ''}`}
            >
              {mission.title}
            </h4>
          </div>
        </div>

        {/* Description */}
        <p className={`text-xs sm:text-sm leading-relaxed font-light ${isPrimary && !mission.completed ? 'text-neutral-200' : 'text-neutral-400'}`}>
          {mission.description}
        </p>

        {/* Time, XP & Target Attribute Meta Row */}
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-light">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1.5 text-neutral-400 font-light">
              <Clock className="w-3.5 h-3.5 text-neutral-500" />
              {mission.durationMinutes || 25} min
            </span>
            <span className={`${isPrimary ? 'text-cyan-300 font-semibold' : 'text-[#00e599] font-medium'}`}>
              +{mission.xpReward} XP
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-neutral-900/80 border border-white/10 px-2.5 py-1 rounded-xl text-[11px]">
            <Shield className="w-3 h-3 text-cyan-400" />
            <span className="text-neutral-400 font-mono">Benefits:</span>
            <span className="text-cyan-400 font-bold font-mono">{mission.targetAttribute || 'Focus'}</span>
          </div>
        </div>

        {/* Action Buttons Row */}
        <div className="pt-3 border-t border-white/5 flex items-center gap-2">
          {!mission.completed ? (
            <>
              <button
                onClick={() => onStartFocusSession(mission)}
                className={`flex-1 py-3 px-4 rounded-full font-extrabold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all active:scale-98 ${
                  isPrimary
                    ? 'bg-gradient-to-r from-cyan-400 via-emerald-400 to-[#00e599] hover:brightness-110 text-black shadow-lg shadow-cyan-500/25'
                    : 'bg-[#00e599] hover:bg-[#2ae0a0] text-black shadow-md shadow-emerald-500/10'
                }`}
              >
                <Clock className="w-4 h-4 fill-black text-black" />
                <span>Start Focus</span>
              </button>

              <button
                onClick={() => handleToggle(mission)}
                className="py-3 px-5 rounded-full font-bold text-xs sm:text-sm bg-[#222222] hover:bg-[#2e2e2e] text-white transition-all active:scale-98 flex items-center justify-center"
              >
                Done
              </button>
            </>
          ) : (
            <button
              onClick={() => handleToggle(mission)}
              className="flex-1 py-3 px-5 rounded-full font-bold text-xs sm:text-sm bg-[#181818] border border-emerald-500/40 text-[#00e599] hover:bg-neutral-800 transition-all active:scale-98 flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4 text-[#00e599]" />
              <span>Completed (Click to undo)</span>
            </button>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <section className="space-y-3">
      {/* Header Row */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-light tracking-wider text-neutral-400 uppercase whitespace-nowrap">
            TODAY'S MISSIONS
          </h3>

          <div className="flex items-center justify-end gap-1.5">
            <button
              onClick={() => setShowPlannerModal(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-300 text-[11px] font-bold font-mono hover:bg-purple-900/60 transition-all active:scale-95 shadow-sm"
            >
              <Wand2 className="w-3 h-3 text-purple-400" />
              <span>AI Planner</span>
            </button>

            <button
              onClick={handleOpenManualAddModal}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-400 text-[11px] font-bold font-mono hover:bg-emerald-900/60 transition-all active:scale-95"
            >
              <Plus className="w-3 h-3" />
              <span>Add</span>
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 bg-[#181818] rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-gradient-to-r from-[#a855f7] via-[#3b82f6] to-[#00e599] transition-all duration-500 rounded-full"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Active Missions List with Slide-Away Animation */}
      <div className="space-y-3.5">
        <AnimatePresence mode="popLayout">
          {activeMissions.length > 0 ? (
            activeMissions.map((mission) => renderMissionCard(mission))
          ) : (
            <motion.div
              key="all-completed"
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              className="relative overflow-hidden bg-gradient-to-b from-[#0d281e]/80 via-black/90 to-black/90 border border-emerald-500/30 rounded-[28px] p-7 sm:p-8 text-center space-y-4 shadow-[0_16px_40px_rgba(0,229,153,0.12)]"
            >
              {/* Ambient Glow */}
              <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-48 h-24 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />

              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-[#00e599] flex items-center justify-center mx-auto shadow-inner relative z-10">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>

              <div className="space-y-2 max-w-sm mx-auto relative z-10">
                <h4 className="text-white font-bold text-xl sm:text-2xl tracking-tight">
                  Today's work is done.
                </h4>
                <p className="text-sm text-emerald-200/85 font-light leading-relaxed">
                  Take a moment to appreciate that you showed up.
                </p>
                <p className="text-xs font-light text-neutral-400 pt-1 tracking-wider uppercase">
                  See you tomorrow.
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Completed Missions Section */}
      {completedMissions.length > 0 && (
        <div className="pt-2 space-y-3">
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="w-full py-2 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-light text-neutral-300 flex items-center justify-between transition-all"
          >
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-[#00e599]" />
              <span>Completed ({completedMissions.length})</span>
            </span>
            {showCompleted ? <ChevronUp className="w-4 h-4 text-neutral-400" /> : <ChevronDown className="w-4 h-4 text-neutral-400" />}
          </button>

          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="space-y-3.5 overflow-hidden"
              >
                {completedMissions.map((mission) => renderMissionCard(mission, true))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Add Custom Mission Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl">
          <div className="bg-[#121212]/90 backdrop-blur-2xl border border-white/20 rounded-3xl p-5 w-full max-w-sm space-y-4 shadow-[0_16px_40px_rgba(0,0,0,0.6)]">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Target className="w-4 h-4 text-emerald-400" />
              {pendingGeneratedIndex !== null ? 'Configure & Add Mission' : 'Add Daily Mission'}
            </h3>

            <form onSubmit={handleCreateMission} className="space-y-3">
              <div>
                <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                  Mission Title
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Complete high-impact task"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                  Description
                </label>
                <textarea
                  rows={2}
                  placeholder="Objective with zero distractions..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                  Benefits Attribute
                </label>
                <select
                  value={newAttribute}
                  onChange={(e) => setNewAttribute(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                >
                  {CORE_ATTRIBUTES.map((attr) => (
                    <option key={attr} value={attr}>
                      {attr}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                    Priority
                  </label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
                  >
                    <option value="PRIMARY">PRIMARY (+50 XP)</option>
                    <option value="SECONDARY">SECONDARY (+30 XP)</option>
                    <option value="BONUS">BONUS (+25 XP)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-mono text-neutral-400 uppercase block mb-1">
                    Est. Duration (Timer)
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min={5}
                      max={180}
                      step={5}
                      value={newDurationMinutes}
                      onChange={(e) => setNewDurationMinutes(Number(e.target.value))}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 pr-10 text-sm text-white focus:outline-none focus:border-emerald-500 font-mono"
                    />
                    <span className="absolute right-3 text-xs font-mono text-neutral-500 pointer-events-none">
                      m
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setPendingGeneratedIndex(null);
                  }}
                  className="px-3 py-1.5 rounded-xl text-xs font-mono text-neutral-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs shadow-md transition-all active:scale-95"
                >
                  {pendingGeneratedIndex !== null ? 'Approve & Add' : 'Save Mission'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Mission Planner Modal */}
      {showPlannerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in overflow-y-auto max-h-screen">
          <div className="bg-neutral-950/95 border border-white/10 rounded-3xl p-5 md:p-6 w-full max-w-lg space-y-5 shadow-2xl relative text-left my-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Wand2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-white tracking-wide">AI Mission Planner</h3>
                  <p className="text-[11px] text-neutral-400 font-mono">Turn vague goals into concrete micro-sprints</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowPlannerModal(false)}
                className="text-neutral-400 hover:text-white p-1.5 rounded-full hover:bg-white/10 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Input Area */}
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={intentionInput}
                  onChange={(e) => setIntentionInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleSynthesizeIntention();
                    }
                  }}
                  placeholder='Enter a goal (e.g. "Work on website", "Study for exam")'
                  className="w-full bg-black/50 border border-white/10 focus:border-purple-500/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-neutral-500 outline-none transition-all pr-24 font-sans shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => handleSynthesizeIntention()}
                  disabled={isSynthesizing || !intentionInput.trim()}
                  className="absolute right-1.5 top-1.5 bottom-1.5 px-3.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-bold text-xs font-mono flex items-center gap-1.5 transition-all active:scale-95 shadow-md"
                >
                  {isSynthesizing ? (
                    <span className="animate-pulse text-[11px]">Planning...</span>
                  ) : (
                    <>
                      <Wand2 className="w-3.5 h-3.5" />
                      <span>Plan</span>
                    </>
                  )}
                </button>
              </div>

              {/* Generated Missions Breakdown */}
              {generatedMissions.length > 0 && (
                <div className="space-y-3 pt-3 border-t border-white/10">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-mono text-purple-300 font-bold uppercase tracking-wider flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Suggested Missions ({generatedMissions.length})
                    </span>
                    <button
                      type="button"
                      onClick={handleApproveAllGenerated}
                      className="text-[10px] font-mono text-emerald-400 hover:text-emerald-300 font-bold uppercase underline"
                    >
                      Approve & Add All
                    </button>
                  </div>

                  <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
                    {generatedMissions.map((gen, idx) => (
                      <div
                        key={idx}
                        className="p-3.5 rounded-2xl bg-black/40 border border-white/10 hover:border-purple-500/30 transition-all relative flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                      >
                        {/* Left side: Title & Tags */}
                        <div
                          className="space-y-1.5 min-w-0 flex-1 cursor-pointer"
                          onClick={() => handleOpenAddModalForGenerated(gen, idx)}
                        >
                          <h4 className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 hover:text-purple-300 transition-colors">
                            <ArrowRight className="w-3 h-3 text-purple-400 flex-shrink-0" />
                            <span>{gen.title}</span>
                          </h4>

                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span
                              className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-lg border uppercase ${
                                gen.type === 'PRIMARY'
                                  ? 'bg-rose-500/15 text-rose-300 border-rose-500/30'
                                  : gen.type === 'SECONDARY'
                                  ? 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                                  : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                              }`}
                            >
                              {gen.type === 'PRIMARY' ? 'High' : gen.type === 'SECONDARY' ? 'Medium' : 'Low'}
                            </span>
                            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-500/10 px-2 py-0.5 rounded-lg border border-cyan-500/20">
                              {gen.suggestedFocusMinutes || gen.durationMinutes}m
                            </span>
                          </div>
                        </div>

                        {/* Right side: Actions (Edit & Approve & Add open full edit page) */}
                        <div className="flex items-center gap-1.5 flex-shrink-0 self-end sm:self-center ml-auto">
                          <button
                            type="button"
                            onClick={() => handleOpenAddModalForGenerated(gen, idx)}
                            className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-all"
                            title="Configure mission parameters"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleOpenAddModalForGenerated(gen, idx)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/35 text-emerald-300 text-[11px] font-mono font-bold border border-emerald-500/30 flex items-center gap-1.5 transition-all active:scale-95 whitespace-nowrap"
                          >
                            <Plus className="w-3.5 h-3.5" />
                            <span>Approve & Add</span>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Collapsible 3 Recommended Daily Missions */}
            <div className="border border-white/10 rounded-2xl bg-black/40 overflow-hidden">
              <button
                type="button"
                onClick={() => setShowRecommendedStack(!showRecommendedStack)}
                className="w-full p-3 flex items-center justify-between text-xs font-mono font-bold text-neutral-300 hover:text-white hover:bg-white/5 transition-all text-left"
              >
                <div className="flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Standard System Recommendations (3 Missions)</span>
                </div>
                {showRecommendedStack ? (
                  <ChevronUp className="w-4 h-4 text-neutral-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-400" />
                )}
              </button>

              <AnimatePresence>
                {showRecommendedStack && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="p-3 pt-0 space-y-3 border-t border-white/5"
                  >
                    {!isDataSufficient ? (
                      <p className="text-[11px] text-amber-300 font-mono pt-2">
                        ⚡ Baseline Mode (Day {daysOfData}/3): Initial baseline trio.
                      </p>
                    ) : (
                      <p className="text-[11px] text-neutral-400 font-mono pt-2">
                        Tailored stack based on rolling performance data:
                      </p>
                    )}

                    <div className="space-y-2">
                      {RECOMMENDED_TRIO.map((rec, i) => (
                        <div
                          key={i}
                          className="p-2.5 rounded-xl bg-black/60 border border-purple-500/20 hover:border-purple-500/40 transition-all space-y-1 relative"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-500/30 uppercase">
                                {rec.type}
                              </span>
                              <span className="text-[10px] font-mono text-neutral-400">
                                {rec.durationMinutes}m · +{rec.xpReward} XP
                              </span>
                            </div>
                            <button
                              type="button"
                              onClick={() => {
                                onAddMission(rec);
                                playMicroWinTone();
                              }}
                              className="px-2 py-0.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/35 text-purple-200 text-[10px] font-mono font-bold border border-purple-500/30 flex items-center gap-1 transition-all active:scale-95 flex-shrink-0"
                            >
                              <Plus className="w-3 h-3" />
                              <span>Add</span>
                            </button>
                          </div>
                          <h4 className="text-xs font-bold text-white tracking-tight">{rec.title}</h4>
                          <p className="text-[11px] text-neutral-400 leading-snug">{rec.description}</p>
                        </div>
                      ))}
                    </div>

                    <button
                      type="button"
                      onClick={handleInstantiateAllMissions}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-500 via-cyan-400 to-emerald-400 hover:brightness-110 text-black font-extrabold text-xs transition-all shadow-md flex items-center justify-center gap-1.5 active:scale-98"
                    >
                      <Sparkles className="w-3.5 h-3.5 fill-black" />
                      <span>Instantiate All 3 Standard Missions</span>
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="pt-1">
              <button
                type="button"
                onClick={() => setShowPlannerModal(false)}
                className="w-full py-2 text-center text-xs font-mono text-neutral-400 hover:text-white"
              >
                Close Planner
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Remove Mission Confirmation Modal */}
      {missionToDelete && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-2xl relative">
            <div className="flex items-center gap-3 text-red-400">
              <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-red-400" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Remove Mission</h3>
                <p className="text-xs text-neutral-400">This action cannot be undone.</p>
              </div>
            </div>

            <p className="text-sm text-neutral-300 leading-relaxed">
              Are you sure you want to remove <span className="font-semibold text-white">"{missionToDelete.title}"</span>?
            </p>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setMissionToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-mono font-bold text-neutral-300 bg-white/5 hover:bg-white/10 border border-white/5 transition-all"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (onDeleteMission && missionToDelete) {
                    onDeleteMission(missionToDelete.id);
                  }
                  setMissionToDelete(null);
                }}
                className="px-4 py-2 rounded-xl bg-red-500 hover:bg-red-600 text-white font-bold text-xs shadow-md transition-all active:scale-95"
              >
                Remove Mission
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

