// Mock data for curated playlists
export const curatedPlaylists = [
  {
    id: "1",
    title: "Afrobeats Rising",
    description: "The hottest Afrobeats from across the continent",
    artwork: "",
    beatCount: 24,
    curator: "Kababeats",
    genre: "Afrobeats"
  },
  {
    id: "2",
    title: "Amapiano Essentials",
    description: "Essential Amapiano sounds for your next hit",
    artwork: "",
    beatCount: 18,
    curator: "Kababeats",
    genre: "Amapiano"
  },
  {
    id: "3",
    title: "Lagos Nights",
    description: "Late night vibes from Nigeria's music capital",
    artwork: "",
    beatCount: 15,
    curator: "Kababeats",
    genre: "Afrofusion"
  }
  ,{
    id: "4",
    title: "Soulful Sunset",
    description: "Warm mellow grooves for evening sessions",
    artwork: "",
    beatCount: 20,
    curator: "Kababeats",
    genre: "Soul" 
  }
];

// Global counter to ensure unique IDs across all calls
let beatIdCounter = 0;

// Generate more beats for infinite scroll
export const generateBeats = (offset: number, limit: number) => {
  const genres = ["Afrobeats", "Amapiano", "Afrotrap", "Hiplife", "Dancehall", "Afrofusion", "Kwaito", "Azonto"];
  const keys = ["C Minor", "G Major", "D Minor", "F# Minor", "A Major", "E Minor", "Bb Major", "C# Minor"];
  const producers = ["AfroKing", "Lagos Producer", "Accra Beats", "Naija Sound", "SA Vibes", "Kenya Flow", "Dar Beats", "Cape Town Music"];
  
  const now = Date.now();
  return Array.from({ length: limit }, (_, i) => {
    const uniqueId = `beat-${++beatIdCounter}-${offset + i + 1}-${now}-${Math.random().toString(36).slice(2,7)}`;
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    return {
      id: uniqueId,
      title: `Beat ${offset + i + 1}`,
      producer: producers[Math.floor(Math.random() * producers.length)],
      artwork: "",
      bpm: Math.floor(Math.random() * 60) + 80,
      key: randKey,
      musicalKey: randKey,
      genre: genres[Math.floor(Math.random() * genres.length)],
      price: Math.floor(Math.random() * 40) + 15,
      isLiked: Math.random() > 0.8,
    };
  });
};

// Initial featured beats
export const featuredBeats = generateBeats(0, 6);
