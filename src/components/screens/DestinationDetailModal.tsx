import React, { useState } from 'react';
import { Destination } from '../../types';
import { PhoenixAvatar } from '../PhoenixAvatar';
import {
  X,
  Clock,
  MapPin,
  Calendar,
  Utensils,
  ShieldAlert,
  Compass,
  Bus,
  Car,
  Sparkles,
  Info,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Users,
  Accessibility,
  HeartHandshake,
  ShieldCheck,
  Award,
  FileCheck2,
} from 'lucide-react';

interface DestinationDetailModalProps {
  destination: Destination | null;
  onClose: () => void;
  onPlanTrip: (dest: Destination) => void;
  onAskJourneyBuddy: (prompt: string, destName: string) => void;
  onOpenReviewModal: (dest: Destination) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  onClose,
  onPlanTrip,
  onAskJourneyBuddy,
  onOpenReviewModal,
}) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'LOCAL' | 'LAST_MILE' | 'SAFETY'>(
    'OVERVIEW'
  );
  const [filterVerifiedOnly, setFilterVerifiedOnly] = useState<boolean>(false);
  const [inspectedVerification, setInspectedVerification] = useState<any | null>(null);

  if (!destination) return null;

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
          label: 'Peak visitor gatherings',
          bg: 'bg-rose-50 text-rose-900 border-rose-200',
        };
    }
  };

  const crowd = getCrowdBadge(destination.crowdPulse.level);

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col justify-end sm:justify-center items-center bg-slate-950/70 backdrop-blur-xs p-0 sm:p-4 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-label={`${destination.name} Details`}
    >
      <div className="w-full max-w-md h-[95vh] sm:h-[760px] bg-slate-50 rounded-t-3xl sm:rounded-3xl shadow-2xl flex flex-col overflow-hidden border border-slate-200">
        {/* Sticky Hero Header */}
        <div className="relative h-60 w-full shrink-0">
          <img
            src={destination.heroImage}
            alt={destination.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-black/30" />

          {/* Close Button */}
          <button
            id="destination-detail-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center backdrop-blur-md transition-colors min-h-[44px] min-w-[44px]"
            aria-label="Close details"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Crowd Badge */}
          <div className="absolute top-4 left-4">
            <div
              className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 shadow-sm backdrop-blur-md bg-white/95 ${crowd.bg}`}
            >
              <span>{crowd.icon}</span>
              <span className="font-bold">{crowd.text}</span>
              <span className="text-[10px] opacity-80 border-l border-current pl-1">
                {crowd.label}
              </span>
            </div>
          </div>

          {/* Destination Title & Region */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <span className="text-xs font-semibold uppercase tracking-wider text-blue-300">
              {destination.region}
            </span>
            <h1 className="text-2xl font-black tracking-tight">{destination.name}</h1>
            <p className="text-xs text-slate-200 line-clamp-1 opacity-90 mt-0.5">
              {destination.tagline}
            </p>
          </div>
        </div>

        {/* Tab Selector Bar */}
        <div className="bg-white border-b border-slate-200 px-3 py-2 flex items-center justify-between shrink-0 text-xs font-semibold">
          {[
            { key: 'OVERVIEW', label: 'Overview' },
            { key: 'LOCAL', label: 'Smart Local' },
            { key: 'LAST_MILE', label: 'Last-Mile' },
            { key: 'SAFETY', label: 'Safety & Access' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`px-3 py-1.5 rounded-full transition-colors ${
                activeTab === tab.key
                  ? 'bg-blue-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Tab Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-4">
              {/* Crowd Pulse & Best visiting time Card */}
              <div className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{crowd.icon}</span>
                    <div>
                      <span className="text-xs font-bold text-slate-800 uppercase tracking-wider block">
                        CROWD PULSE: {crowd.text}
                      </span>
                      <span className="text-xs text-slate-600 font-medium">
                        "{destination.crowdPulse.label}"
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] text-slate-400 italic">
                    Estimated crowd level
                  </span>
                </div>

                <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-start gap-2 text-xs">
                  <Clock className="w-4 h-4 text-blue-800 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800">Best visiting time: </span>
                    <span className="text-slate-700">{destination.crowdPulse.bestTime}</span>
                    {destination.crowdPulse.note && (
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        {destination.crowdPulse.note}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* About description */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  About
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {destination.description}
                </p>
              </div>

              {/* Things to do / Highlights */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Things To Do
                </h3>
                <div className="space-y-2">
                  {destination.highlights.map((item, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2.5 p-2 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[11px]">
                        {idx + 1}
                      </span>
                      <span className="font-semibold text-slate-800">{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Review summary & action */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Traveller Rating: ★ {destination.rating} / 5.0
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Based on {destination.reviewCount} community contributions
                  </span>
                </div>
                <button
                  onClick={() => onOpenReviewModal(destination)}
                  className="text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl border border-blue-200"
                >
                  Write Review
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: SMART LOCAL EXPERIENCE */}
          {activeTab === 'LOCAL' && (
            <div className="space-y-4">
              {/* WHAT'S HAPPENING: Festival / Cultural Event */}
              {destination.smartLocal.happeningEvent && (
                <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-bold text-amber-900 tracking-wider uppercase flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-amber-700" />
                      WHAT'S HAPPENING
                    </span>
                    <span className="text-[10px] bg-amber-200/80 text-amber-950 font-semibold px-2 py-0.5 rounded-full">
                      {destination.smartLocal.happeningEvent.category}
                    </span>
                  </div>
                  <h4 className="font-bold text-sm text-slate-900">
                    {destination.smartLocal.happeningEvent.name}
                  </h4>
                  <p className="text-xs text-slate-700">
                    {destination.smartLocal.happeningEvent.description}
                  </p>
                  <div className="text-[11px] text-amber-900/80 pt-1 border-t border-amber-200/60 flex items-center justify-between">
                    <span>{destination.smartLocal.happeningEvent.date}</span>
                    <span className="text-[10px] opacity-75">
                      Source: {destination.smartLocal.happeningEvent.source}
                    </span>
                  </div>
                </div>
              )}

              {/* BEFORE YOU ENTER: Culture Etiquette (3 points) */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-950 tracking-wider uppercase flex items-center gap-1.5">
                    <Info className="w-4 h-4 text-blue-700" />
                    BEFORE YOU ENTER
                  </span>
                  <span className="text-[10.5px] text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                    {destination.smartLocal.cultureEtiquette.sourceLabel}
                  </span>
                </div>
                <div className="space-y-2">
                  {destination.smartLocal.cultureEtiquette.points.map((pt, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-xl bg-blue-50/50 border border-blue-100 flex items-start gap-2.5 text-xs text-slate-800 leading-relaxed"
                    >
                      <span className="w-5 h-5 rounded-full bg-blue-200 text-blue-900 font-bold flex items-center justify-center shrink-0 text-[10.5px]">
                        {i + 1}
                      </span>
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LOCAL FOOD INTELLIGENCE */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                    <Utensils className="w-4 h-4 text-amber-600" />
                    LOCAL FOOD INTELLIGENCE
                  </span>
                  <span className="text-[10px] text-slate-400 italic">
                    Sample recommendations
                  </span>
                </div>

                <div className="space-y-2.5">
                  {destination.smartLocal.localFood.map((food) => (
                    <div
                      key={food.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-1 text-xs"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{food.name}</span>
                        <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.2 rounded">
                          {food.priceEstimate}
                        </span>
                      </div>
                      <p className="text-slate-600 leading-relaxed">
                        {food.description}
                      </p>
                      <p className="text-[11px] text-blue-900 font-medium pt-0.5">
                        📍 Recommended spot: {food.recommendedSpot}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* LOCAL EXPERIENCES */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                <span className="text-xs font-bold text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  LOCAL EXPERIENCES
                </span>

                <div className="space-y-2">
                  {destination.smartLocal.localExperiences.map((exp) => (
                    <div
                      key={exp.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{exp.title}</span>
                        <span className="text-[10px] bg-blue-100 text-blue-900 font-semibold px-2 py-0.5 rounded-full">
                          {exp.duration}
                        </span>
                      </div>
                      <p className="text-slate-600">{exp.description}</p>
                      <p className="text-[10.5px] text-slate-500">
                        Provider: {exp.provider} •{' '}
                        {exp.verifiedSource ? 'Source verified' : 'Community listed'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: LAST-MILE TOURISM */}
          {activeTab === 'LAST_MILE' && (
            <div className="space-y-4">
              <div className="bg-blue-900 text-white rounded-2xl p-4 space-y-2 shadow-sm">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200 flex items-center gap-1.5">
                  <Bus className="w-4 h-4 text-amber-400" />
                  LAST-MILE CONNECTIVITY
                </span>
                <h4 className="font-bold text-base">
                  From: {destination.lastMile.hubName}
                </h4>
                <div className="flex items-center gap-3 text-xs text-blue-200">
                  <span>Distance: {destination.lastMile.distance}</span>
                  <span>•</span>
                  <span>Typical time: {destination.lastMile.typicalTime}</span>
                </div>
              </div>

              {/* Transport Step Visualizer */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    Available Last-Mile Options
                  </h4>

                  {/* Verified Filter Pill */}
                  <button
                    onClick={() => setFilterVerifiedOnly(!filterVerifiedOnly)}
                    className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border transition-colors ${
                      filterVerifiedOnly
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-xs'
                        : 'bg-slate-100 text-slate-700 border-slate-200 hover:bg-slate-200'
                    }`}
                  >
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>{filterVerifiedOnly ? 'Verified Only' : 'All Transport'}</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {(destination.lastMile?.options || [])
                    .filter((opt) => (!filterVerifiedOnly ? true : opt.isVerified))
                    .map((opt) => (
                      <div
                        key={opt.id}
                        className={`p-3.5 rounded-2xl border text-xs space-y-2.5 transition-all ${
                          opt.isVerified
                            ? 'bg-gradient-to-br from-emerald-50/40 via-white to-slate-50 border-emerald-200/90 shadow-2xs'
                            : 'bg-slate-50 border-slate-200'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-sm text-slate-900 block">
                                {opt.mode}
                              </span>
                              {opt.isVerified && (
                                <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-900 border border-emerald-300/80 px-2 py-0.5 rounded-full text-[10px] font-extrabold">
                                  <ShieldCheck className="w-3 h-3 text-emerald-700" />
                                  <span>{opt.verificationBadgeText || 'Verified Partner'}</span>
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block mt-0.5">
                              {opt.pickupDrop}
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="font-bold text-blue-900 text-xs block">
                              {opt.estimatedFare}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              Est. time: {opt.estimatedTime}
                            </span>
                          </div>
                        </div>

                        {/* Verified Safety Badge Checklist & Inspection */}
                        {opt.isVerified && (
                          <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-[11px]">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-emerald-950 flex items-center gap-1">
                                <Award className="w-3.5 h-3.5 text-emerald-700" />
                                <span>Audit Score: {opt.safetyScore || 96}%</span>
                              </span>
                              <span className="text-emerald-700">•</span>
                              <span className="text-emerald-800 text-[10.5px]">
                                {opt.verification?.registrationNumber || 'Official Stand'}
                              </span>
                            </div>

                            <button
                              onClick={() => setInspectedVerification(opt)}
                              className="text-[10.5px] font-bold text-emerald-900 bg-white hover:bg-emerald-100 border border-emerald-300 px-2 py-1 rounded-lg transition-colors flex items-center gap-1"
                            >
                              <FileCheck2 className="w-3 h-3" />
                              <span>Verify Badge</span>
                            </button>
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/80 text-slate-600">
                          <span>Frequency: {opt.frequency}</span>
                          <span className="bg-white px-2 py-0.5 rounded border border-slate-200 text-[10px] text-slate-500 font-medium">
                            {opt.availabilityLabel}
                          </span>
                        </div>
                      </div>
                    ))}
                </div>

                <p className="text-[11px] text-slate-400 italic text-center pt-1">
                  * Fares and frequencies are sample approximations to help plan budget.
                </p>
              </div>

              {/* Verification Credential Details Modal */}
              {inspectedVerification && (
                <div
                  className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs"
                  role="dialog"
                >
                  <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 border border-emerald-300 shadow-2xl animate-fade-in text-slate-900">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center">
                          <ShieldCheck className="w-5 h-5" />
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-slate-900">
                            Verified Transport Badge
                          </h4>
                          <span className="text-[11px] text-emerald-800 font-semibold">
                            {inspectedVerification.verification?.badgeText || inspectedVerification.mode}
                          </span>
                        </div>
                      </div>
                      <button
                        onClick={() => setInspectedVerification(null)}
                        className="p-1 rounded-full text-slate-400 hover:text-slate-700 bg-slate-100"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Official Registration & Safety Checks */}
                    <div className="space-y-2.5 text-xs">
                      <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200 space-y-1">
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Registration / Stand ID:</span>
                          <span className="font-mono font-bold text-slate-800">
                            {inspectedVerification.verification?.registrationNumber || 'REG-TN-2024-OFFICIAL'}
                          </span>
                        </div>
                        <div className="flex justify-between text-[11px]">
                          <span className="text-slate-500">Audit Status:</span>
                          <span className="font-bold text-emerald-700">
                            {inspectedVerification.verification?.auditDate || 'Recently Audited'}
                          </span>
                        </div>
                      </div>

                      <div className="space-y-1.5 pt-1">
                        <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                          Transport Safety Standards Met:
                        </span>
                        <div className="space-y-1 text-slate-700 text-[11.5px]">
                          <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Pre-fixed / Government tariff compliant</span>
                          </div>
                          <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Background-verified driver & registered stand</span>
                          </div>
                          <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>Emergency SOS assistance ready</span>
                          </div>
                          <div className="flex items-center gap-2 p-1.5 bg-emerald-50 rounded-lg">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                            <span>GPS fleet tracked for passenger safety</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <button
                      onClick={() => setInspectedVerification(null)}
                      className="w-full bg-slate-900 text-white font-bold text-xs py-2.5 rounded-xl transition-colors hover:bg-slate-800"
                    >
                      Done
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SAFETY & ACCESSIBILITY */}
          {activeTab === 'SAFETY' && (
            <div className="space-y-4">
              {/* Active Alerts */}
              {destination.safetyCentre.alerts.map((al) => (
                <div
                  key={al.id}
                  className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs space-y-1.5 text-amber-950"
                >
                  <div className="flex items-center gap-1.5 font-bold text-amber-900">
                    <ShieldAlert className="w-4 h-4 text-amber-600" />
                    <span>{al.title}</span>
                  </div>
                  <p className="text-amber-800 leading-relaxed">{al.message}</p>
                  <span className="text-[10.5px] text-amber-700 block opacity-80">
                    Source: {al.source} • {al.date}
                  </span>
                </div>
              ))}

              {/* Medical Facilities */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Nearby Healthcare Facilities
                </span>

                <div className="space-y-2">
                  {destination.safetyCentre.facilities.map((fac) => (
                    <div
                      key={fac.id}
                      className="p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-slate-900 block">{fac.name}</span>
                        <span className="text-[11px] text-slate-500">
                          {fac.type} • {fac.distance} away ({fac.verifiedStatus})
                        </span>
                      </div>
                      <a
                        href={`tel:${fac.phone}`}
                        className="text-xs font-bold text-blue-900 bg-blue-100 hover:bg-blue-200 px-2.5 py-1.5 rounded-lg shrink-0"
                      >
                        Call
                      </a>
                    </div>
                  ))}
                </div>
              </div>

              {/* Accessibility Features */}
              <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2">
                <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                  <Accessibility className="w-4 h-4 text-blue-700" />
                  ACCESSIBILITY & SENIOR ADVISORY
                </span>
                <div className="space-y-1.5">
                  {destination.accessibilityFeatures.map((feat, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2 text-xs text-slate-700 p-2 bg-slate-50 rounded-lg"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer CTAs */}
        <div className="p-3.5 bg-white border-t border-slate-200 flex items-center gap-2.5 shrink-0">
          <button
            id="dest-detail-ask-buddy-btn"
            onClick={() =>
              onAskJourneyBuddy(`Tell me more about ${destination.name}`, destination.name)
            }
            className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition-colors min-h-[48px]"
          >
            <PhoenixAvatar size="xs" mood="happy" />
            <span>Ask Journey Buddy</span>
          </button>

          <button
            id="dest-detail-plan-trip-btn"
            onClick={() => onPlanTrip(destination)}
            className="flex-1 bg-blue-900 hover:bg-blue-800 text-white text-xs font-bold py-3 px-3 rounded-2xl flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95 min-h-[48px]"
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Plan a Trip</span>
          </button>
        </div>
      </div>
    </div>
  );
};
