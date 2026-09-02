import { AnimatePresence, motion } from "framer-motion";

/**
 * Era environments — each team colour becomes a place with a horizon, weather and light.
 *   McLaren  → Interlagos 2008: storm-dark sky, sodium-lit horizon, rain, wet asphalt.
 *   Mercedes → Yas Marina twilight: violet horizon band, LED glow, pin lights, stars.
 *   Ferrari  → Maranello dawn: deep shadow overhead, a molten amber sun low on the horizon.
 * Pure CSS layers (gradients + two transform-only weather tiles); crossfades with the theme.
 */
export const ERA_PLACES = {
  mclaren: { caption: "INTERLAGOS · SÃO PAULO · 2008 · RAIN", weather: "rain" },
  mercedes: { caption: "YAS MARINA · ABU DHABI · TWILIGHT", weather: "stars" },
  ferrari: { caption: "MARANELLO · EMILIA-ROMAGNA · DAWN", weather: "dawn" },
};

export const EraEnvironment = ({ teamTheme = "ferrari" }) => {
  const place = ERA_PLACES[teamTheme] || ERA_PLACES.ferrari;
  return <AnimatePresence initial={false}>
    <motion.div
      key={teamTheme}
      className="hw-env"
      data-era={teamTheme}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.7, ease: "easeInOut" }}
      aria-hidden="true"
      data-testid="hero-environment"
    >
      <div className="hw-env-sky" />
      {place.weather === "stars" && <div className="hw-env-stars" />}
      <div className="hw-env-lights" />
      <div className="hw-env-lights-reflection" />
      <div className="hw-env-horizon" />
      {place.weather === "rain" && <>
        <div className="hw-env-wet" />
        <div className="hw-env-rain is-far" />
        <div className="hw-env-rain is-near" />
      </>}
      <span className="hw-env-caption" data-testid="hero-era-place">{place.caption}</span>
    </motion.div>
  </AnimatePresence>;
};
