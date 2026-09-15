import React from 'react';
import {
  Target,
  HeartPulse,
  Shield,
  Brain,
  Activity,
  Compass,
  Sparkles,
  RotateCcw,
  Code,
  Terminal,
  BookOpen,
  Briefcase,
  Dumbbell,
  Coffee,
  Music,
  Sun,
  Moon,
  Feather,
  Trophy,
  Key,
  Layers,
  Crosshair,
  Folder,
  Bookmark,
  CheckSquare,
  Globe,
  Flame,
  Zap,
  Palette,
  Laptop,
  GraduationCap,
  Hammer,
} from 'lucide-react';

export interface MissionCategoryDef {
  id: string;
  name: string;
  iconName: string;
  color: string;
  attribute: string;
  isCustom?: boolean;
}

export const DEFAULT_MISSION_CATEGORIES: MissionCategoryDef[] = [
  { id: 'focus', name: 'Deep Work & Focus', iconName: 'Target', color: '#00F0FF', attribute: 'Focus' },
  { id: 'health', name: 'Health & Vitality', iconName: 'HeartPulse', color: '#5E1473', attribute: 'Health' },
  { id: 'discipline', name: 'Discipline & Routine', iconName: 'Shield', color: '#EC4899', attribute: 'Discipline' },
  { id: 'mind', name: 'Mind & Learning', iconName: 'Brain', color: '#A855F7', attribute: 'Consistency' },
  { id: 'fitness', name: 'Movement & Fitness', iconName: 'Activity', color: '#FF6B22', attribute: 'Health' },
  { id: 'purpose', name: 'Purpose & Strategy', iconName: 'Compass', color: '#FCCF3A', attribute: 'Purpose' },
  { id: 'selftrust', name: 'Self-Trust & Promises', iconName: 'Sparkles', color: '#3B82F6', attribute: 'Self-Trust' },
  { id: 'resilience', name: 'Resilience & Reset', iconName: 'RotateCcw', color: '#F43F5E', attribute: 'Resilience' },
];

export const CATEGORY_ICON_OPTIONS = [
  { name: 'Target', label: 'Target', category: 'Focus', icon: Target },
  { name: 'Crosshair', label: 'Crosshair', category: 'Focus', icon: Crosshair },
  { name: 'Flame', label: 'Flame', category: 'Focus', icon: Flame },
  { name: 'Zap', label: 'Energy', category: 'Focus', icon: Zap },
  { name: 'Brain', label: 'Mind', category: 'Mind', icon: Brain },
  { name: 'BookOpen', label: 'Reading', category: 'Mind', icon: BookOpen },
  { name: 'GraduationCap', label: 'Study', category: 'Mind', icon: GraduationCap },
  { name: 'Bookmark', label: 'Bookmark', category: 'Mind', icon: Bookmark },
  { name: 'Code', label: 'Code', category: 'Work', icon: Code },
  { name: 'Terminal', label: 'Terminal', category: 'Work', icon: Terminal },
  { name: 'Laptop', label: 'Laptop', category: 'Work', icon: Laptop },
  { name: 'Briefcase', label: 'Work', category: 'Work', icon: Briefcase },
  { name: 'Folder', label: 'Projects', category: 'Work', icon: Folder },
  { name: 'CheckSquare', label: 'Tasks', category: 'Work', icon: CheckSquare },
  { name: 'Hammer', label: 'Build', category: 'Work', icon: Hammer },
  { name: 'Dumbbell', label: 'Gym', category: 'Health', icon: Dumbbell },
  { name: 'HeartPulse', label: 'Vitality', category: 'Health', icon: HeartPulse },
  { name: 'Activity', label: 'Movement', category: 'Health', icon: Activity },
  { name: 'Shield', label: 'Discipline', category: 'Discipline', icon: Shield },
  { name: 'Trophy', label: 'Trophy', category: 'Discipline', icon: Trophy },
  { name: 'Key', label: 'Key', category: 'Discipline', icon: Key },
  { name: 'Layers', label: 'Systems', category: 'Discipline', icon: Layers },
  { name: 'Compass', label: 'Purpose', category: 'Life', icon: Compass },
  { name: 'Sparkles', label: 'Magic', category: 'Life', icon: Sparkles },
  { name: 'Palette', label: 'Creative', category: 'Life', icon: Palette },
  { name: 'Feather', label: 'Writing', category: 'Life', icon: Feather },
  { name: 'Coffee', label: 'Routine', category: 'Life', icon: Coffee },
  { name: 'Music', label: 'Music', category: 'Life', icon: Music },
  { name: 'Sun', label: 'Morning', category: 'Life', icon: Sun },
  { name: 'Moon', label: 'Night', category: 'Life', icon: Moon },
  { name: 'Globe', label: 'Global', category: 'Life', icon: Globe },
  { name: 'RotateCcw', label: 'Reset', category: 'Life', icon: RotateCcw },
] as const;

export const CATEGORY_COLOR_PALETTE = [
  { name: 'Cyan', hex: '#00F0FF', glow: 'rgba(0,240,255,0.45)' },
  { name: 'Emerald', hex: '#10B981', glow: 'rgba(16,185,129,0.45)' },
  { name: 'Mint', hex: '#2DD4BF', glow: 'rgba(45,212,191,0.45)' },
  { name: 'Lime', hex: '#84CC16', glow: 'rgba(132,204,22,0.45)' },
  { name: 'Solar', hex: '#FCCF3A', glow: 'rgba(252,207,58,0.45)' },
  { name: 'Amber', hex: '#FF6B22', glow: 'rgba(255,107,34,0.45)' },
  { name: 'Rose', hex: '#F43F5E', glow: 'rgba(244,63,94,0.45)' },
  { name: 'Pink', hex: '#EC4899', glow: 'rgba(236,72,153,0.45)' },
  { name: 'Magenta', hex: '#FF00FF', glow: 'rgba(255,0,255,0.45)' },
  { name: 'Violet', hex: '#A855F7', glow: 'rgba(168,85,247,0.45)' },
  { name: 'Indigo', hex: '#6366F1', glow: 'rgba(99,102,241,0.45)' },
  { name: 'Blue', hex: '#3B82F6', glow: 'rgba(59,130,246,0.45)' },
];

const STORAGE_KEY = 'rebuildos_custom_categories_v1';
const DELETED_STORAGE_KEY = 'rebuildos_deleted_categories_v1';

export function loadDeletedCategoryIds(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(DELETED_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (e) {
    return [];
  }
}

export function saveDeletedCategoryIds(ids: string[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(DELETED_STORAGE_KEY, JSON.stringify(ids));
  } catch (e) {
    console.error('Failed to save deleted category ids', e);
  }
}

export function loadCustomCategories(): MissionCategoryDef[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed.map((cat) => ({ ...cat, isCustom: true }));
    }
    return [];
  } catch (e) {
    console.error('Failed to load custom categories', e);
    return [];
  }
}

export function saveCustomCategories(categories: MissionCategoryDef[]): void {
  if (typeof window === 'undefined') return;
  try {
    const customOnly = categories.filter((c) => c.isCustom);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(customOnly));
  } catch (e) {
    console.error('Failed to save custom categories', e);
  }
}

export function getAllCategories(customCats?: MissionCategoryDef[]): MissionCategoryDef[] {
  const custom = customCats || loadCustomCategories();
  const deletedIds = loadDeletedCategoryIds();
  const combined = [...DEFAULT_MISSION_CATEGORIES, ...custom];
  const filtered = combined.filter((c) => !deletedIds.includes(c.id));
  return filtered.length > 0 ? filtered : DEFAULT_MISSION_CATEGORIES.slice(0, 1);
}

export function deleteCategoryPermanently(categoryId: string, currentCustom: MissionCategoryDef[]): {
  updatedCustom: MissionCategoryDef[];
  updatedAll: MissionCategoryDef[];
} {
  const isCustom = currentCustom.some((c) => c.id === categoryId);
  let nextCustom = currentCustom;
  if (isCustom) {
    nextCustom = currentCustom.filter((c) => c.id !== categoryId);
    saveCustomCategories(nextCustom);
  }
  const deletedIds = loadDeletedCategoryIds();
  if (!deletedIds.includes(categoryId)) {
    saveDeletedCategoryIds([...deletedIds, categoryId]);
  }
  return {
    updatedCustom: nextCustom,
    updatedAll: getAllCategories(nextCustom),
  };
}

export function restoreAllDefaultCategories(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(DELETED_STORAGE_KEY);
  } catch (e) {
    console.error('Failed to restore default categories', e);
  }
}

export function getCategoryDefinition(name?: string, customCats?: MissionCategoryDef[]): MissionCategoryDef {
  const all = getAllCategories(customCats);
  const found = all.find((c) => c.name.toLowerCase() === (name || '').toLowerCase());
  if (found) return found;

  // Partial match
  const partial = all.find((c) => (name || '').toLowerCase().includes(c.name.toLowerCase()));
  if (partial) return partial;

  return DEFAULT_MISSION_CATEGORIES[0];
}

export function renderCategoryIcon(iconName: string, className: string = 'w-3.5 h-3.5', customColor?: string) {
  const found = CATEGORY_ICON_OPTIONS.find((item) => item.name === iconName);
  const IconComponent = found ? found.icon : Target;
  return <IconComponent className={className} style={customColor ? { color: customColor } : undefined} />;
}
