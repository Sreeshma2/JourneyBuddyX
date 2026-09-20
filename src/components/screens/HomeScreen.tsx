import React, { useState } from 'react';
import { PhoenixAvatar } from '../PhoenixAvatar';
import { Destination, TripPlan, UserProfile } from '../../types';
import {
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Compass,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  PhoneCall,
  Calendar,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Menu,
  Bell,
  Search,
  Ticket,
  Languages,
  Database,
  X,
  Globe,
  LifeBuoy,
  Briefcase,
} from 'lucide-react';
import { JourneyBuddyLogo } from '../JourneyBuddyLogo';
import { PhoenixWelcomeBanner } from '../PhoenixWelcomeBanner';
import { useTranslation } from '../../context/TranslationContext';

interface HomeScreenProps {
  userProfile?: UserProfile;
  upcomingTrip: TripPlan;
  destinations?: Destination[];
  recommendedDestinations?: Destination[];
  onOpenJourneyBuddy?: (initialPrompt?: string) => void;
  onAskJourneyBuddy?: (initialPrompt: string) => void;
  onSelectDestination: (destination: Destination) => void;
  onViewMyTrip?: () => void;
  onNavigateToMyTrip?: () => void;
  onOpenSafety: () => void;
  onOpenLifeline: () => void;
  onOpenPlanner?: () => void;
  onOpenPlanTrip?: () => void;
  onNavigateToExplore?: (filter?: string, searchQuery?: string) => void;
  onOpenMenu?: () => void;
  onOpenNotifications?: () => void;
  onOpenTicketWallet?: () => void;
  onOpenTranslator?: () => void;
  onOpenHazards?: () => void;
  onOpenGovRegistry?: () => void;
  unreadNotificationsCount?: number;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userProfile,
  upcomingTrip,
  destinations,
  recommendedDestinations: passedRecommended,
  onOpenJourneyBuddy,
  onAskJourneyBuddy,
  onSelectDestination,
  onViewMyTrip,
  onNavigateToMyTrip,
  onOpenSafety,
  onOpenLifeline,
  onOpenPlanner,
  onOpenPlanTrip,
  onNavigateToExplore,
  onOpenMenu,
  onOpenNotifications,
  onOpenTicketWallet,
  onOpenTranslator,
  onOpenHazards,
  onOpenGovRegistry,
  unreadNotificationsCount = 2,
}) => {
  const { t, currentLanguageOption, openLanguageModal } = useTranslation();

  const [searchQuery, setSearchQuery] = useState('');
  const [showMoreDestinations, setShowMoreDestinations] = useState(false);
  const [showMoreServices, setShowMoreServices] = useState(false);
  const [showMoreChecklist, setShowMoreChecklist] = useState(false);
  const [showMoreHelplines, setShowMoreHelplines] = useState(false);

  // Safe resolution of handlers
  const handleOpenBuddy = (prompt?: string) => {
    if (onOpenJourneyBuddy) {
      onOpenJourneyBuddy(prompt);
    } else if (onAskJourneyBuddy) {
      onAskJourneyBuddy(prompt || '');
    }
  };

  const handleViewMyTrip = () => {
    if (onViewMyTrip) onViewMyTrip();
    else if (onNavigateToMyTrip) onNavigateToMyTrip();
  };

  const handleOpenPlanner = () => {
    if (onOpenPlanner) onOpenPlanner();
    else if (onOpenPlanTrip) onOpenPlanTrip();
  };

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const query = searchQuery.trim();
    if (!query) {
      if (onNavigateToExplore) onNavigateToExplore();
      return;
    }

    const match = availableDestinations.find(
      (d) =>
        d.name.toLowerCase().includes(query.toLowerCase()) ||
        d.region.toLowerCase().includes(query.toLowerCase())
    );

    if (match) {
      onSelectDestination(match);
    } else if (onNavigateToExplore) {
      onNavigateToExplore('All', query);
    }
  };

  // Safe destinations list
  const availableDestinations = destinations || passedRecommended || [];
  const userName = userProfile?.name || 'Sreeshma';

  // "See More" destination list logic: 2 cards collapsed, 6 cards expanded
  const displayedDestinations = showMoreDestinations
    ? availableDestinations.slice(0, 6)
    : availableDestinations.slice(0, 2);

  const getCrowdBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return {
          icon: '🟢',
          text: 'Low',
          desc: 'Quiet time',
          bg: 'bg-emerald-50 text-emerald-800 border-emerald-200',
        };
      case 'MODERATE':
        return {
          icon: '🟡',
          text: 'Moderate',
          desc: 'Normal flow',
          bg: 'bg-amber-50 text-amber-800 border-amber-200',
        };
      default:
        return {
          icon: '🔴',
          text: 'High',
          desc: 'Peak gathering',
          bg: 'bg-rose-50 text-rose-800 border-rose-200',
        };
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-slate-50 text-slate-900">
      {/* Top Header: App Title, 1-tap Language Switcher, Notifications, Menu */}
      <header className="px-4 pt-3.5 pb-3 bg-white border-b border-slate-200/90 sticky top-0 z-30 shadow-2xs">
        <div className="flex items-center justify-between gap-2 max-w-md mx-auto">
          {/* Menu Drawer trigger */}
          <button
            id="home-open-menu-btn"
            onClick={onOpenMenu}
            className="p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95"
            title={t('app.menu', 'Navigation Menu')}
            aria-label="Open Navigation Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Logo Branding */}
          <div className="flex items-center gap-2">
            <JourneyBuddyLogo size="sm" variant="white" />
            <div className="leading-tight">
              <span className="text-xs font-black text-slate-950 tracking-tight block">
                JOURNEY BUDDY
              </span>
              <span className="text-[9px] font-bold text-orange-600 uppercase tracking-wider block">
                {t('app.tagline', 'AI Travel Companion')}
              </span>
            </div>
          </div>

          {/* Right Header Controls: Language Selector Pill & Notification Bell */}
          <div className="flex items-center gap-1.5">
            {/* 1-Tap App-wide Language Switcher */}
            <button
              id="home-language-selector-btn"
              onClick={openLanguageModal}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 font-bold text-xs transition-colors shadow-2xs"
              title={t('app.language', 'Switch App Language')}
            >
              <span className="text-xs">{currentLanguageOption.flag}</span>
              <span className="text-[11px] font-extrabold uppercase">
                {currentLanguageOption.code}
              </span>
              <ChevronDown className="w-3 h-3 text-blue-600 ml-0.5" />
            </button>

            {/* Notification Bell */}
            <button
              id="home-open-notifications-btn"
              onClick={onOpenNotifications}
              className="relative p-2 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95"
              title={t('app.notifications', 'Proactive Notifications')}
              aria-label="Context Notifications"
            >
              <Bell className="w-4 h-4 text-slate-700" />
              {unreadNotificationsCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center animate-pulse">
                  {unreadNotificationsCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* DYNAMIC PERSONALIZED WELCOME CARD WITH PHOENIX MASCOT & COUNTDOWN */}
      <PhoenixWelcomeBanner
        userName={userName}
        upcomingTrip={upcomingTrip}
        onStartPlanning={handleOpenPlanner}
        onChatWithPhoenix={() => handleOpenBuddy()}
      />

      <main className="px-4 py-2 space-y-4 max-w-md mx-auto w-full">
        {/* COMPACT SEARCH BAR WITH QUICK CATEGORY CHIPS */}
        <section id="home-working-search-section">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex items-center bg-white border-2 border-slate-200 focus-within:border-orange-500 rounded-2xl shadow-2xs overflow-hidden transition-all"
          >
            <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
            <input
              id="home-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('home.searchPlaceholder', 'Search destinations, foods, or hill stations...')}
              className="w-full bg-transparent px-2.5 py-2.5 text-xs font-semibold text-slate-900 placeholder:text-slate-400 focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1.5 text-slate-400 hover:text-slate-600 mr-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              id="home-search-submit-btn"
              type="submit"
              className="px-3.5 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-700 hover:to-amber-700 text-white font-black text-xs rounded-xl mr-1.5 transition-transform active:scale-95 shadow-2xs shrink-0"
            >
              Search
            </button>
          </form>

          {/* Search quick category chips */}
          <div className="flex gap-1.5 overflow-x-auto pt-2 pb-0.5 no-scrollbar text-xs">
            {[
              { label: 'All Places', filter: 'All' },
              { label: '🏖️ Beaches', filter: 'Coastal' },
              { label: '☕ Hill Stations', filter: 'Hill Stations' },
              { label: '🏛️ Heritage', filter: 'Heritage' },
              { label: '🌿 Wildlife', filter: 'Wildlife' },
              { label: '🟢 Low crowd', filter: 'Low crowd' },
            ].map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  if (onNavigateToExplore) {
                    onNavigateToExplore(chip.filter);
                  }
                }}
                className="px-2.5 py-1 bg-white hover:bg-orange-50 hover:text-orange-800 hover:border-orange-200 border border-slate-200 text-slate-700 font-bold rounded-xl whitespace-nowrap transition-colors shadow-2xs text-[11px]"
              >
                {chip.label}
              </button>
            ))}
          </div>
        </section>

        {/* UPCOMING TRIP CARD (Compact, High-Impact) */}
        {upcomingTrip && (
          <section id="home-upcoming-trip-section" className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
                {t('home.upcomingTrip', 'Upcoming Journey')}
              </h3>
              <span className="text-[10px] text-blue-700 font-bold bg-blue-50 px-2 py-0.5 rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" />
                Active Plan
              </span>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200/90 shadow-2xs space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-extrabold text-blue-800 bg-blue-50 px-2 py-0.5 rounded-md">
                    {upcomingTrip.durationLabel}
                  </span>
                  <h4 className="text-base font-black text-slate-900 mt-1">
                    {upcomingTrip.destinationName}
                  </h4>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {upcomingTrip.dates} • {upcomingTrip.numberOfTravellers} Travellers
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block font-semibold">
                    {t('home.readiness', 'Trip Readiness')}
                  </span>
                  <span className="text-lg font-black text-blue-900">
                    {upcomingTrip.readinessPercentage}%
                  </span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                <div
                  className="bg-blue-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${upcomingTrip.readinessPercentage}%` }}
                />
              </div>

              {/* Trip Action Buttons (Compact row) */}
              <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100">
                <button
                  id="home-view-trip-btn"
                  onClick={handleViewMyTrip}
                  className="bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                >
                  <span>{t('home.viewItinerary', 'View Itinerary')}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>

                <button
                  id="home-view-plan-b-btn"
                  onClick={handleViewMyTrip}
                  className="bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs py-2 px-3 rounded-xl flex items-center justify-center gap-1 transition-colors"
                >
                  <AlertTriangle className="w-3 h-3 text-amber-600" />
                  <span>{t('home.planB', 'Plan-B Backup')}</span>
                </button>
              </div>
            </div>
          </section>
        )}

        {/* 5 MAIN TOUCH ACTIONS GRID (Section 5: Plan a Trip, Explore, Chat with Phoenix, My Trip, Safety) */}
        <section id="home-main-actions-grid" className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              {t('home.mainActions', 'Quick Actions')}
            </span>
          </div>

          <div className="grid grid-cols-5 gap-1.5">
            {/* 1. Plan a Trip */}
            <button
              id="home-action-plan-trip"
              onClick={handleOpenPlanner}
              className="p-2.5 bg-white hover:bg-blue-50/70 border border-slate-200 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-slate-800 leading-tight">
                {t('home.planTrip', 'Plan Trip')}
              </span>
            </button>

            {/* 2. Explore */}
            <button
              id="home-action-explore"
              onClick={() => onNavigateToExplore && onNavigateToExplore('All')}
              className="p-2.5 bg-white hover:bg-orange-50/70 border border-slate-200 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <Compass className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-slate-800 leading-tight">
                {t('home.explore', 'Explore')}
              </span>
            </button>

            {/* 3. Chat with Phoenix */}
            <button
              id="home-action-phoenix"
              onClick={() => handleOpenBuddy()}
              className="p-2.5 bg-gradient-to-b from-amber-50 to-orange-50 hover:from-amber-100 hover:to-orange-100 border border-orange-200 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center mb-1 shadow-xs group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-orange-950 leading-tight">
                Phoenix
              </span>
            </button>

            {/* 4. My Trip */}
            <button
              id="home-action-my-trip"
              onClick={handleViewMyTrip}
              className="p-2.5 bg-white hover:bg-indigo-50/70 border border-slate-200 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <Briefcase className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-slate-800 leading-tight">
                {t('home.myTrip', 'My Trip')}
              </span>
            </button>

            {/* 5. Safety */}
            <button
              id="home-action-safety"
              onClick={onOpenSafety}
              className="p-2.5 bg-white hover:bg-emerald-50/70 border border-slate-200 rounded-2xl flex flex-col items-center text-center shadow-2xs transition-all active:scale-95 group"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center mb-1 group-hover:scale-105 transition-transform">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <span className="text-[10px] font-black text-slate-800 leading-tight">
                {t('home.safety', 'Safety')}
              </span>
            </button>
          </div>
        </section>

        {/* TOURIST SERVICES DRAWER (Compact with "See More" toggle to eliminate clutter) */}
        <section id="home-tourist-services" className="space-y-1.5">
          <div className="flex items-center justify-between px-1">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
              Verified Tourist Tools
            </span>
            <button
              onClick={() => setShowMoreServices((prev) => !prev)}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
            >
              <span>{showMoreServices ? t('home.showLess', 'Show Less') : t('home.seeMore', 'See More')}</span>
              {showMoreServices ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Compact 2-item or expanded 4-item grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* 1. Ticket Wallet */}
            <button
              id="home-shortcut-ticket-wallet"
              onClick={onOpenTicketWallet}
              className="p-3 bg-white hover:bg-emerald-50/70 border border-slate-200 rounded-2xl text-left transition-all shadow-2xs flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Ticket className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-slate-900 leading-tight">Ticket Wallet</p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">Passes & QR Scan</p>
              </div>
            </button>

            {/* 2. Universal Voice Translator */}
            <button
              id="home-shortcut-translator"
              onClick={onOpenTranslator}
              className="p-3 bg-white hover:bg-blue-50/70 border border-slate-200 rounded-2xl text-left transition-all shadow-2xs flex items-center gap-2.5"
            >
              <div className="w-8 h-8 rounded-xl bg-blue-100 flex items-center justify-center text-blue-700 shrink-0">
                <Languages className="w-4 h-4" />
              </div>
              <div className="truncate">
                <p className="text-xs font-black text-slate-900 leading-tight">Voice Translator</p>
                <p className="text-[10px] text-slate-500 mt-0.5 truncate">Audio in & out</p>
              </div>
            </button>

            {/* Expanded items shown only if showMoreServices is true */}
            {showMoreServices && (
              <>
                {/* 3. Community Hazard Pins (Waze) */}
                <button
                  id="home-shortcut-hazards"
                  onClick={onOpenHazards}
                  className="p-3 bg-white hover:bg-rose-50/70 border border-slate-200 rounded-2xl text-left transition-all shadow-2xs flex items-center gap-2.5 animate-in fade-in duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-rose-100 flex items-center justify-center text-rose-700 shrink-0">
                    <AlertTriangle className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-black text-slate-900 leading-tight">Hazard Feed</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Live road & safety pins</p>
                  </div>
                </button>

                {/* 4. Govt Legal Registry */}
                <button
                  id="home-shortcut-gov-registry"
                  onClick={onOpenGovRegistry}
                  className="p-3 bg-white hover:bg-indigo-50/70 border border-slate-200 rounded-2xl text-left transition-all shadow-2xs flex items-center gap-2.5 animate-in fade-in duration-200"
                >
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-700 shrink-0">
                    <Database className="w-4 h-4" />
                  </div>
                  <div className="truncate">
                    <p className="text-xs font-black text-slate-900 leading-tight">Gov Registry</p>
                    <p className="text-[10px] text-slate-500 mt-0.5 truncate">Official fixed tariffs</p>
                  </div>
                </button>
              </>
            )}
          </div>
        </section>

        {/* RECOMMENDED DESTINATIONS SECTION WITH "SEE MORE" OPTION */}
        <section id="home-recommended-section" className="space-y-2.5">
          <div className="flex items-center justify-between px-1">
            <div>
              <h3 className="text-xs font-black text-slate-600 uppercase tracking-wider">
                {t('home.recommended', 'Recommended for You')}
              </h3>
              <p className="text-[11px] text-slate-500">
                Verified guides with crowd pulse & last-mile transit
              </p>
            </div>
            <button
              onClick={() => onNavigateToExplore && onNavigateToExplore('All')}
              className="text-xs font-black text-orange-600 hover:text-orange-700 flex items-center gap-0.5"
            >
              All ({availableDestinations.length}) →
            </button>
          </div>

          <div className="space-y-3">
            {displayedDestinations.map((dest) => {
              const crowd = getCrowdBadge(dest.crowdPulse.level);

              return (
                <div
                  key={dest.id}
                  id={`home-dest-card-${dest.id}`}
                  onClick={() => onSelectDestination(dest)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200 shadow-2xs hover:shadow-md transition-all cursor-pointer group"
                >
                  <div className="relative h-40 w-full overflow-hidden">
                    <img
                      src={dest.thumbnailImage}
                      alt={dest.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-transparent to-transparent" />

                    {/* Crowd Pulse compact badge on image */}
                    <div className="absolute top-3 left-3">
                      <div
                        className={`px-2 py-0.5 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-white/95 ${crowd.bg}`}
                      >
                        <span>{crowd.icon}</span>
                        <span className="font-extrabold">{crowd.text}</span>
                        <span className="text-[10px] opacity-85 border-l border-current pl-1">
                          {crowd.desc}
                        </span>
                      </div>
                    </div>

                    {/* Region / State Tag */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[10px] font-bold tracking-wide uppercase text-blue-200">
                        {dest.region}
                      </span>
                      <h4 className="text-lg font-black tracking-tight leading-tight">
                        {dest.name}
                      </h4>
                    </div>
                  </div>

                  <div className="p-3.5 space-y-2">
                    <p className="text-[11.5px] text-slate-600 italic bg-slate-50 p-2 rounded-lg border border-slate-100">
                      "{dest.matchReason}"
                    </p>

                    <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-100">
                      <span className="text-slate-500 flex items-center gap-1 text-[11px] truncate max-w-[200px]">
                        <MapPin className="w-3.5 h-3.5 text-blue-700 shrink-0" />
                        <span className="truncate">{dest.approximateTravelInfo}</span>
                      </span>
                      <span className="font-black text-slate-800 text-[11px] shrink-0">
                        ₹{dest.estimatedDailyBudget.toLocaleString('en-IN')}
                        <span className="text-[10px] font-normal text-slate-500">
                          {' '}/day
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* "SEE MORE" DESTINATIONS TOGGLE BUTTON */}
          <div className="pt-1 text-center">
            <button
              id="home-see-more-destinations-btn"
              onClick={() => setShowMoreDestinations((prev) => !prev)}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-100 text-slate-800 border border-slate-200 rounded-xl text-xs font-bold transition-colors shadow-2xs flex items-center justify-center gap-1.5"
            >
              <span>
                {showMoreDestinations
                  ? t('home.showLess', 'Show Less')
                  : `${t('home.seeMore', 'See More Destinations')} (${availableDestinations.length - 2} more)`}
              </span>
              {showMoreDestinations ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        </section>

        {/* YOUR JOURNEY & SAFETY READINESS WITH "SEE MORE" */}
        {upcomingTrip && (
          <section id="home-journey-readiness" className="space-y-1.5">
            <div className="flex items-center justify-between px-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-slate-500">
                {t('home.yourJourney', 'Travel Readiness & Tips')}
              </span>
              <button
                onClick={() => setShowMoreChecklist((prev) => !prev)}
                className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
              >
                <span>{showMoreChecklist ? t('home.showLess', 'Show Less') : t('home.seeMore', 'See More')}</span>
                {showMoreChecklist ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2 text-xs">
              {/* Primary top checklist item */}
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold text-slate-800">
                  {upcomingTrip.readinessChecklist[0]?.label || 'Trip Itinerary & Hub Confirmed'}
                </span>
              </div>

              {/* Expandable checklist items */}
              {showMoreChecklist && (
                <div className="pt-2 border-t border-slate-100 space-y-2 animate-in fade-in duration-200">
                  {upcomingTrip.readinessChecklist.slice(1).map((item) => (
                    <div key={item.id} className="flex items-center gap-2 text-xs">
                      {item.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                      )}
                      <span className={item.completed ? 'text-slate-700' : 'text-amber-900 font-bold'}>
                        {item.label}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        )}

        {/* QUICK EMERGENCY SOS & LIFELINE WITH "SEE MORE" */}
        <section id="home-quick-help-section" className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-wider">
              {t('home.safetyHelpline', 'Emergency & Safety Lifeline')}
            </h3>
            <button
              onClick={() => setShowMoreHelplines((prev) => !prev)}
              className="text-[11px] font-bold text-blue-700 hover:text-blue-900 flex items-center gap-0.5"
            >
              <span>{showMoreHelplines ? t('home.showLess', 'Show Less') : t('home.seeMore', 'See More')}</span>
              {showMoreHelplines ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              id="home-quick-safety-btn"
              onClick={onOpenSafety}
              className="bg-white hover:bg-blue-50/60 p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center text-center transition-colors"
            >
              <ShieldAlert className="w-4 h-4 text-blue-900 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Safety</span>
              <span className="text-[9px] text-slate-500">Alerts & Hub</span>
            </button>

            <button
              id="home-quick-lifeline-btn"
              onClick={onOpenLifeline}
              className="bg-white hover:bg-blue-50/60 p-2.5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col items-center text-center transition-colors"
            >
              <Compass className="w-4 h-4 text-blue-900 mb-1" />
              <span className="text-[11px] font-bold text-slate-800">Lifeline</span>
              <span className="text-[9px] text-emerald-600 font-semibold">Take Me Back</span>
            </button>

            <a
              href="tel:112"
              className="bg-white hover:bg-rose-50/60 p-2.5 rounded-2xl border border-rose-200 shadow-2xs flex flex-col items-center text-center transition-colors"
            >
              <PhoneCall className="w-4 h-4 text-rose-700 mb-1" />
              <span className="text-[11px] font-bold text-rose-950">SOS 112</span>
              <span className="text-[9px] text-rose-700 font-semibold">Free Call</span>
            </a>
          </div>

          {/* Expandable detailed helpline contacts */}
          {showMoreHelplines && (
            <div className="bg-white rounded-2xl p-3 border border-slate-200 shadow-2xs space-y-2 text-xs animate-in fade-in duration-200 mt-2">
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">National Emergency SOS</span>
                <a href="tel:112" className="font-extrabold text-rose-600">
                  112
                </a>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">24x7 Tourist Helpline</span>
                <a href="tel:1800111363" className="font-extrabold text-blue-600">
                  1800-11-1363
                </a>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-100">
                <span className="text-slate-600">Women's Safety Helpline</span>
                <a href="tel:1091" className="font-extrabold text-indigo-600">
                  1091
                </a>
              </div>
              <div className="flex items-center justify-between py-1">
                <span className="text-slate-600">Railway Protection Force (RPF)</span>
                <a href="tel:139" className="font-extrabold text-slate-700">
                  139
                </a>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
