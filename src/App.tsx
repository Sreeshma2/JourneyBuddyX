/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { NavTab, Destination, TripPlan, UserProfile } from './types';
import { mockDestinations, sampleTripPlan, sampleUserProfile } from './data/mockData';
import { SplashScreen } from './components/SplashScreen';
import { BottomNav } from './components/BottomNav';
import { JourneyBuddyModal } from './components/JourneyBuddyModal';
import { HomeScreen } from './components/screens/HomeScreen';
import { ExploreScreen } from './components/screens/ExploreScreen';
import { MyTripScreen } from './components/screens/MyTripScreen';
import { SafetyScreen } from './components/screens/SafetyScreen';
import { ProfileScreen } from './components/screens/ProfileScreen';
import { DestinationDetailModal } from './components/screens/DestinationDetailModal';
import { TripPlannerModal } from './components/screens/TripPlannerModal';
import { TravelLifelineModal } from './components/screens/TravelLifelineModal';
import { ReviewModal } from './components/screens/ReviewModal';
import { PhoenixAvatar } from './components/PhoenixAvatar';
import { LoginScreen } from './components/LoginScreen';
import { FunctionalMenuBar } from './components/FunctionalMenuBar';
import { UniversalTranslatorModal } from './components/UniversalTranslatorModal';
import { TicketWalletModal } from './components/TicketWalletModal';
import { CommunityHazardModal } from './components/CommunityHazardModal';
import { GovRegistryModal } from './components/GovRegistryModal';
import { ContextNotificationDrawer } from './components/ContextNotificationDrawer';
import { TranslationProvider } from './context/TranslationContext';
import { LanguageSelectorModal } from './components/LanguageSelectorModal';

export default function App() {
  const [showSplash, setShowSplash] = useState<boolean>(true);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<NavTab>('HOME');

  // Core domain states
  const [destinations] = useState<Destination[]>(mockDestinations);
  const [currentTripPlan, setCurrentTripPlan] = useState<TripPlan>(sampleTripPlan);
  const [userProfile, setUserProfile] = useState<UserProfile>(sampleUserProfile);
  const [savedDestinations, setSavedDestinations] = useState<Destination[]>([
    mockDestinations[0],
    mockDestinations[1],
  ]);

  // Modal / Detail views
  const [selectedDestination, setSelectedDestination] = useState<Destination | null>(null);
  const [isTripPlannerOpen, setIsTripPlannerOpen] = useState<boolean>(false);
  const [isLifelineOpen, setIsLifelineOpen] = useState<boolean>(false);
  const [isReviewOpen, setIsReviewOpen] = useState<boolean>(false);
  const [reviewTargetDestination, setReviewTargetDestination] = useState<Destination | null>(null);

  // New Comprehensive Feature Modals
  const [isMenuBarOpen, setIsMenuBarOpen] = useState<boolean>(false);
  const [isTranslatorOpen, setIsTranslatorOpen] = useState<boolean>(false);
  const [isTicketWalletOpen, setIsTicketWalletOpen] = useState<boolean>(false);
  const [isHazardModalOpen, setIsHazardModalOpen] = useState<boolean>(false);
  const [isGovRegistryOpen, setIsGovRegistryOpen] = useState<boolean>(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState<number>(3);
  const [exploreSearchQuery, setExploreSearchQuery] = useState<string>('');
  const [isLowPowerMode, setIsLowPowerMode] = useState<boolean>(false);

  // Journey Buddy AI Drawer/Modal
  const [isBuddyOpen, setIsBuddyOpen] = useState<boolean>(false);
  const [buddyInitialPrompt, setBuddyInitialPrompt] = useState<string>('');
  const [exploreInitialFilter, setExploreInitialFilter] = useState<string>('All');

  // Open Journey Buddy helper
  const handleAskJourneyBuddy = (prompt: string, destName?: string) => {
    setBuddyInitialPrompt(prompt);
    setIsBuddyOpen(true);
  };

  // Switch to Explore tab with specific filter and search query
  const handleNavigateToExplore = (filter?: string, searchQuery?: string) => {
    if (filter) setExploreInitialFilter(filter);
    if (searchQuery !== undefined) setExploreSearchQuery(searchQuery);
    setActiveTab('EXPLORE');
  };

  // Plan trip from destination detail
  const handlePlanTripFromDest = (dest: Destination) => {
    setSelectedDestination(null);
    setIsTripPlannerOpen(true);
  };

  // Add trusted contact in Safety Centre
  const handleAddTrustedContact = (contact: { name: string; phone: string; relationship: string }) => {
    setUserProfile((prev) => ({
      ...prev,
      trustedContacts: [...prev.trustedContacts, contact],
    }));
  };

  // Submit community review
  const handleSubmitReview = (reviewData: any) => {
    console.log('Submitted review:', reviewData);
  };

  return (
    <TranslationProvider>
      <div className="min-h-screen bg-slate-100 flex justify-center text-slate-900 selection:bg-blue-200">
        {/* Container simulating a mobile phone viewport on desktop or full-width on mobile */}
        <div className="w-full max-w-md bg-slate-50 min-h-screen flex flex-col relative shadow-xl overflow-x-hidden">
          {/* Splash screen transition */}
          {showSplash ? (
            <SplashScreen
              onComplete={() => setShowSplash(false)}
              onFinish={() => setShowSplash(false)}
            />
          ) : !isLoggedIn ? (
            <LoginScreen
              defaultProfile={userProfile}
              onLoginSuccess={(updatedProfile) => {
                setUserProfile(updatedProfile);
                setIsLoggedIn(true);
              }}
            />
          ) : (
            <>
              {/* Primary Tab View Router */}
              <div className="flex-1 w-full">
              {activeTab === 'HOME' && (
                <HomeScreen
                  userProfile={userProfile}
                  upcomingTrip={currentTripPlan}
                  destinations={destinations}
                  recommendedDestinations={destinations}
                  onSelectDestination={(dest) => setSelectedDestination(dest)}
                  onOpenPlanner={() => setIsTripPlannerOpen(true)}
                  onOpenPlanTrip={() => setIsTripPlannerOpen(true)}
                  onOpenLifeline={() => setIsLifelineOpen(true)}
                  onOpenSafety={() => setActiveTab('SAFETY')}
                  onViewMyTrip={() => setActiveTab('MY_TRIP')}
                  onNavigateToMyTrip={() => setActiveTab('MY_TRIP')}
                  onNavigateToExplore={handleNavigateToExplore}
                  onOpenJourneyBuddy={(prompt) => handleAskJourneyBuddy(prompt || '')}
                  onAskJourneyBuddy={handleAskJourneyBuddy}
                  onOpenMenu={() => setIsMenuBarOpen(true)}
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                  onOpenTicketWallet={() => setIsTicketWalletOpen(true)}
                  onOpenTranslator={() => setIsTranslatorOpen(true)}
                  onOpenHazards={() => setIsHazardModalOpen(true)}
                  onOpenGovRegistry={() => setIsGovRegistryOpen(true)}
                  unreadNotificationsCount={unreadNotificationsCount}
                />
              )}

              {activeTab === 'EXPLORE' && (
                <ExploreScreen
                  destinations={destinations}
                  initialFilter={exploreInitialFilter}
                  initialSearchQuery={exploreSearchQuery}
                  onSelectDestination={(dest) => setSelectedDestination(dest)}
                  onAskJourneyBuddy={handleAskJourneyBuddy}
                />
              )}

              {activeTab === 'MY_TRIP' && (
                <MyTripScreen
                  tripPlan={currentTripPlan}
                  onAskJourneyBuddy={handleAskJourneyBuddy}
                  onOpenLifeline={() => setIsLifelineOpen(true)}
                  onOpenSafety={() => setActiveTab('SAFETY')}
                  onOpenReviewModal={() => {
                    setReviewTargetDestination(destinations[0]);
                    setIsReviewOpen(true);
                  }}
                />
              )}

              {activeTab === 'SAFETY' && (
                <SafetyScreen
                  userProfile={userProfile}
                  currentLocationName={`${currentTripPlan.destinationName} • Cape Promenade`}
                  onAskJourneyBuddy={handleAskJourneyBuddy}
                  onOpenLifeline={() => setIsLifelineOpen(true)}
                  onAddContact={handleAddTrustedContact}
                />
              )}

              {activeTab === 'PROFILE' && (
                <ProfileScreen
                  userProfile={userProfile}
                  savedDestinations={savedDestinations}
                  onUpdateProfile={(updated) =>
                    setUserProfile((prev) => ({ ...prev, ...updated }))
                  }
                  onOpenLifeline={() => setIsLifelineOpen(true)}
                  onSelectDestination={(dest) => setSelectedDestination(dest)}
                  onLogout={() => setIsLoggedIn(false)}
                />
              )}
            </div>

            {/* Bottom 5-Tab Navigation Bar */}
            <BottomNav
              activeTab={activeTab}
              onTabChange={(tab) => {
                setSelectedDestination(null);
                setActiveTab(tab);
              }}
              onOpenBuddy={() => handleAskJourneyBuddy('How can Phoenix assist my journey right now?')}
            />

            {/* MODAL 1: Destination Details View */}
            {selectedDestination && (
              <DestinationDetailModal
                destination={selectedDestination}
                onClose={() => setSelectedDestination(null)}
                onPlanTrip={handlePlanTripFromDest}
                onAskJourneyBuddy={handleAskJourneyBuddy}
                onOpenReviewModal={(dest) => {
                  setReviewTargetDestination(dest);
                  setIsReviewOpen(true);
                }}
              />
            )}

            {/* MODAL 2: AI Trip Planner */}
            {isTripPlannerOpen && (
              <TripPlannerModal
                isOpen={isTripPlannerOpen}
                onClose={() => setIsTripPlannerOpen(false)}
                destinations={destinations}
                initialDestination={selectedDestination || destinations[0]}
                onGeneratePlan={(newPlan) => {
                  setCurrentTripPlan(newPlan);
                  setActiveTab('MY_TRIP');
                }}
              />
            )}

            {/* MODAL 3: Offline Travel Lifeline (Take Me Back) */}
            {isLifelineOpen && (
              <TravelLifelineModal
                isOpen={isLifelineOpen}
                onClose={() => setIsLifelineOpen(false)}
                tripPlan={currentTripPlan}
                userProfile={userProfile}
              />
            )}

            {/* MODAL 4: Community Review Modal */}
            {isReviewOpen && reviewTargetDestination && (
              <ReviewModal
                isOpen={isReviewOpen}
                destination={reviewTargetDestination}
                onClose={() => setIsReviewOpen(false)}
                onSubmitReview={handleSubmitReview}
              />
            )}

            {/* SLIDE-IN MENU BAR (Functional Menu Bar) */}
            <FunctionalMenuBar
              isOpen={isMenuBarOpen}
              onClose={() => setIsMenuBarOpen(false)}
              onOpenTicketWallet={() => setIsTicketWalletOpen(true)}
              onOpenTranslator={() => setIsTranslatorOpen(true)}
              onOpenHazards={() => setIsHazardModalOpen(true)}
              onOpenGovRegistry={() => setIsGovRegistryOpen(true)}
              onOpenNotifications={() => setIsNotificationsOpen(true)}
              onOpenSafetyCentre={() => setActiveTab('SAFETY')}
              onOpenPlanner={() => setIsTripPlannerOpen(true)}
              isLowPowerMode={isLowPowerMode}
              onToggleLowPowerMode={() => setIsLowPowerMode(!isLowPowerMode)}
              unreadNotificationsCount={unreadNotificationsCount}
            />

            {/* UNIVERSAL TRANSLATOR MODAL (Any language to any language & voice mic) */}
            <UniversalTranslatorModal
              isOpen={isTranslatorOpen}
              onClose={() => setIsTranslatorOpen(false)}
            />

            {/* TICKET WALLET & E-PASSES MODAL */}
            <TicketWalletModal
              isOpen={isTicketWalletOpen}
              onClose={() => setIsTicketWalletOpen(false)}
            />

            {/* COMMUNITY HAZARD PINS MODAL (Mini Waze for tourists) */}
            <CommunityHazardModal
              isOpen={isHazardModalOpen}
              onClose={() => setIsHazardModalOpen(false)}
              onSelectOnMap={() => {
                setIsHazardModalOpen(false);
                setActiveTab('SAFETY');
              }}
            />

            {/* GOVT & LEGAL DATA SOURCES REGISTRY */}
            <GovRegistryModal
              isOpen={isGovRegistryOpen}
              onClose={() => setIsGovRegistryOpen(false)}
            />

            {/* CONTEXTUAL NOTIFICATIONS DRAWER */}
            <ContextNotificationDrawer
              isOpen={isNotificationsOpen}
              onClose={() => setIsNotificationsOpen(false)}
              onUnreadCountChange={(count) => setUnreadNotificationsCount(count)}
              onActionClick={(actionKey) => {
                setIsNotificationsOpen(false);
                if (actionKey === 'VIEW_TICKET' || actionKey === 'BOOK_SLOT') {
                  setIsTicketWalletOpen(true);
                } else if (actionKey === 'CHECK_CROWD' || actionKey === 'EXPLORE') {
                  setActiveTab('EXPLORE');
                } else if (actionKey === 'VIEW_SAFETY' || actionKey === 'WEATHER_PREP') {
                  setActiveTab('SAFETY');
                } else if (actionKey === 'VIEW_HAZARD') {
                  setIsHazardModalOpen(true);
                }
              }}
            />

            {/* Floating Phoenix AI Companion Button (Accessible on all tabs) */}
            {!isBuddyOpen && !selectedDestination && !isTripPlannerOpen && !isLifelineOpen && !isReviewOpen && !isMenuBarOpen && (
              <button
                id="floating-phoenix-buddy-btn"
                onClick={() => handleAskJourneyBuddy('How can Phoenix help with my travel plans?')}
                className="fixed bottom-20 right-4 z-30 flex items-center gap-2 bg-gradient-to-r from-blue-900 to-slate-900 hover:from-blue-800 hover:to-slate-800 text-white pl-2 pr-3.5 py-1.5 rounded-full shadow-lg border border-blue-700/60 transition-transform active:scale-95 group"
                aria-label="Ask Phoenix AI Companion"
              >
                <PhoenixAvatar size="xs" mood="happy" withGlow animate />
                <span className="text-xs font-bold tracking-tight text-amber-300">
                  Ask Phoenix
                </span>
              </button>
            )}

            {/* MODAL 5: Central AI Journey Buddy Companion */}
            <JourneyBuddyModal
              isOpen={isBuddyOpen}
              onClose={() => {
                setIsBuddyOpen(false);
                setBuddyInitialPrompt('');
              }}
              currentScreen={activeTab}
              currentScreenContext={{
                screenName: activeTab,
                destinationName: selectedDestination?.name || currentTripPlan.destinationName,
                contextId: selectedDestination?.id,
              }}
              activeDestinationName={selectedDestination?.name || currentTripPlan.destinationName}
              initialPrompt={buddyInitialPrompt}
              onNavigateToTab={(tab) => {
                setIsBuddyOpen(false);
                setActiveTab(tab);
              }}
              onOpenLifeline={() => {
                setIsBuddyOpen(false);
                setIsLifelineOpen(true);
              }}
              onOpenTripPlanner={() => {
                setIsBuddyOpen(false);
                setIsTripPlannerOpen(true);
              }}
              onExecuteAction={(actionKey, data) => {
                if (actionKey === 'OPEN_PLANNER' || actionKey === 'PLAN_TRIP') {
                  setIsBuddyOpen(false);
                  setIsTripPlannerOpen(true);
                } else if (actionKey === 'OPEN_LIFELINE') {
                  setIsBuddyOpen(false);
                  setIsLifelineOpen(true);
                } else if (actionKey === 'VIEW_SAFETY' || actionKey === 'VIEW_ALERTS') {
                  setIsBuddyOpen(false);
                  setActiveTab('SAFETY');
                } else if (actionKey === 'VIEW_MY_TRIP' || actionKey === 'VIEW_PLAN_B') {
                  setIsBuddyOpen(false);
                  setActiveTab('MY_TRIP');
                } else if (actionKey === 'VIEW_EXPLORE' || actionKey === 'VIEW_LAST_MILE') {
                  setIsBuddyOpen(false);
                  setActiveTab('EXPLORE');
                } else if (actionKey === 'VIEW_DESTINATION' && data?.destinationId) {
                  const target = destinations.find((d) => d.id === data.destinationId);
                  if (target) {
                    setSelectedDestination(target);
                  }
                  setIsBuddyOpen(false);
                } else if (actionKey === 'OPEN_TRANSLATOR') {
                  setIsBuddyOpen(false);
                  setIsTranslatorOpen(true);
                } else if (actionKey === 'OPEN_TICKETS' || actionKey === 'VIEW_TICKETS') {
                  setIsBuddyOpen(false);
                  setIsTicketWalletOpen(true);
                } else if (actionKey === 'OPEN_HAZARDS') {
                  setIsBuddyOpen(false);
                  setIsHazardModalOpen(true);
                }
              }}
            />
          </>
        )}
      </div>
      <LanguageSelectorModal />
    </div>
  </TranslationProvider>
);
}
