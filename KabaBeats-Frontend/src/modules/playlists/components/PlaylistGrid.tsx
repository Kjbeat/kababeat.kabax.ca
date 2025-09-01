import { Play, MoreHorizontal, Edit, Share, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Playlist } from "../types";
import { useLanguage } from "@/contexts/LanguageContext";

interface PlaylistGridProps {
  playlists: Playlist[];
  onPlaylistClick: (playlistId: string) => void;
  onEditPlaylist: (playlist: Playlist) => void;
  onSharePlaylist: (playlist: Playlist) => void;
  onDeletePlaylist: (playlist: Playlist) => void;
}

export function PlaylistGrid({
  playlists,
  onPlaylistClick,
  onEditPlaylist,
  onSharePlaylist,
  onDeletePlaylist
}: PlaylistGridProps) {
  const { t } = useLanguage();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" role="list" aria-label={t('playlist.playlistsAria')}>
      {playlists.map((playlist) => (
        <Card
          key={playlist.id}
          role="listitem"
          tabIndex={0}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onPlaylistClick(playlist.id); } }}
          className="group hover:shadow-lg focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:outline-none transition-all duration-300 cursor-pointer"
          aria-label={t('playlist.ariaLabel', { title: playlist.title })}
        >
          <CardContent className="p-0">
            <div className="relative">
              <button
                type="button"
                onClick={() => onPlaylistClick(playlist.id)}
                className="w-full h-48 overflow-hidden rounded-t-lg focus-visible:outline-none"
              >
                {playlist.coverImage ? (
                  <img
                    src={playlist.coverImage}
                    alt={playlist.title || t('playlist.coverAlt')}
                    className="w-full h-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-muted text-xs text-muted-foreground">{t('playlist.noImage')}</div>
                )}
              </button>
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-t-lg flex items-center justify-center" aria-hidden="true">
                <Button
                  size="sm"
                  variant="secondary"
                  className="mr-2"
                  aria-label={t('playlist.openPlaylist', { title: playlist.title })}
                  onClick={(e) => {
                    e.stopPropagation();
                    onPlaylistClick(playlist.id);
                  }}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>

              <div className="absolute top-2 right-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      aria-label={t('playlist.actionsFor', { title: playlist.title })}
                      className="h-8 w-8 p-0 bg-black/50 hover:bg-black/70 focus-visible:ring-2 focus-visible:ring-primary/60"
                      onClick={(e) => e.stopPropagation()}
                      onPointerDown={(e) => e.stopPropagation()}
                    >
                      <MoreHorizontal className="h-4 w-4 text-white" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="z-50">
                    <DropdownMenuItem onClick={() => onEditPlaylist(playlist)}>
                      <Edit className="h-4 w-4 mr-2" />
                      {t('playlist.edit')}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => onSharePlaylist(playlist)}>
                      <Share className="h-4 w-4 mr-2" />
                      {t('playlist.share')}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => onDeletePlaylist(playlist)}
                      className="text-red-600 focus:text-red-600"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      {t('playlist.delete')}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <div className="p-4" onClick={() => onPlaylistClick(playlist.id)}>
              <div className="flex items-center justify-between mb-2 gap-2">
                <h3 className="font-semibold truncate" title={playlist.title}>{playlist.title}</h3>
                <Badge variant={playlist.isPublic ? 'default' : 'secondary'}>
                  {playlist.isPublic ? t('playlist.public') : t('playlist.private')}
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-2 line-clamp-2" title={playlist.description}>
                {playlist.description}
              </p>
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>{playlist.trackCount} {playlist.trackCount === 1 ? t('playlist.track') : t('playlist.tracks')}</span>
                <span>{t('playlist.updated')} {playlist.updatedAt}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {playlists.length === 0 && (
        <div className="col-span-full text-sm text-muted-foreground">{t('playlist.noPlaylistsFound')}</div>
      )}
    </div>
  );
}
