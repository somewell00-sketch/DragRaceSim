# Drag Race Simulator — v31.5 Part A: performance + CSS consolidation

No visual change in this step: every element's computed style was compared against v31.4, step by step, across full seasons in all five formats (Regular, Legacy, Assassin, Brackets, All Winners) at 1280px and 390px.

## White flashes
- Removed `content-visibility:auto` + `contain-intrinsic-size` from the `.perf-mode` cards. The 220px placeholders resized cards while scrolling and after each screen change, which is what flashed.
- Removed the two `backdrop-filter:blur()` rules (and the `backdrop-filter:none` overrides that existed only to cancel them).
- `assets/header.jpg`: one fixed layer (`body::before`) on its own compositing layer, preloaded once from `index.html`.
- `index.html` paints the page black before the stylesheet arrives (`color-scheme: dark` + a one-line inline style), so the first frame is no longer white.

## css/style.css
- 614 declarations that could never win (same selector, same property, overridden later) and 152 rules left empty were removed.
- One **DESIGN TOKENS** `:root` block at the top: every colour used more than once is a token (`--c-pink`, `--c-pink-rgb` for `rgba(var(--c-pink-rgb),.2)`), and the two old `:root` blocks were merged into it.
- `!important`: from 1,055 down to about 350. Each one was removed only after checking, on every screen of every test season, that the computed value did not change. The ones left are either really needed (they win over a later or more specific rule) or sit on screens/states the tests can't reach (hover, focus, disabled), so they were kept on purpose.

# Drag Race Simulator — v31.1 Critical Fixes

## What changed in v31.1

- **Skip to Finale (Legacy / Assassin):** the return smackdown is now resolved while skipping. Before, it was never resolved, so ~57 empty episodes were generated and the finale got the wrong number of finalists.
- **Community queens are validated:** every row loaded from Supabase is cleaned (stats 1–10, total ≤ 45, known type/personality, name ≤ 40 chars, hidden/control characters removed). Rows without a name are dropped.
- **Privacy:** no more GPS prompt or OpenStreetMap lookup. The hometown is an optional, editable field (pre-filled from the time zone only). A queen is published **only** if the player ticks "Share my queen with the community". Winners are published once, and only the player's own opted-in queen.
- **Offline-safe:** if the Supabase script fails to load, the game still runs (community features are disabled).
- **Mobile:** fixed horizontal overflow on phones (layout grid + sidebar queen grid).
- **Server side:** `supabase/community_queens_security.sql` adds database constraints and RLS (run it once in Supabase).

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
