// Centralized Gameplay Effects System
// All gameplay consequences should flow through applyChoiceEffects().
// This keeps choices, NPC events, episode results and future interactions balanced in one place.

const GAMEPLAY_EFFECT_LIMITS = {
  publicScore: [-100, 100],
  stress: [0, 100],
  energy: [0, 100],
  confidence: [0, 100],
  momentum: [-5, 5],
  relationship: [-100, 100]
};

function effectNumber(value, fallback=0){
  const n=Number(value);
  return Number.isFinite(n)?n:fallback;
}

function effectClamp(value, min, max){
  if(typeof clamp==='function') return clamp(value,min,max);
  return Math.max(min,Math.min(max,value));
}

function effectQueenId(target){
  if(!target) return null;
  if(typeof target==='string') return target;
  return target.id || null;
}

function findEffectQueen(target){
  const id=effectQueenId(target);
  return gameState.queens.find(q=>q.id===id) || null;
}

function getEffectPlayerQueen(){
  return gameState.queens.find(q=>q.id===gameState.playerQueenId) || null;
}

function ensureEffectPublicScores(q){
  if(!q.publicScores) q.publicScores={production:0,queens:0,fans:0};
  for(const key of ['production','queens','fans']){
    if(q.publicScores[key]===undefined) q.publicScores[key]=0;
  }
}

function ensureEffectQueenStats(q){
  if(!q) return q;
  if(q.energy===undefined) q.energy=80;
  if(q.stress===undefined) q.stress=20;
  if(q.confidence===undefined) q.confidence=50;
  if(q.momentum===undefined) q.momentum=0;
  ensureEffectPublicScores(q);
  return q;
}

function ensureEffectEpisode(){
  const ep=gameState.currentEpisode;
  if(!ep) return null;
  if(!ep.playerEffects){
    ep.playerEffects={performance:0,runway:0,production:0,queens:0,fans:0,energy:0,stress:0,notes:[],socialEventNotes:[],untuckedNotes:[]};
  }
  if(!ep.queenEffects) ep.queenEffects={};
  if(!ep.effectLog) ep.effectLog=[];
  return ep;
}

function ensureEffectBucket(q){
  const ep=ensureEffectEpisode();
  if(!ep || !q) return null;
  if(q.id===gameState.playerQueenId) return ep.playerEffects;
  if(!ep.queenEffects[q.id]) ep.queenEffects[q.id]={performance:0,runway:0,production:0,fans:0,queens:0,energy:0,stress:0,notes:[],risk:null};
  return ep.queenEffects[q.id];
}

function adjustedEffectPublicDelta(q,key,val){
  if(!val || !['production','fans'].includes(key)) return val;
  if(typeof personalityPublicBias!=='function') return val;
  const bias=personalityPublicBias(q,key)||0;
  if(val>0) return Math.round((val + bias)*10)/10;
  if(val<0) return Math.round((val + Math.min(0,bias*0.6))*10)/10;
  return val;
}

function changeEffectRelationship(fromId,toId,affinity=0,respect=0){
  if(!fromId || !toId || fromId===toId) return;
  if(typeof adjustRelationshipBothWays==='function'){
    adjustRelationshipBothWays(fromId,toId,affinity,respect,0.75);
    return;
  }
  if(typeof changeRelationship==='function'){
    changeRelationship(fromId,toId,affinity,respect);
    changeRelationship(toId,fromId,Math.round(affinity*0.7),Math.round(respect*0.7));
  }
}

function normalizeChoiceEffects(effects={}){
  const normalized={...effects};
  if(normalized.challengeBonus!==undefined && normalized.performance===undefined){
    normalized.performance=normalized.challengeBonus;
  }
  if(normalized.publicScores){
    for(const key of ['production','queens','fans']){
      if(normalized.publicScores[key]!==undefined && normalized[key]===undefined) normalized[key]=normalized.publicScores[key];
    }
  }
  return normalized;
}

function buildEffectLogEntry(q,effects,note,source){
  return {
    episode: gameState.currentEpisode?.number || null,
    queenId: q?.id || null,
    queenName: q?.name || null,
    source: source || 'choice',
    note: note || '',
    effects: JSON.parse(JSON.stringify(effects||{}))
  };
}

function applyChoiceEffects(rawEffects={}, options={}){
  const effects=normalizeChoiceEffects(rawEffects);
  const q=options.queen ? findEffectQueen(options.queen) : (options.queenId ? findEffectQueen(options.queenId) : getEffectPlayerQueen());
  if(!q) return null;

  ensureEffectQueenStats(q);
  const bucket=ensureEffectBucket(q);
  const note=options.note || effects.note || '';

  for(const key of ['energy','stress','confidence','momentum']){
    const val=effectNumber(effects[key],0);
    if(!val) continue;
    const [min,max]=GAMEPLAY_EFFECT_LIMITS[key];
    q[key]=effectClamp((q[key]||0)+val,min,max);
  }

  for(const key of ['production','queens','fans']){
    const val=effectNumber(effects[key],0);
    if(!val) continue;
    const adjusted=adjustedEffectPublicDelta(q,key,val);
    q.publicScores[key]=effectClamp((q.publicScores[key]||0)+adjusted,GAMEPLAY_EFFECT_LIMITS.publicScore[0],GAMEPLAY_EFFECT_LIMITS.publicScore[1]);
    if(bucket) bucket[key]=(bucket[key]||0)+adjusted;
  }

  for(const key of ['performance','runway']){
    const val=effectNumber(effects[key],0);
    if(!val || !bucket) continue;
    bucket[key]=(bucket[key]||0)+val;
  }

  const directTargetId=effectQueenId(options.target || options.targetId || effects.target);
  if(directTargetId && (effects.affinity || effects.respect)){
    changeEffectRelationship(q.id,directTargetId,effectNumber(effects.affinity,0),effectNumber(effects.respect,0));
  }

  if(Array.isArray(effects.relationships)){
    effects.relationships.forEach(rel=>{
      const targetId=effectQueenId(rel.target || rel.targetId || rel.queen || rel.queenId);
      if(!targetId) return;
      changeEffectRelationship(q.id,targetId,effectNumber(rel.affinity,0),effectNumber(rel.respect,0));
    });
  } else if(!directTargetId && effects.queens){
    const delta=effectNumber(effects.queens,0);
    gameState.queens
      .filter(other=>!other.isEliminated && other.id!==q.id)
      .forEach(other=>{
        if(typeof changeRelationship==='function') changeRelationship(other.id,q.id,Math.round(delta*5),delta>0?4:(delta<0?-4:0));
      });
  }

  if(note && bucket?.notes) bucket.notes.push(note);

  const ep=ensureEffectEpisode();
  if(ep?.effectLog) ep.effectLog.push(buildEffectLogEntry(q,effects,note,options.source));
  if(options.save!==false && typeof saveGame==='function') saveGame();
  return {queen:q,effects,bucket};
}
