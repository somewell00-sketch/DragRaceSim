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
    const affinityLoss=rand(-18,-8);
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
      changeRelationship(highQueen.id,winner.id,rand(-12,-4),rand(-2,0));
      return {fromId:highQueen.id,toId:winner.id,type:'small'};
    }

    if(roll<0.70){
      changeRelationship(highQueen.id,winner.id,rand(-20,-9),rand(-5,-2));
      return {fromId:highQueen.id,toId:winner.id,type:'large'};
    }

    return null;
  }).filter(Boolean);

  ep.highWinnerJealousyApplied=true;
  ep.highWinnerJealousyChanges=changes;

  return changes;
}


// ===== v31.5: every relationship change becomes a visible story beat, and strong ones become arcs =====
// changeRelationship stays the single entry point; this wrapper only records what changed and why it matters.
(function(){
  const base=changeRelationship;
  changeRelationship=function(fromId,toId,da=0,dr=0){
    const before=gameState.relationships?.[fromId]?.[toId]?{...gameState.relationships[fromId][toId]}:null;
    base(fromId,toId,da,dr);
    const after=gameState.relationships?.[fromId]?.[toId];
    const ep=gameState.currentEpisode;
    if(!before||!after||!ep)return;
    const delta=(after.affinity-before.affinity)+(after.respect-before.respect)*0.35;
    if(!delta)return;
    ep.relationshipLog=ep.relationshipLog||[];
    ep.relationshipLog.push({a:fromId,b:toId,d:Math.round(delta*10)/10,stage:ep.statsApplied?'untucked':(ep.placements?.length?'judging':'workroom')});
    updateRelationshipArc(fromId,toId);
  };
})();
function relationshipShiftBank(){return gameState.data?.narrativeExpansion?.relationshipShifts||{};}
function pairAffinity(a,b){const r1=gameState.relationships?.[a]?.[b],r2=gameState.relationships?.[b]?.[a];return ((Number(r1?.affinity)||0)+(Number(r2?.affinity)||0))/2;}
function relationshipArcs(){const s=gameState.season;if(!s)return [];s.relationshipArcs=s.relationshipArcs||[];return s.relationshipArcs;}
function relationshipArcBetween(a,b){return relationshipArcs().find(x=>(x.a===a&&x.b===b)||(x.a===b&&x.b===a));}
function updateRelationshipArc(a,b){
  const ep=gameState.currentEpisode; if(!ep||!gameState.season)return;
  const avg=pairAffinity(a,b);
  let arc=relationshipArcBetween(a,b);
  const type=avg<=-40?'rival':avg>=45?'ally':null;
  if(type && (!arc || (arc.type!==type && arc.type!=='truce'))){
    if(arc){arc.type=type;arc.since=ep.number;}else{arc={a,b,type,since:ep.number,lastCallback:null};relationshipArcs().push(arc);}
    ep.arcBeats=ep.arcBeats||[];
    if(!ep.arcBeats.some(x=>x.key===a+'|'+b||x.key===b+'|'+a))ep.arcBeats.push({key:a+'|'+b,a,b,type:type==='rival'?'rivalry':'friendship'});
  }
}
// Called by the workroom / Untucked screens. Returns HTML <li> items, written once per stage and saved.
function relationshipStoryBeats(stage){
  const ep=gameState.currentEpisode; if(!ep)return '';
  // Recomputed on every render (choices keep changing things), but each pair keeps the line it got first.
  ep.relationshipBeatText=ep.relationshipBeatText||{};
  const pickOnce=(key,list)=>{if(!ep.relationshipBeatText[key])ep.relationshipBeatText[key]=sample(list||[])||'';return ep.relationshipBeatText[key];};
  const bank=relationshipShiftBank();
  const name=id=>gameState.queens.find(q=>q.id===id)?.name||'';
  const playerId=gameState.playerQueenId;
  const log=(ep.relationshipLog||[]).filter(e=>stage==='workroom'?e.stage==='workroom':e.stage!=='workroom');
  const net={};
  log.forEach(e=>{const k=e.a+'>'+e.b;net[k]=(net[k]||0)+e.d;});
  const items=[];
  // new arcs first
  (ep.arcBeats||[]).filter(x=>!x.shown||x.shown===stage).forEach(x=>{x.shown=stage;const t=pickOnce('arc:'+x.key,bank[x.type]);if(t)items.push({p:3,txt:fillTemplate(t,{a:name(x.a),b:name(x.b)}),tag:x.type==='rivalry'?'Rivalry':'Alliance'});});
  const pairs=Object.entries(net).map(([k,d])=>{const [a,b]=k.split('>');return {a,b,d};}).filter(x=>Math.abs(x.d)>=6||((x.a===playerId||x.b===playerId)&&Math.abs(x.d)>=3));
  pairs.sort((x,y)=>Math.abs(y.d)-Math.abs(x.d));
  const playerPairs=pairs.filter(x=>x.a===playerId||x.b===playerId);
  const others=pairs.filter(x=>!playerPairs.includes(x));
  [...playerPairs.slice(0,3),...others.slice(0,3)].forEach(x=>{const t=pickOnce(stage+':'+x.a+'>'+x.b+(x.d>0?'+':'-'),bank[x.d>0?'positive':'negative']);if(t)items.push({p:x.a===playerId||x.b===playerId?2:1,txt:fillTemplate(t,{a:name(x.a),b:name(x.b)}),tag:x.d>0?'Closer':'Colder',d:x.d});});
  const hidden=pairs.length-Math.min(3,playerPairs.length)-Math.min(3,others.length);
  const html=items.map(i=>`<li class="relationship-beat"><span class="badge arc">${escapeHtml(i.tag)}</span> ${formatPlayerNameInSocialText(i.txt)}</li>`).join('')+(hidden>0?`<li class="small">+ ${hidden} smaller shift${hidden===1?'':'s'} in the room.</li>`:'');
  return html;
}
// Callbacks: a rivalry flares up in Untucked; Makeover week can call a truce.
function relationshipArcCallback(stage){
  const ep=gameState.currentEpisode; if(!ep)return null;
  ep.arcCallbacks=ep.arcCallbacks||{};
  if(ep.arcCallbacks[stage]!==undefined)return ep.arcCallbacks[stage];
  const active=id=>gameState.queens.some(q=>q.id===id&&!q.isEliminated);
  const bank=relationshipShiftBank();
  const name=id=>gameState.queens.find(q=>q.id===id)?.name||'';
  let out=null;
  const arcs=relationshipArcs().filter(x=>active(x.a)&&active(x.b));
  if(stage==='workroom' && ep.challengeType==='makeover'){
    const r=arcs.find(x=>x.type==='rival');
    if(r && Math.random()<0.6){changeRelationship(r.a,r.b,18,4);changeRelationship(r.b,r.a,18,4);r.type='truce';r.lastCallback=ep.number;out={tag:'Truce',txt:fillTemplate(sample(bank.reconciliation||[]),{a:name(r.a),b:name(r.b)})};}
  }
  if(stage==='untucked'){
    const r=arcs.filter(x=>x.type==='rival' && (x.lastCallback===null||ep.number-x.lastCallback>=2)).sort(()=>Math.random()-.5)[0];
    if(r && Math.random()<0.5){changeRelationship(r.a,r.b,-6,0);changeRelationship(r.b,r.a,-6,0);r.lastCallback=ep.number;out={tag:'Rivalry',txt:fillTemplate(sample(bank.confrontation||[]),{a:name(r.a),b:name(r.b)})};}
  }
  ep.arcCallbacks[stage]=out?`<li class="relationship-beat"><span class="badge arc">${escapeHtml(out.tag)}</span> ${formatPlayerNameInSocialText(out.txt)}</li>`:'';
  return ep.arcCallbacks[stage];
}
