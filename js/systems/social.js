
const WORKROOM_CHOICES = {
  spotlight: {
    label:'Steal the room',
    description:'You grab attention before the challenge even starts.',
    effects:{performance:1, energy:-5, stress:4, production:3, queens:-1, fans:2},
    text:'You make sure the room knows you are here. Production notices. A few queens roll their eyes.'
  },
  friendly: {
    label:'Keep it warm',
    description:'You build goodwill before the competition gets ugly.',
    effects:{performance:0, energy:-2, stress:-2, production:0, queens:3, fans:1},
    text:'You kiki with the dolls and keep the vibe light. Not flashy, but socially smart.'
  },
  observe: {
    label:'Observe first',
    description:'You stay quiet, read the room, and protect your focus.',
    effects:{performance:1, energy:2, stress:-3, production:-1, queens:1, fans:0},
    text:'You sit back and watch. Less screen time, more information.'
  }
};

const PREP_CHOICES = {
  rehearse: {
    label:'Rehearse until it hurts',
    description:'Better challenge prep, but it costs energy.',
    effects:{performance:4, energy:-14, stress:8, production:1, queens:0, fans:0},
    text:'You work the material until your brain has contour lines. It helps, but you are tired.'
  },
  runway: {
    label:'Prioritize the runway',
    description:'Boost your visual presentation but split your focus.',
    effects:{performance:-1, runway:4, energy:-8, stress:4, production:1, queens:0, fans:2},
    text:'You pour extra time into the look. The fantasy gets stronger, but the challenge gets less rehearsal.'
  },
  ask_help: {
    label:'Ask for help',
    description:'Choose a queen to help you prepare.',
    needsTarget:true,
    effects:{performance:3, energy:-4, stress:-3, production:0, queens:3, fans:1, affinity:14, respect:6},
    text:'You ask for help and let someone into your process. Vulnerable, but useful.'
  },
  sabotage: {
    label:'Sabotage someone',
    description:'Try to throw another queen off before the challenge. It makes great TV, but it can backfire.',
    needsTarget:true,
    isSabotage:true,
    text:'You try to quietly sabotage another queen before the challenge.'
  },
  rest: {
    label:'Protect your energy',
    description:'Recover now, even if the challenge gets less polish.',
    effects:{performance:-2, energy:14, stress:-8, production:-1, queens:1, fans:0},
    text:'You take a breath and stop spiraling. The challenge may suffer, but your body thanks you.'
  }
};

const CHALLENGE_APPROACHES = {
  safe: {
    label:'Play it safe',
    description:'Consistent and controlled. Less likely to flop, less likely to win.',
    effects:{performance:1, energy:-4, stress:-2, production:-1, queens:1, fans:0},
    risk:'safe',
    text:'You choose control over chaos.'
  },
  risk: {
    label:'Go all in',
    description:'Bigger upside, bigger crash potential.',
    effects:{performance:2, energy:-9, stress:7, production:2, queens:0, fans:2},
    risk:'risk',
    text:'You swing for the crown, knowing the bottom is also watching.'
  },
  unexpected: {
    label:'Do something unexpected',
    description:'Very television. Could be iconic. Could be cursed.',
    effects:{performance:0, energy:-7, stress:9, production:3, queens:-1, fans:3},
    risk:'unexpected',
    text:'You choose the option that makes a producer sit upright.'
  }
};

const JUDGE_RESPONSES = {
  accept: {
    label:'Accept the critique',
    description:'Humble, composed, and hard to punish.',
    effects:{production:2, queens:2, fans:1, stress:-4},
    text:'You take the notes with grace. The panel respects the professionalism.'
  },
  explain: {
    label:'Explain your choices',
    description:'Can clarify the concept, but risks sounding defensive.',
    effects:{production:1, queens:0, fans:1, stress:2},
    text:'You explain the thought behind the work. It helps a little, but the room stays cautious.'
  },
  confident: {
    label:'Answer with confidence',
    description:'Potentially iconic. Potentially a mistake.',
    effects:{production:2, queens:-1, fans:3, stress:4},
    text:'You stand ten toes down. It is bold, maybe too bold, but it reads as television.'
  }
};

const UNTUCKED_ACTIONS = {
  comfort: {
    label:'Comfort someone',
    description:'Build trust and soften the room.',
    needsTarget:true,
    effects:{production:0, queens:4, fans:2, stress:-4, affinity:16, respect:5},
    text:'You sit with her instead of chasing screen time. The moment feels sincere.'
  },
  provoke: {
    label:'Provoke someone',
    description:'Start drama and risk a rivalry.',
    needsTarget:true,
    effects:{production:5, queens:-5, fans:1, stress:6, affinity:-18, respect:-7},
    text:'You toss a match into the lounge and wait for the wig smoke.'
  },
  apologize: {
    label:'Apologize',
    description:'Repair damage if tension already exists.',
    needsTarget:true,
    effects:{production:1, queens:3, fans:1, stress:-3, affinity:14, respect:4},
    text:'You own your part. It may not fix everything, but it changes the temperature.'
  },
  quiet: {
    label:'Stay quiet',
    description:'Protect your peace and recover.',
    effects:{production:-1, queens:1, fans:0, energy:10, stress:-7},
    text:'You keep your mouth shut and your drink close. Sometimes survival is silence.'
  },
  drama: {
    label:'Make drama',
    description:'Give production a scene.',
    effects:{production:6, queens:-7, fans:2, energy:-4, stress:8},
    text:'You turn a small comment into a full Untucked chapter.'
  },
  alliance: {
    label:'Build an alliance',
    description:'Social strategy with a chosen queen.',
    needsTarget:true,
    effects:{production:1, queens:4, fans:1, stress:1, affinity:13, respect:8},
    text:'You start talking future weeks. The game is getting strategic.'
  }
};

const SOCIAL_EVENTS = [
  {
    id:'sewing_help',
    type:'help',
    text:'{a} helps {b} fix a stubborn piece of construction.',
    playerText:'{a} helps you with a tricky detail before the challenge.',
    effects:{performance:2, queens:1, affinity:6, respect:3}
  },
  {
    id:'shade_spark',
    type:'conflict',
    text:'{a} throws a read at {b}. The room laughs, then gets quiet.',
    playerText:'{a} throws a read at you. The room laughs, then gets quiet.',
    effects:{production:2, fans:1, affinity:-13, respect:-3, stress:5}
  },
  {
    id:'alliance_whisper',
    type:'alliance',
    text:'{a} and {b} whisper in the corner. A small alliance might be forming.',
    playerText:'{a} pulls you aside. A small alliance might be forming.',
    effects:{queens:3, affinity:12, respect:5}
  },
  {
    id:'ru_walks_in',
    type:'production',
    text:'Ru enters the workroom early and the room snaps into panic mode.',
    playerText:'Ru enters early and asks you one pointed question.',
    effects:{production:2, performance:1, stress:4}
  },
  {
    id:'guest_mentor',
    type:'production',
    text:'The guest judge visits the workroom and gives the cast a few notes.',
    playerText:'The guest judge gives you a note that unlocks the challenge a little.',
    effects:{performance:2, production:1, fans:1}
  },
  {
    id:'sabotage_light',
    type:'sabotage',
    text:'A small resource mix-up sends {b} spiraling for a minute.',
    playerText:'A small resource mix-up hits your station and shakes your focus.',
    effects:{performance:-2, stress:5, production:1}
  },
  {
    id:'crying_moment',
    type:'emotion',
    text:'{a} breaks down for a second, and the room softens.',
    playerText:'A vulnerable conversation catches you off guard.',
    effects:{fans:2, queens:2, stress:-2, affinity:9, respect:3}
  }
];

const UNTUCKED_SPONTANEOUS = [
  '{a} says she is tired of being just safe.',
  '{a} admits the critiques got under her skin.',
  '{a} says the winner is starting to look hard to beat.',
  '{a} and {b} exchange a look that says more than a monologue.',
  '{a} calls out the room for fake compliments.',
  '{a} quietly checks on {b}, and it feels genuine.',
  'The lounge goes silent for three dangerous seconds.'
];

function ensureQueenSocialStats(q){
  if(q.ambition===undefined) q.ambition=Math.max(1,Math.min(5,Math.ceil(Math.random()*5)));
  if(q.energy===undefined) q.energy=80;
  if(q.stress===undefined) q.stress=20;
  if(!q.publicScores) q.publicScores={production:0,queens:0,fans:0};
  q.publicScores.production=q.publicScores.production||0;
  q.publicScores.queens=q.publicScores.queens||0;
  q.publicScores.fans=q.publicScores.fans||0;
  if(!q.episodeNotes) q.episodeNotes=[];
  return q;
}
function ensureAllSocialStats(){gameState.queens.forEach(ensureQueenSocialStats);}
function getPlayerQueen(){return gameState.queens.find(q=>q.id===gameState.playerQueenId);}
function ensureEpisodeEffects(){
  const ep=gameState.currentEpisode;
  if(!ep.playerEffects){
    ep.playerEffects={performance:0,runway:0,production:0,queens:0,fans:0,energy:0,stress:0,notes:[],socialEventNotes:[],untuckedNotes:[]};
  }
  return ep.playerEffects;
}
function formatDelta(value){return value>0?`+${value}`:`${value}`;}
function effectChips(effects={}){ return ''; }

function adjustedPublicDeltaForPersonality(q,key,val){
  if(!val || !['production','fans'].includes(key)) return val;
  const bias=(typeof personalityPublicBias==='function')?personalityPublicBias(q,key):0;
  // Bias nudges public perception without overwhelming the action itself.
  if(val>0) return Math.round((val + bias)*10)/10;
  if(val<0) return Math.round((val + Math.min(0,bias*0.6))*10)/10;
  return val;
}
function applyPersonalityEpisodeDrift(q){
  ensureQueenSocialStats(q);
  const p=(typeof getPersonalityProfile==='function')?getPersonalityProfile(q):null;
  if(!p || q._lastPersonalityDriftEpisode===gameState.currentEpisode?.number) return;
  q._lastPersonalityDriftEpisode=gameState.currentEpisode?.number;
  const ambition=((q.ambition||3)-3)*0.08;
  const prod=(p.productionBias||0)+ambition;
  const fans=(p.fanBias||0)+(p.fanVariance?rand(-p.fanVariance,p.fanVariance):0);
  q.publicScores.production=clamp((q.publicScores.production||0)+prod,-100,100);
  q.publicScores.fans=clamp((q.publicScores.fans||0)+fans,-100,100);
}


function applyPassiveWorkroomPenalty(){
  const ep=gameState.currentEpisode;
  if(!ep || ep.passivePenaltyApplied) return;
  ep.passivePenaltyApplied=true;
  ep.passiveWorkroom=true;
  ep.canPlayerWin=false;
  applyPlayerEffects({performance:-0.5, production:-3, fans:-1}, 'You skipped the Workroom. The work may still speak, but production saw less story.');
  const player=getPlayerQueen();
  if(player){ player.momentum=clamp((player.momentum||0)-2,-5,5); }
  saveGame();
}
function applySkippedJudgeResponsePenalty(){
  const ep=gameState.currentEpisode;
  if(!ep || ep.judgeSkipPenaltyApplied) return;
  ep.judgeSkipPenaltyApplied=true;
  applyPlayerEffects({production:-2, fans:-1}, 'You let the critiques stand without adding your point of view.');
  saveGame();
}
function applySkippedUntuckedPenalty(){
  const ep=gameState.currentEpisode;
  if(!ep || ep.untuckedSkipPenaltyApplied) return;
  ep.untuckedSkipPenaltyApplied=true;
  applyPlayerEffects({production:-2, queens:-2}, 'You stayed out of Untucked. Peaceful, but not exactly memorable television.');
  const player=getPlayerQueen();
  if(player){ player.momentum=clamp((player.momentum||0)-1,-5,5); }
  saveGame();
}

function applyPlayerEffects(effects={}, note='', targetId=null){
  const player=getPlayerQueen();
  if(!player)return;
  ensureQueenSocialStats(player);
  const epEffects=ensureEpisodeEffects();
  for(const key of ['performance','runway','production','queens','fans','energy','stress']){
    const val=effects[key]||0;
    if(!val)continue;
    if(key==='energy') player.energy=clamp(player.energy+val,0,100);
    else if(key==='stress') player.stress=clamp(player.stress+val,0,100);
    else if(['production','queens','fans'].includes(key)) player.publicScores[key]=clamp((player.publicScores[key]||0)+adjustedPublicDeltaForPersonality(player,key,val),-100,100);
    else epEffects[key]=(epEffects[key]||0)+val;
  }
  if(targetId){
    if(effects.affinity||effects.respect){
      adjustRelationshipBothWays(player.id,targetId,effects.affinity||0,effects.respect||0,0.85);
    }
  } else if(effects.queens){
    gameState.queens.filter(q=>!q.isEliminated && q.id!==player.id).forEach(q=>changeRelationship(q.id,player.id,Math.round(effects.queens*5), effects.queens>0?4:(effects.queens<0?-4:0)));
  }
  if(note) epEffects.notes.push(note);
  saveGame();
}

function applySabotageAttempt(targetId){
  const player=getPlayerQueen();
  const target=gameState.queens.find(q=>q.id===targetId);
  const ep=gameState.currentEpisode;
  if(!player || !target || !ep)return;
  ensureQueenSocialStats(player);
  ensureQueenV14Stats(target);
  const backfire=Math.random()<1/3;
  ep.sabotageAttempt={targetId:target.id,targetName:target.name,backfire};
  // Sabotage costs the player goodwill either way, but production loves the mess.
  applyPlayerEffects({production:5,fans:-4,queens:-3,stress:5}, backfire
    ? `You try to sabotage ${target.name}, but the plan backfires. Production gets a scene, but the challenge gets messier for you.`
    : `You quietly sabotage ${target.name}. It is shady television, and production eats it up.`, target.id);
  adjustRelationshipBothWays(player.id,target.id,-26,-10,0.75);
  if(backfire){
    applyPlayerEffects({performance:-3,runway:-1}, `The sabotage backfires and throws off your own preparation.`);
  }else{
    applyQueenEffects(target,{performance:-3,stress:8}, `${player.name}'s sabotage throws ${target.name} off before the challenge.`, player.id);
  }
  saveGame();
}

function applyJudgeResponse(kind){
  const response=JUDGE_RESPONSES[kind];
  if(!response)return;
  const ep=gameState.currentEpisode;
  ep.judgeResponseApplied=true;
  ep.judgeResponse=response.label;
  applyPlayerEffects(response.effects,response.text);
}
function liveQueens(excludePlayer=false){
  return gameState.queens.filter(q=>!q.isEliminated && (!excludePlayer || q.id!==gameState.playerQueenId));
}
function fillSocialText(t, a, b){
  return String(t||'').replace(/\{a\}/g,a?.name||'A queen').replace(/\{b\}/g,b?.name||'another queen');
}
function generateWorkroomSocialEvents(){
  const ep=gameState.currentEpisode;
  if(ep.socialEvents && ep.socialEvents.length)return ep.socialEvents;
  const active=liveQueens();
  const player=getPlayerQueen();
  const events=[];
  const count=Math.random()<0.25?3:2;
  for(let i=0;i<count;i++){
    const ev=sample(SOCIAL_EVENTS);
    const others=shuffle(active.filter(q=>q.id!==player.id));
    const involvesPlayer=Math.random()<0.45;
    let a=others[0]||player, b=others[1]||player;
    let text='';
    if(involvesPlayer && player && others.length){
      a=others[0]; b=player;
      text=fillSocialText(ev.playerText||ev.text,a,b);
      applyPlayerEffects(ev.effects,text,a.id);
      ensureEpisodeEffects().socialEventNotes.push(text);
    } else {
      text=fillSocialText(ev.text,a,b);
      if(a&&b&&a.id!==b.id){
        if(ev.type==='help'||ev.type==='alliance'||ev.type==='emotion'){changeRelationship(a.id,b.id,12,5);changeRelationship(b.id,a.id,9,3);}
        if(ev.type==='conflict'||ev.type==='sabotage'){changeRelationship(a.id,b.id,-13,-5);changeRelationship(b.id,a.id,-10,-3);}
      }
    }
    events.push({id:ev.id,text,type:ev.type});
  }
  ep.socialEvents=events;
  saveGame();
  return events;
}
function getUntuckedTargets(){
  return liveQueens(true).sort((a,b)=>a.name.localeCompare(b.name));
}
function generateUntuckedSpontaneous(){
  const ep=gameState.currentEpisode;
  if(ep.untuckedSpontaneous)return ep.untuckedSpontaneous;
  const active=liveQueens();
  const a=sample(active), b=sample(active.filter(q=>q.id!==a?.id));
  ep.untuckedSpontaneous=fillSocialText(sample(UNTUCKED_SPONTANEOUS),a,b);
  saveGame();
  return ep.untuckedSpontaneous;
}
function applyUntuckedAction(actionId,targetId=null){
  const action=UNTUCKED_ACTIONS[actionId];
  if(!action)return;
  const target=targetId?gameState.queens.find(q=>q.id===targetId):null;
  const note=target?`${action.text} Target: ${target.name}.`:action.text;
  gameState.currentEpisode.untuckedChoice={action:action.label,targetId:target?.id||null,targetName:target?.name||null};
  applyPlayerEffects(action.effects,note,target?.id||null);
  ensureEpisodeEffects().untuckedNotes.push(note);
}

function relationshipPersonalityMultiplier(q, affinity=0, respect=0){
  const p=(typeof getPersonalityProfile==='function')?getPersonalityProfile(q):{};
  let m=1;
  if(affinity>0) m += Math.max(0,(p.helpBias||0))*0.35 + Math.max(0,(p.social||5)-5)*0.04;
  if(affinity<0) m += Math.max(0,(p.dramaBias||0))*0.35 + Math.max(0,(p.sabotageBias||0))*0.25;
  if(respect!==0) m += Math.max(0,(p.consistency||5)-6)*0.03;
  const ambition=(typeof getAmbition==='function')?getAmbition(q):3;
  if(affinity<0 && ambition>=4) m += 0.15;
  return clamp(m,0.75,1.65);
}
function adjustRelationshipBothWays(aId,bId,affinity=0,respect=0,reciprocal=0.7){
  if(!aId||!bId||aId===bId)return;
  const a=gameState.queens.find(q=>q.id===aId);
  const b=gameState.queens.find(q=>q.id===bId);
  const ma=relationshipPersonalityMultiplier(a,affinity,respect);
  const mb=relationshipPersonalityMultiplier(b,affinity*reciprocal,respect*reciprocal);
  changeRelationship(aId,bId,Math.round(affinity*ma),Math.round(respect*ma));
  changeRelationship(bId,aId,Math.round(affinity*reciprocal*mb),Math.round(respect*reciprocal*mb));
}
function relationshipShiftSummary(fromId,toId){
  const a=gameState.queens.find(q=>q.id===fromId);
  const b=gameState.queens.find(q=>q.id===toId);
  const rel=gameState.relationships?.[fromId]?.[toId];
  if(!a||!b||!rel)return '';
  return `${a.name} → ${b.name}: ${rel.label}`;
}
function evolveRelationshipsDuringEpisode(){
  const ep=gameState.currentEpisode;
  if(!ep || ep.relationshipDriftDone)return [];
  const active=liveQueens();
  const player=getPlayerQueen();
  const notes=[];
  const pairs=[];
  for(let i=0;i<active.length;i++){
    for(let j=i+1;j<active.length;j++)pairs.push([active[i],active[j]]);
  }
  shuffle(pairs).slice(0,Math.min(12,pairs.length)).forEach(([a,b])=>{
    const roll=Math.random();
    let da=0, dr=0, note='';
    if(roll<0.34){da=rand(8,16); dr=rand(3,8); note=`${a.name} and ${b.name} have a quick kiki and seem warmer after it.`;}
    else if(roll<0.58){da=rand(-18,-8); dr=rand(-9,-3); note=`${a.name} and ${b.name} clash over the challenge prep.`;}
    else if(roll<0.78){da=rand(3,7); dr=rand(8,16); note=`${a.name} clocks ${b.name}'s work ethic and respects her a little more.`;}
    else {da=rand(-11,-4); dr=rand(-14,-5); note=`${a.name} side-eyes ${b.name}'s choices this week.`;}
    adjustRelationshipBothWays(a.id,b.id,Math.round(da),Math.round(dr),0.65);
    notes.push(note);
  });
  if(player){
    const queenScore=player.publicScores?.queens||0;
    const extraChance=queenScore>=6?0.92:(queenScore<=-6?0.8:0.55);
    if(Math.random()<extraChance){
      const target=sample(active.filter(q=>q.id!==player.id));
      if(target){
        const positive=queenScore>=0 ? Math.random()<0.7 : Math.random()<0.35;
        const da=positive?rand(12,22):rand(-22,-12);
        const dr=positive?rand(6,13):rand(-13,-5);
        adjustRelationshipBothWays(target.id,player.id,Math.round(da),Math.round(dr),0.8);
        notes.push(positive?`${target.name} seems more open to you after watching how you moved this week.`:`${target.name} seems less sure about you after this week's energy.`);
      }
    }
  }
  ep.relationshipDriftDone=true;
  ep.relationshipDriftNotes=notes;
  saveGame();
  return notes;
}

function playerStatusCard(){ return ''; }

// ---- v14: living cast systems -------------------------------------------------
const NPC_PREP_CHOICES = {
  rehearse:{label:'rehearses hard',effects:{performance:3,energy:-10,stress:6,production:1}},
  runway:{label:'pours time into the runway',effects:{performance:-1,runway:3,energy:-7,stress:3,fans:1}},
  ask_help:{label:'asks another queen for help',needsTarget:true,effects:{performance:2,energy:-3,stress:-2,affinity:6,respect:3}},
  rest:{label:'protects her energy',effects:{performance:-2,energy:12,stress:-6,production:-1}},
  chaos:{label:'tries something chaotic',effects:{performance:0,energy:-8,stress:8,production:3,fans:2}}
};

const NPC_APPROACHES = {
  safe:{label:'plays it safe',risk:'safe',effects:{performance:1,energy:-3,stress:-1,production:-1}},
  risk:{label:'goes all in',risk:'risk',effects:{performance:2,energy:-8,stress:6,production:2,fans:2}},
  unexpected:{label:'does something unexpected',risk:'unexpected',effects:{performance:0,energy:-6,stress:7,production:3,fans:2}}
};

const NPC_SOCIAL_EVENTS = [
  {type:'friendship', text:'{a} and {b} bond over sewing chaos.', effects:{affinity:13,respect:4,stress:-2}},
  {type:'mentor', text:'{a} gives {b} a useful note before filming.', effects:{affinity:9,respect:10,performance:1}},
  {type:'conflict', text:'{a} snaps at {b} over rehearsal time.', effects:{affinity:-17,respect:-5,stress:4,production:1}},
  {type:'shade', text:'{a} reads {b} just a little too accurately.', effects:{affinity:-12,respect:-1,production:2,fans:1}},
  {type:'alliance', text:'{a} and {b} quietly start comparing notes for future weeks.', effects:{affinity:12,respect:7}},
  {type:'sabotage', text:'{a} “accidentally” leaves {b} with the weaker material pile.', effects:{affinity:-22,respect:-8,performance:-1,stress:5,production:2}},
  {type:'comfort', text:'{a} checks on {b} after the critiques hit hard.', effects:{affinity:15,respect:5,stress:-4,fans:1}},
  {type:'jealousy', text:'{a} admits she is tired of watching {b} get praise.', effects:{affinity:-11,respect:3,stress:3,production:1}}
];

const UNTUCKED_NPC_EVENTS = [
  {text:'{a} comforts {b} in the corner of the lounge.', effects:{affinity:14,respect:5,stress:-3,fans:1}},
  {text:'{a} confronts {b} about fake compliments.', effects:{affinity:-16,respect:-6,stress:5,production:2}},
  {text:'{a} apologizes to {b}, and the room actually believes it.', effects:{affinity:12,respect:6,stress:-2}},
  {text:'{a} and {b} make a tiny pact to watch each other’s backs.', effects:{affinity:13,respect:8}},
  {text:'{a} throws a little shade at {b}, and everyone pretends not to hear.', effects:{affinity:-9,respect:-2,stress:2,production:1}},
  {text:'{a} admits she underestimated {b}.', effects:{respect:12,affinity:5}},
  {text:'{a} says {b} is getting a winner edit, and the lounge goes quiet.', effects:{affinity:-7,respect:7,stress:3,production:2}}
];

function ensureQueenV14Stats(q){
  ensureQueenSocialStats(q);
  if(q.confidence===undefined) q.confidence=50;
  if(q.episodeModifiers===undefined) q.episodeModifiers={performance:0,runway:0};
  if(q.publicScores.production===undefined) q.publicScores.production=0;
  if(q.publicScores.queens===undefined) q.publicScores.queens=0;
  if(q.publicScores.fans===undefined) q.publicScores.fans=0;
  return q;
}
function ensureAllQueenV14Stats(){gameState.queens.forEach(ensureQueenV14Stats);}
function currentQueenEffects(q){
  ensureQueenV14Stats(q);
  const ep=gameState.currentEpisode;
  if(!ep.queenEffects) ep.queenEffects={};
  if(!ep.queenEffects[q.id]) ep.queenEffects[q.id]={performance:0,runway:0,production:0,fans:0,queens:0,energy:0,stress:0,notes:[],risk:null};
  return ep.queenEffects[q.id];
}
function applyQueenEffects(q,effects={},note='',targetId=null){
  if(!q)return;
  ensureQueenV14Stats(q);
  const qe=currentQueenEffects(q);
  for(const key of ['performance','runway','production','queens','fans','energy','stress']){
    const val=effects[key]||0;
    if(!val)continue;
    if(key==='energy') q.energy=clamp(q.energy+val,0,100);
    else if(key==='stress') q.stress=clamp(q.stress+val,0,100);
    else if(['production','queens','fans'].includes(key)) q.publicScores[key]=clamp((q.publicScores[key]||0)+adjustedPublicDeltaForPersonality(q,key,val),-100,100);
    else qe[key]=(qe[key]||0)+val;
  }
  if(effects.affinity||effects.respect){
    if(targetId) adjustRelationshipBothWays(q.id,targetId,effects.affinity||0,effects.respect||0,0.65);
  }
  if(note) qe.notes.push(note);
}
function chooseNpcPrep(q){
  ensureQueenV14Stats(q);
  const prof=(typeof getPersonalityProfile==='function')?getPersonalityProfile(q):{};
  const ambition=(typeof getAmbition==='function')?getAmbition(q):3;
  const history=q.episodeHistory||[];
  const safeStreak=history.slice(-3).filter(h=>h.placement==='SAFE').length;
  const bottomStreak=history.slice(-2).filter(h=>h.placement==='BTM'||h.placement==='ELIM').length;
  const weights={rehearse:3,runway:2,ask_help:2,rest:2,chaos:1};

  if(q.energy<35)weights.rest+=6;
  if(q.stress>65)weights.rest+=3;
  if(bottomStreak) {weights.rehearse+=4; weights.ask_help+=2; weights.chaos-=1;}
  if(safeStreak>=2){weights.chaos+=2+ambition; weights.rehearse+=ambition>=4?2:0;}

  weights.rehearse += Math.max(0,(prof.consistency||5)-5)*0.6 + Math.max(0,ambition-3);
  weights.ask_help += (prof.helpBias||0)*8 + Math.max(0,(prof.social||5)-6)*0.45;
  weights.chaos += (prof.dramaBias||0)*7 + (prof.riskChance||0.4)*3 + Math.max(0,ambition-3)*0.8;
  weights.rest += Math.max(0,7-(prof.risk||5))*0.35;

  if((q.type||'').toLowerCase().includes('fashion')||(q.type||'').toLowerCase().includes('look'))weights.runway+=4;
  if((q.type||'').toLowerCase().includes('social'))weights.ask_help+=2;
  return weightedPick(weights);
}
function chooseNpcApproach(q){
  ensureQueenV14Stats(q);
  const prof=(typeof getPersonalityProfile==='function')?getPersonalityProfile(q):{};
  const ambition=(typeof getAmbition==='function')?getAmbition(q):3;
  const history=q.episodeHistory||[];
  const safeStreak=history.slice(-3).filter(h=>h.placement==='SAFE').length;
  const bottomStreak=history.slice(-2).filter(h=>h.placement==='BTM'||h.placement==='ELIM').length;
  const riskChance=(typeof personalityRiskChance==='function')?personalityRiskChance(q):((prof.risk||5)/10);
  const weights={safe:4,risk:3,unexpected:2};

  weights.risk += riskChance*8 + Math.max(0,ambition-3)*1.5;
  weights.unexpected += Math.max(0,riskChance-0.55)*10 + (prof.dramaBias||0)*5;
  weights.safe += Math.max(0,0.45-riskChance)*8 + Math.max(0,4-ambition);

  if(q.energy<30||q.stress>70)weights.safe+=4;
  if(bottomStreak)weights.safe+=2, weights.risk+=3;
  if(safeStreak>=2)weights.risk+=4, weights.unexpected+=3;
  if(q.momentum>=3)weights.risk+=2;
  if(q.momentum<=-3)weights.safe+=2;

  return weightedPick(weights);
}
function weightedPick(weights){
  const entries=Object.entries(weights).filter(([_,v])=>v>0);
  const total=entries.reduce((s,[_,v])=>s+v,0);
  let r=Math.random()*total;
  for(const [k,v] of entries){r-=v;if(r<=0)return k;}
  return entries[0]?.[0];
}
function simulateNpcEpisodeChoices(){
  const ep=gameState.currentEpisode;
  if(ep.npcChoicesDone)return;
  ensureAllQueenV14Stats();
  const playerId=gameState.playerQueenId;
  const notes=[];
  const player=gameState.queens.find(q=>q.id===playerId); if(player)applyPersonalityEpisodeDrift(player);
  liveQueens(false).filter(q=>q.id!==playerId).forEach(q=>{
    applyPersonalityEpisodeDrift(q);
    const prepId=chooseNpcPrep(q);
    const prep=NPC_PREP_CHOICES[prepId];
    let target=null;
    if(prep.needsTarget){
      target=chooseNpcHelpTarget(q);
    }
    applyQueenEffects(q,prep.effects,`${q.name} ${prep.label}.`,target?.id||null);
    const appId=chooseNpcApproach(q);
    const app=NPC_APPROACHES[appId];
    const qe=currentQueenEffects(q);
    qe.risk=app.risk;
    applyQueenEffects(q,app.effects,`${q.name} ${app.label}.`);
    notes.push(`${q.name} ${prep.label} and ${app.label}.`);
  });
  ep.npcChoiceNotes=notes;
  ep.npcChoicesDone=true;
  saveGame();
}
function chooseNpcHelpTarget(q){
  const candidates=liveQueens(false).filter(o=>o.id!==q.id);
  if(!candidates.length)return null;
  return candidates.map(o=>({o,score:(gameState.relationships?.[q.id]?.[o.id]?.affinity||0)+(gameState.relationships?.[q.id]?.[o.id]?.respect||0)+rand(-20,20)})).sort((a,b)=>b.score-a.score)[0].o;
}

function pickNpcSocialEventForQueen(pool,a){
  const prof=(typeof getPersonalityProfile==='function')?getPersonalityProfile(a):{};
  const ambition=(typeof getAmbition==='function')?getAmbition(a):3;
  const weighted=pool.map(ev=>{
    let w=1;
    if(ev.type==='comfort'||ev.type==='friendship'||ev.type==='mentor'||ev.type==='alliance') w += (prof.helpBias||0)*5 + Math.max(0,(prof.social||5)-5)*0.25;
    if(ev.type==='conflict'||ev.type==='shade'||ev.type==='jealousy') w += (prof.dramaBias||0)*5 + Math.max(0,ambition-3)*0.3;
    if(ev.type==='sabotage') w += (prof.sabotageBias||0)*7 + Math.max(0,ambition-3)*0.6;
    if((prof.id==='kind'||prof.id==='sweet'||prof.id==='humble') && (ev.type==='sabotage'||ev.type==='conflict')) w*=0.25;
    if((prof.id==='chaotic'||prof.id==='dramatic'||prof.id==='hotheaded') && (ev.type==='conflict'||ev.type==='shade')) w*=1.8;
    return {ev,w:Math.max(0.02,w)};
  });
  const total=weighted.reduce((s,x)=>s+x.w,0);
  let r=Math.random()*total;
  for(const item of weighted){r-=item.w;if(r<=0)return item.ev;}
  return weighted[0]?.ev || sample(pool);
}

function generateNpcSocialEvents(stage='workroom'){
  const ep=gameState.currentEpisode;
  const key=stage==='untucked'?'npcUntuckedEvents':'npcSocialEvents';
  if(ep[key])return ep[key];
  const pool=stage==='untucked'?UNTUCKED_NPC_EVENTS:NPC_SOCIAL_EVENTS;
  const active=liveQueens(false);
  const count=stage==='untucked'?(Math.random()<0.35?1:2):(Math.random()<0.2?1:(Math.random()<0.65?2:3));
  const events=[];
  for(let i=0;i<count;i++){
    const a=sample(active);
    const b=sample(active.filter(q=>q.id!==a?.id));
    if(!a||!b)continue;
    const ev=pickNpcSocialEventForQueen(pool,a);
    const text=fillSocialText(ev.text,a,b);
    applyQueenEffects(a,ev.effects,text,b.id);
    // Target absorbs stress/performance side of the event when relevant.
    const targetEffects={};
    if(ev.effects.performance)targetEffects.performance=ev.effects.performance;
    if(ev.effects.stress)targetEffects.stress=ev.effects.stress;
    if(ev.type==='sabotage')targetEffects.performance=-1;
    applyQueenEffects(b,targetEffects,'',a.id);
    events.push({text,type:ev.type||stage,a:a.id,b:b.id});
  }
  ep[key]=events;
  saveGame();
  return events;
}
function queenEnergyStressMod(q){
  ensureQueenV14Stats(q);
  return Math.round((((q.energy-70)/6)-((q.stress-20)/7))*10)/10;
}
function applyWeeklyWearAndTear(){
  const ep=gameState.currentEpisode;
  if(ep.weeklyWearDone)return;
  liveQueens(false).forEach(q=>{
    ensureQueenV14Stats(q);
    q.energy=clamp(q.energy+rand(-5,2),0,100);
    q.stress=clamp(q.stress+rand(-2,6),0,100);
  });
  ep.weeklyWearDone=true;
}
function npcCastStatusList(limit=6){ return liveQueens(true).slice(0,limit).map(q=>`<li><strong>${escapeHtml(q.name)}</strong> is moving through the episode in her own way.</li>`).join(''); }
function allQueenStatusMini(q){ return playerRelationshipLabel(q.id); }
