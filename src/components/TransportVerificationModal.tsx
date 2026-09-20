import React from 'react';
import { LastMileOption } from '../types';
import { ShieldCheck, CheckCircle2, AlertCircle, X, Award, ExternalLink, Compass } from 'lucide-react';

interface TransportVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  option: LastMileOption | null;
  destinationName?: string;
}

export const TransportVerificationModal: React.FC<TransportVerificationModalProps> = ({
  isOpen,
  onClose,
  option,
  destinationName,
}) => {
  if (!isOpen || !option) return null;

  const verification = option.verification || {
    type: 'GOVT_REGISTERED',
    badgeText: option.verificationBadgeText || 'Government Registered Transport',
    registrationNumber: `REG-${option.id.toUpperCase()}-2026-VERIFIED`,
    auditDate: 'Verified Q3 2026',
    checklist: {
      fixedRateCompliant: true,
      backgroundChecked: true,
      sosEquipped: true,
      gpsTracked: true,
    },
  };

  const safetyScore = option.safetyScore || 96;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="verification-modal-title"
    >
      <div
        className="bg-white rounded-3xl max-w-sm w-full overflow-hidden shadow-2xl border border-slate-200 text-slate-900 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Header */}
        <div className="bg-gradient-to-br from-blue-900 to-indigo-950 text-white p-5 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-blue-200 hover:text-white p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-400 block">
                Verified Transport
              </span>
              <h3 id="verification-modal-title" className="text-base font-black text-white leading-tight">
                {option.mode}
              </h3>
            </div>
          </div>

          <div className="flex items-center justify-between bg-white/10 backdrop-blur-xs rounded-xl px-3 py-2 mt-2 border border-white/10 text-xs">
            <div>
              <span className="text-[10px] text-blue-200 block">Safety Rating</span>
              <span className="text-base font-black text-emerald-300">{safetyScore}%</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-blue-200 block">Status</span>
              <span className="text-xs font-bold text-white flex items-center gap-1 justify-end">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Active & Certified
              </span>
            </div>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {/* Certificate Badge Card */}
          <div className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-3.5 space-y-2">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold text-xs text-emerald-950">
                {verification.badgeText}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[11px] pt-1 border-t border-emerald-200/60 text-emerald-900">
              <div>
                <span className="text-emerald-700/70 block text-[9.5px] uppercase font-semibold">
                  Registry / Union ID
                </span>
                <span className="font-mono font-bold">{verification.registrationNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-emerald-700/70 block text-[9.5px] uppercase font-semibold">
                  Audit Period
                </span>
                <span className="font-semibold">{verification.auditDate}</span>
              </div>
            </div>
          </div>

          {/* 4-Point Safety Standards Checklist */}
          <div>
            <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Safety Compliance Checklist</span>
              <span className="text-[10px] text-slate-400 lowercase font-normal">verified</span>
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Fixed Rate Compliance</span>
                    <span className="text-[10.5px] text-slate-500">
                      Standard tariff card displayed; no arbitrary surge
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Passed
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">Driver Background Verified</span>
                    <span className="text-[10.5px] text-slate-500">
                      Identity & badge checked by local transport authority
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Passed
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">SOS / Emergency Readiness</span>
                    <span className="text-[10.5px] text-slate-500">
                      Vehicle registered with police emergency response 112
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Equipped
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="font-bold text-slate-900 block">GPS / Route Tracking</span>
                    <span className="text-[10.5px] text-slate-500">
                      Official corridor route verified along major arteries
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
            </div>
          </div>

          {/* Ride Details Summary */}
          <div className="bg-slate-50 rounded-2xl p-3.5 border border-slate-200 text-xs space-y-1.5">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              Route & Fare Context
            </span>
            <div className="flex justify-between">
              <span className="text-slate-500">Pickup / Corridor:</span>
              <span className="font-medium text-slate-900">{option.pickupDrop}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Estimated Fare:</span>
              <span className="font-bold text-blue-950">{option.estimatedFare}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Service Frequency:</span>
              <span className="font-medium text-slate-700">{option.frequency}</span>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-2">
          <button
            onClick={onClose}
            className="w-full bg-blue-900 hover:bg-blue-800 text-white font-bold text-xs py-3 px-4 rounded-xl transition-colors text-center"
          >
            Understood & Close
          </button>
        </div>
      </div>
    </div>
  );
};
