const attrDefs=[['cunt','C.U.N.T'],['lipSync','Lip Sync'],['makeup','Beauty'],['sewing','Sewing'],['runway','Runway'],['acting','Performance']];
function getTypePreset(typeName){
  const type=gameState.data.queenTypes.find(t=>t.name===typeName);
  return type?.attributes || gameState.data.queenTypes.find(t=>t.name==='Jack of All Trades')?.attributes || {cunt:7,lipSync:7,makeup:7,sewing:7,runway:7,acting:7};
}
function sortedQueenTypes(){
  const types=[...(gameState.data.queenTypes||[])];
  const defaultType=types.find(t=>t.name==='Jack of All Trades');
  const rest=types.filter(t=>t.name!=='Jack of All Trades').sort((a,b)=>a.name.localeCompare(b.name));
  return defaultType?[defaultType,...rest]:rest;
}
function sortedPersonalities(){
  return [...(gameState.data.personalities||[])].sort((a,b)=>a.name.localeCompare(b.name));
}
function creatorPreviewStyle(typeName, personalityId){
  const fake={type:typeName, personalityId:personalityId};
  return `background:linear-gradient(135deg, ${typeColor(fake)} 0%, ${typeColor(fake)} 48%, ${personalityColor(fake)} 52%, ${personalityColor(fake)} 100%)`;
}

async function rollCreatorQueenName(){
  const input=document.querySelector('#qName');
  if(!input)return;
  const current=input.value.trim();
  try{
    if(typeof ensureNamePartsLoaded==='function')await ensureNamePartsLoaded();
    if(typeof generatedQueenName==='function'){
      const usedNames=new Set(current?[current]:[]);
      input.value=generatedQueenName(Math.floor(Math.random()*9999)+1, usedNames);
    }
  }catch(err){
    console.warn('Could not generate a random queen name.',err);
  }
  updateCreatorPreview();
}

function updateCreatorPreview(){
  const type=document.querySelector('#qType')?.value || 'Jack of All Trades';
  const personalityId=document.querySelector('#qPersonality')?.value || 'ambitious';
  const name=document.querySelector('#qName')?.value.trim() || 'Your Queen';
  const preview=document.querySelector('#creatorPortrait');
  const nameOut=document.querySelector('#creatorPreviewName');
  const metaOut=document.querySelector('#creatorPreviewMeta');
  if(preview)preview.setAttribute('style',creatorPreviewStyle(type,personalityId));
  if(nameOut)nameOut.textContent=name;
  const p=(gameState.data.personalities||[]).find(x=>x.id===personalityId)?.name || personalityId;
  if(metaOut)metaOut.textContent=`${p} • ${type}`;
  // v31.6: say what the type and the personality actually do
  const explain=document.querySelector('#creatorExplain');
  if(explain){
    const t=(gameState.data.queenTypes||[]).find(x=>x.name===type);
    const per=(gameState.data.personalities||[]).find(x=>x.id===personalityId);
    const names={cunt:'C.U.N.T',lipSync:'Lip Sync',makeup:'Beauty',sewing:'Sewing',runway:'Runway',acting:'Performance'};
    const top=Object.entries(t?.attributes||{}).sort((a,b)=>b[1]-a[1]).slice(0,2).map(([k])=>names[k]||k);
    const hints=[];
    if((per?.productionBias||0)>=0.2)hints.push('production loves her drama');
    if((per?.productionBias||0)<=-0.2)hints.push('gets less screen time');
    if((per?.fanBias||0)>=0.2)hints.push('fans warm to her easily');
    if((per?.helpBias||0)>=0.3)hints.push('the cast tends to like her');
    if((per?.dramaBias||0)>=0.3||(per?.sabotageBias||0)>=0.2)hints.push('conflict follows her');
    if((per?.fanBias||0)<=-0.15)hints.push('fans take a while to warm up');
    if((per?.risk||0)>=8)hints.push('her performances swing more');
    else if((per?.risk||0)<=2.5)hints.push('she is steady and consistent');
    explain.innerHTML=`<strong>${escapeHtml(type)}:</strong> ${escapeHtml(t?.description||'')}${top.length?` Starts strongest in ${escapeHtml(top.join(' and '))}.`:''}<br><strong>${escapeHtml(per?.name||p)}:</strong> ${escapeHtml(per?.description||'')}${hints.length?` In the game, ${escapeHtml(hints.join(', '))}.`:''}`;
  }
}

function castOptionsForFormat(format='regular'){
  const allowed=(typeof getAllowedCastSizes==='function'?getAllowedCastSizes(format):[8,9,10,11,12,13,14,15,16]);
  const randomAllowed=!['brackets','tournament','all_winners'].includes(format);
  return `${randomAllowed?'<option value="random" selected>Random cast size</option>':''}${allowed.map((n,i)=>`<option value="${n}" ${!randomAllowed&&i===0?'selected':''}>${n} queens</option>`).join('')}`;
}
function updateCastSizeOptionsForFormat(){
  const format=document.querySelector('#seasonFormat')?.value || document.querySelector('#inviteSeasonFormat')?.value || 'regular';
  const select=document.querySelector('#castSize') || document.querySelector('#inviteCastSize');
  if(select)select.innerHTML=castOptionsForFormat(format);
}

const LOCAL_COMMUNITY_QUEEN_FILTERS = { days: null, location: null }; // Ready for future 30-day/location filtering.
let creatorCommunityQueens = [];

function communityQueenAttrValue(row, attr){
  const map={lipSync:'lip_sync',runway:'runway'};
  const key=map[attr]||attr;
  const fallback=attr==='runway' ? row?.design : undefined;
  return Number(row?.[key] ?? fallback ?? 7) || 7;
}

function prefillCreatorFromCommunityQueen(row){
  if(!row)return;
  const name=document.querySelector('#qName');
  const type=document.querySelector('#qType');
  const personality=document.querySelector('#qPersonality');
  if(name)name.value=String(row.name||'').trim();
  if(type){
    const rowType=row.drag_type || row.type || 'Jack of All Trades';
    if([...type.options].some(option=>option.value===rowType))type.value=rowType;
  }
  if(personality){
    const rowPersonality=row.personality || row.personalityId || 'confident';
    if([...personality.options].some(option=>option.value===rowPersonality))personality.value=rowPersonality;
  }
  document.querySelectorAll('[data-attr]').forEach(input=>{
    input.value=Math.max(Number(input.min)||1,Math.min(Number(input.max)||10,communityQueenAttrValue(row,input.dataset.attr)));
  });
  updateCreatorPreview();
  updateTotal();
}

function localCommunityQueenOptionLabel(row,index){
  const name=String(row?.name||`Community Queen ${index+1}`).trim()||`Community Queen ${index+1}`;
  return typeof escapeHtml==='function' ? escapeHtml(name) : name.replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}

async function initLocalCommunityQueenSelect(){
  const section=document.querySelector('#localCommunityQueenSection');
  const select=document.querySelector('#localCommunityQueenSelect');
  if(!section||!select)return;
  section.hidden=true;
  if(typeof loadEligibleCommunityQueens!=='function')return;
  try{
    let location=null;
    // Privacy fix: no automatic location lookup here. Location filtering (if ever
    // enabled) uses the hometown the player typed in the creator.
    if(LOCAL_COMMUNITY_QUEEN_FILTERS.location===true){
      location=document.querySelector('#qLocation')?.value?.trim()||null;
    }
    creatorCommunityQueens=await loadEligibleCommunityQueens({
      limit:100,
      days:LOCAL_COMMUNITY_QUEEN_FILTERS.days,
      location:location || LOCAL_COMMUNITY_QUEEN_FILTERS.location
    });
    if(!creatorCommunityQueens.length)return;
    select.innerHTML=`<option value="">Create a new one</option>${creatorCommunityQueens.map((row,index)=>`<option value="${index}">${localCommunityQueenOptionLabel(row,index)}</option>`).join('')}`;
    section.hidden=false;
  }catch(err){
    console.warn('Could not initialize local community queen selection:',err);
    section.hidden=true;
  }
}

function seasonInviteHeaderCopy(){
  return `<section class="invite-hero-logo" aria-label="Drag Race Full Fantasy">
      <div class="invite-logo-mark">👑</div>
      <div class="invite-logo-type">
        <h1>Drag Race</h1>
        <span>Full Fantasy</span>
      </div>
      <i class="invite-sparkle left">✦</i>
      <i class="invite-sparkle right">✦</i>
    </section> <p>Step into the werkroom and live your complete drag superstar fantasy.</p>`;
}

function communityQueenInviteLabel(row,index){
  const name=String(row?.name||`Community Queen ${index+1}`).trim()||`Community Queen ${index+1}`;
  const location=String(row?.location||row?.country||'').trim();
  const label=location ? `${name} — ${location}` : name;
  return typeof escapeHtml==='function' ? escapeHtml(label) : label.replace(/[&<>\"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
}
function communityQueenSearchValue(row,index){
  const name=String(row?.name||`Community Queen ${index+1}`).trim()||`Community Queen ${index+1}`;
  const location=String(row?.location||row?.country||'').trim();
  return location ? `${name} — ${location}` : name;
}

async function initSeasonInvitationQueens(){
  const panel=document.querySelector('#inviteExistingQueenPanel');
  const input=document.querySelector('#inviteCommunityQueenSearch');
  const datalist=document.querySelector('#inviteCommunityQueenList');
  const startBtn=document.querySelector('#inviteStartSeason');
  if(!panel||!input||!datalist||!startBtn)return;

  // Show the card immediately. The database is only loaded once the user searches.
  panel.hidden=false;
  input.dataset.selectedIndex='';
  input.dataset.loaded='false';
  startBtn.hidden=true;

  if(typeof loadEligibleCommunityQueens!=='function'){
    input.placeholder='Queen search unavailable';
    input.disabled=true;
    return;
  }

  let loadPromise=null;
  const loadQueensForSearch=async()=>{
    if(input.dataset.loaded==='true')return creatorCommunityQueens;
    if(loadPromise)return loadPromise;
    const previousPlaceholder=input.placeholder;
    input.placeholder='Loading queens...';
    loadPromise=loadEligibleCommunityQueens({
      limit:250,
      days:LOCAL_COMMUNITY_QUEEN_FILTERS.days,
      location:LOCAL_COMMUNITY_QUEEN_FILTERS.location
    }).then(rows=>{
      creatorCommunityQueens=[...(rows||[])].sort((a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),undefined,{sensitivity:'base'}));
      input.dataset.loaded='true';
      input.placeholder=creatorCommunityQueens.length ? previousPlaceholder : 'No community queens found';
      return creatorCommunityQueens;
    }).catch(err=>{
      console.warn('Could not load community queens for the invitation search:',err);
      input.placeholder='Could not load queens';
      return [];
    }).finally(()=>{
      loadPromise=null;
    });
    return loadPromise;
  };

  const updateSearchResults=()=>{
    const query=input.value.trim().toLowerCase();
    if(query.length<2){
      datalist.innerHTML='';
      input.dataset.selectedIndex='';
      startBtn.hidden=true;
      panel.classList.remove('has-selection');
      return;
    }
    const matches=creatorCommunityQueens
      .map((row,index)=>({row,index}))
      .filter(item=>String(item.row?.name||'').toLowerCase().includes(query))
      .slice(0,20);
    datalist.innerHTML=matches
      .map(item=>`<option value="${communityQueenInviteLabel(item.row,item.index)}"></option>`)
      .join('');
  };

  const syncSelection=()=>{
    const typed=input.value.trim();
    const selectedIndex=creatorCommunityQueens.findIndex((row,index)=>communityQueenSearchValue(row,index)===typed);
    input.dataset.selectedIndex=selectedIndex>=0?String(selectedIndex):'';
    startBtn.hidden=selectedIndex<0;
    panel.classList.toggle('has-selection',selectedIndex>=0);
  };

  input.addEventListener('input',async()=>{
    const query=input.value.trim();
    if(query.length>=2 && input.dataset.loaded!=='true')await loadQueensForSearch();
    updateSearchResults();
    syncSelection();
  });
  input.addEventListener('focus',()=>{
    if(input.value.trim().length>=2 && input.dataset.loaded!=='true'){
      loadQueensForSearch().then(()=>{updateSearchResults();syncSelection();});
    }
  });
  input.addEventListener('change',syncSelection);
}

function renderSeasonInvitation(){
  const seasonFormats=(typeof SEASON_FORMATS!=='undefined' && Array.isArray(SEASON_FORMATS)) ? SEASON_FORMATS : [
    {id:'regular',name:'Regular Season'},
    {id:'legacy',name:'Lip Sync Legacy'},
    {id:'assassin',name:'Lip Sync Assassin'},
    {id:'brackets',name:'Bracket Tournament'},
  ];
  const formatOptions=seasonFormats.map(format=>`<option value="${format.id}" ${format.id==='regular'?'selected':''}>${format.name}</option>`).join('');
  const castOptions=castOptionsForFormat('regular');
  const tvb=(id,title,inner)=>`<section class="tv-block" data-block="${id}"><h3 class="tv-bt">${title}</h3><div class="tv-bc">${inner}</div></section>`;
  setHTML(`<main class="screen tv-home">
    <header class="tv-home-head"><h1 class="tv-logo">Drag Race<span>Full Fantasy</span></h1><p class="tv-lede">Hello, hello, hello! A new season is about to begin. Create your queen from scratch or bring one the community already made.</p></header>
    ${tvb('season','Season',`<div class="tv-two"><label class="home-field">Season format<select id="inviteSeasonFormat">${formatOptions}</select></label><label class="home-field">Cast size<select id="inviteCastSize">${castOptions}</select></label></div>`)}
    ${tvb('queen','Your queen',`
      <div class="tv-callout tv-callout-row"><strong>Create a new queen</strong><span class="small">Name, type, personality and stats.</span><div class="tv-nav"><button id="inviteCreateQueen" class="tv-next">Create your queen</button></div></div>
      <section id="inviteExistingQueenPanel" class="tv-callout" hidden><strong>Use an existing queen</strong><span class="small">Pick a queen another player shared with the community.</span>
        <label class="invite-search-box tv-search" aria-label="Queen search"><input id="inviteCommunityQueenSearch" list="inviteCommunityQueenList" placeholder="Type a queen name..." autocomplete="off"><datalist id="inviteCommunityQueenList"></datalist></label>
        <div class="tv-nav"><button id="inviteStartSeason" class="tv-next" hidden>Start the season</button></div></section>`)}
  </main>`);
  document.querySelector('#inviteSeasonFormat')?.addEventListener('change',()=>{
    const select=document.querySelector('#inviteCastSize');
    if(select)select.innerHTML=castOptionsForFormat(document.querySelector('#inviteSeasonFormat')?.value||'regular');
  });
  document.querySelector('#inviteCreateQueen')?.addEventListener('click',()=>{
    window.pendingSeasonSetup={
      format:document.querySelector('#inviteSeasonFormat')?.value || 'regular',
      castSize:document.querySelector('#inviteCastSize')?.value || 'random'
    };
    renderQueenCreator();
  });
  document.querySelector('#inviteStartSeason')?.addEventListener('click',async()=>{
    const startBtn=document.querySelector('#inviteStartSeason');
    const input=document.querySelector('#inviteCommunityQueenSearch');
    const index=Number(input?.dataset?.selectedIndex);
    const row=creatorCommunityQueens[index];
    if(!row)return;
    try{
      startBtn.disabled=true;
      startBtn.textContent='…';
      if(typeof ensureNamePartsLoaded==='function')await ensureNamePartsLoaded();
      const queen=convertCommunityQueenToGameQueen(row,index);
      await startSeason(queen,document.querySelector('#inviteCastSize')?.value||'random',document.querySelector('#inviteSeasonFormat')?.value||'regular');
      renderEntrance();
    }catch(err){
      console.error(err);
      alert('Could not start the season. Check the browser console for details.');
      startBtn.disabled=false;
      startBtn.textContent='Start the season';
    }
  });
  initSeasonInvitationQueens();
}

function renderQueenCreator(){
  const p=sortedPersonalities(), t=sortedQueenTypes();
  const defaultPersonality=p[Math.floor(Math.random()*p.length)].id;
  const randomType=t[Math.floor(Math.random()*t.length)].name;
  const typeOptions=t.map(x=>`<option value="${x.name}" ${x.name===randomType?'selected':''}>${x.name}</option>`).join('');
  const personalityOptions=p.map(x=>`<option value="${x.id}" ${x.id===defaultPersonality?'selected':''}>${x.name}</option>`).join('');
  const attrHtml=attrDefs.map(([id,label])=>`<div class="stat-row home-stat-row"><span>${label}</span><input type="range" min="1" max="10" value="7" data-attr="${id}"><strong data-value="${id}">7</strong></div>`).join('');
  const tvb=(id,title,inner)=>`<section class="tv-block" data-block="${id}"><h3 class="tv-bt">${title}</h3><div class="tv-bc">${inner}</div></section>`;
  setHTML(`<main class="screen tv-home tv-creator">
    <header class="tv-home-head"><h1 class="tv-logo">Drag Race<span>Full Fantasy</span></h1><p class="tv-lede">The crown is calling. Build your queen and enter the werkroom.</p></header>
    ${tvb('identity','Identity',`
      <div class="tv-creator-id">
        <div class="creator-portrait-wrap"><span id="creatorPortrait" class="queen-portrait portrait-xl creator-portrait player-portrait" style="${creatorPreviewStyle(randomType,defaultPersonality)}"></span></div>
        <div class="creator-fields">
          <label class="home-field home-name-field"><span>Drag name</span><div class="creator-name-row"><input id="qName" value="Your Queen"> <button id="rerollQueenName" class="creator-dice-btn secondary" type="button" title="Random name" aria-label="Random name">${typeof icon==='function'?icon('dice'):''}</button></div></label>
          <div class="tv-two">
            <label class="home-field">Queen type<select id="qType">${typeOptions}</select></label>
            <label class="home-field">Personality<select id="qPersonality">${personalityOptions}</select></label>
          </div>
          <p id="creatorExplain" class="tv-explain"></p>
          <label class="home-field creator-location-field">Hometown <small>(optional)</small><input id="qLocation" maxlength="60" placeholder="City, Country" autocomplete="off"></label>
          <label class="creator-share-optin"><input type="checkbox" id="qShareCommunity"> <span><strong>Share my queen with the community</strong><small>Publishes her name, type, personality, stats and hometown so other players can cast her. Nothing is shared unless this is ticked.</small></span></label>
          <div class="creator-preview-copy" hidden><strong id="creatorPreviewName">Your Queen</strong><span id="creatorPreviewMeta">Ambitious • Jack of All Trades</span></div>
        </div>
      </div>`)}
    ${tvb('attributes','Attributes',`
      <div class="tv-points"><p class="small">Your queen type suggests a starting build. You can still edit every stat.</p><div class="points-card"><span>Points</span><strong class="points-total"><span id="total">42</span><span class="points-max">/ 45</span></strong><small class="points-min">30 minimum</small></div></div>
      <div id="stats" class="home-stats">${attrHtml}</div>`)}
    <p id="attrWarning" class="notice home-warning"></p>
    <div class="tv-nav"><button id="startSeason" class="tv-next">Start the season</button></div>
  </main>`);
 document.querySelector('#qType').addEventListener('change',()=>{applyTypePreset();updateCreatorPreview();});
 document.querySelector('#qPersonality').addEventListener('change',updateCreatorPreview);
 document.querySelector('#qName').addEventListener('input',updateCreatorPreview);
 document.querySelector('#rerollQueenName')?.addEventListener('click',rollCreatorQueenName);
 document.querySelectorAll('[data-attr]').forEach(input=>input.addEventListener('input',(e)=>updateTotal(e.target)));
 document.querySelector('#startSeason').addEventListener('click',async()=>{
   const startBtn=document.querySelector('#startSeason');
   const attributes={};
   document.querySelectorAll('[data-attr]').forEach(i=>attributes[i.dataset.attr]=Number(i.value));
   const total=Object.values(attributes).reduce((a,b)=>a+b,0);
   if(total>45){alert('Your attribute total cannot go above 45 points.'); return;}
   if(total<30){alert('Your attribute total must be at least 30 points.'); return;}
   try{
     if(startBtn){startBtn.disabled=true; startBtn.textContent='Preparing cast...';}
     if(typeof ensureNamePartsLoaded==='function')await ensureNamePartsLoaded();
     const typedLocation=(document.querySelector('#qLocation')?.value||'').trim().slice(0,60);
     const userLocation=typedLocation || '';
     window.currentUserCommunityLocation=userLocation;
     const shareOptIn=!!document.querySelector('#qShareCommunity')?.checked;
     if(typeof setCommunitySharePreference==='function')setCommunitySharePreference(shareOptIn);
     const queen=createQueenFromForm({name:document.querySelector('#qName').value.trim(),type:document.querySelector('#qType').value,personalityId:document.querySelector('#qPersonality').value,attributes,location:userLocation});
     queen.communityShareOptIn=shareOptIn;
     if(shareOptIn && typeof saveCommunityQueen==='function'){
       // Fire-and-forget: a slow or offline database must not block the season start.
       saveCommunityQueen(queen)
         .then(savedQueen=>{ if(savedQueen?.id){ queen.communityRowId=savedQueen.id; } })
         .catch(err=>console.warn('Could not save community queen:',err));
     }
     const setup=window.pendingSeasonSetup || {castSize:'random',format:'regular'};
     await startSeason(
  queen,
  setup.castSize || 'random',
  setup.format || 'regular'
);
     renderEntrance();
   }catch(err){
     console.error(err);
     alert('Could not start the season. Check the browser console for details.');
     if(startBtn){startBtn.disabled=false; startBtn.textContent='Start the season';}
   }
 });
 const shareBox=document.querySelector('#qShareCommunity');
 if(shareBox && typeof getCommunitySharePreference==='function')shareBox.checked=getCommunitySharePreference();
 const locationInput=document.querySelector('#qLocation');
 if(locationInput && typeof locationFromTimezone==='function'){
   // Coarse, editable suggestion from the time zone only (no GPS, no network call).
   const guess=locationFromTimezone();
   if(guess && !/unknown/i.test(guess))locationInput.value=guess;
 }
 applyTypePreset();
 updateCreatorPreview();
 updateTotal();
 rollCreatorQueenName();
}
function applyTypePreset(){const preset=getTypePreset(document.querySelector('#qType').value); document.querySelectorAll('[data-attr]').forEach(i=>{i.value=preset[i.dataset.attr]||7;}); updateTotal();}
function updateTotal(changedInput=null){let total=0; document.querySelectorAll('[data-attr]').forEach(i=>{total+=Number(i.value);}); if(total>45 && changedInput){const overflow=total-45; changedInput.value=Math.max(Number(changedInput.min),Number(changedInput.value)-overflow); total=0; document.querySelectorAll('[data-attr]').forEach(i=>{total+=Number(i.value);});}
 document.querySelectorAll('[data-attr]').forEach(i=>{document.querySelector(`[data-value="${i.dataset.attr}"]`).textContent=i.value; i.style.setProperty('--fill',((Number(i.value)-1)/9*100)+'%');}); document.querySelector('#total').textContent=total; const warning=document.querySelector('#attrWarning'); if(warning){ if(total<30)warning.textContent='Raise your attributes to at least 30 points.'; else if(total>45)warning.textContent='Lower your attributes to start.'; else warning.textContent='';}}
