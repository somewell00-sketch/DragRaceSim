function entrancePersonalityLabel(q){
  const raw=q?.personalityId || q?.personality || '';
  const id=String(raw||'').toLowerCase();
  const profile=(gameState.data?.personalities||[]).find(p=>String(p.id||'').toLowerCase()===id || String(p.name||'').toLowerCase()===id);
  if(profile?.name) return profile.name;
  if(!raw) return 'Personality';
  return String(raw).replace(/[-_]+/g,' ').replace(/\b\w/g,c=>c.toUpperCase());
}

function entranceLine(q){
  // Falas gerais
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
    `Some queens bring looks. I bring a legacy.`,
    `I'm the full package. Wrapped in couture.`,
    `I walk in, and suddenly the bar is higher.`,
    `My only competition is the mirror. And I won.`,
    `I'm not a queen. I'm the whole monarchy.`,
    `I'd say 'don't hate me because I'm beautiful,' but hate me. It fuels me.`,
    `I don't have a type. But insecurity is cute on some of you.`,
    `New queen, who dis? Oh, the winner.`,
    `I'm not here to be liked. I'm here to be remembered.`,
    `My entrance is cute. My win will be cuter.`,
    `If you can't handle the heat, watch me burn the house down.`,
    `I'm like a fine wine. You'll hate me now, love me later.`,
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
    `Every season has a villain. This season has a winner.`,
    `I'm not the queen everyone expected. I'm the one they deserve.`,
    `They said 'break a leg.' I'll break a few hearts instead.`,
    `I didn't come this far to come this far.`,
    `This isn't my first chapter. But it will be my best one.`,
    `I've been underestimated my whole life. Watch me exceed expectations.`,
    `I'm not defined by my past. I'm defined by my crown.`,
    `I'm not afraid to fail. I'm afraid to never try.`,
    `I'm what happens when talent meets confidence. And yes, it's lethal.`,
    `If you don't know me, you will. If you do, you're scared.`,
    `I'm not a drag queen. I'm a drag experience.`,
    `The other queens are jewelry. I'm the crown.`,
    `I'm the plot twist this season needed.`,
    `Queens come and go. I arrive and stay.`,
    `I'm not here to fill a spot. I'm here to fill a room.`,
    `My entrance is just the beginning. The ending? That's mine too.`,
    `I'm not competition. I'm destiny.`,
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
    `I walked in and the competition checked itself into therapy.`,
    `Your fave could never. Actually, they could never even afford this.`,
    `I'm not a snack. I'm the whole damn meal with dessert on the side.`,
    `The only thing shaking more than my hips is the other queens' confidence.`,
    `If I'm too much, go find less.`,
    `I don't chase. I attract. And what I attract is crowns.`,
    `I'm not rude. I'm just honest. Your discomfort is not my problem.`,
    `I'm the queen who came to slay, not to play nice.`,
    `Some people have bad days. I have bad bitches.`,
    `My outfit cost more than your entire wardrobe. And I'm not even done.`,
    `Fashion is my passion. And passion looks expensive.`,
    `I don't follow trends. Trends follow me.`,
    `This look? Custom. This face? Also custom.`,
    `I walked in and the runway got nervous.`,
    `My heels are higher than your expectations.`,
    `Designers don't dress me. I dress them.`,
    `I look like money. And I sound like a winner.`,
    `I'm not the one to beat. I'm the one to watch.`,
    `I don't need luck. I have talent. And talent always wins.`,
    `My biggest weakness? I make everyone else look average.`,
    `I'm like a diamond. Pressure only makes me shine brighter.`,
    `I was born to win. The universe just needed to catch up.`,
    `Confidence isn't an act. It's a lifestyle. And I'm living it.`,
    `I'm the blueprint. Everyone else is just a copy.`,
    `I don't practice. I perform. There's a difference.`,
    `My makeup is beat. My credit score? Not so much.`,
    `I'm like a clown. But make it fashion.`,
    `My talent is that I have no talent. And I'm making it work.`,
    `I came, I saw, I ordered takeout.`,
    `I'm the queen of doing the absolute most and loving every second.`,
    `My entrance was so good even I gagged. And I planned it.`,
    `I'm not watching the other queens. I'm watching myself in the mirror.`,
    `Some queens are competition. Some are comic relief. Guess which one you are.`,
    `I'm the queen your favorite queen told you not to worry about. You should worry.`,
    `I didn't come to make friends. I came to make an impression. And I made it.`,
    `The other queens are cute. Cute is not winning.`,
    `I'm not shady. I'm just observant. And I observed that you're not ready.`,
    `I've been counted out before. Now I'm counting crowns.`,
    `Every queen has a story. Mine is still being written. And it's a bestseller.`,
    `I didn't come to fill a role. I came to rewrite the whole damn script.`,
    `The journey wasn't easy. But the destination is worth it.`,
    `I'm not the queen of the season. I'm the queen of my own story.`,
    `Some queens dream of crowns. I dream of legacies.`,
    `I'm not defined by my past. I'm defined by my future. And it's bright.`,
    `Y'all ready? Good. I'm not.`,
    `Hi. I'm the reason you should be nervous.`,
    `Spoiler alert: I win.`,
    `I'm here. What now?`,
    `Let's go.`,
    `And the winner is... me.`,
    `The other queens are so lucky to lose to me.`,
    `I don't have a word for what I am. But you'll find one.`,
    `Trigger warning: I'm here.`,
    `Oof... the vibe in here just shifted.`,
    `Hi, losers!`,
    `Did you feel that? That was my impact.`,
    `Wait, did they move the main stage in here?`,
    `Brought some major tea: I’m winning.`,
    `You can applaud, I won't charge you.`,
    `Felt like the room needed an upgrade.`,
    `Hope the studio has good insurance.`,
    `Don't stare too directly. It costs.`,
    `Oh, look at you all... Cute.`,
    `The bar just cleared the roof.`,
    `I didn't come to play nice.`,
    `Is this where the judges sit? No?`,
    `Missed me?`,
    `You girls look sweet... anyway.`,
    `Sorry I'm late. Traffic was chaos.`,
    `Hi, loves. Ready for second place?`,
    `They said this was a competition? Where?`,
    `Don't blink.`,
    `The mother has officially arrived.`,
    `Make room.`,
    `Are you guys on vacation?`,
    `Attention, class: session is in.`,
    `Get the camera close. Now.`,
    `I'm here. You can stop pretending now.`,
    `Love the decor. Shame I’m ruining it.`,
    `Are you girls sweating?`,
    `A moment of silence for your egos.`,
    `Next!`,
    `Did someone call for a savior?`,
    `Oh. It's... you guys.`
  ];

  const attrs = q?.attributes || {};
  const personality = String(q?.personalityId || q?.personality || '').toLowerCase();
  const type = String(q?.type || '').toLowerCase();
  
  let pool = [...lines];

  // CUNT alto (>=10)
  if ((attrs.cunt || 0) >= 10) {
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

  // Runway ou Makeup altos (>=10)
  if ((attrs.runway || 0) >= 10 || (attrs.makeup || 0) >= 10) {
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
      `The fabric is exclusive. The mug is sacred.`
    );
  }

  // Acting alto (>=10)
  if ((attrs.acting || 0) >= 10) {
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

  // LipSync alto (>=10)
  if ((attrs.lipSync || 0) >= 10) {
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
      `Hope you brought flat shoes, because these heels are about to out-dance you.`
    );
  }

  // Dance alto (>=10)
  if ((attrs.dance || 0) >= 10) {
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

  // Comedy alto (>=10)
  if ((attrs.comedy || 0) >= 10) {
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
      `I need a refund.`
    );
  }

  // Personalidades específicas
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
      `Who allowed this lineup?`
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
      `Next question?`
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
