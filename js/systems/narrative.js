// v28 — Narrative Engine
// Recalculates hidden season tags that let Ru, production, and the cast react to
// more than this week's raw score.
const NARRATIVE_TAGS = {
  FRONT_RUNNER:'front-runner',
  COMPETITIVE_THREAT:'competitive threat',
  LIP_SYNC_ASSASSIN:'lip sync assassin',
  FAN_FAVORITE:'fan favorite',
  PRODUCERS_DREAM:"producer's dream",
  VILLAIN:'villain edit',
  FILLER:'filler queen',
  RISING:'rising star',
  REDEMPTION:'redemption arc',
  WILDCARD:'wildcard',
  FASHION:'fashion queen',
  COMEDY:'comedy queen',
  PERFORMER:'performer',
  FADING:'fading',
  SURVIVOR:'survivor'
};
function queenHistory(q){return q?.episodeHistory||[];}
function placementCounts(q){
  const h=queenHistory(q);
  const count=p=>h.filter(x=>String(x.placement||'').toUpperCase()===p).length;
  return {win:count('WIN'), high:count('HIGH')+count('TOP2'), safe:count('SAFE'), low:count('LOW'), btm:count('BTM'), elim:count('ELIM')};
}
function trackRecordPower(q){
  const c=placementCounts(q);
  return c.win*5 + c.high*3 + c.safe*1 + c.low*(-1) + c.btm*(-3) + c.elim*(-6) + (q.momentum||0)*1.2;
}
function currentFrontRunnerIds(){
  const active=(gameState.queens||[]).filter(q=>!q.isEliminated);
  if(!active.length)return [];
  const scored=active.map(q=>({id:q.id,score:trackRecordPower(q)}));
  const max=Math.max(...scored.map(s=>s.score));
  return scored.filter(s=>s.score>=max-0.5).map(s=>s.id);
}
function avgRelationshipScore(q){
  const rels=Object.values(gameState.relationships?.[q.id]||{});
  if(!rels.length)return 0;
  return rels.reduce((t,r)=>t+(r.affinity||0)+(r.respect||0)*.6,0)/rels.length;
}

function worstRelationshipQueenId(){
  const queens=gameState.queens||[];
  if(!queens.length)return null;
  const scored=queens.map(q=>({id:q.id,score:avgRelationshipScore(q)})).sort((a,b)=>a.score-b.score);
  return scored[0]?.id||null;
}
function runwayAverage(q){
  const vals=queenHistory(q).map(h=>Number(h.runway||h.runwayScore||0)).filter(Boolean);
  if(!vals.length)return q.attributes?.runway||0;
  return vals.reduce((a,b)=>a+b,0)/vals.length;
}
function challengeStrength(q,types=[]){
  const h=queenHistory(q).filter(x=>types.includes(x.challengeType));
  if(!h.length)return 0;
  return h.reduce((s,x)=>s+(String(x.placement).toUpperCase()==='WIN'?3:String(x.placement).toUpperCase()==='HIGH'?2:String(x.placement).toUpperCase()==='LOW'?-1:String(x.placement).toUpperCase()==='BTM'?-2:0),0);
}
function recentTrend(q){
  const h=queenHistory(q).slice(-3);
  if(h.length<2)return 0;
  const value=p=>({WIN:5,HIGH:3,TOP2:3,SAFE:1,LOW:-1,BTM:-3,ELIM:-5}[String(p||'').toUpperCase()]||0);
  return value(h[h.length-1].placement)-value(h[0].placement);
}
function addNarrativeTag(scores,tag,strength,reason){
  if(!strength)return;
  scores[tag]=(scores[tag]||0)+strength;
  scores._reasons=scores._reasons||{};
  scores._reasons[tag]=reason||scores._reasons[tag]||'';
}
function calculateNarrativeTags(q){
  if(!q)return [];
  const c=placementCounts(q);
  const pub=q.publicScores||{};
  const scores={};
  const power=trackRecordPower(q);
  const rel=avgRelationshipScore(q);
  const trend=recentTrend(q);
  const history=queenHistory(q);
  const lipWins=q.statistics?.lipSyncWins||history.filter(h=>h.lipSyncWin).length||0;
  const bottoms=q.statistics?.bottoms||c.btm;
  const wins=q.statistics?.wins||c.win;
  const highs=q.statistics?.highs||c.high;
  const prod=pub.production||0;
  const fans=pub.fans||0;
  const type=String(q.type||'').toLowerCase();
  const personality=String(q.personalityId||q.personality||'').toLowerCase();
  const frontIds=currentFrontRunnerIds();
  const storyFlags=(q.storyFlags||[]).concat((gameState.season?.storyFlags||[]).filter(f=>f.queenId===q.id));
  const flagStrength=type=>storyFlags.filter(f=>f.type===type).reduce((sum,f)=>sum+(Number(f.strength)||1),0);

  if(flagStrength('villain_edit')||flagStrength('villain_spark'))addNarrativeTag(scores,NARRATIVE_TAGS.VILLAIN,2+flagStrength('villain_edit')*2+flagStrength('villain_spark'),'earned villain-edit story flags');
  if(flagStrength('positive_confessional'))addNarrativeTag(scores,NARRATIVE_TAGS.FAN_FAVORITE,1+flagStrength('positive_confessional'),'positive confessionals gave her warmth');
  if(flagStrength('alliance_builder')||flagStrength('alliance_member'))addNarrativeTag(scores,NARRATIVE_TAGS.PRODUCERS_DREAM,1+flagStrength('alliance_builder')+flagStrength('alliance_member')*.5,'active alliance story');
  if(flagStrength('argument'))addNarrativeTag(scores,NARRATIVE_TAGS.VILLAIN,1+flagStrength('argument'),'argument in Untucked');

  if(frontIds.includes(q.id))addNarrativeTag(scores,NARRATIVE_TAGS.FRONT_RUNNER,5,'best track record right now');
  if(power>=8 || wins>=1&&highs>=2)addNarrativeTag(scores,NARRATIVE_TAGS.COMPETITIVE_THREAT,Math.min(5,2+wins+Math.floor(highs/2)),'track record makes her dangerous');
  if(lipWins>=2 || ((q.attributes?.lipSync||0)>=8 && bottoms>=1))addNarrativeTag(scores,NARRATIVE_TAGS.LIP_SYNC_ASSASSIN,Math.min(5,lipWins+2),'proven under the lights');
  if(fans>=18 || (fans>=8&&rel>18))addNarrativeTag(scores,NARRATIVE_TAGS.FAN_FAVORITE,Math.min(5,2+Math.floor(fans/18)),'audience connection');
  if(prod>=20 || (prod>=10&&['chaotic','dramatic','funny','calculating'].includes(personality)))addNarrativeTag(scores,NARRATIVE_TAGS.PRODUCERS_DREAM,Math.min(5,2+Math.floor(prod/18)),'gives the edit material');
  if(prod>=12 && (fans<0 || rel<-18))addNarrativeTag(scores,NARRATIVE_TAGS.VILLAIN,Math.min(5,2+Math.floor((prod+Math.max(0,-rel))/25)),'polarizing television');
  if(q.id===worstRelationshipQueenId() && rel<10)addNarrativeTag(scores,NARRATIVE_TAGS.VILLAIN,4,'worst cast relationships of the season');
  if(history.length>=4 && wins===0 && highs<=1 && prod<8 && Math.abs(fans)<12)addNarrativeTag(scores,NARRATIVE_TAGS.FILLER,3,'not shaping the season yet');
  if(trend>=3 || (history.length>=4 && wins+highs>=2 && queenHistory(q).slice(0,2).some(h=>['LOW','BTM'].includes(String(h.placement).toUpperCase()))))addNarrativeTag(scores,NARRATIVE_TAGS.RISING,3+Math.max(0,trend/2),'getting stronger');
  if(history.slice(-2).some(h=>['LOW','BTM'].includes(String(h.placement).toUpperCase())) && ['WIN','HIGH','TOP2'].includes(String(history.at(-1)?.placement||'').toUpperCase()))addNarrativeTag(scores,NARRATIVE_TAGS.REDEMPTION,4,'bounced back');
  if(wins>=1 && bottoms>=1 || personality==='chaotic')addNarrativeTag(scores,NARRATIVE_TAGS.WILDCARD,3,'unpredictable run');
  if(runwayAverage(q)>=8 || type.includes('fashion')||type.includes('look')||type.includes('ballroom'))addNarrativeTag(scores,NARRATIVE_TAGS.FASHION,3,'runway identity');
  if(challengeStrength(q,['snatchgame','roast','improv','comedy'])>=3 || type.includes('comedy')||personality==='funny')addNarrativeTag(scores,NARRATIVE_TAGS.COMEDY,3,'comedy wins attention');
  if(challengeStrength(q,['girlgroup','talentshow','rusical'])>=3 || type.includes('perform')||type.includes('dance'))addNarrativeTag(scores,NARRATIVE_TAGS.PERFORMER,3,'performance strengths');
  if(trend<=-3 && (wins+highs)>=2)addNarrativeTag(scores,NARRATIVE_TAGS.FADING,3,'early spark is cooling');
  if(bottoms>=2)addNarrativeTag(scores,NARRATIVE_TAGS.SURVIVOR,Math.min(5,bottoms),'survived danger repeatedly');

  const tags=Object.entries(scores)
    .filter(([k])=>k!=='_reasons')
    .map(([tag,strength])=>({tag,strength:Math.round(strength*10)/10,reason:scores._reasons?.[tag]||''}))
    .sort((a,b)=>b.strength-a.strength);
  return tags;
}
function recalcNarrativeTags(){
  (gameState.queens||[]).forEach(q=>{q.narrativeTags=calculateNarrativeTags(q);});
  return gameState.queens;
}
function getQueenNarrativeTags(q){
  if(!q)return [];
  if(!q.narrativeTags || !q.narrativeTags.length) q.narrativeTags=calculateNarrativeTags(q);
  return q.narrativeTags;
}
function hasNarrativeTag(q,tag){return getQueenNarrativeTags(q).some(t=>t.tag===tag);}
function primaryNarrativeTag(q){return getQueenNarrativeTags(q)[0]?.tag||'';}
function ruNarrativeComment(q, placement){
  const tags=getQueenNarrativeTags(q).map(t=>t.tag);
  const p=String(placement||'SAFE').toUpperCase();
  const positive=['WIN','HIGH','TOP2'].includes(p);
  const bottom=['LOW','BTM'].includes(p);
  const lines = {
    [NARRATIVE_TAGS.FRONT_RUNNER]: {
      positive: [
        'Week after week, you keep setting the standard.',
        'You reminded everyone why you are one of the queens to beat.',
        'The crown is starting to look like it has your name on it.',
        'You are not just playing the game—you are defining it.',
        'Every episode, you elevate what it means to be a frontrunner.',
        'You make winning look effortless, and that is dangerous.',
        'The other queens are watching you, and honestly? They should be.',
        'You are building a legacy with every single performance.',
        'This is what a champion looks like in the making.',
        'You have turned this competition into your own personal showcase.'
      ],
      negative: [
        'Even the strongest queens stumble. What matters is how you recover.',
        'When you set the bar high, we hold you to it.',
        'The view from the top can be lonely—do not let it shake you.',
        'A frontrunner has targets on their back. You just felt the first arrow.',
        'This is your wake-up call. Champions respond.',
        'You have been untouchable—until now. How will you handle it?',
        'The pressure is real, and you just showed us it affects you too.',
        'Being the best comes with expectations. You did not meet them today.',
        'This is the moment where legends are tested. Prove yourself.',
        'Your crown is not secure yet. Tonight proved that.'
      ]
    },
    
    [NARRATIVE_TAGS.COMPETITIVE_THREAT]: {
      positive: [
        'Every queen in this room knows you are a threat.',
        'You are still very much in this race.',
        'Your track record speaks volumes. People are watching you closely.',
        'You have the fire of someone who came to win.',
        'No one is sleeping on you—and they shouldnt.',
        'You are the name on everyones lips when they talk about who to beat.',
        'Your consistency is becoming legendary.',
        'You have proven that you belong in the top tier of this competition.',
        'The others are scared of you. Keep it that way.',
        'You are not just competing—you are conquering.'
      ],
      negative: [
        'A threat only stays a threat if they keep delivering.',
        'You have the potential, but tonight was not your night.',
        'Do not let the pressure of being a threat overwhelm you.',
        'Everyone expects greatness from you. Give it to them.',
        'Being a threat means nothing if you do not show up.',
        'You have the skills—now show us you have the heart.',
        'The competition is catching up. Step it up.',
        'You cannot rest on reputation alone. We need to see it.',
        'The others are gunning for you. Defend your spot.',
        'You are a threat, but threats can be eliminated.'
      ]
    },
    
    [NARRATIVE_TAGS.LIP_SYNC_ASSASSIN]: {
      positive: [
        'You have shown us that when the music starts, you come alive.',
        'You never make it easy to count you out.',
        'When that beat drops, you become something else entirely.',
        'You are a performer through and through—and we live for it.',
        'The lip sync stage is YOUR domain.',
        'You have the power to send anyone home, and everyone knows it.',
        'Your performances are the stuff of Drag Race legend.',
        'You embody the music in a way few queens can.',
        'When your back is against the wall, you fight like a champion.',
        'You are the queen nobody wants to face in a lip sync.'
      ],
      negative: [
        'Even assassins have off days. Dont let it define you.',
        'We know what you can do—now prove it again.',
        'Your reputation precedes you. Back it up.',
        'You have the skills, but the fire was missing tonight.',
        'A lip sync assassin needs to deliver when it counts.',
        'Do not let the label become your only identity.',
        'Show us you are more than just a lip sync queen.',
        'The crown is not won on the lip sync stage alone.',
        'We have seen what you can do. Where was that tonight?',
        'You cannot rely on being an assassin forever—evolve.'
      ]
    },
    
    [NARRATIVE_TAGS.FAN_FAVORITE]: {
      positive: [
        'There is something about you people want to root for.',
        'The audience connects with you, and I can see why.',
        'You have captured the hearts of viewers everywhere.',
        'Your charisma is undeniable, and the fans are eating it up.',
        'People see themselves in you—and that is powerful.',
        'The love for you extends beyond this room.',
        'You have built a fanbase that will follow you anywhere.',
        'Your authenticity resonates with so many people.',
        'The fans are rallying behind you. That is no small thing.',
        'You have the kind of star quality that makes people invest in you.'
      ],
      negative: [
        'Fan love is beautiful, but it cannot carry you alone.',
        'The audience adores you—now show them why you deserve to stay.',
        'You have the support, but you need to deliver the performances.',
        'Being a fan favorite comes with responsibility. Step up.',
        'We all love you, but we need to see the fire.',
        'The fans are waiting for you to break through.',
        'Dont rely on popularity to save you.',
        'You have the heart of the fans—now give them a winner.',
        'The love is there. Now make it mean something.',
        'Fan favorites can become champions. Show us you are ready.'
      ]
    },
    
    [NARRATIVE_TAGS.PRODUCERS_DREAM]: {
      positive: [
        'Every week, you give us something to remember.',
        'You know how to command our attention.',
        'You understand television in a way few queens do.',
        'Every moment with you is electric and unpredictable.',
        'You were born for this stage—and for the camera.',
        'You make our jobs easy because you are never boring.',
        'Your instincts for what makes good TV are unmatched.',
        'You know exactly how to keep us engaged.',
        'There is never a dull moment when you are on screen.',
        'You are the kind of queen that defines a season.'
      ],
      negative: [
        'Even producers dreams need to deliver substance.',
        'You have the entertainment—now give us the excellence.',
        'Being great TV is not enough if you cannot back it up.',
        'We love watching you, but we need to see growth.',
        'The camera loves you—now earn its love with your talent.',
        'You know how to make moments. Make them count.',
        'Entertainment is important, but so is performance.',
        'Dont let the storytelling overshadow the competition.',
        'You have the charisma—now show us the chops.',
        'Being memorable is a start. Now be undeniable.'
      ]
    },
    
    [NARRATIVE_TAGS.VILLAIN]: {
      positive: [
        'Whether people agree with you or not, they cannot stop watching you.',
        'You always make us feel something.',
        'You are unapologetically yourself, and that takes courage.',
        'Your presence alone shifts the energy in the room.',
        'You are the queen everyone loves to hate—and you own it.',
        'You understand the power of making people react.',
        'You are giving us drama, and we are living for it.',
        'You are not here to make friends—and that is valid.',
        'Your confidence is intimidating, and I respect that.',
        'You have made yourself unforgettable this season.'
      ],
      negative: [
        'Being the villain is fun until it costs you the crown.',
        'You can be sharp, but do not cut yourself with your own words.',
        'The drama is entertaining, but is it winning?',
        'You have made enemies—now make them respect you.',
        'Your attitude is a choice. Choose wisely.',
        'Villains can win, but they need the talent to back it up.',
        'You are playing a dangerous game. Be careful.',
        'The other queens are tired of you. Prove them wrong.',
        'Your bark is loud—let us hear your bite.',
        'Being disliked is not the same as being dominant.'
      ]
    },
    
    [NARRATIVE_TAGS.FILLER]: {
      positive: [
        'Do not let this competition pass you by.',
        'We know there is more to you. Let us see it.',
        'You are still in this race—act like it.',
        'This is your moment to wake up and shine.',
        'You have been quiet, but that does not mean you are not capable.',
        'I want to see the queen I know you can be.',
        'It is never too late to make a statement.',
        'You have the potential. Stop hiding it.',
        'The competition is heating up—show us you can too.',
        'This is your wake-up call. Answer it.'
      ],
      negative: [
        'Being filler is a choice. Unmake it.',
        'You are fading into the background. Fight back.',
        'The season is moving on without you.',
        'If you do not step up soon, it will be too late.',
        'You cannot coast to the crown.',
        'Passivity will send you home.',
        'You have been forgettable. Change that narrative.',
        'The others are leaving you behind.',
        'Every week is an opportunity. Use it.',
        'You are running out of chances to impress us.'
      ]
    },
    
    [NARRATIVE_TAGS.RISING]: {
      positive: [
        'You are becoming clearer and more confident every week.',
        'This is the growth we have been waiting to see.',
        'You are proving that Drag Race is a marathon, not a sprint.',
        'Your trajectory is one of the most exciting this season.',
        'You are peaking at exactly the right time.',
        'Every week you get stronger, sharper, more undeniable.',
        'You are turning potential into power.',
        'Your growth is a testament to your determination.',
        'You are becoming a force to be reckoned with.',
        'The momentum is yours—dont let it go.'
      ],
      negative: [
        'You are rising, but do not let it get to your head.',
        'Keep climbing—do not get comfortable.',
        'Rising stars can fall just as quickly.',
        'Your growth is promising. Now sustain it.',
        'Do not plateau now. Keep pushing.',
        'We see your potential—now live up to it.',
        'The rise is exciting. The finish line is what matters.',
        'You are getting attention. Now earn it.',
        'Momentum is fragile. Protect it.',
        'You are on the upswing. Do not crash.'
      ]
    },
    
    [NARRATIVE_TAGS.REDEMPTION]: {
      positive: [
        'That is the comeback we needed from you.',
        'You took the note and came back fighting.',
        'This is what resilience looks like.',
        'You fell down and got back up stronger.',
        'Your redemption arc is one of the best stories this season.',
        'You proved that you can bounce back from anything.',
        'This is the queen we knew you could be.',
        'You turned criticism into fuel.',
        'Your journey is inspiring to watch.',
        'You have rewritten your narrative tonight.'
      ],
      negative: [
        'Redemption requires consistency. Keep it going.',
        'Do not let this comeback be a one-time thing.',
        'You have saved yourself once. Can you do it again?',
        'Redemption is earned, not given.',
        'You bounced back—now stay on top.',
        'This is a start, but you need to continue.',
        'One good week does not erase the past.',
        'You have momentum—use it wisely.',
        'Do not let this moment slip away.',
        'You have proven you can fight. Now prove you can win.'
      ]
    },
    
    [NARRATIVE_TAGS.WILDCARD]: {
      positive: [
        'With you, I never quite know what is coming next.',
        'Your unpredictability can be your power.',
        'You keep us all guessing—and it is thrilling.',
        'You are impossible to pin down, and that makes you dangerous.',
        'Your chaos is controlled, and I am living for it.',
        'You do things your own way, and it works.',
        'You are the wild card that could take it all.',
        'Your versatility is your secret weapon.',
        'You keep this competition fresh and exciting.',
        'Never change your unpredictable spirit.'
      ],
      negative: [
        'Unpredictability is exciting until it becomes unreliable.',
        'Chaos is fun, but so is consistency.',
        'You keep us guessing—now give us something to root for.',
        'Wildcards need to land the plane eventually.',
        'Your unpredictability can be a double-edged sword.',
        'We love the surprise, but we need the substance.',
        'You are a wildcard, but wildcards can get cut.',
        'Your chaos needs to be channeled into success.',
        'Being unpredictable is not the same as being great.',
        'Your trick is getting old. Give us more.'
      ]
    },
    
    [NARRATIVE_TAGS.FASHION]: {
      positive: [
        'The runway has become your playground.',
        'You know how to tell a story through a look.',
        'Your fashion choices are always a moment.',
        'You have an eye for style that is undeniable.',
        'The runway is where you truly shine.',
        'Every week, you elevate the standard of fashion.',
        'Your looks are art, and I am here for it.',
        'You understand the power of a silhouette.',
        'Fashion is your language, and you speak it fluently.',
        'You make the runway your own every single time.'
      ],
      negative: [
        'Fashion is important, but it is not everything.',
        'Your looks are stunning—now match them with performance.',
        'The runway can only carry you so far.',
        'You have the style, but where is the substance?',
        'Fashion queens need to be more than just pretty.',
        'Your looks are on point—your performances need to follow.',
        'The runway is one part of the competition. Remember that.',
        'You serve looks, but we need to see the talent behind them.',
        'Fashion fades. Talent lasts.',
        'You are a beautiful queen—now show us your depth.'
      ]
    },
    
    [NARRATIVE_TAGS.COMEDY]: {
      positive: [
        'You know how to make the room lean in and laugh.',
        'Comedy is becoming part of your signature.',
        'You have the timing of a true professional.',
        'Your wit is sharp and your delivery is flawless.',
        'You can make anything funny, and that is a gift.',
        'Comedy queens often win—you are on the right track.',
        'You have a natural comedic instinct.',
        'Your humor is both smart and accessible.',
        'You are not just funny—you are quick.',
        'You have turned comedy into your superpower.'
      ],
      negative: [
        'Comedy is your strength—dont forget the other elements.',
        'You are funny, but we need to see more versatility.',
        'Humor is great, but the crown requires more.',
        'You made us laugh—now make us gasp.',
        'Your comedy is solid. Your performance needs to match.',
        'Being funny is a skill. Being a winner requires more.',
        'Dont hide behind your humor. Show us everything.',
        'We love your wit—now show us your heart.',
        'Comedy can win, but it needs backup.',
        'You have the jokes. Now have the presence.'
      ]
    },
    
    [NARRATIVE_TAGS.PERFORMER]: {
      positive: [
        'The stage clearly feels like home to you.',
        'When performance is involved, you know how to wake up.',
        'You command the stage like a true professional.',
        'Your presence is magnetic and undeniable.',
        'You have the instinct to read a room.',
        'Every movement you make is intentional and powerful.',
        'You understand the assignment and then some.',
        'Your performance ability sets you apart.',
        'You are the queen everyone wants to see live.',
        'Performing is not just what you do—it is who you are.'
      ],
      negative: [
        'You can perform, but can you do more than that?',
        'Performance is your strength—now expand your range.',
        'You are dynamic on stage. Now bring that to other areas.',
        'Performing is one piece of the puzzle.',
        'You are a showstopper—but can you be more?',
        'We know you can perform. Show us you can win.',
        'Your performance skills are undeniable. Now give us depth.',
        'You command the stage. Now command the competition.',
        'Performing is your gift. Use it wisely.',
        'You are a performer—now be a contender.'
      ]
    },
    
    [NARRATIVE_TAGS.FADING]: {
      positive: [
        'You started strong, and I know you can get back there.',
        'Do not let your story peak too early.',
        'This is your chance to reignite the fire.',
        'You have shown us greatness. Rediscover it.',
        'Fading is not permanent—it is a choice.',
        'Your early success was no accident. Find it again.',
        'This is the moment to remind us who you are.',
        'You have the talent. Now access it.',
        'Every queen has a dip. Yours does not define you.',
        'Rekindle the spark before it goes out.'
      ],
      negative: [
        'You started strong, but I need to see that fire again.',
        'Do not let your story peak too early.',
        'You are losing momentum. Reclaim it.',
        'Your early success is fading. Wake up.',
        'The competition is getting harder—so must you.',
        'You have potential, but it is slipping away.',
        'Do not let this be your legacy.',
        'You were a frontrunner once. What happened?',
        'If you do not step up, you will be forgotten.',
        'Your trajectory is heading down. Reverse it.'
      ]
    },
    
    [NARRATIVE_TAGS.SURVIVOR]: {
      positive: [
        'You have proven you know how to fight for your place here.',
        'Surviving is not the same as thriving, but it still says something.',
        'You have been through the fire and you are still standing.',
        'Your resilience is admirable.',
        'You know how to weather the storm.',
        'You are a fighter, and that is worth respecting.',
        'You have survived again—now make it count.',
        'Your ability to escape elimination is a skill.',
        'You are tough, and that will carry you far.',
        'Survivors often become champions.'
      ],
      negative: [
        'Surviving is not winning. Step it up.',
        'You have survived—now start thriving.',
        'Being a survivor is not enough to take the crown.',
        'You escape danger, but do you create success?',
        'Survival is admirable, but it is not a strategy.',
        'You have the grit—now get the glory.',
        'Surviving is a start. Winning is the goal.',
        'You have avoided elimination—now prove you deserve to stay.',
        'Your survival instinct is strong. Your winning instinct? Not yet.',
        'You are here, but are you competing?'
      ]
    }
  };
  
 const external = gameState.data?.narrativeExpansion?.rupaulComments 
  || gameState.data?.narrativeText?.rupaulComments 
  || {};

const pick = tags.find(t => external[t] || lines[t]);

if (pick) {
  const tone = bottom ? 'negative' : 'positive';
  const source = external[pick] || lines[pick];
  const pool = source?.[tone] || source?.positive || source?.negative || [];
  return sample(pool);
}
  if(bottom)return sample(['This competition is getting tougher, and I need you to fight.','We need more from you, because I believe there is more there.']);
  if(positive)return sample(['This week, you made a real impression.','You should feel proud of what you showed us.']);
  return sample(['You are safe, but do not get too comfortable.','Keep pushing. We are still watching.']);
}
function narrativeEventForEpisode(stage='workroom'){
  const ep=gameState.currentEpisode;
  if(!ep)return null;
  const key=stage==='untucked'?'narrativeUntuckedEvent':'narrativeWorkroomEvent';
  if(ep[key])return ep[key];
  recalcNarrativeTags();
  const active=(gameState.queens||[]).filter(q=>!q.isEliminated);
  if(!active.length)return null;
  const threats=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.COMPETITIVE_THREAT)&&!hasNarrativeTag(q,NARRATIVE_TAGS.FRONT_RUNNER));
  const assassins=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.LIP_SYNC_ASSASSIN));
  const favorites=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.FAN_FAVORITE));
  const fillers=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.FILLER));
  const villains=active.filter(q=>hasNarrativeTag(q,NARRATIVE_TAGS.VILLAIN));
  let text='';
  const roll=Math.random();
  if(threats.length && roll<.25){ const q=sample(threats); text=`The room clocks ${q.name} as a real competitive threat.`; applyChoiceEffects({stress:3},{queen:q,note:text,source:'narrative-pulse',save:false}); }
  else if(assassins.length && roll<.45){ const q=sample(assassins); text=`Nobody looks thrilled at the idea of facing ${q.name} in a lip sync.`; applyChoiceEffects({production:1},{queen:q,note:text,source:'narrative-pulse',save:false}); }
  else if(favorites.length && roll<.65){ const q=sample(favorites); text=`The cast can feel how easy it is to root for ${q.name}.`; applyChoiceEffects({fans:1},{queen:q,note:text,source:'narrative-pulse',save:false}); }
  else if(villains.length && roll<.82){ const q=sample(villains); text=`${q.name} says one sentence and somehow the whole room has a reaction.`; applyChoiceEffects({production:2},{queen:q,note:text,source:'narrative-pulse',save:false}); }
  else if(fillers.length){ const q=sample(fillers); text=`${q.name} quietly realizes she needs a moment before the season moves past her.`; applyChoiceEffects({stress:4},{queen:q,note:text,source:'narrative-pulse',save:false}); }
  if(!text)return null;
  ep[key]={text,type:'narrative'};
  return ep[key];
}
