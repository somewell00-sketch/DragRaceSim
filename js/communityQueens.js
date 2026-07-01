const SUPABASE_URL = 'https://ieicxwwapcmkaffuplfa.supabase.co';
const SUPABASE_KEY = 'sb_publishable_ZWRCRg4bhvPrkld0pkTcyg__dWY0VVb';

const communityDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

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
    country:
  queen.country ||
  Intl.DateTimeFormat().resolvedOptions().timeZone ||
  '',

game_version:
  window.GAME_VERSION ||
  'dragracesim-v1'
  };
}

async function saveCommunityQueen(queen) {
  if (!communityDb || !queen?.name) return null;

  const { data, error } = await communityDb
    .from('community_queens')
    .insert(communityQueenPayload(queen))
    .select();

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
    location: row?.country ? `${row.country}` : 'Community Queen',
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
