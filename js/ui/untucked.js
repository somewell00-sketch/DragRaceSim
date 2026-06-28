

function episodePlacementSortValue(p){
  // Episode Results order: WIN must appear above TOP2.
  const order={WIN:0,TOP2:1,HIGH:2,SAFE:3,LOW:4,BTM:5,'LIPSYNC WIN':5,ELIM:6};
  return order[p.placement] ?? 9;
}
function episodeResultTable(){
  const ep=gameState.currentEpisode;
  const placements=[...(ep?.placements||[])].sort((a,b)=>episodePlacementSortValue(a)-episodePlacementSortValue(b)||(b.score||0)-(a.score||0)||String(a.name).localeCompare(String(b.name)));
  if(!placements.length)return '';
  return `<div class="card"><h3>Episode Results</h3><div class="table-wrap"><table><thead><tr><th></th><th>Queen</th><th>Placement</th><th>Approach</th></tr></thead><tbody>${placements.map(p=>{const q=gameState.queens.find(x=>x.id===p.queenId); return `<tr><td>${q?queenPortraitHtml(q,'xs'):''}</td><td><strong>${escapeHtml(p.name)}</strong></td><td>${placementBadge(p.placement)}</td><td>${escapeHtml(p.riskLabel||'—')}</td></tr>`;}).join('')}</tbody></table></div></div>`;
}

function renderUntucked(){
  const ep=gameState.currentEpisode;
  const eliminatedIds=ep.lipSyncResult?.eliminatedQueenIds || (ep.eliminatedQueenId?[ep.eliminatedQueenId]:[]);
  const eliminatedNames=eliminatedIds.map(id=>gameState.queens.find(q=>q.id===id)?.name).filter(Boolean);
  const playerJustEliminated=eliminatedIds.includes(gameState.playerQueenId);
  const playerAlreadyEliminated=(gameState.queens.find(q=>q.id===gameState.playerQueenId)?.isEliminated)||false;
  let title='Untucked';
  let desc='The tension finally drops, at least for a second.';
  if(ep.lipSyncResult?.outcome==='doubleShantay') desc='No one went home tonight. The workroom exhales, but the game just got tighter.';
  else if(eliminatedNames.length) desc=`${eliminatedNames.map(escapeHtml).join(' and ')} ${eliminatedNames.length>1?'have':'has'} left the competition.`;
  const spontaneous=generateUntuckedSpontaneous();
  const npcUntuckedEvents=generateNpcSocialEvents('untucked');
  const narrativeEvent=(typeof narrativeEventForEpisode==='function')?narrativeEventForEpisode('untucked'):null;
  const loungeBeats=[...(narrativeEvent?[narrativeEvent]:[]), ...npcUntuckedEvents].slice(0,3);
  const playerObserver=(typeof isCurrentEpisodePremiereObserver==='function' && isCurrentEpisodePremiereObserver());
  const spectatorMode=!!gameState.season?.spectatorMode;
  const choiceDone=!!ep.untuckedChoice || playerJustEliminated || playerObserver || (playerAlreadyEliminated && spectatorMode);
  const eliminationChoiceBlock=(playerJustEliminated && !spectatorMode)
    ? `<div class="card important decision-card"><h3>What do you want to do now?</h3><p>Your queen has been eliminated, but the season can continue without your input.</p><div class="options"><button class="option" id="continueSpectator"><span class="choice-emoji" aria-hidden="true">👁️</span><span class="choice-copy"><strong>Continue watching as a spectator</strong><span class="small">Follow the remaining episodes, runways, lip syncs, reunion and finale.</span></span></button><button class="option" id="seeFinalResult"><span class="choice-emoji" aria-hidden="true">⏭️</span><span class="choice-copy"><strong>See final result</strong><span class="small">Skip the rest of the season and start the finale from page 1/3.</span></span></button></div></div>`
    : '';
  const continueButton=(playerJustEliminated && !spectatorMode) ? '' : `<button id="continue">Next episode</button>`;
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero">
      <span class="badge">Untucked</span>
      <h2>${playerJustEliminated?'Your journey ends here.':title}</h2>
      <p>${desc}</p>
      
    </div>
    <div class="card"><h3>Lounge talk</h3><p>${escapeHtml(spontaneous)}</p>${loungeBeats.length?`<h4>Story Beats</h4><ul>${loungeBeats.map(e=>`<li>${escapeHtml(e.text)}</li>`).join('')}</ul>`:''}</div>
    ${playerObserver?`<div class="card subtle"><h3>Observer mode</h3><p>Your queen is not competing in this premiere episode, so you do not take an Untucked action.</p></div>`:''}
    ${(playerAlreadyEliminated && spectatorMode && !playerJustEliminated)?`<div class="card subtle"><h3>Spectator mode</h3><p>Your queen is out of the competition. You are watching how the rest of the season unfolds.</p></div>`:''}
    <div id="untuckedChoice"></div>
    ${episodeResultTable()}
    ${eliminationChoiceBlock}
    ${continueButton}
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderUntucked));
  if(!choiceDone) renderUntuckedChoice();
  const continueAfterEpisode=()=>{
    if(!playerJustEliminated && !playerObserver && !(playerAlreadyEliminated&&spectatorMode) && !ep.untuckedChoice && typeof applySkippedUntuckedPenalty==='function') applySkippedUntuckedPenalty();
    if(typeof isWaitingForPremiereEntrance==='function' && isWaitingForPremiereEntrance()){ renderEntrance(); return; }
    if(isFinaleReady()){ if(shouldOfferReunionSmackdown()) { renderReunionSmackdown(); return; } renderFinale(); return;}
    generateEpisode(); renderWorkroom();
  };
  document.querySelector('#continue')?.addEventListener('click',continueAfterEpisode);
  document.querySelector('#continueSpectator')?.addEventListener('click',()=>{gameState.season.spectatorMode=true; saveGame(); continueAfterEpisode();});
  document.querySelector('#seeFinalResult')?.addEventListener('click',()=>{skipToFinaleStart();});
}
function untuckedEmoji(id){return {comfort:'💞',provoke:'🧨',apologize:'🕊️',quiet:'🤫',drama:'📺',alliance:'🤝'}[id]||'•';}
function renderUntuckedChoice(){
  const buttons=Object.entries(UNTUCKED_ACTIONS).map(([id,o])=>`<button class="option" data-untucked="${id}"><span class="choice-emoji" aria-hidden="true">${untuckedEmoji(id)}</span><span class="choice-copy"><strong>${escapeHtml(o.label)}</strong><span class="small">${escapeHtml(o.description)}</span></span></button>`).join('');
  document.querySelector('#untuckedChoice').innerHTML=`<div class="card decision-card"><h3>Your Untucked move</h3><p>This is social gameplay. Choose who you are becoming in the lounge.</p><div class="options">${buttons}</div><div id="untuckedTarget"></div></div>`;
  document.querySelectorAll('[data-untucked]').forEach(btn=>btn.addEventListener('click',()=>{
    const id=btn.dataset.untucked;
    const action=UNTUCKED_ACTIONS[id];
    if(action.needsTarget){
      document.querySelector('#untuckedTarget').innerHTML=`<div class="card subtle decision-card"><h4>Choose target</h4>${targetSelectHtml('untuckedTargetSelect')}<button id="confirmUntucked">Confirm</button></div>`;
      document.querySelector('#confirmUntucked').addEventListener('click',()=>{
        applyUntuckedAction(id,document.querySelector('#untuckedTargetSelect').value);
        renderUntuckedResult();
      });
    }else{
      applyUntuckedAction(id,null);
      renderUntuckedResult();
    }
  }));
}
function renderUntuckedResult(){
  const ep=gameState.currentEpisode;
  const note=(ep.playerEffects?.untuckedNotes||[]).slice(-1)[0] || 'The lounge shifts around your choice.';
  document.querySelector('#untuckedChoice').innerHTML=`<div class="card important"><h3>Untucked consequence</h3><p>${escapeHtml(note)}</p><div class="chips"></div></div>`;
  const btn=document.querySelector('#continue');
  btn.textContent='Next episode';
}
function autoSimulateToEnd(){while(!isFinaleReady()){generateEpisode(); if(gameState.currentEpisode.special==='lalaparuza'){resolveLalaparuza(); continue;} calculateEpisodeResults({risk:'safe'}); resolveLipSync(); applyEpisodeStats();} if(shouldOfferReunionSmackdown())resolveReunionSmackdown(); prepareFinale(); crownWinner();}



function reunionStrategyOptionsHtml(){
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
    return choiceButtonHtml({id,attr:'data-reunion-strategy',label,desc,disabled});
  }).join('')}</div><p class="small">Reveals available: ${reveals}</p>`;
}
function renderReunionStrategyChoice(){
  setHTML(`<main class="layout"><section class="screen"><div class="hero"><span class="badge win">Reunion Smackdown</span><h2>Choose your lip sync strategy</h2><p>You were eliminated, so you compete for Queen of She Already Done Had Herses. Your strategy will apply whenever you lip sync in the bracket.</p></div><div class="card decision-card important"><h3>Your approach</h3>${reunionStrategyOptionsHtml()}</div></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderReunionStrategyChoice));
  document.querySelectorAll('[data-reunion-strategy]').forEach(btn=>btn.addEventListener('click',()=>{
    gameState.currentEpisode=gameState.currentEpisode||{};
    gameState.season.reunionPlayerStrategy=btn.dataset.reunionStrategy;
    const result=resolveReunionSmackdown();
    renderReunionSmackdownResult(result);
  }));
}
function renderReunionSmackdownResult(result){
  const duelHtml=(d)=>`<div class="reunion-duel">
    <span class="reunion-duel-queen ${d.winnerId===d.queenIds[0]?'is-winner':'is-loser'}"><strong>${escapeHtml(qName(d.queenIds[0]))}</strong>${d.winnerId===d.queenIds[0]?'<em>advances</em>':''}</span>
    <span class="vs">VS</span>
    <span class="reunion-duel-queen ${d.winnerId===d.queenIds[1]?'is-winner':'is-loser'}"><strong>${escapeHtml(qName(d.queenIds[1]))}</strong>${d.winnerId===d.queenIds[1]?'<em>advances</em>':''}</span>
  </div>`;
  const rows=result.rounds.map(r=>`<div class="card reunion-round-card"><h3>Reunion Round ${r.round}</h3>${r.byeId?`<p class="reunion-bye"><strong>${escapeHtml(qName(r.byeId))}</strong> receives a bye.</p>`:''}<div class="reunion-duel-list">${r.duels.map(duelHtml).join('')}</div></div>`).join('');
  const reunionWinner=gameState.queens.find(q=>q.id===result.winnerId);
  setHTML(`<main class="layout"><section class="screen"><div class="hero"><span class="badge win">Reunion Smackdown</span><h2>Queen of She Already Done Had Herses</h2><p>The eliminated queens return for a lip sync bracket before the finale.</p></div>${rows}<div class="card important reunion-winner-card"><h3>Queen of She Already Done Had Herses.</h3>${reunionWinner?`<div class="winner-portrait-wrap">${queenPortraitHtml(reunionWinner,'xl','winner-portrait')}</div>`:''}<p><strong>${escapeHtml(qName(result.winnerId))}</strong></p></div><button id="toFinale">Continue to the Finale</button></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(()=>renderReunionSmackdownResult(result)));
  document.querySelector('#toFinale').addEventListener('click',()=>{renderFinale();});
}

function renderReunionSmackdown(){
  const playerEliminated=(gameState.eliminatedQueens||[]).some(q=>q.id===gameState.playerQueenId);
  if(playerEliminated && !(gameState.season?.reunionResult) && !(gameState.season?.reunionPlayerStrategy)){
    renderReunionStrategyChoice();
    return;
  }
  const result=resolveReunionSmackdown();
  renderReunionSmackdownResult(result);
}
