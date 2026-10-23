// v31.5: extra entrance content. The original lines stay in js/ui/entrance.js; this file only adds.
window.GAME_DATA = window.GAME_DATA || {};
window.GAME_DATA.entranceLines = {
  // Real queens' catchphrases (in entrance.js) appear this often.
  easterEggChance: 0.05,

  // For shy, reserved, humble, sweet and kind queens.
  soft: [
    'Um... hi. Is this where the werkroom is?',
    'I practiced this entrance in the mirror forty times. Hi!',
    'Hello! Please be nice to me. I bruise easily.',
    'I am so nervous I forgot my line. Hi, I am {name}.',
    'Wow. It is even prettier than on TV.',
    'I brought a little card for everyone. Is that weird?',
    'Quiet entrance, loud drag. Hi.',
    'Hi... sorry. Am I early?'
  ],

  // One personality's own lines, added to her pool.
  byPersonality: {
    shy: ['I can do this. I can do this. Hi, everyone.', 'I am more of a runway talker than a werkroom talker.'],
    reserved: ['I will introduce myself properly once I have read the room.', 'Good evening.'],
    humble: ['Just happy to be here, honestly.', 'Hi, everyone. Let us all have a good time.'],
    sarcastic: ['Wow. The bar is on the floor and I brought a shovel.', 'Oh good, the competition is... here.'],
    hotheaded: ['Somebody already looked at me funny and I have been here two seconds.', 'Let us skip the small talk. Who wants smoke?'],
    funny: ['I tripped on the way in, but I made it look like choreography.', 'Is this the line for the free crown?'],
    eccentric: ['I came from the future to warn you: I win.', 'My look tonight is "a Victorian ghost at a rave."'],
    perfectionist: ['Whoever hung that mirror: it is crooked. Hi.', 'I steamed this outfit three times in the car.'],
    charming: ['Hello, gorgeous. And gorgeous. And you, gorgeous.', 'I already love every single one of you.'],
    ambitious: ['I did not come to make friends. I came to make history.', 'Season winner, reporting for duty.']
  },

  // The first queen to walk in.
  firstIn: [
    'First queen in the werkroom.',
    'The werkroom is empty. For now.',
    'She has the whole room to herself, for about thirty seconds.'
  ],

  // How the queens already in the room react to the new arrival.
  // warm: she likes the newcomer, shade: she does not, neutral: no opinion yet.
  // {reactor} = the queen reacting, {name} = the one walking in.
  reactions: {
    warm: [
      '{reactor} screams and runs for a hug.',
      '{reactor}: "Okay, I already love her."',
      '{reactor} claps like it is the finale.',
      '{reactor}: "We are going to be best friends, I can tell."',
      '{reactor} fans herself. "The look!"'
    ],
    shade: [
      '{reactor} looks her up and down. Twice.',
      '{reactor}, under her breath: "Oh. Her."',
      '{reactor}: "Cute. Did she make that herself?"',
      '{reactor} suddenly finds her own nails very interesting.',
      '{reactor}: "Well, at least I am not the worst-dressed anymore."',
      '{reactor} whispers something that makes the girl next to her gasp.'
    ],
    neutral: [
      '{reactor} gives a polite wave.',
      '{reactor}: "Hi, welcome!"',
      '{reactor} sizes up the competition.',
      '{reactor} nods. Noted.',
      '{reactor}: "Okay, hi."'
    ]
  }
};
