export type NavTab = 'HOME' | 'EXPLORE' | 'MY_TRIP' | 'SAFETY' | 'PROFILE';

export type CrowdLevel = 'LOW' | 'MODERATE' | 'HIGH';

export interface CrowdPulseInfo {
  level: CrowdLevel;
  label: string; // e.g. "Quieter than usual"
  bestTime: string; // e.g. "4:00 PM – 5:30 PM"
  isEstimated: boolean;
  note?: string;
}

export interface SmartLocalInfo {
  happeningEvent?: {
    name: string;
    date: string;
    description: string;
    category: string;
    source: string;
  };
  localFood: {
    id: string;
    name: string;
    description: string;
    priceEstimate: string;
    isVeg: boolean;
    recommendedSpot: string;
  }[];
  cultureEtiquette: {
    points: [string, string, string]; // Exactly 3 concise useful points
    sourceLabel: string; // e.g. "Venue advisory" or "Official department guidance"
  };
  localExperiences: {
    id: string;
    title: string;
    provider: string;
    verifiedSource: boolean;
    duration: string;
    description: string;
  }[];
}

export interface LastMileVerification {
  type: 'GOVT_REGISTERED' | 'TOURISM_BOARD_APPROVED' | 'SAFETY_AUDITED' | 'RATED_DRIVER';
  badgeText: string;
  registrationNumber: string;
  auditDate: string;
  checklist: {
    fixedRateCompliant: boolean;
    backgroundChecked: boolean;
    sosEquipped: boolean;
    gpsTracked: boolean;
  };
}

export interface LastMileOption {
  id: string;
  mode: string; // Auto-rickshaw, KSRTC Local Bus, Shared Tourist Van, Prepaid Taxi
  estimatedTime: string;
  estimatedFare: string; // e.g. "₹80 – ₹120 (Estimated fare)"
  frequency: string;
  pickupDrop: string;
  availabilityLabel: string; // e.g. "Sample availability"
  isVerified?: boolean;
  verificationBadgeText?: string;
  verification?: LastMileVerification;
  safetyScore?: number; // e.g. 96 for 96%
}

export interface LastMileJourney {
  hubName: string; // e.g. "Kanyakumari Railway Station / Trivandrum Airport"
  distance: string;
  typicalTime: string;
  options: LastMileOption[];
}

export interface SafetyFacility {
  id: string;
  name: string;
  type: 'Hospital' | '24x7 Pharmacy' | 'Tourist Police Aid Post' | 'Clinic';
  distance: string;
  phone: string;
  verifiedStatus: string; // e.g. "Department listed"
}

export interface SafetyAlert {
  id: string;
  title: string;
  message: string;
  severity: 'advisory' | 'warning' | 'info';
  source: string; // e.g. "Maritime Board Advisory"
  date: string;
}

export interface Destination {
  id: string;
  name: string;
  region: string;
  tagline: string;
  description: string;
  heroImage: string;
  thumbnailImage: string;
  matchReason: string; // "Recommended because it matches your interests in coastal history and gentle pacing."
  approximateTravelInfo: string; // e.g. "1.5 hrs from Trivandrum • Direct trains available"
  estimatedDailyBudget: number; // in INR
  crowdPulse: CrowdPulseInfo;
  categories: string[]; // Heritage, Nature, Hidden gems, Culture, Food, Low crowd, Budget-friendly, Accessible
  highlights: string[];
  smartLocal: SmartLocalInfo;
  lastMile: LastMileJourney;
  safetyCentre: {
    alerts: SafetyAlert[];
    emergencyContacts: { label: string; number: string; type: string }[];
    facilities: SafetyFacility[];
    guidance: string[];
  };
  accessibilityFeatures: string[];
  rating: number;
  reviewCount: number;
  seasonalAdvisory?: string;
  suggestedAlternativeIfDisrupted?: {
    alternativeName: string;
    reason: string;
    distance: string;
  };
}

export interface ItineraryItem {
  id: string;
  time: string;
  title: string;
  subtitle: string;
  category: 'travel' | 'last_mile' | 'attraction' | 'food' | 'culture' | 'hotel';
  estimatedCost?: number;
  crowdLevel?: CrowdLevel;
  whyThis?: string;
  tip?: string;
}

export interface TripDay {
  dayNumber: number;
  title: string;
  items: ItineraryItem[];
}

export interface TripPlan {
  id: string;
  destinationId: string;
  destinationName: string;
  durationLabel: string;
  dates: string;
  numberOfTravellers: number;
  readinessPercentage: number;
  readinessChecklist: {
    id: string;
    label: string;
    completed: boolean;
    isWarning?: boolean;
  }[];
  budgetBreakdown: {
    transport: number;
    stay: number;
    food: number;
    localTransport: number;
    entryFees: number;
    experiences: number;
  };
  totalBudgetEstimated: number;
  days: TripDay[];
  planBAlternative?: {
    triggerReason: string;
    alternativeTitle: string;
    reason: string;
    distance: string;
    travelTime: string;
  };
}

export interface JourneyBuddyAction {
  label: string;
  actionKey: string;
  data?: any;
}

export interface TravelContextMemory {
  userName?: string;
  destination?: string;
  destinationId?: string;
  durationDays?: number;
  dates?: string;
  budget?: number;
  currency?: string;
  travelGroup?: 'solo' | 'couple' | 'family' | 'parents' | 'friends';
  interests?: string[];
  foodPreferences?: string[];
  transportPreferences?: string[];
  accommodationPreferences?: string[];
  currentTopic?: 'itinerary' | 'budget' | 'food' | 'safety' | 'transit' | 'packing' | 'general';
}

export type SupportedLanguage = 'en' | 'hi' | 'ml' | 'ta' | 'te' | 'kn' | 'bn' | 'es' | 'fr' | 'de';

export interface ChatMessage {
  id: string;
  sender: 'user' | 'phoenix';
  text: string;
  timestamp: string;
  actions?: JourneyBuddyAction[];
  contextTag?: string;
}

export interface UserReview {
  id: string;
  destinationId: string;
  destinationName: string;
  overallRating: number;
  ratings: {
    cleanliness: number;
    value: number;
    accessibility: number;
    foodService: number;
    location: number;
    easeOfReaching: number;
  };
  reviewText?: string;
  date: string;
}

export interface UserProfile {
  name: string;
  email: string;
  emergencyPhone?: string;
  travelInterests: string[];
  dietaryPreference: string;
  accessibilityPreferences: string[];
  trustedContacts: { name: string; phone: string; relationship: string }[];
  savedPlaceIds: string[];
  lowBatteryMode: boolean;
  offlinePackDownloaded: boolean;
  notificationsEnabled: boolean;
  streakDays?: number;
}

export type HazardType =
  | 'road_blocked'
  | 'unsafe_area'
  | 'scam'
  | 'weather'
  | 'under_construction';

export interface HazardPin {
  id: string;
  type: HazardType;
  title: string;
  description: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  reportedAt: string;
  reportedBy: string;
  upvotes: number;
  hasUserUpvoted?: boolean;
  status: 'active' | 'cleared' | 'verified_by_traffic_police';
  severity: 'high' | 'medium' | 'low';
}

export type TicketCategory =
  | 'MONUMENT'
  | 'FERRY'
  | 'HERITAGE_WALK'
  | 'SAFARI'
  | 'BOAT_CRUISE'
  | 'CULTURAL_SHOW';

export interface TicketBooking {
  id: string;
  ticketNumber: string;
  destinationId: string;
  attractionName: string;
  category: TicketCategory;
  visitDate: string;
  slotTime: string;
  guestCount: { adults: number; children: number; seniors: number };
  tariffTier: 'INDIAN_NATIONAL' | 'INTERNATIONAL_VISITOR' | 'STUDENT';
  totalAmount: number;
  currency: string;
  status: 'CONFIRMED' | 'USED' | 'CANCELLED';
  qrCodeValue: string;
  barcodeNumber: string;
  bookingTimestamp: string;
  govAuthority: string;
  gateInstructions: string;
  holderName: string;
}

export interface ContextNotification {
  id: string;
  type: 'CROWD' | 'WEATHER' | 'HAZARD' | 'TICKET' | 'SAFETY';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  urgency: 'high' | 'medium' | 'info';
  actionLabel?: string;
  actionKey?: string;
  metadata?: any;
}

export interface TranslationRecord {
  fromLang: string;
  toLang: string;
  originalText: string;
  translatedText: string;
  pronunciation?: string;
  timestamp: string;
}

export interface GovtDataSource {
  id: string;
  name: string;
  authority: string;
  licenseType: string;
  jurisdiction: string;
  lastSync: string;
  verifiedTariffItems: { name: string; officialFee: string; gazetteRef: string }[];
  trafficHelpline: string;
  officialPortalUrl: string;
}
