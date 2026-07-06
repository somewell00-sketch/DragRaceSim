function randomAmbition(){return Math.max(1,Math.min(5,Math.ceil(Math.random()*5)));}

function getSeasonFormat(){return gameState.season?.format || gameState.settings?.seasonFormat || 'regular';}
function isTournamentFormat(format=getSeasonFormat()){return format==='tournament' || format==='brackets';}
function isAllStarsFormat(format=getSeasonFormat()){return ['legacy','assassin','no_elimination','tournament','brackets','all_winners'].includes(format);}
function usesLegacyLipSync(format=getSeasonFormat()){return ['legacy','no_elimination','tournament','brackets','all_winners'].includes(format);}
function usesGroupVote(format=getSeasonFormat()){return format==='assassin' || isTournamentFormat(format);}
function hasEliminationsDuringSeason(format=getSeasonFormat()){return format==='regular' || format==='legacy' || format==='assassin' || isTournamentFormat(format);}
function hasMissCongeniality(format=getSeasonFormat()){return format==='regular';}

function isLegacyCompetitiveEpisode(ep){
  return ['legacy','assassin'].includes(getSeasonFormat()) && !['premiere_no_elim','lalaparuza'].includes(ep?.special);
}


function ensureAllWinnersQueenState(q){
  if(!q)return q;
  if(typeof q.legendStars!=='number')q.legendStars=Number(q.legendStars)||0;
  q.blocked=!!q.blocked;
  if(typeof q.blockedBy==='undefined')q.blockedBy=null;
  if(typeof q.blocksReceived!=='number')q.blocksReceived=Number(q.blocksReceived)||0;
  if(typeof q.blocksGiven!=='number')q.blocksGiven=Number(q.blocksGiven)||0;
  return q;
}
function ensureAllWinnersState(){
  if(getSeasonFormat()!=='all_winners')return;
  (gameState.queens||[]).forEach(ensureAllWinnersQueenState);
  gameState.season.currentBlockedQueen=gameState.season.currentBlockedQueen||null;
}
function compareAllWinnersRanking(a,b){
  const as=a.statistics||{}, bs=b.statistics||{};
  return (Number(b.legendStars)||0)-(Number(a.legendStars)||0)
    || ((bs.wins||0)+(bs.highs||0))-((as.wins||0)+(as.highs||0))
    || trackRecordScore(b)-trackRecordScore(a)
    || String(a.name||'').localeCompare(String(b.name||''));
}
function allWinnersRankedQueens(){ensureAllWinnersState(); return [...(gameState.queens||[])].sort(compareAllWinnersRanking);}
function allWinnersStarLine(q){const n=Number(q?.legendStars)||0; return `${n>0?'⭐'.repeat(Math.min(n,10))+' ':''}${q?.name||'Queen'}${n>10?` (${n})`:''}`;}
function allWinnersScoreboardText(){return ['Legendary Legend Stars', ...allWinnersRankedQueens().map(allWinnersStarLine)].join('\n');}
function chooseAllWinnersBlockTarget(blockerId, immuneIds=[]){
  ensureAllWinnersState();
  const blocker=gameState.queens.find(q=>q.id===blockerId);
  const immuneSet=new Set([blockerId, ...(immuneIds||[])]);
  // In All Winners, both Top 2 queens are protected from the Secret Silver Plunger.
  // The lip sync winner cannot block herself, and she cannot block the other Top 2 queen.
  const candidates=(gameState.queens||[]).filter(q=>!immuneSet.has(q.id) && !q.isAssassin && !q.isEliminated);
  if(!blocker || !candidates.length)return null;
  const unblocked=candidates.filter(q=>!q.blocked);
  const pool=unblocked.length?unblocked:candidates;
  const scored=pool.map(q=>{
    const rel=gameState.relationships?.[blockerId]?.[q.id]||{};
    const affinity=Number(rel.affinity)||0;
    const st=q.statistics||{};
    const threat=(Number(q.legendStars)||0)*30 + (st.wins||0)*12 + (st.highs||0)*5;
    const rivalry=affinity<0?Math.abs(affinity)*0.8:-(affinity*0.45);
    return {id:q.id,score:threat+rivalry+rand(-8,8)};
  }).sort((a,b)=>b.score-a.score);
  return scored[0]?.id||pool[0]?.id||null;
}
function allWinnersBlockCandidates(blockerId, immuneIds=[]){
  ensureAllWinnersState();
  const immuneSet=new Set([blockerId, ...(immuneIds||[])]);
  const candidates=(gameState.queens||[]).filter(q=>!immuneSet.has(q.id) && !q.isAssassin && !q.isEliminated);
  const unblocked=candidates.filter(q=>!q.blocked);
  return (unblocked.length?unblocked:candidates).sort((a,b)=>{
    return (Number(b.legendStars)||0)-(Number(a.legendStars)||0)
      || ((b.statistics?.wins||0)+(b.statistics?.highs||0))-((a.statistics?.wins||0)+(a.statistics?.highs||0))
      || String(a.name||'').localeCompare(String(b.name||''));
  });
}


function isAllWinnersGiftStarEpisode(ep){
  return getSeasonFormat()==='all_winners' && ep && [5,10].includes(Number(ep.number));
}
function allWinnersGiftStarCandidates(giverId, top2Ids=[]){
  ensureAllWinnersState();
  const topSet=new Set(top2Ids||[]);
  return (gameState.queens||[]).filter(q=>q && !q.isAssassin && !q.isEliminated && q.id!==giverId && !topSet.has(q.id));
}
function chooseAllWinnersGiftStarTarget(giverId, top2Ids=[]){
  ensureAllWinnersState();
  const giver=gameState.queens.find(q=>q.id===giverId);
  const candidates=allWinnersGiftStarCandidates(giverId, top2Ids);
  if(!giver || !candidates.length)return null;
  const maxStars=Math.max(0,...(gameState.queens||[]).map(q=>Number(q.legendStars)||0));
  const scored=candidates.map(q=>{
    const rel=gameState.relationships?.[giverId]?.[q.id]||{};
    const affinity=Number(rel.affinity)||0;
    const st=q.statistics||{};
    const behind=Math.max(0,maxStars-(Number(q.legendStars)||0));
    const weakTrack=Math.max(0,4-((st.wins||0)*1.5+(st.highs||0)*0.75));
    const score=(behind*24)+(weakTrack*6)+(affinity*0.55)+rand(-7,7);
    return {id:q.id,score};
  }).sort((a,b)=>b.score-a.score);
  return scored[0]?.id||candidates[0]?.id||null;
}
function applyAllWinnersGiftStar(giverId, targetId, ep){
  const giver=gameState.queens.find(q=>q.id===giverId);
  const target=gameState.queens.find(q=>q.id===targetId);
  if(!giver || !target || giver.id===target.id)return null;
  const top2Ids=ep?.top2Queens||[];
  if(top2Ids.includes(target.id))return null;
  ensureAllWinnersQueenState(giver); ensureAllWinnersQueenState(target);
  target.legendStars=(Number(target.legendStars)||0)+1;
  ep.allWinnersGiftStars=ep.allWinnersGiftStars||[];
  ep.allWinnersGiftStars.push({giverId:giver.id,targetId:target.id,amount:1});
  ep.allWinnersGiftStarChosenBy=ep.allWinnersGiftStarChosenBy||{};
  ep.allWinnersGiftStarChosenBy[giver.id]=target.id;
  if(typeof changeRelationship==='function'){
    changeRelationship(target.id,giver.id,18,3);
    changeRelationship(giver.id,target.id,8,1);
  }
  return target;
}
function allWinnersGiftStarOrder(ep, result){
  const loserId=result?.top2LoserId||null;
  const winnerId=result?.survivorId||null;
  return [loserId,winnerId].filter(Boolean);
}
function finishAllWinnersPostGiftBlock(ep,result){
  if(!ep || !result || result.outcome!=='allWinnersTopAllStar')return result;
  if(result.blockedQueenId || ep.waitingForAllWinnersBlockChoice)return result;
  const winnerId=result.survivorId;
  if(winnerId===gameState.playerQueenId && !ep.playerAllWinnersBlockChosen){
    ep.waitingForAllWinnersBlockChoice=true;
    result.blockedQueenId=null;
  }else{
    const blockedId=typeof chooseAllWinnersBlockTarget==='function'?chooseAllWinnersBlockTarget(winnerId, ep.top2Queens||[]):null;
    if(blockedId && typeof applyAllWinnersBlock==='function')applyAllWinnersBlock(winnerId, blockedId, ep);
    result.blockedQueenId=blockedId;
    ep.waitingForAllWinnersBlockChoice=false;
  }
  ep.lipSyncResult=result;
  return result;
}
function processAllWinnersGiftStars(ep,result){
  if(!isAllWinnersGiftStarEpisode(ep) || !result || result.outcome!=='allWinnersTopAllStar')return finishAllWinnersPostGiftBlock(ep,result);
  ep.allWinnersGiftStarChosenBy=ep.allWinnersGiftStarChosenBy||{};
  const order=allWinnersGiftStarOrder(ep,result);
  for(const giverId of order){
    if(ep.allWinnersGiftStarChosenBy[giverId])continue;
    if(giverId===gameState.playerQueenId){
      ep.waitingForAllWinnersStarChoice=true;
      result.waitingForAllWinnersStarChoice=true;
      ep.lipSyncResult=result;
      return result;
    }
    const targetId=chooseAllWinnersGiftStarTarget(giverId, ep.top2Queens||[]);
    if(targetId)applyAllWinnersGiftStar(giverId,targetId,ep);
  }
  ep.waitingForAllWinnersStarChoice=false;
  result.waitingForAllWinnersStarChoice=false;
  return finishAllWinnersPostGiftBlock(ep,result);
}

function applyAllWinnersBlock(blockerId, blockedId, ep){
  const blocker=gameState.queens.find(q=>q.id===blockerId);
  const blocked=gameState.queens.find(q=>q.id===blockedId);
  if(!blocker || !blocked || blocker.id===blocked.id)return null;
  ensureAllWinnersQueenState(blocker); ensureAllWinnersQueenState(blocked);
  (gameState.queens||[]).forEach(q=>{q.blocked=false;});
  blocked.blocked=true; blocked.blockedBy=blocker.id; blocked.blocksReceived+=1; blocker.blocksGiven+=1;
  gameState.season.currentBlockedQueen=blocked.id;
  if(typeof changeRelationship==='function'){
    changeRelationship(blocked.id, blocker.id, -35, -6);
    changeRelationship(blocker.id, blocked.id, -20, -3);
    Object.entries(gameState.relationships?.[blocked.id]||{}).forEach(([allyId,rel])=>{if(allyId!==blocker.id && allyId!==blocked.id && (Number(rel.affinity)||0)>=25)changeRelationship(allyId, blocker.id, -5, 0);});
  }
  if(ep){ep.blockedQueenId=blocked.id; ep.blockedByQueenId=blocker.id; ep.blockText=`${blocker.name} blocks ${blocked.name} from receiving a Legendary Legend Star next week.`;}
  return blocked;
}
function applyAllWinnersStarsForEpisode(ep){
  if(getSeasonFormat()!=='all_winners' || !ep || ep.allWinnersStarsApplied)return;
  ensureAllWinnersState();
  const blockedAtStart=ep.blockedQueenAtStart||null;
  const lipWinnerId=ep.lipSyncResult?.survivorId||null;
  const starAwards=[];
  (ep.top2Queens||[]).forEach(id=>{
    const q=gameState.queens.find(x=>x.id===id); if(!q)return;
    const amount=(ep.number===11 && id===lipWinnerId)?3:1;
    const blocked=id===blockedAtStart;
    if(!blocked)q.legendStars=(Number(q.legendStars)||0)+amount;
    starAwards.push({queenId:id,amount:blocked?0:amount,blocked});
  });
  ep.allWinnersStarAwards=starAwards;
  ep.allWinnersBlockedNoStar=starAwards.filter(a=>a.blocked).map(a=>a.queenId);
  ep.allWinnersScoreboard=allWinnersScoreboardText();
  ep.allWinnersStarsApplied=true;
  if(ep.number===11){const ranked=allWinnersRankedQueens(); gameState.season.allWinnersTop4=ranked.slice(0,4).map(q=>q.id); gameState.season.allWinnersSecondary4=ranked.slice(4,8).map(q=>q.id);}
}

function bottomPerformanceRankScore(bottomId, bottomIds){
  const ep=gameState.currentEpisode;
  const placements=ep?.placements||[];
  const bottomScores=(bottomIds||[]).map(id=>placements.find(p=>p.queenId===id)).filter(Boolean).sort((a,b)=>a.score-b.score);
  const idx=bottomScores.findIndex(p=>p.queenId===bottomId);
  if(idx<0)return 0;
  return (bottomScores.length-1-idx)*4;
}

function chooseAssassinVote(voterId, bottomIds){
  const voter=gameState.queens.find(q=>q.id===voterId);
  let candidates=(bottomIds||[]).filter(id=>id!==voterId).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  if(!candidates.length)candidates=(bottomIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  if(!voter || !candidates.length)return bottomIds?.[0]||null;
  const scored=candidates.map(q=>{
    const rel=gameState.relationships?.[voter.id]?.[q.id]||{};
    const affinity=Number(rel.affinity)||0;
    const wins=Number(q.statistics?.wins)||0;
    const highs=Number(q.statistics?.highs)||0;
    const lows=Number(q.statistics?.lows)||0;
    const bottoms=Number(q.statistics?.bottoms)||0;
    const performanceCase=bottomPerformanceRankScore(q.id,bottomIds);
    const trackRecordCase=(bottoms*8)+(lows*3)-(wins*7)-(highs*2);
    const threat=(wins*10)+(highs*4);
    const social=affinity<0?Math.abs(affinity)*0.45:-(affinity*0.62);
    const score=performanceCase*0.75 + trackRecordCase*0.55 + threat*0.35 + social + rand(-6,6);
    return {id:q.id,score};
  }).sort((a,b)=>b.score-a.score);
  return scored[0]?.id||candidates[0].id;
}

function tallyVotes(votesObj){
  const tally={};
  Object.values(votesObj||{}).forEach(id=>{if(id)tally[id]=(tally[id]||0)+1;});
  return tally;
}

function resolveVoteResult(votesObj, tieBreakerChoice, bottomIds){
  const tally=tallyVotes(votesObj);
  const entries=Object.entries(tally).filter(([id])=>(bottomIds||[]).includes(id));
  if(!entries.length)return (bottomIds||[])[0]||null;
  const max=Math.max(...entries.map(([,v])=>v));
  const tied=entries.filter(([,v])=>v===max).map(([id])=>id);
  if(tied.length===1)return tied[0];
  if(tieBreakerChoice && tied.includes(tieBreakerChoice))return tieBreakerChoice;
  const ranked=(bottomIds||[]).filter(id=>tied.includes(id)).sort((a,b)=>bottomPerformanceRankScore(b,bottomIds)-bottomPerformanceRankScore(a,bottomIds));
  return ranked[0]||tied[0];
}

function createLipSyncAssassin(){
  let name='Lip Sync Assassin';
  try{ if(typeof generatedQueenName==='function') name=generatedQueenName(Math.floor(Math.random()*99999)+50000,new Set(gameState.queens.map(q=>q.name))); }catch(e){}
  const lipSync=typeof rand==='function'?rand(8,9):(Math.round((Math.random()+8)*10)/10);
  const cunt=typeof rand==='function'?rand(5,9):(Math.round((Math.random()*4+5)*10)/10);
  return {id:'lip_sync_assassin',name,type:'Lip Sync Assassin',isAssassin:true,attributes:{cunt,lipSync,makeup:7,sewing:7,runway:8,acting:7},statistics:{lipSyncWins:0,lipSyncLosses:0,wins:0,highs:0,lows:0,bottoms:0},publicScores:{production:25},momentum:0,inventory:{reveals:1}};
}
function getDefaultRegularCastSizes(){return [8,9,10,11,12,13,14,15,16];}
function getAllowedCastSizes(format='regular'){
  if(format==='all_winners')return [8];
  if(isTournamentFormat(format))return [18];
  if(format==='assassin')return [8,9,10,11,12];
  if(['legacy','no_elimination'].includes(format))return [8,9,10];
  return getDefaultRegularCastSizes();
}
function normalizeSeasonFormat(format){
  if(format==='brackets')return 'tournament';
  return ['regular','legacy','assassin','no_elimination','tournament','all_winners'].includes(format)?format:'regular';
}
function resolveCastSizeForFormat(castSize, format='regular'){
  const allowed=getAllowedCastSizes(format);
  if(String(castSize)==='random')return sample(allowed);
  const requested=Number(castSize||allowed[allowed.length-1]);
  if(allowed.includes(requested))return requested;
  return allowed.reduce((best,n)=>Math.abs(n-requested)<Math.abs(best-requested)?n:best, allowed[0]);
}
function getEpisodeQueenIds(){
  const format=getSeasonFormat();
  if(format==='all_winners')return (gameState.queens||[]).map(q=>q.id);
  if(isTournamentFormat(format) && gameState.season?.brackets && gameState.season.brackets.stage!=='final'){
    const group=gameState.season.brackets.currentGroup;
    return (gameState.season.brackets.groups?.[group]||[]).filter(id=>!gameState.queens.find(q=>q.id===id)?.isEliminated);
  }
  return (gameState.queens||[]).filter(q=>!q.isEliminated).map(q=>q.id);
}
function getEpisodeQueens(){
  const ids=new Set(getEpisodeQueenIds());
  return (gameState.queens||[]).filter(q=>ids.has(q.id));
}
function chooseLipstick(topQueenId, bottomIds){
  const top=gameState.queens.find(q=>q.id===topQueenId);
  const candidates=(bottomIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  if(!top || !candidates.length)return bottomIds?.[0]||null;

  const topPersonality=String(top.personalityId||top.personality||'').toLowerCase();
  const isStrategic=['strategic','calculating','ambitious','competitive','shady'].some(k=>topPersonality.includes(k));
  const isLoyal=['sweet','sweetheart','kind','loyal','warm','motherly'].some(k=>topPersonality.includes(k));
  const isDrama=['dramatic','chaotic','shady','villain'].some(k=>topPersonality.includes(k));

  const scored=candidates.map(q=>{
    const rel=gameState.relationships?.[top.id]?.[q.id]||{};
    const affinity=Number(rel.affinity)||0;
    const respect=Number(rel.respect)||0;
    const wins=Number(q.statistics?.wins)||0;
    const highs=Number(q.statistics?.highs)||0;
    const lows=Number(q.statistics?.lows)||0;
    const bottoms=Number(q.statistics?.bottoms)||0;
    const lipSyncLosses=Number(q.statistics?.lipSyncLosses)||0;

    // Positive score means this bottom queen is more likely to be chopped.
    const threat=(wins*16)+(highs*5)-(bottoms*3);
    const trackRecordCase=(bottoms*12)+(lows*4)+(lipSyncLosses*5)-(wins*8)-(highs*2);
    const rivalry=affinity<0?Math.abs(affinity)*0.55:0;
    const friendship=affinity>0?affinity*0.72:0;
    const respectProtection=respect>0?respect*0.18:0;
    const respectThreat=respect<0?Math.abs(respect)*0.12:0;
    const productionAttention=Math.max(0, Number(q.publicScores?.production)||0)*0.06;
    const performanceCase=typeof bottomPerformanceRankScore==='function'?bottomPerformanceRankScore(q.id,bottomIds):0;

    let score=0;
    score+=performanceCase*0.65;
    score+=trackRecordCase*0.70;
    score+=threat*(isStrategic?0.95:0.45);
    score+=rivalry*(isDrama?1.25:0.85);
    score-=friendship*(isLoyal?1.45:0.95);
    score-=respectProtection;
    score+=respectThreat;
    score+=productionAttention;
    score+=rand(-8,8);

    return {id:q.id,score};
  }).sort((a,b)=>b.score-a.score);

  return scored[0]?.id||candidates[0].id;
}
function storedVoteFor(voterId){return gameState.currentEpisode?.legacyVotes?.[voterId] || gameState.currentEpisode?.groupVotes?.[voterId] || null;}
function getMostVotedQueenIds(votesByQueenId){
  const entries=Object.entries(votesByQueenId||{});
  if(!entries.length)return [];
  const max=Math.max(...entries.map(([,v])=>Number(v)||0));
  return entries.filter(([,v])=>(Number(v)||0)===max).map(([id])=>id);
}
function resolveVoteResult(votesByQueenId, tieBreakerQueenId, bottomIds=[]){
  const tiedIds=getMostVotedQueenIds(votesByQueenId).filter(id=>!bottomIds.length || bottomIds.includes(id));
  if(tiedIds.length<=1)return tiedIds[0]||bottomIds[0]||null;
  const tieBreakerChoice=storedVoteFor(tieBreakerQueenId);
  if(tieBreakerChoice && tiedIds.includes(tieBreakerChoice))return tieBreakerChoice;
  return tiedIds[0];
}
function createQueenFromForm(form){return {legendStars:0,blocked:false,blockedBy:null,blocksReceived:0,blocksGiven:0,id:'player_'+Date.now(),name:form.name||'Your Queen',type:form.type,personalityId:form.personalityId,isPlayer:true,location:form.location||window.currentUserCommunityLocation||'Unknown City, XXX',isEliminated:false,attributes:form.attributes,momentum:0,confidence:5,ambition:form.ambition||3,energy:80,stress:20,publicScores:{production:0,queens:0,fans:0},inventory:{reveals:3},portrait:form.portrait||{type:'gradient',image:null},statistics:{wins:0,highs:0,safes:0,lows:0,bottoms:0,lipSyncWins:0,lipSyncLosses:0,miniChallengeWins:0,episodesCompeted:0},episodeHistory:[],confessionals:[],performanceArc:null,tournamentPoints:0};}
function hydrateQueen(q){return {legendStars:0,blocked:false,blockedBy:null,blocksReceived:0,blocksGiven:0,...JSON.parse(JSON.stringify(q)),isPlayer:false,isEliminated:false,momentum:0,confidence:5,ambition:q.ambition||randomAmbition(),energy:80,stress:20,publicScores:{production:0,queens:0,fans:0},inventory:{reveals:3},portrait:q.portrait||{type:'gradient',image:null},statistics:{wins:0,highs:0,safes:0,lows:0,bottoms:0,lipSyncWins:0,lipSyncLosses:0,miniChallengeWins:0,episodesCompeted:0},episodeHistory:[],confessionals:[],performanceArc:null,tournamentPoints:0};}
function cloneAttributes(attrs){return JSON.parse(JSON.stringify(attrs||{cunt:7,lipSync:7,makeup:7,sewing:7,runway:7,acting:7}));}
function randomizeAttributes(base){
  const randomized={};
  ['cunt','lipSync','makeup','sewing','runway','acting'].forEach(attr=>{
    randomized[attr]=clamp(Math.round((Number(base[attr])||7)+rand(-1,2)),1,10);
  });
  return randomized;
}
function generatedQueenName(index, usedNames=new Set()){
  const parts=gameState.data.nameParts||{};
  const firsts=parts.firstNames||['Cherry','Divina','Maxi','Pearl','Sasha','Tina','Vera','Zaza'];
  const lasts=parts.lastNames||['Voltage','Storm','Minx','Panic','Static','Tension','Vixen','Royale'];
  for(let attempt=0; attempt<80; attempt++){
    const roll=Math.random();
    let name;
    if(roll<0.65){
      name=`${sample(firsts)} ${sample(lasts)}`;
    }else if(roll<0.80){
      name=sample(firsts);
    }else if(roll<0.90){
      name=`${sample(firsts)} ${sample(firsts)} ${sample(lasts)}`;
    }else{
      name=`${sample(firsts)} ${sample(lasts)} ${sample(lasts)}`;
    }
    if(!usedNames.has(name)){usedNames.add(name); return name;}
  }
  const fallback=`${sample(firsts)} ${sample(lasts)} ${index}`;
  usedNames.add(fallback);
  return fallback;
}
function slugifyQueenName(name,index){
  return String(name||('queen_'+index)).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')+'_'+index+'_'+Date.now();
}
function randomQueenLocation(){
  const locations=gameState.data?.locations || window.GAME_DATA?.locations || [];
  return locations.length ? sample(locations) : 'New York City, NY (USA)';
}
function makeGeneratedQueen(index, usedNames=new Set()){
  const types=gameState.data.queenTypes.filter(t=>t.name!=='Jack of All Trades');
  const type=sample(types)||gameState.data.queenTypes[0];
  const personality=sample(gameState.data.personalities);
  const attrs=randomizeAttributes(cloneAttributes(type.attributes));
  const name=generatedQueenName(index, usedNames);
  return hydrateQueen({
    id:slugifyQueenName(name,index),
    name,
    type:type.name,
    personalityId:personality?.id||'confident',
    location:randomQueenLocation(),
    ambition:randomAmbition(),
    attributes:attrs
  });
}
function makeExtraQueen(index){return makeGeneratedQueen(index,new Set());}
function buildNpcCast(size){
  const maxNpc=Number(size||14)>=18?17:15;
  const needed=Math.max(7,Math.min(maxNpc,Number(size||14)-1));
  return buildNpcCastExact(needed);
}
function buildNpcCastExact(count){
  const needed=Math.max(0,Number(count)||0);
  const usedNames=new Set();
  const cast=[];
  for(let i=1;i<=needed;i++) cast.push(makeGeneratedQueen(i, usedNames));
  return cast;
}
function uniqueQueensByName(rows, blockedNames = new Set()) {
  const seen = new Set([...blockedNames].map(name => String(name || '').trim().toLowerCase()).filter(Boolean));
  return (rows || []).filter(row => {
    const name = String(row?.name || '').trim();
    const key = name.toLowerCase();
    if (!name || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function buildAllWinnersCast(playerQueen) {
  const blockedNames = new Set([playerQueen?.name]);
  let winnerQueens = [];
  let communityWinnerQueens = [];

  try {
    if (typeof loadWinnerQueens === 'function' && typeof convertCommunityQueenToGameQueen === 'function') {
      winnerQueens = uniqueQueensByName(await loadWinnerQueens(250), blockedNames)
        .sort(() => Math.random() - 0.5)
        .slice(0, 6)
        .map((q, i) => convertCommunityQueenToGameQueen(q, i, 'winner'));
    }
  } catch (err) {
    console.warn('Could not load winner queens for All Winners cast:', err);
    winnerQueens = [];
  }

  winnerQueens.forEach(q => blockedNames.add(q.name));

  try {
    if (typeof loadCommunityWinnerQueens === 'function' && typeof convertCommunityQueenToGameQueen === 'function') {
      communityWinnerQueens = uniqueQueensByName(await loadCommunityWinnerQueens(250), blockedNames)
        .sort(() => Math.random() - 0.5)
        .slice(0, 1)
        .map((q, i) => convertCommunityQueenToGameQueen(q, i, 'community_winner'));
    }
  } catch (err) {
    console.warn('Could not load community winner queen for All Winners cast:', err);
    communityWinnerQueens = [];
  }

  const neededFallback = Math.max(0, 8 - 1 - winnerQueens.length - communityWinnerQueens.length);
  if (neededFallback > 0) {
    console.warn(`[ALL WINNERS CAST] Database returned ${winnerQueens.length}/6 winner_queens and ${communityWinnerQueens.length}/1 community winner. Generating ${neededFallback} fallback queen(s). Check table name, public SELECT/RLS policy, and columns.`);
  } else {
    console.info('[ALL WINNERS CAST] Cast loaded from winner_queens/community_queens successfully.');
  }
  const fallbackCast = buildNpcCastExact(neededFallback);

  return shuffle([playerQueen, ...winnerQueens, ...communityWinnerQueens, ...fallbackCast]);
}

function pickFinaleSize(castSize){
  // 8-9 queen seasons are tighter and end at Top 3. Larger seasons mostly end at Top 4,
  // but Top 3 finales remain possible so all finale formats can appear across seasons.
  if(castSize<=9)return 3;
  return Math.random()<0.2?3:4;
}

function initializePerformanceArcs(){
  const regularEpisodes=Math.max(1,(gameState.queens?.length||0)-(gameState.season?.finaleSize||4));
  const weeks=Array.from({length:regularEpisodes},(_,i)=>i+1);
  gameState.queens.forEach(q=>{
    const peakCount=regularEpisodes>=9?3:2;
    const badCount=regularEpisodes>=10?2:1;
    const shuffled=shuffle(weeks);
    const peakWeeks=shuffled.slice(0,peakCount).sort((a,b)=>a-b);
    const badWeeks=shuffled.slice(peakCount,peakCount+badCount).sort((a,b)=>a-b);
    q.performanceArc={peakWeeks,badWeeks};
  });
}
function ensurePerformanceArc(q){
  if(!q)return null;
  const regularEpisodes=Math.max(1,(gameState.queens?.length||0)-(gameState.season?.finaleSize||4));
  if(!q.performanceArc){
    const weeks=shuffle(Array.from({length:regularEpisodes},(_,i)=>i+1));
    q.performanceArc={peakWeeks:weeks.slice(0,regularEpisodes>=9?3:2).sort((a,b)=>a-b),badWeeks:weeks.slice(3,3+(regularEpisodes>=10?2:1)).sort((a,b)=>a-b)};
  }
  return q.performanceArc;
}

function initializeReturnTwist(format){
  const base={type:null,used:false,pendingQueenIds:[],announcedQueenIds:[]};
  if(format==='regular'){
    if(Math.random()<0.10)base.type=sample(['first_out','redemption_vote','production_return']);
    return base;
  }
  if(format==='legacy' || format==='assassin'){
    base.type=sample(['legacy_smackdown','redemption_smackdown','boot_order_gauntlet']);
    return base;
  }
  return base;
}
function ensureReturnTwistState(){
  if(!gameState.season)return null;
  if(!gameState.season.returnTwist){
    gameState.season.returnTwist={type:null,used:false,pendingQueenIds:[],announcedQueenIds:[]};
  }
  if(!Array.isArray(gameState.season.returnTwist.pendingQueenIds))gameState.season.returnTwist.pendingQueenIds=[];
  if(!Array.isArray(gameState.season.returnTwist.announcedQueenIds))gameState.season.returnTwist.announcedQueenIds=[];
  return gameState.season.returnTwist;
}
function hasReturnTwistAvailable(){
  const twist=ensureReturnTwistState();
  return !!(twist && twist.type && !twist.used);
}
function getActiveQueens(){return (gameState.queens||[]).filter(q=>!q.isEliminated);}
function getEliminatedQueens(){return gameState.eliminatedQueens||[];}
function returnQueenToCompetition(queenId,reason){
  const queen=(gameState.queens||[]).find(q=>q.id===queenId);
  if(!queen)return false;
  ensureReturnTwistState();
  queen.isEliminated=false;
  gameState.eliminatedQueens=(gameState.eliminatedQueens||[]).filter(q=>q.id!==queenId);
  gameState.season.returnTwist.used=true;
  gameState.season.returnAnnouncement={queenIds:[queenId],reason};
  return true;
}
function returnQueensToCompetition(queenIds,reason){
  const ids=[...(queenIds||[])].filter(Boolean);
  const returned=[];
  ids.forEach(id=>{
    const queen=(gameState.queens||[]).find(q=>q.id===id && q.isEliminated);
    if(queen && returnQueenToCompetition(id,reason))returned.push(id);
  });
  if(returned.length){
    gameState.season.returnTwist.used=true;
    gameState.season.returnAnnouncement={queenIds:returned,reason};
    saveGame();
  }
  return returned;
}
function scoreReturnCandidateForVote(voter,candidate){
  ensureQueenV14Stats(candidate);
  const rel=gameState.relationships?.[voter.id]?.[candidate.id];
  const affinity=Number(rel?.affinity)||0;
  const publicScores=candidate.publicScores||{};
  const fan=Number(publicScores.fans)||0;
  const production=Number(publicScores.production)||0;
  return affinity*0.65 + fan*0.35 + production*0.25 + rand(-12,12);
}
function chooseReturnVote(voter,candidates){
  if(!candidates.length)return null;
  return [...candidates].sort((a,b)=>scoreReturnCandidateForVote(voter,b)-scoreReturnCandidateForVote(voter,a))[0];
}
function resolveRedemptionVote(){
  if(!hasReturnTwistAvailable())return null;
  const candidates=getEliminatedQueens();
  const voters=getActiveQueens();
  if(!candidates.length || !voters.length)return null;
  const votes={};
  voters.forEach(voter=>{
    const pick=chooseReturnVote(voter,candidates);
    if(pick)votes[pick.id]=(votes[pick.id]||0)+1;
  });
  const max=Math.max(...Object.values(votes));
  const tied=Object.keys(votes).filter(id=>votes[id]===max);
  const winnerId=sample(tied);
  if(!winnerId)return null;
  returnQueenToCompetition(winnerId,'redemption_vote');
  gameState.season.returnAnnouncement.votes=votes;
  saveGame();
  return winnerId;
}
function getBestEliminatedProductionDarling(){
  const candidates=getEliminatedQueens();
  if(!candidates.length)return null;
  candidates.forEach(ensureQueenV14Stats);
  const scored=candidates.map(q=>({q,score:Number(q.publicScores?.production)||0}));
  const max=Math.max(...scored.map(x=>x.score));
  const tied=scored.filter(x=>x.score===max).map(x=>x.q);
  return sample(tied)?.id||null;
}
function initReturnSmackdownState(ep){
  if(ep.returnSmackdownState)return ep.returnSmackdownState;
  const participants=(ep.participantIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const type=ep.returnSmackdownType || gameState.season?.returnTwist?.type || 'legacy_smackdown';
  const isGauntlet=(type==='boot_order_gauntlet'||type==='elimination_order_gauntlet'||type==='redemption_smackdown');
  const ordered=isGauntlet ? participants.map(q=>q.id) : shuffle(participants).map(q=>q.id);
  ep.returnSmackdownState={
    type,
    mode:isGauntlet?'boot_order_gauntlet':'legacy_bracket',
    phase:'draw',
    queueIds:[...ordered],
    currentRoundIds:isGauntlet?[]:[...ordered],
    nextRoundIds:[],
    roundNumber:1,
    currentChampionId:null,
    availableSongs:pickLipSyncSongs(Math.max(1,participants.length-1)),
    usedSongs:[],
    rounds:[],
    currentDuel:null,
    winnerId:null
  };
  saveGame();
  return ep.returnSmackdownState;
}
function beginReturnSmackdownDuel(songIndex){
  const ep=gameState.currentEpisode, st=initReturnSmackdownState(ep);
  if(st.phase==='complete')return null;
  if(!st.currentDuel){
    if(st.mode==='legacy_bracket'){
      while((st.currentRoundIds||[]).length<2){
        const byeId=(st.currentRoundIds||[]).shift()||null;
        if(byeId){
          let round=st.rounds.find(r=>r.round===st.roundNumber);
          if(!round){round={round:st.roundNumber,duels:[],winnerIds:[]}; st.rounds.push(round);}
          round.byeId=byeId;
          if(!round.winnerIds.includes(byeId))round.winnerIds.push(byeId);
          st.nextRoundIds.push(byeId);
        }
        if((st.nextRoundIds||[]).length===1 && !(st.currentRoundIds||[]).length){
          st.winnerId=st.nextRoundIds[0];
          st.phase='complete';
          saveGame();
          return null;
        }
        if((st.currentRoundIds||[]).length<2 && (st.nextRoundIds||[]).length>1){
          st.currentRoundIds=[...st.nextRoundIds];
          st.nextRoundIds=[];
          st.roundNumber++;
        }else break;
      }
      const aId=st.currentRoundIds.shift()||null;
      const bId=st.currentRoundIds.shift()||null;
      if(!aId || !bId){
        st.winnerId=aId || bId || st.nextRoundIds?.[0] || null;
        st.phase='complete';
        saveGame();
        return null;
      }
      const remainingAfterThis=(st.currentRoundIds||[]).length + (st.nextRoundIds||[]).length;
      st.currentDuel={round:st.roundNumber,queenIds:[aId,bId],song:null,strategyByQueenId:{},winnerId:'',loserId:'',resultText:'',isFinal:remainingAfterThis===0};
      st.phase='song';
    }else{
      if(!st.currentChampionId)st.currentChampionId=st.queueIds.shift()||null;
      const opponentId=st.queueIds.shift()||null;
      if(!st.currentChampionId || !opponentId){
        st.winnerId=st.currentChampionId || opponentId || null;
        st.phase='complete';
        saveGame();
        return null;
      }
      st.currentDuel={round:st.rounds.length+1,queenIds:[st.currentChampionId,opponentId],song:null,strategyByQueenId:{},winnerId:'',loserId:'',resultText:'',isFinal:st.queueIds.length===0};
      st.phase='song';
    }
  }
  if(songIndex!==undefined && songIndex!==null){
    const idx=Math.max(0,Math.min(st.availableSongs.length-1,Number(songIndex)||0));
    st.currentDuel.song=st.availableSongs.splice(idx,1)[0] || pickLipSyncSongs(1)[0];
    st.phase='strategy';
  }
  saveGame();
  return st.currentDuel;
}
function returnSmackdownAutoSong(chooserId){
  const ep=gameState.currentEpisode, st=initReturnSmackdownState(ep);
  const q=gameState.queens.find(x=>x.id===chooserId);
  if(!st.availableSongs.length)return 0;
  return st.availableSongs.map((song,i)=>({i,score:strategyObj(autoLipSyncStrategy(q,song)).bonusTags.filter(t=>(song.tags||[]).includes(t)||song.energy===t||song.mood===t).length+Math.random()})).sort((a,b)=>b.score-a.score)[0].i;
}
function completeReturnSmackdownDuel(strategyByQueenId={}){
  const ep=gameState.currentEpisode, st=initReturnSmackdownState(ep), cd=st.currentDuel;
  if(!cd)return null;
  cd.strategyByQueenId=Object.assign({},strategyByQueenId);
  const a=gameState.queens.find(q=>q.id===cd.queenIds[0]), b=gameState.queens.find(q=>q.id===cd.queenIds[1]);
  const d=runLipSyncDuelNoStats(a,b,`Return Round ${cd.round}`,{song:cd.song,strategyByQueenId:cd.strategyByQueenId,context:'return_smackdown'});
  Object.assign(cd,{scores:d.scores,winnerId:d.winnerId,loserId:d.loserId,strategy:d.strategy,strategyLabels:d.strategyLabels,resultText:`${qName(d.winnerId)} wins and keeps fighting. ${qName(d.loserId)} is out.`});
  st.usedSongs.push(cd.song);
  let round=st.rounds.find(r=>r.round===cd.round);
  if(!round){round={round:cd.round,duels:[],winnerIds:[]}; st.rounds.push(round);}
  round.duels.push(cd);
  if(!round.winnerIds.includes(cd.winnerId))round.winnerIds.push(cd.winnerId);
  if(st.mode==='legacy_bracket'){
    st.nextRoundIds.push(cd.winnerId);
    st.currentDuel=null;
    if((st.currentRoundIds||[]).length===0){
      if(st.nextRoundIds.length===1){
        st.winnerId=cd.winnerId;
        st.phase='complete';
      }else{
        st.currentRoundIds=[...st.nextRoundIds];
        st.nextRoundIds=[];
        st.roundNumber++;
        st.phase='draw';
      }
    }else{
      st.phase='draw';
    }
  }else{
    st.currentChampionId=cd.winnerId;
    st.currentDuel=null;
    st.phase=st.queueIds.length?'draw':'complete';
    if(st.phase==='complete')st.winnerId=cd.winnerId;
  }
  saveGame();
  if(st.phase==='complete')return resolveReturnSmackdown();
  return cd;
}
function resolveReturnSmackdown(){
  const ep=gameState.currentEpisode;
  if(ep?.returnSmackdownResult)return ep.returnSmackdownResult;
  const type=ep?.returnSmackdownType || gameState.season?.returnTwist?.type;
  const isReunionSmackdown=type==='reunion_smackdown' || ep?.challengeType==='reunion_smackdown' || ep?.reunionOnly || gameState.season?.returnTwist?.reunionOnly;
  if(!isReunionSmackdown && !hasReturnTwistAvailable())return gameState.season?.returnAnnouncement?.smackdown||null;
  const eliminated=[...getEliminatedQueens()];
  if(eliminated.length===1){
    const winnerId=eliminated[0].id;
    if(!isReunionSmackdown)returnQueenToCompetition(winnerId,type);
    const result={type,rounds:[],winnerId,reunionOnly:isReunionSmackdown};
    gameState.season.returnAnnouncement.smackdown=result;
    if(ep)ep.returnSmackdownResult=result;
    saveGame();
    return result;
  }
  if(eliminated.length<2)return null;
  if(ep && ep.special==='return_smackdown'){
    const st=initReturnSmackdownState(ep);
    while(st.phase!=='complete'){
      if(st.phase==='draw')beginReturnSmackdownDuel();
      if(st.phase==='song')beginReturnSmackdownDuel(returnSmackdownAutoSong(st.currentDuel?.queenIds?.[1]||st.currentChampionId));
      if(st.phase==='strategy' && st.currentDuel){
        const ids=st.currentDuel.queenIds||[];
        completeReturnSmackdownDuel({
          [ids[0]]:autoLipSyncStrategy(gameState.queens.find(q=>q.id===ids[0]),st.currentDuel.song),
          [ids[1]]:autoLipSyncStrategy(gameState.queens.find(q=>q.id===ids[1]),st.currentDuel.song)
        });
      }
    }
    if(st.winnerId){
      if(!isReunionSmackdown)returnQueenToCompetition(st.winnerId,type);
      const result={type,mode:st.mode,rounds:st.rounds,winnerId:st.winnerId,usedSongs:st.usedSongs,reunionOnly:isReunionSmackdown,title:isReunionSmackdown?'Queen of She Already Done Had Herses':undefined};
      ep.returnSmackdownResult=result;
      if(isReunionSmackdown){
        gameState.season.reunionDone=true;
        gameState.season.reunionResult=result;
      }else{
        gameState.season.returnAnnouncement.smackdown=result;
      }
      saveGame();
      return result;
    }
  }
  let current=eliminated[0];
  const rounds=[];
  for(let i=1;i<eliminated.length;i++){
    const song=pickLipSyncSongs(1)[0];
    const duel=runLipSyncDuelNoStats(current,eliminated[i],`Redemption Round ${i}`,{song,context:'return_smackdown'});
    rounds.push({round:i,duels:[duel],winnerIds:[duel.winnerId]});
    current=gameState.queens.find(q=>q.id===duel.winnerId);
  }
  const winnerId=current?.id||null;
  if(winnerId){
    if(!isReunionSmackdown)returnQueenToCompetition(winnerId,type);
    const result={type,rounds,winnerId,reunionOnly:isReunionSmackdown,title:isReunionSmackdown?'Queen of She Already Done Had Herses':undefined};
    if(isReunionSmackdown){
      gameState.season.reunionDone=true;
      gameState.season.reunionResult=result;
    }else{
      gameState.season.returnAnnouncement.smackdown=result;
    }
    saveGame();
    return result;
  }
  return null;
}
function buildReturnSmackdownEpisode(type){
  const eliminated=[...getEliminatedQueens()];
  if(!eliminated.length)return null;
  const number=gameState.episodeHistory.length+1;
  gameState.currentEpisode={
    number,
    activeCount:eliminated.length,
    challengeType:'return_smackdown',
    challengeName:type==='redemption_smackdown'?'Redemption Lip Sync Smackdown':'Lip Sync Smackdown Return',
    themeId:'return_smackdown',
    themeName:type==='redemption_smackdown'?'Redemption Lip Sync Smackdown':'Lip Sync Smackdown Return',
    themeNotes:'The eliminated queens lip sync for one open spot back in the competition.',
    runwayCategory:'Lip Sync Return',
    runwayCategories:['Lip Sync Return'],
    song:sample(gameState.data.songs),
    events: shuffle((gameState.data.events||[]).filter(e=>e && !['runway','judging'].includes(e.type))).slice(0, 2),
    guestJudge:pickGuestJudge(),
    structure:{id:'return_smackdown',label:'Return Smackdown'},
    teams:[],
    judgingMode:'individual',
    placements:[],
    bottomQueens:[],
    eliminatedQueenId:null,
    lipSyncResult:null,
    special:'return_smackdown',
    returnSmackdownType:type,
    participantIds:eliminated.map(q=>q.id),
    socialEvents:[]
  };
  saveGame();
  return gameState.currentEpisode;
}
function processReturnTwistsBeforeEpisode(){
  const twist=ensureReturnTwistState();
  if(!twist || !twist.type || twist.used)return null;
  if(twist.type==='first_out' && twist.pendingQueenIds.length){
    const prem=gameState.season?.premiere;
    if(prem && !prem.complete)return null;
    returnQueensToCompetition(twist.pendingQueenIds,'first_out');
    twist.pendingQueenIds=[];
    saveGame();
    return null;
  }
  const activeCount=getActiveQueens().length;
  if(twist.type==='production_return' && getSeasonFormat()==='regular' && activeCount===5){
    const id=getBestEliminatedProductionDarling();
    if(id)returnQueenToCompetition(id,'production_return');
    return null;
  }
  if((twist.type==='legacy_smackdown' || twist.type==='redemption_smackdown' || twist.type==='boot_order_gauntlet' || twist.type==='elimination_order_gauntlet') && (getSeasonFormat()==='legacy' || getSeasonFormat()==='assassin') && activeCount===5){
    return buildReturnSmackdownEpisode(twist.type);
  }
  return null;
}
function registerReturnTwistAfterElimination(ep){
  const twist=ensureReturnTwistState();
  if(!twist || !twist.type || twist.used)return;
  const eliminatedIds=[...(ep?.lipSyncResult?.eliminatedQueenIds||[]), ep?.eliminatedQueenId].filter(Boolean);
  const unique=[...new Set(eliminatedIds)];
  if(!unique.length)return;
  if(getSeasonFormat()==='regular' && twist.type==='first_out'){
    const prem=gameState.season?.premiere;
    const firstSeasonElim=(gameState.eliminatedQueens||[]).length===unique.length;
    const collectingDoublePremiere=!!(prem?.format?.startsWith('double') && !prem.complete && twist.pendingQueenIds.length);
    if(firstSeasonElim || collectingDoublePremiere){
      twist.pendingQueenIds=[...new Set([...(twist.pendingQueenIds||[]), ...unique])];
      saveGame();
    }
    return;
  }
  if(getSeasonFormat()==='regular' && twist.type==='redemption_vote'){
    const original=gameState.season.originalCastSize || (gameState.queens||[]).length;
    const needed=Math.ceil(original/2);
    if((gameState.eliminatedQueens||[]).length>=needed)resolveRedemptionVote();
  }
}

function initializeTournamentBrackets(){
  const ids=shuffle((gameState.queens||[]).map(q=>q.id));
  gameState.queens.forEach(q=>{q.tournamentPoints=0; q.tournamentAdvanced=false; q.tournamentReturned=false; q.tournamentBracket=null;});
  const groupOrder=['A','B','C'];
  const challengeFamilies=Object.fromEntries(groupOrder.map(g=>[g,['performance','fashion','acting']]));
  const groups={A:ids.slice(0,6),B:ids.slice(6,12),C:ids.slice(12,18)};
  Object.entries(groups).forEach(([group,queenIds])=>queenIds.forEach(id=>{const q=gameState.queens.find(x=>x.id===id); if(q)q.tournamentBracket=group;}));
  return {
    stage:'groups',
    groups,
    groupOrder,
    currentGroup:'A',
    groupEpisodeNumber:1,
    challengeFamilies,
    pointsByQueenId:Object.fromEntries(ids.map(id=>[id,0])),
    advancedQueenIds:[],
    eliminatedQueenIds:[],
    returnQueenId:null,
    completed:false,
    entranceSeenGroups:[],
    finalEntranceSeen:false
  };
}
function currentTournamentEntranceIds(){
  const b=gameState.season?.brackets;
  if(!isTournamentFormat(getSeasonFormat()) || !b)return null;
  if(gameState.season.status==='tournament_entrance' && b.stage!=='final'){
    const group=b.currentGroup||'A';
    return (b.groups?.[group]||[]).filter(id=>!gameState.queens.find(q=>q.id===id)?.isEliminated);
  }
  if(gameState.season.status==='tournament_final_entrance'){
    const ids=new Set(b.advancedQueenIds||[]);
    return (gameState.queens||[]).filter(q=>ids.has(q.id) && !q.isEliminated).map(q=>q.id);
  }
  return null;
}
function isWaitingForTournamentEntrance(){
  return isTournamentFormat(getSeasonFormat()) && ['tournament_entrance','tournament_final_entrance'].includes(gameState.season?.status);
}
function markTournamentEntranceSeen(){
  const b=gameState.season?.brackets;
  if(!b)return;
  if(gameState.season.status==='tournament_entrance'){
    const group=b.currentGroup||'A';
    b.entranceSeenGroups=b.entranceSeenGroups||[];
    if(!b.entranceSeenGroups.includes(group))b.entranceSeenGroups.push(group);
  }
  if(gameState.season.status==='tournament_final_entrance')b.finalEntranceSeen=true;
  gameState.season.status='playing';
}
function tournamentChallengeFamilyForCurrentEpisode(){
  const b=gameState.season?.brackets;
  if(!b || b.stage==='final')return null;
  const group=b.currentGroup||'A';
  const order=b.challengeFamilies?.[group] || ['performance','fashion','acting'];
  return order[Math.max(0,Math.min(2,(b.groupEpisodeNumber||1)-1))] || 'performance';
}
function pickTournamentBracketChallenge(){
  const challenges=gameState.data?.challenges||[];
  const family=tournamentChallengeFamilyForCurrentEpisode();
  const idsByFamily={
    performance:['girlgroup','rumix','rusical','dance','singing'],
    fashion:['design','makeover'],
    acting:['acting','comedy','roast','branding','commercial','improv','political_debate']
  };
  const ids=idsByFamily[family]||idsByFamily.performance;
  const available=ids.map(id=>challenges.find(c=>c.id===id)).filter(Boolean).filter(c=>{
    if(['snatchgame','ball','talent','talentshow'].includes(c.id))return false;
    if(c.minQueens && 6<c.minQueens)return false;
    if(c.maxQueens && 6>c.maxQueens)return false;
    return true;
  });
  return sample(available.length?available:challenges.filter(c=>!['snatchgame','ball','talent','talentshow'].includes(c.id))) || challenges.find(c=>c.id==='girlgroup') || challenges[0];
}
function tournamentScore(q){
  const b=gameState.season?.brackets;
  const points=Number(b?.pointsByQueenId?.[q.id] ?? q.tournamentPoints ?? 0);
  const avg=(q.episodeHistory||[]).filter(h=>typeof h.score==='number').reduce((a,h)=>a+h.score,0)/Math.max(1,(q.episodeHistory||[]).filter(h=>typeof h.score==='number').length);
  return points*100 + (Number(q.publicScores?.production)||0)*0.7 + avg*0.25 + rand(-0.5,0.5);
}
function chooseTournamentPointVote(voterId, scored, top2Ids=[]){
  const voter=gameState.queens.find(q=>q.id===voterId);
  const topSet=new Set(top2Ids||[]);
  let candidates=scored.filter(s=>s.queenId!==voterId && !topSet.has(s.queenId));
  if(Math.random()<0.20 || !candidates.length)candidates=scored.filter(s=>s.queenId!==voterId);
  if(!candidates.length)return null;
  const ranked=candidates.map(s=>{
    const q=gameState.queens.find(x=>x.id===s.queenId);
    const rel=gameState.relationships?.[voterId]?.[s.queenId]||{};
    const affinity=Number(rel.affinity)||0;
    const underdog=(100-(Number(s.score)||0))*0.05;
    const production=Number(q?.publicScores?.production)||0;
    return {id:s.queenId,score:affinity*0.45 + production*0.12 + underdog + rand(-8,8)};
  }).sort((a,b)=>b.score-a.score);
  return ranked[0]?.id||candidates[0]?.queenId||null;
}

function recomputeTournamentVotes(ep=gameState.currentEpisode){
  if(!ep)return null;
  ep.tournamentVotes=ep.tournamentVotes||{};
  ep.tournamentVoteTally=tallyVotes(ep.tournamentVotes||{});
  ep.tournamentVotedPointQueenIds=Object.keys(ep.tournamentVoteTally||{});
  ep.tournamentVotedPointQueenId=null;
  if(ep.lipSyncResult && ep.lipSyncResult.outcome==='tournamentPoints'){
    ep.lipSyncResult.tournamentVotes=ep.tournamentVotes||{};
    ep.lipSyncResult.tournamentVoteTally=ep.tournamentVoteTally||{};
    ep.lipSyncResult.tournamentVotedPointQueenIds=ep.tournamentVotedPointQueenIds||[];
    ep.lipSyncResult.tournamentVotedPointQueenId=null;
  }
  return ep.tournamentVotedPointQueenIds;
}

function addTournamentPoints(queenId, amount){
  if(!queenId || !amount)return;
  const b=gameState.season?.brackets;
  if(b){b.pointsByQueenId=b.pointsByQueenId||{}; b.pointsByQueenId[queenId]=(Number(b.pointsByQueenId[queenId])||0)+amount;}
  const q=gameState.queens.find(x=>x.id===queenId);
  if(q)q.tournamentPoints=(Number(q.tournamentPoints)||0)+amount;
}
function resolveTournamentGroupAdvancers(groupId){
  const b=gameState.season?.brackets;
  const ids=b?.groups?.[groupId]||[];
  const ranked=ids.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean).sort((a,bq)=>{
    const pa=Number(gameState.season.brackets.pointsByQueenId?.[a.id]||0), pb=Number(gameState.season.brackets.pointsByQueenId?.[bq.id]||0);
    return pb-pa || (Number(bq.publicScores?.production)||0)-(Number(a.publicScores?.production)||0) || String(a.name).localeCompare(String(bq.name));
  });
  const adv=ranked.slice(0,2).map(q=>q.id);
  const secondPts=ranked[1]?Number(b.pointsByQueenId?.[ranked[1].id]||0):-999;
  const tiedForSecond=ranked.filter(q=>Number(b.pointsByQueenId?.[q.id]||0)===secondPts).map(q=>q.id);
  if(tiedForSecond.length>1 && Math.random()<0.5){
    tiedForSecond.forEach(id=>{if(!adv.includes(id))adv.push(id);});
  }else if(tiedForSecond.length>1){
    const productionPick=tiedForSecond.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean).sort((a,bq)=>(Number(bq.publicScores?.production)||0)-(Number(a.publicScores?.production)||0))[0];
    if(productionPick && !adv.includes(productionPick.id)){adv.pop(); adv.push(productionPick.id);}
  }
  return adv;
}
function chooseTournamentProductionReturn(){
  const b=gameState.season?.brackets;
  const pool=(b?.eliminatedQueenIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  if(!pool.length)return null;
  return pool.sort((a,bq)=>tournamentScore(bq)-tournamentScore(a))[0]?.id||null;
}
function finishTournamentGroupIfNeeded(){
  const b=gameState.season?.brackets;
  if(!b || b.stage==='final' || b.completed)return;
  if(b.groupEpisodeNumber<3){b.groupEpisodeNumber++; return;}
  const group=b.currentGroup;
  const groupIds=b.groups?.[group]||[];
  const rankedBefore=groupIds.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean).sort((a,bq)=>{
    const pa=Number(b.pointsByQueenId?.[a.id]||0), pb=Number(b.pointsByQueenId?.[bq.id]||0);
    return pb-pa || (Number(bq.publicScores?.production)||0)-(Number(a.publicScores?.production)||0) || String(a.name).localeCompare(String(bq.name));
  });
  const secondPts=rankedBefore[1]?Number(b.pointsByQueenId?.[rankedBefore[1].id]||0):null;
  const tiedForSecond=secondPts===null?[]:rankedBefore.filter(q=>Number(b.pointsByQueenId?.[q.id]||0)===secondPts).map(q=>q.id);
  const adv=resolveTournamentGroupAdvancers(group);
  const eliminatedThisGroup=[];
  adv.forEach(id=>{if(!b.advancedQueenIds.includes(id))b.advancedQueenIds.push(id); const q=gameState.queens.find(x=>x.id===id); if(q)q.tournamentAdvanced=true;});
  (b.groups?.[group]||[]).forEach(id=>{
    if(adv.includes(id))return;
    const q=gameState.queens.find(x=>x.id===id);
    if(q){q.isEliminated=true; if(!gameState.eliminatedQueens.some(e=>e.id===id))gameState.eliminatedQueens.push(q);}
    if(!b.eliminatedQueenIds.includes(id))b.eliminatedQueenIds.push(id);
    eliminatedThisGroup.push(id);
  });
  b.pendingBracketResult={
    group,
    seen:false,
    advancedQueenIds:[...adv],
    eliminatedQueenIds:eliminatedThisGroup,
    rankedQueenIds:rankedBefore.map(q=>q.id),
    tieBroken:tiedForSecond.length>1 && adv.length<=2,
    extraAdvancer:tiedForSecond.length>1 && adv.length>2
  };
  const idx=b.groupOrder.indexOf(group);
  if(idx<b.groupOrder.length-1){
    b.currentGroup=b.groupOrder[idx+1];
    b.groupEpisodeNumber=1;
    gameState.season.status='tournament_entrance';
    return;
  }
  const returnId=chooseTournamentProductionReturn();
  if(returnId){
    const q=gameState.queens.find(x=>x.id===returnId);
    if(q){q.isEliminated=false; q.tournamentReturned=true; q.tournamentAdvanced=true; gameState.eliminatedQueens=gameState.eliminatedQueens.filter(e=>e.id!==returnId);}
    b.returnQueenId=returnId;
    if(!b.advancedQueenIds.includes(returnId))b.advancedQueenIds.push(returnId);
    gameState.season.returnAnnouncement={queenIds:[returnId],reason:'tournament_production_return'};
  }
  (gameState.queens||[]).forEach(q=>{ if(!b.advancedQueenIds.includes(q.id))q.isEliminated=true; });
  gameState.eliminatedQueens=(gameState.queens||[]).filter(q=>q.isEliminated);
  b.stage='final';
  b.completed=true;
  gameState.season.status='tournament_final_entrance';
}

async function startSeason(playerQueen, castSize='random', seasonFormat='regular'){
  const data=gameState.data;

  resetState();
  gameState.data=data;

  const format=normalizeSeasonFormat(seasonFormat);
  const resolvedCastSize=resolveCastSizeForFormat(format==='all_winners'?8:castSize,format);

  gameState.settings.castSize=resolvedCastSize;
  gameState.settings.seasonFormat=format;
  gameState.playerQueenId=playerQueen.id;

  if(format==='all_winners'){
    gameState.queens=await buildAllWinnersCast(playerQueen);
  }else{
    let communityQueens=[];

    try{
      if(typeof loadCommunityQueens==='function' && typeof convertCommunityQueenToGameQueen==='function'){
        const wanted=Math.random()<0.5?1:2;
        const savedQueens=await loadCommunityQueens(1000);
        communityQueens=savedQueens
          .filter(q=>q.name && q.name!==playerQueen.name)
          .sort(()=>Math.random()-0.5)
          .slice(0,wanted)
          .map((q,i)=>convertCommunityQueenToGameQueen(q,i));
      }
    }catch(err){
      console.warn('Could not load community queens for cast:',err);
      communityQueens=[];
    }

    const neededNpc=Math.max(0,resolvedCastSize-1-communityQueens.length);
    const cast=buildNpcCastExact(neededNpc);

    gameState.queens=shuffle([playerQueen,...communityQueens,...cast]);
  }

  const finaleSize=format==='all_winners'?4:pickFinaleSize(gameState.queens.length);

  gameState.season={
    number:1,
    status:isTournamentFormat(format)?'tournament_entrance':'entrance',
    format,
    finaleSize,
    originalCastSize:gameState.queens.length,
    episodeCount:format==='all_winners'?12:null,
    returnTwist:initializeReturnTwist(format),
    returnAnnouncement:null,
    doubleShantayUsed:false,
    doubleSashayUsed:false,
    challengePlan:{},
    finale:null,
    iconicLipSyncs:[],
    lalaparuzaDone:false,
    lalaparuzaChecked:false,
    reunionDone:false,
    reunionChecked:false,
    usedRunwayActions:[],
    currentBlockedQueen:null,
    allWinnersTop4:[],
    allWinnersSecondary4:[],
    allWinnersSecondaryWinnerId:null
  };

  if(format==='all_winners')gameState.queens.forEach(ensureAllWinnersQueenState);
  if(isTournamentFormat(format))gameState.season.brackets=initializeTournamentBrackets();

  setupPremiereStructure();
  gameState.season.challengePlan=createSeasonChallengePlan(gameState.queens.length, gameState.season.finaleSize);
  initializePerformanceArcs();
  initializeRelationships();

  if(typeof ensureAllSocialStats==='function')ensureAllSocialStats();

  saveGame();
}
function resetQueenForNewSeason(q, isPlayer=false){
  const clean=JSON.parse(JSON.stringify(q||{}));
  clean.isPlayer=!!isPlayer;
  clean.isEliminated=false;
  clean.momentum=0;
  clean.confidence=5;
  clean.energy=80;
  clean.stress=20;
  clean.publicScores={production:0,queens:0,fans:0};
  clean.inventory={reveals:3};
  clean.statistics={wins:0,highs:0,safes:0,lows:0,bottoms:0,lipSyncWins:0,lipSyncLosses:0,miniChallengeWins:0,episodesCompeted:0};
  clean.episodeHistory=[];
  clean.confessionals=[];
  clean.performanceArc=null;
  clean.tournamentPoints=0;
  clean.legendStars=0;
  clean.blocked=false;
  clean.blockedBy=null;
  clean.blocksReceived=0;
  clean.blocksGiven=0;
  delete clean.placement;
  delete clean.trackRecord;
  delete clean.finalPlacement;
  delete clean.eliminatedEpisode;
  delete clean.returned;
  delete clean.tournamentReturned;
  delete clean.tournamentAdvanced;
  delete clean.tournamentBracket;
  return clean;
}

function allStarsRelationshipStrength(q, playerId){
  const a=gameState.relationships?.[playerId]?.[q.id]||{};
  const b=gameState.relationships?.[q.id]?.[playerId]||{};
  return Math.max(Math.abs(Number(a.affinity)||0),Math.abs(Number(b.affinity)||0));
}

function chooseAllStarsReturningQueens(player){
  const playerId=player?.id||gameState.playerQueenId;
  const candidates=(gameState.queens||[]).filter(q=>q.id!==playerId && !q.isAssassin);
  const scored=candidates.map(q=>{
    const tags=(typeof seasonArcTags==='function')?seasonArcTags(q):[];
    const placement=Number(q.finalPlacement)||999;
    const rel=allStarsRelationshipStrength(q, playerId);
    let score=0;
    if(tags.includes('production darling'))score+=5000;
    if(tags.includes('fan favorite'))score+=4000;
    score+=Math.max(0,1000-placement*80);
    score+=rel*3;
    return {q,score};
  }).sort((a,b)=>b.score-a.score);
  const pool=scored.filter(item=>item.score>0).map(item=>item.q);
  const count=Math.min(pool.length, Math.floor(Math.random()*3));
  return pool.slice(0,count);
}

async function startAllStarsSeasonFromCurrent(format){
  if(typeof ensureNamePartsLoaded==='function')await ensureNamePartsLoaded();
  const data=gameState.data;
  const previousRelationships=JSON.parse(JSON.stringify(gameState.relationships||{}));
  const previousQueens=gameState.queens||[];
  const oldPlayer=previousQueens.find(q=>q.id===gameState.playerQueenId);
  if(!oldPlayer)return;
  const returning=chooseAllStarsReturningQueens(oldPlayer);
  const nextPlayer=resetQueenForNewSeason(oldPlayer,true);
  const nextReturning=returning.map(q=>resetQueenForNewSeason(q,false));
  resetState();
  gameState.data=data;
  const normalized=normalizeSeasonFormat(format);
  const resolvedCastSize=resolveCastSizeForFormat(normalized==='all_winners'?8:'random',normalized);
  gameState.settings.castSize=resolvedCastSize;
  gameState.settings.seasonFormat=normalized;
  gameState.playerQueenId=nextPlayer.id;
  if(normalized==='all_winners'){
    gameState.queens=await buildAllWinnersCast(nextPlayer);
  }else{
    const neededNpc=Math.max(0,resolvedCastSize-1-nextReturning.length);
    const cast=buildNpcCastExact(neededNpc);
    gameState.queens=shuffle([nextPlayer,...nextReturning,...cast]);
  }
  const finaleSize=normalized==='all_winners'?4:pickFinaleSize(gameState.queens.length);
  gameState.season={number:2,status:isTournamentFormat(normalized)?'tournament_entrance':'entrance',format:normalized,allStarsInvitation:true,finaleSize,originalCastSize:gameState.queens.length,
    episodeCount:normalized==='all_winners'?12:null,returnTwist:initializeReturnTwist(normalized),returnAnnouncement:null,doubleShantayUsed:false,doubleSashayUsed:false,challengePlan:{},finale:null,iconicLipSyncs:[],lalaparuzaDone:false,lalaparuzaChecked:false,reunionDone:false,reunionChecked:false,usedRunwayActions:[],currentBlockedQueen:null,allWinnersTop4:[],allWinnersSecondary4:[],allWinnersSecondaryWinnerId:null};
  if(normalized==='all_winners')gameState.queens.forEach(ensureAllWinnersQueenState);
  if(isTournamentFormat(normalized))gameState.season.brackets=initializeTournamentBrackets();
  setupPremiereStructure();
  gameState.season.challengePlan=createSeasonChallengePlan(gameState.queens.length, gameState.season.finaleSize);
  initializePerformanceArcs();
  initializeRelationships();
  if(normalized!=='all_winners'){
    nextReturning.forEach(r=>{
      if(previousRelationships?.[nextPlayer.id]?.[r.id])gameState.relationships[nextPlayer.id][r.id]=previousRelationships[nextPlayer.id][r.id];
      if(previousRelationships?.[r.id]?.[nextPlayer.id])gameState.relationships[r.id][nextPlayer.id]=previousRelationships[r.id][nextPlayer.id];
    });
  }
  if(typeof ensureAllSocialStats==='function')ensureAllSocialStats();
  saveGame();
}

function challengeFamily(id){
  const key=String(id||'').toLowerCase();
  if(['rusical','girlgroup','musical','rumix'].includes(key)||key.includes('rusical')||key.includes('musical')||key.includes('rumix'))return 'performance';
  if(['acting','improv'].includes(key))return 'acting';
  if(['comedy','roast','snatchgame','snatch game'].includes(key))return 'comedy';
  if(['branding','advertisement','commercial'].includes(key))return 'branding';
  if(['interview','hosting','podcast'].includes(key))return 'hosting';
  if(['design','fashion_wars','ball','makeover'].includes(key))return 'fashion';
  return key;
}
function createSeasonChallengePlan(startCount=14, finaleSize=4){
  const counts=[];
  for(let n=startCount;n>finaleSize;n--)counts.push(n);

  // Finale runway: the simulator already decides finaleSize at season start.
  // Use that fixed value to reserve the last two competitive challenges.
  // Top 4/5 before finale = Rumix. Top 5/6 before finale = Ball if it has not happened earlier.
  const rumixCount=finaleSize+1;
  const ballFallbackCount=finaleSize+2;
  const reservedCounts=[rumixCount, ballFallbackCount].filter(n=>counts.includes(n));

  const inRange=(min,max)=>counts.filter(n=>n<=max&&n>=min&&!reservedCounts.includes(n));
 const designOptions=inRange(8,14);
const snatchOptions=inRange(7,10);
const makeoverOptions=inRange(5,6);
const roastOptions=inRange(5,7);
const rusicalOptions=inRange(5,10);
const required=['design','snatchgame','makeover','roast','rusical'];
  let best={};
  for(let attempt=0; attempt<300; attempt++){
    const plan={};
    if(counts.includes(rumixCount))plan[rumixCount]='rumix';
    if(counts.includes(ballFallbackCount))plan[ballFallbackCount]='ball';

    const design=sample(designOptions.filter(n=>!plan[n])); if(!design)continue; plan[design]='design';
const snatch=sample(snatchOptions.filter(n=>!plan[n])); if(!snatch)continue; plan[snatch]='snatchgame';
const makeover=sample(makeoverOptions.filter(n=>!plan[n])); if(!makeover)continue; plan[makeover]='makeover';
const roast=sample(roastOptions.filter(n=>!plan[n])); if(!roast)continue; plan[roast]='roast';
const rusical=sample(rusicalOptions.filter(n=>!plan[n])); if(!rusical)continue; plan[rusical]='rusical';
    const planned=Object.values(plan);
    if(!required.every(id=>planned.includes(id)))continue;
    const ordered=counts.filter(n=>plan[n]).sort((a,b)=>b-a);
    const hasFamilyClash=ordered.some((n,i)=>i>0 && challengeFamily(plan[n])===challengeFamily(plan[ordered[i-1]]));
    if(!hasFamilyClash)return plan;
    best=plan;
  }

  if(counts.includes(rumixCount))best[rumixCount]='rumix';
  if(counts.includes(ballFallbackCount) && !best[ballFallbackCount])best[ballFallbackCount]='ball';
  return best;
}
function alreadyUsedChallenge(id){return gameState.episodeHistory.some(ep=>ep.challengeType===id);}
function isUniqueSeasonChallenge(challengeOrId){
  const challenge=typeof challengeOrId==='object'?challengeOrId:(gameState.data.challenges||[]).find(c=>c.id===challengeOrId);
  const id=String(challenge?.id||challengeOrId||'').toLowerCase();
  const name=String(challenge?.name||'').toLowerCase();
  if(challenge?.uniqueSeason)return true;
  // These are special-format challenges: maximum once per season, except when a double premiere repeats
  // the same selected challenge for both premiere groups.
  return [
    'talent','snatchgame','makeover','roast','rusical','branding','rumix','ball','fashion_wars','political','debate'
  ].some(key=>id.includes(key)||name.includes(key));
}
function requiredChallengeForActiveCount(activeCount){
  const finaleSize=gameState.season?.finaleSize || 4;

  // Rumix is always the last competitive challenge before the finale.
  if(activeCount===finaleSize+1 && !alreadyUsedChallenge('rumix'))return 'rumix';

  // Ball may happen naturally earlier. If it has not, force it as the penultimate challenge before Rumix.
  if(activeCount===finaleSize+2 && !alreadyUsedChallenge('ball'))return 'ball';

  const planned=gameState.season?.challengePlan?.[activeCount];
  if(planned && !alreadyUsedChallenge(planned))return planned;
  return null;
}
function pickChallengeByRules(activeCount){
  const challenges=gameState.data.challenges;
  const finaleSize=gameState.season?.finaleSize || 4;
  const upcomingEpisodeNumber=(gameState.episodeHistory||[]).length+1;
  const requiredId=requiredChallengeForActiveCount(activeCount);
  if(requiredId){
    const required=challenges.find(c=>c.id===requiredId);
    if(required)return required;
  }
  const last=gameState.episodeHistory[gameState.episodeHistory.length-1];
  const lastFamily=challengeFamily(last?.challengeType||last?.challengeName);
  let available=challenges.filter(c=>{
    if(isUniqueSeasonChallenge(c)&&alreadyUsedChallenge(c.id))return false;
    if(getSeasonFormat()==='all_winners' && c.id==='talent' && upcomingEpisodeNumber!==11)return false;
    if(c.id==='rumix' && activeCount!==finaleSize+1)return false;
    if(c.id==='fashion_wars' && ![8,9,10].includes(activeCount))return false;
    if(c.minQueens && activeCount<c.minQueens)return false;
    if(c.maxQueens && activeCount>c.maxQueens)return false;
    if(c.id==='rusical'&&activeCount>10)return false;
    if(c.id==='snatchgame'&&!(activeCount<=10&&activeCount>=7))return false;
    if(c.id==='makeover'&&!(activeCount<=6&&activeCount>=5))return false;
    if(c.id==='roast'&&activeCount>7)return false;
    if(c.id==='political_debate'&&activeCount>8)return false;
    if(last && (c.id===last.challengeType || challengeFamily(c.id)===lastFamily))return false;
    return true;
  });
  if(!available.length){
    available=challenges.filter(c=>{
      if(isUniqueSeasonChallenge(c)&&alreadyUsedChallenge(c.id))return false;
      if(c.id==='fashion_wars' && ![8,9,10].includes(activeCount))return false;
      if(c.minQueens && activeCount<c.minQueens)return false;
      if(c.maxQueens && activeCount>c.maxQueens)return false;
      if(c.id==='rusical'&&activeCount>10)return false;
      if(c.id==='snatchgame'&&!(activeCount<=10&&activeCount>=7))return false;
      if(c.id==='makeover'&&!(activeCount<=6&&activeCount>=5))return false;
      if(c.id==='roast'&&activeCount>7)return false;
      if(c.id==='political_debate'&&activeCount>8)return false;
      return true;
    });
  }
  if(available.length)return sample(available);
  const repeatable=challenges.filter(c=>!isUniqueSeasonChallenge(c));
  return sample(repeatable.length?repeatable:challenges);
}

function challengeStructures(challengeId, activeCount){
  const solo=['talent','design','ball','comedy','roast','snatchgame','interview','rumix','political_debate','makeover'];
  if(challengeId==='fashion_wars') return [{id:'fashion_wars',label:activeCount===10?'Two fashion houses':activeCount===9?'Three fashion houses':'Fashion duels'}];
  if(solo.includes(challengeId)) return [{id:'solo',label:'Solo challenge'}];
  const list=[{id:'solo',label:'Solo challenge'}];
  if(activeCount>=6) list.push({id:'duos',label:'Paired challenge'});
  if(activeCount>=8) list.push({id:'teams2',label:'Two teams'});
  if(activeCount>=10) list.push({id:'teams3',label:'Three teams'});
  return list;
}
function pickEpisodeStructure(challengeId, activeCount){
  const options=challengeStructures(challengeId,activeCount);
  if(options.length===1)return options[0];
  const r=Math.random();
  if(r<0.45)return options[0];
  return sample(options.slice(1));
}


// Team formation configuration. Change these weights to rebalance how often each method appears.
const TEAM_FORMATION_METHOD_WEIGHTS={
  mini_captains:45,
  random:20,
  free_choice:20,
  previous_winner:15
};

function teamStructureTargetSizes(structure, active){
  if(!structure || structure.id==='solo')return [];
  let teamCount=2;
  if(structure.id==='fashion_wars'){
    const n=active.length;
    teamCount=n===10?2:(n===9?3:4);
  }else{
    if(structure.id==='duos') teamCount=Math.floor(active.length/2);
    if(structure.id==='teams3') teamCount=3;
    if(structure.id==='teams2') teamCount=2;
    while(teamCount>1 && active.length/teamCount<2)teamCount--;
  }
  const baseSize=Math.floor(active.length/teamCount);
  const extra=active.length%teamCount;
  return Array.from({length:teamCount},(_,i)=>baseSize+(i<extra?1:0));
}
function teamNameForStructure(structure, ids, i){
  if(structure?.id==='fashion_wars'){
    if((ids||[]).length===2)return `Duel ${i+1}`;
    return `House ${i+1}`;
  }
  return structure?.id==='duos'?(ids.length===2?`Pair ${i+1}`:`Group ${i+1}`):`Team ${i+1}`;
}
function teamsFromIdGroups(groups, structure){
  return (groups||[]).map((ids,i)=>({id:(structure?.id==='fashion_wars'?`fashion_team_${i+1}`:`team_${i+1}`),name:teamNameForStructure(structure,ids,i),queenIds:ids.slice()}));
}
function recentTrackRecordScore(q){
  const h=(q?.episodeHistory||[]).slice(-3);
  const map={WIN:14,TOP2:10,HIGH:8,SAFE:2,LOW:-5,BTM:-9,ELIM:-12};
  return h.reduce((sum,x)=>sum+(map[String(x.placement||'').toUpperCase()]||0),0) + ((q?.statistics?.wins||0)*2) + ((q?.statistics?.highs||0)*0.8) - ((q?.statistics?.bottoms||0)*1.2);
}
function relationshipScoreBetween(aId,bId){
  const a=gameState.relationships?.[aId]?.[bId]?.affinity||0;
  const b=gameState.relationships?.[bId]?.[aId]?.affinity||0;
  return (a+b)/2;
}
function autoPickTeamCaptain(chooserId, pool){
  const chooser=gameState.queens.find(q=>q.id===chooserId);
  return pool.slice().sort((a,b)=>{
    const as=(chooser?relationshipScoreBetween(chooser.id,a.id):0)*0.45 + recentTrackRecordScore(a)*0.45 + rand(-8,8);
    const bs=(chooser?relationshipScoreBetween(chooser.id,b.id):0)*0.45 + recentTrackRecordScore(b)*0.45 + rand(-8,8);
    return bs-as;
  })[0]||pool[0]||null;
}
function autoPickTeammate(captainId, teamIds, pool){
  return pool.slice().sort((a,b)=>{
    const score=(q)=>{
      const capRel=captainId?relationshipScoreBetween(captainId,q.id):0;
      const teamRel=teamIds.length?teamIds.reduce((s,id)=>s+relationshipScoreBetween(id,q.id),0)/teamIds.length:0;
      return capRel*0.35 + teamRel*0.25 + recentTrackRecordScore(q)*0.35 + rand(-7,7);
    };
    return score(b)-score(a);
  })[0]||pool[0]||null;
}
function lastEpisodeUniqueWinner(){
  const last=(gameState.episodeHistory||[]).slice().reverse().find(e=>e?.placements?.length);
  if(!last)return null;
  const winners=(last.placements||[]).filter(p=>p.placement==='WIN');
  if(winners.length!==1)return null;
  return gameState.queens.find(q=>q.id===winners[0].queenId)||null;
}
function pickTeamFormationMethod(structure, active, miniWinner){
  if(!structure || structure.id==='solo')return null;
  const previousWinner=lastEpisodeUniqueWinner();
  const lastFormation=(gameState.episodeHistory||[]).slice().reverse().find(e=>e?.teamFormation)?.teamFormation?.method;
  const canPrevious=(gameState.episodeHistory||[]).length>=3 && previousWinner && lastFormation!=='previous_winner';
  const weights={...TEAM_FORMATION_METHOD_WEIGHTS};
  if(!miniWinner || teamStructureTargetSizes(structure, active).length!==2)weights.mini_captains=0;
  if(!canPrevious)weights.previous_winner=0;
  const entries=Object.entries(weights).filter(([,w])=>w>0);
  const total=entries.reduce((s,[,w])=>s+w,0);
  let r=Math.random()*total;
  for(const [method,w] of entries){if((r-=w)<=0)return method;}
  return entries[0]?.[0]||'random';
}
function autoAssignAllTeams(structure, active, method='random', options={}){
  const targetSizes=teamStructureTargetSizes(structure, active);
  const pickOrder=Array.isArray(options.pickOrder)?options.pickOrder:null;
  if(!targetSizes.length)return [];
  if(method==='random'){
    const pool=shuffle(active).map(q=>q.id), groups=targetSizes.map(()=>[]);
    targetSizes.forEach((size,i)=>{while(groups[i].length<size && pool.length)groups[i].push(pool.shift());});
    return teamsFromIdGroups(groups,structure);
  }
  if(method==='mini_captains'){
    const captainIds=(options.captainIds||[]).slice(0,2);
    const groups=targetSizes.map(()=>[]);
    captainIds.forEach((id,i)=>{if(groups[i])groups[i].push(id);});
    let pool=active.filter(q=>!captainIds.includes(q.id));
    let turn=0;
    while(pool.length){
      let idx=turn%groups.length;
      let loops=0;
      while(groups[idx].length>=targetSizes[idx] && loops<groups.length){idx=(idx+1)%groups.length; loops++;}
      const captainId=groups[idx][0]||captainIds[idx%captainIds.length]||null;
      const pick=autoPickTeammate(captainId,groups[idx],pool);
      if(pick){
        if(pickOrder)pickOrder.push({captainId,teamIndex:idx,queenId:pick.id,auto:true});
        groups[idx].push(pick.id);
        pool=pool.filter(q=>q.id!==pick.id);
      }
      turn=idx+1;
    }
    return teamsFromIdGroups(groups,structure);
  }
  const groups=targetSizes.map(()=>[]);
  let pool=shuffle(active);
  if(method==='previous_winner'){
    const chooserId=options.chooserId;
    while(pool.length){
      const open=groups.map((g,i)=>({i,need:targetSizes[i]-g.length})).filter(x=>x.need>0).sort((a,b)=>b.need-a.need);
      const idx=open[0].i;
      const pick=autoPickTeammate(chooserId,groups[idx],pool);
      groups[idx].push(pick.id); pool=pool.filter(q=>q.id!==pick.id);
    }
    return teamsFromIdGroups(groups,structure);
  }
  // free_choice: cluster queens by mutual affinity.
  while(pool.length){
    const open=groups.map((g,i)=>({i,need:targetSizes[i]-g.length})).filter(x=>x.need>0).sort((a,b)=>b.need-a.need);
    const idx=open[0].i;
    let pick;
    if(!groups[idx].length)pick=pool.shift();
    else{
      pick=pool.slice().sort((a,b)=>{
        const av=groups[idx].reduce((s,id)=>s+relationshipScoreBetween(id,a.id),0)/groups[idx].length + rand(-6,6);
        const bv=groups[idx].reduce((s,id)=>s+relationshipScoreBetween(id,b.id),0)/groups[idx].length + rand(-6,6);
        return bv-av;
      })[0];
      pool=pool.filter(q=>q.id!==pick.id);
    }
    groups[idx].push(pick.id);
  }
  return teamsFromIdGroups(groups,structure);
}
function teamFormationText(method, data={}){
  const qName=id=>gameState.queens.find(q=>q.id===id)?.name||'a queen';
  if(method==='mini_captains')return {title:'Mini-Challenge Captains',description:`${qName(data.captainIds?.[0])} chose ${qName(data.captainIds?.[1])} as the opposing captain.`};
  if(method==='random')return {title:'Random Assignment',description:'Production assigned the teams randomly.'};
  if(method==='free_choice')return {title:'Free Choice',description:'The queens divided themselves by alliances, friendships, and room energy.'};
  if(method==='previous_winner')return {title:'Supreme Queen Power',description:`${qName(data.chooserId)} formed the teams.`};
  return {title:'Team Formation',description:'The teams were formed.'};
}
function buildTeamsForEpisodeWithFormation(structure, active, miniWinner){
  if(!structure || structure.id==='solo')return {teams:[],teamFormation:null,needsPlayerFormation:false};
  const method=pickTeamFormationMethod(structure,active,miniWinner);
  let captainIds=[], chooserId=null, teams=[], needsPlayerFormation=false;
  if(method==='mini_captains'){
    const first=miniWinner;
    const second=autoPickTeamCaptain(first?.id,active.filter(q=>q.id!==first?.id));
    needsPlayerFormation=first?.id===gameState.playerQueenId;
    captainIds=needsPlayerFormation?[first?.id].filter(Boolean):[first?.id,second?.id].filter(Boolean);
    const pickOrder=[];
    if(!needsPlayerFormation)teams=autoAssignAllTeams(structure,active,method,{captainIds,pickOrder});
    var formationPickOrder=pickOrder;
  }else if(method==='previous_winner'){
    const prev=lastEpisodeUniqueWinner(); chooserId=prev?.id||null;
    needsPlayerFormation=chooserId===gameState.playerQueenId;
    if(!needsPlayerFormation)teams=autoAssignAllTeams(structure,active,method,{chooserId});
  }else{
    teams=autoAssignAllTeams(structure,active,method,{});
  }
  const txt=teamFormationText(method,{captainIds,chooserId});
  return {teams,needsPlayerFormation,teamFormation:{method,title:txt.title,description:txt.description,captainIds,chooserId,pickOrder:formationPickOrder||[],autoChosen:false,pending:needsPlayerFormation,targetSizes:teamStructureTargetSizes(structure,active)}};
}
function finalizeCurrentEpisodeTeams(teams, autoChosen=false){
  const ep=gameState.currentEpisode; if(!ep)return;
  ep.teams=teams||[];
  if(ep.teamFormation){ep.teamFormation.autoChosen=!!autoChosen; ep.teamFormation.pending=false;}
  if(ep.challengeType==='fashion_wars')assignFashionWarsBattles(ep);
  ep.judgingMode=(ep.challengeType==='fashion_wars' && (ep.activeCount||0)!==8)?'team':((ep.teams&&ep.teams.length && ep.challengeType!=='fashion_wars')?pickTeamJudgingMode(ep.structure):'individual');
  saveGame();
}

function buildFashionWarsTeams(active){
  const pool=shuffle(active).map(q=>q.id);
  const activeCount=pool.length;
  const teamCount=activeCount===10?2:(activeCount===9?3:4);
  const teamSize=activeCount===10?5:(activeCount===9?3:2);
  const names=activeCount===8?['Duel 1','Duel 2','Duel 3','Duel 4']:Array.from({length:teamCount},(_,i)=>`House ${i+1}`);
  return Array.from({length:teamCount},(_,i)=>({
    id:`fashion_team_${i+1}`,
    name:names[i],
    queenIds:pool.slice(i*teamSize,(i+1)*teamSize)
  }));
}

function assignFashionWarsBattles(ep){
  const battles=ep?.challengeContent?.battles||[];
  const teams=ep?.teams||[];
  if(!battles.length || !teams.length)return;
  const activeCount=ep.activeCount || teams.reduce((n,t)=>n+(t.queenIds?.length||0),0);
  battles.forEach((battle,idx)=>{
    if(activeCount===8){
      battle.queenIds=(teams[idx]?.queenIds||[]).slice(0,2);
    }else{
      // Top 10: one queen from each of the two houses. Top 9: one queen from each of the three houses.
      battle.queenIds=teams.map(t=>t.queenIds[idx]).filter(Boolean);
    }
  });
}

function buildTeamsForEpisode(structure, active){
  if(structure?.id==='fashion_wars')return buildFashionWarsTeams(active);
  if(!structure || structure.id==='solo')return [];
  let teamCount=2;
  if(structure.id==='duos') teamCount=Math.floor(active.length/2);
  if(structure.id==='teams3') teamCount=3;
  if(structure.id==='teams2') teamCount=2;
  while(teamCount>1 && active.length/teamCount<2)teamCount--;

  // Keep groups balanced. The largest group may only have one more queen than the smallest.
  // Examples: 9 in teams2 => 5/4, 10 in teams3 => 4/3/3, 9 in duos => 3/2/2/2.
  const baseSize=Math.floor(active.length/teamCount);
  const extra=active.length%teamCount;
  const targetSizes=Array.from({length:teamCount},(_,i)=>baseSize+(i<extra?1:0));
  const teams=Array.from({length:teamCount},()=>[]);
  const pool=shuffle(active);

  // Seed every team first, then fill only teams that still have capacity.
  for(let i=0;i<teamCount && pool.length;i++)teams[i].push(pool.shift().id);
  while(pool.length){
    const q=pool.shift();
    const scored=teams.map((team,idx)=>{
      if(team.length>=targetSizes[idx])return {idx,score:-Infinity};
      const rels=team.map(id=>gameState.relationships?.[q.id]?.[id]?.affinity||0);
      const avg=rels.length?rels.reduce((a,b)=>a+b,0)/rels.length:0;
      const productionChaos=Math.random()<0.18 ? -avg : 0;
      const fillNeed=(targetSizes[idx]-team.length)*18;
      return {idx,score:avg + productionChaos + fillNeed + rand(-8,8)};
    }).sort((a,b)=>b.score-a.score);
    teams[scored[0].idx].push(q.id);
  }
  return teams.map((ids,i)=>({
    id:'team_'+(i+1),
    name:structure.id==='duos'?(ids.length===2?`Pair ${i+1}`:`Group ${i+1}`):`Team ${i+1}`,
    queenIds:ids
  }));
}
function teamAffinityBonus(qId, ep){
  if(!ep?.teams?.length)return 0;
  const team=ep.teams.find(t=>t.queenIds.includes(qId));
  if(!team || team.queenIds.length<2)return 0;
  const rels=team.queenIds.filter(id=>id!==qId).map(id=>gameState.relationships?.[qId]?.[id]?.affinity||0);
  const avg=rels.reduce((a,b)=>a+b,0)/rels.length;
  if(avg>=50)return 2;
  if(avg>=20)return 1;
  if(avg<=-50)return -2;
  if(avg<=-20)return -1;
  return 0;
}
function pickGuestJudge(){return sample(gameState.data.guestJudges||[{name:'Guest Judge',note:'They are here for the fantasy.'}]);}

function pickTeamJudgingMode(structure){
  if(!structure || structure.id==='solo')return 'individual';
  // Ru may judge team challenges as a group or individually. Duos are more often judged as pairs.
  if(structure.id==='duos')return Math.random()<0.68?'team':'individual';
  return Math.random()<0.58?'team':'individual';
}
function getTeamForQueen(qId, ep){return ep?.teams?.find(t=>t.queenIds.includes(qId))||null;}
function teamAverageAffinity(team, ep){
  const ids=team?.queenIds||[];
  if(ids.length<2)return 0;
  let sum=0,count=0;
  for(let i=0;i<ids.length;i++){
    for(let j=i+1;j<ids.length;j++){
      const a=gameState.relationships?.[ids[i]]?.[ids[j]]?.affinity||0;
      const b=gameState.relationships?.[ids[j]]?.[ids[i]]?.affinity||0;
      sum+=(a+b)/2;
      count++;
    }
  }
  return count?sum/count:0;
}
function teamChemistryBonus(team, ep){
  const avg=teamAverageAffinity(team, ep);
  if(avg>=55)return 3;
  if(avg>=25)return 1.5;
  if(avg<=-55)return -3;
  if(avg<=-25)return -1.5;
  return 0;
}
function teamJudgingLabel(ep){
  if(!ep?.teams?.length)return 'Individual critiques';
  return ep.judgingMode==='team'?'Judged as groups':'Judged individually';
}



function pickChallengeContent(challengeId){
  const data=gameState.data||{};
  if(challengeId==='ball'){
    const ball=sample(data.balls||[]);
    return {
      ball,
      challengeTitle: ball?.title || 'The Ball',
      challengePrompt: `Three runway categories. One night. No mercy.`,
      runwayCategories: ball?.categories || ['First Category','Second Category','Constructed Eleganza'],
      mainTheme: ball?.mainTheme || ball?.title || 'Ball'
    };
  }
  if(challengeId==='fashion_wars'){
    const categories=shuffle(data.designChallenges || []);
    const category=categories[0] || {category:'Design', challenges:[]};
    const duelThemes=shuffle(category.challenges || []);
    const fallback=[
      {title:'Couture Combat', prompt:'Create a fashion-forward garment strong enough to win a runway duel.'},
      {title:'Needle and Nerve', prompt:'Turn fabric, styling, and attitude into a decisive fashion victory.'},
      {title:'Runway Warfare', prompt:'Build a look with enough concept and execution to defeat the queen across from you.'},
      {title:'Fashion Face-Off', prompt:'Make a garment that reads clearly, photographs beautifully, and beats the assignment.'},
      {title:'Eleganza Duel', prompt:'Serve construction, silhouette, and taste in a head-to-head design battle.'}
    ];
    const activeCount=gameState.queens.filter(q=>!q.isEliminated).length;
    const duelCount=activeCount===10?5:(activeCount===9?3:4);
    const battles=Array.from({length:duelCount},(_,i)=>{
      const theme=duelThemes[i%Math.max(1,duelThemes.length)] || fallback[i%fallback.length];
      return {id:`fashion_war_${i+1}`, title:theme.title, prompt:theme.prompt, queenIds:[], winnerId:null, winnerTeamId:null};
    });
    return {
      designCategory: category,
      fashionWars:true,
      challengeTitle:`The ${category.category || 'Design'} Fashion Wars`,
      challengePrompt:activeCount===8?'Four independent head-to-head design duels. No houses, no score: each pair fights for an individual placement.':'The queens face off in runway design battles. Each battle scores one point for a fashion house.',
      mainTheme:category.category || 'Fashion Wars',
      battles
    };
  }
if(challengeId==='design'){
  const category = sample(data.designChallenges || []);
  const design = sample(category?.challenges || []);

  return {
    designCategory: category,
    designTheme: design,
challengeTitle: design?.title || category?.category || 'Design Challenge',
    challengePrompt: design?.prompt || 'Create one original runway look using the assigned materials.',
    mainTheme: design?.title || 'Design'
  };
}
  if(challengeId==='makeover'){
    const makeover=sample(data.makeovers||['drag superfans']);
    return {
      makeoverSubject: makeover,
      challengeTitle: 'Makeover Challenge',
      challengePrompt: `Transform ${makeover} into members of your drag family. Family resemblance matters.`,
      mainTheme: `Make over ${makeover}`
    };
  }
  if(challengeId==='roast'){
    const roastTarget=sample(data.roastTargets||['the judging panel']);
    return {
      roastTarget,
      challengeTitle: 'The Roast',
      challengePrompt: `Prepare a roast of ${roastTarget}. Be funny, be sharp, and do not die up there.`,
      mainTheme: `Roast of ${roastTarget}`
    };
  }
  if(challengeId==='interview'){
    const interviewGuest=sample(data.interviewGuests||[{name:'the guest judge',vibe:'unpredictable'}]);
    return {
      interviewGuest,
      challengeTitle: 'Interview Challenge',
      challengePrompt: `Host a sit-down interview with ${interviewGuest.name}. The vibe is ${interviewGuest.vibe}.`,
      mainTheme: `Interview with ${interviewGuest.name}`
    };
  }
  if(challengeId==='girlgroup'){
    const genre=sample(data.girlGroupGenres||['pop']);
    return {genre, challengeTitle:'Girl Group', challengePrompt:`Write and perform an original verse for a ${genre} girl group track.`, mainTheme:genre};
  }
  if(challengeId==='rusical'){
    const rusical=sample(data.rusicals||['The Rusical']);
    return {rusical, challengeTitle:rusical, challengePrompt:'Learn the role, sell the lyrics, and survive the choreography.', mainTheme:rusical};
  }
  if(challengeId==='rumix'){
    const rumix=sample(data.rumixes||['Finale Rumix']);
    return {
      rumix,
      challengeTitle:'Rumix',
      challengePrompt:`Write, record, and perform an original verse for ${rumix}. This is about star power, lyrics, movement, and selling the final stretch of the season.`,
      mainTheme:rumix
    };
  }
  if(challengeId==='political_debate'){
    const debate=sample(data.politicalDebates||['a campaign debate']);
    return {
      debate,
      challengeTitle:'Political Debate',
      challengePrompt:`Campaign, debate, and sell your platform in ${debate}. Be persuasive, funny, and impossible to ignore.`,
      mainTheme:debate
    };
  }
  if(challengeId==='acting'){
    const script=sample(data.actingScripts||['a sketch']);
    return {script, challengeTitle:'Acting Challenge', challengePrompt:`Star in ${script}. Commit to the character and make the jokes land.`, mainTheme:script};
  }
  if(challengeId==='branding'){
    const product=sample(data.brandingProducts||['a signature product']);
    return {product, challengeTitle:'Branding Challenge', challengePrompt:`Create and sell ${product}. Make it memorable.`, mainTheme:product};
  }
  if(challengeId==='comedy'){
    const format=sample(data.comedyFormats||['a comedy set']);
    return {format, challengeTitle:'Comedy Challenge', challengePrompt:`Deliver ${format}. Timing is everything.`, mainTheme:format};
  }
  return {challengeTitle:null, challengePrompt:null, mainTheme:null};
}
function episodeDisplayTitle(challenge, theme, content, isSnatchGame){
  if(content?.challengeTitle)return content.challengeTitle;
  if(isSnatchGame)return 'Snatch Game';
  return theme?.name || challenge.name;
}
function episodeDisplayNotes(challenge, theme, content, isSnatchGame){
  if(content?.challengePrompt)return content.challengePrompt;
  if(isSnatchGame)return 'No weekly theme this time. Each queen chooses a celebrity, character, or pure camp entity to impersonate.';
  return theme?.notes || '';
}
function episodeRunwayForChallenge(challengeId, theme, content){
  if(challengeId==='ball')return (content?.runwayCategories?.[content.runwayCategories.length-1] || content?.mainTheme || 'Ball Eleganza');
  if(challengeId==='fashion_wars')return content?.challengeTitle || 'The Fashion Wars';
  if(challengeId==='design')return content?.designTheme?.title || 'Design';
  if(challengeId==='makeover')return 'Family Resemblance';
  const pool=(theme?.runway?.length?theme.runway:(gameState.data.runways||[]).map(r=>r.name));
  return sample(pool)||'Best Drag';
}

function assignSnatchCharacters(active){
  const list=shuffle([...(gameState.data.snatchCharacters||[])]);
  const fallback=[
    {name:'A desperate celebrity publicist', type:'industry chaos'},
    {name:'A haunted diva', type:'camp entity'},
    {name:'A glamorous tax problem', type:'absurd character'}
  ];
  return active.map((q,i)=>{
    const character=list[i]||fallback[i%fallback.length];
    return {queenId:q.id, queenName:q.name, character:character.name, characterType:character.type||'character'};
  });
}


function pickTalentShowPerformance(q){
  const pool=gameState.data.talentPerformances||['Original song performance','Lip sync dance number','Live singing','Comedy monologue'];
  const perf=sample(pool);
  return typeof perf==='string'?{name:perf,type:'performance'}:{...perf};
}
function pickTalentShowPerformanceByType(type){
  const wanted=String(type||'performance').toLowerCase();
  const all=gameState.data.talentPerformances||['Original song performance','Lip sync dance number','Live singing','Comedy monologue'];
  const normalized=all.map(perf=>typeof perf==='string'?{name:perf,type:'performance'}:{...perf});
  const pool=normalized.filter(perf=>String(perf.type||'performance').toLowerCase()===wanted);
  return sample(pool.length?pool:normalized) || {name:'Signature performance',type:wanted};
}
function choosePremiereFormat(castSize){
  if(castSize<12) return Math.random()<0.35?'normal_no_elim':'normal';
  const r=Math.random();
  if(r<0.35)return 'normal';
  if(r<0.70)return 'double';
  return 'double_no_elim';
}
function setupPremiereStructure(){
  const castSize=gameState.queens.length;
  const seasonFormat=getSeasonFormat();
  const format=seasonFormat==='regular'?choosePremiereFormat(castSize):'normal';
  const useTalent=Math.random()<0.5;
  gameState.season.premiere={format,useTalent,phase:0,complete:false};
  if(format.startsWith('double')){
    const shuffled=shuffle(gameState.queens.map(q=>q.id));
    const mid=Math.ceil(shuffled.length/2);
    gameState.season.premiere.groups=[shuffled.slice(0,mid), shuffled.slice(mid)];
  }
}
function nextPremiereParticipantIds(){
  const prem=gameState.season?.premiere;
  if(!prem || prem.complete)return null;
  if(prem.format==='normal' || prem.format==='normal_no_elim'){
    if(prem.phase>0){prem.complete=true; return null;}
    return gameState.queens.filter(q=>!q.isEliminated).map(q=>q.id);
  }
  if(prem.format.startsWith('double')){
    if(prem.phase>=2){prem.complete=true; return null;}
    return (prem.groups?.[prem.phase]||[]).filter(id=>!gameState.queens.find(q=>q.id===id)?.isEliminated);
  }
  return null;
}
function markPremierePhaseDone(){
  const prem=gameState.season?.premiere;
  if(!prem || prem.complete)return;
  prem.phase=(prem.phase||0)+1;
  if(prem.format==='normal' || prem.format==='normal_no_elim')prem.complete=true;
  if(prem.format.startsWith('double') && prem.phase>=2)prem.complete=true;
  // Double premieres get a second entrance before Part 2.
  // After Part 1 stats are applied, pause the flow on an entrance screen for the next group.
  if(prem.format?.startsWith('double') && !prem.complete) gameState.season.status='premiere_entrance';
  else if(gameState.season?.status!=='finished' && gameState.season?.status!=='finale') gameState.season.status='playing';
}
function currentPremiereEntranceIds(){
  const prem=gameState.season?.premiere;
  if(!prem || prem.complete || !prem.format?.startsWith('double'))return null;
  return (prem.groups?.[prem.phase||0]||[]).filter(id=>!gameState.queens.find(q=>q.id===id)?.isEliminated);
}
function isWaitingForPremiereEntrance(){
  const prem=gameState.season?.premiere;
  return !!(prem && prem.format?.startsWith('double') && !prem.complete && gameState.season.status==='premiere_entrance');
}

function currentEpisodeParticipantIds(){
  const ep=gameState.currentEpisode;
  if(!ep)return null;
  return Array.isArray(ep.participantIds)?ep.participantIds:null;
}
function isPlayerInCurrentEpisode(){
  const ids=currentEpisodeParticipantIds();
  if(!ids)return true;
  return ids.includes(gameState.playerQueenId);
}
function isCurrentEpisodePremiereObserver(){
  const ep=gameState.currentEpisode;
  return !!(ep?.special && ep?.premiereSpecial && !isPlayerInCurrentEpisode());
}
function currentEpisodeParticipantNames(){
  const ids=currentEpisodeParticipantIds();
  const queens=gameState.queens||[];
  return (ids||queens.filter(q=>!q.isEliminated).map(q=>q.id)).map(id=>queens.find(q=>q.id===id)?.name).filter(Boolean);
}

function shouldTriggerLalaparuza(activeCount){
  if(getSeasonFormat()!=='regular')return false;
  if(gameState.season?.lalaparuzaDone || gameState.season?.lalaparuzaChecked)return false;
  if(activeCount!==8)return false;
  gameState.season.lalaparuzaChecked=true;
  if(Math.random()<0.5){gameState.season.lalaparuzaDone=true; return true;}
  return false;
}
function buildSpecialTalentContent(active){
  return active.map(q=>({queenId:q.id,queenName:q.name,talent:pickTalentShowPerformance(q)}));
}
function makeTalentChallenge(){
  return {id:'talent',name:'Talent Show',teamMode:false,pairMode:false,runwayWeight:.10,weights:{cunt:.30,lipSync:.30,acting:.20,runway:.10,makeup:.10}};
}
function shouldOfferReunionSmackdown(){
  if(gameState.season?.reunionDone || gameState.season?.reunionChecked)return false;
  gameState.season.reunionChecked=true;
  return (gameState.eliminatedQueens||[]).length>=4 && Math.random()<0.5;
}

function generateEpisode(){
  const inTournamentGroups=isTournamentFormat(getSeasonFormat()) && gameState.season?.brackets?.stage!=='final';
  const returnTwistEpisode=inTournamentGroups?null:processReturnTwistsBeforeEpisode();
  if(returnTwistEpisode)return returnTwistEpisode;
  const premiereIds=inTournamentGroups?null:nextPremiereParticipantIds();
  const episodeIds=getEpisodeQueenIds();
  const fullActive=gameState.queens.filter(q=>!q.isEliminated && episodeIds.includes(q.id));
  const active=premiereIds?fullActive.filter(q=>premiereIds.includes(q.id)):fullActive;
  const activeCount=active.length;
  const fullActiveCount=fullActive.length;
  const number=gameState.episodeHistory.length+1;
  if(!premiereIds && shouldTriggerLalaparuza(fullActiveCount)){
    gameState.currentEpisode={number,activeCount:fullActiveCount,challengeType:'lalaparuza',challengeName:'Lalaparuza',themeId:'lalaparuza',themeName:'Lalaparuza Smackdown',themeNotes:'The queens lip sync in brackets. Lose and you move forward. Keep losing and you risk elimination.',runwayCategory:'Lip Sync Survival',runwayCategories:['Lip Sync Survival'],song:sample(gameState.data.songs),events: shuffle((gameState.data.events||[]).filter(e=>e && !['runway','judging'].includes(e.type))).slice(0, 2),guestJudge:pickGuestJudge(),structure:{id:'smackdown',label:'Lip Sync Smackdown'},teams:[],judgingMode:'individual',placements:[],bottomQueens:[],eliminatedQueenId:null,lipSyncResult:null,special:'lalaparuza',lalaparuzaMode:'callout_song_choice',participantIds:fullActive.map(q=>q.id),socialEvents:[]}; saveGame(); return gameState.currentEpisode;
  }
  const tournamentFinalFirstEpisode=isTournamentFormat(getSeasonFormat()) && gameState.season?.brackets?.stage==='final' && !(gameState.episodeHistory||[]).some(h=>h.special!=='tournament_bracket');
  let challenge=inTournamentGroups?pickTournamentBracketChallenge():(tournamentFinalFirstEpisode?makeTalentChallenge():pickChallengeByRules(fullActiveCount));
  if(getSeasonFormat()==='all_winners' && number===11)challenge=makeTalentChallenge();
  let premiereSpecial=null;
  if(premiereIds){
    const prem=gameState.season.premiere;
    const isNoElim=prem.format.includes('no_elim');
    premiereSpecial={format:prem.format,phase:prem.phase+1,noElim:isNoElim,useTalent:prem.useTalent};
    if(prem.useTalent){
      challenge=makeTalentChallenge();
      prem.sharedChallengeId='talent';
    } else if(prem.format && prem.format.startsWith('double')){
      // Double premieres use the same main challenge in both halves for fairness.
      // Runway/theme can still vary by episode.
      if(!prem.sharedChallengeId) prem.sharedChallengeId=challenge.id;
      challenge=gameState.data.challenges.find(c=>c.id===prem.sharedChallengeId) || challenge;
    }
  }
  const isSnatchGame=challenge.id==='snatchgame';
  const challengeContent=pickChallengeContent(challenge.id);
  if(challenge.id==='talent'){
    challengeContent.challengeTitle='Talent Show';
    challengeContent.challengePrompt='Each queen gets one spotlight moment. Original songs are popular, but some queens risk stranger talents.';
    challengeContent.mainTheme='Talent Show';
    challengeContent.talents=buildSpecialTalentContent(active);
  }
  const theme=(isSnatchGame || challenge.id==='talent' || ['ball','design','fashion_wars','makeover','roast','interview'].includes(challenge.id))?null:sample(gameState.data.themes);
  const runway=episodeRunwayForChallenge(challenge.id, theme, challengeContent);
  const runwayCategories=challengeContent.runwayCategories || [runway];
  const song=sample(gameState.data.songs);
  const miniChallenge=Math.random()>.45;
  const miniWinner=miniChallenge?sample(active):null;
  if(miniWinner)miniWinner.statistics.miniChallengeWins++;
  let structure=pickEpisodeStructure(challenge.id, activeCount);
  // Talent Show and Makeover are always individual, including normal and double premieres.
  if(challenge.id==='talent' || challenge.id==='makeover') structure={id:'solo',label:'Solo challenge'};
  const formationResult=buildTeamsForEpisodeWithFormation(structure, active, miniWinner);
  const teams=formationResult.teams;
  const teamFormation=formationResult.teamFormation;
  if(challenge.id==='fashion_wars')assignFashionWarsBattles({activeCount,teams,challengeContent});
  const guestJudge=pickGuestJudge();
  if(challenge.id==='interview'){
    challengeContent.interviewGuest={name:guestJudge?.name||'the guest judge', vibe:guestJudge?.note||'ready for a sit-down'};
    challengeContent.challengePrompt=`Host a sit-down interview with ${challengeContent.interviewGuest.name}. Keep it funny, sharp, and moving.`;
    challengeContent.mainTheme=`Interview with ${challengeContent.interviewGuest.name}`;
  }
  const judgingMode=(challenge.id==='fashion_wars' && activeCount!==8)?'team':((teams&&teams.length && challenge.id!=='fashion_wars')?pickTeamJudgingMode(structure):'individual');
  const snatchCharacters=isSnatchGame?assignSnatchCharacters(active):[];
  gameState.currentEpisode={
    number,
    activeCount,
    challengeType:challenge.id,
    challengeName:challenge.name,
    themeId:isSnatchGame?'snatchgame':(theme?.id||challenge.id),
    themeName:episodeDisplayTitle(challenge, theme, challengeContent, isSnatchGame),
    themeNotes:episodeDisplayNotes(challenge, theme, challengeContent, isSnatchGame),
    challengeContent,
    runwayCategory:runway,
    runwayCategories,
    miniChallenge,
    miniWinnerId:miniWinner?.id||null,
    miniWinnerName:miniWinner?.name||null,
    song,
    events: shuffle((gameState.data.events||[]).filter(e=>e && !['runway','judging'].includes(e.type))).slice(0, 2),
    guestJudge,
    structure,
    teams,
    teamFormation,
    judgingMode,
    snatchCharacters,
    participantIds:active.map(q=>q.id),
    blockedQueenAtStart:getSeasonFormat()==='all_winners'?(gameState.season.currentBlockedQueen||null):null,
    special:inTournamentGroups?'tournament_bracket':(premiereSpecial? (premiereSpecial.noElim?'premiere_no_elim':'premiere') : null),
    tournamentBracket:inTournamentGroups?{group:gameState.season.brackets.currentGroup,episodeNumber:gameState.season.brackets.groupEpisodeNumber}:null,
    premiereSpecial,
    placements:[],
    bottomQueens:[],
    eliminatedQueenId:null,
    lipSyncResult:null,
    playerEffects:null,
    socialEvents:[],
    untuckedSpontaneous:null,
    untuckedChoice:null
  };
  saveGame();
  return gameState.currentEpisode;
}
function isFinaleReady(){if(getSeasonFormat()==='all_winners')return (gameState.episodeHistory||[]).filter(e=>e?.placements?.length).length>=11; return gameState.queens.filter(q=>!q.isEliminated).length<=gameState.season.finaleSize;}

function trackRecordScore(q){
  // Finale history should respect wins first. Highs support a record, but should not outrank a much stronger winner.
  const st=q.statistics||{};
  return (st.wins||0)*100+(st.highs||0)*12+(st.safes||0)*2-(st.lows||0)*6-(st.bottoms||0)*10+(q.momentum||0)*2;
}
function compareFinaleTrackRecord(a,b){
  const sa=a.statistics||{}, sb=b.statistics||{};
  return (sb.wins||0)-(sa.wins||0)
    || trackRecordScore(b)-trackRecordScore(a)
    || (sb.highs||0)-(sa.highs||0)
    || (sa.bottoms||0)-(sb.bottoms||0)
    || (sb.safes||0)-(sa.safes||0)
    || String(a.name||'').localeCompare(String(b.name||''));
}
function publicFinaleScore(q){return (q.publicScores?.fans||0)+(q.publicScores?.production||0);}
function finalLipPerformance(q, song){
  const finalSong=song || sample(gameState.data?.songs||[]) || {title:'Finale Anthem',artist:'Drag Race Orchestra',energy:'high'};
  const override=(q.id===gameState.playerQueenId && gameState.season?.playerFinaleStrategy) ? gameState.season.playerFinaleStrategy : null;
  const moves=override && typeof lipSyncMovesFromStrategy==='function' ? lipSyncMovesFromStrategy(override, finalSong) : ((typeof chooseLipSyncMoves==='function')?chooseLipSyncMoves(finalSong,q):{strategy:'sell_lyrics'});
  const strategy=moves.strategy||override||'sell_lyrics';
  const strategyPower=(typeof lipSyncStrategyScore==='function')?lipSyncStrategyScore(strategy,finalSong,q)*0.28:0;
  const score=q.attributes.lipSync*4+q.attributes.cunt*1.5+(q.momentum||0)*2+strategyPower+rand(-6,6);
  return {score:Math.round(score*10)/10,strategy,moves};
}
function finalLipScore(q){return finalLipPerformance(q).score;}

function finalePublicRating(q, key){
  // Convert hidden public scores into a 0-100 finale rating.
  // This keeps fans/production meaningful without letting them dominate the crown.
  return clamp(50 + ((q.publicScores?.[key]||0)*0.45), 0, 100);
}
function finaleHistoryRating(q){
  const st = q.statistics || {};

  const raw =
      (st.wins || 0) * 16 +
    (st.highs || 0) * 10 +
    (st.safes || 0) * 4 +
    (st.lows || 0) * 0 -
    (st.bottoms || 0) * 2 +
    (q.momentum || 0) * 2;

  return clamp(raw, 0, 100);
}


function finaleLipRating(lipScore){
  // finalLipPerformance is roughly a 0-65 raw score. Turn it into a 0-100 rating.
  return clamp(lipScore*1.55, 0, 100);
}

function finaleWinBottomBonus(q){
  // Small finale edge: the final lip sync still matters most, but a cleaner and stronger
  // season record gives a light nudge. Previous lip sync appearances do not affect the
  // actual final lip-sync performance.
  const st=q.statistics||{};
  const wins=st.wins||0;
  const bottoms=st.bottoms||0;
  const lows=st.lows||0;
  const raw=(wins*1.6) - (bottoms*0.75) - (lows*0.20);
  return Math.round(clamp(raw,-3,7)*10)/10;
}

function finaleMomentumBonus(q){
  const last=(q.episodeHistory||[]).filter(h=>String(h.episode)!=='Finale').slice(-4);
  let bonus=0;
  last.forEach(h=>{
    if(h.placement==='WIN')bonus+=1.2;
    else if(h.placement==='HIGH' || h.placement==='TOP2')bonus+=0.6;
    else if(h.placement==='LOW')bonus-=0.5;
    else if(h.placement==='BTM' || h.placement==='ELIM')bonus+=0;
  });
  bonus+=(q.momentum||0)*0.25;
  const p=q.personalityId||'';
  if(['confident','fearless','competitive','ambitious'].includes(p))bonus+=0.7;
  if(['shy','reserved'].includes(p))bonus-=0.5;
  if(['perfectionist'].includes(p))bonus-=0.2;
  return Math.round(clamp(bonus,-4,4)*10)/10;
}
function finaleUnderdogBonus(q, opponent){
  const hq=finaleHistoryRating(q), ho=finaleHistoryRating(opponent);
  const winGap=(opponent.statistics?.wins||0)-(q.statistics?.wins||0);
  const bottomStory=(q.statistics?.bottoms||0)>=(opponent.statistics?.bottoms||0)+1;
  if(ho-hq>=18 && winGap>=2)return 3;
  if(ho-hq>=12 && (winGap>=1 || bottomStory))return 2;
  return 0;
}
function finaleClutchChoke(q){
  const p=q.personalityId||'';
  let bonus=0, note='';
  const roll=Math.random();
  if(['confident','fearless','competitive','ambitious','charming'].includes(p) && roll<0.18){bonus=rand(2,5); note='clutch';}
  else if(['shy','reserved','perfectionist'].includes(p) && roll<0.16){bonus=rand(-5,-2); note='choke';}
  else if(['chaotic','dramatic','eccentric','hotheaded'].includes(p) && roll<0.20){bonus=rand(-4,5); note=bonus>=0?'clutch':'choke';}
  return {bonus:Math.round(bonus*10)/10,note};
}
function finalDecisionScore(q, lip=0, opponent=null, extras=null){
  // v24 Crowning Rewrite: the final lip sync now matters more than track record.
  // 50% final lip sync, 30% season history, 10% fans, 10% production.
  // Bottom/lip-sync history remains part of track record, but it no longer drags down the final lip-sync performance itself.
  const score=finaleLipRating(lip)*0.50 + finaleHistoryRating(q)*0.30 + finalePublicRating(q,'fans')*0.10 + finalePublicRating(q,'production')*0.10;
  const winBottom=finaleWinBottomBonus(q);
  const momentum=finaleMomentumBonus(q);
  const underdog=opponent?finaleUnderdogBonus(q,opponent):0;
  const clutch=extras || {bonus:0,note:''};
  return Math.round((score + winBottom + momentum + underdog + (clutch.bonus||0))*10)/10;
}
function controlledFinaleRandom(diff){
  // Small variance: mostly matters when the result is already close.
  if(diff<3)return rand(-4,4);
  if(diff<7)return rand(-2.5,2.5);
  if(diff<12)return rand(-1.25,1.25);
  return rand(-0.4,0.4);
}
function makeFinalDuel(a,b,label='Final Lip Sync'){
  const song=sample(gameState.data?.songs||[]) || {title:'Finale Anthem',artist:'Drag Race Orchestra',energy:'high'};
  const pa=finalLipPerformance(a,song), pb=finalLipPerformance(b,song);
  const la=pa.score, lb=pb.score;
  const clutchA=finaleClutchChoke(a), clutchB=finaleClutchChoke(b);
  let sa=finalDecisionScore(a,la,b,clutchA), sb=finalDecisionScore(b,lb,a,clutchB);
  const preRandomDiff=Math.abs(sa-sb);
  const randomA=controlledFinaleRandom(preRandomDiff);
  const randomB=controlledFinaleRandom(preRandomDiff);
  sa=Math.round((sa+randomA)*10)/10;
  sb=Math.round((sb+randomB)*10)/10;
  let judgePreference=null;
  if(Math.abs(sa-sb)<2.5 && Math.random()<0.28){
    // In very tight finales, Ru/the judges may simply prefer one interpretation.
    const preferred=Math.random()<0.5?a:b;
    if(preferred.id===a.id){sa+=1.4; judgePreference=a.id;}
    else {sb+=1.4; judgePreference=b.id;}
  }
  const winner=sa>=sb?a:b;
  const loser=winner.id===a.id?b:a;
  return {
    label,
    song,
    queenIds:[a.id,b.id],
    lipScores:{[a.id]:Math.round(la*10)/10,[b.id]:Math.round(lb*10)/10},
    finaleRatings:{
      [a.id]:{lip:Math.round(finaleLipRating(la)*10)/10,history:Math.round(finaleHistoryRating(a)*10)/10,fans:Math.round(finalePublicRating(a,'fans')*10)/10,production:Math.round(finalePublicRating(a,'production')*10)/10,momentum:finaleMomentumBonus(a),winBottom:finaleWinBottomBonus(a),underdog:finaleUnderdogBonus(a,b),clutch:clutchA.bonus,random:Math.round(randomA*10)/10},
      [b.id]:{lip:Math.round(finaleLipRating(lb)*10)/10,history:Math.round(finaleHistoryRating(b)*10)/10,fans:Math.round(finalePublicRating(b,'fans')*10)/10,production:Math.round(finalePublicRating(b,'production')*10)/10,momentum:finaleMomentumBonus(b),winBottom:finaleWinBottomBonus(b),underdog:finaleUnderdogBonus(b,a),clutch:clutchB.bonus,random:Math.round(randomB*10)/10}
    },
    finaleNotes:{[a.id]:clutchA.note,[b.id]:clutchB.note,judgePreference},
    strategies:{[a.id]:pa.strategy,[b.id]:pb.strategy},
    strategyTexts:{[a.id]:(typeof lipSyncStrategyText==='function'?lipSyncStrategyText(pa.strategy):pa.strategy),[b.id]:(typeof lipSyncStrategyText==='function'?lipSyncStrategyText(pb.strategy):pb.strategy)},
    decisionScores:{[a.id]:Math.round(sa*10)/10,[b.id]:Math.round(sb*10)/10},
    winnerId:winner.id,
    loserId:loser.id
  };
}

function prepareAllWinnersFinale(){
  ensureAllWinnersState();
  const ranked=allWinnersRankedQueens();
  const top4=(gameState.season.allWinnersTop4?.length?gameState.season.allWinnersTop4:ranked.slice(0,4).map(q=>q.id));
  const secondary=(gameState.season.allWinnersSecondary4?.length?gameState.season.allWinnersSecondary4:ranked.slice(4,8).map(q=>q.id));
  const makeTournament=(ids,finalLabel)=>{
    const qs=ids.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
    const d1=makeFinalDuel(qs[0],qs[1],'Semifinal 1');
    const d2=makeFinalDuel(qs[2],qs[3],'Semifinal 2');
    const f1=gameState.queens.find(q=>q.id===d1.winnerId), f2=gameState.queens.find(q=>q.id===d2.winnerId);
    const fd=makeFinalDuel(f1,f2,finalLabel);
    return {duels:[d1,d2],finalDuel:fd,winnerId:fd.winnerId};
  };
  const secondaryT=makeTournament(secondary,'Final');
  const mainT=makeTournament(top4,'Grand Final');
  const finale={format:'all_winners',finalistIds:top4,secondaryIds:secondary,events:[],duels:mainT.duels,finalDuel:mainT.finalDuel,winnerId:mainT.winnerId,runnerUpIds:[mainT.finalDuel.loserId],finalistOnlyIds:[...mainT.duels.map(d=>d.loserId)],thirdFourthIds:[...mainT.duels.map(d=>d.loserId)],secondaryDuels:secondaryT.duels,secondaryFinalDuel:secondaryT.finalDuel,secondaryWinnerId:secondaryT.winnerId};
  gameState.season.allWinnersTop4=top4; gameState.season.allWinnersSecondary4=secondary; gameState.season.allWinnersSecondaryWinnerId=secondaryT.winnerId;
  return finale;
}

function prepareFinale(){
  if(gameState.season.finale)return gameState.season.finale;
  if(getSeasonFormat()==='all_winners'){const finale=prepareAllWinnersFinale(); gameState.season.status='finale'; gameState.season.finale=finale; saveGame(); return finale;}
  const finalists=gameState.queens.filter(q=>!q.isEliminated);
  const format=finalists.length>=4?sample(['top4_chosen','top4_lsfyc']):'top3_cut';
  const finale={format,finalistIds:finalists.map(q=>q.id),events:[],duels:[],finalDuel:null,winnerId:null,runnerUpIds:[],finalistOnlyIds:[],thirdFourthIds:[]};
  if(format==='top4_chosen'){
    const byHistory=[...finalists].sort(compareFinaleTrackRecord);
    const byPublic=[...finalists].sort((a,b)=>publicFinaleScore(b)-publicFinaleScore(a));
    const a=byHistory[0]; let b=byPublic.find(q=>q.id!==a.id)||byHistory[1];
    finale.events.push(`${a.name} is called forward for the strongest track record.`);
    finale.events.push(`${b.name} is called forward for the strongest connection with the audience and production.`);
    finale.thirdFourthIds=finalists.filter(q=>q.id!==a.id&&q.id!==b.id).map(q=>q.id);
    finale.finalDuel=makeFinalDuel(a,b,'Final Lip Sync');
    finale.winnerId=finale.finalDuel.winnerId;
    finale.runnerUpIds=[finale.finalDuel.loserId];
    finale.finalistOnlyIds=[...finale.thirdFourthIds];
  } else if(format==='top4_lsfyc'){
    const shuffled=shuffle(finalists);
    const d1=makeFinalDuel(shuffled[0],shuffled[1],'Semi-final Lip Sync 1');
    const d2=makeFinalDuel(shuffled[2],shuffled[3],'Semi-final Lip Sync 2');
    finale.duels=[d1,d2];
    const f1=gameState.queens.find(q=>q.id===d1.winnerId), f2=gameState.queens.find(q=>q.id===d2.winnerId);
    finale.finalDuel=makeFinalDuel(f1,f2,'Final Lip Sync');
    finale.winnerId=finale.finalDuel.winnerId;
    finale.thirdFourthIds=[d1.loserId,d2.loserId];
    finale.runnerUpIds=[finale.finalDuel.loserId];
    finale.finalistOnlyIds=[...finale.thirdFourthIds];
  } else {
    const ranked=[...finalists].sort(compareFinaleTrackRecord);
    const cut=ranked[ranked.length-1];
    const top2=ranked.slice(0,2);
    finale.events.push(`<h2>${cut.name}</h2><p>I'm sorry, my dear, but this is not your time.</p>`);
    finale.thirdFourthIds=[cut.id];
    finale.finalDuel=makeFinalDuel(top2[0],top2[1],'Final Lip Sync');
    finale.winnerId=finale.finalDuel.winnerId;
    finale.runnerUpIds=[finale.finalDuel.loserId];
    finale.finalistOnlyIds=[cut.id];
  }
  gameState.season.status='finale';
  gameState.season.finale=finale;
  saveGame();
  return finale;
}
function crownWinner(){
  const finale=prepareFinale();
  gameState.season.status='finished';
  gameState.season.winnerId=finale.winnerId;
const winnerQueen = gameState.queens.find(q => q.id === finale.winnerId);

if (winnerQueen) {
    winnerQueen.winner = true;
   saveCommunityQueen(winnerQueen);
}
  const allFinalists=gameState.queens.filter(q=>finale.finalistIds.includes(q.id));
  allFinalists.forEach(q=>{
    if(q.episodeHistory.some(h=>h.episode==='Finale'))return;
    let placement='FINALIST';
    let score=250;
    if(q.id===finale.winnerId){placement='WINNER'; score=999;}
    else if((finale.runnerUpIds||[]).includes(q.id)){placement='RUNNERUP'; score=650;}
    q.episodeHistory.push({episode:'Finale',challenge:'Grand Finale',placement,score});
  });
  saveGame();
  return finale;
}


const LALA_LIP_SYNC_STRATEGIES=[
  {id:'emotion',label:'Sell the Emotion',description:'Lead with vulnerability and make every beat feel personal.',bonusTags:['emotional','ballad','low']},
  {id:'sell_lyrics',label:'Sell the Lyrics',description:'Use face, timing, and intention to make the song feel written for you.',bonusTags:['vocals','emotional','ballad']},
  {id:'dance',label:'Dance the House Down',description:'Attack the rhythm and try to own the whole stage.',bonusTags:['dance','pop','high']},
  {id:'stunts',label:'Stunts & Tricks',description:'Go for big physical moments. It could be iconic or messy.',bonusTags:['stunt','performance','high'],risk:true},
  {id:'save_reveal',label:'Save the Reveal for the Climax',description:'Hold the reveal until the song hits its biggest moment.',bonusTags:['reveal','performance'],risk:true},
  {id:'reveal_early',label:'Reveal Early',description:'Shock the judges quickly and hope the energy carries through.',bonusTags:['reveal','performance'],risk:true},
  {id:'multiple_reveals',label:'Multiple Reveals',description:'Throw everything at the wall and pray it sticks.',bonusTags:['reveal','performance'],risk:true},
  {id:'overshadow',label:'Overshadow Your Opponent',description:'High risk: steal the spotlight.',bonusTags:['performance','high'],risk:true},
  {id:'play_safe',label:'Play It Safe',description:'Keep it clean and controlled, but risk being forgettable.',bonusTags:['safe'],risk:false}
];
function lipSyncStrategies(){return LALA_LIP_SYNC_STRATEGIES;}
function pickLipSyncSongs(count){
  const base=(gameState.data.songs)||[];
  const pool=shuffle(base.map(s=>Object.assign({},s,{tags:s.tags||[s.mood,s.energy].filter(Boolean),icons:s.icons||[]})));
  const songs=[];
  for(let i=0;i<count;i++)songs.push(pool[i%Math.max(1,pool.length)]||{title:'Lip Sync Song',artist:'Unknown Artist',energy:'high',mood:'pop',icons:[],tags:['performance']});
  return songs;
}
function strategyObj(id){return LALA_LIP_SYNC_STRATEGIES.find(s=>s.id===id)||LALA_LIP_SYNC_STRATEGIES[0];}
function autoLipSyncStrategy(q,song){
  const tags=[...(song?.tags||[]),song?.energy,song?.mood].map(x=>String(x||'').toLowerCase());
  const attrs=q.attributes||{};
  let best=LALA_LIP_SYNC_STRATEGIES[0], bestScore=-999;
  LALA_LIP_SYNC_STRATEGIES.forEach(st=>{
    let score=rand(0,2);
    (st.bonusTags||[]).forEach(t=>{if(tags.includes(String(t).toLowerCase()))score+=2;});
    if(st.id==='dance')score+=(attrs.dance||attrs.lipSync||5)/2;
    if(st.id==='stunts')score+=(attrs.lipSync||5)/2+(attrs.cunt||0)/4;
    if(st.id==='sell_lyrics')score+=(attrs.acting||5)/3+(attrs.lipSync||5)/3;
    if(st.id==='emotion')score+=(attrs.acting||5)/3+(attrs.cunt||0)/4;
    if(st.id==='overshadow')score+=(attrs.cunt||5)/2;
    if(['save_reveal','reveal_early','multiple_reveals'].includes(st.id))score+=(q.inventory?.reveals||0)?4:0;
    if(st.id==='play_safe')score+=q.stress>60?3:0;
    if(st.risk && q.stress>70)score-=2;
    if(score>bestScore){bestScore=score; best=st;}
  });
  return best.id;
}
function simpleLipSyncScoreFor(q,opts={}){
  const song=opts.song || sample(gameState.data.songs)||{energy:'high'};
  let oldStrategy=null;
  const strategyId=opts.strategy || gameState.currentEpisode?.playerSmackdownStrategy || gameState.season?.reunionPlayerStrategy || null;
  if(strategyId){oldStrategy=gameState.season.playerFinaleStrategy||null; gameState.season.playerFinaleStrategy=strategyId;}
  const perf=finalLipPerformance(q,song);
  if(strategyId){if(oldStrategy) gameState.season.playerFinaleStrategy=oldStrategy; else delete gameState.season.playerFinaleStrategy;}
  const st=strategyObj(strategyId||perf.strategy);
  const songTags=[...(song?.tags||[]),song?.energy,song?.mood].map(x=>String(x||'').toLowerCase());
  let score=perf.score;
  let strategyBonus=0;
  (st.bonusTags||[]).forEach(t=>{if(songTags.includes(String(t).toLowerCase()))strategyBonus+=0.65;});
  if(st.id==='dance')strategyBonus+=(q.attributes?.dance||q.attributes?.lipSync||5)*0.08;
  if(st.id==='stunts')strategyBonus+=(q.attributes?.lipSync||5)*0.1;
  if(st.id==='sell_lyrics')strategyBonus+=(q.attributes?.acting||q.attributes?.lipSync||5)*0.07;
  if(st.id==='emotion')strategyBonus+=(q.attributes?.acting||5)*0.08;
  if(st.id==='overshadow')strategyBonus+=(q.attributes?.cunt||5)*0.08;
  if(['save_reveal','reveal_early','multiple_reveals'].includes(st.id))strategyBonus+=(q.inventory?.reveals||0)?1.2:-0.4;
  if(st.id==='play_safe')strategyBonus= Math.min(strategyBonus+0.4,0.9);
  if(st.risk && Math.random()<0.22)strategyBonus-=rand(0.6,1.8);
  score+=strategyBonus;
  if(st.id==='play_safe')score=Math.min(score,8.6);
  return {queenId:q.id,name:q.name,score,song,strategy:st.id,strategyLabel:st.label,strategyBonus};
}
function runLipSyncDuelNoStats(a,b,label,opts={}){
  const song=opts.song || opts.songOverride || sample(gameState.data.songs)||{energy:'high'};
  const strategyByQueenId=opts.strategyByQueenId||{};
  const sa=simpleLipSyncScoreFor(a,{song,strategy:strategyByQueenId[a.id]||autoLipSyncStrategy(a,song)}), sb=simpleLipSyncScoreFor(b,{song,strategy:strategyByQueenId[b.id]||autoLipSyncStrategy(b,song)});
  const winner=sa.score>=sb.score?a:b;
  const loser=winner.id===a.id?b:a;
  return {label,queenIds:[a.id,b.id],scores:{[a.id]:sa.score,[b.id]:sb.score},winnerId:winner.id,loserId:loser.id,song,strategy:{[a.id]:sa.strategy,[b.id]:sb.strategy},strategyLabels:{[a.id]:sa.strategyLabel,[b.id]:sb.strategyLabel},context:opts.context||null};
}
function makePairs(list){
  const pool=shuffle(list);
  const pairs=[];
  while(pool.length>=2)pairs.push([pool.shift(),pool.shift()]);
  const bye=pool.shift()||null;
  return {pairs,bye};
}
function initLalaparuzaState(ep){
  if(ep.lalaparuzaState)return ep.lalaparuzaState;
  const active=(ep.participantIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const duelCount=Math.max(1,active.length-1);
  ep.lalaparuzaState={
    mode:ep.lalaparuzaMode||'callout_song_choice',
    format:'eight_queen_survival_bracket',
    phase:'draw',
    stage:'first',
    activeQueenIds:shuffle(active.map(q=>q.id)),
    safeQueenIds:[],
    dangerQueenIds:[],
    lowQueenIds:[],
    bottomQueenIds:[],
    availableSongs:pickLipSyncSongs(duelCount),
    usedSongs:[],
    duels:[],
    currentDuel:null,
    finalDuel:null
  };
  saveGame();
  return ep.lalaparuzaState;
}
function lalaparuzaStageLabel(stage){
  if(stage==='second')return 'Round 2: The danger bracket';
  if(stage==='final')return 'Final Bottom Lip Sync';
  return 'Round 1: First bracket';
}
function lalaparuzaAutoOpponent(callerId){
  const ep=gameState.currentEpisode, st=initLalaparuzaState(ep);
  const caller=gameState.queens.find(q=>q.id===callerId);
  const pool=st.activeQueenIds.filter(id=>id!==callerId).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  if(!pool.length)return null;
  if(pool.length===1)return pool[0].id;
  return pool.sort((a,b)=>{
    const relA=(caller.relationships?.[a.id]?.affinity||0)+(caller.relationships?.[a.id]?.respect||0);
    const relB=(caller.relationships?.[b.id]?.affinity||0)+(caller.relationships?.[b.id]?.respect||0);
    const threatA=(a.statistics?.wins||0)*2+(a.statistics?.highs||0)+(a.attributes?.lipSync||5);
    const threatB=(b.statistics?.wins||0)*2+(b.statistics?.highs||0)+(b.attributes?.lipSync||5);
    return (relA-threatA+rand(-2,2))-(relB-threatB+rand(-2,2));
  })[0]?.id||pool[0].id;
}
function lalaparuzaAutoSong(chooserId){
  const ep=gameState.currentEpisode, st=initLalaparuzaState(ep);
  const q=gameState.queens.find(x=>x.id===chooserId);
  if(!st.availableSongs.length)return null;
  return st.availableSongs.map((song,i)=>({song,i,score:strategyObj(autoLipSyncStrategy(q,song)).bonusTags.filter(t=>(song.tags||[]).includes(t)||song.energy===t||song.mood===t).length+Math.random()})).sort((a,b)=>b.score-a.score)[0].i;
}
function beginLalaparuzaDuel(callerId,opponentId,songIndex){
  const ep=gameState.currentEpisode, st=initLalaparuzaState(ep);
  callerId=callerId||sample(st.activeQueenIds);
  opponentId=opponentId||lalaparuzaAutoOpponent(callerId);
  const isFinal=st.stage==='final';
  if(isFinal && st.activeQueenIds.length===2 && (!callerId || !opponentId)){callerId=st.activeQueenIds[0]; opponentId=st.activeQueenIds[1];}
  if(songIndex===undefined || songIndex===null) songIndex=lalaparuzaAutoSong(opponentId);
  const song=st.availableSongs.splice(Math.max(0,Number(songIndex)||0),1)[0] || pickLipSyncSongs(1)[0];
  st.currentDuel={round:st.duels.length+1,stage:st.stage,stageLabel:lalaparuzaStageLabel(st.stage),callerId,opponentId,song,strategyByQueenId:{},winnerId:'',loserId:'',resultText:'',isFinal};
  st.phase='strategy';
  delete st.drawnQueenId;
  delete ep.lalaparuzaPendingChoice;
  saveGame();
  return st.currentDuel;
}
function advanceLalaparuzaBracketAfterDuel(st,cd){
  const removeDuelists=()=>{st.activeQueenIds=st.activeQueenIds.filter(id=>id!==cd.winnerId && id!==cd.loserId);};
  if(cd.isFinal){
    st.finalDuel=cd;
    st.phase='complete';
    st.activeQueenIds=[];
    return;
  }
  if(cd.stage==='first'){
    st.safeQueenIds.push(cd.winnerId);
    st.dangerQueenIds.push(cd.loserId);
    removeDuelists();
    if(st.activeQueenIds.length<=0){
      st.stage='second';
      st.activeQueenIds=shuffle(st.dangerQueenIds.slice());
      st.dangerQueenIds=[];
    }
    st.phase='draw';
    return;
  }
  if(cd.stage==='second'){
    st.lowQueenIds.push(cd.winnerId);
    st.bottomQueenIds.push(cd.loserId);
    removeDuelists();
    if(st.activeQueenIds.length<=0){
      st.stage='final';
      st.activeQueenIds=shuffle(st.bottomQueenIds.slice());
    }
    st.phase='draw';
    return;
  }
  st.phase='draw';
}
function completeLalaparuzaDuel(strategyByQueenId={}){
  const ep=gameState.currentEpisode, st=initLalaparuzaState(ep), cd=st.currentDuel;
  if(!cd)return null;
  cd.strategyByQueenId=Object.assign({},strategyByQueenId);
  const a=gameState.queens.find(q=>q.id===cd.callerId), b=gameState.queens.find(q=>q.id===cd.opponentId);
  const d=runLipSyncDuelNoStats(a,b,cd.isFinal?'Final bottom lip sync':cd.stageLabel,{song:cd.song,strategyByQueenId:cd.strategyByQueenId,context:'lalaparuza'});
  const loserText=cd.isFinal
    ? `${qName(d.loserId)} sashays away.`
    : (cd.stage==='first' ? `${qName(d.loserId)} loses and enters the danger bracket.` : `${qName(d.loserId)} loses and becomes Bottom 2.`);
  Object.assign(cd,{queenIds:d.queenIds,scores:d.scores,winnerId:d.winnerId,loserId:d.loserId,strategy:d.strategy,strategyLabels:d.strategyLabels,resultText:`${qName(d.winnerId)} wins. ${loserText}`});
  st.usedSongs.push(cd.song);
  st.duels.push(cd);
  advanceLalaparuzaBracketAfterDuel(st,cd);
  st.currentDuel=null;
  saveGame();
  if(st.phase==='complete')return resolveLalaparuza();
  return cd;
}
function resolveLalaparuza(){
  const ep=gameState.currentEpisode;
  if(ep.lalaparuzaResult)return ep.lalaparuzaResult;
  if(ep.lalaparuzaState?.phase!=='complete'){
    const st=initLalaparuzaState(ep);
    while(st.phase!=='complete'){
      const caller=sample(st.activeQueenIds);
      const opponent=lalaparuzaAutoOpponent(caller);
      beginLalaparuzaDuel(caller,opponent,lalaparuzaAutoSong(opponent));
      const cd=st.currentDuel;
      completeLalaparuzaDuel({[cd.callerId]:autoLipSyncStrategy(gameState.queens.find(q=>q.id===cd.callerId),cd.song),[cd.opponentId]:autoLipSyncStrategy(gameState.queens.find(q=>q.id===cd.opponentId),cd.song)});
    }
  }
  const st=ep.lalaparuzaState;
  const final=st.finalDuel;
  const eliminated=gameState.queens.find(q=>q.id===final.loserId);
  const survivor=gameState.queens.find(q=>q.id===final.winnerId);
  const firstDuels=st.duels.filter(d=>d.stage==='first');
  const secondDuels=st.duels.filter(d=>d.stage==='second');
  const rounds=[];
  firstDuels.forEach((d,i)=>rounds.push({round:i+1,stage:'first',title:`Chave ${i+1}`,duels:[d],byeId:null,advancedLoserIds:[d.loserId]}));
  if(secondDuels.length)rounds.push({round:5,stage:'second',title:'Segunda parte: Danger bracket',duels:secondDuels,byeId:null,advancedLoserIds:secondDuels.map(d=>d.loserId)});
  ep.lalaparuzaResult={mode:st.mode,format:st.format,rounds,duels:st.duels,final,eliminatedQueenId:eliminated.id,survivorId:survivor.id,safeQueenIds:st.safeQueenIds,lowQueenIds:st.lowQueenIds,bottomQueenIds:st.bottomQueenIds,usedSongs:st.usedSongs};
  ep.eliminatedQueenId=eliminated.id;
  const activeBeforeElim=(ep.participantIds||[]).map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean);
  const safeIds=new Set(st.safeQueenIds||[]);
  const lowIds=new Set(st.lowQueenIds||[]);
  function lalaparuzaPlacementFor(q){
    if(q.id===eliminated.id)return 'ELIM';
    if(q.id===survivor.id)return 'BTM';
    if(lowIds.has(q.id))return 'LOW';
    if(safeIds.has(q.id))return 'SAFE';
    return 'LOW';
  }
  ep.placements=activeBeforeElim.map(q=>({queenId:q.id,name:q.name,placement:lalaparuzaPlacementFor(q),score:0,riskLabel:'Lip sync'}));
  activeBeforeElim.forEach(q=>{
    const placement=lalaparuzaPlacementFor(q);
    if(!(q.episodeHistory||[]).some(h=>String(h.episode)===String(ep.number)))q.episodeHistory.push({episode:ep.number,challenge:'Lalaparuza',placement,score:0,lipSync:placement!=='SAFE'});
    q.statistics.episodesCompeted=(q.statistics.episodesCompeted||0)+1;
    if(placement==='SAFE')q.statistics.safes=(q.statistics.safes||0)+1;
    if(placement==='LOW')q.statistics.lows=(q.statistics.lows||0)+1;
    if(placement==='BTM')q.statistics.bottoms=(q.statistics.bottoms||0)+1;
    if(placement==='BTM')q.statistics.lipSyncWins=(q.statistics.lipSyncWins||0)+1;
    if(placement==='ELIM')q.statistics.lipSyncLosses=(q.statistics.lipSyncLosses||0)+1;
  });
  eliminated.isEliminated=true;
  if(!gameState.eliminatedQueens.some(q=>q.id===eliminated.id))gameState.eliminatedQueens.push(eliminated);
  ep.statsApplied=true;
  gameState.episodeHistory.push(JSON.parse(JSON.stringify(ep)));
  saveGame();
  return ep.lalaparuzaResult;
}
function resolveReunionSmackdown(){
  if(gameState.season.reunionResult)return gameState.season.reunionResult;
  let pool=[...(gameState.eliminatedQueens||[])];
  const rounds=[];
  let round=1;
  while(pool.length>1){
    const {pairs,bye}=makePairs(pool);
    const winners=bye?[bye]:[];
    const duels=[];
    pairs.forEach(pair=>{
      const d=runLipSyncDuelNoStats(pair[0],pair[1],`Reunion Round ${round}`);
      duels.push(d);
      winners.push(gameState.queens.find(q=>q.id===d.winnerId));
    });
    rounds.push({round,duels,byeId:bye?.id||null,winnerIds:winners.map(q=>q.id)});
    pool=winners;
    round++;
  }
  gameState.season.reunionDone=true;
  gameState.season.reunionResult={rounds,winnerId:pool[0]?.id||null,title:'Queen of She Already Done Had Herses'};
  saveGame();
  return gameState.season.reunionResult;
}
