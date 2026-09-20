import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Ticket,
  Languages,
  AlertTriangle,
  Database,
  Bell,
  Shield,
  Compass,
  BatteryCharging,
  WifiOff,
  PhoneCall,
  ChevronRight,
} from 'lucide-react';
import { JourneyBuddyLogo } from './JourneyBuddyLogo';

interface FunctionalMenuBarProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenTicketWallet: () => void;
  onOpenTranslator: () => void;
  onOpenHazards: () => void;
  onOpenGovRegistry: () => void;
  onOpenNotifications: () => void;
  onOpenSafetyCentre: () => void;
  onOpenPlanner: () => void;
  isLowPowerMode?: boolean;
  onToggleLowPowerMode?: () => void;
  unreadNotificationsCount?: number;
}

export const FunctionalMenuBar: React.FC<FunctionalMenuBarProps> = ({
  isOpen,
  onClose,
  onOpenTicketWallet,
  onOpenTranslator,
  onOpenHazards,
  onOpenGovRegistry,
  onOpenNotifications,
  onOpenSafetyCentre,
  onOpenPlanner,
  isLowPowerMode = false,
  onToggleLowPowerMode,
  unreadNotificationsCount = 0,
}) => {
  if (!isOpen) return null;

  const menuItems = [
    {
      id: 'tickets',
      label: 'Ticket Wallet & E-Passes',
      subtitle: 'Stored monument passes & turnstile QR codes',
      icon: Ticket,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      onClick: () => {
        onClose();
        onOpenTicketWallet();
      },
      badge: 'Active Passes',
    },
    {
      id: 'translator',
      label: 'Universal Audio & Text Translator',
      subtitle: 'Any language to any language • Voice mic & speaker',
      icon: Languages,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      onClick: () => {
        onClose();
        onOpenTranslator();
      },
      badge: 'Voice AI',
    },
    {
      id: 'hazards',
      label: 'Community Hazard Pins (Mini Waze)',
      subtitle: 'Drop road blocked, scam, or unsafe area pins',
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      onClick: () => {
        onClose();
        onOpenHazards();
      },
      badge: 'Live Waze',
    },
    {
      id: 'notifications',
      label: 'Proactive Contextual Alerts',
      subtitle: 'Crowds, rain expected, approaching ticket times',
      icon: Bell,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      onClick: () => {
        onClose();
        onOpenNotifications();
      },
      badge: unreadNotificationsCount > 0 ? `${unreadNotificationsCount} New` : undefined,
    },
    {
      id: 'gov_registry',
      label: 'Government & Legal Data Registry',
      subtitle: 'ASI gazette tariffs, MoRTH traffic & police datasets',
      icon: Database,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      onClick: () => {
        onClose();
        onOpenGovRegistry();
      },
      badge: 'Verified',
    },
    {
      id: 'safety',
      label: 'Emergency SOS & Safety Centre',
      subtitle: 'One-tap 112, tourist police, nearby verified hospitals',
      icon: Shield,
      color: 'text-red-600',
      bg: 'bg-red-50',
      onClick: () => {
        onClose();
        onOpenSafetyCentre();
      },
      badge: '24/7 Lifeline',
    },
    {
      id: 'planner',
      label: 'Trip Itinerary & Budget Manager',
      subtitle: 'Timeline, expense tracker & offline export',
      icon: Compass,
      color: 'text-cyan-600',
      bg: 'bg-cyan-50',
      onClick: () => {
        onClose();
        onOpenPlanner();
      },
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-start">
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="bg-white w-full max-w-sm h-full shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header with App Logo */}
        <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white px-5 py-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <JourneyBuddyLogo size="sm" variant="white" />
            <div>
              <h3 className="font-extrabold text-sm tracking-tight">Journey Buddy</h3>
              <span className="text-[10px] text-slate-400 font-semibold block">
                Official Travel Companion
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Menu Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block mb-1">
            CORE TRAVEL MODULES
          </span>

          {menuItems.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.id}
                onClick={item.onClick}
                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-9 h-9 rounded-xl ${item.bg} flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}
                  >
                    <Icon className={`w-4 h-4 ${item.color}`} />
                  </div>
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 truncate">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{item.subtitle}</p>
                  </div>
                </div>

                <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors shrink-0 ml-1" />
              </div>
            );
          })}

          {/* Device Controls */}
          <div className="pt-3 mt-3 border-t border-slate-100 space-y-2">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-2 block">
              Device & Offline Optimization
            </span>

            {onToggleLowPowerMode && (
              <div
                onClick={onToggleLowPowerMode}
                className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors"
              >
                <div className="flex items-center gap-2.5">
                  <BatteryCharging
                    className={`w-4 h-4 ${isLowPowerMode ? 'text-emerald-600' : 'text-slate-500'}`}
                  />
                  <div>
                    <p className="text-xs font-bold text-slate-800">Low Battery Mode</p>
                    <p className="text-[10px] text-slate-500">Halts heavy renders to preserve battery</p>
                  </div>
                </div>
                <div
                  className={`w-8 h-4 rounded-full transition-colors relative ${
                    isLowPowerMode ? 'bg-emerald-600' : 'bg-slate-300'
                  }`}
                >
                  <div
                    className={`w-3.5 h-3.5 rounded-full bg-white absolute top-0.25 transition-transform ${
                      isLowPowerMode ? 'translate-x-4' : 'translate-x-0.5'
                    }`}
                  />
                </div>
              </div>
            )}

            <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50">
              <div className="flex items-center gap-2.5">
                <WifiOff className="w-4 h-4 text-slate-500" />
                <div>
                  <p className="text-xs font-bold text-slate-800">Offline Maps & Safety</p>
                  <p className="text-[10px] text-emerald-600 font-semibold">Cached & Ready (No data needed)</p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                Cached
              </span>
            </div>
          </div>
        </div>

        {/* Footer Emergency helpline */}
        <div className="p-4 bg-slate-900 text-white border-t border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-4 h-4 text-rose-400" />
            <div>
              <p className="text-xs font-bold">Tourist Emergency</p>
              <p className="text-[10px] text-slate-400">Universal NERS Dial: 112</p>
            </div>
          </div>
          <a
            href="tel:112"
            className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl shadow-xs"
          >
            Call 112
          </a>
        </div>
      </motion.div>
    </div>
  );
};
