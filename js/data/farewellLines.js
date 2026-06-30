// Reusable farewell copy for lip sync results.
// Kept deliberately lightweight: arrays are sampled by js/ui/lipsync.js.
window.GAME_DATA = window.GAME_DATA || {};
window.GAME_DATA.farewellLines = {
  rupaulIntros: [
    'The time has come...',
    'Ladies, I have made my decision.',
    'After that lip sync, one thing is clear.',
    'My queens, the decision has been made.',
    'That was the final beat. Now comes the decision.'
  ],
  rupaulThanks: [
    'Thank you for sharing your {talent} with {quality}.',
    'We will always remember your {talent}, your {quality}, and your place in this competition.',
    'You brought {talent} to this stage with {quality}.',
    'Your {talent} has left a mark on this competition.',
    'Never forget the {quality} you brought into this room.'
  ],
  talentsByType: {
    fashion: ['runway vision', 'fashion fantasy', 'eye for silhouette', 'sense of style'],
    comedy: ['comic timing', 'sharp wit', 'confessional magic', 'sense of humor'],
    dancing: ['stage fire', 'performance power', 'rhythm', 'movement'],
    pageant: ['polish', 'pageant grace', 'command of the stage', 'poise'],
    camp: ['camp chaos', 'larger-than-life humor', 'absurdity', 'theatrical madness'],
    alternative: ['strange beauty', 'point of view', 'artistic nerve', 'underground magic'],
    weird: ['beautiful nonsense', 'glorious strangeness', 'alien signal', 'unfiltered weirdness'],
    look: ['visual identity', 'makeup fantasy', 'face card', 'beauty language'],
    acting: ['acting instincts', 'character work', 'dramatic flair', 'storytelling'],
    singing: ['voice', 'musicality', 'vocal confidence', 'stage melody'],
    social: ['heart', 'connection', 'warmth', 'presence'],
    default: ['charisma, uniqueness, nerve and talent', 'drag', 'artistry', 'spark']
  },
  qualitiesByPersonality: {
    shy: ['quiet strength', 'grace', 'sincerity', 'soft power'],
    confident: ['nerve', 'confidence', 'star power', 'boldness'],
    professional: ['discipline', 'focus', 'polish', 'precision'],
    strategic: ['calculation', 'focus', 'ambition', 'competitive intelligence'],
    kind: ['heart', 'warmth', 'generosity', 'kindness'],
    chaotic: ['chaos', 'unpredictability', 'television energy', 'wild nerve'],
    shady: ['bite', 'edge', 'sharpness', 'nerve'],
    dramatic: ['drama', 'theatrics', 'emotional fire', 'grand emotion'],
    weird: ['unhinged sparkle', 'mystery', 'delightful confusion', 'cosmic nonsense'],
    default: ['passion', 'nerve', 'heart', 'presence']
  },
  queenExitByPersonality: {
    shy: [
      '"Thank you, Ru. Finding my voice on this stage was the real crown for me."',
      '"I was terrified every single day, but I did it anyway. Thank you, Mama Ru."',
      '"My voice might have shaken, but my drag spoke volumes. Thank you for listening."',
      '"I never thought I\'d have the courage to stand here. Thank you for seeing me, Ru."',
      '"Thank you, judges. You helped me realize that I actually belong in this room."',
      '"I may be leaving softly, but I\'m leaving so much stronger than I arrived."',
      '"Thank you, Mama. I was too scared to say it before, but you changed my life."',
      '"To the other queens: thank you for holding my hand when the lights got too bright."',
      '"My heart is beating so fast right now... but it\'s full of gratitude. Thank you, Ru."',
      '"I didn\'t need to be the loudest queen to feel your love. Goodbye, sisters."'
    ],
    
    confident: [
      '"The crown will miss me, honestly. But thank you for the runway, Ru."',
      '"I\'m still that girl, Ru. And no elimination can change a face this beautiful."',
      '"Don\'t cry for me, girls. I\'m far too expensive for tears."',
      '"I came, I served, and I left you all wanting more. You\'re welcome."',
      '"Thank you, Ru. You\'re letting go of the best thing this season had, but I still love you."',
      '"No regrets, Mama. Every camera angle was my good angle anyway."',
      '"Michelle, I know you\'re going to miss looking at perfection every week. Thank you."',
      '"The competition just lost its leading lady. Try not to be too boring without me."',
      '"Thank you, Ru. I don\'t need a crown to prove I\'m the main character."',
      '"Good luck, girls. You\'re finally safe from the prettiest queen in the room."'
    ],

    professional: [
      '"Thank you for the masterclass, Ru. It has been an absolute honor to work with you."',
      '"No excuses, no regrets. Just a flawless resume and better lighting next time."',
      '"I came here as a professional, and I leave as one. The work speaks for itself."',
      '"Thank you, judges. Your feedback was the best investment I could make in my career."',
      '"To the crew and production: thank you for your hard work. Keep the cameras rolling."',
      '"This wasn\'t the outcome I signed up for, but the execution was seamless. Thank you, Ru."',
      '"Michelle, thank you for pushing me to my absolute limits. I appreciate the discipline."',
      '"I set the standard in that Werk Room. I hope the remaining girls can maintain it."',
      '"Thank you, Mama Ru. My contract for this season is up, but the brand is just beginning."',
      '"I leave with my head held high, my bills paid, and my reputation intact. Goodbye, ladies."'
    ],

    strategic: [
      '"Smart move. You just chopped the biggest threat to the crown."',
      '"Thank you, Ru. I guess my storyline for this season is officially wrapped."',
      '"A flawless blindside. As a fan of the game, I have to respect it."',
      '"I’m already drafting my All Stars alliances in my head. Well played."',
      '"To my alliance: avenge me. To everyone else: sleep with one eye open."',
      '"Thank you, Ru. I can’t wait to see how the producers edit this outcome."',
      '"I gave you the track record and the TV gold. My job here is done."',
      '"Congratulations, girls. Your chances of winning just went up drastically."',
      '"I played the game, but tonight the twist played me. Respect, Mama Ru."',
      '"You outplayed me, RuPaul. And I have nothing but respect for the mastermind. Bye!"'
    ],
    
    kind: [
      '"Ru, I\'m leaving with so much love in my heart."',
      '"I hope I brought kindness to this competition. Thank you for having me."',
      '"I\'m sad to go, but I\'m so proud of every queen here. Thank you, Ru."',
      '"I came to spread love, and I did. That\'s a win in my book."',
      '"Thank you for this beautiful experience, Ru. I\'ll carry it forever."',
      '"I love these girls. I love this show. Thank you for everything, Mama."',
      '"Michelle, you\'re tough but you\'re fair. I appreciate that so much."',
      '"To every queen here: you\'re all stars. Keep shining. I\'ll be cheering for you."',
      '"I\'m leaving with a full heart and teary eyes. But it\'s happy tears, Ru."',
      '"I came to make friends and make art. I did both. I\'m so grateful."'
    ],
    
    chaotic: [
      '"Wait, is the camera still on? Ru, thank you for the trauma! Stream my single on Spotify!"',
      '"I left a sandwich hidden inside the werkroom walls. Do not eat it. Goodbye!"',
      '"Ru, thank you for not calling the police on me tonight. You\'re a true sister."',
      '"I don\'t even know who I am anymore. Where are my keys? Thank you, Mama!"',
      '"Michelle, I stole your notebook! To the other queens: burn the building down!"',
      '"I came, I screamed, I misplaced a shoe. Someone call my lawyer! Bye!"',
      '"Thank you, Ru! If anyone needs me, I\'ll be living in the ceiling tiles!"',
      '"You think you got rid of me? I\'m literally going to hide in the background of the next episode."',
      '"Is this the part where I jump off the stage? No? Okay, love you, Ru!"',
      '"This was terrible, I had a blast, everything hurts, thank you so much! *runs away*"'
    ],

    dramatic: [
      '"The curtain falls, Ru. But remember: a star is born from the ashes of her own destruction. This legend lives on."',
      '"Do not weep for me, Mama Ru. I have survived poverty, heartbreak, and a terrible hairline to stand on this stage tonight."',
      '"I grew up singing in the rain just to feel something, Ru. This elimination? It is just another beautiful, tragic storm."',
      '"My grandmother told me before she passed: \"Never let them see you stumble.\" Well, I am not stumbling, Ru. I am floating away."',
      '"The tragedy of it all! You have cut the wings off the only angel who truly knew how to fly in this competition. Goodbye, world."',
      '"I came here with nothing but a dream, a hot glue gun, and a broken heart. Thank you for giving my trauma a spotlight, Ru."',
      '"Michelle, I know your soul is weeping behind that cold exterior. To the other queens: look at what you have done to me!"',
      '"This is not an exit, Ru. This is an operatic, heartbreaking intermission before the final, glorious act of my destiny."',
      '"I was abandoned at a bus stop of life, Mama Ru, but you gave me a home on this runway. I leave you my tears."',
      '"As I walk out those doors, a piece of my soul stays trapped in these floorboards forever. Remember my name, for it is written in blood."'
    ],

    funny: [
      '"Well, that was a choice! Thank you for the trauma, Ru!"',
      '"I\'m going home, but honestly? The catering here was worth it."',
      '"At least my confessionals will carry this entire season. Bye, girls!"',
      '"Ru, can I borrow twenty bucks for the Uber home?"',
      '"Who needs a crown when you can just make memes on Twitter?"',
      '"Michelle, I\'ll miss your side-eye. It was almost as harsh as my makeup."',
      '"I\'ll be watching from home with popcorn and a magnifying glass."',
      '"I\'m leaving, but I\'m still funnier than half these girls. Love you, Ru!"',
      '"I\'ll be at the hotel bar if anyone needs to buy me a coping mechanism."',
      '"Thank you, Ru! If you can\'t laugh at yourself... watch me get chopped!"'
    ],
    
    competitive: [
      '"I fought for every inch of this stage, Ru. Thank you for the battle."',
      '"This isn\'t defeat, Mama. It\'s just fuel for my comeback."',
      '"The fiercest competitor just left the building. Good luck, ladies."',
      '"I didn\'t come here to make friends, but I sure gave you a run for your money."',
      '"You haven\'t seen the last of me, Ru. I\'m already training for All Stars."',
      '"Enjoy the head start, girls. I\'ll see you at the finish line."',
      '"I hate losing, but I respect a good fight. Thank you, Mama Ru."',
      '"Thank you, judges. You made me work harder than I ever have."',
      '"I left everything on that runway. I leave with my head held high."',
      '"Keep the crown warm for me, Ru. I\'ll be back to claim it."'
    ],

    calculating: [
      '"Every move I made had a purpose. Even this exit. Thank you, Ru."',
      '"I checked the board, but I simply ran out of moves. Well played."',
      '"The game is long, Ru. I\'m a very patient player. See you at All Stars."',
      '"To the other queens: I\'ve been watching you. I know your tells."',
      '"This wasn\'t my favorite ending, but I respect the strategy. Thanks, Ru."',
      '"You chopped a mastermind tonight, Ru. The remaining girls should thank you."',
      '"I anticipated this risk. I just had a different timeline in mind."',
      '"Good luck, girls. You\'re going to need a better strategy without me here."',
      '"A temporary setback on the board. Thank you for the masterclass, Ru."',
      '"You win some, you lose some. The tournament isn\'t over yet."'
    ],

    perfectionist: [
      '"My drag was flawless, Ru. The judges just missed the details."',
      '"Every stitch was in place. I leave with absolutely zero regrets."',
      '"Thank you, Ru. I hold myself to a standard, and I met it tonight."',
      '"Thank you, Michelle. For noticing every detail. Thank you Ru"',
      '"This wasn\'t the outcome I planned, but the execution was immaculate."',
      '"Excellence doesn\'t come easy, girls. It takes work. Goodbye."',
      '"Thank you, Ru. I hope you saw the artistry in my precision."',
      '"I spent hours making this perfect. I’m glad you got to see it."',
      '"The placement was right, the face was right. I’m content. Thank you, Ru."',
      '"Even my exit line was rehearsed. Thank you for the stage, Mama."'
    ],

    reserved: [
      '"Thank you, Ru. I let my drag do the talking."',
      '"I’m not good with goodbyes. Thank you for everything."',
      '"I may not speak much, but I’ve heard everything. Thank you."',
      '"Quietly, I leave my mark. Thank you, Mama."',
      '"Thank you, Ru. Being here was a privilege."',
      '"I didn\'t need to scream to be seen. Goodbye, girls."',
      '"My heart is full. I leave the rest to the silence. Thank you."',
      '"You all have such voices. I enjoyed watching from the shadows."',
      '"Thank you, Ru. My journey ends here, but my art continues."',
      '"No words. Just gratitude. Thank you, Mama Ru."'
    ],

    ambitious: [
      '"Thank you, Ru. You didn\'t eliminate a queen, you just launched a brand."',
      '"I didn\'t get the check, but I got the platform. Watch what I do next."',
      '"This crown was just a stepping stone. My empire is still building."',
      '"Thank you, Mama Ru. The world is my runway now."',
      '"You\'ll see my name in lights, Ru. This was just the trailer."',
      '"I didn\'t win the title, but I\'m still leaving as a superstar. Thank you."',
      '"Thank you for the masterclass, judges. Now, it\'s time to book the world tour."',
      '"The hustle never stops, Ru. Check iTunes tomorrow!"',
      '"Thank you, Mama. I came for a crown, but I\'m leaving with a global market."',
      '"Enjoy the show, girls. I\'m going out there to dominate the industry."'
    ],

    charming: [
      '"I may lose the crown, Ru, but I always win the hearts. Mwah!"',
      '"Thank you, Mama Ru. Keep smiling, it looks gorgeous on you."',
      '"It\'s been an absolute pleasure disappointing you all!"',
      '"Don\'t cry, girls. It ruins the makeup, and you\'re all too pretty."',
      '"Thank you, Ru. I\'ll leave you with my favorite asset: *winks*"',
      '"I came for the crown, but I\'m leaving with a room full of sisters."',
      '"Thank you, judges. I hope I gave you something beautiful to remember."',
      '"You haven\'t seen the last of me, Ru. I\'m way too delightful to forget."',
      '"Thank you, Mama! I\'ll be blowing kisses all the way down the runway."',
      '"This was a dream. Thank you for making me sparkle, Ru."'
    ],

    sweet: [
      '"Ru, thank you for this sweet, beautiful experience."',
      '"I came to spread sweetness and love. I hope I succeeded."',
      '"I\'m sad, but I\'m so grateful. Thank you for everything, Mama Ru."',
      '"Sweetness isn\'t weakness. I hope I proved that. Thank you, Ru."',
      '"I\'ll always cheer for these girls. And I\'ll always cheer for you, Ru."',
      '"Thank you for letting a sweet queen share her heart on this stage."',
      '"Michelle, you\'re tough but I know you have a soft spot. Thank you for everything."',
      '"To all the queens: I love you all. I\'m going to miss you so much."',
      '"I\'m leaving with a full heart and a smile. That\'s all I needed."',
      '"I came to spread joy and I\'m leaving with so much of it. Thank you."'
    ],
    
    sarcastic: [
      '"Thank you, Ru. I\'m just so thrilled to go take a nap. Truly."',
      '"I\'ll miss you, Ru. I\'ll even miss Michelle\'s turtlenecks."',
      '"At least the fans can call me \"robbed\" on Twitter. Thanks, Ru."',
      '"Thank you for the feedback, judges. I\'ll completely ignore it."',
      '"Don\'t look so sad, girls. Now you actually have a chance to win."',
      '"Thank you, Ru. This lighting was doing terrible things to my skin."',
      '"Oh, what a devastating turn of events. Anyway, where\'s my Uber?"',
      '"Thank you, Ru. I can\'t wait to watch the rest of this on mute."',
      '"I\'ll write on the mirror. Or just draw a stick figure. We\'ll see."',
      '"Don\'t cry, girls. It\'s not like any of you are going to win either."'
    ],
    
    'hot-headed': [
      '"..."',
      '"I have nothing to say. But thank you."',
      '"I\'m not crying, Ru. I\'m just pissed. But thank you for the stage."',
      '"This decision is garbage, but you\'re still iconic, Ru. Bye."',
      '"I\'m not going to fake a smile. This sucks. Thank you for the opportunity anyway, Mama."',
      '"Enjoy the peace and quiet, girls, because the show just got boring. Thank you, Ru."',
      '"Whatever. I\'ll see you bitches at the reunion. Thank you, Mama Ru."',
      '"Are we done? Great."',
      '"My drag was too much for them, Ru. Thanks for letting me show it."',
      '"I came to fight, not to make friends. Congratulations on getting rid of the competition. Bye!"',
      '"I\'m too mad to write on that mirror, so don\'t even look for it. Thank you, Ru!"',
      '"They wanted me out since day one because they couldn\'t take the heat. Thank you, Mama."',
      '"This wasn\'t a fair fight. But I respect you, Ru. Good luck, girls."',
      '"You just chopped the biggest fighter in this room. Keep the crown, I\'ll take my dignity. Thank you!"'
    ],
    
    fearless: [
      '"I don\'t fear elimination, Ru. I fear regret. I have none."',
      '"Bravery isn\'t winning. It\'s showing up. I showed up, Ru."',
      '"I came here fearless and I leave fearless. Thank you, Mama."',
      '"Fear never stopped me, Ru. And it won\'t start now. Thank you."',
      '"I faced every challenge head on. That\'s all I could do. Thank you, Ru."',
      '"The crown wasn\'t ready for my boldness. That\'s okay. I was ready for me. Thank you."',
      '"Michelle, I know I scared you sometimes. GOOD. That means I was doing it right."',
      '"To the other queens: be fearless. It\'s the only way to live."',
      '"I took every risk. I don\'t regret a single one. Thank you, Ru."',
      '"I came. I conquered. I left. And I\'m not afraid of any of it. Thank you, Ru."'
    ],
    
    humble: [
      '"Ru, I\'m just grateful to have been here at all."',
      '"I never thought I\'d make it this far. Thank you for believing in me."',
      '"Every queen here taught me something. That\'s more valuable than any crown."',
      '"I leave with nothing but gratitude and humility. Thank you, Mama Ru."',
      '"I didn\'t need to win to feel like a winner. Thank you for this experience."',
      '"This was a privilege, not a right. Thank you for letting me be here, Ru."',
      '"Michelle, thank you for your honesty. It made me better."',
      '"To the other queens: you\'re all incredible. I learned from every single one."',
      '"Thank you, Ru. I\'ll never forget the opportunity you gave me."',
      '"I leave with so much respect for everyone here. Thank you for everything."'
    ],

    eccentric: [
      '"The mothership is calling me home, Ru! Thank you for this earthly experience!"',
      '"I just have one word to say: SHROOOMBLES! Bye!"',
      '"I am leaving. But I am also staying. I am in a superposition of both. Goodbye... for now."',
      '"The colors are speaking to me again. They say: LEAVE. So I\'m leaving. Thank you, Ru."',
      '"I am not leaving. I am simply choosing to exist elsewhere. Thank you, Mama Ru."',
      '"Ru, thank you for letting me eat bugs on your stage. My mother will be so proud."',
      '"I left a potato named Susan under my work station. Please feed her. Goodbye!"',
      '"Thank you, Mama Ru. May your inner child forever ride a unicycle through a sea of mayonnaise."',
      '"My soul is full, my heels are high, and my third eye is crying. Thank you for the cosmic journey, Ru."',
      '"The simulation is glitching. Look at the wall! *points dramatically to nothing and runs away*"',
      '"I came to this planet for love, and I found it. Thank you, Ru. Tell the cats I said hello."',
      '"Remember: if the shoes don\'t fit, wear them on your ears. Thank you for everything!"',
      '"I didn\'t win the crown, but I won a very deep conversation with that spotlight. We\'re dating now."',
      '"May your wigs be flammable and your dreams be moist. Thank you, Mama!"',
      '"My drag is like an onion: it has layers, it makes you cry, and it smells like a basement. Thank you, Ru!"'
    ],
    
    default: [
      '"Thank you, Ru. This has been an incredible journey."',
      '"I\'m proud of what I brought to this stage. Thank you, Mama."',
      '"This isn\'t goodbye. It\'s see you later. Thank you, RuPaul."',
      '"I came, I served, I left. And I have no regrets. Thank you, Ru."',
      '"Every moment here was a gift. Thank you for everything, Mama."',
      '"I\'ll carry this experience forever. Thank you, Ru."',
      '"I gave it my all. That\'s all anyone can ask. Thank you, Mama."',
      '"I\'m leaving with my head held high and my heart full. Thank you, Ru."',
      '"This was the opportunity of a lifetime. Thank you for it, Mama."',
      '"I\'m grateful. I\'m proud. I\'m ready for whatever comes next. Thank you, Ru."'
    ]
  }, // Chave do objeto queenExitByPersonality fechando corretamente e com vírgula!
  ruFinale: [
    "If you can't love yourself, how in the hell are you gonna love somebody else? Can I get an amen?",
    "Remember, if you can't love yourself, how in the hell are you gonna love somebody else? Can I get an amen?",
    "As always, if you can't love yourself, how in the hell are you gonna love somebody else? Can I get an amen?"
  ]
};