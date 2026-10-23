// v31.5 Part B: vector icons in the show's vocabulary (lashes, heel, fan, stage light, lipstick, disco ball).
// One 24x24 box, used next to text and at the size of the surrounding font. Emojis that have no icon are left as they are.
const ICON_SYMBOLS={"wig": "<path d=\"M12 2.5c-5 0-8 3.6-8 8.5 0 3.2.6 6.6 1.6 10h3.2c-1-2.8-1.4-5.4-1.2-8 2.4-.4 4.6-1.8 6-4 1 2.2 2.6 3.6 4.8 4 .2 2.6-.2 5.2-1.2 8h3.2c1-3.4 1.6-6.8 1.6-10 0-4.9-3-8.5-8-8.5z\" fill=\"currentColor\"/>", "camera": "<rect x=\"2.5\" y=\"7\" width=\"19\" height=\"13\" rx=\"2\" fill=\"currentColor\"/><path d=\"M8 7l1.6-2.5h4.8L16 7\" fill=\"currentColor\"/><circle cx=\"12\" cy=\"13.5\" r=\"3.6\" fill=\"none\" stroke=\"var(--stage)\" stroke-width=\"1.6\"/>", "crown": "<path d=\"M3 8.5l4.6 3.8L12 5l4.4 7.3L21 8.5 19.2 18H4.8z\" fill=\"currentColor\"/><rect x=\"4.8\" y=\"19\" width=\"14.4\" height=\"2\" rx=\"1\" fill=\"currentColor\"/>", "mood-love": "<circle cx=\"12\" cy=\"12.5\" r=\"9\" fill=\"currentColor\"/><path d=\"M5.4 9.6 7 10.4M18.6 9.6 17 10.4\" stroke=\"var(--stage)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M9 13s-2.4-1.4-2.4-3a1.2 1.2 0 0 1 2.4-.5 1.2 1.2 0 0 1 2.4.5c0 1.6-2.4 3-2.4 3zM15 13s-2.4-1.4-2.4-3a1.2 1.2 0 0 1 2.4-.5 1.2 1.2 0 0 1 2.4.5c0 1.6-2.4 3-2.4 3z\" fill=\"var(--stage)\"/><path d=\"M8.3 16.2a5 5 0 0 0 7.4 0\" stroke=\"var(--stage)\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/>", "mood-like": "<circle cx=\"12\" cy=\"12.5\" r=\"9\" fill=\"currentColor\"/><path d=\"M5.4 9.6 7 10.4M18.6 9.6 17 10.4\" stroke=\"var(--stage)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M7.4 11.2q1.6-1.8 3.2 0M13.4 11.2q1.6-1.8 3.2 0M8 14.8q4 4 8 0\" stroke=\"var(--stage)\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/>", "mood-neutral": "<circle cx=\"12\" cy=\"12.5\" r=\"9\" fill=\"currentColor\"/><path d=\"M5.4 9.6 7 10.4M18.6 9.6 17 10.4\" stroke=\"var(--stage)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><circle cx=\"9\" cy=\"11\" r=\"1.3\" fill=\"var(--stage)\"/><circle cx=\"15\" cy=\"11\" r=\"1.3\" fill=\"var(--stage)\"/><path d=\"M8.6 16h6.8\" stroke=\"var(--stage)\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/>", "mood-shade": "<circle cx=\"12\" cy=\"12.5\" r=\"9\" fill=\"currentColor\"/><path d=\"M5.4 9.6 7 10.4M18.6 9.6 17 10.4\" stroke=\"var(--stage)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M7 10.6h4M13 10.6h4M9 16.2q3.4-.4 6.4-1.8\" stroke=\"var(--stage)\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><circle cx=\"10.2\" cy=\"11.8\" r=\"1.1\" fill=\"var(--stage)\"/><circle cx=\"16.2\" cy=\"11.8\" r=\"1.1\" fill=\"var(--stage)\"/>", "mood-hate": "<circle cx=\"12\" cy=\"12.5\" r=\"9\" fill=\"currentColor\"/><path d=\"M5.4 9.6 7 10.4M18.6 9.6 17 10.4\" stroke=\"var(--stage)\" stroke-width=\"1.5\" stroke-linecap=\"round\"/><path d=\"M6.8 8.6l3.6 1.6M17.2 8.6l-3.6 1.6M8.4 17.2q3.6-3 7.2 0\" stroke=\"var(--stage)\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><circle cx=\"9.4\" cy=\"12\" r=\"1.2\" fill=\"var(--stage)\"/><circle cx=\"14.6\" cy=\"12\" r=\"1.2\" fill=\"var(--stage)\"/>", "spot": "<path d=\"M8.6 10.4h6.8L20 22.5H4z\" fill=\"currentColor\" opacity=\".32\"/><path d=\"M6.6 1.8h10.8l-1.8 7.6H8.4z\" fill=\"currentColor\"/><rect x=\"7.8\" y=\"9.2\" width=\"8.4\" height=\"1.8\" rx=\".9\" fill=\"currentColor\"/><path d=\"M9.5 4.6h5\" stroke=\"var(--stage)\" stroke-width=\"1.2\" stroke-linecap=\"round\"/>", "candle": "<path d=\"M12 2.5c.6 1.8 2.6 2.9 2.6 5.2a2.6 2.6 0 0 1-5.2 0c0-1.5.9-2.4 1.5-3 .1.8.5 1.3 1 1.5 0-1.5-.5-2.5.1-3.7z\" fill=\"currentColor\"/><rect x=\"8.5\" y=\"11\" width=\"7\" height=\"10.5\" rx=\"1.2\" fill=\"currentColor\" opacity=\".55\"/><path d=\"M12 9.8V11\" stroke=\"currentColor\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>", "flame": "<path d=\"M12.6 2.5c.8 3.2 5.4 5.3 5.4 10.6A6 6 0 0 1 6 13.4c0-2.8 1.6-4.4 2.7-5.5.3 1.8 1.1 2.8 2.2 3.3-.1-3.4-.4-5.9 1.7-8.7z\" fill=\"currentColor\"/>", "bow": "<path d=\"M12 12 3 6.5v11zM12 12l9-5.5v11z\" fill=\"currentColor\"/><circle cx=\"12\" cy=\"12\" r=\"2.6\" fill=\"currentColor\"/><path d=\"M10.6 14l-2 6M13.4 14l2 6\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>", "diamond": "<path d=\"M6.5 4h11L21 9l-9 11L3 9z\" fill=\"currentColor\"/><path d=\"M3 9h18M9 4l3 16 3-16\" fill=\"none\" stroke=\"var(--stage)\" stroke-width=\"1.1\" opacity=\".55\"/>", "burst": "<path d=\"M12 1.8l2.2 5 5-2.2-2.2 5 5 2.4-5 2.2 2.2 5-5-2.2L12 22.2l-2.2-5.2-5 2.2 2.2-5L1.8 12l5.2-2.2-2.2-5 5 2.2z\" fill=\"currentColor\"/><circle cx=\"12\" cy=\"12\" r=\"3\" fill=\"var(--stage)\" opacity=\".45\"/>", "clover": "<g fill=\"currentColor\"><circle cx=\"12\" cy=\"7.4\" r=\"3.6\"/><circle cx=\"7.4\" cy=\"12\" r=\"3.6\"/><circle cx=\"16.6\" cy=\"12\" r=\"3.6\"/><circle cx=\"12\" cy=\"15.6\" r=\"3.2\"/></g><path d=\"M13 17l3 4.5\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>", "lips": "<path d=\"M2 11.6C5 7.4 8.4 6.6 12 9c3.6-2.4 7-1.6 10 2.6-3 5-6.6 6.6-10 6.6S5 16.6 2 11.6z\" fill=\"currentColor\"/><path d=\"M2.6 11.8c3.2 1.1 6.4 1.4 9.4.4 3 1 6.2.7 9.4-.4\" fill=\"none\" stroke=\"var(--stage)\" stroke-width=\"1.2\" opacity=\".6\"/>", "heart": "<path d=\"M12 20.5S3.5 15.6 3.5 9.4A4.4 4.4 0 0 1 12 7a4.4 4.4 0 0 1 8.5 2.4c0 6.2-8.5 11.1-8.5 11.1z\" fill=\"currentColor\"/>", "star": "<path d=\"M12 2.8l2.8 5.8 6.3.9-4.6 4.4 1.1 6.3L12 17.2l-5.6 3 1.1-6.3-4.6-4.4 6.3-.9z\" fill=\"currentColor\"/>", "disco": "<path d=\"M12 1.5v3.6\" stroke=\"currentColor\" stroke-width=\"1.6\" stroke-linecap=\"round\"/><circle cx=\"12\" cy=\"13.5\" r=\"8.4\" fill=\"currentColor\"/><g fill=\"none\" stroke=\"var(--stage)\" stroke-width=\"1\" opacity=\".55\"><path d=\"M3.6 13.5h16.8M5 9h14M5 18h14\"/><ellipse cx=\"12\" cy=\"13.5\" rx=\"3.6\" ry=\"8.4\"/><path d=\"M12 5.1v16.8\"/></g>", "sparkle": "<path d=\"M11 3l1.9 5.6L18.5 10.5l-5.6 1.9L11 18l-1.9-5.6L3.5 10.5l5.6-1.9z\" fill=\"currentColor\"/><path d=\"M18.5 15.5l.8 2.2 2.2.8-2.2.8-.8 2.2-.8-2.2-2.2-.8 2.2-.8z\" fill=\"currentColor\"/>", "hearts": "<path d=\"M9 18S2.5 14.3 2.5 9.6A3.4 3.4 0 0 1 9 7.8a3.4 3.4 0 0 1 6.5 1.8C15.5 14.3 9 18 9 18z\" fill=\"currentColor\"/><path d=\"M16.5 21.5s-4.4-2.5-4.4-5.6a2.3 2.3 0 0 1 4.4-1.2 2.3 2.3 0 0 1 4.4 1.2c0 3.1-4.4 5.6-4.4 5.6z\" fill=\"currentColor\" opacity=\".7\"/>", "eye": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M2.5 13s3.6-6 9.5-6 9.5 6 9.5 6-3.6 5.5-9.5 5.5S2.5 13 2.5 13z\"/><path d=\"M6.4 8.2 5 6.2M9.4 7.2 8.8 4.8M14.6 7.2l.6-2.4M17.6 8.2 19 6.2\"/></g><circle cx=\"12\" cy=\"12.8\" r=\"3\" fill=\"currentColor\"/>", "scorecard": "<rect x=\"4\" y=\"3.5\" width=\"16\" height=\"17\" rx=\"2\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\"/><g fill=\"currentColor\"><rect x=\"7\" y=\"7\" width=\"3\" height=\"3\" rx=\".6\"/><rect x=\"7\" y=\"11.5\" width=\"3\" height=\"3\" rx=\".6\" opacity=\".6\"/><rect x=\"7\" y=\"16\" width=\"3\" height=\"2\" rx=\".6\" opacity=\".35\"/></g><path d=\"M12 8.5h5M12 13h5\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"/>", "tv": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><rect x=\"2.5\" y=\"7\" width=\"19\" height=\"13\" rx=\"2\"/><path d=\"M8 3l4 4 4-4\"/></g><path d=\"M10 11v5.5l4.6-2.75z\" fill=\"currentColor\"/>", "save": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linejoin=\"round\"><path d=\"M4.5 3.5h12l3 3v14h-15z\"/><path d=\"M8 3.5v5h7v-5\"/></g><rect x=\"7.5\" y=\"13\" width=\"9\" height=\"5\" rx=\"1\" fill=\"currentColor\"/>", "skip": "<path d=\"M4 5.5l8 6.5-8 6.5zM12 5.5l8 6.5-8 6.5z\" fill=\"currentColor\"/><rect x=\"19.4\" y=\"5\" width=\"2\" height=\"14\" rx=\"1\" fill=\"currentColor\"/>", "restart": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"><path d=\"M4.5 12a7.5 7.5 0 1 0 2.2-5.3\"/><path d=\"M4 3.5v4.5h4.5\"/></g>", "link": "<g fill=\"none\" stroke=\"currentColor\" stroke-width=\"2\" stroke-linecap=\"round\"><path d=\"M10 14.5a4 4 0 0 0 5.7 0l3.3-3.3a4 4 0 0 0-5.7-5.7l-1.4 1.4\"/><path d=\"M14 9.5a4 4 0 0 0-5.7 0L5 12.8a4 4 0 0 0 5.7 5.7l1.4-1.4\"/></g>", "heel": "<path d=\"M2.5 18.5h5.2c1.6 0 2.6-.6 3.6-1.8l3.4-4.4 3.6.8c1.5.4 2.7 1.6 3.2 3v2.4h-2.6l-1.6-2.2-4.6 4H2.5z\" fill=\"currentColor\"/><path d=\"M18.2 15.6l-.4 5.4\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\"/>", "mic": "<rect x=\"8.5\" y=\"2.5\" width=\"7\" height=\"11\" rx=\"3.5\" fill=\"currentColor\"/><g fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.7\" stroke-linecap=\"round\"><path d=\"M5.5 11a6.5 6.5 0 0 0 13 0\"/><path d=\"M12 17.5v4M8.5 21.5h7\"/></g>", "masks": "<path d=\"M3 4.5c3 1 6 1 9 0v5.6c0 3.4-2 5.9-4.5 5.9S3 13.5 3 10.1z\" fill=\"currentColor\"/><path d=\"M12.6 8.5c2.8.9 5.6.9 8.4 0v5.2c0 3.2-1.9 5.6-4.2 5.6s-4.2-2.4-4.2-5.6z\" fill=\"currentColor\" opacity=\".6\"/><g fill=\"var(--stage)\"><circle cx=\"5.6\" cy=\"8.4\" r=\".9\"/><circle cx=\"9.4\" cy=\"8.4\" r=\".9\"/></g><path d=\"M5.6 12q1.9 1.6 3.8 0\" fill=\"none\" stroke=\"var(--stage)\" stroke-width=\"1.1\" stroke-linecap=\"round\"/>", "laugh": "<path d=\"M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 20 17h-9l-5 4v-4H4a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 4 4.5z\" fill=\"currentColor\"/><path d=\"M8 10.5q4 4.4 8 0z\" fill=\"var(--stage)\"/>", "alien": "<path d=\"M12 2.8c5 0 8.2 3.6 8.2 7.8 0 4.8-4.8 10.6-8.2 10.6S3.8 15.4 3.8 10.6C3.8 6.4 7 2.8 12 2.8z\" fill=\"currentColor\"/><g fill=\"var(--stage)\"><path d=\"M6.6 10.6c1.6-.4 3.2.4 3.6 2.4-1.8.4-3.3-.5-3.6-2.4zM17.4 10.6c-1.6-.4-3.2.4-3.6 2.4 1.8.4 3.3-.5 3.6-2.4z\"/></g>", "fan": "<path d=\"M12 20.5 2.8 10.2A13 13 0 0 1 21.2 10.2z\" fill=\"currentColor\"/><g fill=\"none\" stroke=\"var(--stage)\" stroke-width=\"1\" opacity=\".55\"><path d=\"M12 20.5 6 6.6M12 20.5V5M12 20.5l6-13.9\"/></g>", "tophat": "<path d=\"M7 3.5h10v11H7z\" fill=\"currentColor\"/><rect x=\"2.5\" y=\"15.5\" width=\"19\" height=\"3\" rx=\"1.5\" fill=\"currentColor\"/><rect x=\"7\" y=\"11\" width=\"10\" height=\"2\" fill=\"var(--stage)\" opacity=\".5\"/>", "note": "<path d=\"M9 17.5V5.8l11-2.3v11.7\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linejoin=\"round\"/><ellipse cx=\"6.5\" cy=\"17.8\" rx=\"3\" ry=\"2.4\" fill=\"currentColor\"/><ellipse cx=\"17.5\" cy=\"15.4\" rx=\"3\" ry=\"2.4\" fill=\"currentColor\"/>", "bolt": "<path d=\"M13.5 2 4.5 13.6h6.6L10 22l9.5-12h-6.8z\" fill=\"currentColor\"/>", "dress": "<path d=\"M9 2.5h6l-1 4 4.5 14.5h-13L10 6.5z\" fill=\"currentColor\"/><path d=\"M8.6 9.5h6.8\" stroke=\"var(--stage)\" stroke-width=\"1.2\"/>", "shield": "<path d=\"M12 2.8 4.5 5.6v6c0 4.6 3.2 8 7.5 9.6 4.3-1.6 7.5-5 7.5-9.6v-6z\" fill=\"currentColor\"/><path d=\"M8.8 12.2l2.2 2.2 4.4-4.6\" fill=\"none\" stroke=\"var(--stage)\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "lipstick": "<path d=\"M9.5 2.8 14.5 5v6h-5z\" fill=\"currentColor\"/><rect x=\"8\" y=\"11\" width=\"8\" height=\"3\" rx=\".6\" fill=\"currentColor\" opacity=\".6\"/><rect x=\"7.2\" y=\"14\" width=\"9.6\" height=\"7.5\" rx=\"1.2\" fill=\"currentColor\"/>", "alert": "<path d=\"M12 3 2.5 20.5h19z\" fill=\"currentColor\"/><path d=\"M12 9.5v5M12 17.2v.3\" stroke=\"var(--stage)\" stroke-width=\"2\" stroke-linecap=\"round\"/>", "ballot": "<rect x=\"3.5\" y=\"11\" width=\"17\" height=\"10\" rx=\"1.5\" fill=\"currentColor\"/><path d=\"M8 3.5h8v8H8z\" fill=\"currentColor\" opacity=\".55\"/><path d=\"M8 14.5h8\" stroke=\"var(--stage)\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>", "needle": "<path d=\"M19.5 3.5 5 18\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><ellipse cx=\"18\" cy=\"5\" rx=\"1.2\" ry=\"2.4\" transform=\"rotate(45 18 5)\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.4\"/><path d=\"M4 20c2-4 6-2 8-6s5-4 7-3\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" opacity=\".55\"/>", "plunger": "<path d=\"M12 2.5v11\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M5 20.5c0-4 3-7 7-7s7 3 7 7z\" fill=\"currentColor\"/>", "trophy": "<path d=\"M7 3.5h10v5a5 5 0 0 1-10 0z\" fill=\"currentColor\"/><path d=\"M7 5H3.8c0 3 1.4 4.6 3.6 5M17 5h3.2c0 3-1.4 4.6-3.6 5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M12 13.5v4\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><rect x=\"7.5\" y=\"18\" width=\"9\" height=\"3\" rx=\"1\" fill=\"currentColor\"/>", "flag": "<path d=\"M5 21V3.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M5 4h13l-2.5 4.2L18 12.5H5z\" fill=\"currentColor\"/>", "swords": "<path d=\"M4 4l9.5 9.5M20 4l-9.5 9.5M6.5 17.5l-3 3M17.5 17.5l3 3M5 14.5l4.5 4.5M19 14.5 14.5 19\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "target": "<circle cx=\"12\" cy=\"12\" r=\"9\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><circle cx=\"12\" cy=\"12\" r=\"1.8\" fill=\"currentColor\"/>", "trend": "<path d=\"M3 17.5 9 11.5l4 4 7.5-8\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/><path d=\"M15 7.5h5.5V13\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\"/>", "lifebuoy": "<circle cx=\"12\" cy=\"12\" r=\"8.5\" fill=\"none\" stroke=\"currentColor\" stroke-width=\"1.8\" stroke-linecap=\"round\" stroke-linejoin=\"round\" stroke-width=\"4.2\"/><circle cx=\"12\" cy=\"12\" r=\"8.5\" fill=\"none\" stroke=\"var(--stage)\" stroke-width=\"4.4\" stroke-dasharray=\"3.4 9.95\" stroke-dashoffset=\"1.7\" opacity=\".5\"/>", "chat": "<path d=\"M4 4.5h16a1.5 1.5 0 0 1 1.5 1.5v9.5A1.5 1.5 0 0 1 20 17h-9l-5 4v-4H4a1.5 1.5 0 0 1-1.5-1.5V6A1.5 1.5 0 0 1 4 4.5z\" fill=\"currentColor\"/><path d=\"M7.5 9.5h9M7.5 12.5h6\" stroke=\"var(--stage)\" stroke-width=\"1.4\" stroke-linecap=\"round\"/>", "dove": "<path d=\"M3 13.5c3 0 5-1.5 6.5-4.5 1-2 3-4.5 6-4.5 2 0 3.5 1 4.5 2.5l2 .5-2 1.5c0 5-4 9.5-10 9.5-2.5 0-4.5-.8-6-2l3-.5z\" fill=\"currentColor\"/><circle cx=\"16.2\" cy=\"7.4\" r=\".9\" fill=\"var(--stage)\"/>", "hush": "<circle cx=\"12\" cy=\"12.5\" r=\"9\" fill=\"currentColor\"/><path d=\"M8 11h2M14 11h2\" stroke=\"var(--stage)\" stroke-width=\"1.6\" stroke-linecap=\"round\"/><path d=\"M12 13.5v5.5\" stroke=\"var(--stage)\" stroke-width=\"2.2\" stroke-linecap=\"round\"/>"};

// v31.5 round 2: icons for the emojis still left in summary, creator and runway screens
Object.assign(ICON_SYMBOLS,{
  "medal":"<path d=\"M7 2.5h3.2L12 7l1.8-4.5H17L13.8 10h-3.6z\" fill=\"currentColor\"/><circle cx=\"12\" cy=\"15.5\" r=\"6\" fill=\"currentColor\"/><path d=\"M12 12.4l.95 1.95 2.1.3-1.5 1.5.35 2.1L12 17.3l-1.9 1 .35-2.1-1.5-1.5 2.1-.3z\" fill=\"var(--stage)\"/>",
  "download":"<path d=\"M12 3v11m0 0-4.5-4.5M12 14l4.5-4.5\" stroke=\"currentColor\" stroke-width=\"2.2\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/><rect x=\"4\" y=\"18\" width=\"16\" height=\"2.6\" rx=\"1.3\" fill=\"currentColor\"/>",
  "calendar":"<rect x=\"3\" y=\"5\" width=\"18\" height=\"16\" rx=\"2\" fill=\"currentColor\"/><rect x=\"6.5\" y=\"2.5\" width=\"2.4\" height=\"5\" rx=\"1.2\" fill=\"currentColor\"/><rect x=\"15.1\" y=\"2.5\" width=\"2.4\" height=\"5\" rx=\"1.2\" fill=\"currentColor\"/><path d=\"M3 10h18\" stroke=\"var(--stage)\" stroke-width=\"1.6\"/><rect x=\"6.5\" y=\"13\" width=\"3\" height=\"3\" rx=\".6\" fill=\"var(--stage)\"/>",
  "dice":"<rect x=\"3.5\" y=\"3.5\" width=\"17\" height=\"17\" rx=\"3.5\" fill=\"currentColor\"/><circle cx=\"8.2\" cy=\"8.2\" r=\"1.6\" fill=\"var(--stage)\"/><circle cx=\"12\" cy=\"12\" r=\"1.6\" fill=\"var(--stage)\"/><circle cx=\"15.8\" cy=\"15.8\" r=\"1.6\" fill=\"var(--stage)\"/>",
  "pointer":"<path d=\"M12 3v14m0 0-5-5m5 5 5-5\" stroke=\"currentColor\" stroke-width=\"2.4\" stroke-linecap=\"round\" stroke-linejoin=\"round\" fill=\"none\"/>"
});
function ensureIconSprite(){
  if(document.getElementById('tv-icon-sprite'))return;
  // convert choice icons in anything inserted later (some steps write innerHTML directly)
  const app=document.getElementById('app');
  if(app && window.MutationObserver){let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;requestAnimationFrame(()=>{queued=false;tvEnhanceIcons(app);});}).observe(app,{childList:true,subtree:true});}
  const wrap=document.createElement('div');
  wrap.innerHTML='<svg id="tv-icon-sprite" width="0" height="0" style="position:absolute" aria-hidden="true"><defs>'+Object.entries(ICON_SYMBOLS).map(([k,v])=>'<symbol id="i-'+k+'" viewBox="0 0 24 24">'+v+'</symbol>').join('')+'</defs></svg>';
  document.body.prepend(wrap.firstChild);
}
function icon(name, cls='', label=''){
  if(!ICON_SYMBOLS[name])return '';
  const aria=label?` role="img" aria-label="${escapeHtml(label)}"`:' aria-hidden="true"';
  return `<svg class="ic ic-${name}${cls?' '+cls:''}"${aria}><use href="#i-${name}"/></svg>`;
}
const EMOJI_ICON={
  '✨':'sparkle','🎭':'masks','❤️':'heart','❤':'heart','💖':'heart','🫀':'heart','💞':'hearts','🤸':'bolt','👗':'dress','💎':'diamond','😌':'shield',
  '💄':'lipstick','💋':'lips','👑':'crown','🔥':'flame','🎤':'mic','👠':'heel','💃':'heel','⚠️':'alert','⚠':'alert','🗳️':'ballot','🗳':'ballot',
  '🪡':'needle','⭐':'star','🪠':'plunger','🏆':'trophy','🏁':'flag','📺':'tv','⚔️':'swords','⚔':'swords','🎯':'target','👀':'eye','👁️':'eye','👁':'eye',
  '🕯️':'candle','🕯':'candle','📈':'trend','😂':'laugh','🛟':'lifebuoy','💬':'chat','🕊️':'dove','🕊':'dove','🤫':'hush','🤝':'link','🧨':'flame',
  '🙏':'dove','⏭️':'skip','⏭':'skip','💡':'spot','🎶':'note','🎵':'note','📋':'scorecard','💾':'save','↺':'restart','🗂️':'tv','🎀':'bow','🍀':'clover',
  '💜':'heart','🪩':'disco','📖':'masks','🎩':'tophat','🏕️':'fan','🎙️':'mic','🤡':'laugh','👽':'alien','✂️':'needle','🧵':'needle',
  '🎬':'masks','🦂':'swords','🫖':'candle','🛡️':'shield','🛡':'shield','🌟':'star','🧥':'dress','💇':'wig','💇‍♀️':'wig','🪭':'fan','🗣️':'chat','🗣':'chat','📸':'camera','📷':'camera','🥈':'medal','🥇':'trophy','🥉':'medal','⬇️':'download','⬇':'download','🗓️':'calendar','🗓':'calendar','📅':'calendar','🎲':'dice','👋':'sparkle','👇':'pointer','💥':'burst','🥾':'heel','🌟':'star','🏕':'fan','🙂':'mood-like','😊':'mood-like','😁':'mood-like','🥰':'mood-love','😍':'mood-love','🤩':'mood-love','😘':'mood-love','😐':'mood-neutral','😬':'mood-neutral','😒':'mood-shade','🤨':'mood-shade','😠':'mood-shade','😡':'mood-hate','🤬':'mood-hate','🤮':'mood-hate','💫':'sparkle','🎉':'burst','🎊':'burst','💅':'lipstick','🌈':'sparkle','💔':'mood-shade','👏':'sparkle','🏳️‍🌈':'sparkle','📊':'scorecard','📝':'scorecard','🎟️':'ballot','🔒':'shield','💰':'diamond','🗡️':'swords','⏩':'skip','🔁':'restart','🔄':'restart'
};
// team seals: one shape per team slot, so teams differ by shape as well as colour
const TEAM_ICONS=['bow','diamond','burst','clover','lips','heart','star','disco'];
function teamIcon(index, cls=''){return icon(TEAM_ICONS[index%TEAM_ICONS.length],cls);}
function emojiIcon(emoji, cls=''){
  const key=String(emoji||'').trim();
  const name=EMOJI_ICON[key]||EMOJI_ICON[key.replace(/\uFE0F/g,'')];
  return name?icon(name,cls):escapeHtml(key);
}
// Relationship mood: five tiers on one tonal ramp (dark = hate ... light = love), readable without colour.
function relationshipMoodTier(a=0,r=0){
  const score=(Number(a)||0)*0.65+(Number(r)||0)*0.35;
  if(score<=-35)return 'hate';
  if(score<=-12)return 'shade';
  if(score<15)return 'neutral';
  if(score<40)return 'like';
  return 'love';
}
const MOOD_LABEL={hate:'Hates you',shade:'Throwing shade',neutral:'Neutral',like:'Likes you',love:'Loves you'};
function moodIconHtml(queenId){
  if(queenId===gameState.playerQueenId)return icon('crown','mood-me','You');
  const rel=gameState.relationships?.[queenId]?.[gameState.playerQueenId];
  const tier=rel?relationshipMoodTier(rel.affinity,rel.respect):'neutral';
  return icon('mood-'+tier,'mood-'+tier,MOOD_LABEL[tier]);
}
// Song energy: stage lights at both ends + the energy itself (low = candle, medium = 3 sparkles, high = 5 flames)
function energyMeterHtml(song){
  const e=String(song?.energy||'').toLowerCase();
  const mid=e==='high'?icon('flame','e-flame').repeat(5):e==='medium'?icon('sparkle','e-spark').repeat(3):e==='low'?icon('candle','e-candle'):'';
  return `<span class="energy-meter" aria-label="Energy: ${escapeHtml(e||'unknown')}">${icon('spot','e-spot')}${mid}${icon('spot','e-spot flip')}</span>`;
}

// Runs after every screen render (setHTML): any choice icon still written as an emoji becomes the vector,
// and relationship / story-beat tags get their icon. Emojis with no vector are left alone.
const TV_EMOJI_RE=/(?:\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic}|\u200D[\u2640\u2642]\uFE0F?|[\u{1F3FB}-\u{1F3FF}])*)/gu;
const TV_KEEP_GLYPH=new Set(['©','®','™','↺','↔','↕','‼','⁉','▶','◀','★','☆','✦','✧','♕','♙','♛','✓','✔','✗','✕','✖','→','←','↑','↓','⇄','•']);
function tvEmojiToIcons(root){
  const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT,{acceptNode:n=>{
    const p=n.parentElement; if(!p||p.closest('script,style,textarea,input,select,option,svg,[data-keep-emoji]'))return NodeFilter.FILTER_REJECT;
    TV_EMOJI_RE.lastIndex=0; return TV_EMOJI_RE.test(n.nodeValue)?NodeFilter.FILTER_ACCEPT:NodeFilter.FILTER_REJECT;}});
  const nodes=[];while(w.nextNode())nodes.push(w.currentNode);
  nodes.forEach(n=>{
    const html=escapeHtml(n.nodeValue).replace(TV_EMOJI_RE,m=>{
      if(TV_KEEP_GLYPH.has(m.replace(/\uFE0F/g,'')))return m.replace(/\uFE0F/g,'');
      const k=EMOJI_ICON[m]||EMOJI_ICON[m.replace(/\uFE0F/g,'')]||EMOJI_ICON[m.replace(/\u200D.*$/,'')];
      return k?icon(k,'ic-inline'):'';
    }).replace(/^\s+(?=<svg)/,'');
    if(html===escapeHtml(n.nodeValue))return;
    const span=document.createElement('span');span.className='ic-text';span.innerHTML=html;
    // drop the leftover space when an emoji was simply removed at the start
    n.replaceWith(...span.childNodes);
  });
  // emoji inside <option> labels can't hold svg: strip to text
  root.querySelectorAll('option').forEach(o=>{TV_EMOJI_RE.lastIndex=0;if(TV_EMOJI_RE.test(o.textContent)){const t=o.textContent.replace(TV_EMOJI_RE,m=>TV_KEEP_GLYPH.has(m)?m:'').replace(/\s{2,}/g,' ').trim();o.textContent=t;}});
}
function tvEnhanceIcons(root=document){
  root.querySelectorAll('.choice-emoji').forEach(el=>{
    if(el.querySelector('svg'))return;
    const t=el.textContent.trim(); const n=EMOJI_ICON[t]||EMOJI_ICON[t.replace(/\uFE0F/g,'')];
    if(n)el.innerHTML=icon(n);
  });
  root.querySelectorAll('.relationship-beats > li .badge').forEach(b=>{
    if(b.querySelector('.ic'))return;
    const n={rivalry:'flame',alliance:'link',truce:'dove',closer:'hearts',colder:'mood-shade'}[b.textContent.trim().toLowerCase()];
    if(n)b.insertAdjacentHTML('afterbegin',icon(n));
  });
  tvEmojiToIcons(root);
  tvAlignNav(root);
  tvCollapseLongLists(root);
}
// v31.6: long relationship lists show 3 items and a "Show more" button
function tvCollapseLongLists(root){
  root.querySelectorAll('ul.relationship-beats:not([data-collapsed])').forEach(ul=>{
    const items=[...ul.children].filter(li=>li.tagName==='LI' && !li.classList.contains('small'));
    ul.dataset.collapsed='1';
    if(items.length<=3)return;
    items.slice(3).forEach(li=>li.classList.add('tv-extra'));
    ul.classList.add('tv-folded');
    const btn=document.createElement('button');btn.type='button';btn.className='ghost tv-more';btn.textContent=`Show ${items.length-3} more`;
    btn.addEventListener('click',()=>{ul.classList.remove('tv-folded');btn.remove();});
    ul.after(btn);
  });
}
// v31.5 round 2: every button that moves the story forward sits on the right; Back sits on the left.
const TV_NEXT_RE=/^(continue|next|watch|start|reveal|confirm|enter|accept|see |go to|go$|skip to next|new season|begin|proceed|lip sync|run|all stars calling|queen of all queens|to the|onward|finish)/i;
const TV_BACK_RE=/^(back|return|previous)/i;
function tvAlignNav(root){
  root.querySelectorAll('main .screen button').forEach(b=>{
    if(b.classList.contains('tv-next')||b.classList.contains('tv-back')||b.classList.contains('option'))return;
    if(b.closest('aside,.options,.recap-tabs,.tv-rail-actions,.invite-arrow-btn,.choice-grid,.decision-card .options,table,.creator-form,.queen-creator'))return;
    if(b.matches('.invite-arrow-btn,.creator-dice-btn,[data-recap-tab]'))return;
    const t=(b.textContent||'').trim();
    if(TV_BACK_RE.test(t))b.classList.add('tv-back');
    else if(TV_NEXT_RE.test(t))b.classList.add('tv-next');
  });
}
