import React, { useState } from 'react';
import { Destination } from '../../types';
import { PhoenixAvatar } from '../PhoenixAvatar';
import {
  Search,
  Filter,
  MapPin,
  Clock,
  Sparkles,
  AlertTriangle,
  ChevronRight,
  ShieldCheck,
  Check,
} from 'lucide-react';

interface ExploreScreenProps {
  destinations: Destination[];
  onSelectDestination: (dest: Destination) => void;
  onAskJourneyBuddy: (prompt: string) => void;
  initialFilter?: string;
  initialSearchQuery?: string;
}

export const ExploreScreen: React.FC<ExploreScreenProps> = ({
  destinations,
  onSelectDestination,
  onAskJourneyBuddy,
  initialFilter,
  initialSearchQuery = '',
}) => {
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery);
  const [activeFilter, setActiveFilter] = useState<string>(initialFilter || 'All');

  // React to prop changes
  React.useEffect(() => {
    if (initialFilter) setActiveFilter(initialFilter);
  }, [initialFilter]);

  React.useEffect(() => {
    if (initialSearchQuery !== undefined) setSearchQuery(initialSearchQuery);
  }, [initialSearchQuery]);

  const filterOptions = [
    'All',
    'Nearby',
    'Hidden gems',
    'Culture',
    'Nature',
    'Food',
    'Low crowd',
    'Budget-friendly',
    'Accessible',
  ];

  const filteredDestinations = destinations.filter((dest) => {
    const matchesSearch =
      dest.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      dest.tagline.toLowerCase().includes(searchQuery.toLowerCase());

    if (!matchesSearch) return false;

    if (activeFilter === 'All') return true;
    return dest.categories.includes(activeFilter);
  });

  const getCrowdBadge = (level: string) => {
    switch (level) {
      case 'LOW':
        return {
          icon: '🟢',
          text: 'LOW',
          label: 'Quieter than usual',
          bg: 'bg-emerald-50 text-emerald-900 border-emerald-200',
        };
      case 'MODERATE':
        return {
          icon: '🟡',
          text: 'MODERATE',
          label: 'Typical flow',
          bg: 'bg-amber-50 text-amber-900 border-amber-200',
        };
      default:
        return {
          icon: '🔴',
          text: 'HIGH',
          label: 'Peak gatherings',
          bg: 'bg-rose-50 text-rose-900 border-rose-200',
        };
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-slate-50 text-slate-900">
      {/* Header & Search */}
      <div className="bg-white border-b border-slate-200/80 px-4 pt-6 pb-3 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900">
                Explore Destinations
              </h1>
              <p className="text-xs text-slate-500">
                Discover places matched to your pace and budget
              </p>
            </div>
            <button
              onClick={() => onAskJourneyBuddy('Help me discover hidden gems near me')}
              className="p-1.5 rounded-full bg-blue-50 text-blue-900 border border-blue-200/60 flex items-center gap-1 text-xs font-semibold px-2.5 active:scale-95 transition-transform"
            >
              <PhoenixAvatar size="xs" mood="happy" />
              <span>Ask AI</span>
            </button>
          </div>

          {/* Search Bar with dedicated Search button and clear */}
          <div className="relative flex items-center bg-slate-100/90 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-600/30 rounded-2xl border border-slate-200 overflow-hidden transition-colors">
            <Search className="w-4 h-4 text-slate-400 ml-3.5 shrink-0" />
            <input
              id="explore-search-input"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Where would you like to explore?"
              className="w-full bg-transparent text-sm px-2.5 py-2.5 text-slate-900 placeholder:text-slate-400 focus:outline-none font-medium"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 mr-1"
                title="Clear search"
              >
                <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-slate-200">✕</span>
              </button>
            )}
            <button
              id="explore-search-btn"
              type="button"
              className="px-3.5 py-1.5 bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs rounded-xl mr-1.5 shrink-0 transition-transform active:scale-95"
            >
              Search
            </button>
          </div>

          {/* Filter Pills Row */}
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-0.5 pb-1">
            {filterOptions.map((filt) => {
              const isActive = activeFilter === filt;
              return (
                <button
                  key={filt}
                  id={`filter-chip-${filt.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => setActiveFilter(filt)}
                  className={`text-[12px] font-semibold px-3 py-1.5 rounded-full whitespace-nowrap transition-all flex items-center gap-1 ${
                    isActive
                      ? 'bg-blue-900 text-white shadow-xs'
                      : 'bg-slate-100 hover:bg-slate-200/70 text-slate-700'
                  }`}
                >
                  {filt}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="px-4 py-4 max-w-md mx-auto w-full space-y-4">
        {/* Disaster / Off-Season Redirect Banner if applicable */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3.5 text-xs text-amber-950 flex items-start gap-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <div className="space-y-1 flex-1">
            <span className="font-bold text-amber-900 block">
              Smart Seasonal Guidance:
            </span>
            <p className="text-amber-800 leading-relaxed">
              If beach zones experience high coastal tides or seasonal showers, Phoenix automatically suggests serene inland heritage alternatives like Padmanabhapuram Palace.
            </p>
            <button
              onClick={() => onAskJourneyBuddy('Why did you recommend this destination?')}
              className="text-[11px] font-bold text-blue-900 hover:underline inline-flex items-center gap-0.5 pt-0.5"
            >
              <span>Ask Phoenix why alternatives are chosen</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Destination List */}
        <div className="space-y-4">
          {filteredDestinations.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6 space-y-3">
              <PhoenixAvatar size="lg" mood="thinking" />
              <h3 className="font-bold text-base text-slate-800">
                No matching destinations found
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Try switching filters or ask Journey Buddy for personalized ideas.
              </p>
              <button
                onClick={() => {
                  setActiveFilter('All');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-blue-900 bg-blue-50 px-3 py-1.5 rounded-full border border-blue-200"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            filteredDestinations.map((dest) => {
              const crowd = getCrowdBadge(dest.crowdPulse.level);

              return (
                <div
                  key={dest.id}
                  id={`explore-card-${dest.id}`}
                  onClick={() => onSelectDestination(dest)}
                  className="bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-sm hover:shadow-md transition-all cursor-pointer group"
                >
                  {/* Hero photo */}
                  <div className="relative h-48 w-full overflow-hidden">
                    <img
                      src={dest.heroImage}
                      alt={dest.name}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

                    {/* Crowd Pulse label */}
                    <div className="absolute top-3 left-3">
                      <div
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-white/95 ${crowd.bg}`}
                      >
                        <span>{crowd.icon}</span>
                        <span className="font-bold">{crowd.text}</span>
                        <span className="text-[10px] opacity-90 border-l border-current pl-1">
                          {crowd.label}
                        </span>
                      </div>
                    </div>

                    {/* Rating badge */}
                    <div className="absolute top-3 right-3 bg-white/95 text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
                      <span>★</span>
                      <span>{dest.rating}</span>
                      <span className="text-[10px] text-slate-500">
                        ({dest.reviewCount})
                      </span>
                    </div>

                    {/* Destination name & region */}
                    <div className="absolute bottom-3 left-3 right-3 text-white">
                      <span className="text-[11px] font-medium tracking-wide uppercase text-blue-200">
                        {dest.region}
                      </span>
                      <h3 className="text-xl font-extrabold tracking-tight">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-slate-200 line-clamp-1 opacity-90">
                        {dest.tagline}
                      </p>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 space-y-3">
                    {/* Why this recommendation */}
                    <p className="text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 leading-relaxed">
                      <span className="font-semibold text-slate-800">Why this: </span>
                      {dest.matchReason}
                    </p>

                    {/* Highlights tags */}
                    <div className="flex flex-wrap gap-1">
                      {dest.highlights.slice(0, 3).map((h, i) => (
                        <span
                          key={i}
                          className="text-[11px] bg-blue-50 text-blue-900 px-2 py-0.5 rounded-md font-medium"
                        >
                          {h}
                        </span>
                      ))}
                    </div>

                    {/* Crowd Pulse details with timing */}
                    <div className="text-xs text-slate-600 flex items-center justify-between pt-1 border-t border-slate-100">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-blue-700" />
                        <span className="font-medium text-slate-700">Best time:</span>
                        <span className="text-slate-600">{dest.crowdPulse.bestTime.split('•')[0]}</span>
                      </div>
                      <span className="text-[10.5px] text-slate-400 italic">
                        Estimated crowd
                      </span>
                    </div>

                    {/* Footer: Budget & CTA */}
                    <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase font-semibold block">
                          Approx. Budget
                        </span>
                        <span className="text-sm font-extrabold text-blue-950">
                          ₹{dest.estimatedDailyBudget}
                          <span className="text-xs font-normal text-slate-500">
                            {' '}/day (est.)
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs font-bold text-blue-900 bg-blue-50 group-hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-colors">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </main>
    </div>
  );
};
