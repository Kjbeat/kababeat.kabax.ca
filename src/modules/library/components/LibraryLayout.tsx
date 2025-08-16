import { useState } from "react";
import { Grid3X3, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LibraryFilters } from "./LibraryFilters";
import { LibraryBeatCard } from "./LibraryBeatCard";
import { EmptyState } from "@/components/shared";
import { useLanguage } from "@/contexts/LanguageContext";

// Extended mock data with more beats for filtering demonstration
const purchasedBeats = [
  {
    id: 1,
    title: "Dark Night",
    producer: "ProducerX",
    artwork: "/placeholder.svg",
    price: 25,
    genre: "Trap",
    purchaseDate: "2024-01-15",
    licenseType: "Premium",
    bpm: 140,
    key: "C Minor"
  },
  {
    id: 2,
    title: "Golden Hour",
    producer: "BeatMaker99",
    artwork: "/placeholder.svg",
    price: 35,
    genre: "Hip Hop",
    purchaseDate: "2024-01-10",
    licenseType: "Exclusive",
    bpm: 95,
    key: "G Major"
  },
  {
    id: 3,
    title: "Neon Lights",
    producer: "SoundWave",
    artwork: "/placeholder.svg",
    price: 20,
    genre: "Electronic",
    purchaseDate: "2024-01-20",
    licenseType: "Basic",
    bpm: 128,
    key: "D Minor"
  },
  {
    id: 4,
    title: "Lagos Vibes",
    producer: "AfroKing",
    artwork: "/placeholder.svg",
    price: 30,
    genre: "Afrobeats",
    purchaseDate: "2024-01-12",
    licenseType: "Premium",
    bpm: 102,
    key: "F# Minor"
  },
  {
    id: 5,
    title: "Amapiano Flow",
    producer: "SA Vibes",
    artwork: "/placeholder.svg",
    price: 28,
    genre: "Amapiano",
    purchaseDate: "2024-01-18",
    licenseType: "Basic",
    bpm: 112,
    key: "A Major"
  },
  {
    id: 6,
    title: "Trap Queen",
    producer: "ProducerX",
    artwork: "/placeholder.svg",
    price: 40,
    genre: "Trap",
    purchaseDate: "2024-01-08",
    licenseType: "Exclusive",
    bpm: 145,
    key: "E Minor"
  }
];

export function LibraryLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState("recent");
  const [genreFilter, setGenreFilter] = useState<string[]>([]);
  const [licenseFilter, setLicenseFilter] = useState<string[]>([]);
  const { t } = useLanguage();

  // Get unique genres and license types for filters
  const genres = [...new Set(purchasedBeats.map(beat => beat.genre))];
  const licenseTypes = [...new Set(purchasedBeats.map(beat => beat.licenseType))];

  // Apply filters and sorting
  const filteredBeats = purchasedBeats
    .filter(beat => {
      const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           beat.producer.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesGenre = genreFilter.length === 0 || genreFilter.includes(beat.genre);
      const matchesLicense = licenseFilter.length === 0 || licenseFilter.includes(beat.licenseType);
      
      return matchesSearch && matchesGenre && matchesLicense;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.purchaseDate).getTime() - new Date(a.purchaseDate).getTime();
        case "oldest":
          return new Date(a.purchaseDate).getTime() - new Date(b.purchaseDate).getTime();
        case "title":
          return a.title.localeCompare(b.title);
        case "producer":
          return a.producer.localeCompare(b.producer);
        case "price-high":
          return b.price - a.price;
        case "price-low":
          return a.price - b.price;
        default:
          return 0;
      }
    });

  if (purchasedBeats.length === 0) {
    return (
  <div className="p-6 mt-14 sm:mt-16">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-foreground mb-4">{t('library.title')}</h1>
            <p className="text-muted-foreground">{t('library.description')}</p>
          </div>
          
          <EmptyState
            title={t('library.noBeatsInLibrary')}
            description={t('library.startBuildingCollection')}
            icon="music"
            action={{
              label: t('library.browseBeats'),
              onClick: () => window.location.href = "/browse"
            }}
          />
        </div>
      </div>
    );
  }

  return (
  <div className="p-6 mt-14 sm:mt-16">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-foreground mb-4">{t('library.title')}</h1>
          <p className="text-muted-foreground">{t('library.description')}</p>
        </div>

        {/* Filters */}
        <LibraryFilters
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          genreFilter={genreFilter}
          setGenreFilter={setGenreFilter}
          licenseFilter={licenseFilter}
          setLicenseFilter={setLicenseFilter}
          genres={genres}
          licenseTypes={licenseTypes}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground">
            {t('library.showingResults').replace('{count}', filteredBeats.length.toString()).replace('{total}', purchasedBeats.length.toString())}
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="sm"
              onClick={() => setViewMode("list")}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Beats Grid/List */}
        <div className={
          viewMode === "grid" 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            : "space-y-4"
        }>
          {filteredBeats.map((beat) => (
            <LibraryBeatCard
              key={beat.id}
              beat={beat}
              viewMode={viewMode}
            />
          ))}
        </div>

        {filteredBeats.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">{t('library.noBeatsFound')}</p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setGenreFilter([]);
                setLicenseFilter([]);
              }} 
              className="mt-4"
            >
              {t('library.clearFilters')}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
