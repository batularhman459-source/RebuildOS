import React from 'react';
import { MeshDriftBackground } from './MeshDriftBackground';

export const LiveBackground: React.FC = () => {
  return (
    <div
      id="rebuildos-wallpaper-container"
      className="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none bg-[#050508]"
      aria-hidden="true"
    >
      {/* Animated WebGL Shader Background ("Mesh drift") */}
      <MeshDriftBackground />

      {/* Dark transparent overlay to make the background darker */}
      <div className="absolute inset-0 bg-black/50 pointer-events-none" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-black/60 pointer-events-none" />
    </div>
  );
};


