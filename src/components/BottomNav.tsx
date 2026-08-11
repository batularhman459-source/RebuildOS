import React from 'react';
import { Home, Shield, BookOpen, Bot, AlertCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'identity' | 'journal' | 'coach' | 'reset';
  onSelectTab: (tab: 'home' | 'identity' | 'journal' | 'coach' | 'reset') => void;
  onOpenResetModal: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenResetModal,
}) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#08080a]/85 backdrop-blur-2xl border-t border-white/15 px-2 py-2 shadow-[0_-8px_32px_0_rgba(0,0,0,0.5)]">
      <div className="max-w-md mx-auto flex items-center justify-around">
        {/* Home */}
        <button
          onClick={() => onSelectTab('home')}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-1.5 rounded-xl ${
            activeTab === 'home'
              ? 'text-emerald-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'home' ? 'bg-emerald-500/10 border border-emerald-500/30' : ''
            }`}
          >
            <Home className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono tracking-tight">Home</span>
        </button>

        {/* Identity */}
        <button
          onClick={() => onSelectTab('identity')}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-1.5 rounded-xl ${
            activeTab === 'identity'
              ? 'text-cyan-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'identity' ? 'bg-cyan-500/10 border border-cyan-500/30' : ''
            }`}
          >
            <Shield className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono tracking-tight">Identity</span>
        </button>

        {/* Journal */}
        <button
          onClick={() => onSelectTab('journal')}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-1.5 rounded-xl ${
            activeTab === 'journal'
              ? 'text-amber-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'journal' ? 'bg-amber-500/10 border border-amber-500/30' : ''
            }`}
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono tracking-tight">Journal</span>
        </button>

        {/* AI Coach */}
        <button
          onClick={() => onSelectTab('coach')}
          className={`flex flex-col items-center gap-1 transition-all py-1 px-1.5 rounded-xl ${
            activeTab === 'coach'
              ? 'text-purple-400 font-bold'
              : 'text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <div
            className={`p-1.5 rounded-xl transition-all ${
              activeTab === 'coach' ? 'bg-purple-500/10 border border-purple-500/30' : ''
            }`}
          >
            <Bot className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono tracking-tight">Coach</span>
        </button>

        {/* Floating/Prominent Reset Protocol Red Button */}
        <button
          onClick={onOpenResetModal}
          className="flex flex-col items-center gap-1 transition-all py-1 px-1.5 text-red-500 hover:text-red-400 group"
          title="Launch Emergency Reset Protocol"
        >
          <div className="p-1.5 rounded-xl bg-red-500/15 border border-red-500/40 group-hover:bg-red-500/25 group-hover:scale-105 transition-all shadow-lg shadow-red-500/20">
            <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 animate-pulse" />
          </div>
          <span className="text-[9px] sm:text-[10px] font-mono font-bold text-red-400 tracking-tight">Reset</span>
        </button>
      </div>
    </nav>
  );
};
