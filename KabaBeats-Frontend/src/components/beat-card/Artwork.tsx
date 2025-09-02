import { Music, Heart, Check, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { LicenseDialog } from "./LicenseDialog";
import { fetchUserLicenseSettings, convertToLicenseOptions, getLicenseDetails, type UserLicenseSettings } from "@/utils/licenseSettings";

interface LicenseOption {
  value: string;
  label: string;
  price: number;
  description: string;
}

interface ArtworkProps {
  id: string;
  artwork?: string;
  title: string;
  producer: string;
  isLiked: boolean;
  isPlaying?: boolean;
  onLike?: () => void;
  onPlay?: () => void;
  exclusive?: boolean;
  price?: number;
  originalPrice?: number;
  inCart?: boolean;
  onAddToCart?: () => void;
  hidePrice?: boolean;
  allowFreeDownload?: boolean;
  hlsUrl?: string;
  hlsProcessed?: boolean;
  onDownload?: (licenseType: string) => void;
  ownerId?: string; // Add owner ID to fetch license settings
}

export function Artwork({ 
  id, 
  artwork, 
  title, 
  producer, 
  isLiked, 
  isPlaying = false, 
  onLike, 
  onPlay, 
  exclusive, 
  price, 
  originalPrice, 
  inCart, 
  onAddToCart,
  hidePrice,
  allowFreeDownload,
  hlsUrl,
  hlsProcessed,
  onDownload,
  ownerId
}: ArtworkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { state: playerState } = useMediaPlayer();
  const [open, setOpen] = useState(false);
  const [ownerLicenseSettings, setOwnerLicenseSettings] = useState<UserLicenseSettings | null>(null);
  const [licenseOptions, setLicenseOptions] = useState<LicenseOption[]>([]);
  
  // Use the prop value if provided explicitly, otherwise detect from player state
  const actuallyPlaying = isPlaying !== undefined ? isPlaying : (playerState.currentBeat?.id === id && playerState.isPlaying);

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
        const defaultOptions: LicenseOption[] = [
          { value: "FREE", label: "Free Download", price: 0, description: "Tagged MP3 for preview / non‑profit use." },
          { value: "MP3", label: "MP3", price: base, description: "Untagged MP3. 2.5k stream allowance." },
          { value: "WAV", label: "WAV", price: base + 10, description: "Untagged WAV + MP3. 10k streams + monetized YouTube." },
          { value: "STEMS", label: "Stems", price: base + 50, description: "Trackout stems + WAV + MP3. 100k streams & live shows." },
          { value: "EXCLUSIVE", label: "Exclusive", price: base + 200, description: "Full rights transfer. Unlimited use." },
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
    if (hidePrice) return;
    
    // Always show license options for all beats (not just exclusive)
    setOpen(true);
  };

  const handleConfirmLicense = (licenseType: string) => {
    // Add to cart with selected license
    addToCart({
      id,
      title,
      producer,
      artwork,
      price: price || 0,
      licenseType: licenseType
    });
    toast({
      title: "Added to cart",
      description: `${title} by ${producer} (${licenseType}) has been added to your cart.`,
    });
    setOpen(false);
  };

  const handleDownload = (licenseType: string) => {
    if (onDownload) {
      onDownload(licenseType);
    }
  };

  return (
    <div
      className="relative aspect-square rounded-lg overflow-hidden bg-muted group ring-1 ring-border/40 group-hover:ring-primary/40 transition-all duration-300"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {artwork ? (
        <img
          src={artwork}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gradient-primary">
          <Music className="h-12 w-12 text-white/80" />
        </div>
      )}

      <div
        className={`absolute inset-0 ${actuallyPlaying ? 'bg-black/60' : 'bg-black/40'} flex items-center justify-center transition-opacity duration-200 ${
          isHovered || actuallyPlaying ? "opacity-100" : "opacity-0"
        }`}
      >
        <Button
          size="lg"
          variant="ghost"
          className={`w-16 h-16 rounded-full ${actuallyPlaying ? 'bg-primary' : 'bg-primary hover:bg-primary/90'} text-primary-foreground border-2 border-white/20`}
          onClick={onPlay}
          aria-label={actuallyPlaying ? "Pause" : "Play"}
        >
          {actuallyPlaying ? (
            <Pause className="h-6 w-6" fill="currentColor" />
          ) : (
            <Play className="h-6 w-6" fill="currentColor" />
          )}
        </Button>
      </div>

      {exclusive && (
        <div className="absolute left-2 top-2 bg-primary text-primary-foreground text-[10px] font-semibold px-2 py-1 rounded-full shadow/40 shadow-black/30 tracking-wide">
          EXCLUSIVE
        </div>
      )}

  {!hidePrice && typeof price === 'number' && (
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
          <button
            type="button"
            onClick={handleAdd}
            className={`flex items-center gap-1 rounded-md bg-white/95 text-black shadow-sm px-2.5 py-1.5 text-xs font-medium transition-all border border-black/5 focus:outline-none focus:ring-2 focus:ring-primary/50 hover:shadow-md ${inCart ? 'opacity-90' : 'hover:bg-white'}`}
          >
            {inCart ? (
              <Check className="w-4 h-4 text-green-600" />
            ) : (
              <span className="inline-flex items-center justify-center w-4 h-4 rounded-[4px] bg-black text-white text-[10px] font-bold">+</span>
            )}
            {inCart ? 'Added' : (typeof price === 'number' ? `$${price.toFixed(2)}` : '')}
          </button>
          {originalPrice && originalPrice > price && (
            <span className="text-[10px] text-white/70 line-through">${originalPrice.toFixed(2)}</span>
          )}
        </div>
      )}

      <Button
        size="sm"
        aria-label={isLiked ? "Unlike beat" : "Like beat"}
        variant="ghost"
        className={`absolute top-3 right-3 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white transition-opacity duration-200 focus:opacity-100 focus:ring-2 focus:ring-primary/60 focus:outline-none ${
          isHovered || isLiked ? "opacity-100" : "opacity-0"
        }`}
        onClick={onLike}
      >
        <Heart className={`h-4 w-4 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : ''}`} />
      </Button>

      {/* License Selection Dialog */}
      <LicenseDialog
        isOpen={open}
        onClose={() => setOpen(false)}
        beatId={id}
        beatTitle={title}
        beatPrice={price || 0}
        onDownload={handleDownload}
        onAddToCart={handleConfirmLicense}
        licenseOptions={licenseOptions}
        getLicenseDetails={getLicenseDetailsForType}
      />
    </div>
  );
}
