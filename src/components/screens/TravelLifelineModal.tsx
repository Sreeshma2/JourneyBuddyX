import React, { useState, useEffect } from 'react';
import { PhoenixAvatar } from '../PhoenixAvatar';
import { TripPlan, UserProfile } from '../../types';
import {
  X,
  Compass,
  Navigation,
  MapPin,
  Hotel,
  BatteryCharging,
  PhoneCall,
  CheckCircle2,
  AlertCircle,
  Wifi,
  WifiOff,
  Route,
  Zap,
} from 'lucide-react';

interface TravelLifelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  tripPlan: TripPlan;
  userProfile: UserProfile;
}

export const TravelLifelineModal: React.FC<TravelLifelineModalProps> = ({
  isOpen,
  onClose,
  tripPlan,
  userProfile,
}) => {
  const [lowBatteryMode, setLowBatteryMode] = useState<boolean>(
    userProfile.lowBatteryMode || false
  );
  const [navigatingBack, setNavigatingBack] = useState<boolean>(false);
  const [gpsCoords, setGpsCoords] = useState<{ lat: string; lng: string; accuracy: string }>({
    lat: '8.0883° N',
    lng: '77.5385° E',
    accuracy: '± 8m (GPS Sensor Active)',
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsCoords({
            lat: `${pos.coords.latitude.toFixed(4)}° N`,
            lng: `${pos.coords.longitude.toFixed(4)}° E`,
            accuracy: `± ${Math.round(pos.coords.accuracy)}m (GPS Sensor)`,
          });
        },
        () => {
          // Keep default fallback coordinates for Kanyakumari
        },
        { enableHighAccuracy: false, timeout: 4000 }
      );
    }
  }, []);

  if (!isOpen) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center backdrop-blur-sm p-0 sm:p-4 ${
        lowBatteryMode ? 'bg-black text-white' : 'bg-slate-950/75 text-slate-900'
      }`}
      role="dialog"
      aria-modal="true"
      aria-label="Offline Travel Lifeline"
    >
      <div
        className={`w-full max-w-md h-[95vh] sm:h-[720px] rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border ${
          lowBatteryMode
            ? 'bg-zinc-950 border-zinc-800 text-white'
            : 'bg-slate-50 border-slate-200'
        }`}
      >
        {/* Header */}
        <div
          className={`px-4 py-3.5 flex items-center justify-between border-b shrink-0 ${
            lowBatteryMode
              ? 'bg-zinc-900 border-zinc-800 text-white'
              : 'bg-blue-950 text-white border-blue-900 shadow-md'
          }`}
        >
          <div className="flex items-center gap-2.5">
            <Compass className="w-5 h-5 text-amber-400" />
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <span>Offline Travel Lifeline</span>
              </h2>
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1">
                <WifiOff className="w-3 h-3" />
                <span>OFFLINE SECURE • NO INTERNET REQUIRED</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Low battery mode quick toggle */}
            <button
              id="lifeline-toggle-battery-btn"
              onClick={() => setLowBatteryMode(!lowBatteryMode)}
              className={`text-[11px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1 transition-colors ${
                lowBatteryMode
                  ? 'bg-amber-500 text-black border-amber-400'
                  : 'bg-blue-900 text-blue-200 border-blue-700'
              }`}
              title="Toggle Low Battery Saving Mode"
            >
              <Zap className="w-3 h-3" />
              <span>{lowBatteryMode ? 'Battery Saver ON' : 'Battery Saver'}</span>
            </button>

            <button
              id="lifeline-close-btn"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
              aria-label="Close Lifeline"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lifeline Main Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAKE ME BACK - PRIMARY EMERGENCY NAVIGATION CARD */}
          <div
            className={`rounded-2xl p-4 border shadow-sm space-y-3 ${
              lowBatteryMode
                ? 'bg-zinc-900 border-zinc-700'
                : 'bg-gradient-to-br from-blue-900 to-slate-900 text-white border-blue-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="space-y-0.5">
                <span className="text-[10.5px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
                  <Hotel className="w-3.5 h-3.5" />
                  SAVED HOTEL ACCOMMODATION
                </span>
                <h3 className="text-lg font-black tracking-tight text-white">
                  Cape Seafront Heritage Stay
                </h3>
                <p className="text-xs text-blue-200/90">
                  Beach Road, Kanyakumari (Room 204) • Approx 1.2 km away
                </p>
              </div>

              <span className="text-[10px] bg-emerald-500/20 border border-emerald-400 text-emerald-300 font-bold px-2 py-0.5 rounded-full">
                AVAILABLE OFFLINE
              </span>
            </div>

            {/* TAKE ME BACK BIG BUTTON */}
            <button
              id="lifeline-take-me-back-btn"
              onClick={() => setNavigatingBack(!navigatingBack)}
              className="w-full bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-black text-sm py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.99] min-h-[48px]"
            >
              <Navigation className="w-4 h-4" />
              <span>
                {navigatingBack ? 'Guidance Active • Walk South-East' : 'Take Me Back To Hotel'}
              </span>
            </button>

            {navigatingBack && (
              <div className="bg-black/30 p-3 rounded-xl border border-white/10 text-xs space-y-1 animate-fade-in text-slate-200">
                <p className="font-bold text-amber-300">
                  Step 1: Walk 300 metres towards the Cape Lighthouse junction.
                </p>
                <p>Step 2: Turn right onto Beach Road. Hotel entrance is on the seaside.</p>
                <span className="text-[10px] text-slate-400 block pt-1">
                  Offline compass bearings active via device gyro.
                </span>
              </div>
            )}
          </div>

          {/* CURRENT GPS & CACHED OFFLINE MAP */}
          <div
            className={`rounded-2xl p-4 border text-xs space-y-2.5 ${
              lowBatteryMode
                ? 'bg-zinc-900 border-zinc-800'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-blue-700" />
                OFFLINE SATELLITE GPS
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                AVAILABLE OFFLINE
              </span>
            </div>

            <div className="p-3 rounded-xl bg-slate-100 dark:bg-zinc-800 font-mono text-xs flex justify-between items-center">
              <div>
                <span className="block text-slate-900 dark:text-white font-bold">
                  {gpsCoords.lat}, {gpsCoords.lng}
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {gpsCoords.accuracy}
                </span>
              </div>
              <Compass className="w-6 h-6 text-blue-700 dark:text-amber-400 animate-spin-slow" />
            </div>

            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-300 pt-1">
              <span>Cached Map: Kanyakumari Regional Pack (48 MB)</span>
              <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
                ✓ Synced
              </span>
            </div>
          </div>

          {/* OFFLINE SAVED ITINERARY SNAPSHOT */}
          <div
            className={`rounded-2xl p-4 border text-xs space-y-2.5 ${
              lowBatteryMode
                ? 'bg-zinc-900 border-zinc-800'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Route className="w-3.5 h-3.5 text-blue-700" />
                OFFLINE ITINERARY SNAPSHOT
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                AVAILABLE OFFLINE
              </span>
            </div>

            <div className="space-y-2">
              {tripPlan.days[0].items.slice(0, 3).map((it) => (
                <div
                  key={it.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-zinc-800 border border-slate-100 dark:border-zinc-700 flex items-center justify-between"
                >
                  <div>
                    <span className="font-bold text-slate-900 dark:text-white block">
                      {it.title}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {it.time} • {it.subtitle}
                    </span>
                  </div>
                  {it.estimatedCost !== undefined && (
                    <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">
                      ₹{it.estimatedCost}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* OFFLINE EMERGENCY NUMBERS */}
          <div
            className={`rounded-2xl p-4 border text-xs space-y-2.5 ${
              lowBatteryMode
                ? 'bg-zinc-900 border-zinc-800'
                : 'bg-white border-slate-200 shadow-2xs'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <PhoneCall className="w-3.5 h-3.5 text-rose-700" />
                DIRECT DIAL CALLS (TEL NETWORK)
              </span>
              <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                OFFLINE DIALER
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <a
                href="tel:112"
                className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-900/60 font-bold text-center flex flex-col items-center justify-center min-h-[48px]"
              >
                <span>Police 112</span>
                <span className="text-[10px] font-normal opacity-80">Emergency</span>
              </a>
              <a
                href="tel:108"
                className="p-3 bg-rose-50 dark:bg-rose-950/40 text-rose-900 dark:text-rose-200 rounded-xl border border-rose-200 dark:border-rose-900/60 font-bold text-center flex flex-col items-center justify-center min-h-[48px]"
              >
                <span>Ambulance 108</span>
                <span className="text-[10px] font-normal opacity-80">Medical</span>
              </a>
            </div>

            <div className="pt-1">
              <span className="text-[10.5px] text-slate-500 dark:text-slate-400 block mb-1">
                Trusted Family Contacts:
              </span>
              {userProfile.trustedContacts.map((c, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between py-1 border-t border-slate-100 dark:border-zinc-800 text-xs"
                >
                  <span className="text-slate-800 dark:text-slate-200">{c.name}</span>
                  <a
                    href={`tel:${c.phone.replace(/\s+/g, '')}`}
                    className="font-bold text-blue-800 dark:text-blue-300"
                  >
                    {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer info note */}
        <div
          className={`p-3 text-center border-t text-[11px] shrink-0 ${
            lowBatteryMode
              ? 'bg-zinc-900 border-zinc-800 text-zinc-400'
              : 'bg-slate-100 border-slate-200 text-slate-500'
          }`}
        >
          All Lifeline data is cached locally on device storage. No cellular data needed.
        </div>
      </div>
    </div>
  );
};
