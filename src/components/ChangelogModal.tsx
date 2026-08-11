import React from 'react';
import { X, Fingerprint, Activity, ShieldCheck, Sparkles } from 'lucide-react';

interface ChangelogModalProps {
  onClose: () => void;
}

export const ChangelogModal: React.FC<ChangelogModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="w-full max-w-sm sm:max-w-md bg-[#0d0d0f] border border-white/10 rounded-3xl p-5 sm:p-6 space-y-5 shadow-2xl relative overflow-hidden text-left max-h-[90vh] flex flex-col">
        {/* Top Header Row with Close Button */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] font-mono font-bold tracking-widest text-neutral-400 uppercase">
              REBUILDOS CHANGELOG
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content Container */}
        <div className="overflow-y-auto space-y-6 pr-1 custom-scrollbar">
          {/* Featured Top Card - AUG 4 / NEW */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[11px] font-mono font-bold tracking-wider">
              <span className="text-neutral-500 uppercase">AUG 4</span>
              <span className="text-emerald-400 uppercase">• NEW</span>
            </div>

            <h3 className="text-lg font-bold text-white tracking-tight leading-snug">
              Identity Snapshot & OS Engine
            </h3>

            <p className="text-xs text-neutral-400 leading-relaxed">
              First up: the new Identity Snapshot is live. Replaced habits with 5 core vertical pillars (Discipline, Focus, Consistency, Self-Trust, Resilience) to track who you are becoming.
            </p>

            {/* Graphic Media Box Mockup */}
            <div className="w-full bg-[#141418] border border-white/10 rounded-2xl p-4 relative overflow-hidden group shadow-inner">
              <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
                <div className="flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-emerald-400" />
                  <span className="text-[11px] font-mono text-neutral-300 font-bold">Identity Snapshot</span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Active
                </span>
              </div>

              {/* Graphic Capsules Preview */}
              <div className="grid grid-cols-5 gap-1.5 pt-1 items-end h-24">
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-emerald-500/20 rounded-full h-[80%] border border-emerald-400/30 relative flex items-end p-0.5">
                    <div className="w-full bg-emerald-400 rounded-full h-[82%]" />
                  </div>
                  <span className="text-[8px] font-mono text-neutral-400">DISC</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-purple-500/20 rounded-full h-[80%] border border-purple-400/30 relative flex items-end p-0.5">
                    <div className="w-full bg-purple-400 rounded-full h-[71%]" />
                  </div>
                  <span className="text-[8px] font-mono text-neutral-400">FOC</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-amber-500/20 rounded-full h-[80%] border border-amber-400/30 relative flex items-end p-0.5">
                    <div className="w-full bg-amber-400 rounded-full h-[89%]" />
                  </div>
                  <span className="text-[8px] font-mono text-neutral-400">CONS</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-[#00e599]/20 rounded-full h-[80%] border border-[#00e599]/30 relative flex items-end p-0.5">
                    <div className="w-full bg-[#00e599] rounded-full h-[91%]" />
                  </div>
                  <span className="text-[8px] font-mono text-neutral-400">RES</span>
                </div>
                <div className="flex flex-col items-center gap-1 h-full justify-end">
                  <div className="w-full bg-blue-500/20 rounded-full h-[80%] border border-blue-400/30 relative flex items-end p-0.5">
                    <div className="w-full bg-blue-400 rounded-full h-[67%]" />
                  </div>
                  <span className="text-[8px] font-mono text-neutral-400">CONF</span>
                </div>
              </div>
            </div>
          </div>

          {/* Vertical Timeline Items */}
          <div className="relative border-l border-neutral-800 ml-1.5 pl-5 space-y-6">
            {/* Timeline Item 1 */}
            <div className="relative group">
              {/* Timeline Dot */}
              <span className="w-2.5 h-2.5 rounded-full bg-white absolute -left-[25.5px] top-1 ring-4 ring-[#0d0d0f]" />

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  AUG 2
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Blue-Cyan Momentum Heatmap
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Refreshed activity heatmaps with smooth blue and cyan progression gradients for daily intensity and XP tracking.
                </p>
              </div>
            </div>

            {/* Timeline Item 2 */}
            <div className="relative group">
              {/* Timeline Dot */}
              <span className="w-2.5 h-2.5 rounded-full bg-[#404040] group-hover:bg-white transition-colors absolute -left-[25.5px] top-1 ring-4 ring-[#0d0d0f]" />

              <div className="space-y-1">
                <span className="text-[11px] font-mono font-bold text-neutral-500 uppercase tracking-wider block">
                  JUL 28
                </span>
                <h4 className="text-sm font-bold text-white tracking-tight">
                  Identity OS Profile Engine
                </h4>
                <p className="text-xs text-neutral-400 leading-relaxed">
                  Clicking the RebuildOS brand header opens your operator stats, level ladder progression, and state management.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Action */}
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-2xl bg-white hover:bg-neutral-200 text-black text-xs font-bold transition-all shadow-md active:scale-98"
        >
          Got It
        </button>
      </div>
    </div>
  );
};

