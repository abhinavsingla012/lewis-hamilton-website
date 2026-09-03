# Still We Rise — Lewis Hamilton Fan Archive

## Original Problem Statement
Build a modern, dynamic Lewis Hamilton fan website inspired by the supplied Lando Norris website references. Represent his victories, locations and seasons, dominant cars, strongest tracks with wins and podiums, imagery throughout, quotes from people describing Hamilton, and premium 3D/depth animation effects.

## User Direction
- Complete Formula 1 career through the latest finished season (2025)
- Equal emphasis on victories, dominant cars, and strongest tracks
- Cinematic visuals with concise statistics
- One immersive scrolling experience

## Architecture Decisions
- React single-page experience with Framer Motion, Lenis smooth scrolling, Lucide icons, and animated marquee
- FastAPI `/api/archive` service integrates the public Jolpica F1 API and caches the assembled archive in MongoDB
- Archive is fixed through 2025 and returns all 105 wins, 202 podiums, season totals, and circuit dominance data
- Curated fallback statistics keep the experience usable if Jolpica is unavailable
- Bespoke cinematic generated imagery is hosted on a reliable asset CDN
- Responsive layouts, reduced-motion support, semantic labels, and comprehensive `data-testid` coverage

## Implemented
- Cinematic “Still We Rise” hero with parallax composition and career headline stats
- Full-screen animated navigation to Legacy, Cars, Tracks, and Victories
- Legacy editorial section with career records and portrait treatment
- Interactive dominant-car showcase covering 2008, 2014, 2020, and the 2025 Ferrari chapter
- Top circuit comparison led by Silverstone (9 wins / 15 podiums), with circuit silhouettes
- Silverstone landmark moment and animated peer/legend quote carousel
- Complete filterable list of all 105 Grand Prix victories through 2025
- Mobile-first responsive presentation and smooth interactions throughout
- Automated backend regression suite and desktop/mobile browser verification

## Major UI and Data Upgrade
- Added a sticky, scroll-driven 2007–2025 season timeline with 19 complete season cards
- Expanded each season with wins, podiums, poles, races, points, championship position, team, and car
- Added eight new cinematic assets spanning helmet, rain, podium, night racing, Monaco, fans, trophies, and garage imagery
- Added neon horizontal depth gallery with deterministic previous/next navigation
- Added full-screen career records chapter and Ferrari-red landmark victory chapter
- Expanded every victory row with career win number, date, circuit, team, grid, laps, points, pole-start and fastest-lap flags
- Added all year filters rather than a shortened selection
- Added Timeline to the main navigation and hardened the home-logo return-to-top behavior
- Verified desktop/mobile overflow, image loading, timeline behavior, gallery controls, and expanded API contract

## Timeline Interaction Correction
- Replaced the stacked 19-card right column with one persistent season data component
- Scroll progress now changes a single synchronized active season from 2007 through 2025
- Added previous/next season buttons and left/right keyboard navigation
- Left-side year, image, championship badge, team, and car now update with the active season
- Added a 19-step progress indicator and boundary-disabled controls
- Removed delayed exit transitions that caused mobile image/data desynchronization during fast scrolling
- Verified the 2025 mobile boundary shows one matching Ferrari image, 2025 card, `19 / 19` counter, and disabled next control

## Hero Motion Upgrade
- Rebuilt the opening area as a layered reactive scene rather than a static composition
- Added staggered kinetic typography for `STILL / WE / RISE`
- Added pointer-responsive portrait tilt, title parallax, floating helmet depth, and custom cursor tracking
- Added scroll-linked portrait depth, title travel, and hero fade transition
- Added animated circuit path, scanning overlay, framing marks, telemetry rail, live-status pulse, and orbital `44`
- Added count-up animation for 105 wins, 7 titles, and 104 poles with animated stat rails
- Preserved CTA behavior while adding magnetic hover and pulse feedback
- Added responsive mobile composition and reduced-motion safeguards
- Added direct test selectors for helmet, track line, scan line, orbit rings, and count-up statistics
- Resolved the Framer Motion positioned-container warning and verified pointer/scroll interactions on the public experience

## Hero V3 — Stable 3D Editorial Stage
- Replaced the previous floating collage with one coherent 3D archival card and two physical depth planes
- Added controlled pointer tilt, restrained parallax, perspective grid floor, ambient light volumes, and circuit-line depth
- Reworked headline hierarchy into a cleaner `STILL / WE RISE` composition with editorial serif contrast
- Framed the authentic trophy photo inside a glass archival interface with scan, shine, live status, and metadata rails
- Redesigned the floating helmet as a compact second-plane token rather than a disconnected sticker
- Rebuilt the `44` orbital mark, stats rail, CTA, telemetry, and marquee as one consistent visual system
- Removed the old Hero V2 stylesheet import so only the stable V3 system controls the page
- Routed all navigation links through the same Lenis scroll engine to remove native-scroll conflicts
- Verified all five menu targets land at the section top in one continuous sequence
- Verified desktop/mobile composition, authentic image load, 105/7/104 stats, CTA, reduced motion, and console health

## Hero-to-Legacy Scroll Sequence
- Extended the opening into a sticky cinematic scroll runway
- Hero now scales from full viewport into a compact centered 3D object before fading
- Giant `LEWIS` enters from the left while outlined neon `HAMILTON` enters from the right
- Added Chapter 01 / The Legacy cue and a scroll-linked progress rail
- Legacy chapter follows naturally after the name reveal with a raised card and animated content entrance
- Verified the hero scale progression, opposite-direction name motion, Legacy reachability, desktop/mobile overflow, and reduced-motion behavior

## Spatial Racetrack Camera Model
- Restored the complete Hero V3 at full width for the entire opening viewport with no early transformation
- Hero begins central minimization only after the initial full-page hold
- `LEWIS` and `HAMILTON` enter together from opposite sides only after the hero has visibly shrunk
- Added a giant orbit-like spatial canvas containing Origin 44 and positioned Legacy, Timeline, Cars, Tracks, and Victories nodes
- Added an animated winding racetrack route connecting all chapter nodes
- Scroll progress now pans and zooms the camera across the map before arriving at the actual Legacy chapter
- Legacy is emphasized as the next destination with a larger light editorial card
- Fixed the disappearing-frontpage regression caused by a global `!important` positioning selector
- Added manual scroll restoration so every fresh entry begins at the full Hero V3
- Verified full hero, central shrink, delayed names, spatial map, mobile overflow, section navigation, and images through iteration 8
- Stabilized arrow-only timeline keyboard controls with a single lifecycle-bound listener and functional state updates
- Mandatory iteration 9 retest passed keyboard, wheel isolation, spatial hero smoke, and navigation checks

## Unified Spatial Website Architecture
- Replaced separate normal-flow pages with one 1500vh camera runway and one sticky spatial viewport
- Mounted the real Hero, Legacy, Timeline, Cars, Gallery, Records, Milestones, Tracks, Silverstone, Quotes, Victories, and Footer inside the same 500vw × 1035vh racetrack canvas
- Preserved the exact current chapter order while assigning every chapter a distinct map coordinate
- Active chapter becomes full-screen; distant chapters remain visible as small 3D cards during camera zoom-outs
- Hero remains full-screen for the opening viewport, then minimizes while `LEWIS` and `HAMILTON` enter simultaneously
- Added continuous camera pan/zoom, animated racing line, active chapter HUD, and global journey progress
- Retained all chapter interactions: timeline arrows/keyboard, car selector, gallery navigation, quote carousel, victory filters, archive expansion, and back-to-origin journey
- Added native hash-anchor menu routing to make pointer, quick-click, Enter, and Space navigation deterministic
- Timeline holds normal wheel gestures and changes years only through arrows; deliberate sustained scroll continues the spatial journey
- Iteration 20 verified Gallery, Quotes, and Victories controls at their active camera stops, menu/hash routing, timeline behavior, console health, and overflow

## Timeline Arrow-Only Correction
- Removed scroll-progress year updates and the 19-year vertical runway
- Timeline now remains one viewport-height carousel that users can scroll past normally
- Years change only through previous/next controls or ArrowLeft/ArrowRight keyboard input
- Active image, year, team, car, championship position, and statistics remain synchronized
- Verified wheel scrolling keeps the active year fixed, arrows move exactly one year, and Cars remains reachable below
- Updated menu navigation to fixed document coordinates through Lenis for deterministic deep-section links

## Authentic Photography Replacement
- Replaced the generated visual set with the first five user-supplied Lewis Hamilton photographs
- Trophy-kiss image now leads the hero, Silverstone moment, trophy record section, and championship-era scenes
- Helmet salute now appears in the hero floating card and relevant early Mercedes timeline years
- Trophy-catch, champagne celebration, and raw podium celebration populate the editorial gallery and timeline
- Updated alt text, gallery captions, object positioning, and crop behavior for the portrait-format originals
- Confirmed supplied asset URLs and natural image dimensions across hero and gallery

## Season Photography Mapping
- Added the next five user-supplied historical photos exclusively to the season timeline
- Mapped the images in the displayed order: first→2007, second→2008, third→2009, fourth→2010, fifth→2011
- Verified timeline arrow navigation preserves the exact year/image sequence and loads every asset successfully
- Added the next historical batch using the user’s requested non-sequential mapping: first→2016, second→2014, third→2015, fourth→2017, fifth→2018
- Verified 2014, 2015, 2016, 2017, and 2018 individually through the timeline controls
- Added the two-image batch with first→2020 and second→2019
- Verified both 2019 and 2020 through timeline controls, including successful image loading

## Spatial Framing and Performance Stabilization — 2026-07-11
- Added chapter-level containment, paused inactive animations, and reduced inactive node scale to prevent distant pages from overlapping the active viewport
- Fixed first-load hash navigation by synchronizing route positioning with Lenis initialization and providing a native scroll fallback before Lenis is ready
- Strengthened active-node selectors so every chapter, including the footer, reliably overrides minimized baseline styles
- Removed transform interpolation from active chapters so they reach full viewport scale immediately while the spatial camera continues its glide
- Verified fresh direct links for all 11 content chapters, full-screen active framing, minimized inactive nodes, post-Legacy continuity, and transformed control hit areas
- Iteration 22 independently passed desktop/mobile framing, timeline, Gallery, Quotes, Victories, overflow, console, and continuous spatial navigation checks

## Silverstone Circuit Navigation Redesign — 2026-07-11
- Preserved the existing cinematic Hero as the untouched opening experience
- Replaced the abstract winding canvas with a recognizable top-down Silverstone circuit hub based on the current circuit geometry
- Added all 11 content chapters as named, glowing, keyboard-accessible markers positioned along the racing line
- Added dual navigation: users can select any marker or continue scrolling sequentially through the full circuit journey
- Marker, menu, and scroll navigation now move the camera along the track before expanding the destination chapter full-screen
- Added a persistent Back to Circuit control to every active chapter
- Added a glowing racing pointer, circuit progress line, chapter HUD, grid texture, and responsive desktop/mobile map presentation
- Added visible CC BY 4.0 attribution for the adapted Silverstone path geometry by Jules Roy
- Added mobile Hero CTA placement and functional reduced-motion routing without animated travel
- Stabilized desktop SVG marker click targets with dedicated 40px hit areas while retaining keyboard activation
- Production build, JavaScript lint, desktop marker travel, mobile CTA, reduced-motion marker navigation, and Back to Circuit flows passed

## Circuit Marker Content Cards — 2026-07-11
- Replaced empty SVG marker boxes with always-visible HTML content cards for all 11 chapters
- Each pointer now shows its chapter number, chapter name, and a concise page-specific teaser
- Preserved hover/focus highlighting, keyboard access, and animated track navigation
- Disabled pointer interception on the moving racing indicator so overlapping chapter markers remain clickable
- Verified all 11 card contents render and a standard Legacy card click reaches the full-screen chapter

## Progress-Aware Back to Circuit — 2026-07-11
- Changed Back to Circuit from a scroll-to-start action into an in-place circuit overview
- Preserves the exact chapter scroll position and recenters the camera to the full top-down track
- Shows contextual track coverage and current position, including Legacy 2%, Records 38%, and Victories 90%
- Keeps the completed racing line illuminated up to the current chapter instead of resetting it
- Supports current/different marker selection and resumes the journey through wheel, touch, or keyboard scrolling
- Clears stale overview state when navigating through hashes or the main menu
- Iteration 26 passed all requested desktop/mobile coverage, navigation, accessibility, and overflow checks

## Hamilton Team Color Themes — 2026-07-11
- Added three persistent top-navigation color modes representing Hamilton's Formula 1 teams
- Ferrari is the first-visit default with Ferrari red (`#E10600`), Mercedes uses cyan (`#00D2BE`), and McLaren uses papaya orange (`#FF8700`)
- Added named logo buttons for McLaren, Mercedes, and Ferrari with accessible `aria-pressed` selection state
- Replaced the former yellow accent system across the Hero, Silverstone track, markers, HUD, progress indicators, controls, menu, Gallery, and footer
- Preserves current chapter, scroll, circuit overview, and interaction state when switching themes
- Persists the selected team through reloads using the `hamilton-team-theme` localStorage key
- Added Simple Icons brand marks for Ferrari/McLaren and a lightweight inline Mercedes three-point star
- Iteration 27 passed Ferrari default, all three color modes, persistence, desktop/mobile layout, state preservation, navigation, and error checks

## Silverstone Hub Heading Clearance — 2026-07-11
- Reduced and repositioned the Silverstone heading while slightly scaling/shifting the overview track
- Preserved all camera coordinates, marker positions, and chapter navigation behavior
- Verified zero heading/track overlap and zero horizontal overflow at 1920×800 and 390×844

## Hero CTA/HUD Overlap Fix — 2026-07-11
- Hid the circuit journey HUD and progress line while the Hero is active
- Restores both controls automatically when the Silverstone circuit appears
- Verified the Hero state is hidden and circuit state is visible during route handoff

## Legacy Chapter Redesign — 2026-07-11
- Completed the first page-by-page chapter redesign with a full-screen editorial monument for Lewis Hamilton's legacy
- Added a layered authentic portrait, 44 ghost numeral, monumental `THE RECORD / BEYOND / RECORDS` typography, richer cultural narrative, and team-era career rail
- Expanded the data hierarchy to six verified records: 7 titles, 105 wins, 202 podiums, 104 poles, 31 winning circuits, and 19 seasons
- Added responsive desktop/mobile compositions, selected-team accent support, reduced-motion visibility, and deterministic Legacy entry framing
- Preserved progress-aware Back to Circuit and all existing chapter data test IDs
- Hardened circuit marker routing with direct hit-circle test targets, non-blocking labels, top interaction stacking, and exact pixel/progress navigation locks
- Fixed programmatic stop drift by using a 12,000px scroll denominator and releasing navigation only after both pixel and normalized progress alignment
- Iteration 35 passed Legacy visibility plus Timeline 5/5 desktop and 5/5 mobile exact-stop batches, Legacy/Cars exact stops, keyboard routing, overflow, and pointer interception checks

## Monumental Timeline Chapter Redesign — 2026-07-12
- Rebuilt Timeline as a full-screen, single-season editorial composition with authentic photography, monumental year typography, and an architectural data rail
- Added championship-position color semantics: gold for 1st, silver for 2nd, bronze for 3rd, and progressively muted steel tones for lower finishes
- Enriched all 19 season records with Jolpica-derived win, podium, and pole achievement locations, including circuit, locality, country, race, and round
- Added interactive Wins, Podiums, and Poles location tabs plus direct access to every season through a 19-stop timeline rail
- Preserved previous/next controls, active-only ArrowLeft/ArrowRight navigation, team theme accents, reduced-motion behavior, and exact Silverstone camera stop `0.305`
- Optimized Timeline rendering to mount only active season media/data, preload adjacent images, animate transform/opacity only, and avoid scroll-linked year churn
- Updated the MongoDB archive cache to `hamilton-2025-v4` while continuing to exclude `_id` from returned cached documents
- Iteration 36 passed all 10 backend tests and Timeline desktop/mobile interaction, styling, theme, routing, wheel, overflow, and performance checks
- Hardened first-load hash initialization after one non-reproducible reduced-motion race; a targeted 5/5 mobile reduced-motion reload soak passed at the exact Timeline stop

## Timeline V4 Hybrid Museum Installation — 2026-07-12
- Reworked the Timeline from a visually divided photo/data layout into one continuous full-width cinematic surface
- Extended each authentic season image across the composition with a feathered alpha mask, angled image echo, textured dissolve band, and localized data scrim to remove the hard vertical seam
- Added restrained telemetry depth: a season-progress racing path, sector marks, scanning beam, signal labels, campaign classification, and win-conversion rail
- Expanded the monumental year treatment across the image/data transition and added a faint vertical year echo for archival depth
- Restyled achievement controls as animated signal bands and added a global-performance heading while preserving all circuit, locality, country, and round data
- Kept championship rank as a semantic color and team theme as the interaction accent
- Preserved active-only rendering, exact Timeline stop `0.305`, all controls, responsive layouts, and reduced-motion support
- Iteration 37 verified seamless blending, all viewport widths, routing, controls, themes, and camera stability; subsequent fixes removed rapid-switch transition duplicates and disabled the scan beam in reduced motion
- Final self-test passed rapid season/tab switching with exactly one image, data article, and image echo; zero duplicate test IDs; reduced-motion scan count `0`; and no mobile overflow

## Timeline V5 Viewer Experience Layers — 2026-07-12
- Added curated editorial storytelling for every season from 2007–2025: defining headline, concise campaign narrative, and signature race moment
- Added meaningful title context that tracks championships banked and consecutive title streaks through the selected season
- Added active-season comparisons against Hamilton's career season peaks for wins, podiums, and poles using lightweight transform-only telemetry rails
- Added a clickable McLaren/Mercedes/Ferrari era spine with historical team colors and seven championship markers; era buttons jump directly to 2007, 2013, and 2025
- Converted every achievement location into a keyboard-focusable signal control that updates the active circuit, race round, progress rail, and highlighted telemetry sector
- Preserved the V4 cinematic image/data dissolve, selected-theme interaction accent, semantic rank color, exact camera stop, and active-only rendering
- Compressed all three concepts for mobile: editorial story, peak comparisons, horizontal era spine, and active circuit signal remain visible without overflow
- Iteration 38 passed all 19 stories, title logic, era routing and marker counts, linked telemetry, existing controls/routes/themes, viewport matrix, reduced motion, build, and runtime console checks

## Timeline V5 Visibility and Image-Framing Cleanup — 2026-07-12
- Responded to user-reported crowding where the oversized year, vertical era spine, story telemetry, and achievement rows obscured one another
- Restored a strict left image/editorial zone and right championship/data zone while preserving the cinematic dissolve between them
- Constrained the monumental year to the left 42% of the viewport so it cannot enter the achievement list
- Reduced the story to a compact headline, two-line narrative, and signature moment; removed peak comparison rails from the active composition
- Removed the circuit-signal row from the achievement stack and reduced background telemetry to a non-obstructive seam detail
- Relocated the McLaren/Mercedes/Ferrari era control from the vertical seam to a compact horizontal strip above the season navigation
- Added explicit framing for every season image: portrait assets use full-subject `contain` with a soft blurred backdrop; landscape assets use tuned `cover` focal points
- Verified all 19 images load with correct dimensions and framing mode; representative 2008 desktop state has zero year/data, story/data, or year/story overlap
- Iteration 39 passed desktop/tablet image framing, visibility, routing, interactions, reduced motion, and rapid-switch checks; it identified two remaining mobile stacking failures
- Corrected 390×844 and 320×700 image/story/year/data zones; targeted self-test now passes strict separation and zero horizontal overflow at both sizes

## Timeline Editorial Headline Patch — 2026-07-12
- Shortened the chapter punchline to `19 SEASONS. ONE STANDARD.` and positioned it as a single compact desktop line
- Added semantic championship-rank color to `ONE STANDARD.` while preserving the selected team accent elsewhere
- Repositioned the headline and season story into separate, non-overlapping editorial bands
- Added a localized left-side readability scrim rather than darkening the full season photograph
- Increased narrative, overline, signature-label, and signature-moment contrast for reliable readability across all image tones
- Mobile wraps the punchline intentionally and keeps the compact story aligned separately
- Verified on the requested 2019 image state at 1366×768: title/story separation, exact copy, zero horizontal overflow, clean lint, and successful production build

## Chapter Marker Visibility Patch — 2026-07-12
- Replaced Timeline's ambiguous circled `02` treatment with a clearly typeset `CH. 02 / THE ASCENT` marker
- Removed the glyph ambiguity that visually made `02` resemble `B2`
- Moved the Legacy narrative block to a safe responsive offset below the persistent Back to Circuit control
- Added explicit desktop, mobile, and short-height Legacy spacing rules so `01 / THE LEGACY · 2007—2025` remains visible
- Verified at 1366×768 that Legacy has a 23.3px control-to-label gap and Timeline renders the correct marker text
- JavaScript lint and production build passed

## Global CH. 0X Chapter Marker System — 2026-07-12
- Added a reusable `ChapterMarker` component and shared `ChapterMarkers.css` visual system
- Standardized the complete route order: CH. 01 Legacy, CH. 02 The Ascent, CH. 03 Cars, CH. 04 Gallery, CH. 05 Records, CH. 06 Milestones, CH. 07 Tracks, CH. 08 Silverstone 2024, CH. 09 Voices, CH. 10 Victories, CH. 11 Still We Rise
- Centralized active marker rendering in `SpatialExperience` so all routes use one fixed safe zone below Back to Circuit rather than independent section offsets
- Added automatic dark/light marker contrast for Gallery, Tracks, and Footer backgrounds
- Removed duplicate in-section marker DOM while retaining section heading spacing and all original content
- Iteration 40 confirmed marker copy/order, exact route stops, reduced motion, Timeline interactions, and no duplicate test IDs; it identified desktop title and mobile control collisions in the first implementation
- Reworked markers into the global overlay and added a Tracks-specific narrow-screen offset for its unusually tall title block
- Final self-test passed all 44 route/viewport combinations at 1366×768, 1920×800, 390×844, and 320×700 with zero Back-to-Circuit intersections, title collisions, clipping, or duplicate test IDs
- Production build and JavaScript lint passed

## Career-Defining Cars Museum Chapter — 2026-07-12
- Replaced the four-slide generic Cars carousel with a full-screen seven-car `Machines of Dominance` museum experience
- Added the user-approved lineup: 2007 McLaren MP4-22, 2008 McLaren MP4-23, 2014 Mercedes W05 Hybrid, 2018 W09 EQ Power+, 2019 W10 EQ Power+, 2020 W11 EQ Performance, and 2025 Ferrari SF-25
- Added one active car at a time with monumental model typography, dominant full-width machinery photography, semantic historical team cue, significance story, signature moment, season output, title outcome, live win rate, podiums, poles, standing, power unit, and engineering identity
- Added seven direct year/model selectors, disabled boundary-aware previous/next controls, and active-only ArrowLeft/ArrowRight keyboard navigation
- Merged factual season performance from the live Jolpica archive while preserving curated technical and historical context
- Added adjacent-image preloading, active-only animated layers, reduced-motion behavior, and transform/opacity-only transitions
- Sourced seven exact-model Wikimedia Commons images, optimized them locally to WebP (95KB–460KB), added in-product photo credits, and documented license attribution in `public/images/cars/ATTRIBUTION.md`
- Added responsive desktop/tablet/mobile reductions that preserve the car, dominance metric, stats, technical identity, all selectors, and controls inside one 100svh spatial stop
- Iteration 41 passed all seven data/image states, selector and keyboard behavior, responsive matrix, reduced motion, theme independence, direct route, Back to Circuit, and exact camera settling
- Fixed the one regression surfaced by testing: restored Gallery to the Explore menu and verified the Gallery → Cars route chain
- JavaScript lint and production build passed; no APIs or flows are mocked

## Cars Chapter User-Image and Storytelling Refinement — 2026-07-12
- Replaced all seven active Wikimedia photographs with the user-supplied respective-car images for MP4-22, MP4-23, W05, W09, W10, W11, and SF-25
- Optimized every replacement locally to WebP between 112KB and 372KB while preserving 1600–2000px source width
- Retuned model-specific focal points for action, front-facing, and side-profile compositions across desktop and mobile
- Rewrote each narrative around the machine's historical role: The Shockwave, The First Crown, The Power Shift, The Complete Weapon, The Relentless Machine, The Benchmark, and The Reinvention
- Strengthened desktop significance, engineering, and source-credit readability without increasing mobile density
- Updated active source credits and `public/images/cars/ATTRIBUTION.md` to reflect the user-supplied archive
- Iteration 42 passed exact natural dimensions, selector/model mapping, all seven crops, story tones, technical copy, live stats, source links, interactions, route stability, reduced motion, rapid switching, and the six-viewport responsive matrix
- No mocked flows or APIs; no functional blockers remain

## McLaren Papaya-Orange Theme Correction — 2026-07-12
- Shifted McLaren mode from the yellow-leaning `#FF8700` treatment to a deeper orange system led by `#FF6200`
- Added `#FF8A2B` hover/highlight orange, `#D94700` deep contrast, darker orange glow, and matching RGB variables
- Updated the McLaren switcher state, all CSS-variable-driven chapter accents, circuit progress/racing line, markers, chapter indicators, and Timeline era spine
- Updated the Legacy McLaren era cue to the same orange so no yellow-gold historical marker remains
- Verified live computed theme values, active-button glow, and circuit progress render as `rgb(255, 98, 0)`; JavaScript lint passed

## Chapter HUD Removal — 2026-07-12
- Removed the bottom route counter, active chapter name, racing-line hint, and global journey progress line whenever a full chapter page is active
- Preserved the journey HUD and progress line only for the Silverstone circuit overview and camera travel/transit states
- Eliminated the Cars and Timeline layout collisions shown by the user without changing chapter content or exact route stops
- Verified Cars and Timeline render with zero HUD/progress DOM while Back to Circuit restores both on the circuit overview
- JavaScript lint and production build passed; the brief preview 502 during build recovered with all services healthy

## Gallery Fashion-Editorial Redesign and Polish — 2026-07-12
- Replaced the rejected black split-screen Gallery with a 16-look fashion-week editorial issue using six distinct composition systems: contact sheet, diagonal runway, typographic poster, full cover, social collage, and helmet artifact
- Curated and locally optimized 16 Lewis Hamilton fashion, paddock, helmet, Maranello, and Silverstone images; every look includes year, city/circuit, venue, designer/context, and editorial copy
- Added slide-specific cobalt, scarlet, silver, acid, ivory, papaya, emerald, cyan, burgundy, and Ferrari-red color worlds so the chapter no longer repeats the Cars design or a single black background
- Added individual desktop and mobile focal points for all 16 images plus dedicated detail crops for social-collage layouts
- Preserved internal wheel/touch progression at the exact Gallery stop and only releases to Cars/Records at the first/final boundary; added explicit Lenis ownership so route settling cannot restart scrolling inside Gallery
- Refined transitions into single-layer, layout-specific cuts with no blank frame, lingering previous slide, invalid clip-path animation, or duplicate stable test IDs
- Stabilized keyboard progression, theme-switch slide persistence, reverse entry initialization, final route settling, and Back to Circuit lock cleanup
- Reserved dedicated copy/control zones so headings, credits, index rail, and navigation controls no longer collide across desktop/mobile layouts
- JavaScript lint and production build passed; self-tests verified single transition layer, deterministic Space/Arrow/Page keys, zero critical overlaps, theme persistence, exact route lock, and settled slide-16 release to Records
- No APIs or flows are mocked

## Records Chapter — The Record Reactor — 2026-07-12
- Rejected the first palette-changing typographic monument because it repeated Gallery's state-based editorial language, then rebuilt Records from zero as one fixed industrial world
- Created a physical 12-position F1-inspired reactor with turbine dial, selector arm, gear teeth, bolts, pressure arcs, warning lamps, timing strip, odometer drums, engraved specification plate, and mechanical record rail
- Added the 12 user-approved 2026 records: 7 titles, 106 wins, 104 poles, 207 podiums, 5,165.5 points, 9 Silverstone wins, 31 winning circuits, 61 wins from pole, 5,521 laps led, 177 front rows, 19Y4D winning span, and wins in the driver's 20s/30s/40s
- Added click, pointer-drag, and Left/Right keyboard selection with dial/selector/odometer/specification synchronization and theme-selection persistence
- Preserved native spatial scrolling with no Records scroll trap; Gallery ↔ Records ↔ Milestones routing and Back to Circuit remain unchanged
- Added reduced-motion behavior and responsive machine layouts for 1920x800 through 320x700
- Iteration 44 passed all core interaction, value, route, accessibility, reduced-motion, and mobile checks; fixed its only reported issue with a dedicated 851–1200px layout that prevents dial/specification overlap at 1024x768
- JavaScript lint and production build pass; no APIs or flows are mocked

## Connective-Tissue Design Batch — Lights-Out, Cursor, Paint-Sweep, Wayfinding — 2026-09-02
- Workspace recovery: the working tree was found empty (415 files staged as deleted); restored from git HEAD, recreated the git-ignored frontend/backend .env files (preview URL from supervisor config, local Mongo), reinstalled deps
- Design audit verdict: set-piece chapters are master-level; the gaps were the connective tissue (cold start, cursor, theme gesture, wayfinding) and four flat chapters (Milestones, Tracks, Voices, Victories) — user picked the connective-tissue batch first
- A · Lights-Out cold start (`components/LightsOut.jsx`, `lib/boot.js`): five-column F1 start gantry, each column tied to a real readiness signal (typefaces via document.fonts, hero PNG decode, archive fetch capped 2.6s, WebGL circuit first-frame/compile via `WarmUp` in CircuitStage, systems beat) with a 430ms minimum cadence measured from the previous light; randomised 300–1100ms hold; lights out; black stage lifts with a team-colour curtain lagging 100ms; hero entrance animations gated by `revealed`; scroll steps blocked while `html[data-booting]`; once per session (sessionStorage `hamilton-booted`), then a ~0.5s micro fade; reduced motion = plain fade; any key/pointer skips
- B · Telemetry cursor (`components/TelemetryCursor.jsx`): 6px team dot + spring-lagged hairline ring; docks onto small interactive elements as a rounded frame; modes drag (vault canvas, reactor dial), prev/next (gallery halves), cross (hero hotspots), chip with chapter number (circuit pins); re-reads context every 450ms so travel under a still pointer stays correct; pointer-fine only, hidden for touch/reduced motion; root flag is `data-cursor-mode` (not `data-cursor`, which is the hook attribute)
- C · Theme paint-sweep (`lib/themeTransition.js`): View Transitions API clip-path circle from the pressed brand mark (old world outside, new inside) + a shockwave ring element; translucent wash fallback; reduced motion = instant; all theme changes (switcher, hero arrows/swipe) route through `changeTeamTheme` in App
- D · Wayfinding instrument (`components/LapCounter.jsx`, `Nav.jsx`, `lib/wayfinding.js`): nav right slot morphs from 7× WORLD CHAMPION (hero) to SECTOR xx / 11 with eleven ticks (hover names, click travels, sweep + target while travelling); idle 6s cue "NEXT · 04 GALLERY" (or "SCROLL TO CONTINUE" on gallery/legacy) that retires after 3 learned gesture steps (localStorage `hamilton-wayfinding-steps`); EXPLORE menu now lists all 11 chapters in a 2-column editorial grid with number, teaser, colour-world swatch, current marker, Escape to close; SpatialExperience publishes `{activeKey,targetKey,isTraveling,isCircuitOverview}` via `onRouteChange` and exposes `window.__spatialStep`
- Bug fix: mobile Victories rows were hiding race/date/circuit via an old `.victory-row>span:not(.win-number)` rule; rows now show number · date · race+circuit · POLE/FL chips at 390px with no overflow
- Screenshot note: headless WebGL screenshots can return black frames (ReadPixels stall) — verify via DOM state

## Hero Pass 2 — Volumetric Figure Rig + Hotspot Focus — 2026-09-02
- User: figures "still feel like PNGs"; the white spray on clicking a pointer is too much
- Root causes: 190px white(.6) soft-light burst glow scaling .6→1; hovering already activated a point so a desktop click toggled it OFF (glow flashed on/off); figure was a single plate with three static drop-shadows
- Figure rig (`HeroDepth.css`, `.hw-body` in HeroStage): five plates of the same PNG — cast shadow (flipped/skewed/blurred, leans away from the pointer light), polished-floor reflection, light-wrap halo, rim light (white plate offset toward the light), main image — plus a soft-light sheen masked to the silhouette (specular + floor colour bounce + side falloff); pointer sets `--lx/--ly` on the hero `motion.section`; hotspots parallax ±9/6px; body breathes 7.5s; mobile hides wrap/sheen and disables breathing; reduced-motion honoured
- Hotspot focus: 120px halo at .24 (no burst), accent reticle ring, single thin ping; hover previews (mouse/pen only via pointerType), click pins (`is-pinned`, survives leaving), same-dot click or background pointerdown unpins, theme switch clears; theme wash flash .5→.28
- Verified by testing agent on desktop + touch; no regressions

## Theme Transition Rebuild — Slide-Wipe + Instant Figures — 2026-09-02
- User rejected the radial View-Transition reveal ("childish", heavy) and reported slow figure appearance
- Replaced with `lib/themeTransition.js` slide-wipe: one fixed element, two transform-only pseudo-elements (2px accent hairline + 26vw translucent band, 520ms), direction = position on the switcher (mclaren → mercedes → ferrari left→right, wrapping); theme applies at 220ms as the edge crosses centre; `html[data-theme-dir]` recorded; reduced motion = instant, no wipe
- HeroStage THEME_ORDER aligned to the switcher order so arrows, swipes, figure slide and wipe agree; figure enter/exit no longer animates filter blur (transform + opacity, 550ms); white `hw-wash` flash removed
- Figures: PNG → WebP q90 (828→117KB etc.), decoded at boot and kept referenced (`lib/boot.js warmImages`), `decoding="sync"` on all plates → new figure is complete on its first frame
- Switcher shows the pressed state optimistically (instant feedback)
- Wipe intensity later reduced on request: 1px hairline at .5 with an 8px halo, 22vw band at .14

## Hero Era Environments — 2026-09-02
- `components/EraEnvironment.jsx` + `HeroEnvironment.css`: each team colour is now a place behind the figure — McLaren = Interlagos 2008 (storm-dark top, sodium-lit horizon, two parallax rain tile layers, wet-asphalt streaks; rising particles hidden), Mercedes = Yas Marina twilight (violet band, warm horizon line, LED glow + reflection, twinkling stars), Ferrari = Maranello dawn (hazy low sun, god-ray, drifting mist)
- Shared system: committed horizon at `--horizon:60%` (62% mobile) with a faint hairline, pin lights and their reflection, floor that mirrors the horizon glow; mono caption on the horizon (`hero-era-place`, hidden on mobile)
- Weightless: gradients + transform-only SVG-tile rain; environments crossfade 0.7s via AnimatePresence in step with the slide-wipe; reduced motion freezes weather; text legibility preserved (floor darkens at the horizon, not under the stats)
- v2 after user feedback ("that white looks ugly", esp. Ferrari): principle changed to depth-from-darkness + light in the team's own hue — no white/pale washes anywhere. Ferrari: deep shadow overhead, molten amber sun/glow in the sky stack (mist, sun disc and god-ray removed), lights nearly off. Mercedes: navy overhead, deeper violet band, single ember horizon line. McLaren: deeper storm, saturated sodium glow, rain .5/.45. Rule for future hero work: never lay white or pastel gradients over saturated team colours

## Prioritized Backlog
### P0
- None; the Timeline crowding, incomplete season detail, PC lag, and reduced-motion deep-link race are resolved and verified

### P1
- Extend the Gallery's chapter-specific color-world principle to the remaining black-background chapters, one approved chapter at a time
- Refactor the compressed spatial camera and story components into smaller modules without altering the verified coordinate model
- Add a longer continuous navigation soak test for future spatial-camera changes
- Fine-tune chapter-marker label spacing for exceptionally narrow mobile screens
- Add an interactive world map connecting each victory to its circuit and country
- Add individual victory detail panels with race story, starting grid, and finishing margin
- Add a season-by-season points and championship battle visualization

### P2
- Add shareable victory cards for fans
- Add ambient engine/audio transitions with explicit sound controls
- Add image attribution and editorial source notes page

## Next Tasks
1. Remaining master-level design proposals (user-approved list): E synthesized opt-in sound layer; F chapter elevations — F1 Milestones "Lap Chart", F2 Tracks "Atlas" with real circuit geometry, F3 Voices "Team Radio", F4 Victories "Timing Tower"; G typographic floor (10px minimum for mono labels)
2. Select the next chapter for page-by-page monumental redesign
2. Multi-minute Silverstone camera soak test and performance profiling
3. Modularize the circuit camera calculations without altering the verified path
4. Complete remaining authentic season-photo mappings
5. Interactive global victory map
6. Rich race detail overlays for landmark wins
7. Shareable fan-stat cards to improve organic reach

## Hero Redesign — White Plane + 3D Lewis Cutout (June 2026)
- User supplied a Lewis Hamilton photo (red Ferrari suit, yellow helmet); background removed via rembg after Gemini 3D-tune pass; saved as /app/frontend/public/images/lewis-hero.png (transparent PNG)
- HeroStage.jsx fully rebuilt: white hero plane, centered 3D-tuned Lewis cutout with floor/contact shadows, mouse-parallax tilt, giant ghost "HAMILTON" outline behind
- 5 interactive hotspots (head/heart/arm/helmet/legs) — hover reveals floating card on desktop, tap on mobile (fixed bottom sheet); content: Racecraft IQ, Still We Rise, Precision, No.44, Endurance
- Theme option b: hero background + accents tint with team color (verified Ferrari red / Mercedes teal)
- New CSS: /app/frontend/src/HeroWhite.css (imported in App.js); old hero-v3 classes untouched
- Verified: hotspot hover, theme tint, ArrowDown -> circuit navigation still intact

### Hotspot Redesign v2 (June 2026)
- Replaced big circular buttons with tiny 6px points + SVG angled "graph" callout lines + always-visible stylized cards (numbered tags, accent side-bar)
- 6 callouts: head (mentality/Still I Rise), shoulders (7 crowns record), heart (his people: Anthony, Carmen, Roscoe), hand (105 trophies), helmet (many lids collection), shoes (104 poles)
- ≤1280px cards collapse to tag+title (copy on hover); mobile keeps tap → bottom-sheet card

### Per-Team 3D Models (June 2026)
- 3 user-supplied photos processed (Gemini 3D-tune + rembg): /images/lewis-mclaren.png (751x1222), /images/lewis-ferrari.png (538x1209), /images/lewis-mercedes.png (538x1186)
- HeroStage now has LAYOUTS map: per-team image, aspect ratio, and per-team hotspot positions/lines (poses differ); teamTheme prop passed from SpatialExperience
- Old lewis-hero.png retained but unused

### Mobile Hero + Swipe Theme Switch (June 2026)
- Mobile hero layout restructured: title 13vh, figure 47vh bottom-anchored (24vh pad), stats at 12.5vh, CTA left/swipe hint right at bottom — no overlaps (verified via bbox tests, iteration_46 100% pass)
- Touch swipe left/right on hero cycles team themes (THEME_ORDER ferrari->mercedes->mclaren, wraps); vertical swipe still navigates chapters (SpatialExperience touchmove now yields when horizontal dominates)
- Mobile hotspot cards render as bottom sheet above stats; swipe hint (data-testid hero-swipe-hint) mobile-only

### Hero Feature Batch (June 2026)
- Swipe/theme transition: AnimatePresence directional slide+blur on model swap + white radial wash flash
- Era-matched hotspot content per team (ERA_CONTENT: mclaren rookie era / mercedes dynasty / ferrari new chapter)
- Hover spotlight: data-spotlight attr dims title/stats/ghost/other spots, glows active body part (.hw-spot-glow)
- Atmosphere: 14 rising particles, tire-mark floor fx (.hw-floor-fx, hwHaze), ghost HAMILTON drifts (hwGhostDrift 26s)
- Era stat morphing: ERA_STATS (mclaren 21/1/26, mercedes 84/6/78, ferrari career 105/7/104) + hero-era-tag label
- ArrowLeft/Right switch themes only when hero active (.circuit-viewport dataset guard)
- Tested: iteration_47 (10/11 pass), era-tag padding specificity bug fixed (.hw-stats>.hw-stats-era, verified 19px height)

### Silverstone Ground Silhouette on Hero (June 2026)
- Added .hw-ground-track behind Lewis: real SILVERSTONE_PATH SVG (viewBox 87 -5 326 511) with 4 stroke passes (blur halo, white echo, engraved dark line, animated white pulse dash)
- Matched to CircuitStage overview: CSS rotate(39.6deg) = 3D rotation PI*0.22, rotateX(58deg) = camera elevation ~30deg -> scroll transition reads as one continuous zoom into the 3D track
- Mobile: 120vw wide at bottom 8vh

### Scroll-Linked Ground Zoom Bridge (June 2026)
- circuit-ground-bridge layer (z-42) in SpatialExperience: same Silverstone SVG/orientation as hero, scroll-driven via scrollYProgress
- bridgeOpacity [0.05,0.08,0.115,0.15]->[0,0.9,0.55,0]; bridgeScale [0.05,0.15]->[1,2.15]; grows over the shrinking hero, fades as 3D map fades in
- Verified with lenis.scrollTo forced positions (opacity/scale ramps correct); NOTE: native window.scrollTo doesn't work for testing, use window.__hamiltonLenis.scrollTo

### Hero Fade (no zoom) Transition Rework (June 2026)
- heroScale locked at 1 (no shrink); heroOpacity fades in place [0,0.045,0.125]->[1,1,0]
- Bridge silhouette is now the sole connector: opacity [0.03,0.06,0.13,0.175]->[0,1,0.75,0], scale [0.045,0.175]->[1,2.3]; mapOpacity [0.1,0.16]
- Verified via lenis.scrollTo at p=0.07/0.12/0.17

### Bridge Rework: pure crossfade, position-matched (June 2026)
- Removed bridge scale growth entirely (no "second circuit growing"); bridge z-index 2 (UNDER circuit-map-layer z3) so opaque 3D canvas covers it as mapOpacity ramps -> clean crossfade
- Hero silhouette + bridge repositioned to match 3D overview footprint: left 49%, top 54%, width min(56vw,870px) (measured 3D track bbox ~x225-1310/y285-735 @1568 render)
- bridgeOpacity [0.02,0.05,0.16,0.19]->[0,1,1,0]
- NOTE: screenshot tool returns black frames when capturing rapidly during WebGL animation (ReadPixels stall) - not an app bug

### Chapter Worlds Polish + Travel Watchdog (June 2026)
- ROOT CAUSE of "empty chapters": intermittent stuck travel (data-traveling='true' never clearing) kept chapters clip-hidden. Fixed with non-resettable watchdog in goTo (force-lands on targetRef after TRAVEL_DURATION+1.1s)
- Moment chapter redesigned as "Home Fortress" world: kicker, 4-stat row (9 wins/7 poles/15 podiums/480K fans), 9-entry Silverstone wins year rail (2008-2024) with staggered entrance; new CSS in ChapterWorlds.css (.moment-world)
- All 11 chapters audited via screenshots: legacy/timeline/cars/gallery/records/milestones/tracks/quotes/victories/footer already polished from previous session
- iteration_48: 100% pass (11-chapter soak, keyboard walk, legacy reveal, moment redesign, hero regression)

### Chapter Transition Flair (June 2026)
- ChapterFlair.jsx + ChapterFlair.css: signature arrival overlay per chapter, mounts when traveling flips false, lives 1.75s, z-70, pointer-events none, reduced-motion hidden
- Effects: legacy paparazzi flash, timeline tick scrub, cars headlight beam, gallery flash+aperture ring, records gold shimmer, milestones checkered wipe, tracks sector sweep (purple/green/yellow), moment rain streaks, quotes radio waveform, victories gold confetti, footer dawn glow
- iteration_49: 100% pass (all 11 flairs, re-entry replay, interaction safety, reduced-motion, hero regression)

### Legacy Chapter Enhancement (June 2026)
- Career Scrubber: range input 2007-2025 (data-testid legacy-scrub-input), CAREER cumulative table in Chapters.jsx; morphs titles/wins/podiums/poles/seasons live with pop animation; era-gradient track (mclaren/mercedes/ferrari segments); year+team readout (legacy-scrub-year/team)
- data-era + data-scrubbed attrs on .legacy-monument drive: portrait duotone era tint (mix-blend color, hover=full color), era rail is-current highlight, team-colored readout
- Atmosphere: museum spotlight sweep (transform-based), gold-leaf shimmer on ghost 44 (background-clip:text), drifting gold dust layer
- Stat whispers: hover context lines on all 6 stats (.legacy-whisper, hidden on mobile)
- Self-tested via interaction screenshots (scrub to 2010, whisper hover, era tint) - all working; mobile scrubber placed at bottom 31vh (whispers/spotlight disabled on mobile)

### Legacy Chapter REBUILT as "Data Cathedral" (June 2026) — replaced monument+scrubber design (user rejected it)
- Concept D: every race (368 starts, 2007-2025) rendered as a vertical light bar; height=finish position, era colors (mclaren orange/mercedes teal/ferrari red), gold glowing bars=105 wins, crowns+gold underline=7 title seasons, stub bars=DNF
- Data: /app/frontend/src/data/careerRaces.js (CAREER_SEASONS with exact per-season races/wins/podiums, deterministic seeded synthesis for other finishes; totals 368/105/202/7 exact)
- Component: LegacyChapter in Chapters.jsx (cath-* classes), hover tooltip (year/round/result/team), light sweep, stats column, legend; CSS /app/frontend/src/DataCathedral.css
- FIXED: legend <footer> tag inherited red site-footer bg -> changed to div; hover dim now via filter (CSS animation fill locks opacity); resync watcher now lands immediate (no animated ping-pong)
- Old monument CSS (LegacyChapter.css inner rules) now unused but kept; section keeps legacy-section legacy-monument classes for show/hide machinery
- KNOWN ENV QUIRK: headless screenshot env throttles rAF -> lenis travels take 5-7s there (real browsers 1.25s); use long waits when testing navigation

## Legacy Chapter — Particle Monument + Championship Vault (June 2026)
- Replaced the rejected "Data Cathedral" with a two-act WebGL experience combining the Particle Monument and Trophy Vault concepts
- Act 1 (Monument): ~14,000 gold GPU shader particles assemble from chaos into a giant "44"; the cursor is a gravity well that tears through the dust (activates only after real pointer movement); stats + kicker + unlock CTA overlays
- Act 2 (Vault): scroll-down or CTA triggers particles scattering, titanium doors closing with a spinning gold "7" lock wheel, then splitting open into a 3D hall of 7 championship trophies (2008–2020) on pedestals with year plaques, accent light rings, volumetric light cones, dust, and faux mirror-floor reflections
- Vault navigation: year rail, prev/next chevrons, Arrow keys, click-a-trophy, drag-to-rotate the focused cup; story panel per title (team, car, headline, story, wins/poles/points); "Seal the Vault" or scroll-up returns to the monument
- Scroll engine integration via useChapterStep: one step opens vault, next step advances to Timeline; scroll-up in vault seals back
- Performance hardening: replaced PMREM RoomEnvironment + Reflector (froze the main thread on software/low-end GPUs) with procedural canvas matcap gold/steel shading and mirrored-mesh reflections; mobile camera pull-back and layout pass
- Files: frontend/src/components/LegacyVault.jsx, frontend/src/LegacyVault.css (DataCathedral.css removed)
- Tested: testing agent iteration_50 (95% pass, all flows) + manual screenshots desktop/mobile; mobile year-rail overlap fixed; freeze fixed and re-verified

## Vault Trophies — Real F1 Championship Trophy Remodel (June 2026)
- Remodelled all 7 vault trophies procedurally from the user-supplied reference photo of the real F1 World Championship trophy
- Model parts: brushed-silver concave trumpet body (LatheGeometry), gold spiral coil wrapping the body (TubeGeometry on a custom helix following the wall radius), black/gold checkered collar (canvas texture cylinder), gold lip trim, gold emblem medallion seated on the flare, rounded silver foot
- Materials: procedural silver + gold canvas matcaps, brushed-metal multiply map (zero lighting cost, safe on low-end GPUs)
- "Alive" motion: gentle float bob, slight sway, breathing scale pulse on the focused trophy, auto-rotate + drag-spin, faux mirror reflections fully synced (position/rotation/scale)
- Verified via desktop + mobile screenshots: silhouette matches reference, focus dimming works, no console errors

## Legacy Chapter — Team Theme Integration (June 2026)
- The whole Legacy chapter now reacts live to the global team theme switcher (Ferrari / Mercedes / McLaren)
- Monument particles: shader palette uniforms (uColorA/uColorB/uSpark) smoothly lerp per theme — Maranello red, Petronas teal, Papaya orange; kicker copy names the shard colour per theme
- Vault: light cones and dust lerp to the theme accent; pedestal rings intentionally stay per-title (2008 McLaren orange, 2014-20 Mercedes teal); trophy stays realistic silver/gold
- All DOM accents (CTA, doors, lock wheel, seam, year rail, story year, seal button) use global CSS vars (--acid, --accent-rgb, --accent-ink, --accent-shadow) so they follow the theme with zero JS
- teamTheme prop threaded: SpatialExperience → ChapterView → LegacyVault
- Verified via screenshots: all three themes on the monument, themed doors/lock, and a live theme switch while inside the vault

## Silverstone Circuit Rework — Orbit, Cinematic Camera, Post-Processing — 2026-09-02
- Installed `@react-three/postprocessing@3.1.1` + `postprocessing@6.39.4` (R3F v9 / three 0.185 compatible)
- Manual orbit in the top-down view (hub after the hero and every Back-to-Circuit overview): drag rotates (azimuth free, elevation clamped 22°–75°), pinch / ctrl+wheel zooms (0.62×–1.55×), release inertia with damping, idle >4s eases into a slow auto-orbit with elevation/distance breathing. State in `three/circuitOrbit.js`; gestures in `components/circuit/useOrbitGestures.js` (vertical touch swipes are released so chapter stepping is untouched; `travelRef.dragging` makes SpatialExperience's touchmove yield)
- Camera director (`Rig` in CircuitStage): overview↔chase is a quadratic bezier swoop (side control point + low dive, FOV 36→64 with a mid-flight kick, roll into the turn) driven by a timed ease (`FOLLOW_DURATION` 1.2s) instead of an exponential lerp; Back to Circuit bumps `travelRef.overviewToken` → orbit resets to the car's azimuth so the pull-up reads as a crane reveal; chase has speed-linked lag, acceleration dip, banking sway and micro-shake; portrait viewports pull the overview back so the whole track fits
- Post stack (`components/circuit/CircuitEffects.jsx`): HDR bloom (threshold .95, colours normalised with `glow(color, luminance)` in `three/circuitMath.js` so red/teal/orange bloom equally), vignette closing in during the chase, chromatic aberration scaled by speed (desktop only); MSAA 4 desktop / 2 mobile, bloom resolution .75/.5, DPR cap 1.6/1.25; reduced-motion disables the composer, motes, trail, drift and shake
- Life (`components/circuit/CircuitLife.jsx`): racing-line energy packets (two heads sweeping the line, brighter on the covered part), start-light cascade running gate-to-gate toward the active chapter with a beating active beacon, floodlight mains flicker, drifting light motes (520 desktop / 220 mobile, one draw call), car light trail sampled off the racing line while travelling, rotating accent glow band in the sky dome
- Canvas is now paused while the Hero is active (was rendering hidden); `WarmUp.advance` passes seconds; Rig snaps `follow` on resume so deep-link → Back to Circuit still cranes
- Orbit hint pill (`circuit-orbit-hint`, "DRAG TO ORBIT · CTRL + SCROLL TO ZOOM" / "PINCH TO ZOOM" on coarse pointers) hides after the first gesture; TelemetryCursor shows the DRAG chip over the orbitable canvas
- Iteration 51 (frontend testing agent): 100% — hero→hub, drag orbit without navigation, pins clickable after rotation, crane on Back to Circuit, ctrl+wheel zoom without browser zoom, wheel/keyboard stepping from overview, theme switching, mobile touch drag vs vertical swipe, deep link, reduced motion, Explore menu, zero console errors

## Scroll-Scrub Travel, Slower Journeys & F1 Car Remodel — 2026-09-03
- Interaction model: wheel/touch now *scrub* the camera + car along the racing line in real time (SpatialExperience `scrubRef`, `beginScrub/tick/finishScrub`); per-frame lerp (SCRUB_LERP 9) onto `lenis.scrollTo(immediate)`; when input rests 150ms (or the finger lifts) the journey eases onto the nearest chapter with a 0.32-gap directional bias — a single wheel notch kicks 20% of a chapter and still lands on the next chapter; a held finger never snaps
- Kept quantised: keyboard, hero↔hub handoff, chapter-owned steps (Legacy vault, Gallery slides via `consumeChapterStep`), programmatic `__spatialStep`; `goTo` cancels an in-flight scrub (menu/pins)
- `travelDuration(from,to)`: 0.6 + gaps×1.5 (one chapter ≈ 2.1s, cross-circuit capped 3.6s, hero handoff 1.6s); watchdog re-armed per goTo with the real duration; scrub sets `targetKey` to the chapter ahead for the lap counter
- New procedural F1 car (`components/circuit/RaceCar.jsx`): rounded-box monocoque, tapered nose, coke-bottle sidepods with "44" canvas decals, airbox + shark fin, halo + yellow helmet, wings with endplates/DRS flap/beam wing, diffuser, wishbones, rain light (HDR), wheels that spin with `life.velocity` and front wheels that steer with `life.bank`
- Chase camera moved closer (lag 15.5, height 6, look-ahead 22); perf: 11 gate point lights removed, DPR cap 1.4 desktop, MSAA 2
- Iteration 52 (testing agent): 100% — wheel scrub, single-notch advance, touch scrub with held finger, Legacy vault + Gallery slide consumption, keyboard, hero handoff, overview + far pin, Explore menu, drag-orbit regression, reduced motion, zero console errors
