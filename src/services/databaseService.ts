import { getSupabaseClient, isSupabaseConfigured } from './supabaseClient';
import { TicketBooking, HazardPin, GovtDataSource } from '../types';

// Load mock JSON datasets for prototype demo mode
import mockTicketsData from '../data/mock/tickets.json';
import mockHazardPinsData from '../data/mock/hazard_pins.json';
import mockGovtData from '../data/mock/government_data.json';

// In-memory working copies for live prototype demo interactions
let localTickets: TicketBooking[] = [...(mockTicketsData as any)];
let localHazardPins: HazardPin[] = [...(mockHazardPinsData as any)];
let localGovtData: GovtDataSource[] = [...(mockGovtData as any)];

/**
 * Haversine formula to calculate distance between two coordinates in meters
 * (Mirrors PostGIS ST_Distance calculation for prototype demo fallback)
 */
function calculateHaversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

// ==========================================
// 1. TICKETS REPOSITORY
// ==========================================

export async function fetchTickets(): Promise<{ data: TicketBooking[]; source: 'supabase' | 'local_json' }> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('tickets').select('*').order('created_at', { ascending: false });
      if (!error && data && data.length > 0) {
        // Map database snake_case to frontend camelCase
        const mappedTickets: TicketBooking[] = data.map((item: any) => ({
          id: item.id,
          ticketNumber: item.ticket_number || item.ticketNumber,
          destinationId: item.destination_id || item.destinationId,
          attractionName: item.attraction_name || item.attractionName,
          category: item.category,
          visitDate: item.visit_date || item.visitDate,
          slotTime: item.slot_time || item.slotTime,
          guestCount: item.guest_count || item.guestCount,
          tariffTier: item.tariff_tier || item.tariffTier,
          totalAmount: Number(item.total_amount || item.totalAmount),
          currency: item.currency || 'INR',
          status: item.status || 'CONFIRMED',
          qrCodeValue: item.qr_code_value || item.qrCodeValue,
          barcodeNumber: item.barcode_number || item.barcodeNumber,
          bookingTimestamp: item.booking_timestamp || item.bookingTimestamp,
          govAuthority: item.gov_authority || item.govAuthority,
          gateInstructions: item.gate_instructions || item.gateInstructions,
          holderName: item.holder_name || item.holderName,
        }));
        return { data: mappedTickets, source: 'supabase' };
      }
    } catch (e) {
      console.warn('Supabase fetchTickets error, falling back to local JSON data:', e);
    }
  }

  return { data: [...localTickets], source: 'local_json' };
}

export async function saveTicket(
  ticket: TicketBooking
): Promise<{ success: boolean; ticket: TicketBooking; source: 'supabase' | 'local_json' }> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbPayload = {
        id: ticket.id,
        ticket_number: ticket.ticketNumber,
        destination_id: ticket.destinationId,
        attraction_name: ticket.attractionName,
        category: ticket.category,
        visit_date: ticket.visitDate,
        slot_time: ticket.slotTime,
        guest_count: ticket.guestCount,
        tariff_tier: ticket.tariffTier,
        total_amount: ticket.totalAmount,
        currency: ticket.currency,
        status: ticket.status,
        qr_code_value: ticket.qrCodeValue,
        barcode_number: ticket.barcodeNumber,
        booking_timestamp: new Date().toISOString(),
        gov_authority: ticket.govAuthority,
        gate_instructions: ticket.gateInstructions,
        holder_name: ticket.holderName,
      };

      const { error } = await supabase.from('tickets').insert([dbPayload]);
      if (!error) {
        localTickets = [ticket, ...localTickets];
        return { success: true, ticket, source: 'supabase' };
      }
      console.warn('Supabase saveTicket error:', error);
    } catch (e) {
      console.warn('Supabase saveTicket exception, falling back to local JSON state:', e);
    }
  }

  // Local Prototype Demo Fallback
  localTickets = [ticket, ...localTickets];
  return { success: true, ticket, source: 'local_json' };
}

// ==========================================
// 2. HAZARD PINS REPOSITORY (PostGIS & Local)
// ==========================================

export async function fetchHazardPins(): Promise<{
  data: HazardPin[];
  source: 'supabase_postgis' | 'local_json';
}> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase
        .from('hazard_pins')
        .select('*')
        .order('created_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const mappedHazards: HazardPin[] = data.map((item: any) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          locationName: item.location_name || item.locationName,
          coordinates: {
            lat: Number(item.latitude ?? item.coordinates?.lat),
            lng: Number(item.longitude ?? item.coordinates?.lng),
          },
          reportedAt: item.reported_at || item.reportedAt,
          reportedBy: item.reported_by || item.reportedBy,
          upvotes: item.upvotes,
          status: item.status,
          severity: item.severity,
        }));
        return { data: mappedHazards, source: 'supabase_postgis' };
      }
    } catch (e) {
      console.warn('Supabase fetchHazardPins error, falling back to local JSON:', e);
    }
  }

  return { data: [...localHazardPins], source: 'local_json' };
}

/**
 * PostGIS Spatial Query: Returns hazard pins within radius_meters of user location.
 * In Supabase production: calls PostGIS RPC 'nearby_hazards'.
 * In Prototype demo: uses local Haversine distance algorithm.
 */
export async function fetchNearbyHazards(
  userLat: number,
  userLng: number,
  radiusMeters: number = 5000
): Promise<{
  data: (HazardPin & { distanceMeters?: number })[];
  source: 'supabase_postgis' | 'local_json';
}> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.rpc('nearby_hazards', {
        user_lat: userLat,
        user_lng: userLng,
        radius_meters: radiusMeters,
      });

      if (!error && data) {
        const mapped = data.map((item: any) => ({
          id: item.id,
          type: item.type,
          title: item.title,
          description: item.description,
          locationName: item.location_name,
          coordinates: {
            lat: Number(item.latitude),
            lng: Number(item.longitude),
          },
          reportedAt: item.reported_at,
          reportedBy: item.reported_by,
          upvotes: item.upvotes,
          status: item.status,
          severity: item.severity,
          distanceMeters: Math.round(item.distance_meters),
        }));
        return { data: mapped, source: 'supabase_postgis' };
      }
    } catch (e) {
      console.warn('PostGIS nearby_hazards error, falling back to local Haversine:', e);
    }
  }

  // Local Prototype Demo Haversine distance calculation
  const nearby = localHazardPins
    .map((h) => {
      const dist = calculateHaversineDistanceMeters(
        userLat,
        userLng,
        h.coordinates.lat,
        h.coordinates.lng
      );
      return { ...h, distanceMeters: Math.round(dist) };
    })
    .filter((h) => h.distanceMeters <= radiusMeters)
    .sort((a, b) => a.distanceMeters - b.distanceMeters);

  return { data: nearby, source: 'local_json' };
}

export async function saveHazardPin(
  hazard: HazardPin
): Promise<{ success: boolean; hazard: HazardPin; source: 'supabase_postgis' | 'local_json' }> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const dbPayload = {
        id: hazard.id,
        type: hazard.type,
        title: hazard.title,
        description: hazard.description,
        location_name: hazard.locationName,
        latitude: hazard.coordinates.lat,
        longitude: hazard.coordinates.lng,
        reported_by: hazard.reportedBy,
        upvotes: hazard.upvotes || 1,
        status: hazard.status || 'active',
        severity: hazard.severity || 'medium',
      };

      const { error } = await supabase.from('hazard_pins').insert([dbPayload]);
      if (!error) {
        localHazardPins = [hazard, ...localHazardPins];
        return { success: true, hazard, source: 'supabase_postgis' };
      }
      console.warn('Supabase saveHazardPin error:', error);
    } catch (e) {
      console.warn('Supabase saveHazardPin exception, using local state:', e);
    }
  }

  localHazardPins = [hazard, ...localHazardPins];
  return { success: true, hazard, source: 'local_json' };
}

export async function upvoteHazardPin(
  id: string
): Promise<{ success: boolean; upvotes: number; source: 'supabase_postgis' | 'local_json' }> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data: current } = await supabase.from('hazard_pins').select('upvotes').eq('id', id).single();
      const newUpvotes = (current?.upvotes || 0) + 1;
      const { error } = await supabase.from('hazard_pins').update({ upvotes: newUpvotes }).eq('id', id);
      if (!error) {
        return { success: true, upvotes: newUpvotes, source: 'supabase_postgis' };
      }
    } catch (e) {
      console.warn('Supabase upvoteHazardPin exception, updating local state:', e);
    }
  }

  const pin = localHazardPins.find((h) => h.id === id);
  if (pin) {
    pin.upvotes = (pin.upvotes || 0) + 1;
    return { success: true, upvotes: pin.upvotes, source: 'local_json' };
  }

  return { success: false, upvotes: 0, source: 'local_json' };
}

// ==========================================
// 3. GOVERNMENT DATA REGISTRY REPOSITORY
// ==========================================

export async function fetchGovernmentData(): Promise<{
  data: GovtDataSource[];
  source: 'supabase' | 'local_json';
}> {
  const supabase = getSupabaseClient();
  if (isSupabaseConfigured() && supabase) {
    try {
      const { data, error } = await supabase.from('government_data').select('*');
      if (!error && data && data.length > 0) {
        const mappedGov: GovtDataSource[] = data.map((item: any) => ({
          id: item.id,
          name: item.name,
          authority: item.authority,
          licenseType: item.license_type || item.licenseType,
          jurisdiction: item.jurisdiction,
          lastSync: item.last_sync || item.lastSync,
          verifiedTariffItems: item.verified_tariff_items || item.verifiedTariffItems || [],
          trafficHelpline: item.traffic_helpline || item.trafficHelpline,
          officialPortalUrl: item.official_portal_url || item.officialPortalUrl,
        }));
        return { data: mappedGov, source: 'supabase' };
      }
    } catch (e) {
      console.warn('Supabase fetchGovernmentData error, falling back to local JSON:', e);
    }
  }

  return { data: [...localGovtData], source: 'local_json' };
}

/**
 * Diagnostic helper providing current database connection status
 * Indicates whether connected to live Supabase PostGIS or local mock JSON dataset.
 */
export function getDatabaseStatus(): {
  isConfigured: boolean;
  provider: 'supabase_postgis' | 'local_json';
  tables: {
    tickets: number;
    hazardPins: number;
    governmentData: number;
  };
} {
  return {
    isConfigured: isSupabaseConfigured(),
    provider: isSupabaseConfigured() ? 'supabase_postgis' : 'local_json',
    tables: {
      tickets: localTickets.length,
      hazardPins: localHazardPins.length,
      governmentData: localGovtData.length,
    },
  };
}

