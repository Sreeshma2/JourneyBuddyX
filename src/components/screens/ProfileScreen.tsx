import React from 'react';
import { UserProfile, Destination } from '../../types';
import { PhoenixAvatar } from '../PhoenixAvatar';
import {
  User,
  Heart,
  Utensils,
  Accessibility,
  Download,
  Bell,
  Shield,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface ProfileScreenProps {
  userProfile: UserProfile;
  savedDestinations: Destination[];
  onUpdateProfile: (updated: Partial<UserProfile>) => void;
  onOpenLifeline: () => void;
  onSelectDestination: (dest: Destination) => void;
  onLogout?: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  userProfile,
  savedDestinations,
  onUpdateProfile,
  onOpenLifeline,
  onSelectDestination,
  onLogout,
}) => {
  return (
    <div className="flex flex-col min-h-screen pb-24 bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 px-4 pt-6 pb-4 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-blue-900 text-white flex items-center justify-center font-bold text-lg shadow-sm">
              {userProfile.name[0]}
            </div>
            <div>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                {userProfile.name}
              </h1>
              <p className="text-xs text-slate-500">{userProfile.email}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
            <PhoenixAvatar size="xs" mood="happy" />
            <span className="text-[11px] font-bold text-blue-900">Phoenix Active</span>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-md mx-auto w-full space-y-4">
        {/* TRAVEL INTERESTS & PREFERENCES */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
          <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Travel Preferences & Pace
          </h3>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {userProfile.travelInterests.map((interest, i) => (
              <span
                key={i}
                className="text-xs bg-blue-50 text-blue-900 font-semibold px-2.5 py-1 rounded-full border border-blue-200"
              >
                {interest}
              </span>
            ))}
          </div>
        </section>

        {/* DIETARY & ACCESSIBILITY */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
          <div className="flex items-start justify-between text-xs pb-2 border-b border-slate-100">
            <div className="space-y-0.5">
              <span className="font-bold text-slate-800 flex items-center gap-1">
                <Utensils className="w-3.5 h-3.5 text-orange-600" />
                Dietary Preference
              </span>
              <p className="text-slate-600">{userProfile.dietaryPreference}</p>
            </div>
            <span className="text-[10px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-medium">
              Active
            </span>
          </div>

          <div className="space-y-1.5 text-xs">
            <span className="font-bold text-slate-800 flex items-center gap-1">
              <Accessibility className="w-3.5 h-3.5 text-blue-700" />
              Accessibility Preferences
            </span>
            <div className="space-y-1">
              {userProfile.accessibilityPreferences.map((pref, i) => (
                <div key={i} className="flex items-center gap-1.5 text-slate-600 text-[11.5px]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>{pref}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SAVED PLACES */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Heart className="w-3.5 h-3.5 text-rose-600" />
              Saved Places ({savedDestinations.length})
            </h3>
          </div>

          <div className="space-y-2">
            {savedDestinations.map((dest) => (
              <div
                key={dest.id}
                onClick={() => onSelectDestination(dest)}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50/50 border border-slate-200/80 cursor-pointer transition-colors text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <img
                    src={dest.thumbnailImage}
                    alt={dest.name}
                    referrerPolicy="no-referrer"
                    className="w-10 h-10 rounded-lg object-cover"
                  />
                  <div>
                    <span className="font-bold text-slate-900 block">{dest.name}</span>
                    <span className="text-[11px] text-slate-500">{dest.region}</span>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </div>
            ))}
          </div>
        </section>

        {/* OFFLINE DOWNLOADS & CACHED DATA */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5 text-xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5 text-blue-800" />
              Offline Downloads
            </span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded">
              Ready
            </span>
          </div>
          <p className="text-slate-600">
            Kanyakumari & Cape Regional Pack (48 MB) stored on device for offline navigation.
          </p>
          <button
            onClick={onOpenLifeline}
            className="w-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold py-2.5 rounded-xl transition-colors min-h-[44px]"
          >
            Manage Offline Lifeline Pack
          </button>
        </section>

        {/* APP CONTROLS & PRIVACY */}
        <section className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-800">Travel & Crowd Notifications</span>
            </div>
            <input
              type="checkbox"
              checked={userProfile.notificationsEnabled}
              onChange={(e) => onUpdateProfile({ notificationsEnabled: e.target.checked })}
              className="w-4 h-4 accent-blue-900 cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-slate-600" />
              <span className="font-semibold text-slate-800">Privacy & Data Transparency</span>
            </div>
            <span className="text-slate-400 text-[11px]">Local storage only</span>
          </div>

          {onLogout && (
            <div className="pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onLogout}
                className="w-full text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 py-2.5 rounded-xl border border-red-200 transition-colors"
              >
                Sign Out / Switch Traveller Account
              </button>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
