import { Button } from "@/components/ui/button";
import { Play, Pause, ShoppingBag, Music, Heart, Check } from "lucide-react";
import { Actions } from "./Actions";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { useState, useEffect } from "react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { fetchUserLicenseSettings, convertToLicenseOptions, getLicenseDetails, type UserLicenseSettings } from "@/utils/licenseSettings";

import type { BeatCardProps } from "./types";

function extractTags(title: string, genre: string): string[] {
  const match = title.match(/\(([^)]+)\)/); // text inside parentheses
  if (match) {
    return match[1].split(/x|,|\//i).map(t => t.trim()).filter(Boolean).slice(0,4).map(t => t.toLowerCase());
  }
  return [genre.toLowerCase()];
}

export function BeatListItem({
  id,
  title,
  producer,
  artwork,
  bpm,
  musicalKey,
  genre,
  price,
  salePrice,
  exclusive = false,
  inCart = false,
  ownerId,
  onPlay,
  onLike,
  onAddToCart,
}: BeatCardProps) {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { toggleLike, isLiked: isFavorited } = useFavorites();
  const { state: playerState } = useMediaPlayer();
  const displayPrice = salePrice && salePrice < price ? salePrice : price;
  const tags = extractTags(title, genre);
  const liked = isFavorited(id);
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const [ownerLicenseSettings, setOwnerLicenseSettings] = useState<UserLicenseSettings | null>(null);
  const [licenseOptions, setLicenseOptions] = useState<any[]>([]);
  
  // Check if this beat is currently playing
  const isPlaying = playerState.currentBeat?.id === id && playerState.isPlaying;

  // Fetch owner license settings when component mounts or ownerId changes
  useEffect(() => {
    const fetchLicenseSettings = async () => {
      if (ownerId) {
        const settings = await fetchUserLicenseSettings(ownerId);
        setOwnerLicenseSettings(settings);
        
        // Convert to license options
        const base = price || 0;
        const options = convertToLicenseOptions(settings, base);
        setLicenseOptions(options);
      } else {
        // Fallback to default options if no ownerId
        const base = price || 0;
        const defaultOptions = [
          { value: "FREE", label: "Free Download", price: 0, description: "Tagged MP3 preview / non-profit." },
          { value: "MP3", label: "MP3", price: base },
          { value: "WAV", label: "WAV", price: base + 10 },
          { value: "STEMS", label: "Stems", price: base + 50 },
          { value: "EXCLUSIVE", label: "Exclusive", price: base + 200 },
        ];
        setLicenseOptions(defaultOptions);
      }
    };

    fetchLicenseSettings();
  }, [ownerId, price]);

  // Get license details from owner settings
  const getLicenseDetailsForType = (licenseType: string): string[] => {
    return getLicenseDetails(ownerLicenseSettings, licenseType);
  };

  const handleAdd = () => {
    // Always open license dialog for all beats
    setLicenseOpen(true);
  };

  const confirmAdd = () => {
    if (!selectedLicense) {
      toast({ title: "Choose a license", description: "Select a license type to continue." });
      return;
    }
    const license = licenseOptions.find(l => l.value === selectedLicense);
    if (!license) return;
    if (license.price === 0) {
      toast({ title: "Free download", description: "Your free download is starting..." });
      setLicenseOpen(false);
      return;
    }
    addToCart({ id, title, producer, artwork, price: license.price, licenseType: license.value });
    toast({ title: "Added to cart", description: `${title} (${license.label}) added.` });
    setLicenseOpen(false);
    onAddToCart?.();
  };

  const handleLike = () => {
    toggleLike(id, title);
    onLike?.();
  };

  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>) => {
    // Don't trigger play if user is clicking on an interactive element
    const target = e.target as HTMLElement;
    const isClickableElement = 
      target.tagName === 'BUTTON' || 
      target.tagName === 'A' || 
      target.closest('button') || 
      target.closest('a');
    
    if (!isClickableElement) {
      onPlay?.();
    }
  };

  return (
    <div 
      className={`group relative w-full flex flex-wrap sm:flex-nowrap items-center gap-2 sm:gap-4 px-3 sm:px-4 py-3 rounded-xl bg-card/80 border ${isPlaying ? 'border-primary' : 'border-border/40 hover:border-primary/40'} transition-colors cursor-pointer`}
      onClick={handleItemClick}
    >
      {/* Play button - smaller on mobile */}
      <Button 
        size="icon" 
        variant={isPlaying ? "default" : "ghost"} 
        aria-label={isPlaying ? "Pause" : "Play"} 
        onClick={onPlay} 
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full ${isPlaying ? 'bg-primary text-primary-foreground' : 'bg-muted/60 hover:bg-muted text-foreground'} flex-shrink-0`}
      >
        {isPlaying ? (
          <Pause className="w-4 h-4 sm:w-5 sm:h-5" />
        ) : (
          <Play className="w-4 h-4 sm:w-5 sm:h-5" />
        )}
      </Button>

      {/* Artwork thumbnail - smaller on mobile */}
      <div className="relative w-12 h-12 sm:w-16 sm:h-16 rounded-md overflow-hidden ring-1 ring-border/40 flex-shrink-0 bg-muted">
        {artwork ? (
          <img src={artwork} alt={title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Music className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Title + producer */}
      <div className="flex flex-col min-w-0 flex-1">
        <h3 className="text-xs sm:text-sm md:text-base font-semibold text-foreground truncate">
          <a href={`/beat/${id}`} className="hover:underline focus:underline outline-none">{title}</a>
        </h3>
        <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5 truncate">
          <a href={`/producer/${producer.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')}`} className="hover:text-foreground hover:underline focus:underline outline-none transition-colors">
            {producer}
          </a>
        </p>
        {/* BPM and key info - hidden on smallest screens */}
        <div className="hidden xs:flex items-center gap-2 text-[10px] sm:text-[11px] text-muted-foreground mt-1">
          <span>{bpm} BPM</span>
          <span className="w-1 h-1 rounded-full bg-muted-foreground/40" />
          <span>{musicalKey}</span>
        </div>
      </div>

      {/* Tags */}
      <div className="hidden md:flex items-center gap-2 flex-shrink-0 max-w-md overflow-hidden">
        {tags.map(tag => (
          <span key={tag} className="px-2 sm:px-3 py-1 rounded-full bg-muted text-[10px] sm:text-xs font-medium text-muted-foreground/90 whitespace-nowrap">
            #{tag}
          </span>
        ))}
      </div>

      {/* Price & shared actions - stack vertically on mobile and move to new row */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-4 flex-shrink-0 ml-auto sm:ml-0 order-last sm:order-none w-full sm:w-auto justify-end sm:justify-start mt-2 sm:mt-0">
        <Button onClick={handleAdd} size="sm" className="h-8 sm:h-9 gap-1 rounded-lg text-xs sm:text-sm px-2 sm:px-3">
          {inCart ? <Check className="w-3 h-3 sm:w-4 sm:h-4" /> : <ShoppingBag className="w-3 h-3 sm:w-4 sm:h-4" />}
          <span>${displayPrice.toFixed(2)}</span>
        </Button>
        <button
          aria-label={liked ? 'Unlike beat' : 'Like beat'}
          onClick={handleLike}
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors border border-transparent hover:border-border ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
        >
          <Heart className={`w-3 h-3 sm:w-4 sm:h-4 ${liked ? 'fill-red-500' : ''}`} />
        </button>
        <Actions id={id} title={title} producer={producer} artwork={artwork} />
      </div>

      {/* License Selection Dialog */}
      <Dialog open={licenseOpen} onOpenChange={setLicenseOpen}>
        <DialogContent className="max-w-md w-[95vw] sm:w-auto">
          <DialogHeader>
            <DialogTitle>Select License</DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">Choose the license you want before adding to cart or free download.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <ToggleGroup type="single" value={selectedLicense || ''} onValueChange={(v) => v && setSelectedLicense(v)} className="flex flex-col gap-2 items-stretch">
              {licenseOptions.map(opt => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  aria-label={opt.label}
                  className={`flex justify-between items-center w-full px-3 sm:px-4 py-2 sm:py-2.5 rounded-md border text-left ${selectedLicense === opt.value ? 'bg-primary text-primary-foreground border-primary' : 'bg-muted/40 hover:bg-muted/70'} transition-colors`}
                >
                  <div className="flex flex-col text-[10px] sm:text-xs">
                    <span className="font-semibold text-[12px] sm:text-[13px] leading-tight">{opt.label}</span>
                    {opt.description && <span className="text-[9px] sm:text-[10px] opacity-70 mt-0.5">{opt.description}</span>}
                  </div>
                  <div className="text-[10px] sm:text-[11px] font-medium">{opt.price === 0 ? 'FREE' : `$${opt.price.toFixed(2)}`}</div>
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {selectedLicense && (
              <div className="mt-2 rounded-md border border-border/60 bg-muted/30 p-2 sm:p-3">
                <p className="text-[11px] sm:text-xs font-medium mb-1">What's included:</p>
                <ul className="text-[9px] sm:text-[10px] leading-relaxed grid gap-1 list-disc pl-3 sm:pl-4">
                  {getLicenseDetailsForType(selectedLicense)?.map(line => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          <DialogFooter className="mt-2 flex gap-2 justify-end">
            <Button variant="outline" size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs" onClick={() => setLicenseOpen(false)}>Cancel</Button>
            <Button size="sm" className="h-7 sm:h-8 text-[11px] sm:text-xs" onClick={confirmAdd} disabled={!selectedLicense}>Confirm</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default BeatListItem;
