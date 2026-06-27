
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
    ['dance','💃 Dance the House Down','Attack the rhythm and try to own the stage.'],
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

function talentContentBlock(ep){
  const talents=ep.challengeContent?.talents||[];
  if(!talents.length)return '';
  return `<div class="card"><h3>Talent Show Lineup</h3><div class="talent-grid">${talents.map(t=>{const type=String(t.talent.type||'performance'); const icon={music:'🎵',acting:'🎭',weird:'✨',theatre:'📖',stunt:'🤸',vocals:'🎤',comedy:'😂',dance:'💃'}[type]||'🌟'; return `<article class="queen-item talent-card"><strong>${escapeHtml(t.queenName)}</strong><span class="talent-name">${icon} ${escapeHtml(t.talent.name||t.talent)}</span><span class="badge arc">${escapeHtml(type)}</span></article>`;}).join('')}</div></div>`;
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
  const productionEvent=(ep.event&&ep.event.text)?[{text:ep.event.text,type:'production'}]:[];
  const eventList=[...productionEvent, ...(ep.socialEvents||[]), ...npcEvents, ...(narrativeEvent?[narrativeEvent]:[])].map(e=>`<li>${formatPlayerNameInSocialText(e.text)}</li>`).join('');
  const activeNames=(ep.participantIds||[]).map(id=>gameState.queens.find(q=>q.id===id)?.name).filter(Boolean).map(escapeHtml).join(', ');
  return `<div class="card"><h3>Workroom</h3><p>The queens enter knowing tonight is not a normal challenge. Every lipstick, heel, and hair flip could become survival.</p><h4>Social sparks</h4><ul>${eventList||'<li>The room gets quiet. Everyone can feel the twist coming.</li>'}</ul>${visibleDriftNotes.length?`<h4>Relationship shifts</h4><ul>${visibleDriftNotes.map(n=>`<li>${formatPlayerNameInSocialText(n)}</li>`).join('')}</ul>`:''}${activeNames?`<h4>Competing queens</h4><p>${activeNames}</p>`:''}</div>`;
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
function challengeContentBlock(ep){
  const c=ep.challengeContent||{};
  if(ep.challengeType==='ball' && c.runwayCategories?.length){
    return `<div class="card"><h3>${escapeHtml(c.challengeTitle||'The Ball')}</h3><p class="small">${escapeHtml(c.challengePrompt||'Three categories. One runway war.')}</p><ol>${c.runwayCategories.map(cat=>`<li><strong>Category is:</strong> ${escapeHtml(cat)}</li>`).join('')}</ol></div>`;
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
  if(!ep.placements?.length)calculateEpisodeResults({risk:'safe'});
  const groupLabel=ep.premiereSpecial?.phase?`Premiere Part ${ep.premiereSpecial.phase}`:'Premiere';
  const names=currentEpisodeParticipantNames().map(escapeHtml).join(', ');
  const talent=talentContentBlock(ep);
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero"><span class="badge">${escapeHtml(groupLabel)}</span><h2>${escapeHtml(ep.challengeName||ep.themeName||'Premiere Challenge')}</h2><p>This half of the cast is competing this episode. There are no Workroom decisions for your queen yet.</p></div>
    <div class="card"><h3>Competing queens</h3><p>${names}</p></div>
    ${challengeContentBlock(ep)}
    ${talent}
    <div class="card subtle"><p>You will observe the episode and rejoin the competition when your group is called.</p></div>
    <button id="continue">Watch the Main Stage</button>
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderPremiereObserverWorkroom));
  document.querySelector('#continue').addEventListener('click',()=>renderRunway());
}


function isPlayerEliminatedSpectator(){
  return !!gameState.season?.spectatorMode && !!gameState.queens.find(q=>q.id===gameState.playerQueenId)?.isEliminated;
}
function renderSeasonObserverWorkroom(){
  const ep=gameState.currentEpisode;
  if(!ep){generateEpisode(); return renderSeasonObserverWorkroom();}
  if(ep.special==='lalaparuza')return renderLalaparuzaEpisode();
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

function renderWorkroom(){
  const ep=gameState.currentEpisode;
  if(!ep){generateEpisode(); return renderWorkroom();}
  if(ep.special==='lalaparuza')return renderLalaparuzaEpisode();
  if(typeof isCurrentEpisodePremiereObserver==='function' && isCurrentEpisodePremiereObserver())return renderPremiereObserverWorkroom();
  if(isPlayerEliminatedSpectator())return renderSeasonObserverWorkroom();
  ensureAllQueenV14Stats();
  applyWeeklyWearAndTear();
  generateWorkroomSocialEvents();
  const npcEvents=generateNpcSocialEvents('workroom');
  const narrativeEvent=(typeof narrativeEventForEpisode==='function')?narrativeEventForEpisode('workroom'):null;
  const driftNotes = evolveRelationshipsDuringEpisode();
  const visibleDriftNotes = selectVisibleRelationshipShiftNotes(driftNotes);
  const productionEvent=(ep.event&&ep.event.text)?[{text:ep.event.text,type:'production'}]:[];
  const eventList=[...productionEvent, ...(ep.socialEvents||[]), ...npcEvents, ...(narrativeEvent?[narrativeEvent]:[])].map(e=>`<li>${formatPlayerNameInSocialText(e.text)}</li>`).join('');
  const snatchBlock=(ep.challengeType==='snatchgame' && ep.snatchCharacters?.length)
    ? `<div class="card"><h3>Snatch Game Characters</h3><div class="snatch-grid">${ep.snatchCharacters.map(c=>`<div class="snatch-card"><strong>${escapeHtml(c.queenName)}</strong><span>${escapeHtml(c.character)}</span></div>`).join('')}</div></div>`
    : '';
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero">
      <span class="badge">Episode ${ep.number}</span>
      <h2>${escapeHtml(ep.themeName)}</h2>
      <p>${escapeHtml(ep.challengeName)} • ${escapeHtml(ep.structure?.label||'Solo challenge')} • Runway: ${escapeHtml(ep.runwayCategory)}</p>
      <p>${escapeHtml(ep.themeNotes||'')}</p>
      <p>Guest judge: <strong>${escapeHtml(ep.guestJudge?.name||'Guest Judge')}</strong> — ${escapeHtml(ep.guestJudge?.note||'Ready for the show.')}</p>
      
    </div>
    <div class="card">
      <h3>Workroom</h3>
      <p>${ep.miniChallenge?`A mini challenge took place. Winner: <strong>${escapeHtml(ep.miniWinnerName)}</strong>.`:'No mini challenge today. The dolls get straight to work.'}</p>
      <h4>Social sparks</h4>
      <ul>${eventList}</ul>${ep.teams?.length?`<h4>Teams</h4><ul>${ep.teams.map(t=>`<li><strong>${escapeHtml(t.name)}</strong>: ${t.queenIds.map(id=>escapeHtml(gameState.queens.find(q=>q.id===id)?.name||'')).join(', ')}</li>`).join('')}</ul>`:''}${visibleDriftNotes.length?`<h4>Relationship shifts</h4><ul>${visibleDriftNotes.map(n=>`<li>${formatPlayerNameInSocialText(n)}</li>`).join('')}</ul>`:''}${ep.npcChoiceNotes?`<h4>What the other queens are doing</h4><ul>${ep.npcChoiceNotes.slice(0,6).map(n=>`<li>${escapeHtml(n)}</li>`).join('')}</ul>`:''}
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
    ep.workroomComplete=true;
    if(typeof applyPassiveWorkroomPenalty==='function') applyPassiveWorkroomPenalty();
    if(!ep.placements?.length)calculateEpisodeResults({risk:'safe'});
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
function optionButton(id, dataAttr, obj){
  return `<button class="option" ${dataAttr}="${id}"><span class="choice-emoji" aria-hidden="true">${choiceEmoji(id)}</span><span class="choice-copy"><strong>${escapeHtml(obj.label)}</strong><span class="small">${escapeHtml(obj.description||'')}</span></span></button>`;
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
    applyPlayerEffects(choice.effects,choice.text);
    renderPreparationChoice();
  }));
}
function renderPreparationChoice(){
  const prepButtons=Object.entries(PREP_CHOICES).map(([id,o])=>optionButton(id,'data-prep',o)).join('');
  document.querySelector('#decisionStep').innerHTML=`<div class="card decision-card"><h3>Preparation</h3><p>Your prep affects this episode and your long-term image.</p><div class="options">${prepButtons}</div><div id="prepTarget"></div></div>`;
  document.querySelectorAll('[data-prep]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.prep;
    const choice=PREP_CHOICES[id];
    if(choice.needsTarget){
      document.querySelector('#prepTarget').innerHTML=`<div class="card subtle decision-card"><h4>Who do you ask?</h4>${targetSelectHtml('prepTargetSelect')}<button id="confirmPrep">Confirm</button></div>`;
      document.querySelector('#confirmPrep').addEventListener('click',()=>{
        const targetId=document.querySelector('#prepTargetSelect').value;
        const target=gameState.queens.find(q=>q.id===targetId);
        gameState.currentEpisode.prepChoice=`${choice.label}: ${target?.name||'another queen'}`;
        if(choice.isSabotage && typeof applySabotageAttempt==='function'){
          applySabotageAttempt(targetId);
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
    calculateEpisodeResults({risk:choice.risk});
    renderRunway();
  }));
}
