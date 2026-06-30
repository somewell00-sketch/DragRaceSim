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


function entranceTournamentBracketClass(q){
  const b=gameState.season?.brackets;
  const group=q?.tournamentBracket || (b?.groups?Object.keys(b.groups).find(key=>(b.groups[key]||[]).includes(q.id)):null);
  return group?` tournament-bracket-${group}`:'';
}

function renderEntrance(){
  const prem=gameState.season?.premiere;
  const tournamentIds=typeof currentTournamentEntranceIds==='function'?currentTournamentEntranceIds():null;
  const premiereIds=typeof currentPremiereEntranceIds==='function'?currentPremiereEntranceIds():null;
  const entranceIds=tournamentIds||premiereIds;
  const entranceQueens=entranceIds?gameState.queens.filter(q=>entranceIds.includes(q.id)):gameState.queens;
  const b=gameState.season?.brackets;
  let partLabel='Entrance';
  let partText='The queens enter the workroom one by one. First impressions are already becoming friendships, tension, and shade.';
  let startLabel='Episode 1';
  if(tournamentIds && gameState.season.status==='tournament_entrance'){
    partLabel=`Bracket ${b?.currentGroup||'A'} Entrance`;
    partText='Only this bracket enters the workroom. The other brackets are waiting for their own premiere moment.';
    startLabel=`Bracket ${b?.currentGroup||'A'} Episode ${b?.groupEpisodeNumber||1}`;
  }else if(tournamentIds && gameState.season.status==='tournament_final_entrance'){
    partLabel='Winners Bracket Entrance';
    partText='The advancing queens return to the workroom together for the second stage of the competition.';
    startLabel='Start the second stage';
  }else if(premiereIds){
    partLabel=`Premiere Part ${(prem?.phase||0)+1} Entrance`;
    partText='Only this half of the cast enters the workroom. The other group has not arrived yet.';
    startLabel=`Premiere Part ${(prem?.phase||0)+1}`;
  }
  if(tournamentIds && typeof markTournamentEntranceSeen==='function')markTournamentEntranceSeen();
  else gameState.season.status='playing';
  saveGame();
  setHTML(`<main class="screen"><section class="hero entrance-hero"><p class="eyebrow">The queens are entering</p><h2>${escapeHtml(partLabel)}</h2><p>${escapeHtml(partText)}</p></section><section class="grid entrance-grid">${entranceQueens.map(q=>`<article class="card entrance-card${entranceTournamentBracketClass(q)}"><div class="entrance-head">${queenPortraitHtml(q,'lg')}<div class="entrance-copy"><h3>${queenDisplayName(q)}</h3><p>${queenPersonaTypeHtml(q)}</p></div></div><p class="entrance-quote">“${entranceLine(q)}”</p></article>`).join('')}</section><button id="firstEpisode">Start ${escapeHtml(startLabel)}</button></main>`);
  document.querySelector('#firstEpisode').addEventListener('click',()=>{generateEpisode(); renderWorkroom();});
}
