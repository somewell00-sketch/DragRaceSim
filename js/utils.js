function clamp(value,min,max){return Math.max(min,Math.min(max,value));}
function sample(arr){return arr[Math.floor(Math.random()*arr.length)];}
function shuffle(arr){return [...arr].sort(()=>Math.random()-.5);}
function rand(min,max){return Math.round((Math.random()*(max-min)+min)*10)/10;}
function effectiveAttrValue(v){
  v = Number(v) || 0;

  switch(v){
    case 1: return 1.0;
    case 2: return 2.0;
    case 3: return 3.0;
    case 4: return 4.0;
    case 5: return 5.0;
    case 6: return 5.9;
    case 7: return 6.7;
    case 8: return 7.4;
    case 9: return 8.0;
    case 10:return 8.5;
    default:return v;
  }
}

function weightedAttributeScore(attributes, weights) {
  return Object.entries(weights).reduce((t, [a, w]) => {
    const globalAttrMultiplier = {
      cunt: 1,
      runway: 1
    };

    const mult = globalAttrMultiplier[a] ?? 1;
    return t + effectiveAttrValue(attributes[a] || 0) * 10 * w * mult;
  }, 0);
}
function riskRoll(risk){if(risk==='safe')return rand(-4,4); if(risk==='unexpected')return Math.random()>.5?rand(7,14):rand(-14,-7); return rand(-10,10);}
function placementBadge(p, meta={}){const cls={WIN:'win',HIGH:'high',SAFE:'safe',CRITIQUE:'high',TOP2:'top2',LOW:'low',BTM:'bottom','LIPSYNC WIN':'bottom',ELIM:'elim',WINNER:'winner',RUNNERUP:'runnerup',FINALIST:'finalist'}[p]||'';const label=p==='LIPSYNC WIN'?'BTM':p;const strong=meta?.lipSyncWinner?' lip-sync-win':'';return `<span class="badge ${cls}${strong}">${label}</span>`;}
function relationLabel(a,r){
  return relationshipEmojiFromScore(a,r);
}
function relationshipEmojiFromScore(a=0,r=0){
  const score=(Number(a)||0)*0.65+(Number(r)||0)*0.35;
  const pick=(arr,seed=0)=>arr[Math.abs(Math.round(seed*13))%arr.length];

  if(score<=-35)return pick(['🤮','😡','🤬'],score);

  if(score<=-12)return pick(['😒','🤨','😠'],score);

  if(score<15)return pick(['😐','😬','🙂'],score);

  if(score<40)return pick(['😁','😊','😘'],score);

  return pick(['🥰','😍','🤩'],score);
}
function queenPersonalityName(q){
  const id=String(q?.personalityId||q?.personality||'').toLowerCase();
  const p=(window.gameState?.data?.personalities||[]).find(x=>String(x.id).toLowerCase()===id || String(x.name).toLowerCase()===id);
  if(p?.name)return p.name;
  return id ? id.replace(/[-_]/g,' ').replace(/\b\w/g,c=>c.toUpperCase()) : 'Balanced';
}
function queenShortType(q){
  return String(q?.type||'Queen').replace(/^Jack of All Trades$/,'Jack of All Trades');
}
function queenLocationLabel(q){
  if(q?.isPlayer)return 'wherever you are';
  return q?.location || 'somewhere fabulous';
}
function queenPersonaType(q){
  const archetype=`${queenPersonalityName(q)} ${queenShortType(q)}`.trim();
  return `The ${archetype} from ${queenLocationLabel(q)}`;
}
function queenPersonaTypeHtml(q){
  const archetype=`${queenPersonalityName(q)} ${queenShortType(q)}`.trim();
  return `The <strong>${escapeHtml(archetype)}</strong> from ${escapeHtml(queenLocationLabel(q))}`;
}

const QUEEN_TYPE_COLORS={
  'Jack of All Trades':'#9CA3AF','Fashion Queen':'#E879F9','Comedy Queen':'#FACC15','Dancing Queen':'#EF4444','Pageant Queen':'#F59E0B','Camp Queen':'#FB923C','Alternative Queen':'#111827','Glamour Queen':'#F472B6','Club Queen':'#84CC16','Horror Queen':'#7F1D1D','Cosplay Queen':'#C4B5FD','Sewing Queen':'#14B8A6','Acting Queen':'#6366F1','Lip Sync Assassin':'#DC2626','Social Queen':'#22C55E','Social Media Queen':'#06B6D4','Influencer Queen':'#38BDF8','TikTok Queen':'#A3E635','Hostess Queen':'#F97316','Ballroom Queen':'#2563EB','Makeup Queen':'#EC4899','Look Queen':'#9333EA','Theatre Queen':'#7C3AED','Vocal Diva':'#0EA5E9','Weird Queen':'#A855F7'
};
const PERSONALITY_COLORS={
  shy:'#BFDBFE',confident:'#DC2626',professional:'#CBD5E1',strategic:'#064E3B',kind:'#FBCFE8',chaotic:'#F97316',dramatic:'#581C87',funny:'#FDE047',competitive:'#B91C1C',calculating:'#0F766E',perfectionist:'#F8FAFC',reserved:'#64748B',ambitious:'#A21CAF',charming:'#FDBA74',sweet:'#FED7AA',sarcastic:'#78350F',hotheaded:'#EF4444',fearless:'#7F1D1D',humble:'#A7F3D0',eccentric:'#C084FC'
};
function personalityColor(q){
  const id=String(q?.personalityId||q?.personality||'').toLowerCase().replace(/[^a-z0-9]/g,'');
  return PERSONALITY_COLORS[id] || '#E9D5FF';
}
function typeColor(q){
  return QUEEN_TYPE_COLORS[q?.type] || '#A78BFA';
}
const EPISODE_TEAM_MARKERS=['💎','🔥','🌙','⚡','🌹','🦋','🍒','🪩'];
function currentEpisodeTeamForQueen(qId){
  const ep=window.gameState?.currentEpisode;
  if(!ep?.teams?.length || !qId)return null;
  if(ep.statsApplied || window.gameState?.season?.status==='finished')return null;
  if(ep.participantIds?.length && !ep.participantIds.includes(qId))return null;
  const teamIndex=ep.teams.findIndex(t=>(t.queenIds||[]).includes(qId));
  if(teamIndex<0)return null;
  const team=ep.teams[teamIndex];
  return {team,index:teamIndex%8,marker:EPISODE_TEAM_MARKERS[teamIndex%EPISODE_TEAM_MARKERS.length]};
}
function queenTeamMarkerHtml(q){
  const info=currentEpisodeTeamForQueen(q?.id);
  return info ? `<span class="team-name-marker team-marker-${info.index}" title="${escapeHtml(info.team?.name||'Team')}">${escapeHtml(info.marker)}</span>` : '';
}
function queenTeamNameHtml(q){
  const name=escapeHtml(q?.name||'Queen');
  return `${queenTeamMarkerHtml(q)}${name}`;
}
function queenTeamClass(q){
  const info=currentEpisodeTeamForQueen(q?.id);
  return info ? ` team-ring team-ring-${info.index}` : '';
}
function queenPortraitHtml(q, size='md', extraClass=''){
  const image=q?.portrait?.image || q?.image || q?.portraitUrl || '';
  const type=q?.portrait?.type || (image?'image':'gradient');
  const style=image && type==='image'
    ? `background-image:url('${escapeHtml(image)}')`
    : `background:linear-gradient(135deg, ${typeColor(q)} 0%, ${typeColor(q)} 48%, ${personalityColor(q)} 52%, ${personalityColor(q)} 100%)`;
  const title=`${q?.name||'Queen'} — ${queenPersonaType(q)}`;
  const playerClass=q?.isPlayer?' player-portrait':'';
  const teamClass=queenTeamClass(q);
  return `<span class="queen-portrait portrait-${escapeHtml(size)}${playerClass}${teamClass} ${escapeHtml(extraClass)}" style="${style}" title="${escapeHtml(title)}" aria-label="${escapeHtml(title)}"></span>`;
}

function queenDisplayName(q){
  const name=queenTeamNameHtml(q);
  return q?.isPlayer ? `${name} <span class="player-crown" title="Your queen">👑</span>` : name;
}

function escapeHtml(s){return String(s).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}

function stripLeadingEmojiLabel(label){
  return String(label||'').replace(/^\s*[\p{Extended_Pictographic}\uFE0F\u200D]+\s*/u,'').trim();
}
function defaultChoiceEmoji(id,label=''){
  const map={
    emotion:'❤️', sell_lyrics:'🎭', dance:'💃', stunts:'🤸', save_reveal:'👗', reveal_early:'✨', multiple_reveals:'💎', play_safe:'😌',
    continueSpectator:'👁️', seeFinalResult:'⏭️', explain:'💬', humble:'🙏', confident:'👑', funny:'😂', honest:'🫀',
    comfort:'💞', provoke:'🧨', apologize:'🕊️', quiet:'🤫', drama:'📺', alliance:'🤝'
  };
  if(map[id]) return map[id];
  const first=String(label||'').trim().split(/\s+/)[0]||'';
  return /^\p{Extended_Pictographic}/u.test(first)?first:'✦';
}
function choiceButtonHtml({id, attr, label, desc='', disabled='', emoji=''}){
  const icon=emoji || defaultChoiceEmoji(id,label);
  const clean=stripLeadingEmojiLabel(label);
  return `<button class="option" ${attr}="${escapeHtml(id)}" ${disabled||''}><span class="choice-emoji" aria-hidden="true">${escapeHtml(icon)}</span><span class="choice-copy"><strong>${escapeHtml(clean)}</strong><span class="small">${escapeHtml(desc||'')}</span></span></button>`;
}
