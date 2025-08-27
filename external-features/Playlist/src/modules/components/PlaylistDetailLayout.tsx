import { useMemo, useState } from "react";
// import { useParams } from "react-router-dom"; // Removed for standalone package
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useToast } from "@/hooks/use-toast";
import { useCart } from "@/contexts/CartContext";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Play, Pause, MoreHorizontal, Clock, ShoppingCart, SkipBack, SkipForward, ListMusic, Share, Edit, Trash2, ArrowLeft } from "lucide-react";
import { BeatActionsMenu } from "@/components/beat-card/BeatActionsMenu";
import { cn } from "@/lib/utils";
import { useLanguage } from "@/contexts/LanguageContext";

// TODO: Replace mock fetch with real API call once backend is available
const mockPlaylist = {
  id: "1",
  title: "Afrobeats (2025 Edition)",
  description:
    "A wave of Afrobeats-inspired heat, from emotional soul-stirring melodies to high-energy bangers. Blending vibes from Rema, Burna Boy, Tems, Tyla, Asake & more. - (Curated by Dayhills)",
  curator: "Dayhills",
  isPublic: true,
  artwork: "",
  createdDate: "Jul 27, 2025",
};

const mockTracks = [
  { id: "1", title: "KARAMU", producer: "Dayhills", artist: "@Dayhills @KingKobila", bpm: 90, genre: "Afrobeats", dateAdded: "Jul 27, 2025", duration: 200, artwork: "", price: 25, key: "A Min" },
  { id: "2", title: "NAVII", producer: "Dayhills", artist: "@Dayhills @Kibeat", bpm: 115, genre: "Afrobeats", dateAdded: "Jul 27, 2025", duration: 142, artwork: "", price: 25, key: "C Maj" },
  { id: "3", title: "SARO", producer: "Dayhills", artist: "@Dayhills", bpm: 110, genre: "Afrobeats", dateAdded: "Jul 27, 2025", duration: 195, artwork: "", price: 25, key: "F# Min" },
  { id: "4", title: "RAIDA", producer: "Dayhills", artist: "@Dayhills", bpm: 114, genre: "Afrobeats", dateAdded: "Jul 27, 2025", duration: 94, artwork: "", price: 25, key: "D Maj" },
  { id: "5", title: "MEDIAN", producer: "Dayhills", artist: "@Dayhills", bpm: 111, genre: "Afrobeats", dateAdded: "Jul 27, 2025", duration: 203, artwork: "", price: 25, key: "A Min" },
  { id: "6", title: "LOVE SIGNALS", producer: "Dayhills", artist: "@Dayhills @Makro", bpm: 120, genre: "Afrobeats", dateAdded: "Jul 27, 2025", duration: 144, artwork: "", price: 25, key: "G Maj" },
  { id: "7", title: "SHAGA", producer: "Dayhills", artist: "@Dayhills @KingKobila", bpm: 107, genre: "Afrobeats", dateAdded: "Jul 27, 2025", duration: 76, artwork: "", price: 25, key: "E Min" },
];

const formatDuration = (seconds: number) => {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
};

interface PlaylistDetailLayoutProps {
  playlistId: string;
  onBack: () => void;
}

export function PlaylistDetailLayout({ playlistId, onBack }: PlaylistDetailLayoutProps) {
  // const { id } = useParams(); // Removed for standalone package
  const id = playlistId; // Use the prop instead of mock ID
  const playlist = mockPlaylist; // replace with fetched playlist by id
  const tracks = mockTracks; // filter by playlist id in real impl
  const { state: playerState, playBeat, togglePlayPause, nextBeat, prevBeat } = useMediaPlayer();
  const { toast } = useToast();
  const { addToCart, items } = useCart();
  const [licenseOpen, setLicenseOpen] = useState(false);
  const [selectedLicense, setSelectedLicense] = useState<string | null>(null);
  const { t } = useLanguage();

  const currentTrack = playerState.currentBeat && tracks.find(t => t.id === playerState.currentBeat?.id);
  const isCurrentPlaylistTrack = (trackId: string) => tracks.some(t => t.id === trackId);

  const totalDuration = useMemo(() => formatDuration(tracks.reduce((acc, t) => acc + t.duration, 0)), [tracks]);

  const handlePlaylistPrimaryAction = () => {
    if (currentTrack && playerState.isPlaying && isCurrentPlaylistTrack(currentTrack.id)) {
      togglePlayPause();
      return;
    }
    // Start from first track if nothing playing or current not from this playlist
    if (tracks.length) playBeat(tracks[0]);
  };

  const handleTrackClick = (track: typeof tracks[number]) => {
    if (playerState.currentBeat?.id === track.id) {
      togglePlayPause();
    } else {
      playBeat(track);
    }
  };

  const handleAddAllToQueue = () => {
    if (!tracks.length) return;
    // Play first; subsequent plays will append due to context logic
    tracks.forEach((t, idx) => setTimeout(() => playBeat(t), idx * 25));
    toast({ title: t('playlist.queued'), description: `${tracks.length} ${t('playlist.tracksAddedToQueue')}` });
  };

  // Licensing & cart
  const basePrice = currentTrack?.price || 0;
  const licenseOptions = useMemo(() => [
    { value: "FREE", label: t('playlist.licenseOptions.free'), price: 0, description: t('playlist.licenseDescriptions.free'), tagline: t('playlist.licenseTaglines.free') },
    { value: "MP3", label: t('playlist.licenseOptions.mp3'), price: basePrice, description: t('playlist.licenseDescriptions.mp3'), tagline: t('playlist.licenseTaglines.mp3'), recommended: false },
    { value: "WAV", label: t('playlist.licenseOptions.wav'), price: basePrice + 10, description: t('playlist.licenseDescriptions.wav'), tagline: t('playlist.licenseTaglines.wav'), recommended: true },
    { value: "STEMS", label: t('playlist.licenseOptions.stems'), price: basePrice + 50, description: t('playlist.licenseDescriptions.stems'), tagline: t('playlist.licenseTaglines.stems') },
    { value: "EXCLUSIVE", label: t('playlist.licenseOptions.exclusive'), price: basePrice + 200, description: t('playlist.licenseDescriptions.exclusive'), tagline: t('playlist.licenseTaglines.exclusive') }
  ], [basePrice, t]);

  const licenseDetails: Record<string, string[]> = {
    FREE: [t('playlist.licenseDetails.free.0'), t('playlist.licenseDetails.free.1'), t('playlist.licenseDetails.free.2')],
    MP3: [t('playlist.licenseDetails.mp3.0'), t('playlist.licenseDetails.mp3.1'), t('playlist.licenseDetails.mp3.2'), t('playlist.licenseDetails.mp3.3')],
    WAV: [t('playlist.licenseDetails.wav.0'), t('playlist.licenseDetails.wav.1'), t('playlist.licenseDetails.wav.2'), t('playlist.licenseDetails.wav.3')],
    STEMS: [t('playlist.licenseDetails.stems.0'), t('playlist.licenseDetails.stems.1'), t('playlist.licenseDetails.stems.2'), t('playlist.licenseDetails.stems.3')],
    EXCLUSIVE: [t('playlist.licenseDetails.exclusive.0'), t('playlist.licenseDetails.exclusive.1'), t('playlist.licenseDetails.exclusive.2'), t('playlist.licenseDetails.exclusive.3')],
  };
  const usageRights: Record<string, string> = {
    FREE: t('playlist.usageRights.free'),
    MP3: t('playlist.usageRights.mp3'),
    WAV: t('playlist.usageRights.wav'),
    STEMS: t('playlist.usageRights.stems'),
    EXCLUSIVE: t('playlist.usageRights.exclusive'),
  };

  const openLicenseDialog = () => {
    if (!currentTrack) return;
    setSelectedLicense(null);
    setLicenseOpen(true);
  };

  const confirmAddToCart = () => {
    if (!currentTrack) return;
    if (!selectedLicense) {
      toast({ title: t('playlist.chooseLicense'), description: t('playlist.selectLicenseToContinue') });
      return;
    }
    const license = licenseOptions.find(l => l.value === selectedLicense);
    if (!license) return;
    if (license.price === 0) {
      toast({ title: t('playlist.freeDownload'), description: t('playlist.freeDownloadStarting') });
      setLicenseOpen(false);
      return;
    }
    addToCart({ id: currentTrack.id, title: currentTrack.title, producer: currentTrack.producer, artwork: currentTrack.artwork, price: license.price, licenseType: license.value });
    toast({ title: t('playlist.addedToCart'), description: t('playlist.licenseAdded').replace('{title}', currentTrack.title).replace('{license}', license.label) });
    setLicenseOpen(false);
  };

  const inCartLicenses = useMemo(() => currentTrack ? items.filter(i => i.id === currentTrack.id).map(i => i.licenseType) : [], [items, currentTrack]);

  return (
    <>
    <div className="mt-14 min-h-screen bg-background">
      {/* Back Button */}
      <div className="p-6 pb-0">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Playlists
        </Button>
      </div>
      <div className="flex gap-6 p-6 pb-40"> {/* bottom space for global player */}
        {/* Left Side - Playlist Details & Tracklist */}
        <div className="flex-1">
          {/* Playlist Header */}
          <div className="flex gap-6 mb-8">
            {/* Playlist Artwork */}
            <div className="w-64 h-64 bg-gradient-to-br from-red-500 to-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
              {playlist.artwork ? (
                <img src={playlist.artwork} alt={playlist.title} className="w-full h-full object-cover rounded-lg" />
              ) : (
                <div className="w-full h-full rounded-lg flex items-center justify-center bg-black/10">
                  <ListMusic className="h-16 w-16 text-white/60" />
                </div>
              )}
            </div>

            {/* Playlist Info */}
            <div className="flex-1 flex flex-col justify-end">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="secondary" className="w-fit">
                  {playlist.isPublic ? t('playlist.public') : t('playlist.private')}
                </Badge>
                <span className="text-xs text-muted-foreground">{t('playlist.created')} {playlist.createdDate}</span>
              </div>
              <h1 className="text-5xl font-bold text-foreground mb-4">
                {playlist.title}
              </h1>
              <p className="text-muted-foreground mb-4 leading-relaxed">
                {playlist.description}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mb-6">
                <span className="font-medium text-foreground">{playlist.curator}</span>
                <span>•</span>
                <span>{tracks.length} {tracks.length === 1 ? t('playlist.track') : t('playlist.tracks')}</span>
                <span>•</span>
                <span>{totalDuration}</span>
              </div>
              <div className="flex gap-3">
                <Button size="lg" className="w-fit bg-primary hover:bg-primary/90" onClick={handlePlaylistPrimaryAction}>
                  {currentTrack && playerState.isPlaying && isCurrentPlaylistTrack(currentTrack.id) ? (
                    <Pause className="h-5 w-5 mr-2" />
                  ) : (
                    <Play className="h-5 w-5 mr-2" />
                  )}
                  {currentTrack && playerState.isPlaying && isCurrentPlaylistTrack(currentTrack.id) ? t('beat.pause') : t('beat.play')}
                </Button>
                <Button variant="outline" onClick={handleAddAllToQueue}>{t('playlist.queueAll')}</Button>
              </div>
            </div>
          </div>

          {/* Tracklist Table */}
          <div className="space-y-1" role="table" aria-label={t('playlist.tracklist')}>
            {/* Table Header */}
            <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs uppercase tracking-wide font-medium text-muted-foreground border-b border-border" role="row">
              <div className="col-span-1">#</div>
              <div className="col-span-5">{t('playlist.titleColumn')}</div>
              <div className="col-span-2">{t('playlist.genre')}</div>
              <div className="col-span-2">{t('playlist.dateAdded')}</div>
              <div className="col-span-1"><Clock className="h-4 w-4" /></div>
              <div className="col-span-1"></div>
            </div>

            {/* Track Rows */}
            {tracks.map((track, idx) => {
              const isCurrent = playerState.currentBeat?.id === track.id;
              const playing = isCurrent && playerState.isPlaying;
              return (
                <div
                  key={track.id}
                  role="row"
                  tabIndex={0}
                  onClick={() => handleTrackClick(track)}
                  onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleTrackClick(track); } }}
                  className={cn(
                    "grid grid-cols-12 gap-4 px-4 py-3 rounded-md cursor-pointer transition-colors group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60",
                    isCurrent ? "bg-muted" : "hover:bg-muted/50"
                  )}
                >
                  <div className="col-span-1 flex items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      aria-label={playing ? t('playlist.pauseTrack').replace('{title}', track.title) : t('playlist.playTrack').replace('{title}', track.title)}
                      onClick={(e) => { e.stopPropagation(); handleTrackClick(track); }}
                    >
                      {playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                    </Button>
                  </div>
                  <div className="col-span-5 flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-500 rounded flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-foreground truncate">{track.title}</div>
                      <div className="text-xs text-muted-foreground truncate">{track.artist}</div>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center text-xs sm:text-sm text-muted-foreground">{track.genre}</div>
                  <div className="col-span-2 flex items-center text-xs sm:text-sm text-muted-foreground">{track.dateAdded}</div>
                  <div className="col-span-1 flex items-center text-xs sm:text-sm text-muted-foreground tabular-nums">
                    {formatDuration(track.duration)}
                  </div>
                  <div className="col-span-1 flex items-center justify-end opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
                    <BeatActionsMenu id={track.id} title={track.title} producer={track.producer} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Sidebar - Now Playing */}
        <div className="w-80 flex-shrink-0">
          <Card className="sticky top-6">
            <CardContent className="p-0">
              <div className="aspect-square bg-gradient-to-br from-red-500 to-orange-500 rounded-t-lg relative flex items-center justify-center overflow-hidden">
                {currentTrack ? (
                  <div className="text-center px-4">
                    <div className="text-xs uppercase tracking-wide text-white/70 mb-2">{t('playlist.nowPlaying')}</div>
                    <div className="text-white font-semibold leading-snug line-clamp-3">{currentTrack.title}</div>
                  </div>
                ) : (
                  <div className="text-white/60 text-sm">{t('playlist.noTrackPlaying')}</div>
                )}
              </div>
              <div className="p-6 space-y-6">
                {currentTrack ? (
                  <>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg leading-tight">{currentTrack.title}</h3>
                      <p className="text-muted-foreground text-sm">{currentTrack.artist}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-xs sm:text-sm">
                      <div><span className="text-muted-foreground">{t('playlist.genre')}</span><div className="font-medium mt-0.5">{currentTrack.genre}</div></div>
                      <div><span className="text-muted-foreground">{t('playlist.tempo')}</span><div className="font-medium mt-0.5">{currentTrack.bpm} BPM</div></div>
                      <div><span className="text-muted-foreground">{t('playlist.key')}</span><div className="font-medium mt-0.5">{currentTrack.key}</div></div>
                      <div><span className="text-muted-foreground">{t('playlist.duration')}</span><div className="font-medium mt-0.5">{formatDuration(currentTrack.duration)}</div></div>
                    </div>
                    <div>
                      <div className="flex items-end justify-between mb-3">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1">{t('playlist.basePrice')}</div>
                          <div className="text-2xl font-bold">${currentTrack.price}</div>
                        </div>
                        {inCartLicenses.length > 0 && (
                          <div className="text-[10px] px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                            {inCartLicenses.length} {inCartLicenses.length === 1 ? t('playlist.licensesInCart') : t('playlist.licensesInCartPlural')}
                          </div>
                        )}
                      </div>
                      <Button className="w-full" size="lg" aria-label={t('playlist.addToCart')} onClick={openLicenseDialog}>
                        <ShoppingCart className="h-4 w-4 mr-2" />
                        {inCartLicenses.length ? t('playlist.addAnotherLicense') : t('playlist.addToCart')}
                      </Button>
                    </div>
                  </>
                ) : (
                  <div className="text-sm text-muted-foreground">{t('playlist.selectTrackToSeeDetails')}</div>
                )}

                <div>
                  <h4 className="font-medium mb-3 text-sm">{t('playlist.nextUp')}</h4>
                  <ScrollArea className="h-40 pr-3">
                    <div className="space-y-2">
                      {tracks.filter(t => !currentTrack || t.id !== currentTrack.id).slice(0, 6).map(t => (
                        <button
                          key={t.id}
                          onClick={() => handleTrackClick(t)}
                          className="w-full flex items-center gap-2 p-2 rounded hover:bg-muted text-left group"
                        >
                          <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-orange-500 rounded" />
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-medium truncate group-hover:text-foreground">{t.title}</div>
                            <div className="text-[10px] text-muted-foreground truncate">{t.artist}</div>
                          </div>
                          <Play className="h-3 w-3 text-muted-foreground group-hover:text-primary" />
                        </button>
                      ))}
                    </div>
                  </ScrollArea>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
  </div>
    <Dialog open={licenseOpen} onOpenChange={setLicenseOpen}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{t('playlist.chooseLicense')}</DialogTitle>
        </DialogHeader>
        {currentTrack && (
          <div className="space-y-5">
            <div>
              <h3 className="font-semibold text-sm">{currentTrack.title}</h3>
              <p className="text-xs text-muted-foreground">{t('playlist.by')} {currentTrack.producer}</p>
            </div>
            <ToggleGroup type="single" value={selectedLicense || undefined} onValueChange={(v) => setSelectedLicense(v || null)} className="grid grid-cols-2 gap-2">
              {licenseOptions.map(opt => (
                <ToggleGroupItem
                  key={opt.value}
                  value={opt.value}
                  aria-label={opt.label}
                  className={cn(
                    "relative flex flex-col items-start gap-1.5 p-3 h-auto data-[state=on]:bg-primary data-[state=on]:text-primary-foreground border rounded-lg text-left group",
                    opt.recommended && "after:absolute after:-top-1.5 after:-right-1.5 after:bg-primary after:text-primary-foreground after:text-[9px] after:px-1.5 after:py-0.5 after:rounded-full after:font-semibold after:tracking-wide after:content-['★']"
                  )}
                >
                  <span className="text-xs font-semibold tracking-wide flex items-center gap-1">{opt.label}
                    {opt.recommended && (
                      <span className="hidden group-data-[state=on]:inline-block text-[9px] font-medium bg-white/20 rounded px-1 py-0.5 leading-none">POPULAR</span>
                    )}
                  </span>
                  <span className="text-[11px] opacity-80">{opt.price === 0 ? 'Free' : `$${opt.price}`}</span>
                  {opt.tagline && <span className="text-[9px] opacity-60 line-clamp-1">{opt.tagline}</span>}
                </ToggleGroupItem>
              ))}
            </ToggleGroup>
            {selectedLicense ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-[11px]">
                  {licenseDetails[selectedLicense]?.map(f => (
                    <div key={f} className="flex items-start gap-1">
                      <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-primary/70" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
                <div className="text-[11px] leading-relaxed rounded-md border border-border/60 p-3 bg-muted/40">
                  <span className="font-semibold mr-1">Usage:</span>{usageRights[selectedLicense]}
                </div>
                {selectedLicense !== 'EXCLUSIVE' && selectedLicense !== 'FREE' && (
                  <div className="text-[10px] text-muted-foreground">
                    {t('playlist.needMoreReach')}
                  </div>
                )}
                {selectedLicense === 'FREE' && (
                  <div className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">
                    {t('playlist.freeDownloadWarning')}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-[11px] text-muted-foreground border border-dashed rounded-md p-4 text-center">
                {t('playlist.chooseLicenseToView')}
              </div>
            )}
            <div className="text-[10px] text-muted-foreground/70 leading-relaxed pt-1">
              <p className="mb-1"><strong className="font-semibold">{t('playlist.disclaimer').split(':')[0]}:</strong> {t('playlist.disclaimer').split(':')[1]}</p>
              <p>{t('playlist.exclusivePurchaseNote')}</p>
            </div>
          </div>
        )}
        <DialogFooter className="pt-4">
          <Button variant="outline" onClick={() => setLicenseOpen(false)}>{t('playlist.cancel')}</Button>
          <Button onClick={confirmAddToCart} disabled={!selectedLicense}>{t('playlist.confirm')}</Button>
        </DialogFooter>
      </DialogContent>
  </Dialog>
  </>
  );
}
