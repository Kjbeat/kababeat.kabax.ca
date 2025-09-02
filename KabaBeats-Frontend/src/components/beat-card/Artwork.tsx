import { Music, Heart, Check, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { LicenseDialog } from "./LicenseDialog";

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
  onDownload
}: ArtworkProps) {
  const [isHovered, setIsHovered] = useState(false);
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { state: playerState } = useMediaPlayer();
  const [open, setOpen] = useState(false);
  
  // Use the prop value if provided explicitly, otherwise detect from player state
  const actuallyPlaying = isPlaying !== undefined ? isPlaying : (playerState.currentBeat?.id === id && playerState.isPlaying);

  // Define license tiers; could be externalized later.
  const base = price || 0;
  const licenseOptions: LicenseOption[] = [
    { value: "FREE", label: "Free Download", price: 0, description: "Tagged MP3 for preview / non‑profit use." },
    { value: "MP3", label: "MP3", price: base, description: "Untagged MP3. 2.5k stream allowance." },
    { value: "WAV", label: "WAV", price: base + 10, description: "Untagged WAV + MP3. 10k streams + monetized YouTube." },
    { value: "STEMS", label: "Stems", price: base + 50, description: "Trackout stems + WAV + MP3. 100k streams & live shows." },
    { value: "EXCLUSIVE", label: "Exclusive", price: base + 200, description: "Full rights transfer. Unlimited use." },
  ];

  const licenseDetails: Record<string, string[]> = {
    FREE: [
      "Tagged MP3 only",
      "Personal listening / preview",
      "No monetization",
      "Credit required",
    ],
    MP3: [
      "Untagged MP3",
      "Up to 2,500 streams",
      "Non-profit use (YouTube demonetized)",
      "Credit required",
    ],
    WAV: [
      "Untagged WAV + MP3",
      "Up to 10,000 streams",
      "Monetized YouTube allowed",
      "Live performances (small venues)",
    ],
    STEMS: [
      "Trackout stems + WAV + MP3",
      "Up to 100,000 streams",
      "Broadcast / shows",
      "Mix & rearrange stems",
    ],
    EXCLUSIVE: [
      "Unlimited streams & sales",
      "Full commercial rights",
      "No further licensing",
      "Beat removed from store",
    ],
  };

  const handleAdd = () => {
    if (hidePrice) return;
    
    if (exclusive) {
      // For exclusive beats, show license options
      setOpen(true);
    } else {
      // For non-exclusive beats, add directly to cart
      addToCart({
        id,
        title,
        producer,
        artwork,
        price: price || 0,
        licenseType: 'MP3'
      });
      toast({
        title: "Added to cart",
        description: `${title} by ${producer} has been added to your cart.`,
      });
    }
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
      />
    </div>
  );
}
