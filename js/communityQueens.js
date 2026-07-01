const SUPABASE_URL = 'https://ieicxwwapcmkaffuplfa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZWRCRg4bhvPrkld0pkTcyg__dWY0VVb';

const communityDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const COUNTRY_CODE_ALIASES = {
  USA: 'US',
  PRT: 'PT',
  POR: 'PT',
  UK: 'GB',
  BRA: 'BR',
  BRASIL: 'BR',
  BRAZIL: 'BR',
  PORTUGAL: 'PT',
  UNITED_STATES: 'US',
  UNITED_STATES_OF_AMERICA: 'US'
};

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
    .replace(/[().]/g, '')
    .replace(/\s+/g, '_')
    .toUpperCase();

  if (!cleaned) return '';
  if (COUNTRY_CODE_ALIASES[cleaned]) return COUNTRY_CODE_ALIASES[cleaned];
  if (/^[A-Z]{2}$/.test(cleaned)) return cleaned;
  if (/^[A-Z]{3}$/.test(cleaned)) return COUNTRY_CODE_ALIASES[cleaned] || cleaned.slice(0, 2);
  return '';
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
