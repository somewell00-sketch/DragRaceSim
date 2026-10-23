// v31.5 round 3: the finale stage. The last lip syncs get a full "stage" (two queens, a huge VS,
// the song as a title card) and the crowning gets its own screen before the season results.

function tvStageQueen(id, state=''){
  const q=gameState.queens.find(x=>x.id===id);
  const name=q?.name||qName(id);
  const me=id===gameState.playerQueenId;
  const tag=state==='win'?'<span class="tv-stage-verdict tv-stage-verdict-win">Shantay</span>':state==='out'?'<span class="tv-stage-verdict tv-stage-verdict-out">Sashay</span>':'';
  return `<div class="tv-stage-queen${state?' is-'+state:''}${me?' is-me':''}">
    <div class="tv-stage-portrait">${q?queenPortraitHtml(q,'xl'):''}</div>
    <strong class="tv-stage-name">${escapeHtml(name)}</strong>
    ${q?`<span class="tv-stage-persona">${escapeHtml(typeof personalityDisplayName==='function'?personalityDisplayName(q):'')}${' · '+escapeHtml(String(typeof queenShortType==='function'?queenShortType(q):(q.type||'')))}</span>`:''}
    ${me?'<span class="tv-stage-you">You</span>':''}
    ${tag}
  </div>`;
}
function tvStageSong(song){
  if(!song?.title)return '';
  return `<div class="tv-stage-song"><span class="tv-stage-song-k">${typeof icon==='function'?icon('note'):''}The song</span><strong>${escapeHtml(song.title)}</strong><span class="tv-stage-artist">by ${escapeHtml(song.artist||'')}</span>${typeof energyMeterHtml==='function'?energyMeterHtml(song):''}</div>`;
}
// variant: 'semi' or 'crown'. reveal shows Shantay / Sashay on the two queens.
function tvStageVs({ids=[], kicker='', song=null, variant='semi', winnerId=null, reveal=false}){
  const st=id=>reveal&&winnerId?(id===winnerId?'win':'out'):'';
  const mid=variant==='crown'
    ? `<div class="tv-stage-mid">${typeof icon==='function'?icon('crown','tv-stage-crown-ic'):''}<span class="tv-stage-vs">VS</span></div>`
    : `<div class="tv-stage-mid"><span class="tv-stage-vs">VS</span></div>`;
  return `<section class="tv-stage tv-stage-${variant}">
    ${kicker?`<span class="tv-stage-kicker">${escapeHtml(kicker)}</span>`:''}
    <div class="tv-stage-duo">${tvStageQueen(ids[0],st(ids[0]))}${mid}${tvStageQueen(ids[1],st(ids[1]))}</div>
    ${tvStageSong(song)}
  </section>`;
}
function tvFinaleBlock(id,title,inner){return inner?`<section class="tv-block" data-block="${id}"><h3 class="tv-bt">${title}</h3><div class="tv-bc">${inner}</div></section>`:'';}
function tvFinaleDuelStamp(duel){
  if(typeof lipSyncPlayerStrategyStamp!=='function' || typeof finalDuelToLipSyncResult!=='function')return '';
  if(!(duel?.queenIds||[]).includes(gameState.playerQueenId))return '';
  return lipSyncPlayerStrategyStamp(finalDuelToLipSyncResult(duel));
}
function tvFinaleVerdictBands(duel, outLine){
  const winnerId=duel.winnerId;
  const loserId=duel.loserId||(duel.queenIds||[]).find(id=>id!==winnerId);
  const w=gameState.queens.find(q=>q.id===winnerId), l=gameState.queens.find(q=>q.id===loserId);
  const band=(q,kind,label,line,extra='')=>q?`<div class="tv-band tv-band-${kind}"><div class="tv-band-head">${queenPortraitHtml(q,'sm')}<div class="tv-band-copy"><span class="tv-band-label">${escapeHtml(label)}</span><span class="tv-band-line">${escapeHtml(line)}</span></div></div>${extra}</div>`:'';
  return band(w,'shantay','Shantay',`${w?.name}, shantay you stay.`)+band(l,'sashay','Not your moment',`${l?.name}, sashay away.`,outLine?`<p>${escapeHtml(outLine)}</p>`:'');
}

// ---------- the crowning ----------
function tvSeasonTitle(){
  return (typeof getSeasonFormat==='function'&&getSeasonFormat()==='all_winners')?'Queen of All Queens':"America's Next Drag Superstar";
}
function tvPlayerSeasonChips(q){
  const st=q?.statistics||{};
  const hist=(q?.episodeHistory||[]).filter(h=>h.episode!=='Finale');
  const highs=hist.filter(h=>['HIGH','TOP2'].includes(h.placement)).length;
  const chips=[[Number(st.wins)||hist.filter(h=>h.placement==='WIN').length,'Wins'],[highs,'Highs'],[Number(st.bottoms)||0,'Bottoms']];
  return `<div class="tv-crown-stats">${chips.map(([n,l])=>`<span><strong>${n}</strong>${l}</span>`).join('')}</div>`;
}
function tvCrownMomentHtml(winner, opts={}){
  if(!winner)return '';
  const pid=gameState.playerQueenId;
  const isMe=winner.id===pid;
  const seasonN=gameState.season?.number||1;
  return `<section class="tv-crown-moment${opts.animate?' is-live':''}${isMe?' is-me':''}">
    <div class="tv-crown-rays" aria-hidden="true"></div>
    <span class="tv-crown-kicker">${escapeHtml(tvSeasonTitle())}</span>
    ${typeof icon==='function'?icon('crown','tv-crown-ic'):''}
    <div class="tv-crown-portrait">${queenPortraitHtml(winner,'xl','winner-portrait')}</div>
    <strong class="tv-crown-name">${escapeHtml(winner.name)}</strong>
    <p class="tv-crown-line">Condragulations, ${escapeHtml(winner.name)}. You're the winner, baby!</p>
    ${isMe?`<div class="tv-crown-you"><span>That's you!</span><p>From the werkroom to the crown. Your name goes on the wall of winners.</p>${tvPlayerSeasonChips(winner)}</div>`:''}
  </section>`;
}
function renderWinnerReveal(){
  const season=gameState.season;
  const finale=season.finale||{};
  const winner=gameState.queens.find(q=>q.id===(finale.winnerId||season.winnerId));
  const finalIds=(finale.finalDuel?.queenIds||[winner?.id]).filter(Boolean);
  const pid=gameState.playerQueenId;
  const revealed=!!season.crownRevealed;
  const runnerIds=(finale.runnerUpIds||finalIds.filter(id=>id!==winner?.id));
  const playerRunner=!winner||winner.id===pid?false:runnerIds.includes(pid);
  const tease=`<section class="tv-stage tv-stage-crown tv-stage-tease">
      <span class="tv-stage-kicker">The winner of the season</span>
      <div class="tv-stage-duo">${tvStageQueen(finalIds[0])}<div class="tv-stage-mid">${typeof icon==='function'?icon('crown','tv-stage-crown-ic'):''}</div>${finalIds[1]?tvStageQueen(finalIds[1]):''}</div>
    </section>
    <div class="card tv-ru-speech"><span class="tv-speaker">RuPaul</span><p>Ladies, I have made my decision. ${escapeHtml(tvSeasonTitle())} is…</p></div>`;
  const runnerCard=playerRunner?`<div class="card tv-runner-card"><span class="tv-tag tv-tag-runner">${typeof icon==='function'?icon('medal'):''}Runner-up</span><h3>So close.</h3><p>You took it to the very last song. The crown went to ${escapeHtml(winner?.name||'')}, but this season was yours too.</p></div>`:'';
  setHTML(`<main class="screen tv-crowning">
    <div class="hero tv-ep-title"><span class="eyebrow">Finale 4/4 · The crowning</span><h2>${revealed?'Your winner':'The winner is…'}</h2></div>
    ${revealed?tvCrownMomentHtml(winner,{animate:!season.crownRevealSeen})+runnerCard:tease}
    <div class="tv-nav">${revealed?'<button id="tvToResults" class="tv-next">See the season results</button>':'<button id="tvRevealCrown" class="tv-next">Reveal the winner</button>'}</div>
  </main>`);
  if(revealed && !season.crownRevealSeen){season.crownRevealSeen=true;saveGame();}
  document.querySelector('#tvRevealCrown')?.addEventListener('click',()=>{season.crownRevealed=true;saveGame();window.scrollTo(0,0);renderWinnerReveal();});
  document.querySelector('#tvToResults')?.addEventListener('click',()=>{season.winnerRevealDone=true;saveGame();window.scrollTo(0,0);renderSummary();});
}
