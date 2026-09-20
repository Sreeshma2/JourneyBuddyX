import React, { useEffect, useState } from 'react';
import { PhoenixAvatar } from './PhoenixAvatar';
import { JourneyBuddyLogo } from './JourneyBuddyLogo';
import { Compass, Sparkles } from 'lucide-react';

interface SplashScreenProps {
  onComplete?: () => void;
  onFinish?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete, onFinish }) => {
  const [progress, setProgress] = useState(0);

  const handleFinish = () => {
    if (onComplete) {
      onComplete();
    } else if (onFinish) {
      onFinish();
    }
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(timer);
          setTimeout(handleFinish, 200);
          return 100;
        }
        return prev + 10;
      });
    }, 100);

    return () => clearInterval(timer);
  }, [onComplete, onFinish]);

  return (
    <div
      onClick={handleFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-slate-950 text-white p-8 select-none cursor-pointer"
      role="region"
      aria-label="Welcome Splash Screen"
    >
      {/* Top subtle decorative pattern */}
      <div className="w-full flex justify-between items-center opacity-50 text-xs tracking-widest text-slate-400 pt-4">
        <span className="flex items-center gap-1.5 font-semibold">
          <Compass className="w-3.5 h-3.5 text-blue-400" />
          <span>JOURNEY BUDDY</span>
        </span>
        <span className="text-[11px] bg-blue-950/60 text-blue-300 border border-blue-800/50 px-2 py-0.5 rounded-full">v2.5</span>
      </div>

      {/* Center hero element: Official Brand Logo & Phoenix AI */}
      <div className="flex flex-col items-center text-center max-w-xs">
        <div className="relative mb-5 flex flex-col items-center">
          <JourneyBuddyLogo size="2xl" variant="dark" className="drop-shadow-2xl hover:scale-105 transition-transform" />
          {/* Phoenix AI Companion mini badge */}
          <div className="absolute -bottom-3 -right-2 bg-slate-900/90 border border-amber-400/50 text-amber-300 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-lg backdrop-blur-sm">
            <PhoenixAvatar size="xs" mood="happy" />
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span>AI Ready</span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold tracking-tight text-white mb-2">
          Journey<span className="text-orange-500">Buddy</span>
        </h1>

        <p className="text-slate-300 text-sm font-medium tracking-wide">
          Explore Smarter. Travel Safer.
        </p>
      </div>

      {/* Bottom loading indicator */}
      <div className="w-full max-w-xs flex flex-col items-center pb-8 gap-3">
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-blue-500 via-sky-400 to-orange-500 rounded-full transition-all duration-150 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-[12px] text-slate-400 font-medium">
          Tap anywhere to continue
        </span>
      </div>
    </div>
  );
};
