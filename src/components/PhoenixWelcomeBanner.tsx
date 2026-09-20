import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Flame, Sparkles, Volume2, VolumeX, Calendar, MessageSquareText, ChevronRight } from 'lucide-react';
import { PhoenixAvatar } from './PhoenixAvatar';
import { TripPlan } from '../types';
import { useTranslation } from '../context/TranslationContext';
import { speakPhoenix, stopPhoenixSpeech } from '../utils/phoenixVoice';

interface PhoenixWelcomeBannerProps {
  userName: string;
  upcomingTrip?: TripPlan | null;
  onStartPlanning: () => void;
  onChatWithPhoenix: () => void;
}

export const PhoenixWelcomeBanner: React.FC<PhoenixWelcomeBannerProps> = ({
  userName,
  upcomingTrip,
  onStartPlanning,
  onChatWithPhoenix,
}) => {
  const { t, currentLanguage } = useTranslation();
  const [isMinimized, setIsMinimized] = useState(false);
  const [streakDays] = useState(3);
  const [isSpeaking, setIsSpeaking] = useState(false);

  // Stop speech when component unmounts
  useEffect(() => {
    return () => {
      stopPhoenixSpeech();
    };
  }, []);

  // Dynamic countdown logic
  const getTripCountdownDetails = () => {
    if (!upcomingTrip) {
      return {
        headline: `Hey, ${userName}! 🦊`,
        subline: t('welcome.whereNext', 'Where should we go next? 🌍'),
        tag: 'New Journey',
        daysDiff: null,
      };
    }

    // Attempt to calculate days until trip start
    let daysDiff = 1; // Default to 1 day as in prompt example
    try {
      const datesParts = upcomingTrip.dates.split('–')[0].trim();
      const parsedDate = new Date(datesParts);
      if (!isNaN(parsedDate.getTime())) {
        const today = new Date();
        const diffTime = parsedDate.getTime() - today.getTime();
        const calcDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        if (calcDays >= 0) {
          daysDiff = calcDays;
        }
      }
    } catch {
      daysDiff = 1;
    }

    const destination = upcomingTrip.destinationName || 'your destination';

    if (daysDiff === 1) {
      return {
        headline: `Hey, ${userName}! 🦊`,
        subline: `Your adventure to ${destination} starts in 1 day! ✈️`,
        speech: t('welcome.oneMoreSleep', 'One more sleep until your journey! 🦊✈️'),
        tag: 'Tomorrow!',
        daysDiff: 1,
      };
    } else if (daysDiff <= 7 && daysDiff > 1) {
      return {
        headline: `Hey, ${userName}! 🦊`,
        subline: `Only ${daysDiff} days until your ${destination} adventure! 🌴`,
        speech: t('welcome.almostHere', 'Your trip is almost here! 🎒'),
        tag: `${daysDiff} Days Left`,
        daysDiff,
      };
    } else if (daysDiff <= 0) {
      return {
        headline: `Welcome back, ${userName}! 🦊`,
        subline: `How was your trip to ${destination}?`,
        speech: t('welcome.makeAmazing', "Let's make your next trip amazing."),
        tag: 'Completed',
        daysDiff: 0,
      };
    } else {
      return {
        headline: `Hey, ${userName}! 🦊`,
        subline: `${daysDiff} days until your ${destination} adventure! 🌴`,
        speech: t('welcome.ready', 'Ready for your adventure?'),
        tag: `${daysDiff} Days`,
        daysDiff,
      };
    }
  };

  const tripDetails = getTripCountdownDetails();

  const handleToggleVoice = () => {
    if (isSpeaking) {
      stopPhoenixSpeech();
      setIsSpeaking(false);
      return;
    }

    const speechParts = [
      tripDetails.headline,
      tripDetails.subline,
      tripDetails.speech || t('welcome.makeAmazing', "Let's make your trip amazing."),
    ];
    const fullText = speechParts.join('. ');

    const success = speakPhoenix(fullText, {
      lang: currentLanguage,
      onStart: () => setIsSpeaking(true),
      onEnd: () => setIsSpeaking(false),
      onError: () => setIsSpeaking(false),
    });

    if (!success) {
      setIsSpeaking(false);
    }
  };

  if (isMinimized) {
    return (
      <div className="px-4 pt-2 pb-1">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-full flex items-center justify-between px-3.5 py-2.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl text-xs font-semibold text-blue-900 shadow-2xs hover:bg-blue-100/60 transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1 bg-orange-500 text-white px-2 py-0.5 rounded-full text-[10px] font-black">
              <Flame className="w-3 h-3 fill-white" /> {streakDays}d Streak
            </span>
            <span className="font-bold">{tripDetails.headline}</span>
            <span className="text-slate-500 hidden sm:inline text-[11px] truncate">
              {tripDetails.subline}
            </span>
          </div>
          <div className="flex items-center gap-1 text-blue-600 font-bold text-[11px]">
            <span>Expand</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </button>
      </div>
    );
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96 }}
        transition={{ type: 'spring', damping: 22, stiffness: 280 }}
        className="px-4 pt-3 pb-1"
      >
        <div className="relative overflow-hidden bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 rounded-3xl p-4 sm:p-5 text-white shadow-xl shadow-blue-950/20 border border-blue-800/40">
          {/* Subtle background glow */}
          <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-orange-500/15 rounded-full blur-2xl pointer-events-none" />
          <div className="absolute right-16 top-0 w-24 h-24 bg-blue-400/10 rounded-full blur-xl pointer-events-none" />

          {/* Top meta row: Streak & Controls */}
          <div className="flex items-center justify-between mb-3 relative z-10">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.8 bg-white/10 backdrop-blur-md rounded-full text-[11px] font-black tracking-wide text-orange-300 border border-orange-400/20">
                <Flame className="w-3.5 h-3.5 fill-orange-400 text-orange-400 animate-pulse" />
                {streakDays} Day Travel Streak!
              </span>
              <button
                id="phoenix-banner-voice-btn"
                onClick={handleToggleVoice}
                title={isSpeaking ? t('voice.stop', "Stop Phoenix speaking") : t('voice.listen', "Listen to Phoenix's voice")}
                className={`px-2.5 py-1 rounded-full flex items-center gap-1.5 text-[11px] font-bold transition-all cursor-pointer shadow-xs ${
                  isSpeaking
                    ? 'bg-amber-400 text-slate-950 ring-2 ring-amber-300 animate-pulse'
                    : 'bg-white/15 hover:bg-white/25 text-amber-300 hover:text-white border border-white/20'
                }`}
                aria-label="Toggle Phoenix voice speech"
              >
                {isSpeaking ? (
                  <>
                    <VolumeX className="w-3.5 h-3.5 text-slate-950 shrink-0" />
                    <span className="text-[10px] font-black">Speaking...</span>
                    <span className="flex gap-0.5 items-end h-2.5 ml-0.5">
                      <span className="w-0.5 h-1.5 bg-slate-950 animate-bounce" />
                      <span className="w-0.5 h-2.5 bg-slate-950 animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-0.5 h-2 bg-slate-950 animate-bounce" style={{ animationDelay: '300ms' }} />
                    </span>
                  </>
                ) : (
                  <>
                    <Volume2 className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                    <span className="text-[10.5px]">Fox Voice</span>
                  </>
                )}
              </button>
            </div>

            <button
              onClick={() => setIsMinimized(true)}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-200 px-2 py-0.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              Minimize
            </button>
          </div>

          {/* Main content: Phoenix Mascot + Speech Bubble */}
          <div className="flex items-start gap-3.5 relative z-10">
            {/* Phoenix mascot avatar with breathing animation & clickable voice feedback */}
            <motion.div
              animate={{ y: [0, -3, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              className="shrink-0 flex flex-col items-center cursor-pointer group"
              onClick={handleToggleVoice}
              title="Click to hear Phoenix speak"
            >
              <div className={`p-1 rounded-2xl border transition-all ${
                isSpeaking
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg scale-105'
                  : 'bg-white/10 border-white/20 hover:bg-white/20 shadow-md group-hover:scale-105'
              }`}>
                <PhoenixAvatar size="md" mood={isSpeaking ? 'speaking' : 'happy'} withGlow animate />
              </div>
              <span className="text-[10px] font-extrabold text-blue-200 mt-1 bg-blue-900/80 px-2 py-0.5 rounded-full border border-blue-700/50 flex items-center gap-1">
                {isSpeaking && <span className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-ping" />}
                Phoenix AI
              </span>
            </motion.div>

            {/* Speech Bubble Card */}
            <div className="flex-1 bg-white text-slate-900 rounded-2xl p-3.5 shadow-lg relative before:content-[''] before:absolute before:top-4 before:-left-2 before:w-0 before:h-0 before:border-t-6 before:border-t-transparent before:border-r-8 before:border-r-white before:border-b-6 before:border-b-transparent">
              <div className="flex items-center justify-between gap-1 mb-1">
                <h3 className="font-black text-sm text-slate-900 flex items-center gap-1.5">
                  <span>{tripDetails.headline}</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                </h3>
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={handleToggleVoice}
                    className={`p-1 rounded-full transition-colors ${
                      isSpeaking ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-800'
                    }`}
                    title={isSpeaking ? "Stop Phoenix voice" : "Listen to Phoenix"}
                    aria-label="Listen to Phoenix"
                  >
                    {isSpeaking ? <VolumeX className="w-3 h-3 text-amber-700" /> : <Volume2 className="w-3 h-3" />}
                  </button>
                  <span className="text-[10px] font-black text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md shrink-0">
                    {tripDetails.tag}
                  </span>
                </div>
              </div>

              {/* Dynamic countdown line */}
              <p className="text-xs font-bold text-slate-800 leading-snug">
                {tripDetails.subline}
              </p>

              {/* Conversational companion speech */}
              <p className="text-[11.5px] text-slate-600 mt-1 font-medium leading-relaxed">
                {tripDetails.speech || t('welcome.makeAmazing', "Let's make your trip amazing.")}
              </p>

              {/* TWO PROMINENT ACTION BUTTONS as specified by the user */}
              <div className="mt-3.5 pt-2.5 border-t border-slate-100 grid grid-cols-2 gap-2">
                <button
                  id="welcome-start-planning-btn"
                  onClick={onStartPlanning}
                  className="py-2.5 px-3 bg-gradient-to-r from-blue-700 to-indigo-700 hover:from-blue-800 hover:to-indigo-800 text-white rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <Calendar className="w-3.5 h-3.5" />
                  <span>{t('welcome.startPlanning', 'Start Planning')}</span>
                </button>

                <button
                  id="welcome-chat-phoenix-btn"
                  onClick={onChatWithPhoenix}
                  className="py-2.5 px-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-slate-950 rounded-xl text-xs font-black shadow-xs flex items-center justify-center gap-1.5 active:scale-98 transition-all"
                >
                  <MessageSquareText className="w-3.5 h-3.5 text-slate-950" />
                  <span>{t('welcome.chatWithPhoenix', 'Chat with Phoenix')}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};
