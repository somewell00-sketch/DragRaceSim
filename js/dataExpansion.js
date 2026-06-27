// v31 — Narrative Expansion
// This file keeps the expanded narrative text banks active when the game is opened directly from index.html.
// Edit this file for runway narration, judge comments, lipsync narration, social sparks, finale text and other narrative banks.
(function(){
  const expansion = {
  "runwayDescriptions": {
    "legendary": [
      "turned the runway into a coronation rehearsal.",
      "made the category feel richer than it had any right to be.",
      "gave a look the judges will still be referencing next season.",
      "walked out and made the lighting department look expensive.",
      "served a complete fashion sentence with punctuation.",
      "made every step feel like a magazine cover."
    ],
    "great": [
      "sold the fantasy and kept the styling sharp.",
      "understood the assignment and added personality.",
      "looked polished, intentional, and fully present.",
      "gave the category a clean point of view.",
      "made a strong visual case for herself.",
      "brought taste without losing drag."
    ],
    "safe": [
      "looked good without creating a true moment.",
      "kept it clean, but not unforgettable.",
      "gave a pleasant version of the category.",
      "crossed the runway without causing a crime or a crown.",
      "did enough to stay in the conversation.",
      "served solid, if not spectacular."
    ],
    "mixed": [
      "had a strong idea, but the edit needed tightening.",
      "brought pieces of a moment, not the full fantasy.",
      "looked interesting, but not fully resolved.",
      "made the judges look twice, then wonder why.",
      "had charm, but the silhouette needed a stronger choice."
    ],
    "weak": [
      "let the category get bigger than the look.",
      "needed more polish before hitting the main stage.",
      "had presence, but the outfit was doing side quests.",
      "gave concept without enough finish.",
      "needed a clearer fashion decision."
    ],
    "flop": [
      "missed the category and the emotional support hem.",
      "looked like the fantasy left in an Uber.",
      "made the runway feel longer than it was.",
      "served emergency sewing with confidence.",
      "needed a rescue mission and a steamer."
    ]
  },
  "judgeComments": {
    "michelle": {
      "positive": [
        "The work is focused, intentional, and very you.",
        "I can see the preparation in every choice.",
        "This is the kind of polish we have been asking for.",
        "You came in with a point of view and stayed with it."
      ],
      "safe": [
        "Nothing here is wrong, but I want a stronger signature.",
        "You are giving us clean work. Now give us a moment.",
        "It is competent, but I need more nerve.",
        "You are close; now stop editing yourself so much."
      ],
      "negative": [
        "I know you can do more than what you gave tonight.",
        "The idea was there, but the execution did not support it.",
        "You needed one clear choice and you gave us three half-choices.",
        "The polish is not matching your ambition yet."
      ]
    },
    "ross": {
      "positive": [
        "You made it fun without losing control.",
        "I was smiling because you knew exactly what you were doing.",
        "That had rhythm, charm, and a real sense of play.",
        "You brought the room into your world."
      ],
      "safe": [
        "I enjoyed parts of it, but I wanted one more surprise.",
        "It was nice. I just want it to become delicious.",
        "You kept us with you, but you did not take us anywhere unexpected."
      ],
      "negative": [
        "I wanted to laugh with you more than I did.",
        "The room was ready to go there, but you never fully invited us in.",
        "The timing kept getting in your way."
      ]
    },
    "carson": {
      "positive": [
        "The styling is doing exactly what it needs to do.",
        "The silhouette is clear and the details are considered.",
        "You look expensive, and more importantly, intentional.",
        "This is a polished presentation from head to toe."
      ],
      "safe": [
        "The look is pretty, but pretty is not always enough.",
        "I wanted one more visual surprise.",
        "The styling is clean, but the story is a little quiet."
      ],
      "negative": [
        "The proportions are fighting you.",
        "The look needed editing before it reached the runway.",
        "The pieces are not speaking the same language."
      ]
    },
    "guest": {
      "positive": [
        "I do not know if it was perfect, but I loved watching it.",
        "Something about you is very easy to root for.",
        "You gave me a moment I will remember.",
        "I was charmed, even when it got a little messy."
      ],
      "mixed": [
        "I liked the idea more than the full execution.",
        "There was something there, and I wanted it pushed further.",
        "I was rooting for it, but it needed one more spark."
      ],
      "negative": [
        "I could see your heart, but the moment did not fully arrive.",
        "I wanted your confidence to match the idea.",
        "I do not think this showed your full potential."
      ]
    }
  },
  "rupaulComments": {
    "front-runner": [
      "You reminded everyone why you are one of the queens to beat.",
      "When you set the bar high, we hold you to it.",
      "Week after week, you keep shaping this competition."
    ],
    "competitive threat": [
      "Every queen in this room knows you are dangerous.",
      "You are still very much in this race.",
      "The crown has had its eye on you for a while."
    ],
    "lip sync assassin": [
      "When the music starts, something in you wakes up.",
      "You have shown us that you know how to fight.",
      "No one should feel comfortable facing you on that stage."
    ],
    "fan favorite": [
      "There is something about you people want to root for.",
      "The audience connects with you, and I can see why.",
      "You have a warmth that reaches past the runway."
    ],
    "villain edit": [
      "Whether people agree with you or not, they cannot stop watching you.",
      "You always make us feel something.",
      "You understand that television needs a pulse."
    ],
    "filler queen": [
      "Do not let this competition pass you by.",
      "We know there is more to you. Let us see it.",
      "Safe is not a legacy."
    ],
    "rising star": [
      "You are becoming clearer and more confident every week.",
      "This is the growth we have been waiting to see.",
      "You are starting to believe your own story."
    ],
    "redemption arc": [
      "That is the comeback we needed from you.",
      "You took the note and came back fighting.",
      "Tonight changed the direction of your story."
    ],
    "wildcard": [
      "With you, I never quite know what is coming next.",
      "Your unpredictability can be your power.",
      "The surprise is only useful when you control it."
    ],
    "survivor": [
      "You have proven you know how to fight for your place here.",
      "Surviving is not the same as thriving, but it still says something.",
      "You have been tested, and you are still standing."
    ]
  },
  "lipsyncNarration": {
    "close": [
      "It came down to tiny details.",
      "Both queens fought until the final beat.",
      "The decision lived in the smallest moments.",
      "Neither queen let the other breathe."
    ],
    "clear": [
      "One queen slowly pulled ahead.",
      "The performance found a clear leader.",
      "By the final chorus, the stronger story was obvious.",
      "The stage started leaning one way."
    ],
    "dominant": [
      "From the first beat, one queen owned the stage.",
      "The winner made the choice feel obvious.",
      "It became less of a duel and more of a takeover.",
      "One performance swallowed the room."
    ],
    "weak": [
      "The song deserved more fire.",
      "The duel never fully took off.",
      "Both queens struggled to find the moment."
    ],
    "doubleShantay": [
      "Neither queen gave an inch.",
      "The room could not choose a loser.",
      "Both queens made a case for staying."
    ],
    "doubleSashay": [
      "Neither performance met the moment.",
      "The song waited for a spark that never came.",
      "The stage needed more than either queen gave."
    ]
  },
  "socialSparks": {
    "friendly": [
      "{a} helps {b} settle her nerves before rehearsal.",
      "{a} and {b} find a tiny joke that breaks the room open.",
      "{a} quietly tells {b} she believes in her."
    ],
    "shade": [
      "{a} clocks {b}'s confidence and calls it a full-time job.",
      "{a} says {b} is brave for wearing that much certainty.",
      "{a} gives {b} a compliment with a knife tucked inside."
    ],
    "conflict": [
      "{a} and {b} clash over who keeps interrupting rehearsal.",
      "{a} feels like {b} is taking too much space.",
      "{a} says {b} is playing for cameras, not the challenge."
    ],
    "strategy": [
      "{a} starts wondering if {b} is becoming too dangerous.",
      "{a} clocks that {b} may be the one to beat.",
      "{a} quietly builds a little trust with {b}."
    ]
  },
  "relationshipShifts": {
    "positive": [
      "{a} leaves the conversation trusting {b} a little more.",
      "{a} respects the way {b} handled the pressure.",
      "A small moment between {a} and {b} feels surprisingly sincere."
    ],
    "negative": [
      "{a} walks away from {b} with a colder read.",
      "{a} is starting to question {b}'s intentions.",
      "The tension between {a} and {b} gets harder to ignore."
    ],
    "rivalry": [
      "{a} and {b} may not be saying rivalry yet, but the edit is.",
      "The room can feel a line forming between {a} and {b}."
    ],
    "friendship": [
      "{a} and {b} look less like competitors for a second and more like sisters.",
      "The bond between {a} and {b} starts to feel real."
    ]
  },
  "confessionals": {
    "win": [
      "I came here for a crown, not a participation ribbon.",
      "This is the week the judges finally saw the full fantasy.",
      "Winning feels correct. I am not going to apologize for that."
    ],
    "safe": [
      "Safe is cute once. Safe is not a brand.",
      "I survived, but I need the camera to remember me next week.",
      "I am still here, but I need to make noise."
    ],
    "low": [
      "That critique stung because part of me knows they were right.",
      "I did not come here to fade this early.",
      "I need to turn this around before the edit turns on me."
    ],
    "bottom": [
      "The lip sync is not where I wanted to be, but it is where I have to prove myself.",
      "If I have to fight, I am fighting in lashes.",
      "Tonight got real very quickly."
    ]
  },
  "finaleNarratives": {
    "frontRunner": [
      "She entered the finale as one of the queens everyone wanted to beat.",
      "Her track record made her impossible to ignore."
    ],
    "fanFavorite": [
      "Her warmth and authenticity kept the audience rooting for her.",
      "The fans found something in her they wanted to protect."
    ],
    "lipSyncAssassin": [
      "Every time the music started, she reminded everyone why she was still here.",
      "She turned survival into a signature."
    ],
    "villain": [
      "Whether loved or feared, she made sure nobody forgot her.",
      "She kept the spotlight firmly on herself, even when the room pushed back."
    ],
    "competitiveThreat": [
      "Week after week, she proved she could excel no matter what the competition demanded.",
      "She pushed the competition from beginning to end."
    ],
    "redemption": [
      "She stumbled, adjusted, and finished stronger than ever.",
      "Her run became a comeback story."
    ]
  },
  "narrativeTags": {
    "front-runner": {
      "description": "Best current track record or close to it.",
      "ruTone": "high expectations"
    },
    "competitive threat": {
      "description": "Not necessarily leading, but still very viable for the crown.",
      "ruTone": "dangerous"
    },
    "lip sync assassin": {
      "description": "Strong lip sync record or high lip sync strength under pressure.",
      "ruTone": "fighter"
    },
    "fan favorite": {
      "description": "Strong public connection.",
      "ruTone": "warm"
    },
    "villain edit": {
      "description": "Polarizing, high-TV, conflict-heavy queen.",
      "ruTone": "watchable"
    },
    "filler queen": {
      "description": "Low impact on track record, edit, and fan response.",
      "ruTone": "needs a moment"
    }
  },
  "reception": {
    "fans": [
      "Legend",
      "Season Icon",
      "Fan Favorite",
      "Cult Favorite",
      "Well Received",
      "Mild Reception",
      "Rejected",
      "Fan Backlash"
    ],
    "production": [
      "Main Character Edit",
      "Production Darling",
      "Strong TV Presence",
      "Reliable Presence",
      "Neutral Edit",
      "Invisible Edit",
      "Hard to Edit"
    ],
    "cast": [
      "Beloved by the Cast",
      "Respected by the Cast",
      "Mixed Cast Reception",
      "Difficult in the Workroom",
      "Cast Villain"
    ]
  }
};
  window.GAME_DATA = window.GAME_DATA || {};
  window.GAME_DATA.narrativeExpansion = expansion;
  window.GAME_DATA.narrativeText = expansion;

  const extraEvents = [
  {
    "id": "mirror_message",
    "type": "workroom",
    "text": "A mirror message from the last eliminated queen hangs over the room.",
    "score": 0
  },
  {
    "id": "guest_confused_but_charmed",
    "type": "judging",
    "text": "The guest judge seems confused, but weirdly charmed by the performance.",
    "score": 1
  },
  {
    "id": "production_smells_story",
    "type": "production",
    "text": "Production keeps the cameras nearby. Something about this week feels editable.",
    "score": 1
  },
  {
    "id": "rivalry_sparks",
    "type": "workroom",
    "text": "A small disagreement starts feeling like a storyline.",
    "score": 0
  },
  {
    "id": "runway_steamer_panic",
    "type": "runway",
    "text": "A last-minute steam session saves one detail of the look.",
    "score": 1
  },
  {
    "id": "wrong_shoes",
    "type": "runway",
    "text": "The shoes are wrong, and everyone knows it.",
    "score": -1
  },
  {
    "id": "guest_laughs_too_hard",
    "type": "judging",
    "text": "The guest judge laughs louder than the room expected.",
    "score": 2
  },
  {
    "id": "quiet_edit",
    "type": "production",
    "text": "The edit gives less space than expected this week.",
    "score": -1
  },
  {
    "id": "helpful_sister",
    "type": "workroom",
    "text": "A queen offers real help when the pressure starts showing.",
    "score": 1
  },
  {
    "id": "stress_crack",
    "type": "workroom",
    "text": "The pressure gets visible before the challenge even begins.",
    "score": -1
  }
];
  const existingEvents = Array.isArray(window.GAME_DATA.events) ? window.GAME_DATA.events : [];
  const seen = new Set(existingEvents.map(e => e && e.id));
  extraEvents.forEach(ev => { if(!seen.has(ev.id)) existingEvents.push(ev); });
  window.GAME_DATA.events = existingEvents;

  // Lightly expand the existing critique banks without replacing the old structure.
  const c = window.GAME_DATA.critiques || {};
  c.generic = c.generic || {};
  c.generic.positive = [...(c.generic.positive || []), ...expansion.judgeComments.michelle.positive, ...expansion.judgeComments.ross.positive.slice(0,2)];
  c.generic.safe = [...(c.generic.safe || []), ...expansion.judgeComments.michelle.safe, ...expansion.judgeComments.carson.safe.slice(0,2)];
  c.generic.negative = [...(c.generic.negative || []), ...expansion.judgeComments.michelle.negative, ...expansion.judgeComments.ross.negative.slice(0,2), ...expansion.judgeComments.carson.negative.slice(0,2)];
  window.GAME_DATA.critiques = c;
})();
