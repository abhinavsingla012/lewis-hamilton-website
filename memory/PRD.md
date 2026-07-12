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

## Prioritized Backlog
### P0
- None; the Timeline crowding, incomplete season detail, PC lag, and reduced-motion deep-link race are resolved and verified

### P1
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
1. Select the next chapter for page-by-page monumental redesign
2. Multi-minute Silverstone camera soak test and performance profiling
3. Modularize the circuit camera calculations without altering the verified path
4. Complete remaining authentic season-photo mappings
5. Interactive global victory map
6. Rich race detail overlays for landmark wins
7. Shareable fan-stat cards to improve organic reach
