
function qName(id){return gameState.queens.find(q=>q.id===id)?.name||'A queen';}
function finaleFormatName(format){return format==='top4_lsfyc'?'Lip Sync for the Crown':format==='top3_cut'?'Top 3 Final Lip Sync':'Top 4 Final Two';}
const FINALE_GRAND='FINALE_GRAND';
const FINALE_INTRO='FINALE_INTRO';
const FINALE_LIPSYNC='FINALE_LIPSYNC';
const FINALE_RESULTS='FINALE_RESULTS';
function receptionTier(value, tiers){
  for(const tier of tiers){ if(value>=tier.min) return tier; }
  return tiers[tiers.length-1];
}
function fanReceptionTier(fans){
  return receptionTier(fans,[
    {min:70,label:'Legend',tone:'Your run already feels bigger than the season itself.'},
    {min:50,label:'Season Icon',tone:'Fans will be quoting you, debating you, and asking for more.'},
    {min:35,label:'Fan Favorite',tone:'The audience rooted for you hard, even when the competition got messy.'},
    {min:20,label:'Cult Favorite',tone:'Your fans may not be the loudest crowd, but they are loyal.'},
    {min:8,label:'Well Received',tone:'The audience respected your run and found clear moments to remember.'},
    {min:-7,label:'Mild Reception',tone:'You landed with some viewers, but never fully took over the conversation.'},
    {min:-25,label:'Rejected',tone:'The audience had a hard time connecting with your choices this season.'},
    {min:-999,label:'Fan Backlash',tone:'Your run sparked more criticism than affection from the audience.'}
  ]);
}
function productionReceptionTier(prod){
  return receptionTier(prod,[
    {min:70,label:'Main Character Edit',tone:'The cameras followed you like the season had your name on it.'},
    {min:50,label:'Production Darling',tone:'Production knew exactly how to use you every single week.'},
    {min:30,label:'Strong TV Presence',tone:'You gave the edit personality, conflict, humor, or stakes.'},
    {min:10,label:'Reliable Presence',tone:'You were useful television without overwhelming the season.'},
    {min:-9,label:'Neutral Edit',tone:'Production neither pushed nor buried your story.'},
    {min:-29,label:'Invisible Edit',tone:'The edit rarely made you central to the episode.'},
    {min:-999,label:'Hard to Edit',tone:'Production struggled to turn your run into a clear story.'}
  ]);
}
function castReceptionScore(q){
  const rels=Object.values(gameState.relationships?.[q?.id]||{});
  const relScore=rels.length ? rels.reduce((sum,r)=>sum+(Number(r.affinity)||0)+(Number(r.respect)||0)*0.75,0)/rels.length : 0;
  const pub=Number(q?.publicScores?.queens)||0;
  const flags=(q?.storyFlags||[]).concat((gameState.season?.storyFlags||[]).filter(f=>f.queenId===q?.id));
  const count=type=>flags.filter(f=>f.type===type).reduce((sum,f)=>sum+(Number(f.strength)||1),0);
  const st=q?.statistics||{};
  let score=(pub*0.55)+(relScore*0.75);
  score += count('alliance_builder')*8 + count('alliance_member')*5 + count('warm_moment')*4;
  score -= count('argument')*7 + count('villain_edit')*5 + count('villain_spark')*4;
  score += Math.min(10,(st.wins||0)*3+(st.highs||0)*1.5);
  score -= Math.min(8,(st.bottoms||0)*2);
  return Math.round(score);
}
function castReceptionTier(value){
  return receptionTier(value,[
    {min:70,label:'Cast Favorite',tone:'The workroom treated you like one of the hearts of the season.'},
    {min:48,label:'Beloved by the Cast',tone:'The other queens clearly had room for you.'},
    {min:28,label:'Respected by the Cast',tone:'Even when they disagreed with you, the cast respected your drag.'},
    {min:10,label:'Generally Liked',tone:'Most of the cast seemed comfortable with you.'},
    {min:-9,label:'Complicated Cast Reception',tone:'Your relationships had warmth, distance, and a few unresolved edges.'},
    {min:-27,label:'Divisive in the Workroom',tone:'Some queens connected with you, but the tension was real.'},
    {min:-49,label:'Difficult in the Workroom',tone:'The workroom often felt tense around you.'},
    {min:-999,label:'Cast Villain',tone:'The cast did not exactly line up to braid your wig.'}
  ]);
}
function queenTrackRecordPoints(q){
  const st=q?.statistics||{};
  // Weighted fan-style track record: WIN and HIGH matter most, LOW/BTM hurt, SAFE still counts as survival.
  return (st.wins||0)*10 + (st.highs||0)*5 + (st.safes||0)*1 - (st.lows||0)*2 - (st.bottoms||0)*6;
}
function frontRunnerIds(){
  const queens=gameState.queens||[];
  if(!queens.length)return [];
  const scored=queens.map(q=>({q,score:queenTrackRecordPoints(q)}));
  const max=Math.max(...scored.map(x=>x.score));
  return scored.filter(x=>x.score===max).map(x=>x.q.id);
}

function castRelationshipAverage(q){
  const rels=Object.values(gameState.relationships?.[q?.id]||{});
  if(!rels.length)return q?.publicScores?.queens||0;
  return rels.reduce((sum,r)=>sum+(Number(r.affinity)||0)+(Number(r.respect)||0)*0.6,0)/rels.length;
}
function worstRelationshipQueenId(){
  const queens=gameState.queens||[];
  if(!queens.length)return null;
  const scored=queens.map(q=>({id:q.id,score:castRelationshipAverage(q)})).sort((a,b)=>a.score-b.score);
  return scored[0]?.id||null;
}
function seasonArcTags(q){
  const st=q?.statistics||{}, fans=q.publicScores?.fans||0, prod=q.publicScores?.production||0, cast=q.publicScores?.queens||0;
  const tags=[];
  if(frontRunnerIds().includes(q.id)) tags.push('front-runner');
  if((st.lipSyncWins||0)>=2) tags.push('lip sync assassin');
  if((st.wins||0)+(st.highs||0)>=3 && q.id!==gameState.season?.winnerId && fans>=25) tags.push('robbed queen');
  if(fans>=35 && cast>=-10) tags.push('fan favorite');
  if(prod>=25 && cast<=-20 && fans>=-10) tags.push('villain edit');
  if(q.id===worstRelationshipQueenId() && castRelationshipAverage(q)<10) tags.push('villain');
  if(fans<10 && prod<10 && (st.wins||0)===0 && (st.highs||0)<=1 && (st.bottoms||0)<3) tags.push('filler queen');
  if(prod>=40) tags.push('production darling');
  if(prod<=-10 && fans<20) tags.push('invisible edit');
  if(cast>=35) tags.push('workroom favorite');
  if(cast<=-35) tags.push('cast villain');
  if(!tags.length){
    if((st.wins||0)>=2) tags.push('competitive threat');
    else if((st.bottoms||0)>=3) tags.push('survivor');
    else tags.push('steady competitor');
  }
  return [...new Set(tags)];
}
function mainSeasonArc(q){return seasonArcTags(q)[0]||'steady competitor';}
function postSeasonReception(q){
  if(!q)return '';
  const fans=q.publicScores?.fans||0, prod=q.publicScores?.production||0, cast=castReceptionScore(q);
  const fan=fanReceptionTier(fans);
  const production=productionReceptionTier(prod);
  const castTier=castReceptionTier(cast);
  const tags=seasonArcTags(q);
  const tagHtml=tags.map(t=>`<span class="badge arc">${escapeHtml(t)}</span>`).join(' ');
  let closing='Your run had a shape of its own: the track record, the edit, the audience, and the workroom did not always agree.';
  if(tags.includes('fan favorite')) closing='The fandom found something to hold onto, and that may matter long after the crown.';
  if(tags.includes('villain edit') || tags.includes('villain')) closing='Not every queen is loved, but some queens make television. You made television.';
  if(tags.includes('filler queen')) closing='You competed, but the season often moved around you instead of through you.';
  if(tags.includes('front-runner')) closing='Your track record made you one of the queens the others had to measure themselves against.';
  const receptionBlock=(icon,title,tier)=>`<article class="reception-item">
      <div class="reception-kicker">${icon} ${escapeHtml(title)}</div>
      <h3 class="reception-label">${escapeHtml(tier.label)}</h3>
      <p>${escapeHtml(tier.tone)}</p>
    </article>`;
  return `<section class="card reception-card"><h2>Your Post-Season Reception</h2>
    <p><strong>${escapeHtml(q.name)}</strong> leaves the season as a <strong>${escapeHtml(mainSeasonArc(q))}</strong>.</p>
    <div class="chips">${tagHtml}</div>
    <div class="reception-grid">
      ${receptionBlock('❤️','Fans',fan)}
      ${receptionBlock('🎬','Production',production)}
      ${receptionBlock('👑','Cast',castTier)}
    </div>
    <p>${escapeHtml(closing)}</p>
  </section>`;
}

function finaleStrategyOptionsHtml(){
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
    return choiceButtonHtml({id,attr:'data-finale-strategy',label,desc,disabled});
  }).join('')}</div><p class="small">Reveals available: ${reveals}</p>`;
}
function renderFinaleStrategyChoice(){
  setHTML(`<main class="layout"><section class="screen"><div class="hero"><span class="badge win">Finale</span><h2>Choose your final lip sync strategy</h2><p>If your queen reaches a crown lip sync, this is the approach she will bring to the stage.</p></div><div class="card decision-card"><h3>Your approach</h3>${finaleStrategyOptionsHtml()}</div></section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderFinaleStrategyChoice));
  document.querySelectorAll('[data-finale-strategy]').forEach(btn=>btn.addEventListener('click',()=>{
    gameState.season.playerFinaleStrategy=btn.dataset.finaleStrategy;
    saveGame();
    renderFinale();
  }));
}

function personalityDisplayName(q){
  const raw=q?.personalityId || q?.personality || '';
  const id=String(raw||'').toLowerCase();
  const profile=(gameState.data?.personalities||[]).find(p=>String(p.id||'').toLowerCase()===id || String(p.name||'').toLowerCase()===id);
  if(profile?.name) return profile.name;
  if(!raw) return 'Personality';
  return String(raw).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}
function slugText(value){
  return String(value||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'').trim();
}
function queenTypeKey(q){ return slugText(queenShortType(q)); }
function queenPersonalityKey(q){ return slugText(q?.personalityId || q?.personality || queenPersonalityName(q)); }
function finaleNarrativeTags(q){ return (typeof seasonArcTags==='function'?seasonArcTags(q):[]).map(slugText); }
function finaleTrackShape(q){
  const st=q?.statistics||{};
  if((st.wins||0)>=3 || (st.highs||0)>=5) return 'dominant';
  if((st.lipSyncWins||0)>=2 || (st.bottoms||0)>=3) return 'survivor';
  if((st.lows||0)+(st.bottoms||0)>=2 && (st.wins||0)+(st.highs||0)>=2) return 'redemption';
  if((st.safes||0)>=4 && (st.wins||0)===0 && (st.highs||0)<=1) return 'steady';
  if((st.wins||0)+(st.highs||0)>=3) return 'threat';
  return 'journey';
}
const FINALE_NARRATIVE_LINES={
  tags:{
    frontrunner:[
      'She entered the finale as one of the queens everyone wanted to beat.',
      'Her track record made her impossible to ignore.'
    ],
    competitivethreat:[
      'She pushed the competition from beginning to end.',
      'Week after week, she proved she could win in more than one way.'
    ],
    fanfavorite:[
      'Her warmth and authenticity kept the audience rooting for her.',
      'The fans found something in her they wanted to protect.'
    ],
    lipsyncassassin:[
      'Every time the music started, she reminded everyone why she was still here.',
      'She turned survival into a signature.'
    ],
    villain:[
      'Whether loved or feared, she made sure nobody forgot her.',
      'She kept the spotlight firmly on herself, even when the room pushed back.'
    ],
    villainedit:[
      'Whether loved or feared, she made sure nobody forgot her.',
      'She turned conflict into screen time and screen time into power.'
    ],
    wildcard:[
      'No one ever knew what she would do next, and that became her power.',
      'Her unpredictability kept the season on edge.'
    ],
    survivor:[
      'She fought her way through every scare and refused to disappear.',
      'Every stumble only made her harder to count out.'
    ],
    steadycompetitor:[
      'She built her run one careful week at a time.',
      'Her consistency carried her all the way to the finale.'
    ],
    productiondarling:[
      'She understood the assignment of television as much as the competition.',
      'The season always seemed to find her when something was happening.'
    ],
    fillerqueen:[
      'She made it here quietly, but the crown still demands a final statement.',
      'She stayed in the race long enough to ask for one last look.'
    ],
    workroomfavorite:[
      'The workroom knew her heart, and that carried weight all season.',
      'The cast saw something in her beyond the scoreboard.'
    ],
    castvillain:[
      'She was not here to make everyone comfortable.',
      'The workroom did not always love her, but it always reacted.'
    ]
  },
  personalities:{
    sweet:['Grace and kindness shaped the way she competed.','She brought softness without losing her bite.'],
    kind:['She competed with heart without losing herself.','Her kindness became part of her strength.'],
    competitive:['She treated every week like the crown was already in reach.','She never settled for safe when a win was possible.'],
    strategic:['Every move felt measured, but never invisible.','She knew when to wait and when to strike.'],
    calculating:['She played the long game and made every move count.','Her run felt like strategy, story, and survival.'],
    funny:['She made the season lighter, sharper, and harder to ignore.','She knew how to make the judges laugh and the cast react.'],
    chaotic:['She gave the season unpredictability, danger, and moments.','She kept the judges guessing until the end.'],
    reserved:['Quiet determination carried her further than anyone expected.','She let the work speak until the room finally listened.'],
    confident:['Her confidence turned pressure into presence.','She never waited for permission to own the room.'],
    ambitious:['She wanted the crown loudly, clearly, and without apology.','Her hunger shaped the entire competition.'],
    charming:['She made it easy to root for her without playing small.','Her charm carried her through the pressure.'],
    dramatic:['She made every week feel like event television.','She turned pressure into drama and drama into story.'],
    sarcastic:['Her sharpness made her impossible to forget.','She cut through the season with wit and timing.'],
    hotheaded:['She burned hot, fought hard, and never faded quietly.','Her fire kept the season on edge.'],
    perfectionist:['Her polish made every detail feel intentional.','She raised her own bar and kept reaching for more.'],
    fearless:['She took risks most queens would only talk about.','Her nerve made the finale feel like familiar territory.'],
    humble:['Her growth became the story.','Her humility made every breakthrough feel earned.'],
    flirty:['She turned charm, nerve, and a wink into a strategy.','She knew how to keep the room looking.'],
    eccentric:['Her point of view could not be copied.','Her oddness became her signature.']
  },
  types:{
    pageantqueen:['Polish, poise, and discipline carried her to the crown conversation.','She brought pageant precision to a season that demanded nerve.'],
    fashionqueen:['The runway became one of her strongest arguments.','She turned presentation into power.'],
    glamourqueen:['She made elegance feel competitive.','Luxury and polish were never far behind her.'],
    comedyqueen:['She understood how to turn timing into momentum.','Her humor gave her run a pulse.'],
    clubqueen:['She brought nightlife energy into the competition.','The room came alive whenever she found the beat.'],
    lipsyncassassin:['When the music started, she became dangerous.','She knew how to turn a song into survival.'],
    dancingqueen:['Performance was her language.','She made movement feel like a weapon.'],
    cosplayqueen:['She transformed fantasy into a competitive identity.','Her references became part of her signature.'],
    campqueen:['She made excess feel like a strategy.','The bigger she went, the clearer her point of view became.'],
    alternativequeen:['She made strangeness feel precise.','Her point of view refused to blend in.'],
    horrorqueen:['She turned darkness into drag power.','She made the unexpected feel glamorous.'],
    sewingqueen:['Construction and craft kept her in the conversation.','She proved that details can build a legacy.'],
    actingqueen:['She knew how to become a character without losing herself.','Performance carried her through more than one challenge.'],
    socialmediaqueen:['She knew how to make a moment travel.','Her instinct for attention became part of her run.'],
    hostessqueen:['She knew how to hold a room.','Presence and timing kept her story moving.'],
    theatrequeen:['She brought stage discipline to every big moment.','She knew how to land a line and sell a feeling.'],
    jackofalltrades:['She adapted to every challenge and peaked when it mattered.','Week after week, she proved she could do a little bit of everything.']
  },
  track:{
    dominant:['A strong track record made her finale spot feel inevitable.','Her wins gave the season a clear target.'],
    threat:['She stayed close enough to the crown that nobody could relax.','Her highs and wins kept building pressure.'],
    redemption:['She stumbled, adjusted, and finished stronger than ever.','Her run became a comeback story.'],
    survivor:['She survived the bottom and turned pressure into proof.','The bottom never managed to define her.'],
    steady:['She was not always loud, but she kept surviving.','Consistency gave her one last shot at the crown.'],
    journey:['Her path here was not simple, and that made the finale matter.','She arrived with a story only this season could have written.']
  }
};
function pickFinaleLine(group,key){
  const ext=gameState.data?.narrativeExpansion?.finaleNarratives || gameState.data?.narrativeText?.finaleNarratives || {};
  if(group==='tags' && ext[key]) return sample(ext[key]||[]);
  const bank=FINALE_NARRATIVE_LINES[group]||{};
  return sample(bank[key]||[]);
}
function finaleQueenReason(q){
  const tags=finaleNarrativeTags(q);
  const primaryTag=tags.find(t=>FINALE_NARRATIVE_LINES.tags[t]) || '';
  const personality=queenPersonalityKey(q);
  const type=queenTypeKey(q);
  const track=finaleTrackShape(q);
  const comboKey=`${personality}|${type}|${primaryTag||track}`;
  const combos={
    'sweet|pageantqueen|fanfavorite':'Grace, kindness and consistency made her impossible not to root for.',
    'competitive|fashionqueen|frontrunner':'She dominated the competition with confidence and unforgettable presentations.',
    'funny|clubqueen|lipsyncassassin':'She laughed through the competition, but truly came alive when the music started.',
    'strategic|campqueen|villain':'Every move felt calculated, yet she always kept the spotlight firmly on herself.',
    'reserved|cosplayqueen|survivor':'Quiet determination carried her much further than anyone expected.',
    'ambitious|jackofalltrades|competitivethreat':'Week after week, she proved she could excel no matter what the competition demanded.',
    'chaotic|alternativequeen|wildcard':'No one ever knew what she would do next, and that unpredictability became her greatest strength.'
  };
  if(combos[comboKey]) return combos[comboKey];
  const lines=[
    pickFinaleLine('tags',primaryTag),
    pickFinaleLine('types',type),
    pickFinaleLine('personalities',personality),
    pickFinaleLine('track',track)
  ].filter(Boolean);
  if(!lines.length) return 'She survived the season with a story only she could tell.';
  // One compact sentence keeps the finale card clean.
  return lines[0];
}
function finaleWinnerReason(q){
  if(!q) return '';
  const tags=finaleNarrativeTags(q);
  const primaryTag=tags.find(t=>FINALE_NARRATIVE_LINES.tags[t]) || '';
  const personality=queenPersonalityKey(q);
  const type=queenTypeKey(q);
  const track=finaleTrackShape(q);
  const core=[
    pickFinaleLine('personalities',personality),
    pickFinaleLine('types',type),
    pickFinaleLine('tags',primaryTag),
    pickFinaleLine('track',track)
  ].filter(Boolean);
  const sentence=core.slice(0,2).join(' ');
  return sentence || 'She adapted to the season, survived the pressure, and peaked when the crown was within reach.';
}

function finaleSafeSlug(value){
  return String(value||'').toLowerCase().replace(/&/g,'and').replace(/[^a-z0-9]+/g,'-').replace(/^-+|-+$/g,'') || 'unknown';
}
function finaleDivider(){
  return '<div class="finale-divider" aria-hidden="true"><span>✦</span></div>';
}
function finaleArchetypeHtml(q){
  const personality=queenPersonalityName(q);
  const type=queenShortType(q);
  return `<span class="finale-archetype"><span class="finale-personality personality-${escapeHtml(finaleSafeSlug(personality))}">${escapeHtml(personality)}</span> <span class="finale-dot">•</span> ${escapeHtml(type)}</span>`;
}
function finaleSectionHeading(label){
  return `<div class="finale-section-heading"><span>${escapeHtml(label)}</span></div>`;
}
function finaleSeasonFooter(){
  const lines=[
    '👑 These queens have shown excellence, resilience and star power all season long.',
    '✨ Only one queen could take the crown, but every finalist shaped the season.',
    '🏁 The season ends with charisma, nerve and one final story.'
  ];
  return `<p class="finale-season-footer">${escapeHtml(sample(lines))}</p>`;
}

function finaleRoleBadge(role){
  if(role==='WINNER') return '<span class="badge winner">👑 WINNER</span>';
  if(role==='RUNNERUP') return '<span class="badge runner">🥈 RUNNER-UP</span>';
  return '<span class="badge finalist">⭐ FINALIST</span>';
}
function finaleCard(q){
  const st=q.statistics||{};
  return `<article class="queen-item finale-queen-card">${queenPortraitHtml(q,'lg')}<div class="finale-card-body"><strong>${escapeHtml(q.name)}</strong>${finaleArchetypeHtml(q)}<span class="finale-stats">${st.wins||0} WIN • ${st.bottoms||0} BTM</span>${finaleDivider()}<p class="finale-note">${escapeHtml(finaleQueenReason(q))}</p></div></article>`;
}
function finalDuelScoreRows(finalDuel){
  return Object.entries(finalDuel.decisionScores||{}).map(([id,score])=>{
    const strategy=finalDuel.strategies?.[id]||'sell_lyrics';
    const label=typeof lipSyncStrategyLabel==='function'?lipSyncStrategyLabel(strategy):strategy;
    const text=finalDuel.strategyTexts?.[id]||'';
    return `<tr><td>${escapeHtml(qName(id))}</td><td><strong>${escapeHtml(label)}</strong><br><span class="small">${escapeHtml(text)}</span></td><td>${Math.round(score)}</td></tr>`;
  }).join('');
}
function renderFinale(){
  const stage=gameState.season?.finaleStage || FINALE_GRAND;
  if(stage===FINALE_GRAND || stage==='grand') return renderFinaleGrandFinale();
  if(stage===FINALE_INTRO || stage==='intro') return renderFinalePart1();
  if(stage===FINALE_LIPSYNC || stage==='lip_sync') return renderFinalePart2();
  if(stage===FINALE_RESULTS || stage==='results') return renderSummary();
  return renderFinaleGrandFinale();
}

function eliminatedQueensForFinaleReturn(){
  const finalistIds=new Set((gameState.season?.finale?.finalistIds)||gameState.queens.filter(q=>!q.isEliminated).map(q=>q.id));
  const seen=new Set();
  const ordered=[];
  (gameState.eliminatedQueens||[]).forEach(q=>{
    if(q && !finalistIds.has(q.id) && !seen.has(q.id)){
      seen.add(q.id);
      ordered.push(q);
    }
  });
  (gameState.queens||[]).forEach(q=>{
    if(q?.isEliminated && !finalistIds.has(q.id) && !seen.has(q.id)){
      seen.add(q.id);
      ordered.push(q);
    }
  });
  return ordered;
}
function finaleReturnLine(q){
  const last=(q.episodeHistory||[]).slice().reverse().find(h=>['ELIM','BTM','LOW'].includes(h.placement)) || {};
  const ep=last.episode && last.episode!=='Finale' ? `Ep. ${escapeHtml(last.episode)}` : 'Finale stage';
  return `<li><strong>${escapeHtml(q.name)}</strong> returns to the stage <span class="small">(${ep})</span></li>`;
}
function fanFavoriteScoreFor(voter, candidate){
  const rel=gameState.relationships?.[voter?.id]?.[candidate?.id] || {};
  const affinity=Number(rel.affinity)||0;
  const respect=Number(rel.respect)||0;
  const pub=candidate?.publicScores||{};
  const st=candidate?.statistics||{};
  let score=0;
  score += affinity*0.88;
  score += respect*0.62;
  score += (Number(pub.queens)||0)*0.48;
  score += (Number(pub.fans)||0)*0.24;
  score += (Number(pub.production)||0)*0.10;
  score += (st.wins||0)*1.30 + (st.highs||0)*0.65;
  score -= (st.bottoms||0)*0.40;
  score += rand(-8,8);
  return score;
}
function calculateFanFavorite(playerVoteId=null){
  const queens=gameState.queens||[];
  if(playerVoteId && playerVoteId===gameState.playerQueenId) playerVoteId=null;
  const totals={};
  queens.forEach(q=>{totals[q.id]=0;});
  queens.forEach(voter=>{
    const candidates=queens.filter(q=>q.id!==voter.id);
    if(!candidates.length)return;
    const pick=candidates
      .map(q=>({q,score:fanFavoriteScoreFor(voter,q)}))
      .sort((a,b)=>b.score-a.score)[0]?.q;
    if(pick)totals[pick.id]=(totals[pick.id]||0)+1;
  });
  if(playerVoteId && totals[playerVoteId]!==undefined) totals[playerVoteId]+=1;
  const topVotes=Math.max(...Object.values(totals));
  const tied=queens.filter(q=>(totals[q.id]||0)===topVotes);
  const winner=tied.sort((a,b)=>{
    const prodDiff=(Number(b.publicScores?.production)||0)-(Number(a.publicScores?.production)||0);
    if(prodDiff!==0)return prodDiff;
    const fanDiff=(Number(b.publicScores?.fans)||0)-(Number(a.publicScores?.fans)||0);
    if(fanDiff!==0)return fanDiff;
    return a.name.localeCompare(b.name);
  })[0] || queens[0] || null;
  gameState.season.fanFavorite={
    winnerId:winner?.id||null,
    playerVoteId:playerVoteId||null,
    votes:totals,
    tiedIds:tied.map(q=>q.id)
  };
  saveGame();
  return gameState.season.fanFavorite;
}
function fanFavoriteAnnouncementHtml(){
  if(typeof hasMissCongeniality==='function' && !hasMissCongeniality())return '';
  const fan=gameState.season?.fanFavorite;
  if(!fan?.winnerId)return '';
  const winner=gameState.queens.find(q=>q.id===fan.winnerId);
  const playerPick=gameState.queens.find(q=>q.id===fan.playerVoteId);
  const tieLine=(fan.tiedIds||[]).length>1 ? '<p class="small">The vote was tied, so production favorite broke the tie.</p>' : '';
  return `<section class="card important fan-favorite-reveal">
    <h2>⭐ Miss Congeniality</h2>
    <p>The queens have voted${playerPick?`, and your vote went to <strong>${escapeHtml(playerPick.name)}</strong>`:''}.</p>
    <p>The Miss Congeniality of the season is...</p>
    <p class="fan-favorite-winner-name"><strong>${escapeHtml(winner?.name||'A queen')}!</strong></p>
    ${tieLine}
  </section>`;
}
function renderFinaleGrandFinale(){
  const finalists=gameState.queens.filter(q=>!q.isEliminated);
  const returning=eliminatedQueensForFinaleReturn();
  const showMissCongeniality=typeof hasMissCongeniality==='function'?hasMissCongeniality():true;
  const existingVote=showMissCongeniality?gameState.season?.fanFavorite:{winnerId:null};
  const voteOptions=(gameState.queens||[]).filter(q=>q.id!==gameState.playerQueenId).slice().sort((a,b)=>a.name.localeCompare(b.name));
  const voteHtml=showMissCongeniality
    ? (existingVote
      ? `<p>The votes have been locked.</p><p class="small">Your vote: ${escapeHtml(qName(existingVote.playerVoteId))}</p>`
      : `<p>Who has your vote for Miss Congeniality?</p><div class="options fan-favorite-options">${voteOptions.map(q=>choiceButtonHtml({id:q.id,attr:'data-fan-favorite-vote',label:q.name,desc:q.isEliminated?'Eliminated queen':'Finalist',emoji:playerRelationshipLabel(q.id)})).join('')}</div>`)
    : `<p class="small">This format skips Miss Congeniality voting.</p>`;
  setHTML(`<main class="screen">
    <section class="hero">${finalePageBadge(1,'Grand Finale')}<h1>Grand Finale</h1><p>Welcome to the Grand Finale. Tonight, the full cast returns before the crown is decided.</p></section>
    <section class="card">
      <h2>Welcome Back, Queens</h2>
      <p>From the first queen to leave to the last queen before the finale, the cast returns to the stage and receives their applause.</p>
      ${returning.length?`<ol class="finale-return-list">${returning.map(finaleReturnLine).join('')}</ol>`:'<p>Every queen still standing has reached the finale.</p>'}
    </section>
    ${showMissCongeniality?`<section class="card important decision-card">
      <h2>Miss Congeniality Vote</h2>
      ${voteHtml}
    </section>`:''}
    <section class="card finale-results-card"><h2>👑 Finalists</h2>${finaleSectionHeading('Meet the Finalists')}<div class="grid finale-finalists">${finalists.map(finaleCard).join('')}</div></section>
    ${(existingVote||!showMissCongeniality)?'<button id="continueFinaleIntro">Continue</button>':''}
  </main>`);
  document.querySelectorAll('[data-fan-favorite-vote]').forEach(btn=>btn.addEventListener('click',()=>{
    calculateFanFavorite(btn.dataset.fanFavoriteVote);
    renderFinaleGrandFinale();
  }));
  const cont=document.querySelector('#continueFinaleIntro');
  if(cont)cont.addEventListener('click',()=>{
    gameState.season.finaleStage=FINALE_INTRO;
    saveGame();
    renderFinalePart1();
  });
}

function renderFinalePart1(){
  const activeFinalists=gameState.queens.filter(q=>!q.isEliminated);
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const playerIsFinalist=player && !player.isEliminated;
  const needsPlayerStrategy=playerIsFinalist && !gameState.season?.finale && !gameState.season?.playerFinaleStrategy;

  if(needsPlayerStrategy){
    setHTML(`<main class="screen">
      <section class="hero">${finalePageBadge(1,'Grand Finale')}<h1>The Grand Finale Begins</h1><p>The finalists return to the stage. One final story is about to be written.</p></section>
      <section class="card finale-results-card"><h2>👑 Finalists</h2>${finaleSectionHeading('Meet the Finalists')}<div class="grid finale-finalists">${activeFinalists.map(finaleCard).join('')}</div></section>
      <section class="card important decision-card"><h2>Your Finale Strategy</h2><p>You are still in the race. Choose how you will perform if Ru calls your name for a crown lip sync.</p>${finaleStrategyOptionsHtml()}</section>
    </main>`);
    document.querySelectorAll('[data-finale-strategy]').forEach(btn=>btn.addEventListener('click',()=>{
      gameState.season.playerFinaleStrategy=btn.dataset.finaleStrategy;
      saveGame();
      renderFinalePart1();
    }));
    return;
  }

  const finale=prepareFinale();
  const format=finaleFormatName(finale.format);
  const finalists=finale.finalistIds.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const crownFinalists=(finale.finalDuel?.queenIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const crownFinalistNames=crownFinalists.map(q=>q.name).join(' & ');
  const semiRows=(finale.format==='top4_lsfyc')?`<section class="card"><h2>Lip Sync for the Crown: Semi-finals</h2>${(finale.duels||[]).map(d=>semiFinalDuelCard(d)).join('')}</section>`:'';
const sashays = (finale.thirdFourthIds || []).length
  ? `<section class="card subtle">
      <h2>${finale.thirdFourthIds.map(id => escapeHtml(qName(id))).join(' & ')}</h2>
      <p>Your work this season helped define the competition. But this is not your moment.</p>
      <p>Now, sashay away.</p>
    </section>`
  : '';
  if((typeof hasMissCongeniality!=='function' || hasMissCongeniality()) && !gameState.season?.fanFavorite) calculateFanFavorite(null);
  setHTML(`<main class="screen">
    <section class="hero">${finalePageBadge(2,'Final Cut')}<h1>The Grand Finale Continues</h1><p>${escapeHtml(format)}. Ru makes the final cut before the last lip sync.</p></section>
    ${semiRows}
    ${sashays}
    ${fanFavoriteAnnouncementHtml()}
    <section class="card finale-top2-card">
      <h2>${escapeHtml(crownFinalistNames)}</h2>
      <p>The time has come...</p>
      <p>for you to lip sync...</p>
      <p><strong>FOR THE CROWN!</strong></p>
      <p><em>Good luck, and don't fuck it up.</em></p>
    </section>
    <button id="toFinalLipSync">Continue to the Final Lip Sync</button>
  </main>`);
  document.querySelector('#toFinalLipSync').addEventListener('click',()=>{
    gameState.season.finaleStage=FINALE_LIPSYNC;
    saveGame();
    renderFinalePart2();
  });
}

function finalePageBadge(n,label){
  return `<div class="finale-page-kicker"><span class="badge subtle">Finale ${n}/4</span><span class="badge">${escapeHtml(label)}</span></div>`;
}
function finalDuelToLipSyncResult(finalDuel){
  const ids=finalDuel.queenIds||[];
  const scores=finalDuel.decisionScores||finalDuel.lipScores||{};
  const vals=ids.map(id=>Number(scores[id]||0));
  const max=Math.max(...vals,1), min=Math.min(...vals,0);
  const rawDiff=Math.abs(max-min);
  const diff10=rawDiff<6?0.4:(rawDiff<14?1.2:2.5);
  const winnerId=finalDuel.winnerId;
  const results=ids.map(id=>{
    const won=id===winnerId;
    const strategy=finalDuel.strategies?.[id]||'sell_lyrics';
    return {
      queenId:id,
      name:qName(id),
      score10:won?8.8:Math.max(5.2,8.8-diff10),
      score:won?8.8:Math.max(5.2,8.8-diff10),
      moves:{strategy}
    };
  }).sort((a,b)=>b.score10-a.score10);
  return {outcome:'normal',results,survivorId:winnerId,eliminatedQueenId:finalDuel.loserId,difference:diff10};
}
function finalLipSyncNarrative(finalDuel){
  const result=finalDuelToLipSyncResult(finalDuel);
  if(typeof lipSyncNarrative==='function') return lipSyncNarrative(result);
  return `<p><strong>${escapeHtml(qName(finalDuel.winnerId))}</strong> controlled the final performance.</p>`;
}
function finalLipSyncDecision(finale){
  return `<p><strong>Condragulations, ${escapeHtml(qName(finale.winnerId))}. You are the winner, baby.</strong></p>`;
}
function semiFinalDuelCard(d){
  const result=finalDuelToLipSyncResult(d);
  const narrative=(typeof lipSyncNarrative==='function')?lipSyncNarrative(result):'';
  return `<div class="critique"><h4>${escapeHtml(d.label)}</h4><p><strong>${escapeHtml(qName(d.queenIds[0]))}</strong> vs <strong>${escapeHtml(qName(d.queenIds[1]))}</strong></p><div class="commentary-block">${narrative}</div><p><strong>${escapeHtml(qName(d.winnerId))}</strong> advances to the final lip sync.</p></div>`;
}

function renderFinalePart2(){
  const finale=prepareFinale();
  const finalDuel=finale.finalDuel;
  const songLine=finalDuel.song?`<p>Final song: <strong>${escapeHtml(finalDuel.song.title)}</strong> by ${escapeHtml(finalDuel.song.artist)}</p>`:'';
  const strategyRows=finalDuelScoreRows(finalDuel);
  setHTML(`<main class="screen">
    <section class="hero">${finalePageBadge(3,'Final Lip Sync')}${bigMomentHeader('One final performance...','THE FINAL LIP SYNC','crown')}<h1>${escapeHtml(qName(finalDuel.queenIds[0]))} vs ${escapeHtml(qName(finalDuel.queenIds[1]))}</h1><p>The crown comes down to one last performance.</p></section>
    <section class="card"><h2>The Final Performance</h2>${songLine}<p class="music-cue">💡💡🎶🎵🎶💡💡</p><div class="commentary-block">${finalLipSyncNarrative(finalDuel)}</div></section>
    <section class="card important winner-tease"><h2>The Winner Is...</h2><p>The crown is ready. The name comes next.</p></section>
    <button id="finishSeason">Reveal the Winner</button>
  </main>`);
  document.querySelector('#finishSeason').addEventListener('click',()=>{
    gameState.season.finaleStage=FINALE_RESULTS;
    crownWinner();
    renderSummary();
  });
}

function iconicLipSyncsTable(){
  const records=(gameState.season?.iconicLipSyncs||[])
    .slice()
    .sort((a,b)=>(Number(a.episode)||0)-(Number(b.episode)||0));

  if(!records.length) return '';

  const rows=records.map(item=>{
    const queens=(item.queens||[]).map(q=>{
      const name=escapeHtml(q.name||qName(q.queenId));
      return q.iconic ? `<strong>${name}</strong>` : name;
    }).join(' x ');

    const song=`${escapeHtml(item.songTitle||'Unknown song')} by ${escapeHtml(item.artist||'Unknown artist')}`;

    return `<tr>
      <td>Ep. ${escapeHtml(item.episode)}</td>
      <td>${queens}</td>
      <td>${song}</td>
    </tr>`;
  }).join('');

  return `<section class="card">
    <h2>Iconic Lip Syncs</h2>
    <table>
      <thead><tr><th>Episode</th><th>Lip Sync</th><th>Song</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  </section>`;
}

function renderSummary(){
  const winner=gameState.queens.find(q=>q.id===gameState.season.winnerId);
  const finale=gameState.season.finale||{};
  const runnerUps=(finale.runnerUpIds||gameState.queens.filter(q=>!q.isEliminated&&q.id!==winner?.id).map(q=>q.id)).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const finalistsOnly=(finale.finalistOnlyIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const resultCard=q=>`<article class="queen-item finale-result-item">${queenPortraitHtml(q,'md')}<div class="finale-card-body"><strong>${escapeHtml(q.name)}</strong>${finaleArchetypeHtml(q)}${finaleDivider()}<p class="finale-note">${escapeHtml(finaleQueenReason(q))}</p></div></article>`;
  const runnerBlock=runnerUps.length?`${finaleSectionHeading('Runner-up')}<div class="grid finale-results-grid">${runnerUps.map(q=>`<article class="queen-item finale-result-item">${queenPortraitHtml(q,'md')}<div class="finale-card-body"><strong>${escapeHtml(q.name)}</strong>${finaleArchetypeHtml(q)}${finaleDivider()}<p class="finale-note">${escapeHtml(finaleQueenReason(q))}</p><span>${finaleRoleBadge('RUNNERUP')}</span></div></article>`).join('')}</div>`:'';
  const finalistBlock=finalistsOnly.length?`${finaleSectionHeading('Finalists')}<div class="grid finale-results-grid">${finalistsOnly.map(q=>`<article class="queen-item finale-result-item">${queenPortraitHtml(q,'md')}<div class="finale-card-body"><strong>${escapeHtml(q.name)}</strong>${finaleArchetypeHtml(q)}${finaleDivider()}<p class="finale-note">${escapeHtml(finaleQueenReason(q))}</p><span>${finaleRoleBadge('FINALIST')}</span></div></article>`).join('')}</div>`:'';
  setHTML(`<main class="screen">
    <section class="hero finale-results-hero">${finalePageBadge(4,'Season Results')}<div class="finale-winner-kicker">${finaleRoleBadge('WINNER')}</div>${bigMomentHeader('The winner is...',(winner?.name||'Winner'),'crown')}${winner?`<div class="winner-portrait-wrap">${queenPortraitHtml(winner,'xl','winner-portrait')}</div>`:''}<p class="winner-copy"><strong>Condragulations, ${escapeHtml(winner?.name||'Winner')}.</strong> You are the winner, baby.</p>${winner?`${finaleDivider()}<p class="finale-winner-note">${escapeHtml(finaleWinnerReason(winner))}</p>`:''}</section>
    <section class="card finale-results-card"><h2>👑 Finalists</h2>${runnerBlock}${finalistBlock}${finaleSeasonFooter()}</section>
    ${postSeasonReception(player)}
    <section class="card"><h2>Track Record</h2>${historyTable()}</section>
    ${iconicLipSyncsTable()}
    <button id="newGame">New season</button>
  </main>`);
  document.querySelector('#newGame').addEventListener('click',()=>{clearSave(); resetState(); renderQueenCreator();});
}
