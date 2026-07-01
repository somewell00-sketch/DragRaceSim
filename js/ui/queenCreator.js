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
function renderQueenCreator(){
  const p=sortedPersonalities(), t=sortedQueenTypes();
  const defaultPersonality=p[Math.floor(Math.random()*p.length)].id;
  const randomType=t[Math.floor(Math.random()*t.length)].name;
  const formatOptions=[['regular','Regular Season',false],['legacy','All Stars — Lip Sync for Your Legacy',false],['assassin','All Stars — Lip Sync Assassin',false],['no_elimination','No Elimination (Coming Soon)',true],['tournament','Tournament Brackets',false]].map(([value,label,disabled])=>`<option value="${value}" ${disabled?'disabled':''}>${label}</option>`).join('');
  const castOptions=castOptionsForFormat('regular');
  const typeOptions=t.map(x=>`<option value="${x.name}" ${x.name===randomType?'selected':''}>${x.name}</option>`).join('');
  const personalityOptions=p.map(x=>`<option value="${x.id}" ${x.id===defaultPersonality?'selected':''}>${x.name}</option>`).join('');
  const attrHtml=attrDefs.map(([id,label])=>`<div class="stat-row home-stat-row"><span>${label}</span><input type="range" min="1" max="10" value="7" data-attr="${id}"><strong data-value="${id}">7</strong></div>`).join('');
  setHTML(`<main class="screen home-screen home-stage">
    <section class="home-topbar">
      <div class="home-logo-block">
        <span class="home-crown">👑</span>
        <div>
          <h1>Drag Race <span>Simulator</span></h1>
          <p>The crown is calling. Build your queen and enter the werkroom.</p>
        </div>
      </div>
      <div class="home-save-panel">
        <div class="home-actions">
          <button id="continueSave" class="secondary">💾 Continue save</button>
          <button id="clearSave" class="ghost">🗑️ Delete save</button>
        </div>
        <p class="home-server-note">ⓘ This version works by opening index.html directly or through a local server.</p>
      </div>
    </section>

    <section class="home-console">
      <aside class="home-steps">
        <article class="home-step-card active">
          <span class="step-number">01</span>
          <div><h2>Setup Season</h2><p>Choose the cast size, or let production surprise you.</p></div>
          <label class="home-field">Season format<select id="seasonFormat">${formatOptions}</select></label>
          <label class="home-field">Cast size<select id="castSize">${castOptions}</select></label>
        </article>
        <article class="home-step-card">
          <span class="step-number">02</span>
          <div><h2>Create Your Queen</h2><p>Name, type and personality. This is who you are.</p></div>
        </article>
        <article class="home-step-card">
          <span class="step-number">03</span>
          <div><h2>Attributes</h2><p>Distribute your points and define your strengths.</p></div>
        </article>
      </aside>

      <div class="home-main-panel">
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
            <div class="points-card"><span>Points</span><strong class="points-total"><span id="total">42</span><span class="points-max">/ 45</span></strong></div>
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
 document.querySelector('#seasonFormat')?.addEventListener('change',updateCastSizeOptionsForFormat);
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
   try{
     if(startBtn){startBtn.disabled=true; startBtn.textContent='Preparing cast...';}
     if(typeof ensureNamePartsLoaded==='function')await ensureNamePartsLoaded();
     const queen=createQueenFromForm({name:document.querySelector('#qName').value.trim(),type:document.querySelector('#qType').value,personalityId:document.querySelector('#qPersonality').value,attributes});
    saveCommunityQueen(queen).catch(console.warn);
     startSeason(queen, document.querySelector('#castSize').value, document.querySelector('#seasonFormat')?.value || 'regular');
     renderEntrance();
   }catch(err){
     console.error(err);
     alert('Could not start the season. Check the browser console for details.');
     if(startBtn){startBtn.disabled=false; startBtn.textContent='👑 Start Season 👑';}
   }
 });
 document.querySelector('#continueSave').addEventListener('click',()=>{if(loadGame())routeAfterLoad();else alert('No save found.');});
 document.querySelector('#clearSave').addEventListener('click',()=>{clearSave(); alert('Save deleted.');});
 applyTypePreset();
 updateCreatorPreview();
 updateTotal();
 rollCreatorQueenName();
}
function applyTypePreset(){const preset=getTypePreset(document.querySelector('#qType').value); document.querySelectorAll('[data-attr]').forEach(i=>{i.value=preset[i.dataset.attr]||7;}); updateTotal();}
function updateTotal(changedInput=null){let total=0; document.querySelectorAll('[data-attr]').forEach(i=>{total+=Number(i.value);}); if(total>45 && changedInput){const overflow=total-45; changedInput.value=Math.max(Number(changedInput.min),Number(changedInput.value)-overflow); total=0; document.querySelectorAll('[data-attr]').forEach(i=>{total+=Number(i.value);});}
 document.querySelectorAll('[data-attr]').forEach(i=>{document.querySelector(`[data-value="${i.dataset.attr}"]`).textContent=i.value;}); document.querySelector('#total').textContent=total; const warning=document.querySelector('#attrWarning'); if(warning)warning.textContent=total>45?'Lower your attributes to start.':'';}
