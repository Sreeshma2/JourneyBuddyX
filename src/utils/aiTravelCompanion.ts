import { ALL_DESTINATIONS_DATA } from '../data/destinations';
import { JourneyBuddyAction, TravelContextMemory, ChatMessage, SupportedLanguage } from '../types';

export interface AIResponse {
  reply: string;
  actions: JourneyBuddyAction[];
  suggestedFollowUps?: string[];
  updatedMemory?: TravelContextMemory;
}

/**
 * Extracts and updates conversational memory from natural language
 */
export function extractConversationalContext(
  query: string,
  currentMemory: TravelContextMemory
): TravelContextMemory {
  const memory: TravelContextMemory = { ...currentMemory };
  const q = query.toLowerCase().trim();

  // 1. Detect Destination (including switches like "Actually, I'm going to Goa instead")
  const switchKeywords = ['instead', 'actually', 'rather', 'change to', 'switch to', 'heading to', 'going to', 'visit', 'trip to'];
  const matchedDest = ALL_DESTINATIONS_DATA.find((d) => {
    const nameMatch = q.includes(d.name.toLowerCase());
    const idMatch = q.includes(d.id.toLowerCase());
    return nameMatch || idMatch;
  });

  if (matchedDest) {
    memory.destination = matchedDest.name;
    memory.destinationId = matchedDest.id;
  } else if (q.includes('kerala')) {
    memory.destination = 'Kerala';
    memory.destinationId = 'munnar';
  } else if (q.includes('goa')) {
    memory.destination = 'Goa';
    memory.destinationId = 'goa';
  } else if (q.includes('kashmir')) {
    memory.destination = 'Kashmir';
    memory.destinationId = 'gulmarg';
  } else if (q.includes('rajasthan')) {
    memory.destination = 'Rajasthan';
    memory.destinationId = 'jaipur';
  }

  // 2. Detect Duration (e.g. "3 days", "a week", "2 days", "weekend")
  const daysMatch = q.match(/(\d{1,2})\s*(day|days|night|nights)/);
  if (daysMatch) {
    memory.durationDays = parseInt(daysMatch[1], 10);
  } else if (q.includes('weekend')) {
    memory.durationDays = 2;
  } else if (q.includes('week') || q.includes('7 days')) {
    memory.durationDays = 7;
  }

  // 3. Detect Budget (e.g. "5000", "₹10,000", "under 15000")
  const budgetMatch = q.match(/₹?\s*(\d{1,2},?\d{3,5})/);
  if (budgetMatch) {
    const val = parseInt(budgetMatch[1].replace(/,/g, ''), 10);
    if (val >= 500) {
      memory.budget = val;
    }
  }

  // 4. Detect Travel Group (e.g. "with my parents", "family", "solo", "with wife/husband", "friends")
  if (q.includes('parent') || q.includes('mom') || q.includes('dad') || q.includes('elderly')) {
    memory.travelGroup = 'parents';
  } else if (q.includes('family') || q.includes('kids') || q.includes('children')) {
    memory.travelGroup = 'family';
  } else if (q.includes('solo') || q.includes('alone') || q.includes('myself')) {
    memory.travelGroup = 'solo';
  } else if (q.includes('friend') || q.includes('group') || q.includes('colleagues')) {
    memory.travelGroup = 'friends';
  } else if (q.includes('couple') || q.includes('partner') || q.includes('honeymoon')) {
    memory.travelGroup = 'couple';
  }

  // 5. Food preferences
  if (q.includes('veg') && !q.includes('non-veg')) {
    memory.foodPreferences = ['Vegetarian'];
  } else if (q.includes('seafood') || q.includes('fish')) {
    memory.foodPreferences = ['Coastal Seafood'];
  }

  return memory;
}

/**
 * Intelligent Phoenix Conversational Engine (Fallback & Local Memory Handler)
 */
export function getInteractiveAssistantReply(
  query: string,
  context: { screenName: string; destinationName?: string; contextId?: string },
  history: ChatMessage[] = [],
  memoryBuffer: TravelContextMemory = {},
  language: SupportedLanguage = 'en'
): AIResponse {
  const q = query.toLowerCase().trim();
  const updatedMemory = extractConversationalContext(query, memoryBuffer);

  // Check active destination
  const activeDestName = updatedMemory.destination || context.destinationName;
  const activeDest = activeDestName
    ? ALL_DESTINATIONS_DATA.find(
        (d) =>
          d.name.toLowerCase() === activeDestName.toLowerCase() ||
          d.id.toLowerCase() === activeDestName.toLowerCase()
      )
    : undefined;

  // 1. Natural Casual Greetings (e.g. "Hi", "Hello", "Hey", "Good morning", "Namaste")
  if (
    q === 'hi' ||
    q === 'hello' ||
    q === 'hey' ||
    q === 'hey!' ||
    q === 'namaste' ||
    q.startsWith('good morning') ||
    q.startsWith('good afternoon') ||
    q.startsWith('good evening')
  ) {
    const greetingText =
      language === 'ml'
        ? 'നമസ്കാരം! 🦊💙 ഞാൻ ഫീനിക്സ്, നിങ്ങളുടെ യാത്രാ സഹായി. ഇന്ന് നമ്മൾ എങ്ങോട്ടാണ് യാത്ര പ്ലാൻ ചെയ്യുന്നത്?'
        : language === 'hi'
        ? 'नमस्ते! 🦊💙 मैं फ़ीनिक्स हूँ, आपका यात्रा साथी। आज हम कहाँ चलने की योजना बना रहे हैं?'
        : "Hey! 🦊💙 I'm Phoenix, your JourneyBuddy. Where are we heading today?";

    return {
      reply: greetingText,
      actions: [
        { label: 'Plan a Trip', actionKey: 'OPEN_PLANNER' },
        { label: 'Explore Destinations', actionKey: 'VIEW_EXPLORE' },
      ],
      suggestedFollowUps: [
        "I'm going to Kerala.",
        "Plan a 3-day trip to Goa",
        'Help me with my budget',
        'Recommend offbeat hill stations',
      ],
      updatedMemory,
    };
  }

  // 2. Ambiguity / "I don't know" / "Not sure" / "Help me choose"
  if (
    q === "i don't know" ||
    q === 'dont know' ||
    q === 'not sure' ||
    q === 'help me choose' ||
    q === 'no idea' ||
    q.includes('suggest somewhere')
  ) {
    return {
      reply:
        "No worries! I can help you figure it out. 🗺️ How many days do you have, and what's your approximate budget or preferred vibe (beaches, misty hills, or historic temples)?",
      actions: [
        { label: 'Explore Popular Spots', actionKey: 'VIEW_EXPLORE' },
        { label: 'Hill Stations', actionKey: 'VIEW_EXPLORE', data: { filter: 'Hill Stations' } },
      ],
      suggestedFollowUps: [
        '3 days with ₹5,000 budget',
        'A relaxing weekend hill station',
        'Beach trip with parents',
      ],
      updatedMemory,
    };
  }

  // 3. Correction / Destination Switch (e.g. "Actually, I'm going to Goa instead")
  if (
    q.includes('instead') ||
    q.includes('actually') ||
    (q.includes('goa') && memoryBuffer.destination && memoryBuffer.destination.toLowerCase() !== 'goa')
  ) {
    if (updatedMemory.destination?.toLowerCase() === 'goa') {
      return {
        reply:
          "Got it, switching our compass to Goa! 🏖️ Are you thinking North Goa with its lively beach shacks and colorful markets, or a peaceful heritage stay in South Goa?",
        actions: [
          { label: 'Explore Goa Details', actionKey: 'VIEW_DESTINATION', data: { destinationId: 'goa' } },
          { label: 'Plan Goa Itinerary', actionKey: 'PLAN_TRIP', data: { destinationId: 'goa' } },
        ],
        suggestedFollowUps: [
          "I'm traveling with my parents",
          'What about food in Goa?',
          'What is a good budget for 3 days in Goa?',
        ],
        updatedMemory,
      };
    }
  }

  // 4. Traveling with parents or family
  if (updatedMemory.travelGroup === 'parents' || q.includes('parent') || q.includes('elderly')) {
    const destName = updatedMemory.destination || 'your destination';
    return {
      reply: `Traveling with parents is wonderful! ❤️ For ${destName}, here are thoughtful considerations:
• Comfort-first transit: Opt for prepaid AC taxis or station pick-ups to minimize walking with luggage.
• Step-free & serene spots: Choose sights with ramp access, seated sunset viewpoints, and well-paved heritage paths.
• Rest breaks: Schedule relaxed mornings with late breakfasts, avoiding midday peak sun and crowded festival hours.
• Dietary comfort: Select family restaurants serving freshly made warm regional thalis and gentle spices.`,
      actions: [
        { label: 'View Lifeline & Safety', actionKey: 'OPEN_LIFELINE' },
        { label: 'Step-Free Places', actionKey: 'VIEW_EXPLORE', data: { filter: 'Step-Free' } },
      ],
      suggestedFollowUps: [
        `What food is gentle and authentic in ${destName}?`,
        'Find prepaid taxis with verified drivers',
        'What should I pack for elderly parents?',
      ],
      updatedMemory,
    };
  }

  // 5. "What about food?" (Uses active destination from memory!)
  if (
    q.includes('food') ||
    q.includes('eat') ||
    q.includes('dish') ||
    q.includes('cuisine') ||
    q === 'what about food?' ||
    q === 'what about food'
  ) {
    if (activeDest) {
      const foodItems =
        activeDest.smartLocal?.localFood?.map((f) => `• ${f.name}: ${f.description} (${f.priceEstimate})`).join('\n') ||
        '• Regional Thali, fresh local breads, and aromatic street delicacies.';

      return {
        reply: `Oh, ${activeDest.name}'s food scene is delightful! 🍲
${foodItems}

• Phoenix Food Tip: Look for restaurants bustling with local families—high turnover ensures freshly ground spices and authentic preparations! Are you interested in vegetarian specialties or coastal delicacies?`,
        actions: [
          { label: `View ${activeDest.name} Guide`, actionKey: 'VIEW_DESTINATION', data: { destinationId: activeDest.id } },
        ],
        suggestedFollowUps: [
          `Is ${activeDest.name} safe for night walks?`,
          `How do I reach ${activeDest.name} from the station?`,
          `Plan a 3-day itinerary for ${activeDest.name}`,
        ],
        updatedMemory,
      };
    } else if (updatedMemory.destination?.toLowerCase() === 'kerala') {
      return {
        reply: `Kerala's cuisine is truly world-class! 🌴🍛
• Fluffy Appam with fragrant Vegetable Stew or Egg Roast
• Flaky Malabar Parotta with creamy kurma or peppery curries
• Karimeen Pollichathu (pearl spot fish wrapped in charred banana leaf)
• Traditional Sadhya (served on a fresh banana leaf with over 20 side dishes)
• Sweet tender Coconut Payasam & hot cardamom tea

Do you prefer pure vegetarian dining, or would you like to explore authentic coastal seafood?`,
        actions: [
          { label: 'Explore Munnar & Alleppey', actionKey: 'VIEW_DESTINATION', data: { destinationId: 'munnar' } },
        ],
        suggestedFollowUps: [
          'What are the best vegetarian spots in Kerala?',
          'Find a 3-day Kerala itinerary',
          'What is the weather like right now?',
        ],
        updatedMemory,
      };
    }
  }

  // 6. Incomplete / Duration query: "3 days", "2 days", "weekend"
  if (
    (q.includes('day') || q.includes('days') || q.includes('weekend')) &&
    !q.includes('budget') &&
    q.length < 25
  ) {
    const days = updatedMemory.durationDays || 3;
    const dest = updatedMemory.destination || 'your destination';

    return {
      reply: `Got it, ${days} days in ${dest}! 🎒 That's a great timeframe.
Here is how we can structure it:
• Day 1: Smooth arrival, check-in, local cuisine lunch, and a relaxing sunset viewpoint.
• Day 2: Signature heritage monument or scenic nature excursion during morning low-crowd hours, followed by local crafts.
• Day 3: Cultural bazaar walk, authentic regional breakfast, and relaxed return transit.

Would you like me to tailor this for relaxing, adventure, or traveling with family?`,
      actions: [
        { label: `Build ${days}-Day Itinerary`, actionKey: 'OPEN_PLANNER' },
      ],
      suggestedFollowUps: [
        'What about food?',
        "I'm traveling with my parents",
        'What should I pack?',
      ],
      updatedMemory,
    };
  }

  // 7. Initial Destination Choice: "I'm going to Kerala", "Visiting Munnar", "Trip to Goa"
  if (
    q.startsWith("i'm going to") ||
    q.startsWith('going to') ||
    q.startsWith('heading to') ||
    q.startsWith('trip to') ||
    q.startsWith('travel to')
  ) {
    const dest = updatedMemory.destination || 'there';
    return {
      reply: `Nice choice! 🌴 Are you planning a relaxing trip, an adventure, or a mix of both?`,
      actions: [
        { label: 'Build Trip Plan', actionKey: 'OPEN_PLANNER' },
        { label: `Explore ${dest}`, actionKey: 'VIEW_EXPLORE' },
      ],
      suggestedFollowUps: [
        '3 days',
        "I don't know yet",
        'What about food?',
        'Help me with my budget',
      ],
      updatedMemory,
    };
  }

  // 8. Budget Planning (e.g., "5000", "budget", "cost")
  if (q.includes('budget') || q.includes('₹') || q.includes('cost') || q.includes('price')) {
    const numBudget = updatedMemory.budget || 5000;
    const destName = updatedMemory.destination || 'your trip';

    return {
      reply: `With an approximate budget of ₹${numBudget.toLocaleString('en-IN')} for ${destName}:
• Stay (~40%): ₹${Math.round(numBudget * 0.4).toLocaleString('en-IN')} for clean, verified homestays or budget hotels.
• Food (~25%): ₹${Math.round(numBudget * 0.25).toLocaleString('en-IN')} for authentic regional thalis and breakfasts.
• Transit & Passes (~20%): ₹${Math.round(numBudget * 0.2).toLocaleString('en-IN')} for prepaid autos and state transport.
• Contingency (~15%): ₹${Math.round(numBudget * 0.15).toLocaleString('en-IN')} for souvenirs or emergencies.

Pro-tip: Booking through official tourism guest houses or KSRTC/state buses keeps travel high-quality and affordable!`,
      actions: [
        { label: 'Set Up Trip Budget', actionKey: 'OPEN_PLANNER' },
        { label: 'View Verified Stays', actionKey: 'VIEW_EXPLORE' },
      ],
      suggestedFollowUps: [
        'What should I pack?',
        'How do I find prepaid transit?',
        'Tell me about local food',
      ],
      updatedMemory,
    };
  }

  // 9. Packing Advice
  if (q.includes('pack') || q.includes('clothes') || q.includes('wear') || q.includes('luggage')) {
    const dest = updatedMemory.destination || 'your destination';
    return {
      reply: `Smart packing essentials for ${dest}:
• Lightweight, breathable cottons for daytime exploration.
• Modest clothing covering shoulders and knees for heritage temples and sanctums.
• Slip-on footwear (essential for quick removal at sacred and heritage sites).
• Power bank, offline map downloads, and a reusable water bottle.
• Basic travel medical kit: ORS hydration salts, band-aids, and motion sickness tablets.`,
      actions: [
        { label: 'Check Trip Checklist', actionKey: 'VIEW_MY_TRIP' },
      ],
      suggestedFollowUps: [
        'What temple dress codes apply?',
        'What about food?',
        'Safety tips for solo travel',
      ],
      updatedMemory,
    };
  }

  // 10. Safety & Emergency Support
  if (
    q.includes('safe') ||
    q.includes('emergency') ||
    q.includes('police') ||
    q.includes('sos') ||
    q.includes('hospital') ||
    q.includes('doctor') ||
    q.includes('helpline')
  ) {
    return {
      reply: `Emergency & Safety Assistance:
• National Emergency Helpline: Dial 112 (Police, Ambulance, Fire)
• Ministry of Tourism 24x7 Multi-lingual Helpline: 1800-11-1363
• Women's Safety Helpline: 1091
• Railway Protection Force (RPF): 139
• JourneyBuddy Lifeline: Use the one-tap "Take Me Back" feature to instantly navigate back to your verified hotel base.`,
      actions: [
        { label: 'Open Lifeline Centre', actionKey: 'OPEN_LIFELINE' },
        { label: 'Emergency Contacts', actionKey: 'VIEW_SAFETY' },
      ],
      suggestedFollowUps: [
        'Is evening travel safe?',
        'How do I verify prepaid autos?',
        'Add trusted emergency contact',
      ],
      updatedMemory,
    };
  }

  // 11. Translation Requests in Chat
  if (q.includes('translate') || q.includes('say in') || q.includes('malayalam') || q.includes('hindi')) {
    return {
      reply: `I can help you speak with locals! 🗣️
• "Hello / Greetings" in Malayalam: "Namaskaram" (നമസ്കാരം) | in Hindi: "Namaste" (नमस्ते)
• "Thank you": "Nandi" (നന്ദി) | "Dhanyavaad" (धन्यवाद)
• "How much does this cost?": "Ithinu etra roopa?" (ഇതിന് എത്ര രൂപ?) | "Kitne ka hai?" (कितने का है?)
• "Please take me to...": "...-lekk poykkolloo" (...-ലേക്ക് പൊയ്ക്കോളൂ) | "...chalo" (...चलो)

You can also use the Universal Translator tool in the app for live audio pronunciation!`,
      actions: [
        { label: 'Open Universal Translator', actionKey: 'OPEN_TRANSLATOR' },
      ],
      suggestedFollowUps: [
        'How do I ask for food?',
        'Translate emergency phrase',
      ],
      updatedMemory,
    };
  }

  // 12. Fallback: Detailed destination or conversational assistance
  if (activeDest) {
    return {
      reply: `${activeDest.name} (${activeDest.region}):
${activeDest.description}

• Crowd Pulse: ${activeDest.crowdPulse.label} (Optimal time: ${activeDest.crowdPulse.bestTime})
• Transit: ${activeDest.approximateTravelInfo}
• Estimated Budget: ~₹${activeDest.estimatedDailyBudget.toLocaleString('en-IN')}/day

What would you like to explore next—itinerary, local dishes, or safe transit?`,
      actions: [
        { label: `View ${activeDest.name}`, actionKey: 'VIEW_DESTINATION', data: { destinationId: activeDest.id } },
        { label: 'Create Itinerary', actionKey: 'OPEN_PLANNER' },
      ],
      suggestedFollowUps: [
        `What local food should I try in ${activeDest.name}?`,
        `What are the best hours to visit?`,
        `How do I reach from the nearest station?`,
      ],
      updatedMemory,
    };
  }

  // Default conversational reply
  return {
    reply: `I'm with you! 🦊 Whether you're deciding between misty hill stations, peaceful coastal getaways, or vibrant heritage towns, I can help you plan the itinerary, keep costs under control, and stay safe. Where would you like to start?`,
    actions: [
      { label: 'Explore Destinations', actionKey: 'VIEW_EXPLORE' },
      { label: 'Plan a Trip', actionKey: 'OPEN_PLANNER' },
    ],
    suggestedFollowUps: [
      "I'm going to Kerala.",
      'Help me with my budget',
      'What should I pack?',
      'Safety tips',
    ],
    updatedMemory,
  };
}
