import React, { useState } from 'react';
import { UserProfile, SafetyAlert, SafetyFacility } from '../../types';
import { PhoenixAvatar } from '../PhoenixAvatar';
import { SosEmergencyModal } from './SosEmergencyModal';
import { OfflineMapView } from './OfflineMapView';
import {
  ShieldAlert,
  PhoneCall,
  Activity,
  MapPin,
  CheckCircle2,
  Users,
  AlertTriangle,
  Info,
  Building2,
  HeartPulse,
  Share2,
  Plus,
  ShieldCheck,
  AlertOctagon,
  Radio,
  Map,
} from 'lucide-react';

interface SafetyScreenProps {
  userProfile: UserProfile;
  currentLocationName?: string;
  onAskJourneyBuddy: (prompt: string) => void;
  onOpenLifeline: () => void;
  onAddContact: (contact: { name: string; phone: string; relationship: string }) => void;
}

export const SafetyScreen: React.FC<SafetyScreenProps> = ({
  userProfile,
  currentLocationName = 'Kanyakumari • Cape Comorin',
  onAskJourneyBuddy,
  onOpenLifeline,
  onAddContact,
}) => {
  const [isSosOpen, setIsSosOpen] = useState(false);
  const [sharingLocation, setSharingLocation] = useState(true);
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContactName, setNewContactName] = useState('');
  const [newContactPhone, setNewContactPhone] = useState('');
  const [newContactRelation, setNewContactRelation] = useState('');

  // Primary emergency numbers (standard national services)
  const emergencyNumbers = [
    { label: 'All Emergencies (National)', number: '112', type: 'Police / First Responder' },
    { label: 'Ambulance & Medical Trauma', number: '108', type: 'Medical' },
    { label: 'Tourist Police Helpdesk (Cape)', number: '+91 4652 246220', type: 'Tourist Support' },
    { label: 'Women Helpline', number: '1091', type: 'Safety Line' },
    { label: 'Coastal Marine Police', number: '1093', type: 'Coastline' },
  ];

  // Location-aware active safety alerts
  const activeAlerts: SafetyAlert[] = [
    {
      id: 'al-cape-1',
      title: 'High Tide Rocky Shore Warning (4:00 PM – 6:30 PM)',
      message: 'Slippery wave breakwater rocks active during sunset tides. Observe red safety flags along the promenade.',
      severity: 'warning',
      source: 'Maritime Board & Coastal Security',
      date: 'Today',
    },
    {
      id: 'al-cape-2',
      title: 'Mandatory Lifejackets on Poompuhar Ferry',
      message: 'All passengers are required to wear secure lifejackets before boarding the rock memorial boat.',
      severity: 'info',
      source: 'Tamil Nadu Tourism Development Corp',
      date: 'Standard regulation',
    },
  ];

  // Nearby medical facilities
  const medicalFacilities: SafetyFacility[] = [
    {
      id: 'med-1',
      name: 'Government Primary Health & Trauma Centre',
      type: 'Hospital',
      distance: '1.2 km away',
      phone: '+91 4652 246233',
      verifiedStatus: 'State district health listed',
    },
    {
      id: 'med-2',
      name: 'Cape Medico 24x7 Chemist & Oxygen Depot',
      type: '24x7 Pharmacy',
      distance: '0.4 km away',
      phone: '+91 4652 246102',
      verifiedStatus: 'Verified vendor registry',
    },
  ];

  const handleSaveContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (newContactName.trim() && newContactPhone.trim()) {
      onAddContact({
        name: newContactName.trim(),
        phone: newContactPhone.trim(),
        relationship: newContactRelation.trim() || 'Emergency Contact',
      });
      setNewContactName('');
      setNewContactPhone('');
      setNewContactRelation('');
      setShowAddContact(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen pb-24 bg-slate-50 text-slate-900">
      {/* Top Sticky Header */}
      <header className="bg-white border-b border-slate-200/80 px-4 pt-6 pb-4 sticky top-0 z-20 shadow-xs">
        <div className="max-w-md mx-auto flex items-center justify-between">
          <div>
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-900" />
              <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">
                Safety Centre
              </span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Stay Safe & Supported
            </h1>
            <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-blue-700" />
              <span>Location: {currentLocationName}</span>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              id="safety-header-sos-btn"
              onClick={() => setIsSosOpen(true)}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-xs font-black px-3 py-2 rounded-xl shadow-xs transition-all active:scale-95"
              aria-label="Open Emergency SOS"
            >
              <AlertOctagon className="w-4 h-4 fill-white text-red-600" />
              <span>SOS</span>
            </button>

            <button
              onClick={() => onAskJourneyBuddy('What does this safety alert mean?')}
              className="flex items-center gap-1.5 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold px-3 py-2 rounded-xl border border-blue-200 transition-colors"
            >
              <PhoenixAvatar size="xs" mood="alert" />
              <span>Ask Phoenix</span>
            </button>
          </div>
        </div>
      </header>

      <main className="px-4 py-4 max-w-md mx-auto w-full space-y-4">
        {/* SECTION 0: PROMINENT SOS EMERGENCY DISTRESS BANNER */}
        <section
          id="safety-sos-banner-card"
          className="bg-gradient-to-r from-red-600 via-red-600 to-rose-700 rounded-3xl p-4 text-white shadow-lg border border-red-400/50 space-y-3 relative overflow-hidden"
        >
          <div className="flex items-start justify-between relative z-10">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-300 animate-ping"></span>
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-100">
                  Instant Emergency Assistance
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white">
                Emergency SOS Distress
              </h2>
              <p className="text-xs text-red-100 max-w-[260px] leading-relaxed">
                1-tap emergency dispatch: auto-dials 112, generates safety siren tone, and transmits real-time GPS coordinates.
              </p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-xs flex items-center justify-center border border-white/30 text-white shrink-0">
              <AlertOctagon className="w-7 h-7 fill-current" />
            </div>
          </div>

          <button
            id="safety-trigger-sos-btn"
            onClick={() => setIsSosOpen(true)}
            className="w-full bg-white hover:bg-red-50 active:bg-red-100 text-red-700 font-black text-sm py-3 px-4 rounded-2xl flex items-center justify-between shadow-md transition-transform active:scale-[0.98] min-h-[48px]"
          >
            <div className="flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-600 animate-pulse" />
              <span>LAUNCH 1-TAP SOS ALERT</span>
            </div>
            <span className="text-xs font-bold bg-red-100 text-red-800 px-2.5 py-1 rounded-full">
              Tap to Open
            </span>
          </button>
        </section>

        {/* SECTION 1: OFFLINE SAFE ZONES & MAPS */}
        <OfflineMapView />

        {/* SECTION 2: TRUSTED CIRCLE LIVE STATUS */}
        <section
          id="safety-trusted-circle-card"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-900" />
              <div>
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Trusted Circle Status
                </h3>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  {sharingLocation ? 'Live safety sharing active' : 'Safety sharing paused'}
                </span>
              </div>
            </div>

            <button
              id="safety-toggle-sharing-btn"
              onClick={() => setSharingLocation(!sharingLocation)}
              className={`text-xs font-bold px-3 py-1.5 rounded-full border transition-colors min-h-[36px] ${
                sharingLocation
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              {sharingLocation ? 'Active' : 'Enable'}
            </button>
          </div>

          {/* Trusted contacts list */}
          <div className="space-y-2 pt-1 border-t border-slate-100">
            {userProfile.trustedContacts.map((contact, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-slate-50 border border-slate-100"
              >
                <div>
                  <span className="font-bold text-slate-900 block">{contact.name}</span>
                  <span className="text-[11px] text-slate-500">
                    {contact.relationship} • {contact.phone}
                  </span>
                </div>
                <a
                  href={`tel:${contact.phone.replace(/\s+/g, '')}`}
                  className="bg-white hover:bg-blue-50 text-blue-900 font-bold px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs flex items-center gap-1 min-h-[36px]"
                >
                  <PhoneCall className="w-3 h-3 text-blue-700" />
                  <span>Call</span>
                </a>
              </div>
            ))}

            {/* Add Contact form/toggle */}
            {!showAddContact ? (
              <button
                id="safety-add-contact-btn"
                onClick={() => setShowAddContact(true)}
                className="w-full py-2 px-3 border border-dashed border-slate-300 hover:border-blue-400 rounded-xl text-xs font-semibold text-blue-900 flex items-center justify-center gap-1.5 transition-colors min-h-[44px]"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Trusted Contact</span>
              </button>
            ) : (
              <form onSubmit={handleSaveContact} className="p-3 bg-slate-100 rounded-xl space-y-2 text-xs">
                <input
                  type="text"
                  placeholder="Full Name (e.g., Ananya)"
                  value={newContactName}
                  onChange={(e) => setNewContactName(e.target.value)}
                  className="w-full bg-white p-2 rounded-lg border border-slate-200 focus:outline-none"
                  required
                />
                <input
                  type="tel"
                  placeholder="Phone Number (+91...)"
                  value={newContactPhone}
                  onChange={(e) => setNewContactPhone(e.target.value)}
                  className="w-full bg-white p-2 rounded-lg border border-slate-200 focus:outline-none"
                  required
                />
                <input
                  type="text"
                  placeholder="Relationship (e.g., Sister, Friend)"
                  value={newContactRelation}
                  onChange={(e) => setNewContactRelation(e.target.value)}
                  className="w-full bg-white p-2 rounded-lg border border-slate-200 focus:outline-none"
                />
                <div className="flex gap-2 pt-1">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-900 text-white font-bold py-1.5 rounded-lg"
                  >
                    Save Contact
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddContact(false)}
                    className="flex-1 bg-white text-slate-700 font-semibold py-1.5 rounded-lg border border-slate-200"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </section>

        {/* SECTION 2: LOCATION-AWARE SAFETY ALERTS */}
        <section id="safety-alerts-section" className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Active Travel Advisories & Warnings
          </h3>

          <div className="space-y-2.5">
            {activeAlerts.map((alert) => {
              const isWarn = alert.severity === 'warning';
              return (
                <div
                  key={alert.id}
                  className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                    isWarn
                      ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                      : 'bg-blue-50/80 border-blue-200 text-blue-950'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-bold text-sm">
                    {isWarn ? (
                      <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    ) : (
                      <Info className="w-4 h-4 text-blue-700 shrink-0" />
                    )}
                    <span>{alert.title}</span>
                  </div>
                  <p className="leading-relaxed opacity-90">{alert.message}</p>
                  <div className="pt-1 flex items-center justify-between text-[10.5px] opacity-75 font-medium border-t border-current/10">
                    <span>Source: {alert.source}</span>
                    <span>{alert.date}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* SECTION 3: EMERGENCY ASSISTANCE NUMBERS */}
        <section id="safety-emergency-contacts-section" className="space-y-2">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Emergency Contacts
            </h3>
            <span className="text-[11px] text-slate-500">Accessible 24x7</span>
          </div>

          <div className="space-y-2">
            {emergencyNumbers.map((em, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-900 text-[13px] block">
                    {em.label}
                  </span>
                  <span className="text-[11px] text-slate-500">
                    {em.type} • Direct dispatch
                  </span>
                </div>

                <a
                  href={`tel:${em.number.replace(/\s+/g, '')}`}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-900 font-extrabold px-3 py-2 rounded-xl border border-rose-200 flex items-center gap-1.5 transition-colors min-h-[44px] min-w-[44px]"
                  aria-label={`Call ${em.label} at ${em.number}`}
                >
                  <PhoneCall className="w-3.5 h-3.5 text-rose-700" />
                  <span>{em.number}</span>
                </a>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 4: NEARBY MEDICAL FACILITIES */}
        <section id="safety-medical-facilities-section" className="space-y-2">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider px-1">
            Nearby Medical Facilities
          </h3>

          <div className="space-y-2">
            {medicalFacilities.map((fac) => (
              <div
                key={fac.id}
                className="bg-white rounded-2xl p-3.5 border border-slate-200 shadow-2xs space-y-1.5 text-xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="font-bold text-slate-900 block">{fac.name}</span>
                    <span className="text-[11px] text-slate-500">
                      {fac.type} • {fac.distance}
                    </span>
                  </div>
                  <a
                    href={`tel:${fac.phone}`}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-900 font-bold px-2.5 py-1.5 rounded-lg border border-blue-200 text-xs min-h-[36px] flex items-center"
                  >
                    Call
                  </a>
                </div>
                <p className="text-[10.5px] text-emerald-700 font-medium">
                  ✓ {fac.verifiedStatus}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 5: TRAVEL GUIDANCE */}
        <section
          id="safety-guidance-card"
          className="bg-white rounded-2xl p-4 border border-slate-200 shadow-2xs space-y-2.5 text-xs"
        >
          <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-900" />
            General Tourist Safety Guidance
          </span>
          <div className="space-y-2 text-slate-700 leading-relaxed">
            <p>
              • Keep your offline pack downloaded via the Travel Lifeline in case cellular coverage drops near rocky points.
            </p>
            <p>
              • Pre-negotiate fares or use official prepaid vehicle stands at railway termini and bus stands.
            </p>
            <p>
              • Ensure your emergency trusted contacts know your hotel address and daily departure timings.
            </p>
          </div>
        </section>
      </main>

      {/* SOS Emergency Modal */}
      <SosEmergencyModal
        isOpen={isSosOpen}
        onClose={() => setIsSosOpen(false)}
        userProfile={userProfile}
        currentLocationName={currentLocationName}
      />
    </div>
  );
};
