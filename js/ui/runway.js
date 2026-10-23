function runwayTootBootMetric(p){
  return typeof p.tootBootScore==='number' ? p.tootBootScore : p.runway;
}
function runwayTone(p, placements, rating){
  // v31.6: the description follows the rating shown next to it (TOOT never gets a forgettable line),
  // is chosen once per episode and avoids lines already used this season.
  const ep=gameState.currentEpisode||{};
  ep.runwayToneCache=ep.runwayToneCache||{};
  const key=p.queenId+':'+(rating||'')+':'+(Number.isFinite(p.ballCategoryIndex)?p.ballCategoryIndex:'');
  if(ep.runwayToneCache[key])return ep.runwayToneCache[key];
  const bank=gameState.data?.narrativeExpansion?.runwayDescriptions || gameState.data?.narrativeText?.runwayDescriptions || {};
  const fallback={
    good:['sold the fantasy and charged full price.','served the category with nerve and polish.','walked like the runway owed her money.','understood the assignment and signed it in rhinestones.','looked expensive, dangerous, and very pleased about it.','gave the judges something to point at.','turned the runway into her personal meet-and-greet.','made the silhouette do the reading.'],
    mid:['was cute, but the replay may forget her number.','did enough, not a crime and not a crown.','kept it clean, but not exactly legendary.','gave safe with a fresh coat of lip gloss.','was pleasant. The shade is that pleasant is not memorable.','crossed the runway without causing a lawsuit.','had moments, but no gag.','served a polite little fantasy.'],
    bad:['missed the category and the exit sign.','looked like the concept filed for divorce.','had presence, but the outfit was asking for help.','gave an idea, but not a finished sentence.','let the runway swallow her whole.','looked less main stage, more last-minute packing.','served confusion with a side of fabric.','left the judges wanting a stronger edit.']
  };
  const r=String(rating||'').toUpperCase();
  let pool;
  if(r==='SHOOT')pool=bank.legendary||fallback.good;
  else if(r==='TOOT')pool=[...(bank.great||[]),...(bank.legendary||[])];
  else if(r==='SOFT TOOT')pool=bank.solid||bank.great||fallback.good;
  else if(r==='SOFT BOOT')pool=[...(bank.safe||[]),...(bank.mixed||[])];
  else if(r==='BOOT')pool=[...(bank.weak||[]),...(bank.mixed||[])];
  else if(r==='SCOOT')pool=bank.flop||fallback.bad;
  if(!pool||!pool.length)pool=r.includes('TOOT')?fallback.good:r.includes('BOOT')?fallback.bad:fallback.mid;
  const line=(typeof seasonFreshPick==='function'?seasonFreshPick:sample)(pool);
  ep.runwayToneCache[key]=line;
  return line;
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
  const failed=result?.success===false;
  const clean=!failed && (!result || result.id==='none');
  const state=failed?'no':clean?'clean':'ok';
  const stamp=failed?'Fail':clean?'Clean walk':'Success!';
  return `<div class="card tv-walk-result tv-walk-${state}">
    <div class="tv-walk-copy"><span class="eyebrow">Your runway move</span><h3>${escapeHtml(result?.label||'Runway Action')}</h3>
    <p>${escapeHtml(result?.outcomeText||'Your runway choice has been applied.')}</p>
    ${runwayVisibleEffectText(result)}</div>
    <span class="tv-stamp tv-stamp-${state}" role="img" aria-label="${escapeHtml(stamp)}">${escapeHtml(stamp)}</span>
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
    // v31.6: risk as a tag (same family as the lip sync chips) instead of the raw chance
    const pc=Math.round(chance*100);
    const rk=!o.failure?['No risk','up']:pc>=80?['Very low risk','up']:pc>=60?['Low risk','flat']:pc>=40?['Medium risk','flat']:pc>=20?['High risk','down']:['Very high risk','down'];
    const risk=`<span class="tv-lschips"><span class="tv-lschip tv-lschip-${rk[1]}" title="${o.failure?pc+'% chance it lands':'Nothing can go wrong'}">${rk[0]}</span></span>`;
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
  return `<div class="tv-category"><span>Tonight's category is…</span><strong>${escapeHtml(cat||'Runway')}</strong></div>`;
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
  const stars=runwayStarCount(p,placements);
  return '★'.repeat(stars)+'☆'.repeat(5-stars);
}
function runwayTagForStars(starCount, moment, isTopToot){
  const tags=[];
  if(moment==='flop'){
    tags.push({icon:'💥', label:'SCOOT', tone:'scoot'});
  }else if(starCount<=1){
    tags.push({icon:'🥾', label:'BOOT', tone:'boot'});
  }else if(starCount===2){
    tags.push({icon:'🥾', label:'SOFT BOOT', tone:'softboot'});
  }else if(starCount===3){
    tags.push({icon:'✨', label:'SOFT TOOT', tone:'softtoot'});
  }else{
    tags.push({icon:'💎', label:'TOOT', tone:'toot'});
  }
  if(moment==='showstopper') tags.push({icon:'⭐', label:'SHOOT', tone:'shoot'});
  if(isTopToot) tags.push({icon:'🏆', label:'TOP TOOT OF THE WEEK', tone:'top'});
  return tags;
}
function runwayStarCount(p, placements){
  // v31.6: the rating comes from the queen's place in this episode's runway, not from the spread of scores:
  // top 12.5% ★5, to 25% ★4 (TOOT) · to 50% ★3 (SOFT TOOT) · to 80% ★2 (SOFT BOOT) · rest ★1 (BOOT)
  const sorted=[...placements].sort((a,b)=>runwayTootBootMetric(b)-runwayTootBootMetric(a));
  const n=sorted.length;
  if(n<2)return 3;
  const idx=sorted.findIndex(x=>x.queenId===p.queenId);
  const pos=(idx<0?Math.floor(n/2):idx)/(n-1);
  if(pos<=0.125)return 5;
  if(pos<=0.25)return 4;
  if(pos<=0.5)return 3;
  if(pos<=0.8)return 2;
  return 1;
}
function runwayTagMarkup(tags){
  return tags.map(t=>`<span class="tv-chip tv-chip-${t.tone||'plain'}">${typeof emojiIcon==='function'?emojiIcon(t.icon):''}${escapeHtml(t.label)}</span>`).join('');
}
function playerRunwayEventMarkup(p, opts={}){
  if(opts.suppressRunwayEvent)return '';
  if(!p || p.queenId!==gameState.playerQueenId)return '';
  const event=p.runwayEvent || gameState.currentEpisode?.runwayEvents?.[p.queenId];
  if(!event?.text)return '';
  return `<p class="runway-player-event">${escapeHtml(event.text)}</p>`;
}
function judgingEventMarkup(p){
  const event=p?.judgingEvent || gameState.currentEpisode?.judgingEvents?.[p?.queenId];
  if(!event?.text)return '';
  // the rotating panel seat is Ross on even episodes and Carson on odd ones: keep the moment on the right judge
  const seat=((gameState.currentEpisode?.number||0)%2===0)?'Ross':'Carson';
  const text=String(event.text).replace(/\b(Ross|Carson)\b/g,seat);
  return `<div class="judging-event-extra"><strong>Judging moment</strong><p>${escapeHtml(text)}</p></div>`;
}
function runwayWalkCard(p, placements, momentMap, opts={}){
  const moment=momentMap[p.queenId] || 'normal';
  const starCount=runwayStarCount(p,placements);
  const isTopToot=!!opts.allowTopToot && p.queenId===opts.topTootQueenId;
  const tags=runwayTagForStars(starCount,moment,isTopToot);
  const rating=moment==='showstopper'?'SHOOT':(tags[0]?.label||'');
  const q=gameState.queens.find(x=>x.id===p.queenId);
  const me=p.queenId===gameState.playerQueenId;
  const name=opts.grouped?escapeHtml(q?.name||p.name):(q?queenTeamNameHtml(q):escapeHtml(p.name));
  return `<article class="tv-walk tv-walk-${moment}${isTopToot?' tv-walk-top':''}${me?' tv-walk-me':''}">
    ${q?queenPortraitHtml(q,'md'):''}
    <div class="tv-walk-text"><h4>${name}</h4><p>${escapeHtml(runwayTone({...p,ballCategoryIndex:opts.categoryIndex},placements,rating))}</p>${playerRunwayEventMarkup(p, opts)}</div>
    <div class="tv-walk-tags">${runwayTagMarkup(tags)}</div>
  </article>`;
}

function runwaySafeDecisionBlock(ep, placements){
  if(ep?.special==='tournament_bracket')return '';
  const isAllWinners=getSeasonFormat && getSeasonFormat()==='all_winners';
  const activeCount=gameState.queens.filter(q=>!q.isEliminated).length;
  const safeQueens=placements.filter(p=>p.placement==='SAFE');
  if(!safeQueens.length)return '';
  const chips=safeQueens.map(p=>{const q=gameState.queens.find(x=>x.id===p.queenId);return `<span class="tv-safe-chip">${q?queenPortraitHtml(q,'xs'):''}<strong>${escapeHtml(q?.name||p.name)}</strong></span>`;}).join('');
  const critiqueLine=isAllWinners?'The rest of you represent the tops of the week.':'The rest of you represent the tops and bottoms of the week.';
  return activeCount > 6 ? `<div class="card tv-ru-speech"><span class="tv-speaker">RuPaul</span><p>I have made some decisions. Based on this week's challenge and your runway presentation… when I call your names, please step forward.</p><div class="tv-safe-chips">${chips}</div><p><strong>You are safe.</strong> You may untuck backstage.</p><p class="tv-ru-close">${critiqueLine}</p></div>` : '';
}

function teamJudgingSummary(ep){
  if(!ep?.teams?.length)return '';
  const intro=ep.judgingMode==='team'
    ? 'Ru has decided the queens will be judged as groups this week. Team chemistry matters tonight.'
    : 'Ru has decided the queens will be judged individually this week. Group scores will not save anyone.';
  return `<p class="tv-judging-mode"><span class="badge">${escapeHtml(teamJudgingLabel(ep))}</span> ${escapeHtml(intro)}</p>`;
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

function fashionWarsBattleCards(ep, placements){
  const battles=ep?.challengeContent?.battles||[];
  if(!battles.length)return '';
  const byId=Object.fromEntries(placements.map(p=>[p.queenId,p]));
  const teamName=(id)=>{const team=(ep.teams||[]).find(t=>(t.queenIds||[]).includes(id)); return team?.name||'';};
  const isDuelMode=(ep.activeCount||0)===8;
  const points=isDuelMode?'':(ep.fashionWarsPoints||[]).map(t=>`<p><strong>${escapeHtml(t.name)}</strong>: ${t.points} point${t.points===1?'':'s'}</p>`).join('');
  const cards=battles.map((battle,idx)=>{
    const rows=(battle.queenIds||[]).map(id=>{
      const p=byId[id];
      const q=gameState.queens.find(x=>x.id===id);
      const won=id===battle.winnerId;
      return `<div class="runway-look ${won?'runway-showstopper':''}">
        <div class="runway-look-head">${q?queenPortraitHtml(q,won?'lg':'md'):''}<div><h4>${q?queenTeamNameHtml(q):escapeHtml(p?.name||'Queen')}</h4><p class="small">${escapeHtml(teamName(id))}</p>${won?`<p><strong>${isDuelMode?'Wins this duel.':'Wins this fashion battle.'}</strong></p>`:`<p>${isDuelMode?'Loses this duel.':'Falls short in this battle.'}</p>`}</div></div>
      </div>`;
    }).join('');
    return `<div class="card runway-card fashion-war-battle">
      ${runwayCategoryHeader(battle.title||`Fashion Battle ${idx+1}`)}
      <p>${escapeHtml(battle.prompt||'Create a winning design look.')}</p>
      <div class="runway-walk-list">${rows}</div>
      ${battle.winnerId?`<div class="card subtle"><h3>${isDuelMode?'Duel winner':'Battle winner'}</h3><p><strong>${escapeHtml(qName(battle.winnerId))}</strong>${isDuelMode?' wins this independent duel.':` scores a point for ${escapeHtml(teamName(battle.winnerId)||'her team')}.`}</p></div>`:''}
    </div>`;
  }).join('');
  return `${cards}${points?`<div class="card"><h3>Fashion Wars score</h3>${points}</div>`:''}`;
}


function publicChallengeResultsCard(ep, placements){
  const byId=Object.fromEntries((placements||[]).map(p=>[p.queenId,p]));
  const title=ep.challengeContent?.challengeTitle || ep.challengeName || 'Public Challenge';
  const subtitle=ep.challengeContent?.challengePrompt || ep.themeNotes || '';
  const totals=(ep.teamTotals&&ep.teamTotals.length)?ep.teamTotals:(ep.teams||[]).map(team=>({teamId:team.id,name:team.name,queenIds:team.queenIds,total:(team.queenIds||[]).reduce((sum,id)=>sum+(Number(ep.publicResults?.[id])||0),0)})).sort((a,b)=>b.total-a.total);
  const winningTeamId=ep.winningTeam || totals[0]?.teamId;
  const teamBlocks=totals.map(team=>{
    const isWinner=team.teamId===winningTeamId;
    const rows=(team.queenIds||[]).map(id=>byId[id]).filter(Boolean).sort((a,b)=>(Number(ep.publicResults?.[b.queenId])||0)-(Number(ep.publicResults?.[a.queenId])||0)).map(p=>`
      <tr><td>${escapeHtml(p.name)}</td><td style="text-align:right;"><strong>${Number(ep.publicResults?.[p.queenId])||0}</strong></td></tr>
    `).join('');
    return `<div class="card ${isWinner?'winner-card':''}">
      <h3>${isWinner?'🏆 ':''}${escapeHtml(team.name||'Team')}</h3>
      <table class="score-table"><tbody>${rows}<tr><td><strong>TOTAL</strong></td><td style="text-align:right;"><strong>${Number(team.total)||0}</strong></td></tr></tbody></table>
    </div>`;
  }).join('');
  const winnerName=totals.find(t=>t.teamId===winningTeamId)?.name || 'The winning team';
  return `<div class="card runway-card public-challenge-results">
    <h2>${escapeHtml(title)}</h2>
    ${subtitle?`<p>${escapeHtml(subtitle)}</p>`:''}
    <div class="grid two">${teamBlocks}</div>
    <p class="small"><strong>${escapeHtml(winnerName)} wins the challenge!</strong></p>
  </div>`;
}

// v31.5 round 2: in pair and group challenges the walk is shown team by team
function tvTeamGroups(ep, items, idOf=x=>x.queenId){
  if(!ep?.teams?.length)return null;
  const groups=ep.teams.map((team,index)=>({team,index,items:items.filter(x=>(team.queenIds||[]).includes(idOf(x)))})).filter(g=>g.items.length);
  const rest=items.filter(x=>!ep.teams.some(t=>(t.queenIds||[]).includes(idOf(x))));
  if(rest.length)groups.push({team:{name:'Solo'},index:-1,items:rest});
  return groups.length>1||rest.length?groups:(groups.length?groups:null);
}
function tvTeamHead(ep, g){
  const score=ep.teamScores?.find(t=>t.teamId===g.team.id);
  const chem=ep.judgingMode==='team'&&score?`<span class="tv-team-chem">Chemistry: ${score.chemistry>0?'strong':score.chemistry<0?'messy':'neutral'}</span>`:'';
  const mark=g.index>=0&&typeof teamIcon==='function'?`<span class="tv-team-mark team-seal-${g.index%8}">${teamIcon(g.index)}</span>`:'';
  return `<div class="tv-team-head">${mark}<strong>${escapeHtml(g.team.name||'Team')}</strong>${chem}</div>`;
}
function tvGroupedList(ep, items, render, cls){
  const groups=tvTeamGroups(ep, items);
  if(!groups)return `<div class="${cls}">${items.map(x=>render(x,false)).join('')}</div>`;
  return groups.map(g=>`<section class="tv-team-group team-group-${g.index}">${tvTeamHead(ep,g)}<div class="${cls}">${g.items.map(x=>render(x,true)).join('')}</div></section>`).join('');
}
function runwayCategoryCards(ep, placements, runwayOrder){
  if(ep.challengeType==='public')return publicChallengeResultsCard(ep, placements);
  if(ep.challengeType==='fashion_wars')return fashionWarsBattleCards(ep, placements);
  const categories=(ep.runwayCategories&&ep.runwayCategories.length)?ep.runwayCategories:[ep.runwayCategory];
  if(ep.challengeType==='ball' && categories.length>1){
    return categories.map((cat,idx)=>{
      const categoryPlacements=ballCategoryPlacements(placements,idx);
      const categoryById=Object.fromEntries(categoryPlacements.map(p=>[p.queenId,p]));
      const categoryOrder=runwayOrder.map(p=>categoryById[p.queenId]).filter(Boolean);
      const momentMap=runwayMomentMap(categoryPlacements);
      const isLast=idx===categories.length-1;
      const topTootQueenId=isLast ? [...categoryPlacements].sort((a,b)=>runwayTootBootMetric(b)-runwayTootBootMetric(a))[0]?.queenId : null;
      const note=isLast?'This final category was constructed in the workroom, so sewing carries more weight.':'This category was brought from home, so styling and presentation carry more weight.';
      const weightNote=categoryWeightNote(placements,idx,isLast);
      const walks=tvGroupedList(ep,categoryOrder,(p,grouped)=>runwayWalkCard(p,categoryPlacements,momentMap,{allowTopToot:isLast,topTootQueenId,suppressRunwayEvent:!isLast,grouped,categoryIndex:idx}),'tv-walk-list');
      return `<div class="tv-runway-cat">${runwayCategoryHeader(cat)}<p class="small tv-cat-note">${escapeHtml(note)}</p>${weightNote}${walks}</div>`;
    }).join('');
  }
  const momentMap=runwayMomentMap(placements);
  const topTootQueenId=[...placements].sort((a,b)=>runwayTootBootMetric(b)-runwayTootBootMetric(a))[0]?.queenId;
  const walks=tvGroupedList(ep,runwayOrder,(p,grouped)=>runwayWalkCard(p,placements,momentMap,{allowTopToot:true,topTootQueenId,grouped}),'tv-walk-list');
  return `<div class="tv-runway-cat">${runwayCategoryHeader(ep.runwayCategory)}${walks}</div>`;
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
  const tvBlock=(id,title,inner)=>inner?`<section class="tv-block" data-block="${id}"><h3 class="tv-bt">${title}</h3><div class="tv-bc">${inner}</div></section>`:'';
  const special=['public','fashion_wars'].includes(ep.challengeType);
  const runwayCards=runwayReady ? runwayCategoryCards(ep, placements, runwayOrder) : '';
  const initialCategory=runwayReady ? '' : runwayCategoryHeader(ep.runwayCategory);
  const move=playerRunwayActionBlock(ep);
  const decisions=runwayReady?runwaySafeDecisionBlock(ep, placements):'';
  const activeCount=(gameState.queens||[]).filter(q=>!q.isEliminated).length;
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero tv-ep-title">
      <span class="eyebrow">Episode ${escapeHtml(String(ep.number||''))} · ${escapeHtml(ep.challengeName||'')} · Welcome to Drag Race</span>
      <h2>Main Stage</h2>
    </div>
    ${(()=>{const f=typeof effectFeedHtml==='function'?effectFeedHtml('workroom'):'';return f&&!runwayReady?tvBlock('week','Your week',`<div class="tv-feed">${f}</div>`):'';})()}
    ${tvBlock('brief','Brief',`<div class="tv-brief-row"><div class="guest-judge-callout"><span>Guest Judge</span><strong>${escapeHtml(ep.guestJudge?.name||'Guest Judge')}</strong></div><div class="challenge-brief"><span>This week, the queens were challenged to</span><strong>${escapeHtml(episodeChallengeBrief(ep))}</strong></div></div>${initialCategory}`)}
    ${tvBlock('move','Your move',move)}
    ${tvBlock('runway',special?'Results':'Runway',runwayReady?`${special?'':teamJudgingSummary(ep)}${runwayCards}`:'')}
    ${tvBlock('decisions','Decisions',decisions)}
    ${runwayReady?`<div class="tv-nav"><button id="toCritiques" class="tv-next">Continue to Judges' Critiques</button></div>`:''}
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
    acting:{win:['You fully became the character.','The timing was sharp and alive.','You gave us a real performance.'],high:['The character had a clear point of view.','You found strong moments in the scene.','You made bold choices and stuck to them.','You were a joy to watch in that scene.'],safe:['You stayed present, even when the scene got busy.','You did the job without stealing the scene.','You said your lines and hit your marks.','You were fine, but nobody will quote you.'],low:['The character never fully landed.','We kept waiting for a stronger choice.','You played it too big for the scene.','The character stayed on the page.'],bottom:['The scene moved around you instead of with you.','The performance felt unsure from the first beat.','You were acting at the scene, not in it.','We never believed a single line.']},
    comedy:{win:['Every joke found its target.','You controlled the room with ease.','The punchlines had bite.'],high:['The comedy was clear and confident.','You had the room with you.','You found the funny and kept digging.','Your timing saved more than one joke.'],safe:['The jokes were pleasant, but not dangerous.','You kept it cute and survived.','Chuckles, not belly laughs.','You were funny-ish. That is not a compliment.'],low:['The rhythm never quite clicked.','The jokes needed a sharper point.','The jokes needed another rewrite.','You laughed harder than the audience did.'],bottom:['The room got away from you.','Confidence could not cover the material.','The silence after that punchline was deafening.','The room was not laughing with you.']},
    roast:{win:['The reads were sharp and controlled.','You roasted without losing charm.','The room was eating from your hand.'],high:['You had strong jokes and good timing.','The shade mostly landed.','Your reads had teeth and a smile.','You found the target and hit it twice.'],safe:['You got a few laughs and got through it.','The roast was fine, but not fatal.','You roasted, but you did not burn anyone.','A few good zingers, a few duds.'],low:['The jokes hit sideways.','The timing made the room tense.','The jokes were mean without being funny.','You read the room wrong, my dear.'],bottom:['The roast turned on you.','The silence after the jokes said plenty.','That set roasted you instead.','The shade never found its target.']},
    snatchgame:{win:['The character had bite from the start.','You made Ru laugh and kept building.','The impersonation had a point of view.'],high:['The character was funny and focused.','You found the joke and stayed with it.','The character was specific and silly.','You kept Ru laughing between answers.'],safe:['The character was there, but the jokes were light.','You survived the game without owning it.','The impression was there, the jokes were not.','You stayed in character, quietly.'],low:['The character ran out of gas.','The answers needed more attack.','We needed more jokes, less impersonation.','The character never found her punchline.'],bottom:['The panel waited for the funny.','The impersonation never became a performance.','Who was that? Honestly, who was that?','Snatch Game is not the place to freeze.']},
    design:{win:['The construction looks expensive.','Every detail feels considered.','You turned materials into fashion.'],high:['The silhouette is strong.','The idea is clear and polished.','The construction is clean and confident.','You made smart choices with your materials.'],safe:['The garment is clean enough.','It is wearable, but not unforgettable.','It is a garment. It is finished. That is all.','Neat work, but no fantasy.'],low:['The proportions need work.','The finish weakens the fantasy.','The finishing lets the idea down.','The silhouette is not flattering you.'],bottom:['The garment is wearing you.','It looks more like a draft than a look.','We can see the glue from here.']},
    ball:{win:['The categories told a complete story.','Three looks, one clear fashion voice.','You built a full runway package.'],high:['The ball had strong peaks.','You gave range and polish.','Each category built on the last.','You came with a real ball package.'],safe:['The package held together, but lightly.','Nothing collapsed, nothing exploded.','Three looks, no surprises.','You checked every category, softly.'],low:['The categories did not build enough impact.','The package felt uneven.','One category dragged the whole ball down.','The eleganza had holes in it.','The concepts were bigger than the execution.','Two looks worked. The third one did not show up.'],bottom:['The ball swallowed you.','The final look could not save the set.','Three looks and not one of them was finished.','The eleganza extravaganza was neither.','You brought a ball and forgot the gown.']},
    makeover:{win:['The family resemblance is unmistakable.','You transformed her without losing yourself.','This feels like a true drag family.'],high:['The resemblance reads clearly.','The makeover has heart and polish.','The resemblance is sweet and strong.','You gave your partner a real drag moment.'],safe:['The transformation is sweet, if simple.','The family idea is there.','The makeover is fine, the family is not obvious.','You dressed her, you did not transform her.'],low:['The resemblance needs a stronger link.','The styling feels disconnected.','We see two queens, not a family.','The makeover misses the family fantasy.'],bottom:['The makeover misses the family fantasy.','The transformation feels unfinished.','Your partner looks like she was dressed by a stranger.','This is not a family resemblance, it is a coincidence.']},
    girlgroup:{win:['Your verse owned its space.','You stood out without breaking the group.','The stage presence was undeniable.'],high:['You brought energy and focus.','Your part had real star power.','You lifted the whole group.','You sold every lyric and every move.'],safe:['You kept up with the group.','You did not miss a beat, but you did not steal one either.','You blended in. That is the problem.','Present, polite, forgettable.'],low:['You faded inside the group.','The choreography looked like a negotiation.','You were a step behind the group.','Your verse got lost in the mix.'],bottom:['The group moved on without you.','The performance lost confidence fast.','You dragged the group down.','We forgot you were in the group.']},
    rusical:{win:['You found character, rhythm, and star power.','Every beat felt intentional.','You made the role feel written for you.'],high:['The musicality was strong.','You gave a clear, entertaining character.','You sang, you danced, you served character.','You found the camp in the character.'],safe:['You hit your marks and stayed in the show.','The number worked, but did not peak with you.','You hit your marks without stealing the show.','The role was fine, you were fine.'],low:['You got caught between acting and choreography.','The role needed more precision.','The lyrics got away from you.','You were acting and dancing, but not both at once.'],bottom:['The number exposed every hesitation.','The performance never found the music.','The Rusical rolled right over you.','You were lost from the first note.']},
    branding:{win:['The brand is clear, funny, and sellable.','You gave us a product and a personality.','The pitch had a real hook.'],high:['The concept is strong.','You made the brand easy to understand.','The pitch was clever and confident.','You sold the brand and yourself.'],safe:['The brand is fine, but not viral.','The idea is there, just quiet.','A product we would not buy, but would not boo.','The brand is fine. Just fine.'],low:['The product feels hard to sell.','The brand needs a sharper point.','We were confused about what you were selling.','The pitch ran out of steam.'],bottom:['The concept collapses under the pitch.','We still do not know what you are selling.','That brand is going out of business tonight.','Nobody is buying this, honey.']},
    interview:{win:['You listened and led the conversation.','The interview felt effortless.','You made the guest feel seen.'],high:['You had charm and control.','The conversation moved smoothly.','You kept it charming and quick.','You were a natural host.'],safe:['You kept the interview alive.','It was polite and functional.','Polite questions, polite answers.','You kept it moving, nothing more.'],low:['The conversation needed more spark.','You lost the thread a few times.','The silences were louder than the questions.','You talked over your guest.'],bottom:['The interview became awkward fast.','The guest did more work than you.','That interview needed a rescue.','You lost control of the conversation.']},
    talent:{win:['The talent told us exactly who you are.','You owned the stage immediately.','That felt worthy of a premiere.'],high:['The performance had a clear identity.','You made a strong first impression.','That was a confident first impression.','You know exactly what makes you special.'],safe:['The talent was present, but not explosive.','You showed ability without a major gag.','A nice talent, nicely done.','We see the talent, we wanted the star.'],low:['The act never built enough momentum.','The ending needed a bigger button.','The talent did not show us who you are.','The act ran longer than our attention.'],bottom:['The talent did not translate to the stage.','The performance left us guessing.','That was not the right talent for this stage.','The act fell apart in front of us.']},
    // v31.5: challenges that used to fall back to "default"
    fashion_wars:{win:['You won the fabric fight and the runway.','That garment looks like it came out of an atelier, not a scramble.','You turned a tug of war into couture.'],high:['The construction held up under pressure.','You made smart choices with what you grabbed.','You fought for the good fabric and it shows.','Quick hands and a clear point of view.'],safe:['The garment works, but the fight showed.','It is finished, which is more than some can say.','You survived the fabric fight.','A decent garment from a messy scramble.'],low:['The materials won this round, not you.','We can see the panic in the hem.','You grabbed fabric, not a vision.','The rush shows in every seam.'],bottom:['The garment is fighting you on the runway.','This looks like it lost the war it was made in.','You lost the war and the runway.','This looks like it was assembled in the dark.']},
    dance:{win:['You hit every count and still had a face.','The choreography looked like it was built around you.','Every eight-count had a moment.'],high:['Sharp, clean and full of energy.','You danced like you had something to prove.','You attacked the choreography.','You were sharp and present the whole time.'],safe:['You knew the steps, but not the story.','Clean footwork, quiet presence.','You knew the steps, honey, we saw that.','Clean, but not exciting.'],low:['You were counting instead of performing.','The choreography was ahead of you all night.','The choreography was ahead of you.','You were thinking, not dancing.'],bottom:['You were half a beat behind the whole number.','The routine got away from you and never came back.','You were lost in the routine.','We watched you count the whole time.']},
    rumix:{win:['You owned your verse and your choreography.','That verse is going to be stuck in our heads for weeks.','You were the moment of the Rumix.'],high:['Your verse had swagger.','You sold the lyrics and the moves.','You owned your eight counts.'],safe:['The verse was fine. The performance was fine.','You kept up with the track.','The verse was fine, the moves were fine.','You kept up, nothing more.'],low:['The lyrics were cute, the delivery was not.','You looked lost between the bars.','The lyrics did not match the energy.','You were lost between the verse and the choreography.'],bottom:['The verse fell flat and so did the moves.','You disappeared inside your own Rumix.','Your verse disappeared in the mix.','That Rumix needed a different you.']},
    music_video:{win:['You knew where the camera was every second.','The video feels like a real release.','You gave the director everything.'],high:['You were a star on screen.','Every shot of you is usable.','You knew how to find your light.','Every shot of you is a keeper.'],safe:['You were in the video. That is the review.','The camera liked you, it did not love you.','You looked nice on camera.','You were in the frame, not the spotlight.'],low:['You fought the camera and the camera won.','The energy did not translate to the screen.','The camera never caught your energy.','You missed your moments on screen.'],bottom:['We kept looking for you in the edit.','On camera, the confidence just was not there.','You were invisible in the edit.','The camera did not love you tonight.']},
    political_debate:{win:['You had a platform, a punchline and a closing statement.','You won the debate and the room.','Every answer landed like a campaign slogan.'],high:['Your talking points were sharp and funny.','You held your ground on that podium.','Your soundbites were sharp and funny.'],safe:['You got through the questions without a scandal.','Polite, but not presidential.','You got through the debate without a scandal.','Safe answers, safe candidate.'],low:['The answers wandered off the podium.','Your opponent got the soundbites, you got the silence.','You rambled when you needed to land.','Your opponent got the best lines.'],bottom:['That campaign is over before the first poll.','You froze on the podium and never recovered.','That campaign just ended.','You froze when the cameras were on you.']},
    public:{win:['The public got exactly what they came for.','You read the room and played it like a pro.','That was a crowd-pleaser in every sense.'],high:['You connected with the people.','Real people, real reactions, real talent.','You made real people fall for you.','You gave the public a show.'],safe:['The crowd was polite. So were you.','You got a reaction, just not a roar.','The crowd clapped politely.','You did fine with a tough audience.'],low:['The public was not buying it.','You lost the room halfway through.','You never warmed up the crowd.','The public was not convinced.'],bottom:['The crowd went quiet, and so did your chances.','The public spoke, and it was not kind.','You lost the crowd and never got it back.','The audience was checking their phones.']},
    default:{win:['You turned the assignment into a moment.','You looked like the queen to beat.'],high:['This was a strong week for you.','You made smart choices.','You gave us something to remember.','You are getting stronger every week.'],safe:['You did enough to stay in the race.','It was clean, but quiet.','You stayed in the middle of the pack.','You did enough, and only enough.'],low:['We needed more focus from you.','The idea never fully landed.','You needed a stronger choice tonight.','This was not your best work.'],bottom:['Tonight was a real stumble.','The challenge exposed the cracks.','The challenge got the better of you.']}
  },
  runway:{
    showstopper:['And this runway? A full gag.','The runway is doing victory laps.','This look belongs in the highlight reel.','That runway just stopped the show.','The look walked in before you did.','We will be talking about this runway at the reunion.','Honey, the runway is the headline tonight.','That is a look for the season\'s poster.'],
    strong:['The runway supports the story beautifully.','The look is polished and memorable.','On the runway, you look expensive.','The look is sharp and well edited.','The runway adds to everything you did tonight.','You styled this down to the shoe.','Clean, chic and right on category.','The silhouette is working hard for you.'],
    solid:['The runway is solid, even if not shocking.','The look is clean and safe.','The category is there, just softly.','The runway is pleasant, but it does not move the needle.','A nice look that plays it a little too safe.','We see the category. We just wanted more of you in it.','Good bones, quiet styling.','The look checks the box and stops there.'],
    weak:['The runway needed one more edit.','The styling is holding you back.','The look is not helping the case.','The styling is fighting the concept.','The look needed one more fitting.','The idea is cute, the execution is not there yet.','We are missing the polish on this runway.','The category got lost somewhere on the way to the stage.'],
    flop:['The runway lets you down.','The look simply is not working.','The category deserved more than this.','The runway did not help you tonight, my dear.','That look is a cry for help.','The category came to play. The look did not.','This runway is giving \'last-minute Uber to the club\'.','The look is a whole question mark.']
  },
  close:{win:['Excellent work this week.','This is the level we want from you.','You raised the bar.','That is how you win a challenge.','You came to play and you won.','This is your episode, baby.','You set the standard tonight.'],high:['Very strong work.','You are moving in the right direction.','Keep pushing like this.','You are a contender, and we see it.','This was one of your best weeks.','You are building something special.','Strong work. Now do it again.'],safe:['You are safe, but do not disappear.','We are waiting for the next level.','Do not get comfortable.','Safe is a word, not a goal.','We are watching. Show us more next week.','You are in the race, but not in the lead.','Next week, step out of the shadows.'],low:['We need more from you.','This was not your strongest week.','You need to fight harder.','You are better than this, and you know it.','This week slipped through your fingers.','You need to find your spark again.','We expect more, because we have seen more.'],bottom:['Tonight was disappointing.','You have a lot to prove.','This competition is getting harder.','This was not your night.','You are in danger, and you need to fight.','You gave us too little, too late.','Now you have to lip sync like your life depends on it.']}
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
  if(bucket==='win'||bucket==='high') return freshCritiquePick(lines.positive || GUEST_WILDCARD_LINES.positive);
  if(bucket==='safe') return freshCritiquePick(roll<.45?(lines.positive||GUEST_WILDCARD_LINES.positive):(lines.mixed||GUEST_WILDCARD_LINES.mixed));
  if(bucket==='low') return freshCritiquePick(roll<.35?(lines.positive||GUEST_WILDCARD_LINES.positive):(lines.mixed||GUEST_WILDCARD_LINES.mixed));
  return freshCritiquePick(roll<.22?(lines.positive||GUEST_WILDCARD_LINES.positive):(lines.negative||GUEST_WILDCARD_LINES.negative));
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
// v31.5: the same critique line is never said twice in one episode.
const CRITIQUE_LINES_USED={episode:null,lines:new Set()};
const CRITIQUE_HISTORY_REF=/\b(week one|last week|every week|week after week|again|so far|consistently|once again|anymore|lately|this season|all season|you've been|you have been|we've seen|we have seen|since day one)\b/i;
function freshCritiquePick(list){
  const arr=(list||[]).filter(Boolean);
  if(!arr.length)return undefined;
  const ep=gameState.currentEpisode;
  const key=(gameState.season?.number||0)+':'+(ep?.number||0)+':'+(ep?.challengeType||'');
  if(CRITIQUE_LINES_USED.episode!==key){CRITIQUE_LINES_USED.episode=key;CRITIQUE_LINES_USED.lines=new Set();}
  // lines that talk about earlier weeks make no sense in the first two episodes
  const early=(Number(ep?.number)||1)<=2;
  const fits=early?arr.filter(x=>!CRITIQUE_HISTORY_REF.test(x)):arr;
  const pool=fits.length?fits:arr;
  const unused=pool.filter(x=>!CRITIQUE_LINES_USED.lines.has(x));
  // v31.6: prefer lines not yet heard this season, then lines not heard this episode
  const seasonUsed=seasonUsedLines();
  const fresh=unused.filter(x=>!seasonUsed.has(x));
  const pick=sample(fresh.length?fresh:(unused.length?unused:pool));
  CRITIQUE_LINES_USED.lines.add(pick);
  markSeasonLineUsed(pick);
  return pick;
}
// v31.6: season-wide memory of narrative lines already shown, so the same sentence does not come back
const SEASON_LINE_CACHE=new WeakMap();
function seasonUsedLines(){
  const s=gameState.season;if(!s)return new Set();
  s.usedLines=s.usedLines||[];
  let c=SEASON_LINE_CACHE.get(s);
  if(!c||c.arr!==s.usedLines||c.len!==s.usedLines.length){c={arr:s.usedLines,len:s.usedLines.length,set:new Set(s.usedLines)};SEASON_LINE_CACHE.set(s,c);}
  return c.set;
}
function markSeasonLineUsed(line){
  const s=gameState.season;if(!s||!line)return;
  const set=seasonUsedLines();if(set.has(line))return;
  s.usedLines.push(line);if(s.usedLines.length>1500)s.usedLines.splice(0,s.usedLines.length-1500);
  set.add(line);const c=SEASON_LINE_CACHE.get(s);if(c)c.len=s.usedLines.length;
}
function seasonFreshPick(list){
  const arr=(list||[]).filter(Boolean);if(!arr.length)return '';
  const used=seasonUsedLines();const fresh=arr.filter(x=>!used.has(x));
  const pick=sample(fresh.length?fresh:arr);markSeasonLineUsed(pick);return pick;
}
function attributeCritiqueLine(q, bucket){
  const attrs = q?.attributes || {};
  const positive = bucket === 'win' || bucket === 'high';
  const negative = bucket === 'low' || bucket === 'bottom';

 const pools = {
  "lipSync": {
    "positive": [
      "Your performance instinct is undeniable. You command the stage.",
      "There is a beautiful musicality in your drag.",
      "You are a born performer. It is impossible to look away.",
      "Your stage presence is electric. You live inside the song.",
      "You know exactly how to weaponize your body on stage.",
      "Your timing and rhythm are absolutely flawless.",
      "You don't just perform; you captivate the entire room.",
      "The energy you bring to the stage is unmatched.",
      "You have an innate ability to connect with the music.",
      "Your star power as a performer is blinding."
    ],
    "negative": [
      "We know you can perform, but tonight lacked fire.",
      "You have the skill, but it needed more focus.",
      "The performance ability is there, but you held back.",
      "We know your power, but tonight felt a bit flat.",
      "You are a great performer, but the connection was missing.",
      "The movement was there, but the passion was not.",
      "We needed that signature explosive energy, but it didn't arrive.",
      "You have the choreography down, but it lacked soul tonight.",
      "The performance ability is unquestionable, but you looked tired.",
      "We know you can dominate a stage, but you coasted tonight."
    ]
  },
  "makeup": {
    "positive": [
      "Your makeup is exceptional. That face is polished and yours.",
      "The mug is telling the story before you even speak.",
      "Your paint is exquisite. A total masterclass.",
      "That face is art. You paint perfectly for your features.",
      "Your makeup skills are flawless. The blending is perfection.",
      "The symmetry and precision on your face are stunning.",
      "You know exactly how to draw the eye to your face.",
      "Your paint is clean, sharp, and incredibly high-end.",
      "That face is completely stamped. Beautiful work.",
      "Your makeup always honors your features beautifully."
    ],
    "negative": [
      "The makeup is strong, but it's carrying the whole look.",
      "Your face is polished, but the rest didn't rise to it.",
      "Beautiful makeup, but it needs to match the scale of your drag.",
      "We know you can paint, but tonight felt rushed.",
      "The mug is stunning, but it cannot do all the work.",
      "The paint is good, but the harsh lighting lost the details.",
      "We know your skill, but tonight the colors felt muddy.",
      "The face is gorgeous, but the neck and hands didn't match.",
      "Your makeup is technically sound, but it lacks dimension tonight.",
      "We know you can stamp a face, but this felt repetitive."
    ]
  },
  "sewing": {
    "positive": [
      "The construction is clean, controlled, and beautifully made.",
      "Your technical skill shows in the finish and the fit.",
      "This garment is beautifully constructed. Great craftsmanship.",
      "Brilliant understanding of structure. It looks custom-made.",
      "You understand fabric and how to make it work for you.",
      "The seams are straight and the darts are perfect.",
      "Your garment construction is better than what we see retail.",
      "You know how to engineer a garment to look flawless.",
      "The technical execution here is absolutely top-tier.",
      "You have the hands of a master dressmaker."
    ],
    "negative": [
      "You have construction skills, but the finish wasn't there.",
      "We see the ability, but this needed more editing.",
      "The technical skill is there, but the execution felt incomplete.",
      "You know how to sew, but this needed a tighter edit.",
      "The construction is good, but the tailoring fell short.",
      "We know you can sew, but the hems are messy tonight.",
      "The structural skill is there, but the fabric choices fought you.",
      "You have the technical knowledge, but you rushed the execution.",
      "The garment is put together well, but the fit is off.",
      "We know your ability, but this garment looks overworked."
    ]
  },
  "runway": {
    "positive": [
      "Your runway point of view is crystal clear. Great impact.",
      "You know exactly how to sell a look from head to toe.",
      "Your fashion instinct is brilliant. Every choice feels deliberate.",
      "You present a complete story. The styling is impeccable.",
      "You have a stellar runway walk and you understand your silhouette.",
      "Your fashion point of view is elevated and sophisticated.",
      "You know how to move in clothes to create drama.",
      "The presentation is flawless. You look like a moving editorial.",
      "Your styling instincts are incredibly sharp and current.",
      "You command the runway with absolute poise and grace."
    ],
    "negative": [
      "You have taste, but the styling choices didn't support the concept.",
      "The fashion instinct is there, but it needed refinement.",
      "We know you understand silhouette, but the proportions were off.",
      "The presentation is good, but the concept needed more push.",
      "You walk well, but the styling choices held you back.",
      "The fashion sense is clear, but the accessories are distracting.",
      "We know you have taste, but tonight looked a bit dated.",
      "The look has potential, but the runway walk was stiff.",
      "You know fashion, but this presentation lacked your usual signature.",
      "The concept is high-fashion, but the execution fell flat on the runway."
    ]
  },
  "acting": {
    "positive": [
      "You understand character, timing, and how to make a scene live.",
      "Your acting choices were specific, confident, and clear.",
      "Brilliant comedic timing. You know how to hold an audience.",
      "Your ability to disappear into a character is wonderful.",
      "You have great comedic instincts and you react beautifully.",
      "Your delivery is sharp and you never drop character.",
      "You know exactly how to command attention in a scene.",
      "Your performance choices are intelligent and well-paced.",
      "You have a natural charm that makes you highly watchable.",
      "Your characterization is consistently distinct and grounded."
    ],
    "negative": [
      "You have acting ability, but the character never fully settled.",
      "We know you can act, but this needed clearer choices.",
      "The talent is there, but your timing was slightly off.",
      "You are a great actor, but you let the scene get away.",
      "We know you are funny, but the characterization felt forced.",
      "The acting skills are present, but you are overthinking the lines.",
      "We know your capability, but you got lost in the ensemble.",
      "You have the talent, but tonight you lacked vocal projection.",
      "The dramatic instinct is there, but the performance felt one-note.",
      "We know you can deliver, but you pushed way too hard tonight."
    ]
  },
  "cunt": {
    "positive": [
      "Your charisma and star quality are impossible to ignore.",
      "There is a natural confidence in you. You command attention.",
      "You have that rare, unteachable star quality. It radiates.",
      "Your presence alone is enough to own this entire stage.",
      "You possess genuine nerve. That star power is magnetic.",
      "You carry yourself like an absolute superstar.",
      "Your charisma fills the room the second you walk in.",
      "You have that special 'it' factor that cannot be bought.",
      "Your confidence is infectious and completely justified.",
      "You are a magnetic force up there on that stage."
    ],
    "negative": [
      "You have star quality, but you didn't use it with intention.",
      "The presence is there, but the choices weren't strong enough.",
      "We know you have charisma, but tonight it felt clouded.",
      "The star quality is undeniable, but it needs sharper choices.",
      "You have the 'it' factor, but you are hiding behind it.",
      "The star power is inside you, but you look scared tonight.",
      "We know you have nerve, but you played it too safe.",
      "Your natural charisma is great, but it's not replacing effort.",
      "The presence is massive, but the execution didn't match it.",
      "We know you are a star, but tonight you dimmed your own light."
    ]
  }
};

  // v31.5: only praise/critique an attribute the challenge actually tests
  // (no sewing compliments in a Dance Challenge). The runway is judged every week, so it always counts.
  const ep = gameState.currentEpisode;
  const challenge = (gameState.data?.challenges || []).find(c => c.id === ep?.challengeType);
  const weights = challenge?.weights || null;
  const relevant = attr => attr === 'runway' || !weights || (weights[attr] || 0) >= 0.1;
  const eligible = Object.keys(pools).filter(attr => (attrs[attr] || 0) >= 9 && relevant(attr));
  if (!eligible.length) return '';

  const attr = sample(eligible);
  if (positive) return freshCritiquePick(pools[attr].positive);
  if (negative) return freshCritiquePick(pools[attr].negative);
  return '';
}
function composedJudgeCritique(p, placements, ep){
  // v31.5: a queen's critique is written once per episode, so re-rendering the screen
  // (staged reveal, reload) never changes what the judges said or repeats lines.
  if(ep){ep.critiqueCache=ep.critiqueCache||{};const key=p.queenId+':'+p.placement;if(ep.critiqueCache[key])return ep.critiqueCache[key];const html=composedJudgeCritiqueFresh(p, placements, ep);ep.critiqueCache[key]=html;return html;}
  return composedJudgeCritiqueFresh(p, placements, ep);
}
function composedJudgeCritiqueFresh(p, placements, ep){
  const finalStretchPraise=isFinalStretchPraiseEpisodeForCritiques(ep);
  const tournamentPraise=ep?.special==='tournament_bracket';
  const bucket=tournamentPraise?(p.placement==='WIN'?'win':'high'):(finalStretchPraise?finalStretchCritiqueBucket(p):critiqueBucket(p));
  const challengeId=challengeCritiqueId(ep);
  const q=gameState.queens.find(x=>x.id===p.queenId);
  if(typeof recalcNarrativeTags==='function') recalcNarrativeTags();
  const externalJudge=gameState.data?.narrativeExpansion?.judgeComments || gameState.data?.narrativeText?.judgeComments || {};
  const challengeLine=freshCritiquePick(JUDGE_CRITIQUE_BANK.challenge[challengeId]?.[bucket]||JUDGE_CRITIQUE_BANK.challenge.default[bucket]);
  const runwayLine=freshCritiquePick(JUDGE_CRITIQUE_BANK.runway[runwayBucketForCritique(p,placements)]||JUDGE_CRITIQUE_BANK.runway.solid);
  const guestName=ep.guestJudge?.name||'Guest Judge';
  const guestLine=guestJudgeCritiqueLine(p,bucket);
  const ruPlacement=finalStretchPraise && (p.placement==='LOW' || p.placement==='BTM') ? 'HIGH' : p.placement;
  const ruLine=typeof ruNarrativeComment==='function' ? ruNarrativeComment(q,ruPlacement) : freshCritiquePick(JUDGE_CRITIQUE_BANK.close[bucket]||JUDGE_CRITIQUE_BANK.close.safe);
  const rotatingJudge=(ep.number||0)%2===0?'Ross':'Carson';
  const middleLine=rotatingJudge==='Ross' ? freshCritiquePick(JUDGE_CRITIQUE_BANK.close[bucket]||JUDGE_CRITIQUE_BANK.close.safe) : runwayLine;
const attrLine = attributeCritiqueLine(q, bucket);
const michelleLine = attrLine || (Math.random()<0.35
  ? freshCritiquePick((externalJudge.michelle||{})[bucket==='win'||bucket==='high'?'positive':bucket==='safe'?'safe':'negative']||[challengeLine])
  : challengeLine);
  return [
`<div class="judge-line judge-michelle"><span>Michelle</span><p>${escapeHtml(michelleLine)}</p></div>`,
    `<div class="judge-line judge-rotating"><span>${rotatingJudge}</span><p>${escapeHtml(Math.random()<0.25 ? freshCritiquePick((externalJudge[rotatingJudge.toLowerCase()]||{})[bucket==='win'||bucket==='high'?'positive':bucket==='safe'?'safe':'negative']||[middleLine]) : middleLine)}</p></div>`,
    `<div class="judge-line judge-guest"><span>${escapeHtml(guestName)}</span><p>${escapeHtml(guestLine)}</p></div>`,
    `<div class="judge-line judge-ru"><span>RuPaul</span><p>${escapeHtml(ruLine)}</p></div>`
  ].join('');
}

// v31.5 Part B: decisions are revealed one stage at a time (safe HIGHs, winner, safe LOWs, bottom),
// so scrolling never spoils them. The stage is saved, so a reload keeps what was already shown.
function tvStagedDecisions(ep){
  const items=[...document.querySelectorAll('.tv-decisions [data-rv]')];
  const stages=[...new Set(items.map(x=>+x.dataset.rv))].sort((a,b)=>a-b);
  const btn=document.querySelector('#tvRevealNext');
  const cont=document.querySelector('#continue');
  const divider=document.querySelector('.tv-decisions .decision-divider');
  const labels={1:'Safe tops',2:'The winner',3:'Safe lows',4:'The bottom'};
  const apply=()=>{
    const shown=ep.tvDecisionStage||0;
    items.forEach(x=>x.hidden=stages.indexOf(+x.dataset.rv)>=shown);
    if(divider)divider.hidden=!items.some(x=>!x.hidden && +x.dataset.rv>=3);
    const done=shown>=stages.length;
    if(btn){btn.hidden=done; if(!done)btn.textContent='Reveal the decisions';}
    if(cont)cont.hidden=!done;
  };
  if(!stages.length){if(btn)btn.remove();return;}
  // v31.6: one click reveals the whole sequence, in order (safe tops, winner, safe lows, bottom)
  btn?.addEventListener('click',()=>{ep.tvDecisionStage=stages.length;saveGame();apply();document.querySelector('.tv-decisions')?.scrollIntoView({block:'start'});});
  apply();
}
// v31.5 round 2: the challenge winner gets her own moment, like the lip sync winner cards
function tvWinnerCard(list, label, line, extra=''){
  const qs=list.map(w=>gameState.queens.find(q=>q.id===w.queenId)).filter(Boolean);
  return `<div data-rv="2" class="tv-win-card"><div class="tv-win-portraits">${qs.map(q=>queenPortraitHtml(q,'lg')).join('')}</div><div class="tv-win-copy"><span class="tv-win-label">${typeof icon==='function'?icon('crown'):''}${escapeHtml(label)}</span><strong class="tv-win-line tv-win-names">${qs.map(q=>escapeHtml(q.name)).join(' & ')}</strong><p>Condragulations! ${line}</p>${extra?`<p class="small">${extra}</p>`:''}</div></div>`;
}
function renderJudgesCritiques(){
  const ep=gameState.currentEpisode;
  ep.feedStage='critiques';
  const placements=ep.placements;
  const isTournament=ep.special==='tournament_bracket';
  const isAllWinners=getSeasonFormat && getSeasonFormat()==='all_winners';
  const playerInBottom=!isTournament && !isAllWinners && ep.bottomQueens.includes(gameState.playerQueenId);
  const lowQueens=placements.filter(p=>p.placement==='LOW');
  const winners=placements.filter(p=>p.placement==='WIN');
  const top2Queens=placements.filter(p=>p.placement==='TOP2');
  const highs=placements.filter(p=>p.placement==='HIGH');
  const bottomSorted=placements.filter(p=>p.placement==='BTM').sort((a,b)=>a.score-b.score);
  const worst=bottomSorted[0];
  const secondWorst=bottomSorted[1];
  const critiqueQueens=(isTournament?placements:placements.filter(p=>p.placement!=='SAFE')).sort((a,b)=>a.name.localeCompare(b.name));
  const critiques=critiqueQueens.map(p=>{
    const snatch=ep.snatchCharacters?.find(c=>c.queenId===p.queenId);
    const snatchLine=snatch?`<p class="small tv-crit-as">as <strong>${escapeHtml(snatch.character)}</strong></p>`:'';
    const q=gameState.queens.find(x=>x.id===p.queenId);
    return {queenId:p.queenId,html:`<article class="critique tv-crit${p.queenId===gameState.playerQueenId?' tv-crit-me':''}"><div class="critique-head">${q?queenPortraitHtml(q,'md'):''}<div><h4>${escapeHtml(p.name)}</h4>${snatchLine}</div></div><div class="judge-critique-grid">${composedJudgeCritique(p, placements, ep)}</div>${judgingEventMarkup(p)}</article>`};
  });
  const critiquesHtml=tvGroupedList(ep,critiques,c=>c.html,'critique-list');
  const playerPlacement=placements.find(p=>p.queenId===gameState.playerQueenId);
  const playerGetsCritique=playerPlacement && (!ep.participantIds || ep.participantIds.includes(gameState.playerQueenId)) && (isTournament || playerPlacement.placement!=='SAFE');
  const judgeResponseBlock=(playerGetsCritique && !ep.judgeResponseApplied && !ep.judgeResponseSkipped) ? `<div class="card important decision-card"><h3>Your response to the judges</h3><p>The critique is landing. You can respond, or simply continue without saying anything.</p><div class="options">${Object.entries(JUDGE_RESPONSES).map(([id,o])=>choiceButtonHtml({id,attr:'data-judge',label:o.label,desc:o.description})).join('')}</div></div>` : (ep.judgeResponseApplied?`<div class="card subtle"><h3>Your response</h3><p>${escapeHtml((ep.playerEffects?.notes||[]).slice(-1)[0]||'You answered the judges.')}</p>${typeof lastEffectChipsHtml==='function'?lastEffectChipsHtml('critiques'):''}</div>`:(ep.judgeResponseSkipped&&playerGetsCritique?`<div class="card subtle"><h3>Your response</h3><p>${escapeHtml(passiveJudgeNote(playerPlacement, placements))}</p></div>`:''));
  const topAnnouncements=[];
  const bottomAnnouncements=[];
  if(isTournament){
    const nonWinners=placements.filter(p=>p.placement!=='WIN').sort((a,b)=>a.name.localeCompare(b.name));
    if(winners.length>1)topAnnouncements.push(tvWinnerCard(winners,'Top 2 of the bracket',`${winners.map(w=>escapeHtml(w.name)).join(' and ')}, you are the Top 2 of this bracket challenge.`,'Each of you earns <strong>2 tournament points</strong> and will lip sync for one extra point.'));
    if(nonWinners.length){
      const names=nonWinners.map(qp=>escapeHtml(qp.name)).join(', ');
      bottomAnnouncements.push(`<div data-rv="3" class="tv-call"><p><strong>${names}</strong>, you remain in the bracket and will cast a point vote after the lip sync.</p></div>`);
    }
  }else if(isAllWinners){
    highs.slice().reverse().forEach(h=>topAnnouncements.push(`<div data-rv="1" class="tv-call tv-call-safe"><p>${queenPortraitHtml(gameState.queens.find(q=>q.id===h.queenId),'xs')} <strong>${escapeHtml(h.name)}</strong>, you are safe.</p></div>`));
    if(top2Queens.length){
      topAnnouncements.push(tvWinnerCard(top2Queens,'Top 2 All Stars',`${top2Queens.map(w=>escapeHtml(w.name)).join(' and ')}, you are the Top 2 All Stars of the week.`,'You will lip sync for your legacy. The winner will become Top All Star of the Week and block one queen.'));
    }
  }else{
    highs.slice().reverse().forEach(h=>topAnnouncements.push(`<div data-rv="1" class="tv-call tv-call-safe"><p>${queenPortraitHtml(gameState.queens.find(q=>q.id===h.queenId),'xs')} <strong>${escapeHtml(h.name)}</strong>, you are safe.</p></div>`));
    if(winners.length===1){
      topAnnouncements.push(tvWinnerCard(winners,'Challenge winner',`${escapeHtml(winners[0].name)}, you are the winner of this week's challenge.`));
    }else if(winners.length>1){
      topAnnouncements.push(tvWinnerCard(winners,'Challenge winners',`${winners.map(w=>escapeHtml(w.name)).join(' and ')}, you are the winners of this week's challenge.`));
    }
    // v31.5: safe LOWs are told first, then the bottom
    lowQueens.forEach(l=>bottomAnnouncements.push(`<div data-rv="3" class="tv-call tv-call-safe"><p>${queenPortraitHtml(gameState.queens.find(q=>q.id===l.queenId),'xs')} <strong>${escapeHtml(l.name)}</strong>, you are safe.</p></div>`));
    bottomSorted.forEach((b,idx)=>{
      const line = idx===0
        ? `I'm sorry, but you are up for elimination.`
        : `I'm sorry, my dear, but you are also up for elimination.`;
      bottomAnnouncements.push(`<div data-rv="4" class="tv-call tv-call-btm"><p>${queenPortraitHtml(gameState.queens.find(q=>q.id===b.queenId),'xs')} <strong>${escapeHtml(b.name)}</strong>, ${line}</p></div>`);
    });
  }
  setHTML(`<main class="layout"><section class="screen">
    <div class="hero tv-ep-title"><span class="eyebrow">Episode ${escapeHtml(String(ep.number||''))} · ${escapeHtml(ep.challengeName||'')} · Judges</span><h2>Judges' Critiques</h2><p class="tv-lede">${isTournament?'Every queen in this bracket receives critiques. Tonight is about points, not survival.':(isAllWinners?'The safe queens are backstage. The tops remain on the main stage.':'The safe queens are backstage. The tops and bottoms remain on the main stage.')}</p></div>
    <section class="tv-block" data-block="critiques"><h3 class="tv-bt">Critiques</h3><div class="tv-bc">${critiquesHtml}
    ${judgeResponseBlock}</div></section>
    <section class="tv-block" data-block="decisions"><h3 class="tv-bt">Decisions</h3><div class="tv-bc"><div class="tv-decisions">${topAnnouncements.join('')}<hr class="decision-divider">${bottomAnnouncements.join('')}</div>
    <div class="tv-nav"><button id="tvRevealNext" class="secondary tv-next">Next</button></div></div></section>
    <div class="tv-nav"><button id="continue" class="tv-next">${(isAllWinners||isTournament)?'Watch the Lip Sync':(playerInBottom?'Go to the Lip Sync':'Watch the Lip Sync')}</button></div>
  </section>${queenSidebar()}</main>`);
  bindCommon(()=>showHistory(renderJudgesCritiques));
  tvStagedDecisions(ep);
  // v31.6: on phones the critiques fold into one line per queen (yours stays open); tap to open
  if(window.matchMedia && window.matchMedia('(max-width:640px)').matches){
    document.querySelectorAll('.tv-crit').forEach(c=>{
      if(!c.classList.contains('tv-crit-me'))c.classList.add('is-collapsed');
      const h=c.querySelector('.critique-head');
      if(h){h.setAttribute('role','button');h.tabIndex=0;h.addEventListener('click',()=>c.classList.toggle('is-collapsed'));}
    });
  }
  document.querySelectorAll('[data-judge]').forEach(btn=>btn.addEventListener('click',()=>{
    window.__preserveScrollY = window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    applyJudgeResponse(btn.dataset.judge);
    renderJudgesCritiques();
  }));
  document.querySelector('#continue').addEventListener('click',()=>{if(playerGetsCritique && !ep.judgeResponseApplied && !ep.judgeResponseSkipped){ep.judgeResponseSkipped=true; if(typeof applySkippedJudgeResponsePenalty==='function') applySkippedJudgeResponsePenalty(); saveGame();} renderLipSync();});
}
