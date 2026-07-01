const SUPABASE_URL = 'https://ieicxwwapcmkaffuplfa.supabase.co/rest/v1/';
const SUPABASE_KEY = 'sb_publishable_ZWRCRg4bhvPrkld0pkTcyg__dWY0VVb';

const communityDb = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

async function saveCommunityQueen(queen) {
  const payload = {
    name: queen.name,
    drag_type: queen.type || queen.dragType || '',
    personality: queen.personality || '',
    lip_sync: queen.lipSync || queen.lip_sync || 0,
    makeup: queen.makeup || 0,
    sewing: queen.sewing || 0,
    comedy: queen.comedy || 0,
    acting: queen.acting || 0,
    dancing: queen.dancing || 0,
    design: queen.design || 0,
    country: queen.country || '',
    game_version: window.GAME_VERSION || ''
  };

  const { data, error } = await communityDb
    .from('community_queens')
    .insert(payload)
    .select();

  if (error) {
    console.warn('Could not save community queen:', error);
    return null;
  }

  return data?.[0] || null;
}

async function loadCommunityQueens(limit = 100) {
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

window.saveCommunityQueen = saveCommunityQueen;
window.loadCommunityQueens = loadCommunityQueens;
