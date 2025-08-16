import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X, Search } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const genres = ["All", "Hip Hop", "Trap", "R&B", "Pop", "LoFi", "EDM", "Drill", "Afrobeat", "Jazz", "Ambient"];
const moods = ["All", "Chill", "Energetic", "Dark", "Happy", "Sad", "Aggressive", "Romantic", "Mysterious"];
// Include major and minor variants for each musical key for finer filtering
const keys = [
  "All",
  ...["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"].flatMap((n) => [
    `${n} Major`,
    `${n} Minor`
  ])
];

interface BrowseFiltersProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedGenre: string;
  setSelectedGenre: (genre: string) => void;
  selectedMood: string;
  setSelectedMood: (mood: string) => void;
  selectedKey: string;
  setSelectedKey: (key: string) => void;
  bpmRange: number[];
  setBpmRange: (range: number[]) => void;
  priceRange: number[];
  setPriceRange: (range: number[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  activeFilters: string[];
  clearFilter: (filter: string) => void;
  clearAllFilters: () => void;
}

export function BrowseFilters({
  searchQuery,
  setSearchQuery,
  selectedGenre,
  setSelectedGenre,
  selectedMood,
  setSelectedMood,
  selectedKey,
  setSelectedKey,
  bpmRange,
  setBpmRange,
  priceRange,
  setPriceRange,
  sortBy,
  setSortBy,
  showFilters,
  setShowFilters,
  activeFilters,
  clearFilter,
  clearAllFilters
}: BrowseFiltersProps) {
  const { t } = useLanguage();
  const activeCount = activeFilters.length;
  const priceSliderMax = Math.max(priceRange[1], 500); // dynamic max so user isn't capped; grows with chosen max

  // Local input strings allow temporary empty / partial numeric typing
  const [bpmMinInput, setBpmMinInput] = useState(String(bpmRange[0]));
  const [bpmMaxInput, setBpmMaxInput] = useState(String(bpmRange[1]));
  const [priceMinInput, setPriceMinInput] = useState(String(priceRange[0]));
  const [priceMaxInput, setPriceMaxInput] = useState(String(priceRange[1]));

  useEffect(() => { setBpmMinInput(String(bpmRange[0])); setBpmMaxInput(String(bpmRange[1])); }, [bpmRange]);
  useEffect(() => { setPriceMinInput(String(priceRange[0])); setPriceMaxInput(String(priceRange[1])); }, [priceRange]);

  const commitBpm = () => {
    let minVal = parseInt(bpmMinInput, 10);
    let maxVal = parseInt(bpmMaxInput, 10);
    if (isNaN(minVal)) minVal = 60;
    if (isNaN(maxVal)) maxVal = 300;
    minVal = Math.max(60, Math.min(300, minVal));
    maxVal = Math.max(60, Math.min(300, maxVal));
    if (minVal > maxVal) [minVal, maxVal] = [maxVal, minVal];
    setBpmRange([minVal, maxVal]);
  };

  const commitPrice = () => {
    let minVal = parseInt(priceMinInput, 10);
    let maxVal = parseInt(priceMaxInput, 10);
    if (isNaN(minVal)) minVal = 0;
    if (isNaN(maxVal)) maxVal = minVal;
    if (minVal < 0) minVal = 0;
    if (maxVal < minVal) [minVal, maxVal] = [maxVal, minVal];
    setPriceRange([minVal, maxVal]);
  };

  const numericChange = (setter: (v: string) => void) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value;
    if (v === '' || /^\d+$/.test(v)) setter(v);
  };

  const keyCommit = (commit: () => void) => (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') { commit(); (e.target as HTMLInputElement).blur(); }
  };

  return (
    <div className="space-y-3 mb-6">
      {/* Primary toolbar */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            placeholder={t('browse.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label={t('browse.search')}
            className="pl-8"
          />
        </div>

        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[150px]" aria-label={t('browse.sortBy')}>
            <SelectValue placeholder={t('browse.sort')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">{t('browse.newest')}</SelectItem>
            <SelectItem value="oldest">{t('browse.oldest')}</SelectItem>
            <SelectItem value="price-low">{t('browse.priceLow')}</SelectItem>
            <SelectItem value="price-high">{t('browse.priceHigh')}</SelectItem>
            <SelectItem value="popular">{t('browse.popular')}</SelectItem>
          </SelectContent>
        </Select>

        <Popover open={showFilters} onOpenChange={setShowFilters}>
          <PopoverTrigger asChild>
            <Button variant={activeCount ? "default" : "outline"} size="sm" aria-label={t('browse.openFilters')}>
              <Filter className="h-4 w-4 mr-1" />
              {t('browse.filters')}{activeCount ? ` (${activeCount})` : ""}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[320px] p-4 space-y-5" align="end">
            <div className="space-y-3">
              <div className="space-y-2">
                <label className="text-xs font-medium">{t('browse.genre')}</label>
                <Select value={selectedGenre} onValueChange={setSelectedGenre}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder={t('browse.genre')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {genres.map((g) => (
                      <SelectItem key={g} value={g}>{g}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">{t('browse.mood')}</label>
                <Select value={selectedMood} onValueChange={setSelectedMood}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder={t('browse.mood')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {moods.map((m) => (
                      <SelectItem key={m} value={m}>{m}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium">{t('browse.key')}</label>
                <Select value={selectedKey} onValueChange={setSelectedKey}>
                  <SelectTrigger className="h-8 text-sm">
                    <SelectValue placeholder={t('browse.key')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-64">
                    {keys.map((k) => (
                      <SelectItem key={k} value={k}>{k}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>{t('browse.bpm')}</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={bpmMinInput}
                      onChange={numericChange(setBpmMinInput)}
                      onBlur={commitBpm}
                      onKeyDown={keyCommit(commitBpm)}
                      placeholder="60"
                      className="h-7 w-16 px-2 text-xs"
                      aria-label={t('browse.minimumBpm')}
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={bpmMaxInput}
                      onChange={numericChange(setBpmMaxInput)}
                      onBlur={commitBpm}
                      onKeyDown={keyCommit(commitBpm)}
                      placeholder="300"
                      className="h-7 w-16 px-2 text-xs"
                      aria-label={t('browse.maximumBpm')}
                    />
                  </div>
                </div>
                <Slider
                  value={bpmRange}
                  onValueChange={(val) => {
                    if (val[0] > val[1]) return;
                    setBpmRange(val);
                    setBpmMinInput(String(val[0]));
                    setBpmMaxInput(String(val[1]));
                  }}
                  max={300}
                  min={60}
                  step={1}
                  showValueTooltip
                  compact
                  formatValue={(v) => `${v} ${t('browse.bpm')}`}
                />
              </div>
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-xs font-medium">
                  <span>{t('browse.price')} ($)</span>
                  <div className="flex items-center gap-1">
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={priceMinInput}
                      onChange={numericChange(setPriceMinInput)}
                      onBlur={commitPrice}
                      onKeyDown={keyCommit(commitPrice)}
                      placeholder="0"
                      className="h-7 w-16 px-2 text-xs"
                      aria-label={t('browse.minimumPrice')}
                    />
                    <span className="text-muted-foreground">–</span>
                    <Input
                      type="text"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={priceMaxInput}
                      onChange={numericChange(setPriceMaxInput)}
                      onBlur={commitPrice}
                      onKeyDown={keyCommit(commitPrice)}
                      placeholder="999"
                      className="h-7 w-16 px-2 text-xs"
                      aria-label={t('browse.maximumPrice')}
                    />
                  </div>
                </div>
                <Slider
                  value={priceRange}
                  onValueChange={(val) => {
                    if (val[0] > val[1]) return;
                    setPriceRange(val);
                    setPriceMinInput(String(val[0]));
                    setPriceMaxInput(String(val[1]));
                  }}
                  max={priceSliderMax}
                  min={0}
                  step={5}
                  showValueTooltip
                  compact
                  formatValue={(v) => `$${v}`}
                />
              </div>
            </div>
            <div className="flex items-center justify-between pt-1">
              {activeCount > 0 ? (
                <Button variant="ghost" size="sm" onClick={clearAllFilters} className="text-xs">{t('browse.reset')}</Button>
              ) : <span />}
              <Button size="sm" onClick={() => setShowFilters(false)} className="text-xs">{t('browse.done')}</Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Active filter chips */}
      {activeCount > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          {activeFilters.map((f) => (
            <Badge key={f} variant="secondary" className="gap-1">
              {f}
              <button aria-label={`${t('browse.removeFilter')} ${f}`} onClick={() => clearFilter(f)} className="ml-1 hover:text-destructive">
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs" onClick={clearAllFilters}>{t('browse.clearAll')}</Button>
        </div>
      )}
    </div>
  );
}
