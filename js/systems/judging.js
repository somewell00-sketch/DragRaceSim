
const LIP_SYNC_STRATEGIES={
  emotion:{label:'Sell the Emotion',text:'She relies on emotional truth instead of tricks.'},
  sell_lyrics:{label:'Sell the Lyrics',text:'Every lyric feels intentional.'},
  dance:{label:'Dance the House Down',text:'She attacks the beat and fills the stage.'},
  stunts:{label:'Stunts & Tricks',text:'She throws her body at the song and takes big risks.'},
  save_reveal:{label:'Save the Reveal for the Climax',text:'She waits for the song to peak before revealing the second look.'},
  reveal_early:{label:'Reveal Early',text:'She reveals early and tries to ride that first wave of shock.'},
  multiple_reveals:{label:'Multiple Reveals',text:'She layers reveal after reveal, hoping the spectacle lands.'},
  play_safe:{label:'Play It Safe',text:'She keeps it clean, controlled, and low-risk.'},
  overshadow:{label:'Overshadow Your Opponent',text:'She tries to steal focus from her opponent. High risk, high reward.'}
};
function lipSyncMovesFromStrategy(strategy, song){
  const high=song?.energy==='high';
  const map={
    emotion:{start:'lyrics',middle:'face',finale:'emotional',strategy},
    sell_lyrics:{start:'lyrics',middle:'judges',finale:'emotional',strategy},
    dance:{start:'explosive',middle:'acrobatics',finale:'stunt',strategy},
    stunts:{start:'explosive',middle:'acrobatics',finale:'stunt',strategy},
    save_reveal:{start:high?'controlled':'lyrics',middle:'judges',finale:'reveal',strategy},
    reveal_early:{start:'explosive',middle:'judges',finale:'emotional',strategy},
    multiple_reveals:{start:'explosive',middle:'acrobatics',finale:'reveal',strategy},
    play_safe:{start:'controlled',middle:'face',finale:'emotional',strategy},
    overshadow:{start:'explosive',middle:'judges',finale:high?'stunt':'emotional',strategy}
  };
  return map[strategy]||map.sell_lyrics;
}
function lipSyncStrategyLabel(strategy){return LIP_SYNC_STRATEGIES[strategy]?.label||'Sell the Lyrics';}
function lipSyncStrategyText(strategy){return LIP_SYNC_STRATEGIES[strategy]?.text||'She tries to sell the song.';}
function lipSyncStrategyScore(strategy, song, q){
  // v20: return a 0–10 score for this specific performance choice.
  // This is the "lip sync performance of the week" component, separate from base ability.
  const high=song?.energy==='high';
  const reveals=q.inventory?.reveals||0;
  const a=q.attributes||{};
  const clamp10=v=>clamp(v,0,10);
  switch(strategy){
    case 'emotion':
      return clamp10((high?4.2:6.2) + (a.acting||0)*0.28 + (a.cunt||0)*0.18 + rand(-1.0,1.4));
    case 'sell_lyrics':
      return clamp10(5.1 + (a.cunt||0)*0.26 + (a.acting||0)*0.22 + rand(-1.0,1.2));
    case 'dance':
      return clamp10((high?5.8:4.2) + (a.lipSync||0)*0.32 + (a.cunt||0)*0.10 + rand(-1.2,1.6));
    case 'stunts':
      return clamp10((high?5.2:3.6) + (a.lipSync||0)*0.30 + rand(-2.8,3.4));
    case 'save_reveal':
      if(reveals<=0) return clamp10(3.2 + rand(-1.0,0.8));
      q.inventory.reveals=Math.max(0,reveals-1);
      return clamp10((high?5.7:5.2) + (a.runway||0)*0.28 + (a.cunt||0)*0.10 + rand(-1.6,2.0));
    case 'reveal_early':
      if(reveals<=0) return clamp10(3.4 + rand(-1.0,0.8));
      q.inventory.reveals=Math.max(0,reveals-1);
      return clamp10(4.8 + (a.runway||0)*0.18 + (a.cunt||0)*0.08 + rand(-1.8,1.4));
    case 'multiple_reveals':
      if(reveals<=0) return clamp10(2.8 + rand(-1.0,0.8));
      q.inventory.reveals=Math.max(0,reveals-2);
      return clamp10(5.0 + (a.runway||0)*0.22 + (a.cunt||0)*0.10 + rand(-3.0,3.2));
    case 'play_safe':
      return clamp10(4.8 + (a.lipSync||0)*0.16 + rand(-0.7,0.7));
    case 'overshadow':
      return clamp10((high?5.0:4.5) + (a.cunt||0)*0.22 + (a.lipSync||0)*0.18 + rand(-2.6,2.8));
    default:
      return clamp10(4.8 + rand(-1,1));
  }
}
const RISK_LABEL={safe:'Played it safe',risk:'Went all in',unexpected:'Did something unexpected'};
function getCritiqueText(placement, challengeId, risk, success){
  const data=gameState.data.critiques||{};
  const bucket=placement==='WIN'||placement==='HIGH'?'positive':(placement==='LOW'||placement==='BTM'?'negative':'safe');
  const challengeTexts=data.byChallenge?.[challengeId]?.[bucket]||[];
  const approachTexts=data.byApproach?.[risk]?.[success?'success':'fail']||[];
  const generic=data.generic?.[bucket]||[];
  const parts=[];
  const a=sample(challengeTexts); if(a)parts.push(a);
  const b=sample(approachTexts); if(b)parts.push(b);
  const c=sample(generic); if(c)parts.push(c);
  return parts.join(' ');
}



function recentPlacementStreak(q, placement){
  const history=[...(q?.episodeHistory||[])].reverse();
  let count=0;
  for(const h of history){
    if(h.placement===placement) count++;
    else break;
  }
  return count;
}
function getJudgesExpectationPenalty(q){
  // Original Judges' Expectations throttle restored: the more a queen proves herself,
  // the higher the bar becomes. This keeps 4+ WIN runs rare without blocking them.
  const st=q?.statistics||{};
  const wins=st.wins||0;
  const highs=st.highs||0;
  let winPenalty=0;
  if(wins>=6) winPenalty=-1.75;
  else if(wins>=5) winPenalty=-1.30;
  else if(wins>=4) winPenalty=-0.90;
  else if(wins>=3) winPenalty=-0.50;
  else if(wins>=2) winPenalty=-0.25;
  const highPenalty=-(Math.floor(highs/2)*0.15);
  return Math.round((winPenalty+highPenalty)*100)/100;
}
function getWinThrottlePenalty(q){
  return getJudgesExpectationPenalty(q);
}
function winRedirectChance(q){
  const wins=q?.statistics?.wins||0;
  if(wins>=5)return 0.75;      // trying for 6th or beyond: 3/4 chance the win goes to the next queen
  if(wins>=4)return 2/3;       // trying for 5th: 2/3 chance the win goes to the next queen
  if(wins>=2)return 0.5;       // trying for 3rd or 4th: 50% chance the win goes to the next queen
  return 0;
}
function getWinRedirectDecision(q, ep){
  if(!q || !ep)return {chance:0,roll:1,redirect:false};
  ep.winRedirectRolls=ep.winRedirectRolls||{};
  const chance=winRedirectChance(q);
  if(chance<=0)return {chance:0,roll:1,redirect:false};
  if(!ep.winRedirectRolls[q.id]){
    const roll=Math.random();
    ep.winRedirectRolls[q.id]={chance,roll,redirect:roll<chance,wins:q.statistics?.wins||0};
  }
  return ep.winRedirectRolls[q.id];
}
function winIneligibilityReason(q, candidateScore, runnerUpScore, ep){
  if(!q)return '';
  const decision=getWinRedirectDecision(q, ep);
  if(decision.redirect){
    const percent=Math.round(decision.chance*100);
    return `win redistributed (${percent}% chance)`;
  }
  return '';
}
function isWinnerEligible(scoreRow, scored, ep){
  const q=gameState.queens.find(x=>x.id===scoreRow.queenId);
  if(!q)return false;
  if(scoreRow.queenId===gameState.playerQueenId && (ep.passiveWorkroom || ep.canPlayerWin===false)){
    scoreRow.winIneligibleReason='passive workroom';
    return false;
  }
  const byScore=[...scored].sort((a,b)=>b.score-a.score);
  const runner=byScore.find(x=>x.queenId!==scoreRow.queenId);
  const reason=winIneligibilityReason(q, scoreRow.score, runner?.score ?? -999, ep);
  if(reason){scoreRow.winIneligibleReason=reason; return false;}
  return true;
}
function enforceWinBalance(scored, ep){
  // v18.10: A dominant queen can still keep winning, but every extra win after 2
  // has a growing chance of being handed to the next viable queen.
  const initialWinners=scored.filter(s=>s.placement==='WIN');
  const demoted=[];
  initialWinners.forEach(w=>{
    if(!isWinnerEligible(w, scored, ep)){
      w.placement='HIGH';
      w.winThrottled=true;
      demoted.push(w);
    }
  });
  const hasWinner=()=>scored.some(s=>s.placement==='WIN');
  if(hasWinner()){
    if(demoted.length)ep.winThrottleApplied=true;
    return;
  }
  const eligible=[...scored]
    .filter(s=>s.placement!=='BTM')
    .filter(s=>isWinnerEligible(s, scored, ep))
    .sort((a,b)=>{
      const ar=a.placement==='HIGH'?0:(a.placement==='SAFE'?1:2);
      const br=b.placement==='HIGH'?0:(b.placement==='SAFE'?1:2);
      if(ar!==br)return ar-br;
      const qa=gameState.queens.find(q=>q.id===a.queenId);
      const qb=gameState.queens.find(q=>q.id===b.queenId);
      const wa=qa?.statistics?.wins||0, wb=qb?.statistics?.wins||0;
      if(wa!==wb)return wa-wb;
      return b.score-a.score;
    });
  if(eligible[0]){
    eligible[0].placement='WIN';
    eligible[0].promotedByWinThrottle=true;
    ep.winThrottleApplied=true;
  }else if(scored[0]){
    // Extreme edge case: every potential replacement was redirected too.
    // Keep the episode playable by choosing the strongest queen with the fewest wins.
    const fallback=[...scored].filter(s=>s.placement!=='BTM').sort((a,b)=>{
      const qa=gameState.queens.find(q=>q.id===a.queenId);
      const qb=gameState.queens.find(q=>q.id===b.queenId);
      return (qa?.statistics?.wins||0)-(qb?.statistics?.wins||0) || b.score-a.score;
    })[0]||scored[0];
    fallback.placement='WIN';
    fallback.promotedByWinThrottle=true;
    ep.winThrottleApplied=true;
  }
}
function applyWinThrottles(scored, ep){
  enforceWinBalance(scored, ep);
}
function getPassiveWorkroomCritique(placement, queenName){
  if(placement==='WIN' || placement==='HIGH'){
    return `${queenName} let the work speak for itself, and it almost paid off. But Drag Race rewards queens who seize every opportunity, not queens who disappear until the runway.`;
  }
  if(placement==='LOW' || placement==='BTM'){
    return `${queenName} stayed too quiet in the lead-up to the challenge. The panel wanted more hunger, more presence, and more reason to remember her.`;
  }
  return `${queenName} kept it low-key this week. It did not hurt her badly, but it also did not give the episode much story.`;
}
function teamGroupScore(team, scored, ep){
  const members=scored.filter(s=>team.queenIds.includes(s.queenId));
  if(!members.length)return 0;
  const avg=members.reduce((t,m)=>t+m.individualScore,0)/members.length;
  const chemistry=typeof teamChemistryBonus==='function'?teamChemistryBonus(team,ep):0;
  return Math.round((avg+chemistry)*10)/10;
}
function assignIndividualPlacements(scored){
  scored.forEach(s=>s.placement='SAFE');
  if(scored[0])scored[0].placement='WIN';
  if(scored[1])scored[1].placement='HIGH';
  if(scored[2])scored[2].placement='HIGH';
  if(scored.length>5 && scored[scored.length-3])scored[scored.length-3].placement='LOW';
  // Larger casts should not have only one LOW every episode. Adding one more
  // low critique in the lower middle creates more natural vulnerability arcs.
  if(scored.length>=8 && scored[scored.length-4])scored[scored.length-4].placement='LOW';
  if(scored[scored.length-2])scored[scored.length-2].placement='BTM';
  if(scored[scored.length-1])scored[scored.length-1].placement='BTM';
}
function assignTeamPlacements(scored, ep){
  scored.forEach(s=>s.placement='SAFE');
  const teams=(ep.teams||[]).map(team=>({team,score:teamGroupScore(team,scored,ep)})).sort((a,b)=>b.score-a.score);
  ep.teamScores=teams.map(t=>({teamId:t.team.id,name:t.team.name,score:t.score,chemistry:Math.round((typeof teamChemistryBonus==='function'?teamChemistryBonus(t.team,ep):0)*10)/10,queenIds:t.team.queenIds}));
  if(!teams.length){assignIndividualPlacements(scored); return;}
  const best=teams[0];
  const worst=teams[teams.length-1];
  const bestMembers=scored.filter(s=>best.team.queenIds.includes(s.queenId)).sort((a,b)=>b.individualScore-a.individualScore);
  const worstMembers=scored.filter(s=>worst.team.queenIds.includes(s.queenId)).sort((a,b)=>a.individualScore-b.individualScore);
  const isDuoEpisode=teams.every(t=>t.team.queenIds.length===2);

  // Duo episodes with four or more pairs now behave more like a Drag Race result spread:
  // one winning duo, one high duo, one low duo, and one bottom duo when available.
  if(isDuoEpisode && teams.length>=4){
    bestMembers.forEach(s=>s.placement='WIN');
    const secondBest=teams[1];
    if(secondBest){
      scored.filter(s=>secondBest.team.queenIds.includes(s.queenId)).forEach(s=>s.placement='HIGH');
    }
    const secondWorst=teams[teams.length-2];
    if(secondWorst && secondWorst.team.id!==best.team.id){
      scored.filter(s=>secondWorst.team.queenIds.includes(s.queenId)).forEach(s=>s.placement='LOW');
    }
    worstMembers.forEach(s=>s.placement='BTM');
    return;
  }

  if(best.team.queenIds.length===2){
    bestMembers.forEach(s=>s.placement='WIN');
  }else if(best.team.queenIds.length>=5){
    // Large teams can win/lose as teams, but critiques stay focused. Only the standouts
    // from the strongest group are called as tops. The rest of the team is safe.
    if(bestMembers[0])bestMembers[0].placement='WIN';
    bestMembers.slice(1,Math.min(3,bestMembers.length)).forEach(s=>s.placement='HIGH');
  }else{
    if(bestMembers[0])bestMembers[0].placement='WIN';
    bestMembers.slice(1).forEach(s=>s.placement='HIGH');
  }

  if(worst.team.queenIds.length>=5){
    // Same principle for large losing groups: only the weakest queens from the weakest
    // group receive critiques. The rest of the group may be safe even though the group lost.
    if(worstMembers[0])worstMembers[0].placement='BTM';
    if(worstMembers[1])worstMembers[1].placement='BTM';
    worstMembers.slice(2,Math.min(4,worstMembers.length)).forEach(s=>s.placement='LOW');
  }else{
    worstMembers.forEach(s=>s.placement='LOW');
    if(worstMembers[0])worstMembers[0].placement='BTM';
    if(worstMembers[1])worstMembers[1].placement='BTM';
  }

  // Keep middle teams safe unless their group score is almost tied with the worst.
  // Do not add extra lows in four-duo episodes, because those already have a clean spread.
  if(teams.length>2 && !isDuoEpisode){
    const secondWorst=teams[teams.length-2];
    if(secondWorst && secondWorst.score<=worst.score+1.6){
      const swMembers=scored.filter(s=>secondWorst.team.queenIds.includes(s.queenId)).sort((a,b)=>a.individualScore-b.individualScore);
      if(swMembers[0] && swMembers[0].placement==='SAFE')swMembers[0].placement='LOW';
      if(swMembers[1] && swMembers.length>=4 && secondWorst.score<=worst.score+0.9 && swMembers[1].placement==='SAFE')swMembers[1].placement='LOW';
    }
  }
}
function applyPassiveWinCap(scored, ep){
  if(!(ep.passiveWorkroom || ep.canPlayerWin===false))return;
  const playerScore=scored.find(s=>s.queenId===gameState.playerQueenId);
  if(!playerScore || playerScore.placement!=='WIN')return;
  playerScore.placement='HIGH';
  const replacement=scored.find(s=>s.queenId!==gameState.playerQueenId && s.placement!=='WIN');
  if(replacement)replacement.placement='WIN';
  ep.playerCappedByPassive=true;
}
function challengeDefinitionForEpisode(ep){
  const found=gameState.data.challenges.find(c=>c.id===ep.challengeType);
  if(found) return found;
  if(ep.challengeType==='talent' && typeof makeTalentChallenge==='function') return makeTalentChallenge();
  return {id:ep.challengeType||'unknown', name:ep.challengeName||'Challenge', runwayWeight:.15, weights:{cunt:.30,lipSync:.20,acting:.20,runway:.20,makeup:.10}};
}

function episodeFormModifier(q, ep){
  if(!q || !ep)return {score:0,label:''};
  const arc=(typeof ensurePerformanceArc==='function')?ensurePerformanceArc(q):q.performanceArc;
  const week=ep.number||0;
  const isPeak=(arc?.peakWeeks||[]).includes(week);
  const isBad=(arc?.badWeeks||[]).includes(week);
  if(isPeak){
    const comeback=(q.momentum||0)<0?0.45:0;
    return {score:Math.round((1.55+comeback)*10)/10,label:'Peak week'};
  }
  if(isBad){
    const pressure=(q.statistics?.wins||0)>=2?0.35:0;
    return {score:Math.round((-1.55-pressure)*10)/10,label:'Bad week'};
  }
  return {score:0,label:''};
}
function winStreakFatigue(q){
  // Keep fatigue as a small episode-form wobble only. Total WIN control belongs
  // to the restored win redistribution throttle above, so this should not stack hard.
  const streak=recentPlacementStreak(q,'WIN');
  if(streak>=3)return -0.75;
  if(streak>=2)return -0.35;
  return 0;
}
function vulnerabilityPressureModifier(q, ep){
  // Soft balance pass: queens who have stayed untouched for several episodes
  // become a little more exposed to a LOW if they have only an average week.
  // This does not force bottoms; it just makes perfect clean runs less common.
  const st=q.statistics||{};
  const competed=st.episodesCompeted||0;
  if(competed<3)return 0;
  if((st.lows||0)>0 || (st.bottoms||0)>0)return 0;
  const week=ep?.number||0;
  if(week<4)return 0;
  let pressure=-0.35;
  if((st.wins||0)>=1)pressure-=0.25;
  if((st.highs||0)>=2)pressure-=0.20;
  if((q.momentum||0)>=2)pressure-=0.15;
  return Math.round(pressure*10)/10;
}

function calculateEpisodeResults(playerChoices={}){
  const ep=gameState.currentEpisode;
  ensureAllQueenV14Stats();
  simulateNpcEpisodeChoices();
  const challenge=challengeDefinitionForEpisode(ep);
  const active=gameState.queens.filter(q=>!q.isEliminated && (!ep.participantIds || ep.participantIds.includes(q.id)));
  if(!ep.runwayRolls) ep.runwayRolls={};
  if(!ep.eventRolls) ep.eventRolls={};
  const scored=active.map(q=>{
    const qEffects=currentQueenEffects(q);
    const risk=q.id===gameState.playerQueenId?playerChoices.risk:(qEffects.risk||chooseAIRisk(q));
    const base=weightedAttributeScore(q.attributes,challenge.weights);
    if(ep.runwayRolls[q.id]===undefined) ep.runwayRolls[q.id]=rand(-5.5,5.5);
    const runway=q.attributes.runway*3+ep.runwayRolls[q.id];
    const production=clamp((q.publicScores.production/8) * ((q.statistics?.wins||0)>=4 ? 0.5 : 1),-2,2);
    const momentum=q.momentum||0;
    const episodeForm=episodeFormModifier(q,ep);
    const fatigue=winStreakFatigue(q);
    const vulnerabilityPressure=vulnerabilityPressureModifier(q,ep);
    const riskBonus=riskRoll(risk);
    const miniBonus=q.id===ep.miniWinnerId?3:0;
    if(q.id!==gameState.playerQueenId && ep.eventRolls[q.id]===undefined) ep.eventRolls[q.id]=rand(-1.25,1.25);
    const eventBonus=q.id===gameState.playerQueenId?(ep.event?.score||0):(ep.eventRolls[q.id]||0);
    const playerEffects=(q.id===gameState.playerQueenId && ep.playerEffects)?ep.playerEffects:{};
    const energyStressMod=queenEnergyStressMod(q);
    const effectSource=q.id===gameState.playerQueenId?playerEffects:qEffects;
    // Player/NPC choices are deliberate episode decisions, so runway choice effects
    // should be felt directly. The runway attribute itself is still weighted by the
    // challenge's runwayWeight below, but choices like "Prioritize the runway" or
    // runway presentation moments are no longer diluted by that multiplier.
    const choiceBonus=Math.round(((effectSource.performance||0)+(effectSource.runway||0))*1.15*10)/10;
    const teamBonus=(ep.judgingMode==='team' && typeof teamAffinityBonus==='function')?teamAffinityBonus(q.id,ep):0;
    const individualScore=base+runway*challenge.runwayWeight+production+momentum+episodeForm.score+fatigue+vulnerabilityPressure+riskBonus+miniBonus+eventBonus+choiceBonus+energyStressMod;
    const winThrottlePenalty=getWinThrottlePenalty(q);
    const total=individualScore+teamBonus+winThrottlePenalty;
    const team=typeof getTeamForQueen==='function'?getTeamForQueen(q.id,ep):null;
    return {queenId:q.id,name:q.name,risk,riskLabel:RISK_LABEL[risk],score:Math.round(total*10)/10,individualScore:Math.round(individualScore*10)/10,base:Math.round(base*10)/10,runway:Math.round(runway*10)/10,production:Math.round(production*10)/10,momentum,episodeForm:episodeForm.score,episodeFormLabel:episodeForm.label,fatigue,vulnerabilityPressure,riskBonus:Math.round(riskBonus*10)/10,eventBonus,choiceBonus:Math.round(choiceBonus*10)/10,energyStressMod,teamBonus,winThrottlePenalty,teamId:team?.id||null,teamName:team?.name||'',placement:'SAFE'};
  }).sort((a,b)=>b.score-a.score);
  if(ep.teams?.length && ep.judgingMode==='team')assignTeamPlacements(scored,ep);
  else {ep.teamScores=[]; assignIndividualPlacements(scored);}

  if(ep.special==='premiere_no_elim'){
    scored.forEach(s=>s.placement='SAFE');
    if(scored[0])scored[0].placement='TOP2';
    if(scored[1])scored[1].placement='TOP2';
    if(scored[2])scored[2].placement='HIGH';
    scored.slice(-3).forEach(s=>{ if(s.placement==='SAFE')s.placement='LOW'; });
    ep.top2Queens=scored.slice(0,2).map(s=>s.queenId);
    ep.bottomQueens=[];
  }
  // In a no-elimination premiere, the Top 2 lip sync decides the only WIN.
  // Do not run win redistribution here, because that would create a challenge WIN
  // before the lip sync has happened. The two best queens remain TOP2 until
  // resolveLipSync() promotes only the lip sync winner to WIN.
  if(ep.special!=='premiere_no_elim'){
    applyPassiveWinCap(scored,ep);
    applyWinThrottles(scored,ep);
  }
  scored.sort((a,b)=>{
    const order={WIN:0,HIGH:1,SAFE:2,LOW:3,BTM:4};
    if(order[a.placement]!==order[b.placement])return order[a.placement]-order[b.placement];
    return b.score-a.score;
  });
  scored.forEach((s,i)=>{
    const success=s.score>=scored[Math.floor(scored.length/2)].score;
    const isPlayer=s.queenId===gameState.playerQueenId;
    const pe=isPlayer?(ep.playerEffects||{}):(ep.queenEffects?.[s.queenId]||{});
    const cleanText=s.vulnerabilityPressure?` • Vulnerability ${s.vulnerabilityPressure}`:'';
    const extra=` • Choices ${((pe.performance||0)+(pe.runway||0))>=0?'+':''}${(pe.performance||0)+(pe.runway||0)} • Energy/Stress ${s.energyStressMod>=0?'+':''}${s.energyStressMod}${cleanText}`;
    const teamText=ep.teams?.length?(ep.judgingMode==='team'?` • Team ${s.teamName||'team'} ${s.teamBonus>=0?'+':''}${s.teamBonus}`:' • Judged individually'):'';
    const winThrottleText=s.winThrottlePenalty?` • Judges' expectations ${s.winThrottlePenalty}`:'';
    const formText=s.episodeForm?` • ${s.episodeFormLabel||'Episode form'} ${s.episodeForm>=0?'+':''}${s.episodeForm}`:'';
    const fatigueText=s.fatigue?` • Fatigue ${s.fatigue}`:'';
    s.internalReading=`Base ${s.base} • Runway ${s.runway} • Risk ${s.riskBonus>=0?'+':''}${s.riskBonus} • Production ${s.production>=0?'+':''}${s.production} • Momentum ${s.momentum>=0?'+':''}${s.momentum}${formText}${fatigueText}${extra}${teamText}${winThrottleText}`;
    s.critique=getCritiqueText(s.placement,ep.challengeType,s.risk,success);
    if(ep.judgingMode==='team' && s.teamName){
      const teamScore=ep.teamScores?.find(t=>t.teamId===s.teamId);
      if(s.placement==='WIN' || s.placement==='HIGH')s.critique=`${s.teamName} worked as a unit, and ${s.name} helped make the group stand out. ${s.critique}`;
      if(s.placement==='LOW' || s.placement==='BTM')s.critique=`${s.teamName} struggled to connect as a group, and ${s.name} could not escape that energy. ${s.critique}`;
      if(teamScore?.chemistry>0)s.critique+=` The chemistry helped the performance feel tighter.`;
      if(teamScore?.chemistry<0)s.critique+=` The lack of chemistry showed.`;
    }
    if(s.winThrottlePenalty<=-0.5 && (s.placement==='WIN' || s.placement==='HIGH')){
      s.critique = `${s.critique} At this point, the judges know what she can do, so the bar is higher.`.trim();
    }
    if(s.winThrottled){
      s.critique = `${s.critique} The judges still see the excellence, but this week the win slipped toward a fresher storyline.`.trim();
    }
    if(s.promotedByWinThrottle){
      s.critique = `${s.critique} Tonight, the panel was ready to spread the spotlight, and ${s.name} seized the opening.`.trim();
    }
    if(isPlayer && ep.passiveWorkroom && s.placement!=='SAFE'){
      s.critique = `${s.critique} ${getPassiveWorkroomCritique(s.placement, s.name)}`.trim();
    }
  });
  ep.placements=scored;
  ep.bottomQueens=scored.filter(s=>s.placement==='BTM').slice(0,2).map(s=>s.queenId);
  saveGame();
  return scored;
}

function recordIconicLipSync(ep, lipSyncResult){
  if(!ep || !lipSyncResult || !Array.isArray(lipSyncResult.results)) return;
  const iconicResults=lipSyncResult.results.filter(r=>Number(r.score10)>=8.5);
  if(!iconicResults.length) return;

  gameState.season=gameState.season||{};
  gameState.season.iconicLipSyncs=Array.isArray(gameState.season.iconicLipSyncs)
    ? gameState.season.iconicLipSyncs
    : [];

  const queenIds=lipSyncResult.results.map(r=>r.queenId).filter(Boolean);
  const key=[
    ep.number||gameState.episodeHistory?.length+1||1,
    queenIds.slice().sort().join('|'),
    lipSyncResult.song?.title||ep.song?.title||''
  ].join('::');

  const existingIndex=gameState.season.iconicLipSyncs.findIndex(item=>item.key===key);
  const record={
    key,
    episode:ep.number||gameState.episodeHistory?.length+1||1,
    songTitle:lipSyncResult.song?.title||ep.song?.title||'Unknown song',
    artist:lipSyncResult.song?.artist||ep.song?.artist||'Unknown artist',
    queens:lipSyncResult.results.map(r=>({
      queenId:r.queenId,
      name:r.name||gameState.queens.find(q=>q.id===r.queenId)?.name||'A queen',
      score10:Number(r.score10)||0,
      iconic:Number(r.score10)>=8.5
    }))
  };

  if(existingIndex>=0) gameState.season.iconicLipSyncs[existingIndex]=record;
  else gameState.season.iconicLipSyncs.push(record);
}

function resolveLipSync(playerMoves=null){
  const ep=gameState.currentEpisode;
  const song=ep.song;
  const bottom=(ep.special==='premiere_no_elim' ? (ep.top2Queens||[]) : ep.bottomQueens)
    .map(id=>gameState.queens.find(q=>q.id===id))
    .filter(Boolean);
  if(bottom.length<2){
    console.warn('Lip sync could not resolve because fewer than two queens were found.', {episode:ep.number, special:ep.special, top2Queens:ep.top2Queens, bottomQueens:ep.bottomQueens});
    return null;
  }

  const rawResults=bottom.map(q=>{
    const moves=q.id===gameState.playerQueenId&&playerMoves?playerMoves:chooseLipSyncMoves(song,q);
    if(!moves.strategy){
      if(moves.finale==='reveal') moves.strategy='save_reveal';
      else if(moves.finale==='stunt') moves.strategy='stunts';
      else if(moves.start==='explosive') moves.strategy='dance';
      else if(moves.start==='lyrics') moves.strategy='sell_lyrics';
      else moves.strategy='play_safe';
    }

    const weeklyPerformance=lipSyncStrategyScore(moves.strategy, song, q); // 40%
    const ability=clamp((q.attributes.lipSync||0)*0.82 + (q.attributes.cunt||0)*0.18,0,10); // 40%
    const momentumScore=clamp(((q.momentum||0)+2)*2.5,0,10); // -2..+2 -> 0..10, 10%
    const productionScore=clamp(((q.publicScores?.production||0)+30)/6,0,10); // soft production scale, 10%
    const priorLipSyncPenalty=((q.statistics.lipSyncWins||0)+(q.statistics.lipSyncLosses||0))*0.5;

    const baseScore10=Math.round(clamp(
      weeklyPerformance*0.40 +
      ability*0.40 +
      momentumScore*0.10 +
      productionScore*0.10 -
      priorLipSyncPenalty,
      0,10
    )*10)/10;

    return {
      queenId:q.id,
      name:q.name,
      rawScore:baseScore10,
      score:baseScore10,
      score10:baseScore10,
      weeklyPerformance:Math.round(weeklyPerformance*10)/10,
      executionQuality:Math.round(weeklyPerformance*10)/10,
      ability:Math.round(ability*10)/10,
      momentumScore:Math.round(momentumScore*10)/10,
      productionScore:Math.round(productionScore*10)/10,
      bottomPenalty:priorLipSyncPenalty,
      strategyEffect:null,
      moves
    };
  });

  rawResults.forEach(r=>{
    if(r.moves?.strategy!=='overshadow') return;
    const opponent=rawResults.find(o=>o.queenId!==r.queenId);
    if(!opponent) return;
    const success=r.weeklyPerformance>=7;
    if(success){
      const bonus=r.weeklyPerformance>=9?0.9:0.6;
      const opponentPenalty=r.weeklyPerformance>=9?0.9:0.6;
      r.score10=Math.round(clamp(r.score10+bonus,0,10)*10)/10;
      r.score=r.score10;
      opponent.score10=Math.round(clamp(opponent.score10-opponentPenalty,0,10)*10)/10;
      opponent.score=opponent.score10;
      r.strategyEffect={type:'overshadow',success:true,bonus,opponentPenalty};
      opponent.strategyEffect=opponent.strategyEffect||{type:'overshadowed',sourceQueenId:r.queenId,penalty:opponentPenalty};
    } else {
      const penalty=r.weeklyPerformance<5.1?1.0:0.6;
      r.score10=Math.round(clamp(r.score10-penalty,0,10)*10)/10;
      r.score=r.score10;
      r.productionScore=Math.round(clamp(r.productionScore-0.5,0,10)*10)/10;
      r.strategyEffect={type:'overshadow',success:false,penalty};
    }
  });

  const results=rawResults.sort((a,b)=>b.score10-a.score10);

  if(ep.special==='premiere_no_elim'){
    const winner=results[0], loser=results[1];
    // In a no-elimination premiere, the Top 2 lip sync decides the single WIN.
    // The losing Top 2 queen keeps a distinct TOP2 placement, equivalent to HIGH
    // for track-record scoring, but visually marked differently.
    ep.placements.forEach(p=>{
      if(p.placement==='TOP2'){
        p.placement=(p.queenId===winner.queenId?'WIN':'TOP2');
      }
    });
    ep.lipSyncResult={song,results,outcome:'top2Win',survivorId:winner.queenId,top2LoserId:loser?.queenId||null,eliminatedQueenId:null,eliminatedQueenIds:[],difference:Math.round(Math.abs(results[0].score10-results[1].score10)*10)/10};
    recordIconicLipSync(ep, ep.lipSyncResult);
    ep.eliminatedQueenId=null;
    saveGame();
    return ep.lipSyncResult;
  }

  const survivor=results[0], eliminated=results[1];
  const diff=Math.abs(results[0].score10-results[1].score10);
  let outcome='normal';
  let survivorId=survivor.queenId;
  let eliminatedQueenId=eliminated.queenId;
  let eliminatedQueenIds=[eliminated.queenId];

  if(results[0].score10<5.5 && results[1].score10<5.5 && !gameState.season.doubleSashayUsed){
    outcome='doubleSashay';
    gameState.season.doubleSashayUsed=true;
    survivorId=null;
    eliminatedQueenId=null;
    eliminatedQueenIds=results.map(r=>r.queenId);
  } else if(diff<1 && results[0].score10>=8 && results[1].score10>=8 && !gameState.season.doubleShantayUsed){
    outcome='doubleShantay';
    gameState.season.doubleShantayUsed=true;
    survivorId=null;
    eliminatedQueenId=null;
    eliminatedQueenIds=[];
  }

  ep.lipSyncResult={song,results,outcome,survivorId,eliminatedQueenId,eliminatedQueenIds,difference:Math.round(diff*10)/10};
  recordIconicLipSync(ep, ep.lipSyncResult);
  ep.eliminatedQueenId=eliminatedQueenId;
  saveGame();
  return ep.lipSyncResult;
}
function applyEpisodeStats(){
  const ep=gameState.currentEpisode;
  if(ep.statsApplied)return;
  ensureAllQueenV14Stats();
  const placementEffects={
    WIN:{momentum:2,production:3,fans:4,confidence:10,stress:-8},
    HIGH:{momentum:1,fans:2,confidence:5,stress:-3},
    TOP2:{momentum:1,fans:2,confidence:5,stress:-3},
    SAFE:{stress:2},
    LOW:{momentum:-1,confidence:-5,stress:8},
    BTM:{momentum:-2,confidence:-8,stress:12,energy:-8}
  };
  for(const p of ep.placements){
    const q=gameState.queens.find(x=>x.id===p.queenId);
    if(!q)continue;
    q.statistics.episodesCompeted++;
    q.episodeHistory.push({episode:ep.number,challenge:ep.challengeName,placement:p.placement,score:p.score,lipSync:p.placement==='BTM'});
    if(p.placement==='WIN')q.statistics.wins++;
    if(p.placement==='HIGH'||p.placement==='TOP2')q.statistics.highs++;
    if(p.placement==='SAFE')q.statistics.safes++;
    if(p.placement==='LOW')q.statistics.lows++;
    if(p.placement==='BTM')q.statistics.bottoms++;
    applyChoiceEffects(placementEffects[p.placement]||{},{queen:q,note:`Episode placement: ${p.placement}.`,source:'episode-placement',save:false});
  }
  if(ep.lipSyncResult){
    if(ep.lipSyncResult.outcome==='top2Win'){
      const win=gameState.queens.find(q=>q.id===ep.lipSyncResult.survivorId);
      if(win){ win.statistics.lipSyncWins++; applyChoiceEffects({momentum:1},{queen:win,note:'Lip sync win.',source:'lip-sync-result',save:false}); }
      ep.eliminatedQueenId=null;
    } else if(ep.lipSyncResult.outcome==='doubleShantay'){
      ep.lipSyncResult.results.forEach(r=>{const q=gameState.queens.find(x=>x.id===r.queenId); if(q){q.statistics.lipSyncWins++; applyChoiceEffects({momentum:1},{queen:q,note:'Double shantay lip sync survival.',source:'lip-sync-result',save:false});}});
    } else if(ep.lipSyncResult.outcome==='doubleSashay'){
      ep.lipSyncResult.eliminatedQueenIds.forEach(id=>{const out=gameState.queens.find(q=>q.id===id); if(!out)return; out.statistics.lipSyncLosses++; out.isEliminated=true; const last=out.episodeHistory[out.episodeHistory.length-1]; if(last)last.placement='ELIM'; if(!gameState.eliminatedQueens.some(q=>q.id===out.id))gameState.eliminatedQueens.push(out);});
    } else {
      const win=gameState.queens.find(q=>q.id===ep.lipSyncResult.survivorId);
      const out=gameState.queens.find(q=>q.id===ep.lipSyncResult.eliminatedQueenId);
      if(win)win.statistics.lipSyncWins++;
      if(out){out.statistics.lipSyncLosses++; out.isEliminated=true; const last=out.episodeHistory[out.episodeHistory.length-1]; if(last)last.placement='ELIM'; if(!gameState.eliminatedQueens.some(q=>q.id===out.id))gameState.eliminatedQueens.push(out); ep.eliminatedQueenId=out.id;}
    }
  }
  if(typeof markPremierePhaseDone==='function')markPremierePhaseDone();
  ep.statsApplied=true;
  gameState.episodeHistory.push(JSON.parse(JSON.stringify(ep)));
  saveGame();
}
