// Format number as 1k, 1.2M, etc.
function formatCompactNumber(num: number): string {
  if (num < 1000) return num.toString();
  if (num < 1_000_000) return (num / 1000).toFixed(num % 1000 === 0 ? 0 : 1) + 'k';
  return (num / 1_000_000).toFixed(num % 1_000_000 === 0 ? 0 : 1) + 'M';
}
import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// Accordion removed
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Play,
  Pause,
  Share2,
  Send,
  Loader2,
  Plus,
  MoreHorizontal,
  List
} from "lucide-react";
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useCart } from "@/contexts/CartContext";
import { usePlaylists } from "@/contexts/PlaylistsContext";
import { useLanguage } from "@/contexts/LanguageContext";

// Types
interface Beat {
  id: string;
  title: string;
  producer: string;
  artwork: string;
  bpm: number;
  key: string;
  genre: string;
  streams: number;
  timeAgo: string;
  mp3Price: number;
  wavPrice: number;
  licenseInfo: string;
  likes?: number;
  verified?: boolean;
}

interface LicenseTier {
  id: string;
  name: string;
  price: number;
  formats: string[];
  description?: string;
}

interface CommentItem {
  id: number;
  user: string;
  avatar: string;
  time: string;
  content: string;
}

const initialComments: CommentItem[] = [
  {
    id: 1,
    user: "@kjbeat",
    avatar: "/placeholder.svg",
    time: "10 days ago",
    content: "🔥🔥"
  },
  {
    id: 2,
    user: "@producer123",
    avatar: "/placeholder.svg", 
    time: "2 weeks ago",
    content: "This beat is incredible! Perfect for my next project."
  }
];

// Removed sidebar lists (moreFromProducer & recommended) per request.

export default function BeatDetail() {
  const { id } = useParams();
  const [isPlaying, setIsPlaying] = useState(false);
  // If integrating real audio, add currentTime/duration states back.
  const [isLiked, setIsLiked] = useState(false);
  // Removed save feature
  const [comment, setComment] = useState("");
  const [allComments, setAllComments] = useState<CommentItem[]>(initialComments);
  const [isCopying, setIsCopying] = useState(false);
  const [isLoadingBeat, setIsLoadingBeat] = useState(false);
  const [selectedTier, setSelectedTier] = useState<string>("basic");
  const { toast } = useToast();
  const { addToCart } = useCart();
  const { t } = useLanguage();

  // Add to cart handler
  const handleAddToCart = () => {
    if (!beat) return;
    const tier = tiers.find(t => t.id === selectedTier);
    if (!tier) return;
    addToCart({
      id: beat.id,
      title: beat.title,
      producer: beat.producer,
      artwork: beat.artwork,
      price: tier.price,
      licenseType: tier.name
    });
    toast({ title: t('beat.addedToCart'), description: `${beat.title} (${tier.name}) ${t('beat.addedToCartDescription')}` });
  };
  // Free download handler
  const handleFreeDownload = () => {
    if (!beat) return;
    toast({ title: t('beat.freeDownload'), description: t('beat.freeDownloadStarting') });
    // TODO: implement actual free download logic
  };

  // Mock data – could be replaced by real fetch using id
  const [beat, setBeat] = useState<Beat | null>(null);

  useEffect(() => {
    setIsLoadingBeat(true);
    // Simulate fetch delay
    const t = setTimeout(() => {
      setBeat({
        id: id || "1",
        title: "FREAK (Trippie Redd x Yeat x Playboi Carti Rage Type Beat)",
        producer: "Fantom",
        artwork: "/placeholder.svg",
        bpm: 145,
        key: "C Min",
        genre: "Rage",
        streams: 1290,
        timeAgo: "3 days ago",
        mp3Price: 29.95,
        wavPrice: 49.95,
        licenseInfo: "MP3 • Instant delivery after purchase.",
  likes: 19000,
        verified: true
      });
      setIsLoadingBeat(false);
    }, 500);
    return () => clearTimeout(t);
  }, [id]);

  // (Removed simulated playback progress after removing sticky player)

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  // (Removed time formatting / seeking – no media timeline UI now)

  const handleCommentSubmit = () => {
    if (comment.trim()) {
      const newComment: CommentItem = {
        id: Date.now(),
        user: "@you", // Replace with authenticated user
        avatar: "/placeholder.svg",
        time: t('beat.justNow'),
        content: comment.trim()
      };
      setAllComments((c) => [newComment, ...c]);
      setComment("");
    }
  };

  const handleCopyLink = async () => {
    if (!beat) return;
    try {
      setIsCopying(true);
      await navigator.clipboard.writeText(window.location.href);
      setTimeout(() => setIsCopying(false), 1000);
    } catch (e) {
      setIsCopying(false);
    }
  };

  // (Removed waveform generation – no waveform displayed now)

  if (isLoadingBeat || !beat) {
    return (
      <div className="mt-10 p-6 animate-pulse space-y-6">
        <div className="h-5 w-40 bg-muted rounded" />
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div className="aspect-square bg-muted rounded" />
          <div className="col-span-2 space-y-4">
            <div className="h-8 w-3/4 bg-muted rounded" />
            <div className="h-4 w-1/2 bg-muted rounded" />
            <div className="h-24 w-full bg-muted rounded" />
          </div>
        </div>
      </div>
    );
  }

  // License tiers definition (could be fetched)
  const tiers: LicenseTier[] = [
    { id: 'basic', name: t('beat.basicLicense'), price: 29.95, formats: ['MP3'] },
    { id: 'standard', name: t('beat.standardLicense'), price: 49.95, formats: ['WAV','MP3'] },
    { id: 'premium', name: t('beat.premiumLicense'), price: 99.95, formats: ['WAV','STEMS','MP3'] },
    { id: 'unlimited', name: t('beat.unlimitedLicense'), price: 199.95, formats: ['WAV','STEMS','MP3'] }
  ];

  const activeTier = tiers.find(t => t.id === selectedTier) || tiers[0];
  const licenseDetails: Record<string, string[]> = {
    basic: [
      t('beat.licenseDetails.basic.untagged'),
      t('beat.licenseDetails.basic.streams'),
      t('beat.licenseDetails.basic.nonProfit'),
      t('beat.licenseDetails.basic.credit')
    ],
    standard: [
      t('beat.licenseDetails.standard.wav'),
      t('beat.licenseDetails.standard.streams'),
      t('beat.licenseDetails.standard.monetized'),
      t('beat.licenseDetails.standard.live')
    ],
    premium: [
      t('beat.licenseDetails.premium.stems'),
      t('beat.licenseDetails.premium.streams'),
      t('beat.licenseDetails.premium.broadcast'),
      t('beat.licenseDetails.premium.mix')
    ],
    unlimited: [
      t('beat.licenseDetails.unlimited.streams'),
      t('beat.licenseDetails.unlimited.commercial'),
      t('beat.licenseDetails.unlimited.noLicensing'),
      t('beat.licenseDetails.unlimited.removed')
    ]
  };

  return (
    <div className="mt-6 min-h-screen bg-background text-foreground">
      <main className="p-4 md:p-6 max-w-6xl mx-auto space-y-6 pb-32">
        {/* Top Track Card (Redesigned) */}
        <TrackHero
          beat={beat}
          isPlaying={isPlaying}
          onTogglePlay={togglePlay}
          onCopyLink={handleCopyLink}
          isCopying={isCopying}
        />

  {/* Track details removed */}

        {/* Licensing Section */}
        <Card className="bg-card/90 border-border/60">
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t('beat.licensing')}</CardTitle>
              <div className="text-right">
                <p className="text-[10px] font-medium tracking-wide text-muted-foreground">{t('beat.total')} :</p>
                <p className="text-xl font-semibold tabular-nums">${activeTier.price.toFixed(2)}</p>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {tiers.map(t => (
                <LicenseTierCard
                  key={t.id}
                  tier={t}
                  active={t.id === selectedTier}
                  onSelect={() => setSelectedTier(t.id)}
                />
              ))}
            </div>
            {/* License details for selected tier */}
            {selectedTier && licenseDetails[selectedTier] && (
              <div className="mt-4 rounded-md border border-border/60 bg-muted/30 p-4">
                <p className="text-xs font-medium mb-1">{t('beat.whatsIncluded')}:</p>
                <ul className="text-[11px] leading-relaxed grid gap-1 list-disc pl-4">
                  {licenseDetails[selectedTier].map((line) => (
                    <li key={line}>{line}</li>
                  ))}
                </ul>
              </div>
            )}
            <Separator />
            <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-end">
              <Button
                variant="secondary"
                className="sm:min-w-[140px]"
                onClick={handleAddToCart}
              >
                {t('beat.addToCart')}
              </Button>

                <Button
                  className="sm:min-w-[140px]"
                  onClick={handleFreeDownload}
                >
                  {t('beat.freeDownload')}
                </Button>
              
            </div>
          </CardContent>
        </Card>

        {/* Comments */}
        {/* <section aria-labelledby="comments-heading">
          <Card className="bg-card/90 border-border/60">
            <CardHeader>
              <CardTitle id="comments-heading" className="text-base">{t('beat.comments')} ({allComments.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="flex gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>U</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-2">
                  <Textarea
                    placeholder={t('beat.addComment')}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="min-h-[70px] resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={!comment.trim()}
                      onClick={() => setComment("")}
                    >
                      {t('beat.clear')}
                    </Button>
                    <Button
                      size="sm"
                      onClick={handleCommentSubmit}
                      disabled={!comment.trim()}
                    >
                      <Send className="h-4 w-4 mr-1" />
                      {t('beat.comment')}
                    </Button>
                  </div>
                </div>
              </div>
              <Separator />
              <div className="space-y-4">
                {allComments.map((c) => (
                  <div key={c.id} className="flex gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={c.avatar} alt={c.user} />
                      <AvatarFallback>{c.user[1]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm">{c.user}</span>
                        <span className="text-xs text-muted-foreground">{c.time}</span>
                      </div>
                      <p className="text-sm leading-snug whitespace-pre-wrap break-words">{c.content}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section> */}
      </main>
    </div>
  );
}

// Sub-components
function TrackHero({
  beat,
  isPlaying,
  onTogglePlay,
  onCopyLink,
  isCopying
}: {
  beat: Beat;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onCopyLink: () => void;
  isCopying: boolean;
}) {
  const { toast } = useToast();
  const { playBeat } = useMediaPlayer();
  const { playlists, createPlaylist, addBeatToPlaylist } = usePlaylists();
  const { t } = useLanguage();
  const [newPlaylistName, setNewPlaylistName] = useState("");
  const [showCreateInput, setShowCreateInput] = useState(false);
  const [showDialog, setShowDialog] = useState(false);
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(beat.likes || 0);
  const [isHovered, setIsHovered] = useState(false);
  const stats: { label: string; value: string }[] = [
    { label: t('beat.stats.streams'), value: formatCompactNumber(beat.streams) },
    { label: t('beat.stats.bpm'), value: String(beat.bpm) },
    { label: t('beat.stats.key'), value: beat.key },
    { label: t('beat.stats.genre'), value: beat.genre },
    { label: t('beat.stats.posted'), value: beat.timeAgo }
  ];

  return (
    <Card
      tabIndex={0}
      aria-label={`${t('beat.heroAriaLabel')} ${beat.title} ${t('beat.by')} ${beat.producer}`}
      className="group relative bg-card/80 backdrop-blur border border-border/50 hover:border-primary/40 transition-all duration-300 rounded-2xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary/50"
    >
      {/* Decorative gradient overlay like BeatCard */}
      <div className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-primary/10 via-transparent to-transparent" />
      <CardContent className="relative p-5 sm:p-7 flex flex-col md:flex-row gap-7">
        {/* Artwork */}
        <div
          className="relative group/art w-full md:w-60 aspect-square flex-shrink-0 rounded-xl overflow-hidden ring-1 ring-border/40"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <img
            src={beat.artwork}
            alt={beat.title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent opacity-70 group-hover:opacity-80 transition" />
          {/* Like button removed from artwork */}
          {/* Center Play Button (smaller) */}
          <button
            onClick={() => {
              onTogglePlay();
              if (playBeat) playBeat({
                ...beat,
                price: beat.mp3Price // or use selectedTier price if needed
              });
            }}
            aria-label={isPlaying ? t('beat.pause') : t('beat.play')}
            className="absolute inset-0 flex items-center justify-center focus:outline-none"
          >
            <span className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/90 text-primary-foreground shadow-xl shadow-primary/30 backdrop-blur-sm ring-2 ring-primary/50 transition-transform group-hover:scale-105 active:scale-95">
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </span>
          </button>
          {isPlaying && (
            <Badge variant="default" className="absolute left-3 top-3 bg-primary text-primary-foreground border-primary/50 shadow-sm text-[10px] leading-none py-1 px-1.5">
              {t('beat.playing')}
            </Badge>
          )}
        </div>

        {/* Meta / Details */}
        <div className="flex-1 min-w-0 flex flex-col gap-5">
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl sm:text-3xl font-semibold leading-tight tracking-tight">
                {beat.title}
              </h1>
              <div className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                <a
                  href={`/producer/${encodeURIComponent(beat.producer)}`}
                  className="font-medium text-primary hover:underline focus:underline focus:outline-none"
                  aria-label={`${t('beat.viewProducerPage')} ${beat.producer}`}
                >
                  {beat.producer}
                </a>
                <span className="text-muted-foreground/40">•</span>
                <span className="text-[11px] bg-primary/10 text-primary px-2 py-0.5 rounded-full uppercase tracking-wide font-medium">
                  {beat.genre}
                </span>
              </div>
            </div>

            {/* Stats row styled like chips */}
            <div className="flex flex-wrap gap-2">
              {stats.map(s => (
                <span
                  key={s.label}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-muted/50 text-[11px] font-medium border border-border/60"
                >
                  <span className="text-foreground/70">{s.label}</span>
                  <span className="text-foreground/90 font-semibold">{s.value}</span>
                </span>
              ))}
            </div>

            {/* Actions: Share and Playlist buttons */}
            <div className="hidden md:flex items-center gap-3 pt-1">
              <button
                onClick={async () => {
                  await navigator.clipboard.writeText(window.location.href);
                  toast({ title: t('beat.linkCopied'), description: t('beat.shareLinkCopied') });
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted/70 text-xs font-medium px-3 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                aria-label={t('beat.share')}
              >
                <Share2 className="h-4 w-4" />
                <span>{t('beat.share')}</span>
              </button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted/70 text-xs font-medium px-3 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                    aria-label={t('beat.playlist')}
                  >
                    <List className="h-4 w-4" />
                    <span>{t('beat.playlist')}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  {playlists.length === 0 && (
                    <DropdownMenuItem disabled className="text-xs text-muted-foreground">{t('beat.noPlaylistsFound')}</DropdownMenuItem>
                  )}
                  {playlists.map(pl => (
                    <DropdownMenuItem
                      key={pl.id}
                      onClick={() => {
                        addBeatToPlaylist(pl.id, beat.id, beat.title);
                        toast({ title: t('beat.addedToPlaylist'), description: `${t('beat.beatAddedToPlaylist')} '${pl.name}'.` });
                      }}
                    >
                      <List className="h-4 w-4 mr-2 inline-block" />
                      {pl.name}
                    </DropdownMenuItem>
                  ))}
                  <DropdownMenuSeparator />
                  {showCreateInput ? (
                    <div className="px-3 py-2">
                      <Input
                        value={newPlaylistName}
                        onChange={e => setNewPlaylistName(e.target.value)}
                        placeholder={t('beat.newPlaylistName')}
                        className="mb-2"
                        onKeyDown={e => {
                          if (e.key === 'Enter' && newPlaylistName.trim()) {
                            createPlaylist(newPlaylistName, undefined, beat.id);
                            setNewPlaylistName("");
                            setShowCreateInput(false);
                            toast({ title: t('beat.playlistCreated'), description: `${t('beat.createdAndAddedBeat')} '${newPlaylistName}'.` });
                          }
                        }}
                      />
                      <button
                        className="w-full px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium"
                        disabled={!newPlaylistName.trim()}
                        onClick={() => {
                          if (!newPlaylistName.trim()) return;
                          createPlaylist(newPlaylistName, undefined, beat.id);
                          setNewPlaylistName("");
                          setShowCreateInput(false);
                          toast({ title: t('beat.playlistCreated'), description: `${t('beat.createdAndAddedBeat')} '${newPlaylistName}'.` });
                        }}
                      >
                        {t('beat.createAndAddBeat')}
                      </button>
                    </div>
                  ) : (
                    <DropdownMenuItem onSelect={e => { e.preventDefault(); setShowDialog(true); }}>
                      <Plus className="h-4 w-4 mr-2" />
                      {t('beat.createNewPlaylist')}
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Dialog for creating a new playlist */}
          {showDialog && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
              <div className="bg-card rounded-xl shadow-lg p-6 w-[90vw] max-w-sm flex flex-col gap-4">
                <h2 className="text-lg font-semibold mb-2">{t('beat.createNewPlaylist')}</h2>
                <Input
                  value={newPlaylistName}
                  onChange={e => setNewPlaylistName(e.target.value)}
                  placeholder={t('beat.playlistName')}
                  autoFocus
                />
                <div className="flex gap-2 justify-end mt-2">
                  <Button variant="outline" size="sm" onClick={() => { setShowDialog(false); setNewPlaylistName(""); }}>{t('beat.cancel')}</Button>
                  <Button
                    size="sm"
                    disabled={!newPlaylistName.trim()}
                    onClick={() => {
                      if (!newPlaylistName.trim()) return;
                      createPlaylist(newPlaylistName, undefined, beat.id);
                      setShowDialog(false);
                      setNewPlaylistName("");
                      toast({ title: t('beat.playlistCreated'), description: `${t('beat.createdAndAddedBeat')} '${newPlaylistName}'.` });
                    }}
                  >
                    {t('beat.createAndAddBeat')}
                  </Button>
                </div>
              </div>
            </div>
          )}
          <div className="flex md:hidden flex-wrap gap-3 pt-1">
            <button
              onClick={async () => {
                await navigator.clipboard.writeText(window.location.href);
                toast({ title: t('beat.linkCopied'), description: t('beat.shareLinkCopied') });
              }}
              className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted/70 text-xs font-medium px-3 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
              aria-label={t('beat.share')}
            >
              <Share2 className="h-4 w-4" />
              <span>{t('beat.share')}</span>
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-muted/40 hover:bg-muted/70 text-xs font-medium px-3 py-1.5 transition focus:outline-none focus:ring-2 focus:ring-primary/50"
                  aria-label={t('beat.playlist')}
                >
                  <List className="h-4 w-4" />
                  <span>{t('beat.playlist')}</span>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                {playlists.length === 0 && (
                  <DropdownMenuItem disabled className="text-xs text-muted-foreground">{t('beat.noPlaylistsFound')}</DropdownMenuItem>
                )}
                {playlists.map(pl => (
                  <DropdownMenuItem
                    key={pl.id}
                    onClick={() => {
                      addBeatToPlaylist(pl.id, beat.id, beat.title);
                      toast({ title: t('beat.addedToPlaylist'), description: `${t('beat.beatAddedToPlaylist')} '${pl.name}'.` });
                    }}
                  >
                    <List className="h-4 w-4 mr-2 inline-block" />
                    {pl.name}
                  </DropdownMenuItem>
                ))}
                <DropdownMenuSeparator />
                {showCreateInput ? (
                  <div className="px-3 py-2">
                    <Input
                      value={newPlaylistName}
                      onChange={e => setNewPlaylistName(e.target.value)}
                      placeholder={t('beat.newPlaylistName')}
                      className="mb-2"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && newPlaylistName.trim()) {
                          createPlaylist(newPlaylistName, undefined, beat.id);
                          setNewPlaylistName("");
                          setShowCreateInput(false);
                          toast({ title: t('beat.playlistCreated'), description: `${t('beat.createdAndAddedBeat')} '${newPlaylistName}'.` });
                        }
                      }}
                    />
                    <button
                      className="w-full px-3 py-1.5 rounded bg-primary text-primary-foreground text-xs font-medium"
                      disabled={!newPlaylistName.trim()}
                      onClick={() => {
                        if (!newPlaylistName.trim()) return;
                        createPlaylist(newPlaylistName, undefined, beat.id);
                        setNewPlaylistName("");
                        setShowCreateInput(false);
                        toast({ title: t('beat.playlistCreated'), description: `${t('beat.createdAndAddedBeat')} '${newPlaylistName}'.` });
                      }}
                    >
                      {t('beat.createAndAddBeat')}
                    </button>
                  </div>
                ) : (
                  <DropdownMenuItem onSelect={e => { e.preventDefault(); setShowCreateInput(true); }}>
                    <Plus className="h-4 w-4 mr-2" />
                    {t('beat.createNewPlaylist')}
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}


function LicenseTierCard({ tier, active, onSelect }: { tier: LicenseTier; active: boolean; onSelect: () => void }) {
  return (
    <button
      onClick={onSelect}
      className={`text-left rounded-md border px-4 py-4 flex flex-col gap-2 transition focus:outline-none focus:ring-2 focus:ring-primary/50 ${
        active ? 'bg-primary/10 border-primary/60 ring-1 ring-primary/40' : 'bg-muted/30 border-border/50 hover:bg-muted/50'
      }`}
      aria-pressed={active}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="font-medium text-sm leading-none">{tier.name}</span>
      </div>
      <div className="text-sm font-semibold tabular-nums">${tier.price.toFixed(2)}</div>
      <div className="text-[10px] uppercase tracking-wide text-muted-foreground font-medium">
        {tier.formats.join(', ')}
      </div>
    </button>
  );
}

// (Track list components removed along with sidebar)