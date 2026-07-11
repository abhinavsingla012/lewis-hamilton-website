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

## Prioritized Backlog
### P0
- None; the post-Legacy overlap, lag, and first-route framing regressions are resolved and verified

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
1. Multi-minute Silverstone camera soak test and performance profiling
2. Modularize the circuit camera calculations without altering the verified path
3. Interactive global victory map
4. Rich race detail overlays for landmark wins
5. Shareable fan-stat cards to improve organic reach
