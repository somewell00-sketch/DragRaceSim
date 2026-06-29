function entrancePersonalityLabel(q){
  const raw=q?.personalityId || q?.personality || '';
  const id=String(raw||'').toLowerCase();
  const profile=(gameState.data?.personalities||[]).find(p=>String(p.id||'').toLowerCase()===id || String(p.name||'').toLowerCase()===id);
  if(profile?.name) return profile.name;
  if(!raw) return 'Personality';
  return String(raw).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}
function entranceLine(q){
  const lines=[
    `Hope the werkroom has insurance, because ${q.name} just arrived.`,
    `New season, new mug, same delusion.`,
    `The crown called. I picked up.`,
    `I came to serve face, body, and a little emotional damage.`,
    `Some queens enter. I make an entrance.`,
    `Category is: fresh meat with expensive taste.`,
    `If confidence is a crime, book me, baby.`,
    `I didn't come this far to be background glitter.`
  ];
  return sample(lines);
}

function renderEntrance(){
  const prem=gameState.season?.premiere;
  const entranceIds=typeof currentPremiereEntranceIds==='function'?currentPremiereEntranceIds():null;
  const entranceQueens=entranceIds?gameState.queens.filter(q=>entranceIds.includes(q.id)):gameState.queens;
  const partLabel=entranceIds?`Premiere Part ${(prem?.phase||0)+1} Entrance`:'Entrance';
  const partText=entranceIds
    ? `Only this half of the cast enters the workroom. The other group has not arrived yet.`
    : `The queens enter the workroom one by one. First impressions are already becoming friendships, tension, and shade.`;
  gameState.season.status='playing';
  saveGame();
  setHTML(`<main class="screen"><section class="hero entrance-hero"><p class="eyebrow">The queens are entering</p><h2>${escapeHtml(partLabel)}</h2><p>${escapeHtml(partText)}</p></section><section class="grid entrance-grid">${entranceQueens.map(q=>`<article class="card entrance-card"><div class="entrance-head">${queenPortraitHtml(q,'lg')}<div class="entrance-copy"><h3>${queenDisplayName(q)}</h3><p>${queenPersonaTypeHtml(q)}</p></div></div><p class="entrance-quote">“${entranceLine(q)}”</p></article>`).join('')}</section><button id="firstEpisode">Start ${escapeHtml(entranceIds?`Premiere Part ${(prem?.phase||0)+1}`:'Episode 1')}</button></main>`);
  document.querySelector('#firstEpisode').addEventListener('click',()=>{generateEpisode(); renderWorkroom();});
}
