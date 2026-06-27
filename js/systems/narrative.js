// v28 — Narrative Engine
// Recalculates hidden season tags that let Ru, production, and the cast react to
// more than this week's raw score.
const NARRATIVE_TAGS = {
  FRONT_RUNNER:'front-runner',
  COMPETITIVE_THREAT:'competitive threat',
  LIP_SYNC_ASSASSIN:'lip sync assassin',
  FAN_FAVORITE:'fan favorite',
  PRODUCERS_DREAM:"producer's dream",
  VILLAIN:'villain edit',
  FILLER:'filler queen',
  RISING:'rising star',
  REDEMPTION:'redemption arc',
  WILDCARD:'wildcard',
  FASHION:'fashion queen',
  COMEDY:'comedy queen',
  PERFORMER:'performer',
  FADING:'fading',
  SURVIVOR:'survivor'
};
function queenHistory(q){return q?.episodeHistory||[];}
function placementCounts(q){
  const h=queenHistory(q);
  const count=p=>h.filter(x=>String(x.placement||'').toUpperCase()===p).length;
  return {win:count('WIN'), high:count('HIGH')+count('TOP2'), safe:count('SAFE'), low:count('LOW'), btm:count('BTM'), elim:count('ELIM')};
}
function trackRecordPower(q){
  const c=placementCounts(q);
  return c.win*5 + c.high*3 + c.safe*1 + c.low*(-1) + c.btm*(-3) + c.elim*(-6) + (q.momentum||0)*1.2;
}
function currentFrontRunnerIds(){
  const active=(gameState.queens||[]).filter(q=>!q.isEliminated);
  if(!active.length)return [];
  const scored=active.map(q=>({id:q.id,score:trackRecordPower(q)}));
  const max=Math.max(...scored.map(s=>s.score));
  return scored.filter(s=>s.score>=max-0.5).map(s=>s.id);
}
function avgRelationshipScore(q){
  const rels=Object.values(gameState.relationships?.[q.id]||{});
  if(!rels.length)return 0;
  return rels.reduce((t,r)=>t+(r.affinity||0)+(r.respect||0)*.6,0)/rels.length;
}

function worstRelationshipQueenId(){
  const queens=gameState.queens||[];
  if(!queens.length)return null;
  const scored=queens.map(q=>({id:q.id,score:avgRelationshipScore(q)})).sort((a,b)=>a.score-b.score);
  return scored[0]?.id||null;
}
function runwayAverage(q){
  const vals=queenHistory(q).map(h=>Number(h.runway||h.runwayScore||0)).filter(Boolean);
  if(!vals.length)return q.attributes?.runway||0;
  return vals.reduce((a,b)=>a+b,0)/vals.length;
}
function challengeStrength(q,types=[]){
  const h=queenHistory(q).filter(x=>types.includes(x.challengeType));
  if(!h.length)return 0;
  return h.reduce((s,x)=>s+(String(x.placement).toUpperCase()==='WIN'?3:String(x.placement).toUpperCase()==='HIGH'?2:String(x.placement).toUpperCase()==='LOW'?-1:String(x.placement).toUpperCase()==='BTM'?-2:0),0);
}
function recentTrend(q){
  const h=queenHistory(q).slice(-3);
  if(h.length<2)return 0;
  const value=p=>({WIN:5,HIGH:3,TOP2:3,SAFE:1,LOW:-1,BTM:-3,ELIM:-5}[String(p||'').toUpperCase()]||0);
  return value(h[h.length-1].placement)-value(h[0].placement);
}
function addNarrativeTag(scores,tag,strength,reason){
  if(!strength)return;
  scores[tag]=(scores[tag]||0)+strength;
  scores._reasons=scores._reasons||{};
  scores._reasons[tag]=reason||scores._reasons[tag]||'';
}
function calculateNarrativeTags(q){
  if(!q)return [];
  const c=placementCounts(q);
  const pub=q.publicScores||{};
  const scores={};
  const power=trackRecordPower(q);
  const rel=avgRelationshipScore(q);
  const trend=recentTrend(q);
  const history=queenHistory(q);
  const lipWins=q.statistics?.lipSyncWins||history.filter(h=>h.lipSyncWin).length||0;
  const bottoms=q.statistics?.bottoms||c.btm;
  const wins=q.statistics?.wins||c.win;
  const highs=q.statistics?.highs||c.high;
  const prod=pub.production||0;
  const fans=pub.fans||0;
  const type=String(q.type||'').toLowerCase();
  const personality=String(q.personalityId||q.personality||'').toLowerCase();
  const frontIds=currentFrontRunnerIds();

  if(frontIds.includes(q.id))addNarrativeTag(scores,NARRATIVE_TAGS.FRONT_RUNNER,5,'best track record right now');
  if(power>=8 || wins>=1&&highs>=2)addNarrativeTag(scores,NARRATIVE_TAGS.COMPETITIVE_THREAT,Math.min(5,2+wins+Math.floor(highs/2)),'track record makes her dangerous');
  if(lipWins>=2 || ((q.attributes?.lipSync||0)>=8 && bottoms>=1))addNarrativeTag(scores,NARRATIVE_TAGS.LIP_SYNC_ASSASSIN,Math.min(5,lipWins+2),'proven under the lights');
  if(fans>=18 || (fans>=8&&rel>18))addNarrativeTag(scores,NARRATIVE_TAGS.FAN_FAVORITE,Math.min(5,2+Math.floor(fans/18)),'audience connection');
  if(prod>=20 || (prod>=10&&['chaotic','dramatic','funny','calculating'].includes(personality)))addNarrativeTag(scores,NARRATIVE_TAGS.PRODUCERS_DREAM,Math.min(5,2+Math.floor(prod/18)),'gives the edit material');
  if(prod>=12 && (fans<0 || rel<-18))addNarrativeTag(scores,NARRATIVE_TAGS.VILLAIN,Math.min(5,2+Math.floor((prod+Math.max(0,-rel))/25)),'polarizing television');
  if(q.id===worstRelationshipQueenId() && rel<10)addNarrativeTag(scores,NARRATIVE_TAGS.VILLAIN,4,'worst cast relationships of the season');
  if(history.length>=4 && wins===0 && highs<=1 && prod<8 && Math.abs(fans)<12)addNarrativeTag(scores,NARRATIVE_TAGS.FILLER,3,'not shaping the season yet');
  if(trend>=3 || (history.length>=4 && wins+highs>=2 && queenHistory(q).slice(0,2).some(h=>['LOW','BTM'].includes(String(h.placement).toUpperCase()))))addNarrativeTag(scores,NARRATIVE_TAGS.RISING,3+Math.max(0,trend/2),'getting stronger');
  if(history.slice(-2).some(h=>['LOW','BTM'].includes(String(h.placement).toUpperCase())) && ['WIN','HIGH','TOP2'].includes(String(history.at(-1)?.placement||'').toUpperCase()))addNarrativeTag(scores,NARRATIVE_TAGS.REDEMPTION,4,'bounced back');
  if(wins>=1 && bottoms>=1 || personality==='chaotic')addNarrativeTag(scores,NARRATIVE_TAGS.WILDCARD,3,'unpredictable run');
  if(runwayAverage(q)>=8 || type.includes('fashion')||type.includes('look')||type.includes('ballroom'))addNarrativeTag(scores,NARRATIVE_TAGS.FASHION,3,'runway identity');
  if(challengeStrength(q,['snatchgame','roast','improv','comedy'])>=3 || type.includes('comedy')||personality==='funny')addNarrativeTag(scores,NARRATIVE_TAGS.COMEDY,3,'comedy wins attention');
  if(challengeStrength(q,['girlgroup','talentshow','rusical'])>=3 || type.includes('perform')||type.includes('dance'))addNarrativeTag(scores,NARRATIVE_TAGS.PERFORMER,3,'performance strengths');
  if(trend<=-3 && (wins+highs)>=2)addNarrativeTag(scores,NARRATIVE_TAGS.FADING,3,'early spark is cooling');
  if(bottoms>=2)addNarrativeTag(scores,NARRATIVE_TAGS.SURVIVOR,Math.min(5,bottoms),'survived danger repeatedly');

  const tags=Object.entries(scores)
    .filter(([k])=>k!=='_reasons')
    .map(([tag,strength])=>({tag,strength:Math.round(strength*10)/10,reason:scores._reasons?.[tag]||''}))
    .sort((a,b)=>b.strength-a.strength);
  return tags;
}
function recalcNarrativeTags(){
  (gameState.queens||[]).forEach(q=>{q.narrativeTags=calculateNarrativeTags(q);});
  return gameState.queens;
}
function getQueenNarrativeTags(q){
  if(!q)return [];
  if(!q.narrativeTags || !q.narrativeTags.length) q.narrativeTags=calculateNarrativeTags(q);
  return q.narrativeTags;
}
function hasNarrativeTag(q,tag){return getQueenNarrativeTags(q).some(t=>t.tag===tag);}
function primaryNarrativeTag(q){return getQueenNarrativeTags(q)[0]?.tag||'';}
function ruNarrativeComment(q, placement){
  const tags=getQueenNarrativeTags(q).map(t=>t.tag);
  const p=String(placement||'SAFE').toUpperCase();
  const positive=['WIN','HIGH','TOP2'].includes(p);
  const bottom=['LOW','BTM'].includes(p);
  const lines={
    [NARRATIVE_TAGS.FRONT_RUNNER]: positive?['Week after week, you keep setting the standard.','You reminded everyone why you are one of the queens to beat.']:['Even the strongest queens stumble. What matters is how you recover.','When you set the bar high, we hold you to it.'],
    [NARRATIVE_TAGS.COMPETITIVE_THREAT]:['Every queen in this room knows you are a threat.','You are still very much in this race.'],
    [NARRATIVE_TAGS.LIP_SYNC_ASSASSIN]:['You have shown us that when the music starts, you come alive.','You never make it easy to count you out.'],
    [NARRATIVE_TAGS.FAN_FAVORITE]:['There is something about you people want to root for.','The audience connects with you, and I can see why.'],
    [NARRATIVE_TAGS.PRODUCERS_DREAM]:['Every week, you give us something to remember.','You know how to command our attention.'],
    [NARRATIVE_TAGS.VILLAIN]:['Whether people agree with you or not, they cannot stop watching you.','You always make us feel something.'],
    [NARRATIVE_TAGS.FILLER]:['Do not let this competition pass you by.','We know there is more to you. Let us see it.'],
    [NARRATIVE_TAGS.RISING]:['You are becoming clearer and more confident every week.','This is the growth we have been waiting to see.'],
    [NARRATIVE_TAGS.REDEMPTION]:['That is the comeback we needed from you.','You took the note and came back fighting.'],
    [NARRATIVE_TAGS.WILDCARD]:['With you, I never quite know what is coming next.','Your unpredictability can be your power.'],
    [NARRATIVE_TAGS.FASHION]:['The runway has become your playground.','You know how to tell a story through a look.'],
    [NARRATIVE_TAGS.COMEDY]:['You know how to make the room lean in and laugh.','Comedy is becoming part of your signature.'],
    [NARRATIVE_TAGS.PERFORMER]:['The stage clearly feels like home to you.','When performance is involved, you know how to wake up.'],
    [NARRATIVE_TAGS.FADING]:['You started strong, but I need to see that fire again.','Do not let your story peak too early.'],
    [NARRATIVE_TAGS.SURVIVOR]:['You have proven you know how to fight for your place here.','Surviving is not the same as thriving, but it still says something.']
  };
  const external=gameState.data?.narrativeExpansion?.rupaulComments || gameState.data?.narrativeText?.rupaulComments || {};
  const pick=tags.find(t=>external[t] || lines[t]);
  if(pick) return sample(external[pick] || lines[pick]);
  if(bottom)return sample(['This competition is getting tougher, and I need you to fight.','We need more from you, because I believe there is more there.']);
  if(positive)return sample(['This week, you made a real impression.','You should feel proud of what you showed us.']);
  return sample(['You are safe, but do not get too comfortable.','Keep pushing. We are still watching.']);
}
function narrativeEventForEpisode(stage='workroom'){
  const ep=gameState.currentEpisode;
  if(!ep)return null;
  const key=stage==='untucked'?'narrativeUntuckedEvent':'narrativeWorkroomEvent';
  if(ep[key])return ep[key];
  recalcNarrativeTags();
  const active=(gameState.queens||[]).filter(q=>!q.isEliminated);
  if(!active.length)return null;
  const threats=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.COMPETITIVE_THREAT)&&!hasNarrativeTag(q,NARRATIVE_TAGS.FRONT_RUNNER));
  const assassins=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.LIP_SYNC_ASSASSIN));
  const favorites=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.FAN_FAVORITE));
  const fillers=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.FILLER));
  const villains=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.VILLAIN));
  let text='';
  const roll=Math.random();
  if(threats.length && roll<.25){ const q=sample(threats); text=`The room clocks ${q.name} as a real competitive threat.`; q.stress=clamp((q.stress||20)+3,0,100); }
  else if(assassins.length && roll<.45){ const q=sample(assassins); text=`Nobody looks thrilled at the idea of facing ${q.name} in a lip sync.`; q.publicScores.production=clamp((q.publicScores.production||0)+1,-100,100); }
  else if(favorites.length && roll<.65){ const q=sample(favorites); text=`The cast can feel how easy it is to root for ${q.name}.`; q.publicScores.fans=clamp((q.publicScores.fans||0)+1,-100,100); }
  else if(villains.length && roll<.82){ const q=sample(villains); text=`${q.name} says one sentence and somehow the whole room has a reaction.`; q.publicScores.production=clamp((q.publicScores.production||0)+2,-100,100); }
  else if(fillers.length){ const q=sample(fillers); text=`${q.name} quietly realizes she needs a moment before the season moves past her.`; q.stress=clamp((q.stress||20)+4,0,100); }
  if(!text)return null;
  ep[key]={text,type:'narrative'};
  return ep[key];
}
