import React from 'react';
import { Home, CalendarDays, Target, Info, AlertCircle } from 'lucide-react';

interface BottomNavProps {
  activeTab: 'home' | 'journal' | 'coach' | 'about' | 'reset';
  onSelectTab: (tab: 'home' | 'journal' | 'coach' | 'about' | 'reset') => void;
  onOpenResetModal: () => void;
}

interface NavItem {
  id: 'home' | 'journal' | 'coach' | 'about';
  label: string;
  icon: React.ElementType;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'journal', label: 'Journal', icon: CalendarDays },
  { id: 'coach', label: 'Coach', icon: Target },
  { id: 'about', label: 'About', icon: Info },
];

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenResetModal,
}) => {
  return (
    <div className="md:hidden fixed bottom-4 sm:bottom-6 left-0 right-0 z-40 flex items-center justify-center px-4 pointer-events-none select-none">
      <div className="flex items-center gap-2.5 sm:gap-3 pointer-events-auto">
        {/* Main Floating Frosted Glass Capsule Bar */}
        <nav
          aria-label="App Navigation"
          className="relative flex items-center justify-between h-[54px] sm:h-[60px] px-2 py-1.5 rounded-full bg-black/40 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-white overflow-hidden min-w-[300px] sm:min-w-[345px] isolate [transform:translateZ(0)]"
        >
          {/* Top Specular Glass Lip */}
          <div className="absolute inset-x-6 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent pointer-events-none" />

          {/* Navigation Items */}
          <div className="flex items-center justify-between w-full gap-1 sm:gap-1.5">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;

              return (
                <button
                  key={item.id}
                  id={`nav-item-${item.id}`}
                  type="button"
                  onClick={() => onSelectTab(item.id)}
                  aria-label={item.label}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center justify-center w-12 h-10 sm:w-14 sm:h-11 rounded-full transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 cursor-pointer ${
                    isActive
                      ? 'bg-white text-zinc-950 shadow-md'
                      : 'text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform duration-150 ${isActive ? 'scale-105 stroke-[2.3]' : 'stroke-[1.9]'}`} />
                </button>
              );
            })}
          </div>
        </nav>

        {/* Circular Glass Action / Reset Bubble */}
        <button
          type="button"
          onClick={onOpenResetModal}
          aria-label="Emergency Reset"
          title="Emergency Reset"
          className="relative flex items-center justify-center w-[48px] h-[48px] sm:w-[54px] sm:h-[54px] rounded-full bg-black/40 backdrop-blur-2xl border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.5)] text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/30 hover:scale-105 active:scale-95 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-400 cursor-pointer group isolate [transform:translateZ(0)]"
        >
          {/* Top Specular Glass Lip */}
          <div className="absolute inset-x-3 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />
          
          <AlertCircle className="w-5 h-5 sm:w-5.5 sm:h-5.5 transition-transform group-hover:rotate-12 group-hover:scale-110" />
        </button>
      </div>
    </div>
  );
};

