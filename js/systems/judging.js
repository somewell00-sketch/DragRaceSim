
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
  // Song tone now lightly rewards or punishes strategy fit without changing the lip sync system.
  const energy=(song?.energy||'medium').toLowerCase();
  const toneModifiers={
    high:{dance:0.8,stunts:0.8,overshadow:0.4,emotion:-0.6},
    medium:{},
    low:{emotion:0.8,sell_lyrics:0.8,dance:-0.6,stunts:-1.0}
  };
  const toneMod=toneModifiers[energy]?.[strategy]||0;
  const high=energy==='high';
  const reveals=q.inventory?.reveals||0;
  const a=q.attributes||{};
  const clamp10=v=>clamp(v,0,10);
  switch(strategy){
    case 'emotion':
      return clamp10(6.2 + toneMod + (a.acting||0)*0.28 + (a.cunt||0)*0.18 + rand(-1.0,1.4));
    case 'sell_lyrics':
      return clamp10(5.1 + toneMod + (a.cunt||0)*0.26 + (a.acting||0)*0.22 + rand(-1.0,1.2));
    case 'dance':
      return clamp10(5.0 + toneMod + (a.lipSync||0)*0.32 + (a.cunt||0)*0.10 + rand(-1.2,1.6));
    case 'stunts':
      return clamp10(4.4 + toneMod + (a.lipSync||0)*0.30 + rand(-2.8,3.4));
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
      return clamp10(4.5 + toneMod + (a.cunt||0)*0.22 + (a.lipSync||0)*0.18 + rand(-2.6,2.8));
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

function isLastCompetitiveEpisodeBeforeFinale(ep){
  if(!ep || ep.special)return false;
  // The season decides the finale size when it is created.
  // Therefore the last competitive episode is always the episode with
  // exactly one more active queen than the fixed finale size.
  const finaleSize=gameState.season?.finaleSize || 4;
  const activeCount=ep.activeCount || gameState.queens.filter(q=>!q.isEliminated).length;
  return activeCount===finaleSize+1;
}
function getFinalStretchPositiveCritique(s, ep){
  const praisePlacement=s.placement==='SAFE'?'SAFE':'HIGH';
  return getCritiqueText(praisePlacement, ep.challengeType, s.risk, true) || `${s.name} receives warm praise from the panel for making it this far and showing why she belongs near the finale.`;
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
  if(wins>=6) winPenalty=-4.0;
  else if(wins>=5) winPenalty=-3.0;
  else if(wins>=4) winPenalty=-2.0;
  else if(wins>=3) winPenalty=-1.0;
  else if(wins>=2) winPenalty=-0.50;
  const highPenalty=-(Math.floor(highs/2)*0.15);
  return Math.round((winPenalty+highPenalty)*100)/100;
}
function getWinThrottlePenalty(q){
  return getJudgesExpectationPenalty(q);
}
function isLegacyCompetitiveEpisode(ep){
  return ['legacy','assassin'].includes(getSeasonFormat()) && !['premiere_no_elim','lalaparuza','tournament_bracket'].includes(ep?.special);
}
function legacyAllStarsPressure(q, ep){
  // Legacy gives out two WINs per episode, so repeated frontrunner weeks need
  // a slightly harsher All Stars pressure without changing the episode flow.
  if(!isLegacyCompetitiveEpisode(ep))return 0;
  const wins=q?.statistics?.wins||0;
  if(wins>=5)return -4;
  if(wins>=4)return -3;
  if(wins>=3)return -2;
  if(wins>=2)return -1;
  return 0;
}
function winRedirectChance(q){
  const wins=q?.statistics?.wins||0;
  if(wins>=5)return 0.95;
if(wins>=4)return 0.80;
if(wins>=3)return 0.60;
if(wins>=2)return 0.40;     // trying for 3rd or 4th: 50% chance the win goes to the next queen
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
function softenFrontrunnerHighsToSafe(scored, ep){
  if(!ep || ep.frontrunnerHighSofteningDone)return;
  if(['premiere_no_elim','tournament_bracket','lalaparuza'].includes(ep.special))return;

  const byScore=[...scored].sort((a,b)=>b.score-a.score);
  const rankMap={};
  byScore.forEach((s,i)=>rankMap[s.queenId]=i+1);

  scored.forEach(s=>{
    if(s.placement!=='HIGH')return;
    if(rankMap[s.queenId]<=2)return;

    const q=gameState.queens.find(x=>x.id===s.queenId);
    if(!q)return;

    const wins=q.statistics?.wins||0;
    const highs=q.statistics?.highs||0;

    if(wins<2 && highs<3)return;

    let chance=0.15;
    if(wins>=3)chance+=0.10;
    if(highs>=5)chance+=0.05;

    if(Math.random()<chance){
      s.placement='SAFE';
      s.frontrunnerSoftenedToSafe=true;
      ep.frontrunnerHighSofteningApplied=true;
    }
  });

  ep.frontrunnerHighSofteningDone=true;
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
function normalizeCritiqueSpread(scored, activeCount=scored.length){
  const maxTops=activeCount>=13?4:3;
  const maxLows=activeCount>=13?2:1;

  const tops=scored
    .filter(s=>s.placement==='HIGH')
    .sort((a,b)=>a.score-b.score);
  while(scored.filter(s=>s.placement==='WIN'||s.placement==='HIGH').length>maxTops && tops.length){
    tops.shift().placement='SAFE';
  }

  const lows=scored
    .filter(s=>s.placement==='LOW')
    .sort((a,b)=>b.score-a.score);
  while(scored.filter(s=>s.placement==='LOW').length>maxLows && lows.length){
    lows.shift().placement='SAFE';
  }
}
function getBottomCountForCurrentFormat(activeCount){
  const format=typeof getSeasonFormat==='function'?getSeasonFormat():'regular';
  if(format==='all_winners')return 0;
  if(format==='legacy' || format==='assassin')return Math.min(3, activeCount);
  return Math.min(2, activeCount);
}
function assignIndividualPlacements(scored){
  scored.forEach(s=>s.placement='SAFE');
  if(scored[0])scored[0].placement='WIN';
  if(scored[1])scored[1].placement='HIGH';
  if(scored[2])scored[2].placement='HIGH';
  if(scored.length>=13 && scored[3])scored[3].placement='HIGH';
  if(scored.length>5 && scored[scored.length-3])scored[scored.length-3].placement='LOW';
  if(scored.length>=13 && scored[scored.length-4])scored[scored.length-4].placement='LOW';
  if(scored[scored.length-2])scored[scored.length-2].placement='BTM';
  if(scored[scored.length-1])scored[scored.length-1].placement='BTM';
  normalizeCritiqueSpread(scored, scored.length);
}
function assignTeamPlacements(scored, ep){
  scored.forEach(s=>s.placement='SAFE');
  const teams=(ep.teams||[]).map(team=>({team,score:teamGroupScore(team,scored,ep)})).sort((a,b)=>b.score-a.score);
  ep.teamScores=teams.map(t=>({teamId:t.team.id,name:t.team.name,score:t.score,chemistry:Math.round((typeof teamChemistryBonus==='function'?teamChemistryBonus(t.team,ep):0)*10)/10,queenIds:t.team.queenIds}));
  if(!teams.length){assignIndividualPlacements(scored); return;}

  const setTeamPlacement=(teamRow, placement)=>{
    if(!teamRow?.team?.queenIds?.length)return;
    scored
      .filter(s=>teamRow.team.queenIds.includes(s.queenId))
      .forEach(s=>{ s.placement=placement; });
  };
  const membersForTeam=(teamRow)=>scored
    .filter(s=>teamRow?.team?.queenIds?.includes(s.queenId))
    .sort((a,b)=>(a.individualScore-b.individualScore)||(a.score-b.score));

  const best=teams[0];
  const worst=teams[teams.length-1];
  const bestMembers=scored.filter(s=>best?.team?.queenIds?.includes(s.queenId));
  const bestGroupSize=bestMembers.length;

  // Duos judged as pairs share the win. For larger judged groups, the group is
  // praised together, but normally only the strongest member receives WIN.
  // Small groups of 3-4 that all stay on stage for critiques have a rare
  // group-win moment where the whole group receives WIN.
  const smallCritiquedGroupWin=bestGroupSize>2 && bestGroupSize<=4 && Math.random()<0.10;
  ep.smallCritiquedGroupWin=!!smallCritiquedGroupWin;
  if(bestGroupSize<=2 || smallCritiquedGroupWin){
    setTeamPlacement(best,'WIN');
  }else{
    setTeamPlacement(best,'HIGH');
    const individualWinner=[...bestMembers].sort((a,b)=>b.individualScore-a.individualScore)[0];
    if(individualWinner)individualWinner.placement='WIN';
  }

  if(worst && worst.team.id!==best.team.id){
    const worstMembers=membersForTeam(worst);
    const bottomCount=getBottomCountForCurrentFormat(scored.length);
    const wholeTeamBottom=bottomCount>0 && worstMembers.length>bottomCount && Math.random()<0.03;
    ep.wholeTeamBottom=!!wholeTeamBottom;
    ep.wholeTeamBottomTeamId=wholeTeamBottom?worst.team.id:null;

    if(wholeTeamBottom){
      setTeamPlacement(worst,'BTM');
    }else{
      worstMembers.slice(0,bottomCount).forEach(s=>{s.placement='BTM';});
      worstMembers.slice(bottomCount,bottomCount+1).forEach(s=>{s.placement='LOW';});
    }
  }

  // With a large cast, call one additional whole team as HIGH/LOW.
  if(scored.length>=13 && teams.length>=4){
    const secondBest=teams[1];
    if(secondBest && ![best.team.id,worst.team.id].includes(secondBest.team.id))setTeamPlacement(secondBest,'HIGH');
    const secondWorst=teams[teams.length-2];
    if(secondWorst && ![best.team.id,worst.team.id,secondBest?.team?.id].includes(secondWorst.team.id))setTeamPlacement(secondWorst,'LOW');
  }
}

function teamForQueenIdInEpisode(qId, ep){
  return (ep?.teams||[]).find(t=>(t.queenIds||[]).includes(qId)) || null;
}
function isFashionWarsDuelMode(ep){
  const activeCount=ep?.activeCount || (ep?.teams||[]).reduce((n,t)=>n+(t.queenIds?.length||0),0);
  return ep?.challengeType==='fashion_wars' && activeCount===8;
}
function resolveFashionWarsBattles(scored, ep){
  const battles=ep?.challengeContent?.battles||[];
  const byId=Object.fromEntries(scored.map(s=>[s.queenId,s]));
  const duelMode=isFashionWarsDuelMode(ep);
  const teamPoints={};
  const teamTotals={};
  (ep.teams||[]).forEach(t=>{teamPoints[t.id]=0; teamTotals[t.id]=0;});
  battles.forEach(battle=>{
    const entrants=(battle.queenIds||[]).map(id=>byId[id]).filter(Boolean).sort((a,b)=>b.score-a.score);
    const winner=entrants[0];
    const winnerTeam=winner?teamForQueenIdInEpisode(winner.queenId,ep):null;
    battle.winnerId=winner?.queenId||null;
    battle.winnerTeamId=duelMode?null:(winnerTeam?.id||null);
    if(!duelMode && winnerTeam)teamPoints[winnerTeam.id]=(teamPoints[winnerTeam.id]||0)+1;
    if(!duelMode){
      entrants.forEach(row=>{
        const team=teamForQueenIdInEpisode(row.queenId,ep);
        if(team)teamTotals[team.id]=(teamTotals[team.id]||0)+row.score;
      });
    }
  });
  if(duelMode){
    ep.fashionWarsPoints=[];
    ep.fashionWarsWinningTeamId=null;
    ep.fashionWarsLosingTeamId=null;
    return [];
  }
  ep.fashionWarsPoints=(ep.teams||[]).map(team=>({
    teamId:team.id,
    name:team.name,
    points:teamPoints[team.id]||0,
    total:Math.round((teamTotals[team.id]||0)*10)/10,
    queenIds:team.queenIds
  })).sort((a,b)=>(b.points-a.points)||(b.total-a.total));
  return ep.fashionWarsPoints;
}
function assignFashionWarsPlacements(scored, ep){
  scored.forEach(s=>s.placement='SAFE');
  const standings=resolveFashionWarsBattles(scored,ep);
  const byTeamId=Object.fromEntries((ep.teams||[]).map(t=>[t.id,t]));
  const activeCount=ep.activeCount || scored.length;
  const format=(typeof getSeasonFormat==='function'?getSeasonFormat():'regular');
  const winCount=(format==='all_winners'||format==='legacy'||format==='assassin')?2:1;
  const bottomCount=getBottomCountForCurrentFormat(activeCount);
  const bestTeam=standings[0];
  const worstTeam=standings[standings.length-1];
  ep.fashionWarsWinningTeamId=bestTeam?.teamId||null;
  ep.fashionWarsLosingTeamId=worstTeam?.teamId||null;

  const markRows=(ids, placement)=>scored.filter(s=>ids.includes(s.queenId)).forEach(s=>{s.placement=placement;});

  if(isFashionWarsDuelMode(ep)){
    const battleWinnerIds=new Set((ep.challengeContent?.battles||[]).map(b=>b.winnerId).filter(Boolean));
    const battleLoserIds=new Set((ep.challengeContent?.battles||[]).flatMap(b=>(b.queenIds||[]).filter(id=>id!==b.winnerId)));
    const winners=scored.filter(s=>battleWinnerIds.has(s.queenId)).sort((a,b)=>b.score-a.score);
    const losers=scored.filter(s=>battleLoserIds.has(s.queenId)).sort((a,b)=>a.score-b.score);
    winners.slice(0,3).forEach(s=>{s.placement='HIGH';});
    winners.slice(0,winCount).forEach(s=>{s.placement='WIN';});
    losers.slice(0,bottomCount).forEach(s=>{s.placement='BTM';});
    losers.slice(bottomCount,bottomCount+1).forEach(s=>{s.placement='LOW';});
    return;
  }

  if(!standings.length){assignIndividualPlacements(scored); return;}

  const sortedTeamRows=(teamId, asc=false)=>scored
    .filter(s=>(byTeamId[teamId]?.queenIds||[]).includes(s.queenId))
    .sort((a,b)=>asc?a.score-b.score:b.score-a.score);

  if(activeCount===10){
    const bestRows=sortedTeamRows(bestTeam.teamId,false);
    const worstRows=sortedTeamRows(worstTeam.teamId,true);
    const wholeTeamBottom=bottomCount>0 && worstRows.length>bottomCount && Math.random()<0.03;
    ep.wholeTeamBottom=!!wholeTeamBottom;
    ep.wholeTeamBottomTeamId=wholeTeamBottom?worstTeam.teamId:null;
    markRows(bestRows.slice(0,3).map(s=>s.queenId),'HIGH');
    bestRows.slice(0,winCount).forEach(s=>{s.placement='WIN';});
    if(wholeTeamBottom){
      markRows(worstRows.map(s=>s.queenId),'BTM');
    }else{
      worstRows.slice(0,bottomCount).forEach(s=>{s.placement='BTM';});
      worstRows.slice(bottomCount,bottomCount+1).forEach(s=>{s.placement='LOW';});
    }
    return;
  }

  if(activeCount===9){
    const bestRows=sortedTeamRows(bestTeam.teamId,false);
    const worstRows=sortedTeamRows(worstTeam.teamId,true);
    const wholeTeamBottom=bottomCount>0 && worstRows.length>bottomCount && Math.random()<0.03;
    ep.wholeTeamBottom=!!wholeTeamBottom;
    ep.wholeTeamBottomTeamId=wholeTeamBottom?worstTeam.teamId:null;
    markRows(bestRows.map(s=>s.queenId),'HIGH');
    bestRows.slice(0,winCount).forEach(s=>{s.placement='WIN';});
    if(wholeTeamBottom){
      markRows(worstRows.map(s=>s.queenId),'BTM');
    }else{
      worstRows.slice(0,bottomCount).forEach(s=>{s.placement='BTM';});
      worstRows.slice(bottomCount,bottomCount+1).forEach(s=>{s.placement='LOW';});
    }
    return;
  }

  const battleWinnerIds=new Set((ep.challengeContent?.battles||[]).map(b=>b.winnerId).filter(Boolean));
  const winners=scored.filter(s=>battleWinnerIds.has(s.queenId)).sort((a,b)=>b.score-a.score);
  const losers=scored.filter(s=>!battleWinnerIds.has(s.queenId)).sort((a,b)=>a.score-b.score);
  winners.slice(0,3).forEach(s=>{s.placement='HIGH';});
  losers.slice(0,3).forEach(s=>{s.placement='LOW';});
  winners.slice(0,winCount).forEach(s=>{s.placement='WIN';});
  losers.slice(0,bottomCount).forEach(s=>{s.placement='BTM';});
}


function publicChallengeSubtypeWeights(subtype){
  const profiles={
    hustle:{cunt:.50,acting:.25,lipSync:.10,runway:.10,makeup:.05},
    sales:{cunt:.50,acting:.25,lipSync:.10,runway:.10,makeup:.05},
    fundraising:{cunt:.50,acting:.25,lipSync:.10,runway:.10,makeup:.05},
    performance:{lipSync:.40,cunt:.35,acting:.15,runway:.05,makeup:.05},
    promo:{cunt:.35,acting:.35,runway:.15,makeup:.10,lipSync:.05},
    campaign:{cunt:.35,acting:.35,runway:.15,makeup:.10,lipSync:.05},
    public_interaction:{cunt:.45,acting:.35,runway:.10,makeup:.05,lipSync:.05}
  };
  return profiles[String(subtype||'').toLowerCase()] || {cunt:.45,acting:.25,lipSync:.15,runway:.10,makeup:.05};
}
function publicPointsFromPerformance(performance){
  const p=Number(performance)||0;
  let lo=0, hi=20;
  if(p>=9.5){lo=92;hi=100;}
  else if(p>=9.0){lo=86;hi=95;}
  else if(p>=8.5){lo=78;hi=90;}
  else if(p>=8.0){lo=70;hi=84;}
  else if(p>=7.5){lo=62;hi=76;}
  else if(p>=7.0){lo=52;hi=68;}
  else if(p>=6.5){lo=42;hi=58;}
  else if(p>=6.0){lo=32;hi=48;}
  else if(p>=5.5){lo=22;hi=38;}
  else if(p>=5.0){lo=12;hi=28;}
  let points=rand(lo,hi);
  const roll=Math.random();
  if(roll<0.04)points+=rand(10,18);
  else if(roll<0.08)points-=rand(10,18);
  else points+=rand(-8,10);
  return clamp(Math.round(points),0,100);
}
function ensurePublicChallengeResults(scored, ep){
  if(!ep || ep.challengeType!=='public')return null;
  const subtype=ep.challengeContent?.publicSubtype || ep.challengeContent?.publicChallenge?.subtype || ep.subtype || 'public_interaction';
  ep.subtype=subtype;
  const byId=Object.fromEntries(scored.map(s=>[s.queenId,s]));
  if(!ep.publicResults)ep.publicResults={};
  (ep.teams||[]).forEach(team=>{
    (team.queenIds||[]).forEach(id=>{
      if(ep.publicResults[id]!==undefined)return;
      const row=byId[id];
      const perf=(Number(row?.individualScore)||Number(row?.score)||0)/10;
      ep.publicResults[id]=publicPointsFromPerformance(perf);
    });
  });
  ep.teamTotals=(ep.teams||[]).map(team=>({
    teamId:team.id,
    name:team.name,
    queenIds:team.queenIds||[],
    total:(team.queenIds||[]).reduce((sum,id)=>sum+(Number(ep.publicResults[id])||0),0)
  })).sort((a,b)=>b.total-a.total);
  ep.winningTeam=ep.teamTotals[0]?.teamId||null;
  ep.losingTeam=ep.teamTotals[ep.teamTotals.length-1]?.teamId||null;
  ep.teamScores=ep.teamTotals.map(t=>({teamId:t.teamId,name:t.name,score:t.total,chemistry:0,queenIds:t.queenIds}));
  return ep.teamTotals;
}
function applyPublicChallengePlacements(scored, ep, seasonFormat){
  scored.forEach(s=>s.placement='SAFE');
  ensurePublicChallengeResults(scored,ep);
  const byTeam=Object.fromEntries((ep.teams||[]).map(t=>[t.id,t]));
  const winnerTeam=byTeam[ep.winningTeam];
  const loserTeam=byTeam[ep.losingTeam];
  const pointFor=s=>Number(ep.publicResults?.[s.queenId])||0;
  const best=scored.filter(s=>(winnerTeam?.queenIds||[]).includes(s.queenId)).sort((a,b)=>pointFor(b)-pointFor(a)||(b.score-a.score)).slice(0,3);
  const worst=scored.filter(s=>(loserTeam?.queenIds||[]).includes(s.queenId)).sort((a,b)=>pointFor(a)-pointFor(b)||(a.score-b.score)).slice(0,3);
  const bottomCount=getBottomCountForCurrentFormat(scored.length);
  if(seasonFormat==='legacy'){
    best.slice(0,2).forEach(s=>s.placement='WIN');
    if(best[2])best[2].placement='HIGH';
    worst.slice(0,bottomCount).forEach(s=>s.placement='BTM');
    ep.top2Queens=best.slice(0,2).map(s=>s.queenId);
    ep.bottomQueens=worst.slice(0,bottomCount).map(s=>s.queenId);
    ep.legacyVotes={};
    ep.top2Queens.forEach(id=>{ep.legacyVotes[id]=chooseLipstick(id, ep.bottomQueens);});
    return;
  }
  if(seasonFormat==='assassin'){
    if(best[0])best[0].placement='WIN';
    best.slice(1,3).forEach(s=>s.placement='HIGH');
    worst.slice(0,bottomCount).forEach(s=>s.placement='BTM');
    ep.topQueenId=best[0]?.queenId||null;
    ep.bottomQueens=worst.slice(0,bottomCount).map(s=>s.queenId);
    ep.assassinTopVote=ep.topQueenId?chooseLipstick(ep.topQueenId, ep.bottomQueens):null;
    ep.assassinGroupVotes={};
    const activeVoterIds=new Set(scored.map(s=>s.queenId));
    scored.forEach(s=>{ if(s.queenId!==ep.topQueenId && activeVoterIds.has(s.queenId))ep.assassinGroupVotes[s.queenId]=chooseAssassinVote(s.queenId, ep.bottomQueens); });
    ep.lipSyncAssassin=typeof createLipSyncAssassin==='function'?createLipSyncAssassin():{id:'lip_sync_assassin',name:'Lip Sync Assassin',isAssassin:true,attributes:{lipSync:8,cunt:8},statistics:{},publicScores:{production:20},momentum:0,inventory:{reveals:1}};
    return;
  }
  if(seasonFormat==='all_winners'){
    best.slice(0,2).forEach(s=>s.placement='TOP2');
    best.slice(2,3).forEach(s=>s.placement='HIGH');
    ep.top2Queens=best.slice(0,2).map(s=>s.queenId);
    ep.bottomQueens=[];
    return;
  }
  if(best[0])best[0].placement='WIN';
  best.slice(1,3).forEach(s=>s.placement='HIGH');
  if(worst[2])worst[2].placement='LOW';
  worst.slice(0,2).forEach(s=>s.placement='BTM');
  ep.bottomQueens=worst.slice(0,2).map(s=>s.queenId);
}

function applyPassiveWinCap(scored, ep){
  if(!(ep.passiveWorkroom || ep.canPlayerWin===false))return;
  const playerScore=scored.find(s=>s.queenId===gameState.playerQueenId);
  if(!playerScore || playerScore.placement!=='WIN')return;
  playerScore.placement='HIGH';
  let replacement=null;
  if(ep?.challengeType==='public' && ep.winningTeam){
    replacement=scored.find(s=>s.queenId!==gameState.playerQueenId && s.teamId===ep.winningTeam && s.placement!=='WIN' && s.placement!=='TOP2');
  }
  if(!replacement)replacement=scored.find(s=>s.queenId!==gameState.playerQueenId && s.placement!=='WIN' && s.placement!=='TOP2');
  if(replacement)replacement.placement='WIN';
  ep.playerCappedByPassive=true;
}
function challengeDefinitionForEpisode(ep){
  const found=gameState.data.challenges.find(c=>c.id===ep.challengeType);
  if(found) return found;
  if(ep.challengeType==='talent' && typeof makeTalentChallenge==='function') return makeTalentChallenge();
  return {id:ep.challengeType||'unknown', name:ep.challengeName||'Challenge', runwayWeight:.15, weights:{cunt:.30,lipSync:.20,acting:.20,runway:.20,makeup:.10}};
}

function normalizeTalentWeights(weights){
  const all={cunt:0,lipSync:0,acting:0,runway:0,makeup:0,sewing:0,...(weights||{})};
  const total=Object.values(all).reduce((sum,v)=>sum+(Number(v)||0),0) || 1;
  Object.keys(all).forEach(k=>{ all[k]=(Number(all[k])||0)/total; });
  return all;
}
function talentTypeForQueenInEpisode(ep,q){
  const talent=(ep?.challengeContent?.talents||[]).find(t=>t.queenId===q?.id);
  return String(talent?.talent?.type || 'performance').toLowerCase();
}
function talentWeightsForType(type){
  const profiles={
    music:{cunt:.24,lipSync:.32,acting:.16,runway:.10,makeup:.08,sewing:.10},
    vocals:{cunt:.22,lipSync:.28,acting:.24,runway:.08,makeup:.08,sewing:.10},
    performance:{cunt:.24,lipSync:.24,acting:.18,runway:.14,makeup:.10,sewing:.10},
    dance:{cunt:.18,lipSync:.36,acting:.12,runway:.16,makeup:.08,sewing:.10},
    stunt:{cunt:.20,lipSync:.34,acting:.10,runway:.16,makeup:.08,sewing:.12},
    comedy:{cunt:.32,lipSync:.12,acting:.30,runway:.08,makeup:.08,sewing:.10},
    theatre:{cunt:.24,lipSync:.14,acting:.34,runway:.10,makeup:.08,sewing:.10},
    acting:{cunt:.24,lipSync:.12,acting:.36,runway:.10,makeup:.08,sewing:.10},
    variety:{cunt:.26,lipSync:.20,acting:.20,runway:.12,makeup:.10,sewing:.12},
    camp:{cunt:.30,lipSync:.14,acting:.24,runway:.10,makeup:.10,sewing:.12},
    runway:{cunt:.16,lipSync:.10,acting:.08,runway:.28,makeup:.20,sewing:.18},
    weird:{cunt:.28,lipSync:.18,acting:.18,runway:.12,makeup:.12,sewing:.12}
  };
  return normalizeTalentWeights(profiles[type]||profiles.performance);
}
function challengeWeightsForQueen(challenge,ep,q){
  if(ep?.challengeType==='talent'){
    return talentWeightsForType(talentTypeForQueenInEpisode(ep,q));
  }
  if(ep?.challengeType==='public'){
    return publicChallengeSubtypeWeights(ep.challengeContent?.publicSubtype || ep.challengeContent?.publicChallenge?.subtype || ep.subtype);
  }
  return challenge.weights;
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
    const wins=q.statistics?.wins||0;
    const pressure=wins>=2?0.35:(wins>=1?0.20:0);
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

function recentPositiveSpotlightStreak(q){
  const history=[...(q?.episodeHistory||[])].reverse();
  let count=0;
  for(const h of history){
    const p=String(h?.placement||'').toUpperCase();
    if(['WIN','TOP2','HIGH'].includes(p))count++;
    else break;
  }
  return count;
}
function recentSafeStreak(q){
  const history=[...(q?.episodeHistory||[])].reverse();
  let count=0;
  for(const h of history){
    const p=String(h?.placement||'').toUpperCase();
    if(p==='SAFE')count++;
    else break;
  }
  return count;
}
function allWinnersSpotlightBalanceModifier(q, ep){
  if((typeof getSeasonFormat==='function'?getSeasonFormat():gameState.season?.format)!=='all_winners')return 0;
  if(!q || !ep || ep.special)return 0;
  const st=q.statistics||{};
  const spotlight=recentPositiveSpotlightStreak(q);
  const safe=recentSafeStreak(q);
  let mod=0;

  // All Winners still needs the regular anti-runaway feel. TOP2 counts as
  // the same spotlight load as WIN here, because both queens receive the main
  // challenge win credit in this format.
  if(spotlight>=6)mod-=12.0;
  else if(spotlight>=5)mod-=10.0;
  else if(spotlight>=4)mod-=8.0;
  else if(spotlight>=3)mod-=5.5;
  else if(spotlight>=2)mod-=2.5;

  if((st.wins||0)>=6)mod-=10.0;
  else if((st.wins||0)>=5)mod-=8.5;
  else if((st.wins||0)>=4)mod-=6.5;
  else if((st.wins||0)>=3)mod-=4.25;
  else if((st.wins||0)>=2)mod-=2.25;

  if((st.highs||0)>=9)mod-=5.5;
  else if((st.highs||0)>=7)mod-=4.0;
  else if((st.highs||0)>=5)mod-=2.5;

  if(q.id===gameState.playerQueenId && (ep.passiveWorkroom || ep.canPlayerWin===false)){
    mod-=6.0;
  }

  if(safe>=4)mod+=5.0;
  else if(safe>=3)mod+=3.75;
  else if(safe>=2)mod+=2.2;

  return Math.round(mod*10)/10;
}
function allWinnersCanRedirectSpotlight(q, slot){
  if(!q)return false;
  const st=q.statistics||{};
  const spotlight=recentPositiveSpotlightStreak(q);
  let chance=0;
  if(slot==='top2'){
    if(spotlight>=6)chance=0.995;
    else if(spotlight>=5)chance=0.97;
    else if(spotlight>=4)chance=0.90;
    else if(spotlight>=3)chance=0.72;
    else if(spotlight>=2)chance=0.38;
    if((st.wins||0)>=5)chance=Math.max(chance,0.985);
    else if((st.wins||0)>=4)chance=Math.max(chance,0.94);
    else if((st.wins||0)>=3)chance=Math.max(chance,0.80);
    else if((st.wins||0)>=2)chance=Math.max(chance,0.52);
  }else{
    if(spotlight>=5)chance=0.90;
    else if(spotlight>=4)chance=0.78;
    else if(spotlight>=3)chance=0.58;
    else if(spotlight>=2)chance=0.30;
  }
  return chance>0 && Math.random()<chance;
}
function applyAllWinnersSpotlightSwaps(scored, ep){
  if((typeof getSeasonFormat==='function'?getSeasonFormat():gameState.season?.format)!=='all_winners')return;
  if(!ep || ep.allWinnersSpotlightSwapsDone)return;
  const queenFor=s=>gameState.queens.find(q=>q.id===s?.queenId);
  const swap=(i,j,reason)=>{
    const tmp=scored[i]; scored[i]=scored[j]; scored[j]=tmp;
    scored[j].allWinnersSoftened=reason;
    scored[i].allWinnersPromotedByBalance=true;
    ep.allWinnersBalanceApplied=true;
  };
  for(let i=0;i<Math.min(2,scored.length);i++){
    const q=queenFor(scored[i]);
    if(!allWinnersCanRedirectSpotlight(q,'top2'))continue;
    let j=-1;
    for(let k=2;k<scored.length;k++){
      const cq=queenFor(scored[k]);
      if(!cq)continue;
      if(recentPositiveSpotlightStreak(cq)<=1 || recentSafeStreak(cq)>=2 || (cq.statistics?.wins||0)<(q.statistics?.wins||0)) { j=k; break; }
    }
    if(j>1)swap(i,j,'Top 2 spotlight softened');
  }
  for(let i=2;i<Math.min(4,scored.length);i++){
    const q=queenFor(scored[i]);
    if(!allWinnersCanRedirectSpotlight(q,'high'))continue;
    let j=-1;
    for(let k=4;k<scored.length;k++){
      const cq=queenFor(scored[k]);
      if(cq && (recentSafeStreak(cq)>=2 || recentPositiveSpotlightStreak(cq)<=1)){j=k; break;}
    }
    if(j>3)swap(i,j,'HIGH spotlight softened');
  }
  ep.allWinnersSpotlightSwapsDone=true;
}
function allWinnersTop2Eligible(scoreRow, ep){
  if(!scoreRow)return false;
  if(scoreRow.queenId===gameState.playerQueenId && (ep.passiveWorkroom || ep.canPlayerWin===false))return false;
  return true;
}
function pickAllWinnersPlacementRows(scored, ep){
  // Keep the current order. applyAllWinnersSpotlightSwaps() may have already
  // softened repeated Top 2/HIGH placements; sorting by score again would undo it.
  const ranked=[...scored];
  let top2=[];
  for(const row of ranked){
    if(top2.length>=2)break;
    if(allWinnersTop2Eligible(row, ep))top2.push(row);
  }
  if(top2.length<2){
    for(const row of ranked){
      if(top2.length>=2)break;
      if(!top2.includes(row))top2.push(row);
    }
  }
  const high=[];
  for(const row of ranked){
    if(high.length>=2)break;
    if(top2.includes(row))continue;
    if(row.queenId===gameState.playerQueenId && (ep.passiveWorkroom || ep.canPlayerWin===false))continue;
    high.push(row);
  }
  if(high.length<2){
    for(const row of ranked){
      if(high.length>=2)break;
      if(!top2.includes(row) && !high.includes(row))high.push(row);
    }
  }
  return {top2,high};
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
  if((st.wins||0)>=1)pressure-=0.35;
  if((st.highs||0)>=2)pressure-=0.20;
  if((q.momentum||0)>=2)pressure-=0.20;
  return Math.round(pressure*10)/10;
}

function frontrunnerVolatilityModifier(q, ep){
  // A queen who wins early should not become bottom-proof for the rest of the season.
  // This is a small week-to-week exposure modifier, separate from the WIN throttle:
  // it can pull a frontrunner into LOW/BTM on a bad week without making strong queens random.
  if(!q || !ep)return 0;
  const st=q.statistics||{};
  const wins=st.wins||0;
  if(wins<1)return 0;
  const week=ep.number||0;
  if(week<3)return 0;
  const history=q.episodeHistory||[];
  const last=history[history.length-1]?.placement||'';
  const lows=st.lows||0;
  const bottoms=st.bottoms||0;
  let pressure=0;
  if(last==='WIN')pressure-=0.75;
  else pressure-=0.30;
  pressure-=Math.min(0.50, wins*0.18);
  if(lows===0 && bottoms===0)pressure-=0.25;
  if((q.momentum||0)>=1.5)pressure-=0.15;
  return Math.round(Math.max(-1.35, pressure)*10)/10;
}

function ballRunwayCategoryWeights(count){
  if(count<=1)return [1];
  const earlyWeight=.5/Math.max(1,count-1);
  return Array.from({length:count},(_,i)=>i===count-1?.5:earlyWeight);
}
function scaledAttr(q, attr){
  return ((q.attributes&&q.attributes[attr])||0)*10;
}
function homeBallLookScore(q, roll){
  // First Ball categories are brought from home: styling, presentation and polish matter most.
  const score=scaledAttr(q,'runway')*.70 + scaledAttr(q,'makeup')*.20 + scaledAttr(q,'cunt')*.10 + roll;
  return Math.round(clamp(score,0,100)*10)/10;
}
function constructedBallLookScore(q, roll){
  // Final Ball category is constructed in the workroom, so sewing is the dominant factor.
  const score=scaledAttr(q,'sewing')*.55 + scaledAttr(q,'runway')*.30 + scaledAttr(q,'makeup')*.10 + scaledAttr(q,'cunt')*.05 + roll;
  return Math.round(clamp(score,0,100)*10)/10;
}
function designTootBootScore(q, runwayScore){
  // Design toots/boots should judge the garment, not only how it was sold.
  const construction=scaledAttr(q,'sewing')*.80 + scaledAttr(q,'makeup')*.15 + scaledAttr(q,'cunt')*.05;
  const presentation=clamp((runwayScore/30)*100,0,100);
  return Math.round((construction*.60 + presentation*.40)*10)/10;
}
function ensureBallRunwayScores(ep,q){
  const categories=(ep?.runwayCategories&&ep.runwayCategories.length)?ep.runwayCategories:[];
  if(ep?.challengeType!=='ball' || categories.length<=1)return null;
  if(!ep.ballRunwayRolls)ep.ballRunwayRolls={};
  if(!Array.isArray(ep.ballRunwayRolls[q.id]) || ep.ballRunwayRolls[q.id].length!==categories.length){
    ep.ballRunwayRolls[q.id]=categories.map(()=>rand(-8,8));
  }
  const weights=ballRunwayCategoryWeights(categories.length);
  const scores=ep.ballRunwayRolls[q.id].map((roll,idx)=>idx===categories.length-1 ? constructedBallLookScore(q,roll) : homeBallLookScore(q,roll));
  const composite=scores.reduce((sum,score,idx)=>sum + score*(weights[idx]||0),0);
  return {scores,composite:Math.round(composite*10)/10,weights};
}



function isSnatchGameOfLoveEpisode(ep){
  return !!(ep && ep.challengeType==='snatchgame' && getSeasonFormat()!=='regular' && !['premiere','premiere_no_elim','lalaparuza'].includes(ep.special));
}

function ensureSnatchGameOfLoveGroups(scored, ep){
  const current=ep.snatchGameOfLoveGroups;
  const scoredIds=new Set(scored.map(s=>s.queenId));
  if(Array.isArray(current) && current.length===2){
    const valid=current.every(group=>Array.isArray(group) && group.every(id=>scoredIds.has(id)));
    const covered=current.flat().filter(id=>scoredIds.has(id)).length===scored.length;
    if(valid && covered)return current;
  }
  const ids=shuffle(scored.map(s=>s.queenId));
  const mid=Math.ceil(ids.length/2);
  ep.snatchGameOfLoveGroups=[ids.slice(0,mid), ids.slice(mid)];
  return ep.snatchGameOfLoveGroups;
}

function snatchGameOfLoveGroupWinners(scored, ep){
  const groups=ensureSnatchGameOfLoveGroups(scored, ep);
  const winners=groups.map(group=>{
    return scored
      .filter(s=>group.includes(s.queenId))
      .sort((a,b)=>b.score-a.score)[0]||null;
  }).filter(Boolean);

  if(winners.length<2){
    scored.forEach(s=>{ if(!winners.find(w=>w.queenId===s.queenId))winners.push(s); });
  }

  return winners
    .filter((s,idx,arr)=>arr.findIndex(x=>x.queenId===s.queenId)===idx)
    .slice(0,2)
    .sort((a,b)=>b.score-a.score);
}

function applySnatchGameOfLoveLegacyPlacements(scored, ep){
  scored.forEach(s=>s.placement='SAFE');
  const winners=snatchGameOfLoveGroupWinners(scored, ep);
  const winnerIds=new Set(winners.map(s=>s.queenId));
  winners.forEach(s=>s.placement='WIN');

  const bottomCount=Math.min(3, Math.max(0, scored.length-winnerIds.size));
  const bottom=scored.filter(s=>!winnerIds.has(s.queenId)).slice(-bottomCount);
  bottom.forEach(s=>s.placement='BTM');

  const high=scored.find(s=>!winnerIds.has(s.queenId) && s.placement==='SAFE');
  if(high)high.placement='HIGH';

  ep.top2Queens=winners.map(s=>s.queenId);
  ep.bottomQueens=bottom.map(s=>s.queenId);
  ep.legacyVotes={};
  ep.top2Queens.forEach(id=>{ep.legacyVotes[id]=chooseLipstick(id, ep.bottomQueens);});
}

function applySnatchGameOfLoveAssassinPlacements(scored, ep){
  scored.forEach(s=>s.placement='SAFE');
  const winners=snatchGameOfLoveGroupWinners(scored, ep);
  const top=winners[0]||scored[0];
  const high=winners.find(s=>s.queenId!==top?.queenId)||scored.find(s=>s.queenId!==top?.queenId);
  const protectedIds=new Set([top?.queenId, high?.queenId].filter(Boolean));

  if(top)top.placement='WIN';
  if(high)high.placement='HIGH';

  const bottomCount=Math.min(3, Math.max(0, scored.length-protectedIds.size));
  const bottom=scored.filter(s=>!protectedIds.has(s.queenId)).slice(-bottomCount);
  bottom.forEach(s=>s.placement='BTM');

  ep.topQueenId=top?.queenId||null;
  ep.snatchGameOfLoveTop2=winners.map(s=>s.queenId);
  ep.bottomQueens=bottom.map(s=>s.queenId);
  ep.assassinTopVote=ep.topQueenId?chooseLipstick(ep.topQueenId, ep.bottomQueens):null;
  ep.assassinGroupVotes={};
  const activeVoterIds=new Set(scored.map(s=>s.queenId));
  scored.forEach(s=>{
    if(s.queenId!==ep.topQueenId && activeVoterIds.has(s.queenId))ep.assassinGroupVotes[s.queenId]=chooseAssassinVote(s.queenId, ep.bottomQueens);
  });
  ep.lipSyncAssassin=typeof createLipSyncAssassin==='function'?createLipSyncAssassin():{id:'lip_sync_assassin',name:'Lip Sync Assassin',isAssassin:true,attributes:{lipSync:rand(8,9),cunt:rand(5,9)},statistics:{},publicScores:{production:20},momentum:0,inventory:{reveals:1}};
}


function applyTournamentPlacements(scored, ep){
  // Bracket episodes do not have safe queens or bottoms. The Top 2 win the challenge;
  // everyone else receives positive critiques and remains eligible for the point vote.
  scored.forEach(s=>s.placement='SAFE');
  if(scored[0])scored[0].placement='WIN';
  if(scored[1])scored[1].placement='WIN';
  if(scored[2])scored[2].placement='HIGH';
  ep.top2Queens=scored.slice(0,2).map(s=>s.queenId);
  ep.bottomQueens=[];
  ep.tournamentVotes={};
  const topSet=new Set(ep.top2Queens);
  scored.forEach(s=>{
    if(topSet.has(s.queenId))return;
    if(s.queenId===gameState.playerQueenId && (ep.participantIds||[]).includes(gameState.playerQueenId)){
      ep.playerTournamentPointVoteChosen=false;
      return;
    }
    ep.tournamentVotes[s.queenId]=chooseTournamentPointVote(s.queenId, scored, ep.top2Queens);
  });
  if(typeof recomputeTournamentVotes==='function')recomputeTournamentVotes(ep);
}

function applyLegacyPlacements(scored, ep){
  scored.forEach(s=>s.placement='SAFE');
  if(scored[0])scored[0].placement='WIN';
  if(scored[1])scored[1].placement='WIN';
  const bottomCount=Math.min(3, Math.max(0, scored.length-2));
  scored.slice(-bottomCount).forEach(s=>s.placement='BTM');
  if(scored[2] && scored[2].placement==='SAFE')scored[2].placement='HIGH';
  ep.top2Queens=scored.slice(0,2).map(s=>s.queenId);
  ep.bottomQueens=scored.slice(-bottomCount).map(s=>s.queenId);
  ep.legacyVotes={};
  ep.top2Queens.forEach(id=>{ep.legacyVotes[id]=chooseLipstick(id, ep.bottomQueens);});
}

function applyAssassinPlacements(scored, ep){
  scored.forEach(s=>s.placement='SAFE');
  if(scored[0])scored[0].placement='WIN';
  if(scored[1])scored[1].placement='HIGH';
  const bottomCount=Math.min(3, Math.max(0, scored.length-1));
  scored.slice(-bottomCount).forEach(s=>s.placement='BTM');
  ep.topQueenId=scored[0]?.queenId||null;
  ep.bottomQueens=scored.slice(-bottomCount).map(s=>s.queenId);
  ep.assassinTopVote=ep.topQueenId?chooseLipstick(ep.topQueenId, ep.bottomQueens):null;
  ep.assassinGroupVotes={};
  const activeVoterIds=new Set(scored.map(s=>s.queenId));
  scored.forEach(s=>{
    if(s.queenId!==ep.topQueenId && activeVoterIds.has(s.queenId))ep.assassinGroupVotes[s.queenId]=chooseAssassinVote(s.queenId, ep.bottomQueens);
  });
  ep.lipSyncAssassin=typeof createLipSyncAssassin==='function'?createLipSyncAssassin():{id:'lip_sync_assassin',name:'Lip Sync Assassin',isAssassin:true,attributes:{lipSync:8,cunt:8},statistics:{},publicScores:{production:20},momentum:0,inventory:{reveals:1}};
}

function applyHighQueenWinnerReaction(ep){
  if(!ep || ep.highWinnerReactionDone)return;
  const winner=ep.placements?.find(p=>p.placement==='WIN');
  if(!winner)return;
  const notes=[];
  (ep.placements||[]).filter(p=>p.placement==='HIGH').forEach(high=>{
    if(high.queenId===winner.queenId)return;
    const roll=Math.random();
    if(roll<0.40){
      changeRelationship(high.queenId,winner.queenId,-8,-2);
      notes.push(`${high.name} smiles through ${winner.name}'s win, but the edge is there.`);
    }else if(roll<0.70){
      changeRelationship(high.queenId,winner.queenId,-18,-6);
      notes.push(`${high.name} takes ${winner.name}'s win personally after being so close.`);
    }
  });
  ep.highWinnerReactionDone=true;
  if(notes.length){
    ep.relationshipDriftNotes=Array.isArray(ep.relationshipDriftNotes)?ep.relationshipDriftNotes:[];
    ep.relationshipDriftNotes.push(...notes);
  }
}

function maybeApplyTripleBottomLipSync(ep,scored){
  if(!ep || getSeasonFormat()!=='regular')return false;
  if(['premiere_no_elim','lalaparuza','tournament_bracket'].includes(ep.special))return false;
  const activeCount=gameState.queens.filter(q=>!q.isEliminated && (!ep.participantIds || ep.participantIds.includes(q.id))).length;
  if(activeCount<6 || gameState.season?.tripleBottomLipSyncUsed)return false;
  if(Math.random()>=0.02)return false;
  const bottomThree=[...scored].sort((a,b)=>a.score-b.score).slice(0,3);
  if(bottomThree.length<3)return false;
  bottomThree.forEach(s=>s.placement='BTM');
  ep.tripleBottomLipSync=true;
  gameState.season.tripleBottomLipSyncUsed=true;
  ep.rupaulAnnouncement='RuPaul announces a Triple Bottom Lip Sync.';
  return true;
}
function rollEventLuck(baseScore){
  const roll = Math.floor(Math.random() * 20) + 1;

  let finalScore = baseScore;
  let label = 'Normal';

  if (roll === 1) {
    label = 'Critical Failure';
    finalScore = baseScore >= 0
      ? baseScore * 0.5
      : baseScore * 2;
  } else if (roll === 20) {
    label = 'Critical Success';
    finalScore = baseScore >= 0
      ? baseScore * 2
      : baseScore * 0.5;
  } else if (roll <= 5) {
    label = 'Bad Luck';
    finalScore = baseScore >= 0
      ? baseScore * 0.75
      : baseScore * 1.5;
  } else if (roll >= 16) {
    label = 'Good Luck';
    finalScore = baseScore >= 0
      ? baseScore * 1.4
      : baseScore * 0.75;
  }

  return {
    roll,
    label,
    baseScore,
    finalScore: Math.round(finalScore * 10) / 10
  };
}
function getLuckLabel(roll){
  if (roll === 1) return "Total flop!";
  if (roll <= 5) return "Meh";
  if (roll <= 15) return "Safe play";
  if (roll <= 19) return "Serving";
  return "Gag Worthy!";
}

function getRunwayEventBank(){
  const events=gameState.data?.events || window.GAME_DATA?.events || [];
  return Array.isArray(events) ? events.filter(e=>e && e.type==='runway' && e.text) : [];
}
function ensureRunwayEventForQueen(ep,q){
  if(!ep || !q)return null;
  if(!ep.runwayEvents)ep.runwayEvents={};
  if(!ep.runwayEvents[q.id]){
    const bank=getRunwayEventBank();
    const event=sample(bank);
    ep.runwayEvents[q.id]=event ? {
      id:event.id || `runway_event_${q.id}`,
      type:'runway',
      text:event.text,
      score:Number(event.score)||0
    } : null;
  }
  return ep.runwayEvents[q.id];
}
function runwayEventScore(ep,q){
  const event=ensureRunwayEventForQueen(ep,q);
  return event ? Number(event.score)||0 : 0;
}function getJudgingEventBank(ep){
  const events = gameState.data?.events || window.GAME_DATA?.events || [];
  if (!Array.isArray(events)) return [];

  const rotatingJudge = (ep?.number || 0) % 2 === 0
    ? "Ross"
    : "Carson";

  return events.filter(e =>
    e &&
    e.type === "judging" &&
    e.text &&
    (
      !e.judge ||           // Michelle, RuPaul e Guest (sem campo judge)
      e.judge === rotatingJudge
    )
  );
}
function ensureJudgingEventForQueen(ep,q){
  if(!ep || !q)return null;
  if(!ep.judgingEvents)ep.judgingEvents={};
  if(!ep.judgingEvents[q.id]){
    const bank=getJudgingEventBank();
    const event=sample(bank);
    ep.judgingEvents[q.id]=event ? {
      id:event.id || `judging_event_${q.id}`,
      type:'judging',
      text:event.text,
      score:Number(event.score)||0
    } : null;
  }
  return ep.judgingEvents[q.id];
}
function judgingEventScore(ep,q){
  const event=ensureJudgingEventForQueen(ep,q);
  return event ? Number(event.score)||0 : 0;
}
function calculateEpisodeResults(playerChoices={}){
  const ep=gameState.currentEpisode;
  ensureAllQueenV14Stats();
  simulateNpcEpisodeChoices();
  const challenge=challengeDefinitionForEpisode(ep);
  const active=gameState.queens.filter(q=>!q.isEliminated && (!ep.participantIds || ep.participantIds.includes(q.id)));
  const seasonFormat=getSeasonFormat();
  if(!ep.runwayRolls) ep.runwayRolls={};
  if(!ep.eventLuckRolls) ep.eventLuckRolls={};
  if(!ep.eventRolls) ep.eventRolls={};
  const scored=active.map(q=>{
    const qEffects=currentQueenEffects(q);
    const risk=q.id===gameState.playerQueenId?playerChoices.risk:(qEffects.risk||chooseAIRisk(q));
    const effectiveChallengeWeights=challengeWeightsForQueen(challenge,ep,q);
    const base=weightedAttributeScore(q.attributes,effectiveChallengeWeights);
    const ballRunway=ensureBallRunwayScores(ep,q);
    if(ballRunway){
      ep.runwayRolls[q.id]=ballRunway.composite;
    }else if(ep.runwayRolls[q.id]===undefined) ep.runwayRolls[q.id]=rand(-5.5,5.5);
    const runwayEvent=ensureRunwayEventForQueen(ep,q);
    const runwayEventBonus=Number(runwayEvent?.score)||0;
    const judgingEvent=ensureJudgingEventForQueen(ep,q);
    const judgingEventBonus=Number(judgingEvent?.score)||0;
    const runway=ballRunway ? ballRunway.composite+runwayEventBonus : q.attributes.runway*3+ep.runwayRolls[q.id]+runwayEventBonus;
    const tootBootScore=ballRunway ? (ballRunway.scores[ballRunway.scores.length-1]+runwayEventBonus) : (ep.challengeType==='design' ? designTootBootScore(q,runway) : runway);
    const production=clamp((q.publicScores.production/8) * ((q.statistics?.wins||0)>=4 ? 0.5 : 1),-2,2);
    const momentum=q.momentum||0;
    const episodeForm=episodeFormModifier(q,ep);
    const fatigue=winStreakFatigue(q);
    const legacyPressure=legacyAllStarsPressure(q,ep);
    const allWinnersBalance=allWinnersSpotlightBalanceModifier(q,ep);
    const vulnerabilityPressure=vulnerabilityPressureModifier(q,ep);
    const frontrunnerVolatility=frontrunnerVolatilityModifier(q,ep);
    const riskBonus=riskRoll(risk);
    const miniBonus=q.id===ep.miniWinnerId?3:0;
    let eventBonus = 0;
let eventLuck = null;

if (q.id === gameState.playerQueenId) {
  if (!ep.eventLuckRoll) {
    ep.eventLuckRoll = rollEventLuck(ep.event?.score || 0);
  }

  eventLuck = ep.eventLuckRoll;
  eventBonus = eventLuck.finalScore;
} else {
  if (ep.eventLuckRolls[q.id] === undefined) {
    ep.eventLuckRolls[q.id] = rollEventLuck(rand(-1.25, 1.25));
  }

  eventLuck = ep.eventLuckRolls[q.id];
  eventBonus = eventLuck.finalScore;
}
    const playerEffects=(q.id===gameState.playerQueenId && ep.playerEffects)?ep.playerEffects:{};
let energyStressMod=queenEnergyStressMod(q);

if (q.id === gameState.playerQueenId) {
  energyStressMod = Math.min(energyStressMod, 1.5);
}
    const effectSource=q.id===gameState.playerQueenId?playerEffects:qEffects;
    // Player/NPC choices are deliberate episode decisions, so runway choice effects
    // should be felt directly. The runway attribute itself is still weighted by the
    // challenge's runwayWeight below, but choices like "Prioritize the runway" or
    // runway presentation moments are no longer diluted by that multiplier.
const choiceMultiplier =
  q.id === gameState.playerQueenId ? 1.45 : 1.60;

const choiceBonus =
  Math.round(
    (((effectSource.performance || 0) +
      (effectSource.runway || 0)) * choiceMultiplier) * 10
  ) / 10;
    const teamBonus=(ep.judgingMode==='team' && typeof teamAffinityBonus==='function')?teamAffinityBonus(q.id,ep):0;
    const challengeCore=ballRunway ? runway : base+runway*challenge.runwayWeight;
const attrTotal = Object.values(q.attributes || {}).reduce((sum, v) => sum + (Number(v) || 0), 0);

let maxBuildPenalty = 0;
if (q.id === gameState.playerQueenId) {
  if (attrTotal >= 45) maxBuildPenalty = -4.0;
  else if (attrTotal >= 44) maxBuildPenalty = -3;
  else if (attrTotal >= 42) maxBuildPenalty = -2;
  else if (attrTotal >= 40) maxBuildPenalty = -1;
}

const individualScore=challengeCore+production+momentum+episodeForm.score+fatigue+legacyPressure+allWinnersBalance+vulnerabilityPressure+frontrunnerVolatility+riskBonus+miniBonus+eventBonus+judgingEventBonus+choiceBonus+energyStressMod+maxBuildPenalty;    const winThrottlePenalty=getWinThrottlePenalty(q);
    const total=individualScore+teamBonus+winThrottlePenalty;
    const team=typeof getTeamForQueen==='function'?getTeamForQueen(q.id,ep):null;
    return {queenId:q.id,name:q.name,risk,riskLabel:RISK_LABEL[risk],score:Math.round(total*10)/10,individualScore:Math.round(individualScore*10)/10,base:Math.round((ballRunway?runway:base)*10)/10,runway:Math.round(runway*10)/10,tootBootScore:Math.round(tootBootScore*10)/10,ballRunwayScores:ballRunway?.scores||null,ballRunwayWeights:ballRunway?.weights||null,talentType:ep.challengeType==='talent'?talentTypeForQueenInEpisode(ep,q):null,talentWeights:ep.challengeType==='talent'?effectiveChallengeWeights:null,production:Math.round(production*10)/10,momentum,episodeForm:episodeForm.score,episodeFormLabel:episodeForm.label,fatigue,legacyPressure,allWinnersBalance,vulnerabilityPressure,frontrunnerVolatility,riskBonus:Math.round(riskBonus*10)/10,eventBonus,eventLuck,runwayEventBonus:Math.round(runwayEventBonus*10)/10,runwayEvent,judgingEventBonus:Math.round(judgingEventBonus*10)/10,judgingEvent,choiceBonus:Math.round(choiceBonus*10)/10,energyStressMod,maxBuildPenalty,teamBonus,winThrottlePenalty,teamId:team?.id||null,teamName:team?.name||'',placement:'SAFE'};
  }).sort((a,b)=>b.score-a.score);
  if(ep.challengeType==='public')applyPublicChallengePlacements(scored,ep,seasonFormat);
  else if(ep.challengeType==='fashion_wars')assignFashionWarsPlacements(scored,ep);
  else if(ep.teams?.length && ep.judgingMode==='team')assignTeamPlacements(scored,ep);
  else {ep.teamScores=[]; assignIndividualPlacements(scored);}

  const useSnatchGameOfLove=isSnatchGameOfLoveEpisode(ep);
  if(ep.challengeType!=='public' && seasonFormat==='legacy' && !['premiere_no_elim','lalaparuza'].includes(ep.special)){
    if(useSnatchGameOfLove) applySnatchGameOfLoveLegacyPlacements(scored, ep);
    else applyLegacyPlacements(scored, ep);
  }
  if(ep.challengeType!=='public' && seasonFormat==='assassin' && !['premiere_no_elim','lalaparuza'].includes(ep.special)){
    if(useSnatchGameOfLove) applySnatchGameOfLoveAssassinPlacements(scored, ep);
    else applyAssassinPlacements(scored, ep);
  }
  if(isTournamentFormat(seasonFormat) && ep.special==='tournament_bracket'){
    applyTournamentPlacements(scored, ep);
  }

  if(ep.challengeType!=='public' && seasonFormat==='all_winners'){
    applyAllWinnersSpotlightSwaps(scored, ep);
    const allWinnersRows=pickAllWinnersPlacementRows(scored, ep);
    scored.forEach(s=>s.placement='SAFE');
    allWinnersRows.top2.forEach(s=>s.placement='TOP2');
    allWinnersRows.high.forEach(s=>{ if(s.placement==='SAFE')s.placement='HIGH'; });
    ep.top2Queens=allWinnersRows.top2.map(s=>s.queenId);
    ep.topQueenId=ep.top2Queens[0]||null;
    ep.bottomQueens=[];
    if(ep.passiveWorkroom && ep.top2Queens.includes(gameState.playerQueenId))ep.allWinnersPassiveTop2Fallback=true;
  }


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
  if(!['premiere_no_elim','tournament_bracket'].includes(ep.special) && !['legacy','assassin','all_winners'].includes(getSeasonFormat())){
    // Do not run individual win/high balancing on team-judged episodes, because it
    // can split a judged group after assignTeamPlacements() has made the team result.
    if(ep.judgingMode==='team'){
      applyPassiveWinCap(scored,ep);
    }else{
      applyPassiveWinCap(scored,ep);
      applyWinThrottles(scored,ep);
      softenFrontrunnerHighsToSafe(scored,ep);
    }
  }
  scored.sort((a,b)=>{
    const order={WIN:0,TOP2:0,HIGH:1,CRITIQUE:2,SAFE:3,LOW:4,BTM:5};
    if(order[a.placement]!==order[b.placement])return order[a.placement]-order[b.placement];
    return b.score-a.score;
  });
  scored.forEach((s,i)=>{
    const success=s.score>=scored[Math.floor(scored.length/2)].score;
    const isPlayer=s.queenId===gameState.playerQueenId;
    const pe=isPlayer?(ep.playerEffects||{}):(ep.queenEffects?.[s.queenId]||{});
    const cleanText=s.vulnerabilityPressure?` • Vulnerability ${s.vulnerabilityPressure}`:'';
    const frontrunnerText=s.frontrunnerVolatility?` • Frontrunner volatility ${s.frontrunnerVolatility}`:'';
    const extra=` • Choices ${((pe.performance||0)+(pe.runway||0))>=0?'+':''}${(pe.performance||0)+(pe.runway||0)} • Energy/Stress ${s.energyStressMod>=0?'+':''}${s.energyStressMod}${cleanText}${frontrunnerText}`;
    const teamText=ep.teams?.length?(ep.judgingMode==='team'?` • Team ${s.teamName||'team'} ${s.teamBonus>=0?'+':''}${s.teamBonus}`:' • Judged individually'):'';
    const winThrottleText=s.winThrottlePenalty?` • Judges' expectations ${s.winThrottlePenalty}`:'';
    const formText=s.episodeForm?` • ${s.episodeFormLabel||'Episode form'} ${s.episodeForm>=0?'+':''}${s.episodeForm}`:'';
    const fatigueText=s.fatigue?` • Fatigue ${s.fatigue}`:'';
    const legacyPressureText=s.legacyPressure?` • All Stars pressure ${s.legacyPressure}`:'';
    const allWinnersBalanceText=s.allWinnersBalance?` • Spotlight balance ${s.allWinnersBalance}`:'';
    s.internalReading=`Base ${s.base} • Runway ${s.runway} • Risk ${s.riskBonus>=0?'+':''}${s.riskBonus} • Production ${s.production>=0?'+':''}${s.production} • Momentum ${s.momentum>=0?'+':''}${s.momentum}${formText}${fatigueText}${legacyPressureText}${allWinnersBalanceText}${s.judgingEventBonus?` • Judging event ${s.judgingEventBonus>=0?'+':''}${s.judgingEventBonus}`:''}${extra}${teamText}${winThrottleText}`;
    const finalStretchPraise=isLastCompetitiveEpisodeBeforeFinale(ep);
    const tournamentPraise=ep.special==='tournament_bracket';
    s.critique=(finalStretchPraise||tournamentPraise)?getFinalStretchPositiveCritique(s,ep):getCritiqueText(s.placement,ep.challengeType,s.risk,success);
    if(ep.judgingMode==='team' && s.teamName){
      const teamScore=ep.teamScores?.find(t=>t.teamId===s.teamId);
      if(finalStretchPraise){
        s.critique=`${s.teamName} gets a final stretch spotlight, and ${s.name} receives praise for what she brought to the group. ${s.critique}`;
        if(teamScore?.chemistry>0)s.critique+=` The chemistry helped the performance feel tighter.`;
      }else{
        if(s.placement==='WIN' || s.placement==='HIGH')s.critique=`${s.teamName} worked as a unit, and ${s.name} helped make the group stand out. ${s.critique}`;
        if(s.placement==='LOW' || s.placement==='BTM')s.critique=`${s.teamName} struggled to connect as a group, and ${s.name} could not escape that energy. ${s.critique}`;
        if(teamScore?.chemistry>0)s.critique+=` The chemistry helped the performance feel tighter.`;
        if(teamScore?.chemistry<0)s.critique+=` The lack of chemistry showed.`;
      }
    }
    if(!finalStretchPraise && s.winThrottlePenalty<=-0.5 && (s.placement==='WIN' || s.placement==='HIGH')){
      s.critique = `${s.critique} At this point, the judges know what she can do, so the bar is higher.`.trim();
    }
    if(!finalStretchPraise && s.winThrottled){
      s.critique = `${s.critique} The judges still see the excellence, but this week the win slipped toward a fresher storyline.`.trim();
    }
    if(s.promotedByWinThrottle){
      s.critique = `${s.critique} Tonight, the panel was ready to spread the spotlight, and ${s.name} seized the opening.`.trim();
    }
    if(!finalStretchPraise && isPlayer && ep.passiveWorkroom && s.placement!=='SAFE'){
      s.critique = `${s.critique} ${getPassiveWorkroomCritique(s.placement, s.name)}`.trim();
    }
  });
  ep.placements=scored;
  applyHighQueenWinnerReaction(ep);
  const tripleBottom=maybeApplyTripleBottomLipSync(ep,scored);
  if(getSeasonFormat()==='all_winners')ep.bottomQueens=[];
  else if(ep.special==='tournament_bracket')ep.bottomQueens=[];
  else ep.bottomQueens=scored.filter(s=>s.placement==='BTM').slice(0,(tripleBottom||ep.tripleBottomLipSync)?3:((['legacy','assassin'].includes(getSeasonFormat()))?3:2)).map(s=>s.queenId);
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


function applyLegacyLipstickRelationshipPenalty(winnerId, eliminatedQueenId, ep){
  if(!ep || ep.legacyLipstickRelationshipPenaltyApplied || !gameState.relationships)return [];
  const top2Ids=ep.top2Queens||[];
  const votes=ep.legacyVotes||{};
  const changes=[];

  top2Ids.forEach(voterId=>{
    const chosenId=votes[voterId];
    if(!voterId || !chosenId || voterId===chosenId)return;

    // If the chosen lipstick is the actual eliminated queen, the relationship change
    // no longer matters in the active season. Only saved lipstick targets carry the
    // social consequence forward.
    if(chosenId===eliminatedQueenId)return;

    const voter=gameState.queens.find(q=>q.id===voterId && !q.isEliminated);
    const chosen=gameState.queens.find(q=>q.id===chosenId && !q.isEliminated);
    if(!voter || !chosen)return;

    const isLipSyncWinner=voterId===winnerId;
    const affinityLoss=isLipSyncWinner ? -20 : -14;
    const respectLoss=isLipSyncWinner ? -4 : -2;

    if(typeof changeRelationship==='function'){
      changeRelationship(voterId,chosenId,affinityLoss,respectLoss);
      // The saved queen also remembers that her name was written down, but this is
      // lighter than the Top 2's own loss of trust toward her.
      changeRelationship(chosenId,voterId,Math.round(affinityLoss*0.65),Math.round(respectLoss*0.5));
    }

    changes.push({voterId,chosenId,affinity:affinityLoss,respect:respectLoss});
  });

  ep.legacyLipstickRelationshipPenaltyApplied=true;
  ep.legacyLipstickRelationshipPenalties=changes;
  return changes;
}


function applyAssassinVoteRelationshipPenalty(topQueenId, eliminatedQueenId, ep){
  if(!ep || ep.assassinVoteRelationshipPenaltyApplied || !gameState.relationships)return [];
  const changes=[];
  const votes=Object.assign({}, ep.assassinGroupVotes||{});
  if(ep.topQueenId && ep.assassinTopVote)votes[ep.topQueenId]=ep.assassinTopVote;
  Object.entries(votes).forEach(([voterId,chosenId])=>{
    if(!voterId || !chosenId || voterId===chosenId || chosenId===eliminatedQueenId)return;
    const voter=gameState.queens.find(q=>q.id===voterId && !q.isEliminated);
    const chosen=gameState.queens.find(q=>q.id===chosenId && !q.isEliminated);
    if(!voter || !chosen)return;
    const isTop=voterId===ep.topQueenId;
    const affinityLoss=isTop?-16:-7;
    const respectLoss=isTop?-3:-1;
    if(typeof changeRelationship==='function'){
      changeRelationship(voterId,chosenId,affinityLoss,respectLoss);
      changeRelationship(chosenId,voterId,Math.round(affinityLoss*0.55),Math.round(respectLoss*0.5));
    }
    changes.push({voterId,chosenId,affinity:affinityLoss,respect:respectLoss});
  });
  ep.assassinVoteRelationshipPenaltyApplied=true;
  ep.assassinVoteRelationshipPenalties=changes;
  return changes;
}

function resolveLipSync(playerMoves=null, options={}){
  const ep=gameState.currentEpisode;
  const song=ep.song;
  const format=getSeasonFormat();
  const isAssassinEpisode=format==='assassin' && !['premiere_no_elim','lalaparuza'].includes(ep.special);
  const isTournamentEpisode=isTournamentFormat(format) && ep.special==='tournament_bracket';
  const duelIds=(format==='all_winners')
    ? (ep.top2Queens||[])
    : (((format==='legacy' && !['premiere_no_elim','lalaparuza'].includes(ep.special)) || isTournamentEpisode)
      ? (ep.top2Queens||[])
      : (isAssassinEpisode ? [ep.topQueenId,'lip_sync_assassin'] : (ep.special==='premiere_no_elim' ? (ep.top2Queens||[]) : ep.bottomQueens)));
  const bottom=duelIds
    .map(id=>id==='lip_sync_assassin' ? (ep.lipSyncAssassin||createLipSyncAssassin()) : gameState.queens.find(q=>q.id===id))
    .filter(Boolean);
  if(isAssassinEpisode && !ep.lipSyncAssassin)ep.lipSyncAssassin=bottom.find(q=>q.isAssassin)||createLipSyncAssassin();
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
const priorLipSyncs =
  (q.statistics.lipSyncWins || 0) +
  (q.statistics.lipSyncLosses || 0);

const penaltyTable = [
  0,
  0.20,
  0.55,
  1.05,
  1.70,
  2.40
];

let priorLipSyncPenalty =
  penaltyTable[Math.min(priorLipSyncs, penaltyTable.length - 1)];

const lip = q.attributes.lipSync;

if (lip >= 9)
    priorLipSyncPenalty *= 1.15;

if (lip <= 5)
    priorLipSyncPenalty *= 0.90;
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

  if(format==='all_winners'){
    const winner=results[0], loser=results[1];
    ep.placements.forEach(p=>{
      if((ep.top2Queens||[]).includes(p.queenId)){
        p.placement=(p.queenId===winner.queenId?'WIN':'TOP2');
        p.lipSyncWinner=(p.queenId===winner.queenId);
      }
    });
    ep.lipSyncResult={song,results,outcome:'allWinnersTopAllStar',survivorId:winner.queenId,top2LoserId:loser?.queenId||null,eliminatedQueenId:null,eliminatedQueenIds:[],blockedQueenId:null,difference:Math.round(Math.abs(results[0].score10-results[1].score10)*10)/10};
    if(typeof processAllWinnersGiftStars==='function'){
      processAllWinnersGiftStars(ep, ep.lipSyncResult);
    }else{
      const shouldDeferPlayerBlock=!!options.deferAllWinnersPlayerBlock && winner.queenId===gameState.playerQueenId && !ep.playerAllWinnersBlockChosen;
      const blockedId=shouldDeferPlayerBlock ? null : (typeof chooseAllWinnersBlockTarget==='function'?chooseAllWinnersBlockTarget(winner.queenId, ep.top2Queens||[]):null);
      if(blockedId && typeof applyAllWinnersBlock==='function')applyAllWinnersBlock(winner.queenId, blockedId, ep);
      ep.waitingForAllWinnersBlockChoice=!!shouldDeferPlayerBlock;
      ep.lipSyncResult.blockedQueenId=blockedId;
    }
    recordIconicLipSync(ep, ep.lipSyncResult);
    ep.eliminatedQueenId=null;
    saveGame();
    return ep.lipSyncResult;
  }

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

  if(isTournamentEpisode){
    const winner=results[0], loser=results[1];
    ep.placements.forEach(p=>{
      if((ep.top2Queens||[]).includes(p.queenId)){p.placement='WIN'; p.lipSyncWinner=(p.queenId===winner.queenId);}
    });
    ep.lipSyncResult={song,results,outcome:'tournamentPoints',survivorId:winner.queenId,top2LoserId:loser?.queenId||null,eliminatedQueenId:null,eliminatedQueenIds:[],difference:Math.round(Math.abs(results[0].score10-results[1].score10)*10)/10,tournamentVotes:ep.tournamentVotes||{},tournamentVoteTally:ep.tournamentVoteTally||{},tournamentVotedPointQueenIds:ep.tournamentVotedPointQueenIds||[],tournamentVotedPointQueenId:null};
    recordIconicLipSync(ep, ep.lipSyncResult);
    ep.eliminatedQueenId=null;
    saveGame();
    return ep.lipSyncResult;
  }

  if(getSeasonFormat()==='legacy' && !['premiere_no_elim','lalaparuza'].includes(ep.special)){
    const winner=results[0], loser=results[1];
    const bottomIds=ep.bottomQueens||[];
    const votes={};
    (ep.legacyVotes?Object.values(ep.legacyVotes):[]).forEach(id=>{if(id)votes[id]=(votes[id]||0)+1;});
    const winnerLipstick=ep.legacyVotes?.[winner.queenId];
    const eliminatedQueenId=(winnerLipstick && bottomIds.includes(winnerLipstick)) ? winnerLipstick : (bottomIds[0] || loser?.queenId);
    ep.placements.forEach(p=>{
      if((ep.top2Queens||[]).includes(p.queenId)){p.placement='WIN'; p.lipSyncWinner=(p.queenId===winner.queenId);}
      if(p.queenId===eliminatedQueenId)p.legacyEliminated=true;
    });
    ep.lipSyncResult={song,results,outcome:'legacyElimination',survivorId:winner.queenId,top2LoserId:loser?.queenId||null,eliminatedQueenId,eliminatedQueenIds:[eliminatedQueenId],difference:Math.round(Math.abs(results[0].score10-results[1].score10)*10)/10,legacyVotes:ep.legacyVotes||{},groupVotes:votes};
    recordIconicLipSync(ep, ep.lipSyncResult);
    ep.eliminatedQueenId=eliminatedQueenId;
    saveGame();
    return ep.lipSyncResult;
  }


  if(isAssassinEpisode){
    const winner=results[0], loser=results[1];
    const topWon=winner.queenId===ep.topQueenId;
    const bottomIds=ep.bottomQueens||[];
    const groupVotes=ep.assassinGroupVotes||{};
    const groupTally=tallyVotes(groupVotes);
    const groupEntries=Object.entries(groupTally).filter(([id])=>bottomIds.includes(id));
    const maxGroupVotes=groupEntries.length?Math.max(...groupEntries.map(([,v])=>v)):0;
    const groupTieIds=groupEntries.filter(([,v])=>v===maxGroupVotes).map(([id])=>id);
    const hasGroupTie=groupTieIds.length>1;
    const topChoice=(ep.assassinTopVote && bottomIds.includes(ep.assassinTopVote)) ? ep.assassinTopVote : (bottomIds[0]||null);
    const groupChoice=hasGroupTie ? null : (groupTieIds[0] || bottomIds[0] || null);
    const eliminatedQueenId=topWon ? topChoice : (hasGroupTie ? topChoice : groupChoice);
    ep.placements.forEach(p=>{
      if(p.queenId===ep.topQueenId){p.placement='WIN'; p.lipSyncWinner=topWon;}
      if(p.queenId===eliminatedQueenId)p.legacyEliminated=true;
    });
    ep.lipSyncResult={song,results,outcome:'assassinElimination',survivorId:winner.queenId,topQueenId:ep.topQueenId,assassinId:'lip_sync_assassin',assassinWon:!topWon,eliminatedQueenId,eliminatedQueenIds:[eliminatedQueenId],difference:Math.round(Math.abs(results[0].score10-results[1].score10)*10)/10,topVote:topChoice,groupVotes:groupTally,rawGroupVotes:groupVotes,groupChoice,groupTieIds,groupTieResolvedByTop:(!topWon && hasGroupTie)};
    recordIconicLipSync(ep, ep.lipSyncResult);
    ep.eliminatedQueenId=eliminatedQueenId;
    saveGame();
    return ep.lipSyncResult;
  }

  const survivor=results[0], eliminated=results[results.length-1];
  const diff=Math.abs(results[0].score10-eliminated.score10);
  let outcome=results.length===3?'tripleBottom':'normal';
  let survivorId=survivor.queenId;
  let eliminatedQueenId=eliminated.queenId;
  let eliminatedQueenIds=[eliminated.queenId];
  if(results.length===3){
    const bottomTwo=results.slice(1);
    if(bottomTwo.every(r=>r.score10<6) && !gameState.season.doubleSashayUsed){
      outcome='tripleDoubleSashay';
      gameState.season.doubleSashayUsed=true;
      eliminatedQueenId=null;
      eliminatedQueenIds=bottomTwo.map(r=>r.queenId);
    }
  }

  if(results.length===2 && results[0].score10<6 && results[1].score10<6 && !gameState.season.doubleSashayUsed){
    outcome='doubleSashay';
    gameState.season.doubleSashayUsed=true;
    survivorId=null;
    eliminatedQueenId=null;
    eliminatedQueenIds=results.map(r=>r.queenId);
  } else if(results.length===2 && diff<0.8 && results[0].score10>=7.5 && results[1].score10>=7.5 && !gameState.season.doubleShantayUsed){
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

function placementTrendValue(placement){
  const key=String(placement||'').toUpperCase();
  const values={WIN:5,TOP2:5,HIGH:4,SAFE:3,LOW:2,BTM:1,ELIM:0};
  return values[key] ?? null;
}

function placementTrendMomentum(previousPlacement,currentPlacement){
  const current=placementTrendValue(currentPlacement);
  if(current===null)return 0;
  const previous=placementTrendValue(previousPlacement);
  if(previous===null){
    if(current>=5)return 1.25;
    if(current>=4)return 0.75;
    if(current<=1)return -1.25;
    if(current<=2)return -0.75;
    return 0;
  }
  const delta=current-previous;
  if(delta>=3)return 1.5;
  if(delta===2)return 1.15;
  if(delta===1)return 0.65;
  if(delta===0)return 0;
  if(delta===-1)return -0.65;
  if(delta===-2)return -1.15;
  return -1.5;
}

function applyPlacementTrendMomentum(q,currentPlacement){
  if(!q)return 0;
  const history=q.episodeHistory||[];
  const previousPlacement=history.length?history[history.length-1].placement:null;
  const trend=placementTrendMomentum(previousPlacement,currentPlacement);
  q.momentum=(typeof clamp==='function')?clamp(trend,-2,2):Math.max(-2,Math.min(2,trend));
  return q.momentum;
}

function applyEpisodeStats(){
  const ep=gameState.currentEpisode;
  if(ep.statsApplied)return;
  ensureAllQueenV14Stats();
  const placementEffects={
    WIN:{production:2.1,fans:2.65,confidence:10,stress:-8},
    HIGH:{fans:1.3,confidence:5,stress:-3},
    TOP2:{fans:1.3,confidence:5,stress:-3},
    SAFE:{stress:2},
    LOW:{confidence:-5,stress:8},
    BTM:{confidence:-8,stress:12,energy:-8}
  };
  const legacyWinEffect=p=>p.lipSyncWinner
    ? {production:1.1,fans:1.2,confidence:4,stress:3}
    : {production:1.1,fans:1.2,confidence:4,stress:3};
  for(const p of ep.placements){
    const q=gameState.queens.find(x=>x.id===p.queenId);
    if(!q)continue;
    q.statistics.episodesCompeted++;
    q.episodeHistory.push({episode:ep.number,challenge:ep.challengeName,placement:p.placement,score:p.score,lipSync:p.placement==='BTM' || !!p.lipSyncWinner,lipSyncWinner:!!p.lipSyncWinner});
    const isAllWinnersTop2=(typeof getSeasonFormat==='function' && getSeasonFormat()==='all_winners' && p.placement==='TOP2');
    if(p.placement==='WIN' || isAllWinnersTop2){
      q.statistics.wins++;
      if(typeof applyChallengeWinRelationshipPenalty==='function')applyChallengeWinRelationshipPenalty(q,ep);
      if(typeof applyHighQueensWinnerJealousy==='function')applyHighQueensWinnerJealousy(q,ep);
    }
    if(p.placement==='HIGH'||(p.placement==='TOP2' && !isAllWinnersTop2))q.statistics.highs++;
    if(p.placement==='SAFE')q.statistics.safes++;
    if(p.placement==='LOW')q.statistics.lows++;
    if(p.placement==='BTM')q.statistics.bottoms++;
    const trendMomentum=applyPlacementTrendMomentum(q,p.placement);
    const effects=((isLegacyCompetitiveEpisode(ep) && p.placement==='WIN') || isAllWinnersTop2) ? legacyWinEffect(p) : (placementEffects[p.placement]||{});
    applyChoiceEffects(effects,{queen:q,note:`Episode placement: ${p.placement}. Momentum now reflects week-to-week placement trend (${trendMomentum>=0?'+':''}${trendMomentum}).`,source:'episode-placement',save:false});
  }
  if(ep.lipSyncResult){
    if(ep.lipSyncResult.outcome==='tournamentPoints'){
      (ep.top2Queens||[]).forEach(id=>addTournamentPoints(id,2));
      if(ep.lipSyncResult.survivorId){
        addTournamentPoints(ep.lipSyncResult.survivorId,1);
        const win=gameState.queens.find(q=>q.id===ep.lipSyncResult.survivorId);
        if(win){win.statistics.lipSyncWins++; applyChoiceEffects({momentum:0.5,fans:0.8,production:0.4,stress:1},{queen:win,note:'Tournament lip sync win.',source:'lip-sync-result',save:false});}
      }
      Object.entries(ep.lipSyncResult.tournamentVoteTally || ep.tournamentVoteTally || {}).forEach(([queenId,count])=>addTournamentPoints(queenId, Number(count)||0));
      ep.eliminatedQueenId=null;
    } else if(ep.lipSyncResult.outcome==='legacyElimination'){
      const win=gameState.queens.find(q=>q.id===ep.lipSyncResult.survivorId);
      const out=gameState.queens.find(q=>q.id===ep.lipSyncResult.eliminatedQueenId);
      if(win){
        win.statistics.lipSyncWins++;
        applyChoiceEffects({momentum:0.5,fans:0.8,production:0.4,stress:2},{queen:win,note:'Legacy lip sync win.',source:'lip-sync-result',save:false});
        if(out && typeof applyLegacyLipstickRelationshipPenalty==='function')applyLegacyLipstickRelationshipPenalty(win.id,out.id,ep);
      }
      if(out){out.statistics.lipSyncLosses++; out.isEliminated=true; const last=out.episodeHistory[out.episodeHistory.length-1]; if(last)last.placement='ELIM'; if(!gameState.eliminatedQueens.some(q=>q.id===out.id))gameState.eliminatedQueens.push(out); ep.eliminatedQueenId=out.id;}
    } else if(ep.lipSyncResult.outcome==='assassinElimination'){
      const top=gameState.queens.find(q=>q.id===ep.lipSyncResult.topQueenId);
      const out=gameState.queens.find(q=>q.id===ep.lipSyncResult.eliminatedQueenId);
      if(top){
        if(!ep.lipSyncResult.assassinWon){top.statistics.lipSyncWins++; applyChoiceEffects({momentum:0.5,fans:0.8,production:0.4,stress:3},{queen:top,note:'Assassin lip sync win.',source:'lip-sync-result',save:false});}
        else {top.statistics.lipSyncLosses++; applyChoiceEffects({momentum:-0.5,stress:6},{queen:top,note:'Lost to the Lip Sync Assassin.',source:'lip-sync-result',save:false});}
        if(out && typeof applyAssassinVoteRelationshipPenalty==='function')applyAssassinVoteRelationshipPenalty(top.id,out.id,ep);
      }
      if(out){out.statistics.lipSyncLosses++; out.isEliminated=true; const last=out.episodeHistory[out.episodeHistory.length-1]; if(last)last.placement='ELIM'; if(!gameState.eliminatedQueens.some(q=>q.id===out.id))gameState.eliminatedQueens.push(out); ep.eliminatedQueenId=out.id;}

    } else if(ep.lipSyncResult.outcome==='allWinnersTopAllStar'){
      const win=gameState.queens.find(q=>q.id===ep.lipSyncResult.survivorId);
      const loser=gameState.queens.find(q=>q.id===ep.lipSyncResult.top2LoserId);
      if(win){ win.statistics.lipSyncWins++; applyChoiceEffects({momentum:1,fans:2,production:0.7},{queen:win,note:'Top All Star lip sync win.',source:'lip-sync-result',save:false}); }
      if(loser){ loser.statistics.lipSyncLosses++; }
      if(typeof applyAllWinnersStarsForEpisode==='function')applyAllWinnersStarsForEpisode(ep);
      ep.eliminatedQueenId=null;
    } else if(ep.lipSyncResult.outcome==='top2Win'){
      const win=gameState.queens.find(q=>q.id===ep.lipSyncResult.survivorId);
      if(win){ win.statistics.lipSyncWins++; applyChoiceEffects({momentum:1,fans:2,production:0.7},{queen:win,note:'Lip sync win.',source:'lip-sync-result',save:false}); }
      ep.eliminatedQueenId=null;
    } else if(ep.lipSyncResult.outcome==='doubleShantay'){
      ep.lipSyncResult.results.forEach(r=>{const q=gameState.queens.find(x=>x.id===r.queenId); if(q){q.statistics.lipSyncWins++; applyChoiceEffects({momentum:1,fans:2,production:0.7},{queen:q,note:'Double shantay lip sync survival.',source:'lip-sync-result',save:false});}});
    } else if(ep.lipSyncResult.outcome==='doubleSashay' || ep.lipSyncResult.outcome==='tripleDoubleSashay'){
      const win=gameState.queens.find(q=>q.id===ep.lipSyncResult.survivorId);
      if(win){win.statistics.lipSyncWins++; applyChoiceEffects({momentum:1,fans:2,production:0.7},{queen:win,note:'Lip sync survival.',source:'lip-sync-result',save:false});}
      ep.lipSyncResult.eliminatedQueenIds.forEach(id=>{const out=gameState.queens.find(q=>q.id===id); if(!out)return; out.statistics.lipSyncLosses++; out.isEliminated=true; const last=out.episodeHistory[out.episodeHistory.length-1]; if(last)last.placement='ELIM'; if(!gameState.eliminatedQueens.some(q=>q.id===out.id))gameState.eliminatedQueens.push(out);});
    } else {
      const win=gameState.queens.find(q=>q.id===ep.lipSyncResult.survivorId);
      const out=gameState.queens.find(q=>q.id===ep.lipSyncResult.eliminatedQueenId);
      if(win)win.statistics.lipSyncWins++;
      if(out){out.statistics.lipSyncLosses++; out.isEliminated=true; const last=out.episodeHistory[out.episodeHistory.length-1]; if(last)last.placement='ELIM'; if(!gameState.eliminatedQueens.some(q=>q.id===out.id))gameState.eliminatedQueens.push(out); ep.eliminatedQueenId=out.id;}
    }
  }
  if(typeof registerReturnTwistAfterElimination==='function')registerReturnTwistAfterElimination(ep);
  if(ep.special==='tournament_bracket' && typeof finishTournamentGroupIfNeeded==='function')finishTournamentGroupIfNeeded();
  if(typeof markPremierePhaseDone==='function')markPremierePhaseDone();
  ep.statsApplied=true;
  gameState.episodeHistory.push(JSON.parse(JSON.stringify(ep)));
  saveGame();
}
