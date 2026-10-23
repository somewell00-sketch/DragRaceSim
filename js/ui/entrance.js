function entrancePersonalityLabel(q){
  const raw=q?.personalityId || q?.personality || '';
  const id=String(raw||'').toLowerCase();
  const profile=(gameState.data?.personalities||[]).find(p=>String(p.id||'').toLowerCase()===id || String(p.name||'').toLowerCase()===id);
  if(profile?.name) return profile.name;
  if(!raw) return 'Personality';
  return String(raw).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}

function entranceLine(q){
  // v31.5: the same lines as before, now grouped by tone. Shy, sweet and reserved queens no longer
  // walk in with "Sup, bitches?"; real queens' catchphrases are rare easter eggs.
  const neutralLines=[
    `Hope the werkroom has insurance, because ${q.name} just arrived.`,
    `New season, new mug, same delusion.`,
    `I watched every season. So I know exactly what not to do.`,
    `I brought snacks. And drama.`,
    `I walked in and the room got gayer.`,
    `Come on, simulator, let's get sickening!`,
    `Wait... did the user just run this script?`,
    `I feel like my whole life is just JSON data.`,
    `Is anyone else hearing the background music loop?`,
    `My code is glitching, I need a quick hotfix.`,
    `Are we just variables in someone's pet project?`,
    `I can literally feel the player hovering over the choice buttons.`
  ];
  const boldLines=[
    `I came to serve face, body, and a little emotional damage.`,
    `The other queens are cute. I'm the finale.`,
    `Sorry I'm late. I was busy being iconic.`,
    `New queen, who dis? Oh, the winner.`,
    `Every season has a villain. This season has a winner.`,
    `Sup, bitches?`,
    `Hi, I'm the problem.`,
    `Crown me. Thanks.`,
    `Don't clap yet. Wait for the finale.`,
    `I'm the moment.`,
    `Oh, you're all still here?`,
    `I'm not late. You're all just early.`,
    `Plot twist: I'm the winner.`,
    `If I'm too much, go find less.`,
    `Your fave could never. Actually, these girls could never even afford this.`
  ];
  const easterEggs=[
    `Hieee!`,
    `Not a soul can clock.`,
    `Hi, boys! I'm home!`,
    `Check your lipstick before you come for me.`,
    `Looook over there!`,
    `Give me my pocketbook, I'm leaving.`,
    `Gagging!`,
    `The check is cleared, bitches!`,
    `Keep it pushing, sis.`,
    `The queen of the party has arrived.`,
    `Is she beautiful? She's gorgeous.`,
    `Did somebody call for a professional?`,
    `The library is officially open.`,
    `Ding dang dong!`,
    `The body is beautiful.`,
    `Are you ready to rock?`
  ];
  const extra=gameState.data?.entranceLines||{};
  const persId=String(q?.personalityId || q?.personality || '').toLowerCase();
  const soft=/^(shy|reserved|humble|sweet|kind)$/.test(persId);
  if(Math.random()<(Number(extra.easterEggChance)||0.05))return sample(easterEggs);
  const lines=soft?[...neutralLines.filter(l=>!/\bdrama\b|too much/i.test(l)),...(extra.soft||[]),...(extra.byPersonality?.[persId]||[])]:[...neutralLines,...boldLines,...(extra.byPersonality?.[persId]||[])];

  const attrs = q?.attributes || {};
  const personality = String(q?.personalityId || q?.personality || '').toLowerCase();
  const type = String(q?.type || '').toLowerCase();
  
  let pool = [...lines];
  const attrPush = soft ? () => {} : (...xs) => pool.push(...xs);

  if ((attrs.cunt || 0) >= 9) {
    attrPush(
      `Crown me now, or watch me take it later.`,
      `I don't compete. I dominate.`,
      `Some queens are born stars. I was born a supernova.`,
      `I'm not just the main character. I'm the whole franchise.`,
      `You can take your heels off, girls. The top spot is officially taken.`,
      `I don't compete, babe. I dictate the pace of the game.`,
      `How do you girls handle rejection? Because this is going to hurt.`,
      `I am the main event. You're just the smoke from the stage effect.`,
      `Don't look at me like that, I know I'm completely irresistible.`,
      `The world revolves around me, and this studio is no exception.`,
      `If I were you, I'd start filling out the application for next season.`,
      `I don't follow rules, I'm the reason they have to write them.`,
      `First place is officially taken.`,
      `Rules? I am the rulebook, darling.`,
      `Brace yourselves. I come in waves.`,
      `I am the main event. Period.`,
      `Irresistible, right? I know.`,
      `Start filling out the next season app.`,
      `I don't follow rules. I make them.`,
      `Bow down. Or don't, I'll still win.`
    );
  }


  if ((attrs.runway || 0) >= 8 || (attrs.makeup || 0) >= 8) {
    attrPush(
      `Face: beat. Body: correct. Crown: future.`,
      `I don't do fashion. I do art.`,
      `They asked for looks. I brought an exhibition.`,
      `My mug is tea. My body is shade. My talent is all that.`,
      `I don't wear clothes. I wear statements.`,
      `My outfit cost more than your entire wardrobe. And I'm not even done.`,
      `I walked in and the runway got nervous.`,
      `My heels are higher than your expectations.`,
      `Designers don't dress me. I dress them.`,
      `I look like money. And I sound like a winner.`,
      `This look? You'd need an expensive filter just to copy it.`,
      `The tailoring is so flawless it probably hurts your feelings.`,
      `Straight from high fashion down to this factory floor.`,
      `If my outfit could talk, it would tell you to go change.`,
      `Serving exactly what you try—and cry about—in the dressing room.`,
      `The visual impact is heavy, I know. Just take a deep breath.`,
      `Every inch of this skin cost more than your entire backstory.`,
      `Don't touch. The fabric is exclusive and the mug is sacred.`,
      `This look? Custom.`,
      `Flawless. Next question?`,
      `Look, but don't touch.`,
      `High fashion just entered the room.`,
      `Take a picture, it lasts longer.`,
      `Serving exactly what you can't.`,
      `The lighting guy just quit. He can't top me.`,
      `Don't touch, it's art!`,
      `The fabric is exclusive. The mug is sacred.`,
      `My style stats are so high they broke the integer limit.`,
      `I'm not just a queen, I'm an optimized dataset.`,
      `The description text for my look is absolute poetry.`,
      `My aesthetic variables are perfectly tuned.`
    );
  }

  if ((attrs.acting || 0) >= 9) {
    attrPush(
      `Every queen has a story. Mine is legendary.`,
      `Some queens perform. I transform.`,
      `The stage is my home. And I'm back to redecorate.`,
      `I'm not playing a character. I am the character.`,
      `The cameras love me. And I love them back.`,
      `I didn't come to fill a role. I came to rewrite the whole damn script.`,
      `I'm the plot twist this season needed.`,
      `Queens come and go. I arrive and stay.`,
      `I'm not here to fill a spot. I'm here to fill a room.`,
      `Cut to me!`,
      `The protagonist has arrived.`,
      `Hold your reactions for camera one.`,
      `Cue the applause.`,
      `I don't do side-character energy.`,
      `The star is here. Clear the set.`,
      `Drama? I invented it.`,
      `And... action!`,
      `Places, everyone.`,
      `Roll camera. The lead has arrived.`,
      `Somebody get my good side. Both of them.`,
      `The script was getting a bit dry. I'm here to rewrite it.`,
      `I love the background extras they cast this year. Very realistic.`
    );
  }

  if ((attrs.lipSync || 0) >= 9) {
    attrPush(
      `Tips in the garter, girls! Let's go!`,
      `Music up, egos down!`,
      `Clear the floor, the headliner is here.`,
      `Who's ready for the night shift?`,
      `Don't let me catch any of you in the bottom.`,
      `You girls look like you're waiting for a slow ballad.`,
      `I've survived rowdy crowds at 4 AM, you girls are a walk in the park.`,
      `I came to leave permanent scuff marks on this floor.`,
      `If you can't drop into a split right now, don't even look at me.`,
      `Save your energy for the lipsync, sweeties. You're gonna need it.`,
      `I devour stages for breakfast. What are you girls gonna do? A little twirl?`,
      `The bass is dropping, and your track records are in danger.`,
      `Is the sound system ready? Because I don't do background music.`,
      `Get out of the way, girls. I have zero mercy.`,
      `Hope you brought flat shoes, because these heels are about to out-dance you.`,
      `My performance stats are literally maxed out.`,
      `If I end up in the bottom, blame input lag.`,
      `I came to break the simulation's battle logic.`,
      `My evasion stat is ready for the lip sync.`
    );
  }

  if ((attrs.dance || 0) >= 9) {
    attrPush(
      `Five, six, seven, eight—let's go!`,
      `And... stretch.`,
      `Watch the feet, girls.`,
      `Don't trip on my extension.`,
      `Pose. Hold it. Next.`,
      `Warm up is over.`,
      `Two left feet in the back? Not on my watch.`,
      `Clear the floor, I need room for my lines.`,
      `You girls look a bit stiff. Need me to choreograph your exit?`,
      `Hope you brought knee pads, the floor work is gonna be brutal.`,
      `I don't walk runways, I leap through them.`,
      `Fix your posture, girls. The masterclass just started.`,
      `I'm hitting every single beat. Try to keep up.`,
      `The center stage is taken. Find your places in the background.`,
      `My body does things your silhouette could never dream of.`
    );
  }

  if ((attrs.comedy || 0) >= 9) {
    attrPush(
      `Don't laugh at the outfit, it took three rolls of tape.`,
      `Aaaand... I already want to go home.`,
      `Oh. It's... you guys. Fun.`,
      `Did I miss the casting for the pretty girls?`,
      `Ta-da! God saved the clown.`,
      `My wig is sweating. Please don't look.`,
      `I was told there would be competition. Did they change the lineup?`,
      `Don't worry, girls, I'm here to give you someone to look better than.`,
      `I looked at the couch... therapy is cheaper than this cast.`,
      `My credit score is lower than your heels, but at least I'm funny!`,
      `Is it warm in here or is that just the secondhand embarrassment?`,
      `I came, I saw, I forgot my lyrics. Let's do this!`,
      `One disaster at a time, ladies. Today I'm yours.`,
      `I'm not saying the standard is low, but I actually feel confident.`,
      `Help?`,
      `My bad.`,
      `I'm sweating.`,
      `Wrong room.`,
      `I tried.`,
      `Oops.`,
      `Cancel my contract.`,
      `Send help.`,
      `I need a refund.`,
      `My pathfinding code led me straight to the crown!`,
      `I'm pretty sure my script is 90% spaghetti code.`,
      `Error 404: Competition not found.`,
      `Did the developer copy-paste my personality text?`,
      `Is my update running? Testing, 1, 2...`
    );
  }

  if (/shady|competitive|villain|calculating|fearless|savage|sarcastic|hotheaded|strategic/.test(personality)) {
    pool.push(
      `Don't try me.`,
      `Lock your bags, girls.`,
      `Your worst nightmare just arrived.`,
      `Competition? Where?`,
      `I came to collect souls.`,
      `Bitterness causes wrinkles, babes.`,
      `Let's make this tension unbearable.`,
      `Cute look. Shame about the face.`,
      `You guys ready to lose?`,
      `I already keep track of your weaknesses.`,
      `Next!`,
      `Wow. The casting budget went where, exactly?`,
      `Don't even bother looking at me.`,
      `I'm not shady. Just right.`,
      `Who allowed this lineup?`,
      `I hope the dev team nerfed your stats.`,
      `Your track record variable is about to get corrupted.`,
      `Delete your save file, sweetie.`,
      `I'm the boss fight you didn't check the wiki for.`
    );
  }

  if (/fashion|glamour|diva|runway|model/.test(personality) || /fashion/.test(type)) {
    attrPush(
      `Couture only.`,
      `Couture, not costume. Learn the difference.`,
      `Admire from a safe distance, please.`,
      `I smell fast-fashion. Terrifying.`,
      `Where is my red carpet?`,
      `You tried. Adorable.`,
      `I am the runway. You're traffic.`,
      `Screenshot it, darling. It's a collector's item.`,
      `The runway has been waiting for me.`,
      `The category is: rich.`,
      `Is it fashion? It's always fashion.`,
      `Pure sophistication. Look it up.`,
      `Don't get too close to the fabric.`,
      `Excuse me, expensive coming through.`,
      `This is art. You wouldn't get it.`
    );
  }

  if (/funny|comedy|camp|silly|clown|goofy/.test(personality)) {
    pool.push(
      `Comedy is my cardio, and I'm already sweating.`,
      `I brought jokes. Lower your expectations accordingly.`,
      `Held together by tape and a prayer.`,
      `Is there catering in the back?`,
      `Lashes committing crimes. As usual.`,
      `Who ordered the clown?`,
      `The beauty spell went too far today!`,
      `I thought this was a brunch.`,
      `My left eyelash just quit.`,
      `Booo! Did I scare ya?`,
      `Can I start over?`,
      `I'm lost. Where's the exit?`,
      `Oops. My bad.`,
      `My agent told me to be normal. I fired her.`,
      `Is that your actual hair? Cute.`
    );
  }

  if (/confident|boss|alpha|dominat|winner|ambitious/.test(personality)) {
    pool.push(
      `Mine.`,
      `The game starts now.`,
      `Intimidated? Good.`,
      `I don't ask for room. I occupy.`,
      `You're just subletting my space.`,
      `I am the standard. Stretch for it.`,
      `Kneel or don't. The crown already knows my name.`,
      `Silver suits you girls. Really.`,
      `Confidence isn't a phase. It's my brand.`,
      `The blueprint has arrived.`,
      `Don't blink.`,
      `Just tell me where to stand for the coronation.`,
      `Opening act? Please. I'm the headliner.`,
      `Say it with me: iconic.`,
      `Any questions? No? Good.`,
      `My RNG roll was blessed before the match started.`,
      `You girls are just generic NPC background filler.`,
      `I didn't come to play, I came to top the leaderboard.`,
      `My base stats are completely illegal in this current patch.`,
      `I'm a hard-coded winner. You're just a budget mod.`
    );
  }

  if (/sweet|nice|kind|warm|soft|humble|charming|shy/.test(personality)) {
    pool.push(
      `Hi, beauties!`,
      `Did anyone bring cookies?`,
      `Sending love to everyone in the room!`,
      `Oh, you all look so lovely.`,
      `Let's keep it nice and clean, girls.`,
      `Group hug, anyone?`,
      `Protect your peace.`,
      `Hi, girls! So happy to be here.`,
      `Yay, we made it!`,
      `Hello, gorgeous faces!`,
      `Ready to shine together?`,
      `Can't wait to make friends!`,
      `Sweetness overloaded.`,
      `Hi, family!`
    );
  }

  if (/mysterious|quiet|dark|edgy|alternative|reserved|eccentric/.test(personality)) {
    pool.push(
      `Welcome to my chaos.`,
      `My silence has already swallowed your ego.`,
      `Predictable. How tedious.`,
      `I don't match vibes. I break them.`,
      `Boo.`,
      `You'll figure me out eventually.`,
      `Not your usual cup of tea.`,
      `I'm the glitch in your system.`,
      `Did I hear a scream?`,
      `I don't do commercial, babes.`,
      `The shadow has arrived.`,
      `You look nervous.`
    );
  }

  return sample(pool);
}

function entranceTournamentBracketClass(q){
  const b=gameState.season?.brackets;
  const group=q?.tournamentBracket || (b?.groups?Object.keys(b.groups).find(key=>(b.groups[key]||[]).includes(q.id)):null);
  return group?` tournament-bracket-${group}`:'';
}

function renderEntrance(){
  // v31.5 round 2: the entrance in progress is remembered, so "Next queen" keeps the same bracket/half
  // (marking a bracket entrance as seen changes the season status, which used to drop back to all queens)
  const active=gameState.season?.activeEntrance;
  if(active){return renderEntranceScreen(active.label,active.text,active.startLabel,gameState.queens.filter(q=>active.ids.includes(q.id)));}
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
  gameState.season.activeEntrance={label:partLabel,text:partText,startLabel,ids:entranceQueens.map(q=>q.id)};
  saveGame();
  return renderEntranceScreen(partLabel,partText,startLabel,entranceQueens);
}
function renderEntranceScreen(partLabel,partText,startLabel,entranceQueens){
  const script=entranceScriptFor(partLabel, entranceQueens);
  const shownIds=script.order.slice(0,script.shown);
  const allIn=script.shown>=script.order.length;
  const cards=shownIds.map((id,i)=>{
    const q=gameState.queens.find(x=>x.id===id); if(!q)return '';
    const first=i===0?`<p class="entrance-first small">${escapeHtml(script.firstLine||'First queen in the werkroom.')}</p>`:'';
    const reacts=(script.reactions[id]||[]).length?`<ul class="entrance-reactions small">${script.reactions[id].map(t=>`<li>${escapeHtml(t)}</li>`).join('')}</ul>`:'';
    return `<article class="card entrance-card${entranceTournamentBracketClass(q)}"><div class="entrance-head">${queenPortraitHtml(q,'lg')}<div class="entrance-copy"><h3>${queenDisplayName(q)}</h3><p>${queenPersonaTypeHtml(q)}</p></div></div>${first}<p class="entrance-quote">“${escapeHtml(script.lines[id]||'')}”</p>${reacts}</article>`;
  }).join('');
  const controls=allIn
    ? `<div class="tv-nav"><button id="firstEpisode" class="tv-next">Start ${escapeHtml(startLabel)}</button></div>`
    : `<div class="button-row tv-nav"><button class="ghost" id="allQueens">Everyone in</button><button id="nextQueen" class="tv-next">Next queen (${script.shown}/${script.order.length})</button></div>`;
  setHTML(`<main class="screen"><section class="hero entrance-hero"><p class="eyebrow">The queens are entering</p><h2>${escapeHtml(partLabel)}</h2><p>${escapeHtml(partText)}</p></section><section class="grid entrance-grid">${cards}</section>${controls}</main>`);
  document.querySelector('#firstEpisode')?.addEventListener('click',()=>{delete gameState.season.activeEntrance; generateEpisode(); renderWorkroom();});
  document.querySelector('#nextQueen')?.addEventListener('click',()=>{script.shown=Math.min(script.order.length,script.shown+1); saveGame(); window.__preserveScrollY=window.scrollY; renderEntrance(); const last=[...document.querySelectorAll('.entrance-card')].pop(); requestAnimationFrame(()=>last?.scrollIntoView({block:'nearest'}));});
  document.querySelector('#allQueens')?.addEventListener('click',()=>{script.shown=script.order.length; saveGame(); renderEntrance();});
}
// v31.5: the queens walk in one at a time. Order, lines and reactions are decided once and saved,
// so reloading the page shows the same entrance.
function entranceScriptFor(key, queens){
  const season=gameState.season;
  season.entranceScripts=season.entranceScripts||{};
  const ids=queens.map(q=>q.id);
  let sc=season.entranceScripts[key];
  if(sc && sc.order.length===ids.length && sc.order.every(id=>ids.includes(id)))return sc;
  const extra=gameState.data?.entranceLines||{};
  const order=shuffle([...ids]);
  const lines={}, reactions={};
  const affinity=(from,to)=>Number(gameState.relationships?.[from]?.[to]?.affinity)||0;
  order.forEach((id,i)=>{
    const q=gameState.queens.find(x=>x.id===id);
    // no two queens say the same line in one entrance
    let line='';for(let t=0;t<12;t++){line=fillTemplate(entranceLine(q),{name:q.name});if(!Object.values(lines).includes(line))break;}
    lines[id]=line;
    if(i===0)return;
    const inRoom=order.slice(0,i).map(r=>gameState.queens.find(x=>x.id===r)).filter(Boolean);
    const picks=[...inRoom].sort((a,b)=>Math.abs(affinity(b.id,id))-Math.abs(affinity(a.id,id))).slice(0,i>2&&Math.random()<0.4?2:1);
    reactions[id]=picks.map(r=>{const af=affinity(r.id,id);const tone=af>=25?'warm':af<=-20?'shade':'neutral';return fillTemplate(sample(extra.reactions?.[tone]||extra.reactions?.neutral||['{reactor} says hi.']),{reactor:r.name,name:q.name});});
  });
  sc={order,lines,reactions,shown:1,firstLine:sample(extra.firstIn||['First queen in the werkroom.'])};
  season.entranceScripts[key]=sc;
  return sc;
}
