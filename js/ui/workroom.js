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
    html=html.split(name).join(`<strong>${name} <span class="player-crown" title="Your queen">👑</span></strong>`);
  }
  return html;
}

function smackdownStrategyOptionsHtml(){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const reveals=player?.inventory?.reveals||0;
  const strategies=[
    ['emotion','❤️ Sell the Emotion','Lead with vulnerability and make every beat feel personal.'],
    ['sell_lyrics','🎭 Sell the Lyrics','Use face, timing, and intention to make the song feel written for you.'],
    ['dance','Dance the House Down','Attack the rhythm and try to own the stage.'],
    ['stunts','🤸 Stunts & Tricks','Go for big physical moments.'],
    ['save_reveal','👗 Reveal During the Climax','Hold the reveal until the song hits its biggest moment.'],
    ['reveal_early','✨ Reveal Early','Shock the judges quickly.'],
    ['multiple_reveals','💎 Multiple Reveals','Throw every trick at the stage.'],
    ['play_safe','😌 Play It Safe','Keep it clean and controlled.']
  ];
  return `<div class="options">${strategies.map(([id,label,desc])=>{
    const disabled=(['save_reveal','reveal_early','multiple_reveals'].includes(id)&&reveals<=0)?'disabled':'';
    return choiceButtonHtml({id,attr:'data-smack-strategy',label,desc,disabled});
  }).join('')}</div><p class="small">Reveals available: ${reveals}</p>`;
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
  return `<div class="card"><h3>Talent Show Lineup</h3><div class="talent-grid">${talents.map(t=>{const type=String(t.talent.type||'performance').toLowerCase(); const icon=talentTypeIcon(type); const isPlayer=t.queenId===gameState.playerQueenId; return `<article class="queen-item talent-card ${isPlayer?'player-card':''}"><strong>${escapeHtml(t.queenName)}${isPlayer?' <span class="player-crown" title="Your queen">👑</span>':''}</strong><span class="talent-name">${icon} ${escapeHtml(t.talent.name||t.talent)}</span><span class="badge arc">${escapeHtml(type)}</span></article>`;}).join('')}</div></div>`;
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
    <div class="card decision-card"><h3>Your Talent Show category</h3><p>The game will randomly pull one act from <code>talentPerformances.js</code> using the type you choose.</p><div class="options">${buttons}</div></div>
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


function teamFormationBlock(ep){
  if(!ep?.teams?.length || !ep.teamFormation)return '';
  const tf=ep.teamFormation;
  const captainLine=(tf.method==='mini_captains' && tf.captainIds?.length)
    ? `<p><strong>Captains:</strong> ${tf.captainIds.map(id=>queenTeamNameHtml(gameState.queens.find(q=>q.id===id))).join(' vs ')}</p>` : '';
  const chooserLine=(tf.method==='previous_winner' && tf.chooserId)
    ? `<p><strong>Supreme Queen:</strong> ${queenTeamNameHtml(gameState.queens.find(q=>q.id===tf.chooserId))}</p>` : '';
  return `<div class="card"><h3>Team Formation</h3><h4>${escapeHtml(tf.title||'Team Formation')}</h4><p>${escapeHtml(tf.description||'')}</p>${captainLine}${chooserLine}${tf.autoChosen?'<p class="small">You chose to let the game form the teams automatically.</p>':''}</div>`;
}
function renderTeamFormationStep(){
  const ep=gameState.currentEpisode;
  if(!ep?.teamFormation?.pending){return renderWorkroom();}
  const active=(ep.participantIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const tf=ep.teamFormation;
  const sizes=tf.targetSizes&&tf.targetSizes.length?tf.targetSizes:teamStructureTargetSizes(ep.structure,active);
  const qName=id=>gameState.queens.find(q=>q.id===id)?.name||'a queen';
  const header=`<main class="layout"><section class="screen"><div class="hero"><span class="badge">Episode ${ep.number}</span><h2>Team Formation</h2><p>${escapeHtml(tf.title||'Team Formation')}</p><p>${escapeHtml(tf.description||'')}</p></div>`;
  const footer=`</section>${queenSidebar()}</main>`;
  const autoButton=`<button id="autoFormation" class="secondary">Choose Automatically</button>`;
  if(tf.method==='mini_captains'){
    const captainIds=(tf.captainIds||[]).slice();
    if(captainIds.length<2){
      const candidates=active.filter(q=>q.id!==gameState.playerQueenId);
      setHTML(`${header}<div class="card"><h3>Choose the other captain</h3><p>You won the mini-challenge. Pick the queen who will lead the opposing team.</p><div class="options">${candidates.map(q=>`<button class="option pickCaptain" data-id="${q.id}">${queenPortraitHtml(q,'sm')}<strong>${escapeHtml(q.name)}</strong></button>`).join('')}${autoButton}</div></div>${footer}`);
      bindCommon(()=>showHistory(renderTeamFormationStep));
      document.querySelectorAll('.pickCaptain').forEach(btn=>btn.addEventListener('click',()=>{tf.captainIds=[gameState.playerQueenId,btn.dataset.id]; saveGame(); renderTeamFormationStep();}));
      document.querySelector('#autoFormation')?.addEventListener('click',()=>{const second=autoPickTeamCaptain(gameState.playerQueenId,candidates); tf.captainIds=[gameState.playerQueenId,second?.id].filter(Boolean); saveGame(); renderTeamFormationStep();});
      return;
    }
    const teams=[ [captainIds[0]], [captainIds[1]] ];
    const remaining=active.filter(q=>!captainIds.includes(q.id));
    const rebuildFromState=()=>{
      const saved=tf.playerGroups||teams;
      return saved.map(g=>g.slice());
    };
    const groups=rebuildFromState();
    const openIndex=()=>groups.findIndex((g,i)=>g.length<sizes[i]);
    const currentIdx=openIndex();
    if(currentIdx<0){finalizeCurrentEpisodeTeams(teamsFromIdGroups(groups,ep.structure),false); return renderWorkroom();}
    const isPlayerTurn=currentIdx===0;
    if(!isPlayerTurn){
      const pool=active.filter(q=>!groups.flat().includes(q.id));
      const pick=autoPickTeammate(groups[currentIdx][0],groups[currentIdx],pool);
      if(pick)groups[currentIdx].push(pick.id);
      tf.playerGroups=groups; saveGame(); return renderTeamFormationStep();
    }
    const pool=active.filter(q=>!groups.flat().includes(q.id));
    setHTML(`${header}<div class="card"><h3>Schoolyard Pick</h3><p>${escapeHtml(qName(captainIds[0]))} and ${escapeHtml(qName(captainIds[1]))} are captains. Choose your next teammate.</p><div class="team-preview">${groups.map((g,i)=>`<p><strong>${escapeHtml(teamNameForStructure(ep.structure,g,i))}</strong>: ${g.map(id=>queenTeamNameHtml(gameState.queens.find(q=>q.id===id))).join(', ')}</p>`).join('')}</div><div class="options">${pool.map(q=>`<button class="option pickMate" data-id="${q.id}">${queenPortraitHtml(q,'sm')}<strong>${escapeHtml(q.name)}</strong></button>`).join('')}${autoButton}</div></div>${footer}`);
    bindCommon(()=>showHistory(renderTeamFormationStep));
    document.querySelectorAll('.pickMate').forEach(btn=>btn.addEventListener('click',()=>{groups[currentIdx].push(btn.dataset.id); tf.playerGroups=groups; saveGame(); renderTeamFormationStep();}));
    document.querySelector('#autoFormation')?.addEventListener('click',()=>{const teams=autoAssignAllTeams(ep.structure,active,'mini_captains',{captainIds}); finalizeCurrentEpisodeTeams(teams,true); renderWorkroom();});
    return;
  }
  if(tf.method==='previous_winner'){
    const groups=(tf.playerGroups&&tf.playerGroups.length)?tf.playerGroups:sizes.map(()=>[]);
    const filled=groups.flat();
    const currentIdx=groups.findIndex((g,i)=>g.length<sizes[i]);
    if(currentIdx<0){finalizeCurrentEpisodeTeams(teamsFromIdGroups(groups,ep.structure),false); return renderWorkroom();}
    const pool=active.filter(q=>!filled.includes(q.id));
    setHTML(`${header}<div class="card"><h3>Supreme Queen Power</h3><p>You won last week. Form every team strategically.</p><div class="team-preview">${groups.map((g,i)=>`<p><strong>${escapeHtml(teamNameForStructure(ep.structure,g,i))}</strong> (${g.length}/${sizes[i]}): ${g.map(id=>queenTeamNameHtml(gameState.queens.find(q=>q.id===id))).join(', ')||'<span class="small">empty</span>'}</p>`).join('')}</div><p>Choose a queen for ${escapeHtml(teamNameForStructure(ep.structure,groups[currentIdx],currentIdx))}.</p><div class="options">${pool.map(q=>`<button class="option pickSupreme" data-id="${q.id}">${queenPortraitHtml(q,'sm')}<strong>${escapeHtml(q.name)}</strong></button>`).join('')}${autoButton}</div></div>${footer}`);
    bindCommon(()=>showHistory(renderTeamFormationStep));
    document.querySelectorAll('.pickSupreme').forEach(btn=>btn.addEventListener('click',()=>{groups[currentIdx].push(btn.dataset.id); tf.playerGroups=groups; saveGame(); renderTeamFormationStep();}));
    document.querySelector('#autoFormation')?.addEventListener('click',()=>{const teams=autoAssignAllTeams(ep.structure,active,'previous_winner',{chooserId:tf.chooserId}); finalizeCurrentEpisodeTeams(teams,true); renderWorkroom();});
    return;
  }
  finalizeCurrentEpisodeTeams(autoAssignAllTeams(ep.structure,active,tf.method,{captainIds:tf.captainIds,chooserId:tf.chooserId}),true);
  renderWorkroom();
}

function renderLalaparuzaEpisode(){
  const ep=gameState.currentEpisode;
  const playerInSmackdown=(ep.participantIds||gameState.queens.filter(q=>!q.isEliminated).map(q=>q.id)).includes(gameState.playerQueenId);
  const playerNeedsStrategy=playerInSmackdown && !ep.playerSmackdownStrategy;
  setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader('Lip Sync Smackdown','LALAPARUZA','danger','The queens must lip sync for their survival.')}</div>${lalaparuzaIntroContext()}<div class="card"><h3>The rules</h3><p>The queens are randomly paired. Winners are safe. Losers keep battling until only one queen is eliminated.</p></div>${playerNeedsStrategy?`<div class="card important decision-card"><h3>Your lip sync strategy</h3><p>Choose how you will fight before the bracket begins.</p>${smackdownStrategyOptionsHtml()}</div>`:`<button id="startLala">Start the smackdown</button>`}</section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderLalaparuzaEpisode));
  if(playerNeedsStrategy){
    document.querySelectorAll('[data-smack-strategy]').forEach(btn=>btn.addEventListener('click',()=>{
      ep.playerSmackdownStrategy=btn.dataset.smackStrategy;
      const result=resolveLalaparuza();
      renderLalaparuzaResult(result);
    }));
    return;
  }
  document.querySelector('#startLala')?.addEventListener('click',()=>{
    const result=resolveLalaparuza(); renderLalaparuzaResult(result);
  });
}
function renderLalaparuzaResult(result){
  const queenById=(id)=>gameState.queens.find(q=>q.id===id);
  const lalaQueenChip=(id,mark='')=>{
    const q=queenById(id);
    return `<div class="lala-queen-chip ${mark?`lala-${mark}`:''}">${q?queenPortraitHtml(q,'md'):''}<strong>${escapeHtml(qName(id))}</strong>${mark?`<span class="small">${escapeHtml(mark)}</span>`:''}</div>`;
  };
  const duelHtml=(d)=>`<div class="lala-duel">
    ${lalaQueenChip(d.queenIds[0], d.winnerId===d.queenIds[0]?'wins':d.loserId===d.queenIds[0]?'moves on':'')}
    <span class="vs">VS</span>
    ${lalaQueenChip(d.queenIds[1], d.winnerId===d.queenIds[1]?'wins':d.loserId===d.queenIds[1]?'moves on':'')}
  </div>`;
  const rows=result.rounds.map(r=>`<div class="card lala-round-card"><h3>Round ${r.round}</h3>${r.byeId?`<div class="lala-bye">${lalaQueenChip(r.byeId,'bye')}</div>`:''}<div class="lala-duel-list">${r.duels.map(duelHtml).join('')}</div></div>`).join('');
  const playerOut=result.eliminatedQueenId===gameState.playerQueenId;
  const spectatorMode=!!gameState.season?.spectatorMode;
  const eliminationChoiceBlock=(playerOut && !spectatorMode)
    ? `<div class="card important decision-card"><h3>What do you want to do now?</h3><p>Your queen has been eliminated in the Lalaparuza, but the season can continue without your input.</p><div class="options"><button class="option" id="continueSpectator"><span class="choice-emoji" aria-hidden="true">👁️</span><span class="choice-copy"><strong>Continue watching as a spectator</strong><span class="small">Follow the remaining episodes, reunion and finale.</span></span></button><button class="option" id="seeFinalResult"><span class="choice-emoji" aria-hidden="true">⏭️</span><span class="choice-copy"><strong>See final result</strong><span class="small">Skip the rest of the season and start the finale from page 1/3.</span></span></button></div></div>`
    : '';
  const continueButton=(playerOut && !spectatorMode) ? '' : `<button id="continue">Next episode</button>`;
  setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader('Lip Sync Smackdown','LALAPARUZA','danger','The queens must lip sync for their survival.')}</div>${rows}<div class="card important lala-final-card"><h3>Final Bottom Lip Sync</h3><div class="lala-duel final">${lalaQueenChip(result.final.queenIds[0], result.final.winnerId===result.final.queenIds[0]?'survives':'sashay')}<span class="vs">VS</span>${lalaQueenChip(result.final.queenIds[1], result.final.winnerId===result.final.queenIds[1]?'survives':'sashay')}</div><p><strong>${escapeHtml(qName(result.final.winnerId))}</strong> survives the final lip sync. <strong>${escapeHtml(qName(result.final.loserId))}</strong> sashays away.</p></div>${eliminationChoiceBlock}${continueButton}</section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(()=>renderLalaparuzaResult(result)));
  const continueAfterLalaparuza=()=>{if(isFinaleReady()){if(shouldOfferReunionSmackdown())renderReunionSmackdown(); else {renderFinale();}}else{generateEpisode(); renderWorkroom();}};
  document.querySelector('#continue')?.addEventListener('click',continueAfterLalaparuza);
  document.querySelector('#continueSpectator')?.addEventListener('click',()=>{gameState.season.spectatorMode=true; saveGame(); continueAfterLalaparuza();});
  document.querySelector('#seeFinalResult')?.addEventListener('click',()=>{skipToFinaleStart();});
}

function renderReturnSmackdownEpisode(){
  const ep=gameState.currentEpisode;
  const type=ep.returnSmackdownType || gameState.season?.returnTwist?.type || 'legacy_smackdown';
  const isRedemption=type==='redemption_smackdown';
  const title=isRedemption?'Redemption Lip Sync Smackdown':'Lip Sync Smackdown Return';
  const participants=(ep.participantIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const playerInSmackdown=(ep.participantIds||[]).includes(gameState.playerQueenId);
  const playerNeedsStrategy=playerInSmackdown && !ep.playerSmackdownStrategy;
  const names=participants.map(q=>escapeHtml(q.name)).join(', ');
  setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader(title,'RETURN TWIST','danger','One eliminated queen can fight her way back into the competition.')}</div><div class="card"><h3>The eliminated queens return</h3><p>${isRedemption?'The first eliminated queen starts the bracket and each winner faces the next eliminated queen in order.':'The eliminated queens enter a lip sync bracket. Winners advance until one queen remains.'}</p>${names?`<h4>Competing queens</h4><p>${names}</p>`:''}</div>${playerNeedsStrategy?`<div class="card important decision-card"><h3>Your lip sync strategy</h3><p>You were eliminated, so choose how you will fight for your return.</p>${smackdownStrategyOptionsHtml()}</div>`:`<button id="startReturnSmackdown">Start the return smackdown</button>`}</section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderReturnSmackdownEpisode));
  if(playerNeedsStrategy){
    document.querySelectorAll('[data-smack-strategy]').forEach(btn=>btn.addEventListener('click',()=>{
      ep.playerSmackdownStrategy=btn.dataset.smackStrategy;
      const result=resolveReturnSmackdown();
      renderReturnSmackdownResult(result);
    }));
    return;
  }
  document.querySelector('#startReturnSmackdown')?.addEventListener('click',()=>{
    const result=resolveReturnSmackdown();
    renderReturnSmackdownResult(result);
  });
}
function renderReturnSmackdownResult(result){
  if(!result){generateEpisode(); return renderWorkroom();}
  const type=result.type || gameState.currentEpisode?.returnSmackdownType || 'legacy_smackdown';
  const isRedemption=type==='redemption_smackdown';
  const title=isRedemption?'Redemption Lip Sync Smackdown':'Lip Sync Smackdown Return';
  const queenById=(id)=>gameState.queens.find(q=>q.id===id);
  const chip=(id,mark='')=>{const q=queenById(id); return `<div class="lala-queen-chip ${mark?`lala-${mark}`:''}">${q?queenPortraitHtml(q,'md'):''}<strong>${escapeHtml(qName(id))}</strong>${mark?`<span class="small">${escapeHtml(mark)}</span>`:''}</div>`;};
  const duelHtml=(d)=>`<div class="lala-duel">${chip(d.queenIds[0],d.winnerId===d.queenIds[0]?'wins':'out')}<span class="vs">VS</span>${chip(d.queenIds[1],d.winnerId===d.queenIds[1]?'wins':'out')}</div>`;
  const rows=(result.rounds||[]).map(r=>`<div class="card lala-round-card"><h3>Round ${r.round}</h3>${r.byeId?`<div class="lala-bye">${chip(r.byeId,'bye')}</div>`:''}<div class="lala-duel-list">${(r.duels||[]).map(duelHtml).join('')}</div></div>`).join('');
  const winner=queenById(result.winnerId);
  setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader(title,'RETURN TWIST','danger','The battle for a place back in the race is decided.')}</div>${rows}<div class="card important lala-final-card"><h3>A queen returns to the competition.</h3>${winner?`<div class="winner-portrait-wrap">${queenPortraitHtml(winner,'xl','winner-portrait')}</div>`:''}<p><strong>${escapeHtml(qName(result.winnerId))}</strong> has earned her way back into the race.</p></div><button id="continueAfterReturnSmackdown">Continue to the next episode</button></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(()=>renderReturnSmackdownResult(result)));
  document.querySelector('#continueAfterReturnSmackdown')?.addEventListener('click',()=>{gameState.currentEpisode=null; saveGame(); generateEpisode(); renderWorkroom();});
}

function challengeContentBlock(ep){
  const c=ep.challengeContent||{};
  if(ep.challengeType==='ball' && c.runwayCategories?.length){
    return `<div class="card"><h3>${escapeHtml(c.challengeTitle||'The Ball')}</h3><p class="small">${escapeHtml(c.challengePrompt||'Three categories. One runway war.')}</p><ol>${c.runwayCategories.map(cat=>`<li><strong>Category is:</strong> ${escapeHtml(cat)}</li>`).join('')}</ol></div>`;
  }
  if(ep.challengeType==='fashion_wars'){
    const battles=(c.battles||[]).map(b=>`<li><strong>${escapeHtml(b.title||'Fashion Duel')}</strong><br><span class="small">${escapeHtml(b.prompt||'Create a winning design look.')}</span></li>`).join('');
    return `<div class="card"><h3>${escapeHtml(c.challengeTitle||'The Fashion Wars')}</h3><p>${escapeHtml(c.challengePrompt||'Design battle by battle. Each victory scores a point.')}</p>${battles?`<ol>${battles}</ol>`:''}</div>`;
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
  const ep=gameState.currentEpisode;
  if(!ep){generateEpisode(); return renderWorkroom();}
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
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero">
      <span class="badge">Episode ${ep.number}</span>
      <h2>${escapeHtml(ep.themeName)}</h2>
      <p>${escapeHtml(ep.challengeName)} • ${escapeHtml(ep.structure?.label||'Solo challenge')} • Runway: ${escapeHtml(ep.runwayCategory)}</p>
      <p>${escapeHtml(ep.themeNotes||'')}</p>
      <div class="guest-judge-callout"><span>Guest Judge</span><strong>${escapeHtml(ep.guestJudge?.name||'Guest Judge')}</strong><em>${escapeHtml(ep.guestJudge?.note||'Ready for the show.')}</em></div>
      
    </div>
    ${returnBlock}
    ${teamFormationBlock(ep)}
    <div class="card">
      <h3>Workroom</h3>
      <p>${ep.miniChallenge?`A mini challenge took place. Winner: <strong>${escapeHtml(ep.miniWinnerName)}</strong>.`:'No mini challenge today. The dolls get straight to work.'}</p>
      <h4>Story Beats</h4>
      <ul>${workroomPulse}</ul>
      ${ep.teams?.length?`<h4>Teams</h4><ul class="episode-team-list">${ep.teams.map((t,i)=>`<li class="episode-team-line team-line-${i%8}"><strong>${escapeHtml(t.name)}</strong>: ${t.queenIds.map(id=>{const q=gameState.queens.find(q=>q.id===id); return q?queenTeamNameHtml(q):'';}).filter(Boolean).join(', ')}</li>`).join('')}</ul>`:''}${ep.npcChoiceNotes?`<h4>What the other queens are doing</h4><ul>${ep.npcChoiceNotes.slice(0,6).map(n=>`<li>${escapeHtml(n)}</li>`).join('')}</ul>`:''}
    </div>
    ${challengeContentBlock(ep)}
    ${talentContentBlock(ep)}
    ${snatchBlock}
    <div id="decisionStep"></div>
    <div class="card subtle"><button id="skipWorkroom" class="secondary">Go to Main Stage</button><p class="small">Skip the remaining Workroom choices. No extra preparation bonus will be applied, and the judges may read that passivity later.</p></div>
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderWorkroom));
  renderWorkroomChoice();
  bindSkipWorkroom();
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
  return `<button class="option" ${dataAttr}="${id}" ${extraAttrs}><span class="choice-emoji" aria-hidden="true">${choiceEmoji(id)}</span><span class="choice-copy"><strong>${escapeHtml(obj.label)}</strong><span class="small">${escapeHtml(obj.description||'')}</span></span></button>`;
}
function targetSelectHtml(id='targetSelect'){
  let targets=getUntuckedTargets();
  if(String(id).toLowerCase().includes('prep')){
    const ids=gameState.currentEpisode?.participantIds;
    if(ids?.length) targets=targets.filter(q=>ids.includes(q.id));
  }
  return `<label>Choose a queen<select id="${id}">${targets.map(q=>`<option value="${q.id}">${escapeHtml(q.name)} — ${escapeHtml(playerRelationshipLabel(q.id))}</option>`).join('')}</select></label>`;
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
  document.querySelector('#decisionStep').innerHTML=`<div class="card decision-card"><h3>Preparation</h3><p>Your prep affects this episode and your long-term image.</p><div class="small"><strong>Stamina</strong><br>${stamina} / 100</div>${exhaustedMsg}<div class="options">${prepButtons}</div><div id="prepTarget"></div></div>`;
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
