import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Bell,
  CheckCheck,
  AlertTriangle,
  Users,
  CloudRain,
  Ticket,
  Shield,
  ChevronRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { ContextNotification } from '../types';

interface ContextNotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onActionClick?: (actionKey: string) => void;
  onUnreadCountChange?: (count: number) => void;
}

const NOTIFICATION_ICONS: Record<string, { icon: any; color: string; bg: string }> = {
  TICKET: { icon: Ticket, color: 'text-purple-600', bg: 'bg-purple-100' },
  CROWD: { icon: Users, color: 'text-amber-600', bg: 'bg-amber-100' },
  WEATHER: { icon: CloudRain, color: 'text-blue-600', bg: 'bg-blue-100' },
  HAZARD: { icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-100' },
  SAFETY: { icon: Shield, color: 'text-emerald-600', bg: 'bg-emerald-100' },
};

export const ContextNotificationDrawer: React.FC<ContextNotificationDrawerProps> = ({
  isOpen,
  onClose,
  onActionClick,
  onUnreadCountChange,
}) => {
  const [notifications, setNotifications] = useState<ContextNotification[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchNotifications();
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await fetch('/api/notifications');
      if (res.ok) {
        const data = await res.json();
        const list = data.notifications || [];
        setNotifications(list);
        if (onUnreadCountChange) {
          onUnreadCountChange(list.filter((n: ContextNotification) => !n.isRead).length);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch notifications:', err);
    }
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => {
      const next = prev.map((n) => (n.id === id ? { ...n, isRead: true } : n));
      if (onUnreadCountChange) {
        onUnreadCountChange(next.filter((n) => !n.isRead).length);
      }
      return next;
    });
  };

  const markAllAsRead = () => {
    setNotifications((prev) => {
      const next = prev.map((n) => ({ ...n, isRead: true }));
      if (onUnreadCountChange) {
        onUnreadCountChange(0);
      }
      return next;
    });
  };

  if (!isOpen) return null;

  const filtered = notifications.filter((n) =>
    activeFilter === 'ALL' ? true : n.type === activeFilter
  );

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 280 }}
        className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col overflow-hidden"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center">
                <Bell className="w-5 h-5 text-amber-400" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-xs">
                  {unreadCount}
                </span>
              )}
            </div>
            <div>
              <h2 className="font-extrabold text-base">Proactive Alerts</h2>
              <p className="text-xs text-slate-300">Live crowds, weather, hazard & ticket updates</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Filter Chips & Mark Read */}
        <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2 bg-slate-50">
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 text-xs">
            {['ALL', 'TICKET', 'CROWD', 'WEATHER', 'HAZARD'].map((f) => (
              <button
                key={f}
                onClick={() => setActiveFilter(f)}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  activeFilter === f
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {f === 'ALL' ? 'All' : f.charAt(0) + f.slice(1).toLowerCase()}
              </button>
            ))}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 shrink-0"
            >
              <CheckCheck className="w-3.5 h-3.5" /> Mark read
            </button>
          )}
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-slate-400 text-xs">
              No notifications in this category right now.
            </div>
          ) : (
            filtered.map((item) => {
              const cfg = NOTIFICATION_ICONS[item.type] || NOTIFICATION_ICONS.SAFETY;
              const Icon = cfg.icon;
              return (
                <div
                  key={item.id}
                  onClick={() => markAsRead(item.id)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                    item.isRead
                      ? 'bg-white border-slate-200'
                      : 'bg-indigo-50/40 border-indigo-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl ${cfg.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                      <Icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-wider ${cfg.color}`}>
                          {item.type}
                        </span>
                        <span className="text-[10px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> {item.timestamp}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-900 leading-snug">
                        {item.title}
                      </h4>

                      <p className="text-xs text-slate-600 leading-relaxed mt-1">
                        {item.message}
                      </p>

                      {item.actionLabel && (
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              markAsRead(item.id);
                              if (onActionClick && item.actionKey) {
                                onActionClick(item.actionKey);
                                onClose();
                              }
                            }}
                            className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 active:scale-95"
                          >
                            <span>{item.actionLabel}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>

                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-indigo-600" />
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 font-medium">
          🔔 Journey Buddy proactively alerts you before unexpected delays or crowds
        </div>
      </motion.div>
    </div>
  );
};
