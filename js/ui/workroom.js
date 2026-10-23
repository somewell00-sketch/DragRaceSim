// Helper para construir o bloco de interações
function eventNarrativeWeight(e){
  const type=String(e?.type||'').toLowerCase();
  let w=1;
  if(['narrative','rivalry','alliance','conflict','shade','sabotage','emotion','support','production'].includes(type)) w+=2;
  if(type==='narrative') w+=3;
  if(e?.a===gameState.playerQueenId || e?.b===gameState.playerQueenId || e?.queenId===gameState.playerQueenId) w+=2;
  return w;
}
function weightedPickUnique(items,count,weightFn){
  const pool=[...(items||[])];
  const picked=[];
  while(pool.length && picked.length<count){
    const total=pool.reduce((sum,item)=>sum+Math.max(0.05,weightFn(item)),0);
    let roll=Math.random()*total;
    let index=0;
    for(;index<pool.length;index++){
      roll-=Math.max(0.05,weightFn(pool[index]));
      if(roll<=0)break;
    }
    picked.push(pool.splice(Math.min(index,pool.length-1),1)[0]);
  }
  return picked;
}

function normalizeStoryBeatText(text){
  return String(text||'')
    .toLowerCase()
    .replace(/[\u{1F300}-\u{1FAFF}]/gu,'')
    .replace(/<[^>]*>/g,'')
    .replace(/[^a-z0-9]+/g,' ')
    .trim();
}
function storyBeatPairKey(e){
  const ids=[e?.a,e?.b,e?.queenId,e?.targetId].filter(Boolean).map(String);
  if(ids.length<2)return '';
  return ids.slice(0,2).sort().join('|');
}
function weightedPickDiverseStoryEvents(items,count,weightFn){
  const pool=[...(items||[])];
  const picked=[];
  const usedTexts=new Set();
  const usedTemplates=new Set();
  const usedPairs=new Set();
  const usedTypes=new Set();
  let guard=0;
  while(pool.length && picked.length<count && guard<80){
    guard++;
    const total=pool.reduce((sum,item)=>sum+Math.max(0.05,weightFn(item)),0);
    let roll=Math.random()*total;
    let index=0;
    for(;index<pool.length;index++){
      roll-=Math.max(0.05,weightFn(pool[index]));
      if(roll<=0)break;
    }
    const item=pool.splice(Math.min(index,pool.length-1),1)[0];
    const textKey=normalizeStoryBeatText(item?.text);
    const templateKey=String(item?.id||'');
    const pairKey=storyBeatPairKey(item);
    const typeKey=String(item?.type||'').toLowerCase();
    if(textKey && usedTexts.has(textKey))continue;
    if(templateKey && usedTemplates.has(templateKey))continue;
    if(pairKey && usedPairs.has(pairKey))continue;
    if(typeKey && usedTypes.has(typeKey) && pool.some(e=>String(e?.type||'').toLowerCase()!==typeKey))continue;
    picked.push(item);
    if(textKey)usedTexts.add(textKey);
    if(templateKey)usedTemplates.add(templateKey);
    if(pairKey)usedPairs.add(pairKey);
    if(typeKey)usedTypes.add(typeKey);
  }
  return picked;
}
function pickUniqueStoryNotes(notes,count){
  const picked=[];
  const used=new Set();
  for(const note of weightedPickUnique(notes||[], Math.max(count*2,count), n => {
    const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
    return player?.name && String(n).includes(player.name) ? 3 : 1;
  })){
    const key=normalizeStoryBeatText(note);
    if(key && used.has(key))continue;
    used.add(key);
    picked.push(note);
    if(picked.length>=count)break;
  }
  return picked;
}

// Helper para construir um bloco curto de Story Beats sem encher a UI.
function buildWorkroomPulse(events, relationshipNotes) {
    const social = weightedPickDiverseStoryEvents(events||[], 2, eventNarrativeWeight)
        .map(e => formatPlayerNameInSocialText(e.text));

    const relationships = pickUniqueStoryNotes(relationshipNotes||[], 1)
        .map(n => formatPlayerNameInSocialText(n));

    const allItems = [...social, ...relationships].slice(0,3);
    if (allItems.length === 0) {
        return '<li>The room gets quiet. Everyone can feel the twist coming.</li>';
    }
    return allItems.map(item => `<li>${item}</li>`).join('');
}

function formatPlayerNameInSocialText(text){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  let html=escapeHtml(text||'');
  if(player?.name){
    const name=escapeHtml(player.name);
    html=html.split(name).join(`<strong>${name} <span class="player-crown" title="Your queen">${typeof icon==='function'?icon('crown'):'👑'}</span></strong>`);
  }
  return html;
}

function smackdownStrategyOptionsHtml(){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  // v31.6: shared list (all strategies use the Lip Sync attribute). Overshadow / Match her energy need a single opponent.
  return lipSyncStrategyButtonsHtml({q:player,attr:'data-smack-strategy',variant:'short',exclude:['overshadow','match_energy','signature_move']});
}
function renderLalaparuzaStrategyChoice(){
  setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader('Lip Sync Smackdown','LALAPARUZA','danger','The queens must lip sync for their survival.')}</div>${lalaparuzaIntroContext()}<div class="card important decision-card"><h3>Your lip sync strategy</h3><p>Choose how you will fight before the bracket begins.</p>${smackdownStrategyOptionsHtml()}</div></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderLalaparuzaStrategyChoice));
  document.querySelectorAll('[data-smack-strategy]').forEach(btn=>btn.addEventListener('click',()=>{
    gameState.currentEpisode.playerSmackdownStrategy=btn.dataset.smackStrategy;
    const result=resolveLalaparuza();
    renderLalaparuzaResult(result);
  }));
}

const TALENT_TYPE_CHOICES={
  music:{label:'Music',description:'Serve a banger or go home.',icon:'🎵'},
  vocals:{label:'Vocals',description:'Belt it or break it.',icon:'🎤'},
  performance:{label:'Performance',description:'Death drop or death flop.',icon:'💃'},
  stunt:{label:'Stunt',description:'Risk it for the biscuit.',icon:'🤸'},
  comedy:{label:'Comedy',description:'Make us gag or get gagged.',icon:'😂'},
  theatre:{label:'Theatre',description:'Give us drama, darling.',icon:'📖'},
  variety:{label:'Variety',description:'Surprise us or bore us.',icon:'🎩'},
  acting:{label:'Acting',description:'Emmy or flop? You decide.',icon:'🎭'},
  camp:{label:'Camp',description:'Own the cringe or become it.',icon:'🏕️'},
  runway:{label:'Runway',description:'Walk, pose, slay.',icon:'👠'},
  weird:{label:'Weird',description:"Weird works... or doesn't.",icon:'✨'}
};
function talentTypeIcon(type){
  return TALENT_TYPE_CHOICES[String(type||'performance').toLowerCase()]?.icon || '🌟';
}
function playerTalentEntry(ep){
  const id=gameState.playerQueenId;
  return (ep?.challengeContent?.talents||[]).find(t=>t.queenId===id);
}
function playerNeedsTalentChoice(ep){
  return !!(ep?.challengeType==='talent' && (typeof isPlayerInCurrentEpisode==='function'?isPlayerInCurrentEpisode():true) && !ep.playerTalentLocked);
}
function talentContentBlock(ep){
  const talents=ep.challengeContent?.talents||[];
  if(!talents.length)return '';
  return `<div class="card"><h3>Talent Show Lineup</h3><div class="talent-grid">${talents.map(t=>{const type=String(t.talent.type||'performance').toLowerCase(); const icon=typeof emojiIcon==='function'?emojiIcon(talentTypeIcon(type)):talentTypeIcon(type); const isPlayer=t.queenId===gameState.playerQueenId; return `<article class="queen-item talent-card ${isPlayer?'player-card':''}"><strong>${escapeHtml(t.queenName)}${isPlayer?` <span class="player-crown" title="Your queen">${typeof window.icon==='function'?window.icon('crown'):'👑'}</span>`:''}</strong><span class="talent-name">${icon} ${escapeHtml(t.talent.name||t.talent)}</span><span class="badge arc">${escapeHtml(type)}</span></article>`;}).join('')}</div></div>`;
}
function lockPlayerTalentChoice(type){
  const ep=gameState.currentEpisode;
  if(!ep?.challengeContent)return;
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const talent=(typeof pickTalentShowPerformanceByType==='function')?pickTalentShowPerformanceByType(type):{name:'Signature performance',type};
  let talents=ep.challengeContent.talents||[];
  const idx=talents.findIndex(t=>t.queenId===gameState.playerQueenId);
  const entry={queenId:gameState.playerQueenId,queenName:player?.name||'Your queen',talent:{...talent,type:String(talent.type||type).toLowerCase()}};
  if(idx>=0)talents[idx]=entry; else talents.unshift(entry);
  ep.challengeContent.talents=talents;
  ep.playerTalentType=entry.talent.type;
  ep.playerTalentName=entry.talent.name;
  ep.playerTalentLocked=true;
  saveGame();
}
function renderTalentChoice(){
  const ep=gameState.currentEpisode;
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const buttons=Object.entries(TALENT_TYPE_CHOICES).map(([id,o])=>`<button class="option" data-talent-type="${id}"><span class="choice-emoji" aria-hidden="true">${o.icon}</span><span class="choice-copy"><strong>${escapeHtml(o.label)}</strong><span class="small">${escapeHtml(o.description)}</span></span></button>`).join('');
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero"><span class="badge">Episode ${ep.number}</span><h2>Choose Your Talent</h2><p>Before RuPaul announces the Talent Show lineup, decide what ${escapeHtml(player?.name||'your queen')} will perform.</p></div>
    ${challengeContentBlock(ep)}
    <div class="card decision-card"><h3>Your Talent Show category</h3><p>Tonight is your chance to prove why you belong here. Decide what kind of talent you'll perform and own the spotlight.</p><div class="options">${buttons}</div></div>
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderTalentChoice));
  document.querySelectorAll('[data-talent-type]').forEach(btn=>btn.addEventListener('click',()=>{
    lockPlayerTalentChoice(btn.dataset.talentType);
    renderWorkroom();
  }));
}
function lalaparuzaIntroContext(){
  const ep=gameState.currentEpisode;
  ensureAllQueenV14Stats();
  if(!ep.lalaparuzaIntroGenerated){
    applyWeeklyWearAndTear();
    generateWorkroomSocialEvents();
    generateNpcSocialEvents('workroom');
    evolveRelationshipsDuringEpisode();
    ep.lalaparuzaIntroGenerated=true;
    saveGame();
  }
  const npcEvents=ep.npcSocialEvents||[];
  const narrativeEvent=(typeof narrativeEventForEpisode==='function')?narrativeEventForEpisode('workroom'):null;
  const visibleDriftNotes=selectVisibleRelationshipShiftNotes(ep.relationshipDriftNotes||[]);
const productionEvent = (ep.events || [])
  .filter(e => e && e.text && !['runway','judging'].includes(e.type));

const mainEvent = productionEvent.length
  ? productionEvent.map(e => formatPlayerNameInSocialText(e.text))
  : [];

const otherPulse = buildWorkroomPulse(
  [
    ...(ep.socialEvents || []),
    ...npcEvents,
    ...(narrativeEvent ? [narrativeEvent] : [])
  ],
  visibleDriftNotes
);

const workroomPulse = [
  ...mainEvent.map(item => `<li>${item}</li>`),
  otherPulse
].join('');
  
  const activeNames=(ep.participantIds||[]).map(id=>gameState.queens.find(q=>q.id===id)?.name).filter(Boolean).map(escapeHtml).join(', ');
  return `<div class="card"><h3>Workroom</h3><p>The queens enter knowing tonight is not a normal challenge. Every lipstick, heel, and hair flip could become survival.</p><h4>Interactions</h4><p><em>What you're picking up from the room...</em></p><ul>${workroomPulse}</ul>${activeNames?`<h4>Competing queens</h4><p>${activeNames}</p>`:''}</div>`;
}


function miniChallengeWorkroomLine(ep){
  if(!ep?.miniChallenge)return 'No mini challenge today. The dolls get straight to work.';
  const names=escapeHtml(ep.miniWinnerName||'a queen');
  const source=ep.teamFormation?.captainSource;
  if(source==='double_mini')return `A mini challenge took place. Winners: <strong>${names}</strong>. They became the team captains.`;
  if(source==='previous' || source==='previous_survivor')return `A mini challenge took place. Winner: <strong>${names}</strong>. Team captains were decided by last episode's results.`;
  return `A mini challenge took place. Winner: <strong>${names}</strong>.`;
}

function teamFormationBlock(ep){
  if(!ep?.teams?.length || !ep.teamFormation)return '';
  const tf=ep.teamFormation;
  const q=id=>gameState.queens.find(x=>x.id===id);
  const method=(typeof normalizeTeamFormationMethod==='function')?normalizeTeamFormationMethod(tf.method):((tf.method==='mini_captains'||tf.method==='previous_winner')?'captains':tf.method);
  const caption=tf.autoChosen?'<p class="small">Teams were completed automatically.</p>':'';
  const captainLine=(method==='captains' && tf.captainIds?.length)
    ? `<p><strong>Captains:</strong> ${tf.captainIds.map(id=>queenTeamNameHtml(q(id))).join(' vs ')}</p>` : '';
  const chooserLine=(method==='captains' && tf.chooserId && !tf.captainIds?.length)
    ? `<p><strong>Power:</strong> ${queenTeamNameHtml(q(tf.chooserId))}</p>` : '';
  const draft=(method==='captains' && Array.isArray(tf.pickOrder) && tf.pickOrder.length)
    ? `<h4>Draft order</h4><ol class="draft-order">${tf.pickOrder.map(p=>p.leftover
      ? `<li>${queenTeamNameHtml(q(p.queenId))} joined ${escapeHtml(teamNameForStructure(ep.structure,[],p.teamIndex))}</li>`
      : `<li>${queenTeamNameHtml(q(p.captainId))} picked ${queenTeamNameHtml(q(p.queenId))}</li>`).join('')}</ol>` : '';
  const finalTeams=`<h4>Final teams</h4><div class="team-preview">${(ep.teams||[]).map(t=>`<p><strong>${escapeHtml(t.name)}</strong>: ${(t.queenIds||[]).map(id=>queenTeamNameHtml(q(id))).join(', ')}</p>`).join('')}</div>`;
  return `<div class="card"><h3>${escapeHtml(tf.title||'Team Formation')}</h3><p>${escapeHtml(tf.description||'')}</p>${captainLine}${chooserLine}${draft}${finalTeams}${caption}</div>`;
}
function renderTeamFormationStep(){
  const ep=gameState.currentEpisode;
  if(!ep?.teamFormation?.pending){return renderWorkroom();}
  const active=(ep.participantIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const tf=ep.teamFormation;
  const method=(typeof normalizeTeamFormationMethod==='function')?normalizeTeamFormationMethod(tf.method):((tf.method==='mini_captains'||tf.method==='previous_winner')?'captains':tf.method);
  const source=(typeof normalizeCaptainSource==='function')?normalizeCaptainSource(tf,tf.method):(tf.captainSource || (tf.method==='previous_winner'?'previous':'mini'));
  const sizes=tf.targetSizes&&tf.targetSizes.length?tf.targetSizes:teamStructureTargetSizes(ep.structure,active);
  const qName=id=>gameState.queens.find(q=>q.id===id)?.name||'a queen';
  const header=`<main class="layout"><section class="screen"><div class="hero"><span class="badge">Episode ${ep.number}</span><h2>Team Formation</h2><p>${escapeHtml(tf.title||'Team Formation')}</p><p>${escapeHtml(tf.description||'')}</p></div>`;
  const footer=`</section>${queenSidebar()}</main>`;
  const autoButton=`<button id="autoFormation" class="secondary">Choose Automatically</button>`;
  if(method==='captains'){
    const captainIds=(tf.captainIds||[]).slice();
    if(captainIds.length<2){
      const candidates=active.filter(q=>q.id!==gameState.playerQueenId);
      const text=source==='previous'
        ? 'You won the previous episode. Pick the queen who will lead the opposing team.'
        : 'You won the mini-challenge. Pick the queen who will lead the opposing team.';
      setHTML(`${header}<div class="card"><h3>Choose the other captain</h3><p>${escapeHtml(text)}</p><div class="options">${candidates.map(q=>`<button class="option pickCaptain" data-id="${q.id}">${queenPortraitHtml(q,'sm')}<strong>${escapeHtml(q.name)}</strong></button>`).join('')}${autoButton}</div></div>${footer}`);
      bindCommon(()=>showHistory(renderTeamFormationStep));
      document.querySelectorAll('.pickCaptain').forEach(btn=>btn.addEventListener('click',()=>{tf.captainIds=[gameState.playerQueenId,btn.dataset.id]; tf.pickOrder=[]; saveGame(); renderTeamFormationStep();}));
      document.querySelector('#autoFormation')?.addEventListener('click',()=>{const second=autoPickTeamCaptain(gameState.playerQueenId,candidates); tf.captainIds=[gameState.playerQueenId,second?.id].filter(Boolean); tf.pickOrder=[]; saveGame(); renderTeamFormationStep();});
      return;
    }
    const initial=sizes.map(()=>[]);
    captainIds.slice(0,2).forEach((id,i)=>{if(initial[i])initial[i].push(id);});
    const groups=(tf.playerGroups&&tf.playerGroups.length)?tf.playerGroups.map(g=>g.slice()):initial;
    const draftTeamCount=Math.min(2,groups.length);
    const openDraftIndex=()=>{
      for(let offset=0; offset<draftTeamCount; offset++){
        const idx=((tf.nextDraftTeamIndex||0)+offset)%draftTeamCount;
        if(groups[idx].length<sizes[idx])return idx;
      }
      return -1;
    };
    let currentIdx=openDraftIndex();
    if(currentIdx<0){
      let pool=active.filter(q=>!groups.flat().includes(q.id));
      for(let i=draftTeamCount;i<groups.length;i++){
        while(groups[i].length<sizes[i] && pool.length){
          const pick=pool.shift();
          groups[i].push(pick.id);
          tf.pickOrder=tf.pickOrder||[];
          tf.pickOrder.push({captainId:null,teamIndex:i,queenId:pick.id,auto:true,leftover:true});
        }
      }
      finalizeCurrentEpisodeTeams(teamsFromIdGroups(groups,ep.structure),false); return renderWorkroom();
    }
    const currentCaptainId=groups[currentIdx][0];
    const isPlayerTurn=currentCaptainId===gameState.playerQueenId;
    if(!isPlayerTurn){
      const pool=active.filter(q=>!groups.flat().includes(q.id));
      const pick=autoPickTeammate(currentCaptainId,groups[currentIdx],pool);
      if(pick){groups[currentIdx].push(pick.id); tf.pickOrder=tf.pickOrder||[]; tf.pickOrder.push({captainId:currentCaptainId,teamIndex:currentIdx,queenId:pick.id,auto:true});}
      tf.nextDraftTeamIndex=(currentIdx+1)%draftTeamCount;
      tf.playerGroups=groups; saveGame(); return renderTeamFormationStep();
    }
    const pool=active.filter(q=>!groups.flat().includes(q.id));
    setHTML(`${header}<div class="card"><h3>Schoolyard Pick</h3><p>${escapeHtml(qName(captainIds[0]))} and ${escapeHtml(qName(captainIds[1]))} are captains. Choose your next teammate.</p><div class="team-preview">${groups.map((g,i)=>`<p><strong>${escapeHtml(teamNameForStructure(ep.structure,g,i))}</strong>${i>=draftTeamCount?' <span class="small">remaining queens</span>':''}: ${g.map(id=>queenTeamNameHtml(gameState.queens.find(q=>q.id===id))).join(', ')||'<span class="small">empty</span>'}</p>`).join('')}</div><div class="options">${pool.map(q=>`<button class="option pickMate" data-id="${q.id}">${queenPortraitHtml(q,'sm')}<strong>${escapeHtml(q.name)}</strong></button>`).join('')}${autoButton}</div></div>${footer}`);
    bindCommon(()=>showHistory(renderTeamFormationStep));
    document.querySelectorAll('.pickMate').forEach(btn=>btn.addEventListener('click',()=>{groups[currentIdx].push(btn.dataset.id); tf.pickOrder=tf.pickOrder||[]; tf.pickOrder.push({captainId:currentCaptainId,teamIndex:currentIdx,queenId:btn.dataset.id,auto:false}); tf.nextDraftTeamIndex=(currentIdx+1)%draftTeamCount; tf.playerGroups=groups; saveGame(); renderTeamFormationStep();}));
    document.querySelector('#autoFormation')?.addEventListener('click',()=>{const pickOrder=[]; const teams=autoAssignAllTeams(ep.structure,active,'captains',{captainIds,pickOrder}); tf.pickOrder=pickOrder; finalizeCurrentEpisodeTeams(teams,true); renderWorkroom();});
    return;
  }
  if(method==='free_choice' && active.some(q=>q.id===gameState.playerQueenId)){
    // v31.6: the player picks her own partner(s); queens who dislike her say no
    const pid=gameState.playerQueenId;
    const mine=(tf.playerTeam&&tf.playerTeam.length)?tf.playerTeam.slice():[pid];
    const need=sizes[0]||2;
    const willing=id=>(Number(gameState.relationships?.[id]?.[pid]?.affinity)||0)>-20;
    if(mine.length<need){
      const pool=active.filter(q=>!mine.includes(q.id)).sort((a,b)=>(Number(gameState.relationships?.[b.id]?.[pid]?.affinity)||0)-(Number(gameState.relationships?.[a.id]?.[pid]?.affinity)||0));
      const label=ep.structure?.id==='duos'?'Choose your partner':'Choose your teammates';
      const rows=pool.map(q=>{const ok=willing(q.id);return `<button class="option pickFree" data-id="${q.id}" ${ok?'':'disabled aria-disabled="true"'}><span class="choice-emoji">${typeof moodIconHtml==='function'?moodIconHtml(q.id):''}</span><span class="choice-copy"><strong>${escapeHtml(q.name)}</strong><span class="small">${ok?escapeHtml(q.type||''):'Not working with you this week.'}</span></span></button>`;}).join('');
      setHTML(`${header}<div class="card decision-card"><h3>${label}</h3><p>The queens split up on their own. Pick who you want next to you${need>2?` (${mine.length}/${need})`:''}. Queens who can't stand you will say no.</p>${mine.length>1?`<p class="small">Your team so far: ${mine.map(id=>escapeHtml(qName(id))).join(', ')}</p>`:''}<div class="options">${rows}</div><div class="tv-nav">${autoButton}</div></div>${footer}`);
      bindCommon(()=>showHistory(renderTeamFormationStep));
      document.querySelectorAll('.pickFree').forEach(btn=>btn.addEventListener('click',()=>{tf.playerTeam=[...mine,btn.dataset.id];saveGame();renderTeamFormationStep();}));
      document.querySelector('#autoFormation')?.addEventListener('click',()=>{finalizeCurrentEpisodeTeams(autoAssignAllTeams(ep.structure,active,'free_choice',{}),true);renderWorkroom();});
      return;
    }
    // the rest of the cast splits up by affinity around the player's team
    const groups=[mine,...sizes.slice(1).map(()=>[])];
    let pool=shuffle(active.filter(q=>!mine.includes(q.id)));
    for(let gi=1;gi<groups.length;gi++){
      while(groups[gi].length<sizes[gi] && pool.length){
        let pick;
        if(!groups[gi].length)pick=pool.shift();
        else{pick=pool.slice().sort((a,b)=>groups[gi].reduce((s2,id)=>s2+relationshipScoreBetween(id,b.id),0)-groups[gi].reduce((s2,id)=>s2+relationshipScoreBetween(id,a.id),0))[0];pool=pool.filter(q=>q.id!==pick.id);}
        groups[gi].push(pick.id);
      }
    }
    while(pool.length)groups[groups.length-1].push(pool.shift().id);
    finalizeCurrentEpisodeTeams(teamsFromIdGroups(groups,ep.structure),false);
    return renderWorkroom();
  }
  finalizeCurrentEpisodeTeams(autoAssignAllTeams(ep.structure,active,method,{captainIds:tf.captainIds}),true);
  renderWorkroom();
}

function lalaparuzaSongIcons(song){
  if(typeof lipSyncEnergyLabel==='function')return lipSyncEnergyLabel(song);
  const energy=String(song?.energy||'').toLowerCase();
  if(energy==='high')return '🔥 🔥 🔥 🔥 🔥';
  if(energy==='medium')return '✨ ✨ ✨';
  if(energy==='low')return '🕯️';
  return '';
}
function lipSyncSongCard(song){
  if(!song)return '';
  const icons=lalaparuzaSongIcons(song);
  const title=escapeHtml(song.title||'Lip Sync Song');
  const artist=song.artist?` by ${escapeHtml(song.artist)}`:'';
  return `<div class="song-card compact-song-card"><h4>${title}${artist}</h4>${icons?`<p class="song-icons" aria-label="Song intensity">${icons}</p>`:''}</div>`;
}
function smackdownResultObjectFromDuel(d){
  if(!d)return {outcome:'bottomElimination',results:[],survivorId:null,eliminatedQueenId:null,song:null,difference:0,lalaparuzaDuel:null};
  const results=(d.queenIds||[]).map(id=>{
    const q=gameState.queens.find(x=>x.id===id)||{id,name:qName(id)};
    const strategy=d.strategy?.[id] || d.strategyByQueenId?.[id] || 'sell_lyrics';
    const score=Number(d.scores?.[id]||0);
    return {
      queenId:id,
      name:q.name||qName(id),
      score10:Math.round(score*10)/10,
      score:Math.round(score*10)/10,
      moves:(typeof lipSyncMovesFromStrategy==='function')?lipSyncMovesFromStrategy(strategy,d.song):{strategy},
      strategy,
      strategyLabel:(typeof lipSyncStrategyLabel==='function')?lipSyncStrategyLabel(strategy):(d.strategyLabels?.[id]||strategy),
      weeklyPerformance:Math.round(score*10)/10,
      executionQuality:Math.round(score*10)/10
    };
  }).sort((a,b)=>b.score10-a.score10);
  const diff=results.length>=2?Math.abs(results[0].score10-results[1].score10):0;
  return {
    outcome:'bottomElimination',
    results,
    survivorId:d.winnerId,
    eliminatedQueenId:d.loserId,
    song:d.song,
    difference:diff,
    lalaparuzaDuel:d
  };
}
function smackdownLipSyncResultCard(d,{final=false,returnSmackdown=false,reveal=true}={}){
  if(!d){
    const fallback=latestReturnSmackdownDuelFrom(null);
    if(fallback)d=fallback;
    else return '<div class="card important"><h3>Lip Sync Smackdown</h3><p>The duel has already been resolved.</p></div>';
  }
  const result=smackdownResultObjectFromDuel(d);
  const oldSong=gameState.currentEpisode?.song;
  if(gameState.currentEpisode)gameState.currentEpisode.song=d.song;
  const songTitle=escapeHtml(d.song?.title||'Lip Sync Song');
  const artist=d.song?.artist?`by ${escapeHtml(d.song.artist)}`:'';
  const hero=`<div class="hero tv-ls-hero">${bigMomentHeader('The music starts...', final?'LIP SYNC FOR YOUR LIFE':'LIP SYNC SMACKDOWN', final?'danger':'win')}<h2>${songTitle}</h2>${artist?`<p>${artist}</p>`:''}<h3 class="music-cue spotlight-cue">${lalaparuzaSongIcons(d.song)}</h3></div>`;
  const battle=`<div class="card music-card lipsync-battle-card"><h3 class="music-cue spotlight-cue">${lalaparuzaSongIcons(d.song)}</h3>${typeof lipSyncResultPortraits==='function'?lipSyncResultPortraits(result):''}<div class="commentary-block">${typeof lipSyncNarrative==='function'?lipSyncNarrative(result):`<p>${escapeHtml(d.resultText||'The lip sync is decided.')}</p>`}</div></div>`;
  let decision='';
  if(final){
    decision=(typeof lipSyncDecisionCards==='function'?lipSyncDecisionCards(result):`<div class="card important"><p><strong>${escapeHtml(qName(d.winnerId))}</strong>, shantay you stay.</p><p><strong>${escapeHtml(qName(d.loserId))}</strong>, sashay away.</p></div>`)
      +(typeof finalAmenCard==='function'?finalAmenCard():'');
  }else{
    const winner=gameState.queens.find(q=>q.id===d.winnerId);
    const loser=gameState.queens.find(q=>q.id===d.loserId);
    const loserLine=returnSmackdown?'You are out of the smackdown.':'I\'m sorry, my dear. You will have to lip sync again for your life.';
    decision=`<div class="card lipsync-ru-card important"><h3>RuPaul</h3><p>${typeof rupaulDecisionIntro==='function'?escapeHtml(rupaulDecisionIntro()):'I made my decision...'}</p></div>
      ${typeof impactQueenCard==='function'?impactQueenCard(winner,returnSmackdown?'ADVANCE':'SAFE',returnSmackdown?'Condragulations!':'You are safe.',returnSmackdown?'shantay':'shantay',returnSmackdown?'<p>You advance to the next round.</p>':'<p>You won this lip sync.</p>'):`<div class="card important"><p><strong>${escapeHtml(qName(d.winnerId))}</strong> ${returnSmackdown?'advances.':'is safe.'}</p></div>`}
      ${typeof impactQueenCard==='function'?impactQueenCard(loser,returnSmackdown?'OUT':'STILL IN DANGER',returnSmackdown?"I'm sorry my dear.":loserLine,returnSmackdown?'sashay':'safe',returnSmackdown?'<p>This is not your moment, now sashay away.</p>':''):`<div class="card"><p><strong>${escapeHtml(qName(d.loserId))}</strong> ${escapeHtml(returnSmackdown?"I'm sorry my dear. This is not your moment, now sashay away.":loserLine)}</p></div>`}`;
  }
  if(gameState.currentEpisode)gameState.currentEpisode.song=oldSong;
  return hero+battle+(reveal?decision:'');
}
function renderLalaparuzaDuelResult(d){
  const result=initLalaparuzaState(gameState.currentEpisode);
  const isComplete=result.phase==='complete';
  setHTML(`<main class="layout"><section class="screen">${smackdownLipSyncResultCard(d,{final:!!d.isFinal})}<button id="continueAfterDuel">${d.isFinal?'See all Lalaparuza results':'Continue Lalaparuza'}</button></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(()=>renderLalaparuzaDuelResult(d)));
  document.querySelector('#continueAfterDuel')?.addEventListener('click',()=>{ if(isComplete)renderLalaparuzaResult(resolveLalaparuza()); else renderLalaparuzaEpisode(); });
}
function latestReturnSmackdownDuelFrom(value){
  if(value?.queenIds?.length)return value;
  const rounds=value?.rounds || gameState.currentEpisode?.returnSmackdownResult?.rounds || gameState.season?.returnAnnouncement?.smackdown?.rounds || gameState.currentEpisode?.returnSmackdownState?.rounds || [];
  for(let i=rounds.length-1;i>=0;i--){
    const duels=rounds[i]?.duels || [];
    for(let j=duels.length-1;j>=0;j--){
      if(duels[j]?.queenIds?.length)return duels[j];
    }
  }
  return null;
}
function currentReturnSmackdownFinalResult(fallback=null){
  const ep=gameState.currentEpisode;
  if(ep?.returnSmackdownResult)return ep.returnSmackdownResult;
  if(gameState.season?.reunionResult && (ep?.reunionOnly || ep?.challengeType==='reunion_smackdown'))return gameState.season.reunionResult;
  if(gameState.season?.returnAnnouncement?.smackdown)return gameState.season.returnAnnouncement.smackdown;
  const st=ep?.returnSmackdownState;
  if(st?.phase==='complete' && st.winnerId){
    const result={type:st.type,mode:st.mode,rounds:st.rounds||[],winnerId:st.winnerId,usedSongs:st.usedSongs||[]};
    ep.returnSmackdownResult=result;
    gameState.season.returnAnnouncement=gameState.season.returnAnnouncement||{};
    gameState.season.returnAnnouncement.smackdown=result;
    saveGame();
    return result;
  }
  return fallback?.rounds ? fallback : resolveReturnSmackdown();
}
function completeReturnSmackdownAndShow(chosen){
  const outcome=completeReturnSmackdownDuel(chosen);
  if(!outcome)return renderReturnSmackdownEpisode();
  const duel=latestReturnSmackdownDuelFrom(outcome);
  if(duel)return renderReturnSmackdownDuelResult(duel);
  return renderReturnSmackdownResult(currentReturnSmackdownFinalResult(outcome));
}
function renderReturnSmackdownDuelResult(d,reveal=false){
  const st=initReturnSmackdownState(gameState.currentEpisode);
  const isComplete=st.phase==='complete';
  const safeDuel=d || latestReturnSmackdownDuelFrom(null);
  if(!safeDuel && isComplete)return renderReturnSmackdownResult(currentReturnSmackdownFinalResult());
  setHTML(`<main class="layout"><section class="screen">${smackdownLipSyncResultCard(safeDuel,{returnSmackdown:true,reveal})}<button id="continueAfterReturnDuel">${!reveal?'Reveal the result':(isComplete?'See Smackdown result':'Continue Smackdown')}</button></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(()=>renderReturnSmackdownDuelResult(safeDuel)));
  document.querySelector('#continueAfterReturnDuel')?.addEventListener('click',()=>{ if(!reveal)renderReturnSmackdownDuelResult(safeDuel,true); else if(isComplete)renderReturnSmackdownResult(currentReturnSmackdownFinalResult()); else renderReturnSmackdownEpisode(); });
}
function autoAdvanceSmackdownStep(fn,delay=900){
  window.setTimeout(()=>{ try{ fn(); }catch(e){ console.error(e); } },delay);
}
function strategyButtonsForQueen(q,song,prefix){
  return `<div class="strategy-pick" data-queen="${q.id}">${lipSyncStrategyButtonsHtml({q,song,attr:'data-strategy',exclude:['match_energy','signature_move']})}</div>`;
}
function strategyRevealLine(q,song,strategyId){
  return '';
}
function autoStrategyMapForDuel(queenIds,song){
  const chosen={};
  (queenIds||[]).forEach(id=>{
    const q=gameState.queens.find(x=>x.id===id);
    if(q) chosen[id]=autoLipSyncStrategy(q,song);
  });
  return chosen;
}
function renderLalaparuzaEpisode(){
  const ep=gameState.currentEpisode;
  const st=initLalaparuzaState(ep);
  const playerId=gameState.playerQueenId;
  const showIntro=st.phase==='draw' && (st.duels||[]).length===0;
  const header=`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader('Lip Sync Smackdown','LALAPARUZA','danger','The queens must lip sync for their survival.')}</div>${showIntro?lalaparuzaIntroContext():''}`;
  const footer=`</section>${queenSidebar()}</main>`;
  const qById=id=>gameState.queens.find(q=>q.id===id);
  if(st.phase==='complete')return renderLalaparuzaResult(resolveLalaparuza());
  if(st.phase==='draw' && ep.lalaparuzaPendingChoice){
    const pending=ep.lalaparuzaPendingChoice;
    if(pending && pending.callerId && pending.opponentId){
      return renderLalaparuzaSongChoice(pending.callerId,pending.opponentId);
    }
  }
  if(st.phase==='strategy' && st.currentDuel){
    const d=st.currentDuel, a=qById(d.callerId), b=qById(d.opponentId);
    const queenIds=[d.callerId,d.opponentId];
    const playerInDuel=queenIds.includes(playerId);
    if(!d.strategyByQueenId)d.strategyByQueenId={};
    for(const id of queenIds.filter(id=>id!==playerId)){
      if(!d.strategyByQueenId[id])d.strategyByQueenId[id]=autoLipSyncStrategy(qById(id),d.song);
    }
    saveGame();
    const autoChosen=Object.assign({},d.strategyByQueenId);
    const npcLines='';
    const player=qById(playerId);
    const finalCopy=d.isFinal
      ? `<p>The last song is on the stage. No draw, no callout, no song choice.</p>`
      : `<p><strong>${escapeHtml(qName(d.callerId))}</strong> was drawn and chose <strong>${escapeHtml(qName(d.opponentId))}</strong>.</p><p><strong>${escapeHtml(qName(d.opponentId))}</strong> chooses the song.</p>`;
    const playerPicker=(playerInDuel && player)?`<div class="card decision-card important"><h3>Lip Sync Strategy</h3><p>You are in the Lalaparuza. Choose the story you want to tell on stage.</p>${strategyButtonsForQueen(player,d.song,'player')}</div>`:`<div class="card subtle"><h3>Lip Sync</h3><button id="runCurrentLalaNpc">Watch lip sync</button></div>`;
    setHTML(`${header}<div class="card important"><h3>${escapeHtml(d.stageLabel || (d.isFinal?'Final Duel':`Round ${d.round}`))}</h3>${finalCopy}${lipSyncSongCard(d.song)}<div class="lala-duel">${a?queenPortraitHtml(a,'md'):''}<span class="vs">VS</span>${b?queenPortraitHtml(b,'md'):''}</div></div>${playerPicker}${footer}`);
    bindCommon(()=>showHistory(renderLalaparuzaEpisode));
    const chosen=Object.assign({},autoChosen);
    if(playerInDuel){
      document.querySelectorAll('[data-strategy]').forEach(btn=>btn.addEventListener('click',()=>{chosen[playerId]=btn.dataset.strategy; const duel=completeLalaparuzaDuel(chosen); if(duel?.duels)renderLalaparuzaDuelResult(duel.final); else renderLalaparuzaDuelResult(duel);}));
    }else{
      document.querySelector('#runCurrentLalaNpc')?.addEventListener('click',()=>{const duel=completeLalaparuzaDuel(chosen); if(duel?.duels)renderLalaparuzaDuelResult(duel.final); else renderLalaparuzaDuelResult(duel);});
    }
    return;
  }
  const active=st.activeQueenIds.map(qById).filter(Boolean);
  const isFinal=st.stage==='final';
  const drawn=(st.drawnQueenId? qById(st.drawnQueenId):sample(active));
  st.drawnQueenId=drawn?.id;
  if(drawn?.id)saveGame();
  const opponents=active.filter(q=>q.id!==drawn?.id);
  const history=(st.duels||[]).length?`<div class="card"><h3>History</h3>${st.duels.map(d=>`<p><strong>${escapeHtml(d.stageLabel||('Round '+d.round))}:</strong> ${escapeHtml(qName(d.winnerId))} won to ${escapeHtml(d.song?.title||'the song')}. ${escapeHtml(d.resultText||'')}</p>`).join('')}</div>`:'';
  if(isFinal){
    const finalCaller=active[0]?.id;
    const finalOpponent=active[1]?.id;
    beginLalaparuzaDuel(finalCaller,finalOpponent,0);
    return renderLalaparuzaEpisode();
  }
  if(drawn?.id!==playerId){
    const opponentId=lalaparuzaAutoOpponent(drawn.id);
    return renderLalaparuzaSongChoice(drawn.id,opponentId);
  }
  setHTML(`${header}${history}<div class="card"><h3>${escapeHtml((typeof lalaparuzaStageLabel==='function' ? lalaparuzaStageLabel(st.stage) : `Round ${st.duels.length+1}`))}</h3><p>A queen was drawn: <strong>${escapeHtml(drawn?.name||'')}</strong></p><h4>Choose your opponent</h4><div class="options"><button class="option" id="autoOpponent"><strong>Choose Automatically</strong><span class="small">Use NPC callout logic for your queen.</span></button>${opponents.map(q=>`<button class="option pickOpponent" data-id="${q.id}">${queenPortraitHtml(q,'sm')}<strong>${escapeHtml(q.name)}</strong></button>`).join('')}</div></div>${footer}`);
  bindCommon(()=>showHistory(renderLalaparuzaEpisode));
  const chooseOpponent=(opponentId)=>{ep.lalaparuzaPendingChoice={callerId:drawn.id,opponentId}; saveGame(); renderLalaparuzaSongChoice(drawn.id,opponentId);};
  document.querySelector('#autoOpponent')?.addEventListener('click',()=>chooseOpponent(lalaparuzaAutoOpponent(drawn.id)));
  document.querySelectorAll('.pickOpponent').forEach(btn=>btn.addEventListener('click',()=>chooseOpponent(btn.dataset.id)));
}
function renderLalaparuzaSongChoice(callerId,opponentId){
  const ep=gameState.currentEpisode, st=initLalaparuzaState(ep);
  const playerId=gameState.playerQueenId;
  const caller=qName(callerId), opponent=qName(opponentId), stageLabel=(typeof lalaparuzaStageLabel==='function'?lalaparuzaStageLabel(st.stage):'Lalaparuza');
  if(opponentId!==playerId){
    const pending=ep.lalaparuzaPendingChoice || {};
    let songIndex=(pending.callerId===callerId && pending.opponentId===opponentId && pending.songIndex!==undefined)?Number(pending.songIndex):lalaparuzaAutoSong(opponentId);
    const song=st.availableSongs[songIndex] || st.availableSongs[0];
    ep.lalaparuzaPendingChoice={callerId,opponentId,songIndex};
    saveGame();
    setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader('Lip Sync Smackdown','LALAPARUZA','danger','The queens must lip sync for their survival.')}</div><div class="card important"><h3>${escapeHtml(stageLabel)}</h3><p>A queen was drawn: <strong>${escapeHtml(caller)}</strong>.</p><p><strong>${escapeHtml(caller)}</strong> chooses <strong>${escapeHtml(opponent)}</strong>.</p><p><strong>${escapeHtml(opponent)}</strong> chooses the song.</p>${lipSyncSongCard(song)}</div></section>${queenSidebar()}</main>`);
    bindCommon(()=>showHistory(renderLalaparuzaEpisode));
    document.querySelector('.card.important')?.insertAdjacentHTML('beforeend','<button id="continueNpcSong">Continue to lip sync</button>');
    document.querySelector('#continueNpcSong')?.addEventListener('click',()=>{delete ep.lalaparuzaPendingChoice; beginLalaparuzaDuel(callerId,opponentId,songIndex); const st2=initLalaparuzaState(gameState.currentEpisode); const chosen=autoStrategyMapForDuel(st2.currentDuel?.queenIds||[callerId,opponentId],song); const duel=completeLalaparuzaDuel(chosen); if(duel?.duels)renderLalaparuzaDuelResult(duel.final); else renderLalaparuzaDuelResult(duel);});
    return;
  }
  setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader('Lip Sync Smackdown','LALAPARUZA','danger','The queens must lip sync for their survival.')}</div><div class="card important"><h3>${escapeHtml(stageLabel)}</h3><p><strong>${escapeHtml(caller)}</strong> was drawn and chose you.</p><p>You were chosen, so choose your song.</p><div class="options"><button class="option" id="autoSong"><strong>Choose Automatically</strong><span class="small">Use song-choice logic for your queen.</span></button>${st.availableSongs.map((song,i)=>`<button class="option pickSong" data-index="${i}">${lipSyncSongCard(song)}</button>`).join('')}</div></div></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderLalaparuzaEpisode));
  document.querySelector('#autoSong')?.addEventListener('click',()=>{delete ep.lalaparuzaPendingChoice; beginLalaparuzaDuel(callerId,opponentId,lalaparuzaAutoSong(opponentId)); renderLalaparuzaEpisode();});
  document.querySelectorAll('.pickSong').forEach(btn=>btn.addEventListener('click',()=>{delete ep.lalaparuzaPendingChoice; beginLalaparuzaDuel(callerId,opponentId,Number(btn.dataset.index)); renderLalaparuzaEpisode();}));
}
function renderLalaparuzaResult(result){
  const queenById=(id)=>gameState.queens.find(q=>q.id===id);
  const lalaQueenChip=(id,mark='')=>{
    const q=queenById(id);
    return `<div class="lala-queen-chip ${mark?`lala-${mark}`:''}">${q?queenPortraitHtml(q,'md'):''}<strong>${escapeHtml(qName(id))}</strong>${mark?`<span class="small">${escapeHtml(mark)}</span>`:''}</div>`;
  };
  const duelHtml=(d)=>`<div class="lala-duel-block">${lipSyncSongCard(d.song)}<div class="lala-duel">
    ${lalaQueenChip(d.queenIds[0], d.winnerId===d.queenIds[0]?'wins':d.loserId===d.queenIds[0]?'moves on':'')}
    <span class="vs">VS</span>
    ${lalaQueenChip(d.queenIds[1], d.winnerId===d.queenIds[1]?'wins':d.loserId===d.queenIds[1]?'moves on':'')}
  </div></div>`;
  const rows=result.rounds.map(r=>`<div class="card lala-round-card"><h3>Round ${r.round}</h3>${r.byeId?`<div class="lala-bye">${lalaQueenChip(r.byeId,'bye')}</div>`:''}<div class="lala-duel-list">${r.duels.map(duelHtml).join('')}</div></div>`).join('');
  const playerOut=result.eliminatedQueenId===gameState.playerQueenId;
  const spectatorMode=!!gameState.season?.spectatorMode;
  const eliminationChoiceBlock=(playerOut && !spectatorMode)
    ? `<div class="card important decision-card"><h3>What do you want to do now?</h3><p>Your queen has been eliminated in the Lalaparuza, but the season can continue without your input.</p><div class="options"><button class="option" id="continueSpectator"><span class="choice-emoji" aria-hidden="true">👁️</span><span class="choice-copy"><strong>Continue watching as a spectator</strong><span class="small">Follow the remaining episodes, reunion and finale.</span></span></button><button class="option" id="seeFinalResult"><span class="choice-emoji" aria-hidden="true">⏭️</span><span class="choice-copy"><strong>See final result</strong><span class="small">Skip the rest of the season and start the finale from page 1/3.</span></span></button></div></div>`
    : '';
  const continueButton=(playerOut && !spectatorMode) ? '' : `<button id="continue">Next episode</button>`;
  setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader('Lip Sync Smackdown','LALAPARUZA','danger','The queens must lip sync for their survival.')}</div>${rows}<div class="card important lala-final-card"><h3>Final Bottom Lip Sync</h3>${lipSyncSongCard(result.final.song)}<div class="lala-duel final">${lalaQueenChip(result.final.queenIds[0], result.final.winnerId===result.final.queenIds[0]?'survives':'sashay')}<span class="vs">VS</span>${lalaQueenChip(result.final.queenIds[1], result.final.winnerId===result.final.queenIds[1]?'survives':'sashay')}</div><p><strong>${escapeHtml(qName(result.final.winnerId))}</strong> survives the final lip sync. <strong>${escapeHtml(qName(result.final.loserId))}</strong> sashays away.</p></div>${eliminationChoiceBlock}${continueButton}</section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(()=>renderLalaparuzaResult(result)));
  const continueAfterLalaparuza=()=>{if(isFinaleReady()){if(shouldOfferReunionSmackdown())renderReunionSmackdown(); else {renderFinale();}}else{generateEpisode(); renderWorkroom();}};
  document.querySelector('#continue')?.addEventListener('click',continueAfterLalaparuza);
  document.querySelector('#continueSpectator')?.addEventListener('click',()=>{gameState.season.spectatorMode=true; saveGame(); continueAfterLalaparuza();});
  document.querySelector('#seeFinalResult')?.addEventListener('click',()=>{skipToFinaleStart();});
}

function renderReturnSmackdownEpisode(){
  const ep=gameState.currentEpisode;
  const st=initReturnSmackdownState(ep);
  const playerId=gameState.playerQueenId;
  const type=ep.returnSmackdownType || gameState.season?.returnTwist?.type || 'legacy_smackdown';
  const isReunion=type==='reunion_smackdown' || ep.challengeType==='reunion_smackdown' || ep.reunionOnly || gameState.season?.returnTwist?.reunionOnly;
  const isGauntlet=type==='redemption_smackdown'||type==='boot_order_gauntlet'||type==='elimination_order_gauntlet';
  const title=isReunion?'Queen of She Already Done Had Herses':(isGauntlet?'Boot Order Lip Sync Smackdown':'Lip Sync Smackdown Return');
  const qById=id=>gameState.queens.find(q=>q.id===id);
  const participants=(ep.participantIds||[]).map(qById).filter(Boolean);
  const names=participants.map(q=>escapeHtml(q.name)).join(', ');
  const header=`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader(title,isReunion?'REUNION':'RETURN TWIST','danger',isReunion?'The eliminated queens battle for one last title. No one returns to the competition.':'One eliminated queen can fight her way back into the competition.')}</div>`;
  const footer=`</section>${queenSidebar()}</main>`;
  const history=(st.rounds||[]).length?`<div class="card"><h3>Duel history</h3>${st.rounds.map(r=>(r.duels||[]).map(d=>`<details><summary>Round ${r.round}: ${escapeHtml(qName(d.queenIds[0]))} vs ${escapeHtml(qName(d.queenIds[1]))} — ${escapeHtml(d.song?.title||'Lip Sync')}</summary>${smackdownLipSyncResultCard(d,{returnSmackdown:true})}</details>`).join('')).join('')}</div>`:'';
  if(st.phase==='complete')return renderReturnSmackdownResult(ep.returnSmackdownResult||gameState.season?.returnAnnouncement?.smackdown||resolveReturnSmackdown());
  if(st.phase==='draw')beginReturnSmackdownDuel();
  const d=st.currentDuel;
  if(!d)return renderReturnSmackdownResult(resolveReturnSmackdown());
  if(st.phase==='song'){
    const chooserId=d.queenIds[1];
    if(chooserId!==playerId){
      let idx=(d.pendingSongIndex!==undefined)?Number(d.pendingSongIndex):returnSmackdownAutoSong(chooserId);
      const song=st.availableSongs[idx] || st.availableSongs[0];
      d.pendingSongIndex=idx;
      saveGame();
      setHTML(`${header}<div class="card"><h3>The eliminated queens return</h3><p>${isReunion?'The eliminated queens enter a bracket for the reunion title. Winners advance until one queen remains.':(isGauntlet?'The first eliminated queen starts the bracket and each winner faces the next eliminated queen in order.':'The eliminated queens enter a lip sync bracket. Winners advance until one queen remains.')}</p>${names?`<h4>Competing queens</h4><p>${names}</p>`:''}</div>${history}<div class="card important"><h3>Round ${d.round}</h3><p><strong>${escapeHtml(qName(d.queenIds[0]))}</strong> faces <strong>${escapeHtml(qName(d.queenIds[1]))}</strong>.</p><p><strong>${escapeHtml(qName(chooserId))}</strong> chooses the song.</p>${lipSyncSongCard(song)}</div>${footer}`);
      bindCommon(()=>showHistory(renderReturnSmackdownEpisode));
      document.querySelector('.card.important')?.insertAdjacentHTML('beforeend','<button id="continueReturnNpcSong">Continue to lip sync</button>');
      document.querySelector('#continueReturnNpcSong')?.addEventListener('click',()=>{delete d.pendingSongIndex; beginReturnSmackdownDuel(idx); const st2=initReturnSmackdownState(gameState.currentEpisode); const chosen=autoStrategyMapForDuel(st2.currentDuel?.queenIds||d.queenIds,song); completeReturnSmackdownAndShow(chosen);});
      return;
    }
    setHTML(`${header}<div class="card"><h3>The eliminated queens return</h3><p>${isReunion?'The eliminated queens enter a bracket for the reunion title. Winners advance until one queen remains.':(isGauntlet?'The first eliminated queen starts the bracket and each winner faces the next eliminated queen in order.':'The eliminated queens enter a lip sync bracket. Winners advance until one queen remains.')}</p>${names?`<h4>Competing queens</h4><p>${names}</p>`:''}</div>${history}<div class="card important"><h3>Round ${d.round}</h3><p><strong>${escapeHtml(qName(d.queenIds[0]))}</strong> faces <strong>${escapeHtml(qName(d.queenIds[1]))}</strong>.</p><h4>Choose your song</h4><div class="options"><button class="option" id="autoReturnSong"><strong>Choose Automatically</strong><span class="small">Use song-choice logic for your queen.</span></button>${st.availableSongs.map((song,i)=>`<button class="option pickReturnSong" data-index="${i}">${lipSyncSongCard(song)}</button>`).join('')}</div></div>${footer}`);
    bindCommon(()=>showHistory(renderReturnSmackdownEpisode));
    document.querySelector('#autoReturnSong')?.addEventListener('click',()=>{beginReturnSmackdownDuel(returnSmackdownAutoSong(d.queenIds[1])); renderReturnSmackdownEpisode();});
    document.querySelectorAll('.pickReturnSong').forEach(btn=>btn.addEventListener('click',()=>{beginReturnSmackdownDuel(Number(btn.dataset.index)); renderReturnSmackdownEpisode();}));
    return;
  }
  if(st.phase==='strategy'){
    const a=qById(d.queenIds[0]), b=qById(d.queenIds[1]);
    const playerInDuel=d.queenIds.includes(playerId);
    const autoChosen=autoStrategyMapForDuel(d.queenIds.filter(id=>id!==playerId),d.song);
    const npcLines='';
    const player=qById(playerId);
    const picker=(playerInDuel && player)?`<div class="card decision-card important"><h3>Lip Sync Strategy</h3><p>You are in the smackdown. Choose the story you want to tell on stage.</p>${strategyButtonsForQueen(player,d.song,'player')}</div>`:`<div class="card subtle"><h3>Lip Sync</h3><button id="runCurrentReturnNpc">Watch lip sync</button></div>`;
    setHTML(`${header}${history}<div class="card important"><h3>Round ${d.round}</h3><p><strong>${escapeHtml(qName(d.queenIds[0]))}</strong> vs <strong>${escapeHtml(qName(d.queenIds[1]))}</strong></p>${lipSyncSongCard(d.song)}<div class="lala-duel">${a?queenPortraitHtml(a,'md'):''}<span class="vs">VS</span>${b?queenPortraitHtml(b,'md'):''}</div></div>${picker}${footer}`);
    bindCommon(()=>showHistory(renderReturnSmackdownEpisode));
    const chosen=Object.assign({},autoChosen);
    if(playerInDuel){
      document.querySelectorAll('[data-strategy]').forEach(btn=>btn.addEventListener('click',()=>{chosen[playerId]=btn.dataset.strategy; completeReturnSmackdownAndShow(chosen);}));
    }else{
      document.querySelector('#runCurrentReturnNpc')?.addEventListener('click',()=>{completeReturnSmackdownAndShow(chosen);});
    }
    return;
  }
}
function renderReturnSmackdownResult(result){
  if(!result){generateEpisode(); return renderWorkroom();}
  const type=result.type || gameState.currentEpisode?.returnSmackdownType || 'legacy_smackdown';
  const isReunion=type==='reunion_smackdown' || result.reunionOnly || gameState.currentEpisode?.challengeType==='reunion_smackdown' || gameState.currentEpisode?.reunionOnly;
  const isRedemption=type==='redemption_smackdown'||type==='boot_order_gauntlet'||type==='elimination_order_gauntlet';
  const title=isReunion?'Queen of She Already Done Had Herses':(isRedemption?'Boot Order Lip Sync Smackdown':'Lip Sync Smackdown Return');
  const queenById=(id)=>gameState.queens.find(q=>q.id===id);
  const chip=(id,mark='')=>{const q=queenById(id); return `<div class="lala-queen-chip ${mark?`lala-${mark}`:''}">${q?queenPortraitHtml(q,'md'):''}<strong>${escapeHtml(qName(id))}</strong>${mark?`<span class="small">${escapeHtml(mark)}</span>`:''}</div>`;};
  const duelHtml=(d)=>`<div class="lala-duel-block"><details><summary>${escapeHtml(qName(d.queenIds[0]))} vs ${escapeHtml(qName(d.queenIds[1]))} — ${escapeHtml(d.song?.title||'Lip Sync')} (view performance)</summary>${smackdownLipSyncResultCard(d,{returnSmackdown:true})}</details></div>`;
  const rows=(result.rounds||[]).map(r=>`<div class="card lala-round-card"><h3>Round ${r.round}</h3>${r.byeId?`<div class="lala-bye">${chip(r.byeId,'bye')}</div>`:''}<div class="lala-duel-list">${(r.duels||[]).map(duelHtml).join('')}</div></div>`).join('');
  const winner=queenById(result.winnerId);
  const finalHeading=isReunion?'The tournament has a winner.':'A queen returns to the competition.';
  const winnerName=escapeHtml(qName(result.winnerId));
  const winnerBadge=isReunion?'QUEEN OF SHE ALREADY DONE HAD HERSES':'RETURNING QUEEN';
  const finalCopy=isReunion
    ? `<strong>${winnerName}</strong> is crowned ${escapeHtml(title)}.`
    : `<strong>${winnerName}</strong> has earned her way back into the race.`;
  const heroCopy=isReunion?'The eliminated queens battle for one last title. No one returns to the competition.':'The battle for a place back in the race is decided.';
  const winnerCard=`<div class="card important lala-final-card smackdown-winner-card"><h3>${finalHeading}</h3>${winner?tvWinnerSpotlight(winner,winnerBadge):`<span class="badge win smackdown-winner-badge">${winnerBadge}</span>`}<p class="smackdown-winner-copy">${finalCopy}</p></div>`;
  setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader(title,isReunion?'REUNION':'RETURN TWIST','danger',heroCopy)}</div>${rows}${winnerCard}<button id="continueAfterReturnSmackdown">${isReunion?'Continue':'Continue to the next episode'}</button></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(()=>renderReturnSmackdownResult(result)));
  document.querySelector('#continueAfterReturnSmackdown')?.addEventListener('click',()=>{gameState.currentEpisode=null; saveGame(); if(result.reunionOnly || result.type==='reunion_smackdown'){ if(typeof renderFinale==='function')renderFinale(); else routeAfterLoad(); } else {generateEpisode(); renderWorkroom();}});
}

function challengeContentBlock(ep){
  const c=ep.challengeContent||{};
  if(ep.challengeType==='ball' && c.runwayCategories?.length){
    return `<div class="card"><h3>${escapeHtml(c.challengeTitle||'The Ball')}</h3><p class="small">${escapeHtml(c.challengePrompt||'Three categories. One runway war.')}</p><ol>${c.runwayCategories.map(cat=>`<li><strong>Category is:</strong> ${escapeHtml(cat)}</li>`).join('')}</ol></div>`;
  }
  if(ep.challengeType==='fashion_wars'){
    const battles=(c.battles||[]).map(b=>`<li><strong>${escapeHtml(b.title||'Fashion Duel')}</strong><br><span class="small">${escapeHtml(b.prompt||'Create a winning design look.')}</span></li>`).join('');
    return `<div class="card"><h3>${escapeHtml(c.challengeTitle||'The Fashion Wars')}</h3><p>${escapeHtml(c.challengePrompt||((ep.activeCount||0)===8?'Four independent design duels. No team score.':'Design battle by battle. Each victory scores a point.'))}</p>${battles?`<ol>${battles}</ol>`:''}</div>`;
  }
  if(ep.challengeType==='design'){
    return `<div class="card"><h3>${escapeHtml(c.challengeTitle||'Design Challenge')}</h3><p>${escapeHtml(c.challengePrompt||'Create one original runway look from the assigned materials.')}</p></div>`;
  }
  if(ep.challengeType==='makeover'){
    return `<div class="card"><h3>Makeover Brief</h3><p>${escapeHtml(c.challengePrompt||'Transform your assigned partner into your drag family.')}</p></div>`;
  }
  if(ep.challengeType==='roast'){
    return `<div class="card"><h3>Roast Brief</h3><p>${escapeHtml(c.challengePrompt||'Prepare your jokes and survive the silence.')}</p></div>`;
  }
  if(ep.challengeType==='interview'){
    const guest=c.interviewGuest;
    return `<div class="card"><h3>Interview Guest</h3><p>${escapeHtml(c.challengePrompt||'Host an interview with the episode guest.')}</p>${guest?`<p class="small">Guest energy: ${escapeHtml(guest.vibe||'unpredictable')}</p>`:''}</div>`;
  }
  if(c.challengePrompt){
    return `<div class="card"><h3>${escapeHtml(c.challengeTitle||ep.challengeName)}</h3><p>${escapeHtml(c.challengePrompt)}</p></div>`;
  }
  return '';
}


function renderPremiereObserverWorkroom(){
  const ep=gameState.currentEpisode;
  if(!ep.placements?.length){
    ep.playerChallengeRisk='safe';
    calculateEpisodeResults({risk:'safe'});
  }
  const groupLabel=ep.premiereSpecial?.phase?`Premiere Part ${ep.premiereSpecial.phase}`:'Premiere';
  const names=currentEpisodeParticipantNames().map(escapeHtml).join(', ');
  const talent=talentContentBlock(ep);
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero"><span class="badge">${escapeHtml(groupLabel)}</span><h2>${escapeHtml(ep.challengeName||ep.themeName||'Premiere Challenge')}</h2><p>This half of the cast is competing this episode. There are no Workroom decisions for your queen yet.</p></div>
    <div class="card"><h3>Competing queens</h3><p>${names}</p></div>
    ${challengeContentBlock(ep)}
    ${talent}
    <div class="card subtle"><p>You will observe the episode and rejoin the competition when your group is called.</p></div>
    <div class="observer-actions"><button id="skipEpisode" class="secondary">Skip to next episode</button><button id="continue">Watch the Main Stage</button></div>
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderPremiereObserverWorkroom));
  document.querySelector('#skipEpisode')?.addEventListener('click',()=>skipCurrentEpisodeToNext());
  document.querySelector('#continue').addEventListener('click',()=>renderRunway());
}


function isPlayerEliminatedSpectator(){
  return !!gameState.season?.spectatorMode && !!gameState.queens.find(q=>q.id===gameState.playerQueenId)?.isEliminated;
}

function renderTournamentObserverWorkroom(){
  const ep=gameState.currentEpisode;
  if(!ep){generateEpisode(); return renderTournamentObserverWorkroom();}
  if(!ep.placements?.length){
    ep.workroomComplete=true;
    ep.playerChallengeRisk='safe';
    calculateEpisodeResults({risk:'safe'});
  }
  const group=ep.tournamentBracket?.group || gameState.season?.brackets?.currentGroup || '';
  const names=(ep.participantIds||[]).map(id=>gameState.queens.find(q=>q.id===id)?.name).filter(Boolean).map(escapeHtml).join(', ');
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero"><span class="badge">Bracket ${escapeHtml(group)}</span><h2>${escapeHtml(ep.themeName||ep.challengeName||'Tournament Challenge')}</h2><p>This bracket is competing now. Your queen watches without making decisions.</p></div>
    <div class="card"><h3>Competing queens</h3><p>${names}</p></div>
    ${challengeContentBlock(ep)}
    ${talentContentBlock(ep)}
    <div class="observer-actions"><button id="skipEpisode" class="secondary">Skip to next episode</button><button id="continue">Watch the Main Stage</button></div>
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderTournamentObserverWorkroom));
  document.querySelector('#skipEpisode')?.addEventListener('click',()=>skipCurrentEpisodeToNext());
  document.querySelector('#continue').addEventListener('click',()=>renderRunway());
}

function renderSeasonObserverWorkroom(){
  const ep=gameState.currentEpisode;
  if(!ep){generateEpisode(); return renderSeasonObserverWorkroom();}
  if(ep.special==='lalaparuza')return renderLalaparuzaEpisode();
  if(ep.special==='return_smackdown')return renderReturnSmackdownEpisode();
  const names=(ep.participantIds||gameState.queens.filter(q=>!q.isEliminated).map(q=>q.id)).map(id=>gameState.queens.find(q=>q.id===id)?.name).filter(Boolean).map(escapeHtml).join(', ');
  const talent=talentContentBlock(ep);
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero"><span class="badge">Episode ${ep.number}</span><h2>Spectator Mode</h2><p>Your queen has been eliminated. You are watching the remaining queens compete.</p></div>
    <div class="card"><h3>${escapeHtml(ep.challengeName)}</h3><p>${escapeHtml(ep.themeName||'')}</p><p class="small">Guest judge: ${escapeHtml(ep.guestJudge?.name||'Guest Judge')}</p></div>
    <div class="card"><h3>Competing queens</h3><p>${names}</p></div>
    ${challengeContentBlock(ep)}
    ${talent}
    <button id="continue">Watch the Main Stage</button>
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderSeasonObserverWorkroom));
  document.querySelector('#continue').addEventListener('click',()=>{
    if(!ep.placements?.length){
      ep.workroomComplete=true;
      ep.playerChallengeRisk='safe';
      calculateEpisodeResults({risk:'safe'});
    }
    renderRunway();
  });
}


function selectVisibleRelationshipShiftNotes(notes){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  if(!Array.isArray(notes)||!notes.length)return [];
  const playerName=player?.name||'';
  const withPlayer=playerName?notes.filter(n=>String(n).includes(playerName)):[];
  const others=notes.filter(n=>!withPlayer.includes(n));
  return [...withPlayer, ...others.slice(0,2)];
}


function returnAnnouncementCard(){
  const ann=gameState.season?.returnAnnouncement;
  const ids=ann?.queenIds||[];
  if(!ids.length)return '';
  const names=ids.map(id=>gameState.queens.find(q=>q.id===id)?.name).filter(Boolean);
  if(!names.length)return '';
  const title=names.length>1?'Two queens return to the competition.':'A queen returns to the competition.';
  const joined=names.length>1?`${names.slice(0,-1).map(escapeHtml).join(', ')} and ${escapeHtml(names[names.length-1])}`:escapeHtml(names[0]);
  const verb=names.length>1?'have':'has';
  const reasonLabels={
    first_out:'First Out Return',
    redemption_vote:'Redemption Vote',
    production_return:'Production Darling Return',
    legacy_smackdown:'Lip Sync Smackdown Return',
    redemption_smackdown:'Redemption Lip Sync Smackdown Return'
  };
  const reason=reasonLabels[ann.reason]||'Return Twist';
  gameState.season.returnAnnouncement=null;
  saveGame();
  return `<div class="card important return-twist-card"><span class="badge">${escapeHtml(reason)}</span><h3>${title}</h3><p><strong>${joined}</strong> ${verb} re-entered the race.</p></div>`;
}
function renderWorkroom(){
  if(gameState.currentEpisode)gameState.currentEpisode.feedStage='workroom';
  const ep=gameState.currentEpisode;
  if(!ep){generateEpisode(); return renderWorkroom();}
  if(ep.teamFormation?.pending && typeof renderTeamFormationStep==='function')return renderTeamFormationStep();
  if(ep.special==='lalaparuza')return renderLalaparuzaEpisode();
  if(ep.special==='return_smackdown')return renderReturnSmackdownEpisode();
  if(typeof isCurrentEpisodePremiereObserver==='function' && isCurrentEpisodePremiereObserver())return renderPremiereObserverWorkroom();
  if(ep.special==='tournament_bracket' && ep.participantIds && !ep.participantIds.includes(gameState.playerQueenId))return renderTournamentObserverWorkroom();
  if(isPlayerEliminatedSpectator())return renderSeasonObserverWorkroom();
  if(playerNeedsTalentChoice(ep))return renderTalentChoice();
  ensureAllQueenV14Stats();
  applyWeeklyWearAndTear();
  generateWorkroomSocialEvents();
  const npcEvents=generateNpcSocialEvents('workroom');
  const narrativeEvent=(typeof narrativeEventForEpisode==='function')?narrativeEventForEpisode('workroom'):null;
  const driftNotes = evolveRelationshipsDuringEpisode();
  const visibleDriftNotes = selectVisibleRelationshipShiftNotes(driftNotes);
  const productionEvent = (ep.events || [])
  .filter(e => e && e.text && !['runway','judging'].includes(e.type));

const mainEvent = productionEvent.length
  ? productionEvent.map(e => formatPlayerNameInSocialText(e.text))
  : [];

const otherPulse = buildWorkroomPulse(
  [
    ...(ep.socialEvents || []),
    ...npcEvents,
    ...(narrativeEvent ? [narrativeEvent] : [])
  ],
  visibleDriftNotes
);

const workroomPulse = [
  ...mainEvent.map(item => `<li>${item}</li>`),
  otherPulse
].join('');
  
  const returnBlock=returnAnnouncementCard();
  const snatchBlock=(ep.challengeType==='snatchgame' && ep.snatchCharacters?.length)
    ? `<div class="card"><h3>Snatch Game Characters</h3><div class="snatch-grid">${ep.snatchCharacters.map(c=>`<div class="snatch-card"><strong>${escapeHtml(c.queenName)}</strong><span>${escapeHtml(c.character)}</span></div>`).join('')}</div></div>`
    : '';
  // v31.5 Part B: BRIEF / WORKROOM / YOUR MOVE blocks, with all the content that was on this screen.
  const tvBlock=(id,title,inner)=>`<section class="tv-block" data-block="${id}"><h3 class="tv-bt">${title}</h3><div class="tv-bc">${inner}</div></section>`;
  const activeCount=(gameState.queens||[]).filter(q=>!q.isEliminated).length;
  const teamsList=ep.teams?.length?`<div class="card"><h3>Teams</h3><ul class="episode-team-list">${ep.teams.map((t,i)=>`<li class="episode-team-line team-line-${i%8}"><strong>${escapeHtml(t.name)}</strong>: ${t.queenIds.map(id=>{const q=gameState.queens.find(q=>q.id===id); return q?queenTeamNameHtml(q):'';}).filter(Boolean).join(', ')}${typeof teamChemistryLabel==='function'&&t.queenIds.length>1?` <span class="tv-team-chem">Chemistry: ${teamChemistryLabel(t,ep)}</span>`:''}</li>`).join('')}</ul></div>`:'';
  const relBeats=(()=>{const cb=typeof relationshipArcCallback==='function'?relationshipArcCallback('workroom'):'';const rb=typeof relationshipStoryBeats==='function'?relationshipStoryBeats('workroom'):'';return (cb||rb)?`<h4>Relationships</h4><ul class="relationship-beats tv-beats">${cb}${rb}</ul>`:'';})();
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero tv-ep-title">
      <span class="eyebrow">Episode ${ep.number} · ${escapeHtml(ep.challengeName)} · ${escapeHtml(ep.structure?.label||'Solo challenge')} · ${activeCount}/${(gameState.queens||[]).length} queens</span>
      <h2>${escapeHtml(ep.themeName)}</h2>
    </div>
    ${tvBlock('brief','Brief',`
      ${String(challengeContentBlock(ep)||'').includes(escapeHtml(ep.themeNotes||'@@'))?'':`<p class="tv-prompt">${escapeHtml(ep.themeNotes||'')}</p>`}
      <p class="tv-runway"><span class="badge">Runway</span> <strong>${escapeHtml(ep.runwayCategory)}</strong></p>
      <div class="guest-judge-callout"><span>Guest Judge</span><strong>${escapeHtml(ep.guestJudge?.name||'Guest Judge')}</strong><em>${escapeHtml(ep.guestJudge?.note||'Ready for the show.')}</em></div>
      ${typeof judgesExpectationBarHtml==='function'?judgesExpectationBarHtml():''}
      ${returnBlock}
      ${teamFormationBlock(ep)}
      ${teamsList}
      ${challengeContentBlock(ep)}
      ${talentContentBlock(ep)}
      ${snatchBlock}`)}
    ${tvBlock('workroom','Workroom',`<div class="card">
      <h3>Workroom</h3>
      <p>${miniChallengeWorkroomLine(ep)}</p>
      <h4>Story Beats</h4>
      <ul class="tv-beats">${workroomPulse}</ul>
      ${relBeats}
      ${ep.npcChoiceNotes?`<h4>What the other queens are doing</h4><ul>${ep.npcChoiceNotes.slice(0,6).map(n=>`<li>${escapeHtml(n)}</li>`).join('')}</ul>`:''}
    </div>`)}
    ${tvBlock('move','Your move',workroomOneScreenHtml())}
  </section>${queenSidebar()}</main>`);
  tvDecorateBeats();
  const tvStepWatch=new MutationObserver(()=>tvUpdateWorkroomSteps());
  const ds=document.querySelector('#decisionStep'); if(ds)tvStepWatch.observe(ds,{childList:true,subtree:true});
  bindCommon(()=>showHistory(renderWorkroom));
  bindWorkroomOneScreen();
}
// v31.6: the whole Workroom on one screen. One row per choice, the selected option explains itself,
// last week's picks come preselected, effects apply when you go to the Main Stage.
function wrDefaultPicks(){
  const last=gameState.season?.lastWorkroomPicks||{};
  const ok=(id,map)=>id&&map[id]?id:null;
  return {workroom:ok(last.workroom,WORKROOM_CHOICES)||'friendly',prep:ok(last.prep,PREP_CHOICES)||'rehearse',approach:ok(last.approach,CHALLENGE_APPROACHES)||'safe',target:last.target||null};
}
function wrPicks(){const ep=gameState.currentEpisode;ep.wrPicks=ep.wrPicks||wrDefaultPicks();return ep.wrPicks;}
function wrPlayerTooTired(){const p=gameState.queens.find(q=>q.id===gameState.playerQueenId);return Math.round(p?.energy??100)<30;}
function wrPreviewChips(kind,id,targetId){
  const chip=(k,a,good)=>({k,a,good});
  const t=targetId?gameState.queens.find(q=>q.id===targetId):null;
  if(kind==='workroom'){
    if(id==='spotlight')return [chip('Spotlight','▲',true),chip('Some queens','▼',false)];
    if(id==='friendly')return [chip('3 queens','▲',true)];
  }
  if(kind==='prep'){
    if(id==='ask_help'){const aff=Number(gameState.relationships?.[targetId]?.[gameState.playerQueenId]?.affinity)||0;return aff<=-25?[chip('She may say no','▼',false)]:[chip('Challenge',aff>=40?'▲▲':'▲',true),chip(t?.name||'Her','▲',true)];}
    if(id==='sabotage')return [chip(t?.name||'Her','▼▼',false),chip('Could backfire','▼',false)];
  }
  const map=kind==='workroom'?WORKROOM_CHOICES:kind==='prep'?PREP_CHOICES:CHALLENGE_APPROACHES;
  const base=typeof playerEffectChips==='function'?playerEffectChips(map[id]?.effects||{},null):[];
  if(kind==='approach'){
    // v31.6: all three help the challenge; what changes is how far the result can swing
    const odds={safe:{k:'Challenge · steady',tone:'up'},risk:{k:'Challenge · big swing',tone:'gold'},unexpected:{k:'Challenge · wild swing',tone:'down'}}[id];
    return base.map(c=>c.k==='Challenge'&&odds?{...c,a:'▲',k:odds.k,tone:odds.tone,good:true}:c);
  }
  return base;
}
function wrRowHtml(kind,title,map,sel){
  const tired=wrPlayerTooTired();
  const picks=wrPicks();
  const pills=Object.entries(map).map(([id,o])=>{
    const dis=kind==='prep'&&id==='rehearse'&&tired;
    return `<button type="button" class="wr-o${id===sel?' on':''}" data-wr-kind="${kind}" data-wr-id="${id}" aria-pressed="${id===sel}"${dis?' disabled':''}>${escapeHtml(o.label)}</button>`;
  }).join('');
  const o=map[sel]||{};
  let extra='';
  if(kind==='prep'){
    if(tired)extra+=`<p class="small warning">You're too exhausted to rehearse more.</p>`;
    if(o.needsTarget){
      const targets=getUntuckedTargets().filter(q=>{const ids=gameState.currentEpisode?.participantIds;return !ids?.length||ids.includes(q.id);});
      if(!targets.some(q=>q.id===picks.target))picks.target=targets[0]?.id||null;
      extra+=`<div class="wr-t"><span>${sel==='sabotage'?'Target':'Ask'}</span><select id="wrTarget" class="sel">${targets.map(q=>`<option value="${q.id}"${q.id===picks.target?' selected':''}>${escapeHtml(q.name)} — ${escapeHtml(typeof relationshipMoodTier==='function'?(()=>{const r=gameState.relationships?.[q.id]?.[gameState.playerQueenId];return MOOD_LABEL[relationshipMoodTier(r?.affinity,r?.respect)];})():playerRelationshipLabel(q.id))}</option>`).join('')}</select></div>`;
    }
  }
  const chips=wrPreviewChips(kind,sel,picks.target);
  return `<div class="wr-row" data-wr-row="${kind}"><span class="wr-k">${title}</span><div class="wr-body"><div class="wr-opts">${pills}</div>${extra}<p class="wr-d">${escapeHtml(o.description||'')}${chips.length&&typeof effectChipsHtml==='function'?effectChipsHtml(chips):''}</p></div></div>`;
}
function workroomOneScreenHtml(){
  const p=wrPicks();
  if(p.prep==='rehearse'&&wrPlayerTooTired())p.prep='rest';
  return `<div class="wr" id="wrOne">${wrRowHtml('workroom','First move',WORKROOM_CHOICES,p.workroom)}${wrRowHtml('prep','Preparation',PREP_CHOICES,p.prep)}${wrRowHtml('approach','Approach',CHALLENGE_APPROACHES,p.approach)}</div>
    <div class="tv-nav wr-nav"><button id="wrGo" class="tv-next">Go to Main Stage</button></div>`;
}
function bindWorkroomOneScreen(){
  const root=document.querySelector('#wrOne');if(!root)return;
  const rerender=()=>{const box=document.querySelector('[data-block="move"] .tv-bc');if(box){box.innerHTML=workroomOneScreenHtml();bindWorkroomOneScreen();}};
  root.querySelectorAll('[data-wr-kind]').forEach(b=>b.addEventListener('click',()=>{if(b.disabled)return;wrPicks()[b.dataset.wrKind]=b.dataset.wrId;saveGame?.();rerender();}));
  document.querySelector('#wrTarget')?.addEventListener('change',e=>{wrPicks().target=e.target.value;rerender();});
  document.querySelector('#wrGo')?.addEventListener('click',()=>commitWorkroomOneScreen());
}
function commitWorkroomOneScreen(){
  const ep=gameState.currentEpisode;const p=wrPicks();
  if(ep.workroomComplete&&ep.placements?.length)return renderRunway();
  ep.feedStage='workroom';
  const w=WORKROOM_CHOICES[p.workroom];
  ep.workroomChoice=w.label;
  if(typeof applyWorkroomChoice==='function')applyWorkroomChoice(w);else applyPlayerEffects(w.effects,w.text);
  let prepId=p.prep;if(prepId==='rehearse'&&wrPlayerTooTired())prepId='rest';
  const c=PREP_CHOICES[prepId];
  if(c.needsTarget&&p.target){
    const target=gameState.queens.find(q=>q.id===p.target);
    ep.prepChoice=`${c.label}: ${target?.name||'another queen'}`;
    if(c.isSabotage&&typeof applySabotageAttempt==='function')applySabotageAttempt(p.target);
    else if(typeof applyTargetedPrepChoice==='function')applyTargetedPrepChoice(c,target);
    else applyPlayerEffects(c.effects,c.text,p.target);
  }else if(c.needsTarget){ep.prepChoice='No special preparation';}
  else{ep.prepChoice=c.label;applyPlayerEffects(c.effects,c.text);}
  const a=CHALLENGE_APPROACHES[p.approach];
  ep.challengeApproach=a.label;
  ep.workroomComplete=true;
  applyPlayerEffects(a.effects,a.text);
  ep.playerChallengeRisk=a.risk;
  gameState.season.lastWorkroomPicks={workroom:p.workroom,prep:prepId,approach:p.approach,target:p.target};
  calculateEpisodeResults({risk:a.risk});
  window.scrollTo(0,0);
  renderRunway();
}
// v31.5 Part B: which of the three Workroom steps is on screen
function tvUpdateWorkroomSteps(){
  const h=(document.querySelector('#decisionStep h3')?.textContent||'').toLowerCase();
  const step=/first move/.test(h)?1:/prep/.test(h)?2:(h?3:0);
  document.querySelectorAll('#tvSteps .tv-step').forEach(el=>{const n=+el.dataset.step;el.classList.toggle('on',n===step);el.classList.toggle('done',step&&n<step);});
}
// v31.5 Part B: story beat type icon (drama / moment / bond), next to the text
function tvDecorateBeats(){
  if(typeof icon!=='function')return;
  document.querySelectorAll('.tv-beats > li:not(.small):not(.relationship-beat)').forEach(li=>{
    if(li.querySelector(':scope > .ic'))return;
    const body=document.createElement('span');while(li.firstChild)body.appendChild(li.firstChild);li.appendChild(body);
    const t=li.textContent.toLowerCase();
    const kind=/alliance|ally|friend|support|hug|bond|sister|together|trust|help/.test(t)?['link','b-bond']:/fight|tension|shade|argu|storm|drama|snap|spiral|clash|confront|jealous|mess|betray|cold|glare|read/.test(t)?['flame','b-drama']:['sparkle','b-moment'];
    li.insertAdjacentHTML('afterbegin',icon(kind[0],kind[1]));
  });
  document.querySelectorAll('.relationship-beats > li .badge').forEach(b=>{
    const tag=b.textContent.trim().toLowerCase();
    const n={rivalry:'flame',alliance:'link',truce:'dove',closer:'hearts',colder:'mood-shade'}[tag];
    if(n && !b.querySelector('.ic'))b.insertAdjacentHTML('afterbegin',icon(n));
  });
}
function bindSkipWorkroom(){
  const btn=document.querySelector('#skipWorkroom');
  if(!btn)return;
  btn.addEventListener('click',()=>{
    const ep=gameState.currentEpisode;
    ep.workroomSkipped=true;
    ep.passiveWorkroom=true;
    if(!ep.workroomChoice)ep.workroomChoice='Stayed quiet';
    if(!ep.prepChoice)ep.prepChoice='No special preparation';
    if(!ep.challengeApproach)ep.challengeApproach='No clear approach';
    if(ep.challengeType==='talent' && !ep.playerTalentLocked && typeof lockPlayerTalentChoice==='function')lockPlayerTalentChoice('performance');
    ep.workroomComplete=true;
    if(typeof applyPassiveWorkroomPenalty==='function') applyPassiveWorkroomPenalty();
    if(!ep.placements?.length){ep.playerChallengeRisk='safe'; calculateEpisodeResults({risk:'safe'});}
    renderRunway();
  });
}
function choiceEmoji(id){
  return {
    spotlight:'✨', friendly:'💞', observe:'👁️',
    rehearse:'🎬', runway:'👠', ask_help:'🤝', sabotage:'🦂', rest:'🫖',
    safe:'🛡️', risk:'🔥', unexpected:'🎲'
  }[id] || '•';
}
function optionButton(id, dataAttr, obj, extraAttrs=''){
  return `<button class="option" ${dataAttr}="${id}" ${extraAttrs}><span class="choice-emoji" aria-hidden="true">${typeof emojiIcon==='function'?emojiIcon(choiceEmoji(id)):choiceEmoji(id)}</span><span class="choice-copy"><strong>${escapeHtml(obj.label)}</strong><span class="small">${escapeHtml(obj.description||'')}</span></span></button>`;
}
function targetSelectHtml(id='targetSelect'){
  let targets=getUntuckedTargets();
  if(String(id).toLowerCase().includes('prep')){
    const ids=gameState.currentEpisode?.participantIds;
    if(ids?.length) targets=targets.filter(q=>ids.includes(q.id));
  }
  return `<label>Choose a queen<select id="${id}">${targets.map(q=>`<option value="${q.id}">${escapeHtml(q.name)} — ${escapeHtml(typeof relationshipMoodTier==='function'?(()=>{const r=gameState.relationships?.[q.id]?.[gameState.playerQueenId];return MOOD_LABEL[relationshipMoodTier(r?.affinity,r?.respect)];})():playerRelationshipLabel(q.id))}</option>`).join('')}</select></label>`;
}
function renderWorkroomChoice(){
  document.querySelector('#decisionStep').innerHTML=`<div class="card decision-card"><h3>First move in the Workroom</h3><p>How do you want to enter this episode socially?</p><div class="options">${Object.entries(WORKROOM_CHOICES).map(([id,o])=>optionButton(id,'data-workroom',o)).join('')}</div></div>`;
  document.querySelectorAll('[data-workroom]').forEach(btn=>btn.addEventListener('click',()=>{
    const choice=WORKROOM_CHOICES[btn.dataset.workroom];
    gameState.currentEpisode.workroomChoice=choice.label;
    if(typeof applyWorkroomChoice==='function') applyWorkroomChoice(choice); else applyPlayerEffects(choice.effects,choice.text);
    renderPreparationChoice();
  }));
}
function renderPreparationChoice(){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  if(typeof ensureEffectQueenStats==='function')ensureEffectQueenStats(player);
  const stamina=Math.round(player?.energy ?? 0);
  const tooExhausted=stamina<30;
  const prepButtons=Object.entries(PREP_CHOICES).map(([id,o])=>optionButton(id,'data-prep',o,(id==='rehearse'&&tooExhausted)?'disabled aria-disabled="true"':'')).join('');
  const exhaustedMsg=tooExhausted?`<p class="small warning">You're too exhausted to rehearse more.</p>`:'';
  document.querySelector('#decisionStep').innerHTML=`<div class="card decision-card"><h3>Preparation</h3><p>Your prep affects this episode and your long-term image.</p>${(()=>{if(typeof prepWeekLabel!=='function'||typeof challengeDefinitionForEpisode!=='function')return '';const w=prepWeekLabel(challengeDefinitionForEpisode(gameState.currentEpisode));return `<div class="tv-week tv-week-${w.key}"><b>${escapeHtml(w.title)}</b><span>${escapeHtml(w.text)}</span></div>`;})()}<div class="small"><strong>Stamina</strong><br>${stamina} / 100</div>${exhaustedMsg}<div class="options">${prepButtons}</div><div id="prepTarget"></div></div>`;
  document.querySelectorAll('[data-prep]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.prep;
    if(id==='rehearse' && tooExhausted)return;
    const choice=PREP_CHOICES[id];
    if(choice.needsTarget){
      document.querySelector('#prepTarget').innerHTML=`<div class="card subtle decision-card"><h4>Who do you ask?</h4>${targetSelectHtml('prepTargetSelect')}<button id="confirmPrep">Confirm</button></div>`;
      document.querySelector('#confirmPrep').addEventListener('click',()=>{
        const targetId=document.querySelector('#prepTargetSelect').value;
        const target=gameState.queens.find(q=>q.id===targetId);
        gameState.currentEpisode.prepChoice=`${choice.label}: ${target?.name||'another queen'}`;
        if(choice.isSabotage && typeof applySabotageAttempt==='function'){
          applySabotageAttempt(targetId);
        }else if(typeof applyTargetedPrepChoice==='function'){
          applyTargetedPrepChoice(choice,target);
        }else{
          applyPlayerEffects(choice.effects,choice.text,targetId);
        }
        renderChallengeApproachChoice();
      });
    }else{
      gameState.currentEpisode.prepChoice=choice.label;
      applyPlayerEffects(choice.effects,choice.text);
      renderChallengeApproachChoice();
    }
  }));
}
function renderChallengeApproachChoice(){
  document.querySelector('#decisionStep').innerHTML=`<div class="card decision-card"><h3>Maxi Challenge approach</h3><p>Now decide how you perform the challenge itself.</p><div class="options">${Object.entries(CHALLENGE_APPROACHES).map(([id,o])=>optionButton(id,'data-approach',o)).join('')}</div></div>`;
  document.querySelectorAll('[data-approach]').forEach(btn=>btn.addEventListener('click',()=>{
    const choice=CHALLENGE_APPROACHES[btn.dataset.approach];
    gameState.currentEpisode.challengeApproach=choice.label;
    gameState.currentEpisode.workroomComplete=true;
    applyPlayerEffects(choice.effects,choice.text);
    gameState.currentEpisode.playerChallengeRisk=choice.risk;
    calculateEpisodeResults({risk:choice.risk});
    renderRunway();
  }));
}
