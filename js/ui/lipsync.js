function renderLipSync(){
  const ep=gameState.currentEpisode;
  const duelIds=ep.special==='premiere_no_elim' ? (ep.top2Queens||[]) : ep.bottomQueens;
  const bottom=duelIds.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
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
    ['overshadow','⚠️ Overshadow Your Opponent','High risk: steal the spotlight. If it lands, you gain score and your opponent loses score. If it fails, production clocks you as desperate.'],
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
  if(result.outcome==='top2Win') return 'top2Win';
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
  if(v<9) return 'strong';
  if(v<10) return 'outstanding';
  return 'legendary';
}

const V20_LIPSYNC_EXECUTION_TEXT = {
  emotion: {
    failed: [
      'She reached for tears, but the emotion never connected.',
      'The vulnerability felt misplaced, and the song slipped through her hands.',
      'Her face promised feeling, but her eyes stayed empty throughout.',
      'The emotion read as imitation, never genuine connection.',
      'She tried to manufacture depth, but the performance stayed surface-level.'
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
      'The connection was so raw and real that the judges forgot to breathe.'
    ],
    legendary: [
      'She did not perform the song — she lived inside it. The room broke open.',
      'The emotion became the entire story. It was impossible to look away.',
      'She rewired the song\'s meaning through sheer emotional force. Unforgettable.',
      'The vulnerability was so complete that the stage disappeared around her.',
      'She made the entire room feel what she felt. That\'s not performance — that\'s possession.'
    ]
  },
  sell_lyrics: {
    failed: [
      'The mouth moved, but the words had no life behind them.',
      'She knew pieces of the song, but never sold its meaning.',
      'The lyrics felt recited, not believed, and the judges noticed.',
      'She mouthed the words without ever convincing anyone she meant them.',
      'The song played, she moved her lips, but the connection never formed.'
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
      'She didn\'t just lip sync; she delivered a masterclass in lyrical storytelling.'
    ],
    legendary: [
      'Every syllable hit like a verdict. The judges watched her tell the whole song with her face.',
      'She made the track feel written for this exact moment. Legendary lyric work.',
      'The words became weapons, and she wielded every single one perfectly.',
      'She rewrote the song\'s meaning through sheer interpretive brilliance.',
      'The judges forgot the original artist existed. She owned every word.'
    ]
  },
  dance: {
    failed: [
      'The movement fought the beat, and the beat won.',
      'She chased the rhythm all over the stage and never caught it.',
      'The choreography looked rehearsed but never felt musical.',
      'Her body moved, but the song stayed somewhere else entirely.',
      'The dance was busy without ever being effective.'
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
      'The movement, the face, and the rhythm fused into something electric.'
    ],
    legendary: [
      'She brought the house down. The choreography became the moment.',
      'The floor, lights, and crowd moved with her. It was a full-stage takeover.',
      'She danced like the song owed her something — and she collected.',
      'Every move was a statement. The stage couldn\'t contain her.',
      'She redefined what a dance-heavy lip sync could be. Absolutely iconic.'
    ]
  },
  stunts: {
    failed: [
      'The tricks looked desperate and pulled focus from the song.',
      'The risk collapsed into messy movement and missed beats.',
      'She went for it, but the landing never matched the ambition.',
      'The stunts read as chaos, not choreography.',
      'She prioritized spectacle over substance, and it showed.'
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
      'She turned risk into reward with precision and guts.'
    ],
    legendary: [
      'Every stunt detonated on beat. The room lost its mind.',
      'It was athletic, musical, and ridiculous in the best possible way.',
      'She redefined what a lip sync could include. Legendary physicality.',
      'The stunts became the song\'s visual peak, and she nailed every single one.',
      'She took risks that should have failed and made them unforgettable victories.'
    ]
  },
  save_reveal: {
    failed: [
      'She waited for the climax, but the reveal missed the moment completely.',
      'The reveal came too late to save a performance already fading.',
      'She built toward something that never quite arrived.',
      'The timing was off, and the payoff fell flat.',
      'She saved the reveal, but the moment had already passed her by.'
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
      'The timing was immaculate, and the reveal elevated everything before it.'
    ],
    legendary: [
      'The reveal instantly became the defining image of the night.',
      'The climax hit, the garment changed, and the entire room erupted.',
      'She built a cathedral of tension and knocked it down with perfection.',
      'The reveal wasn\'t just a moment — it was the moment. Unforgettable.',
      'She turned the climax into a religious experience. Legendary timing.'
    ]
  },
  reveal_early: {
    failed: [
      'The early reveal burned through her surprise before the song had started moving.',
      'She showed the trick too soon and had nowhere else to go.',
      'The reveal happened, the room reacted, and then... nothing.',
      'She played her best card immediately and left the rest of the performance empty.',
      'The early shock worked, but she couldn\'t sustain the momentum.'
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
      'The early reveal created expectations, and she exceeded every single one.'
    ],
    legendary: [
      'The first beat became an event. The reveal lit the fuse and the performance exploded.',
      'She opened with a gag and somehow made every second after it bigger.',
      'The early reveal was so iconic that it redefined the song\'s opening.',
      'She set the bar impossibly high in the first five seconds and kept clearing it.',
      'The surprise was so perfect that the judges were hooked before the first chorus.'
    ]
  },
  multiple_reveals: {
    failed: [
      'The reveals piled up until the lip sync disappeared underneath them.',
      'Too many tricks, not enough performance. The spectacle turned messy.',
      'She kept reaching for surprises, but they stopped surprising.',
      'The multiple reveals became exhausting instead of exciting.',
      'She prioritized quantity over quality, and the performance suffered.'
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
      'She had the judges guessing what came next and delivered every time.'
    ],
    legendary: [
      'Reveal after reveal after reveal — and every single one hit. The room went feral.',
      'It became a full theatrical demolition. The song had chapters, and she dressed every one.',
      'She turned the lip sync into an event. Multiple reveals, maximum impact.',
      'The layers of surprises created a performance that felt like a movie.',
      'She kept pulling tricks and every single one landed. Absolute mastery.'
    ]
  },
  play_safe: {
    failed: [
      'The safe approach became invisible. Nothing truly happened.',
      'She avoided mistakes, but also avoided giving the judges a reason to care.',
      'The performance was clean, forgettable, and ultimately useless.',
      'She played it so safe that the song passed right through her.',
      'Nothing went wrong, but nothing went right either.'
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
      'She proved that you don\'t need spectacle when you have this much control.'
    ],
    legendary: [
      'She proved stillness can be lethal. The smallest choices shook the room.',
      'No stunt could have beaten that control. It was simplicity turned iconic.',
      'She made a quiet performance feel like the loudest statement of the night.',
      'The restraint was so masterful that it became unforgettable.',
      'She redefined what \'safe\' means by making it absolutely devastating.'
    ]
  },
  overshadow: {
    failed: [
      'She tried to steal focus, but it read as desperate. Production noticed for the wrong reasons.',
      'The attempt to overshadow backfired and made her look less in control.',
      'She reached for the spotlight and grabbed only air.',
      'The aggression read as panic, not power.',
      'She tried to dominate and ended up diminishing herself.'
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
      'The performance became a one-person show, and her opponent was just a prop.'
    ],
    legendary: [
      'She turned a duel into a takeover. Her opponent vanished in real time.',
      'It was brutal, magnetic, and unforgettable — a complete spotlight robbery.',
      'She ate her opponent alive on that stage. The judges couldn\'t look away.',
      'The overshadowing was so complete that the duel felt over in the first 30 seconds.',
      'She committed a performance murder and got away with it. Legendary.'
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
  const qs=ids.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean).sort((a,b)=>a.name.localeCompare(b.name));
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
  if(result.outcome==='doubleShantay'){const names=[...result.results].sort((a,b)=>a.name.localeCompare(b.name)).map(r=>escapeHtml(r.name)); return `<p><strong>${names[0]} and ${names[1]}, Shantay, you both stay.</strong></p><p>No queen goes home tonight.</p>`;}
  if(result.outcome==='doubleSashay'){const names=[...result.results].sort((a,b)=>a.name.localeCompare(b.name)).map(r=>escapeHtml(r.name)); return `<p><strong>${names[0]} and ${names[1]}, I’m sorry, my dears, but neither of you survived this lip sync.</strong></p><p>Sashay away.</p>`;}
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
