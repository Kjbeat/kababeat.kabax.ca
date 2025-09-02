import { Card, CardContent } from "@/components/ui/card";
import { Artwork } from "./Artwork";
import { BeatInfo } from "./BeatInfo";
import { BeatMeta } from "./BeatMeta";
import { Actions } from "./Actions";
import type { BeatCardProps } from "./types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";

export function BeatCard({
  id,
  title,
  producer,
  artwork,
  bpm,
  musicalKey,
  genre,
  price,
  salePrice,
  hidePrice,
  exclusive = false,
  inCart = false,
  ownerId,
  onPlay,
  onLike,
  onAddToCart,
}: BeatCardProps) {
  const { toggleLike, isLiked: isFavorited } = useFavorites();
  const { state: playerState } = useMediaPlayer();
  
  // Check if this beat is currently playing
  const isPlaying = playerState.currentBeat?.id === id && playerState.isPlaying;
  
  const handleLike = () => {
    toggleLike(id, title);
    onLike?.();
  };
  
  // Always use the context's liked state
  const liked = isFavorited(id);
  const discountPercent = !hidePrice && salePrice && salePrice < price ? Math.round(((price - salePrice) / price) * 100) : null;

  return (
    <Card
      tabIndex={0}
      aria-label={`Beat card ${title} by ${producer}`}
      className={cn(
        "beat-card-fixed group relative bg-card/80 backdrop-blur border border-border/50 hover:border-primary/40 transition-all duration-300 cursor-pointer focus:outline-none",
        "hover:shadow-lg focus:shadow-lg rounded-xl overflow-hidden",
        "before:absolute before:inset-0 before:rounded-[inherit] before:pointer-events-none before:opacity-0 before:transition-opacity before:duration-300 before:bg-gradient-to-br before:from-primary/10 before:to-transparent group-hover:before:opacity-100 focus:before:opacity-100",
        isPlaying && "border-primary shadow-md"
      )}
    >
      {/* Top-right badges */}
      <div className="absolute top-2 right-2 z-20 flex flex-col gap-1 items-end">
        {isPlaying && (
          <Badge variant="default" className="bg-primary text-primary-foreground border-primary/50 shadow-sm text-[10px] leading-none py-1 px-1.5">
            PLAYING
          </Badge>
        )}
        {exclusive && (
          <Badge variant="outline" className="bg-primary text-primary-foreground border-primary/50 shadow-sm text-[10px] leading-none py-1 px-1.5">
            EXCLUSIVE
          </Badge>
        )}
        {discountPercent && (
          <Badge variant="destructive" className="text-[10px] leading-none py-1 px-1.5">
            -{discountPercent}%
          </Badge>
        )}
        {inCart && (
          <Badge variant="secondary" className="text-[10px] leading-none py-1 px-1.5">In Cart</Badge>
        )}
      </div>
      <CardContent className="p-2.5 sm:p-3 flex flex-col h-full">
        <div className="beat-artwork-wrapper mb-1 flex-shrink-0">
          <Artwork
            id={id}
            artwork={artwork}
            title={title}
            producer={producer}
            isLiked={liked}
            isPlaying={isPlaying}
            onLike={handleLike}
            onPlay={onPlay}
            exclusive={exclusive}
            price={hidePrice ? undefined : (salePrice || price)}
            originalPrice={hidePrice ? undefined : (salePrice && salePrice < price ? price : undefined)}
            inCart={!hidePrice && inCart}
            onAddToCart={hidePrice ? undefined : onAddToCart}
            hidePrice={hidePrice}
            ownerId={ownerId}
          />
        </div>
        <div className="beat-card-body mt-auto">
          <div className="space-y-2">
            <BeatInfo id={id} title={title} producer={producer} />
            <div className="flex items-center justify-between">
              <BeatMeta bpm={bpm} musicalKey={musicalKey} genre={genre} />
              <Actions
                id={id}
                title={title}
                producer={producer}
                artwork={artwork}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default BeatCard;
