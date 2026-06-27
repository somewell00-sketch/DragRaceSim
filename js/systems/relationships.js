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
