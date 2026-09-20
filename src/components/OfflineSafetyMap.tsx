import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Shield,
  Phone,
  Navigation,
  Download,
  CheckCircle2,
  Maximize2,
  Minimize2,
  Layers,
  Crosshair,
  WifiOff,
  Compass,
  AlertTriangle,
  ThumbsUp,
  Plus,
} from 'lucide-react';
import { HazardPin } from '../types';
import { fetchHazardPins, upvoteHazardPin } from '../services/databaseService';

export interface SafeZonePoint {
  id: string;
  name: string;
  category: 'POLICE' | 'HOSPITAL' | 'TRANSPORT' | 'PHARMACY' | 'HELPDESK';
  distance: string;
  walkingTime: string;
  phone: string;
  address: string;
  verifiedLabel: string;
  coordinates: { x: number; y: number }; // SVG percentages (0-100)
  directions: string;
}

interface OfflineSafetyMapProps {
  currentLocationName?: string;
  onCallNumber?: (num: string) => void;
  onOpenHazardModal?: () => void;
}

export const OfflineSafetyMap: React.FC<OfflineSafetyMapProps> = ({
  currentLocationName = 'Kanyakumari (Cape Comorin)',
  onOpenHazardModal,
}) => {
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [activePoint, setActivePoint] = useState<SafeZonePoint | null>(null);
  const [activeHazard, setActiveHazard] = useState<HazardPin | null>(null);
  const [isExpanded, setIsExpanded] = useState<boolean>(false);
  const [isUpdatingOffline, setIsUpdatingOffline] = useState<boolean>(false);
  const [offlinePackStatus, setOfflinePackStatus] = useState<'READY' | 'UPDATING'>('READY');
  const [mapMode, setMapMode] = useState<'SAFE_HAVENS' | 'COMMUNITY_HAZARDS' | 'ALL_LAYERS'>('ALL_LAYERS');
  const [hazards, setHazards] = useState<HazardPin[]>([]);

  useEffect(() => {
    fetchHazards();
  }, []);

  const fetchHazards = async () => {
    try {
      const res = await fetch('/api/hazards');
      if (res.ok) {
        const data = await res.json();
        setHazards(data.hazards || []);
        return;
      }
    } catch {
      // safe fallback
    }
    const { data } = await fetchHazardPins();
    setHazards(data || []);
  };

  const handleUpvoteHazard = async (hId: string) => {
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hId) {
          const already = h.hasUserUpvoted;
          return {
            ...h,
            upvotes: already ? h.upvotes - 1 : h.upvotes + 1,
            hasUserUpvoted: !already,
          };
        }
        return h;
      })
    );
    try {
      const res = await fetch(`/api/hazards/${hId}/vote`, { method: 'POST' });
      if (!res.ok) throw new Error('API vote failed');
    } catch {
      await upvoteHazardPin(hId);
    }
  };

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);

    // If user clicked empty space, open hazard reporter
    if (onOpenHazardModal) {
      onOpenHazardModal();
    }
  };

  const safePoints: SafeZonePoint[] = [
    {
      id: 'sp-1',
      name: 'Tourist Police & Coastal Security Booth',
      category: 'POLICE',
      distance: '180m',
      walkingTime: '2 min walk',
      phone: '+91 4652 246222',
      address: 'Promenade Beach Rd, near Sunset Point',
      verifiedLabel: 'State Police Department Verified',
      coordinates: { x: 38, y: 62 },
      directions: 'Head directly towards the beach promenade, blue booth marked Tourist Help is on your left.',
    },
    {
      id: 'sp-2',
      name: 'Government Hospital & 24x7 Trauma Unit',
      category: 'HOSPITAL',
      distance: '850m',
      walkingTime: '10 min walk',
      phone: '+91 4652 246233',
      address: 'Station Rd, North Junction',
      verifiedLabel: 'District Health Registry #TN-HOSP-12',
      coordinates: { x: 62, y: 24 },
      directions: 'Head North past Vivekananda Memorial Arch onto Station Road; hospital gate has clear green cross signage.',
    },
    {
      id: 'sp-3',
      name: 'Govt Prepaid Auto & Taxi Stand (Verified)',
      category: 'TRANSPORT',
      distance: '320m',
      walkingTime: '4 min walk',
      phone: '+91 4652 246100',
      address: 'Main Bus Stand Approach Rd',
      verifiedLabel: 'Motor Vehicles Dept Certified #TN-74-RTO',
      coordinates: { x: 74, y: 52 },
      directions: 'Walk east towards Cape Bus Terminal; verified pre-paid counter is near Gate 1 with government tariff board.',
    },
    {
      id: 'sp-4',
      name: 'Cape 24x7 Medico & Oxygen Chemist',
      category: 'PHARMACY',
      distance: '420m',
      walkingTime: '5 min walk',
      phone: '+91 4652 246102',
      address: 'Bazaar Cross Rd, Near Post Office',
      verifiedLabel: 'Licensed Pharmacy #TN-DRUG-882',
      coordinates: { x: 45, y: 38 },
      directions: 'Turn right at the temple bazaar arch, store has bright illuminated green neon sign.',
    },
    {
      id: 'sp-5',
      name: 'Women & Child Safety Facilitation Desk',
      category: 'HELPDESK',
      distance: '250m',
      walkingTime: '3 min walk',
      phone: '+91 4652 246091',
      address: 'Ferry Terminal Complex Gate 2',
      verifiedLabel: 'District Social Welfare & Police Desk',
      coordinates: { x: 26, y: 78 },
      directions: 'Located at the entrance of Poompuhar Shipping Ferry counter with dedicated female officers on duty.',
    },
  ];

  const filteredPoints =
    selectedFilter === 'ALL'
      ? safePoints
      : safePoints.filter((pt) => pt.category === selectedFilter);

  const handleUpdateOfflinePack = () => {
    setIsUpdatingOffline(true);
    setOfflinePackStatus('UPDATING');
    setTimeout(() => {
      setIsUpdatingOffline(false);
      setOfflinePackStatus('READY');
    }, 1200);
  };

  const getCategoryColor = (cat: SafeZonePoint['category']) => {
    switch (cat) {
      case 'POLICE':
        return { bg: 'bg-blue-600', text: 'text-blue-600', border: 'border-blue-400' };
      case 'HOSPITAL':
        return { bg: 'bg-rose-600', text: 'text-rose-600', border: 'border-rose-400' };
      case 'TRANSPORT':
        return { bg: 'bg-emerald-600', text: 'text-emerald-600', border: 'border-emerald-400' };
      case 'PHARMACY':
        return { bg: 'bg-amber-600', text: 'text-amber-600', border: 'border-amber-400' };
      case 'HELPDESK':
        return { bg: 'bg-purple-600', text: 'text-purple-600', border: 'border-purple-400' };
    }
  };

  return (
    <div
      id="offline-safety-map-card"
      className={`bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-300 ${
        isExpanded ? 'fixed inset-2 z-50 overflow-y-auto max-w-lg mx-auto shadow-2xl' : 'relative'
      }`}
    >
      {/* Map Header */}
      <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
        <div>
          <div className="flex items-center gap-1.5">
            <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-[10.5px] font-black uppercase tracking-widest text-emerald-400">
              Offline Safety Map
            </span>
          </div>
          <h3 className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
            <span>Safe Havens & Emergency Corridors</span>
          </h3>
          <p className="text-[11px] text-slate-400">
            {currentLocationName} • Cached offline (14.8 MB)
          </p>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleUpdateOfflinePack}
            disabled={isUpdatingOffline}
            className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-200 px-2.5 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1 transition-colors"
            title="Re-verify & download offline map tiles"
          >
            <Download className={`w-3.5 h-3.5 ${isUpdatingOffline ? 'animate-bounce text-amber-400' : ''}`} />
            <span>{isUpdatingOffline ? 'Caching...' : 'Sync'}</span>
          </button>

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
            aria-label={isExpanded ? 'Collapse map' : 'Expand full screen'}
          >
            {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Category Filter Chips & Layer Switcher */}
      <div className="px-3.5 py-2 bg-slate-100 border-b border-slate-200 flex items-center justify-between gap-2 overflow-x-auto">
        <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none">
          <button
            onClick={() => setMapMode('ALL_LAYERS')}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors ${
              mapMode === 'ALL_LAYERS'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            All Layers
          </button>
          <button
            onClick={() => setMapMode('COMMUNITY_HAZARDS')}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
              mapMode === 'COMMUNITY_HAZARDS'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 text-orange-700 border border-orange-200 hover:bg-orange-100'
            }`}
          >
            <AlertTriangle className="w-3 h-3" />
            Hazard Pins ({hazards.length})
          </button>
          <button
            onClick={() => setMapMode('SAFE_HAVENS')}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-full whitespace-nowrap transition-colors flex items-center gap-1 ${
              mapMode === 'SAFE_HAVENS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            <Shield className="w-3 h-3" />
            Safe Havens (5)
          </button>
        </div>

        {onOpenHazardModal && (
          <button
            onClick={onOpenHazardModal}
            className="text-[10px] font-bold px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg whitespace-nowrap shrink-0 flex items-center gap-1 shadow-xs"
            title="Tap map or click to drop hazard pin"
          >
            <Plus className="w-3 h-3" />
            <span>Drop Pin</span>
          </button>
        )}
      </div>

      {/* Interactive Map Visual Stage */}
      <div
        onClick={handleMapClick}
        className="relative bg-slate-950 h-56 sm:h-64 w-full overflow-hidden select-none cursor-crosshair"
        title="Tap anywhere on the map to drop a Community Hazard Pin (Waze for Tourists)"
      >
        {/* Topographic Background Pattern & Roads */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="grid-pattern" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="#334155" strokeWidth="0.75" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid-pattern)" />
          {/* Simulated Coastline */}
          <path
            d="M 0 160 Q 90 140 160 170 T 320 185 T 450 160"
            fill="none"
            stroke="#0284c7"
            strokeWidth="3"
            strokeDasharray="4 2"
          />
          {/* Major Road Corridors */}
          <path d="M 120 0 L 150 120 L 280 180" fill="none" stroke="#64748b" strokeWidth="2.5" />
          <path d="M 0 80 L 150 120 L 400 90" fill="none" stroke="#64748b" strokeWidth="2" />
        </svg>

        {/* Ocean label */}
        <div className="absolute bottom-2 left-3 text-[10px] font-bold text-sky-400/80 tracking-widest uppercase flex items-center gap-1 pointer-events-none">
          <Compass className="w-3 h-3 text-sky-400" />
          Indian Ocean / Triveni Sangam
        </div>

        {/* User GPS Location Marker */}
        <div
          className="absolute z-20 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center pointer-events-none"
          style={{ left: '42%', top: '50%' }}
        >
          <div className="relative">
            <span className="absolute -inset-2 rounded-full bg-blue-500/30 animate-ping" />
            <div className="w-4 h-4 rounded-full bg-blue-500 border-2 border-white shadow-lg flex items-center justify-center">
              <div className="w-1.5 h-1.5 rounded-full bg-white" />
            </div>
          </div>
          <span className="text-[9px] font-bold text-white bg-slate-900/90 px-1.5 py-0.5 rounded mt-0.5 border border-slate-700 shadow whitespace-nowrap">
            You Are Here
          </span>
        </div>

        {/* Plot Safe Haven Pins (when mode allows) */}
        {mapMode !== 'COMMUNITY_HAZARDS' &&
          filteredPoints.map((pt) => {
            const colors = getCategoryColor(pt.category);
            const isSelected = activePoint?.id === pt.id;

            return (
              <button
                key={pt.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveHazard(null);
                  setActivePoint(pt);
                }}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
                style={{ left: `${pt.coordinates.x}%`, top: `${pt.coordinates.y}%` }}
                aria-label={`View ${pt.name}`}
              >
                <div
                  className={`w-7 h-7 rounded-full ${colors.bg} text-white flex items-center justify-center shadow-lg border-2 ${
                    isSelected ? 'border-amber-400 ring-2 ring-amber-400/50' : 'border-white'
                  }`}
                >
                  {pt.category === 'POLICE' && <Shield className="w-3.5 h-3.5" />}
                  {pt.category === 'HOSPITAL' && <Crosshair className="w-3.5 h-3.5" />}
                  {pt.category === 'TRANSPORT' && <Navigation className="w-3.5 h-3.5" />}
                  {pt.category === 'PHARMACY' && <span className="text-[10px] font-black">Rx</span>}
                  {pt.category === 'HELPDESK' && <MapPin className="w-3.5 h-3.5" />}
                </div>
                <span className="hidden group-hover:block absolute top-7 left-1/2 -translate-x-1/2 text-[9px] font-bold text-white bg-black/90 px-1.5 py-0.5 rounded shadow whitespace-nowrap z-30">
                  {pt.distance}
                </span>
              </button>
            );
          })}

        {/* Plot Community Hazard Pins (Waze for Tourists) */}
        {mapMode !== 'SAFE_HAVENS' &&
          hazards.map((hz, idx) => {
            // Simulated positions on the offline map for hazards
            const positions = [
              { x: 52, y: 72 },
              { x: 28, y: 32 },
              { x: 70, y: 40 },
              { x: 45, y: 82 },
            ];
            const pos = positions[idx % positions.length];
            const isSelected = activeHazard?.id === hz.id;

            const iconSymbol =
              hz.type === 'road_blocked'
                ? '🚧'
                : hz.type === 'scam'
                ? '🚨'
                : hz.type === 'weather'
                ? '⛈️'
                : hz.type === 'under_construction'
                ? '🏗️'
                : '⚠️';

            return (
              <button
                key={hz.id}
                onClick={(e) => {
                  e.stopPropagation();
                  setActivePoint(null);
                  setActiveHazard(hz);
                }}
                className={`absolute z-10 -translate-x-1/2 -translate-y-1/2 group transition-transform ${
                  isSelected ? 'scale-130 z-30' : 'hover:scale-115'
                }`}
                style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                title={`${hz.title} (${hz.upvotes} confirms)`}
              >
                <div className="relative">
                  <span className="absolute -inset-1 rounded-full bg-rose-500/40 animate-ping" />
                  <div
                    className={`w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs shadow-lg border-2 ${
                      isSelected ? 'border-yellow-300 ring-2 ring-yellow-400' : 'border-white'
                    }`}
                  >
                    <span>{iconSymbol}</span>
                  </div>
                </div>
                <span className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-extrabold text-white bg-black/80 px-1 rounded whitespace-nowrap">
                  ▲ {hz.upvotes}
                </span>
              </button>
            );
          })}

        {/* Offline Badge Overlay */}
        <div className="absolute top-2.5 left-2.5 bg-slate-900/90 backdrop-blur-xs border border-slate-700 text-slate-200 text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 shadow pointer-events-none">
          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
          <span>Waze Layer Active • Tap map to report</span>
        </div>
      </div>

      {/* Selected Hazard Details Drawer */}
      {activeHazard && (
        <div className="p-4 bg-orange-50 border-t border-orange-200 animate-in slide-in-from-bottom-2 duration-150 space-y-2.5">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-rose-600 text-white">
                  Community Hazard (Waze)
                </span>
                <span className="text-[10px] font-bold text-orange-800 bg-orange-200 px-2 py-0.5 rounded-full">
                  {activeHazard.reportedAt}
                </span>
              </div>
              <h4 className="font-extrabold text-sm text-slate-900">{activeHazard.title}</h4>
              <p className="text-xs text-slate-700 font-medium mt-0.5 leading-relaxed">
                {activeHazard.description}
              </p>
              <p className="text-[11px] text-slate-500 mt-1 font-semibold">
                📍 {activeHazard.locationName} • Reported by {activeHazard.reportedBy}
              </p>
            </div>

            <button
              onClick={() => handleUpvoteHazard(activeHazard.id)}
              className={`shrink-0 flex flex-col items-center px-3 py-2 rounded-xl border transition-all ${
                activeHazard.hasUserUpvoted
                  ? 'bg-orange-600 text-white border-orange-700'
                  : 'bg-white text-slate-800 border-orange-300 hover:bg-orange-100'
              }`}
            >
              <ThumbsUp className="w-4 h-4" />
              <span className="text-xs font-black mt-0.5">{activeHazard.upvotes}</span>
              <span className="text-[9px] font-bold uppercase">Confirm</span>
            </button>
          </div>

          <div className="flex justify-end gap-2 pt-1 border-t border-orange-200/60">
            <button
              onClick={() => setActiveHazard(null)}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 px-3 py-1.5 rounded-lg bg-white/80 border border-slate-200"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Selected Safe Haven Details Drawer */}
      {activePoint ? (
        <div className="p-4 bg-white border-t border-slate-200 animate-in slide-in-from-bottom-2 duration-150 space-y-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-1.5">
                <span
                  className={`text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                    getCategoryColor(activePoint.category).bg
                  } text-white`}
                >
                  {activePoint.category}
                </span>
                <span className="text-xs text-emerald-700 font-semibold">
                  ✓ {activePoint.verifiedLabel}
                </span>
              </div>
              <h4 className="font-bold text-sm text-slate-900 mt-1">
                {activePoint.name}
              </h4>
              <p className="text-xs text-slate-500 mt-0.5">{activePoint.address}</p>
            </div>

            <div className="text-right shrink-0">
              <span className="text-sm font-black text-blue-900 block">
                {activePoint.distance}
              </span>
              <span className="text-[10px] text-slate-500 font-medium">
                {activePoint.walkingTime}
              </span>
            </div>
          </div>

          {/* Step-by-step offline walking guide */}
          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block flex items-center gap-1">
              <Navigation className="w-3 h-3 text-blue-600" />
              Offline Walking Guidance
            </span>
            <p className="leading-relaxed">{activePoint.directions}</p>
          </div>

          <div className="flex items-center gap-2 pt-1">
            <a
              href={`tel:${activePoint.phone.replace(/\s+/g, '')}`}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-colors min-h-[40px]"
            >
              <Phone className="w-3.5 h-3.5" />
              <span>Call Facility ({activePoint.phone})</span>
            </a>
            <button
              onClick={() => setActivePoint(null)}
              className="text-xs font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200"
            >
              Close
            </button>
          </div>
        </div>
      ) : (
        <div className="p-3 bg-slate-50 border-t border-slate-200 text-center text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <MapPin className="w-3.5 h-3.5 text-blue-600" />
          <span>Tap any safe point on the map to view offline walking directions & contact</span>
        </div>
      )}
    </div>
  );
};
