import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Ticket,
  QrCode,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  Plus,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  ChevronRight,
  ExternalLink,
  Sparkles,
} from 'lucide-react';
import { TicketBooking, TicketCategory } from '../types';
import { fetchTickets, saveTicket } from '../services/databaseService';

interface TicketWalletModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultOpenBookMode?: boolean;
}

interface CatalogItem {
  id: string;
  destinationId: string;
  attractionName: string;
  category: TicketCategory;
  govAuthority: string;
  officialTariffs: {
    indianAdult: number;
    international: number;
    student: number;
    senior: number;
  };
  timings: string;
  inclusionText: string;
  location: string;
  cancellationPolicy: string;
}

export const TicketWalletModal: React.FC<TicketWalletModalProps> = ({
  isOpen,
  onClose,
  defaultOpenBookMode = false,
}) => {
  const [tickets, setTickets] = useState<TicketBooking[]>([]);
  const [catalog, setCatalog] = useState<CatalogItem[]>([]);
  const [isBookingMode, setIsBookingMode] = useState(defaultOpenBookMode);
  const [selectedTicket, setSelectedTicket] = useState<TicketBooking | null>(null);

  // Booking Form State
  const [selectedCatalogId, setSelectedCatalogId] = useState<string>('cat-01');
  const [visitDate, setVisitDate] = useState('Tomorrow');
  const [slotTime, setSlotTime] = useState('10:00 AM – 11:30 AM');
  const [adults, setAdults] = useState(2);
  const [children, setChildren] = useState(0);
  const [seniors, setSeniors] = useState(0);
  const [tariffTier, setTariffTier] = useState<'INDIAN_NATIONAL' | 'INTERNATIONAL_VISITOR' | 'STUDENT'>(
    'INDIAN_NATIONAL'
  );
  const [holderName, setHolderName] = useState('Sreeshma');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookSuccess, setBookSuccess] = useState(false);

  useEffect(() => {
    fetchWalletTickets();
    fetchCatalog();
  }, []);

  const fetchWalletTickets = async () => {
    try {
      const res = await fetch('/api/tickets/wallet');
      if (res.ok) {
        const data = await res.json();
        setTickets(data.tickets || []);
        return;
      }
    } catch (err) {
      console.warn('Failed to fetch wallet tickets from API, loading from databaseService:', err);
    }
    const { data } = await fetchTickets();
    setTickets(data || []);
  };

  const fetchCatalog = async () => {
    try {
      const res = await fetch('/api/tickets/catalog');
      if (res.ok) {
        const data = await res.json();
        setCatalog(data.catalog || []);
      }
    } catch (err) {
      console.warn('Failed to fetch catalog:', err);
    }
  };

  const selectedCatalog = catalog.find((c) => c.id === selectedCatalogId) || catalog[0];

  const calculateTotal = () => {
    if (!selectedCatalog) return 100;
    const unit =
      tariffTier === 'INTERNATIONAL_VISITOR'
        ? selectedCatalog.officialTariffs.international
        : tariffTier === 'STUDENT'
        ? selectedCatalog.officialTariffs.student
        : selectedCatalog.officialTariffs.indianAdult;

    return (adults + seniors) * unit + children * Math.round(unit * 0.5);
  };

  const handleBookTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch('/api/tickets/book', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          catalogId: selectedCatalogId,
          visitDate,
          slotTime,
          guestCount: { adults, children, seniors },
          tariffTier,
          holderName,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTickets((prev) => [data.ticket, ...prev]);
        setSelectedTicket(data.ticket);
        setBookSuccess(true);
        setTimeout(() => {
          setBookSuccess(false);
          setIsBookingMode(false);
        }, 1200);
      }
    } catch (err) {
      console.warn('Booking error:', err);
    } finally {
      setIsSubmitting(false);
    }
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
        <div className="bg-gradient-to-r from-emerald-700 via-teal-700 to-cyan-700 text-white p-4 sm:p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner">
              <Ticket className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-extrabold text-base sm:text-lg">Ticket Wallet</h2>
                <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Official E-Passes
                </span>
              </div>
              <p className="text-xs text-emerald-100 font-medium">
                Stores your verified monument, ferry, and safari passes with live gate QR codes
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

        {/* Action Toggle bar */}
        <div className="px-5 pt-4 flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setIsBookingMode(false);
                setSelectedTicket(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                !isBookingMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              My Saved Passes ({tickets.length})
            </button>
            <button
              onClick={() => setIsBookingMode(true)}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                isBookingMode
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
              }`}
            >
              <Plus className="w-3.5 h-3.5" /> Book Official Ticket
            </button>
          </div>
          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline">
            ASI & State Board Approved
          </span>
        </div>

        {/* Body Content */}
        <div className="p-4 sm:p-5 max-h-[75vh] overflow-y-auto">
          {isBookingMode ? (
            /* Booking Flow */
            <form onSubmit={handleBookTicket} className="space-y-4">
              <div className="bg-emerald-50/70 border border-emerald-200 rounded-2xl p-3.5 text-xs text-emerald-900 font-medium flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>
                  All bookings are verified against official Government Gazette tariffs. Zero surge
                  pricing, instant digital QR pass issued to your Ticket Wallet.
                </span>
              </div>

              {/* Select Attraction */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Select Monument / Ferry / Experience
                </label>
                <div className="space-y-2">
                  {catalog.map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setSelectedCatalogId(item.id)}
                      className={`p-3 rounded-2xl border-2 cursor-pointer transition-all flex items-start justify-between gap-3 ${
                        selectedCatalogId === item.id
                          ? 'border-emerald-500 bg-emerald-50/30 ring-2 ring-emerald-500/20'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {item.category}
                          </span>
                          <span className="text-xs font-extrabold text-slate-900">
                            {item.attractionName}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500">{item.govAuthority}</p>
                        <p className="text-[11px] text-emerald-700 font-medium mt-1">
                          ✓ {item.inclusionText}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <span className="text-xs font-black text-slate-900 block">
                          ₹{item.officialTariffs.indianAdult}
                        </span>
                        <span className="text-[10px] text-slate-400">Govt Tariff</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Date & Slot selection */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Visit Date
                  </label>
                  <select
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Today">Today (Immediate Gate Access)</option>
                    <option value="Tomorrow">Tomorrow</option>
                    <option value="Weekend (Saturday)">Weekend (Saturday)</option>
                    <option value="Weekend (Sunday)">Weekend (Sunday)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Time Slot
                  </label>
                  <select
                    value={slotTime}
                    onChange={(e) => setSlotTime(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="08:00 AM – 10:00 AM">08:00 AM – 10:00 AM (Quietest)</option>
                    <option value="10:00 AM – 12:00 PM">10:00 AM – 12:00 PM</option>
                    <option value="02:30 PM – 04:30 PM">02:30 PM – 04:30 PM (Sunset Ferry)</option>
                    <option value="04:30 PM – 06:00 PM">04:30 PM – 06:00 PM</option>
                  </select>
                </div>
              </div>

              {/* Guest Counts and Tier */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3.5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">Tariff Category</span>
                  <div className="flex gap-1.5">
                    {[
                      { key: 'INDIAN_NATIONAL', label: 'Domestic' },
                      { key: 'INTERNATIONAL_VISITOR', label: 'International' },
                      { key: 'STUDENT', label: 'Student ID' },
                    ].map((t) => (
                      <button
                        type="button"
                        key={t.key}
                        onClick={() => setTariffTier(t.key as any)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors ${
                          tariffTier === t.key
                            ? 'bg-emerald-600 text-white'
                            : 'bg-white text-slate-600 border border-slate-200'
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                  <div className="text-center">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Adults
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setAdults(Math.max(1, adults - 1))}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold">{adults}</span>
                      <button
                        type="button"
                        onClick={() => setAdults(adults + 1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Children (Below 12)
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setChildren(Math.max(0, children - 1))}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold">{children}</span>
                      <button
                        type="button"
                        onClick={() => setChildren(children + 1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-center">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Seniors (60+)
                    </label>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        type="button"
                        onClick={() => setSeniors(Math.max(0, seniors - 1))}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 font-bold"
                      >
                        -
                      </button>
                      <span className="text-xs font-bold">{seniors}</span>
                      <button
                        type="button"
                        onClick={() => setSeniors(seniors + 1)}
                        className="w-6 h-6 rounded-md bg-white border border-slate-200 font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>

                {/* Primary Guest Name */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Primary Pass Holder Name (as on Govt ID)
                  </label>
                  <input
                    type="text"
                    required
                    value={holderName}
                    onChange={(e) => setHolderName(e.target.value)}
                    className="w-full bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-800 focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              {/* Total & Instant Booking CTA */}
              <div className="bg-slate-900 text-white rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 block">
                    Total Official Fee
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold text-emerald-400">
                      ₹{calculateTotal()}
                    </span>
                    <span className="text-xs text-slate-400">inclusive of maritime/ASI tax</span>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all active:scale-95 flex items-center gap-2"
                >
                  {isSubmitting ? (
                    'Issuing Official Pass...'
                  ) : bookSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" /> Pass Issued!
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Issue E-Pass
                    </>
                  )}
                </button>
              </div>
            </form>
          ) : (
            /* Ticket Wallet List */
            <div className="space-y-4">
              {tickets.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto mb-3">
                    <Ticket className="w-8 h-8" />
                  </div>
                  <h3 className="font-extrabold text-sm text-slate-800">Your Ticket Wallet is Empty</h3>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto mt-1 mb-4">
                    Book verified tickets for monuments, ferries, and safaris with official government tariffs.
                  </p>
                  <button
                    onClick={() => setIsBookingMode(true)}
                    className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-md"
                  >
                    Browse Ticket Catalog
                  </button>
                </div>
              ) : (
                tickets.map((ticket) => (
                  <motion.div
                    key={ticket.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative overflow-hidden bg-gradient-to-br from-white to-slate-50 border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-sm hover:shadow-md transition-shadow"
                  >
                    {/* Top Notch styling (Real Ticket aesthetics) */}
                    <div className="flex items-start justify-between gap-3 pb-3 border-b border-dashed border-slate-300">
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                            {ticket.category}
                          </span>
                          <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                            Pass #{ticket.ticketNumber}
                          </span>
                          <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Confirmed
                          </span>
                        </div>
                        <h3 className="font-extrabold text-base text-slate-900 leading-snug">
                          {ticket.attractionName}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-0.5">{ticket.govAuthority}</p>
                      </div>

                      {/* QR Code preview block */}
                      <div className="p-2 bg-white border border-slate-200 rounded-2xl shadow-xs shrink-0 flex flex-col items-center">
                        <QrCode className="w-14 h-14 text-slate-900" />
                        <span className="text-[9px] font-bold text-slate-500 uppercase mt-0.5">
                          Gate Scan
                        </span>
                      </div>
                    </div>

                    {/* Middle details: Date, Slot, Guests */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 py-3 border-b border-slate-100 text-xs">
                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">
                          Visit Date
                        </span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-emerald-600" /> {ticket.visitDate}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">
                          Slot Time
                        </span>
                        <span className="font-extrabold text-slate-800 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" /> {ticket.slotTime}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">
                          Pass Holder
                        </span>
                        <span className="font-bold text-slate-800 truncate block">
                          {ticket.holderName}
                        </span>
                      </div>

                      <div>
                        <span className="block text-[10px] text-slate-400 font-bold uppercase">
                          Guests / Paid
                        </span>
                        <span className="font-extrabold text-emerald-700">
                          {ticket.guestCount.adults + ticket.guestCount.seniors + ticket.guestCount.children} Guests • ₹{ticket.totalAmount}
                        </span>
                      </div>
                    </div>

                    {/* Turnstile Instructions */}
                    <div className="pt-3 flex items-center justify-between gap-3 text-xs">
                      <p className="text-[11px] text-slate-600 font-medium leading-tight">
                        🚪 <span className="font-semibold text-slate-800">Gate Guideline:</span> {ticket.gateInstructions}
                      </p>

                      <button
                        onClick={() => alert(`Showing high-contrast turnstile pass for ${ticket.ticketNumber}. Barcode: ${ticket.barcodeNumber}`)}
                        className="shrink-0 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1"
                      >
                        <QrCode className="w-3.5 h-3.5" /> Full Gate Pass
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            100% Guaranteed Tariff Protection Act • Ministry of Tourism
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl font-bold transition-colors"
          >
            Close Wallet
          </button>
        </div>
      </motion.div>
    </div>
  );
};
