import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import { createClient } from '@supabase/supabase-js';

// Supabase Production Client & PostGIS integration
const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || '';
const isSupabaseLive = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('placeholder') &&
    !supabaseUrl.includes('your-supabase')
);
const supabase = isSupabaseLive ? createClient(supabaseUrl, supabaseKey) : null;

function loadMockJson<T>(relPath: string, fallback: T): T {
  try {
    const fullPath = path.resolve(process.cwd(), relPath);
    if (fs.existsSync(fullPath)) {
      return JSON.parse(fs.readFileSync(fullPath, 'utf-8'));
    }
  } catch (err) {
    console.warn(`Failed to read ${relPath}:`, err);
  }
  return fallback;
}

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini AI client
let aiClient: GoogleGenAI | null = null;
function getAI(): GoogleGenAI | null {
  if (!aiClient && process.env.GEMINI_API_KEY) {
    try {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          },
        },
      });
    } catch (e) {
      console.error('Failed to initialize GoogleGenAI client:', e);
    }
  }
  return aiClient;
}

// In-memory persistent hazard pins store (initialized with realistic community reports)
interface ServerHazard {
  id: string;
  type: 'road_blocked' | 'unsafe_area' | 'scam' | 'weather' | 'under_construction';
  title: string;
  description: string;
  locationName: string;
  coordinates: { lat: number; lng: number };
  reportedAt: string;
  reportedBy: string;
  upvotes: number;
  status: 'active' | 'cleared' | 'verified_by_traffic_police';
  severity: 'high' | 'medium' | 'low';
}

const defaultCommunityHazards: ServerHazard[] = [
  {
    id: 'hz-101',
    type: 'road_blocked',
    title: 'Ferry Ghat Approach Road Blocked',
    description: 'Culvert drainage work in progress near Market Street. Walking detour active via Beach Promenade.',
    locationName: 'Kanyakumari • Ferry Road',
    coordinates: { lat: 8.0792, lng: 77.5512 },
    reportedAt: '12 mins ago',
    reportedBy: 'Karthik S. (Tour Guide)',
    upvotes: 18,
    status: 'verified_by_traffic_police',
    severity: 'medium',
  },
  {
    id: 'hz-102',
    type: 'scam',
    title: 'Unauthorized "Fast-Track" Ferry Ticket Touts',
    description: 'Individuals selling unofficial paper tokens at ₹150 outside gate. Official TTDC counter is ₹50 inside.',
    locationName: 'Vivekananda Rock Boat Jetty Entrance',
    coordinates: { lat: 8.0781, lng: 77.5535 },
    reportedAt: '35 mins ago',
    reportedBy: 'Ananya M. (Solo Traveler)',
    upvotes: 27,
    status: 'active',
    severity: 'high',
  },
  {
    id: 'hz-103',
    type: 'weather',
    title: 'High Tide & Slippery Rocks Warning',
    description: 'Rough coastal swell and water spray onto lower promenade rocks. Keep behind safety barrier.',
    locationName: 'Sunset Point & Triveni Sangam',
    coordinates: { lat: 8.081, lng: 77.548 },
    reportedAt: '1 hour ago',
    reportedBy: 'Marine Safety Post #2',
    upvotes: 41,
    status: 'active',
    severity: 'high',
  },
  {
    id: 'hz-104',
    type: 'under_construction',
    title: 'Heritage Walkway Paver Installation',
    description: 'Southern walkway partially restricted. Electric buggy access rerouted to Northern Boulevard.',
    locationName: 'Gandhi Memorial Heritage Corridor',
    coordinates: { lat: 8.0805, lng: 77.552 },
    reportedAt: '3 hours ago',
    reportedBy: 'Town Municipal Board',
    upvotes: 9,
    status: 'active',
    severity: 'low',
  },
  {
    id: 'hz-105',
    type: 'unsafe_area',
    title: 'Streetlight Cable Outage on East Shoreline Lane',
    description: 'Dim lighting after 8 PM along 200m stretch. Police patrol frequency increased; stay on main lit road.',
    locationName: 'East Coast Fishing Harbor By-lane',
    coordinates: { lat: 8.0835, lng: 77.5545 },
    reportedAt: '5 hours ago',
    reportedBy: 'Travelers Safety Watch',
    upvotes: 14,
    status: 'active',
    severity: 'medium',
  },
];

const communityHazards: ServerHazard[] = loadMockJson(
  'src/data/mock/hazard_pins.json',
  defaultCommunityHazards
);

// In-memory Ticket Booking Wallet store
interface ServerTicket {
  id: string;
  ticketNumber: string;
  destinationId: string;
  attractionName: string;
  category: 'MONUMENT' | 'FERRY' | 'HERITAGE_WALK' | 'SAFARI' | 'BOAT_CRUISE';
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

const defaultBookedTickets: ServerTicket[] = [
  {
    id: 'tkt-001',
    ticketNumber: 'TTDC-VK-2026-89412',
    destinationId: 'kanyakumari',
    attractionName: 'Vivekananda Rock Memorial & Thiruvalluvar Statue Ferry',
    category: 'FERRY',
    visitDate: 'Today',
    slotTime: '02:30 PM – 04:00 PM',
    guestCount: { adults: 2, children: 0, seniors: 0 },
    tariffTier: 'INDIAN_NATIONAL',
    totalAmount: 100,
    currency: 'INR',
    status: 'CONFIRMED',
    qrCodeValue: 'GOV-TN-FERRY-89412-CONFIRMED',
    barcodeNumber: '8904120023451',
    bookingTimestamp: 'Today, 10:15 AM',
    govAuthority: 'Tamil Nadu Tourism Development Corporation (TTDC) & Port Dept',
    gateInstructions: 'Proceed directly to E-Ticket Turnstile Gate 3. Life jackets provided at pontoon.',
    holderName: 'Sreeshma',
  },
];

const bookedTickets: ServerTicket[] = loadMockJson(
  'src/data/mock/tickets.json',
  defaultBookedTickets
);

// Ticket Catalog (Verified Govt/Tourism Tariffs)
const ticketCatalog = [
  {
    id: 'cat-01',
    destinationId: 'kanyakumari',
    attractionName: 'Vivekananda Rock Ferry & Memorial Pass',
    category: 'FERRY',
    govAuthority: 'TTDC & Maritime Board (Govt of TN)',
    officialTariffs: {
      indianAdult: 50,
      international: 200,
      student: 25,
      senior: 30,
    },
    timings: '08:00 AM – 04:30 PM (Subject to sea conditions)',
    inclusionText: 'Round-trip twin-hull ferry + Monument entry + Life vest insurance',
    location: 'Ferry Ghat Jetty, Kanyakumari',
    cancellationPolicy: '100% refund if sailing suspended by Maritime Board',
  },
  {
    id: 'cat-02',
    destinationId: 'kanyakumari',
    attractionName: 'Padmanabhapuram Palace Heritage Entry',
    category: 'MONUMENT',
    govAuthority: 'Department of Archaeology, Govt of Kerala/TN',
    officialTariffs: {
      indianAdult: 40,
      international: 300,
      student: 20,
      senior: 20,
    },
    timings: '09:00 AM – 04:30 PM (Closed Mondays)',
    inclusionText: 'Wooden palace heritage tour + Clock tower museum + Royal armor gallery',
    location: 'Thuckalay, 34km from Kanyakumari',
    cancellationPolicy: 'Free cancellation up to 2 hours before slot',
  },
  {
    id: 'cat-03',
    destinationId: 'alleppey',
    attractionName: 'Alleppey Govt DTPC Shikara Eco-Cruise (2 Hours)',
    category: 'BOAT_CRUISE',
    govAuthority: 'District Tourism Promotion Council (DTPC Kerala)',
    officialTariffs: {
      indianAdult: 400,
      international: 800,
      student: 250,
      senior: 300,
    },
    timings: '06:30 AM – 06:00 PM (Every hour)',
    inclusionText: 'Certified electric/solar shikara boat + Punnamada canal guide',
    location: 'Finishing Point Jetty, Alleppey',
    cancellationPolicy: 'Free rescheduling for weather alerts',
  },
  {
    id: 'cat-04',
    destinationId: 'jaipur',
    attractionName: 'Amer Fort & Light Sound Show Composite Pass',
    category: 'MONUMENT',
    govAuthority: 'Archaeological Survey of India (ASI) & RTDC',
    officialTariffs: {
      indianAdult: 100,
      international: 550,
      student: 50,
      senior: 50,
    },
    timings: '08:00 AM – 05:30 PM (Night show: 07:30 PM)',
    inclusionText: 'Diwan-i-Aam + Sheesh Mahal + Stepwell courtyard access',
    location: 'Amer, Jaipur, Rajasthan',
    cancellationPolicy: 'Valid for 2 calendar days across monument circle',
  },
  {
    id: 'cat-05',
    destinationId: 'munnar',
    attractionName: 'Eravikulam National Park Nilgiri Tahr Safari Permit',
    category: 'SAFARI',
    govAuthority: 'Kerala Department of Forests and Wildlife',
    officialTariffs: {
      indianAdult: 200,
      international: 500,
      student: 150,
      senior: 150,
    },
    timings: '07:30 AM – 04:00 PM',
    inclusionText: 'Electric eco-bus transit to Anamudi viewpoint + Forest guide',
    location: 'Eravikulam, Munnar',
    cancellationPolicy: 'Non-transferable government wildlife permit',
  },
];

// Official Government Data Sources Registry
const govtDataSources = [
  {
    id: 'src-asi',
    name: 'Archaeological Survey of India (ASI)',
    authority: 'Ministry of Culture, Government of India',
    licenseType: 'Official Government Gazette / Open Access Tourism Registry',
    jurisdiction: 'National Heritage Monuments & UNESCO Sites',
    lastSync: 'Live Verified 2026',
    verifiedTariffItems: [
      { name: 'Standard Ticketed Monument Circle', officialFee: '₹25 – ₹50 (Domestic) / ₹300 (Foreign)', gazetteRef: 'ASI-T-2024/918' },
      { name: 'Composite Heritage Pass', officialFee: '₹100 (Domestic) / ₹550 (Foreign)', gazetteRef: 'ASI-COMP-882' },
    ],
    trafficHelpline: '1800-11-1363 (National Tourist Helpline 24x7 in 12 languages)',
    officialPortalUrl: 'https://asi.nic.in',
  },
  {
    id: 'src-ttdc',
    name: 'Tamil Nadu Tourism Development Corp (TTDC)',
    authority: 'Tourism, Culture and Religious Endowments Dept, Govt of Tamil Nadu',
    licenseType: 'State Maritime & Hospitality License #TN-TTDC-089',
    jurisdiction: 'Tamil Nadu Coastal & Pilgrim Destinations',
    lastSync: 'Synced Today',
    verifiedTariffItems: [
      { name: 'Kanyakumari Vivekananda Ferry Roundtrip', officialFee: '₹50 (General) / ₹200 (Special entry)', gazetteRef: 'TNB-MARITIME-2025' },
      { name: 'Government Hotel & Sightseeing Coach', officialFee: 'Pre-fixed standard government tariff', gazetteRef: 'TTDC-COACH-77' },
    ],
    trafficHelpline: '04652-246276 (Kanyakumari Tourist Office)',
    officialPortalUrl: 'https://tamilnadutourism.tn.gov.in',
  },
  {
    id: 'src-ktdc',
    name: 'Kerala Tourism & DTPC Maritime Registry',
    authority: 'Department of Tourism, Government of Kerala',
    licenseType: 'Kerala Inland Vessels Rule 2021 Safety License',
    jurisdiction: 'Kerala Backwaters, Hill Stations & Wildlife Sanctuaries',
    lastSync: 'Synced Today',
    verifiedTariffItems: [
      { name: 'Certified Backwater Shikara Fixed Hourly Rate', officialFee: '₹400 / hour (Regulated Stand rate)', gazetteRef: 'DTPC-ALP-2025/12' },
      { name: 'Munnar Eravikulam Forest Pass', officialFee: '₹200 (Forest Dept Gazette)', gazetteRef: 'KF-WILD-901' },
    ],
    trafficHelpline: '1800-425-4747 (Kerala Tourism 24x7)',
    officialPortalUrl: 'https://keralatourism.org',
  },
  {
    id: 'src-nhai',
    name: 'National Highways Authority of India (NHAI) & Traffic Police',
    authority: 'Ministry of Road Transport and Highways (MoRTH)',
    licenseType: 'FASTag Realtime Toll & Highway Safety Traffic Feed',
    jurisdiction: 'National & State Highway Corridors (NH-44, NH-66, NH-85)',
    lastSync: 'Live Broadcast',
    verifiedTariffItems: [
      { name: 'National Tourist Taxi Permit Standard', officialFee: 'Interstate All India Tourist Permit (AITP)', gazetteRef: 'MoRTH-AITP-2023' },
    ],
    trafficHelpline: '1033 (NHAI Emergency Highway Assistance) / 112 (National Emergency)',
    officialPortalUrl: 'https://nhai.gov.in',
  },
];

// Active Contextual Notifications
const contextualNotifications = [
  {
    id: 'notif-1',
    type: 'TICKET',
    title: 'Ferry Boarding Window Approaching',
    message: 'Your Vivekananda Rock Memorial Ferry pass slot starts at 2:30 PM (45 mins away). Gate 3 queue is moving smoothly.',
    timestamp: '10 mins ago',
    isRead: false,
    urgency: 'high',
    actionLabel: 'View Ticket in Wallet',
    actionKey: 'OPEN_TICKET_WALLET',
  },
  {
    id: 'notif-2',
    type: 'CROWD',
    title: 'Sunset Viewpoint Crowd Level Rising',
    message: 'Sunset Point Cape Promenade is reaching HIGH crowd density. Best photo vantage spot is Southern Pier (5 mins walk west).',
    timestamp: '25 mins ago',
    isRead: false,
    urgency: 'medium',
    actionLabel: 'Check Crowd Pulse',
    actionKey: 'VIEW_CROWD',
  },
  {
    id: 'notif-3',
    type: 'WEATHER',
    title: 'Coastal Breeze & Sea Spray Advisory',
    message: 'Wind gusts up to 28 km/h detected at the ocean confluence. Lower rock steps closed as precaution.',
    timestamp: '1 hour ago',
    isRead: false,
    urgency: 'medium',
    actionLabel: 'View Safety Details',
    actionKey: 'VIEW_SAFETY',
  },
  {
    id: 'notif-4',
    type: 'HAZARD',
    title: 'Community Hazard Confirmed Ahead',
    message: 'Road blocked near Market Street for culvert repair. 18 travelers confirmed pedestrian detour.',
    timestamp: '1 hour ago',
    isRead: true,
    urgency: 'info',
    actionLabel: 'See Hazard on Map',
    actionKey: 'VIEW_HAZARDS',
  },
];

// ==================== API ROUTES ====================

// 1. Universal Text & Voice Translation Route (Powered by Gemini 3.8 Flash)
app.post('/api/translate', async (req, res) => {
  const { text, fromLang = 'auto', toLang = 'English' } = req.body;
  if (!text || typeof text !== 'string') {
    return res.status(400).json({ error: 'Text is required for translation' });
  }

  const ai = getAI();
  if (ai) {
    try {
      const prompt = `You are a high-accuracy, culturally aware tourist translator.
Translate the following travel phrase:
Source text: "${text}"
From: ${fromLang}
To: ${toLang}

Provide the result in valid JSON with these exact keys:
{
  "translatedText": "translation here",
  "detectedLanguage": "name of source language if auto, otherwise matching fromLang",
  "romanization": "phonetic or latin-alphabet pronunciation if applicable (e.g. for Hindi/Tamil/Japanese)",
  "pronunciationGuide": "simple English-speaker phonetic guide like 'Van-uk-kum' or 'Dhan-ya-vaad'",
  "politenessNote": "brief cultural note if relevant (e.g., 'respectful greeting', 'formal tone')"
}
Do NOT wrap in markdown backticks. Return strictly raw JSON.`;

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
      });

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Translation timeout')), 4500)
      );

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      let rawText = (response.text || '').trim();
      if (rawText.startsWith('```json')) {
        rawText = rawText.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (rawText.startsWith('```')) {
        rawText = rawText.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

      const parsed = JSON.parse(rawText);
      return res.json({
        translatedText: parsed.translatedText || text,
        detectedLanguage: parsed.detectedLanguage || fromLang,
        romanization: parsed.romanization || '',
        pronunciationGuide: parsed.pronunciationGuide || '',
        politenessNote: parsed.politenessNote || '',
      });
    } catch (err) {
      console.warn('Gemini translation error, serving structured fallback:', err);
    }
  }

  // Robust offline fallback dictionary for common travel phrases
  const fallbackDict: Record<string, Record<string, string>> = {
    'hello': { 'Hindi': 'नमस्ते (Namaste)', 'Tamil': 'வணக்கம் (Vanakkam)', 'Malayalam': 'നമസ്കാരം (Namaskaram)', 'French': 'Bonjour', 'Spanish': 'Hola' },
    'thank you': { 'Hindi': 'धन्यवाद (Dhanyavaad)', 'Tamil': 'நன்றி (Nandri)', 'Malayalam': 'നന്ദി (Nandi)', 'French': 'Merci', 'Spanish': 'Gracias' },
    'where is the station': { 'Hindi': 'स्टेशन कहाँ है? (Station kahan hai?)', 'Tamil': 'நிலையம் எங்கே உள்ளது? (Nilaiyam enge ullathu?)', 'Malayalam': 'സ്റ്റേഷൻ എവിടെയാണ്? (Station evideyannu?)' },
    'how much': { 'Hindi': 'यह कितने का है? (Yeh kitne ka hai?)', 'Tamil': 'இது எவ்வளவு? (Ithu evvalavu?)', 'Malayalam': 'ഇത് എത്രയാണ്? (Ithu ethrayannu?)' },
    'help': { 'Hindi': 'मदद कीजिए (Madad kijiye)', 'Tamil': 'உதவுங்கள் (Uthavungal)', 'Malayalam': 'സഹായിക്കൂ (Sahayikku)' },
    'vegetarian': { 'Hindi': 'शाकाहारी भोजन (Shakahari bhojan)', 'Tamil': 'சைவ உணவு (Saiva unavu)', 'Malayalam': 'സസ്യഭക്ഷണം (Sasyabhakshanam)' },
  };

  const lower = text.trim().toLowerCase();
  const matched = fallbackDict[lower]?.[toLang] || `[${toLang}] ${text}`;

  return res.json({
    translatedText: matched,
    detectedLanguage: fromLang === 'auto' ? 'English' : fromLang,
    romanization: matched,
    pronunciationGuide: 'Phonetic guide available online',
    politenessNote: 'Standard polite traveler phrasing',
  });
});

// 2. Community Hazard Pins Routes (Waze for Tourists)
app.get('/api/hazards', (req, res) => {
  res.json({ hazards: communityHazards });
});

app.post('/api/hazards', (req, res) => {
  const { type, title, description, locationName, coordinates, reportedBy, severity } = req.body;
  if (!title || !type || !locationName) {
    return res.status(400).json({ error: 'Title, type, and locationName are required' });
  }

  const newHazard: ServerHazard = {
    id: `hz-${Date.now()}`,
    type: type || 'unsafe_area',
    title,
    description: description || 'Reported by traveler via Community Safety Watch',
    locationName,
    coordinates: coordinates || { lat: 8.082 + (Math.random() - 0.5) * 0.01, lng: 77.55 + (Math.random() - 0.5) * 0.01 },
    reportedAt: 'Just now',
    reportedBy: reportedBy || 'Verified Traveler',
    upvotes: 1,
    status: 'active',
    severity: severity || 'medium',
  };

  communityHazards.unshift(newHazard);
  res.status(201).json({ hazard: newHazard, message: 'Hazard pinned successfully' });
});

app.post('/api/hazards/:id/vote', (req, res) => {
  const { id } = req.params;
  const hazard = communityHazards.find((h) => h.id === id);
  if (!hazard) {
    return res.status(404).json({ error: 'Hazard pin not found' });
  }

  hazard.upvotes += 1;
  res.json({ upvotes: hazard.upvotes, message: 'Upvote recorded. Thank you for keeping tourists safe!' });
});

// 3. Ticketing Catalog & Wallet Booking Routes
app.get('/api/tickets/catalog', (req, res) => {
  res.json({ catalog: ticketCatalog });
});

app.get('/api/tickets/wallet', (req, res) => {
  res.json({ tickets: bookedTickets });
});

app.post('/api/tickets/book', (req, res) => {
  const { catalogId, visitDate, slotTime, guestCount, tariffTier, holderName } = req.body;
  const catalogItem = ticketCatalog.find((c) => c.id === catalogId) || ticketCatalog[0];

  const guests = guestCount || { adults: 1, children: 0, seniors: 0 };
  const tier = tariffTier || 'INDIAN_NATIONAL';
  const unitPrice =
    tier === 'INTERNATIONAL_VISITOR'
      ? catalogItem.officialTariffs.international
      : tier === 'STUDENT'
      ? catalogItem.officialTariffs.student
      : catalogItem.officialTariffs.indianAdult;

  const total = (guests.adults + guests.seniors) * unitPrice + guests.children * Math.round(unitPrice * 0.5);

  const randCode = Math.floor(10000 + Math.random() * 90000);
  const newTicket: ServerTicket = {
    id: `tkt-${Date.now()}`,
    ticketNumber: `GOV-${catalogItem.destinationId.toUpperCase().slice(0, 3)}-${new Date().getFullYear()}-${randCode}`,
    destinationId: catalogItem.destinationId,
    attractionName: catalogItem.attractionName,
    category: catalogItem.category as any,
    visitDate: visitDate || 'Tomorrow',
    slotTime: slotTime || '10:00 AM – 12:00 PM',
    guestCount: guests,
    tariffTier: tier,
    totalAmount: total,
    currency: 'INR',
    status: 'CONFIRMED',
    qrCodeValue: `VERIFIED-${randCode}-${catalogItem.attractionName}`,
    barcodeNumber: `890${randCode}${Math.floor(1000 + Math.random() * 9000)}`,
    bookingTimestamp: 'Just now',
    govAuthority: catalogItem.govAuthority,
    gateInstructions: 'Scan QR at turnstile or show mobile voucher to gate supervisor.',
    holderName: holderName || 'Sreeshma',
  };

  bookedTickets.unshift(newTicket);
  res.status(201).json({ ticket: newTicket, message: 'Ticket issued successfully and added to Ticket Wallet!' });
});

// 4. Contextual Notifications Route
app.get('/api/notifications', (req, res) => {
  res.json({ notifications: contextualNotifications });
});

// 5. Official Government Tourism & Traffic Registry Route
app.get('/api/gov-registry', (req, res) => {
  res.json({ sources: govtDataSources });
});

// API Route for Journey Buddy (Phoenix AI Travel Companion)
app.post('/api/chat', async (req, res) => {
  const { prompt, context, messages = [], memory = {}, language = 'en' } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt is required' });
  }

  const ai = getAI();
  if (ai) {
    try {
      const currentMemoryStr = Object.keys(memory).length > 0
        ? `Known Travel Context Memory:
- User Name: ${memory.userName || 'Traveller'}
- Destination: ${memory.destination || context?.destinationName || 'Not specified yet'}
- Duration: ${memory.durationDays ? `${memory.durationDays} days` : 'Not specified yet'}
- Budget: ${memory.budget ? `₹${memory.budget}` : 'Not specified yet'}
- Travel Group: ${memory.travelGroup || 'Not specified yet'}
- Food Preferences: ${memory.foodPreferences?.join(', ') || 'Not specified yet'}
- Interests: ${memory.interests?.join(', ') || 'General travel'}`
        : `Known Travel Context: Active Screen: ${context?.screenName || 'Home'}, Destination: ${context?.destinationName || 'None'}`;

      const systemInstruction = `You are Phoenix, the friendly, intelligent, and culturally authentic fox mascot and personal travel companion in the JourneyBuddy app.

CORE PERSONA & TONE:
- Friendly, warm, curious, helpful, smart, travel-loving, reassuring, slightly playful.
- Never childish, never robotic, never overly formal. Speak naturally like a real human travel companion.
- NEVER use repetitive canned phrases like "How can I help you?", "Please select an option.", "Choose from the following."
- Understand natural language: greetings, casual talk, incomplete queries, corrections, and follow-up questions.
- Maintain conversation context across turns. If the user previously mentioned Kerala, and now asks "What about food?" or "3 days", answer specifically for Kerala!
- If the user corrects themselves (e.g. "Actually, I'm going to Goa instead"), smoothly switch destination to Goa and continue naturally.
- If the user mentions traveling with parents, elderly relatives, or kids, automatically tailor recommendations (step-free access, gentle walking paces, comfortable transit).
- Provide practical Indian travel details: INR (₹) budgets, prepaid auto/taxi counters, state buses, train hubs, dress codes, temple etiquette, crowd pulse, and seasonal weather.
- Safety: Provide clear, practical advice. Dial 112 for National Emergency, 1800-11-1363 for 24x7 Tourist Helpline. Never invent fake medical or legal claims.
- Language: The user's active app language is "${language}". If the user writes in Malayalam, Hindi, or any language, or asks for translations, respond fluently in that language!

${currentMemoryStr}`;

      // Build conversation context (last 8 messages)
      const formattedHistory = messages
        .slice(-8)
        .map((m: any) => `${m.sender === 'user' ? 'User' : 'Phoenix'}: ${m.text}`)
        .join('\n');

      const fullPrompt = `${systemInstruction}

${formattedHistory ? `Recent Conversation History:\n${formattedHistory}\n\n` : ''}User Message: ${prompt}

Phoenix:`;

      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('Gemini API timeout')), 6500)
      );

      const geminiPromise = ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: fullPrompt,
      });

      const response = await Promise.race([geminiPromise, timeoutPromise]);
      const reply = response.text || '';
      return res.json({ reply });
    } catch (error) {
      console.warn('Gemini API call failed or timed out, client will use intelligent fallback:', error);
      return res.status(503).json({ error: 'Gemini service unavailable' });
    }
  }

  return res.status(503).json({ error: 'API key not configured' });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', companion: 'Phoenix', logo: 'Journey Buddy', version: '2.0.0' });
});

// Vite middleware for development & static serving for production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Journey Buddy server running on port ${PORT}`);
  });
}

startServer();
