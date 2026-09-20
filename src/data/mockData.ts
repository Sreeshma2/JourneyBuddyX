import { ALL_DESTINATIONS_DATA } from './destinations';
import { Destination, TripPlan, UserProfile } from '../types';

export const INITIAL_USER_PROFILE: UserProfile = {
  name: 'Sreeshma',
  email: 'sreeshmasureshkumar.3@gmail.com',
  travelInterests: ['Coastal & Nature', 'Heritage', 'Local Food', 'Photography'],
  dietaryPreference: 'Vegetarian Friendly',
  accessibilityPreferences: ['Gentle walking paces', 'Step-free alternatives when available'],
  trustedContacts: [
    { name: 'Meera (Sister)', phone: '+91 98765 43210', relationship: 'Family' },
    { name: 'Karthik (Friend)', phone: '+91 98123 45678', relationship: 'Emergency Contact' },
  ],
  savedPlaceIds: ['kanyakumari', 'munnar', 'goa'],
  lowBatteryMode: false,
  offlinePackDownloaded: true,
  notificationsEnabled: true,
  streakDays: 3,
};

export const DESTINATIONS_DATA: Destination[] = ALL_DESTINATIONS_DATA;

// Calculate dates starting tomorrow for realistic "starts in 1 day!" or countdown experience
const tomorrow = new Date();
tomorrow.setDate(tomorrow.getDate() + 1);
const dayAfter = new Date();
dayAfter.setDate(dayAfter.getDate() + 3);
const formattedDates = `${tomorrow.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${dayAfter.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

export const INITIAL_UPCOMING_TRIP: TripPlan = {
  id: 'trip-kanyakumari-01',
  destinationId: 'kanyakumari',
  destinationName: 'Kanyakumari',
  durationLabel: '2 days',
  dates: formattedDates,
  numberOfTravellers: 2,
  readinessPercentage: 82,
  readinessChecklist: [
    { id: 'rc-1', label: 'Inbound Train to Kanyakumari Confirmed', completed: true },
    { id: 'rc-2', label: 'Sea-facing Heritage Stay Reserved', completed: true },
    { id: 'rc-3', label: 'Estimated Trip Budget Allocated (₹4,400)', completed: true },
    { id: 'rc-4', label: 'Offline Regional Maps Cached', completed: true },
    { id: 'rc-5', label: 'Add Emergency Contact in Trusted Circle', completed: false, isWarning: true },
  ],
  budgetBreakdown: {
    transport: 1200,
    stay: 1800,
    food: 750,
    localTransport: 250,
    entryFees: 200,
    experiences: 200,
  },
  totalBudgetEstimated: 4400,
  days: [
    {
      dayNumber: 1,
      title: 'Arrival, Sacred Cape Confluence & Sunset',
      items: [
        {
          id: 'it-1',
          time: '08:30 AM',
          title: 'Arrival at Kanyakumari Station',
          subtitle: 'Terminus arrival with early coastal breeze',
          category: 'travel',
          estimatedCost: 0,
          whyThis: 'Smooth morning arrival to beat coastal heat.',
        },
        {
          id: 'it-2',
          time: '09:00 AM',
          title: 'Last-Mile: Station to Seafront Hotel',
          subtitle: 'Prepaid Auto via Beach Road (1.8 km)',
          category: 'last_mile',
          estimatedCost: 90,
          whyThis: 'Direct prepaid counter eliminates haggling.',
          tip: 'Confirm drop point at hotel reception driveway.',
        },
        {
          id: 'it-3',
          time: '09:45 AM',
          title: 'Traditional Nanjil Breakfast',
          subtitle: 'Saravana Heritage: Fluffy idlis & fresh coconut chutney',
          category: 'food',
          estimatedCost: 180,
          whyThis: 'Authentic local breakfast near the temple corridor.',
        },
        {
          id: 'it-4',
          time: '11:00 AM',
          title: 'Vivekananda Rock Memorial & Ferry',
          subtitle: 'Poompuhar Ferry ride across sacred waters',
          category: 'attraction',
          estimatedCost: 75,
          crowdLevel: 'LOW',
          whyThis: 'Midday winds are calm; lifejacket safety ensured.',
        },
        {
          id: 'it-5',
          time: '05:30 PM',
          title: 'Sunset View Point & Triveni Sangam',
          subtitle: 'Watching the sun dip where three seas meet',
          category: 'culture',
          estimatedCost: 0,
          crowdLevel: 'MODERATE',
          whyThis: 'Unmatched natural panoramic horizon.',
          tip: 'Reach by 5:15 PM for best shoreline seating.',
        },
        {
          id: 'it-6',
          time: '08:00 PM',
          title: 'Check-in & Rest at Cape Seafront Stay',
          subtitle: 'Balcony overlooking illuminated Thiruvalluvar silhouette',
          category: 'hotel',
          estimatedCost: 900,
        },
      ],
    },
    {
      dayNumber: 2,
      title: 'Sunrise Magic, Suchindram Temple & Departure',
      items: [
        {
          id: 'it-7',
          time: '05:45 AM',
          title: 'Sunrise Gathering at Sunrise Beach',
          subtitle: 'Witness the crimson sun rising above the Indian Ocean',
          category: 'attraction',
          estimatedCost: 0,
          crowdLevel: 'LOW',
          whyThis: 'The defining experience of Cape Comorin.',
        },
        {
          id: 'it-8',
          time: '08:30 AM',
          title: 'Local Filter Coffee & Breakfast',
          subtitle: 'Crisp ghee dosas at seafront canteen',
          category: 'food',
          estimatedCost: 160,
        },
        {
          id: 'it-9',
          time: '10:30 AM',
          title: 'Suchindram Thanumalayan Temple Excursion',
          subtitle: '17th-century musical pillars & 18-foot Hanuman monolith',
          category: 'culture',
          estimatedCost: 50,
          whyThis: 'Architectural gem just 12 km inland with step-free courtyard.',
        },
        {
          id: 'it-10',
          time: '03:30 PM',
          title: 'Last-Mile Return to Station',
          subtitle: 'Station Shuttle Bus / Auto for outbound departure',
          category: 'last_mile',
          estimatedCost: 80,
        },
      ],
    },
  ],
  planBAlternative: {
    triggerReason: 'Heavy Coastal Squall & Rain Advisory',
    alternativeTitle: 'Indoor Heritage Tour: Padmanabhapuram Wooden Palace',
    reason: 'Completely covered 16th-century wooden palace complex safe from coastal squalls, just 30 mins inland.',
    distance: '32 km inland via smooth highway',
    travelTime: '35 mins by hired taxi',
  },
};

export const mockDestinations = DESTINATIONS_DATA;
export const sampleTripPlan = INITIAL_UPCOMING_TRIP;
export const sampleUserProfile = INITIAL_USER_PROFILE;
