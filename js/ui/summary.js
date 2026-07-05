
function qName(id){return gameState.queens.find(q=>q.id===id)?.name||'A queen';}
function finaleFormatName(format){return format==='all_winners'?'All Winners Lip Sync Tournaments':format==='top4_lsfyc'?'Lip Sync for the Crown':format==='top3_cut'?'Top 3 Final Lip Sync':'Top 4 Final Two';}
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
    {min:30,label:'Season Icon',tone:'Fans will be quoting you, debating you, and asking for more.'},
    {min:24,label:'Fan Favorite',tone:'The audience rooted for you hard, even when the competition got messy.'},
    {min:17,label:'Cult Favorite',tone:'A loyal part of the fandom held onto your run.'},
    {min:10,label:'Well Received',tone:'Fans appreciated your journey without turning it into a coronation.'},
    {min:-4,label:'Mixed Reception',tone:'You made an impression, but opinions stayed split.'},
    {min:-19,label:'Polarizing Contestant',tone:'The audience debated your choices more than they simply embraced them.'},
    {min:-999,label:'Fan Backlash',tone:'Your run sparked more criticism than affection from the audience.'}
  ]);
}
function productionReceptionTier(prod){
  return receptionTier(prod,[
    {min:24,label:'Main Character Edit',tone:'The cameras followed you like the season had your name on it.'},
    {min:18,label:'Production Darling',tone:'Production knew exactly how to use you every single week.'},
    {min:12,label:'Strong TV Presence',tone:'You gave the edit personality, conflict, humor, or stakes.'},
    {min:6,label:'Useful Television',tone:'Production enjoyed having you on the show, but did not build everything around you.'},
    {min:-14,label:'Professional Relationship',tone:'Production could use you when needed, but the relationship stayed mostly neutral.'},
    {min:-29,label:'Hard to Center',tone:'The edit rarely made you central to the episode.'},
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
    {min:38,label:'Cast Favorite',tone:'The workroom treated you like one of the hearts of the season.'},
    {min:24,label:'Beloved by the Cast',tone:'The other queens clearly had real affection for you.'},
    {min:12,label:'Respected by the Cast',tone:'Even when they disagreed with you, the cast respected your drag.'},
    {min:-4,label:'Generally Liked',tone:'Most of the cast seemed comfortable with you.'},
    {min:-14,label:'Complicated Cast Reception',tone:'Your relationships had warmth, distance, and a few unresolved edges.'},
    {min:-29,label:'Divisive in the Workroom',tone:'Some queens connected with you, but the tension was real.'},
    {min:-44,label:'Difficult in the Workroom',tone:'The workroom often felt tense around you.'},
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
  if((st.wins||0)+(st.highs||0)>=3 && q.id!==gameState.season?.winnerId && fans>=19) tags.push('robbed queen');
  if(fans>=30 && cast>=-10) tags.push('fan favorite');
  if(prod>=16 && cast<=-20 && fans>=-10) tags.push('villain edit');
  if(q.id===worstRelationshipQueenId() && castRelationshipAverage(q)<10) tags.push('villain');
  if(fans<9 && prod<5 && (st.wins||0)===0 && (st.highs||0)<=1 && (st.bottoms||0)<3) tags.push('filler queen');
  if(prod>=26) tags.push('production darling');
  if(prod<=-15 && fans<19) tags.push('invisible edit');
  if(cast>=24) tags.push('workroom favorite');
  if(cast<=-35) tags.push('cast villain');
  if(!tags.length){
    if((st.wins||0)>=2) tags.push('competitive threat');
    else if((st.bottoms||0)>=3) tags.push('survivor');
    else tags.push('steady competitor');
  }
  return [...new Set(tags)];
}
function mainSeasonArc(q){return seasonArcTags(q)[0]||'steady competitor';}
function summaryPick(lines){
  const pool=(lines||[]).filter(Boolean);
  return pool.length ? sample(pool) : '';
}
function summaryUniquePush(lines,line){
  if(line && !lines.includes(line)) lines.push(line);
}

function summaryShuffle(lines){
  const pool=[...(lines||[])];
  for(let i=pool.length-1;i>0;i--){
    const j=Math.floor(Math.random()*(i+1));
    [pool[i],pool[j]]=[pool[j],pool[i]];
  }
  return pool;
}
function summaryTakeRandom(lines,count){
  const unique=[...new Set((lines||[]).filter(Boolean))];
  return summaryShuffle(unique).slice(0,Math.max(0,count));
}
function summaryRelationshipStats(q){
  const rels=Object.values(gameState.relationships?.[q?.id]||{});
  if(!rels.length)return {avgAffinity:q?.publicScores?.queens||0,avgRespect:q?.publicScores?.queens||0,strong:0,tense:0};
  const avgAffinity=rels.reduce((sum,r)=>sum+(Number(r.affinity)||0),0)/rels.length;
  const avgRespect=rels.reduce((sum,r)=>sum+(Number(r.respect)||0),0)/rels.length;
  return {
    avgAffinity,
    avgRespect,
    strong:rels.filter(r=>(Number(r.affinity)||0)>=25 || (Number(r.respect)||0)>=25).length,
    tense:rels.filter(r=>(Number(r.affinity)||0)<=-20 || (Number(r.respect)||0)<=-20).length
  };
}
function summarySignals(q){
  const st=q?.statistics||{};
  const fans=Number(q?.publicScores?.fans)||0;
  const production=Number(q?.publicScores?.production)||0;
  const queens=Number(q?.publicScores?.queens)||0;
  const rel=summaryRelationshipStats(q);
  const tags=seasonArcTags(q);
  const totalEpisodes=(gameState.season?.history||[]).filter(h=>h?.placements).length || Math.max(1,(st.wins||0)+(st.highs||0)+(st.safes||0)+(st.lows||0)+(st.bottoms||0));
  const competitive=(st.wins||0)+(st.highs||0);
  const vulnerable=(st.lows||0)+(st.bottoms||0);
  return {st,fans,production,queens,rel,tags,totalEpisodes,competitive,vulnerable,
    won:q?.id===gameState.season?.winnerId,
    finalist:!(q?.isEliminated),
    eliminated:q?.isEliminated,
    earlyOut:q?.isEliminated && (st.episodes||totalEpisodes)<=Math.ceil(totalEpisodes*0.55),
    consistent:competitive>=3 && vulnerable<=1,
    improved:competitive>=2 && vulnerable>=1,
    trackThreat:(st.wins||0)>=2 || competitive>=4,
    lipsyncLegend:(st.lipSyncWins||0)>=2,
    runwayIcon:(st.runwayWins||0)>=2 || (Number(st.runwayAvg)||0)>=75,
    challengeBeast:(st.wins||0)>=2 || (Number(st.challengeAvg)||0)>=75,
    underdog:vulnerable>=2 && competitive>=1,
    robbed:tags.includes('robbed queen') || (!q?.isEliminated && gameState.season?.winnerId!==q?.id && competitive>=3),
    villain:tags.includes('villain') || tags.includes('villain edit') || queens<=-20,
    lovedByCast:rel.avgAffinity>=20 || rel.avgRespect>=25 || queens>=25,
    tenseCast:rel.tense>=2 || rel.avgAffinity<=-15 || queens<=-20
  };
}
function buildFansSummary(q,tier){
  const s=summarySignals(q), lines=[];
  const opening={
    high:['Fans treated your run like required viewing.','The fandom found plenty to talk about whenever you appeared on screen.','Online, your name kept coming up long after the episodes ended.'],
    mid:['Viewers found a clear story in your season, even when the edit moved elsewhere.','Fans may not have agreed on every choice, but they remembered you.','Your reception had layers: praise, debate, and a few very loud opinions.'],
    low:['The audience had a complicated relationship with your run.','Viewers did not always know what to make of you this season.','Your season sparked more debate than universal applause.']
  };
  summaryUniquePush(lines,summaryPick(s.fans>=19?opening.high:s.fans>=-4?opening.mid:opening.low));
  if(s.tags.includes('fan favorite')) summaryUniquePush(lines,summaryPick(['You had the kind of fan support that turns confessionals into quotes and exits into campaigns.','A loyal chunk of the fandom was ready to defend you no matter what happened.','By the end, people were talking about you like a queen they wanted to see again.']));
  if(s.runwayIcon) summaryUniquePush(lines,summaryPick(['Your runway package became one of the biggest parts of your fan reputation.','Even viewers rooting for other queens had to admit your looks were memorable.','Fashion fans kept screenshots of your runways ready for every debate.']));
  if(s.lipsyncLegend) summaryUniquePush(lines,summaryPick(['Your lip syncs gave the fandom exactly the kind of drama they log on for.','Every time you landed in danger, fans expected a performance worth replaying.','You turned survival into part of your brand.']));
  if(s.consistent) summaryUniquePush(lines,summaryPick(['Fans clocked how rarely you truly stumbled.','Your consistency became a quiet argument in your favor.','Week after week, viewers saw you as one of the safest bets in the room.']));
  if(s.underdog) summaryUniquePush(lines,summaryPick(['Your weaker weeks only made some fans root harder for the comeback.','The fandom loves a survivor, and you gave them one.','Your run had enough close calls to make people emotionally invested.']));
  if(s.villain && s.fans>=10) summaryUniquePush(lines,summaryPick(['You were messy in a way many viewers found entertaining rather than unforgivable.','Some fans loved you because you were willing to cause a little chaos.','You became the kind of polarizing queen people could not stop discussing.']));
  if(s.villain && s.fans<0) summaryUniquePush(lines,summaryPick(['For some viewers, the drama overshadowed the drag.','The fandom was not always ready to forgive the messier parts of your season.','Your louder moments created backlash that followed the rest of your run.']));
  if((s.robbed || s.eliminated) && s.competitive>=3) summaryUniquePush(lines,summaryPick(['Your elimination immediately entered the “was she robbed?” conversation.','A lot of viewers felt your track record deserved a longer runway.','The exit felt abrupt enough to keep fans debating it.']));
  if(s.earlyOut && s.fans>=9) summaryUniquePush(lines,summaryPick(['Even with limited time, you left enough of an impression to become a cult favorite.','Your run was short, but fans still found a reason to remember you.']));
  if(lines.length<2) summaryUniquePush(lines,tier.tone);
  return lines.slice(0,Math.min(3,Math.max(1,lines.length))).join(' ');
}
function buildProductionSummary(q,tier){
  const s=summarySignals(q), lines=[];
  summaryUniquePush(lines,summaryPick(s.production>=16?['Production quickly realized you were useful television.','The story team clearly knew where to place you in the season.','The cameras had plenty of reasons to stay near you.']:s.production>=-14?['Production could use you when the episode needed texture.','Your edit gave the season a steady presence without taking over completely.','Behind the scenes, you were reliable material.']:['Production struggled to find the cleanest version of your story.','The edit did not always know where to put you.','You were not always the easiest queen to shape into a simple storyline.']));
  if(s.tags.includes('production darling')) summaryUniquePush(lines,summaryPick(['You gave confessionals, stakes, and enough personality to keep the edit moving.','Whenever the season needed a point of view, you were an easy cutaway.','You had the kind of presence producers can build episodes around.']));
  if(s.villain && s.production>=15) summaryUniquePush(lines,summaryPick(['The tension around you gave production a storyline with teeth.','Your conflicts were easy to edit into episode momentum.','You knew how to make a scene feel bigger than the challenge itself.']));
  if(s.underdog) summaryUniquePush(lines,summaryPick(['Your close calls gave the editors a natural underdog arc.','Production could frame your season as a fight to stay in the room.','The vulnerable weeks gave your story real stakes.']));
  if(s.improved) summaryUniquePush(lines,summaryPick(['The arc was clear: struggle, adjustment, and a stronger finish.','Your season gave production a usable redemption shape.','The improvement made your story easier to root for.']));
  if(s.consistent) summaryUniquePush(lines,summaryPick(['You were dependable, which made you easy to build around without forcing drama.','The producers could trust you to deliver clean competition beats.','Your track record gave the edit a professional backbone.']));
  if(s.lipsyncLegend) summaryUniquePush(lines,summaryPick(['Every lip sync gave production a built-in climax.','Your survival moments were exactly the kind of footage producers can sell in a recap.','Danger around you rarely felt boring.']));
  if(s.fans>=30 && s.production<16) summaryUniquePush(lines,summaryPick(['Even when production did not center you, the audience found you anyway.','Your fan response did some of the work the edit did not.']));
  if(s.finalist && !s.won) summaryUniquePush(lines,summaryPick(['By the finale, you looked like credible endgame material.','Production had enough footage to make your finalist story make sense.']));
  if(lines.length<2) summaryUniquePush(lines,tier.tone);
  return lines.slice(0,Math.min(3,Math.max(1,lines.length))).join(' ');
}
function buildQueensSummary(q,tier){
  const s=summarySignals(q), openingPool=[], detailPool=[], closingPool=[];

  if(s.lovedByCast){
    openingPool.push(
      'The workroom largely understood what you brought to the competition.',
      'Most of the cast had real respect for your drag.',
      'The other queens could see your talent, even when pressure was high.',
      'Inside the workroom, your drag earned attention even before the judges weighed in.',
      'The cast may not have agreed on everything, but they knew you were a serious competitor.',
      'You became one of those queens the room had to take seriously.'
    );
  }else if(s.tenseCast){
    openingPool.push(
      'Your place in the workroom was not always comfortable.',
      'The cast had complicated feelings about competing beside you.',
      'Some queens respected the drag more than the workroom energy.',
      'You were not always easy for the other queens to read.',
      'The workroom energy around you could shift from admiration to tension very quickly.',
      'Some competitors kept one eye on your talent and the other on the drama around you.'
    );
  }else{
    openingPool.push(
      'Among the queens, your reputation landed somewhere between respected and hard to read.',
      'The cast saw your strengths, even if not every relationship became close.',
      'Your workroom story had warmth in some corners and distance in others.',
      'The other queens had a mixed but memorable read on your season.',
      'You were not invisible in the workroom, but you were not always fully understood either.',
      'Your relationships with the cast had enough nuance to avoid one simple label.'
    );
  }

  if(s.rel.strong>=3) detailPool.push(
    'You built a real inner circle, and several queens seemed to trust you beyond the competition.',
    'Your closest bonds made you feel like part ally, part emotional anchor.',
    'A few competitors clearly treated you like someone they could lean on.'
  );
  else if(s.rel.strong>=1) detailPool.push(
    'You had at least a few queens who genuinely seemed to value your presence.',
    'Your strongest connections gave the workroom a softer read on you.',
    'Not every bond was deep, but the ones that worked felt real.'
  );

  if(s.rel.tense>=3) detailPool.push(
    'Still, more than one queen seemed drained by the tension around you.',
    'Your conflicts left marks, and the room did not always move past them quickly.',
    'A few relationships clearly ended the season colder than they began.'
  );
  else if(s.rel.tense>=1) detailPool.push(
    'There were a few tense corners of the workroom, even when things stayed civil.',
    'Some queens kept their distance, especially once the pressure got higher.',
    'A little friction followed you, but it never became the whole story.'
  );

  if(s.trackThreat) detailPool.push(
    'Your track record made you hard to ignore as a threat.',
    'Nobody could pretend your competitive résumé was accidental.',
    'The stronger your record became, the more the room had to measure itself against you.',
    'By the back half of the season, you were someone queens had to plan around.',
    'Your wins and highs made the cast treat you less like a friend and more like a problem.'
  );
  if(s.consistent) detailPool.push(
    'Queens may debate taste, but consistency earns respect.',
    'Your professionalism made it difficult for the cast to dismiss you.',
    'Even rivals had to acknowledge how often you delivered.',
    'You were the kind of competitor who made other queens check their own work twice.'
  );
  if(s.challengeBeast) detailPool.push(
    'In challenges, the cast knew you were not someone to underestimate.',
    'When a challenge played to your strengths, the room could feel it immediately.',
    'Other queens had to admit you knew how to perform under pressure.'
  );
  if(s.runwayIcon) detailPool.push(
    'Your runways gave the cast something to envy, study, or quietly fear.',
    'Even backstage, your looks could shift the energy in the room.',
    'The fashion side of your drag made a clear impression on the other queens.'
  );
  if(s.lipsyncLegend) detailPool.push(
    'Nobody wanted to meet you in a lip sync once your survival streak became clear.',
    'Your lip sync record made you dangerous even on a bad week.',
    'The cast learned that putting you in the bottom did not mean getting rid of you.'
  );
  if(s.underdog && s.lovedByCast) detailPool.push(
    'Your vulnerable weeks made some queens protective of you rather than dismissive.',
    'The room watched you fight, and that earned a particular kind of respect.',
    'Your comeback energy made the cast root for you more than they expected.'
  );
  if(s.villain) detailPool.push(
    'Some competitors found your presence intimidating, exhausting, or both.',
    'You were not afraid of friction, and the room felt that.',
    'The tension around you became part of how the cast remembered the season.',
    'You could turn a normal workroom day into a very careful conversation.',
    'Some queens admired your nerve; others simply braced themselves.'
  );
  if(s.production>=35 && s.queens<0) detailPool.push(
    'Some queens could tell production loved you, which did not always make you more popular backstage.',
    'Being great TV helped your edit more than your workroom relationships.',
    'The cast noticed when the cameras seemed especially interested in you.'
  );
  if(s.rel.avgRespect>=30 && s.rel.avgAffinity<5) detailPool.push(
    'You were respected more than you were cuddled.',
    'The cast admired the craft, even when the friendships stayed guarded.',
    'You earned professional respect without necessarily becoming everyone\'s comfort person.'
  );
  if(s.rel.avgAffinity>=25 && s.rel.avgRespect<15) detailPool.push(
    'The room liked your energy, even when they were not always scared of your track record.',
    'You had a social warmth that sometimes mattered more than placements.',
    'Some queens remembered your kindness before they remembered your scores.'
  );
  if(s.finalist && !s.won) detailPool.push(
    'By the finale, several competitors saw you as someone who had earned the right to stand there.',
    'Making it that far changed how the room looked at your run.',
    'Your finalist placement forced even skeptical queens to acknowledge the full arc.'
  );
  if(s.won) detailPool.push(
    'By crowning night, the cast could argue about details, but not about your impact.',
    'Winning made the workroom read of your season impossible to ignore.',
    'The crown turned your strongest relationships and rivalries into part of your legacy.'
  );

  if(s.lovedByCast) closingPool.push(
    'By the end, you left with more admiration than resentment.',
    'Your cast reputation felt like one of your strongest assets.',
    'Even the shade came with a level of respect.'
  );
  else if(s.tenseCast) closingPool.push(
    'By the end, the cast remembered you as talent, tension, and very little neutrality.',
    'You did not leave the workroom untouched, and the workroom did not leave you untouched either.',
    'Your cast reception was messy, but it was not forgettable.'
  );
  else closingPool.push(
    'By the end, you were remembered as a layered presence in the room.',
    'The cast may not have fully solved you, but they did not overlook you.',
    'Your workroom reputation stayed complicated in a way that suited the season.'
  );

  const opening=summaryPick(openingPool)||tier.tone;
  const target=1+Math.floor(Math.random()*3);
  const middle=summaryTakeRandom(detailPool,Math.max(0,target-1));
  let lines=[opening,...middle];
  if(lines.length<2 && closingPool.length) lines.push(summaryPick(closingPool));
  else if(lines.length<3 && Math.random()<0.45) lines.push(summaryPick(closingPool));
  return [...new Set(lines)].slice(0,3).join(' ');
}
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
  const receptionBlock=(icon,title,tier,body)=>`<article class="reception-item">
      <div class="reception-kicker">${icon} ${escapeHtml(title)}</div>
      <h3 class="reception-label">${escapeHtml(tier.label)}</h3>
      <p>${escapeHtml(body||tier.tone)}</p>
    </article>`;
  return `<section class="card reception-card"><h2>Your Post-Season Reception</h2>
    <p><strong>${escapeHtml(q.name)}</strong> leaves the season as a <strong>${escapeHtml(mainSeasonArc(q))}</strong>.</p>
    <div class="chips">${tagHtml}</div>
    <div class="reception-grid">
      ${receptionBlock('❤️','Fans',fan,buildFansSummary(q,fan))}
      ${receptionBlock('🎬','Production',production,buildProductionSummary(q,production))}
      ${receptionBlock('👑','Fellow Queens',castTier,buildQueensSummary(q,castTier))}
    </div>
    <p>${escapeHtml(closing)}</p>
  </section>`;
}

function allStarsInvitationEligible(){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  if(!player || player.id===gameState.season?.winnerId)return false;
  const tags=(typeof seasonArcTags==='function')?seasonArcTags(player):[];
  return tags.includes('fan favorite') || tags.includes('production darling');
}
function allWinnersInvitationEligible(){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const format=(typeof getSeasonFormat==='function'?getSeasonFormat():gameState.season?.format);
  return !!player && player.id===gameState.season?.winnerId && format!=='all_winners';
}
function renderAllWinnersInvite(){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  setHTML(`<main class="screen">
    <section class="hero finale-results-hero all-stars-invite-hero">
      <span class="badge win">All Winners</span>
      <h1>QUEEN OF ALL QUEENS AWAITS</h1>
      ${player?`<div class="winner-portrait-wrap">${queenPortraitHtml(player,'xl','winner-portrait')}</div>`:''}
      <p>You won the crown.</p>
      <p>But there is one title left to claim:</p>
      <p><strong>Queen of All Queens.</strong></p>
      <div class="button-row">
        <button id="acceptAllWinners" class="primary">Enter All Winners</button>
        <button id="returnMainMenu" class="secondary">Return to Main Menu</button>
      </div>
    </section>
  </main>`);
  document.querySelector('#acceptAllWinners')?.addEventListener('click',async()=>{
    const btn=document.querySelector('#acceptAllWinners');
    try{
      if(btn){btn.disabled=true; btn.textContent='Preparing All Winners cast...';}
      await startAllStarsSeasonFromCurrent('all_winners');
      renderEntrance();
    }catch(err){
      console.error(err);
      alert('Could not start the All Winners season. Check the browser console for details.');
      if(btn){btn.disabled=false; btn.textContent='Enter All Winners';}
    }
  });
  document.querySelector('#returnMainMenu')?.addEventListener('click',()=>{clearSave(); resetState(); renderSeasonInvitation();});
}
function renderAllStarsInvite(){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  setHTML(`<main class="screen">
    <section class="hero finale-results-hero all-stars-invite-hero">
      <span class="badge win">All Stars</span>
      <h1>ALL STARS CALLING</h1>
      ${player?`<div class="winner-portrait-wrap">${queenPortraitHtml(player,'xl','winner-portrait')}</div>`:''}
      <p>You may not have won the crown...</p>
      <p>But you've made quite an impression.</p>
      <p>You've been invited to compete on <strong>RuPaul's Drag Race All Stars.</strong></p>
      <div class="button-row">
        <button id="acceptAllStars" class="primary">Accept the Mission</button>
        <button id="returnMainMenu" class="secondary">Return to Main Menu</button>
      </div>
    </section>
  </main>`);
  document.querySelector('#acceptAllStars')?.addEventListener('click',renderAllStarsFormatSelection);
  document.querySelector('#returnMainMenu')?.addEventListener('click',()=>{clearSave(); resetState(); renderSeasonInvitation();});
}
function renderAllStarsFormatSelection(){
  const formats=[
    {id:'legacy',label:'Lip Sync For Your Legacy',desc:'The Top 2 lip sync for the power to eliminate.'},
    {id:'assassin',label:'Lip Sync Assassin',desc:'The challenge winner faces an assassin, and the group vote may decide.'},
    {id:'tournament',label:'Tournament Brackets',desc:'Queens compete through bracket groups before the final tournament stage.'}
  ];
  setHTML(`<main class="screen">
    <section class="hero">
      <span class="badge win">All Stars</span>
      <h1>Choose your All Stars format</h1>
      <p>Every All Stars season plays differently.</p>
      <p>Choose the format you'd like to compete in.</p>
    </section>
    <section class="card decision-card">
      <div class="options">${formats.map(f=>choiceButtonHtml({id:f.id,attr:'data-allstars-format',label:f.label,desc:f.desc})).join('')}</div>
    </section>
  </main>`);
  document.querySelectorAll('[data-allstars-format]').forEach(btn=>btn.addEventListener('click',async()=>{
    try{
      btn.disabled=true;
      btn.textContent='Preparing All Stars cast...';
      await startAllStarsSeasonFromCurrent(btn.dataset.allstarsFormat);
      renderEntrance();
    }catch(err){
      console.error(err);
      alert('Could not start the All Stars season. Check the browser console for details.');
      btn.disabled=false;
    }
  }));
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
  const finalists=(typeof getSeasonFormat==='function'&&getSeasonFormat()==='all_winners'&&gameState.season?.allWinnersTop4?.length?gameState.season.allWinnersTop4.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean):gameState.queens.filter(q=>!q.isEliminated));
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
  const activeFinalists=(typeof getSeasonFormat==='function'&&getSeasonFormat()==='all_winners'&&gameState.season?.allWinnersTop4?.length?gameState.season.allWinnersTop4.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean):gameState.queens.filter(q=>!q.isEliminated));
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  const playerIsFinalist=player && (typeof getSeasonFormat==='function'&&getSeasonFormat()==='all_winners'?activeFinalists.some(q=>q.id===player.id):!player.isEliminated);
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
  const isAllWinnersFinale=finale.format==='all_winners';
  const semiRows=isAllWinnersFinale
    ? `<section class="card"><h2>Lip Sync For The Crown Bracket</h2>${(finale.duels||[]).map(d=>semiFinalDuelCard(d,'advances to the final lip sync',{reveal:true})).join('')}</section>`
    : (finale.format==='top4_lsfyc'?`<section class="card"><h2>Lip Sync for the Crown: Semi-finals</h2>${(finale.duels||[]).map(d=>semiFinalDuelCard(d)).join('')}</section>`:'');
const sashays = (!isAllWinnersFinale && (finale.thirdFourthIds || []).length)
  ? `<section class="card subtle">
      <h2>${finale.thirdFourthIds.map(id => escapeHtml(qName(id))).join(' & ')}</h2>
      <p>Your work this season helped define the competition. But this is not your moment.</p>
      <p>Now, sashay away.</p>
    </section>`
  : '';
  const secondaryRows=isAllWinnersFinale?`<section class="card"><h2>She Done Already Done Had Herses Bracket</h2>${(finale.secondaryDuels||[]).map(d=>semiFinalDuelCard(d,'advances to the bracket final',{reveal:true})).join('')}${finale.secondaryFinalDuel?semiFinalDuelCard(finale.secondaryFinalDuel,'wins the bracket',{reveal:true}):''}${allWinnersTournamentWinnerCard(finale.secondaryWinnerId,'Queen of She Done Already Done Had Herses Bracket')}</section>`:'';
  if((typeof hasMissCongeniality!=='function' || hasMissCongeniality()) && !gameState.season?.fanFavorite) calculateFanFavorite(null);
  setHTML(`<main class="screen">
    <section class="hero">${finalePageBadge(2,isAllWinnersFinale?'Brackets':'Final Cut')}<h1>${isAllWinnersFinale?'The Finale Brackets':'The Grand Finale Continues'}</h1><p>${isAllWinnersFinale?'The queens enter two lip sync tournaments before the final crown is decided.':`${escapeHtml(format)}. Ru makes the final cut before the last lip sync.`}</p></section>
    ${secondaryRows}
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
function finaleDuelQueenCard(id,winnerId,options={}){
  const q=gameState.queens.find(x=>x.id===id);
  const reveal=options.reveal!==false;
  const won=reveal && id===winnerId;
  const badgeText=reveal?(won?'Shantay':'Lip Sync'):'Lip Sync';
  return `<article class="finale-duel-queen-chip ${won?'is-winner':''}"><span class="finale-duel-name">${escapeHtml(qName(id))}</span>${q?queenPortraitHtml(q,'md'):''}<span class="badge ${won?'winner':'subtle'}">${escapeHtml(badgeText)}</span></article>`;
}
function finaleDuelPortraitVs(d,options={}){
  const ids=d.queenIds||[];
  return `<div class="finale-duel-horizontal">${finaleDuelQueenCard(ids[0],d.winnerId,options)}<span class="vs">×</span>${finaleDuelQueenCard(ids[1],d.winnerId,options)}</div>`;
}
function allWinnersTournamentWinnerCard(winnerId,title){
  const q=gameState.queens.find(x=>x.id===winnerId);
  if(!q)return '';
  return `<div class="card reunion-winner-card all-winners-title-card"><h3>${escapeHtml(title)}</h3><div class="winner-portrait-wrap">${queenPortraitHtml(q,'xl','winner-portrait')}</div><p><strong>${escapeHtml(q.name)}</strong></p></div>`;
}
function finaleDuelDecisionCard(d){
  const winnerId=d.winnerId;
  const loserId=d.loserId || (d.queenIds||[]).find(id=>id!==winnerId);
  return `<div class="finale-duel-decision-card"><p><strong>${escapeHtml(qName(winnerId))}</strong>, shantay you stay.</p><p><strong>${escapeHtml(qName(loserId))}</strong>, I'm sorry my dear, but this is not your moment.</p></div>`;
}
function semiFinalDuelCard(d, advanceText='advances to the final lip sync', options={}){
  const reveal=options.reveal!==false;
  const song=d.song?`<h3>${escapeHtml(d.song.title)} <span>by ${escapeHtml(d.song.artist)}</span></h3>`:'<h3>Lip Sync</h3>';
  const revealLine=reveal?finaleDuelDecisionCard(d):`<p class="small finale-duel-hidden-result">The result will be revealed after the lip sync.</p>`;
  return `<div class="finale-duel-card compact"><div class="finale-duel-title">${song}<p class="small">${escapeHtml(d.label)}</p></div>${finaleDuelPortraitVs(d,{reveal})}${revealLine}</div>`;
}

function renderFinalePart2(){
  const finale=prepareFinale();
  const finalDuel=finale.finalDuel;
  const songLine=finalDuel.song?`<p>Final song: <strong>${escapeHtml(finalDuel.song.title)}</strong> by ${escapeHtml(finalDuel.song.artist)}</p>`:'';
  const strategyRows=finalDuelScoreRows(finalDuel);
  const isAllWinnersFinale=finale.format==='all_winners';
  setHTML(`<main class="screen">
    <section class="hero">${finalePageBadge(3,'Final Lip Sync')}${bigMomentHeader('One final performance...','THE FINAL LIP SYNC','crown')}<h1>${escapeHtml(qName(finalDuel.queenIds[0]))} vs ${escapeHtml(qName(finalDuel.queenIds[1]))}</h1><p>The crown comes down to one last performance.</p></section>
    <section class="card"><h2>The Final Performance</h2>${finaleDuelPortraitVs(finalDuel,{reveal:false})}${songLine}<p class="music-cue">💡💡🎶🎵🎶💡💡</p><div class="commentary-block">${finalLipSyncNarrative(finalDuel)}</div></section>
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


function allWinnersSummaryBlock(){
  if(typeof getSeasonFormat!=='function' || getSeasonFormat()!=='all_winners')return '';
  const ranked=(typeof allWinnersRankedQueens==='function'?allWinnersRankedQueens():[...(gameState.queens||[])]);
  const finale=gameState.season?.finale||{};
  const winner=gameState.queens.find(q=>q.id===(finale.winnerId||gameState.season?.winnerId));
  const secondary=gameState.queens.find(q=>q.id===(finale.secondaryWinnerId||gameState.season?.allWinnersSecondaryWinnerId));
  const rows=ranked.map((q,i)=>`<tr><td>${i+1}</td><td>${escapeHtml(q.name)}</td><td>${Number(q.legendStars)||0}</td><td>${Number(q.blocksReceived)||0}</td><td>${Number(q.blocksGiven)||0}</td></tr>`).join('');
  const starText=winner?`${escapeHtml(winner.name)} was crowned Queen of All Queens after entering the finale with ${Number(winner.legendStars)||0} Legendary Legend Stars.`:'';
  const secondaryText=secondary?`${escapeHtml(secondary.name)} won the Queen of She Done Already Done Had Herses Bracket.`:'';
  return `<section class="card important"><h2>Legendary Legend Stars</h2><p>${starText}</p><p>${secondaryText}</p><table><thead><tr><th>#</th><th>Queen</th><th>Stars</th><th>Blocked</th><th>Blocks Given</th></tr></thead><tbody>${rows}</tbody></table></section>`;
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
    ${allWinnersSummaryBlock()}
    ${postSeasonReception(player)}
    <section class="card track-record-export-card" id="finalTrackRecordCard"><button type="button" class="track-record-download" id="downloadTrackRecord" title="Download Track Record" aria-label="Download Track Record" data-html2canvas-ignore="true">⬇️ Download</button><h2>Track Record</h2>${historyTable()}</section>
    ${typeof seasonLipstickChoicesTable==='function'?seasonLipstickChoicesTable():''}
    ${iconicLipSyncsTable()}
    <div class="button-row"><button id="newGame">New season</button>${allWinnersInvitationEligible()?'<button id="allWinnersInvite" class="primary">Queen of All Queens Awaits</button>':''}${allStarsInvitationEligible()?'<button id="allStarsInvite" class="primary">All Stars Calling</button>':''}</div>
  </main>`);
  document.querySelector('#newGame').addEventListener('click',()=>{clearSave(); resetState(); renderSeasonInvitation();});
  document.querySelector('#allWinnersInvite')?.addEventListener('click',renderAllWinnersInvite);
  document.querySelector('#allStarsInvite')?.addEventListener('click',renderAllStarsInvite);
  document.querySelector('#downloadTrackRecord')?.addEventListener('click',downloadFinalTrackRecord);
}

function trackRecordExportFileName(){
  const winner=gameState.queens.find(q=>q.id===gameState.season?.winnerId);
  const safeName=(winner?.name||'Winner').replace(/[\\/:*?"<>|]+/g,'').replace(/\s+/g,' ').trim()||'Winner';
  return `Track Record - ${safeName}.png`;
}

function ensureHtml2Canvas(){
  if(window.html2canvas)return Promise.resolve(window.html2canvas);
  return new Promise((resolve,reject)=>{
    const existing=document.querySelector('script[data-html2canvas-loader]');
    if(existing){
      existing.addEventListener('load',()=>resolve(window.html2canvas),{once:true});
      existing.addEventListener('error',reject,{once:true});
      return;
    }
    const script=document.createElement('script');
    script.src='https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
    script.async=true;
    script.dataset.html2canvasLoader='true';
    script.onload=()=>resolve(window.html2canvas);
    script.onerror=()=>reject(new Error('html2canvas failed to load'));
    document.head.appendChild(script);
  });
}

async function downloadFinalTrackRecord(){
  const card=document.querySelector('#finalTrackRecordCard');
  const button=document.querySelector('#downloadTrackRecord');
  if(!card)return;
  let exportNode=null;
  try{
    button?.setAttribute('disabled','disabled');
    const html2canvas=await ensureHtml2Canvas();
    const wrap=card.querySelector('.table-wrap');
    const table=card.querySelector('table');
    const cardStyles=window.getComputedStyle(card);
    const horizontalPadding=(parseFloat(cardStyles.paddingLeft)||0)+(parseFloat(cardStyles.paddingRight)||0);
    const verticalPadding=(parseFloat(cardStyles.paddingTop)||0)+(parseFloat(cardStyles.paddingBottom)||0);
    const borderX=(parseFloat(cardStyles.borderLeftWidth)||0)+(parseFloat(cardStyles.borderRightWidth)||0);
    const borderY=(parseFloat(cardStyles.borderTopWidth)||0)+(parseFloat(cardStyles.borderBottomWidth)||0);
    const fullTableWidth=Math.ceil(Math.max(
      table?.scrollWidth||0,
      wrap?.scrollWidth||0,
      table?.getBoundingClientRect().width||0,
      wrap?.getBoundingClientRect().width||0
    ));
    const exportWidth=Math.ceil(Math.max(card.getBoundingClientRect().width,fullTableWidth+horizontalPadding+borderX));

    exportNode=card.cloneNode(true);
    exportNode.id='finalTrackRecordExportClone';
    exportNode.classList.add('track-record-exporting');
    exportNode.querySelectorAll('[data-html2canvas-ignore="true"],#downloadTrackRecord').forEach(el=>el.remove());
    Object.assign(exportNode.style,{
      position:'fixed',
      left:'0',
      top:'0',
      zIndex:'999999',
      width:`${exportWidth}px`,
      maxWidth:'none',
      height:'auto',
      maxHeight:'none',
      overflow:'visible',
      pointerEvents:'none'
    });
    document.body.appendChild(exportNode);

    const clonedWrap=exportNode.querySelector('.table-wrap');
    if(clonedWrap){
      Object.assign(clonedWrap.style,{
        overflow:'visible',
        width:`${fullTableWidth}px`,
        maxWidth:'none',
        height:'auto',
        maxHeight:'none'
      });
    }
    const clonedTable=exportNode.querySelector('table');
    if(clonedTable){
      Object.assign(clonedTable.style,{
        width:`${fullTableWidth}px`,
        minWidth:`${fullTableWidth}px`,
        maxWidth:'none'
      });
    }

    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    const exportHeight=Math.ceil(Math.max(
      exportNode.scrollHeight,
      exportNode.getBoundingClientRect().height,
      (clonedWrap?.scrollHeight||0)+verticalPadding+borderY+(exportNode.querySelector('h2')?.getBoundingClientRect().height||0)+24
    ));
    const canvas=await html2canvas(exportNode,{
      scale:1,
      width:exportWidth,
      height:exportHeight,
      windowWidth:exportWidth,
      windowHeight:exportHeight,
      scrollX:0,
      scrollY:0,
      backgroundColor:'#140d17',
      useCORS:true,
      allowTaint:true,
      ignoreElements:(el)=>el?.dataset?.html2canvasIgnore==='true'
    });
    const link=document.createElement('a');
    link.download=trackRecordExportFileName();
    link.href=canvas.toDataURL('image/png');
    link.click();
  }catch(err){
    console.error(err);
    alert('Could not download the Track Record image. Please check your connection and try again.');
  }finally{
    exportNode?.remove();
    button?.removeAttribute('disabled');
  }
}
