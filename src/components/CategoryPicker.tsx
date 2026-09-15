import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  MissionCategoryDef,
  CATEGORY_ICON_OPTIONS,
  CATEGORY_COLOR_PALETTE,
  renderCategoryIcon,
  loadCustomCategories,
  saveCustomCategories,
  getAllCategories,
  deleteCategoryPermanently,
  loadDeletedCategoryIds,
} from '../lib/categories';
import { Plus, X, Sparkles, Check, Trash2, Tag, Search, Palette, ChevronUp, ChevronDown } from 'lucide-react';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'motion/react';

interface CategoryPickerProps {
  value: string;
  onChange: (categoryName: string, attribute?: string) => void;
  onCustomCategoriesChange?: (categories: MissionCategoryDef[]) => void;
  className?: string;
}

// 5 visible slots in vertical 3D loop perspective for optimum mobile density and crisp responsiveness
const VISIBLE_OFFSETS = [-2, -1, 0, 1, 2] as const;

export const CategoryPicker: React.FC<CategoryPickerProps> = ({
  value,
  onChange,
  onCustomCategoriesChange,
  className = '',
}) => {
  const [customCategories, setCustomCategories] = useState<MissionCategoryDef[]>(() =>
    loadCustomCategories()
  );
  const [deletedIds, setDeletedIds] = useState<string[]>(() => loadDeletedCategoryIds());
  const [showCreator, setShowCreator] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<MissionCategoryDef | null>(null);
  const [isDeleted, setIsDeleted] = useState(false);

  // Custom Category Form State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('Target');
  const [newCatColor, setNewCatColor] = useState('#00F0FF');
  const [creatorError, setCreatorError] = useState('');
  const [iconFilter, setIconFilter] = useState<string>('All');
  const [iconSearch, setIconSearch] = useState<string>('');

  const containerRef = useRef<HTMLDivElement>(null);
  const touchStartY = useRef<number | null>(null);
  const touchDeltaY = useRef<number>(0);
  const lastStepTime = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggeredRef = useRef(false);

  const allCategories = getAllCategories(customCategories);
  const totalCount = allCategories.length;

  const rawActiveIndex = allCategories.findIndex(
    (c) => c.name.toLowerCase() === (value || '').toLowerCase()
  );
  const activeIndex = rawActiveIndex >= 0 ? rawActiveIndex : 0;
  const activeCategoryDef = allCategories[activeIndex] || allCategories[0];

  // Long press handler to prompt deletion
  const startLongPress = useCallback((cat: MissionCategoryDef) => {
    isLongPressTriggeredRef.current = false;
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
    }
    longPressTimerRef.current = setTimeout(() => {
      isLongPressTriggeredRef.current = true;
      setIsDeleted(false);
      setCategoryToDelete(cat);
    }, 500);
  }, []);

  const cancelLongPress = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }
  }, []);

  // Rotate to next/prev with looping logic
  const rotateToOffset = useCallback(
    (offset: number) => {
      if (totalCount === 0) return;
      const targetIndex = (((activeIndex + offset) % totalCount) + totalCount) % totalCount;
      const targetCat = allCategories[targetIndex];
      if (targetCat) {
        onChange(targetCat.name, targetCat.attribute);
      }
    },
    [activeIndex, totalCount, allCategories, onChange]
  );

  // Wheel scroll with smooth throttling
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const now = Date.now();
      if (now - lastStepTime.current < 110) return;

      if (Math.abs(e.deltaY) > 6) {
        lastStepTime.current = now;
        if (e.deltaY > 0) {
          rotateToOffset(1);
        } else {
          rotateToOffset(-1);
        }
      }
    },
    [rotateToOffset]
  );

  // Real-time touch swipe / drag handling for silky smooth response on phone
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartY.current = e.touches[0].clientY;
    touchDeltaY.current = 0;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === null) return;
    const currentY = e.touches[0].clientY;
    const diff = touchStartY.current - currentY;
    touchDeltaY.current = diff;

    // If finger moves noticeably, cancel long press hold
    if (Math.abs(diff) > 8) {
      cancelLongPress();
    }

    // Trigger step when dragged past 32px threshold for quick, responsive rolling
    if (Math.abs(diff) >= 32) {
      const now = Date.now();
      if (now - lastStepTime.current > 90) {
        lastStepTime.current = now;
        if (diff > 0) {
          rotateToOffset(1);
        } else {
          rotateToOffset(-1);
        }
        // Reset anchor for continuous smooth dragging
        touchStartY.current = currentY;
        touchDeltaY.current = 0;
      }
    }
  };

  const handleTouchEnd = () => {
    touchStartY.current = null;
    touchDeltaY.current = 0;
    cancelLongPress();
  };

  // Keyboard navigation support
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      rotateToOffset(-1);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      rotateToOffset(1);
    }
  };

  const handleSaveCustomCategory = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newCatName.trim();
    if (!trimmed) {
      setCreatorError('Please enter a category name');
      return;
    }

    if (allCategories.some((c) => c.name.toLowerCase() === trimmed.toLowerCase())) {
      setCreatorError('A category with this name already exists');
      return;
    }

    const newCategory: MissionCategoryDef = {
      id: `custom_${Date.now()}`,
      name: trimmed,
      iconName: newCatIcon,
      color: newCatColor,
      attribute: 'Focus',
      isCustom: true,
    };

    const updated = [...customCategories, newCategory];
    setCustomCategories(updated);
    saveCustomCategories(updated);
    if (onCustomCategoriesChange) {
      onCustomCategoriesChange(updated);
    }

    // Auto-select newly created category
    onChange(newCategory.name, newCategory.attribute);

    // Reset & close
    setNewCatName('');
    setNewCatIcon('Target');
    setNewCatColor('#00F0FF');
    setCreatorError('');
    setShowCreator(false);
  };

  const confirmDeleteCategory = (catId: string, catName: string) => {
    if (isDeleted) return;
    setIsDeleted(true);

    const { updatedCustom, updatedAll } = deleteCategoryPermanently(catId, customCategories);
    setCustomCategories(updatedCustom);
    setDeletedIds(loadDeletedCategoryIds());
    if (onCustomCategoriesChange) {
      onCustomCategoriesChange(updatedCustom);
    }

    // If currently selected category was deleted, fallback to first available
    if (catName.toLowerCase() === (value || '').toLowerCase()) {
      const fallback = updatedAll[0];
      if (fallback) {
        onChange(fallback.name, fallback.attribute);
      }
    }

    // Wait briefly so user sees the checkmark confirmation, then exit modal
    setTimeout(() => {
      setCategoryToDelete(null);
      setIsDeleted(false);
    }, 550);
  };

  // Filtered icons list for selection
  const filteredIcons = CATEGORY_ICON_OPTIONS.filter((item) => {
    const matchesCategory = iconFilter === 'All' || item.category === iconFilter;
    const matchesSearch =
      !iconSearch.trim() ||
      item.label.toLowerCase().includes(iconSearch.toLowerCase()) ||
      item.name.toLowerCase().includes(iconSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className={`space-y-2 ${className}`}>
      {/* Header with Title & Action Controls */}
      <div className="flex items-center justify-between">
        <label className="text-[11px] font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
          <Tag className="w-3.5 h-3.5 text-neutral-400" />
          <span>Category</span>
          <span className="text-[10px] text-neutral-500 font-normal">
            ({activeIndex + 1}/{totalCount})
          </span>
        </label>

        <div className="flex items-center gap-1.5">
          {/* New Category Button */}
          <button
            type="button"
            onClick={() => {
              setShowCreator(!showCreator);
              setCreatorError('');
            }}
            className="inline-flex items-center justify-center gap-1 px-3 h-7 sm:h-7.5 rounded-full bg-orange-500 hover:bg-orange-400 text-white text-xs font-semibold transition-all active:scale-95 shadow-[0_4px_14px_rgba(249,115,22,0.4)] cursor-pointer"
          >
            {showCreator ? (
              <>
                <X className="w-3 h-3" />
                <span>Close</span>
              </>
            ) : (
              <>
                <Plus className="w-3 h-3 stroke-[2.5]" />
                <span>New</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <div className="relative">
        <AnimatePresence mode="wait">
          {showCreator ? (
            /* ============================================================
               INLINE CUSTOM CATEGORY CREATOR
               ============================================================ */
            <motion.div
              key="category-creator"
              initial={{ opacity: 0, scale: 0.96, y: -6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -6 }}
              transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="p-4 sm:p-5 rounded-3xl bg-[#0B0B0E] border border-white/10 shadow-2xl space-y-4 text-left relative overflow-hidden isolate [transform:translateZ(0)]"
            >
              {/* Header */}
              <div className="flex items-center justify-between border-b border-white/10 pb-2.5">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#5E1473]/40 border border-[#5E1473]/80 flex items-center justify-center text-[#e472ff]">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs font-mono font-bold text-white tracking-wide uppercase">
                    New Category Capsule
                  </span>
                </div>
              </div>

              {/* Live Reference Preview */}
              <div className="space-y-1">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">
                  Live Capsule Preview
                </span>
                <div className="w-full flex justify-center py-1">
                  <div
                    className="w-full max-w-sm flex items-center justify-between px-4 py-2.5 rounded-full border shadow-lg bg-[#181a24] transition-all"
                    style={{
                      borderColor: `${newCatColor}80`,
                      boxShadow: `0 10px 24px rgba(0,0,0,0.85), 0 0 16px ${newCatColor}35`,
                    }}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 shadow-md"
                        style={{
                          backgroundColor: newCatColor,
                          boxShadow: `0 0 12px ${newCatColor}60, inset 0 1px 2px rgba(255,255,255,0.5)`,
                        }}
                      >
                        <div className="text-black">
                          {renderCategoryIcon(newCatIcon, 'w-3.5 h-3.5 text-black stroke-[2.5]')}
                        </div>
                      </div>
                      <span className="text-xs font-bold text-white truncate">
                        {newCatName.trim() || 'Custom Category Name'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Category Name Input */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                  Category Name
                </label>
                <input
                  type="text"
                  required
                  autoFocus
                  placeholder="e.g. Asset Library, Architecture, Meditation"
                  value={newCatName}
                  onChange={(e) => {
                    setNewCatName(e.target.value);
                    setCreatorError('');
                  }}
                  className="w-full bg-black/50 border border-white/15 focus:border-[#e472ff] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 outline-none transition-all font-sans"
                />
              </div>

              {/* Elegant Color Picker */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Palette className="w-3 h-3 text-neutral-400" />
                    <span>Accent Capsule Color</span>
                  </label>
                  <label className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-black/40 border border-white/15 hover:border-white/30 text-[10px] font-mono cursor-pointer transition-colors">
                    <span
                      className="w-2.5 h-2.5 rounded-full shadow-sm"
                      style={{ backgroundColor: newCatColor }}
                    />
                    <span className="text-white/90 uppercase">{newCatColor}</span>
                    <input
                      type="color"
                      value={newCatColor}
                      onChange={(e) => setNewCatColor(e.target.value)}
                      className="sr-only"
                    />
                  </label>
                </div>

                {/* Refined Palette Swatches */}
                <div className="grid grid-cols-6 sm:grid-cols-12 gap-2 p-2 bg-black/30 rounded-2xl border border-white/10">
                  {CATEGORY_COLOR_PALETTE.map((color) => {
                    const isSelected = newCatColor.toLowerCase() === color.hex.toLowerCase();
                    return (
                      <button
                        key={color.hex}
                        type="button"
                        onClick={() => setNewCatColor(color.hex)}
                        className={`w-full aspect-square rounded-full flex items-center justify-center transition-all cursor-pointer border ${
                          isSelected
                            ? 'border-white scale-110 shadow-[0_0_12px_rgba(255,255,255,0.7)] ring-2 ring-white/30'
                            : 'border-white/15 hover:scale-105 opacity-85 hover:opacity-100'
                        }`}
                        style={{
                          backgroundColor: color.hex,
                          boxShadow: isSelected ? `0 0 14px ${color.glow}` : undefined,
                        }}
                        title={color.name}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-black stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Compact & Intuitive Icon Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-[10px] font-mono font-bold text-neutral-400 uppercase tracking-wider block">
                    Choose Capsule Icon
                  </label>
                  <div className="relative max-w-[150px]">
                    <Search className="w-3 h-3 text-white/40 absolute left-2 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      placeholder="Search..."
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="w-full bg-black/40 border border-white/10 rounded-full pl-6 pr-2 py-0.5 text-[10px] text-white placeholder-neutral-500 outline-none focus:border-purple-400"
                    />
                  </div>
                </div>

                {/* Category Filter Pills for Icons */}
                <div className="flex items-center gap-1 overflow-x-auto pb-0.5 custom-scrollbar">
                  {['All', 'Focus', 'Mind', 'Work', 'Health', 'Life'].map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setIconFilter(cat)}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono transition-colors flex-shrink-0 cursor-pointer ${
                        iconFilter === cat
                          ? 'bg-white/20 text-white font-bold border border-white/30'
                          : 'bg-white/[0.04] text-neutral-400 hover:text-white border border-transparent'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Icon Grid */}
                <div className="grid grid-cols-8 sm:grid-cols-10 gap-1.5 p-2 bg-black/40 rounded-2xl border border-white/10 max-h-32 overflow-y-auto custom-scrollbar">
                  {filteredIcons.map((item) => {
                    const IconComp = item.icon;
                    const isSelected = newCatIcon === item.name;
                    return (
                      <button
                        key={item.name}
                        type="button"
                        onClick={() => setNewCatIcon(item.name)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all border cursor-pointer ${
                          isSelected
                            ? 'bg-[#5E1473]/50 border-[#e472ff] text-[#e472ff] shadow-[0_0_12px_rgba(228,114,255,0.4)] scale-105'
                            : 'bg-white/[0.02] border-transparent text-neutral-400 hover:text-white hover:bg-white/[0.08]'
                        }`}
                        title={item.label}
                      >
                        <IconComp className="w-4 h-4" />
                      </button>
                    );
                  })}
                  {filteredIcons.length === 0 && (
                    <div className="col-span-full py-2 text-center text-[10px] font-mono text-neutral-500">
                      No icons match "{iconSearch}"
                    </div>
                  )}
                </div>
              </div>

              {creatorError && (
                <p className="text-[11px] font-mono text-rose-400 bg-rose-950/40 px-3 py-1.5 rounded-lg border border-rose-500/30">
                  {creatorError}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center justify-end gap-2 pt-1 border-t border-white/10">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreator(false);
                    setCreatorError('');
                  }}
                  className="px-3.5 py-1.5 rounded-full text-xs font-mono text-neutral-400 hover:text-white bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveCustomCategory}
                  disabled={!newCatName.trim()}
                  className="px-5 py-1.5 rounded-full bg-[#9333ea] hover:bg-[#a855f7] disabled:opacity-40 text-white text-xs font-mono font-bold transition-all shadow-md active:scale-95 flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 stroke-[3]" />
                  <span>Save Capsule</span>
                </button>
              </div>
            </motion.div>
          ) : (
            /* ============================================================
               REFINED VERTICAL 3D PERSPECTIVE LOOP
               Touch-scrollable, drag-responsive, wheel-smooth, & fluid spring physics
               ============================================================ */
            <div
              ref={containerRef}
              tabIndex={0}
              onKeyDown={handleKeyDown}
              onWheel={handleWheel}
              onTouchStart={handleTouchStart}
              onTouchMove={handleTouchMove}
              onTouchEnd={handleTouchEnd}
              className="relative py-2.5 px-3 select-none flex flex-col items-center justify-center overflow-hidden rounded-3xl bg-[#0B0B0E] border border-white/10 backdrop-blur-xl shadow-2xl isolate [transform:translateZ(0)] outline-none focus-visible:ring-1 focus-visible:ring-purple-400/50 touch-pan-y"
            >
              {/* Vertical Capsule Stack */}
              <div className="flex flex-col items-center -space-y-2.5 sm:-space-y-3 py-1.5 w-full">
                {VISIBLE_OFFSETS.map((offset) => {
                  const catIndex = (((activeIndex + offset) % totalCount) + totalCount) % totalCount;
                  const cat = allCategories[catIndex];
                  if (!cat) return null;

                  const isCenter = offset === 0;
                  const absOffset = Math.abs(offset);

                  // Calculate perspective 3D scaling & visual hierarchy
                  const scale = isCenter ? 1 : absOffset === 1 ? 0.92 : 0.82;
                  const opacity = isCenter ? 1 : absOffset === 1 ? 0.75 : 0.45;
                  const zIndex = isCenter ? 30 : absOffset === 1 ? 20 : 10;
                  const maxWidthClass = isCenter
                    ? 'max-w-[340px] sm:max-w-[370px]'
                    : absOffset === 1
                    ? 'max-w-[300px] sm:max-w-[325px]'
                    : 'max-w-[260px] sm:max-w-[280px]';

                  return (
                    <motion.div
                      key={`slot_${offset}_${cat.id}`}
                      initial={false}
                      animate={{
                        scale,
                        opacity,
                        y: offset * 2,
                      }}
                      transition={{
                        type: 'spring',
                        stiffness: 420,
                        damping: 30,
                        mass: 0.8,
                      }}
                      style={{ zIndex }}
                      className={`w-full ${maxWidthClass} cursor-pointer transition-transform duration-150 select-none`}
                      onClick={(e) => {
                        if (isLongPressTriggeredRef.current) {
                          e.stopPropagation();
                          isLongPressTriggeredRef.current = false;
                          return;
                        }
                        rotateToOffset(offset);
                      }}
                      onMouseDown={() => startLongPress(cat)}
                      onMouseUp={cancelLongPress}
                      onMouseLeave={cancelLongPress}
                      onTouchStart={() => startLongPress(cat)}
                      onTouchEnd={cancelLongPress}
                    >
                      <div
                        className={`group relative flex items-center justify-between px-3.5 sm:px-4 py-2.5 sm:py-3 rounded-full transition-all duration-200 ease-out border select-none ${
                          isCenter
                            ? 'bg-[#181a24] text-white shadow-xl'
                            : 'bg-[#141620]/80 text-neutral-300 border-white/10 hover:border-white/20 hover:bg-[#1a1c28] shadow-[0_4px_14px_rgba(0,0,0,0.6)]'
                        }`}
                        style={
                          isCenter
                            ? {
                                borderColor: `${cat.color}85`,
                                boxShadow: `0 10px 28px rgba(0,0,0,0.9), 0 0 20px ${cat.color}35`,
                              }
                            : undefined
                        }
                      >
                        {/* Left Side: Circular Icon Badge + Category Label */}
                        <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                          <div
                            className="w-6 h-6 sm:w-7 sm:h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-200 group-hover:scale-105 shadow-md"
                            style={{
                              backgroundColor: cat.color,
                              boxShadow: `0 0 12px ${cat.color}65, inset 0 1px 2px rgba(255,255,255,0.5)`,
                            }}
                          >
                            <div className="text-black stroke-[2.5]">
                              {renderCategoryIcon(cat.iconName, 'w-3.5 h-3.5 text-black stroke-[2.5]')}
                            </div>
                          </div>

                          <span
                            className={`text-xs sm:text-sm font-sans tracking-tight truncate transition-colors ${
                              isCenter
                                ? 'font-bold text-white tracking-wide'
                                : 'font-medium text-neutral-300 group-hover:text-white'
                            }`}
                          >
                            {cat.name}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {/* Bottom Controls: Up/Down Buttons & Restore Action */}
              <div className="pt-2 pb-0.5 flex items-center justify-center relative w-full px-3">
                {/* Step Chevron Buttons Centered Under Loop */}
                <div className="flex items-center gap-1.5 p-1 rounded-full bg-black/60 border border-white/15 shadow-inner">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      rotateToOffset(-1);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-300 hover:text-white bg-white/5 hover:bg-white/15 active:scale-90 transition-all cursor-pointer"
                    title="Previous category"
                    aria-label="Previous category"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      rotateToOffset(1);
                    }}
                    className="w-7 h-7 rounded-full flex items-center justify-center text-neutral-300 hover:text-white bg-white/5 hover:bg-white/15 active:scale-90 transition-all cursor-pointer"
                    title="Next category"
                    aria-label="Next category"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* Remove Category Confirmation Prompt Modal (Portaled to document.body for full-screen backdrop coverage) */}
      {typeof document !== 'undefined' &&
        createPortal(
          <AnimatePresence>
            {categoryToDelete && (
              <div
                className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
                onClick={(e) => {
                  e.stopPropagation();
                  setCategoryToDelete(null);
                }}
              >
                <motion.div
                  initial={{ opacity: 0, scale: 0.92, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.92, y: 8 }}
                  transition={{ duration: 0.15 }}
                  onClick={(e) => e.stopPropagation()}
                  className="w-full max-w-sm rounded-3xl bg-[#131622] border border-white/15 p-5 shadow-2xl space-y-4 text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg"
                      style={{
                        backgroundColor: categoryToDelete.color,
                        boxShadow: `0 0 16px ${categoryToDelete.color}50`,
                      }}
                    >
                      {renderCategoryIcon(categoryToDelete.iconName, 'w-5 h-5 text-black stroke-[2.5]')}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Delete Category?</h3>
                      <p className="text-xs text-neutral-400 font-mono">
                        "{categoryToDelete.name}"
                      </p>
                    </div>
                  </div>

                  <p className="text-xs text-neutral-300 leading-relaxed font-sans">
                    {totalCount <= 1
                      ? "You cannot remove the only remaining category. Please create another category first."
                      : `Are you sure you want to delete the "${categoryToDelete.name}" category from your list?`}
                  </p>

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={isDeleted}
                      onClick={() => setCategoryToDelete(null)}
                      className="flex-1 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 disabled:opacity-40 text-neutral-200 text-xs font-semibold font-mono transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                    {totalCount > 1 && (
                      <button
                        type="button"
                        disabled={isDeleted}
                        onClick={() => confirmDeleteCategory(categoryToDelete.id, categoryToDelete.name)}
                        className={`flex-1 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
                          isDeleted
                            ? 'bg-rose-600 text-white shadow-[0_0_18px_rgba(225,29,72,0.7)] scale-[1.02]'
                            : 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_14px_rgba(225,29,72,0.4)] active:scale-95'
                        }`}
                      >
                        {isDeleted ? (
                          <>
                            <Check className="w-4 h-4 stroke-[3]" />
                            <span>Deleted</span>
                          </>
                        ) : (
                          <span>Delete Category</span>
                        )}
                      </button>
                    )}
                  </div>
                </motion.div>
              </div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
};
