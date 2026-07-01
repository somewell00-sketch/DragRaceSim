
const WORKROOM_CHOICES = {
  spotlight: {
    label:'Steal the room',
    description:'Grab the camera, dominate the room, and risk irritating the cast.',
    dynamicEffect:'stealRoom',
    text:'You make the Workroom orbit around you. Production gets a scene, fans get a moment, and a few queens quietly lose patience.'
  },
  friendly: {
    label:'Keep it warm',
    description:'Build real goodwill before the competition gets ugly.',
    dynamicEffect:'keepWarm',
    text:'You keep the room warm and make three queens feel seen. It is not the loudest move, but it pays socially.'
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
    effects:{performance:4, energy:-14, stress:8, production:1.2, queens:0, fans:0},
    text:'You work the material until your brain has contour lines. It helps, but you are tired.'
  },
  runway: {
    label:'Prioritize the runway',
    description:'Boost your visual presentation but split your focus.',
    effects:{performance:-2, runway:7, energy:-9, stress:4, production:1.25, queens:0, fans:3.8},
    text:'You pour extra time into the look. The fantasy gets stronger, but the challenge gets less rehearsal.'
  },
  ask_help: {
    label:'Ask for help',
    description:'Choose a queen to help you prepare. Both of you can benefit.',
    needsTarget:true,
    dynamicEffect:'askHelp',
    text:'You ask for help and let someone into your process. Vulnerable, strategic, and useful.'
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
    effects:{performance:-2, energy:14, stress:-8, production:-1.2, queens:1.25, fans:0},
    text:'You take a breath and stop spiraling. The challenge may suffer, but your body thanks you.'
  }
};

const CHALLENGE_APPROACHES = {
  safe: {
    label:'Play it safe',
    description:'Consistent and controlled. Less likely to flop, less likely to win.',
    effects:{performance:1, energy:-4, stress:-2, production:-1.25, queens:1.25, fans:0},
    risk:'safe',
    text:'You choose control over chaos.'
  },
  risk: {
    label:'Go all in',
    description:'Bigger upside, bigger crash potential.',
    effects:{performance:2, energy:-9, stress:7, production:2.5, queens:0, fans:2.5},
    risk:'risk',
    text:'You swing for the crown, knowing the bottom is also watching.'
  },
  unexpected: {
    label:'Do something unexpected',
    description:'Very television. Could be iconic. Could be cursed.',
    effects:{performance:0, energy:-7, stress:9, production:3.8, queens:-1.25, fans:3.8},
    risk:'unexpected',
    text:'You choose the option that makes a producer sit upright.'
  }
};

const JUDGE_RESPONSES = {
  accept: {
    label:'Accept the critique',
    description:'Humble, composed, and hard to punish.',
    effects:{production:2.4, queens:2.5, fans:1.25, stress:-4},
    text:'You take the notes with grace. The panel respects the professionalism.'
  },
  explain: {
    label:'Explain your choices',
    description:'Can clarify the concept, but risks sounding defensive.',
    effects:{production:1.2, queens:0, fans:1.2, stress:2},
    text:'You explain the thought behind the work. It helps a little, but the room stays cautious.'
  },
  confident: {
    label:'Answer with confidence',
    description:'Potentially iconic. Potentially a mistake.',
    effects:{production:2.5, queens:-1.25, fans:3.8, stress:4},
    text:'You stand ten toes down. It is bold, maybe too bold, but it reads as television.'
  }
};

const UNTUCKED_ACTIONS = {
  comfort: {
    label:'Comfort someone',
    description:'Build trust and soften the room.',
    needsTarget:true,
    dynamicEffect:'comfort',
    text:'You sit with her instead of chasing screen time. The moment feels sincere.'
  },
  provoke: {
    label:'Provoke someone',
    description:'Start drama and risk an argument.',
    needsTarget:true,
    dynamicEffect:'provoke',
    text:'You toss a match into the lounge and wait for the wig smoke.'
  },
  apologize: {
    label:'Apologize',
    description:'Repair damage if tension already exists.',
    needsTarget:true,
    dynamicEffect:'apologize',
    text:'You own your part. It may not fix everything, but it changes the temperature.'
  },
  quiet: {
    label:'Stay quiet',
    description:'Protect your peace and reduce stress, at the cost of screen time.',
    effects:{production:-2, energy:8, stress:-10},
    text:'You keep your mouth shut and your drink close. Sometimes survival is silence.'
  },
  drama: {
    label:'Make drama',
    description:'Give production a scene and risk turning the room against you.',
    dynamicEffect:'makeDrama',
    text:'You turn a small comment into a full Untucked chapter.'
  },
  alliance: {
    label:'Build an alliance',
    description:'Create an actual strategic bond with a chosen queen.',
    needsTarget:true,
    dynamicEffect:'buildAlliance',
    text:'You start talking future weeks. The game is getting strategic.'
  },
  rumor: {
    label:'Spread a rumor',
    description:'Make three queens turn on someone. 30% chance it backfires on you.',
    needsTarget:true,
    dynamicEffect:'spreadRumor',
    text:'You plant a rumor in the lounge and wait to see who believes it.'
  }
};

const SOCIAL_EVENTS = [
  {
    id:'sewing_help',
    type:'help',
    text:'{a} helps {b} fix a stubborn piece of construction.',
    playerText:'{a} helps you with a tricky detail before the challenge.',
    effects:{performance:2, queens:1.25, affinity:8, respect:4}
  },
  {
    id:'shade_spark',
    type:'conflict',
    text:'{a} throws a read at {b}. The room laughs, then gets quiet.',
    playerText:'{a} throws a read at you. The room laughs, then gets quiet.',
    effects:{production:2.6, fans:0.75, affinity:-16, respect:-4, stress:5}
  },
  {
    id:'alliance_whisper',
    type:'alliance',
    text:'{a} and {b} whisper in the corner. A small alliance might be forming.',
    playerText:'{a} pulls you aside. A small alliance might be forming.',
    effects:{queens:3.8, affinity:15, respect:6}
  },
  {
    id:'ru_walks_in',
    type:'production',
    text:'Ru enters the workroom early and the room snaps into panic mode.',
    playerText:'Ru enters early and asks you one pointed question.',
    effects:{production:2.4, performance:1, stress:4}
  },
  {
    id:'guest_mentor',
    type:'production',
    text:'The guest judge visits the workroom and gives the cast a few notes.',
    playerText:'The guest judge gives you a note that unlocks the challenge a little.',
    effects:{performance:2, production:1.25, fans:1.25}
  },
  {
    id:'sabotage_light',
    type:'sabotage',
    text:'A small resource mix-up sends {b} spiraling for a minute.',
    playerText:'A small resource mix-up hits your station and shakes your focus.',
    effects:{performance:-2, stress:5, production:1.25}
  },
  {
    id:'crying_moment',
    type:'emotion',
    text:'{a} breaks down for a second, and the room softens.',
    playerText:'A vulnerable conversation catches you off guard.',
    effects:{fans:2.5, queens:2.5, stress:-2, affinity:11, respect:4}
  }
];

const UNTUCKED_SPONTANEOUS = [
  '{a} says she is tired of being just safe.',
  '{a} admits the critiques got under her skin.',
  '{a} says the winner is starting to look hard to beat.',
  '{a} and {b} exchange a look that says more than a monologue.',
  '{a} calls out the room for fake compliments.',
  '{a} quietly checks on {b}, and it feels genuine.',
  'The lounge goes silent for three dangerous seconds.',
'Someone off-camera drops a glass, and the entire room jumps in shock.',
  '{a} dramatically stares at her drink and mutters: "This is a nightmare."',
  '{a} bursts out laughing for absolutely no reason, making the silence even more awkward.',
  'The entire cast suddenly looks up at the ceiling as production adjusts the lighting grid.',
  '{a} sighs deeply and says: "I just want to take these heels off so badly."',
  '{a} and {b} simultaneously roll their eyes while another queen speaks.',
  'An incredibly loud, dramatic metallic sound effect echoes through the edit.'
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

function randomLiveQueens(count=3, excludeIds=[]){
  const excluded=new Set(excludeIds.filter(Boolean));
  return shuffle(episodeScopedQueens(false).filter(q=>!excluded.has(q.id))).slice(0,count);
}
function relationshipEffectsFor(targets, affinity=0, respect=0){
  return (targets||[]).map(q=>({target:q.id,affinity,respect}));
}
function episodeSocialNote(bucket, note){
  const ep=gameState.currentEpisode;
  if(!ep || !note) return;
  if(!ep.playerEffects) ensureEpisodeEffects();
  if(bucket==='workroom') ep.playerEffects.socialEventNotes.push(note);
  if(bucket==='untucked') ep.playerEffects.untuckedNotes.push(note);
}
function ensureSeasonSocialSystems(){
  gameState.season=gameState.season||{};
  if(!gameState.season.alliances) gameState.season.alliances=[];
  if(!gameState.season.storyFlags) gameState.season.storyFlags=[];
  return gameState.season;
}
function addStoryFlag(queenId,type,reason,strength=1){
  const season=ensureSeasonSocialSystems();
  season.storyFlags.push({episode:gameState.currentEpisode?.number||null,queenId,type,reason,strength});
  const q=gameState.queens.find(x=>x.id===queenId);
  if(q){
    q.storyFlags=q.storyFlags||[];
    q.storyFlags.push({episode:gameState.currentEpisode?.number||null,type,reason,strength});
    q.narrativeTags=null;
  }
}
function maybeVillainEdit(queen, chance, reason){
  if(!queen || Math.random()>=chance) return false;
  addStoryFlag(queen.id,'villain_edit',reason,1);
  applyChoiceEffects({production:4,fans:-0.75},{queen,note:`Villain edit spark: ${reason}`,source:'narrative-flag',save:false});
  return true;
}
function createAlliance(aId,bId,source='untucked'){
  if(!aId||!bId||aId===bId) return null;
  const season=ensureSeasonSocialSystems();
  const members=[aId,bId].sort();
  let alliance=season.alliances.find(x=>!x.broken && x.members?.length===2 && x.members.slice().sort().join('|')===members.join('|'));
  if(alliance){
    alliance.strength=clamp((alliance.strength||1)+1,1,5);
    alliance.lastEpisode=gameState.currentEpisode?.number||alliance.lastEpisode;
  }else{
    alliance={id:`alliance_${Date.now()}_${Math.floor(Math.random()*9999)}`,members,createdEpisode:gameState.currentEpisode?.number||null,lastEpisode:gameState.currentEpisode?.number||null,strength:2,source,broken:false};
    season.alliances.push(alliance);
  }
  return alliance;
}
function activeAllianceFor(aId,bId){
  const season=gameState.season||{};
  const members=[aId,bId].sort().join('|');
  return (season.alliances||[]).find(x=>!x.broken && x.members?.slice().sort().join('|')===members);
}
function reinforceAlliances(){
  const season=gameState.season||{};
  const ep=gameState.currentEpisode;
  if(!ep || ep.allianceReinforcementDone) return [];
  const notes=[];
  (season.alliances||[]).filter(a=>!a.broken).forEach(a=>{
    const [aId,bId]=a.members||[];
    const qa=gameState.queens.find(q=>q.id===aId && !q.isEliminated);
    const qb=gameState.queens.find(q=>q.id===bId && !q.isEliminated);
    if(!qa||!qb) return;
    const boost=Math.max(3,Math.round((a.strength||1)*2));
    adjustRelationshipBothWays(aId,bId,boost,boost,0.9);
    if(Math.random()<0.45){
      const text=`${qa.name} and ${qb.name}'s alliance quietly affects the social temperature this week.`;
      notes.push(text);
      applyChoiceEffects({production:1.25,queens:1.25},{queen:qa,note:text,source:'alliance-pulse',save:false});
    }
  });
  ep.allianceReinforcementDone=true;
  ep.allianceNotes=notes;
  return notes;
}
function buildDynamicPlayerEffects(kind,target=null){
  const player=getPlayerQueen();
  const targets=randomLiveQueens(3,[player?.id,target?.id]);
  const names=targets.map(q=>q.name).join(', ');
  if(kind==='stealRoom'){
    return {effects:{production:13,fans:0.5,stress:6,queens:-4,relationships:relationshipEffectsFor(targets,-35,-10)},note:`You steal the room. Production lights up, fans get a moment, and ${names||'the room'} lose patience with you.`};
  }
  if(kind==='keepWarm'){
    return {effects:{fans:5.2,confidence:4,queens:5.2,stress:-2,relationships:relationshipEffectsFor(targets,39,15)},note:`You keep it warm with ${names||'the room'}. The goodwill is real, and you leave the Workroom more confident.`};
  }
  if(kind==='askHelp' && target){
    return {effects:{challengeBonus:1.2,stress:-8,confidence:4,affinity:45,respect:16,fans:1.25,queens:1.25},note:`You ask ${target.name} for help. Your challenge prep improves, the relationship gets warmer, and she also gains a useful challenge boost.`};
  }
  if(kind==='comfort' && target){
    return {effects:{fans:4,confidence:2,momentum:1,affinity:45,respect:16,queens:2},note:`You comfort ${target.name}. Trust increases, she calms down, and the audience gets a sincere moment.`};
  }
  if(kind==='provoke' && target){
    return {effects:{production:10.5,fans:-1.25,stress:7,momentum:-1,affinity:-43,respect:-16,queens:-1.25},note:`You provoke ${target.name}. Production gets conflict, but the relationship takes a clear hit.`};
  }
  if(kind==='apologize' && target){
    return {effects:{production:0,fans:1.25,queens:2,stress:-4,affinity:43,respect:14},note:`You apologize to ${target.name}. The damage is repaired enough for the rivalry to cool, even if trust is not automatic.`};
  }
  if(kind==='makeDrama'){
    return {effects:{production:13,fans:0.5,stress:8,queens:-4,momentum:-1,relationships:relationshipEffectsFor(targets,-33,-10)},note:`You make drama in Untucked. Production gets the scene, but ${names||'several queens'} clock the move.`};
  }
  if(kind==='buildAlliance' && target){
    return {effects:{production:1.25,fans:1.25,queens:2,confidence:3,momentum:1,stress:1,affinity:36,respect:23},note:`You and ${target.name} form an alliance. This can now affect social sparks, Untucked tension, narrative events, and future strategic beats.`};
  }
  return null;
}
function applyWorkroomChoice(choice){
  if(!choice) return;
  if(choice.dynamicEffect){
    const built=buildDynamicPlayerEffects(choice.dynamicEffect);
    applyPlayerEffects(built.effects,built.note);
    if(choice.dynamicEffect==='stealRoom') maybeVillainEdit(getPlayerQueen(),0.18,'stole the Workroom spotlight at the cast\'s expense');
    episodeSocialNote('workroom',built.note);
  }else{
    applyPlayerEffects(choice.effects,choice.text);
    episodeSocialNote('workroom',choice.text);
  }
}
function applyTargetedPrepChoice(choice,target){
  if(!choice) return;
  if(choice.dynamicEffect==='askHelp' && target){
    const built=buildDynamicPlayerEffects('askHelp',target);
    applyPlayerEffects(built.effects,built.note,target.id);
    applyQueenEffects(target,{challengeBonus:0.8,confidence:3,stress:-3,production:1.25,fans:2.5,queens:1.25},`${target.name} gets a warm helper moment after helping you prepare.`,gameState.playerQueenId);
    addStoryFlag(target.id,'warm_moment',`${target.name} helped the player prepare.`,1);
    episodeSocialNote('workroom',built.note);
    return;
  }
  applyPlayerEffects(choice.effects,choice.text,target?.id||null);
  episodeSocialNote('workroom',choice.text);
}
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
  applyChoiceEffects({production:prod,fans:fans},{queen:q,note:'Personality drift nudges public perception.',source:'personality-drift',save:false});
}


function applyPassiveWorkroomPenalty(){
  const ep=gameState.currentEpisode;
  if(!ep || ep.passivePenaltyApplied) return;
  ep.passivePenaltyApplied=true;
  ep.passiveWorkroom=true;
  ep.canPlayerWin=false;
  applyPlayerEffects({performance:-0.5, production:-4, fans:-1.25, momentum:-2}, 'You skipped the Workroom. The work may still speak, but production saw less story.');
  saveGame();
}
function applySkippedJudgeResponsePenalty(){
  const ep=gameState.currentEpisode;
  if(!ep || ep.judgeSkipPenaltyApplied) return;
  ep.judgeSkipPenaltyApplied=true;
  applyPlayerEffects({production:-2.5, fans:-1.25}, 'You let the critiques stand without adding your point of view.');
  saveGame();
}
function applySkippedUntuckedPenalty(){
  const ep=gameState.currentEpisode;
  if(!ep || ep.untuckedSkipPenaltyApplied) return;
  ep.untuckedSkipPenaltyApplied=true;
  applyPlayerEffects({production:-2.5, queens:-2.5, momentum:-1}, 'You stayed out of Untucked. Peaceful, but not exactly memorable television.');
  saveGame();
}

function applyPlayerEffects(effects={}, note='', targetId=null){
  const result=applyChoiceEffects(effects,{targetId,note,source:'player-choice'});
  return result;
}


function applySabotageAttempt(targetId){
  const player=getPlayerQueen();
  const target=gameState.queens.find(q=>q.id===targetId);
  const ep=gameState.currentEpisode;
  if(!player || !target || !ep)return;
  ensureQueenSocialStats(player);
  ensureQueenV14Stats(target);
  const success=Math.random()>=0.35;
  ep.sabotageAttempt={targetId:target.id,targetName:target.name,success,backfire:!success};
  if(success){
    const note=`Your sabotage lands. ${target.name} takes a challenge penalty, gets stressed, and the relationship gets much worse.`;
    applyPlayerEffects({production:10.5,fans:-1.25,stress:4,affinity:-49,respect:-20,queens:-1.25},note,target.id);
    applyQueenEffects(target,{challengeBonus:-4.0,stress:16,confidence:-6,momentum:-1},`${player.name}'s sabotage throws ${target.name} off before the challenge.`,player.id);
    maybeVillainEdit(player,0.22,`successfully sabotaged ${target.name}`);
    episodeSocialNote('workroom',note);
  }else{
    const note=`Your sabotage fails. Production notices the attempt, ${target.name} dislikes you even more, and your respect in the room drops.`;
    applyPlayerEffects({production:9,fans:-2.5,queens:-5,stress:6,affinity:-55,respect:-26},note,target.id);
    addStoryFlag(player.id,'villain_spark',`failed sabotage attempt against ${target.name}`,1);
    maybeVillainEdit(player,0.16,`failed sabotage attempt against ${target.name}`);
    episodeSocialNote('workroom',note);
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
function episodeScopedQueens(excludePlayer=false){
  const ep=gameState.currentEpisode;
  let pool=liveQueens(excludePlayer);
  if(ep?.special==='tournament_bracket' && Array.isArray(ep.participantIds) && ep.participantIds.length){
    const activeIds=new Set(ep.participantIds);
    pool=pool.filter(q=>activeIds.has(q.id));
  }
  return pool;
}
function isPlayerInCurrentEpisode(){
  const ep=gameState.currentEpisode;
  if(ep?.special==='tournament_bracket' && Array.isArray(ep.participantIds) && ep.participantIds.length){
    return ep.participantIds.includes(gameState.playerQueenId);
  }
  const player=getPlayerQueen();
  return !!player && !player.isEliminated;
}
function fillSocialText(t, a, b){
  return String(t||'').replace(/\{a\}/g,a?.name||'A queen').replace(/\{b\}/g,b?.name||'another queen');
}
function generateWorkroomSocialEvents(){
  const ep=gameState.currentEpisode;
  if(ep.socialEvents && ep.socialEvents.length)return ep.socialEvents;
  const active=episodeScopedQueens();
  const player=getPlayerQueen();
  const events=[];
  const count=Math.random()<0.25?3:2;
  for(let i=0;i<count;i++){
    const ev=sample(SOCIAL_EVENTS);
    const others=shuffle(active.filter(q=>q.id!==player.id));
    const involvesPlayer=isPlayerInCurrentEpisode() && Math.random()<0.45;
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
  return episodeScopedQueens(true).sort((a,b)=>a.name.localeCompare(b.name));
}
function generateUntuckedSpontaneous(){
  const ep=gameState.currentEpisode;
  if(ep.untuckedSpontaneous)return ep.untuckedSpontaneous;
  const active=episodeScopedQueens();
  const a=sample(active), b=sample(active.filter(q=>q.id!==a?.id));
  ep.untuckedSpontaneous=fillSocialText(sample(UNTUCKED_SPONTANEOUS),a,b);
  saveGame();
  return ep.untuckedSpontaneous;
}
function applyUntuckedAction(actionId,targetId=null){
  const action=UNTUCKED_ACTIONS[actionId];
  if(!action)return;
  const player=getPlayerQueen();
  const target=targetId?gameState.queens.find(q=>q.id===targetId):null;
  let note=target?`${action.text} Target: ${target.name}.`:action.text;
  gameState.currentEpisode.untuckedChoice={action:action.label,targetId:target?.id||null,targetName:target?.name||null};

  if(action.dynamicEffect==='spreadRumor' && target){
    const witnesses=randomLiveQueens(3,[player?.id,target.id]);
    const names=witnesses.map(q=>q.name).join(', ') || 'the room';
    const backfires=Math.random()<0.30;
    if(backfires){
      witnesses.forEach(q=>{
        changeRelationship(q.id,player.id,-30,-8);
        changeRelationship(player.id,q.id,-8,-3);
      });
      note=`Your rumor about ${target.name} backfires. ${names} trace it back to you and lose a lot of trust in you.`;
      applyPlayerEffects({production:10,fans:-2.5,stress:9,queens:-4,momentum:-1},note);
      addStoryFlag(player.id,'rumor_backfire',`A rumor about ${target.name} backfired in Untucked.`,1);
      maybeVillainEdit(player,0.28,`spread a rumor about ${target.name} and got caught`);
    }else{
      witnesses.forEach(q=>{
        changeRelationship(q.id,target.id,-32,-9);
        changeRelationship(target.id,q.id,-8,-3);
      });
      note=`You spread a rumor about ${target.name}. ${names} believe enough of it to pull away from her.`;
      applyPlayerEffects({production:11.5,fans:0.5,stress:4,queens:-1.25},note);
      addStoryFlag(player.id,'strategic_rumor',`Spread a rumor about ${target.name} in Untucked.`,1);
      addStoryFlag(target.id,'rumor_target',`${target.name} became the target of an Untucked rumor.`,1);
      maybeVillainEdit(player,0.18,`spread a rumor about ${target.name}`);
    }
    ensureEpisodeEffects().untuckedNotes.push(note);
    saveGame();
    return;
  }

  if(action.dynamicEffect){
    const built=buildDynamicPlayerEffects(action.dynamicEffect,target);
    if(built){
      note=built.note;
      applyPlayerEffects(built.effects,note,target?.id||null);
    }
    if(action.dynamicEffect==='comfort' && target){
      applyQueenEffects(target,{stress:-12,confidence:3},`${player.name} comforts ${target.name} in Untucked.`,player.id);
    }
    if(action.dynamicEffect==='provoke' && target){
      applyQueenEffects(target,{stress:8,confidence:-2},`${player.name} provokes ${target.name} in Untucked.`,player.id);
      if(Math.random()<0.45){
        const arg=`An argument breaks out between you and ${target.name}.`;
        gameState.currentEpisode.argumentEvent={targetId:target.id,targetName:target.name,text:arg};
        addStoryFlag(player.id,'argument',arg,1);
        note+=` ${arg}`;
      }
    }
    if(action.dynamicEffect==='apologize' && target){
      applyQueenEffects(target,{stress:-4},`${player.name}'s apology lowers the temperature with ${target.name}.`,player.id);
      const rel=gameState.relationships?.[player.id]?.[target.id];
      if(rel && (rel.affinity||0)>-15 && Math.random()<0.55){
        const season=ensureSeasonSocialSystems();
        season.storyFlags.push({episode:gameState.currentEpisode?.number||null,queenId:player.id,targetId:target.id,type:'rivalry_cooled',reason:`Apologized to ${target.name}`,strength:1});
        note+=` The rivalry cools for now.`;
      }
    }
    if(action.dynamicEffect==='makeDrama'){
      maybeVillainEdit(player,0.24,'made drama in Untucked');
      addStoryFlag(player.id,'story_material','Untucked drama gave production more story material.',1);
    }
    if(action.dynamicEffect==='buildAlliance' && target){
      const alliance=createAlliance(player.id,target.id,'untucked');
      gameState.currentEpisode.createdAlliance={id:alliance?.id,targetId:target.id,targetName:target.name};
      addStoryFlag(player.id,'alliance_builder',`Built an alliance with ${target.name}`,1);
      addStoryFlag(target.id,'alliance_member',`Built an alliance with ${player.name}`,1);
    }
  }else{
    applyPlayerEffects(action.effects,note,target?.id||null);
  }
  ensureEpisodeEffects().untuckedNotes.push(note);
  saveGame();
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
  const active=episodeScopedQueens();
  const player=getPlayerQueen();
  const notes=[];
  reinforceAlliances().forEach(n=>notes.push(n));
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
  rehearse:{label:'rehearses hard',effects:{performance:3,energy:-10,stress:6,production:1.2}},
  runway:{label:'pours time into the runway',effects:{performance:-2,runway:6,energy:-8,stress:3,fans:2.5,production:0.5}},
  ask_help:{label:'asks another queen for help',needsTarget:true,effects:{performance:2,energy:-3,stress:-2,affinity:10,respect:5,fans:1.25,queens:1}},
  rest:{label:'protects her energy',effects:{performance:-2,energy:12,stress:-6,production:-1.25}},
  chaos:{label:'tries something chaotic',effects:{performance:0,energy:-8,stress:8,production:5.2,fans:2.5}}
};

const NPC_APPROACHES = {
  safe:{label:'plays it safe',risk:'safe',effects:{performance:1,energy:-3,stress:-1,production:-1.5}},
  risk:{label:'goes all in',risk:'risk',effects:{performance:2,energy:-8,stress:6,production:2.5,fans:2.5}},
  unexpected:{label:'does something unexpected',risk:'unexpected',effects:{performance:0,energy:-6,stress:7,production:5.2,fans:2.5}}
};

const NPC_SOCIAL_EVENTS = [
  {type:'friendship', text:'{a} and {b} bond over sewing chaos.', effects:{affinity:21,respect:6,stress:-2,fans:1.25,queens:1}},
  {type:'mentor', text:'{a} gives {b} a useful note before filming.', effects:{affinity:15,respect:16,performance:1,fans:1.25,queens:1}},
  {type:'conflict', text:'{a} snaps at {b} over rehearsal time.', effects:{affinity:-28,respect:-9,stress:4,production:2.6,fans:-1.25,queens:-1}},
  {type:'shade', text:'{a} reads {b} just a little too accurately.', effects:{affinity:-20,respect:-3,production:3.8,fans:1,queens:-0.5}},
  {type:'alliance', text:'{a} and {b} quietly start comparing notes for future weeks.', effects:{affinity:20,respect:11,queens:2}},
  {type:'sabotage', text:'{a} “accidentally” leaves {b} with the weaker material pile.', effects:{affinity:-36,respect:-13,performance:-1,stress:5,production:3.8,fans:-1.25,queens:-1.5}},
  {type:'comfort', text:'{a} checks on {b} after the critiques hit hard.', effects:{affinity:25,respect:9,stress:-4,fans:2.6,queens:2}},
  {type:'jealousy', text:'{a} admits she is tired of watching {b} get praise.', effects:{affinity:-18,respect:4,stress:3,production:2.6,queens:-0.5}},
{type:'friendship', text:'{a} lends {b} her favorite lace-front wig after a styling disaster.', effects:{affinity:26,respect:12,performance:1,stress:-4,queens:2}},
  {type:'mentor', text:'{a} shares a deeply personal mirror moment with {b} while doing their base makeup.', effects:{affinity:24,respect:18,stress:-3,production:4.5,fans:3.5,queens:2.5}},
  {type:'conflict', text:'{a} accuses {b} of stealing her rhinestones and custom body glue from her station.', effects:{affinity:-32,respect:-12,stress:6,production:4.0,queens:-1.5}},
  {type:'shade', text:'{a} stares intently at {b}\'s garment, sighs heavily, and walks away without saying a word.', effects:{affinity:-22,respect:5,stress:4,production:3.2,fans:1.8}},
  {type:'alliance', text:'{a} and {b} secretly agree to target the strongest queen in the room during the next group challenge.', effects:{affinity:22,respect:8,stress:2,production:4.2,queens:1.5}},
  {type:'sabotage', text:'{a} gives {b} terrible, misleading runway advice on purpose while the production crew is on break.', effects:{affinity:-40,respect:-16,performance:-2,stress:7,production:-1.0,queens:-2}},
  {type:'comfort', text:'{a} helps {b} zip up her tight corset when she notices she is having a panic attack.', effects:{affinity:28,respect:14,stress:-6,fans:2.8,queens:2}},
  {type:'jealousy', text:'{a} critiques {b}\'s look behind her back, claiming the judges are showing blatant favoritism.', effects:{affinity:-20,respect:-6,stress:4,production:3.0,fans:-1.5,queens:-0.5}},
  
  {type:'drama', text:'{a} looks at {b}\'s outfit and mutters: "Well... at least you have a beautiful face."', effects:{affinity:-25,respect:-5,stress:5,production:3.5,fans:2.0,queens:-1}},
  {type:'drama', text:'{a} aggressively interrupts {b}\'s emotional moment to ask if anyone has seen her extra pair of hips.', effects:{affinity:-18,respect:-10,stress:3,production:4.8,fans:3.0,queens:-1}},
  {type:'friendship', text:'{a} teaches {b} how to properly block her eyebrows for a cleaner canvas.', effects:{affinity:20,respect:15,performance:1,stress:-2,fans:1.5,queens:1}},
  {type:'conflict', text:'{a} and {b} get into a tense argument over who gets to use the good industrial sewing machine first.', effects:{affinity:-26,respect:-8,stress:5,production:3.5,queens:-1}},
  {type:'shade', text:'{a} asks {b} if she brought her runway outfit from a Halloween thrift store.', effects:{affinity:-24,respect:-4,stress:6,production:3.9,fans:2.5,queens:-1}},
  {type:'comfort', text:'{a} breaks down crying at her station, telling {b} about how her family rejected her when she started drag.', effects:{affinity:28,respect:15,stress:-4,production:4.8,fans:4.0,queens:3}},
  {type:'comfort', text:'{a} opens up to {b} about finally being accepted by her parents after years of silence, making the whole room emotional.', effects:{affinity:30,respect:18,stress:-6,production:5.0,fans:5.0,queens:3.5}},
  {type:'comfort', text:'{a} confesses to {b} that she was homeless before finding her drag family, and {b} hugs her tight.', effects:{affinity:29,respect:16,stress:-5,production:4.9,fans:4.5,queens:3}},
  {type:'friendship', text:'{a} wipes away {b}\'s tears as they bond over their shared struggles growing up queer in a small town.', effects:{affinity:27,respect:14,stress:-5,fans:3.8,queens:2.5}},
  {type:'comfort', text:'{a} feels overwhelmed by the competition, but {b} sits with her, holding her hand and reminding her that she belongs here.', effects:{affinity:26,respect:12,stress:-7,fans:3.0,queens:2}},
  {type:'comfort', text:'{a} shares a painful story about losing her drag mother, and {b} stops painting her face to listen and offer comfort.', effects:{affinity:25,respect:15,stress:-4,production:4.6,fans:4.2,queens:2.5}},
  {type:'friendship', text:'{a} and {b} share a beautiful moment looking at old photos of their chosen families back home.', effects:{affinity:22,respect:10,stress:-3,fans:2.5,queens:1.5}},
{type:'shade', text:'{a} gathers a small circle of queens at her station to make fun of {b}\'s tragic sewing skills.', effects:{affinity:-30,respect:-10,stress:6,production:4.2,fans:1.5,queens:-2}},
  {type:'friendship', text:'{a} stands up on a table and starts an impromptu, high-energy runway walk tutorial for the entire cast.', effects:{affinity:15,respect:18,performance:1,stress:-4,production:4.5,fans:3.5,queens:3}},
  {type:'conflict', text:'{a} loudly announces to the whole room that {b} has been talking trash behind everyone\'s backs.', effects:{affinity:-35,respect:-15,stress:8,production:5.5,fans:2.0,queens:-3}},
  {type:'drama', text:'{a} stands in front of the mirrors and drops a massive emotional bombshell, reducing the entire cast to tears.', effects:{affinity:20,respect:15,stress:-3,production:5.2,fans:4.8,queens:4}},
  {type:'conflict', text:'{a} and {b} get into a screaming match so intense that a producer has to step in to break them up.', effects:{affinity:-40,respect:-18,stress:9,production:6.5,fans:-1.0,queens:-2.5}},
  {type:'friendship', text:'The fire alarm accidentally goes off, forcing {a}, {b}, and the rest of the girls to evacuate in half-done makeup.', effects:{affinity:18,stress:5,production:4.0,fans:5.0,queens:2}}
];

const UNTUCKED_NPC_EVENTS = [
  {text:'{a} comforts {b} in the corner of the lounge.', effects:{affinity:23,respect:9,stress:-3,fans:2.6,queens:2}},
  {text:'{a} confronts {b} about fake compliments.', effects:{affinity:-26,respect:-10,stress:5,production:3.8,fans:-1.25,queens:-1}},
  {text:'{a} apologizes to {b}, and the room actually believes it.', effects:{affinity:20,respect:10,stress:-2,queens:2,fans:1}},
  {text:'{a} and {b} make a tiny pact to watch each other’s backs.', effects:{affinity:21,respect:13,queens:2}},
  {text:'{a} throws a little shade at {b}, and everyone pretends not to hear.', effects:{affinity:-15,respect:-4,stress:2,production:2.6,queens:-0.5}},
  {text:'{a} admits she underestimated {b}.', effects:{respect:19,affinity:9,queens:1.5}},
  {text:'{a} says {b} is getting a winner edit, and the lounge goes quiet.', effects:{affinity:-11,respect:11,stress:3,production:3.8,queens:-0.5}},

  {text:'{a} looks at {b} and says: "Your drag is beautiful, but your personality is garbage."', effects:{affinity:-30,respect:-12,stress:6,production:5.0,fans:2.0,queens:-2}},
  {text:'{a} starts screaming at {b} while aggressively removing her heavy jewelry.', effects:{affinity:-28,respect:-15,stress:8,production:5.5,fans:3.0,queens:-2}},
  {text:'{a} rolls her eyes so hard at {b}\'s explanation that she almost ruins her makeup.', effects:{affinity:-18,respect:-8,stress:3,production:3.0,fans:1.5}},
  {text:'{a} dramatically storms out of the lounge to smoke a cigarette, leaving {b} talking alone.', effects:{affinity:-22,respect:-10,stress:5,production:4.5,fans:2.5,queens:-1}},
  {text:'{a} points at {b} and shouts: "I am NOT talking to you, I am talking to the judges!"', effects:{affinity:-25,respect:-14,stress:7,production:5.0,fans:3.5,queens:-1.5}},
  {text:'{a} laughs hysterically in {b}\'s face during a serious confrontation.', effects:{affinity:-35,respect:-18,stress:9,production:6.0,fans:2.8,queens:-3}},

  {text:'{a} whispers to {b} that the producers are clearly trying to orchestrate a rivalry between them.', effects:{affinity:18,respect:12,stress:4,production:-2.0,queens:1.5}},
  {text:'{a} accuses {b} of hiding her true personality when the cameras start rolling.', effects:{affinity:-24,respect:8,stress:5,production:4.0,fans:-1.0,queens:-1}},
  {text:'{a} stares straight into the camera lens while {b} is giving a boring speech.', effects:{affinity:-8,respect:5,production:3.5,fans:4.0}},
  {text:'{a} tells {b} that her runway outfit looked like a craft project, destroying her confidence.', effects:{affinity:-26,respect:-5,stress:8,production:4.2,fans:-2.0,queens:-1}},
  {text:'{a} tries to start a fake alliance with {b} just to avoid getting chosen for the lipsync.', effects:{affinity:5,respect:-10,stress:2,production:3.9,queens:0.5}},

  {text:'{a} breaks down in tears talking about her childhood, and {b} holds her hand tightly.', effects:{affinity:28,respect:15,stress:-6,fans:5.0,queens:3}},
  {text:'{a} admits to {b} that she felt completely invisible until this very challenge.', effects:{affinity:22,respect:14,stress:-4,fans:3.8,queens:2}},
  {text:'{a} opens up about an old family trauma, making {b} and the entire lounge weep.', effects:{affinity:25,respect:18,stress:-5,fans:6.0,queens:4}},
  {text:'{a} tells {b} that seeing her drag inspired her to finally come out to her parents.', effects:{affinity:30,respect:22,stress:-7,fans:5.5,queens:3.5}},

  {text:'{a} randomly stands up, does a high kick, rips her dress, and {b} starts screaming in panic.', effects:{affinity:5,respect:-5,stress:6,production:5.0,fans:4.5,queens:1}},
  {text:'{a} tries to fix {b}\'s wig, but accidentally pulls the whole thing off, creating an awkward silence.', effects:{affinity:-12,respect:-10,stress:5,production:4.8,fans:5.0,queens:-0.5}},
  {text:'{a} aggressively sips her drink through a straw while glaring fixedly at {b}.', effects:{affinity:-14,respect:6,stress:3,production:3.2,fans:3.0}},
  {text:'{a} falls asleep on the couch while {b} is pouring her heart out.', effects:{affinity:-20,respect:-12,stress:4,production:4.5,fans:4.2,queens:-2}},
  {text:'{a} claims she saw a ghost in the lighting rig, but {b} thinks she\'s just high on hairspray.', effects:{affinity:8,stress:2,production:3.5,fans:3.8,queens:1}}
];
function ensureQueenV14Stats(q){
  ensureQueenSocialStats(q);
  if(q.confidence===undefined) q.confidence=50;
  if(q.episodeModifiers===undefined) q.episodeModifiers={performance:0,runway:0};
  if(typeof ensurePerformanceArc==='function') ensurePerformanceArc(q);
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
  return applyChoiceEffects(effects,{queen:q,targetId,note,source:'queen-choice'});
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
  const player=gameState.queens.find(q=>q.id===playerId); if(player && isPlayerInCurrentEpisode())applyPersonalityEpisodeDrift(player);
  episodeScopedQueens(false).filter(q=>q.id!==playerId).forEach(q=>{
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
  const candidates=episodeScopedQueens(false).filter(o=>o.id!==q.id);
  if(!candidates.length)return null;
  return candidates.map(o=>({o,score:(gameState.relationships?.[q.id]?.[o.id]?.affinity||0)+(gameState.relationships?.[q.id]?.[o.id]?.respect||0)+rand(-20,20)})).sort((a,b)=>b.score-a.score)[0].o;
}

function pickNpcSocialEventForQueen(pool,a){
  const prof=(typeof getPersonalityProfile==='function')?getPersonalityProfile(a):{};
  const ambition=(typeof getAmbition==='function')?getAmbition(a):3;
  const tags=(typeof getQueenNarrativeTags==='function'?getQueenNarrativeTags(a):[]).map(t=>t.tag);
  const hasTag=t=>tags.includes(t);
  const weighted=pool.map(ev=>{
    let w=1;
    if(ev.type==='comfort'||ev.type==='friendship'||ev.type==='mentor'||ev.type==='alliance') w += (prof.helpBias||0)*5 + Math.max(0,(prof.social||5)-5)*0.25;
    if(ev.type==='conflict'||ev.type==='shade'||ev.type==='jealousy') w += (prof.dramaBias||0)*5 + Math.max(0,ambition-3)*0.3;
    if(ev.type==='sabotage') w += (prof.sabotageBias||0)*7 + Math.max(0,ambition-3)*0.6;
    if((prof.id==='kind'||prof.id==='sweet'||prof.id==='humble') && (ev.type==='sabotage'||ev.type==='conflict')) w*=0.25;
    if((prof.id==='chaotic'||prof.id==='dramatic'||prof.id==='hotheaded') && (ev.type==='conflict'||ev.type==='shade')) w*=1.8;

    // Narrative integration: tags change which existing short events are more likely.
    if(hasTag(NARRATIVE_TAGS?.VILLAIN) && ['conflict','shade','jealousy','sabotage'].includes(ev.type)) w*=2.4;
    if(hasTag(NARRATIVE_TAGS?.FAN_FAVORITE) && ['comfort','friendship','mentor','alliance'].includes(ev.type)) w*=2.0;
    if(hasTag(NARRATIVE_TAGS?.PRODUCERS_DREAM) && ['conflict','shade','jealousy','alliance','sabotage'].includes(ev.type)) w*=1.6;
    if(hasTag(NARRATIVE_TAGS?.FILLER) && ['conflict','shade','jealousy','sabotage'].includes(ev.type)) w*=1.25;
    if(hasTag(NARRATIVE_TAGS?.RISING) && ['comfort','friendship','mentor'].includes(ev.type)) w*=1.35;
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
  const active=episodeScopedQueens(false);
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
  episodeScopedQueens(false).forEach(q=>{
    ensureQueenV14Stats(q);
    applyChoiceEffects({energy:rand(-5,2),stress:rand(-2,6)},{queen:q,note:'Weekly wear and tear.',source:'weekly-wear',save:false});
  });
  ep.weeklyWearDone=true;
}
function npcCastStatusList(limit=6){ return episodeScopedQueens(true).slice(0,limit).map(q=>`<li><strong>${escapeHtml(q.name)}</strong> is moving through the episode in her own way.</li>`).join(''); }
function allQueenStatusMini(q){ return playerRelationshipLabel(q.id); }
