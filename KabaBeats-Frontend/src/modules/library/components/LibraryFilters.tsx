import { Search, Filter, SortAsc } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuCheckboxItem } from "@/components/ui/dropdown-menu";
import { useLanguage } from "@/contexts/LanguageContext";

interface LibraryFiltersProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  genreFilter: string[];
  setGenreFilter: (genres: string[]) => void;
  licenseFilter: string[];
  setLicenseFilter: (licenses: string[]) => void;
  genres: string[];
  licenseTypes: string[];
}

export function LibraryFilters({
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  genreFilter,
  setGenreFilter,
  licenseFilter,
  setLicenseFilter,
  genres,
  licenseTypes
}: LibraryFiltersProps) {
  const { t } = useLanguage();
  
  const handleGenreToggle = (genre: string) => {
    if (genreFilter.includes(genre)) {
      setGenreFilter(genreFilter.filter(g => g !== genre));
    } else {
      setGenreFilter([...genreFilter, genre]);
    }
  };

  const handleLicenseToggle = (license: string) => {
    if (licenseFilter.includes(license)) {
      setLicenseFilter(licenseFilter.filter(l => l !== license));
    } else {
      setLicenseFilter([...licenseFilter, license]);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Search */}
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder={t('library.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Sort */}
      <Select value={sortBy} onValueChange={setSortBy}>
        <SelectTrigger className="w-[180px]">
          <SortAsc className="h-4 w-4 mr-2" />
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="recent">{t('library.mostRecent')}</SelectItem>
          <SelectItem value="oldest">{t('library.oldestFirst')}</SelectItem>
          <SelectItem value="title">{t('library.titleAZ')}</SelectItem>
          <SelectItem value="producer">{t('library.producerAZ')}</SelectItem>
          <SelectItem value="price-high">{t('library.priceHighLow')}</SelectItem>
          <SelectItem value="price-low">{t('library.priceLowHigh')}</SelectItem>
        </SelectContent>
      </Select>

      {/* Genre Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            {t('library.genre')}
            {genreFilter.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {genreFilter.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {genres.map((genre) => (
            <DropdownMenuCheckboxItem
              key={genre}
              checked={genreFilter.includes(genre)}
              onCheckedChange={() => handleGenreToggle(genre)}
            >
              {genre}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* License Filter */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="w-[140px]">
            <Filter className="h-4 w-4 mr-2" />
            {t('library.license')}
            {licenseFilter.length > 0 && (
              <span className="ml-2 bg-primary text-primary-foreground rounded-full px-2 py-0.5 text-xs">
                {licenseFilter.length}
              </span>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          {licenseTypes.map((license) => (
            <DropdownMenuCheckboxItem
              key={license}
              checked={licenseFilter.includes(license)}
              onCheckedChange={() => handleLicenseToggle(license)}
            >
              {license}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
