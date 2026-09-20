import React from 'react';

interface JourneyBuddyLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl' | 'hero';
  className?: string;
  withText?: boolean;
  textDark?: boolean;
  variant?: 'auto' | 'dark' | 'white' | 'transparent';
}

export const JourneyBuddyLogo: React.FC<JourneyBuddyLogoProps> = ({
  size = 'md',
  className = '',
  withText = false,
  textDark = false,
  variant = 'auto',
}) => {
  const sizeClasses = {
    xs: 'w-6 h-6',
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
    hero: 'w-44 h-44',
  }[size];

  // Determine logo source based on variant
  let logoSrc = '/logo.svg';
  if (variant === 'dark') {
    logoSrc = '/logo-dark.svg';
  } else if (variant === 'white') {
    logoSrc = '/logo-white.svg';
  }

  return (
    <div className={`inline-flex items-center gap-2.5 ${className}`}>
      <div
        className={`relative rounded-2xl overflow-hidden shrink-0 transition-transform duration-300 ${sizeClasses} ${
          variant === 'dark'
            ? 'bg-black shadow-lg shadow-blue-950/20 ring-1 ring-white/10'
            : variant === 'white'
            ? 'bg-white shadow-md ring-1 ring-slate-200/80'
            : 'drop-shadow-md'
        }`}
      >
        <img
          src={logoSrc}
          alt="Journey Buddy Official Logo"
          className="w-full h-full object-contain"
        />
      </div>
      {withText && (
        <div className="flex flex-col leading-tight">
          <span
            className={`font-extrabold tracking-tight text-base ${
              textDark ? 'text-white' : 'text-slate-900'
            }`}
          >
            Journey<span className="text-orange-500">Buddy</span>
          </span>
          <span
            className={`text-[10px] font-bold tracking-wider uppercase ${
              textDark ? 'text-slate-400' : 'text-slate-500'
            }`}
          >
            Smart & Safe Travel
          </span>
        </div>
      )}
    </div>
  );
};
