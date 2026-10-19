const SUPABASE_URL = 'https://ieicxwwapcmkaffuplfa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZWRCRg4bhvPrkld0pkTcyg__dWY0VVb';

// Fix: if the Supabase CDN is blocked/offline, window.supabase is undefined and the old
// line threw, killing every function in this file. The game must still work offline.
let communityDb = null;
try {
  if (window.supabase && typeof window.supabase.createClient === 'function') {
    communityDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  } else {
    console.warn('Supabase is not available; community queens are disabled for this session.');
  }
} catch (err) {
  console.warn('Could not create the Supabase client; community queens are disabled:', err);
  communityDb = null;
}

// ---------------------------------------------------------------------------
// Community data validation
// Rows in the public table can be written by anyone holding the publishable key,
// so nothing coming from (or going to) the database is trusted.
// ---------------------------------------------------------------------------
const COMMUNITY_ATTR_KEYS = ['cunt', 'lip_sync', 'makeup', 'sewing', 'runway', 'acting'];
const COMMUNITY_ATTR_MIN = 1;
const COMMUNITY_ATTR_MAX = 10;
const COMMUNITY_ATTR_TOTAL_MAX = 45;
const COMMUNITY_NAME_MAX = 40;
const COMMUNITY_LOCATION_MAX = 60;

function cleanCommunityText(value, maxLength) {
  return String(value ?? '')
    .normalize('NFC')
    .replace(/[\u0000-\u001F\u007F-\u009F\u200B-\u200F\u202A-\u202E\u2066-\u2069]/g, '')
    .replace(/[<>]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength)
    .trim();
}

function clampCommunityAttr(value) {
  const n = Math.round(Number(value));
  if (!Number.isFinite(n)) return 7;
  return Math.max(COMMUNITY_ATTR_MIN, Math.min(COMMUNITY_ATTR_MAX, n));
}

// Clamps every stat to 1–10 and scales the build down to the same 45-point cap the
// queen creator enforces, so database rows can never be stronger than a legal queen.
function sanitizeCommunityAttributes(raw) {
  const attrs = {};
  COMMUNITY_ATTR_KEYS.forEach(key => { attrs[key] = clampCommunityAttr(raw?.[key]); });
  let total = COMMUNITY_ATTR_KEYS.reduce((sum, key) => sum + attrs[key], 0);
  if (total > COMMUNITY_ATTR_TOTAL_MAX) {
    const ratio = COMMUNITY_ATTR_TOTAL_MAX / total;
    COMMUNITY_ATTR_KEYS.forEach(key => { attrs[key] = Math.max(COMMUNITY_ATTR_MIN, Math.floor(attrs[key] * ratio)); });
    total = COMMUNITY_ATTR_KEYS.reduce((sum, key) => sum + attrs[key], 0);
    // Floor rounding can leave a few points unused; give them back to the highest stats.
    const order = [...COMMUNITY_ATTR_KEYS].sort((a, b) => (raw?.[b] || 0) - (raw?.[a] || 0));
    let i = 0;
    while (total < COMMUNITY_ATTR_TOTAL_MAX && i < order.length * 10) {
      const key = order[i % order.length];
      if (attrs[key] < COMMUNITY_ATTR_MAX) { attrs[key] += 1; total += 1; }
      i += 1;
    }
  }
  return attrs;
}

function knownQueenTypeName(value) {
  const types = window.GAME_DATA?.queenTypes || [];
  const match = types.find(t => t.name === value);
  return match ? match.name : 'Jack of All Trades';
}

function knownPersonalityId(value) {
  const list = window.GAME_DATA?.personalities || [];
  const id = String(value || '').toLowerCase();
  const legacy = { timid: 'shy', sweetheart: 'sweet', shady: 'sarcastic' };
  const resolved = legacy[id] || id;
  return list.some(p => p.id === resolved) ? resolved : 'confident';
}

// Returns a cleaned copy of a database row, or null when the row is unusable.
function sanitizeCommunityRow(row) {
  if (!row || typeof row !== 'object') return null;
  const name = cleanCommunityText(row.name, COMMUNITY_NAME_MAX);
  if (!name) return null;
  const attrs = sanitizeCommunityAttributes({
    cunt: row.cunt,
    lip_sync: row.lip_sync ?? row.lipSync,
    makeup: row.makeup,
    sewing: row.sewing,
    runway: row.runway ?? row.design,
    acting: row.acting
  });
  return {
    id: row.id,
    created_at: row.created_at,
    name,
    drag_type: knownQueenTypeName(row.drag_type || row.type),
    personality: knownPersonalityId(row.personality || row.personalityId),
    ...attrs,
    location: cleanCommunityText(row.location || row.country || '', COMMUNITY_LOCATION_MAX),
    winner: isTrueLike(row.winner),
    game_version: cleanCommunityText(row.game_version || '', 40)
  };
}

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

// Privacy fix: the game used to call navigator.geolocation as soon as the creator opened
// and reverse-geocode the GPS position through OpenStreetMap, then publish the city.
// Location is now only a coarse, editable guess from the browser time zone. It never
// leaves the device unless the player explicitly opts in to sharing their queen.
function detectUserCommunityLocation(){
  return Promise.resolve(locationFromTimezone());
}

const COMMUNITY_SHARE_PREF_KEY = 'dragRaceShareQueenOptIn';
function getCommunitySharePreference(){
  try { return localStorage.getItem(COMMUNITY_SHARE_PREF_KEY) === 'true'; } catch (err) { return false; }
}
function setCommunitySharePreference(value){
  try { localStorage.setItem(COMMUNITY_SHARE_PREF_KEY, value ? 'true' : 'false'); } catch (err) {}
}

function communityQueenPayload(queen) {
  const attrs = queen.attributes || {};
  const clean = sanitizeCommunityAttributes({
    cunt: attrs.cunt ?? queen.cunt,
    lip_sync: attrs.lipSync ?? queen.lipSync ?? queen.lip_sync,
    makeup: attrs.makeup ?? queen.makeup,
    sewing: attrs.sewing ?? queen.sewing,
    runway: attrs.runway ?? queen.runway ?? queen.design,
    acting: attrs.acting ?? queen.acting
  });

  return {
    name: cleanCommunityText(queen.name, COMMUNITY_NAME_MAX),
    drag_type: knownQueenTypeName(queen.type || queen.dragType),
    personality: knownPersonalityId(queen.personalityId || queen.personality),
    ...clean,
    location: cleanCommunityText(normalizeCommunityLocation(queen.location || queen.country || ''), COMMUNITY_LOCATION_MAX),
    game_version: window.GAME_VERSION || 'dragracesim-v1',
    winner: !!queen.winner
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
  if (!communityDb) {
    console.error('Could not save community queen: Supabase client is not available.');
    return null;
  }

  if (!queen?.name) {
    console.error('Could not save community queen: queen name is missing.', queen);
    return null;
  }

  // Only queens whose creator opted in are ever published.
  if (queen.communityShareOptIn !== true) {
    console.info('[COMMUNITY QUEEN SAVE] Skipped: the player did not opt in to sharing.');
    return null;
  }
  if (!cleanCommunityText(queen.name, COMMUNITY_NAME_MAX)) return null;

  let { data, error } = await insertCommunityQueenPayload(communityQueenPayload(queen));

  if (error && isMissingSchemaColumnError(error)) {
    console.warn('Community queen schema is missing optional columns; retrying with legacy payload:', error);
    ({ data, error } = await insertCommunityQueenPayload(legacyCommunityQueenPayload(queen)));
  }

  if (error) {
    console.error('Could not save community queen:', error);
    return null;
  }

  const savedQueen = data?.[0] || null;
  console.info('[COMMUNITY QUEEN SAVE]', savedQueen ? 'Saved' : 'Not saved', savedQueen);
  return savedQueen;
}

function isTrueLike(value) {
  return value === true || value === 1 || value === '1' || String(value || '').toLowerCase() === 'true';
}

function isMissingOrderColumnError(error) {
  return /created_at|order|column/i.test(error?.message || '') || /created_at|order|column/i.test(error?.details || '');
}

async function runQueenTableQuery(tableName, limit = 100, queryBuilder = null, useCreatedAtOrder = true) {
  let query = communityDb
    .from(tableName)
    .select('*');

  if (useCreatedAtOrder) {
    query = query.order('created_at', { ascending: false });
  }

  query = query.limit(limit);

  if (typeof queryBuilder === 'function') {
    query = queryBuilder(query);
  }

  return query;
}

async function loadQueensFromTable(tableName, limit = 100, queryBuilder = null) {
  if (!communityDb) return [];

  let { data, error } = await runQueenTableQuery(tableName, limit, queryBuilder, true);

  // New/custom tables may not have created_at. Retry without ordering instead of
  // silently falling back to generated queens.
  if (error && isMissingOrderColumnError(error)) {
    console.warn(`${tableName} could not be ordered by created_at; retrying without order:`, error);
    ({ data, error } = await runQueenTableQuery(tableName, limit, queryBuilder, false));
  }

  if (error) {
    console.warn(`Could not load queens from ${tableName}:`, error);
    return [];
  }

  const cleanRows = (data || []).map(sanitizeCommunityRow).filter(Boolean);
  console.info(`[CAST DB] Loaded ${cleanRows.length}/${data?.length || 0} valid rows from ${tableName}.`);
  return cleanRows;
}

async function loadCommunityQueens(limit = 100) {
  return loadQueensFromTable('community_queens', limit);
}

async function loadWinnerQueens(limit = 100) {
  return loadQueensFromTable('winner_queens', limit);
}

async function loadCommunityWinnerQueens(limit = 100) {
  const remoteFilteredRows = await loadQueensFromTable('community_queens', limit, query => query.eq('winner', true));

  if (remoteFilteredRows.length) {
    return remoteFilteredRows.filter(row => isTrueLike(row?.winner));
  }

  // If the filter returns nothing because the column is missing from the API
  // schema cache or values are stored differently, fetch locally and filter.
  const allRows = await loadCommunityQueens(limit);
  return allRows.filter(row => isTrueLike(row?.winner));
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

function convertCommunityQueenToGameQueen(rawRow, index = 0, sourcePrefix = 'community') {
  const row = sanitizeCommunityRow(rawRow) || {};
  const safeName = String(row?.name || `Community Queen ${index + 1}`).trim() || `Community Queen ${index + 1}`;
  const safeType = row?.drag_type || row?.type || 'Jack of All Trades';
  const safePersonality = row?.personality || row?.personalityId || 'confident';

  return hydrateQueen({
    id: slugifyQueenName(safeName, `${sourcePrefix}_${row?.id || index}`),
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
window.loadWinnerQueens = loadWinnerQueens;
window.loadCommunityWinnerQueens = loadCommunityWinnerQueens;
window.convertCommunityQueenToGameQueen = convertCommunityQueenToGameQueen;
window.loadEligibleCommunityQueens = loadEligibleCommunityQueens;
window.normalizeCommunityLocation = normalizeCommunityLocation;
window.sanitizeCommunityRow = sanitizeCommunityRow;
window.sanitizeCommunityAttributes = sanitizeCommunityAttributes;
window.getCommunitySharePreference = getCommunitySharePreference;
window.setCommunitySharePreference = setCommunitySharePreference;
