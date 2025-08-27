import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { PageHeader, EmptyState } from "@/components/shared";
import { Playlist } from "../types";
import { PlaylistGrid } from "./PlaylistGrid";
import { CreatePlaylistModal } from  "./CreatePlaylistModal";
import { EditPlaylistModal } from "./EditPlaylistModal";
import { SharePlaylistModal } from "./SharePlaylistModal";
import { DeletePlaylistModal } from "./DeletePlaylistModal";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Search, Filter as FilterIcon, X, SortAsc, Plus } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Mock data for playlists
const mockPlaylists = [
  {
    id: "1",
    title: "Afrobeats (2025 Edition)",
    description: "A wave of Afrobeats-inspired heat: from emotional, soul-stirring melodies to high-energy bangers. Blending vibes from Rema, Burna Boy, Tems, Tyla, Asake & more.",
    coverImage: "/lovable-uploads/ac59b84f-e1b5-4401-ba5c-0183111473ce.png",
    isPublic: true,
    trackCount: 8,
    updatedAt: "3 days ago",
    curator: "Dayhills"
  },
  {
    id: "2", 
    title: "Blurred",
    description: "No description",
    coverImage: "/lovable-uploads/c968283e-cdc4-40c0-b45f-5ba594d61983.png",
    isPublic: false,
    trackCount: 1,
    updatedAt: "3 days ago",
    curator: "Njbeat"
  }
];

// Types for internal UI state
type ActiveModal = null | "create" | "edit" | "share" | "delete";

export function PlaylistsLayout() {
  const [playlists, setPlaylists] = useState<Playlist[]>(mockPlaylists);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState<Playlist | null>(null);
  const [query, setQuery] = useState("");
  const [visibilityFilter, setVisibilityFilter] = useState<"all" | "public" | "private">("all");
  const [sortBy, setSortBy] = useState<"recent" | "title" | "tracks">("recent");
  const [mounted, setMounted] = useState(false); // avoid hydration mismatch if SSR introduced later
  const preferencesLoaded = useRef(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useLanguage();

  // Persist & restore lightweight user preferences
  useEffect(() => {
    if (preferencesLoaded.current) return;
    try {
      const raw = localStorage.getItem("playlistLayoutPrefs");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.query) setQuery(parsed.query);
        if (parsed.visibilityFilter) setVisibilityFilter(parsed.visibilityFilter);
        if (parsed.sortBy) setSortBy(parsed.sortBy);
      }
    } catch {/* ignore */}
    preferencesLoaded.current = true;
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!preferencesLoaded.current) return;
    try {
      localStorage.setItem("playlistLayoutPrefs", JSON.stringify({ query, visibilityFilter, sortBy }));
    } catch {/* ignore */}
  }, [query, visibilityFilter, sortBy]);

  const handleCreatePlaylist = (playlistData: Omit<Playlist, 'id' | 'trackCount' | 'updatedAt' | 'curator'>) => {
    const newPlaylist: Playlist = {
      id: Date.now().toString(),
      ...playlistData,
      trackCount: 0,
      updatedAt: "Just now",
      curator: "You"
    };

    setPlaylists(prev => [newPlaylist, ...prev]);
    setActiveModal(null);
    
    toast({
      title: t('playlist.playlistCreatedSuccessfully'),
      description: t('playlist.playlistCreatedSuccessfully')
    });
    // Announce creation for screen readers
    announce(`Playlist ${newPlaylist.title} created`);
  };

  const handleEditPlaylist = (playlistData: Omit<Playlist, 'id' | 'trackCount' | 'updatedAt' | 'curator'>) => {
    if (!selectedPlaylist) return;

  setPlaylists(prev => prev.map(playlist => 
      playlist.id === selectedPlaylist.id 
        ? { 
            ...playlist, 
            ...playlistData
          }
        : playlist
    ));

  setActiveModal(null);
    setSelectedPlaylist(null);
    
    toast({
      title: t('playlist.playlistUpdatedSuccessfully'), 
      description: t('playlist.playlistUpdatedSuccessfully')
    });
  announce(`Playlist ${selectedPlaylist.title} updated`);
  };

  const handleDeletePlaylist = () => {
    if (!selectedPlaylist) return;
    
  setPlaylists(prev => prev.filter(p => p.id !== selectedPlaylist.id));
  setActiveModal(null);
    setSelectedPlaylist(null);
    
    toast({
      title: t('playlist.playlistDeletedSuccessfully'),
      description: t('playlist.playlistDeletedSuccessfully')
    });
  announce("Playlist deleted");
  };

  const handlePlaylistClick = (playlistId: string) => {
    navigate(`/playlist/${playlistId}`);
  };

  const openModal = (modal: Exclude<ActiveModal, null>, playlist?: Playlist) => {
    if (playlist) setSelectedPlaylist(playlist);
    // Defer modal open to next tick so any currently open popover / dropdown (Radix) can fully unmount
    // and release focus before the dialog mounts. Prevents aria-hidden focus warning.
    setTimeout(() => setActiveModal(modal), 0);
  };

  // Accessible live region announcer
  const liveRegionRef = useRef<HTMLDivElement | null>(null);
  const announce = (message: string) => {
    if (!liveRegionRef.current) return;
    liveRegionRef.current.textContent = message;
  };

  // Derived filtered & sorted playlists
  const filteredSortedPlaylists = useMemo(() => {
    let list = [...playlists];
    if (query.trim()) {
      const q = query.toLowerCase();
      list = list.filter(p => p.title.toLowerCase().includes(q) || p.description?.toLowerCase().includes(q));
    }
    if (visibilityFilter !== "all") {
      list = list.filter(p => visibilityFilter === "public" ? p.isPublic : !p.isPublic);
    }
    switch (sortBy) {
      case "title":
        list.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "tracks":
        list.sort((a, b) => b.trackCount - a.trackCount || a.title.localeCompare(b.title));
        break;
      case "recent":
      default:
        // Keep insertion order (newest first already at top)
        break;
    }
    return list;
  }, [playlists, query, visibilityFilter, sortBy]);

  const hasActiveFilters = query.trim().length > 0 || visibilityFilter !== "all" || sortBy !== "recent";

  return (
    <div className="min-h-screen bg-background p-6 mt-8 sm:mt-8" aria-describedby="playlist-instructions">
      <div className="max-w-7xl mx-auto space-y-6">
        <PageHeader 
          title={t('playlist.playlistsTitle')}
        />

        <p id="playlist-instructions" className="sr-only">
          {t('playlist.instructions')}
        </p>

        {/* Toolbar */}
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-1 flex-col gap-4 md:flex-row md:items-end">
            <div className="flex-1 relative">
              <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={t('playlist.searchPlaceholder')}
                className="pl-8"
                aria-label={t('playlist.searchAria')}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={t('playlist.clearSearch')}
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            <div className="flex gap-2 md:w-auto w-full">
              <Select value={visibilityFilter} onValueChange={(v: "all" | "public" | "private") => setVisibilityFilter(v)}>
                <SelectTrigger className="w-full md:w-[150px]" aria-label={t('playlist.visibilityFilterAria')}>
                  <FilterIcon className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t('playlist.visibilityPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('playlist.all')}</SelectItem>
                  <SelectItem value="public">{t('playlist.public')}</SelectItem>
                  <SelectItem value="private">{t('playlist.private')}</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(v: "recent" | "title" | "tracks") => setSortBy(v)}>
                <SelectTrigger className="w-full md:w-[160px]" aria-label={t('playlist.sortAria')}>
                  <SortAsc className="mr-2 h-4 w-4" />
                  <SelectValue placeholder={t('playlist.sortPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">{t('playlist.recent')}</SelectItem>
                  <SelectItem value="title">{t('playlist.titleAZ')}</SelectItem>
                  <SelectItem value="tracks">{t('playlist.mostTracks')}</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setQuery(""); setVisibilityFilter("all"); setSortBy("recent"); }} aria-label={t('playlist.resetFilters')}>
                {t('playlist.reset')}
              </Button>
            )}
            <Button size="sm" onClick={() => openModal("create")}> <Plus className="h-4 w-4 mr-1" /> {t('playlist.newPlaylist')}</Button>
          </div>
        </div>
        <Separator />

        {filteredSortedPlaylists.length === 0 ? (
          playlists.length === 0 && !hasActiveFilters ? (
            <EmptyState
              title={t('playlist.noPlaylistsYet')}
              description={t('playlist.createFirstPlaylist')}
              icon="music"
              action={{
                label: t('playlist.createPlaylist'),
                onClick: () => openModal("create")
              }}
            />
          ) : (
            <EmptyState
              title={playlists.length === 0 ? t('playlist.noPlaylists') : t('playlist.noMatches')}
              description={playlists.length === 0 ? t('playlist.startByCreating') : t('playlist.tryAdjusting')}
              icon="search"
            />
          )
        ) : (
          <PlaylistGrid
            playlists={filteredSortedPlaylists}
            onPlaylistClick={handlePlaylistClick}
            onEditPlaylist={(p) => openModal("edit", p)}
            onSharePlaylist={(p) => openModal("share", p)}
            onDeletePlaylist={(p) => openModal("delete", p)}
          />
        )}

        {/* Dialogs / Modals */}
        <CreatePlaylistModal
          isOpen={activeModal === "create"}
          onOpenChange={(open) => setActiveModal(open ? "create" : null)}
          onCreatePlaylist={handleCreatePlaylist}
        />

        <EditPlaylistModal
          isOpen={activeModal === "edit"}
          onOpenChange={(open) => setActiveModal(open ? "edit" : null)}
          playlist={selectedPlaylist}
          onEditPlaylist={handleEditPlaylist}
        />

        <SharePlaylistModal
          isOpen={activeModal === "share"}
          onOpenChange={(open) => setActiveModal(open ? "share" : null)}
          playlist={selectedPlaylist}
        />

        <DeletePlaylistModal
          isOpen={activeModal === "delete"}
          onOpenChange={(open) => setActiveModal(open ? "delete" : null)}
          playlist={selectedPlaylist}
          onDeletePlaylist={handleDeletePlaylist}
        />

        {/* Live region for announcements */}
        <div ref={liveRegionRef} className="sr-only" role="status" aria-live="polite" />
      </div>
    </div>
  );
}
