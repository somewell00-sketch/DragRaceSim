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
    `I didn't come this far to be background glitter.`,
    `The other queens are cute. I'm the finale.`,
    `I'm not here to make friends. I'm here to make history.`,
    `Sorry, I'm late. I was busy being iconic.`,
    `Crown me now, or watch me take it later.`,
    `I don't compete. I dominate.`,
    `Some queens bring looks. I bring a legacy.`,
    `I'm the full package. Wrapped in couture.`,
    `I walk in, and suddenly the bar is higher.`,
    `I didn't come to play. I came to slay.`,
    `My only competition is the mirror. And I won.`,
    `I'm not a queen. I'm the whole monarchy.`,

    `I'd say 'don't hate me because I'm beautiful,' but hate me. It fuels me.`,
    `I'm not shady, I'm just better than you.`,
    `The werkroom just got 50% more cunt.`,
    `I don't have a type. But insecurity is cute on some of you.`,
    `New queen, who dis? Oh, the winner.`,
    `I'm not here to be liked. I'm here to be remembered.`,
    `My entrance is cute. My win will be cuter.`,
    `If you can't handle the heat, watch me burn the house down.`,
    `I'm like a fine wine. You'll hate me now, love me later.`,
    `I'm the queen your favorite queen is scared of.`,

    `Face: beat. Body: correct. Crown: future.`,
    `I don't do fashion. I do art.`,
    `They asked for looks. I brought an exhibition.`,
    `My mug is tea. My body is shade. My talent is all that.`,
    `I don't wear clothes. I wear statements.`,
    `You can't buy taste, but I was born with it.`,
    `My face is a masterpiece. My body is the gallery.`,
    `Makeup: on point. Confidence: off the charts.`,
    `I didn't just step out. I stepped out of a magazine.`,
    `Beauty is pain. And I look fabulous.`,

    `I watched every season. So I know exactly what not to do. And I'm doing it anyway.`,
    `You've seen winners. Now see the prophecy.`,
    `This isn't a race. It's a coronation.`,
    `I'm not here to be the next Drag Superstar. I'm here to be the last one.`,
    `The crown is mine. The other queens just haven't realized it yet.`,
    `I came to lipsync. For. The. Crown.`,
    `Every season has a villain. This season has a winner.`,
    `I'm not the queen everyone expected. I'm the one they deserve.`,
    `They said 'break a leg.' I'll break a few hearts instead.`,

    `I didn't come this far to come this far.`,
    `This isn't my first chapter. But it will be my best one.`,
    `I've been underestimated my whole life. Watch me exceed expectations.`,
    `Every queen has a story. Mine is legendary.`,
    `I'm not defined by my past. I'm defined by my crown.`,
    `Some queens perform. I transform.`,
    `I'm not afraid to fail. I'm afraid to never try.`,
    `The stage is my home. And I'm back to redecorate.`,
    `I'm what happens when talent meets confidence. And yes, it's lethal.`,
    `If you don't know me, you will. If you do, you're scared.`,
    `I'm not a drag queen. I'm a drag experience.`,
    `The other queens are jewelry. I'm the crown.`,
    `I'm the plot twist this season needed.`,
    `Queens come and go. I arrive and stay.`,
    `I'm not here to fill a spot. I'm here to fill a room.`,
    `My entrance is just the beginning. The ending? That's mine too.`,
    `I'm not competition. I'm destiny.`,
    `Some queens are born stars. I was born a supernova.`,
    `The werkroom is cute. It would be cuter with my name on the crown.`,
    `I'm the queen who turns looks, turns heads, and turns the page on your favorites.`,
    `Sup, bitches?`,
    `Hi, I'm the problem.`,
    `Crown me. Thanks.`,
    `You're welcome.`,
    `I'm here. Deal with it.`,
    `Boo! Did I scare you?`,
    `Yes. I know.`,
    `I'm that bitch.`,
    `And... scene.`,
    `Hi. Bye.`,
    `What? You expected less?`,
    `Ta-da!`,
    `Don't clap yet. Wait for the finale.`,
    `I'm the moment.`,
    `Run.`,
    `Surprise!`,
    `Hello, losers.`,
    `I'm here to win. Duh.`,
    `Oh, you're all still here?`,
      `I saw this in a dream.`,
    `My wig is nervous.`,
    `I'm not late. You're all just early.`,
    `I came, I saw, I conquered. Then I took a nap.`,
    `My entrance is better than your entire run.`,
    `I'm like a video game. Hard to beat.`,
    `Plot twist: I'm the winner.`,
    `I'm the main character. You're all extras.`,
    `I was born ready. You were born... there.`,
    `I brought snacks. And drama.`,
    `I'm not perfect. But I'm close.`,
    `My talent is existing. And I'm great at it.`,
    `I'm what happens when you say yes to everything.`,
    `I don't need an introduction. I need a crown.`,
    `My entrance is sponsored by confidence.`,
    `I'm here to replace your favorite.`,
    `I don't do drama. I am drama.`,
    `I'm the guest star of this season.`,
    `I'm the finale they didn't see coming.`,
    `I'm like a virus. Contagious and unstoppable.`,
    `The crown is mine. The other girls are just borrowing it.`,
    `I'm the one your mother warned you about.`,
    `I think my left eyelash just committed a crime.`,
    `I'm not a queen. I'm a whole circus.`,
    `My wig is sweating.`,
    `I spent more on this outfit than my rent. Worth it.`,
    `I'm not sure what I'm doing. But I look good doing it.`,
    `I'm like a potato. Ugly but versatile.`,
    `My shoes hurt. But my spirit is high.`,
    `I'm not drunk. I'm just confident.`,
    `My name is [q.name]. And I forgot what I was going to say.`,
    `I'm the queen of... wait, what was the question?`,
    `I'm like a pizza. Hot, cheesy, and everyone wants a slice.`,
    `My face is beat. My credit card is crying.`,
    `I don't have a backup plan. I have a crown.`,
    `I'm not shady. I'm just honest. There's a difference.`,
    `I'm like a butterfly. Beautiful, and I'll probably die in a week.`,
    `My talent is looking good. And I'm very talented.`,
    `I'm the queen of not being ready. But here I am.`,
    `I'm like a bad decision. You know you shouldn't, but you want to.`,
    `I don't know who I am. But I look good doing it.`,
    `My entrance is the best part of this season.`,
    `I'm not a queen. I'm a whole mood.`,
    `My confidence is bigger than my talent. And my talent is huge.`,
    `I'm like a firework. Bright, loud, and gone in 10 seconds.`,
    `I'm not competition. I'm content.`,
    `I'm the queen of doing the most and the least at the same time.`,
    `I walked in and the room got gayer.`,
    `I'm like a song. Catchy, repetitive, and stuck in your head.`,
    `My wardrobe is expensive. My personality is free.`,
    `I'm the queen of accidentally winning.`,
    `I don't know what I'm doing. But neither do you.`,
    `I'm like a refrigerator. Cold, but full of good stuff.`,
    `My face is beat. My life is not.`,
    `I'm the queen of being too much. And not enough. But mostly too much.`,
    `I came to slay. And I forgot my sword.`,
    `I'm like a donut. Sweet, round, and you'll regret eating me.`,
    `I don't have a catchphrase yet. But this is it.`,
    `I'm the queen of taking things way too seriously.`,
    `My entrance is a choice. And it's the right choice.`,
    `I'm like a cat. I'll ignore you until you need me.`,
    `I'm not here to make friends. I'm here to make enemies.`,
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
