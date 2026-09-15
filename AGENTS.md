# REBUILDOS — VISUAL DESIGN SYSTEM & STYLE LOCK

## CORE DIRECTIVE
The current RebuildOS visual design is established and locked.
- DO NOT redesign, reinterpret, or replace the existing aesthetic with generic templates.
- The existing implementation is the visual source of truth.
- Every new page, feature, or component MUST strictly extend the existing RebuildOS product style.

---

## 1. CORE VISUAL IDENTITY
- **Backgrounds**: Very dark black / charcoal surfaces (`#0c0d12`, `#11131a`, `#14151a`).
- **Elevated Surfaces**: Dark gray cards with subtle lighting/gradients and specular top rim highlights.
- **Borders**: Thin, low-contrast 1px borders (`border-white/10` to `border-white/15`).
- **Cards**: Large rounded corners (`rounded-2xl` to `rounded-[28px]`), compact and comfortable internal padding.
- **Typography**: Strong white headings, muted zinc/gray secondary text (`text-white/60`), system-like mono metadata labels (`text-[10px]` - `text-[11px]`).
- **Lighting & Glows**: Controlled, restrained glow only around active/high-priority elements.
- **Metrics**: Circular progress rings, compact metric units (e.g. `88% Execution Strong`).
- **Navigation**: Persistent floating pill bottom navigation on mobile with emergency reset trigger.

---

## 2. COLOR RULES
Strictly preserve the established semantic color system:
- **Orange / Amber (`#f97316` / `#f59e0b`)**: Primary action, focus, core system accent.
- **Green / Emerald (`#10b981`)**: Success, completed missions, positive streaks.
- **Red / Rose (`#f43f5e`)**: Emergency reset, missed items, destructive actions.
- **Purple / Indigo (`#a855f7` / `#6366f1`)**: AI Coach, XP progression, special milestones.
- **Blue / Cyan (`#06b6d4` / `#38bdf8`)**: Identity, focus timer metrics, telemetry.
- **Neutral Dark Base**: Black/Charcoal dominance — never turn components into saturated rainbows.

---

## 3. COMPONENT & CARD RULES
- **Reuse Existing Patterns**: Check for existing components (`MissionsSection`, `HabitRings`, `HeatmapGrid`, `LiquidMetalButton`, etc.) before creating new ones.
- **Hierarchy**: Important numbers / headings > Main content > Supporting descriptions > Metadata tags.
- **Spacing**: Information-dense yet organized; never create barren empty areas or cramped overlaps.
- **Mobile First**: Design primarily for mobile viewport constraints (`375px - 430px`) and ensure fluid desktop scaling (`max-w-xl` / `max-w-7xl`).

---

## 4. MODIFICATION PROTOCOL
- "Make this cleaner" / "Make this minimal" → Reduce noise while maintaining established RebuildOS card/color language.
- "Fix spacing" → Fix spacing only.
- "Add feature X" → Integrate feature X using existing cards, typography, metric dials, and navigation patterns.
