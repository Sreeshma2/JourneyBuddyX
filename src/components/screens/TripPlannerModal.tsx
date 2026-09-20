import React, { useState } from 'react';
import { Destination, TripPlan } from '../../types';
import { PhoenixAvatar } from '../PhoenixAvatar';
import {
  X,
  Sparkles,
  Calendar,
  Users,
  Wallet,
  Clock,
  Check,
  ChevronRight,
  Accessibility,
  Compass,
} from 'lucide-react';

interface TripPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinations: Destination[];
  onGeneratePlan: (newPlan: TripPlan) => void;
  initialDestination?: Destination;
}

export const TripPlannerModal: React.FC<TripPlannerModalProps> = ({
  isOpen,
  onClose,
  destinations,
  onGeneratePlan,
  initialDestination,
}) => {
  const [selectedDestId, setSelectedDestId] = useState<string>(
    initialDestination?.id || destinations[0]?.id || 'kanyakumari'
  );
  const [durationDays, setDurationDays] = useState<number>(2);
  const [budgetTotal, setBudgetTotal] = useState<number>(5000);
  const [travellersCount, setTravellersCount] = useState<number>(2);
  const [selectedInterests, setSelectedInterests] = useState<string[]>([
    'Heritage',
    'Local Food',
    'Coastal Walks',
  ]);
  const [accessibilityNeed, setAccessibilityNeed] = useState<string>(
    'Step-free / Gentle Pacing'
  );
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  const interestOptions = [
    'Heritage',
    'Nature',
    'Local Food',
    'Photography',
    'Spiritual',
    'Relaxation',
    'Low Crowd',
    'Artisan Crafts',
  ];

  const accessibilityOptions = [
    'Standard Walking',
    'Step-free / Gentle Pacing',
    'Wheelchair Accessible Ramps',
    'Senior Citizen Friendly',
  ];

  const toggleInterest = (interest: string) => {
    if (selectedInterests.includes(interest)) {
      setSelectedInterests(selectedInterests.filter((i) => i !== interest));
    } else {
      setSelectedInterests([...selectedInterests, interest]);
    }
  };

  const handleCreatePlan = () => {
    setIsGenerating(true);

    const targetDest =
      destinations.find((d) => d.id === selectedDestId) || destinations[0];

    setTimeout(() => {
      const generatedPlan: TripPlan = {
        id: `trip-${targetDest.id}-${Date.now()}`,
        destinationId: targetDest.id,
        destinationName: targetDest.name,
        durationLabel: `${durationDays} days`,
        dates: 'Upcoming Weekend',
        numberOfTravellers: travellersCount,
        readinessPercentage: 88,
        readinessChecklist: [
          { id: 'c-1', label: `Inbound transit to ${targetDest.name} planned`, completed: true },
          { id: 'c-2', label: 'Verified heritage stay selected', completed: true },
          { id: 'c-3', label: `Budget optimized (₹${budgetTotal} estimated)`, completed: true },
          { id: 'c-4', label: 'Regional offline map cached', completed: true },
          { id: 'c-5', label: 'Add trusted emergency contact', completed: false, isWarning: true },
        ],
        budgetBreakdown: {
          transport: Math.round(budgetTotal * 0.28),
          stay: Math.round(budgetTotal * 0.4),
          food: Math.round(budgetTotal * 0.18),
          localTransport: Math.round(budgetTotal * 0.08),
          entryFees: Math.round(budgetTotal * 0.04),
          experiences: Math.round(budgetTotal * 0.02),
        },
        totalBudgetEstimated: budgetTotal,
        days: [
          {
            dayNumber: 1,
            title: `Arrival, ${targetDest.highlights[0] || 'Landmark'} & Sunset`,
            items: [
              {
                id: 'gen-1',
                time: '09:00 AM',
                title: `Arrival & Last-Mile to Town Centre`,
                subtitle: `${targetDest.lastMile.options[0]?.mode || 'Auto'} (Estimated fare: ${targetDest.lastMile.options[0]?.estimatedFare || '₹100'})`,
                category: 'last_mile',
                estimatedCost: 100,
                whyThis: `Prepaid option avoids high haggling and matches your budget.`,
              },
              {
                id: 'gen-2',
                time: '11:00 AM',
                title: targetDest.highlights[0] || 'Historical Landmark',
                subtitle: `Prime experience during low crowd window`,
                category: 'attraction',
                estimatedCost: 150,
                whyThis: `Recommended because it fits your interest in ${selectedInterests[0] || 'Heritage'} and has ${accessibilityNeed.toLowerCase()}.`,
              },
              {
                id: 'gen-3',
                time: '01:30 PM',
                title: targetDest.smartLocal.localFood[0]?.name || 'Traditional Local Meals',
                subtitle: `${targetDest.smartLocal.localFood[0]?.recommendedSpot || 'Authentic Eatery'}`,
                category: 'food',
                estimatedCost: 200,
                whyThis: `Authentic authentic regional dishes within estimated budget.`,
              },
              {
                id: 'gen-4',
                time: '05:30 PM',
                title: targetDest.highlights[1] || 'Sunset Point',
                subtitle: `Panoramic evening horizon with cultural breeze`,
                category: 'culture',
                estimatedCost: 0,
                whyThis: `Unmatched sunset view and low crowd window before dusk.`,
              },
            ],
          },
          {
            dayNumber: 2,
            title: 'Sunrise Walk, Hidden Gem & Departure',
            items: [
              {
                id: 'gen-5',
                time: '06:00 AM',
                title: 'Sunrise Vantage Gathering',
                subtitle: 'Cool morning light and photography opportunities',
                category: 'attraction',
                estimatedCost: 0,
                whyThis: 'Best time to visit with 40% lower crowd density.',
              },
              {
                id: 'gen-6',
                time: '10:00 AM',
                title: targetDest.highlights[2] || 'Cultural Discovery',
                subtitle: 'Step-free courtyards and artisan craft',
                category: 'culture',
                estimatedCost: 80,
                whyThis: `Aligned with your ${accessibilityNeed} preference.`,
              },
            ],
          },
        ],
        planBAlternative: {
          triggerReason: 'Sudden rain or temple queue surge',
          alternativeTitle: `${targetDest.name} Indoor Heritage Museum`,
          reason: 'Fully covered cultural gallery with step-free elevators, protected from weather disruption.',
          distance: '2.5 km from center',
          travelTime: '10 mins by auto',
        },
      };

      setIsGenerating(false);
      onGeneratePlan(generatedPlan);
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label="AI Trip Planner"
    >
      <div className="w-full max-w-md h-[95vh] sm:h-[720px] bg-slate-50 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="bg-blue-900 text-white px-4 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2.5">
            <PhoenixAvatar size="sm" mood="happy" withGlow animate />
            <div>
              <h2 className="font-extrabold text-sm tracking-tight text-white flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>AI Trip Planner</span>
              </h2>
              <p className="text-[11px] text-blue-200">
                Personalized journey crafted by Phoenix
              </p>
            </div>
          </div>

          <button
            id="trip-planner-close-btn"
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Close trip planner"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Destination Selector */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
            <label className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Destination
            </label>
            <select
              value={selectedDestId}
              onChange={(e) => setSelectedDestId(e.target.value)}
              className="w-full bg-slate-50 text-sm font-semibold p-3 rounded-xl border border-slate-200 text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600/30"
            >
              {destinations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name} ({d.region.split('•')[0]})
                </option>
              ))}
            </select>
          </div>

          {/* Duration & Travellers */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Duration
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {durationDays} Days
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setDurationDays(Math.max(1, durationDays - 1))}
                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setDurationDays(Math.min(5, durationDays + 1))}
                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1.5">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                Travellers
              </span>
              <div className="flex items-center justify-between">
                <span className="font-bold text-slate-900 text-sm">
                  {travellersCount} People
                </span>
                <div className="flex gap-1">
                  <button
                    onClick={() => setTravellersCount(Math.max(1, travellersCount - 1))}
                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold flex items-center justify-center"
                  >
                    -
                  </button>
                  <button
                    onClick={() => setTravellersCount(Math.min(6, travellersCount + 1))}
                    className="w-7 h-7 bg-slate-100 hover:bg-slate-200 rounded-lg text-sm font-bold flex items-center justify-center"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Budget Range */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                Estimated Total Budget
              </span>
              <span className="text-base font-black text-blue-900">
                ₹{budgetTotal.toLocaleString()}
              </span>
            </div>
            <input
              type="range"
              min="2000"
              max="15000"
              step="500"
              value={budgetTotal}
              onChange={(e) => setBudgetTotal(Number(e.target.value))}
              className="w-full accent-blue-900 cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-slate-400">
              <span>₹2,000 (Budget)</span>
              <span>₹8,000 (Moderate)</span>
              <span>₹15,000 (Comfort)</span>
            </div>
          </div>

          {/* Interests Chips */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
              Travel Interests
            </span>
            <div className="flex flex-wrap gap-1.5">
              {interestOptions.map((opt) => {
                const isSelected = selectedInterests.includes(opt);
                return (
                  <button
                    key={opt}
                    onClick={() => toggleInterest(opt)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors flex items-center gap-1 ${
                      isSelected
                        ? 'bg-blue-900 text-white'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3" />}
                    <span>{opt}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Accessibility Preferences */}
          <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1">
              <Accessibility className="w-3.5 h-3.5 text-blue-700" />
              Accessibility & Pace
            </span>
            <select
              value={accessibilityNeed}
              onChange={(e) => setAccessibilityNeed(e.target.value)}
              className="w-full bg-slate-50 text-xs font-semibold p-2.5 rounded-xl border border-slate-200 text-slate-800"
            >
              {accessibilityOptions.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Footer Action */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0">
          <button
            id="trip-planner-generate-btn"
            onClick={handleCreatePlan}
            disabled={isGenerating}
            className="w-full bg-blue-900 hover:bg-blue-800 active:bg-blue-950 text-white font-bold text-sm py-3.5 px-4 rounded-2xl shadow-md flex items-center justify-center gap-2 transition-transform active:scale-[0.99] min-h-[48px]"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Phoenix is crafting your journey...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Generate Smart Itinerary with Phoenix</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
