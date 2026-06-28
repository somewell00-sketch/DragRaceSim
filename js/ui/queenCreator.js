const attrDefs=[['cunt','✨ CUNT'],['lipSync','🎤 Lip Sync'],['makeup','💄 Makeup'],['sewing','🪡 Sewing'],['runway','👠 Runway'],['acting','🎭 Acting']];
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
function renderQueenCreator(){
  const p=sortedPersonalities(), t=sortedQueenTypes();
  const defaultPersonality=(p.find(x=>x.id==='ambitious')||p[0]||{id:'ambitious'}).id;
  const castOptions=['random',8,9,10,11,12,13,14,15,16].map(n=>{
    if(n==='random')return `<option value="random" selected>Random cast size</option>`;
    return `<option value="${n}">${n} queens</option>`;
  }).join('');
  const typeOptions=t.map(x=>`<option value="${x.name}" ${x.name==='Jack of All Trades'?'selected':''}>${x.name}</option>`).join('');
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
            <span id="creatorPortrait" class="queen-portrait portrait-xl creator-portrait player-portrait" style="${creatorPreviewStyle('Jack of All Trades',defaultPersonality)}"></span>
            <span class="creator-portrait-crown">👑</span>
          </div>
          <div class="creator-fields">
            <label class="home-field home-name-field">Drag name<input id="qName" value="Granada Royale"></label>
            <div class="creator-select-row">
              <label class="home-field">Queen type<select id="qType">${typeOptions}</select></label>
              <label class="home-field">Personality<select id="qPersonality">${personalityOptions}</select></label>
            </div>
            <div class="creator-preview-copy"><strong id="creatorPreviewName">Granada Royale</strong><span id="creatorPreviewMeta">Ambitious • Jack of All Trades</span></div>
          </div>
        </section>

        <section class="home-attributes-panel card">
          <div class="attribute-intro">
            <div><span class="home-card-kicker">✨ Build</span><h2>Attributes</h2><p>Your queen type suggests a starting build. You can still edit every stat.</p></div>
            <div class="points-card"><span>Points</span><strong><span id="total">42</span> / 45</strong></div>
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
     startSeason(queen, document.querySelector('#castSize').value);
     renderEntrance();
   }catch(err){
     console.error(err);
     alert('Could not start the season. Check the browser console for details.');
     if(startBtn){startBtn.disabled=false; startBtn.textContent='👑 Start Season 👑';}
   }
 });
 document.querySelector('#continueSave').addEventListener('click',()=>{if(loadGame())routeAfterLoad();else alert('No save found.');});
 document.querySelector('#clearSave').addEventListener('click',()=>{clearSave(); alert('Save deleted.');});
 updateCreatorPreview();
 updateTotal();
}
function applyTypePreset(){const preset=getTypePreset(document.querySelector('#qType').value); document.querySelectorAll('[data-attr]').forEach(i=>{i.value=preset[i.dataset.attr]||7;}); updateTotal();}
function updateTotal(changedInput=null){let total=0; document.querySelectorAll('[data-attr]').forEach(i=>{total+=Number(i.value);}); if(total>45 && changedInput){const overflow=total-45; changedInput.value=Math.max(Number(changedInput.min),Number(changedInput.value)-overflow); total=0; document.querySelectorAll('[data-attr]').forEach(i=>{total+=Number(i.value);});}
 document.querySelectorAll('[data-attr]').forEach(i=>{document.querySelector(`[data-value="${i.dataset.attr}"]`).textContent=i.value;}); document.querySelector('#total').textContent=total; const warning=document.querySelector('#attrWarning'); if(warning)warning.textContent=total>45?'Lower your attributes to start.':'';}
