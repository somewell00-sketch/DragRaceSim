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
  // v31.6: NPCs weigh every strategy by what they are good at and how it suits the song,
  // with personality pushing risk-takers toward big swings and consistent queens toward control.
  const p=getPersonality(q);
  const riskBias={minimal:-1,low:-.5,medium:0,high:1};
  let best='sell_lyrics',bestScore=-99;
  Object.keys(LIP_SYNC_PROFILES).forEach(id=>{
    if(!lipSyncStrategyAvailable(id,q))return;
    const prof=LIP_SYNC_PROFILES[id];
    if(id==='signature_move' && ((q.attributes?.lipSync||0)<8 || Math.random()<.6))return;
    let s=lipSyncExpectedValue(id,song,q)+(Math.random()*2-1)*1.1;
    const rb=riskBias[prof.risk]||0;
    if((p?.risk||5)>=8)s+=rb*.5;
    if((p?.consistency||5)>=8)s-=rb*.4;
    if(prof.reveals && (q.attributes?.runway||0)<7)s-=.6;
    if(s>bestScore){bestScore=s;best=id;}
  });
  return lipSyncMovesFromStrategy(best, song);
}

