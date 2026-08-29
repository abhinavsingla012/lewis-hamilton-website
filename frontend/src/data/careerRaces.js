const SEASONS = [
  { year: 2007, team: "mclaren", races: 17, wins: 4, podiums: 12, title: false },
  { year: 2008, team: "mclaren", races: 18, wins: 5, podiums: 10, title: true },
  { year: 2009, team: "mclaren", races: 17, wins: 2, podiums: 5, title: false },
  { year: 2010, team: "mclaren", races: 19, wins: 3, podiums: 9, title: false },
  { year: 2011, team: "mclaren", races: 19, wins: 3, podiums: 6, title: false },
  { year: 2012, team: "mclaren", races: 20, wins: 4, podiums: 7, title: false },
  { year: 2013, team: "mercedes", races: 19, wins: 1, podiums: 5, title: false },
  { year: 2014, team: "mercedes", races: 19, wins: 11, podiums: 16, title: true },
  { year: 2015, team: "mercedes", races: 19, wins: 10, podiums: 17, title: true },
  { year: 2016, team: "mercedes", races: 21, wins: 10, podiums: 17, title: false },
  { year: 2017, team: "mercedes", races: 20, wins: 9, podiums: 13, title: true },
  { year: 2018, team: "mercedes", races: 21, wins: 11, podiums: 17, title: true },
  { year: 2019, team: "mercedes", races: 21, wins: 11, podiums: 17, title: true },
  { year: 2020, team: "mercedes", races: 16, wins: 11, podiums: 14, title: true },
  { year: 2021, team: "mercedes", races: 22, wins: 8, podiums: 17, title: false },
  { year: 2022, team: "mercedes", races: 22, wins: 0, podiums: 9, title: false },
  { year: 2023, team: "mercedes", races: 22, wins: 0, podiums: 6, title: false },
  { year: 2024, team: "mercedes", races: 24, wins: 2, podiums: 5, title: false },
  { year: 2025, team: "ferrari", races: 12, wins: 0, podiums: 0, title: false },
];

const seeded = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

let globalIndex = 0;
export const CAREER_SEASONS = SEASONS.map((season) => {
  const winGap = season.wins > 0 ? season.races / season.wins : Infinity;
  const winRounds = new Set(Array.from({ length: season.wins }, (_, i) => Math.min(season.races, Math.round((i + 0.6) * winGap))));
  while (winRounds.size < season.wins) winRounds.add(1 + Math.floor(seeded(season.year + winRounds.size) * season.races));
  const extraPodiums = season.podiums - season.wins;
  const podiumRounds = new Set();
  let cursor = 0;
  while (podiumRounds.size < extraPodiums) {
    cursor += 1;
    const candidate = 1 + Math.floor(seeded(season.year * 3 + cursor) * season.races);
    if (!winRounds.has(candidate)) podiumRounds.add(candidate);
  }
  const racesData = Array.from({ length: season.races }, (_, i) => {
    const round = i + 1;
    globalIndex += 1;
    const index = globalIndex;
    let pos;
    if (winRounds.has(round)) pos = 1;
    else if (podiumRounds.has(round)) pos = seeded(index * 1.7) > 0.5 ? 2 : 3;
    else if (seeded(index * 7.3) > 0.94) pos = 0;
    else pos = 4 + Math.floor(seeded(index * 2.9) * 10);
    return { year: season.year, round, team: season.team, pos, win: pos === 1, podium: pos >= 1 && pos <= 3, index };
  });
  return { ...season, racesData };
});

export const CAREER_TOTALS = {
  starts: SEASONS.reduce((sum, s) => sum + s.races, 0),
  wins: SEASONS.reduce((sum, s) => sum + s.wins, 0),
  podiums: SEASONS.reduce((sum, s) => sum + s.podiums, 0),
  titles: SEASONS.filter((s) => s.title).length,
};
