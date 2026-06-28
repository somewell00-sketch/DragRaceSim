function randomAmbition(){return Math.max(1,Math.min(5,Math.ceil(Math.random()*5)));}
function createQueenFromForm(form){return {id:'player_'+Date.now(),name:form.name||'Your Queen',type:form.type,personalityId:form.personalityId,isPlayer:true,isEliminated:false,attributes:form.attributes,momentum:0,confidence:5,ambition:form.ambition||3,energy:80,stress:20,publicScores:{production:0,queens:0,fans:0},inventory:{reveals:3},portrait:form.portrait||{type:'gradient',image:null},statistics:{wins:0,highs:0,safes:0,lows:0,bottoms:0,lipSyncWins:0,lipSyncLosses:0,miniChallengeWins:0,episodesCompeted:0},episodeHistory:[],confessionals:[],performanceArc:null};}
function hydrateQueen(q){return {...JSON.parse(JSON.stringify(q)),isPlayer:false,isEliminated:false,momentum:0,confidence:5,ambition:q.ambition||randomAmbition(),energy:80,stress:20,publicScores:{production:0,queens:0,fans:0},inventory:{reveals:3},portrait:q.portrait||{type:'gradient',image:null},statistics:{wins:0,highs:0,safes:0,lows:0,bottoms:0,lipSyncWins:0,lipSyncLosses:0,miniChallengeWins:0,episodesCompeted:0},episodeHistory:[],confessionals:[],performanceArc:null};}
function cloneAttributes(attrs){return JSON.parse(JSON.stringify(attrs||{cunt:7,lipSync:7,makeup:7,sewing:7,runway:7,acting:7}));}
function randomizeAttributes(base){
  const randomized={};
  ['cunt','lipSync','makeup','sewing','runway','acting'].forEach(attr=>{
    randomized[attr]=clamp(Math.round((Number(base[attr])||7)+rand(-2,2)),1,10);
  });
  return randomized;
}
function generatedQueenName(index, usedNames=new Set()){
  const parts=gameState.data.nameParts||{};
  const firsts=parts.firstNames||['Cherry','Divina','Maxi','Pearl','Sasha','Tina','Vera','Zaza'];
  const lasts=parts.lastNames||['Voltage','Storm','Minx','Panic','Static','Tension','Vixen','Royale'];
  for(let attempt=0; attempt<80; attempt++){
    const name=`${sample(firsts)} ${sample(lasts)}`;
    if(!usedNames.has(name)){usedNames.add(name); return name;}
  }
  const fallback=`${sample(firsts)} ${sample(lasts)} ${index}`;
  usedNames.add(fallback);
  return fallback;
}
function slugifyQueenName(name,index){
  return String(name||('queen_'+index)).toLowerCase().replace(/[^a-z0-9]+/g,'_').replace(/^_|_$/g,'')+'_'+index+'_'+Date.now();
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
    ambition:randomAmbition(),
    attributes:attrs
  });
}
function makeExtraQueen(index){return makeGeneratedQueen(index,new Set());}
function buildNpcCast(size){
  const needed=Math.max(7,Math.min(15,Number(size||14)-1));
  const usedNames=new Set();
  const cast=[];
  for(let i=1;i<=needed;i++) cast.push(makeGeneratedQueen(i, usedNames));
  return cast;
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
function startSeason(playerQueen, castSize='random'){const data=gameState.data; resetState(); gameState.data=data; const allowedCastSizes=[8,9,10,11,12,13,14,15,16]; const resolvedCastSize=String(castSize)==='random'?sample(allowedCastSizes):Math.max(8,Math.min(16,Number(castSize||14))); gameState.settings.castSize=resolvedCastSize; gameState.playerQueenId=playerQueen.id; const cast=buildNpcCast(gameState.settings.castSize); gameState.queens=shuffle([playerQueen,...cast]); const finaleSize=pickFinaleSize(gameState.queens.length); gameState.season={number:1,status:'entrance',finaleSize,doubleShantayUsed:false,doubleSashayUsed:false,challengePlan:{},finale:null,lalaparuzaDone:false,lalaparuzaChecked:false,reunionDone:false,reunionChecked:false,usedRunwayActions:[]}; setupPremiereStructure(); gameState.season.challengePlan=createSeasonChallengePlan(gameState.queens.length, gameState.season.finaleSize); initializePerformanceArcs(); initializeRelationships(); if(typeof ensureAllSocialStats==='function')ensureAllSocialStats(); saveGame();}
function challengeFamily(id){
  const key=String(id||'').toLowerCase();
  if(['rusical','girlgroup','musical','rumix'].includes(key)||key.includes('rusical')||key.includes('musical')||key.includes('rumix'))return 'performance';
  if(['acting','improv'].includes(key))return 'acting';
  if(['comedy','roast','snatchgame','snatch game'].includes(key))return 'comedy';
  if(['branding','advertisement','commercial'].includes(key))return 'branding';
  if(['interview','hosting','podcast'].includes(key))return 'hosting';
  if(['design','ball','makeover'].includes(key))return 'fashion';
  return key;
}
function createSeasonChallengePlan(startCount=14, finaleSize=4){
  const counts=[];
  for(let n=startCount;n>finaleSize;n--)counts.push(n);
  const inRange=(min,max)=>counts.filter(n=>n<=max&&n>=min);
  const snatchOptions=inRange(7,10);
  const makeoverOptions=inRange(5,6);
  const roastOptions=inRange(5,7);
  const rusicalOptions=inRange(5,10);
  const required=['snatchgame','makeover','roast','rusical'];
  let best={};
  for(let attempt=0; attempt<300; attempt++){
    const plan={};
    const snatch=sample(snatchOptions); if(!snatch)continue; plan[snatch]='snatchgame';
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
  return best;
}
function alreadyUsedChallenge(id){return gameState.episodeHistory.some(ep=>ep.challengeType===id);}
function isUniqueSeasonChallenge(challengeOrId){
  const challenge=typeof challengeOrId==='object'?challengeOrId:(gameState.data.challenges||[]).find(c=>c.id===challengeOrId);
  const id=String(challenge?.id||challengeOrId||'').toLowerCase();
  const name=String(challenge?.name||'').toLowerCase();
  if(challenge?.uniqueSeason)return true;
  // These are special-format challenges: maximum once per season, except when a double premiere repeats
  // the same selected challenge for both premiere groups. Ball is intentionally not included.
  return [
    'talent','snatchgame','makeover','roast','rusical','branding','rumix','political','debate'
  ].some(key=>id.includes(key)||name.includes(key));
}
function requiredChallengeForActiveCount(activeCount){
  const planned=gameState.season?.challengePlan?.[activeCount];
  if(planned && !alreadyUsedChallenge(planned))return planned;
  return null;
}
function pickChallengeByRules(activeCount){
  const challenges=gameState.data.challenges;
  const requiredId=requiredChallengeForActiveCount(activeCount);
  if(requiredId){
    const required=challenges.find(c=>c.id===requiredId);
    if(required)return required;
  }
  const last=gameState.episodeHistory[gameState.episodeHistory.length-1];
  const lastFamily=challengeFamily(last?.challengeType||last?.challengeName);
  let available=challenges.filter(c=>{
    if(isUniqueSeasonChallenge(c)&&alreadyUsedChallenge(c.id))return false;
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
  const solo=['talent','design','ball','comedy','roast','snatchgame','interview','rumix','political_debate'];
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
function buildTeamsForEpisode(structure, active){
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
  if(challengeId==='design'){
    const theme=sample(data.balls||[]);
    return {
      designTheme: theme,
      challengeTitle: `${theme?.mainTheme || theme?.title || 'Unconventional'} Design Challenge`,
      challengePrompt: `Create one original runway look inspired by ${theme?.mainTheme || theme?.title || 'the assigned materials'}.`,
      mainTheme: theme?.mainTheme || theme?.title || 'Design'
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
  if(challengeId==='ball')return (content?.runwayCategories?.[0] || 'Ball Eleganza');
  if(challengeId==='design')return `${content?.mainTheme || 'Design'} Eleganza`;
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
  return typeof perf==='string'?{name:perf,type:'performance'}:perf;
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
  const format=choosePremiereFormat(castSize);
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
  const premiereIds=nextPremiereParticipantIds();
  const fullActive=gameState.queens.filter(q=>!q.isEliminated);
  const active=premiereIds?fullActive.filter(q=>premiereIds.includes(q.id)):fullActive;
  const activeCount=active.length;
  const fullActiveCount=fullActive.length;
  const number=gameState.episodeHistory.length+1;
  if(!premiereIds && shouldTriggerLalaparuza(fullActiveCount)){
    gameState.currentEpisode={number,activeCount:fullActiveCount,challengeType:'lalaparuza',challengeName:'Lalaparuza',themeId:'lalaparuza',themeName:'Lalaparuza Smackdown',themeNotes:'The queens lip sync in brackets. Lose and you move forward. Keep losing and you risk elimination.',runwayCategory:'Lip Sync Survival',runwayCategories:['Lip Sync Survival'],song:sample(gameState.data.songs),event:sample(gameState.data.events),guestJudge:pickGuestJudge(),structure:{id:'smackdown',label:'Lip Sync Smackdown'},teams:[],judgingMode:'individual',placements:[],bottomQueens:[],eliminatedQueenId:null,lipSyncResult:null,special:'lalaparuza',participantIds:fullActive.map(q=>q.id),socialEvents:[]}; saveGame(); return gameState.currentEpisode;
  }
  let challenge=pickChallengeByRules(fullActiveCount);
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
  const theme=(isSnatchGame || challenge.id==='talent' || ['ball','design','makeover','roast','interview'].includes(challenge.id))?null:sample(gameState.data.themes);
  const runway=episodeRunwayForChallenge(challenge.id, theme, challengeContent);
  const runwayCategories=challengeContent.runwayCategories || [runway];
  const song=sample(gameState.data.songs);
  const miniChallenge=Math.random()>.45;
  const miniWinner=miniChallenge?sample(active):null;
  if(miniWinner)miniWinner.statistics.miniChallengeWins++;
  let structure=pickEpisodeStructure(challenge.id, activeCount);
  // Talent Show is always individual, including normal and double premieres.
  if(challenge.id==='talent') structure={id:'solo',label:'Solo challenge'};
  const teams=buildTeamsForEpisode(structure, active);
  const guestJudge=pickGuestJudge();
  if(challenge.id==='interview'){
    challengeContent.interviewGuest={name:guestJudge?.name||'the guest judge', vibe:guestJudge?.note||'ready for a sit-down'};
    challengeContent.challengePrompt=`Host a sit-down interview with ${challengeContent.interviewGuest.name}. Keep it funny, sharp, and moving.`;
    challengeContent.mainTheme=`Interview with ${challengeContent.interviewGuest.name}`;
  }
  const judgingMode=(teams&&teams.length)?pickTeamJudgingMode(structure):'individual';
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
    event:sample(gameState.data.events),
    guestJudge,
    structure,
    teams,
    judgingMode,
    snatchCharacters,
    participantIds:active.map(q=>q.id),
    special:premiereSpecial? (premiereSpecial.noElim?'premiere_no_elim':'premiere') : null,
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
function isFinaleReady(){return gameState.queens.filter(q=>!q.isEliminated).length<=gameState.season.finaleSize;}

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
  const st=q.statistics||{};
  const raw=(st.wins||0)*16+(st.highs||0)*7+(st.safes||0)*2-(st.lows||0)*4-(st.bottoms||0)*7+(q.momentum||0)*2;
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
function prepareFinale(){
  if(gameState.season.finale)return gameState.season.finale;
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


function simpleLipSyncScoreFor(q){
  const song=sample(gameState.data.songs)||{energy:'high'};
  let oldStrategy=null;
  const smackStrategy=gameState.currentEpisode?.playerSmackdownStrategy || gameState.season?.reunionPlayerStrategy || null;
  if(q.id===gameState.playerQueenId && smackStrategy){
    oldStrategy=gameState.season.playerFinaleStrategy||null;
    gameState.season.playerFinaleStrategy=smackStrategy;
  }
  const perf=finalLipPerformance(q,song);
  if(q.id===gameState.playerQueenId && smackStrategy){
    if(oldStrategy) gameState.season.playerFinaleStrategy=oldStrategy;
    else delete gameState.season.playerFinaleStrategy;
  }
  return {queenId:q.id,name:q.name,score:perf.score,song,strategy:perf.strategy};
}
function runLipSyncDuelNoStats(a,b,label){
  const sa=simpleLipSyncScoreFor(a), sb=simpleLipSyncScoreFor(b);
  const winner=sa.score>=sb.score?a:b;
  const loser=winner.id===a.id?b:a;
  return {label,queenIds:[a.id,b.id],scores:{[a.id]:sa.score,[b.id]:sb.score},winnerId:winner.id,loserId:loser.id,song:sa.song,strategy:{[a.id]:sa.strategy,[b.id]:sb.strategy}};
}
function makePairs(list){
  const pool=shuffle(list);
  const pairs=[];
  while(pool.length>=2)pairs.push([pool.shift(),pool.shift()]);
  const bye=pool.shift()||null;
  return {pairs,bye};
}
function resolveLalaparuza(){
  const ep=gameState.currentEpisode;
  if(ep.lalaparuzaResult)return ep.lalaparuzaResult;
  let current=gameState.queens.filter(q=>!q.isEliminated);
  const rounds=[];
  let round=1;
  while(current.length>2){
    const {pairs,bye}=makePairs(current);
    const losers=[];
    const duels=[];
    if(bye) losers.push(bye); // in a lose-to-advance format, a bye keeps you in danger
    pairs.forEach(pair=>{
      const d=runLipSyncDuelNoStats(pair[0],pair[1],`Round ${round}`);
      duels.push(d);
      losers.push(gameState.queens.find(q=>q.id===d.loserId));
    });
    rounds.push({round,duels,byeId:bye?.id||null,advancedLoserIds:losers.map(q=>q.id)});
    current=losers;
    round++;
  }
  const final=runLipSyncDuelNoStats(current[0],current[1],'Final bottom lip sync');
  const eliminated=gameState.queens.find(q=>q.id===final.loserId);
  const survivor=gameState.queens.find(q=>q.id===final.winnerId);
  ep.lalaparuzaResult={rounds,final,eliminatedQueenId:eliminated.id,survivorId:survivor.id};
  ep.eliminatedQueenId=eliminated.id;
  const activeBeforeElim=gameState.queens.filter(q=>!q.isEliminated);
  const firstRoundWinners=new Set((rounds[0]?.duels||[]).map(d=>d.winnerId));
  const laterRoundWinners=new Set(rounds.slice(1).flatMap(r=>(r.duels||[]).map(d=>d.winnerId)));
  const finalIds=new Set(final.queenIds||[]);
  function lalaparuzaPlacementFor(q){
    // Lalaparuza track record convention:
    // - first round winners are SAFE;
    // - queens who lose round 1 but win a later lip sync are LOW;
    // - the final lip sync winner is still marked BTM, not LIPSYNC WIN;
    // - the final loser is ELIM.
    if(q.id===eliminated.id)return 'ELIM';
    if(q.id===survivor.id)return 'BTM';
    if(firstRoundWinners.has(q.id) && !laterRoundWinners.has(q.id) && !finalIds.has(q.id))return 'SAFE';
    return 'LOW';
  }
  ep.placements=activeBeforeElim.map(q=>({queenId:q.id,name:q.name,placement:lalaparuzaPlacementFor(q),score:0,riskLabel:'Lip sync'}));
  activeBeforeElim.forEach(q=>{
    const placement=lalaparuzaPlacementFor(q);
    if(!(q.episodeHistory||[]).some(h=>String(h.episode)===String(ep.number))){
      q.episodeHistory.push({episode:ep.number,challenge:'Lalaparuza',placement,score:0,lipSync:placement!=='SAFE'});
    }
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
