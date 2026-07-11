export const IMAGES = {
  hero: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/cb95df8383fffc522ee4d0324cffcf7347e7705037800e290c78e797575c1769.png",
  mclaren: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/1bba8e0280ed454a2ce49564068d64cdf915c9179c65052bb30995a6b4b616d3.png",
  w11: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/ce7371473df56eadba0b7841b776779f4ae7eb29fbb7698d520243140b197356.png",
  china: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/ce7371473df56eadba0b7841b776779f4ae7eb29fbb7698d520243140b197356.png",
  portrait: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/32e7a2ba6758523bccd5627ff09900c6ab298d7e6db0e57f4f34116c9c2c6c6f.png",
  silverstone: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/0a1fa97d81cf97f078b596c85b60484204c4aaeb30ac022aedbeb42aeec230dd.png",
  ferrari: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/cec76e89bc406b891af6f647a32dbf858afedcc32ac72921b781188c4ced6d16.png",
  helmet: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/887bedcf926cb91d3d79873375c071b76fc9af661132f207cf52c04c20a4adf4.png",
  podium: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/4a9188e7a8e28cafeffb50e173acb430b5d09bacc595c1bdfc03afd7e6ca83cf.png",
  night: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/3eed2e9d11d2f0df9d245fab5a7d9837d4d5cf6de51a73a74e1632285975acbc.png",
  monaco: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/cabcb2f4763d3d2259e221c65a910a124fdcf60e64bcafe51a277d56c2925e2b.png",
  fans: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/0a28f4d34c39475dd51fb5e15cd3e691b645a221dcf98bdf3366c8ca87491f02.png",
  trophies: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/c90580c41847804d6354883b6a7238eb9f64fe249375ef8d8fa5fe1052fc24e5.png",
  garage: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/9ed847aaa80cc459eec4eb9f4c850f950968305e6f75a6df9e0d6e486429c2ed.png",
  rain: "https://static.prod-images.emergentagent.com/jobs/392e3fd2-b6b8-4420-b9a3-5416e232d539/images/a45ebaa9f2693b7c42e8cf4b5d413f7c0993efb88e90d715d423ec6872ff40db.png",
};
export const gallery = [
  { image: IMAGES.rain, label: "RAIN MASTER", meta: "SILVERSTONE / 2008", shape: "portrait" },
  { image: IMAGES.podium, label: "THE SUMMIT", meta: "SEVEN WORLD TITLES", shape: "wide" },
  { image: IMAGES.helmet, label: "THE ICON", meta: "PURPLE REIGN", shape: "square" },
  { image: IMAGES.night, label: "UNDER LIGHTS", meta: "GLOBAL STAGE", shape: "wide" },
  { image: IMAGES.monaco, label: "STREET ROYALTY", meta: "MONACO", shape: "wide" },
  { image: IMAGES.fans, label: "TEAM LH", meta: "A GLOBAL FOLLOWING", shape: "wide" },
];
export const eras = [
  { year: "2008", title: "The first crown", team: "McLaren MP4-23", wins: "5 wins", copy: "A title decided by one point, in the final corners of the final lap.", image: IMAGES.mclaren },
  { year: "2014", title: "A new force", team: "Mercedes W05", wins: "11 wins", copy: "The hybrid era begins. Hamilton turns a fresh start into total control.", image: IMAGES.china },
  { year: "2020", title: "The benchmark", team: "Mercedes W11", wins: "11 wins", copy: "Eleven victories in seventeen races. A machine and driver operating as one.", image: IMAGES.w11 },
  { year: "2025", title: "The red chapter", team: "Ferrari SF-25", wins: "New era", copy: "A historic move. The pursuit continues in the sport’s most iconic colour.", image: IMAGES.ferrari },
];
export const quotes = [
  { quote: "He may well be the best driver that has ever existed.", person: "Toto Wolff", role: "Mercedes Team Principal" },
  { quote: "Lewis has been a great champion, perhaps the greatest of all time.", person: "Fernando Alonso", role: "Two-time World Champion" },
  { quote: "He is one of the greatest talents this sport has ever seen.", person: "Niki Lauda", role: "Three-time World Champion" },
];
export const trackShapes = {
  "Silverstone Circuit": "M14 59 C42 44 41 20 65 23 C85 25 87 46 71 56 C55 67 37 66 14 59Z",
  Hungaroring: "M17 50 C20 27 38 19 57 22 C77 24 84 42 75 56 C65 69 44 67 34 60 C26 54 22 52 17 50Z",
  "Circuit Gilles Villeneuve": "M18 62 L31 51 L27 37 L43 24 L65 29 L80 44 L69 59 L45 63 L18 62Z",
  "Circuit de Barcelona-Catalunya": "M14 53 L27 25 L48 30 L62 19 L81 35 L70 60 L47 64 L32 54 L14 53Z",
  "Shanghai International Circuit": "M18 57 C13 39 25 22 44 23 C64 24 81 37 77 51 C73 65 51 66 43 53 C35 40 48 34 59 42",
};