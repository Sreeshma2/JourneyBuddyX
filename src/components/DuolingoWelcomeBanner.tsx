import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, X, Compass, CheckCircle2, ChevronRight, Volume2 } from 'lucide-react';
import { JourneyBuddyLogo } from './JourneyBuddyLogo';

interface DuolingoWelcomeBannerProps {
  userName: string;
  onExploreClick: () => void;
  onOpenTranslator?: () => void;
  onOpenTickets?: () => void;
}

export const DuolingoWelcomeBanner: React.FC<DuolingoWelcomeBannerProps> = ({
  userName,
  onExploreClick,
  onOpenTranslator,
  onOpenTickets,
}) => {
  const [isDismissed, setIsDismissed] = useState(false);
  const [streakCount] = useState(1);
  const [completedTasks, setCompletedTasks] = useState<Record<string, boolean>>({
    safety: true,
    route: false,
    ticket: false,
  });

  const toggleTask = (key: string) => {
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const playWelcomeChime = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
      osc.frequency.exponentialRampToValueAtTime(659.25, audioCtx.currentTime + 0.12); // E5
      osc.frequency.exponentialRampToValueAtTime(783.99, audioCtx.currentTime + 0.25); // G5
      gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start();
      osc.stop(audioCtx.currentTime + 0.45);
    } catch {
      // Audio autoplay policy fallback
    }
  };

  if (isDismissed) {
    return (
      <div className="px-4 pt-2 pb-1">
        <button
          onClick={() => setIsDismissed(false)}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-gradient-to-r from-amber-50 to-orange-50 border border-orange-200 rounded-xl text-xs font-semibold text-orange-800 shadow-xs hover:bg-orange-100/50 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[11px] font-bold">
              <Flame className="w-3 h-3 fill-white" /> {streakCount} Day Streak
            </span>
            <span>Welcome back, {userName}! Tap for your daily quest</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-orange-600" />
        </button>
      </div>
    );
  }

  const completedCount = Object.values(completedTasks).filter(Boolean).length;
  const progressPercent = Math.round((completedCount / 3) * 100);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ type: 'spring', damping: 20, stiffness: 260 }}
        className="px-4 pt-3 pb-2"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-amber-500 via-orange-500 to-rose-600 rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-orange-500/20 border-2 border-white/20">
          {/* Background decorative geometry */}
          <div className="absolute -right-8 -bottom-8 w-44 h-44 bg-white/10 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-12 top-2 w-20 h-20 bg-yellow-300/20 rounded-full blur-xl pointer-events-none" />

          {/* Top row with streak & dismiss */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-extrabold tracking-wide uppercase shadow-xs">
                <Flame className="w-4 h-4 text-yellow-300 fill-yellow-300 animate-pulse" />
                {streakCount} Day Travel Streak!
              </span>
              <button
                onClick={playWelcomeChime}
                title="Play cheerful chime"
                className="w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white/90"
              >
                <Volume2 className="w-3.5 h-3.5" />
              </button>
            </div>
            <button
              onClick={() => setIsDismissed(true)}
              className="w-7 h-7 rounded-full bg-black/20 hover:bg-black/30 flex items-center justify-center text-white/80 hover:text-white transition-colors"
              title="Minimize quest"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Main mascot + speech bubble layout (Duolingo style) */}
          <div className="flex items-start gap-3.5 relative z-10">
            {/* Mascot Avatar with bounce */}
            <motion.div
              animate={{ y: [0, -4, 0] }}
              transition={{ repeat: Infinity, duration: 2.4, ease: 'easeInOut' }}
              className="shrink-0 flex flex-col items-center"
            >
              <div className="p-1 bg-white rounded-2xl shadow-lg shadow-black/20">
                <JourneyBuddyLogo size="md" />
              </div>
              <span className="text-[10px] font-bold text-white/90 mt-1 bg-black/20 px-1.5 py-0.5 rounded-full">
                Phoenix AI
              </span>
            </motion.div>

            {/* Speech bubble */}
            <div className="flex-1 bg-white text-slate-900 rounded-2xl p-3.5 shadow-lg relative before:content-[''] before:absolute before:top-4 before:-left-2 before:w-0 before:h-0 before:border-t-8 before:border-t-transparent before:border-r-8 before:border-r-white before:border-b-8 before:border-b-transparent">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-extrabold text-sm text-slate-900 flex items-center gap-1.5">
                  <span>Namaste, {userName}! 🎒</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </h3>
                <span className="text-[11px] font-bold text-orange-600 bg-orange-50 px-2 py-0.5 rounded-md">
                  {progressPercent}% Quest Done
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                Your journey companion is online with live traffic, crowd pulse, and official government tariffs. Ready to explore?
              </p>

              {/* Duolingo Daily Quests */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 space-y-1.5">
                <div
                  onClick={() => toggleTask('safety')}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${completedTasks.safety ? 'text-emerald-500 fill-emerald-100' : 'text-slate-300'}`} />
                    <span className={completedTasks.safety ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-semibold'}>
                      Check offline safety & SOS lifeline
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded">
                    +20 XP
                  </span>
                </div>

                <div
                  onClick={() => {
                    toggleTask('route');
                    if (onOpenTranslator) onOpenTranslator();
                  }}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${completedTasks.route ? 'text-emerald-500 fill-emerald-100' : 'text-slate-300'}`} />
                    <span className={completedTasks.route ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-semibold'}>
                      Practice 1 local phrase with Voice Audio
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">
                    +30 XP
                  </span>
                </div>

                <div
                  onClick={() => {
                    toggleTask('ticket');
                    if (onOpenTickets) onOpenTickets();
                  }}
                  className="flex items-center justify-between p-1.5 rounded-lg hover:bg-slate-50 cursor-pointer text-xs"
                >
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className={`w-4 h-4 ${completedTasks.ticket ? 'text-emerald-500 fill-emerald-100' : 'text-slate-300'}`} />
                    <span className={completedTasks.ticket ? 'line-through text-slate-400 font-medium' : 'text-slate-700 font-semibold'}>
                      Store verified ferry / monument pass in Wallet
                    </span>
                  </div>
                  <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-1.5 py-0.5 rounded">
                    +50 XP
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <motion.div
                  className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercent}%` }}
                  transition={{ duration: 0.8 }}
                />
              </div>

              {/* Quick Action Button */}
              <div className="mt-3 flex items-center gap-2">
                <button
                  onClick={onExploreClick}
                  className="flex-1 py-2 px-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white rounded-xl text-xs font-bold tracking-wide shadow-sm flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Explore Verified Destinations
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
