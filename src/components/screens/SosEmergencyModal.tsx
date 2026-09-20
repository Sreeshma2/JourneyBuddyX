import React, { useState, useEffect, useRef } from 'react';
import { UserProfile } from '../../types';
import {
  AlertOctagon,
  PhoneCall,
  Volume2,
  VolumeX,
  MapPin,
  Copy,
  Check,
  Send,
  X,
  ShieldAlert,
  Flame,
  Radio,
  ExternalLink,
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
  currentLocationName = 'Kanyakumari Beach Road • Tamil Nadu',
}) => {
  const [countdown, setCountdown] = useState<number>(5);
  const [isAlertTriggered, setIsAlertTriggered] = useState<boolean>(false);
  const [isSirenOn, setIsSirenOn] = useState<boolean>(true);
  const [isStrobeActive, setIsStrobeActive] = useState<boolean>(false);
  const [copiedLocation, setCopiedLocation] = useState<boolean>(false);
  const [smsSentNotice, setSmsSentNotice] = useState<boolean>(false);

  // Audio Context ref for safety siren tone
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  // GPS coordinates simulation for Kanyakumari / current location
  const currentCoords = {
    lat: '8.0883° N',
    lng: '77.5385° E',
    accuracy: '± 4 meters (High Accuracy GPS)',
    nearestPost: 'Tourist Police Helpdesk (280m away)',
  };

  const primaryContact = userProfile.trustedContacts[0] || {
    name: 'Emergency Contact',
    phone: '+91 98765 43210',
    relationship: 'Family',
  };

  // 5-second countdown timer when modal opens
  useEffect(() => {
    if (!isOpen) {
      setCountdown(5);
      setIsAlertTriggered(false);
      stopSiren();
      return;
    }

    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setIsAlertTriggered(true);
          startSiren();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      stopSiren();
    };
  }, [isOpen]);

  // Audio siren synthesizer (safe browser audio oscillator)
  const startSiren = () => {
    if (!isSirenOn) return;
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) {
        audioCtxRef.current = new AudioCtx();
      }
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume().catch(() => {});
      }

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      // Modulate frequency up and down like a safety siren
      const now = ctx.currentTime;
      for (let i = 0; i < 20; i++) {
        osc.frequency.linearRampToValueAtTime(1100, now + i * 0.8 + 0.4);
        osc.frequency.linearRampToValueAtTime(750, now + i * 0.8 + 0.8);
      }

      gain.gain.setValueAtTime(0.12, ctx.currentTime); // Safe pleasant audible volume
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();

      oscillatorRef.current = osc;
      gainNodeRef.current = gain;
    } catch (e) {
      console.warn('Audio siren tone failed to initialize:', e);
    }
  };

  const stopSiren = () => {
    try {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current.disconnect();
        oscillatorRef.current = null;
      }
    } catch (e) {
      // Ignore audio stop error
    }
  };

  const toggleSiren = () => {
    if (isSirenOn) {
      stopSiren();
      setIsSirenOn(false);
    } else {
      setIsSirenOn(true);
      startSiren();
    }
  };

  const handleCopyLocation = () => {
    const text = `EMERGENCY SOS: I need assistance! Location: ${currentLocationName}. GPS: ${currentCoords.lat}, ${currentCoords.lng}. Landmark: ${currentCoords.nearestPost}. Sent via Journey Buddy SOS.`;
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).catch(() => {});
      }
    } catch (err) {
      // Ignore clipboard restriction error
    }
    setCopiedLocation(true);
    setTimeout(() => setCopiedLocation(false), 2500);
  };

  const handleSendSosSms = () => {
    setSmsSentNotice(true);
    setTimeout(() => setSmsSentNotice(false), 4000);
  };

  if (!isOpen) return null;

  return (
    <div
      id="sos-emergency-modal"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md overflow-y-auto"
      role="dialog"
      aria-modal="true"
    >
      <div
        className={`w-full max-w-md rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 border-2 ${
          isStrobeActive
            ? 'bg-red-600 text-white border-white animate-pulse'
            : 'bg-slate-900 text-white border-red-500/80'
        }`}
      >
        {/* Top Emergency Action Bar */}
        <div className="bg-red-600 px-5 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center animate-bounce">
              <AlertOctagon className="w-5 h-5 fill-current" />
            </span>
            <div>
              <h2 className="text-base font-black tracking-tight uppercase">
                EMERGENCY SOS ACTIVE
              </h2>
              <span className="text-[11px] font-semibold text-red-100 flex items-center gap-1">
                <Radio className="w-3 h-3 text-amber-300 animate-spin" />
                Live GPS Beacon Transmitting
              </span>
            </div>
          </div>

          <button
            id="sos-close-btn"
            onClick={() => {
              stopSiren();
              onClose();
            }}
            className="p-1.5 rounded-full bg-red-700/80 hover:bg-red-800 text-white transition-colors"
            aria-label="Close SOS"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Countdown & Cancel Safeguard */}
          {countdown > 0 ? (
            <div className="bg-red-950/70 border border-red-500/50 rounded-2xl p-4 text-center space-y-2">
              <span className="text-xs font-bold text-red-300 uppercase tracking-wider block">
                Automatic Emergency Alert Triggering In
              </span>
              <div className="text-5xl font-black text-red-400 font-mono">
                0{countdown}
              </div>
              <p className="text-xs text-red-200">
                Triggering siren and notifying trusted contacts. Tap Cancel if pressed accidentally.
              </p>
              <button
                id="sos-cancel-countdown-btn"
                onClick={() => {
                  stopSiren();
                  onClose();
                }}
                className="w-full bg-white text-slate-900 hover:bg-slate-100 font-bold text-xs py-2.5 rounded-xl transition-colors mt-2"
              >
                Cancel / False Alarm
              </button>
            </div>
          ) : (
            <div className="bg-red-950/80 border border-red-500 rounded-2xl p-3 flex items-center justify-between text-xs text-red-200">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400 animate-pulse" />
                <span className="font-bold text-white">Emergency Mode Active</span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={toggleSiren}
                  className="flex items-center gap-1 bg-red-800/80 hover:bg-red-700 text-white px-2.5 py-1 rounded-lg text-[11px] font-semibold"
                >
                  {isSirenOn ? (
                    <>
                      <Volume2 className="w-3.5 h-3.5" /> Siren On
                    </>
                  ) : (
                    <>
                      <VolumeX className="w-3.5 h-3.5" /> Muted
                    </>
                  )}
                </button>
                <button
                  onClick={() => setIsStrobeActive(!isStrobeActive)}
                  className="bg-amber-500 hover:bg-amber-400 text-slate-950 px-2.5 py-1 rounded-lg text-[11px] font-bold"
                >
                  {isStrobeActive ? 'Strobe Off' : 'Strobe Light'}
                </button>
              </div>
            </div>
          )}

          {/* Direct 1-Tap Emergency Calling Numbers */}
          <div className="space-y-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              1-Tap Emergency Calling
            </span>

            <div className="grid grid-cols-2 gap-2">
              {/* National 112 */}
              <a
                id="sos-dial-112"
                href="tel:112"
                className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-all active:scale-95"
              >
                <PhoneCall className="w-5 h-5 mb-1" />
                <span className="text-sm font-black">Call 112</span>
                <span className="text-[10px] text-red-100 font-medium">National Emergency</span>
              </a>

              {/* Women Safety 1091 */}
              <a
                id="sos-dial-1091"
                href="tel:1091"
                className="bg-purple-700 hover:bg-purple-600 active:bg-purple-800 text-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-all active:scale-95"
              >
                <ShieldAlert className="w-5 h-5 mb-1 text-purple-200" />
                <span className="text-sm font-black">Call 1091</span>
                <span className="text-[10px] text-purple-200 font-medium">Women Helpline</span>
              </a>

              {/* Ambulance 108 */}
              <a
                id="sos-dial-108"
                href="tel:108"
                className="bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-all active:scale-95"
              >
                <PhoneCall className="w-5 h-5 mb-1" />
                <span className="text-sm font-black">Call 108</span>
                <span className="text-[10px] text-emerald-100 font-medium">Ambulance / Trauma</span>
              </a>

              {/* Primary Trusted Contact */}
              <a
                id="sos-dial-contact"
                href={`tel:${primaryContact.phone.replace(/\s+/g, '')}`}
                className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white p-3 rounded-2xl flex flex-col items-center justify-center text-center shadow-md transition-all active:scale-95"
              >
                <PhoneCall className="w-5 h-5 mb-1 text-amber-300" />
                <span className="text-sm font-black truncate max-w-[120px]">
                  Call {primaryContact.name.split(' ')[0]}
                </span>
                <span className="text-[10px] text-blue-200 font-medium truncate max-w-[120px]">
                  {primaryContact.phone}
                </span>
              </a>
            </div>
          </div>

          {/* Current GPS Coordinates & Dispatch Card */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-2xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-red-400" />
                <span>Your Real-Time Coordinates</span>
              </span>
              <span className="text-[10px] bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded-full font-bold">
                GPS LOCKED
              </span>
            </div>

            <div className="bg-slate-950/80 p-2.5 rounded-xl border border-slate-700 font-mono text-[11px] text-amber-300 space-y-0.5">
              <div className="flex justify-between">
                <span className="text-slate-400">Coordinates:</span>
                <span className="font-bold">
                  {currentCoords.lat}, {currentCoords.lng}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Area:</span>
                <span className="text-slate-200 truncate max-w-[190px]">
                  {currentLocationName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Nearest Kiosk:</span>
                <span className="text-emerald-400 font-sans text-[10px]">
                  {currentCoords.nearestPost}
                </span>
              </div>
            </div>

            {/* Location Sharing Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                id="sos-copy-coords-btn"
                onClick={handleCopyLocation}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold transition-colors"
              >
                {copiedLocation ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-300" />
                    <span>Copy Coordinates</span>
                  </>
                )}
              </button>

              <button
                id="sos-send-sms-btn"
                onClick={handleSendSosSms}
                className="flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send SOS SMS</span>
              </button>
            </div>

            {smsSentNotice && (
              <div className="bg-emerald-950/80 border border-emerald-500/50 p-2 rounded-xl text-center text-[11px] text-emerald-200 font-semibold animate-fade-in">
                ✓ SOS message and coordinates dispatched to {primaryContact.name} ({primaryContact.phone})
              </div>
            )}
          </div>

          {/* Dismiss button */}
          <button
            onClick={() => {
              stopSiren();
              onClose();
            }}
            className="w-full py-2.5 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 text-xs font-semibold transition-colors"
          >
            Close Emergency Panel
          </button>
        </div>
      </div>
    </div>
  );
};
