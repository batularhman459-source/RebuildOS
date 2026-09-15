import React, { useState, useMemo } from 'react';
import { Mission } from '../types';
import {
  Archive,
  Calendar,
  Clock,
  Sparkles,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Zap,
  Tag,
  ArrowUpDown,
  History,
  TrendingUp,
} from 'lucide-react';
import {
  ArchiveTimeframe,
  ArchiveSortBy,
  ArchiveStatusFilter,
  filterArchivedMissions,
  getArchiveStats,
} from '../lib/missionArchive';
import { getCategoryDefinition, renderCategoryIcon } from '../lib/categories';
import { motion, AnimatePresence } from 'motion/react';
import { DateTime } from 'luxon';

interface MissionArchiveProps {
  missions?: Mission[];
  archivedMissions?: Mission[];
  className?: string;
}

export const MissionArchive: React.FC<MissionArchiveProps> = ({
  missions = [],
  archivedMissions = [],
  className = '',
}) => {
  const [timeframe, setTimeframe] = useState<ArchiveTimeframe>('all');
  const [statusFilter, setStatusFilter] = useState<ArchiveStatusFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [sortBy, setSortBy] = useState<ArchiveSortBy>('date-desc');
  const [expandedMissionId, setExpandedMissionId] = useState<string | null>(null);

  // Combine both archivedMissions and any historical completed or missed missions into master pool
  const allArchivedPool = useMemo(() => {
    const combined = [...archivedMissions];
    const existingIds = new Set(combined.map((m) => m.id));

    for (const m of missions) {
      const isCompleted = m.completed === true || m.state === 'COMPLETED';
      const isMissed = m.state === 'MISSED';
      if ((isCompleted || isMissed) && !existingIds.has(m.id)) {
        combined.push(m);
        existingIds.add(m.id);
      }
    }
    return combined;
  }, [missions, archivedMissions]);

  // Filtered & Sorted missions
  const filteredMissions = useMemo(() => {
    return filterArchivedMissions(allArchivedPool, {
      timeframe,
      status: statusFilter,
      category: selectedCategory,
      search: searchQuery,
      sortBy,
    });
  }, [allArchivedPool, timeframe, statusFilter, selectedCategory, searchQuery, sortBy]);

  // Summary stats
  const stats = useMemo(() => {
    return getArchiveStats(filteredMissions);
  }, [filteredMissions]);

  // Unique categories in the archive
  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allArchivedPool.forEach((m) => {
      if (m.category) set.add(m.category);
    });
    return Array.from(set);
  }, [allArchivedPool]);

  // Group filtered missions by human readable date
  const groupedByDate = useMemo(() => {
    const groups: Record<string, Mission[]> = {};
    const todayStr = DateTime.local().toISODate() || '';
    const yesterdayStr = DateTime.local().minus({ days: 1 }).toISODate() || '';

    filteredMissions.forEach((m) => {
      const rawDate =
        m.completedDate ||
        (m.completedAt ? m.completedAt.split('T')[0] : null) ||
        m.dueDate ||
        (m.createdAt ? m.createdAt.split('T')[0] : null) ||
        'Earlier';

      let label = rawDate;
      if (rawDate === todayStr) {
        label = 'Today';
      } else if (rawDate === yesterdayStr) {
        label = 'Yesterday';
      } else {
        try {
          const dt = DateTime.fromISO(rawDate);
          if (dt.isValid) {
            label = dt.toFormat('cccc, MMM d, yyyy');
          }
        } catch {
          label = rawDate;
        }
      }

      if (!groups[label]) {
        groups[label] = [];
      }
      groups[label].push(m);
    });

    return groups;
  }, [filteredMissions]);

  const toggleExpand = (id: string) => {
    setExpandedMissionId((prev) => (prev === id ? null : id));
  };

  return (
    <div
      id="missions-archive-container"
      className={`relative overflow-hidden rounded-[24px] sm:rounded-[28px] bg-gradient-to-b from-white/[0.14] via-white/[0.07] to-white/[0.03] border border-white/20 p-5 sm:p-6 backdrop-blur-2xl shadow-[inset_0_1px_1.5px_rgba(255,255,255,0.3),0_15px_35px_rgba(0,0,0,0.35)] text-white space-y-4 ${className}`}
    >
      {/* Specular Top Rim Highlight */}
      <div className="absolute top-0 inset-x-8 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none z-10" />

      {/* Header Section */}
      <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center shadow-inner backdrop-blur-md shrink-0">
            <Archive className="w-4.5 h-4.5 stroke-[2]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold tracking-tight text-white font-sans">
                Mission Archive
              </h2>
              <span className="px-2 py-0.5 text-[10px] font-sans font-bold uppercase tracking-wider rounded-md bg-white/10 text-white/80 border border-white/10">
                {filteredMissions.length} {filteredMissions.length === 1 ? 'Record' : 'Records'}
              </span>
            </div>
            <p className="text-xs text-white/60 font-sans mt-0.5">
              Historical ledger of past completed and missed missions
            </p>
          </div>
        </div>

        {/* Compact Quick Stats Pill Strip */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <div className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/10 backdrop-blur-md flex items-center gap-1.5 shrink-0">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[11px] font-bold text-emerald-300 font-sans">
              {stats.completedCount} Done
            </span>
          </div>
          {stats.missedCount > 0 && (
            <div className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/10 backdrop-blur-md flex items-center gap-1.5 shrink-0">
              <XCircle className="w-3.5 h-3.5 text-rose-400" />
              <span className="text-[11px] font-bold text-rose-300 font-sans">
                {stats.missedCount} Missed
              </span>
            </div>
          )}
          <div className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/10 backdrop-blur-md flex items-center gap-1.5 shrink-0">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] font-bold text-white font-sans">
              +{stats.totalXp} XP
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/10 backdrop-blur-md flex items-center gap-1.5 shrink-0">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium text-white/90 font-sans">
              {stats.totalMinutes}m logged
            </span>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-black/30 border border-white/10 backdrop-blur-md flex items-center gap-1.5 shrink-0">
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[11px] font-medium text-white/90 font-sans">
              {stats.uniqueDaysCount} {stats.uniqueDaysCount === 1 ? 'day' : 'days'}
            </span>
          </div>
        </div>
      </div>

      {/* Control Row: Status Filter Tabs & Timeframe */}
      <div className="relative z-10 space-y-2.5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          {/* Status Tabs (All / Done / Missed) */}
          <div className="inline-flex items-center p-0.5 rounded-xl bg-black/40 border border-white/10">
            <button
              type="button"
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                statusFilter === 'ALL'
                  ? 'bg-white/20 text-white font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              All Status
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('COMPLETED')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'COMPLETED'
                  ? 'bg-emerald-500/25 text-emerald-200 border border-emerald-500/40 font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Done
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter('MISSED')}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'MISSED'
                  ? 'bg-rose-500/25 text-rose-200 border border-rose-500/40 font-semibold shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
              Missed
            </button>
          </div>

          {/* Timeframe Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
            {(
              [
                { id: 'all', label: 'All Time' },
                { id: 'today', label: 'Today' },
                { id: 'week', label: 'This Week' },
                { id: 'month', label: 'This Month' },
                { id: 'year', label: 'This Year' },
              ] as const
            ).map((t) => (
              <button
                key={t.id}
                type="button"
                id={`archive-timeframe-${t.id}`}
                onClick={() => setTimeframe(t.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer shrink-0 ${
                  timeframe === t.id
                    ? 'bg-orange-500/25 text-orange-200 border border-orange-500/40 font-semibold shadow-xs'
                    : 'text-white/60 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Filter Controls: Search & Category & Sort */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-0.5">
          {/* Search Input */}
          <div className="sm:col-span-6 relative">
            <Search className="w-3.5 h-3.5 text-white/40 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              id="archive-search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by mission title, description, or tag..."
              className="w-full pl-8 pr-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white placeholder-white/40 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-sans"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] text-white/40 hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {/* Category Dropdown */}
          <div className="sm:col-span-3 relative">
            <select
              id="archive-category-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              aria-label="Filter by category"
              className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white/90 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-sans cursor-pointer appearance-none pr-8"
            >
              <option value="ALL" className="bg-neutral-900 text-white">All Categories</option>
              {availableCategories.map((cat) => (
                <option key={cat} value={cat} className="bg-neutral-900 text-white">
                  {cat}
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort Selector */}
          <div className="sm:col-span-3 relative">
            <select
              id="archive-sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as ArchiveSortBy)}
              aria-label="Sort archived missions"
              className="w-full px-3 py-1.5 rounded-xl bg-black/30 border border-white/10 text-xs text-white/90 focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all font-sans cursor-pointer appearance-none pr-8"
            >
              <option value="date-desc" className="bg-neutral-900 text-white">Newest First</option>
              <option value="date-asc" className="bg-neutral-900 text-white">Oldest First</option>
              <option value="xp-desc" className="bg-neutral-900 text-white">Highest XP</option>
              <option value="duration-desc" className="bg-neutral-900 text-white">Longest Duration</option>
            </select>
            <ArrowUpDown className="w-3.5 h-3.5 text-white/40 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Compact Mission Archive List */}
      <div className="relative z-10 space-y-3 pt-1">
        {Object.keys(groupedByDate).length > 0 ? (
          (Object.entries(groupedByDate) as [string, Mission[]][]).map(([dateLabel, dateMissions]) => (
            <div key={dateLabel} className="space-y-1.5">
              {/* Date Header Badge */}
              <div className="flex items-center gap-2 px-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-white/50 font-sans">
                  {dateLabel}
                </span>
                <div className="flex-1 h-[1px] bg-white/10" />
                <span className="text-[10px] font-sans text-white/40">
                  {dateMissions.length} {dateMissions.length === 1 ? 'task' : 'tasks'}
                </span>
              </div>

              {/* Mission Items in Date Group */}
              <div className="space-y-1.5">
                {dateMissions.map((m) => {
                  const catDef = getCategoryDefinition(m.category);
                  const isExpanded = expandedMissionId === m.id;
                  const priority = m.priority || m.type || 'SECONDARY';
                  const isCompleted = m.completed === true || m.state === 'COMPLETED';
                  const isMissed = m.state === 'MISSED';

                  // Format completion/due time if available
                  let formattedTime: string | null = null;
                  if (m.completedAt) {
                    try {
                      formattedTime = DateTime.fromISO(m.completedAt).toFormat('hh:mm a');
                    } catch {
                      formattedTime = null;
                    }
                  } else if (m.dueTime) {
                    formattedTime = m.dueTime;
                  }

                  return (
                    <div
                      key={m.id}
                      id={`archive-item-${m.id}`}
                      className="group rounded-xl border border-white/10 bg-black/25 hover:bg-black/40 hover:border-white/20 transition-all p-2.5 sm:p-3 space-y-2 backdrop-blur-md"
                    >
                      <div
                        onClick={() => toggleExpand(m.id)}
                        className="flex items-center justify-between gap-2.5 cursor-pointer select-none"
                      >
                        {/* Left Info: Status Icon + Title + Category */}
                        <div className="flex items-center gap-2.5 min-w-0 flex-1">
                          {isCompleted ? (
                            <div className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
                              <CheckCircle2 className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 rounded-md bg-rose-500/20 border border-rose-500/30 text-rose-400 flex items-center justify-center shrink-0">
                              <XCircle className="w-3.5 h-3.5 stroke-[2.5]" />
                            </div>
                          )}

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-semibold text-white/95 truncate font-sans group-hover:text-orange-200 transition-colors">
                                {m.title}
                              </span>
                              {priority === 'PRIMARY' && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-orange-500/20 text-orange-300 border border-orange-500/30 shrink-0">
                                  Core
                                </span>
                              )}
                              {isMissed && (
                                <span className="px-1.5 py-0.2 text-[9px] font-bold uppercase rounded bg-rose-500/20 text-rose-300 border border-rose-500/30 shrink-0">
                                  Missed
                                </span>
                              )}
                            </div>

                            <div className="flex items-center gap-2 text-[10px] text-white/50 font-sans mt-0.5">
                              <span className="flex items-center gap-1 text-white/60">
                                {renderCategoryIcon(catDef?.iconName, 'w-3 h-3', catDef?.color)}
                                <span className="truncate max-w-[120px]">
                                  {catDef?.name || m.category || 'Focus'}
                                </span>
                              </span>
                              <span>•</span>
                              <span>{m.durationMinutes || 25}m</span>
                              {formattedTime && (
                                <>
                                  <span>•</span>
                                  <span>{formattedTime}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: XP Badge & Expand Chevron */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isCompleted ? (
                            <span className="px-2 py-0.5 rounded-lg bg-emerald-500/15 border border-emerald-500/25 text-emerald-300 font-mono text-[11px] font-bold">
                              +{m.xpReward || 50} XP
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-lg bg-rose-500/15 border border-rose-500/25 text-rose-300 font-mono text-[11px] font-medium">
                              Missed
                            </span>
                          )}
                          <button
                            type="button"
                            aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                            className="text-white/40 group-hover:text-white transition-colors cursor-pointer"
                          >
                            {isExpanded ? (
                              <ChevronUp className="w-3.5 h-3.5" />
                            ) : (
                              <ChevronDown className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expandable Details Tray */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.15 }}
                            className="pt-2 border-t border-white/10 text-xs font-sans text-white/70 space-y-1.5 overflow-hidden"
                          >
                            {m.description && (
                              <p className="text-white/80 leading-relaxed font-light">
                                {m.description}
                              </p>
                            )}

                            <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-white/50">
                              {m.targetAttribute && (
                                <span className="flex items-center gap-1">
                                  <Tag className="w-3 h-3 text-white/40" />
                                  <span>Attribute: <strong className="text-white/80">{m.targetAttribute}</strong></span>
                                </span>
                              )}
                              {m.completedAt && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-white/40" />
                                  <span>Completed: {new Date(m.completedAt).toLocaleString()}</span>
                                </span>
                              )}
                              {isMissed && m.dueDate && (
                                <span className="flex items-center gap-1 text-rose-300/80">
                                  <AlertCircle className="w-3 h-3 text-rose-400" />
                                  <span>Due Date: {m.dueDate} {m.dueTime || ''}</span>
                                </span>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        ) : (
          /* Empty Filter State */
          <div className="rounded-2xl border border-white/10 bg-black/25 backdrop-blur-xl p-8 text-center space-y-2 text-white">
            <div className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center bg-white/5 text-white/60 mx-auto">
              <Archive className="w-5 h-5 stroke-[1.5]" />
            </div>
            <h3 className="text-sm font-semibold text-white font-sans">
              No archived missions found
            </h3>
            <p className="text-xs text-white/50 max-w-xs mx-auto font-light">
              {searchQuery
                ? `No missions matching "${searchQuery}". Try clearing search.`
                : statusFilter === 'MISSED'
                ? 'No missed missions in the selected archive timeframe.'
                : statusFilter === 'COMPLETED'
                ? 'No completed missions in the selected archive timeframe.'
                : 'No historical missions recorded in this timeframe.'}
            </p>
            {(searchQuery || selectedCategory !== 'ALL' || timeframe !== 'all' || statusFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setTimeframe('all');
                  setStatusFilter('ALL');
                  setSelectedCategory('ALL');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs font-medium text-orange-400 hover:text-orange-300 underline underline-offset-2 cursor-pointer"
              >
                Reset all filters
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
