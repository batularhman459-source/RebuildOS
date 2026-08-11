import React from 'react';

interface LiveBackgroundProps {
  imageSrc?: string;
}

export const LiveBackground: React.FC<LiveBackgroundProps> = () => {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#050505]">
      {/* 1. Primary Vibrant Blue Ambient Glow Orb (Top Left) */}
      <div className="absolute -top-24 -left-20 w-[450px] h-[450px] bg-blue-600/20 rounded-full blur-[100px] animate-pulse-slow" />

      {/* 2. Vibrant Cyan / Teal Glowing Orb (Mid Right) */}
      <div className="absolute top-1/3 -right-24 w-[480px] h-[480px] bg-cyan-500/20 rounded-full blur-[110px] animate-pulse-slow delay-1000" />

      {/* 3. Deep Emerald / Green Accent Glow Orb (Bottom Left) */}
      <div className="absolute -bottom-20 -left-16 w-[420px] h-[420px] bg-emerald-500/18 rounded-full blur-[100px] animate-pulse-slow delay-2000" />

      {/* 4. Center Soft Neon Cyan & Blue Blend Mesh */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-cyan-600/10 via-teal-500/10 to-emerald-500/10 rounded-full blur-[130px] animate-drift" />

      {/* 5. Vignette & Smooth Contrast Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050505]/40 via-transparent to-[#050505]/90" />

      {/* Custom Keyframe Animations */}
      <style>{`
        @keyframes pulseSlow {
          0%, 100% { opacity: 0.6; transform: scale(1) translateY(0px); }
          50% { opacity: 0.95; transform: scale(1.18) translateY(-15px); }
        }

        @keyframes drift {
          0%, 100% { transform: translate(-50%, -50%) scale(1) rotate(0deg); }
          50% { transform: translate(-45%, -52%) scale(1.1) rotate(10deg); }
        }

        .animate-pulse-slow {
          animation: pulseSlow 7s ease-in-out infinite;
        }

        .animate-drift {
          animation: drift 16s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};
