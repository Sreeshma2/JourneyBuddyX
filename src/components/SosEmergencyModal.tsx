import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';
import {
  AlertOctagon,
  PhoneCall,
  MapPin,
  Share2,
  X,
  Volume2,
  VolumeX,
  ShieldAlert,
  CheckCircle2,
  Radio,
  Copy,
  Check,
} from 'lucide-react';

interface SosEmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
  currentLocationName?: string;
}

export const SosEmergencyModal: React.FC<SosEmergencyModalProps> = ({
  isOpen,
  onClose,
  userProfile,
  currentLocationName = 'Kanyakumari, Tamil Nadu (Cape Comorin)',
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isCountingDown, setIsCountingDown] = useState<boolean>(true);
  const [sosActive, setSosActive] = useState<boolean>(false);
  const [sirenAudible, setSirenAudible] = useState<boolean>(false);
  const [hasDispatchedSMS, setHasDispatchedSMS] = useState<boolean>(false);
  const [copiedCoords, setCopiedCoords] = useState<boolean>(false);

  const emergencyCoordinates = '8.0883° N, 77.5385° E (Accuracy: ±4m)';

  // Countdown timer when opened
  useEffect(() => {
    let timer: any;
    if (isOpen && isCountingDown && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isOpen && isCountingDown && countdown === 0) {
      setIsCountingDown(false);
      setSosActive(true);
      setHasDispatchedSMS(true);
    }

    return () => clearTimeout(timer);
  }, [isOpen, isCountingDown, countdown]);

  // Reset states when closed
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsCountingDown(true);
      setSosActive(false);
      setSirenAudible(false);
      setHasDispatchedSMS(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleInstantTrigger = () => {
    setIsCountingDown(false);
    setSosActive(true);
    setHasDispatchedSMS(true);
  };

  const handleCancelCountdown = () => {
    setIsCountingDown(false);
    onClose();
  };

  const handleCopyCoords = () => {
    navigator.clipboard?.writeText?.(emergencyCoordinates);
    setCopiedCoords(true);
    setTimeout(() => setCopiedCoords(false), 2000);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="sos-modal-title"
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border-2 border-rose-500 text-slate-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Urgent Red Strobe Header */}
        <div className="bg-rose-600 text-white p-5 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600 via-red-600 to-rose-700 animate-pulse opacity-40" />

          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-rose-100 hover:text-white p-1.5 rounded-full bg-black/20 hover:bg-black/30 z-10"
            aria-label="Close SOS"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="relative z-10 flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white text-rose-600 flex items-center justify-center shadow-lg animate-bounce">
              <AlertOctagon className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-rose-200 bg-black/20 px-2 py-0.5 rounded">
                EMERGENCY LIFELINE
              </span>
              <h3 id="sos-modal-title" className="text-xl font-black text-white leading-tight">
                {isCountingDown ? 'SOS Activating...' : 'SOS DISTRESS ACTIVE'}
              </h3>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Active Countdown Stage */}
          {isCountingDown ? (
            <div className="text-center py-3 space-y-3">
              <div className="w-20 h-20 rounded-full border-4 border-rose-500 border-t-transparent animate-spin mx-auto flex items-center justify-center">
                <span className="text-3xl font-black text-rose-600">{countdown}</span>
              </div>
              <p className="text-xs text-slate-600 max-w-[260px] mx-auto font-medium">
                Broadcasting emergency beacon & coordinates to trusted circle in{' '}
                <span className="font-bold text-rose-600">{countdown} seconds</span>.
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={handleCancelCountdown}
                  className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs py-3 rounded-xl border border-slate-300"
                >
                  Cancel (False Alarm)
                </button>
                <button
                  onClick={handleInstantTrigger}
                  className="flex-1 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs py-3 rounded-xl shadow-md active:scale-95"
                >
                  Trigger Now!
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* SOS Activated confirmation badge */}
              <div className="bg-rose-50 border border-rose-200 rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black text-rose-900 flex items-center gap-1.5">
                    <Radio className="w-4 h-4 text-rose-600 animate-pulse" />
                    LIVE DISTRESS BEACON ACTIVE
                  </span>
                  <span className="text-[10px] bg-rose-600 text-white font-bold px-2 py-0.5 rounded-full">
                    TRANSMITTING
                  </span>
                </div>
                <p className="text-[11px] text-rose-800 leading-snug">
                  Emergency alert dispatched to {userProfile.trustedContacts.length} trusted contacts with live tracking link.
                </p>
              </div>

              {/* Exact Emergency Coordinates Card */}
              <div className="bg-slate-900 text-white rounded-2xl p-3.5 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-rose-400" />
                    Current GPS Pin
                  </span>
                  <button
                    onClick={handleCopyCoords}
                    className="text-[11px] text-blue-300 hover:text-white flex items-center gap-1"
                  >
                    {copiedCoords ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedCoords ? 'Copied' : 'Copy GPS'}</span>
                  </button>
                </div>
                <div className="font-mono text-sm font-bold text-emerald-400">
                  {emergencyCoordinates}
                </div>
                <p className="text-[10px] text-slate-400 truncate">
                  Near: {currentLocationName}
                </p>
              </div>

              {/* Instant Call 112 & Helplines */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                  1-Tap Emergency Response
                </span>

                <a
                  href="tel:112"
                  className="w-full bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-sm py-3.5 px-4 rounded-xl flex items-center justify-between shadow-lg shadow-rose-600/30 transition-transform active:scale-[0.98]"
                >
                  <div className="flex items-center gap-2">
                    <PhoneCall className="w-5 h-5" />
                    <span>Call National Emergency (112)</span>
                  </div>
                  <span className="text-xs bg-rose-800/80 px-2.5 py-1 rounded-lg">Instant</span>
                </a>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <a
                    href="tel:100"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold p-2.5 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <span>Police: 100</span>
                    <PhoneCall className="w-3.5 h-3.5 text-blue-700" />
                  </a>
                  <a
                    href="tel:108"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold p-2.5 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <span>Ambulance: 108</span>
                    <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                  </a>
                  <a
                    href="tel:1091"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold p-2.5 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <span>Women Helpline: 1091</span>
                    <PhoneCall className="w-3.5 h-3.5 text-purple-700" />
                  </a>
                  <a
                    href="tel:1363"
                    className="bg-slate-100 hover:bg-slate-200 text-slate-900 font-bold p-2.5 rounded-xl border border-slate-200 flex items-center justify-between"
                  >
                    <span>Tourist Helpline: 1363</span>
                    <PhoneCall className="w-3.5 h-3.5 text-emerald-700" />
                  </a>
                </div>
              </div>

              {/* Siren & Audio alert */}
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <div className="flex items-center gap-2">
                  {sirenAudible ? (
                    <Volume2 className="w-4 h-4 text-rose-600 animate-pulse" />
                  ) : (
                    <VolumeX className="w-4 h-4 text-slate-400" />
                  )}
                  <span className="font-semibold text-slate-800">
                    Audible Safety Beacon Siren
                  </span>
                </div>
                <button
                  onClick={() => setSirenAudible(!sirenAudible)}
                  className={`px-3 py-1 rounded-full font-bold text-[11px] ${
                    sirenAudible ? 'bg-rose-600 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {sirenAudible ? 'Siren On' : 'Silent'}
                </button>
              </div>

              {/* Medical Information Snapshot */}
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-950">Medical Snapshot (For Responders)</span>
                  <span className="text-[10px] bg-blue-200 text-blue-900 font-bold px-1.5 py-0.5 rounded">
                    Blood: O+
                  </span>
                </div>
                <p className="text-[11px] text-blue-800">
                  Carrier: {userProfile.name} • Known Allergies: None recorded • Primary Contact: {userProfile.emergencyPhone}
                </p>
              </div>
            </>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500">
            {sosActive ? 'Alert will keep broadcasting' : 'Protected by Phoenix Safety'}
          </span>
          <button
            onClick={onClose}
            className="text-xs font-bold text-slate-700 hover:text-slate-900 px-4 py-2 rounded-xl bg-white border border-slate-300"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
};
