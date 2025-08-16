import { Play, Music } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { Link } from "react-router-dom";

interface PlaylistCardProps {
  id: string;
  title: string;
  description: string;
  artwork?: string;
  beatCount: number;
  curator: string;
  genre?: string;
  onPlay?: () => void;
  variant?: 'default' | 'circle';
}

export function PlaylistCard({
  id,
  title,
  description,
  artwork,
  beatCount,
  curator,
  genre,
  onPlay,
  variant = 'default'
}: PlaylistCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Card 
      className={`group bg-card hover:bg-gradient-card border-border/50 hover:border-primary/20 transition-all duration-300 hover:shadow-hover cursor-pointer ${variant==='circle' ? 'p-0 bg-transparent shadow-none hover:shadow-none border-none' : ''}`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className={variant==='circle' ? 'p-0 flex flex-col items-center text-center' : 'p-3 sm:p-4'}>
        {/* Artwork Section */}
        <div className={`relative aspect-square mb-3 sm:mb-4 overflow-hidden ${variant==='circle' ? 'w-32 h-32 sm:w-48 sm:h-48 rounded-full ring-4 ring-primary/30 bg-gradient-primary' : 'rounded-lg bg-muted'}`}>
          {artwork ? (
            <img 
              src={artwork} 
              alt={title}
              className={`w-full h-full object-cover transition-transform duration-300 group-hover:scale-105 ${variant==='circle' ? '' : ''}`}
            />
          ) : (
            <div className={`w-full h-full flex items-center justify-center ${variant==='circle' ? 'bg-gradient-to-br from-primary to-primary/60' : 'bg-gradient-primary'}`}>
              <Music className="h-8 w-8 sm:h-12 sm:w-12 text-white/80" />
            </div>
          )}
          
          {/* Play Button Overlay */}
          <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity duration-200 ${
            isHovered ? 'opacity-100' : 'opacity-0'
          }`}>
            <Button
              size="lg"
              variant="ghost"
              className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground border-2 border-white/20"
              onClick={onPlay}
            >
              <Play className="h-4 w-4 sm:h-6 sm:w-6" fill="currentColor" />
            </Button>
          </div>
        </div>

        {/* Playlist Info */}
        <div className={variant==='circle' ? 'space-y-2 w-full' : 'space-y-2 sm:space-y-3'}>
          <div>
            <Link 
              to={`/playlist/${id}`} 
              className={`font-semibold text-foreground hover:text-primary transition-colors duration-200 cursor-pointer block ${variant==='circle' ? 'text-sm sm:text-base mt-2' : 'line-clamp-2 text-sm sm:text-base'}`}
            >
              {title}
            </Link>
            {variant !== 'circle' && (
              <p className="text-xs sm:text-sm text-muted-foreground line-clamp-2 mt-1">
                {description}
              </p>
            )}
          </div>

          {/* Playlist Details */}
          {variant==='circle' ? (
            <div className="flex flex-col items-center gap-1 text-xs">
              <span className="text-muted-foreground">{beatCount} beats{genre ? ` • ${genre}` : ''}</span>
              <span className="text-muted-foreground">by <span className="text-primary font-medium">{curator}</span></span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs">
                  <Badge variant="secondary" className="px-2 py-1 text-xs">
                    {beatCount} beats
                  </Badge>
                  {genre && (
                    <Badge variant="outline" className="px-2 py-1 text-xs">
                      {genre}
                    </Badge>
                  )}
                </div>
              </div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                Curated by <span className="text-primary font-medium">{curator}</span>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  );
}