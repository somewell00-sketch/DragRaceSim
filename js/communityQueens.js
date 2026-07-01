const SUPABASE_URL = 'https://ieicxwwapcmkaffuplfa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZWRCRg4bhvPrkld0pkTcyg__dWY0VVb';

const communityDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const COUNTRY_CODE_ALIASES = {
  US: 'USA', USA: 'USA', UNITED_STATES: 'USA', UNITED_STATES_OF_AMERICA: 'USA', AMERICA: 'USA',
  PT: 'PRT', PRT: 'PRT', POR: 'PRT', PORTUGAL: 'PRT',
  BR: 'BRA', BRA: 'BRA', BRASIL: 'BRA', BRAZIL: 'BRA',
  GB: 'GBR', UK: 'GBR', GBR: 'GBR', UNITED_KINGDOM: 'GBR',
  CA: 'CAN', CAN: 'CAN', CANADA: 'CAN',
  MX: 'MEX', MEX: 'MEX', MEXICO: 'MEX',
  ES: 'ESP', ESP: 'ESP', SPAIN: 'ESP', ESPANA: 'ESP', ESPAÑA: 'ESP',
  FR: 'FRA', FRA: 'FRA', FRANCE: 'FRA',
  DE: 'DEU', DEU: 'DEU', GER: 'DEU', GERMANY: 'DEU', ALEMANHA: 'DEU',
  IT: 'ITA', ITA: 'ITA', ITALY: 'ITA', ITALIA: 'ITA',
  JP: 'JPN', JPN: 'JPN', JAPAN: 'JPN', JAPAO: 'JPN', JAPÃO: 'JPN',
  AR: 'ARG', ARG: 'ARG', ARGENTINA: 'ARG',
  CL: 'CHL', CHL: 'CHL', CHILE: 'CHL',
  CO: 'COL', COL: 'COL', COLOMBIA: 'COL',
  PE: 'PER', PER: 'PER', PERU: 'PER',
  IE: 'IRL', IRL: 'IRL', IRELAND: 'IRL',
  NL: 'NLD', NLD: 'NLD', NETHERLANDS: 'NLD', HOLLAND: 'NLD',
  BE: 'BEL', BEL: 'BEL', BELGIUM: 'BEL',
  AU: 'AUS', AUS: 'AUS', AUSTRALIA: 'AUS'
};

const TIMEZONE_LOCATION_FALLBACKS = {
  'Europe/Lisbon': 'Lisbon, PRT',
  'Atlantic/Azores': 'Ponta Delgada, PRT',
  'America/Sao_Paulo': 'São Paulo, BRA',
  'America/Fortaleza': 'Fortaleza, BRA',
  'America/New_York': 'New York City, USA',
  'America/Chicago': 'Chicago, USA',
  'America/Denver': 'Denver, USA',
  'America/Los_Angeles': 'Los Angeles, USA',
  'Pacific/Honolulu': 'Honolulu, USA',
  'Europe/London': 'London, GBR',
  'Europe/Madrid': 'Madrid, ESP',
  'Europe/Paris': 'Paris, FRA',
  'Europe/Berlin': 'Berlin, DEU',
  'Europe/Rome': 'Rome, ITA',
  'Asia/Tokyo': 'Tokyo, JPN'
};

let cachedUserCommunityLocation = null;
let userCommunityLocationPromise = null;

function normalizeCommunityLocation(rawLocation) {
  const raw = String(rawLocation || '').trim();
  if (!raw) return '';

  const parenthesizedCountry = raw.match(/^(.*?),\s*([A-Z]{2})\s*\(([^)]+)\)$/i);
  if (parenthesizedCountry) {
    const city = parenthesizedCountry[1].trim();
    const country = normalizeCountryCode(parenthesizedCountry[3]);
    return country ? `${city}, ${country}` : city;
  }

  const cityAndCountry = raw.match(/^(.*?),\s*([^,]+)$/);
  if (cityAndCountry) {
    const city = cityAndCountry[1].trim();
    const country = normalizeCountryCode(cityAndCountry[2]);
    return country ? `${city}, ${country}` : raw;
  }

  return raw;
}

function normalizeCountryCode(value) {
  const cleaned = String(value || '')
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[().]/g, '')
    .replace(/[^A-Z0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '')
    .toUpperCase();

  if (!cleaned) return '';
  if (COUNTRY_CODE_ALIASES[cleaned]) return COUNTRY_CODE_ALIASES[cleaned];
  if (/^[A-Z]{3}$/.test(cleaned)) return cleaned;
  if (/^[A-Z]{2}$/.test(cleaned)) return cleaned;
  return '';
}

/* deprecated fallback kept for future use */
function locationFromTimezone(){
  const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return normalizeCommunityLocation(TIMEZONE_LOCATION_FALLBACKS[timezone] || 'Unknown City, XXX');
}

function getBrowserCoordinates(){
  if (!navigator.geolocation) return Promise.resolve(null);
  return new Promise(resolve => {
    let settled = false;
    const done = value => { if (!settled) { settled = true; resolve(value); } };
    navigator.geolocation.getCurrentPosition(
      pos => done({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      () => done(null),
      { enableHighAccuracy: false, timeout: 3500, maximumAge: 86400000 }
    );
    setTimeout(() => done(null), 4200);
  });
}

function cityFromAddress(address){
  return address?.city || address?.town || address?.village || address?.municipality || address?.county || address?.state_district || address?.state || '';
}

async function reverseGeocodeCoordinates(coords){
  if (!coords) return '';
  try{
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${encodeURIComponent(coords.latitude)}&lon=${encodeURIComponent(coords.longitude)}&zoom=10&addressdetails=1`;
    const response = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!response.ok) return '';
    const data = await response.json();
    const city = cityFromAddress(data?.address);
    const country = normalizeCountryCode(data?.address?.country_code || data?.address?.country);
    return city && country ? normalizeCommunityLocation(`${city}, ${country}`) : '';
  }catch(err){
    console.warn('Could not reverse geocode user location:', err);
    return '';
  }
}

async function detectUserCommunityLocation(){
  if (cachedUserCommunityLocation) return cachedUserCommunityLocation;
  if (userCommunityLocationPromise) return userCommunityLocationPromise;

  userCommunityLocationPromise = (async()=>{
    const preciseLocation = await reverseGeocodeCoordinates(await getBrowserCoordinates());
    cachedUserCommunityLocation = preciseLocation || "A Fan's Fantasy";
    return cachedUserCommunityLocation;
  })();

  return userCommunityLocationPromise;
}

function communityQueenPayload(queen) {
  const attrs = queen.attributes || {};

  return {
    name: queen.name || '',
    drag_type: queen.type || queen.dragType || '',
    personality: queen.personalityId || queen.personality || '',
    cunt: Number(attrs.cunt ?? queen.cunt ?? 0) || 0,
    lip_sync: Number(attrs.lipSync ?? queen.lipSync ?? queen.lip_sync ?? 0) || 0,
    makeup: Number(attrs.makeup ?? queen.makeup ?? 0) || 0,
    sewing: Number(attrs.sewing ?? queen.sewing ?? 0) || 0,
    runway: Number(attrs.runway ?? queen.runway ?? queen.design ?? 0) || 0,
    acting: Number(attrs.acting ?? queen.acting ?? 0) || 0,
    location: normalizeCommunityLocation(queen.location || queen.country || ''),
    game_version: window.GAME_VERSION || 'dragracesim-v1'
  };
}

function legacyCommunityQueenPayload(queen) {
  const payload = communityQueenPayload(queen);
  delete payload.game_version;
  return payload;
}

async function insertCommunityQueenPayload(payload) {
  return communityDb
    .from('community_queens')
    .insert(payload)
    .select();
}

function isMissingSchemaColumnError(error) {
  return error?.code === 'PGRST204' || /schema cache|column/i.test(error?.message || '');
}

async function saveCommunityQueen(queen) {
  if (!communityDb || !queen?.name) return null;

  let { data, error } = await insertCommunityQueenPayload(communityQueenPayload(queen));

  if (error && isMissingSchemaColumnError(error)) {
    console.warn('Community queen schema is missing optional columns; retrying with legacy payload:', error);
    ({ data, error } = await insertCommunityQueenPayload(legacyCommunityQueenPayload(queen)));
  }

  if (error) {
    console.warn('Could not save community queen:', error);
    return null;
  }

  return data?.[0] || null;
}

async function loadCommunityQueens(limit = 100) {
  if (!communityDb) return [];

  const { data, error } = await communityDb
    .from('community_queens')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.warn('Could not load community queens:', error);
    return [];
  }

  return data || [];
}


function communityQueenCreatedWithinDays(row, days) {
  if (!days) return true;
  const createdAt = row?.created_at ? new Date(row.created_at).getTime() : 0;
  if (!createdAt) return false;
  const maxAgeMs = Number(days) * 24 * 60 * 60 * 1000;
  return Date.now() - createdAt <= maxAgeMs;
}

function communityQueenMatchesLocation(row, location) {
  if (!location) return true;
  const queenLocation = normalizeCommunityLocation(row?.location || row?.country || '');
  return queenLocation && queenLocation === normalizeCommunityLocation(location);
}

async function loadEligibleCommunityQueens(options = {}) {
  const { limit = 100, days = null, location = null } = options || {};
  const rows = await loadCommunityQueens(limit);
  return rows.filter(row => (
    communityQueenCreatedWithinDays(row, days) &&
    communityQueenMatchesLocation(row, location)
  ));
}

function convertCommunityQueenToGameQueen(row, index = 0) {
  const safeName = String(row?.name || `Community Queen ${index + 1}`).trim() || `Community Queen ${index + 1}`;
  const safeType = row?.drag_type || row?.type || 'Jack of All Trades';
  const safePersonality = row?.personality || row?.personalityId || 'confident';

  return hydrateQueen({
    id: slugifyQueenName(safeName, `community_${row?.id || index}`),
    name: safeName,
    type: safeType,
    personalityId: safePersonality,
    location: row?.location || row?.country || 'Community Queen',
    ambition: randomAmbition(),
    attributes: {
      cunt: Number(row?.cunt) || 7,
      lipSync: Number(row?.lip_sync) || 7,
      makeup: Number(row?.makeup) || 7,
      sewing: Number(row?.sewing) || 7,
      runway: Number(row?.runway ?? row?.design) || 7,
      acting: Number(row?.acting) || 7
    }
  });
}

window.saveCommunityQueen = saveCommunityQueen;
window.loadCommunityQueens = loadCommunityQueens;
window.convertCommunityQueenToGameQueen = convertCommunityQueenToGameQueen;
window.loadEligibleCommunityQueens = loadEligibleCommunityQueens;
window.normalizeCommunityLocation = normalizeCommunityLocation;
