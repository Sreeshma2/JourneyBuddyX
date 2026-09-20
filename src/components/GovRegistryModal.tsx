import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Database,
  Building2,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Scale,
  Car,
  Compass,
  FileText,
} from 'lucide-react';
import { GovtDataSource } from '../types';
import { fetchGovernmentData } from '../services/databaseService';

interface GovRegistryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GovRegistryModal: React.FC<GovRegistryModalProps> = ({ isOpen, onClose }) => {
  const [sources, setSources] = useState<GovtDataSource[]>([]);
  const [activeTab, setActiveTab] = useState<'SOURCES' | 'TRAFFIC' | 'ACTS'>('SOURCES');

  useEffect(() => {
    fetchSources();
  }, []);

  const fetchSources = async () => {
    try {
      const res = await fetch('/api/gov-registry');
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
        return;
      }
    } catch {
      // try fallback endpoint
    }

    try {
      const res = await fetch('/api/sources');
      if (res.ok) {
        const data = await res.json();
        setSources(data.sources || []);
        return;
      }
    } catch (err) {
      console.warn('Failed to fetch legal sources from API, using databaseService:', err);
    }

    const { data } = await fetchGovernmentData();
    setSources(data || []);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-200 my-auto"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Database className="w-5 h-5 text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg">
                  Official Government & Legal Data Registry
                </h2>
                <span className="bg-blue-500/30 text-blue-200 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Legally Verified
                </span>
              </div>
              <p className="text-xs text-blue-200 font-medium">
                Public datasets collected strictly through verified statutory authorities & APIs
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="p-3 border-b border-slate-100 flex items-center gap-2 bg-slate-50">
          <button
            onClick={() => setActiveTab('SOURCES')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'SOURCES'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Statutory Tourism Authorities
          </button>
          <button
            onClick={() => setActiveTab('TRAFFIC')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'TRAFFIC'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Traffic & Maritime Regulators
          </button>
          <button
            onClick={() => setActiveTab('ACTS')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors ${
              activeTab === 'ACTS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            Consumer Protection Acts
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 max-h-[70vh] overflow-y-auto space-y-3">
          {activeTab === 'SOURCES' && (
            <div className="space-y-3">
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  All monument entry hours, ticketing tariffs, and cultural guidelines are pulled
                  directly from certified Gazette notifications and statutory board portals.
                </span>
              </div>

              {sources.map((src) => (
                <div
                  key={src.id}
                  className="bg-white border border-slate-200 rounded-2xl p-3.5 hover:border-blue-300 transition-all shadow-2xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-blue-50 text-blue-800">
                          {src.category}
                        </span>
                        <span className="text-xs font-extrabold text-slate-900">{src.name}</span>
                      </div>
                      <p className="text-xs text-slate-600 font-medium">{src.description}</p>
                      <div className="flex items-center gap-2 mt-2 text-[11px] text-slate-400">
                        <span className="font-semibold text-slate-600">Statutory Department:</span>
                        <span>{src.department}</span>
                        <span>•</span>
                        <span className="text-emerald-700 font-semibold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Sync
                        </span>
                      </div>
                    </div>

                    <a
                      href={src.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-600 text-slate-600 transition-colors shrink-0"
                      title="Open official portal"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'TRAFFIC' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-blue-50 border border-blue-200 rounded-2xl">
                <h4 className="font-extrabold text-sm text-blue-950 flex items-center gap-2 mb-1">
                  <Car className="w-4 h-4 text-blue-700" />
                  MoRTH & State Transport Undertaking (STU) Standards
                </h4>
                <p className="text-blue-900 font-medium leading-relaxed">
                  Last-mile transit estimates, prepaid auto stands, and boat tariff charts are cross-checked
                  against official Regional Transport Authority (RTA) notifications.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase">
                    Maritime Safety Authority
                  </span>
                  <h5 className="font-bold text-slate-900 text-xs mt-0.5">
                    Kerala & Tamil Nadu Inland Navigation Directorate
                  </h5>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Regulates boat carrying capacity, mandatory life jacket usage, and standard hourly tariffs for shikaras and ferries.
                  </p>
                </div>

                <div className="p-3.5 border border-slate-200 rounded-2xl bg-slate-50">
                  <span className="text-[10px] font-extrabold text-blue-700 uppercase">
                    Traffic Police Cadre
                  </span>
                  <h5 className="font-bold text-slate-900 text-xs mt-0.5">
                    District Tourist Police Help Desks
                  </h5>
                  <p className="text-[11px] text-slate-600 mt-1">
                    Direct liaison stations at railway terminals, bus depots, and major ghats ensuring no passenger overcharging.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'ACTS' && (
            <div className="space-y-3 text-xs">
              <div className="p-3.5 bg-slate-100 border border-slate-200 rounded-2xl">
                <h4 className="font-extrabold text-slate-900 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-slate-700" />
                  Statutory Tourist Protection Legal Framework
                </h4>
                <p className="text-slate-600 mt-1">
                  Under the Consumer Protection Act (2019) and State Tourist Trade Facilitation Acts, visitors are protected against overcharging, unlicensed touting, and non-disclosure of regulated fares.
                </p>
              </div>

              <div className="space-y-2">
                <div className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900">National 24x7 Multi-lingual Tourist Helpline</h5>
                    <p className="text-[11px] text-slate-500">Government of India • Ministry of Tourism</p>
                  </div>
                  <span className="font-extrabold text-xs text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                    1800-11-1363 (Toll Free)
                  </span>
                </div>

                <div className="p-3 border border-slate-200 rounded-xl bg-white flex items-center justify-between">
                  <div>
                    <h5 className="font-bold text-slate-900">National Emergency Support Response (NERS)</h5>
                    <p className="text-[11px] text-slate-500">Integrated Police, Fire & Medical Lifeline</p>
                  </div>
                  <span className="font-extrabold text-xs text-rose-700 bg-rose-50 px-2.5 py-1 rounded-lg">
                    112 (Universal)
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <Lock className="w-3.5 h-3.5 text-emerald-600" /> All data is retrieved from legal, official channels only
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            Close Registry
          </button>
        </div>
      </motion.div>
    </div>
  );
};
