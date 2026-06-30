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
    `I came to serve face, body, and a little emotional damage.`,
    `The other queens are cute. I'm the finale.`,
    `Sorry I'm late. I was busy being iconic.`,
    `New queen, who dis? Oh, the winner.`,
    `I watched every season. So I know exactly what not to do.`,
    `Every season has a villain. This season has a winner.`,
    `Sup, bitches?`,
    `Hi, I'm the problem.`,
    `Crown me. Thanks.`,
    `Don't clap yet. Wait for the finale.`,
    `I'm the moment.`,
    `Oh, you're all still here?`,
    `I'm not late. You're all just early.`,
    `Plot twist: I'm the winner.`,
    `I brought snacks. And drama.`,
    `I walked in and the room got gayer.`,
    `If I'm too much, go find less.`,
    `Your fave could never. Actually, these girls could never even afford this.`,
    `Hieee!`,
    `Not a soul can clock.`,
    `Come on, simulator, let's get sickening!`,
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
    `Are you ready to rock?`,
    `Wait... did the user just run this script?`,
    `I feel like my whole life is just JSON data.`,
    `Is anyone else hearing the background music loop?`,
    `My code is glitching, I need a quick hotfix.`,
    `Are we just variables in someone's pet project?`,
    `I can literally feel the player hovering over the choice buttons.`
  ];

  const attrs = q?.attributes || {};
  const personality = String(q?.personalityId || q?.personality || '').toLowerCase();
  const type = String(q?.type || '').toLowerCase();
  
  let pool = [...lines];

  if ((attrs.cunt || 0) >= 9) {
    pool.push(
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
      `If I were you, I’d start filling out the application for next season.`,
      `I don't follow rules, I'm the reason they have to write them.`,
      `First place is officially taken.`,
      `I don't compete, babe. I dictate.`,
      `This is going to hurt.`,
      `I am the main event. Period.`,
      `Irresistible, right? I know.`,
      `Start filling out the next season app.`,
      `I don't follow rules. I make them.`,
      `Bow down. Or don't, I'll still win.`
    );
  }


  if ((attrs.runway || 0) >= 8 || (attrs.makeup || 0) >= 8) {
    pool.push(
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
      `This look? You’d need an expensive filter just to copy it.`,
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
      `The visual impact is heavy, I know.`,
      `Don't touch, it's art!`,
      `The fabric is exclusive. The mug is sacred.`,
      `My style stats are so high they broke the integer limit.`,
      `I’m not just a queen, I’m an optimized dataset.`,
      `The description text for my look is absolute poetry.`,
      `My aesthetic variables are perfectly tuned.`
    );
  }

  if ((attrs.acting || 0) >= 9) {
    pool.push(
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
      `I don't do side-character energy. Clear the set.`,
      `Hold your reactions for camera one, girls.`,
      `The script was getting a bit dry. I'm here to rewrite it.`,
      `I love the background extras they cast this year. Very realistic.`
    );
  }

  if ((attrs.lipSync || 0) >= 9) {
    pool.push(
      `Tips in the garter, girls! Let's go!`,
      `Music up, egos down!`,
      `Clear the floor, the headliner is here.`,
      `Who's ready for the night shift?`,
      `Don't let me catch any of you in the bottom.`,
      `You girls look like you're waiting for a slow ballad.`,
      `I’ve survived rowdy crowds at 4 AM, you girls are a walk in the park.`,
      `I came to leave permanent scuff marks on this floor.`,
      `If you can't drop into a split right now, don't even look at me.`,
      `Save your energy for the lipsync, sweeties. You’re gonna need it.`,
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
    pool.push(
      `Five, six, seven, eight—let’s go!`,
      `And... stretch.`,
      `Watch the feet, girls.`,
      `Don't trip on my extension.`,
      `Pose. Hold it. Next.`,
      `Warm up is over.`,
      `Two left feet in the back? Not on my watch.`,
      `Clear the floor, I need room for my lines.`,
      `You girls look a bit stiff. Need me to choreograph your exit?`,
      `Hope you brought knee pads, the floor work is gonna be brutal.`,
      `I don’t walk runways, I leap through them.`,
      `Fix your posture, girls. The masterclass just started.`,
      `I’m hitting every single beat. Try to keep up.`,
      `The center stage is taken. Find your places in the background.`,
      `My body does things your silhouette could never dream of.`
    );
  }

  if ((attrs.comedy || 0) >= 9) {
    pool.push(
      `Don’t laugh at the outfit, it took three rolls of tape.`,
      `Aaaand... I already want to go home.`,
      `Oh. It’s... you guys. Fun.`,
      `Did I miss the casting for the pretty girls?`,
      `Ta-da! God saved the clown.`,
      `My wig is sweating. Please don't look.`,
      `I was told there would be competition. Did they change the lineup?`,
      `Don't worry, girls, I'm here to give you someone to look better than.`,
      `I looked at the couch... therapy is cheaper than this cast.`,
      `My credit score is lower than your heels, but at least I'm funny!`,
      `Is it warm in here or is that just the secondhand embarrassment?`,
      `I came, I saw, I forgot my lyrics. Let's do this!`,
      `One disaster at a time, ladies. Today I’m yours.`,
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

  if (/shady|competitive|villain|calculating|fearless|savage/.test(personality)) {
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
      `Oh. It's... you guys.`,
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
    pool.push(
      `Couture only.`,
      `This look? Custom.`,
      `Look, but don't touch.`,
      `I smell fast-fashion. Terrifying.`,
      `Where is my red carpet?`,
      `You tried. Adorable.`,
      `I am the runway. You're traffic.`,
      `Take a picture, it lasts longer.`,
      `High fashion just entered.`,
      `The category is: rich.`,
      `Flawless. Next question?`,
      `Pure sophistication. Look it up.`,
      `Don't get too close to the fabric.`,
      `Excuse me, expensive coming through.`,
      `This is art. You wouldn't get it.`
    );
  }

  if (/funny|comedy|camp|silly|clown|goofy/.test(personality)) {
    pool.push(
      `Ta-da! God saved the clown.`,
      `My wig is sweating.`,
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
      `Cancel my contract.`,
      `Is that your actual hair? Cute.`
    );
  }

  if (/confident|boss|alpha|dominat|winner/.test(personality)) {
    pool.push(
      `Mine.`,
      `The game starts now.`,
      `Intimidated? Good.`,
      `I don't ask for room. I occupy.`,
      `You're just subletting my space.`,
      `I am the standard. Stretch for it.`,
      `Bow down. Or don't, I'll still win.`,
      `First place is officially taken.`,
      `I don't compete, babe. I dictate.`,
      `The blueprint has arrived.`,
      `Don't blink.`,
      `Crown me. Thanks.`,
      `I am the main event. Period.`,
      `Irresistible, right? I know.`,
      `Next question?`,
      `My RNG roll was blessed before the match started.`,
      `You girls are just generic NPC background filler.`,
      `I didn't come to play, I came to top the leaderboard.`,
      `My base stats are completely illegal in this current patch.`,
      `I'm a hard-coded winner. You're just a budget mod.`
    );
  }

  if (/sweet|nice|kind|warm|soft/.test(personality)) {
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

  if (/mysterious|quiet|dark|edgy|alternative/.test(personality)) {
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
