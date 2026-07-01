function initializeRelationships(){gameState.relationships={}; for(const q of gameState.queens){gameState.relationships[q.id]={}; for(const o of gameState.queens){if(q.id===o.id)continue; const affinity=rand(-24,34); const respect=rand(-12,34); gameState.relationships[q.id][o.id]={affinity,respect,label:relationLabel(affinity,respect)};}}}
function changeRelationship(fromId,toId,da=0,dr=0){const rel=gameState.relationships?.[fromId]?.[toId]; if(!rel)return; rel.affinity=clamp(rel.affinity+da,-100,100); rel.respect=clamp(rel.respect+dr,-100,100); rel.label=relationLabel(rel.affinity,rel.respect);}
function playerRelationshipLabel(queenId){if(queenId===gameState.playerQueenId)return '✨'; const rel=gameState.relationships?.[queenId]?.[gameState.playerQueenId]; if(!rel)return '😐'; return relationshipEmojiFromScore(rel.affinity,rel.respect);}

function relationshipScoreToPlayer(queenId){
  if(queenId===gameState.playerQueenId)return {affinity:0,respect:0,label:'You'};
  const rel=gameState.relationships?.[queenId]?.[gameState.playerQueenId];
  if(!rel)return {affinity:0,respect:0,label:'😐'};
  return {affinity:rel.affinity,respect:rel.respect,label:relationshipEmojiFromScore(rel.affinity,rel.respect)};
}
function relationshipMood(queenId){
  if(queenId===gameState.playerQueenId)return 'You';
  const rel=relationshipScoreToPlayer(queenId);
  const avg=Math.round((rel.affinity+rel.respect)/2);
  const sign=avg>0?'+':'';
  return `${relationshipEmojiFromScore(rel.affinity,rel.respect)} (${sign}${avg})`;
}

function applyChallengeWinRelationshipPenalty(winner, ep){
  if(!winner || !ep || !gameState.relationships)return [];
  if(ep.winRelationshipPenalties?.some(x=>x.winnerId===winner.id))return [];
  const pool=(gameState.queens||[]).filter(q=>q && q.id!==winner.id && !q.isEliminated);
  const targets=shuffle(pool).slice(0,3);
  if(!targets.length)return [];
  ep.winRelationshipPenalties=ep.winRelationshipPenalties||[];
  const changes=targets.map(target=>{
    const affinityLoss=rand(-14,-8);
    const respectShift=rand(-3,1);
    changeRelationship(target.id,winner.id,affinityLoss,respectShift);
    return {winnerId:winner.id,targetId:target.id,affinity:affinityLoss,respect:respectShift};
  });
  ep.winRelationshipPenalties.push(...changes);
  return changes;
}
function applyHighQueensWinnerJealousy(winner, ep){
  if(!winner || !ep || !gameState.relationships)return [];
  if(ep.highWinnerJealousyApplied)return [];

  const highPlacements=(ep.placements||[]).filter(p=>p.placement==='HIGH');

  const changes=highPlacements.map(p=>{
    const highQueen=gameState.queens.find(q=>q.id===p.queenId);
    if(!highQueen || highQueen.id===winner.id || highQueen.isEliminated)return null;

    const roll=Math.random();
    if(roll<0.40){
      changeRelationship(highQueen.id,winner.id,rand(-8,-4),rand(-2,0));
      return {fromId:highQueen.id,toId:winner.id,type:'small'};
    }

    if(roll<0.70){
      changeRelationship(highQueen.id,winner.id,rand(-16,-9),rand(-5,-2));
      return {fromId:highQueen.id,toId:winner.id,type:'large'};
    }

    return null;
  }).filter(Boolean);

  ep.highWinnerJealousyApplied=true;
  ep.highWinnerJealousyChanges=changes;

  return changes;
}
