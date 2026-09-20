import React, { useState } from 'react';
import { TripPlan } from '../../types';
import { PhoenixAvatar } from '../PhoenixAvatar';
import {
  Clock,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  MapPin,
  Bus,
  Train,
  Utensils,
  Hotel,
  Landmark,
  ShieldCheck,
  RotateCcw,
  Compass,
  ArrowDown,
  Info,
} from 'lucide-react';

interface MyTripScreenProps {
  tripPlan: TripPlan;
  onAskJourneyBuddy: (prompt: string) => void;
  onOpenLifeline: () => void;
  onOpenSafety: () => void;
  onOpenReviewModal?: () => void;
}

export const MyTripScreen: React.FC<MyTripScreenProps> = ({
  tripPlan,
  onAskJourneyBuddy,
  onOpenLifeline,
  onOpenSafety,
  onOpenReviewModal,
}) => {
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [showPlanB, setShowPlanB] = useState<boolean>(false);
  const [planBApplied, setPlanBApplied] = useState<boolean>(false);
  const [showBudgetDetails, setShowBudgetDetails] = useState<boolean>(false);

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'travel':
        return <Train className="w-4 h-4 text-blue-700" />;
      case 'last_mile':
        return <Bus className="w-4 h-4 text-amber-600" />;
      case 'food':
        return <Utensils className="w-4 h-4 text-orange-600" />;
      case 'hotel':
        return <Hotel className="w-4 h-4 text-indigo-600" />;
      case 'culture':
        return <Sparkles className="w-4 h-4 text-purple-600" />;
      default:
        return <Landmark className="w-4 h-4 text-emerald-700" />;
    }
  };

  const currentDayData =
    tripPlan.days.find((d) => d.dayNumber === selectedDay) || tripPlan.days[0];

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-slate-50 text-slate-900">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200/80 px-4 pt-6 pb-4 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                My Itinerary
              </span>
              <span className="text-[10px] bg-blue-100 text-blue-900 font-bold px-1.5 py-0.2 rounded">
                {tripPlan.durationLabel}
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              {tripPlan.destinationName}
            </h1>
            <p className="text-xs text-slate-500">{tripPlan.dates}</p>
          </div>

          <button
            onClick={() => onAskJourneyBuddy('Can you optimize my day?')}
            className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold px-3 py-2 rounded-xl border border-blue-200 transition-colors"
          >
            <PhoenixAvatar size="xs" mood="thinking" />
            <span>Optimize Day</span>
          </button>
        </div>
      </header>

      <main className="px-4 py-4 max-w-md mx-auto w-full space-y-4">
        {/* COMPACT TRIP READINESS CARD */}
        <section
          id="my-trip-readiness-card"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                TRIP READINESS
              </span>
              <span className="text-2xl font-black text-blue-900">
                {tripPlan.readinessPercentage}%
              </span>
            </div>

            <div className="w-12 h-12 rounded-full border-4 border-blue-900 border-t-amber-500 flex items-center justify-center text-xs font-bold text-slate-800">
              {tripPlan.readinessPercentage}%
            </div>
          </div>

          {/* Checklist */}
          <div className="space-y-1.5 pt-1 border-t border-slate-100">
            {tripPlan.readinessChecklist.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between text-xs py-1"
              >
                <div className="flex items-center gap-2">
                  {item.completed ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  )}
                  <span
                    className={
                      item.completed
                        ? 'text-slate-700'
                        : 'text-amber-900 font-semibold'
                    }
                  >
                    {item.label}
                  </span>
                </div>
                {!item.completed && (
                  <button
                    onClick={onOpenSafety}
                    className="text-[11px] text-blue-900 font-bold bg-blue-50 px-2 py-0.5 rounded border border-blue-200 hover:bg-blue-100"
                  >
                    Resolve
                  </button>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* AUTOMATIC PLAN-B AI SIMULATOR / ADAPTATION */}
        <section id="my-trip-plan-b-section" className="space-y-2">
          {!showPlanB && !planBApplied ? (
            <div className="bg-slate-100 rounded-xl p-3 border border-slate-200 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 text-slate-700">
                <Sparkles className="w-4 h-4 text-blue-800" />
                <span>AI Weather & Disruption Monitor: Normal</span>
              </div>
              <button
                id="simulate-rain-alert-btn"
                onClick={() => setShowPlanB(true)}
                className="text-[11px] text-amber-900 font-semibold bg-amber-100 hover:bg-amber-200 px-2.5 py-1 rounded-lg border border-amber-300 transition-colors"
              >
                Test Rain Simulation
              </button>
            </div>
          ) : showPlanB && !planBApplied ? (
            <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-4 shadow-sm space-y-3 animate-fade-in">
              <div className="flex items-start gap-2.5">
                <PhoenixAvatar size="sm" mood="alert" />
                <div className="flex-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                    <span>Your plan may need an update</span>
                  </div>
                  <h4 className="text-sm font-black text-slate-900 mt-0.5">
                    PLAN-B: {tripPlan.planBAlternative?.alternativeTitle}
                  </h4>
                  <p className="text-xs text-slate-700 mt-1 leading-relaxed">
                    <span className="font-semibold">Reason: </span>
                    {tripPlan.planBAlternative?.reason}
                  </p>
                  <div className="flex items-center gap-3 text-[11px] text-slate-600 mt-1.5 font-medium">
                    <span>📍 {tripPlan.planBAlternative?.distance}</span>
                    <span>•</span>
                    <span>⏱ {tripPlan.planBAlternative?.travelTime}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-amber-200">
                <button
                  id="apply-plan-b-btn"
                  onClick={() => {
                    setPlanBApplied(true);
                    setShowPlanB(false);
                  }}
                  className="flex-1 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold py-2.5 px-3 rounded-xl shadow-xs transition-colors"
                >
                  Use Plan-B
                </button>
                <button
                  onClick={() =>
                    onAskJourneyBuddy(
                      'What other alternatives do I have besides the wooden palace?'
                    )
                  }
                  className="flex-1 bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold py-2.5 px-3 rounded-xl border border-slate-300"
                >
                  See Alternatives
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 flex items-center justify-between text-xs text-emerald-950">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <div>
                  <span className="font-bold block">
                    Plan-B Active: Padmanabhapuram Palace
                  </span>
                  <span className="text-[11px] text-emerald-800">
                    Weather-safe indoor route applied to Day 1
                  </span>
                </div>
              </div>
              <button
                onClick={() => setPlanBApplied(false)}
                className="text-[11px] text-slate-600 hover:text-slate-900 underline"
              >
                Revert
              </button>
            </div>
          )}
        </section>

        {/* DAY SELECTOR TABS */}
        <div className="flex gap-2">
          {tripPlan.days.map((day) => (
            <button
              key={day.dayNumber}
              onClick={() => setSelectedDay(day.dayNumber)}
              className={`flex-1 py-2.5 px-3 rounded-2xl text-xs font-bold border transition-colors flex items-center justify-center gap-1.5 ${
                selectedDay === day.dayNumber
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <span>Day {day.dayNumber}</span>
              <span className="opacity-75 text-[11px]">
                ({day.items.length} stops)
              </span>
            </button>
          ))}
        </div>

        {/* VISUAL JOURNEY TIMELINE */}
        <section
          id="my-trip-timeline-section"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <h3 className="text-sm font-bold text-slate-900">
              {currentDayData.title}
            </h3>
            <span className="text-[11px] text-slate-500 font-medium">
              Step-by-step
            </span>
          </div>

          <div className="space-y-4 relative before:absolute before:inset-0 before:left-3.5 before:w-0.5 before:bg-slate-200">
            {currentDayData.items.map((item, idx) => (
              <div key={item.id} className="relative flex items-start gap-3 text-xs">
                {/* Timeline node icon */}
                <div className="w-7 h-7 rounded-full bg-white border-2 border-blue-900 flex items-center justify-center shrink-0 z-10 shadow-xs">
                  {getCategoryIcon(item.category)}
                </div>

                {/* Content Box */}
                <div className="flex-1 bg-slate-50 hover:bg-slate-100/80 p-3 rounded-2xl border border-slate-200/80 transition-colors space-y-1.5">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[10.5px] font-bold text-blue-900 uppercase block">
                        {item.time} • {item.category.replace('_', ' ')}
                      </span>
                      <h4 className="font-bold text-slate-900 text-[13px]">
                        {item.title}
                      </h4>
                    </div>
                    {item.estimatedCost !== undefined && (
                      <span className="text-[11px] font-semibold text-slate-700 bg-white px-2 py-0.5 rounded border border-slate-200 shrink-0">
                        {item.estimatedCost === 0 ? 'Free' : `₹${item.estimatedCost} (est)`}
                      </span>
                    )}
                  </div>

                  <p className="text-slate-600 text-xs">{item.subtitle}</p>

                  {/* Why this recommendation */}
                  {item.whyThis && (
                    <div className="text-[11px] text-blue-950 bg-blue-50/70 p-1.5 rounded-lg border border-blue-100 leading-tight">
                      <span className="font-bold">Why this: </span>
                      {item.whyThis}
                    </div>
                  )}

                  {/* Tip if available */}
                  {item.tip && (
                    <div className="text-[11px] text-amber-900 flex items-center gap-1 font-medium">
                      <span>💡 {item.tip}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ESTIMATED BUDGET BREAKDOWN */}
        <section
          id="my-trip-budget-section"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
        >
          <div
            onClick={() => setShowBudgetDetails(!showBudgetDetails)}
            className="flex items-center justify-between cursor-pointer"
          >
            <div>
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                TOTAL ESTIMATE
              </span>
              <span className="text-xl font-black text-slate-900">
                ₹{tripPlan.totalBudgetEstimated.toLocaleString()}
                <span className="text-xs font-normal text-slate-500">
                  {' '}(approx. total)
                </span>
              </span>
            </div>

            <button className="p-1 rounded-full text-slate-500 hover:bg-slate-100">
              {showBudgetDetails ? (
                <ChevronUp className="w-5 h-5" />
              ) : (
                <ChevronDown className="w-5 h-5" />
              )}
            </button>
          </div>

          {showBudgetDetails && (
            <div className="pt-2 border-t border-slate-100 space-y-2 text-xs">
              <div className="flex justify-between text-slate-600">
                <span>🚆 Transport (Train/Transit)</span>
                <span className="font-semibold text-slate-900">
                  ₹{tripPlan.budgetBreakdown.transport}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>🏨 Stay & Accommodation</span>
                <span className="font-semibold text-slate-900">
                  ₹{tripPlan.budgetBreakdown.stay}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>🍛 Food & Local Dining</span>
                <span className="font-semibold text-slate-900">
                  ₹{tripPlan.budgetBreakdown.food}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>🚕 Local Transport & Last-Mile</span>
                <span className="font-semibold text-slate-900">
                  ₹{tripPlan.budgetBreakdown.localTransport}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>🎟 Entry Fees & Ferry</span>
                <span className="font-semibold text-slate-900">
                  ₹{tripPlan.budgetBreakdown.entryFees}
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>🎉 Cultural Experiences</span>
                <span className="font-semibold text-slate-900">
                  ₹{tripPlan.budgetBreakdown.experiences}
                </span>
              </div>
              <p className="text-[10.5px] text-slate-400 italic pt-1 border-t border-slate-100 text-center">
                * All items are estimated prices for 2 travellers.
              </p>
            </div>
          )}
        </section>

        {/* TRAVEL LIFELINE SHORTCUT BUTTON */}
        <button
          id="open-lifeline-from-trip-btn"
          onClick={onOpenLifeline}
          className="w-full bg-gradient-to-r from-blue-900 to-slate-900 hover:from-blue-800 hover:to-slate-800 text-white font-bold text-xs py-3 px-4 rounded-2xl flex items-center justify-between shadow-sm min-h-[48px]"
        >
          <div className="flex items-center gap-2">
            <Compass className="w-4 h-4 text-amber-400" />
            <span>Open Offline Travel Lifeline (Take Me Back)</span>
          </div>
          <span className="text-[11px] text-emerald-400 font-semibold bg-emerald-950/60 px-2 py-0.5 rounded">
            Offline Ready
          </span>
        </button>
      </main>
    </div>
  );
};
