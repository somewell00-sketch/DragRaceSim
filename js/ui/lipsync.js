function renderLipSync(){
  const ep=gameState.currentEpisode;
  const duelIds=ep.special==='premiere_no_elim' ? (ep.top2Queens||[]) : ep.bottomQueens;
  const bottom=duelIds.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const playerInBottom=duelIds.includes(gameState.playerQueenId);
  const badge=ep.special==='premiere_no_elim'?'Top 2 Lip Sync':'Lip Sync For Your Life';
  const intro=ep.special==='premiere_no_elim'
    ? 'Two top queens stand before me.'
    : 'Two queens stand before me.';
  const prompt=ep.special==='premiere_no_elim'
    ? "Ladies, this is your chance to snatch the first win of the season. The time has come... to lip sync for the win! Good luck... and don't fuck it up."
    : "Ladies, this is your last chance to impress me and save yourselves from elimination. The time has come... to lip sync for your lives! Good luck... and don't fuck it up.";
  setHTML(`<main class="layout"><section class="screen"><div class="hero">${bigMomentHeader('The music starts...', ep.special==='premiere_no_elim'?'LIP SYNC FOR THE WIN':'LIP SYNC FOR YOUR LIFE', ep.special==='premiere_no_elim'?'win':'danger')}<h2>${escapeHtml(ep.song.title)}</h2><p>${escapeHtml(ep.song.artist)}</p><div class="lipsync-portraits">${bottom.map(q=>`<div class="lipsync-queen">${queenPortraitHtml(q,'xl')}<strong>${escapeHtml(q.name)}</strong></div>`).join('<span class="vs">VS</span>')}</div></div><div class="card"><p>${escapeHtml(intro)}</p><p>${escapeHtml(prompt)}</p></div><div class="card" id="step"></div></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderLipSync));
  if(playerInBottom){renderLipSyncStrategyChoice();} else {const result=resolveLipSync(); applyEpisodeStats(); renderLipSyncResult(result);}
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
    ['play_safe','😌 Play It Safe','Keep it clean and controlled, but risk being forgettable.']
  ];
  const step=document.querySelector('#step');
  step.classList.add('decision-card','important');
  step.innerHTML=`<h3>Lip Sync Strategy</h3><p>You are in the Bottom. Choose the story you want to tell on stage.</p><p class="small">Reveals available: ${reveals}</p><div class="options">${strategies.map(([id,label,desc])=>{
    const disabled=(['save_reveal','reveal_early','multiple_reveals'].includes(id)&&reveals<=0)?'disabled':'';
    return choiceButtonHtml({id,attr:'data-strategy',label,desc,disabled});
  }).join('')}</div>`;
  document.querySelectorAll('[data-strategy]').forEach(btn=>btn.addEventListener('click',()=>{
    const moves=lipSyncMovesFromStrategy(btn.dataset.strategy, gameState.currentEpisode.song);
    const result=resolveLipSync(moves);
    applyEpisodeStats();
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
  if(low>=9.5) return 'legendary';
  if(low>=8) return 'iconic';
  if(high<5) return 'terrible';
  if(high<6.5) return 'forgettable';
  if(high<8) return 'warm';
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
  if(result.outcome==='top2Win') return 'top2Win';
  const diff=result.difference ?? Math.abs((result.results?.[0]?.score10||0)-(result.results?.[1]?.score10||0));
  const high=Math.max(...result.results.map(r=>r.score10));
  if(high<6.5) return 'weak';
  if(diff<0.6) return 'close';
  if(diff<1.8) return 'clear';
  return 'dominant';
}

function strategyResultTextFor(r, won){
  const strategy=r.moves?.strategy||'sell_lyrics';
  return shortPick(V20_LIPSYNC_TEXT.strategy[strategy]?.[won?'win':'lose'], lipSyncStrategyText(strategy));
}

function buildLipSyncCommentary(result){
  const tier=resultTier(result);
  const sorted=[...result.results].sort((a,b)=>b.score10-a.score10);
  const top=sorted[0], bottom=sorted[1];
  const lines=[];
  lines.push(shortPick(V20_LIPSYNC_TEXT.general[tier], 'The stage told the story.'));

  if(result.outcome==='doubleShantay'){
    sorted.forEach(r=>lines.push(`${r.name}: ${strategyResultTextFor(r,true)}`));
    lines.push('Sending either queen home would have felt wrong.');
    return {lines};
  }
  if(result.outcome==='doubleSashay'){
    sorted.forEach(r=>lines.push(`${r.name}: ${strategyResultTextFor(r,false)}`));
    lines.push('No one took control when it mattered.');
    return {lines};
  }

  sorted.forEach(r=>{
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
  const qs=ids.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  if(qs.length<2)return '';
  return `<div class="lipsync-portraits result-portraits">${qs.map(q=>`<div class="lipsync-queen">${queenPortraitHtml(q,'xl')}<strong>${escapeHtml(q.name)}</strong></div>`).join('<span class="vs">VS</span>')}</div>`;
}

function lipSyncNarrative(result){
  const c=buildLipSyncCommentary(result);
  return c.lines.map((line,i)=>`<p${i===0?' class="lead"':''}>${formatLipSyncLine(line,result)}</p>`).join('');
}
function lipSyncDecisionText(result){
  const ep=gameState.currentEpisode;
  if(result.outcome==='top2Win'){
    const winner=gameState.queens.find(q=>q.id===result.survivorId);
    const loser=result.results.find(r=>r.queenId!==result.survivorId);
    return `<p><strong>Condragulations, ${escapeHtml(winner.name)}. You are the winner of the premiere.</strong></p><p><strong>${escapeHtml(loser?.name||'The other top queen')}</strong>, you are safe to slay another day.</p>`;
  }
  if(result.outcome==='doubleShantay'){const names=result.results.map(r=>escapeHtml(r.name)); return `<p><strong>${names[0]} and ${names[1]}, Shantay, you both stay.</strong></p><p>No queen goes home tonight.</p>`;}
  if(result.outcome==='doubleSashay'){const names=result.results.map(r=>escapeHtml(r.name)); return `<p><strong>${names[0]} and ${names[1]}, I’m sorry, my dears, but neither of you survived this lip sync.</strong></p><p>Sashay away.</p>`;}
  const eliminated=gameState.queens.find(q=>q.id===result.eliminatedQueenId);
  const survivor=gameState.queens.find(q=>q.id===result.survivorId);
  return `<p><strong>${escapeHtml(survivor.name)}, Shantay, you stay.</strong></p><p><strong>${escapeHtml(eliminated.name)}</strong>, sashay away.</p>`;
}
function renderLipSyncResult(result){
  const ep=gameState.currentEpisode;
  const badge=ep.special==='premiere_no_elim'?'Top 2 Lip Sync':'Lip Sync For Your Life';
  const intro=ep.special==='premiere_no_elim'?'Two top queens stand before me.':'Two queens stand before me.';
  const prompt=ep.special==='premiere_no_elim'
    ? "Ladies, this is your chance to snatch the first win of the season. The time has come... to lip sync for the win! Good luck... and don't fuck it up."
    : "Ladies, this is your last chance to impress me and save yourselves from elimination. The time has come... to lip sync for your lives! Good luck... and don't fuck it up.";
  document.querySelector('.screen').innerHTML=`<div class="hero">${bigMomentHeader('The music starts...', ep.special==='premiere_no_elim'?'LIP SYNC FOR THE WIN':'LIP SYNC FOR YOUR LIFE', ep.special==='premiere_no_elim'?'win':'danger')}<h2>${escapeHtml(ep.song.title)}</h2><p>${escapeHtml(ep.song.artist)}</p></div>
  <div class="card"><p>${escapeHtml(intro)}</p><p>${escapeHtml(prompt)}</p></div>
  <div class="card music-card lipsync-battle-card"><h3 class="music-cue">💡💡🎶🎵🎶💡💡</h3>${lipSyncResultPortraits(result)}<div class="commentary-block">${lipSyncNarrative(result)}</div></div>
  <div class="card">${lipSyncDecisionText(result)}<p>If you can't love yourself, how in the hell are you gonna love somebody else? Can I get an amen?</p><p class="amen-response"><strong>AMEN!</strong></p><p class="small">Now let the music play</p><p class="music-cue">🎶🎵🎶</p></div>
  <button id="continue">Continue</button>`;
  scrollToTop();
  document.querySelector('#continue').addEventListener('click',renderUntucked);
}
