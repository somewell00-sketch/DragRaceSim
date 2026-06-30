function runwayTootBootMetric(p){
  return typeof p.tootBootScore==='number' ? p.tootBootScore : p.runway;
}
function runwayTone(p, placements){
  const values=placements.map(x=>runwayTootBootMetric(x)).sort((a,b)=>a-b);
  const median=values[Math.floor(values.length/2)] || 0;
  const good=[
    'sold the fantasy and charged full price.',
    'served the category with nerve and polish.',
    'walked like the runway owed her money.',
    'understood the assignment and signed it in rhinestones.',
    'looked expensive, dangerous, and very pleased about it.',
    'gave the judges something to point at.',
    'turned the runway into her personal meet-and-greet.',
    'made the silhouette do the reading.'
  ];
  const bad=[
    'missed the category and the exit sign.',
    'looked like the concept filed for divorce.',
    'had presence, but the outfit was asking for help.',
    'gave an idea, but not a finished sentence.',
    'let the runway swallow her whole.',
    'looked less main stage, more last-minute packing.',
    'served confusion with a side of fabric.',
    'left the judges wanting a stronger edit.'
  ];
  const mid=[
    'was cute, but the replay may forget her number.',
    'did enough, not a crime and not a crown.',
    'kept it clean, but not exactly legendary.',
    'gave safe with a fresh coat of lip gloss.',
    'was pleasant. The shade is that pleasant is not memorable.',
    'crossed the runway without causing a lawsuit.',
    'had moments, but no gag.',
    'served a polite little fantasy.'
  ];
  const bank=gameState.data?.narrativeExpansion?.runwayDescriptions || gameState.data?.narrativeText?.runwayDescriptions || null;
  if(bank){
    if(runwayTootBootMetric(p) >= median + 7) return sample(bank.legendary||good);
    if(runwayTootBootMetric(p) >= median + 5) return sample(bank.great||good);
    if(runwayTootBootMetric(p) <= median - 7) return sample(bank.flop||bad);
    if(runwayTootBootMetric(p) <= median - 5) return sample(bank.weak||bad);
    if(Math.abs(runwayTootBootMetric(p)-median)<=2) return sample(bank.safe||mid);
    return sample(bank.mixed||mid);
  }
  if(runwayTootBootMetric(p) >= median + 5) return sample(good);
  if(runwayTootBootMetric(p) <= median - 5) return sample(bad);
  return sample(mid);
}
function getRunwayOrder(ep, placements){if(!ep.runwayOrder || ep.runwayOrder.length!==placements.length){ep.runwayOrder=shuffle(placements.map(p=>p.queenId)); saveGame();} return ep.runwayOrder.map(id=>placements.find(p=>p.queenId===id)).filter(Boolean);}

const RUNWAY_ACTIONS = {
  none:{
    label:'Walk Normally',
    shortLabel:'Walk normally',
    description:'Let the garment speak. No extra risk. Small confidence gain.',
    weights:{},
    success:{confidence:1},
    failure:null,
    successText:'You decide not to force a trick tonight. The walk is clean, composed, and focused on the look.',
    story:'clean runway walk'
  },
  reveal:{
    label:'Reveal',
    shortLabel:'Reveal',
    description:'High risk, high reward. A reveal can become the episode image or collapse on stage.',
    weights:{runway:.6,confidence:.4},
    success:{runway:3,production:2,fans:1,confidence:1},
    failure:{runway:-3,production:1,fans:-1,confidence:-1,stress:3},
    successText:'The reveal lands at the perfect beat. The judges sit forward and the garment suddenly has a second life.',
    failureText:'The reveal fights back. You recover, but the panel notices the mechanics before the fantasy.',
    story:'reveal moment'
  },
  cape_reveal:{
    label:'Cape Reveal',
    shortLabel:'Cape Reveal',
    description:'Elegant reveal. Small score increase, but it can malfunction.',
    weights:{runway:.7,confidence:.3},
    success:{runway:2,production:1,fans:1},
    failure:{runway:-2,production:1,confidence:-1,stress:2},
    successText:'The cape opens cleanly and frames the silhouette. It reads graceful, expensive, and intentional.',
    failureText:'The cape catches for a second. You save it, but the hesitation slightly softens the moment.',
    story:'elegant edit'
  },
  wig_reveal:{
    label:'Wig Reveal',
    shortLabel:'Wig Reveal',
    description:'Can greatly impress. Can also appear messy.',
    weights:{runway:.5,lipSync:.3,cunt:.2},
    success:{runway:4,production:3,fans:2,confidence:2},
    failure:{runway:-4,production:2,fans:-1,confidence:-2,stress:4},
    successText:'The wig reveal is clean, dramatic, and timed like a punchline. The judges react immediately.',
    failureText:'The wig reveal gets messy. The idea is visible, but so are the seams.',
    story:'viral wig reveal'
  },
  prop:{
    label:'Prop',
    shortLabel:'Prop',
    description:'Use an accessory. It can elevate the concept or distract from the look.',
    weights:{lipSync:.5,sewing:.3,runway:.2},
    success:{runway:3,production:2,fans:1},
    failure:{runway:-3,production:1,fans:-1,stress:2},
    successText:'The prop completes the story instead of stealing focus. The judges understand the choice.',
    failureText:'The prop pulls attention away from the garment. It gives story, but not all of it is flattering.',
    story:'prop moment'
  },
  audience_interaction:{
    label:'Audience Interaction',
    shortLabel:'Audience Interaction',
    description:'Connect with the judges. High charisma reward, risk of appearing forced.',
    weights:{cunt:.7,confidence:.3},
    success:{runway:2,production:1,fans:3,confidence:1},
    failure:{runway:-2,production:1,fans:-1,confidence:-1,stress:2},
    successText:'You connect with the panel without begging for attention. It feels charismatic and controlled.',
    failureText:'The interaction feels a little forced. The judges smile politely, but the beat does not fully land.',
    story:'charisma edit'
  },
  extra_pose:{
    label:'Extra Pose',
    shortLabel:'Extra Pose',
    description:'A final pose before leaving. Small reward and possible confidence boost.',
    weights:{runway:.8,confidence:.2},
    success:{runway:1,fans:1,confidence:2},
    failure:{runway:-1,confidence:-1,stress:1},
    successText:'The final pose gives the look a clean last image. Small choice, useful impact.',
    failureText:'The extra pose hangs a beat too long. It is not fatal, but the exit loses polish.',
    story:'fashion moment'
  }
};

function runwayActionEmoji(id){
  return {none:'👠',reveal:'🎭',cape_reveal:'🧥',wig_reveal:'💇',prop:'🪭',audience_interaction:'🗣️',extra_pose:'📸'}[id] || '👠';
}


function runwayConsumableActionIds(){
  return Object.keys(RUNWAY_ACTIONS).filter(id=>id !== 'none');
}
function usedRunwayActionList(){
  if(!gameState.season) return [];
  if(!Array.isArray(gameState.season.usedRunwayActions)) gameState.season.usedRunwayActions=[];
  return gameState.season.usedRunwayActions;
}
function isRunwayActionUsed(id){
  return id !== 'none' && usedRunwayActionList().includes(id);
}
function availableRunwayActionIds(){
  return runwayConsumableActionIds().filter(id=>!isRunwayActionUsed(id));
}
function markRunwayActionUsed(id){
  if(id === 'none' || !gameState.season) return;
  const used=usedRunwayActionList();
  if(!used.includes(id)) used.push(id);
}
function shouldSkipRunwayActionChoice(){
  return availableRunwayActionIds().length === 0;
}
function autoSkipRunwayActionChoice(ep){
  if(!ep || ep.runwayActionApplied) return;
  ep.runwayActionApplied=true;
  ep.runwayAction='Walk Normally';
  ep.runwayActionAutoSkipped=true;
  saveGame();
}

function runwayAttribute(q, key){
  if(!q)return 5;
  if(key==='confidence') return clamp(((q.confidence ?? 50)/10),1,10);
  return clamp(q.attributes?.[key] ?? 5,1,10);
}
function runwayActionSkillScore(q, action){
  const weights=action.weights||{};
  const entries=Object.entries(weights);
  if(!entries.length)return 7;
  return entries.reduce((total,[key,weight])=>total + runwayAttribute(q,key)*weight,0);
}
function runwayActionChance(q, action){
  if(!action.failure)return 1;
  const skill=runwayActionSkillScore(q, action);
  // Skill 1 => roughly 34%, skill 10 => roughly 88%.
  return clamp(.28 + (skill/10)*.6, .25, .9);
}
function runwayVisibleEffectText(result){
  if(!result)return '';
  const lines=[];
  if(result.confidenceDelta) lines.push(result.confidenceDelta>0?'You feel more confident.':'Your confidence takes a hit.');
  if(result.stressDelta) lines.push(result.stressDelta>0?'The moment adds pressure.':'You feel calmer.');
  if(result.productionHint) lines.push(result.productionHint);
  return lines.length?`<ul class="runway-visible-effects">${lines.map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ul>`:'';
}
function runwayActionResultBlock(ep){
  if(!ep.runwayActionApplied)return '';
  const result=ep.runwayActionResult;
  const icon=result?.success===false?'💥':runwayActionEmoji(result?.id);
  const outcome=result?.success===false?'Misfire':(result?.id==='none'?'Clean Walk':'Success');
  return `<div class="card runway-action-result ${result?.success===false?'runway-action-fail':'runway-action-success'}">
    <h3>${icon} ${escapeHtml(outcome)}: ${escapeHtml(result?.label||'Runway Action')}</h3>
    <p>${escapeHtml(result?.outcomeText||'Your runway choice has been applied.')}</p>
    ${runwayVisibleEffectText(result)}
  </div>`;
}

function playerRunwayActionBlock(ep){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  if(!player || player.isEliminated || (ep.participantIds && !ep.participantIds.includes(player.id))) return '';
  if(ep.runwayActionApplied) return ep.runwayActionAutoSkipped ? '' : runwayActionResultBlock(ep);
  const availableSpecialActions=availableRunwayActionIds();
  if(!availableSpecialActions.length) return '';
  const actionIds=['none',...availableSpecialActions];
  const buttons=actionIds.map(id=>{
    const o=RUNWAY_ACTIONS[id];
    const chance=runwayActionChance(player,o);
    const risk=o.failure?`<span class="small runway-chance">🎲: ${Math.round(chance*100)}%</span>`:'<span class="small runway-chance">🎲: no risk</span>';
    return `<button class="option runway-choice-option" data-runway-action="${id}"><span class="choice-emoji" aria-hidden="true">${runwayActionEmoji(id)}</span><span class="choice-copy"><strong>${escapeHtml(o.shortLabel||o.label)}</strong><span class="small">${escapeHtml(o.description)}</span>${risk}</span></button>`;
  }).join('');
  return `<div class="card decision-card runway-pre-choice"><h3>How do you approach tonight's runway?</h3><p>Choose before stepping onto the main stage. The judges will only see the result, not the math behind it.</p><div class="options">${buttons}</div></div>`;
}

function applyRunwayAction(actionId){
  const ep=gameState.currentEpisode;
  if(!ep || ep.runwayActionApplied) return;
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  if(isRunwayActionUsed(actionId)) return;
  const action=RUNWAY_ACTIONS[actionId] || RUNWAY_ACTIONS.none;
  const chance=runwayActionChance(player, action);
  const success=!action.failure || Math.random()<chance;
  const effects=success?action.success:action.failure;
  const note=success?action.successText:action.failureText;
  applyChoiceEffects(effects,{note,source:'runway-action'});
  markRunwayActionUsed(actionId);
  ep.runwayActionApplied=true;
  ep.runwayAction=action.label;
  ep.runwayActionResult={
    id:actionId,
    label:action.label,
    success,
    chance:Math.round(chance*100),
    outcomeText:note,
    scoreDelta:effects.runway||0,
    confidenceDelta:effects.confidence||0,
    stressDelta:effects.stress||0,
    productionHint: effects.production ? 'The cameras stay with you for an extra beat.' : '',
    story:action.story||''
  };
  if(!ep.storyFlags)ep.storyFlags=[];
  ep.storyFlags.push({type:success?'runway_moment':'runway_misfire',queenId:gameState.playerQueenId,label:action.label,text:note,hiddenEffects:{production:effects.production||0,fans:effects.fans||0}});
  const risk=ep.playerChallengeRisk || 'safe';
  calculateEpisodeResults({risk});
  saveGame();
  renderRunwayMainStage();
}

function bindRunwayActions(){
  document.querySelectorAll('[data-runway-action]').forEach(btn=>btn.addEventListener('click',()=>applyRunwayAction(btn.dataset.runwayAction)));
}

function runwayCategoryHeader(cat){
  return `<div class="runway-category-title"><span>Tonight's category is...</span><strong>${escapeHtml(cat||'Runway')}</strong></div>`;
}

function runwayMomentMap(placements){
  const eligible=[...placements].filter(p=>typeof runwayTootBootMetric(p)==='number');
  if(!eligible.length)return {};
  const sorted=[...eligible].sort((a,b)=>runwayTootBootMetric(b)-runwayTootBootMetric(a));
  const map={};
  const top=sorted[0];
  const second=sorted[1];
  const low=[...eligible].sort((a,b)=>runwayTootBootMetric(a)-runwayTootBootMetric(b))[0];
  const median=runwayTootBootMetric([...eligible].sort((a,b)=>runwayTootBootMetric(a)-runwayTootBootMetric(b))[Math.floor(eligible.length/2)]||{}) ?? 0;
  if(top && runwayTootBootMetric(top) >= median+6) map[top.queenId]='showstopper';
  if(second && second.queenId!==top?.queenId && runwayTootBootMetric(second) >= median+4) map[second.queenId]='moment';
  if(low && low.queenId!==top?.queenId && runwayTootBootMetric(low) <= median-5) map[low.queenId]='flop';
  return map;
}
function runwayStars(p, placements){
  const values=placements.map(x=>runwayTootBootMetric(x)).sort((a,b)=>a-b);
  const min=values[0] ?? 0;
  const max=values[values.length-1] ?? min+1;
  const normalized=(runwayTootBootMetric(p)-min)/Math.max(1,max-min);
  const stars=clamp(Math.round(normalized*4)+1,1,5);
  return '★'.repeat(stars)+'☆'.repeat(5-stars);
}
function runwayTagForStars(starCount, moment, isTopToot){
  const tags=[];
  if(moment==='flop'){
    tags.push({icon:'💥', label:'SCOOT'});
  }else if(starCount<=1){
    tags.push({icon:'🥾', label:'BOOT'});
  }else if(starCount===2){
    tags.push({icon:'🥾', label:'SOFT BOOT'});
  }else if(starCount===3){
    tags.push({icon:'✨', label:'SOFT TOOT'});
  }else{
    tags.push({icon:'💎', label:'TOOT'});
  }
  if(moment==='showstopper') tags.push({icon:'⭐', label:'SHOOT'});
  if(isTopToot) tags.push({icon:'🏆', label:'TOP TOOT OF THE WEEK'});
  return tags;
}
function runwayStarCount(p, placements){
  const values=placements.map(x=>runwayTootBootMetric(x)).sort((a,b)=>a-b);
  const min=values[0] ?? 0;
  const max=values[values.length-1] ?? min+1;
  const normalized=(runwayTootBootMetric(p)-min)/Math.max(1,max-min);
  return clamp(Math.round(normalized*4)+1,1,5);
}
function runwayTagMarkup(tags){
  return tags.map(t=>`<span class="runway-label">${t.icon} ${escapeHtml(t.label)}</span>`).join('');
}
function runwayWalkCard(p, placements, momentMap, opts={}){
  const moment=momentMap[p.queenId] || 'normal';
  const starCount=runwayStarCount(p,placements);
  const isTopToot=!!opts.allowTopToot && p.queenId===opts.topTootQueenId;
  const tags=runwayTagForStars(starCount,moment,isTopToot);
  const q=gameState.queens.find(x=>x.id===p.queenId);
  return `<article class="runway-look runway-${moment}">
    <div class="runway-tags">${runwayTagMarkup(tags)}</div>
    <div class="runway-look-head">${q?queenPortraitHtml(q,moment==='showstopper'?'lg':'md'):''}<div><h4>${q?queenTeamNameHtml(q):escapeHtml(p.name)}</h4>
    <p>${escapeHtml(runwayTone(p,placements))}</p></div></div>
  </article>`;
}

function runwaySafeDecisionBlock(ep, placements){
  const activeCount=gameState.queens.filter(q=>!q.isEliminated).length;
  const safeQueens=placements.filter(p=>p.placement==='SAFE');
  if(!safeQueens.length)return '';
  const safePortraits=`<div class="safe-portraits">${safeQueens.map(p=>{const q=gameState.queens.find(x=>x.id===p.queenId); return q?queenPortraitHtml(q,'sm'):'';}).join('')}</div>`;
  const safeLine=`${safePortraits}<p>${safeQueens.map(p=>{const q=gameState.queens.find(x=>x.id===p.queenId); return `<strong>${q?queenTeamNameHtml(q):escapeHtml(p.name)}</strong>`;}).join(', ')}</p>`;
  return activeCount > 6 ? `<div class="card"><h3>I have made some decisions.</h3><p>Based on this week’s challenge and your runway presentation.</p><p>When I call your names, please step forward.</p>${safeLine}<p><strong>You are safe.</strong></p><p>You may untuck backstage.</p><p><strong>The rest of you represent the tops and bottoms of the week.</strong></p></div>` : '';
}

function teamJudgingSummary(ep){
  if(!ep?.teams?.length)return '';
  const intro=ep.judgingMode==='team'
    ? 'Ru has decided the queens will be judged as groups this week. Team chemistry matters tonight.'
    : 'Ru has decided the queens will be judged individually this week. Group scores will not save anyone.';
  const teamLines=(ep.teams||[]).map(team=>{
    const names=team.queenIds.map(id=>gameState.queens.find(q=>q.id===id)).filter(Boolean).map(q=>`<strong>${queenTeamNameHtml(q)}</strong>`).join(', ');
    const score=ep.teamScores?.find(t=>t.teamId===team.id);
    const chemistry=score?` <span class="small">Chemistry: ${score.chemistry>0?'strong':score.chemistry<0?'messy':'neutral'}</span>`:'';
    return `<p>${escapeHtml(team.name)}: ${names}${ep.judgingMode==='team'?chemistry:''}</p>`;
  }).join('');
  return `<div class="card"><h3>${escapeHtml(teamJudgingLabel(ep))}</h3><p>${escapeHtml(intro)}</p>${teamLines}</div>`;
}

function ballCategoryPlacements(placements, categoryIndex){
  return placements.map(p=>{
    const categoryScore=Array.isArray(p.ballRunwayScores) && typeof p.ballRunwayScores[categoryIndex]==='number' ? p.ballRunwayScores[categoryIndex] : p.runway;
    return {...p, runway:categoryScore, tootBootScore:categoryScore};
  });
}
function categoryWeightNote(placements, idx, isLast){
  const weights=placements.find(p=>Array.isArray(p.ballRunwayWeights))?.ballRunwayWeights;
  if(!weights || typeof weights[idx]!=='number')return '';
  const pct=Math.round(weights[idx]*100);
  return `<p class="small">${isLast?'Final category':'Category'} weight: ${pct}% of the ball runway package.</p>`;
}
function runwayCategoryCards(ep, placements, runwayOrder){
  const categories=(ep.runwayCategories&&ep.runwayCategories.length)?ep.runwayCategories:[ep.runwayCategory];
  if(ep.challengeType==='ball' && categories.length>1){
    return categories.map((cat,idx)=>{
      const categoryPlacements=ballCategoryPlacements(placements,idx);
      const categoryById=Object.fromEntries(categoryPlacements.map(p=>[p.queenId,p]));
      const categoryOrder=runwayOrder.map(p=>categoryById[p.queenId]).filter(Boolean);
      const momentMap=runwayMomentMap(categoryPlacements);
      const isLast=idx===categories.length-1;
      const topTootQueenId=isLast ? [...categoryPlacements].sort((a,b)=>runwayTootBootMetric(b)-runwayTootBootMetric(a))[0]?.queenId : null;
      const note=isLast?'<p class="small">This final category was constructed in the workroom, so sewing carries more weight.</p>':'<p class="small">This category was brought from home, so styling and presentation carry more weight.</p>';
      const weightNote=categoryWeightNote(placements,idx,isLast);
      const walks=categoryOrder.map(p=>runwayWalkCard(p,categoryPlacements,momentMap,{allowTopToot:isLast,topTootQueenId})).join('');
      return `<div class="card runway-card">${runwayCategoryHeader(cat)}${note}${weightNote}<div class="runway-walk-list">${walks}</div></div>`;
    }).join('');
  }
  const momentMap=runwayMomentMap(placements);
  const topTootQueenId=[...placements].sort((a,b)=>runwayTootBootMetric(b)-runwayTootBootMetric(a))[0]?.queenId;
  const runwayWalk=runwayOrder.map(p=>runwayWalkCard(p,placements,momentMap,{allowTopToot:true,topTootQueenId})).join('');
  return `<div class="card runway-card">${runwayCategoryHeader(ep.runwayCategory)}<div class="runway-walk-list">${runwayWalk}</div></div>`;
}

function canPlayerTakeRunwayAction(ep){
  const player=gameState.queens.find(q=>q.id===gameState.playerQueenId);
  if(!player || player.isEliminated)return false;
  if(ep?.participantIds && !ep.participantIds.includes(player.id))return false;
  return true;
}

function renderRunway(){renderRunwayMainStage();}
function renderRunwayMainStage(){
  const ep=gameState.currentEpisode;
  if(!ep){ renderWorkroom(); return; }
  if(!ep.workroomComplete || !ep.placements?.length){
    ep.workroomSkipped=true;
    ep.passiveWorkroom=true;
    if(!ep.workroomChoice)ep.workroomChoice='Stayed quiet';
    if(!ep.prepChoice)ep.prepChoice='No special preparation';
    if(!ep.challengeApproach)ep.challengeApproach='No clear approach';
    ep.workroomComplete=true;
    if(typeof applyPassiveWorkroomPenalty==='function') applyPassiveWorkroomPenalty();
    ep.playerChallengeRisk='safe';
    calculateEpisodeResults({risk:'safe'});
  }
  const placements=ep.placements;
  const runwayOrder=getRunwayOrder(ep, placements);
  const playerCanAct=canPlayerTakeRunwayAction(ep);
  if(playerCanAct && shouldSkipRunwayActionChoice()) autoSkipRunwayActionChoice(ep);
  const runwayReady=ep.runwayActionApplied || !playerCanAct;
  const runwayCards=runwayReady ? runwayCategoryCards(ep, placements, runwayOrder) : '';
  const initialCategory=runwayReady ? '' : runwayCategoryHeader(ep.runwayCategory);
  const afterRunway=runwayReady ? `${teamJudgingSummary(ep)}${runwaySafeDecisionBlock(ep, placements)}<button id="toCritiques">Continue to Judges’ Critiques</button>` : '';
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero episode-hero">${bigMomentHeader('Welcome to Drag Race','MAIN STAGE','mainstage')}<div class="guest-judge-callout"><span>Guest Judge</span><strong>${escapeHtml(ep.guestJudge?.name||'Guest Judge')}</strong></div><div class="challenge-brief"><span>This week, the queens were challenged to:</span><strong>${escapeHtml(episodeChallengeBrief(ep))}</strong></div></div>
    ${initialCategory}
    ${playerRunwayActionBlock(ep)}
    ${runwayCards}
    ${afterRunway}
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderRunwayMainStage));
  bindRunwayActions();
  const critiqueBtn=document.querySelector('#toCritiques');
  if(critiqueBtn) critiqueBtn.addEventListener('click',renderJudgesCritiques);
}

function passiveJudgeNote(p, placements){
  if(!p) return '';
  const top = p.placement==='WIN' || p.placement==='HIGH';
  const bottom = p.placement==='LOW' || p.placement==='BTM';
  if(top){
    return `${p.name} doesn't over-explain. The work speaks for itself, and somehow that makes the panel look even closer.`;
  }
  if(bottom){
    return `${p.name} lets the critiques land without much fight. It reads composed, but also a little faded into the background.`;
  }
  return `${p.name} keeps it simple and lets the moment pass.`;
}

function critiqueBucket(p){
  if(!p) return 'safe';
  if(p.placement==='WIN') return 'win';
  if(p.placement==='HIGH' || p.placement==='TOP2') return 'high';
  if(p.placement==='LOW') return 'low';
  if(p.placement==='BTM' || p.placement==='LIPSYNC WIN') return 'bottom';
  return 'safe';
}
function runwayBucketForCritique(p, placements){
  const vals=(placements||[]).map(x=>x.runway).filter(x=>typeof x==='number').sort((a,b)=>a-b);
  const median=vals[Math.floor(vals.length/2)] ?? 0;
  if((p.runway||0)>=median+7) return 'showstopper';
  if((p.runway||0)>=median+4) return 'strong';
  if((p.runway||0)<=median-7) return 'flop';
  if((p.runway||0)<=median-4) return 'weak';
  return 'solid';
}
const JUDGE_CRITIQUE_BANK={
  challenge:{
    acting:{win:['You fully became the character.','The timing was sharp and alive.','You gave us a real performance.'],high:['The character had a clear point of view.','You found strong moments in the scene.'],safe:['You stayed present, even when the scene got busy.','You did the job without stealing the scene.'],low:['The character never fully landed.','We kept waiting for a stronger choice.'],bottom:['The scene moved around you instead of with you.','The performance felt unsure from the first beat.']},
    comedy:{win:['Every joke found its target.','You controlled the room with ease.','The punchlines had bite.'],high:['The comedy was clear and confident.','You had the room with you.'],safe:['The jokes were pleasant, but not dangerous.','You kept it cute and survived.'],low:['The rhythm never quite clicked.','The jokes needed a sharper point.'],bottom:['The room got away from you.','Confidence could not cover the material.']},
    roast:{win:['The reads were sharp and controlled.','You roasted without losing charm.','The room was eating from your hand.'],high:['You had strong jokes and good timing.','The shade mostly landed.'],safe:['You got a few laughs and got through it.','The roast was fine, but not fatal.'],low:['The jokes hit sideways.','The timing made the room tense.'],bottom:['The roast turned on you.','The silence after the jokes said plenty.']},
    snatchgame:{win:['The character had bite from the start.','You made Ru laugh and kept building.','The impersonation had a point of view.'],high:['The character was funny and focused.','You found the joke and stayed with it.'],safe:['The character was there, but the jokes were light.','You survived the game without owning it.'],low:['The character ran out of gas.','The answers needed more attack.'],bottom:['The panel waited for the funny.','The impersonation never became a performance.']},
    design:{win:['The construction looks expensive.','Every detail feels considered.','You turned materials into fashion.'],high:['The silhouette is strong.','The idea is clear and polished.'],safe:['The garment is clean enough.','It is wearable, but not unforgettable.'],low:['The proportions need work.','The finish weakens the fantasy.'],bottom:['The garment is wearing you.','It looks more like a draft than a look.']},
    ball:{win:['The categories told a complete story.','Three looks, one clear fashion voice.','You built a full runway package.'],high:['The ball had strong peaks.','You gave range and polish.'],safe:['The package held together, but lightly.','Nothing collapsed, nothing exploded.'],low:['The categories did not build enough impact.','The package felt uneven.'],bottom:['The ball swallowed you.','The final look could not save the set.']},
    makeover:{win:['The family resemblance is unmistakable.','You transformed her without losing yourself.','This feels like a true drag family.'],high:['The resemblance reads clearly.','The makeover has heart and polish.'],safe:['The transformation is sweet, if simple.','The family idea is there.'],low:['The resemblance needs a stronger link.','The styling feels disconnected.'],bottom:['The makeover misses the family fantasy.','The transformation feels unfinished.']},
    girlgroup:{win:['Your verse owned its space.','You stood out without breaking the group.','The stage presence was undeniable.'],high:['You brought energy and focus.','Your part had real star power.'],safe:['You kept up with the group.','You did not miss a beat, but you did not steal one either.'],low:['You faded inside the group.','The choreography looked like a negotiation.'],bottom:['The group moved on without you.','The performance lost confidence fast.']},
    rusical:{win:['You found character, rhythm, and star power.','Every beat felt intentional.','You made the role feel written for you.'],high:['The musicality was strong.','You gave a clear, entertaining character.'],safe:['You hit your marks and stayed in the show.','The number worked, but did not peak with you.'],low:['You got caught between acting and choreography.','The role needed more precision.'],bottom:['The number exposed every hesitation.','The performance never found the music.']},
    branding:{win:['The brand is clear, funny, and sellable.','You gave us a product and a personality.','The pitch had a real hook.'],high:['The concept is strong.','You made the brand easy to understand.'],safe:['The brand is fine, but not viral.','The idea is there, just quiet.'],low:['The product feels hard to sell.','The brand needs a sharper point.'],bottom:['The concept collapses under the pitch.','We still do not know what you are selling.']},
    interview:{win:['You listened and led the conversation.','The interview felt effortless.','You made the guest feel seen.'],high:['You had charm and control.','The conversation moved smoothly.'],safe:['You kept the interview alive.','It was polite and functional.'],low:['The conversation needed more spark.','You lost the thread a few times.'],bottom:['The interview became awkward fast.','The guest did more work than you.']},
    talent:{win:['The talent told us exactly who you are.','You owned the stage immediately.','That felt worthy of a premiere.'],high:['The performance had a clear identity.','You made a strong first impression.'],safe:['The talent was present, but not explosive.','You showed ability without a major gag.'],low:['The act never built enough momentum.','The ending needed a bigger button.'],bottom:['The talent did not translate to the stage.','The performance left us guessing.']},
    default:{win:['You turned the assignment into a moment.','You looked like the queen to beat.'],high:['This was a strong week for you.','You made smart choices.'],safe:['You did enough to stay in the race.','It was clean, but quiet.'],low:['We needed more focus from you.','The idea never fully landed.'],bottom:['Tonight was a real stumble.','The challenge exposed the cracks.']}
  },
  runway:{
    showstopper:['And this runway? A full gag.','The runway is doing victory laps.','This look belongs in the highlight reel.'],
    strong:['The runway supports the story beautifully.','The look is polished and memorable.','On the runway, you look expensive.'],
    solid:['The runway is solid, even if not shocking.','The look is clean and safe.','The category is there, just softly.'],
    weak:['The runway needed one more edit.','The styling is holding you back.','The look is not helping the case.'],
    flop:['The runway lets you down.','The look simply is not working.','The category deserved more than this.']
  },
  close:{win:['Excellent work this week.','This is the level we want from you.','You raised the bar.'],high:['Very strong work.','You are moving in the right direction.','Keep pushing like this.'],safe:['You are safe, but do not disappear.','We are waiting for the next level.','Do not get comfortable.'],low:['We need more from you.','This was not your strongest week.','You need to fight harder.'],bottom:['Tonight was disappointing.','You have a lot to prove.','This competition is getting harder.']}
};
function challengeCritiqueId(ep){
  if(!ep)return 'default';
  const id=ep.challengeType||'';
  if(JUDGE_CRITIQUE_BANK.challenge[id])return id;
  if(id==='improv')return 'comedy';
  return 'default';
}
const GUEST_WILDCARD_LINES={
  positive:['I just had such a good time watching you.','There is something really lovable about what you did.','I know it was not perfect, but I was charmed.','You made me smile, and that counts for a lot.'],
  mixed:['I wanted one more little surprise from you.','I can see the idea, I just wanted it pushed further.','There is something there, but it needs more sparkle.','I liked pieces of it more than the whole thing.'],
  negative:['Even when it got shaky, I could still see your heart.','I do not think this showed everything you can do.','I was rooting for it, but it never fully arrived.','I wanted the confidence to match the idea.']
};
function guestJudgeCritiqueLine(p,bucket){
  const ext=gameState.data?.narrativeExpansion?.judgeComments?.guest || gameState.data?.narrativeText?.judgeComments?.guest;
  const lines=ext || GUEST_WILDCARD_LINES;
  const roll=Math.random();
  if(bucket==='win'||bucket==='high') return sample(lines.positive || GUEST_WILDCARD_LINES.positive);
  if(bucket==='safe') return sample(roll<.45?(lines.positive||GUEST_WILDCARD_LINES.positive):(lines.mixed||GUEST_WILDCARD_LINES.mixed));
  if(bucket==='low') return sample(roll<.35?(lines.positive||GUEST_WILDCARD_LINES.positive):(lines.mixed||GUEST_WILDCARD_LINES.mixed));
  return sample(roll<.22?(lines.positive||GUEST_WILDCARD_LINES.positive):(lines.negative||GUEST_WILDCARD_LINES.negative));
}
function isFinalStretchPraiseEpisodeForCritiques(ep){
  if(!ep || ep.special)return false;
  const finaleSize=gameState.season?.finaleSize || 4;
  const activeCount=ep.activeCount || gameState.queens.filter(q=>!q.isEliminated).length;
  return activeCount===finaleSize+1;
}
function finalStretchCritiqueBucket(p){
  if(p.placement==='WIN')return 'win';
  if(p.placement==='HIGH' || p.placement==='LOW' || p.placement==='BTM')return 'high';
  return 'safe';
}
function composedJudgeCritique(p, placements, ep){
  const finalStretchPraise=isFinalStretchPraiseEpisodeForCritiques(ep);
  const bucket=finalStretchPraise?finalStretchCritiqueBucket(p):critiqueBucket(p);
  const challengeId=challengeCritiqueId(ep);
  const q=gameState.queens.find(x=>x.id===p.queenId);
  if(typeof recalcNarrativeTags==='function') recalcNarrativeTags();
  const externalJudge=gameState.data?.narrativeExpansion?.judgeComments || gameState.data?.narrativeText?.judgeComments || {};
  const challengeLine=sample(JUDGE_CRITIQUE_BANK.challenge[challengeId]?.[bucket]||JUDGE_CRITIQUE_BANK.challenge.default[bucket]);
  const runwayLine=sample(JUDGE_CRITIQUE_BANK.runway[runwayBucketForCritique(p,placements)]||JUDGE_CRITIQUE_BANK.runway.solid);
  const guestName=ep.guestJudge?.name||'Guest Judge';
  const guestLine=guestJudgeCritiqueLine(p,bucket);
  const ruPlacement=finalStretchPraise && (p.placement==='LOW' || p.placement==='BTM') ? 'HIGH' : p.placement;
  const ruLine=typeof ruNarrativeComment==='function' ? ruNarrativeComment(q,ruPlacement) : sample(JUDGE_CRITIQUE_BANK.close[bucket]||JUDGE_CRITIQUE_BANK.close.safe);
  const rotatingJudge=(ep.number||0)%2===0?'Ross':'Carson';
  const middleLine=rotatingJudge==='Ross' ? sample(JUDGE_CRITIQUE_BANK.close[bucket]||JUDGE_CRITIQUE_BANK.close.safe) : runwayLine;
  return [
    `<div class="judge-line judge-michelle"><span>Michelle</span><p>${escapeHtml(Math.random()<0.35 ? sample((externalJudge.michelle||{})[bucket==='win'||bucket==='high'?'positive':bucket==='safe'?'safe':'negative']||[challengeLine]) : challengeLine)}</p></div>`,
    `<div class="judge-line judge-rotating"><span>${rotatingJudge}</span><p>${escapeHtml(Math.random()<0.25 ? sample((externalJudge[rotatingJudge.toLowerCase()]||{})[bucket==='win'||bucket==='high'?'positive':bucket==='safe'?'safe':'negative']||[middleLine]) : middleLine)}</p></div>`,
    `<div class="judge-line judge-guest"><span>${escapeHtml(guestName)}</span><p>${escapeHtml(guestLine)}</p></div>`,
    `<div class="judge-line judge-ru"><span>RuPaul</span><p>${escapeHtml(ruLine)}</p></div>`
  ].join('');
}

function renderJudgesCritiques(){
  const ep=gameState.currentEpisode;
  const placements=ep.placements;
  const playerInBottom=ep.bottomQueens.includes(gameState.playerQueenId);
  const lowQueens=placements.filter(p=>p.placement==='LOW');
  const winners=placements.filter(p=>p.placement==='WIN');
  const highs=placements.filter(p=>p.placement==='HIGH');
  const bottomSorted=placements.filter(p=>p.placement==='BTM').sort((a,b)=>a.score-b.score);
  const worst=bottomSorted[0];
  const secondWorst=bottomSorted[1];
  const critiqueQueens=placements.filter(p=>p.placement!=='SAFE').sort((a,b)=>a.name.localeCompare(b.name));
  const critiques=critiqueQueens.map(p=>{
    const snatch=ep.snatchCharacters?.find(c=>c.queenId===p.queenId);
    const snatchLine=snatch?`<p class="small">as <strong>${escapeHtml(snatch.character)}</strong></p>`:'';
    const q=gameState.queens.find(x=>x.id===p.queenId);
    return `<article class="critique critique-${critiqueBucket(p)}"><div class="critique-head">${q?queenPortraitHtml(q,'md'):''}<div><h4>${escapeHtml(p.name)}</h4>${snatchLine}</div></div><div class="judge-critique-grid">${composedJudgeCritique(p, placements, ep)}</div></article>`;
  }).join('');
  const playerPlacement=placements.find(p=>p.queenId===gameState.playerQueenId);
  const playerGetsCritique=playerPlacement && playerPlacement.placement!=='SAFE';
  const judgeResponseBlock=(playerGetsCritique && !ep.judgeResponseApplied && !ep.judgeResponseSkipped) ? `<div class="card important decision-card"><h3>Your response to the judges</h3><p>The critique is landing. You can respond, or simply continue without saying anything.</p><div class="options">${Object.entries(JUDGE_RESPONSES).map(([id,o])=>choiceButtonHtml({id,attr:'data-judge',label:o.label,desc:o.description})).join('')}</div></div>` : (ep.judgeResponseApplied?`<div class="card subtle"><h3>Your response</h3><p>${escapeHtml((ep.playerEffects?.notes||[]).slice(-1)[0]||'You answered the judges.')}</p></div>`:(ep.judgeResponseSkipped&&playerGetsCritique?`<div class="card subtle"><h3>Your response</h3><p>${escapeHtml(passiveJudgeNote(playerPlacement, placements))}</p></div>`:''));
  const topAnnouncements=[];
  const bottomAnnouncements=[];
  highs.slice().reverse().forEach(h=>topAnnouncements.push(`<p>${queenPortraitHtml(gameState.queens.find(q=>q.id===h.queenId),'xs')} <strong>${escapeHtml(h.name)}</strong>, you are safe.</p>`));
  if(winners.length===1){
    topAnnouncements.push(`<p>${queenPortraitHtml(gameState.queens.find(q=>q.id===winners[0].queenId),'xs')} <strong>Condragulations, ${escapeHtml(winners[0].name)}. You are the winner of this week’s challenge.</strong></p>`);
  }else if(winners.length>1){
    topAnnouncements.push(`<p><strong>Condragulations, ${winners.map(w=>escapeHtml(w.name)).join(' and ')}. You are the winners of this week’s challenge.</strong></p>`);
  }
  bottomSorted.forEach((b,idx)=>{
    const line = idx===0
      ? `I’m sorry, but you are up for elimination.`
      : `I’m sorry, my dear, but you are also up for elimination.`;
    bottomAnnouncements.push(`<p>${queenPortraitHtml(gameState.queens.find(q=>q.id===b.queenId),'xs')} <strong>${escapeHtml(b.name)}</strong>, ${line}</p>`);
  });
  lowQueens.forEach(l=>bottomAnnouncements.push(`<p>${queenPortraitHtml(gameState.queens.find(q=>q.id===l.queenId),'xs')} <strong>${escapeHtml(l.name)}</strong>, you are safe.</p>`));
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero"><span class="badge">Judges</span><h2>Judges’ Critiques</h2><p>The safe queens are backstage. The tops and bottoms remain on the main stage.</p></div>
    <div class="card"><h3>Critiques</h3><div class="critique-list">${critiques}</div></div>
    ${judgeResponseBlock}
    <div class="card"><h3>Decisions</h3>${topAnnouncements.join('')}<hr class="decision-divider">${bottomAnnouncements.join('')}</div>
    <button id="continue">${playerInBottom?'Go to the Lip Sync':'Watch the Lip Sync'}</button>
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderJudgesCritiques));
  document.querySelectorAll('[data-judge]').forEach(btn=>btn.addEventListener('click',()=>{
    window.__preserveScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    applyJudgeResponse(btn.dataset.judge);
    renderJudgesCritiques();
  }));
  document.querySelector('#continue').addEventListener('click',()=>{if(playerGetsCritique && !ep.judgeResponseApplied && !ep.judgeResponseSkipped){ep.judgeResponseSkipped=true; if(typeof applySkippedJudgeResponsePenalty==='function') applySkippedJudgeResponsePenalty(); saveGame();} renderLipSync();});
}
