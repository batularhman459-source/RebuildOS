"use client"

import { useState, type ReactNode } from "react"
import { motion, AnimatePresence, LayoutGroup, type PanInfo } from "framer-motion"
import { cn } from "@/src/lib/utils"
import { Grid3X3, Layers } from "lucide-react"

export type LayoutMode = "stack" | "grid"

export interface CardData {
  id: string
  title: string
  description: string
  icon?: ReactNode
  color?: string
  badge?: string
  headerAction?: ReactNode
  footer?: ReactNode
}

export interface MorphingCardStackProps {
  cards?: CardData[]
  className?: string
  defaultLayout?: LayoutMode
  onCardClick?: (card: CardData) => void
}

const layoutIcons = {
  stack: Layers,
  grid: Grid3X3,
}

const SWIPE_THRESHOLD = 35

export function MorphingCardStack({
  cards = [],
  className,
  defaultLayout = "stack",
  onCardClick,
}: MorphingCardStackProps) {
  const [layout, setLayout] = useState<LayoutMode>(defaultLayout)
  const [expandedCard, setExpandedCard] = useState<string | null>(null)
  const [activeIndex, setActiveIndex] = useState(0)
  const [isDragging, setIsDragging] = useState(false)

  if (!cards || cards.length === 0) {
    return null
  }

  const handleDragEnd = (event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const { offset, velocity } = info
    const swipe = Math.abs(offset.x) * velocity.x

    if (offset.x < -SWIPE_THRESHOLD || swipe < -600) {
      // Swiped left - go to next card
      setActiveIndex((prev) => (prev + 1) % cards.length)
    } else if (offset.x > SWIPE_THRESHOLD || swipe > 600) {
      // Swiped right - go to previous card
      setActiveIndex((prev) => (prev - 1 + cards.length) % cards.length)
    }
    setIsDragging(false)
  }

  const getStackOrder = () => {
    const reordered = []
    for (let i = 0; i < cards.length; i++) {
      const index = (activeIndex + i) % cards.length
      reordered.push({ ...cards[index], stackPosition: i })
    }
    return reordered.reverse() // Reverse so top card renders last (on top)
  }

  const getLayoutStyles = (stackPosition: number) => {
    switch (layout) {
      case "stack": {
        const visiblePos = Math.min(stackPosition, 3)
        return {
          y: visiblePos * 10,
          scale: 1 - visiblePos * 0.04,
          opacity: visiblePos === 0 ? 1 : visiblePos === 1 ? 0.35 : visiblePos === 2 ? 0.12 : 0,
          zIndex: cards.length - stackPosition,
          rotate: 0,
        }
      }
      case "grid":
        return {
          y: 0,
          scale: 1,
          opacity: 1,
          zIndex: 1,
          rotate: 0,
        }
    }
  }

  const containerStyles = {
    stack: "relative h-52 sm:h-56 w-full max-w-lg mx-auto flex items-center justify-center",
    grid: "grid grid-cols-1 sm:grid-cols-2 gap-3.5 w-full",
  }

  const displayCards = layout === "stack" ? getStackOrder() : cards.map((c, i) => ({ ...c, stackPosition: i }))

  return (
    <div className={cn("space-y-3.5 w-full", className)}>
      {/* Cards Container */}
      <LayoutGroup>
        <motion.div layout className={cn(containerStyles[layout])}>
          <AnimatePresence mode="popLayout">
            {displayCards.map((card) => {
              const styles = getLayoutStyles(card.stackPosition)
              const isExpanded = expandedCard === card.id
              const isTopCard = layout === "stack" && card.stackPosition === 0

              return (
                <motion.div
                  key={card.id}
                  layoutId={card.id}
                  initial={{ opacity: 0, scale: 0.92 }}
                  animate={{
                    opacity: 1,
                    scale: isExpanded ? 1.02 : 1,
                    x: 0,
                    ...styles,
                  }}
                  exit={{ opacity: 0, scale: 0.9, x: -160 }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 28,
                    mass: 0.7,
                  }}
                  drag={isTopCard ? "x" : false}
                  dragConstraints={{ left: 0, right: 0 }}
                  dragElastic={0.35}
                  onDragStart={() => setIsDragging(true)}
                  onDragEnd={handleDragEnd}
                  whileDrag={{ scale: 1.01, cursor: "grabbing" }}
                  onClick={() => {
                    if (isDragging) return
                    setExpandedCard(isExpanded ? null : card.id)
                    onCardClick?.(card)
                  }}
                  className={cn(
                    "cursor-pointer rounded-2xl border border-white/15 bg-[#14151a] shadow-[0_12px_32px_rgba(0,0,0,0.6),inset_0_1px_1px_rgba(255,255,255,0.15)] p-4 transition-colors text-white relative",
                    "hover:border-white/25",
                    layout === "stack" && "absolute inset-x-0 mx-auto w-full h-full flex flex-col justify-between overflow-hidden select-none",
                    layout === "stack" && isTopCard && "cursor-grab active:cursor-grabbing",
                    layout === "stack" && !isTopCard && "pointer-events-none",
                    layout === "grid" && "w-full min-h-[160px] flex flex-col justify-between",
                    isExpanded && "ring-1.5 ring-white/40",
                  )}
                >
                  {/* Color Accent Tint on solid background */}
                  {card.color && (
                    <div
                      className="absolute inset-0 rounded-2xl pointer-events-none"
                      style={{ backgroundColor: card.color }}
                    />
                  )}

                  {/* Specular Top Rim Highlight */}
                  <div className="absolute top-0 inset-x-6 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none z-1" />

                  {/* Top Row: Icon, Title & Badge */}
                  <div
                    className={cn(
                      "flex items-start gap-3 transition-opacity duration-200",
                      layout === "stack" && !isTopCard ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}
                  >
                    {card.icon && (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-white border border-white/12 backdrop-blur-md shadow-xs">
                        {card.icon}
                      </div>
                    )}
                    <div className="min-w-0 flex-1 space-y-1">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="font-semibold text-sm sm:text-[15px] text-white tracking-tight truncate leading-snug">
                          {card.title}
                        </h3>
                        <div className="flex items-center gap-1.5 shrink-0" onClick={(e) => e.stopPropagation()}>
                          {card.badge && (
                            <span className="text-[10px] font-mono font-medium uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10 shrink-0">
                              {card.badge}
                            </span>
                          )}
                          {card.headerAction}
                        </div>
                      </div>
                      <p
                        className={cn(
                          "text-xs sm:text-[13px] text-zinc-300 font-normal leading-relaxed",
                          "line-clamp-2",
                        )}
                      >
                        {card.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer / Interactive Actions */}
                  <div
                    className={cn(
                      "mt-auto pt-2.5 flex items-center justify-between text-xs text-white/60 border-t border-white/8 transition-opacity duration-200",
                      layout === "stack" && !isTopCard ? "opacity-0 pointer-events-none" : "opacity-100"
                    )}
                  >
                    {card.footer ? (
                      <div className="w-full">{card.footer}</div>
                    ) : (
                      <div className="w-full flex items-center justify-between text-[11px] font-mono text-white/50">
                        <span>Details</span>
                        {isTopCard && <span>Swipe ↔</span>}
                      </div>
                    )}
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>

      {/* Navigation Controls: Layout Mode + Pagination */}
      <div className="flex items-center justify-between gap-3 pt-0.5 px-1">
        {/* Layout Segmented Control */}
        <div className="flex items-center gap-0.5 p-0.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/10">
          {(Object.keys(layoutIcons) as LayoutMode[]).map((mode) => {
            const Icon = layoutIcons[mode]
            const label = mode === "stack" ? "Deck" : "Grid"
            const isActive = layout === mode
            return (
              <button
                key={mode}
                type="button"
                onClick={() => setLayout(mode)}
                className={cn(
                  "flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all duration-150 cursor-pointer",
                  isActive
                    ? "bg-white/20 text-white font-semibold shadow-xs"
                    : "text-white/50 hover:text-white/80 hover:bg-white/5"
                )}
                aria-label={`Switch to ${mode} layout`}
              >
                <Icon className="h-3 w-3" />
                <span className="capitalize text-[11px]">{label}</span>
              </button>
            )
          })}
        </div>

        {/* Stack Dots Pagination */}
        {layout === "stack" && cards.length > 1 && (
          <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-xl bg-black/20 border border-white/5">
            {cards.map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-200 cursor-pointer",
                  index === activeIndex
                    ? "w-4 bg-white shadow-[0_0_6px_rgba(255,255,255,0.6)]"
                    : "w-1.5 bg-white/25 hover:bg-white/40",
                )}
                aria-label={`Go to card ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export const Component = MorphingCardStack;
export default MorphingCardStack;
