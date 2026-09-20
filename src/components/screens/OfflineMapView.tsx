import React, { useState } from 'react';
import {
  Map,
  Shield,
  PhoneCall,
  Navigation,
  Download,
  CheckCircle2,
  AlertTriangle,
  Building2,
  HeartPulse,
  Compass,
  ArrowUpRight,
  WifiOff,
  Search,
} from 'lucide-react';

interface SafePoi {
  id: string;
  name: string;
  type: 'police' | 'hospital' | 'pharmacy' | 'shelter';
  categoryLabel: string;
  coords: { x: number; y: number }; // SVG percentage coordinates
  distance: string;
  walkTime: string;
  phone: string;
  hours: string;
  offlineDirections: string;
  verified: boolean;
}

interface OfflineMapPack {
  id: string;
  name: string;
  region: string;
  size: string;
  isDownloaded: boolean;
  safePointsCount: number;
}

export const OfflineMapView: React.FC = () => {
  const [selectedPackId, setSelectedPackId] = useState<string>('kk-coastal');
  const [isSimulatedOffline, setIsSimulatedOffline] = useState<boolean>(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [selectedPoiId, setSelectedPoiId] = useState<string>('poi-police-1');
  const [downloadingPacks, setDownloadingPacks] = useState<Record<string, number>>({});

  const mapPacks: OfflineMapPack[] = [
    {
      id: 'kk-coastal',
      name: 'Kanyakumari Safe Zone',
      region: 'Tamil Nadu • Cape Comorin',
      size: '18.4 MB',
      isDownloaded: true,
      safePointsCount: 7,
    },
    {
      id: 'alp-jetty',
      name: 'Alleppey Backwaters & Jetty Safe Belt',
      region: 'Kerala • Punnamada & Finishing Point',
      size: '22.1 MB',
      isDownloaded: false,
      safePointsCount: 6,
    },
    {
      id: 'mun-hills',
      name: 'Munnar Town & Valley Safe Corridor',
      region: 'Kerala • Idukki Hills',
      size: '26.8 MB',
      isDownloaded: false,
      safePointsCount: 5,
    },
    {
      id: 'jai-walled',
      name: 'Jaipur Walled City Protected Zone',
      region: 'Rajasthan • Old Heritage Grid',
      size: '31.2 MB',
      isDownloaded: false,
      safePointsCount: 9,
    },
    {
      id: 'goa-coast',
      name: 'Goa Coastal & Beach Safety Corridor',
      region: 'Goa • Calangute to Panaji',
      size: '24.5 MB',
      isDownloaded: true,
      safePointsCount: 8,
    },
    {
      id: 'ladakh-high',
      name: 'Ladakh High-Altitude Medical Grid',
      region: 'Ladakh • Leh & Nubra Safety Pass',
      size: '28.9 MB',
      isDownloaded: false,
      safePointsCount: 6,
    },
    {
      id: 'rishi-ganges',
      name: 'Rishikesh Holy River Safety Belt',
      region: 'Uttarakhand • Laxman Jhula Corridor',
      size: '19.8 MB',
      isDownloaded: false,
      safePointsCount: 7,
    },
  ];

  const safePois: SafePoi[] = [
    {
      id: 'poi-police-1',
      name: 'Tourist Police Aid Post (Promenade)',
      type: 'police',
      categoryLabel: '24/7 Police Assistance',
      coords: { x: 42, y: 38 },
      distance: '240 m',
      walkTime: '3 mins',
      phone: '+91 4652 246220',
      hours: '24 Hours Open',
      offlineDirections: 'Walk straight south along Beach Promenade. Post is located beside the Gandhi Memorial pavilion.',
      verified: true,
    },
    {
      id: 'poi-med-1',
      name: 'Govt Primary Health & Trauma Center',
      type: 'hospital',
      categoryLabel: 'Hospital / Trauma',
      coords: { x: 74, y: 28 },
      distance: '1.1 km',
      walkTime: '14 mins',
      phone: '+91 4652 246233',
      hours: '24/7 Emergency Ward',
      offlineDirections: 'Head north on Main Station Road. Hospital entrance is on the right before the rail crossing.',
      verified: true,
    },
    {
      id: 'poi-pharm-1',
      name: 'Cape Medico 24x7 Chemist Depot',
      type: 'pharmacy',
      categoryLabel: 'All-Night Pharmacy',
      coords: { x: 58, y: 50 },
      distance: '420 m',
      walkTime: '5 mins',
      phone: '+91 4652 246102',
      hours: '24 Hours Open',
      offlineDirections: 'Turn west onto South Car Street. Located opposite the Post Office bank.',
      verified: true,
    },
    {
      id: 'poi-shelter-1',
      name: 'Tamil Nadu Tourism Facilitation Desk',
      type: 'shelter',
      categoryLabel: 'Safe Tourist Rest Zone',
      coords: { x: 30, y: 62 },
      distance: '380 m',
      walkTime: '4 mins',
      phone: '+91 4652 246276',
      hours: '06:00 AM – 10:00 PM',
      offlineDirections: 'Located adjacent to Cape Hotel bus drop. Includes drinking water and security desk.',
      verified: true,
    },
    {
      id: 'poi-police-2',
      name: 'Coastal Marine Police Station',
      type: 'police',
      categoryLabel: 'Marine Security Desk',
      coords: { x: 80, y: 75 },
      distance: '850 m',
      walkTime: '10 mins',
      phone: '1093',
      hours: '24 Hours Open',
      offlineDirections: 'Follow Harbour Road toward the lighthouse pier.',
      verified: true,
    },
  ];

  const filteredPois = safePois.filter((p) => {
    if (selectedCategory === 'ALL') return true;
    if (selectedCategory === 'POLICE') return p.type === 'police';
    if (selectedCategory === 'MEDICAL') return p.type === 'hospital' || p.type === 'pharmacy';
    if (selectedCategory === 'SHELTER') return p.type === 'shelter';
    return true;
  });

  const activePoi = safePois.find((p) => p.id === selectedPoiId) || safePois[0];

  const handleDownloadPack = (packId: string) => {
    setDownloadingPacks((prev) => ({ ...prev, [packId]: 10 }));
    const interval = setInterval(() => {
      setDownloadingPacks((prev) => {
        const current = prev[packId] || 0;
        if (current >= 100) {
          clearInterval(interval);
          const pack = mapPacks.find((p) => p.id === packId);
          if (pack) pack.isDownloaded = true;
          return { ...prev, [packId]: 100 };
        }
        return { ...prev, [packId]: current + 25 };
      });
    }, 300);
  };

  return (
    <div id="offline-map-section" className="space-y-4">
      {/* Offline Status & Pack Selector Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-4 border border-slate-800 shadow-md space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-blue-600/30 text-blue-400 border border-blue-500/40 flex items-center justify-center">
              <Map className="w-4 h-4" />
            </span>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300">
                  Offline Safe Zones & Maps
                </h3>
                <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-1.5 py-0.2 rounded font-semibold">
                  CACHED
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Vector map & verified safe havens without internet
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsSimulatedOffline(!isSimulatedOffline)}
            className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border flex items-center gap-1 transition-colors ${
              isSimulatedOffline
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            <WifiOff className="w-3.5 h-3.5" />
            <span>{isSimulatedOffline ? 'Offline Mode' : 'Online'}</span>
          </button>
        </div>

        {/* Offline Pack Selection Bar */}
        <div className="space-y-1.5 pt-1 border-t border-slate-800">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Select Offline Travel Zone:
          </span>
          <div className="grid grid-cols-2 gap-2">
            {mapPacks.map((pack) => {
              const isSelected = selectedPackId === pack.id;
              const isDownloading =
                downloadingPacks[pack.id] !== undefined && downloadingPacks[pack.id] < 100;
              const isComplete = pack.isDownloaded || downloadingPacks[pack.id] === 100;

              return (
                <button
                  key={pack.id}
                  onClick={() => setSelectedPackId(pack.id)}
                  className={`p-2.5 rounded-2xl border text-left text-xs transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-900/60 border-blue-400 text-white shadow-inner'
                      : 'bg-slate-800/60 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[12px] truncate max-w-[120px]">
                      {pack.name.split(' ')[0]}
                    </span>
                    {isComplete ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    ) : (
                      <span
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadPack(pack.id);
                        }}
                        className="p-1 rounded-md bg-slate-700 hover:bg-blue-600 text-white"
                        title="Download Pack"
                      >
                        <Download className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1">
                    <span>{pack.size}</span>
                    <span className="text-blue-300 font-medium">
                      {pack.safePointsCount} Safe POIs
                    </span>
                  </div>

                  {isDownloading && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-700">
                      <div
                        className="h-full bg-blue-400 transition-all duration-300"
                        style={{ width: `${downloadingPacks[pack.id]}%` }}
                      ></div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Interactive Vector Map Container */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Safe Zone Vector Map
            </h4>
            <span className="text-[11px] text-slate-500">
              Interactive safe shelters, police kiosks & lighted pathways
            </span>
          </div>
          <span className="text-[11px] bg-blue-50 text-blue-900 border border-blue-200 px-2 py-0.5 rounded-full font-bold">
            GPS Locked
          </span>
        </div>

        {/* Filter Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'ALL', label: 'All (5)' },
            { id: 'POLICE', label: 'Police (2)' },
            { id: 'MEDICAL', label: 'Medical (2)' },
            { id: 'SHELTER', label: 'Safe Rest (1)' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-colors text-[11px] ${
                selectedCategory === cat.id
                  ? 'bg-blue-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Vector SVG Canvas */}
        <div className="relative w-full h-64 bg-slate-900 rounded-2xl overflow-hidden border border-slate-300 shadow-inner">
          <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {/* Ocean / Waterline Background */}
            <path
              d="M 0 0 L 100 0 L 100 30 Q 70 20 40 32 T 0 35 Z"
              fill="#0f2b48"
              opacity="0.9"
            />
            {/* Coastline Shoreline Border */}
            <path
              d="M 0 35 Q 40 32 70 20 T 100 30"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="0.8"
              strokeDasharray="1,1"
            />

            {/* Main Road Grid Network */}
            {/* Beach Road (Promenade) */}
            <path
              d="M 10 38 Q 45 42 85 45"
              fill="none"
              stroke="#475569"
              strokeWidth="3.5"
            />
            {/* Well-lit Pedestrian Line (Glowing Yellow/Amber overlay) */}
            <path
              d="M 10 38 Q 45 42 85 45"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="1.2"
              strokeDasharray="2,1.5"
              opacity="0.85"
            />

            {/* Station Road */}
            <path
              d="M 50 42 L 55 95"
              fill="none"
              stroke="#475569"
              strokeWidth="3"
            />
            {/* South Car Street */}
            <path
              d="M 25 65 L 85 65"
              fill="none"
              stroke="#334155"
              strokeWidth="2.5"
            />

            {/* Connecting Avenue */}
            <path
              d="M 75 44 L 80 90"
              fill="none"
              stroke="#334155"
              strokeWidth="2"
            />

            {/* Route indicator to active safe POI */}
            {activePoi && (
              <line
                x1="45"
                y1="55"
                x2={activePoi.coords.x}
                y2={activePoi.coords.y}
                stroke="#60a5fa"
                strokeWidth="1"
                strokeDasharray="1.5,1.5"
              />
            )}
          </svg>

          {/* User Location Pulse Marker (Fixed at x:45%, y:55%) */}
          <div
            className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
            style={{ left: '45%', top: '55%' }}
          >
            <span className="relative flex h-5 w-5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-5 w-5 bg-blue-600 border-2 border-white items-center justify-center text-[8px] font-black text-white">
                YOU
              </span>
            </span>
          </div>

          {/* POI Markers on Vector Canvas */}
          {filteredPois.map((poi) => {
            const isSelected = selectedPoiId === poi.id;
            let bgColor = 'bg-blue-600 text-white';
            let icon = '🛡️';
            if (poi.type === 'hospital') {
              bgColor = 'bg-emerald-600 text-white';
              icon = '🏥';
            } else if (poi.type === 'pharmacy') {
              bgColor = 'bg-teal-600 text-white';
              icon = '💊';
            } else if (poi.type === 'shelter') {
              bgColor = 'bg-amber-600 text-white';
              icon = '🏠';
            } else if (poi.type === 'police') {
              bgColor = 'bg-indigo-600 text-white';
              icon = '🚨';
            }

            return (
              <button
                key={poi.id}
                onClick={() => setSelectedPoiId(poi.id)}
                className={`absolute -translate-x-1/2 -translate-y-1/2 z-10 transition-transform ${
                  isSelected ? 'scale-125 z-30' : 'hover:scale-110'
                }`}
                style={{ left: `${poi.coords.x}%`, top: `${poi.coords.y}%` }}
                title={poi.name}
              >
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center shadow-lg border-2 text-xs ${
                    isSelected
                      ? 'border-amber-300 ring-2 ring-amber-400 ring-offset-1 ring-offset-slate-900 ' +
                        bgColor
                      : 'border-white ' + bgColor
                  }`}
                >
                  <span className="text-[11px] leading-none">{icon}</span>
                </div>
              </button>
            );
          })}

          {/* Compass Rose & Legend Badge */}
          <div className="absolute top-2 right-2 bg-slate-950/80 backdrop-blur-xs p-1.5 rounded-xl border border-slate-700 text-[10px] text-slate-300 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-amber-400" />
            <span>N ↑</span>
          </div>

          <div className="absolute bottom-2 left-2 bg-slate-950/80 backdrop-blur-xs px-2 py-1 rounded-lg border border-slate-700 text-[10px] text-amber-300 flex items-center gap-1.5">
            <span className="w-2 h-0.5 bg-amber-400"></span>
            <span>Illuminated Safe Walkway</span>
          </div>
        </div>

        {/* Selected Safe Point Detail Card */}
        {activePoi && (
          <div className="p-3.5 rounded-2xl bg-blue-50/90 border border-blue-200 text-xs space-y-2">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] bg-blue-200/80 text-blue-950 font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {activePoi.categoryLabel}
                </span>
                <h5 className="font-bold text-sm text-slate-900 mt-1">{activePoi.name}</h5>
                <span className="text-[11px] text-slate-600 block">
                  Distance: <strong className="text-blue-950">{activePoi.distance}</strong> ({activePoi.walkTime}) • {activePoi.hours}
                </span>
              </div>

              <a
                href={`tel:${activePoi.phone.replace(/\s+/g, '')}`}
                className="bg-blue-900 hover:bg-blue-800 text-white font-bold px-3 py-2 rounded-xl flex items-center gap-1 shadow-xs transition-colors shrink-0 text-xs"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call</span>
              </a>
            </div>

            {/* Turn-by-Turn Offline Guidance */}
            <div className="bg-white p-2.5 rounded-xl border border-blue-200/70 text-[11.5px] text-slate-700 flex items-start gap-2">
              <Navigation className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-900 block text-[11px]">
                  Offline Walking Guidance (No internet required):
                </strong>
                <span>{activePoi.offlineDirections}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
