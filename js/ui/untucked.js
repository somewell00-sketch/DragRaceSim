

function episodePlacementSortValue(p){
  // Episode Results order: WIN must appear above TOP2.
  const order={WIN:0,TOP2:1,HIGH:2,SAFE:3,LOW:4,BTM:5,'LIPSYNC WIN':5,ELIM:6};
  return order[p.placement] ?? 9;
}
function episodeResultTable(){
  const ep=gameState.currentEpisode;
  const placements=[...(ep?.placements||[])].sort((a,b)=>episodePlacementSortValue(a)-episodePlacementSortValue(b)||(b.score||0)-(a.score||0)||String(a.name).localeCompare(String(b.name)));
  if(!placements.length)return '';
  const isTournament=ep?.special==='tournament_bracket';
  const isAllWinners=typeof getSeasonFormat==='function' && getSeasonFormat()==='all_winners';
  const pointsFor=(id)=>Number(gameState.season?.brackets?.pointsByQueenId?.[id] ?? gameState.queens.find(q=>q.id===id)?.tournamentPoints ?? 0);
  const starAwardFor=(id)=>ep?.allWinnersStarAwards?.find(a=>a.queenId===id);
  const allWinnersNotes=isAllWinners?`<div class="commentary-block"><p>${escapeHtml(ep.lipSyncResult?.survivorId?queenNameById(ep.lipSyncResult.survivorId):'The winner')} is the Top All Star of the Week.${ep.blockedQueenId?` ${escapeHtml(queenNameById(ep.blockedQueenId))} is blocked for the next episode.`:''}</p>${(ep.allWinnersBlockedNoStar||[]).map(id=>`<p>Because ${escapeHtml(queenNameById(id))} was blocked, she does not receive a Legendary Legend Star.</p>`).join('')}<pre>${escapeHtml(ep.allWinnersScoreboard||'')}</pre></div>`:'';
  return `<div class="card"><h3>Episode Results</h3>${allWinnersNotes}<div class="table-wrap"><table><thead><tr><th></th><th>Queen</th><th>Placement</th>${isTournament?'<th>Points</th>':(isAllWinners?'<th>Stars</th>':'<th>Approach</th>')}</tr></thead><tbody>${placements.map(p=>{const q=gameState.queens.find(x=>x.id===p.queenId); const award=starAwardFor(p.queenId); return `<tr><td>${q?queenPortraitHtml(q,'xs'):''}</td><td><strong>${escapeHtml(p.name)}</strong></td><td>${placementBadge(p.placement)}</td>${isTournament?`<td><strong>${pointsFor(p.queenId)}</strong></td>`:(isAllWinners?`<td>${award?(award.blocked?'Blocked':`+${award.amount}`):'—'}</td>`:`<td>${escapeHtml(p.riskLabel||'—')}</td>`)}</tr>`;}).join('')}</tbody></table></div></div>`;
}

function tournamentPointVoteTable(){
  const ep=gameState.currentEpisode;
  if(ep?.special!=='tournament_bracket')return '';
  const votes=ep.lipSyncResult?.tournamentVotes || ep.tournamentVotes || {};
  const voterIds=Object.keys(votes).filter(Boolean).sort((a,b)=>queenNameById(a).localeCompare(queenNameById(b)));
  if(!voterIds.length)return '';
  return `<div class="card"><h3>Point Votes</h3><div class="table-wrap tournament-vote-table"><table><thead><tr><th>Queen</th><th>Voted For</th></tr></thead><tbody>${voterIds.map(voterId=>`<tr><td><strong>${escapeHtml(queenNameById(voterId))}</strong></td><td>${escapeHtml(queenNameById(votes[voterId]))}</td></tr>`).join('')}</tbody></table></div></div>`;
}

function assassinLipstickTable(){
  const ep=gameState.currentEpisode;
  const result=ep?.lipSyncResult;
  if(!result || result.outcome!=='assassinElimination')return '';
  const qName=id=>gameState.queens.find(q=>q.id===id)?.name || '—';
  const rows=[];
  const episodeVoterIds=new Set((ep.placements||[]).map(p=>p.queenId).filter(Boolean));
  const top=gameState.queens.find(q=>q.id===result.topQueenId);
  if(top && episodeVoterIds.has(top.id)){
    rows.push({voterId:top.id, voter:top.name, vote:result.topVote, isTop:true});
  }
  const groupVotes=result.rawGroupVotes || ep.assassinGroupVotes || {};
  Object.entries(groupVotes).forEach(([voterId,voteId])=>{
    if(voterId===result.topQueenId || voterId==='lip_sync_assassin' || !episodeVoterIds.has(voterId))return;
    const voter=gameState.queens.find(q=>q.id===voterId);
    if(voter)rows.push({voterId, voter:voter.name, vote:voteId, isTop:false});
  });
  return `<div class="card"><h3>Lipstick Votes</h3><div class="table-wrap"><table><thead><tr><th>Queen</th><th>Lipstick</th></tr></thead><tbody>${rows.sort((a,b)=>a.voter.localeCompare(b.voter)).map(r=>`<tr><td><strong class="${r.isTop?'lipstick-vote-top':''}">${escapeHtml(r.voter)}</strong></td><td>${escapeHtml(r.voteLabel || queenNameById(r.vote))}</td></tr>`).join('')}</tbody></table></div></div>`;
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
  const loungeBeatPool=[...(narrativeEvent?[narrativeEvent]:[]), ...npcUntuckedEvents];
  const loungeBeats=(typeof weightedPickDiverseStoryEvents==='function')
    ? weightedPickDiverseStoryEvents(loungeBeatPool,3,eventNarrativeWeight)
    : loungeBeatPool.slice(0,3);
  const playerObserver=(typeof isCurrentEpisodePremiereObserver==='function' && isCurrentEpisodePremiereObserver()) || (ep?.special==='tournament_bracket' && ep?.participantIds && !ep.participantIds.includes(gameState.playerQueenId));
  const needsTournamentPointVote=ep?.special==='tournament_bracket'
    && ep?.participantIds?.includes(gameState.playerQueenId)
    && !(ep.top2Queens||[]).includes(gameState.playerQueenId)
    && !ep.playerTournamentPointVoteChosen
    && !ep.statsApplied;
  const spectatorMode=!!gameState.season?.spectatorMode;
  const choiceDone=needsTournamentPointVote || ep?.special==='tournament_bracket' || !!ep.untuckedChoice || playerJustEliminated || playerObserver || (playerAlreadyEliminated && spectatorMode);
  const eliminationChoiceBlock=(playerJustEliminated && !spectatorMode)
    ? `<div class="card important decision-card"><h3>What do you want to do now?</h3><p>Your queen has been eliminated, but the season can continue without your input.</p><div class="options"><button class="option" id="continueSpectator"><span class="choice-emoji" aria-hidden="true">👁️</span><span class="choice-copy"><strong>Continue watching as a spectator</strong><span class="small">Follow the remaining episodes, runways, lip syncs, reunion and finale.</span></span></button><button class="option" id="seeFinalResult"><span class="choice-emoji" aria-hidden="true">⏭️</span><span class="choice-copy"><strong>See final result</strong><span class="small">Skip the rest of the season and start the finale from page 1/3.</span></span></button></div></div>`
    : '';
  const continueButton=(needsTournamentPointVote || (playerJustEliminated && !spectatorMode)) ? '' : `<button id="continue">Next episode</button>`;
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero">
      <span class="badge">Untucked</span>
      <h2>${playerJustEliminated?'Your journey ends here.':title}</h2>
      <p>${desc}</p>
      
    </div>
    <div class="card"><h3>Lounge talk</h3><p>${escapeHtml(spontaneous)}</p>${loungeBeats.length?`<h4>Story Beats</h4><ul>${loungeBeats.map(e=>`<li>${escapeHtml(e.text)}</li>`).join('')}</ul>`:''}</div>
    ${playerObserver?`<div class="card subtle"><h3>Observer mode</h3><p>Your queen is not competing in this episode, so you do not take an Untucked action.</p></div>`:''}
    ${(playerAlreadyEliminated && spectatorMode && !playerJustEliminated)?`<div class="card subtle"><h3>Spectator mode</h3><p>Your queen is out of the competition. You are watching how the rest of the season unfolds.</p></div>`:''}
    <div id="untuckedChoice">${needsTournamentPointVote?'<div class="card decision-card important" id="tournamentPointVoteChoice"></div>':''}</div>
    ${needsTournamentPointVote?'':tournamentPointVoteTable()}
    ${needsTournamentPointVote?'':episodeResultTable()}
    ${needsTournamentPointVote?'':assassinLipstickTable()}
    ${eliminationChoiceBlock}
    ${continueButton}
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderUntucked));
  if(needsTournamentPointVote){
    renderTournamentPointVoteChoice(()=>{
      applyEpisodeStats();
      renderUntucked();
    });
  } else if(!choiceDone) renderUntuckedChoice();
  const continueAfterEpisode=()=>{
    if(ep?.special!=='tournament_bracket' && !playerJustEliminated && !playerObserver && !(playerAlreadyEliminated&&spectatorMode) && !ep.untuckedChoice && typeof applySkippedUntuckedPenalty==='function') applySkippedUntuckedPenalty();
    if(typeof shouldShowTournamentBracketResults==='function' && shouldShowTournamentBracketResults()){ renderTournamentBracketResults(); return; }
    if(typeof isWaitingForTournamentEntrance==='function' && isWaitingForTournamentEntrance()){ renderEntrance(); return; }
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
    <span class="reunion-duel-queen ${d.winnerId===d.queenIds[0]?'is-winner':'is-loser'}"><strong>${escapeHtml(queenNameById(d.queenIds[0]))}</strong>${d.winnerId===d.queenIds[0]?'<em>advances</em>':''}</span>
    <span class="vs">VS</span>
    <span class="reunion-duel-queen ${d.winnerId===d.queenIds[1]?'is-winner':'is-loser'}"><strong>${escapeHtml(queenNameById(d.queenIds[1]))}</strong>${d.winnerId===d.queenIds[1]?'<em>advances</em>':''}</span>
  </div>`;
  const rows=result.rounds.map(r=>`<div class="card reunion-round-card"><h3>Reunion Round ${r.round}</h3>${r.byeId?`<p class="reunion-bye"><strong>${escapeHtml(queenNameById(r.byeId))}</strong> receives a bye.</p>`:''}<div class="reunion-duel-list">${r.duels.map(duelHtml).join('')}</div></div>`).join('');
  const reunionWinner=gameState.queens.find(q=>q.id===result.winnerId);
  setHTML(`<main class="layout"><section class="screen"><div class="hero"><span class="badge win">Reunion Smackdown</span><h2>Queen of She Already Done Had Herses</h2><p>The eliminated queens return for a lip sync bracket before the finale.</p></div>${rows}<div class="card important reunion-winner-card"><h3>Queen of She Already Done Had Herses.</h3>${reunionWinner?`<div class="winner-portrait-wrap">${queenPortraitHtml(reunionWinner,'xl','winner-portrait')}</div>`:''}<p><strong>${escapeHtml(queenNameById(result.winnerId))}</strong></p></div><button id="toFinale">Continue to the Finale</button></section>${queenSidebar()}</main>`);
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


function shouldShowTournamentBracketResults(){
  const b=gameState.season?.brackets;
  return !!(b && b.pendingBracketResult && !b.pendingBracketResult.seen);
}

function tournamentResultPointsFor(id){
  return Number(gameState.season?.brackets?.pointsByQueenId?.[id] ?? gameState.queens.find(q=>q.id===id)?.tournamentPoints ?? 0);
}

function tournamentResultQueenCard(id, idx, totalAdvancing){
  const q=gameState.queens.find(x=>x.id===id);
  if(!q)return '';
  const points=tournamentResultPointsFor(id);
  const line=idx===0
    ? 'You are the highest-scoring queen of this bracket. You have earned your place in the Semi-Finals.'
    : (idx===2 && totalAdvancing>2
      ? 'I have decided that three queens from this bracket deserve to continue. You are also advancing.'
      : 'You are advancing to the Semi-Finals.');
  return `<div class="card important bracket-result-card">
    <span class="badge">ADVANCES</span>
    <div class="runway-look-head">${queenPortraitHtml(q,'lg')}<div><h3>${queenTeamNameHtml(q)}</h3><p>${escapeHtml(line)}</p><p><strong>${points} Tournament Point${points===1?'':'s'}</strong></p></div></div>
  </div>`;
}

function tournamentResultRankingTable(result){
  const rows=(result?.rankedQueenIds||[]).map((id,idx)=>{
    const q=gameState.queens.find(x=>x.id===id);
    if(!q)return '';
    const adv=(result.advancedQueenIds||[]).includes(id);
    return `<tr><td>${idx+1}</td><td><strong>${queenTeamNameHtml(q)}</strong></td><td><strong>${tournamentResultPointsFor(id)}</strong></td><td>${adv?'<span class="badge">ADV</span>':'—'}</td></tr>`;
  }).join('');
  return `<div class="card subtle"><h3>Final Bracket Points</h3><div class="table-wrap"><table><thead><tr><th>#</th><th>Queen</th><th>Points</th><th></th></tr></thead><tbody>${rows}</tbody></table></div></div>`;
}

function renderTournamentBracketResults(){
  const b=gameState.season?.brackets;
  const result=b?.pendingBracketResult;
  if(!result){ renderUntucked(); return; }
  const group=result.group || '';
  const advanced=result.advancedQueenIds||[];
  const eliminated=result.eliminatedQueenIds||[];
  const eliminatedNames=eliminated.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean).map(q=>`<strong>${queenTeamNameHtml(q)}</strong>`).join(', ');
  const tieCard=result.tieBroken
    ? `<div class="card dramatic"><h3>RuPaul Breaks the Tie</h3><p>We have a tie. As host of this competition, the final decision is mine.</p></div>`
    : '';
  const thirdCard=advanced.length>2
    ? `<div class="card dramatic"><h3>One More Queen Advances</h3><p>This bracket has earned an additional spot in the Semi-Finals.</p></div>`
    : '';
  const notAdvancing=eliminated.length
    ? `<div class="card"><h3>Not Advancing</h3><p>${eliminatedNames}</p><p>I'm sorry, my dears. Today, you will not be advancing to the Semi-Finals.</p><p>But all is not lost.</p></div>`
    : '';
  const returnTease=eliminated.length
    ? `<div class="card important"><h3>Never Say Never</h3><p>One eliminated queen will still have the chance to return later this season.</p></div>`
    : '';
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero"><span class="badge">Bracket ${escapeHtml(group)} Results</span><h2>The decision is made.</h2><p>Ladies... after three weeks of competition, the time has come. Based on your challenge performances and the Tournament Points awarded by your fellow queens, I have made my decision.</p></div>
    ${tieCard}
    ${tournamentResultRankingTable(result)}
    ${advanced.map((id,idx)=>tournamentResultQueenCard(id,idx,advanced.length)).join('')}
    ${thirdCard}
    ${notAdvancing}
    ${returnTease}
    <button id="continueBracketResults">Continue</button>
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderTournamentBracketResults));
  document.querySelector('#continueBracketResults')?.addEventListener('click',()=>{
    if(gameState.season?.brackets?.pendingBracketResult)gameState.season.brackets.pendingBracketResult.seen=true;
    saveGame();
    if(typeof isWaitingForTournamentEntrance==='function' && isWaitingForTournamentEntrance()){ renderEntrance(); return; }
    if(isFinaleReady()){ renderFinale(); return; }
    generateEpisode(); renderWorkroom();
  });
}
