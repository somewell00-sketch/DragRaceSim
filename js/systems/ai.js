function getPersonality(q){
  let id=q?.personalityId || q?.personality || 'confident';
  const legacy={timid:'shy',sweetheart:'sweet',shady:'sarcastic'};
  id=legacy[id]||id;
  return gameState.data.personalities.find(p=>p.id===id)||gameState.data.personalities[0];
}
function getPersonalityProfile(q){return getPersonality(q);}
function getAmbition(q){
  if(q && q.ambition===undefined) q.ambition=Math.max(1,Math.min(5,Math.ceil(Math.random()*5)));
  return q?.ambition||3;
}
function personalityRiskChance(q){
  const p=getPersonalityProfile(q);
  const ambition=(getAmbition(q)-3)*0.06;
  return clamp((p.riskChance ?? ((p.risk||5)/10)) + ambition, 0.05, 0.95);
}
function personalityPublicBias(q,key){
  const p=getPersonalityProfile(q)||{};
  if(key==='production')return p.productionBias||0;
  if(key==='fans')return (p.fanBias||0) + (p.fanVariance?rand(-p.fanVariance,p.fanVariance):0);
  return 0;
}
function personalitySocialBias(q,key){
  const p=getPersonalityProfile(q)||{};
  if(key==='help')return p.helpBias||0;
  if(key==='sabotage')return p.sabotageBias||0;
  if(key==='drama')return p.dramaBias||0;
  return 0;
}
function chooseAIRisk(q){
  const p=getPersonalityProfile(q); const chance=personalityRiskChance(q); const roll=Math.random(); if(roll<chance*.45)return 'unexpected'; if(roll<chance)return 'risk'; return (p.consistency||5)>=7?'safe':'risk';
}

function chooseLipSyncMoves(song,q){
  const high=song.energy==='high';
  const emotional=song.energy!=='high';
  const p=getPersonality(q);
  let strategy='sell_lyrics';
  if(q.inventory?.reveals>0 && q.attributes.runway>=8 && Math.random()<0.35) strategy='save_reveal';
  else if(q.inventory?.reveals>1 && q.attributes.runway>=8 && Math.random()<0.12) strategy='multiple_reveals';
  else if(high && q.attributes.lipSync>=8) strategy=Math.random()<0.55?'dance':'stunts';
  else if(emotional && q.attributes.acting>=7) strategy='emotion';
  else if(p?.risk>=8 && Math.random()<0.20) strategy='overshadow';
  else if(p?.risk>=8 && Math.random()<0.35) strategy='stunts';
  else if(p?.consistency>=8) strategy='play_safe';
  return lipSyncMovesFromStrategy(strategy, song);
}

