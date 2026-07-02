const attrDefs=[['cunt','✨ C.U.N.T'],['lipSync','🎤 Lip Sync'],['makeup','💄 Beauty'],['sewing','🪡 Sewing'],['runway','👠 Runway'],['acting','🎭 Performance']];
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
}

function castOptionsForFormat(format='regular'){
  const allowed=(typeof getAllowedCastSizes==='function'?getAllowedCastSizes(format):[8,9,10,11,12,13,14,15,16]);
  const randomAllowed=!['brackets','tournament'].includes(format);
  return `${randomAllowed?'<option value="random" selected>Random cast size</option>':''}${allowed.map((n,i)=>`<option value="${n}" ${!randomAllowed&&i===0?'selected':''}>${n} queens</option>`).join('')}`;
}
function updateCastSizeOptionsForFormat(){
  const format=document.querySelector('#seasonFormat')?.value || 'regular';
  const select=document.querySelector('#castSize');
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
    const userLocationPromise=typeof detectUserCommunityLocation==='function'
      ? detectUserCommunityLocation().then(value=>{window.currentUserCommunityLocation=value;return value;}).catch(()=>null)
      : Promise.resolve(null);
    if(LOCAL_COMMUNITY_QUEEN_FILTERS.location===true){
      location=await userLocationPromise;
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
  return `<section class="invite-hero-logo" aria-label="Drag Race Simulator">
      <div class="invite-logo-mark">👑</div>
      <div class="invite-logo-type">
        <h1>Drag Race</h1>
        <span>Simulator</span>
      </div>
      <i class="invite-sparkle left">✦</i>
      <i class="invite-sparkle right">✦</i>
    </section>`;
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
  panel.hidden=true;
  if(typeof loadEligibleCommunityQueens!=='function')return;
  try{
    creatorCommunityQueens=await loadEligibleCommunityQueens({limit:250,days:LOCAL_COMMUNITY_QUEEN_FILTERS.days,location:LOCAL_COMMUNITY_QUEEN_FILTERS.location});
    creatorCommunityQueens.sort((a,b)=>String(a?.name||'').localeCompare(String(b?.name||''),undefined,{sensitivity:'base'}));
    if(!creatorCommunityQueens.length)return;
    const updateSearchResults = () => {
  const query = input.value.trim().toLowerCase();

  if (query.length < 2) {
    datalist.innerHTML = '';
    input.dataset.selectedIndex = '';
    startBtn.hidden = true;
    return;
  }
const matches = creatorCommunityQueens
  .map((row,index)=>({row,index}))
  .filter(item =>
    String(item.row?.name || '').toLowerCase().includes(query)
  )
  .slice(0,20);


  datalist.innerHTML = matches
    .map(item =>
      `<option value="${communityQueenInviteLabel(item.row,item.index)}"></option>`
    )
    .join('');
};
    panel.hidden=false;
    const syncSelection=()=>{
      const typed=input.value.trim();
      const selectedIndex=creatorCommunityQueens.findIndex((row,index)=>communityQueenSearchValue(row,index)===typed);
      input.dataset.selectedIndex=selectedIndex>=0?String(selectedIndex):'';
      startBtn.hidden=selectedIndex<0;
      panel.classList.toggle('has-selection',selectedIndex>=0);
    };
input.addEventListener('input',()=>{
  updateSearchResults();
  syncSelection();
});
    input.addEventListener('change',syncSelection);
  }catch(err){
    console.warn('Could not load community queens for the invitation screen:',err);
    panel.hidden=true;
  }
}

function renderSeasonInvitation(){
  const seasonFormats=(typeof SEASON_FORMATS!=='undefined' && Array.isArray(SEASON_FORMATS)) ? SEASON_FORMATS : [
    {id:'regular',name:'Regular Season'},
    {id:'legacy',name:'Lip Sync for the Crown / Legacy'},
    {id:'assassin',name:'Lip Sync Assassin'},
    {id:'brackets',name:'Lip Sync Tournament'}
  ];
  const formatOptions=seasonFormats.map(format=>`<option value="${format.id}" ${format.id==='regular'?'selected':''}>${format.name}</option>`).join('');
  const castOptions=castOptionsForFormat('regular');
  setHTML(`<main class="screen home-screen invitation-screen-v2">
    ${seasonInviteHeaderCopy()}

    <section class="invite-letter-card">
      <div class="invite-letter-rule"><span>✦</span></div>
      <h2>Hello, hello, hello! 👋✨</h2>
      <p>A new season is about to begin. Create your queen from scratch or step into the werkroom ready to compete. <br>Racers, start your engines... 👇</p>
      <div class="invite-letter-rule"><span>✦</span></div>
    </section>

    <section class="invite-dashboard">
      <aside class="invite-action-card invite-setup-card">
        <div class="invite-card-icon">🗓️</div>
        <h2>Season Setup</h2>
        <div class="invite-mini-rule"><span>✦</span></div>
        <label class="home-field">Season format<select id="inviteSeasonFormat">${formatOptions}</select></label>
        <label class="home-field">Cast size<select id="inviteCastSize">${castOptions}</select></label>
      </aside>

      <section class="invite-action-card invite-create-card-v2">
        <div class="invite-card-icon">♕</div>
        <h2>Create a<br>new queen</h2>
        <div class="invite-mini-rule"><span>✦</span></div>
        <button id="inviteCreateQueen" class="invite-arrow-btn" aria-label="Create a new queen">→</button>
      </section>

      <section id="inviteExistingQueenPanel" class="invite-action-card invite-existing-card-v2" hidden>
        <div class="invite-card-icon">♙</div>
        <h2>Use an<br>existing queen</h2>
        <div class="invite-mini-rule"><span>✦</span></div>
        <label class="invite-search-box" aria-label="Queen search">
          <input id="inviteCommunityQueenSearch" list="inviteCommunityQueenList" placeholder="Type a queen name..." autocomplete="off">
          <span>⌕</span>
          <datalist id="inviteCommunityQueenList"></datalist>
        </label>
        <button id="inviteStartSeason" class="invite-arrow-btn invite-start-btn" aria-label="Start season" hidden>→</button>
      </section>
    </section>
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
      startBtn.textContent='→';
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
  setHTML(`<main class="screen home-screen home-stage">
    <section class="home-topbar creator-topbar">
      <div class="home-logo-block">
        <span class="home-crown">👑</span>
        <div>
          <h1>Drag Race <span>Simulator</span></h1>
          <p>The crown is calling. Build your queen and enter the werkroom.</p>
        </div>
      </div>
    </section>

    <section class="home-console creator-only-console">
      <div class="home-main-panel creator-only-panel">
        <section class="home-queen-panel card">
          <div class="creator-portrait-wrap">
            <span id="creatorPortrait" class="queen-portrait portrait-xl creator-portrait player-portrait" style="${creatorPreviewStyle(randomType,defaultPersonality)}"></span>
            <span class="creator-portrait-crown">👑</span>
          </div>
          <div class="creator-fields">
            <label class="home-field home-name-field"><span>Drag name</span><div class="creator-name-row"><input id="qName" value="Your Queen"> <button id="rerollQueenName" class="creator-dice-btn" type="button" title="Random name" aria-label="Random name">🎲</button></div></label>
            <div class="creator-select-row">
              <label class="home-field">Queen type<select id="qType">${typeOptions}</select></label>
              <label class="home-field">Personality<select id="qPersonality">${personalityOptions}</select></label>
            </div>
            <div class="creator-preview-copy"><strong id="creatorPreviewName">Your Queen</strong><span id="creatorPreviewMeta">Ambitious • Jack of All Trades</span></div>
          </div>
        </section>

        <section class="home-attributes-panel card">
          <div class="attribute-intro">
            <div><span class="home-card-kicker">✨ Build</span><h2>Attributes</h2><p>Your queen type suggests a starting build. You can still edit every stat.</p></div>
            <div class="points-card"><span>Points</span><strong class="points-total"><span id="total">42</span><span class="points-max">/ 45</span></strong><small class="points-min">30 minimum</small></div>
          </div>
          <div id="stats" class="home-stats">${attrHtml}</div>
        </section>
      </div>
    </section>

    <section class="home-start-panel">
      <p id="attrWarning" class="notice home-warning"></p>
      <button id="startSeason">👑 Start Season 👑</button>
      <p>The werkroom is waiting.</p>
    </section>
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
     const userLocation = typeof detectUserCommunityLocation === 'function' ? await detectUserCommunityLocation() : 'Unknown City, XXX';
     window.currentUserCommunityLocation = userLocation;
     const queen=createQueenFromForm({name:document.querySelector('#qName').value.trim(),type:document.querySelector('#qType').value,personalityId:document.querySelector('#qPersonality').value,attributes,location:userLocation});
if(typeof saveCommunityQueen === 'function'){
  saveCommunityQueen(queen).catch(console.warn);
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
     if(startBtn){startBtn.disabled=false; startBtn.textContent='👑 Start Season 👑';}
   }
 });
 applyTypePreset();
 updateCreatorPreview();
 updateTotal();
 rollCreatorQueenName();
}
function applyTypePreset(){const preset=getTypePreset(document.querySelector('#qType').value); document.querySelectorAll('[data-attr]').forEach(i=>{i.value=preset[i.dataset.attr]||7;}); updateTotal();}
function updateTotal(changedInput=null){let total=0; document.querySelectorAll('[data-attr]').forEach(i=>{total+=Number(i.value);}); if(total>45 && changedInput){const overflow=total-45; changedInput.value=Math.max(Number(changedInput.min),Number(changedInput.value)-overflow); total=0; document.querySelectorAll('[data-attr]').forEach(i=>{total+=Number(i.value);});}
 document.querySelectorAll('[data-attr]').forEach(i=>{document.querySelector(`[data-value="${i.dataset.attr}"]`).textContent=i.value;}); document.querySelector('#total').textContent=total; const warning=document.querySelector('#attrWarning'); if(warning){ if(total<30)warning.textContent='Raise your attributes to at least 30 points.'; else if(total>45)warning.textContent='Lower your attributes to start.'; else warning.textContent='';}}
