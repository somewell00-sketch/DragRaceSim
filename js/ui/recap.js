// v31.5 Part B — Season recap. Opens from the STILL IN panel at any time, and right before the Grand Finale.
// Everything is read from the season's own history; nothing here changes the game.

const RECAP_TAG_LABELS={
  'front-runner':'Frontrunner','lip sync assassin':'Lip sync assassin','filler queen':'Invisible edit','rising star':'Underdog',
  'redemption arc':'Redemption arc','villain edit':'Villain edit','fan favorite':'Fan favorite','survivor':'Survivor','fading':'Fading',
  "producer's dream":"Producer's dream",'wildcard':'Wildcard','competitive threat':'Threat','fashion queen':'Fashion queen',
  'comedy queen':'Comedy queen','performer':'Performer','underdog':'Underdog','late bloomer':'Late bloomer','peaked too early':'Peaked too early',
  'the mother':'The mother','invisible edit':'Invisible edit','production darling':"Producer's dream",'steady competitor':'Steady competitor',
  'robbed queen':'Robbed','miss congeniality':'Miss Congeniality'
};
const RECAP_PLACE_CLASS={WIN:'win',TOP2:'top2',HIGH:'high',SAFE:'safe',LOW:'low',BTM:'btm','LIPSYNC WIN':'btm',ELIM:'elim',WINNER:'winner',RUNNERUP:'runner',FINALIST:'safe'};

function recapEpisodes(){return (gameState.episodeHistory||[]).filter(e=>e && e.placements?.length);}
function recapQueen(id){return (gameState.queens||[]).find(q=>q.id===id);}
function recapName(id){return recapQueen(id)?.name||'—';}

function recapLipSyncOfTheSeason(eps){
  const iconic=(gameState.season?.iconicLipSyncs||[]).slice(-1)[0];
  if(iconic)return {ep:iconic.episode,title:(iconic.queens||[]).map(q=>q.name||recapName(q.queenId)).join(' vs '),text:`${iconic.songTitle||''}${iconic.artist?' by '+iconic.artist:''}`,ids:(iconic.queens||[]).map(q=>q.queenId)};
  const ls=eps.filter(e=>e.lipSyncResult?.results?.length>=2).map(e=>({e,d:Number(e.lipSyncResult.difference)||99})).sort((a,b)=>a.d-b.d)[0];
  if(!ls)return null;
  const r=ls.e.lipSyncResult;
  return {ep:ls.e.number,title:r.results.map(x=>x.name||recapName(x.queenId)).join(' vs '),text:`${ls.e.song?.title||r.song?.title||''}${(ls.e.song?.artist||r.song?.artist)?' by '+(ls.e.song?.artist||r.song?.artist):''} · ${recapName(r.survivorId)} won by a hair`,ids:r.results.map(x=>x.queenId)};
}
function recapShadeOfTheSeason(eps){
  const arcs=(gameState.season?.relationshipArcs||[]).filter(a=>a.type==='rival'||a.type==='truce');
  if(arcs.length){
    const aff=(a,b)=>(Number(gameState.relationships?.[a]?.[b]?.affinity)||0)+(Number(gameState.relationships?.[b]?.[a]?.affinity)||0);
    const top=[...arcs].sort((x,y)=>aff(x.a,x.b)-aff(y.a,y.b))[0];
    return {ep:top.since,title:`${recapName(top.a)} vs ${recapName(top.b)}`,text:top.type==='truce'?'The feud of the season, until Makeover week called a truce.':'The feud of the season. Neither of them blinked.',ids:[top.a,top.b]};
  }
  let worst=null;
  eps.forEach(e=>(e.relationshipLog||[]).forEach(l=>{if(!worst||l.d<worst.d)worst={...l,ep:e.number};}));
  if(!worst)return null;
  return {ep:worst.ep,title:`${recapName(worst.a)} → ${recapName(worst.b)}`,text:'The coldest turn of the season.',ids:[worst.a,worst.b]};
}
function recapTurnaround(){
  let best=null;
  (gameState.queens||[]).forEach(q=>{
    const h=(q.episodeHistory||[]).filter(x=>x && x.episode!=='Finale');
    h.forEach((low,i)=>{if(!['BTM','LOW','LIPSYNC WIN'].includes(low.placement))return;
      const up=h.slice(i+1).find(x=>['WIN','TOP2'].includes(x.placement));
      if(up){const gap=(Number(up.episode)||0)-(Number(low.episode)||0);if(!best||gap<best.gap)best={q,low,up,gap};}});
  });
  if(!best)return null;
  return {ep:best.up.episode,title:best.q.name,text:`From ${best.low.placement==='LIPSYNC WIN'?'BTM':best.low.placement} in episode ${best.low.episode} to ${best.up.placement} in episode ${best.up.episode}.`,ids:[best.q.id]};
}
function recapArcLabel(q){
  // v31.6: same tags as the track record (seasonTagProfile)
  const t=typeof seasonTagProfile==='function'?seasonTagProfile(q).list[0]:'';
  return RECAP_TAG_LABELS[t]||(t?String(t).replace(/\b\w/g,c=>c.toUpperCase()):'');
}

function renderSeasonRecap(opts={}){
  const eps=recapEpisodes();
  const season=gameState.season||{};
  const tab=opts.tab||'all';
  const pid=gameState.playerQueenId;
  const rivalIds=new Set();(season.relationshipArcs||[]).filter(a=>a.type!=='ally').forEach(a=>{rivalIds.add(a.a);rivalIds.add(a.b);});
  const keep=ids=>tab==='all'||(tab==='me'&&ids.includes(pid))||(tab==='rivals'&&ids.some(id=>rivalIds.has(id)));
  const ic=(n,c='')=>typeof icon==='function'?icon(n,c):'';

  const moments=[
    ['Lip sync of the season',ic('flame','e-flame'),recapLipSyncOfTheSeason(eps)],
    ['Shade of the season',ic('mood-shade','mood-shade'),recapShadeOfTheSeason(eps)],
    ['Turnaround',ic('sparkle','b-moment'),recapTurnaround()]
  ].filter(m=>m[2] && keep(m[2].ids||[]));
  const momentsHtml=moments.length
    ? `<div class="recap-moments">${moments.map(([label,i,m])=>`<article class="card recap-moment"><span class="eyebrow">${i} ${escapeHtml(label)}${m.ep?` · Ep ${escapeHtml(String(m.ep))}`:''}</span><strong class="recap-moment-title">${escapeHtml(m.title)}</strong><p class="small">${escapeHtml(m.text)}</p></article>`).join('')}</div>`
    : `<p class="small">Nothing iconic here yet. Give it an episode or two.</p>`;

  const guideRows=eps.filter(e=>{
    const ids=[...(e.placements||[]).filter(p=>['WIN','TOP2'].includes(p.placement)).map(p=>p.queenId),...(e.bottomQueens||[]),e.eliminatedQueenId].filter(Boolean);
    return keep(ids);
  }).map(e=>{
    const winners=(e.placements||[]).filter(p=>p.placement==='WIN'||p.placement==='TOP2').map(p=>p.name||recapName(p.queenId));
    const bottoms=(e.bottomQueens||[]).map(recapName);
    const outs=(e.lipSyncResult?.eliminatedQueenIds||(e.eliminatedQueenId?[e.eliminatedQueenId]:[])).map(recapName);
    const song=e.song?.title||e.lipSyncResult?.song?.title||'';
    return `<tr><td class="num">${escapeHtml(String(e.number))}</td><td>${escapeHtml(e.challengeName||'')}</td><td>${escapeHtml(winners.join(', ')||'—')}</td><td>${escapeHtml(bottoms.join(', ')||'—')}${song?` · <span class="small">${escapeHtml(song)}</span>`:''}</td><td>${escapeHtml(outs.join(', ')||'—')}</td></tr>`;
  }).join('');
  const guideHtml=guideRows?`<div class="table-wrap recap-table"><table><thead><tr><th>Ep</th><th>Challenge</th><th>Winner</th><th>Bottom · song</th><th>Eliminated</th></tr></thead><tbody>${guideRows}</tbody></table></div>`:`<p class="small">No episodes to show yet.</p>`;

  const epNumbers=eps.map(e=>e.number);
  const order=typeof getQueenStandingOrder==='function'?getQueenStandingOrder():(gameState.queens||[]);
  const arcRows=order.filter(q=>keep([q.id])).map(q=>{
    const cells=epNumbers.map(n=>{
      const h=(q.episodeHistory||[]).find(x=>String(x.episode)===String(n));
      if(!h)return `<i class="sq out" title="Ep ${n}: —"></i>`;
      const cls=RECAP_PLACE_CLASS[h.placement]||'safe';
      return `<i class="sq ${cls}" title="Ep ${n}: ${escapeHtml(h.placement==='LIPSYNC WIN'?'BTM':h.placement)}"></i>`;
    }).join('');
    const label=recapArcLabel(q);
    return `<div class="recap-arc">${queenPortraitHtml(q,'xs')}<strong>${escapeHtml(q.name)}</strong><span class="recap-squares">${cells}</span>${label?`<span class="badge arc">${escapeHtml(label)}</span>`:'<span></span>'}</div>`;
  }).join('');
  const legend=[['win','Win'],['top2','Top 2'],['high','High'],['safe','Safe'],['low','Low'],['btm','Btm'],['elim','Elim']].map(([c,l])=>`<span class="recap-legend-item"><i class="sq ${c}"></i>${l}</span>`).join('');
  const relList=tab==='rivals'?`<div class="card"><h3>Rivalries and alliances</h3>${(season.relationshipArcs||[]).length?`<ul class="tv-beats">${season.relationshipArcs.map(a=>`<li>${ic(a.type==='rival'?'flame':a.type==='ally'?'link':'dove',a.type==='rival'?'b-drama':a.type==='ally'?'b-bond':'b-moment')}<span><strong>${escapeHtml(recapName(a.a))}</strong> ${a.type==='rival'?'vs':a.type==='ally'?'&amp;':'— truce —'} <strong>${escapeHtml(recapName(a.b))}</strong> <span class="small">since episode ${escapeHtml(String(a.since))}</span></span></li>`).join('')}</ul>`:'<p class="small">No rivalries or alliances yet.</p>'}</div>`:'';

  const tvBlock=(id,title,inner)=>`<section class="tv-block" data-block="${id}"><h3 class="tv-bt">${title}</h3><div class="tv-bc">${inner}</div></section>`;
  const tabs=[['all','All'],['me','My queen'],['rivals','Rivalries']].map(([id,l])=>`<button class="ghost recap-tab${tab===id?' on':''}" data-recap-tab="${id}" aria-pressed="${tab===id}">${l}</button>`).join('');
  const lastEp=epNumbers.length?epNumbers[epNumbers.length-1]:0;
  setHTML(`<main class="layout${opts.summary?' tv-solo':''}"><section class="screen">
    <div class="hero tv-ep-title"><span class="eyebrow">${escapeHtml(String(season.format||'regular').replace(/_/g,' '))}${lastEp?` · after episode ${lastEp}`:''}</span><h2>Season recap</h2></div>
    <div class="recap-tabs" role="group" aria-label="Filter">${tabs}</div>
    ${relList}
    ${tvBlock('moments','Iconic moments',momentsHtml)}
    ${tvBlock('guide','Episode guide',guideHtml)}
    ${tvBlock('arcs','Arcs',`<div class="recap-legend">${legend}</div><div class="recap-arcs">${arcRows||'<p class="small">No queens to show.</p>'}</div>`)}
    <div class="tv-nav">${opts.finale?`<button id="recapBack" class="tv-next">Continue to the Grand Finale</button>`:`<button id="recapBack" class="secondary tv-back">${opts.summary?'Back to the results':'Back to the season'}</button>`}</div>
  </section>${opts.summary?'':queenSidebar()}</main>`);
  bindCommon(()=>showHistory(()=>renderSeasonRecap(opts)));
  document.querySelectorAll('[data-recap-tab]').forEach(b=>b.addEventListener('click',()=>renderSeasonRecap({...opts,tab:b.dataset.recapTab})));
  document.querySelector('#recapBack').addEventListener('click',()=>{
    if(opts.finale){gameState.season.recapAtFinaleSeen=true;saveGame();}
    routeAfterLoad();
  });
}
