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
function seasonProgressMarkup(){
  const ep=gameState?.currentEpisode;
  const current=Number(ep?.number)||null;
  const target=Number(gameState?.settings?.episodeTarget)||Number(gameState?.season?.episodeTarget)||10;
  if(!current || !target)return '';
  const total=Math.max(current, Math.min(16, target));
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
    if(typeof resolveReturnSmackdown==='function' && !ep.returnSmackdownResult)resolveReturnSmackdown();
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
  const moodBadge=(q)=>q.id===gameState.playerQueenId?'':`<span class="sidebar-mood" title="How she sees you">${playerRelationshipLabel(q.id)}</span>`;
  const personaLine=(q)=>`<span class="small sidebar-persona queen-archetype queen-archetype--subtle">${queenPersonaTypeHtml(q)}</span>`;
  const trackLine=(q)=> inTournamentGroup
    ? `<span class="small sidebar-track-count">${Number(bracketState?.pointsByQueenId?.[q.id] ?? q.tournamentPoints ?? 0)} PTS</span>`
    : `<span class="small sidebar-track-count">${Number(q.statistics?.wins)||0} WIN / ${Number(q.statistics?.bottoms)||0} BTM</span>`;
  return `<aside class="sidebar"><div class="card queens-sidebar-card"><div class="sidebar-title"><h3>Queens still in</h3><span class="sidebar-count">${active.length}/${gameState.queens.length}</span></div><div class="queen-list">${active.map(q=>{
    const isFrontRunner=frontIds.includes(q.id);
    const frontTag=isFrontRunner?`<span class="badge arc front-runner">front-runner</span>`:'';
    const isPlayer=q.id===gameState.playerQueenId;
    const group=groupForQueen(q);
    const outOfBracket=inTournamentGroup && group!==currentGroup;
    const groupBadge=(inTournamentGroup && group)?`<span class="small sidebar-bracket-label">Bracket ${escapeHtml(group)}</span>`:'';
    return `<div class="queen-item sidebar-queen-row ${isFrontRunner?'front-runner-card':''} ${isPlayer?'player-queen-card':''} ${group?`tournament-bracket-${group}`:''} ${outOfBracket?'tournament-out-of-bracket':''}"><div class="sidebar-portrait-wrap">${queenPortraitHtml(q,'sm')}${moodBadge(q)}</div><div class="queen-item-copy"><strong>${queenDisplayName(q)}</strong>${isPlayer?'<span class="small sidebar-player-label">Your queen</span>':''}${groupBadge}${personaLine(q)}${trackLine(q)}${frontTag}</div></div>`;
  }).join('')}</div></div>${playerCanSkipToFinale()?`<button class="secondary" id="skipToFinaleBtn">⏭ Skip to Finale</button> `:''}<button class="secondary" id="openHistory">📋 Track Record</button> <button class="ghost" id="saveBtn">💾 Save</button> <button class="ghost" id="restartBtn">↺ Restart</button></aside>`;
}
function bindCommon(onHistory){document.querySelector('#openHistory')?.addEventListener('click',onHistory); document.querySelector('#skipToFinaleBtn')?.addEventListener('click',()=>{if(confirm('Skip the remaining episodes and jump to the finale?'))skipToFinaleStart();}); document.querySelector('#saveBtn')?.addEventListener('click',()=>{saveGame(); alert('Season saved in this browser.');}); document.querySelector('#restartBtn')?.addEventListener('click',()=>{if(confirm('Restart the season? Your current save will be cleared.')){clearSave(); resetState(); renderSeasonInvitation();}});}
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
  return `<div class="table-wrap"><table><thead><tr><th>Rank</th><th></th><th>Queen</th>${eps.map(e=>episodeHeader(e)).join('')}<th>Wins</th><th>BTMs</th></tr></thead><tbody>${ordered.map(q=>{const tags=queenTrackTags(q); const tagHtml=tags.length?`<div class="chips track-tags">${tags.map(t=>`<span class="badge arc front-runner">${escapeHtml(t)}</span>`).join('')}</div>`:''; return `<tr class="${bracketClass(q)}"><td><strong>${queenPositionLabel(q,ordered)}</strong></td><td>${queenPortraitHtml(q,'xs')}</td><td><strong>${escapeHtml(q.name)}</strong><br><span class="small">${queenPersonaTypeHtml(q)}</span>${tagHtml}</td>${eps.map(e=>{const h=q.episodeHistory.find(x=>x.episode===e); return `<td>${h?placementBadge(h.placement,h):''}</td>`;}).join('')}<td>${historyWinsFor(q)}</td><td>${q.statistics.bottoms}</td></tr>`;}).join('')}</tbody></table></div>`;
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
