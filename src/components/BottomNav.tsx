import React from 'react';
import { Home, Compass, MapPin, ShieldAlert, User } from 'lucide-react';
import { useTranslation } from '../context/TranslationContext';

export type NavTab = 'HOME' | 'EXPLORE' | 'MY_TRIP' | 'SAFETY' | 'PROFILE';

interface BottomNavProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  tripReadiness?: number;
  safetyAlertsCount?: number;
  onOpenBuddy?: () => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onTabChange,
  tripReadiness = 82,
  safetyAlertsCount = 1,
  onOpenBuddy,
}) => {
  const { t } = useTranslation();

  const tabs: { key: NavTab; label: string; icon: React.ComponentType<{ className?: string }>; badge?: string | number }[] = [
    { key: 'HOME', label: t('nav.home', 'Home'), icon: Home },
    { key: 'EXPLORE', label: t('nav.explore', 'Explore'), icon: Compass },
    {
      key: 'MY_TRIP',
      label: t('nav.myTrip', 'My Trip'),
      icon: MapPin,
      badge: tripReadiness ? `${tripReadiness}%` : undefined,
    },
    {
      key: 'SAFETY',
      label: t('nav.safety', 'Safety'),
      icon: ShieldAlert,
      badge: safetyAlertsCount > 0 ? safetyAlertsCount : undefined,
    },
    { key: 'PROFILE', label: t('nav.profile', 'Profile'), icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/80 shadow-lg safe-bottom max-w-md mx-auto"
      role="navigation"
      aria-label="Main Navigation"
    >
      <div className="flex items-center justify-around h-16 px-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          const Icon = tab.icon;

          return (
            <button
              key={tab.key}
              id={`nav-tab-${tab.key.toLowerCase()}`}
              onClick={() => onTabChange(tab.key)}
              className={`relative flex flex-col items-center justify-center flex-1 h-full min-h-[48px] min-w-[48px] transition-colors ${
                isActive ? 'text-blue-900 font-semibold' : 'text-slate-500 hover:text-slate-800'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active pill background indicator for Android Material 3 feel */}
              <div
                className={`relative px-4 py-1 rounded-full transition-all duration-200 ${
                  isActive ? 'bg-blue-100/90 text-blue-900' : 'bg-transparent'
                }`}
              >
                <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110' : ''}`} />
                {tab.badge && (
                  <span
                    className={`absolute -top-1 -right-2 text-[10px] font-bold px-1.5 py-0.2 rounded-full border border-white ${
                      tab.key === 'SAFETY'
                        ? 'bg-amber-600 text-white'
                        : 'bg-blue-700 text-white'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </div>

              <span className="text-[11px] mt-0.5 tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
