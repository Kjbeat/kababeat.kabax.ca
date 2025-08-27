// Utility to generate mock beat data for tables & infinite scrolling
// Can be reused in tests or stories.

export interface Beat {
  id: number;
  title: string;
  artwork: string;
  bpm: number;
  key: string;
  genre: string;
  date: string; // ISO date
  status: "Published" | "Draft" | "Scheduled";
  streams: number;
  sales: number;
}

const ADJECTIVES = ["Midnight","Summer","Urban","Neon","Golden","Crimson","Velvet","Eternal","Solar","Lunar","Mystic","Digital","Retro","Echo","Dream"];
const NOUNS = ["Vibes","Heat","Dreams","Skies","Waves","Rhythm","Pulse","Lights","Shadows","Echoes","Groove","Horizon","Flow","Drift","Aura"];
const GENRES = ["Trap","Hip Hop","R&B","Pop","Lo-Fi","Drill","Afrobeats"];
const KEYS = ["C Minor","D Major","F# Minor","A Minor","E Major","G Minor","B Minor","C# Major"]; 
const STATUSES: Beat["status"][] = ["Published","Draft","Scheduled"];

function randomItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }
function randomInt(min: number, max: number) { return Math.floor(Math.random() * (max - min + 1)) + min; }

export function generateMockBeats(count: number, startId: number = 1): Beat[] {
  const beats: Beat[] = [];
  for (let i = 0; i < count; i++) {
    const id = startId + i;
    const title = `${randomItem(ADJECTIVES)} ${randomItem(NOUNS)}`;
    const bpm = randomInt(70, 170);
    const key = randomItem(KEYS);
    const genre = randomItem(GENRES);
    const status = randomItem(STATUSES);
    const daysAgo = randomInt(0, 60);
    const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
    const streams = status === "Draft" ? 0 : randomInt(0, 50000);
    const sales = status === "Published" ? randomInt(0, 120) : 0;
    beats.push({ id, title, artwork: "/placeholder.svg", bpm, key, genre, date, status, streams, sales });
  }
  return beats;
}
