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
  const active=gameState.queens.filter(q=>!q.isEliminated).sort((a,b)=>a.name.localeCompare(b.name));
  const frontIds=currentFrontRunnerIds();
  const moodBadge=(q)=>q.id===gameState.playerQueenId?'':`<span class="sidebar-mood" title="How she sees you">${playerRelationshipLabel(q.id)}</span>`;
  const personaLine=(q)=>`<span class="small sidebar-persona queen-archetype queen-archetype--subtle">${queenPersonaTypeHtml(q)}</span>`;
  return `<aside class="sidebar"><div class="card queens-sidebar-card"><div class="sidebar-title"><h3>Queens still in</h3><span class="sidebar-count">${active.length}/${gameState.queens.length}</span></div><div class="queen-list">${active.map(q=>{
    const isFrontRunner=frontIds.includes(q.id);
    const frontTag=isFrontRunner?`<span class="badge arc front-runner">front-runner</span>`:'';
    const isPlayer=q.id===gameState.playerQueenId;
    return `<div class="queen-item sidebar-queen-row ${isFrontRunner?'front-runner-card':''} ${isPlayer?'player-queen-card':''}"><div class="sidebar-portrait-wrap">${queenPortraitHtml(q,'sm')}${moodBadge(q)}</div><div class="queen-item-copy"><strong>${queenDisplayName(q)}</strong>${isPlayer?'<span class="small sidebar-player-label">Your queen</span>':''}${personaLine(q)}${frontTag}</div></div>`;
  }).join('')}</div></div>${playerCanSkipToFinale()?`<button class="secondary" id="skipToFinaleBtn">⏭ Skip to Finale</button> `:''}<button class="secondary" id="openHistory">📋 Track Record</button> <button class="ghost" id="saveBtn">💾 Save</button> <button class="ghost" id="restartBtn">↺ Restart</button></aside>`;
}
function bindCommon(onHistory){document.querySelector('#openHistory')?.addEventListener('click',onHistory); document.querySelector('#skipToFinaleBtn')?.addEventListener('click',()=>{if(confirm('Skip the remaining episodes and jump to the finale?'))skipToFinaleStart();}); document.querySelector('#saveBtn')?.addEventListener('click',()=>{saveGame(); alert('Season saved in this browser.');}); document.querySelector('#restartBtn')?.addEventListener('click',()=>{if(confirm('Restart the season? Your current save will be cleared.')){clearSave(); resetState(); renderQueenCreator();}});}
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
function historyTable(){
  const eps=sortEpisodeKeys([...new Set(gameState.queens.flatMap(q=>q.episodeHistory.map(h=>h.episode))) ]);
  const ordered=getQueenStandingOrder();
  return `<div class="table-wrap"><table><thead><tr><th>Rank</th><th></th><th>Queen</th>${eps.map(e=>episodeHeader(e)).join('')}<th>Wins</th><th>BTMs</th></tr></thead><tbody>${ordered.map(q=>{const tags=queenTrackTags(q); const tagHtml=tags.length?`<div class="chips track-tags">${tags.map(t=>`<span class="badge arc front-runner">${escapeHtml(t)}</span>`).join('')}</div>`:''; return `<tr><td><strong>${queenPositionLabel(q,ordered)}</strong></td><td>${queenPortraitHtml(q,'xs')}</td><td><strong>${escapeHtml(q.name)}</strong><br><span class="small">${queenPersonaTypeHtml(q)}</span>${tagHtml}</td>${eps.map(e=>{const h=q.episodeHistory.find(x=>x.episode===e); return `<td>${h?placementBadge(h.placement):''}</td>`;}).join('')}<td>${q.statistics.wins}</td><td>${q.statistics.bottoms}</td></tr>`;}).join('')}</tbody></table></div>`;
}
function showHistory(backFn){setHTML(`<main class="screen"><section class="hero"><h2>Season Track Record</h2></section>${historyTable()}<button id="back">Back</button></main>`); document.querySelector('#back').addEventListener('click',()=>{backFn(); scrollToTop();});}
