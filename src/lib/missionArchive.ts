import { Mission, RebuildOSState } from '../types';
import { DateTime } from 'luxon';

export type ArchiveTimeframe = 'all' | 'today' | 'week' | 'month' | 'year';
export type ArchiveSortBy = 'date-desc' | 'date-asc' | 'xp-desc' | 'duration-desc';
export type ArchiveStatusFilter = 'ALL' | 'COMPLETED' | 'MISSED';

/**
 * Returns today's ISO date string (YYYY-MM-DD) in local timezone
 */
export function getLocalTodayStr(): string {
  return DateTime.local().toISODate() || new Date().toISOString().split('T')[0];
}

/**
 * Checks if a mission was completed on the specified date (defaults to today).
 */
export function isMissionCompletedToday(mission: Mission, todayDateStr?: string): boolean {
  const isCompleted = mission.completed === true || mission.state === 'COMPLETED';
  if (!isCompleted) return false;

  const today = todayDateStr || getLocalTodayStr();
  const compDate =
    mission.completedDate ||
    (mission.completedAt ? mission.completedAt.split('T')[0] : null) ||
    mission.dueDate;

  return compDate === today;
}

/**
 * Checks if a mission was missed on the specified date (defaults to today).
 */
export function isMissionMissedToday(mission: Mission, todayDateStr?: string): boolean {
  const isMissed = mission.state === 'MISSED';
  if (!isMissed) return false;

  const today = todayDateStr || getLocalTodayStr();
  const missedDate =
    mission.dueDate ||
    (mission.createdAt ? mission.createdAt.split('T')[0] : null);

  return !missedDate || missedDate === today;
}

/**
 * Automatically archives completed and missed missions from past calendar days.
 * Keeps only today's completed, missed, active, and planned missions in the daily list.
 */
export function archivePastMissions(state: RebuildOSState): RebuildOSState {
  const todayStr = getLocalTodayStr();
  const currentMissions = state.missions || [];
  const existingArchived = state.archivedMissions || [];

  const keptMissions: Mission[] = [];
  const newlyArchived: Mission[] = [];

  const existingArchivedIds = new Set(existingArchived.map((m) => m.id));

  for (const m of currentMissions) {
    const isCompleted = m.completed === true || m.state === 'COMPLETED';
    const isMissed = m.state === 'MISSED';

    const missionDate =
      m.completedDate ||
      (m.completedAt ? m.completedAt.split('T')[0] : null) ||
      m.dueDate ||
      (m.createdAt ? m.createdAt.split('T')[0] : null);

    if ((isCompleted || isMissed) && missionDate && missionDate < todayStr) {
      // Completed or Missed on a previous day -> move to archive
      if (!existingArchivedIds.has(m.id)) {
        newlyArchived.push({
          ...m,
          isArchived: true,
          completedDate: isCompleted ? missionDate : m.completedDate,
          archivedAt: m.archivedAt || new Date().toISOString(),
        });
      }
    } else {
      // Keep today's missions (active, planned, completed today, or missed today)
      keptMissions.push({
        ...m,
        completedDate: isCompleted ? (m.completedDate || missionDate || todayStr) : m.completedDate,
      });
    }
  }

  if (newlyArchived.length === 0) {
    return {
      ...state,
      missions: keptMissions,
      archivedMissions: existingArchived,
    };
  }

  return {
    ...state,
    missions: keptMissions,
    archivedMissions: [...newlyArchived, ...existingArchived],
  };
}

// Alias for backward compatibility
export const archivePastCompletedMissions = archivePastMissions;

/**
 * Filters and sorts missions according to timeframe, category, status, and search query.
 */
export function filterArchivedMissions(
  missions: Mission[],
  options: {
    timeframe: ArchiveTimeframe;
    status?: ArchiveStatusFilter;
    category?: string;
    search?: string;
    sortBy?: ArchiveSortBy;
  }
): Mission[] {
  const now = DateTime.local();
  const todayStr = now.toISODate() || '';
  const startOfWeek = now.startOf('week'); // Monday
  const startOfMonth = now.startOf('month');
  const startOfYear = now.startOf('year');

  const { timeframe = 'all', status = 'ALL', category = 'ALL', search = '', sortBy = 'date-desc' } = options;
  const searchLower = search.trim().toLowerCase();

  return missions
    .filter((m) => {
      // Ensure it is a completed or missed or archived record
      const isCompleted = m.completed === true || m.state === 'COMPLETED';
      const isMissed = m.state === 'MISSED';
      const isArchived = m.isArchived === true;

      if (!isCompleted && !isMissed && !isArchived) return false;

      // Status filter
      if (status === 'COMPLETED' && !isCompleted) return false;
      if (status === 'MISSED' && !isMissed) return false;

      // Date evaluation
      const dateStr =
        m.completedDate ||
        (m.completedAt ? m.completedAt.split('T')[0] : null) ||
        m.dueDate ||
        (m.createdAt ? m.createdAt.split('T')[0] : '');

      if (!dateStr) return timeframe === 'all';

      const itemDate = DateTime.fromISO(dateStr);

      if (timeframe === 'today') {
        if (dateStr !== todayStr) return false;
      } else if (timeframe === 'week') {
        if (itemDate < startOfWeek) return false;
      } else if (timeframe === 'month') {
        if (itemDate < startOfMonth) return false;
      } else if (timeframe === 'year') {
        if (itemDate < startOfYear) return false;
      }

      // Category filter
      if (category && category !== 'ALL') {
        const missionCat = (m.category || '').toLowerCase();
        if (!missionCat.includes(category.toLowerCase())) return false;
      }

      // Search query filter
      if (searchLower) {
        const titleMatch = (m.title || '').toLowerCase().includes(searchLower);
        const descMatch = (m.description || '').toLowerCase().includes(searchLower);
        const catMatch = (m.category || '').toLowerCase().includes(searchLower);
        const attrMatch = (m.targetAttribute || '').toLowerCase().includes(searchLower);
        if (!titleMatch && !descMatch && !catMatch && !attrMatch) return false;
      }

      return true;
    })
    .sort((a, b) => {
      const dateA =
        a.completedAt ||
        (a.completedDate ? `${a.completedDate}T23:59:59` : '') ||
        a.dueDate ||
        '';
      const dateB =
        b.completedAt ||
        (b.completedDate ? `${b.completedDate}T23:59:59` : '') ||
        b.dueDate ||
        '';

      if (sortBy === 'date-desc') {
        return dateB.localeCompare(dateA);
      }
      if (sortBy === 'date-asc') {
        return dateA.localeCompare(dateB);
      }
      if (sortBy === 'xp-desc') {
        return (b.xpReward || 0) - (a.xpReward || 0);
      }
      if (sortBy === 'duration-desc') {
        return (b.durationMinutes || 0) - (a.durationMinutes || 0);
      }
      return 0;
    });
}

/**
 * Calculates aggregate stats for a list of archived missions
 */
export function getArchiveStats(missions: Mission[]) {
  let totalXp = 0;
  let totalMinutes = 0;
  let completedCount = 0;
  let missedCount = 0;
  const uniqueDays = new Set<string>();
  const categoryCounts: Record<string, number> = {};

  for (const m of missions) {
    const isCompleted = m.completed === true || m.state === 'COMPLETED';
    const isMissed = m.state === 'MISSED';

    if (isCompleted) {
      completedCount++;
      totalXp += m.xpReward || 0;
      totalMinutes += m.durationMinutes || 25;
    } else if (isMissed) {
      missedCount++;
    }

    const dateStr =
      m.completedDate ||
      (m.completedAt ? m.completedAt.split('T')[0] : null) ||
      m.dueDate;
    if (dateStr) {
      uniqueDays.add(dateStr);
    }

    const cat = m.category || 'General';
    categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
  }

  let topCategory = 'None';
  let maxCatCount = 0;
  for (const [cat, count] of Object.entries(categoryCounts)) {
    if (count > maxCatCount) {
      maxCatCount = count;
      topCategory = cat;
    }
  }

  const totalEvaluated = completedCount + missedCount;
  const completionRate = totalEvaluated > 0 ? Math.round((completedCount / totalEvaluated) * 100) : 100;

  return {
    totalCount: missions.length,
    completedCount,
    missedCount,
    completionRate,
    totalXp,
    totalMinutes,
    uniqueDaysCount: uniqueDays.size,
    topCategory,
  };
}
