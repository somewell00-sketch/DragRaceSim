# Drag Race Simulator — v31 Narrative Expansion

## What changed in v31

This version starts moving the simulator toward a content-driven structure.

### events.json
`data/events.json` is used by the simulator, but in the old build it was mostly a hidden episode modifier:

- one event is selected when an episode is generated;
- its `score` can affect the player's challenge result;
- before v31, the event text was not very visible in the episode UI.

In v31, the selected episode event now appears in the Workroom/Social Sparks area as a production/event note, so expanding `events.json` is more useful.

### New editable text banks
New JSON files were added for future content expansion:

- `data/runway/runwayDescriptions.json`
- `data/judges/judgeComments.json`
- `data/judges/rupaulComments.json`
- `data/lipsync/lipsyncNarration.json`
- `data/social/socialSparks.json`
- `data/social/relationshipShifts.json`
- `data/social/confessionals.json`
- `data/finale/finaleNarratives.json`
- `data/narrative/narrativeTags.json`
- `data/narrative/reception.json`

### Important note about opening directly from index.html
Because this project still supports opening `index.html` directly from the file system, the active expanded text banks are also mirrored in:

- `js/dataExpansion.js`

For now, if you edit the JSON files and want those edits to appear while opening the game directly from `index.html`, copy the same content into `js/dataExpansion.js` or generate a new build later. A future version can add a proper build step to sync JSON into the browser-ready data file automatically.

## v31 active integrations

- Expanded runway descriptions are used by the runway renderer.
- Expanded judge comments can appear in critiques.
- Expanded RuPaul narrative comments can appear through the Narrative Engine.
- Expanded finale narrative lines can appear in finale cards.
- Expanded events are added to the event pool and shown in the Workroom.



## v30.14 data cleanup

- The game now keeps the active editable data in `js/data/*.js` instead of one huge `js/data.js`.
- `js/data.js` is now only the base namespace.
- The old `data/*.json` folder was removed from this build because it was not being loaded by `index.html` and created confusion when editing content.
- To expand content now, edit the matching file in `js/data/`, for example `nameParts.js`, `themes.js`, `guestJudges.js`, `events.js`, `songs.js`, or `runways.js`.
- `js/dataExpansion.js` still contains the larger narrative text banks and remains active.
