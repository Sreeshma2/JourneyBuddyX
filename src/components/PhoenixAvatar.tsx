import React from 'react';

interface PhoenixAvatarProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'hero';
  mood?: 'happy' | 'thinking' | 'alert' | 'curious' | 'calm' | 'speaking';
  withGlow?: boolean;
  className?: string;
  animate?: boolean;
}

export const PhoenixAvatar: React.FC<PhoenixAvatarProps> = ({
  size = 'md',
  mood = 'calm',
  withGlow = false,
  className = '',
  animate = true,
}) => {
  const sizeMap = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20',
    hero: 'w-28 h-28',
  };

  return (
    <div
      className={`relative inline-flex items-center justify-center select-none ${sizeMap[size]} ${className}`}
      role="img"
      aria-label={`Phoenix AI Travel Fox - ${mood} mood`}
    >
      {withGlow && (
        <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-md scale-110 pointer-events-none animate-pulse" />
      )}
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`w-full h-full drop-shadow-sm transition-transform duration-300 ${
          animate ? 'motion-safe:hover:scale-105 motion-safe:transition-transform' : ''
        }`}
      >
        <defs>
          {/* Deep blue body gradient */}
          <linearGradient id="phoenixBlue" x1="20" y1="10" x2="80" y2="90" gradientUnits="userSpaceOnUse">
            <stop stopColor="#1E3A8A" />
            <stop offset="0.6" stopColor="#0F2744" />
            <stop offset="1" stopColor="#0B1C33" />
          </linearGradient>

          {/* Warm orange accent gradient */}
          <linearGradient id="phoenixOrange" x1="30" y1="20" x2="70" y2="80" gradientUnits="userSpaceOnUse">
            <stop stopColor="#FB923C" />
            <stop offset="1" stopColor="#EA580C" />
          </linearGradient>

          {/* Compass badge glow */}
          <radialGradient id="compassGlow" cx="50" cy="50" r="50">
            <stop stopColor="#38BDF8" />
            <stop offset="0.7" stopColor="#0284C7" />
            <stop offset="1" stopColor="#0369A1" />
          </radialGradient>
        </defs>

        {/* Small modern travel backpack (behind body) */}
        <rect x="26" y="58" width="48" height="28" rx="10" fill="#1E293B" stroke="#334155" strokeWidth="2" />
        {/* Backpack pocket & straps */}
        <rect x="34" y="66" width="32" height="15" rx="5" fill="#334155" />
        <path d="M 33 60 L 33 78" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />
        <path d="M 67 60 L 67 78" stroke="#F97316" strokeWidth="2" strokeLinecap="round" />

        {/* Left Ear */}
        <path
          d="M 28 36 C 24 18 36 6 42 12 C 46 16 46 26 44 34 Z"
          fill="url(#phoenixBlue)"
        />
        {/* Left Inner Ear (warm orange) */}
        <path
          d="M 32 32 C 29 22 36 14 39 17 C 42 20 41 26 39 31 Z"
          fill="url(#phoenixOrange)"
        />

        {/* Right Ear */}
        <path
          d="M 72 36 C 76 18 64 6 58 12 C 54 16 54 26 56 34 Z"
          fill="url(#phoenixBlue)"
        />
        {/* Right Inner Ear (warm orange) */}
        <path
          d="M 68 32 C 71 22 64 14 61 17 C 58 20 59 26 61 31 Z"
          fill="url(#phoenixOrange)"
        />

        {/* Rounded Fox Head */}
        <ellipse cx="50" cy="42" rx="32" ry="26" fill="url(#phoenixBlue)" />

        {/* White Cheeks / Muzzle fluff */}
        <path
          d="M 20 44 C 20 56 32 64 50 64 C 68 64 80 56 80 44 C 74 46 68 45 62 43 C 55 41 45 41 38 43 C 32 45 26 46 20 44 Z"
          fill="#F8FAFC"
        />

        {/* Subtle warm orange cheek accents */}
        <circle cx="30" cy="48" r="3.5" fill="#FDBA74" opacity="0.6" />
        <circle cx="70" cy="48" r="3.5" fill="#FDBA74" opacity="0.6" />

        {/* Fox Eyes - Intelligent and friendly */}
        {mood === 'happy' || mood === 'speaking' ? (
          <>
            <path d="M 34 38 Q 38 33 42 38" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
            <path d="M 58 38 Q 62 33 66 38" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : mood === 'thinking' ? (
          <>
            <circle cx="38" cy="37" r="3" fill="#0F172A" />
            <path d="M 58 35 Q 63 35 66 38" stroke="#0F172A" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          </>
        ) : (
          <>
            {/* Left eye with smart glint */}
            <circle cx="37" cy="38" r="3.5" fill="#0F172A" />
            <circle cx="36" cy="36.5" r="1.2" fill="#FFFFFF" />

            {/* Right eye with smart glint */}
            <circle cx="63" cy="38" r="3.5" fill="#0F172A" />
            <circle cx="62" cy="36.5" r="1.2" fill="#FFFFFF" />
          </>
        )}

        {/* Fox Nose */}
        <path d="M 47 46 Q 50 49 53 46 Q 50 44 47 46 Z" fill="#0F172A" />

        {/* Friendly smile or speaking mouth */}
        {mood === 'speaking' ? (
          <ellipse cx="50" cy="52" rx="3.5" ry="2.5" fill="#DC2626" />
        ) : (
          <path d="M 47 50 Q 50 53 53 50" stroke="#0F172A" strokeWidth="1.5" strokeLinecap="round" fill="none" />
        )}

        {/* Chest / Body white collar */}
        <path
          d="M 36 62 C 40 72 60 72 64 62 C 60 66 40 66 36 62 Z"
          fill="#FFFFFF"
        />

        {/* Glowing Compass Badge at chest center */}
        <circle cx="50" cy="74" r="8.5" fill="url(#compassGlow)" stroke="#FFFFFF" strokeWidth="1.5" />
        {/* Compass 4-point star */}
        <path
          d="M 50 68 L 52 73 L 57 74 L 52 75 L 50 80 L 48 75 L 43 74 L 48 73 Z"
          fill="#FFFFFF"
        />
        <circle cx="50" cy="74" r="1.5" fill="#F59E0B" />
      </svg>
    </div>
  );
};
