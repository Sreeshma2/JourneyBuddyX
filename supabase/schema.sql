-- ====================================================================
-- Journey Buddy: Supabase Database Schema with PostGIS Integration
-- Production Database Setup & Spatial Extensions
-- ====================================================================

-- 1. Enable PostGIS Extension for Geolocation & Proximity Queries
CREATE EXTENSION IF NOT EXISTS postgis;

-- 2. Tickets Table (Bookings, Passes & QR Turnstile Verification)
CREATE TABLE IF NOT EXISTS tickets (
    id TEXT PRIMARY KEY,
    ticket_number TEXT NOT NULL UNIQUE,
    destination_id TEXT NOT NULL,
    attraction_name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('MONUMENT', 'FERRY', 'HERITAGE_WALK', 'SAFARI', 'BOAT_CRUISE', 'CULTURAL_SHOW')),
    visit_date TEXT NOT NULL,
    slot_time TEXT NOT NULL,
    guest_count JSONB NOT NULL DEFAULT '{"adults": 1, "children": 0, "seniors": 0}'::jsonb,
    tariff_tier TEXT NOT NULL DEFAULT 'INDIAN_NATIONAL' CHECK (tariff_tier IN ('INDIAN_NATIONAL', 'INTERNATIONAL_VISITOR', 'STUDENT')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    currency TEXT NOT NULL DEFAULT 'INR',
    status TEXT NOT NULL DEFAULT 'CONFIRMED' CHECK (status IN ('CONFIRMED', 'USED', 'CANCELLED')),
    qr_code_value TEXT NOT NULL,
    barcode_number TEXT NOT NULL,
    booking_timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    gov_authority TEXT NOT NULL,
    gate_instructions TEXT,
    holder_name TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index tickets destination and holder
CREATE INDEX IF NOT EXISTS idx_tickets_dest ON tickets(destination_id);
CREATE INDEX IF NOT EXISTS idx_tickets_holder ON tickets(holder_name);

-- 3. Hazard Pins Table (PostGIS Enabled for Realtime Spatial Proximity)
CREATE TABLE IF NOT EXISTS hazard_pins (
    id TEXT PRIMARY KEY,
    type TEXT NOT NULL CHECK (type IN ('road_blocked', 'unsafe_area', 'scam', 'weather', 'under_construction')),
    title TEXT NOT NULL,
    description TEXT,
    location_name TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    -- PostGIS geography column (WGS 84 coordinate reference system SRID 4326)
    geom GEOGRAPHY(Point, 4326),
    reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    reported_by TEXT NOT NULL DEFAULT 'Verified Traveler',
    upvotes INTEGER NOT NULL DEFAULT 1,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cleared', 'verified_by_traffic_police')),
    severity TEXT NOT NULL DEFAULT 'medium' CHECK (severity IN ('high', 'medium', 'low')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Spatial GIST index for high-speed PostGIS spatial queries (bounding boxes & radius searches)
CREATE INDEX IF NOT EXISTS idx_hazard_pins_geom ON hazard_pins USING GIST(geom);
CREATE INDEX IF NOT EXISTS idx_hazard_pins_status ON hazard_pins(status);

-- Trigger: Automatically synchronize `geom` Point whenever lat/lng are inserted or updated
CREATE OR REPLACE FUNCTION update_hazard_geom()
RETURNS TRIGGER AS $$
BEGIN
    NEW.geom := ST_SetSRID(ST_MakePoint(NEW.longitude, NEW.latitude), 4326)::geography;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_hazard_geom_sync ON hazard_pins;
CREATE TRIGGER trg_hazard_geom_sync
BEFORE INSERT OR UPDATE OF latitude, longitude ON hazard_pins
FOR EACH ROW EXECUTE FUNCTION update_hazard_geom();

-- 4. PostGIS Spatial RPC: Find hazards within radius (meters) from user location
CREATE OR REPLACE FUNCTION nearby_hazards(
    user_lat DOUBLE PRECISION,
    user_lng DOUBLE PRECISION,
    radius_meters DOUBLE PRECISION DEFAULT 5000
)
RETURNS TABLE (
    id TEXT,
    type TEXT,
    title TEXT,
    description TEXT,
    location_name TEXT,
    latitude DOUBLE PRECISION,
    longitude DOUBLE PRECISION,
    distance_meters DOUBLE PRECISION,
    reported_at TIMESTAMPTZ,
    reported_by TEXT,
    upvotes INTEGER,
    status TEXT,
    severity TEXT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        h.id,
        h.type,
        h.title,
        h.description,
        h.location_name,
        h.latitude,
        h.longitude,
        ST_Distance(h.geom, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography) AS distance_meters,
        h.reported_at,
        h.reported_by,
        h.upvotes,
        h.status,
        h.severity
    FROM hazard_pins h
    WHERE ST_DWithin(h.geom, ST_SetSRID(ST_MakePoint(user_lng, user_lat), 4326)::geography, radius_meters)
    ORDER BY distance_meters ASC;
END;
$$ LANGUAGE plpgsql STABLE;

-- 5. Government Registry Table (Official Tourism & Traffic Authorities)
CREATE TABLE IF NOT EXISTS government_data (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    authority TEXT NOT NULL,
    license_type TEXT NOT NULL,
    jurisdiction TEXT NOT NULL,
    last_sync TEXT NOT NULL,
    verified_tariff_items JSONB NOT NULL DEFAULT '[]'::jsonb,
    traffic_helpline TEXT NOT NULL,
    official_portal_url TEXT NOT NULL,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Row Level Security (RLS) Setup
ALTER TABLE tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE hazard_pins ENABLE ROW LEVEL SECURITY;
ALTER TABLE government_data ENABLE ROW LEVEL SECURITY;

-- Public read access policies for tourist prototype / production
CREATE POLICY "Public read tickets" ON tickets FOR SELECT USING (true);
CREATE POLICY "Public insert tickets" ON tickets FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read hazards" ON hazard_pins FOR SELECT USING (true);
CREATE POLICY "Public insert hazards" ON hazard_pins FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update hazards upvotes" ON hazard_pins FOR UPDATE USING (true);

CREATE POLICY "Public read government_data" ON government_data FOR SELECT USING (true);

-- 7. Seed Initial Data (Mirrors mock JSON for quick testing)
INSERT INTO tickets (id, ticket_number, destination_id, attraction_name, category, visit_date, slot_time, guest_count, tariff_tier, total_amount, currency, status, qr_code_value, barcode_number, gov_authority, gate_instructions, holder_name)
VALUES
('tkt-001', 'TTDC-VK-2026-89412', 'kanyakumari', 'Vivekananda Rock Memorial & Thiruvalluvar Statue Ferry', 'FERRY', 'Today', '02:30 PM – 04:00 PM', '{"adults": 2, "children": 0, "seniors": 0}', 'INDIAN_NATIONAL', 100.00, 'INR', 'CONFIRMED', 'GOV-TN-FERRY-89412-CONFIRMED', '8904120023451', 'Tamil Nadu Tourism Development Corporation (TTDC) & Port Dept', 'Proceed directly to E-Ticket Turnstile Gate 3. Life jackets provided at pontoon.', 'Sreeshma')
ON CONFLICT (id) DO NOTHING;

INSERT INTO hazard_pins (id, type, title, description, location_name, latitude, longitude, reported_by, upvotes, status, severity)
VALUES
('hz-101', 'road_blocked', 'Ferry Ghat Approach Road Blocked', 'Culvert drainage work in progress near Market Street. Walking detour active via Beach Promenade.', 'Kanyakumari • Ferry Road', 8.0792, 77.5512, 'Karthik S. (Tour Guide)', 18, 'verified_by_traffic_police', 'medium'),
('hz-102', 'scam', 'Unauthorized Fast-Track Ferry Ticket Touts', 'Individuals selling unofficial paper tokens at ₹150 outside gate. Official TTDC counter is ₹50 inside.', 'Vivekananda Rock Boat Jetty Entrance', 8.0781, 77.5535, 'Ananya M. (Solo Traveler)', 27, 'active', 'high'),
('hz-103', 'weather', 'High Tide & Slippery Rocks Warning', 'Rough coastal swell and water spray onto lower promenade rocks. Keep behind safety barrier.', 'Sunset Point & Triveni Sangam', 8.0810, 77.5480, 'Marine Safety Post #2', 41, 'active', 'high')
ON CONFLICT (id) DO NOTHING;

INSERT INTO government_data (id, name, authority, license_type, jurisdiction, last_sync, verified_tariff_items, traffic_helpline, official_portal_url)
VALUES
('src-asi', 'Archaeological Survey of India (ASI)', 'Ministry of Culture, Government of India', 'Official Government Gazette / Open Access Tourism Registry', 'National Heritage Monuments & UNESCO Sites', 'Live Verified 2026', '[{"name": "Standard Ticketed Monument Circle", "officialFee": "₹25 – ₹50 (Domestic) / ₹300 (Foreign)", "gazetteRef": "ASI-T-2024/918"}, {"name": "Composite Heritage Pass", "officialFee": "₹100 (Domestic) / ₹550 (Foreign)", "gazetteRef": "ASI-COMP-882"}]', '1800-11-1363 (National Tourist Helpline 24x7 in 12 languages)', 'https://asi.nic.in'),
('src-ttdc', 'Tamil Nadu Tourism Development Corp (TTDC)', 'Tourism, Culture and Religious Endowments Dept, Govt of Tamil Nadu', 'State Maritime & Hospitality License #TN-TTDC-089', 'Tamil Nadu Coastal & Pilgrim Destinations', 'Synced Today', '[{"name": "Kanyakumari Vivekananda Ferry Roundtrip", "officialFee": "₹50 (General) / ₹200 (Special entry)", "gazetteRef": "TNB-MARITIME-2025"}, {"name": "Government Hotel & Sightseeing Coach", "officialFee": "Pre-fixed standard government tariff", "gazetteRef": "TTDC-COACH-77"}]', '04652-246276 (Kanyakumari Tourist Office)', 'https://tamilnadutourism.tn.gov.in')
ON CONFLICT (id) DO NOTHING;
