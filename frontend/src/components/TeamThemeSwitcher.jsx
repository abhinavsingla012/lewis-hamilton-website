import { siFerrari, siMclaren } from "simple-icons/icons";

const BrandMark = ({ team }) => {
  if (team === "mercedes") return <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9.25" fill="none" stroke="currentColor" strokeWidth="1.4"/><path d="M12 2.8 13 10.7 20.3 16.7 12.6 13.2 4.1 17.2 11 10.7Z" fill="currentColor"/></svg>;
  const icon = team === "ferrari" ? siFerrari : siMclaren;
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d={icon.path} fill="currentColor"/></svg>;
};

const teams = [
  { key: "mclaren", label: "McLaren" },
  { key: "mercedes", label: "Mercedes" },
  { key: "ferrari", label: "Ferrari" },
];

export const TeamThemeSwitcher = ({ theme, onChange }) => <div className="team-theme-switcher" role="group" aria-label="Choose team color theme" data-testid="team-theme-switcher">
  {teams.map(({ key, label }) => <button
    key={key}
    className="team-theme-button"
    data-team={key}
    aria-pressed={theme === key}
    aria-label={`Use ${label} color theme`}
    onClick={(event) => {
      const rect = event.currentTarget.getBoundingClientRect();
      onChange(key, { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    }}
    data-testid={`team-theme-${key}-button`}
  >
    <BrandMark team={key} />
    <span>{label}</span>
  </button>)}
</div>;