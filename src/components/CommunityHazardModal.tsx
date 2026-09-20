import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  AlertTriangle,
  MapPin,
  ThumbsUp,
  ShieldCheck,
  Plus,
  Navigation,
  CheckCircle2,
  Clock,
  Filter,
  Layers,
  Flag,
} from 'lucide-react';
import { HazardPin, HazardType } from '../types';
import { fetchHazardPins, saveHazardPin, upvoteHazardPin } from '../services/databaseService';

interface CommunityHazardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectOnMap?: (hazard: HazardPin) => void;
}

const HAZARD_TYPE_CONFIG: Record<
  HazardType,
  { label: string; icon: string; bg: string; border: string; text: string; description: string }
> = {
  road_blocked: {
    label: 'Road Blocked / Inundated',
    icon: '🚧',
    bg: 'bg-rose-50',
    border: 'border-rose-300',
    text: 'text-rose-700',
    description: 'Road closures, landslides, waterlogging, or blocked walking paths',
  },
  unsafe_area: {
    label: 'Unsafe Area / Poor Lighting',
    icon: '⚠️',
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    text: 'text-amber-800',
    description: 'Unlit alleyways, aggressive strays, or isolated zones after dark',
  },
  scam: {
    label: 'Tourist Scam / Overcharging',
    icon: '🚨',
    bg: 'bg-purple-50',
    border: 'border-purple-300',
    text: 'text-purple-800',
    description: 'Touts selling fake passes, unauthorized fee collectors, rigged meters',
  },
  weather: {
    label: 'Severe Weather / High Tide',
    icon: '⛈️',
    bg: 'bg-sky-50',
    border: 'border-sky-300',
    text: 'text-sky-800',
    description: 'Dangerous sea swells, heavy sudden squalls, slippery rock edges',
  },
  under_construction: {
    label: 'Under Construction',
    icon: '🏗️',
    bg: 'bg-orange-50',
    border: 'border-orange-300',
    text: 'text-orange-800',
    description: 'Excavation work, paver replacement, scaffolding barriers',
  },
};

export const CommunityHazardModal: React.FC<CommunityHazardModalProps> = ({
  isOpen,
  onClose,
  onSelectOnMap,
}) => {
  const [hazards, setHazards] = useState<HazardPin[]>([]);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [isReporting, setIsReporting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // New report form state
  const [newType, setNewType] = useState<HazardType>('road_blocked');
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('Kanyakumari • Promenade Road');
  const [newReporterName, setNewReporterName] = useState('Sreeshma (Tourist)');

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
    } catch (err) {
      console.warn('Failed to fetch hazards from API, using databaseService:', err);
    }
    const { data } = await fetchHazardPins();
    setHazards(data || []);
  };

  const handleUpvote = async (hazardId: string) => {
    setHazards((prev) =>
      prev.map((h) => {
        if (h.id === hazardId) {
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
      await fetch(`/api/hazards/${hazardId}/vote`, { method: 'POST' });
    } catch {
      await upvoteHazardPin(hazardId);
    }
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const payload: HazardPin = {
      id: `hz-${Date.now()}`,
      type: newType,
      title: newTitle,
      description: newDescription || 'Reported by traveler via Community Safety Watch',
      locationName: newLocation,
      reportedBy: newReporterName,
      coordinates: { lat: 8.082, lng: 77.551 },
      severity: newType === 'scam' || newType === 'weather' ? 'high' : 'medium',
      reportedAt: 'Just now',
      upvotes: 1,
      status: 'active',
    };

    try {
      const res = await fetch('/api/hazards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();
        setHazards((prev) => [data.hazard, ...prev]);
        setReportSuccess(true);
        setTimeout(() => {
          setReportSuccess(false);
          setIsReporting(false);
          setNewTitle('');
          setNewDescription('');
        }, 1500);
        return;
      }
    } catch (err) {
      console.warn('Hazard submission error, using databaseService:', err);
    }

    const { hazard } = await saveHazardPin(payload);
    setHazards((prev) => [hazard, ...prev]);
    setReportSuccess(true);
    setTimeout(() => {
      setReportSuccess(false);
      setIsReporting(false);
      setNewTitle('');
      setNewDescription('');
    }, 1500);
  };

  if (!isOpen) return null;

  const filteredHazards = hazards.filter((h) =>
    selectedFilter === 'ALL' ? true : h.type === selectedFilter
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-xl overflow-hidden border border-slate-200 my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-rose-600 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              📍
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg">Community Hazard Pins</h2>
                <span className="bg-white/25 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Waze for Tourists
                </span>
              </div>
              <p className="text-xs text-orange-100 font-medium">
                Crowdsourced safety reports with community upvotes & police verification
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Action toggle between View and Drop Pin */}
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
              {['ALL', 'road_blocked', 'unsafe_area', 'scam', 'weather', 'under_construction'].map(
                (filterKey) => (
                  <button
                    key={filterKey}
                    onClick={() => {
                      setSelectedFilter(filterKey);
                      setIsReporting(false);
                    }}
                    className={`px-3 py-1.5 rounded-xl font-bold whitespace-nowrap transition-all text-xs ${
                      selectedFilter === filterKey && !isReporting
                        ? 'bg-slate-900 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filterKey === 'ALL'
                      ? 'All Reports'
                      : HAZARD_TYPE_CONFIG[filterKey as HazardType]?.label.split('/')[0]}
                  </button>
                )
              )}
            </div>

            <button
              onClick={() => setIsReporting(!isReporting)}
              className={`shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shadow-sm ${
                isReporting
                  ? 'bg-slate-200 text-slate-800'
                  : 'bg-rose-600 hover:bg-rose-700 text-white'
              }`}
            >
              {isReporting ? (
                <>View Pins</>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" /> Drop Pin
                </>
              )}
            </button>
          </div>

          {/* Form to Drop a Pin */}
          {isReporting ? (
            <motion.form
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onSubmit={handleSubmitReport}
              className="bg-slate-50 border-2 border-orange-200 rounded-2xl p-4 space-y-3"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
                  <span>Drop a Community Hazard Pin</span>
                  <span className="text-[10px] bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded-md">
                    Instant Broadcast
                  </span>
                </h3>
              </div>

              {/* Hazard Type Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Hazard Category
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {(Object.keys(HAZARD_TYPE_CONFIG) as HazardType[]).map((typeKey) => {
                    const cfg = HAZARD_TYPE_CONFIG[typeKey];
                    const isSelected = newType === typeKey;
                    return (
                      <div
                        key={typeKey}
                        onClick={() => setNewType(typeKey)}
                        className={`p-2.5 rounded-xl border-2 cursor-pointer transition-all flex items-start gap-2.5 ${
                          isSelected
                            ? `${cfg.bg} ${cfg.border} ring-2 ring-orange-500/20 shadow-xs`
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <span className="text-lg">{cfg.icon}</span>
                        <div>
                          <p className="text-xs font-bold text-slate-900">{cfg.label}</p>
                          <p className="text-[10px] text-slate-500 line-clamp-1">{cfg.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Title Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Hazard Title / What is happening?
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Market street dug up for water pipes"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Description Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Specific Details & Safe Detour
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Pedestrians can take the parallel beachfront lane. Keep left."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>

              {/* Location Input */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Location / Landmark
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl pl-8 pr-3 py-2 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500"
                  />
                </div>
              </div>

              {/* Submit button */}
              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsReporting(false)}
                  className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newTitle.trim()}
                  className="px-5 py-2 bg-gradient-to-r from-orange-600 to-rose-600 text-white font-bold text-xs rounded-xl shadow-md disabled:opacity-50 flex items-center gap-1.5"
                >
                  {reportSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Pin Broadcasted!
                    </>
                  ) : (
                    <>
                      <Flag className="w-3.5 h-3.5" /> Drop Community Pin
                    </>
                  )}
                </button>
              </div>
            </motion.form>
          ) : null}

          {/* List of Hazard Pins */}
          <div className="space-y-3">
            {filteredHazards.length === 0 ? (
              <div className="text-center py-8 text-slate-400 text-xs">
                No active hazard pins in this category. Travel safe!
              </div>
            ) : (
              filteredHazards.map((hazard) => {
                const config = HAZARD_TYPE_CONFIG[hazard.type] || HAZARD_TYPE_CONFIG.unsafe_area;
                return (
                  <div
                    key={hazard.id}
                    className={`rounded-2xl p-4 border-2 transition-all ${config.bg} ${config.border} shadow-xs`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-2.5">
                        <span className="text-2xl shrink-0 mt-0.5">{config.icon}</span>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap mb-1">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${config.text} bg-white border border-current`}
                            >
                              {config.label}
                            </span>
                            {hazard.status === 'verified_by_traffic_police' && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                                <ShieldCheck className="w-3 h-3 text-blue-600" /> Police Verified
                              </span>
                            )}
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {hazard.reportedAt}
                            </span>
                          </div>

                          <h4 className="font-extrabold text-sm text-slate-900 leading-snug">
                            {hazard.title}
                          </h4>

                          <p className="text-xs text-slate-700 font-medium mt-1 leading-relaxed">
                            {hazard.description}
                          </p>

                          <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 mt-2">
                            <MapPin className="w-3 h-3 text-rose-500" />
                            <span>{hazard.locationName}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-slate-500">By {hazard.reportedBy}</span>
                          </div>
                        </div>
                      </div>

                      {/* Upvote Button */}
                      <button
                        onClick={() => handleUpvote(hazard.id)}
                        className={`shrink-0 flex flex-col items-center justify-center p-2.5 rounded-xl border transition-all active:scale-95 shadow-xs ${
                          hazard.hasUserUpvoted
                            ? 'bg-orange-600 text-white border-orange-700 shadow-md'
                            : 'bg-white hover:bg-orange-50 text-slate-700 border-slate-200'
                        }`}
                        title="Upvote / Confirm this hazard exists"
                      >
                        <ThumbsUp className={`w-4 h-4 ${hazard.hasUserUpvoted ? 'fill-white' : ''}`} />
                        <span className="text-xs font-black mt-0.5">{hazard.upvotes}</span>
                        <span className="text-[9px] font-semibold uppercase tracking-tight">Confirm</span>
                      </button>
                    </div>

                    {onSelectOnMap && (
                      <div className="mt-3 pt-2.5 border-t border-black/5 flex justify-end">
                        <button
                          onClick={() => {
                            onSelectOnMap(hazard);
                            onClose();
                          }}
                          className="text-xs font-bold text-slate-800 hover:text-orange-600 flex items-center gap-1"
                        >
                          <Navigation className="w-3 h-3" /> View pin on Offline Safety Map →
                        </button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span>🤝 Verified reports alert all active tourists in 5km radius</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
};
