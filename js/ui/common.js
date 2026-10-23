const APP_ROOT_ID='app';
let APP_ROOT_CACHE=null;
const LOADED_SCRIPT_CACHE={};

function appRoot(){
  if(!APP_ROOT_CACHE)APP_ROOT_CACHE=document.getElementById(APP_ROOT_ID);
  return APP_ROOT_CACHE;
}
function scrollToTop(){
  requestAnimationFrame(()=>{
    window.scrollTo({top:0,left:0,behavior:'auto'});
    document.documentElement.scrollTop=0;
    document.body.scrollTop=0;
  });
}
function setHTML(html){
  const root=appRoot();
  if(!root)return;
  const preserveY = (typeof window !== 'undefined' && typeof window.__preserveScrollY === 'number') ? window.__preserveScrollY : null;
  const template=document.createElement('template');
  template.innerHTML=html;
  root.replaceChildren(template.content);
  if(typeof ensureIconSprite==='function')ensureIconSprite();
  if(typeof tvEnhanceIcons==='function')tvEnhanceIcons(root);
  enhanceSeasonChrome();
  if(preserveY !== null){
    window.__preserveScrollY = null;
    requestAnimationFrame(()=>{
      window.scrollTo({top:preserveY,left:0,behavior:'auto'});
      document.documentElement.scrollTop = preserveY;
      document.body.scrollTop = preserveY;
    });
  }else{
    scrollToTop();
  }
}
function loadScriptOnce(src){
  if(LOADED_SCRIPT_CACHE[src])return LOADED_SCRIPT_CACHE[src];
  LOADED_SCRIPT_CACHE[src]=new Promise((resolve,reject)=>{
    if(document.querySelector(`script[src="${src}"]`)){resolve();return;}
    const script=document.createElement('script');
    script.src=src;
    script.async=false;
    script.onload=()=>resolve();
    script.onerror=()=>reject(new Error(`Could not load ${src}`));
    document.head.appendChild(script);
  });
  return LOADED_SCRIPT_CACHE[src];
}
async function ensureNamePartsLoaded(){
  if(gameState?.data?.nameParts?.firstNames?.length)return;
  try{
    await loadScriptOnce('js/data/nameParts.js');
    if(window.GAME_DATA?.nameParts)gameState.data.nameParts=window.GAME_DATA.nameParts;
  }catch(err){
    console.warn(err);
  }
}


function safeSeasonText(value){
  return String(value ?? '').replace(/[&<>'"]/g, ch=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[ch]));
}
function seasonEpisodeTotalEstimate(){
  // Competitive episodes in this season (the finale is not a numbered episode).
  // Recomputed every episode, so twists (non-elimination weeks, returns, double sashays) are reflected as they happen.
  const season=gameState?.season||{};
  const ep=gameState?.currentEpisode;
  const current=Number(ep?.number)||1;
  const format=typeof getSeasonFormat==='function'?getSeasonFormat():season.format;
  if(format==='all_winners')return 11;
  const finaleSize=Number(season.finaleSize)||4;
  const active=(gameState?.queens||[]).filter(q=>!q.isEliminated).length;
  const thisEpisodeDone=!!(ep && (ep.statsApplied || ep.eliminatedQueenId || ep.lipSyncResult));
  const done=thisEpisodeDone?current:current-1;
  const b=season.brackets;
  if(typeof isTournamentFormat==='function' && isTournamentFormat(format) && b && b.stage!=='final'){
    const groups=(b.groupOrder||['A','B','C']).length;
    const groupEpisodes=groups*3;
    const expectedFinalists=groups*2+1; // two advance per bracket + one production return
    return groupEpisodes+Math.max(1,expectedFinalists-finaleSize);
  }
  let extra=0;
  if(ep?.special==='premiere_no_elim' && !thisEpisodeDone)extra++;           // this week sends no one home
  if(season.returnTwist?.type && !season.returnTwist.used)extra++;           // a return smackdown is still to come
  return Math.max(current, done+Math.max(thisEpisodeDone?0:1, active-finaleSize)+extra);
}
function seasonProgressMarkup(){
  const ep=gameState?.currentEpisode;
  const current=Number(ep?.number)||null;
  // v31.5: real season length instead of a fixed 10 (see seasonEpisodeTotalEstimate).
  const target=seasonEpisodeTotalEstimate();
  if(!current || !target)return '';
  const total=Math.max(current, Math.min(20, target));
  const dots=Array.from({length:total},(_,i)=>`<span class="season-dot ${i+1<current?'is-done':i+1===current?'is-current':''}" aria-hidden="true"></span>`).join('');
  return `<div class="season-progress" aria-label="Episode ${current} of ${total}">${dots}</div>`;
}
function enhanceSeasonChrome(){
  try{
    if(!gameState?.season)return;
    const main=document.querySelector('#app > main.layout');
    const screen=main?.querySelector(':scope > .screen');
    if(!screen || screen.querySelector(':scope > .season-topbar'))return;
    const ep=gameState.currentEpisode;
    const status=String(gameState.season.status||'season').replace(/_/g,' ');
    const left=ep?.number ? `Episode ${ep.number}` : (status==='finale'?'Finale':status);
    const title=ep?.challengeName || ep?.themeName || (status==='finished'?'Season Summary':status);
    const active=(gameState.queens||[]).filter(q=>!q.isEliminated).length;
    const total=(gameState.queens||[]).length;
    const bar=document.createElement('div');
    bar.className='season-topbar';
    bar.innerHTML=`<div class="season-topbar-main"><span>${safeSeasonText(left)}</span><strong>${safeSeasonText(title)}</strong></div><div class="season-topbar-meta">${active&&total?`<span>${active}/${total} queens</span>`:''}${seasonProgressMarkup()}</div>`;
    screen.prepend(bar);
  }catch(err){
    console.warn('Season chrome skipped',err);
  }
}

function finishReturnSmackdownSilently(ep){
  if(!ep || ep.special!=='return_smackdown')return;
  try{
    if(typeof resolveReturnSmackdown==='function' && !ep.returnSmackdownResult)resolveReturnSmackdown();
  }catch(err){
    console.error('Return smackdown could not be resolved silently:',err);
  }
  // Whatever happened, the twist must never fire twice.
  if(gameState.season?.returnTwist)gameState.season.returnTwist.used=true;
  // The interactive flow also clears the episode on "Continue" (renderReturnSmackdownResult).
  gameState.currentEpisode=null;
}
function playerCanSkipToFinale(){
  const player=(gameState.queens||[]).find(q=>q.id===gameState.playerQueenId);
  return !!player?.isEliminated && gameState.season?.status!=='finished' && gameState.season?.status!=='finale';
}
function simulateEpisodeSilentlyForFinale(){
  const ep=gameState.currentEpisode;
  if(!ep || ep.statsApplied)return;
  if(ep.special==='lalaparuza'){
    if(typeof resolveLalaparuza==='function')resolveLalaparuza();
    return;
  }
  if(ep.special==='return_smackdown'){
    // Fix: return smackdowns were never resolved while skipping, so the twist stayed
    // "available" and generateEpisode() kept creating empty smackdown episodes.
    finishReturnSmackdownSilently(ep);
    return;
  }
  if(!ep.placements?.length && typeof calculateEpisodeResults==='function')calculateEpisodeResults({risk:'safe'});
  if(!ep.lipSyncResult && typeof resolveLipSync==='function')resolveLipSync();
  if(typeof applyEpisodeStats==='function')applyEpisodeStats();
}
function skipToFinaleStart(){
  gameState.season=gameState.season||{};
  gameState.season.spectatorMode=true;
  simulateEpisodeSilentlyForFinale();
  let guard=0;
  while(typeof isFinaleReady==='function' && !isFinaleReady() && guard++<60){
    if(typeof generateEpisode==='function')generateEpisode();
    simulateEpisodeSilentlyForFinale();
  }
  if(typeof shouldOfferReunionSmackdown==='function' && shouldOfferReunionSmackdown() && typeof resolveReunionSmackdown==='function')resolveReunionSmackdown();
  if(typeof prepareFinale==='function')prepareFinale();
  gameState.season.finaleStage='FINALE_GRAND';
  if(typeof saveGame==='function')saveGame();
  if(typeof renderFinale==='function')renderFinale();
}



function finishCurrentEpisodeSilently(){
  const ep=gameState.currentEpisode;
  if(!ep)return;
  if(ep.special==='lalaparuza'){
    if(typeof resolveLalaparuza==='function' && !ep.lalaparuzaResult)resolveLalaparuza();
    return;
  }
  if(ep.special==='return_smackdown'){
    finishReturnSmackdownSilently(ep);
    return;
  }
  ep.workroomComplete=true;
  if(!ep.playerChallengeRisk)ep.playerChallengeRisk='safe';
  if(!ep.placements?.length && typeof calculateEpisodeResults==='function')calculateEpisodeResults({risk:'safe'});
  if(!ep.lipSyncResult && typeof resolveLipSync==='function')resolveLipSync();
  if(!ep.statsApplied && typeof applyEpisodeStats==='function')applyEpisodeStats();
}
function advanceAfterSilentEpisode(){
  if(typeof shouldShowTournamentBracketResults==='function' && shouldShowTournamentBracketResults()){ renderTournamentBracketResults(); return; }
  if(typeof isWaitingForTournamentEntrance==='function' && isWaitingForTournamentEntrance()){ renderEntrance(); return; }
  if(typeof isWaitingForPremiereEntrance==='function' && isWaitingForPremiereEntrance()){ renderEntrance(); return; }
  if(typeof isFinaleReady==='function' && isFinaleReady()){
    if(typeof shouldOfferReunionSmackdown==='function' && shouldOfferReunionSmackdown()) { renderReunionSmackdown(); return; }
    renderFinale();
    return;
  }
  if(typeof generateEpisode==='function')generateEpisode();
  renderWorkroom();
}
function skipCurrentEpisodeToNext(){
  finishCurrentEpisodeSilently();
  if(typeof saveGame==='function')saveGame();
  advanceAfterSilentEpisode();
}

// v31.6: the winner's name is the star of the card; the title sits under it
function tvWinnerSpotlight(q, title, opts={}){
  if(!q)return '';
  const portrait=opts.portrait===false?'':`<div class="winner-portrait-wrap">${queenPortraitHtml(q,'xl','winner-portrait')}</div>`;
  return `<div class="tv-winspot">${portrait}<strong class="tv-winspot-name">${escapeHtml(q.name)}</strong>${title?`<span class="tv-winspot-title">${escapeHtml(title)}</span>`:''}</div>`;
}
function bigMomentHeader(kicker, title, variant='default', desc=''){
  const cls=`moment-header moment-${String(variant||'default').replace(/[^a-z0-9_-]/gi,'')}`;
  return `<div class="${cls}">
    <span>${escapeHtml(kicker||'')}</span>
    <strong>${escapeHtml(title||'')}</strong>
    ${desc?`<p>${escapeHtml(desc)}</p>`:''}
  </div>`;
}
function episodeChallengeBrief(ep){
  if(!ep)return '';
  const c=ep.challengeContent||{};
  if(c.challengePrompt)return c.challengePrompt;
  if(ep.challengeType==='snatchgame')return 'Make the panel laugh by becoming a celebrity, character, or cultural chaos machine.';
  if(ep.challengeType==='talentshow')return 'Showcase a signature talent and make a first impression that matters.';
  if(ep.challengeType==='lalaparuza')return 'Lip sync one by one for survival.';
  return ep.challengeName || ep.themeName || 'Serve the challenge.';
}

function queenSidebar(){
  const bracketState=gameState.season?.brackets;
  const inTournamentGroup=typeof isTournamentFormat==='function' && isTournamentFormat(getSeasonFormat()) && bracketState && bracketState.stage!=='final';
  const currentGroup=bracketState?.currentGroup||null;
  const groupForQueen=(q)=>{
    if(!bracketState?.groups)return null;
    return q.tournamentBracket || Object.keys(bracketState.groups).find(g=>(bracketState.groups[g]||[]).includes(q.id)) || null;
  };
  const active=gameState.queens.filter(q=>!q.isEliminated).sort((a,b)=>{
    if(inTournamentGroup){
      const aIn=groupForQueen(a)===currentGroup;
      const bIn=groupForQueen(b)===currentGroup;
      if(aIn!==bIn)return aIn?-1:1;
      const ga=groupForQueen(a)||'Z', gb=groupForQueen(b)||'Z';
      if(ga!==gb)return ga.localeCompare(gb);
    }
    return a.name.localeCompare(b.name);
  });
  const frontIds=currentFrontRunnerIds();
  const moodBadge=(q)=>q.id===gameState.playerQueenId?`<span class="sidebar-mood sidebar-mood-me" title="You">${typeof icon==='function'?icon('crown','mood-me','You'):''}</span>`:`<span class="sidebar-mood" title="How she sees you">${typeof moodIconHtml==='function'?moodIconHtml(q.id):playerRelationshipLabel(q.id)}</span>`;
  const personaLine=(q)=>`<span class="small sidebar-persona queen-archetype queen-archetype--subtle">${queenPersonaTypeHtml(q)}</span>`;
  const trackLine=(q)=> inTournamentGroup
    ? `<span class="small sidebar-track-count">${Number(bracketState?.pointsByQueenId?.[q.id] ?? q.tournamentPoints ?? 0)} PTS</span>`
    : `<span class="small sidebar-track-count">${Number(q.statistics?.wins)||0} WIN / ${Number(q.statistics?.bottoms)||0} BTM</span>`;
  // v31.5 Part B — STILL IN: last placement tag, portrait, name (+ team), persona · city on one line,
  // Front-runner, how she sees you, then the actions. Tournament brackets keep their points.
  const lastTag=(q)=>{
    if(inTournamentGroup)return `<span class="badge tv-pts">${Number(bracketState?.pointsByQueenId?.[q.id] ?? q.tournamentPoints ?? 0)} PTS</span>`;
    const last=[...(q.episodeHistory||[])].reverse().find(h=>h && h.placement && h.episode!=='Finale');
    return last ? placementBadge(last.placement) : '<span class="badge tv-none">—</span>';
  };
  const ic=(n)=>typeof icon==='function'?icon(n):'';
  const me=yourQueenPanelData();
  // v31.6: with your panel on top, the list is the cast and the face column says what each queen thinks of you
  const listQueens=me?active.filter(q=>q.id!==gameState.playerQueenId):active;
  const listTitle=me
    ? `<div class="sidebar-title tv-list-h"><h3>Still in</h3><span class="sidebar-count">${active.length}/${gameState.queens.length}</span><span class="tv-list-k">Thinks of you</span></div>`
    : `<div class="sidebar-title"><h3>Still in</h3><span class="sidebar-count">${active.length}/${gameState.queens.length}</span></div>`;
  return `<aside class="sidebar tv-rail${me?' has-me':''}">${me?yourQueenMobileBar(me):''}<div class="card queens-sidebar-card">${me?yourQueenPanelHtml(me):''}${listTitle}<div class="queen-list">${listQueens.map(q=>{
    const isFrontRunner=frontIds.includes(q.id);
    const isPlayer=q.id===gameState.playerQueenId;
    const group=groupForQueen(q);
    const outOfBracket=inTournamentGroup && group!==currentGroup;
    const groupBadge=(inTournamentGroup && group)?`<span class="sidebar-bracket-label">Bracket ${escapeHtml(group)}</span>`:'';
    const persona=`${escapeHtml(`${queenPersonalityName(q)} ${queenShortType(q)}`.trim())} · ${escapeHtml(queenLocationLabel(q))}`;
    return `<div class="queen-item sidebar-queen-row tv-row ${isFrontRunner?'front-runner-card':''} ${isPlayer?'player-queen-card':''} ${group?`tournament-bracket-${group}`:''} ${outOfBracket?'tournament-out-of-bracket':''}">${lastTag(q)}${queenPortraitHtml(q,'sm')}<div class="queen-item-copy"><strong class="tv-name">${escapeHtml(q.name)}</strong><span class="tv-persona" title="${persona}">${persona}</span>${groupBadge}${isFrontRunner?'<span class="tv-front">Front-runner</span>':''}</div>${moodBadge(q)}</div>`;
  }).join('')}</div><div class="tv-rail-actions">${typeof renderSeasonRecap==='function'?`<button class="ghost tv-wide" id="openRecap">${ic('tv')} Season recap</button>`:''}<button class="ghost" id="openHistory">${ic('scorecard')} Track Record</button><button class="ghost" id="saveBtn">${ic('save')} Save</button>${playerCanSkipToFinale()?`<button class="ghost tv-wide" id="skipToFinaleBtn">${ic('skip')} Skip to Finale</button>`:''}<button class="ghost tv-wide tv-quiet" id="restartBtn">${ic('restart')} Restart</button></div></div></aside>`;
}
function bindCommon(onHistory){document.body.classList.remove('tv-rail-open'); document.querySelector('#tvMebar')?.addEventListener('click',()=>{const open=document.body.classList.toggle('tv-rail-open'); document.querySelector('#tvMebar')?.setAttribute('aria-expanded',String(open));}); document.querySelector('#openHistory')?.addEventListener('click',onHistory); document.querySelector('#openRecap')?.addEventListener('click',()=>{if(typeof renderSeasonRecap==='function')renderSeasonRecap();}); document.querySelector('#skipToFinaleBtn')?.addEventListener('click',()=>{if(confirm('Skip the remaining episodes and jump to the finale?'))skipToFinaleStart();}); document.querySelector('#saveBtn')?.addEventListener('click',()=>{saveGame(); alert('Season saved in this browser.');}); document.querySelector('#restartBtn')?.addEventListener('click',()=>{if(confirm('Restart the season? Your current save will be cleared.')){clearSave(); resetState(); renderSeasonInvitation();}});}
function getQueenStandingOrder(){
  const queens=[...gameState.queens];
  const eliminated=[...gameState.eliminatedQueens];
  const active=queens.filter(q=>!q.isEliminated);
  if(gameState.season?.status==='finished'){
    const winnerId=gameState.season.winnerId;
    const finalists=active.map(q=>{const finale=q.episodeHistory.find(h=>h.episode==='Finale');return {q,score:finale?.score??0,win:q.id===winnerId};}).sort((a,b)=>Number(b.win)-Number(a.win)||b.score-a.score||a.q.name.localeCompare(b.q.name));
    return [...finalists.map(x=>x.q), ...eliminated.slice().reverse()];
  }
  return [...active.sort((a,b)=>a.name.localeCompare(b.name)), ...eliminated.slice().reverse()];
}
function queenPositionLabel(q, ordered){const index=ordered.findIndex(x=>x.id===q.id); return index>=0 ? index+1 : '';}
function queenTrackRecordPointsLocal(q){
  if(typeof queenTrackRecordPoints==='function')return queenTrackRecordPoints(q);
  const st=q?.statistics||{};
  return (st.wins||0)*10+(st.highs||0)*5+(st.safes||0)*1-(st.lows||0)*2-(st.bottoms||0)*6;
}
function currentFrontRunnerIds(){
  const queens=(gameState.queens||[]).filter(q=>!q.isEliminated);
  if(!queens.length)return [];
  const hasTrack=queens.some(q=>(q.episodeHistory||[]).some(h=>h.placement && h.placement!=='ELIM'));
  if(!hasTrack)return [];
  const max=Math.max(...queens.map(queenTrackRecordPointsLocal));
  return queens.filter(q=>queenTrackRecordPointsLocal(q)===max).map(q=>q.id);
}
function queenTrackTags(q){
  const tags=[];
  if(currentFrontRunnerIds().includes(q.id))tags.push('front-runner');
  if(typeof seasonArcTags==='function'){
    seasonArcTags(q).forEach(t=>{if(t!=='front-runner' && tags.length<3)tags.push(t);});
  }
  return tags;
}
function episodeHeader(e){
  if(e==='Finale') return `<th><div>Finale</div><small>Grand Finale</small></th>`;
  const ep=gameState.episodeHistory.find(x=>String(x.number)===String(e));
  if(!ep) return `<th>Ep. ${escapeHtml(e)}</th>`;
  const challenge=ep.challengeName||ep.challengeType||'Challenge';
  const runway=ep.runwayCategory||'';
  return `<th><div>Ep. ${escapeHtml(e)}</div><small>${escapeHtml(challenge)}</small>${runway?`<small>${escapeHtml(runway)}</small>`:''}</th>`;
}
function sortEpisodeKeys(keys){
  return keys.slice().sort((a,b)=>{
    const af=a==='Finale', bf=b==='Finale';
    if(af&&bf)return 0;
    if(af)return 1;
    if(bf)return -1;
    const an=Number(a), bn=Number(b);
    if(Number.isFinite(an)&&Number.isFinite(bn))return an-bn;
    if(Number.isFinite(an))return -1;
    if(Number.isFinite(bn))return 1;
    return String(a).localeCompare(String(b));
  });
}
function historyWinsFor(q){
  if(typeof getSeasonFormat==='function' && getSeasonFormat()==='all_winners'){
    return (q.episodeHistory||[]).filter(h=>['WIN','TOP2'].includes(String(h.placement||'').toUpperCase())).length;
  }
  return q.statistics?.wins||0;
}
function historyTable(){
  const eps=sortEpisodeKeys([...new Set(gameState.queens.flatMap(q=>q.episodeHistory.map(h=>h.episode))) ]);
  const ordered=getQueenStandingOrder();
  const bracketClass=(q)=>{const b=gameState.season?.brackets; const g=q?.tournamentBracket || (b?.groups?Object.keys(b.groups).find(key=>(b.groups[key]||[]).includes(q.id)):null); return g?`tournament-track-bracket-${g}`:'';};
  return `<div class="table-wrap"><table><thead><tr><th>Rank</th><th></th><th>Queen</th>${eps.map(e=>episodeHeader(e)).join('')}<th>Wins</th><th>BTMs</th></tr></thead><tbody>${ordered.map(q=>{const tags=queenTrackTags(q); const tagHtml=tags.length?`<div class="chips track-tags">${tags.map(t=>`<span class="tv-tag tv-tag-${tvTagTone(t)}">${escapeHtml(t)}</span>`).join('')}</div>`:''; return `<tr class="${bracketClass(q)}"><td><strong>${queenPositionLabel(q,ordered)}</strong></td><td>${queenPortraitHtml(q,'xs')}</td><td><strong>${escapeHtml(q.name)}</strong><br><span class="small">${queenPersonaTypeHtml(q)}</span>${tagHtml}</td>${eps.map(e=>{const h=q.episodeHistory.find(x=>x.episode===e); return `<td>${h?placementBadge(h.placement,h):''}</td>`;}).join('')}<td>${historyWinsFor(q)}</td><td>${q.statistics.bottoms}</td></tr>`;}).join('')}</tbody></table></div>`;
}

function queenNameById(id){
  if(!id)return '—';
  if(id==='lip_sync_assassin')return 'Lip Sync Assassin';
  return gameState.queens.find(q=>q.id===id)?.name || '—';
}
function seasonLipstickChoicesTable(){
  const episodes=(gameState.episodeHistory||[]).filter(ep=>{
    const outcome=ep?.lipSyncResult?.outcome;
    return outcome==='legacyElimination' || outcome==='assassinElimination';
  });
  if(!episodes.length)return '';
  const hasLegacy=episodes.some(ep=>ep.lipSyncResult?.outcome==='legacyElimination');
  const hasAssassin=episodes.some(ep=>ep.lipSyncResult?.outcome==='assassinElimination');
  const legacyRows=episodes.filter(ep=>ep.lipSyncResult?.outcome==='legacyElimination').map(ep=>{
    const r=ep.lipSyncResult||{};
    const votes=r.legacyVotes || ep.legacyVotes || {};
    const winnerId=r.survivorId;
    const loserId=r.top2LoserId;
    return `<tr><td>${escapeHtml(ep.number||'')}</td><td><strong>${escapeHtml(queenNameById(winnerId))}</strong></td><td>${escapeHtml(queenNameById(votes[winnerId]))}</td><td>${escapeHtml(queenNameById(loserId))}</td><td>${escapeHtml(queenNameById(votes[loserId]))}</td></tr>`;
  }).join('');
  const assassinEpisodes=episodes.filter(ep=>ep.lipSyncResult?.outcome==='assassinElimination');
  const assassinVoteMap={};
  const assassinTopVoteMap={};
  const assassinVoterIds=new Set();
  const assassinEpisodeNumbers=[];
  assassinEpisodes.forEach(ep=>{
    const r=ep.lipSyncResult||{};
    const epNo=String(ep.number||'');
    if(!epNo)return;
    assassinEpisodeNumbers.push(epNo);
    if(r.topQueenId && r.topVote){
      assassinVoterIds.add(r.topQueenId);
      assassinVoteMap[r.topQueenId]=assassinVoteMap[r.topQueenId]||{};
      assassinVoteMap[r.topQueenId][epNo]=r.topVote;
      assassinTopVoteMap[`${r.topQueenId}::${epNo}`]=true;
    }
    const raw=r.rawGroupVotes || ep.assassinGroupVotes || {};
    Object.entries(raw).forEach(([voterId,voteId])=>{
      if(voterId==='lip_sync_assassin' || voterId===r.topQueenId || !voteId)return;
      assassinVoterIds.add(voterId);
      assassinVoteMap[voterId]=assassinVoteMap[voterId]||{};
      assassinVoteMap[voterId][epNo]=voteId;
    });
  });
  const assassinEpisodeKeys=sortEpisodeKeys([...new Set(assassinEpisodeNumbers)]);
  const standingOrder=(typeof getQueenStandingOrder==='function'?getQueenStandingOrder():[]).map(q=>q.id);
  const standingIndex=new Map(standingOrder.map((id,index)=>[id,index]));
  const assassinRows=[...assassinVoterIds].sort((a,b)=>{
    const ai=standingIndex.has(a)?standingIndex.get(a):9999;
    const bi=standingIndex.has(b)?standingIndex.get(b):9999;
    return ai-bi || queenNameById(a).localeCompare(queenNameById(b));
  }).map(voterId=>{
    const cells=assassinEpisodeKeys.map(epNo=>{
      const voteId=assassinVoteMap[voterId]?.[epNo];
      const voteName=voteId?queenNameById(voteId):'—';
      const isTop=!!assassinTopVoteMap[`${voterId}::${epNo}`];
      return `<td>${isTop?`<strong class="lipstick-vote-top">${escapeHtml(voteName)}</strong>`:escapeHtml(voteName)}</td>`;
    }).join('');
    return `<tr><td><strong>${escapeHtml(queenNameById(voterId))}</strong></td>${cells}</tr>`;
  }).join('');
  const legacyTable=hasLegacy?`<section class="card"><h2>Lipstick Choices</h2><div class="table-wrap"><table><thead><tr><th>Episode #</th><th>Winner</th><th>Lipstick</th><th>Loser</th><th>Lipstick</th></tr></thead><tbody>${legacyRows}</tbody></table></div></section>`:'';
  const assassinHeader=assassinEpisodeKeys.map(e=>`<th>Ep. ${escapeHtml(e)}</th>`).join('');
  const assassinTable=hasAssassin?`<section class="card"><h2>Lipstick Votes</h2><div class="table-wrap"><table><thead><tr><th>Queen</th>${assassinHeader}</tr></thead><tbody>${assassinRows}</tbody></table></div></section>`:'';
  return `${legacyTable}${assassinTable}`;
}

function showHistory(backFn){setHTML(`<main class="screen"><section class="hero"><h2>Season Track Record</h2></section>${historyTable()}<button id="back">Back</button></main>`); document.querySelector('#back').addEventListener('click',()=>{backFn(); scrollToTop();});}

// v31.5 round 2: story tags (not placements) are thin pills; the dot carries the tone
function tvTagTone(t){
  const k=String(t||'').toLowerCase();
  if(/front|fan fav|assassin|darling|legend|icon|threat|winner|bloomer|mother|congeniality|redemption/.test(k))return 'gold';
  if(/villain|robbed|messy|chaos|feud/.test(k))return 'lipstick';
  if(/filler|invisible|fading|peaked|edit/.test(k))return 'muted';
  return 'pink';
}

// v31.6: "Your queen" — energy, stress, judges' expectations and how the cast sees her.
// Fans and production stay hidden until the post-season reception.
function yourQueenPanelData(){
  const q=gameState.queens?.find(x=>x.id===gameState.playerQueenId);
  if(!q || q.isEliminated || !gameState.season || gameState.season.status==='finished')return null;
  const energy=Math.round(clamp(Number(q.energy ?? 80),0,100));
  const stress=Math.round(clamp(Number(q.stress ?? 20),0,100));
  const counts={love:0,like:0,neutral:0,shade:0,hate:0};
  (gameState.queens||[]).filter(o=>!o.isEliminated && o.id!==q.id).forEach(o=>{const r=gameState.relationships?.[o.id]?.[q.id];const t=typeof relationshipMoodTier==='function'?relationshipMoodTier(r?.affinity,r?.respect):'neutral';counts[t]=(counts[t]||0)+1;});
  const wins=Number(q.statistics?.wins)||0;
  const step=Math.min(4,wins);
  const n=Object.values(counts).reduce((a,b)=>a+b,0)||1;
  const avg=(counts.love*2+counts.like-counts.shade-counts.hate*2)/n;
  const overall=avg>=1.2?'love':avg>=0.4?'like':avg>-0.4?'neutral':avg>-1.2?'shade':'hate';
  return {q,energy,stress,counts,step,overall,wins,bottoms:Number(q.statistics?.bottoms)||0};
}
function yourQueenPanelHtml(d){
  const ic=(n,c,l)=>typeof icon==='function'?icon(n,c,l):'';
  const stressNote=d.stress>=70?'High stress costs points on the main stage. Rest, or lean on your allies.':d.energy<=30?'Running on empty. Protect your energy before you rehearse again.':'';
  const tiers=[['love','Love'],['like','Like'],['neutral','Neutral'],['shade','Shade'],['hate','Hate']];
  const es=meterState('energy',d.energy), ss=meterState('stress',d.stress);
  return `<section class="tv-me" aria-label="Your queen">
    <div class="tv-me-top">${queenPortraitHtml(d.q,'sm')}<div><strong>${escapeHtml(d.q.name)}</strong><span>Your queen</span></div>${(()=>{const last=[...(d.q.episodeHistory||[])].reverse().find(h=>h&&h.placement&&h.episode!=='Finale');return last&&typeof placementBadge==='function'?`<span class="tv-me-last">${placementBadge(last.placement)}</span>`:'';})()}</div>
    <div class="tv-me-meter" title="Energy ${d.energy}/100: keep it high"><span class="tv-me-k">Energy</span><span class="tv-me-bar"><i class="st-${es.tone}" style="width:${d.energy}%"></i></span><span class="tv-me-st st-${es.tone}">${es.word}</span></div>
    <div class="tv-me-meter" title="Stress ${d.stress}/100: keep it low"><span class="tv-me-k">Stress</span><span class="tv-me-bar"><i class="st-${ss.tone}" style="width:${d.stress}%"></i></span><span class="tv-me-st st-${ss.tone}">${ss.word}</span></div>
    ${stressNote?`<p class="tv-me-note">${escapeHtml(stressNote)}</p>`:''}
    <span class="tv-me-k">How the cast sees you</span>
    <div class="tv-me-op">${tiers.map(([t,l])=>`<div class="tv-me-opc">${ic('mood-'+t,'mood-'+t)}<b>${d.counts[t]||0}</b><small>${l}</small></div>`).join('')}</div>
  </section>`;
}
// v31.6: energy is good high, stress is good low. Colour and word follow the state, not the bar.
function meterState(kind,v){
  if(kind==='energy')return v>=65?{tone:'ok',word:'Fresh'}:v>=35?{tone:'warn',word:'Tired'}:{tone:'bad',word:'Drained'};
  return v<=35?{tone:'ok',word:'Calm'}:v<=65?{tone:'warn',word:'Tense'}:{tone:'bad',word:'Spiraling'};
}
function yourQueenMobileBar(d){
  const ic=(n,c)=>typeof icon==='function'?icon(n,c):'';
  const es=meterState('energy',d.energy), ss=meterState('stress',d.stress);
  return `<button type="button" class="tv-mebar" id="tvMebar" aria-expanded="false" aria-label="Your queen and the cast">${queenPortraitHtml(d.q,'xs')}<span class="tv-mebar-m"><span>Energy <b class="st-${es.tone}">${es.word}</b></span><span class="tv-me-bar"><i class="st-${es.tone}" style="width:${d.energy}%"></i></span></span><span class="tv-mebar-m"><span>Stress <b class="st-${ss.tone}">${ss.word}</b></span><span class="tv-me-bar"><i class="st-${ss.tone}" style="width:${d.stress}%"></i></span></span>${ic('mood-'+d.overall,'mood-'+d.overall)}<span class="tv-mebar-chev">Still in</span></button>`;
}

// Judges' expectations: a quiet 5-step bar at the top of each episode (no labels)
function judgesExpectationBarHtml(){
  const q=gameState.queens?.find(x=>x.id===gameState.playerQueenId);
  if(!q||q.isEliminated)return '';
  const step=Math.min(4,Number(q.statistics?.wins)||0);
  return `<div class="tv-exp" title="The more you win, the higher the bar."><span class="tv-me-k">Judges' expectations</span><span class="tv-me-segs" role="img" aria-label="Judges' expectations: ${step+1} of 5">${[0,1,2,3,4].map(i=>`<i class="${i<=step?'f':''}"></i>`).join('')}</span></div>`;
}
