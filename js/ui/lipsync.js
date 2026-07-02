function lipSyncEnergyLabel(song){
  const energy=String(song?.energy||'').toLowerCase();
  if(energy==='high')return '🔥 🔥 🔥 🔥 🔥';
  if(energy==='medium')return '✨ ✨ ✨';
  if(energy==='low')return '🕯️';
  return '';
}

function assassinIntroCardsHtml(ep, duelQueens){
  const assassin=ep?.lipSyncAssassin || {name:'Lip Sync Assassin'};
  const song=ep?.song || {};
  const topQueen=gameState.queens.find(q=>q.id===ep?.topQueenId);
  const duel=(duelQueens||[]).map(q=>`<div class="lipsync-queen">${queenPortraitHtml(q,'xl')}<strong>${escapeHtml(q.name)}</strong></div>`).join('<span class="vs">VS</span>');

  return `<div class="card assassin-intro-card">
    <h3>One All Star stands before me.<br><strong>${escapeHtml(topQueen?.name||'The challenge winner')}</strong></h3>
    <p>Prior to tonight, you were asked to prepare a lip sync performance of <strong>${escapeHtml(song.title||'the song')}</strong> by <strong>${escapeHtml(song.artist||'the artist')}</strong>.</p>   <h3 class="music-cue spotlight-cue">💡 💡 ${lipSyncEnergyLabel(ep.song)} 💡 💡</h3>

    <p>If you win this lip sync, you'll earn a cash tip and the power to eliminate one of the bottom queens.</p>
    <p>But first...</p>
    <p><strong>May this week's Lip Sync Assassin...</strong></p>
  </div>
  <div class="card assassin-reveal-card important">
    <p class="eyebrow">RUVEEEEAAAL YOURSELF!</p>
    <h2>${escapeHtml(assassin.name||'Lip Sync Assassin')}</h2>
    <p>A legendary lip sync assassin enters the stage.</p>
  </div>
  <div class="hero" style="text-align:center;">
    ${bigMomentHeader('The time has come, for you to', 'LIP SYNC FOR YOUR LEGACY', 'win')}
    <p class="eyebrow">The music starts...</p>
    <h2>${escapeHtml(song.title||'The song')}</h2>
    <p style="text-align:center !important; max-width:100%; display:block;">by ${escapeHtml(song.artist||'The artist')}</p>
  <h3 class="music-cue spotlight-cue" style="text-align:center !important; width:100%; display:block;">💡 💡 ${lipSyncEnergyLabel(ep.song)} 💡 💡</h3>
  </div>`;
}

function isPlayerActiveInCurrentEpisode(){
  const ep=gameState.currentEpisode;
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  if(!player || player.isEliminated)return false;
  if(ep?.placements?.length)return ep.placements.some(p=>p.queenId===player.id && p.placement!=='ELIM');
  if(ep?.participantIds?.length)return ep.participantIds.includes(player.id);
  return true;
}

function renderLipSync(){
  const ep=gameState.currentEpisode;
  const isLegacy=getSeasonFormat()==='legacy' && !['premiere_no_elim','lalaparuza'].includes(ep.special);
  const isAssassin=getSeasonFormat()==='assassin' && !['premiere_no_elim','lalaparuza'].includes(ep.special);
  const isTournament=ep.special==='tournament_bracket';
  const isAllWinners=getSeasonFormat()==='all_winners';
  const duelIds=(isAllWinners||isTournament) ? (ep.top2Queens||[]) : (isLegacy ? (ep.top2Queens||[]) : (isAssassin ? [ep.topQueenId,'lip_sync_assassin'] : (ep.special==='premiere_no_elim' ? (ep.top2Queens||[]) : ep.bottomQueens)));
  const bottom=duelIds.map(id=>id==='lip_sync_assassin' ? (ep.lipSyncAssassin||{id:'lip_sync_assassin',name:'Lip Sync Assassin',isAssassin:true,type:'Lip Sync Assassin',attributes:{lipSync:8,cunt:8}}) : gameState.queens.find(q=>q.id===id)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
  const playerInBottom=duelIds.includes(gameState.playerQueenId);
  const badge=(ep.special==='premiere_no_elim'||isLegacy||isAssassin||isTournament||isAllWinners)?(isAssassin?'Lip Sync Assassin':'Top 2 Lip Sync'):'Lip Sync For Your Life';
  const intro=isAssassin ? 'The challenge winner and the Lip Sync Assassin stand before me.' : ((ep.special==='premiere_no_elim'||isLegacy||isTournament||isAllWinners)
    ? '<h3>Two top queens stand before me.</h3>'
    : ((ep.bottomQueens||[]).length===3 ? '<h3>Three queens stand before me.</h3><p>Tonight, all three of you will lip sync for your lives.</p>' : '<h3>Two queens stand before me.</h3>'));
  const prompt=isAssassin
    ? "This is your chance to beat the assassin and make your lipstick count. The time has come... to lip sync for your legacy! Good luck... and don't fuck it up."
    : (isAllWinners
    ? "Ladies, this is your chance to become the Top All Star of the week and block one queen. The time has come... to lip sync for your legacy! Good luck... and don't fuck it up."
    : (isTournament
    ? "Ladies, this is your chance to win an extra tournament point. The time has come... to lip sync for your legacy! Good luck... and don't fuck it up."
    : (isLegacy
    ? "Ladies, this is your chance to win the lip sync and reveal your lipstick. The time has come... to lip sync for your legacy! Good luck... and don't fuck it up."
    : (ep.special==='premiere_no_elim'
      ? "Ladies, this is your chance to snatch the first win of the season. The time has come... to lip sync for the win! Good luck... and don't fuck it up."
      : "Ladies, this is your last chance to impress me and save yourselves from elimination. The time has come... to lip sync for your lives! Good luck... and don't fuck it up."))));
  const normalLipSyncCards=`<div class="hero" style="text-align:center;">${bigMomentHeader('The time has come, for you to', (isAllWinners||isTournament||isLegacy)?'LIP SYNC FOR YOUR LEGACY':(ep.special==='premiere_no_elim'?'LIP SYNC FOR THE WIN':'LIP SYNC FOR YOUR LIFE'), (ep.special==='premiere_no_elim'||isLegacy||isTournament||isAllWinners)?'win':'danger')}<h2 style="text-align:center;">${escapeHtml(ep.song.title)}</h2><p style="text-align:center !important; max-width:100%; display:block;">by ${escapeHtml(ep.song.artist)}</p>  <h3 class="music-cue spotlight-cue" style="text-align:center !important; width:100%; display:block;">💡 💡 ${lipSyncEnergyLabel(ep.song)} 💡 💡</h3>
<div class="lipsync-portraits">${bottom.map(q=>`<div class="lipsync-queen">${queenPortraitHtml(q,'xl')}<strong>${escapeHtml(q.name)}</strong></div>`).join('<span class="vs">VS</span>')}</div></div><div class="card"><p>${intro}</p><p>${escapeHtml(prompt)}</p></div>`;
const assassinCards=assassinIntroCardsHtml(ep,bottom);
  const pendingAssassinTopVote=isAssassin && isPlayerActiveInCurrentEpisode() && gameState.playerQueenId===ep.topQueenId && !ep.playerAssassinLipstickChosen;
  const pendingAssassinGroupVote=isAssassin && isPlayerActiveInCurrentEpisode() && gameState.playerQueenId!==ep.topQueenId && !ep.playerAssassinGroupVoteChosen;
  const initialCards=(isAssassin && (pendingAssassinTopVote||pendingAssassinGroupVote)) ? '' : (isAssassin?assassinCards:normalLipSyncCards);
  setHTML(`<main class="layout"><section class="screen">${initialCards}<div class="card" id="step"></div></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderLipSync));
  if(isLegacy && playerInBottom && !ep.playerLegacyLipstickChosen){
    renderLegacyLipstickChoice(()=>renderLipSyncStrategyChoice());
  } else if(pendingAssassinTopVote){
    renderAssassinLipstickChoice(()=>{
      ep.assassinIntroShown=true;
      saveGame();
      renderLipSync();
    });
  } else if(pendingAssassinGroupVote){
    renderAssassinGroupVoteChoice(()=>{
      const result=resolveLipSync();
      applyEpisodeStats();
      renderLipSyncResult(result);
    });
  } else if(playerInBottom){
    renderLipSyncStrategyChoice();
  } else if(isTournament && isPlayerActiveInCurrentEpisode() && !(ep.top2Queens||[]).includes(gameState.playerQueenId) && !ep.playerTournamentPointVoteChosen){
    const result=resolveLipSync();
    // Tournament point votes happen after the lip sync, inside Untucked.
    // Do not apply episode stats yet because the player's vote still needs to be counted.
    renderLipSyncResult(result);
  } else {
    const result=resolveLipSync();
    applyEpisodeStats();
    renderLipSyncResult(result);
  }
}

function renderLegacyLipstickChoice(onContinue){
  const ep=gameState.currentEpisode;
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const bottomQueens=(ep.bottomQueens||[])
    .map(id=>gameState.queens.find(q=>q.id===id))
    .filter(Boolean)
    .sort((a,b)=>a.name.localeCompare(b.name));
  const step=document.querySelector('#step');
  if(!step || !player || player.isEliminated || !isPlayerActiveInCurrentEpisode() || !bottomQueens.length){
    ep.playerLegacyLipstickChosen=true;
    saveGame();
    onContinue?.();
    return;
  }
  step.classList.add('decision-card','important');
  step.innerHTML=`<h3>Choose Your Lipstick</h3><p>You are in the Top 2. Before the lip sync, choose which bottom queen you would eliminate if you win.</p><p class="small">Your choice stays secret unless you win the lip sync.</p><div class="options">${bottomQueens.map(q=>choiceButtonHtml({id:q.id,attr:'data-lipstick-choice',label:`💄 ${escapeHtml(q.name)}`,desc:'Choose this lipstick.'})).join('')}</div>`;
  document.querySelectorAll('[data-lipstick-choice]').forEach(btn=>btn.addEventListener('click',()=>{
    ep.legacyVotes=ep.legacyVotes||{};
    ep.legacyVotes[player.id]=btn.dataset.lipstickChoice;
    ep.playerLegacyLipstickChosen=true;
    saveGame();
    onContinue?.();
  }));
}


function renderAssassinLipstickChoice(onContinue){
  const ep=gameState.currentEpisode;
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const bottomQueens=(ep.bottomQueens||[])
    .map(id=>gameState.queens.find(q=>q.id===id))
    .filter(Boolean)
    .sort((a,b)=>a.name.localeCompare(b.name));
  const step=document.querySelector('#step');
  if(!step || !player || player.isEliminated || !isPlayerActiveInCurrentEpisode() || !bottomQueens.length){
    ep.playerAssassinLipstickChosen=true;
    saveGame();
    onContinue?.();
    return;
  }
  step.classList.add('decision-card','important');
  step.innerHTML=`<h3>Choose Your Lipstick</h3><p>You won the challenge. Before facing the Lip Sync Assassin, choose which bottom queen you would eliminate if you win.</p><p class="small">If the assassin wins, the group vote decides instead.</p><div class="options">${bottomQueens.map(q=>choiceButtonHtml({id:q.id,attr:'data-assassin-lipstick-choice',label:`💄 ${escapeHtml(q.name)}`,desc:'Choose this lipstick.'})).join('')}</div>`;
  document.querySelectorAll('[data-assassin-lipstick-choice]').forEach(btn=>btn.addEventListener('click',()=>{
    ep.assassinTopVote=btn.dataset.assassinLipstickChoice;
    ep.playerAssassinLipstickChosen=true;
    saveGame();
    onContinue?.();
  }));
}


function renderAssassinGroupVoteChoice(onContinue){
  const ep=gameState.currentEpisode;
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const bottomQueens=(ep.bottomQueens||[])
    .map(id=>gameState.queens.find(q=>q.id===id))
    .filter(Boolean)
    .sort((a,b)=>a.name.localeCompare(b.name));
  const step=document.querySelector('#step');
  if(!step || !player || !bottomQueens.length){
    ep.playerAssassinGroupVoteChosen=true;
    saveGame();
    onContinue?.();
    return;
  }
  step.classList.add('decision-card','important');
  step.innerHTML=`<h3>Cast Your Vote</h3><p>Before the lip sync, vote for which bottom queen you want to leave the competition.</p><p class="small">If the Lip Sync Assassin wins, the group vote decides who goes home. Your vote stays secret.</p><div class="options">${bottomQueens.map(q=>choiceButtonHtml({id:q.id,attr:'data-assassin-group-vote',label:`🗳️ ${escapeHtml(q.name)}`,desc:'Vote for this queen to leave.'})).join('')}</div>`;
  document.querySelectorAll('[data-assassin-group-vote]').forEach(btn=>btn.addEventListener('click',()=>{
    ep.assassinGroupVotes=ep.assassinGroupVotes||{};
    ep.assassinGroupVotes[player.id]=btn.dataset.assassinGroupVote;
    ep.playerAssassinGroupVoteChosen=true;
    saveGame();
    onContinue?.();
  }));
}


function tournamentVoteTableHtml(epOrResult){
  const ep=gameState.currentEpisode||{};
  const votes=epOrResult?.tournamentVotes || ep.tournamentVotes || {};
  const voterIds=Object.keys(votes).filter(Boolean).sort((a,b)=>qName(a).localeCompare(qName(b)));
  if(!voterIds.length)return '';
  return `<div class="table-wrap tournament-vote-table"><table><thead><tr><th>Queen</th><th>Voted For</th></tr></thead><tbody>${voterIds.map(voterId=>`<tr><td><strong>${escapeHtml(qName(voterId))}</strong></td><td>${escapeHtml(qName(votes[voterId]))}</td></tr>`).join('')}</tbody></table></div>`;
}

function renderTournamentPointVoteChoice(onContinue){
  const ep=gameState.currentEpisode;
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const candidates=(ep?.placements||[])
    .map(p=>gameState.queens.find(q=>q.id===p.queenId))
    .filter(q=>q && q.id!==gameState.playerQueenId)
    .sort((a,b)=>a.name.localeCompare(b.name));
  const step=document.querySelector('#step') || document.querySelector('#tournamentPointVoteChoice');
  if(!step || !player || player.isEliminated || (ep?.participantIds && !ep.participantIds.includes(player.id)) || !candidates.length){
    ep.playerTournamentPointVoteChosen=true;
    if(typeof recomputeTournamentVotes==='function')recomputeTournamentVotes(ep);
    if(ep.lipSyncResult && ep.lipSyncResult.outcome==='tournamentPoints'){
      ep.lipSyncResult.tournamentVotes=ep.tournamentVotes||{};
      ep.lipSyncResult.tournamentVoteTally=ep.tournamentVoteTally||{};
      ep.lipSyncResult.tournamentVotedPointQueenIds=ep.tournamentVotedPointQueenIds||[];
    }
    saveGame();
    onContinue?.();
    return;
  }
  step.classList.add('decision-card','important');
  const topSet=new Set(ep.top2Queens||[]);
  step.innerHTML=`<h3>Cast Your Point Vote</h3><p>The lip sync is over. Now every queen who did not win the challenge votes to award one extra tournament point.</p><p class="small">You may vote for anyone except yourself. The other queens usually prioritize someone outside the Top 2.</p><div class="options">${candidates.map(q=>choiceButtonHtml({id:q.id,attr:'data-tournament-point-vote',label:`🗳️ ${escapeHtml(q.name)}`,desc:topSet.has(q.id)?'Vote for one of the challenge winners.':'Vote for a queen who did not win the challenge.'})).join('')}</div>`;
  document.querySelectorAll('[data-tournament-point-vote]').forEach(btn=>btn.addEventListener('click',()=>{
    ep.tournamentVotes=ep.tournamentVotes||{};
    ep.tournamentVotes[player.id]=btn.dataset.tournamentPointVote;
    ep.playerTournamentPointVoteChosen=true;
    if(typeof recomputeTournamentVotes==='function')recomputeTournamentVotes(ep);
    if(ep.lipSyncResult && ep.lipSyncResult.outcome==='tournamentPoints'){
      ep.lipSyncResult.tournamentVotes=ep.tournamentVotes||{};
      ep.lipSyncResult.tournamentVoteTally=ep.tournamentVoteTally||{};
      ep.lipSyncResult.tournamentVotedPointQueenIds=ep.tournamentVotedPointQueenIds||[];
    }
    saveGame();
    onContinue?.();
  }));
}

function renderLipSyncStrategyChoice(){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const reveals=player?.inventory?.reveals||0;
  const strategies=[
    ['emotion','❤️ Sell the Emotion','Lead with vulnerability and make every beat feel personal.'],
    ['sell_lyrics','🎭 Sell the Lyrics','Use face, timing, and intention to make the song feel written for you.'],
    ['dance','Dance the House Down','Attack the rhythm and try to own the whole stage.'],
    ['stunts','🤸 Stunts & Tricks','Go for big physical moments. It could be iconic or messy.'],
    ['save_reveal','👗 Save the Reveal for the Climax','Hold the reveal until the song hits its biggest moment.'],
    ['reveal_early','✨ Reveal Early','Shock the judges quickly and hope the energy carries through.'],
    ['multiple_reveals','💎 Multiple Reveals','Throw everything at the wall and pray it sticks.'],
    ['overshadow','⚠️ Overshadow Your Opponent','High risk: steal the spotlight. If it lands, you gain score and your opponent loses score. If it fails, production clocks you as desperate.'],
    ['play_safe','😌 Play It Safe','Keep it clean and controlled, but risk being forgettable.']
  ];
  const step=document.querySelector('#step');
  step.classList.add('decision-card','important');
  step.innerHTML=`<h3>Lip Sync Strategy</h3><p>${(getSeasonFormat()==='legacy'||gameState.currentEpisode?.special==='tournament_bracket')?'You are in the Top 2. Choose the story you want to tell on stage.':(getSeasonFormat()==='assassin'?'You are facing the Lip Sync Assassin. Choose the story you want to tell on stage.':'You are in the Bottom. Choose the story you want to tell on stage.')}</p><p class="small">Reveals available: ${reveals}</p><div class="options">${strategies.map(([id,label,desc])=>{
    const disabled=(['save_reveal','reveal_early','multiple_reveals'].includes(id)&&reveals<=0)?'disabled':'';
    return choiceButtonHtml({id,attr:'data-strategy',label,desc,disabled});
  }).join('')}</div>`;
  document.querySelectorAll('[data-strategy]').forEach(btn=>btn.addEventListener('click',()=>{
    const moves=lipSyncMovesFromStrategy(btn.dataset.strategy, gameState.currentEpisode.song);
    const isAllWinnersPlayerTop2=getSeasonFormat()==='all_winners' && (gameState.currentEpisode?.top2Queens||[]).includes(gameState.playerQueenId);
    const result=resolveLipSync(moves, {deferAllWinnersPlayerBlock:isAllWinnersPlayerTop2});
    if(!(result?.outcome==='allWinnersTopAllStar' && result.survivorId===gameState.playerQueenId && gameState.currentEpisode?.waitingForAllWinnersBlockChoice)){
      applyEpisodeStats();
    }
    renderLipSyncResult(result);
  }));
}
function moveLabel(kind,value){
  const labels={start:{explosive:'starts explosively',controlled:'starts controlled',lyrics:'interprets the lyrics'},middle:{acrobatics:'goes for acrobatics',face:'serves face',judges:'connects with the judges'},finale:{reveal:'reveals during the climax',emotional:'ends with emotion',stunt:'risks one final stunt'}};
  return labels[kind]?.[value]||value;
}
function fillTemplate(text, values={}){return String(text||'').replace(/\{(\w+)\}/g,(_,key)=>values[key]??'');}
function pickLipSyncComment(path, fallback=''){let node=gameState.data.lipSyncComments; for(const key of path){node=node?.[key];} if(Array.isArray(node)) return sample(node)||fallback; return fallback;}
function getLipSyncQualityKey(results){
  const scores=results.map(r=>r.score10);
  const low=Math.min(...scores);
  const high=Math.max(...scores);
  if(low>=9.0) return 'legendary';
  if(high>=8.5) return 'iconic';
  if(high<5) return 'terrible';
  if(high<6.5) return 'forgettable';
  if(high<7.5) return 'warm';
  return 'irregular';
}

function shortPick(list,fallback=''){
  return Array.isArray(list) && list.length ? sample(list) : fallback;
}

const V20_LIPSYNC_TEXT={
  general:{
    doubleShantay:[
      'Neither queen gave an inch.',
      'The room could not choose a loser.',
      'Both queens made a case for staying.'
    ],
    doubleSashay:[
      'Neither performance met the moment.',
      'The song waited for a spark that never came.',
      'The stage needed more than either queen gave.'
    ],
    top2Win:[
      'Both queens wanted the first win badly.',
      'The premiere win came down to the final beat.',
      'Only one queen fully seized the moment.'
    ],
    close:[
      'It came down to tiny details.',
      'Both queens fought until the last beat.',
      'The judges had to split hairs.',
      'No one made the decision easy.'
    ],
    clear:[
      'One queen slowly pulled ahead.',
      'The performance found a clear leader.',
      'The shantay started leaning one way.',
      'One queen simply connected more.'
    ],
    dominant:[
      'From the first beat, one queen owned the stage.',
      'The winner made the choice feel obvious.',
      'One performance swallowed the room.',
      'It became less of a duel and more of a takeover.'
    ],
    weak:[
      'The song deserved more fire.',
      'The duel never fully took off.',
      'Both queens struggled to find the moment.',
      'The performance stayed below the stakes.'
    ]
  },
  strategy:{
    emotion:{
      win:['The emotion reached the judges without feeling forced.','She made the song feel personal.','Every breath carried intention.'],
      lose:['The emotion was visible, but it never fully landed.','She reached for vulnerability, but the room did not follow.','The feeling was there; the impact was not.']
    },
    sell_lyrics:{
      win:['Every lyric felt intentional.','She made the words do the work.','The mouth, the eyes, the timing — all locked in.'],
      lose:['The words were there, but the spark was missing.','She knew the lyrics, but did not own them.','The interpretation stayed too polite.']
    },
    dance:{
      win:['She attacked the beat with control.','The movement made the song feel bigger.','She danced like the stage belonged to her.'],
      lose:['The energy was there, but the precision slipped.','She moved hard, but the song got away from her.','The dancing needed a sharper point of view.']
    },
    stunts:{
      win:['The tricks landed clean and raised the stakes.','The risks paid off at the right moments.','Every stunt felt earned.'],
      lose:['The tricks pulled focus from the song.','The risks did not all land.','The stunts looked big, but not always connected.']
    },
    save_reveal:{
      win:['She saved the reveal for the climax, and the timing paid off.','The reveal arrived exactly when the song needed a lift.','She waited, then struck at the perfect moment.'],
      lose:['She waited too long, and the reveal missed its peak.','The reveal never became the moment she needed.','By the time the reveal came, the song had moved on.']
    },
    reveal_early:{
      win:['The early reveal grabbed attention, and she kept the momentum.','She shocked the room early and never let go.','The reveal opened the door, and she walked through it.'],
      lose:['The reveal came too soon and left nowhere to go.','The first shock faded before the song ended.','The reveal started strong, but the performance flattened.']
    },
    multiple_reveals:{
      win:['The reveals kept building instead of getting tired.','The chaos turned into spectacle.','Every reveal raised the temperature.'],
      lose:['The reveals piled up, but the performance got lost.','By the second reveal, the surprise had worn off.','The spectacle outpaced the lip sync.']
    },
    play_safe:{
      win:['The clean approach worked because every detail was controlled.','She kept it simple and made it count.','No tricks, just focus — and it paid off.'],
      lose:['The safe approach kept her afloat, but not alive.','Clean was not enough tonight.','She avoided mistakes, but also avoided impact.']
    },
    overshadow:{
      win:['She stole the spotlight without losing the song.','She pulled focus, and the judges followed.','The risk paid off: the stage started orbiting around her.'],
      lose:['The attempt to overshadow read as desperate.','She tried to steal focus, but production clocked the reach.','The tactic distracted from her own performance.']
    }
  },
  comparative:{
    close:['In the end, one queen edged ahead by the smallest margin.','The decision came from control, timing, and nerve.','One final detail tipped the lip sync.'],
    clear:['By the final chorus, the stronger performance had separated itself.','The judges could see who controlled the song.','One queen gave the panel more to hold onto.'],
    dominant:['The decision was not subtle.','The stage had already made the choice.','One queen left no serious doubt.'],
    unexpected:['The early read was misleading; the winner built slowly and took it at the end.','It looked close one way, then the final moments changed the room.','The win came from the full performance, not just the flashiest moment.']
  }
};

function resultTier(result){
  if(result.outcome==='doubleShantay') return 'doubleShantay';
  if(result.outcome==='doubleSashay') return 'doubleSashay';
  if(result.outcome==='top2Win' || result.outcome==='tournamentPoints' || result.outcome==='allWinnersTopAllStar') return 'top2Win';
  const diff=result.difference ?? Math.abs((result.results?.[0]?.score10||0)-(result.results?.[1]?.score10||0));
  const high=Math.max(...result.results.map(r=>r.score10));
  if(high<6.5) return 'weak';
  if(diff<0.6) return 'close';
  if(diff<1.8) return 'clear';
  return 'dominant';
}


function lipSyncExecutionTier(score){
  const v=Number(score)||0;
  if(v<=5) return 'failed';
  if(v<7) return 'partial';
  if(v<8) return 'strong';
  if(v<9) return 'outstanding';
  return 'legendary';
}

const V20_LIPSYNC_EXECUTION_TEXT = {
  emotion: {
    failed: [
      'She reached for tears, but the emotion never connected.',
      'The vulnerability felt misplaced, and the song slipped through her hands.',
      'Her face promised feeling, but her eyes stayed empty throughout.',
      'The emotion read as imitation, never genuine connection.',
      'She tried to manufacture depth, but the performance stayed surface-level.',
      'Her face went through five emotions in ten seconds, none of them right.',
      'The crying face arrived but the tears forgot to show up.',
      'She felt the lyrics so deeply she forgot to show anyone else.',
      'The emotional breakdown looked more like a tantrum.',
      'She tried to channel heartbreak and summoned constipation instead.',
      'Every dramatic glance missed the camera by several feet.',
      'Her face promised devastation, her body promised a nap.',
      'The vulnerability landed with the grace of a falling anvil.',
      'She attempted raw emotion and discovered she had none left.',
      'The performance was so interior that even she couldn\'t find it.',
      'Her face said "profound" while her body said "please let this end."',
      'The emotion never arrived, but the desperation sure did.',
      'She tried to make eye contact with the judges. They pretended not to see.',
      'The big emotional moment came and went, and nobody noticed.',
      'She reached for the song\'s soul and grabbed her own confusion.'
    ],
    partial: [
      'There were flashes of feeling, but the impact came and went.',
      'She found the emotion in places, though not enough to control the room.',
      'The vulnerability surfaced in moments, then dissolved just as quickly.',
      'She touched the heart of the song occasionally, but couldn\'t sustain it.',
      'The emotion flickered like a candle in wind — promising, then fading.'
    ],
    strong: [
      'The emotion landed clearly and gave the song a beating heart.',
      'She made the judges feel the lyrics without forcing the moment.',
      'The vulnerability felt earned, and the room leaned in to watch.',
      'Every glance carried weight, and the song breathed through her.',
      'She translated the lyrics into genuine feeling that reached the back of the room.'
    ],
    outstanding: [
      'Every breath felt chosen, and the emotion built with precision.',
      'She turned vulnerability into command and held the room still.',
      'The emotional journey was so clear it felt like watching a short film.',
      'She painted the song\'s story with her face, and every stroke landed.',
      'The connection was so raw and real that the judges forgot to breathe.',
      'Her face told the whole story before the chorus even arrived.',
      'The emotions landed with surgical precision, each one sharper than the last.',
      'She played the song\'s emotional arc like a master instrumentalist.',
      'The vulnerability became armor. She wore it like a weapon.',
      'Her eyes held the camera hostage from the first frame.',
      'She built the emotion beat by beat until the room was hers.',
      'The judges felt every word without needing to hear it.',
      'She turned heartbreak into a performance that felt like a confession.',
      'The emotional control was so complete it looked effortless.',
      'She connected with every camera, every judge, every breath.'
    ],
    legendary: [
      'She did not perform the song — she lived inside it. The room broke open.',
      'The emotion became the entire story. It was impossible to look away.',
      'She rewired the song\'s meaning through sheer emotional force. Unforgettable.',
      'The vulnerability was so complete that the stage disappeared around her.',
      'She made the entire room feel what she felt. That\'s not performance — that\'s possession.',
      'The judges forgot they were judging. They were just watching history.',
      'She channeled something beyond performance. The song had never been this alive.',
      'The emotional journey was so profound that silence followed. The room needed a moment.',
      'She didn\'t perform the lyrics. She became the person who wrote them.',
      'The judges sat forward, mouths slightly open. They knew what they were seeing.',
      'That performance will be studied. The emotional mastery was absolute.',
      'She took the song to places the artist never found.',
      'The room held its breath and never let go.',
      'She proved that the face can do more than any stunt.',
      'It wasn\'t a performance. It was a visitation.'
    ]
  },
  sell_lyrics: {
    failed: [
      'The mouth moved, but the words had no life behind them.',
      'She knew pieces of the song, but never sold its meaning.',
      'The lyrics felt recited, not believed, and the judges noticed.',
      'She mouthed the words without ever convincing anyone she meant them.',
      'The song played, she moved her lips, but the connection never formed.',
      'She confidently mouthed the wrong lyrics at the wrong time.',
      'Her lips said one thing, her face said another, neither was right.',
      'She forgot a verse and spent the next fifteen seconds improvising.',
      'The words were there, but the conviction had left the building.',
      'She sang the chorus with such confidence it was almost correct.',
      'Her lip sync was so loose the words fell out of the track.',
      'She knew about half the words and committed fully to the wrong half.',
      'The lyrics hit her face and bounced off.',
      'She tried to sell the song and ended up giving it away for free.',
      'The words were mouthed with such uncertainty that even the track seemed confused.',
      'She forgot the bridge and decided the floor was interesting.',
      'The lip sync was so off that the judges started mouthing along to help her.',
      'She looked like she was reading the lyrics off an invisible teleprompter that kept glitching.',
      'The words passed through her without leaving a trace.',
      'She sold the lyrics like a used car with no engine.'
    ],
    partial: [
      'The lyrics were mostly there, though the intention kept flickering.',
      'She caught some lines beautifully and let others pass by.',
      'The phrasing worked in parts, but the through-line got lost.',
      'She sold verses but lost the choruses to uncertainty.',
      'The intention came in waves — some hit, some barely registered.'
    ],
    strong: [
      'The mouth, the eyes, the timing — all locked in.',
      'Every lyric had a purpose, and she made the song feel personal.',
      'She sold every word like it had been written about her life.',
      'The phrasing was sharp, and the face matched every syllable perfectly.',
      'She turned the lyrics into a confession, and the room believed her.'
    ],
    outstanding: [
      'She carved meaning into every word and caught every camera beat.',
      'The phrasing, face, and timing worked like choreography.',
      'She made each line land with precision and genuine intention.',
      'The song became hers — every word felt like a calculated choice.',
      'She didn\'t just lip sync; she delivered a masterclass in lyrical storytelling.',
      'Every word had weight, every pause had purpose.',
      'She sold the lyrics so hard the judges bought the whole album.',
      'The phrasing was so sharp it could cut glass.',
      'She treated every syllable like it was the most important one.',
      'The face, the lips, the eyes — they all agreed on the story.',
      'She made the track feel like an intimate confession in a crowded room.',
      'The lyrics lived in her body, not just her mouth.',
      'She sold every verse like it was her last chance.',
      'The intention never wavered, not for one single word.',
      'She turned a pop song into a personal manifesto.'
    ],
    legendary: [
      'Every syllable hit like a verdict. The judges watched her tell the whole song with her face.',
      'She made the track feel written for this exact moment. Legendary lyric work.',
      'The words became weapons, and she wielded every single one perfectly.',
      'She rewrote the song\'s meaning through sheer interpretive brilliance.',
      'The judges forgot the original artist existed. She owned every word.',
      'She made the lyrics so real that they felt like her own confession.',
      'Every word landed with the force of a closing argument.',
      'She turned the song into scripture. The judges were converted.',
      'The lyrics became her testimony, and the room bore witness.',
      'She didn\'t just sell the song — she made everyone buy what she was selling.',
      'The performance was so complete that the track became secondary.',
      'She owned every syllable, every breath, every moment between.',
      'The judges leaned in like they were hearing the song for the first time.',
      'She told the whole story without missing a single chapter.',
      'She made the lyrics feel like they had always been waiting for her to say them.'
    ]
  },
  dance: {
    failed: [
      'The movement fought the beat, and the beat won.',
      'She chased the rhythm all over the stage and never caught it.',
      'The choreography looked rehearsed but never felt musical.',
      'Her body moved, but the song stayed somewhere else entirely.',
      'The dance was busy without ever being effective.',
      'She attempted choreography and discovered she had no rhythm left.',
      'The death drop became a death flop. Gravity politely declined.',
      'She attempted a split and ended up in a different time zone.',
      'The cartwheel was declined by the floor.',
      'Her body moved like it had just learned what music was.',
      'The dance was so off-beat that the song seemed confused.',
      'She tried to twirl and the room spun faster than she did.',
      'The choreography was ambitious. The execution was a different story.',
      'She hit the floor and stayed there longer than intended.',
      'The dance moves were from a different song that no one else could hear.',
      'Her body promised fluidity and delivered a series of unfortunate events.',
      'The kicks went wide, the spins went wrong, the floor went hard.',
      'She danced like she was fighting the song, and the song was winning.',
      'The rhythm politely asked for space and she gave it plenty.',
      'She attempted a stunt and the judges attempted not to wince.'
    ],
    partial: [
      'The energy was there, but the control came in patches.',
      'She hit a few strong beats, then lost the thread between them.',
      'The movement worked in flashes but lacked consistent fire.',
      'She danced hard in moments, then lost the rhythm in transitions.',
      'The stage saw effort, though the precision needed more work.'
    ],
    strong: [
      'She attacked the rhythm with confidence and filled the stage.',
      'The dancing pushed the song forward without swallowing the lip sync.',
      'Her movement elevated the performance and kept the energy high.',
      'She owned the space and made every step count.',
      'The choreography enhanced the song instead of competing with it.'
    ],
    outstanding: [
      'Every step hit hard, clean, and camera-ready.',
      'She moved like the stage had been built around her body.',
      'The dance became the visual embodiment of the track\'s energy.',
      'She attacked every beat with precision and infectious power.',
      'The movement, the face, and the rhythm fused into something electric.',
      'She danced with such precision that every camera found her.',
      'The choreography was so sharp it left marks on the stage.',
      'She moved through the song like water finding its level.',
      'Every transition was seamless, every beat was owned.',
      'The physicality was so controlled it looked like superpower.',
      'She ate the choreography and left no crumbs.',
      'The dancing was so clean that even the edges looked polished.',
      'She turned movement into punctuation for every lyric.',
      'The floor was lava and she danced on air.',
      'Her body knew the song better than the track did.'
    ],
    legendary: [
      'She brought the house down. The choreography became the moment.',
      'The floor, lights, and crowd moved with her. It was a full-stage takeover.',
      'She danced like the song owed her something — and she collected.',
      'Every move was a statement. The stage couldn\'t contain her.',
      'She redefined what a dance-heavy lip sync could be. Absolutely iconic.',
      'The dance broke something in the room and rebuilt it better.',
      'She hit every beat with such force that the judges felt it in their seats.',
      'The choreography was so perfect it looked spontaneous.',
      'She turned the stage into her personal playground.',
      'The performance was so physically commanding that the song seemed to follow her.',
      'She danced with such fire that the room started sweating.',
      'The movement was so powerful it rewired how the song felt.',
      'She made the impossible look effortless and the effortless look essential.',
      'The dance was so legendary that future queens will study it.',
      'She didn\'t just perform the song — she choreographed its legacy.'
    ]
  },
  stunts: {
    failed: [
      'The tricks looked desperate and pulled focus from the song.',
      'The risk collapsed into messy movement and missed beats.',
      'She went for it, but the landing never matched the ambition.',
      'The stunts read as chaos, not choreography.',
      'She prioritized spectacle over substance, and it showed.',
      'She attempted a death drop and the floor rejected her.',
      'The stunt was so ambitious that gravity intervened personally.',
      'She went for a split and the song went somewhere else.',
      'The kick was so wide that her balance relocated.',
      'She tried to recreate a famous move and the memory of it was better.',
      'The cartwheel was attempted. The floor was unimpressed.',
      'The dip went so low she almost disappeared from the performance.',
      'She attempted a backbend and forgot what backs were for.',
      'The stunt was so messy even her wig looked concerned.',
      'She went for a flip and the song flipped away from her.',
      'The jump was so high the landing became an adventure.',
      'She tried to serve athleticism and served a pulled muscle instead.',
      'The trick was so forced it looked like the song was holding her back.',
      'She attempted a death drop and achieved a life flop.',
      'The stunt was so ill-advised that the judges looked away.'
    ],
    partial: [
      'Some tricks landed, but the performance never fully recovered between them.',
      'The stunts got attention, though not always for the right reasons.',
      'She hit a few impressive moments but lost control in between.',
      'The ambition was clear, but the execution stayed inconsistent.',
      'The tricks earned gasps, though the rest of the performance struggled to keep up.'
    ],
    strong: [
      'The risks landed cleanly and raised the stakes.',
      'She used the tricks as punctuation instead of panic.',
      'Every stunt felt earned and added to the performance.',
      'She balanced danger with control, and it paid off.',
      'The physicality elevated the song without overwhelming it.'
    ],
    outstanding: [
      'Every stunt arrived exactly where the song needed impact.',
      'The tricks were sharp, controlled, and undeniably effective.',
      'She made the impossible look effortless and musical.',
      'The stunts built the performance rather than breaking it.',
      'She turned risk into reward with precision and guts.',
      'The stunts were so clean they looked easy.',
      'She executed every trick with surgical timing.',
      'The physical risks paid off in every single moment.',
      'She made dangerous choices look like second nature.',
      'The stunts became highlights without overshadowing the song.',
      'Every move was measured, every risk was calculated.',
      'She served athleticism and artistry in equal measure.',
      'The tricks were so seamless they felt like part of the choreography.',
      'She used her body like punctuation for the music.',
      'The stunts were thrilling because they were controlled.'
    ],
    legendary: [
      'Every stunt detonated on beat. The room lost its mind.',
      'It was athletic, musical, and ridiculous in the best possible way.',
      'She redefined what a lip sync could include. Legendary physicality.',
      'The stunts became the song\'s visual peak, and she nailed every single one.',
      'She took risks that should have failed and made them unforgettable victories.',
      'The death drop at the climax changed the room\'s atmosphere.',
      'She executed stunts that would break lesser performers and made them look easy.',
      'The physical feats were so extraordinary that the judges couldn\'t believe their eyes.',
      'She flew across the stage and the song carried her.',
      'The stunts were so perfectly timed they felt choreographed by the music itself.',
      'She attempted things that shouldn\'t work and made them unforgettable.',
      'The physicality was so next-level that it set a new standard.',
      'She served gravity defiance and the room ate it up.',
      'The stunts were so legendary that they became the performance.',
      'She took every risk and turned it into a reward for the audience.'
    ]
  },
  save_reveal: {
    failed: [
      'She waited for the climax, but the reveal missed the moment completely.',
      'The reveal came too late to save a performance already fading.',
      'She built toward something that never quite arrived.',
      'The timing was off, and the payoff fell flat.',
      'She saved the reveal, but the moment had already passed her by.',
      'The reveal came and went and the room barely noticed.',
      'She saved her big moment for a beat that never came.',
      'The build-up was intense. The reveal was not.',
      'She reached for the reveal and found nothing but fabric.',
      'The zipper had other plans.',
      'She pulled the reveal and the entire outfit came with it.',
      'The reveal was so delayed that it looked like an accident.',
      'She saved the surprise for after the song had already won.',
      'The moment arrived and the garment stayed put.',
      'She tried to unveil and instead unveiled her own panic.',
      'The reveal was supposed to be a climax. It became a punctuation mark.',
      'She built tension and then released it into the void.',
      'The big moment arrived and the reveal was... there.',
      'She saved the reveal for so long that it expired.',
      'The reveal came off. So did her composure.'
    ],
    partial: [
      'The reveal worked, but hesitation kept it from becoming the moment.',
      'The timing was close, though the payoff needed more force.',
      'She built tension, but the release didn\'t match the build-up.',
      'The reveal landed, but the journey to it felt uneven.',
      'She had the right idea, though the execution needed sharper instincts.'
    ],
    strong: [
      'She saved the reveal for the right beat, and the room woke up.',
      'The climax gave her the opening, and she used it well.',
      'The build-up paid off with a reveal that felt earned.',
      'She timed it perfectly and turned the song on its head.',
      'The wait made the moment land with satisfying force.'
    ],
    outstanding: [
      'The reveal arrived like a punchline and a victory lap at once.',
      'She built perfectly toward the reveal, then snapped the song open.',
      'The tension she created made the payoff feel explosive.',
      'She played the long game and won it with one perfect moment.',
      'The timing was immaculate, and the reveal elevated everything before it.',
      'The reveal was perfectly telegraphed and perfectly executed.',
      'She built the tension so skillfully that the release felt inevitable and surprising.',
      'The moment arrived and the room gasped as one.',
      'She controlled the anticipation so completely that the reveal was triumphant.',
      'The payoff matched the build-up perfectly.',
      'She waited until the exact right moment and made it count.',
      'The reveal was so well-timed it became the climax of the performance.',
      'She turned anticipation into explosion.',
      'The moment was so perfectly set up that the reveal felt like destiny.',
      'She built a house of cards and knocked it down with a perfect reveal.'
    ],
    legendary: [
      'The reveal instantly became the defining image of the night.',
      'The climax hit, the garment changed, and the entire room erupted.',
      'She built a cathedral of tension and knocked it down with perfection.',
      'The reveal wasn\'t just a moment — it was the moment. Unforgettable.',
      'She turned the climax into a religious experience. Legendary timing.',
      'The reveal was so perfect that the judges gasped in unison.',
      'The room exploded and never fully recovered.',
      'She saved the reveal for the final beat and absolutely murdered it.',
      'The payoff was so complete that the song felt like it was waiting for that moment.',
      'She turned a lip sync into a cinematic climax.',
      'The reveal changed the energy of the room permanently.',
      'She made the judges forget the song before the reveal.',
      'The moment was so perfectly constructed that it felt like magic.',
      'She delivered a reveal that will be talked about for years.',
      'The build-up and payoff were so aligned that it felt scripted by destiny.'
    ]
  },
  reveal_early: {
    failed: [
      'The early reveal burned through her surprise before the song had started moving.',
      'She showed the trick too soon and had nowhere else to go.',
      'The reveal happened, the room reacted, and then... nothing.',
      'She played her best card immediately and left the rest of the performance empty.',
      'The early shock worked, but she couldn\'t sustain the momentum.',
      'The reveal was so early that the song hadn\'t even started.',
      'She shocked the room and then had nothing left to give.',
      'The early surprise was so good that the rest was a disappointment.',
      'She revealed her entire hand and played the rest of the song with nothing.',
      'The reveal came so early that she spent the rest of the performance undoing it.',
      'She gave the judges everything in the first ten seconds and then vanished.',
      'The reveal was so early that the song felt like the after-party.',
      'She blew her load in the intro and the rest was cleanup.',
      'The early reveal was so strong that the rest felt weak by comparison.',
      'She showed the trick and then the trick showed her limitations.',
      'The early reveal was the peak of a very short mountain.',
      'She started with a bang and ended with a whisper.',
      'The reveal was so early that the climax had already passed before the first chorus.',
      'She gave the judges everything and then had to fake the rest.',
      'The early reveal was so complete that there was nothing left to discover.'
    ],
    partial: [
      'The reveal grabbed attention, but the momentum faded after it.',
      'The opening shock worked; the rest needed more shape.',
      'She made a strong first impression but couldn\'t build on it.',
      'The early gamble paid off initially, then the performance plateaued.',
      'She started with a bang and ended with a whimper.'
    ],
    strong: [
      'The early reveal hooked the room, and she kept enough control to ride it.',
      'She used the reveal as an entrance, not the whole performance.',
      'The shock worked, and she proved she had more to offer afterward.',
      'She opened strong and maintained the energy throughout.',
      'The early surprise set the tone, and she delivered on its promise.'
    ],
    outstanding: [
      'The reveal hit immediately, then she kept raising the temperature.',
      'She shocked the room early and proved the trick was only the beginning.',
      'The opening gambit worked so well that the rest of the performance felt like a victory lap.',
      'She grabbed the judges\' attention immediately and never let go.',
      'The early reveal created expectations, and she exceeded every single one.',
      'She set the bar high and kept clearing it.',
      'The opening reveal was so strong that the song felt like it was playing catch-up.',
      'She started with a statement and kept making them.',
      'The early surprise was so effective that the room was hers from the first beat.',
      'She opened with a bang and somehow made every subsequent beat louder.',
      'The reveal was so good that the rest of the performance felt like a reward.',
      'She hooked the judges in the first five seconds and never let them go.',
      'The early reveal created momentum that never faltered.',
      'She started at full power and somehow found more.',
      'The opening gambit was so strong that it set the tone for the entire performance.'
    ],
    legendary: [
      'The first beat became an event. The reveal lit the fuse and the performance exploded.',
      'She opened with a gag and somehow made every second after it bigger.',
      'The early reveal was so iconic that it redefined the song\'s opening.',
      'She set the bar impossibly high in the first five seconds and kept clearing it.',
      'The surprise was so perfect that the judges were hooked before the first chorus.',
      'She made the reveal so early and so powerful that the song became the afterthought.',
      'The opening moment was so legendary that it overshadowed everything that came after.',
      'She started with a moment that will be replayed for years.',
      'The early reveal was so perfect that the judges knew they were watching something special.',
      'She opened with a reveal that became the image of the performance.',
      'The first five seconds rewrote the entire song.',
      'She made such a strong opening statement that the rest of the performance was history.',
      'The reveal was so early and so perfect that it defined the entire lip sync.',
      'She started with a moment that stopped time.',
      'The opening gambit was so legendary that the judges were already sold.'
    ]
  },
  multiple_reveals: {
    failed: [
      'The reveals piled up until the lip sync disappeared underneath them.',
      'Too many tricks, not enough performance. The spectacle turned messy.',
      'She kept reaching for surprises, but they stopped surprising.',
      'The multiple reveals became exhausting instead of exciting.',
      'She prioritized quantity over quality, and the performance suffered.',
      'She pulled seven reveals and none of them landed.',
      'The layers of clothing came off like a sad magic trick.',
      'She kept revealing until there was nothing left but confusion.',
      'The reveals were so numerous that the song got lost in the laundry.',
      'She kept pulling surprises and surprised no one.',
      'The reveals were so frequent that they became background noise.',
      'She revealed so many times that the performance became a strip tease gone wrong.',
      'The multiple reveals were like a horror movie where the monster keeps coming back.',
      'She kept revealing and somehow every reveal was disappointing.',
      'The performance became a parade of bad decisions.',
      'She revealed so many layers that the judges lost count.',
      'The reveals were so constant that nothing felt surprising.',
      'She pulled a reveal and then another and then another and none of them mattered.',
      'The multiple reveals were like a clown car but less entertaining.',
      'She kept shedding layers until there was nothing left but desperation.'
    ],
    partial: [
      'The reveals created noise, but only some of it felt useful.',
      'A few surprises landed while others got in the way.',
      'The layers worked occasionally, though the execution felt uneven.',
      'She had the right idea, but the reveals needed better spacing.',
      'Some moments hit, but the overall impact got lost in the chaos.'
    ],
    strong: [
      'The reveals built in a clear rhythm and kept the judges watching.',
      'She balanced spectacle with enough lip sync to make it work.',
      'Every reveal had purpose and contributed to the performance.',
      'She layered surprises effectively without overwhelming the song.',
      'The multiple reveals created a dynamic, engaging performance.'
    ],
    outstanding: [
      'Each reveal escalated the last without losing the song.',
      'The layers kept coming, and somehow every one had a point.',
      'She turned the performance into a journey with multiple destinations.',
      'The reveals felt like chapters, each one building on the last.',
      'She had the judges guessing what came next and delivered every time.',
      'The reveals were so well-paced that each one felt earned.',
      'She kept pulling surprises and every single one worked.',
      'The layers of reveals created a narrative that the song couldn\'t.',
      'She turned the performance into a series of escalating climaxes.',
      'The reveals were so cleverly spaced that the energy never dropped.',
      'She played the reveal game and won every round.',
      'The multiple reveals were perfectly calibrated for maximum impact.',
      'She kept surprising the room and the room kept gasping.',
      'The reveals became a conversation that the song was having with the audience.',
      'She turned a lip sync into a theatrical experience with multiple acts.'
    ],
    legendary: [
      'Reveal after reveal after reveal — and every single one hit. The room went feral.',
      'It became a full theatrical demolition. The song had chapters, and she dressed every one.',
      'She turned the lip sync into an event. Multiple reveals, maximum impact.',
      'The layers of surprises created a performance that felt like a movie.',
      'She kept pulling tricks and every single one landed. Absolute mastery.',
      'The reveals were so perfectly executed that the room couldn\'t keep up.',
      'She turned the song into a journey and revealed something new at every stop.',
      'The multiple reveals were so legendary that the judges forgot to judge.',
      'She created a performance that demanded to be watched again to catch everything.',
      'The reveals were so clever, so well-timed, so complete that it became a masterclass.',
      'She redefined what multiple reveals could mean in a lip sync.',
      'The room was gasping so often they ran out of breath.',
      'She kept delivering and the room kept losing its mind.',
      'The performance was so layered that it felt like a theatrical production.',
      'She made multiple reveals feel like a single, perfect, evolving statement.'
    ]
  },
  play_safe: {
    failed: [
      'The safe approach became invisible. Nothing truly happened.',
      'She avoided mistakes, but also avoided giving the judges a reason to care.',
      'The performance was clean, forgettable, and ultimately useless.',
      'She played it so safe that the song passed right through her.',
      'Nothing went wrong, but nothing went right either.',
      'The performance was so safe that it should have had a seatbelt.',
      'She played it so safe that even the stage looked bored.',
      'The safe choice was so cautious that it looked like fear.',
      'She avoided risks and also avoided victory.',
      'The performance was clean, correct, and completely useless.',
      'She played it safe and the judges played along by not remembering her.',
      'The safe approach was so forgettable that the song played without her.',
      'She gave the judges nothing to critique and nothing to praise.',
      'The performance was so conservative it should have been wearing a cardigan.',
      'She played it so safe that it was almost dangerous in its lack of risk.',
      'The safe performance was so invisible that she disappeared into the background.',
      'She played it safe and found out safety doesn\'t win.',
      'The performance was so controlled that it had no pulse.',
      'She avoided disaster and also avoided relevance.',
      'The safe choice was the wrong choice.'
    ],
    partial: [
      'The safe approach kept her afloat, but not alive.',
      'She stayed clean, though the performance needed a stronger pulse.',
      'The control was there, though the spark never ignited.',
      'She avoided disaster but also avoided greatness.',
      'The performance was solid, but solid doesn\'t win.'
    ],
    strong: [
      'The restraint worked because every detail was controlled.',
      'She kept it simple and made the choices count.',
      'The clean approach proved that less can be more.',
      'She stayed in control and delivered a focused, effective performance.',
      'The simplicity worked because she executed every moment with precision.'
    ],
    outstanding: [
      'No tricks, no panic — just precision, face, and total control.',
      'The clean approach looked expensive because she never wasted a beat.',
      'She turned restraint into a weapon and commanded the room quietly.',
      'The simplicity was so sharp that it felt bold.',
      'She proved that you don\'t need spectacle when you have this much control.',
      'The performance was so clean that every detail stood out.',
      'She played it safe and made safety look dangerous.',
      'The control was so complete that it became its own kind of power.',
      'She served precision over spectacle and it worked perfectly.',
      'The performance was so tight that nothing was wasted.',
      'She proved that clean execution can be just as powerful as chaos.',
      'The restraint was so masterful that it became the point.',
      'She played it safe and made it feel like the boldest choice.',
      'The performance was so controlled that every beat landed.',
      'She turned simplicity into a statement.'
    ],
    legendary: [
      'She proved stillness can be lethal. The smallest choices shook the room.',
      'No stunt could have beaten that control. It was simplicity turned iconic.',
      'She made a quiet performance feel like the loudest statement of the night.',
      'The restraint was so masterful that it became unforgettable.',
      'She redefined what \'safe\' means by making it absolutely devastating.',
      'The performance was so perfectly controlled that it rewired how the song felt.',
      'She played it safe and won. That\'s how powerful the execution was.',
      'The quiet control was so complete that it felt like a revolution.',
      'She proved that you don\'t need to scream to be heard.',
      'The stillness was so powerful that it became the performance.',
      'She made the safe choice look like the only choice.',
      'The restraint was so absolute that it felt like a victory.',
      'She turned caution into art.',
      'The performance was so perfectly executed that it needed nothing else.',
      'She proved that safety, in the right hands, is the most dangerous thing of all.'
    ]
  },
  overshadow: {
    failed: [
      'She tried to steal focus, but it read as desperate. Production noticed for the wrong reasons.',
      'The attempt to overshadow backfired and made her look less in control.',
      'She reached for the spotlight and grabbed only air.',
      'The aggression read as panic, not power.',
      'She tried to dominate and ended up diminishing herself.',
      'She tried to overshadow and ended up underperforming.',
      'The attempt to steal focus was so obvious that the judges looked away.',
      'She reached for the spotlight and the spotlight moved.',
      'The overshadowing was so transparent that it became a joke.',
      'She tried to make her opponent disappear and instead made herself look small.',
      'The aggression was so misplaced that it helped her opponent.',
      'She reached for dominance and found only desperation.',
      'The overshadowing backfired so hard that she overshadowed herself.',
      'She tried to steal the show and ended up stealing nothing.',
      'The attempt to control the narrative was so clumsy it became background noise.',
      'She tried to erase her opponent and erased her own credibility.',
      'The overshadowing was so obvious that even the crew noticed.',
      'She attempted to dominate and the judges noticed her lack of control.',
      'The tactic was so transparent that it earned pity instead of respect.',
      'She reached for power and found only emptiness.'
    ],
    partial: [
      'She pulled focus in flashes, but the tactic kept distracting from her own lip sync.',
      'The risk created tension, though not enough payoff.',
      'She had moments of control, but the approach felt uneven.',
      'She stole attention occasionally, though the performance lacked cohesion.',
      'The overshadowing worked in parts but hurt the whole.'
    ],
    strong: [
      'She stole the spotlight without losing the song, and her opponent visibly lost ground.',
      'She redirected the room toward herself and made the duel feel tilted.',
      'The aggression was controlled and effective.',
      'She took focus and never gave it back.',
      'The tactic worked — her opponent faded while she rose.'
    ],
    outstanding: [
      'Every time her opponent found space, she took it back with nerve and timing.',
      'She dominated the camera, the judges, and the rhythm without looking messy.',
      'The overshadowing was so surgical that her opponent seemed to disappear.',
      'She controlled the narrative completely and left her opponent scrambling.',
      'The performance became a one-person show, and her opponent was just a prop.',
      'She made her opponent look invisible without looking desperate.',
      'The overshadowing was so complete that the duel felt uneven.',
      'She controlled every camera, every beat, every moment.',
      'The performance was so dominant that her opponent gave up trying.',
      'She took the spotlight and never shared it.',
      'The overshadowing was so smooth that it looked natural.',
      'She made the duel a solo performance.',
      'The control was so absolute that her opponent faded into the background.',
      'She dominated the stage so completely that her opponent became a footnote.',
      'The overshadowing was so effective that the judges forgot about the other queen.'
    ],
    legendary: [
      'She turned a duel into a takeover. Her opponent vanished in real time.',
      'It was brutal, magnetic, and unforgettable — a complete spotlight robbery.',
      'She ate her opponent alive on that stage. The judges couldn\'t look away.',
      'The overshadowing was so complete that the duel felt over in the first 30 seconds.',
      'She committed a performance murder and got away with it. Legendary.',
      'She devoured her opponent so completely that the stage felt empty when she left.',
      'The overshadowing was so devastating that her opponent became a ghost.',
      'She took the spotlight and turned it into a laser that burned through everything.',
      'The performance was so dominant that it became a demonstration.',
      'She made her opponent irrelevant in the most spectacular way possible.',
      'The overshadowing was so complete that the judges called the duel early.',
      'She turned a competition into a coronation.',
      'The performance was so commanding that her opponent just gave up.',
      'She performed with such force that her opponent disappeared on stage.',
      'The overshadowing was so legendary that it became part of the show\'s history.'
    ]
  }
};

function strategyResultTextFor(r, won){
  const strategy=r.moves?.strategy||'sell_lyrics';
  const tier=lipSyncExecutionTier(r.executionQuality ?? r.weeklyPerformance ?? r.score10);
  return shortPick(
    V20_LIPSYNC_EXECUTION_TEXT[strategy]?.[tier],
    shortPick(V20_LIPSYNC_TEXT.strategy[strategy]?.[won?'win':'lose'], lipSyncStrategyText(strategy))
  );
}

function buildLipSyncCommentary(result){
  const tier=resultTier(result);
  const scoreSorted=[...result.results].sort((a,b)=>b.score10-a.score10);
  const alphabetic=[...result.results].sort((a,b)=>a.name.localeCompare(b.name));
  const top=scoreSorted[0], bottom=scoreSorted[1];
  const lines=[];
  lines.push(shortPick(V20_LIPSYNC_TEXT.general[tier], 'The stage told the story.'));

  if(result.outcome==='doubleShantay'){
    alphabetic.forEach(r=>lines.push(`${r.name}: ${strategyResultTextFor(r,true)}`));
    lines.push('Sending either queen home would have felt wrong.');
    return {lines};
  }
  if(result.outcome==='doubleSashay'){
    alphabetic.forEach(r=>lines.push(`${r.name}: ${strategyResultTextFor(r,false)}`));
    lines.push('No one took control when it mattered.');
    return {lines};
  }

  alphabetic.forEach(r=>{
    const won = r.queenId===result.survivorId;
    lines.push(`${r.name}: ${strategyResultTextFor(r,won)}`);
  });

  const diff=result.difference ?? Math.abs(top.score10-bottom.score10);
  const comparativeKey=diff<0.6?'close':(diff<1.8?'clear':'dominant');
  lines.push(shortPick(V20_LIPSYNC_TEXT.comparative[comparativeKey], 'The final beat made the decision clear.'));
  return {lines};
}

function formatLipSyncLine(line, result){
  let html=escapeHtml(line);
  const names=[...(result.results||[]).map(r=>r.name), ...(gameState.queens||[]).map(q=>q.name)]
    .filter(Boolean)
    .sort((a,b)=>b.length-a.length);
  for(const name of names){
    const escaped=escapeHtml(name);
    html=html.split(escaped).join(`<strong>${escaped}</strong>`);
  }
  return html;
}

function lipSyncResultPortraits(result){
  const ids=(result?.results||[]).map(r=>r.queenId);
  const qs=ids.map(id=>id==='lip_sync_assassin' ? (gameState.currentEpisode?.lipSyncAssassin||{id:'lip_sync_assassin',name:'Lip Sync Assassin',isAssassin:true,type:'Lip Sync Assassin',attributes:{lipSync:8,cunt:8}}) : gameState.queens.find(q=>q.id===id)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
  if(qs.length<2)return '';
  return `<div class="lipsync-portraits result-portraits">${qs.map(q=>`<div class="lipsync-queen">${queenPortraitHtml(q,'xl')}<strong>${escapeHtml(q.name)}</strong></div>`).join('<span class="vs">VS</span>')}</div>`;
}

function lipSyncNarrative(result){
  const c=buildLipSyncCommentary(result);
  return c.lines.map((line,i)=>`<p${i===0?' class="lead"':''}>${formatLipSyncLine(line,result)}</p>`).join('');
}

function farewellData(){
  return gameState?.data?.farewellLines || window.GAME_DATA?.farewellLines || {};
}
function normKey(value){
  return String(value||'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
}
function farewellTypeKey(q){
  const t=normKey(q?.type || q?.queenType || q?.typeName);
  if(t.includes('weird'))return 'weird';
  if(t.includes('fashion')||t.includes('look')||t.includes('runway'))return 'fashion';
  if(t.includes('comedy')||t.includes('comic'))return 'comedy';
  if(t.includes('dance')||t.includes('dancing')||t.includes('perform'))return 'dancing';
  if(t.includes('pageant'))return 'pageant';
  if(t.includes('camp'))return 'camp';
  if(t.includes('alternative')||t.includes('alt'))return 'alternative';
  if(t.includes('makeup')||t.includes('beauty'))return 'look';
  if(t.includes('acting')||t.includes('theatre')||t.includes('theater'))return 'acting';
  if(t.includes('sing')||t.includes('vocal'))return 'singing';
  if(t.includes('social')||t.includes('congenial'))return 'social';
  return 'default';
}
function farewellPersonalityKey(q){
  const raw=q?.personality?.id || q?.personalityId || q?.personality?.name || q?.personality || '';
  const k=normKey(raw);
  if(k.includes('shy'))return 'shy';
  if(k.includes('confident')||k.includes('bold'))return 'confident';
  if(k.includes('professional')||k.includes('focused'))return 'professional';
  if(k.includes('strategic')||k.includes('strategy'))return 'strategic';
  if(k.includes('kind')||k.includes('warm'))return 'kind';
  if(k.includes('chaotic')||k.includes('chaos'))return 'chaotic';
  if(k.includes('shady')||k.includes('shade'))return 'shady';
  if(k.includes('dramatic')||k.includes('drama'))return 'dramatic';
  if(k.includes('weird')||k.includes('odd'))return 'weird';
  return 'default';
}
function farewellPick(group,key,fallback=''){
  const data=farewellData();
  const node=data?.[group] || {};
  return shortPick(node?.[key], shortPick(node?.default, fallback));
}
function ruFarewellThanks(q){
  const data=farewellData();
  const template=shortPick(data.rupaulThanks, 'Thank you for sharing your {talent} with {quality}.');
  const talent=farewellPick('talentsByType', farewellTypeKey(q), 'drag');
  const quality=farewellPick('qualitiesByPersonality', farewellPersonalityKey(q), 'heart');
  return fillTemplate(template,{talent,quality});
}
function queenExitQuote(q){
  return farewellPick('queenExitByPersonality', farewellPersonalityKey(q), 'This is not the end of my story.');
}
function rupaulDecisionIntro(){
  return shortPick(farewellData().rupaulIntros, 'The time has come...');
}
function rupaulFinalLine(){
  return shortPick(farewellData().ruFinale, "If you can't love yourself, how in the hell are you gonna love somebody else? Can I get an amen?");
}
function impactQueenCard(q, label, line, variant='default', extra=''){
  if(!q)return '';
  const safeVariant=String(variant||'default').replace(/[^a-z0-9_-]/gi,'');
  return `<div class="card lipsync-impact-card lipsync-impact-${safeVariant}">
    <div class="lipsync-impact-portrait">${queenPortraitHtml(q,'xl')}</div>
    <div class="lipsync-impact-copy">
      <p class="lipsync-impact-label">${escapeHtml(label||'')}</p>
      <h2>${escapeHtml(q.name||'Queen')}</h2>
      <p class="lipsync-impact-line"><strong>${escapeHtml(line||'')}</strong></p>
      ${extra||''}
    </div>
  </div>`;
}
function standardLsfylDecisionCards(result){
  if(result.outcome==='doubleShantay'){
    const queens=[...result.results].map(r=>gameState.queens.find(q=>q.id===r.queenId)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
    return `<div class="card lipsync-ru-card important"><h3>RuPaul</h3><p>${escapeHtml(rupaulDecisionIntro())}</p><p><strong>Shantay, you both stay.</strong></p><p>No queen goes home tonight.</p></div>` + queens.map(q=>impactQueenCard(q,'DOUBLE SHANTAY','You both stay.','shantay')).join('');
  }
  if(result.outcome==='doubleSashay'){
    const queens=[...result.results].map(r=>gameState.queens.find(q=>q.id===r.queenId)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
    return `<div class="card lipsync-ru-card important"><h3>RuPaul</h3><p>${escapeHtml(rupaulDecisionIntro())}</p><p><strong>I’m sorry, my dears, but neither of you survived this lip sync.</strong></p></div>` + queens.map(q=>impactQueenCard(q,'SASHAY AWAY','Sashay away.','sashay',`<p>${escapeHtml(ruFarewellThanks(q))}</p><blockquote>${escapeHtml(queenExitQuote(q))}</blockquote>`)).join('');
  }
  const survivor=gameState.queens.find(q=>q.id===result.survivorId);
  const eliminated=gameState.queens.find(q=>q.id===result.eliminatedQueenId);
  if(!survivor || !eliminated)return `<div class="card">${lipSyncDecisionText(result)}</div>`;
  return `<div class="card lipsync-ru-card important"><h3>RuPaul</h3><p>${escapeHtml(rupaulDecisionIntro())}</p></div>
    ${impactQueenCard(survivor,'SHANTAY', 'Shantay, you stay.', 'shantay', '<p>You fought for your place in this competition.</p>')}
    ${impactQueenCard(eliminated,'SASHAY AWAY', 'Sashay away.', 'sashay', `<p>${escapeHtml(ruFarewellThanks(eliminated))}</p><blockquote>${escapeHtml(queenExitQuote(eliminated))}</blockquote>`)};`.replace(/;$/, '');
}
function lipSyncDecisionCards(result){
  if(['legacyElimination','assassinElimination','tournamentPoints','top2Win','allWinnersTopAllStar'].includes(result.outcome)){
    return `<div class="card">${lipSyncDecisionText(result)}</div>`;
  }
  return standardLsfylDecisionCards(result);
}
function finalAmenCard(){
  return `<div class="card lipsync-finale-card lipsync-finale-left"><h3>RuPaul</h3><p>${escapeHtml(rupaulFinalLine())}</p><p class="amen-response"><strong>AMEN!</strong></p><p class="small">Now let the music play</p><p class="music-cue spotlight-cue">💡 ✦ 💡</p></div>`;
}


function lipstickFarewellBlock(q){
  const name=escapeHtml(q?.name||'My dear');
  return `<div class="lipstick-farewell"><h3>${name}</h3><p>${escapeHtml(ruFarewellThanks(q))}</p><blockquote>${escapeHtml(queenExitQuote(q))}</blockquote><p><strong>Now... sashay away.</strong></p></div>`;
}

function lipSyncDecisionText(result){
  const ep=gameState.currentEpisode;
  if(result?.outcome==='allWinnersTopAllStar'){
    const winner=gameState.queens.find(q=>q.id===result.survivorId);
    const loser=gameState.queens.find(q=>q.id===result.top2LoserId) || (result.results||[]).map(r=>gameState.queens.find(q=>q.id===r.queenId)).find(q=>q && q.id!==result.survivorId);
    const blocked=gameState.queens.find(q=>q.id===result.blockedQueenId);
    const starLines=(ep?.allWinnersStarAwards||[]).map(a=>{
      const q=gameState.queens.find(x=>x.id===a.queenId);
      if(!q)return '';
      if(a.blocked)return `<p>Because <strong>${escapeHtml(q.name)}</strong> was blocked, she does not receive a Legendary Legend Star.</p>`;
      const amount=Number((typeof a.amount!=='undefined'?a.amount:a.stars)||0);
      return `<p><strong>${escapeHtml(q.name)}</strong> receives <strong>${amount}</strong> Legendary Legend Star${amount===1?'':'s'}.</p>`;
    }).filter(Boolean).join('');
    const blockLine=blocked ? `<p><strong>${escapeHtml(winner?.name||'The Top All Star')}</strong> uses the Secret Silver Plunger to block <strong>${escapeHtml(blocked.name)}</strong> next week.</p>` : '';
    return `<p class="legacy-lipsync-win"><strong>${escapeHtml(winner?.name||'Winner')}.</strong><br><strong>You are the Top All Star of the Week.</strong></p><p class="legacy-lipsync-safe"><strong>${escapeHtml(loser?.name||'The other top queen')}</strong>, you are safe to slay another day.</p>${starLines}${blockLine}`;
  }
  if(result.outcome==='legacyElimination'){
    const winner=gameState.queens.find(q=>q.id===result.survivorId);
    const loser=result.results.find(r=>r.queenId!==result.survivorId);
    const eliminated=gameState.queens.find(q=>q.id===result.eliminatedQueenId);
    const bottoms=(ep.bottomQueens||[]).map(id=>gameState.queens.find(q=>q.id===id)?.name).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    return `<p class="legacy-lipsync-win"><strong>${escapeHtml(winner?.name||'Winner')}.</strong><br><strong>You are a winner, baby!</strong></p><p class="legacy-lipsync-safe"><strong>${escapeHtml(loser?.name||'The other top queen')}</strong>, you are safe to slay another day.</p><p class="legacy-bottom-call">The bottom queens<br><strong>${bottoms.join(',<br>')}</strong><br>please step forward.</p><p class="legacy-power-line"><strong>${escapeHtml(winner?.name||'Winner')}</strong>, with great power comes great responsibility.<br><br>Who have you decided to give the chop?</p><p><strong>${escapeHtml(winner?.name||'The winning queen')}</strong> reveals the lipstick...</p><div class="lipstick-reveal"><p class="lipstick-reveal-kicker">The lipstick reveals</p><p class="lipstick-reveal-dots">. . .</p><p class="lipstick-reveal-name">${escapeHtml(eliminated?.name||'a bottom queen')}.</p></div>${lipstickFarewellBlock(eliminated)}`;
  }
  if(result.outcome==='assassinElimination'){
    const top=gameState.queens.find(q=>q.id===result.topQueenId);
    const assassinQueen=ep.lipSyncAssassin || {name:'Lip Sync Assassin'};
    const eliminated=gameState.queens.find(q=>q.id===result.eliminatedQueenId);
    const bottoms=(ep.bottomQueens||[]).map(id=>gameState.queens.find(q=>q.id===id)?.name).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    const winnerName=result.assassinWon ? (assassinQueen.name||'Lip Sync Assassin') : (top?.name||'Winner');
    const loserLine=result.assassinWon
      ? `<p class="legacy-lipsync-safe"><strong>${escapeHtml(top?.name||'The challenge winner')}</strong>, you are safe to slay another day.</p>`
      : `<p class="legacy-lipsync-safe"><strong>${escapeHtml(assassinQueen.name||'Lip Sync Assassin')}</strong>, thank you, for a fantastic lip sync.</p>`;
    const question=result.assassinWon ? `${assassinQueen.name||'Lip Sync Assassin'}, who have the queens decided to give the chop?` : 'Who have you decided to give the chop?';
    const revealName=result.assassinWon ? (assassinQueen.name||'Lip Sync Assassin') : (top?.name||'The winning queen');
    const tieIds=result.groupTieIds||[];
    const tieNames=tieIds.map(id=>gameState.queens.find(q=>q.id===id)?.name).filter(Boolean).sort((a,b)=>a.localeCompare(b));
    const tieBlock=(result.assassinWon && result.groupTieResolvedByTop && tieNames.length>1)
      ? `<div class="card subtle"><p>The group vote is tied between <strong>${tieNames.map(escapeHtml).join('</strong> and <strong>')}</strong>.</p><p>In the event of a tie, the power reverts back to the top All Star of the week.</p><p><strong>${escapeHtml(top?.name||'Winner')}</strong>, who have you chosen to get the chop?</p></div>`
      : '';
    const firstRevealName=tieBlock ? 'A TIE!' : (eliminated?.name||'a bottom queen');
    return `<p class="legacy-lipsync-win"><strong>${escapeHtml(winnerName)}.</strong><br><strong>You are a winner, baby!</strong></p>${loserLine}<p class="legacy-bottom-call">The bottom queens<br><strong>${bottoms.join(',<br>')}</strong><br>please step forward.</p><p class="legacy-power-line"><strong>My queens</strong>, with great power comes great responsibility.<br><br>${escapeHtml(question)}</p><p><strong>${escapeHtml(revealName)}</strong> reveals the lipstick...</p><div class="lipstick-reveal"><p class="lipstick-reveal-kicker">The lipstick reveals</p><p class="lipstick-reveal-dots">. . .</p><p class="lipstick-reveal-name">${escapeHtml(firstRevealName)}${tieBlock?'':'.'}</p></div>${tieBlock}${tieBlock?`<div class="lipstick-reveal"><p class="lipstick-reveal-kicker">The final lipstick reveals</p><p class="lipstick-reveal-dots">. . .</p><p class="lipstick-reveal-name">${escapeHtml(eliminated?.name||'a bottom queen')}.</p></div>`:''}${lipstickFarewellBlock(eliminated)}`;
  }
  if(result.outcome==='tournamentPoints'){
    const winner=gameState.queens.find(q=>q.id===result.survivorId);
    const loser=result.results.find(r=>r.queenId!==result.survivorId);
    return `<p class="legacy-lipsync-win"><strong>${escapeHtml(winner?.name||'Winner')}.</strong><br><strong>You are a winner, baby!</strong></p><p class="legacy-lipsync-safe"><strong>${escapeHtml(loser?.name||'The other top queen')}</strong>, you are safe to slay another day.</p><p>The Top 2 each receive <strong>2 tournament points</strong>.</p><p><strong>${escapeHtml(winner?.name||'The lip sync winner')}</strong> receives <strong>1 extra point</strong> for winning the lip sync.</p><p>Every point vote awards <strong>1 tournament point</strong> to the queen who received it.</p>`;
  }
  if(result.outcome==='top2Win'){
    const winner=gameState.queens.find(q=>q.id===result.survivorId);
    const loser=result.results.find(r=>r.queenId!==result.survivorId);
    return `<p><strong>Condragulations, ${escapeHtml(winner.name)}. You are the winner of the premiere.</strong></p><p><strong>${escapeHtml(loser?.name||'The other top queen')}</strong>, you are safe to slay another day.</p>`;
  }
  if(result.outcome==='doubleShantay'){const names=[...result.results].sort((a,b)=>a.name.localeCompare(b.name)).map(r=>escapeHtml(r.name)); return `<p><strong>${names[0]} and ${names[1]}, Shantay, you both stay.</strong></p><p>No queen goes home tonight.</p>`;}
  if(result.outcome==='doubleSashay'){const names=[...result.results].sort((a,b)=>a.name.localeCompare(b.name)).map(r=>escapeHtml(r.name)); return `<p><strong>${names[0]} and ${names[1]}, I’m sorry, my dears, but neither of you survived this lip sync.</strong></p><p>Sashay away.</p>`;}
  if(result.outcome==='tripleBottom'){
    const eliminated=gameState.queens.find(q=>q.id===result.eliminatedQueenId);
    const safeNames=(result.results||[]).filter(r=>r.queenId!==result.eliminatedQueenId).map(r=>escapeHtml(r.name)).join(' and ');
    return `<p><strong>${safeNames}, Shantay, you stay.</strong></p><p><strong>${escapeHtml(eliminated?.name||'Queen')}</strong>, sashay away.</p>`;
  }
  const eliminated=gameState.queens.find(q=>q.id===result.eliminatedQueenId);
  const survivor=gameState.queens.find(q=>q.id===result.survivorId);
  return `<p><strong>${escapeHtml(survivor.name)}, Shantay, you stay.</strong></p><p><strong>${escapeHtml(eliminated.name)}</strong>, sashay away.</p>`;
}

function renderAllWinnersBlockChoice(result){
  const ep=gameState.currentEpisode;
  if(getSeasonFormat()!=='all_winners' || !ep || !result || result.outcome!=='allWinnersTopAllStar')return '';
  if(result.survivorId!==gameState.playerQueenId || ep.playerAllWinnersBlockChosen || !ep.waitingForAllWinnersBlockChoice)return '';
  const top2Ids=ep.top2Queens||[];
  const candidates=(typeof allWinnersBlockCandidates==='function'?allWinnersBlockCandidates(result.survivorId, top2Ids):[])
    .filter(q=>q && q.id!==result.survivorId && !top2Ids.includes(q.id));
  if(!candidates.length){
    ep.playerAllWinnersBlockChosen=true;
    ep.waitingForAllWinnersBlockChoice=false;
    saveGame();
    return '';
  }
  const buttons=candidates.map(q=>{
    const st=q.statistics||{};
    const stars=Number(q.legendStars)||0;
    const starText=stars>0?'⭐'.repeat(Math.min(stars,10))+(stars>10?` (${stars})`:''):'No stars';
    const desc=`${starText} • ${st.wins||0} win${(st.wins||0)===1?'':'s'}`;
    return choiceButtonHtml({id:q.id,attr:'data-all-winners-block-choice',label:`🪠 ${q.name}`,desc});
  }).join('');
  return `<div class="card decision-card important" id="allWinnersBlockChoice"><h3>Use the Secret Silver Plunger</h3><p>You are the Top All Star of the Week. Choose one eligible queen to block from receiving a Legendary Legend Star next episode.</p><p class="small">The other Top 2 queen is immune from the block.</p><div class="options">${buttons}</div></div>`;
}

function bindAllWinnersBlockChoice(result){
  const ep=gameState.currentEpisode;
  if(!ep || !result || result.outcome!=='allWinnersTopAllStar')return;
  document.querySelectorAll('[data-all-winners-block-choice]').forEach(btn=>btn.addEventListener('click',()=>{
    const blockedId=btn.dataset.allWinnersBlockChoice;
    if(blockedId && typeof applyAllWinnersBlock==='function'){
      applyAllWinnersBlock(result.survivorId, blockedId, ep);
      result.blockedQueenId=blockedId;
      ep.lipSyncResult=result;
    }
    ep.playerAllWinnersBlockChosen=true;
    ep.waitingForAllWinnersBlockChoice=false;
    saveGame();
    if(!ep.statsApplied && typeof applyEpisodeStats==='function')applyEpisodeStats();
    renderLipSyncResult(result);
  }));
}

function renderLipSyncResult(result){
  const ep=gameState.currentEpisode;
  const isLegacy=getSeasonFormat()==='legacy' && !['premiere_no_elim','lalaparuza'].includes(ep.special);
  const isAssassin=getSeasonFormat()==='assassin' && !['premiere_no_elim','lalaparuza'].includes(ep.special);
  const isTournament=ep.special==='tournament_bracket';
  const isAllWinners=getSeasonFormat()==='all_winners';
  const badge=(ep.special==='premiere_no_elim'||isLegacy||isAssassin||isTournament||isAllWinners)?(isAssassin?'Lip Sync Assassin':'Top 2 Lip Sync'):'Lip Sync For Your Life';
  const intro=(ep.special==='premiere_no_elim'||isLegacy||isTournament||isAllWinners)?'Two top queens stand before me.':'Two queens stand before me.';
  const prompt=isAllWinners
    ? "Ladies, this is your chance to become the Top All Star of the week and block one queen. The time has come... to lip sync for your legacy! Good luck... and don't fuck it up."
    : isTournament
    ? "Ladies, this is your chance to win an extra tournament point. The time has come... to lip sync for your legacy! Good luck... and don't fuck it up."
    : (isLegacy
    ? "Ladies, this is your chance to win the lip sync and reveal your lipstick. The time has come... to lip sync for your legacy! Good luck... and don't fuck it up."
    : (ep.special==='premiere_no_elim'
      ? "Ladies, this is your chance to snatch the first win of the season. The time has come... to lip sync for the win! Good luck... and don't fuck it up."
      : "Ladies, this is your last chance to impress me and save yourselves from elimination. The time has come... to lip sync for your lives! Good luck... and don't fuck it up."));
  const resultQueens=(result?.results||[]).map(r=>r.queenId==='lip_sync_assassin' ? (ep.lipSyncAssassin||{id:'lip_sync_assassin',name:'Lip Sync Assassin',isAssassin:true,type:'Lip Sync Assassin',attributes:{lipSync:8,cunt:8}}) : gameState.queens.find(q=>q.id===r.queenId)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
  const introBlock=isAssassin ? (ep.assassinIntroShown ? '' : assassinIntroCardsHtml(ep,resultQueens)) : `<div class="card"><p>${escapeHtml(intro)}</p><p>${escapeHtml(prompt)}</p></div>`;
  const resultHero=isAssassin ? '' : `<div class="hero" style="text-align:center;">${bigMomentHeader('The music starts...', (isAllWinners||isTournament||isLegacy)?'LIP SYNC FOR YOUR LEGACY':(ep.special==='premiere_no_elim'?'LIP SYNC FOR THE WIN':'LIP SYNC FOR YOUR LIFE'), (ep.special==='premiere_no_elim'||isLegacy||isTournament||isAllWinners)?'win':'danger')}<h2>${escapeHtml(ep.song.title)}</h2><p style="text-align:center !important; max-width:100%;">by ${escapeHtml(ep.song.artist)}</p>  <h3 class="music-cue spotlight-cue"  style="text-align:center !important; width:100%; display:block;">💡 💡 ${lipSyncEnergyLabel(ep.song)} 💡 💡</h3>
</div>`;
  const pendingAllWinnersBlock=result?.outcome==='allWinnersTopAllStar' && result.survivorId===gameState.playerQueenId && ep?.waitingForAllWinnersBlockChoice && !ep?.playerAllWinnersBlockChosen;
  document.querySelector('.screen').innerHTML=`${resultHero}
  ${introBlock}
  <div class="card music-card lipsync-battle-card"><h3 class="music-cue spotlight-cue">💡 💡 ${lipSyncEnergyLabel(ep.song)} 💡 💡</h3>${lipSyncResultPortraits(result)}<div class="commentary-block">${lipSyncNarrative(result)}</div></div>
  ${lipSyncDecisionCards(result)}
  ${renderAllWinnersBlockChoice(result)}
  ${pendingAllWinnersBlock?'':finalAmenCard()}
  ${pendingAllWinnersBlock?'':'<button id="continue">Continue</button>'}`;
  scrollToTop();
  bindAllWinnersBlockChoice(result);
  const continueBtn=document.querySelector('#continue');
  if(continueBtn)continueBtn.addEventListener('click',renderUntucked);
}
