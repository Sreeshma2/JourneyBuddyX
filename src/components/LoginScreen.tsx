import React, { useState } from 'react';
import { UserProfile } from '../types';
import { PhoenixAvatar } from './PhoenixAvatar';
import { JourneyBuddyLogo } from './JourneyBuddyLogo';
import { Shield, ArrowRight, Lock, User, Phone, CheckCircle2, Globe } from 'lucide-react';

interface LoginScreenProps {
  onLoginSuccess: (profile: UserProfile) => void;
  defaultProfile: UserProfile;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLoginSuccess, defaultProfile }) => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState(defaultProfile.name || 'Sreeshma');
  const [phone, setPhone] = useState(defaultProfile.emergencyPhone || '+91 98765 43210');
  const [email, setEmail] = useState('sreeshma.traveller@journeybuddy.io');
  const [password, setPassword] = useState('••••••••');
  const [rememberMe, setRememberMe] = useState(true);
  const [quickLoginRole, setQuickLoginRole] = useState<'solo' | 'family' | 'budget'>('solo');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const updatedProfile: UserProfile = {
      ...defaultProfile,
      name: name.trim() || 'Traveller',
      emergencyPhone: phone.trim() || '+91 98765 43210',
    };
    onLoginSuccess(updatedProfile);
  };

  const handleQuickDemo = (demoName: string, demoPhone: string) => {
    setName(demoName);
    setPhone(demoPhone);
    onLoginSuccess({
      ...defaultProfile,
      name: demoName,
      emergencyPhone: demoPhone,
    });
  };

  return (
    <div
      id="login-screen"
      className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between p-6 relative overflow-hidden"
    >
      {/* Ambient background glow */}
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Header with Official Logo */}
      <div className="pt-4 flex flex-col items-center text-center z-10">
        <div className="relative mb-2">
          <JourneyBuddyLogo size="xl" variant="dark" className="drop-shadow-xl" />
        </div>

        <span className="text-[11px] font-bold uppercase tracking-widest text-amber-400 bg-amber-500/10 px-3 py-0.5 rounded-full border border-amber-400/20 mb-1.5">
          Journey Buddy AI
        </span>
        <h1 className="text-2xl font-black text-white tracking-tight">
          Welcome to Journey Buddy
        </h1>
        <p className="text-xs text-slate-400 max-w-[280px] mt-1 leading-relaxed">
          Intelligent last-mile transit, verified local transport, and live safety lifelines.
        </p>
      </div>

      {/* Main Login Card */}
      <div className="bg-slate-800/80 backdrop-blur-md p-6 rounded-3xl border border-slate-700/80 shadow-2xl z-10 my-4">
        {/* Tab switch */}
        <div className="flex bg-slate-900/80 p-1 rounded-xl mb-5 border border-slate-700/50">
          <button
            type="button"
            onClick={() => setIsRegistering(false)}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
              !isRegistering
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => setIsRegistering(true)}
            className={`flex-1 text-xs font-semibold py-2 rounded-lg transition-all ${
              isRegistering
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            New Account
          </button>
        </div>

        <form onSubmit={handleLogin} className="space-y-3.5">
          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-400" />
              Traveller Name
            </label>
            <input
              id="login-name-input"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Sreeshma"
              required
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Emergency Phone Number (for SOS)
            </label>
            <input
              id="login-phone-input"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98765 43210"
              required
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              Security PIN / Password
            </label>
            <input
              id="login-password-input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-[11px] text-slate-400">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-slate-700 bg-slate-900 text-blue-600 focus:ring-0 w-3.5 h-3.5"
              />
              Keep safety session active
            </label>
            <span className="text-[11px] text-blue-400 hover:underline cursor-pointer">
              Offline Mode Ready
            </span>
          </div>

          <button
            id="login-submit-btn"
            type="submit"
            className="w-full mt-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs py-3.5 px-4 rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-blue-600/30 transition-all active:scale-[0.98] min-h-[46px]"
          >
            <span>{isRegistering ? 'Create Travel Passport' : 'Enter Journey Hub'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* 1-Tap Quick Guest Profiles */}
        <div className="mt-4 pt-3 border-t border-slate-700/60">
          <p className="text-[10px] text-center text-slate-400 uppercase tracking-wider font-semibold mb-2">
            Instant 1-Tap Profiles
          </p>
          <div className="grid grid-cols-3 gap-1.5">
            <button
              type="button"
              onClick={() => handleQuickDemo('Sreeshma (Solo)', '+91 98765 43210')}
              className="bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-lg py-1.5 px-1 text-center transition-colors"
            >
              <span className="block text-[10px] font-bold text-blue-300">Solo Explorer</span>
              <span className="block text-[9px] text-slate-400">Sreeshma</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Arjun & Family', '+91 98401 23456')}
              className="bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-lg py-1.5 px-1 text-center transition-colors"
            >
              <span className="block text-[10px] font-bold text-emerald-300">Family Group</span>
              <span className="block text-[9px] text-slate-400">Arjun Nair</span>
            </button>
            <button
              type="button"
              onClick={() => handleQuickDemo('Rohan (Backpacker)', '+91 91234 56789')}
              className="bg-slate-900/70 hover:bg-slate-700 border border-slate-700 rounded-lg py-1.5 px-1 text-center transition-colors"
            >
              <span className="block text-[10px] font-bold text-amber-300">Backpacker</span>
              <span className="block text-[9px] text-slate-400">Rohan Das</span>
            </button>
          </div>
        </div>
      </div>

      {/* Footer Security Badges */}
      <div className="z-10 text-center pb-2">
        <div className="flex items-center justify-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            End-to-End Encrypted SOS
          </span>
          <span className="flex items-center gap-1">
            <Globe className="w-3.5 h-3.5 text-blue-400" />
            Works Offline
          </span>
        </div>
      </div>
    </div>
  );
};
