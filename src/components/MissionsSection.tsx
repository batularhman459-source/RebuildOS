import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Mission, UserProfile, FocusSessionLog, MissionState, MissionPriority } from '../types';
import {
  Target,
  Plus,
  Minus,
  Zap,
  Check,
  Clock,
  Trash2,
  ChevronDown,
  ChevronUp,
  Shield,
  Sparkles,
  Calendar,
  Edit3,
  ArrowLeft,
  Flame,
  AlertCircle,
  XCircle,
  MoreVertical,
  Activity,
  HeartPulse,
  Brain,
  Compass,
  CheckCircle2,
  ListChecks,
  X,
  Navigation,
  Play,
  Archive,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { playMicroWinTone } from '../lib/sound';
import { motion, AnimatePresence } from 'motion/react';
import { CORE_ATTRIBUTES, MISSION_CATEGORIES, MISSION_PRIORITIES } from '../lib/progression';
import {
  MissionCategoryDef,
  loadCustomCategories,
  getCategoryDefinition,
  renderCategoryIcon,
} from '../lib/categories';
import { CategoryPicker } from './CategoryPicker';
import { LiquidMetalButton } from './ui/liquid-metal-button';
import { MorphingCardStack, CardData } from './ui/morphing-card-stack';
import { Layers } from 'lucide-react';

interface MissionsSectionProps {
  user?: UserProfile;
  missions: Mission[];
  focusLogs?: FocusSessionLog[];
  onToggleMission: (missionId: string) => void;
  onSetMissionState?: (missionId: string, newState: MissionState) => void;
  onStartFocusSession: (mission: Mission) => void;
  onAddMission: (mission: Omit<Mission, 'id' | 'completed'>) => void;
  onUpdateMission?: (mission: Mission) => void;
  onDeleteMission?: (missionId: string) => void;
  onUpdateMissionAttribute?: (missionId: string, targetAttribute: string) => void;
  onOpenArchive?: () => void;
}

type FilterTab = 'active' | 'planned' | 'completed' | 'missed';

export const MissionsSection: React.FC<MissionsSectionProps> = ({
  user,
  missions,
  focusLogs = [],
  onToggleMission,
  onSetMissionState,
  onStartFocusSession,
  onAddMission,
  onUpdateMission,
  onDeleteMission,
  onUpdateMissionAttribute,
  onOpenArchive,
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterTab>('active');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingMission, setEditingMission] = useState<Mission | null>(null);
  const [missionToDelete, setMissionToDelete] = useState<Mission | null>(null);
  const [activeMenuMissionId, setActiveMenuMissionId] = useState<string | null>(null);
  const [showAdvancedOptions, setShowAdvancedOptions] = useState(false);
  const [customCategories, setCustomCategories] = useState<MissionCategoryDef[]>(() =>
    loadCustomCategories()
  );

  // Helper to check if due date & time is in the past
  const isDueDateTimePast = (dueDateStr?: string, dueTimeStr?: string): boolean => {
    if (!dueDateStr) return false;
    const timeStr = dueTimeStr || '23:59';
    try {
      const dueDateTime = new Date(`${dueDateStr}T${timeStr}:00`);
      if (isNaN(dueDateTime.getTime())) return false;
      return dueDateTime.getTime() < Date.now();
    } catch {
      return false;
    }
  };

  const getDefaultFutureTime = () => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(Math.floor(now.getMinutes() / 15) * 15).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  // Form states for Add / Edit
  const [formTitle, setFormTitle] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Deep Work & Focus');
  const [formPriority, setFormPriority] = useState<MissionPriority>('PRIMARY');
  const [formDuration, setFormDuration] = useState(25);
  const [formAttribute, setFormAttribute] = useState('Focus');
  const [formDueDate, setFormDueDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [formDueTime, setFormDueTime] = useState<string>(() => {
    const now = new Date();
    now.setHours(now.getHours() + 1);
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(Math.floor(now.getMinutes() / 15) * 15).padStart(2, '0');
    return `${hh}:${mm}`;
  });
  const [formState, setFormState] = useState<MissionState>('ACTIVE');

  // Check if current form due date and time is past
  const isFormDueTimePast = useMemo(() => {
    return isDueDateTimePast(formDueDate, formDueTime);
  }, [formDueDate, formDueTime]);

  // Categorize missions strictly for TODAY
  const todayStr = new Date().toISOString().split('T')[0];

  const isDoneToday = (m: Mission) => {
    const isCompleted = m.state === 'COMPLETED' || m.completed === true;
    if (!isCompleted) return false;
    const compDate =
      m.completedDate ||
      (m.completedAt ? m.completedAt.split('T')[0] : null) ||
      m.dueDate;
    return compDate === todayStr;
  };

  const isMissedToday = (m: Mission) => {
    const isMissed = m.state === 'MISSED';
    if (!isMissed) return false;
    const missedDate =
      m.dueDate ||
      (m.createdAt ? m.createdAt.split('T')[0] : null);
    return !missedDate || missedDate === todayStr;
  };

  // Only non-archived missions belong to today's active dashboard
  const activeWorkingMissions = missions.filter((m) => !m.isArchived && m.state === 'ACTIVE');
  const plannedMissions = missions.filter(
    (m) => !m.isArchived && (m.state === 'PLANNED' || (!m.state && !m.completed))
  );
  // Done page ONLY shows missions completed TODAY
  const completedMissionsToday = missions.filter((m) => !m.isArchived && isDoneToday(m));
  // Missed page ONLY shows missions missed TODAY
  const missedMissions = missions.filter((m) => !m.isArchived && isMissedToday(m));

  // Today's total active focus scope
  const todayTotalMissions = missions.filter(
    (m) => !m.isArchived && ((m.state !== 'COMPLETED' && !m.completed) || isDoneToday(m))
  );

  const totalCount = todayTotalMissions.length;
  const completedCount = completedMissionsToday.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Filtered list to display
  const displayedMissions = missions.filter((m) => {
    if (m.isArchived) return false;
    const s = m.state || (m.completed ? 'COMPLETED' : 'PLANNED');
    if (activeFilter === 'active') return s === 'ACTIVE';
    if (activeFilter === 'planned') return s === 'PLANNED';
    if (activeFilter === 'completed') return isDoneToday(m);
    if (activeFilter === 'missed') return isMissedToday(m);
    return true;
  });

  // Modal open handlers
  const handleOpenCreateModal = () => {
    setEditingMission(null);
    setFormTitle('');
    setFormDesc('');
    setFormCategory('Deep Work & Focus');
    setFormPriority('PRIMARY');
    setFormDuration(25);
    setFormAttribute('Focus');
    setFormDueDate(new Date().toISOString().split('T')[0]);
    setFormDueTime(getDefaultFutureTime());
    setFormState('ACTIVE');
    setShowAdvancedOptions(false);
    setShowAddModal(true);
  };

  const handleOpenEditModal = (mission: Mission) => {
    setEditingMission(mission);
    setFormTitle(mission.title);
    setFormDesc(mission.description || '');
    setFormCategory(mission.category || 'Deep Work & Focus');
    setFormPriority(mission.priority || mission.type || 'SECONDARY');
    setFormDuration(mission.durationMinutes || 25);
    setFormAttribute(mission.targetAttribute || 'Focus');
    setFormDueDate(mission.dueDate || new Date().toISOString().split('T')[0]);
    setFormDueTime(mission.dueTime || '14:00');
    setFormState(mission.state || (mission.completed ? 'COMPLETED' : 'ACTIVE'));
    setShowAdvancedOptions(Boolean(mission.description && mission.description.length > 0));
    setShowAddModal(true);
    setActiveMenuMissionId(null);
  };

  const handleSaveMissionForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const priorityXp = formPriority === 'PRIMARY' ? 50 : formPriority === 'SECONDARY' ? 30 : 20;
    const isPast = isDueDateTimePast(formDueDate, formDueTime);

    if (editingMission && onUpdateMission) {
      const finalState: MissionState = (isPast && formState !== 'COMPLETED') ? 'MISSED' : formState;
      onUpdateMission({
        ...editingMission,
        title: formTitle.trim(),
        description: formDesc.trim(),
        category: formCategory,
        priority: formPriority,
        type: formPriority,
        durationMinutes: Number(formDuration) || 25,
        targetAttribute: formAttribute,
        dueDate: formDueDate,
        dueTime: formDueTime,
        state: finalState,
        completed: finalState === 'COMPLETED',
        xpReward: priorityXp,
      });
      if (finalState === 'MISSED') {
        setActiveFilter('missed');
      }
    } else {
      const finalState: MissionState = isPast ? 'MISSED' : (formState || 'ACTIVE');
      onAddMission({
        title: formTitle.trim(),
        description: formDesc.trim() || 'Tactical mission for identity alignment.',
        category: formCategory,
        priority: formPriority,
        type: formPriority,
        state: finalState,
        xpReward: priorityXp,
        durationMinutes: Number(formDuration) || 25,
        targetAttribute: formAttribute,
        dueDate: formDueDate,
        dueTime: formDueTime,
        createdAt: new Date().toISOString(),
      });
      if (finalState === 'MISSED') {
        setActiveFilter('missed');
      }
    }

    setShowAddModal(false);
    setEditingMission(null);
  };

  const handleSetState = (missionId: string, newState: MissionState) => {
    if (onSetMissionState) {
      onSetMissionState(missionId, newState);
    } else {
      // Fallback
      onToggleMission(missionId);
    }
    setActiveMenuMissionId(null);

    if (newState === 'COMPLETED') {
      playMicroWinTone();
      confetti({
        particleCount: 50,
        spread: 65,
        origin: { y: 0.6 },
        colors: ['#5E1473', '#FF00FF', '#FCCF3A'],
      });
    }
  };

  const handleStartMissionFocus = (mission: Mission) => {
    if (mission.state !== 'ACTIVE' && onSetMissionState) {
      onSetMissionState(mission.id, 'ACTIVE');
    }
    onStartFocusSession(mission);
  };

  // Helper for category badge icons
  const getCategoryIcon = (categoryName?: string) => {
    const cat = getCategoryDefinition(categoryName, customCategories);
    return renderCategoryIcon(cat.iconName, 'w-3.5 h-3.5', cat.color);
  };

  const formatCompletionTime = (isoString?: string) => {
    if (!isoString) return null;
    try {
      const d = new Date(isoString);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return null;
    }
  };

  const formatDueDateLabel = (dueDate?: string, dueTime?: string) => {
    if (!dueDate) return null;
    const isToday = dueDate === todayStr;
    const timePart = dueTime ? ` @ ${dueTime}` : '';
    if (isToday) return `Due Today${timePart}`;
    return `Due ${dueDate}${timePart}`;
  };

  return (
    <div className="relative overflow-hidden rounded-[24px] sm:rounded-[28px] p-5 sm:p-6 bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.03] backdrop-blur-2xl border border-white/20 shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_15px_35px_rgba(0,0,0,0.35)] transition-all text-white space-y-4">
      {/* Specular Top Rim Highlight */}
      <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />

      {/* Header Row: Title & Action Buttons */}
      <div className="relative z-10 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-xl bg-white/10 border border-white/15 backdrop-blur-md flex items-center justify-center text-white/90 shadow-sm">
            <Target className="w-3.5 h-3.5 stroke-[2]" />
          </div>
          <div className="flex items-center gap-2">
            <h3 className="text-xs sm:text-sm font-medium tracking-wide text-white/90">
              Missions
            </h3>
            <span className="text-[11px] font-sans text-white/50">
              {completedCount}/{totalCount}
            </span>
          </div>
        </div>

        {/* Top Right Actions */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={handleOpenCreateModal}
            className="h-7 px-3 rounded-xl bg-orange-500 hover:bg-orange-400 active:scale-95 text-white text-xs font-semibold backdrop-blur-md shadow-[0_4px_14px_rgba(249,115,22,0.4)] flex items-center gap-1 transition-all cursor-pointer"
            title="Create New Mission"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>New</span>
          </button>
        </div>
      </div>

      {/* Minimal Filter Tabs & Progress Indicator */}
      <div className="relative z-10 space-y-2">
        <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
          <button
            type="button"
            onClick={() => setActiveFilter('active')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeFilter === 'active'
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            Active ({activeWorkingMissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('planned')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeFilter === 'planned'
                ? 'bg-white/20 text-white font-semibold shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            Planned ({plannedMissions.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('completed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeFilter === 'completed'
                ? 'bg-emerald-500/25 text-emerald-300 border border-emerald-500/40 font-semibold shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            Done ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('missed')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer ${
              activeFilter === 'missed'
                ? 'bg-rose-500/25 text-rose-300 border border-rose-500/40 font-semibold shadow-sm'
                : 'text-white/50 hover:text-white/80 hover:bg-white/5'
            }`}
          >
            Missed ({missedMissions.length})
          </button>
        </div>

        {/* Slim Progress Bar */}
        <div className="w-full h-1 bg-black/30 rounded-full overflow-hidden border border-white/5">
          <div
            className="h-full bg-white/80 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${Math.min(100, Math.max(0, completionPercentage))}%` }}
          />
        </div>
      </div>

      {/* Morphing Mission Cards Stack */}
      <div className="relative z-10 py-1">
        {displayedMissions.length > 0 ? (
          <MorphingCardStack
            cards={displayedMissions.map((m) => {
              const catDef = getCategoryDefinition(m.category, customCategories);
              const isCompleted = m.state === 'COMPLETED' || m.completed;
              const isActive = m.state === 'ACTIVE';
              const isMissed = m.state === 'MISSED';

              return {
                id: m.id,
                title: m.title,
                description: m.description || `${m.durationMinutes || 25}m session • ${m.targetAttribute || 'Focus'}`,
                icon: renderCategoryIcon(catDef?.iconName, "w-4.5 h-4.5 text-white/95"),
                headerAction: onDeleteMission ? (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setMissionToDelete(m);
                    }}
                    title="Delete Mission"
                    className="h-6 w-6 rounded-md hover:bg-rose-500/20 text-white/40 hover:text-rose-300 flex items-center justify-center transition-colors cursor-pointer active:scale-95"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                ) : undefined,
                color: isCompleted
                  ? 'rgba(16, 185, 129, 0.12)'
                  : isActive
                  ? 'rgba(255, 255, 255, 0.05)'
                  : isMissed
                  ? 'rgba(244, 63, 94, 0.12)'
                  : undefined,
                footer: (
                  <div className="w-full flex items-center justify-between gap-2 px-0.5" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1.5 text-xs shrink-0">
                      <span className="font-mono font-medium text-white/90 text-[11px] px-2 py-0.5 rounded-md bg-white/10 border border-white/10 shrink-0">
                        +{m.xpReward || 50} XP
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      {/* Focus Session Trigger */}
                      {onStartFocusSession && !isCompleted && (
                        <button
                          type="button"
                          onClick={() => handleStartMissionFocus(m)}
                          title="Start Focus Session"
                          className="h-7 px-2.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/15 text-white flex items-center gap-1 text-[11px] font-medium transition-colors cursor-pointer active:scale-95"
                        >
                          <Play className="w-3 h-3 fill-current text-white/90" />
                          <span>{isActive ? 'Resume' : 'Focus'}</span>
                        </button>
                      )}

                      {/* Complete Checkbox Button */}
                      <button
                        type="button"
                        onClick={() => handleSetState(m.id, isCompleted ? 'PLANNED' : 'COMPLETED')}
                        className={`h-7 px-2.5 rounded-lg border text-[11px] font-medium transition-colors flex items-center gap-1 cursor-pointer active:scale-95 ${
                          isCompleted
                            ? 'bg-emerald-500/25 text-emerald-200 border-emerald-500/40 hover:bg-emerald-500/35'
                            : 'bg-white/10 text-white/90 border-white/15 hover:bg-white/20 hover:text-white'
                        }`}
                      >
                        <Check className="w-3 h-3 stroke-[2.5]" />
                        <span>{isCompleted ? 'Done' : 'Complete'}</span>
                      </button>
                    </div>
                  </div>
                ),
              };
            })}
            defaultLayout="stack"
            onCardClick={(card) => {
              const found = displayedMissions.find((m) => m.id === card.id);
              if (found) {
                handleOpenEditModal(found);
              }
            }}
          />
        ) : (
          <div className="rounded-2xl border border-white/10 bg-[#14151a] p-5 text-center space-y-3 text-white">
            <div className="w-8 h-8 rounded-xl border border-white/10 flex items-center justify-center bg-white/5 text-white/70 mx-auto">
              {activeFilter === 'missed' ? (
                <XCircle className="w-4 h-4 text-rose-400" />
              ) : (
                <Check className="w-4 h-4 text-white/80" />
              )}
            </div>
            <div className="space-y-0.5">
              <h4 className="text-white font-medium text-xs sm:text-sm">
                {activeFilter === 'completed'
                  ? 'No missions completed today'
                  : activeFilter === 'missed'
                  ? 'No missed missions today'
                  : activeFilter === 'active'
                  ? 'No active missions'
                  : 'No planned missions for today'}
              </h4>
              {activeFilter !== 'completed' && activeFilter !== 'missed' && (
                <p className="text-[11px] text-white/40 max-w-xs mx-auto font-light leading-relaxed">
                  {activeFilter === 'active'
                    ? 'Nothing currently in progress.'
                    : 'Add a new mission to plan your day.'}
                </p>
              )}
            </div>
            <div className="flex items-center justify-center gap-2 pt-0.5">
              {activeFilter !== 'missed' && activeFilter !== 'completed' && (
                <button
                  type="button"
                  onClick={handleOpenCreateModal}
                  className="bg-white/10 hover:bg-white/15 text-white font-medium text-xs px-3 py-1.5 rounded-lg border border-white/10 inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-98"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>New mission</span>
                </button>
              )}
              {(activeFilter === 'completed' || activeFilter === 'missed') && onOpenArchive && (
                <button
                  type="button"
                  onClick={onOpenArchive}
                  className="bg-white/10 hover:bg-white/15 text-white/90 hover:text-white font-medium text-xs px-3 py-1.5 rounded-lg border border-white/10 inline-flex items-center gap-1.5 transition-colors cursor-pointer active:scale-98"
                >
                  <Archive className="w-3.5 h-3.5 text-white/60" />
                  <span>View Archive</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Subtle Footer hint when viewing Done or Missed tab with items */}
        {(activeFilter === 'completed' || activeFilter === 'missed') && displayedMissions.length > 0 && onOpenArchive && (
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={onOpenArchive}
              className="text-[11px] text-white/50 hover:text-white/80 transition-colors font-sans inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Looking for past days? View Archive</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* EXPANSIVE OBSIDIAN MISSION CREATOR / EDITOR MODAL WITH FROSTED BACKDROP */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {showAddModal && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[99999] bg-black/65 backdrop-blur-xl flex items-center justify-center p-3 sm:p-6 md:p-8 select-none overflow-y-auto"
                onClick={() => {
                  setShowAddModal(false);
                  setEditingMission(null);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 16 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 12 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  onClick={(e) => e.stopPropagation()}
                  className="relative w-full max-w-2xl max-h-[88vh] bg-black border border-white/15 rounded-[28px] sm:rounded-[32px] text-white flex flex-col shadow-[0_24px_70px_rgba(0,0,0,0.95)] backdrop-blur-2xl overflow-hidden my-auto"
                >
                  {/* Specular Rim Line */}
                  <div className="absolute top-0 inset-x-10 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent pointer-events-none z-30" />

                  {/* Top Header Bar inside rounded container */}
                  <div className="sticky top-0 z-20 bg-black/95 backdrop-blur-xl border-b border-white/10 px-5 sm:px-7 py-3.5 sm:py-4 flex items-center justify-between flex-shrink-0">
                    <div className="flex items-center gap-3">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setEditingMission(null);
                        }}
                        className="h-8.5 px-3 rounded-xl bg-white/5 hover:bg-white/15 border border-white/10 flex items-center gap-2 text-zinc-300 hover:text-white transition-all active:scale-95 cursor-pointer text-xs font-sans"
                      >
                        <ArrowLeft className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Back</span>
                      </button>
                      <div>
                        <h1 className="text-sm sm:text-base font-semibold text-white tracking-tight flex items-center gap-2">
                          <Target className="w-4 h-4 text-zinc-300" />
                          <span>{editingMission ? 'Edit Mission' : 'New Mission'}</span>
                        </h1>
                        <p className="text-[11px] text-zinc-400 hidden sm:block font-normal">
                          {editingMission ? 'Update mission details and time' : 'Set a clear goal for today'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setShowAddModal(false);
                          setEditingMission(null);
                        }}
                        className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/15 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-all active:scale-90 cursor-pointer"
                        aria-label="Close"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Scrollable Form Body Container */}
                  <div className="overflow-y-auto custom-scrollbar p-5 sm:p-7 space-y-6 flex-1 text-left">
                    <form onSubmit={handleSaveMissionForm} className="space-y-5">
                      {/* 1. Objective Card */}
                      <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4.5 sm:p-5 space-y-3.5 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                        <div className="space-y-1.5">
                          <label className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider block">
                            Mission title
                          </label>
                          <textarea
                            ref={(el) => {
                              if (el) {
                                el.style.height = 'auto';
                                el.style.height = `${Math.min(el.scrollHeight, 140)}px`;
                              }
                            }}
                            required
                            autoFocus
                            rows={2}
                            placeholder="What are you doing?"
                            value={formTitle}
                            onChange={(e) => {
                              setFormTitle(e.target.value);
                              e.target.style.height = 'auto';
                              e.target.style.height = `${Math.min(e.target.scrollHeight, 140)}px`;
                            }}
                            className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2.5 text-sm sm:text-base text-white placeholder-zinc-500 outline-none transition-all font-sans resize-none leading-snug max-h-[140px] custom-scrollbar overflow-y-auto block"
                          />
                        </div>

                        <div className="space-y-1.5">
                          <label className="text-[11px] font-sans font-medium text-zinc-400 uppercase tracking-wider block">
                            Notes <span className="text-zinc-500 lowercase">(optional)</span>
                          </label>
                          <textarea
                            rows={2}
                            placeholder="Add any notes, links, or details..."
                            value={formDesc}
                            onChange={(e) => {
                              setFormDesc(e.target.value);
                              e.target.style.height = 'auto';
                              e.target.style.height = `${Math.max(44, Math.min(e.target.scrollHeight, 140))}px`;
                            }}
                            className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 outline-none transition-all resize-none font-sans leading-relaxed min-h-[44px] max-h-[140px] custom-scrollbar"
                          />
                        </div>
                      </div>

                      {/* 2. Priority Selector Card */}
                      <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4.5 sm:p-5 space-y-3 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                        <label className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider block">
                          Priority
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                          {(
                            [
                              { id: 'PRIMARY', label: 'Top priority', desc: 'Must get done today', xp: '+50 XP' },
                              { id: 'SECONDARY', label: 'Secondary', desc: 'Important if time permits', xp: '+30 XP' },
                              { id: 'BONUS', label: 'Bonus', desc: 'Nice to have done', xp: '+20 XP' },
                            ] as const
                          ).map((p) => {
                            const isSelected = formPriority === p.id;
                            return (
                              <button
                                key={p.id}
                                type="button"
                                onClick={() => setFormPriority(p.id)}
                                className={`flex flex-col items-start justify-between p-3 rounded-xl text-left transition-all border cursor-pointer ${
                                  isSelected
                                    ? 'bg-white/15 border-white/30 text-white shadow-xs'
                                    : 'bg-black/50 border-white/5 text-zinc-400 hover:text-white hover:bg-white/5 hover:border-white/10'
                                }`}
                              >
                                <div className="w-full flex items-center justify-between">
                                  <span className="font-semibold text-xs sm:text-sm text-white">{p.label}</span>
                                  <span className="text-xs font-sans font-semibold text-zinc-200">{p.xp}</span>
                                </div>
                                <span className="text-[11px] text-zinc-400 mt-1">{p.desc}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* 3. Category Card */}
                      <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4.5 sm:p-5 space-y-3 backdrop-blur-xl relative overflow-hidden">
                        <label className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider block">
                          Category
                        </label>
                        <CategoryPicker
                          value={formCategory}
                          onChange={(catName, attr) => {
                            setFormCategory(catName);
                            if (attr) setFormAttribute(attr);
                          }}
                          onCustomCategoriesChange={(updated) => setCustomCategories(updated)}
                        />
                      </div>

                      {/* 4. Focus Duration Card */}
                      <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4.5 sm:p-5 space-y-3.5 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                        <div className="flex items-center justify-between">
                          <label className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-zinc-300" />
                            <span>Duration</span>
                          </label>
                        </div>

                        {/* Preset Pills */}
                        <div className="grid grid-cols-5 gap-2 w-full">
                          {[5, 15, 25, 45, 60].map((mins) => {
                            const isSelected = formDuration === mins;
                            return (
                              <button
                                key={mins}
                                type="button"
                                onClick={() => setFormDuration(mins)}
                                className={`py-2 rounded-xl text-xs font-medium transition-all active:scale-95 cursor-pointer text-center ${
                                  isSelected
                                    ? 'bg-white/20 border border-white/30 text-white font-semibold shadow-xs'
                                    : 'bg-black/50 hover:bg-white/5 border border-white/10 text-zinc-300'
                                }`}
                              >
                                {mins}m
                              </button>
                            );
                          })}
                        </div>

                        {/* Custom Stepper */}
                        <div className="w-full p-2.5 rounded-xl bg-black/60 border border-white/10 focus-within:border-white/25 transition-all flex items-center justify-between gap-2.5">
                          <button
                            type="button"
                            onClick={() => setFormDuration(Math.max(5, formDuration - 5))}
                            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer flex-shrink-0"
                            title="Subtract 5 minutes"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>

                          <div className="flex-1 h-9 relative flex items-center justify-center bg-black/60 border border-white/10 focus-within:border-white/25 rounded-lg px-3">
                            <div className="flex items-center justify-center gap-1.5">
                              <input
                                type="number"
                                min={5}
                                max={360}
                                step={5}
                                value={formDuration}
                                onChange={(e) => setFormDuration(Math.max(5, Number(e.target.value) || 5))}
                                className="w-12 bg-transparent text-center text-sm font-sans font-bold text-white outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <span className="text-xs font-sans text-zinc-400 select-none">minutes</span>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => setFormDuration(Math.min(360, formDuration + 5))}
                            className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/15 border border-white/10 text-white/80 hover:text-white flex items-center justify-center transition-all active:scale-90 cursor-pointer flex-shrink-0"
                            title="Add 5 minutes"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* 5. Schedule & Mission State */}
                      <div className="bg-zinc-950/80 border border-white/10 rounded-2xl p-4.5 sm:p-5 space-y-3.5 backdrop-blur-xl relative overflow-hidden">
                        <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

                        <label className="text-xs font-sans font-medium text-zinc-400 uppercase tracking-wider block">
                          Schedule & Status
                        </label>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="text-[11px] font-sans text-zinc-400 block mb-1">
                              Due Date
                            </label>
                            <input
                              type="date"
                              value={formDueDate}
                              onChange={(e) => setFormDueDate(e.target.value)}
                              className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-xl px-3 py-2 text-xs sm:text-sm text-white outline-none font-sans"
                            />
                          </div>
                          <div>
                            <label className="text-[11px] font-sans block mb-1">
                              <span className={isFormDueTimePast ? 'text-rose-400 font-semibold inline-flex items-center gap-1.5' : 'text-zinc-400'}>
                                Due Time
                                {isFormDueTimePast && <Clock className="w-3.5 h-3.5 text-rose-400 stroke-[2.5]" />}
                              </span>
                            </label>
                            <div className="relative">
                              <input
                                type="time"
                                value={formDueTime}
                                onChange={(e) => setFormDueTime(e.target.value)}
                                className={`w-full bg-black/60 rounded-xl px-3 py-2 text-xs sm:text-sm outline-none font-sans transition-all ${
                                  isFormDueTimePast
                                    ? 'border border-rose-500/60 text-rose-300 focus:border-rose-400 focus:ring-1 focus:ring-rose-500/30 pr-8 bg-rose-500/10 font-semibold'
                                    : 'border border-white/10 focus:border-white/30 text-white'
                                }`}
                              />
                              {isFormDueTimePast && (
                                <Clock className="w-4 h-4 text-rose-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none stroke-[2.5]" />
                              )}
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-sans text-zinc-400 block mb-1">
                              State
                            </label>
                            <select
                              value={isFormDueTimePast ? 'MISSED' : formState}
                              onChange={(e) => setFormState(e.target.value as MissionState)}
                              disabled={isFormDueTimePast}
                              className={`w-full bg-black/60 border rounded-xl px-3 py-2 text-xs sm:text-sm outline-none font-sans ${
                                isFormDueTimePast
                                  ? 'border-rose-500/40 text-rose-300 bg-rose-500/10 cursor-not-allowed opacity-90'
                                  : 'border-white/10 focus:border-white/30 text-white'
                              }`}
                            >
                              <option value="ACTIVE">Active (Default)</option>
                              <option value="PLANNED">Planned</option>
                              <option value="COMPLETED">Completed</option>
                              <option value="MISSED">Missed</option>
                            </select>
                          </div>
                        </div>

                        {/* Past due time warning indicator */}
                        {isFormDueTimePast && (
                          <div className="flex items-center gap-2 p-2.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs font-sans animate-in fade-in">
                            <Clock className="w-4 h-4 text-rose-400 shrink-0 stroke-[2.5]" />
                            <span>
                              Scheduled due time is in the past. Creating this mission will immediately classify it as <strong className="text-rose-200">Missed</strong>.
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Bottom Action Footer */}
                      <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
                        <button
                          type="button"
                          onClick={() => {
                            setShowAddModal(false);
                            setEditingMission(null);
                          }}
                          className="px-4 py-2.5 rounded-xl text-xs font-medium text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-all cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={!formTitle.trim()}
                          className="px-5 py-2.5 rounded-xl bg-white hover:bg-zinc-200 disabled:opacity-40 disabled:pointer-events-none text-zinc-950 text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer active:scale-95"
                        >
                          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>{editingMission ? 'Save changes' : 'Add mission'}</span>
                        </button>
                      </div>
                    </form>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}

      {/* DELETE CONFIRMATION MODAL */}
      {missionToDelete &&
        typeof document !== 'undefined' &&
        createPortal(
          <div className="fixed inset-0 z-[99999] bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
            <div className="bg-[#1a1d24]/95 border border-white/20 rounded-[28px] p-6 max-w-sm w-full space-y-4 shadow-[0_25px_60px_rgba(0,0,0,0.85)] relative text-left">
              <div className="flex items-center gap-3 text-rose-400">
                <div className="w-10 h-10 rounded-full bg-rose-500/15 border border-rose-500/30 flex items-center justify-center flex-shrink-0">
                  <Trash2 className="w-5 h-5 text-rose-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Delete mission</h3>
                  <p className="text-xs text-white/60">This will remove this mission from your list.</p>
                </div>
              </div>

              <p className="text-sm text-white/80 leading-relaxed font-sans">
                Are you sure you want to delete <span className="font-semibold text-white">"{missionToDelete.title}"</span>?
              </p>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setMissionToDelete(null)}
                  className="px-4 py-2 rounded-full text-xs font-sans text-white/70 bg-white/5 hover:bg-white/10 border border-white/10"
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
                  className="px-4 py-2 rounded-full bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs shadow-md transition-all active:scale-95"
                >
                  Delete mission
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};
