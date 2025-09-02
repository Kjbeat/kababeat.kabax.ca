import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, Download, Edit, Eye, MoreHorizontal, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
// import { Card, CardContent } from "@/components/ui/card"; // not currently used
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { PageHeader, EmptyState } from "@/components/shared";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { EditBeatDialog } from "./EditBeatDialog";
import { useNavigate } from "react-router-dom";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import type { Beat } from "@/interface-types/media-player";
import { getArtworkUrl } from "@/utils/artwork";
import { formatDistanceToNow, format } from "date-fns";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';

// Component for displaying artwork using public URLs
function ArtworkImage({ artwork, title, className }: { artwork?: string; title: string; className?: string }) {
  return (
    <img 
      src={getArtworkUrl(artwork)} 
      alt={title}
      className={className}
      loading="lazy"
      onError={(e) => {
        (e.target as HTMLImageElement).src = "/placeholder.svg";
      }}
    />
  );
}

export function MyBeatsLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [beats, setBeats] = useState<Beat[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const navigate = useNavigate();
  const { playBeat } = useMediaPlayer();
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user, accessToken } = useAuth();

  // Fetch beats from API
  const fetchBeats = useCallback(async (pageNum: number = 1, reset: boolean = false) => {
    if (!accessToken) return;
    
    try {
      setIsLoading(true);
      console.log('Fetching beats for user:', user?.id);
      const params = new URLSearchParams({
        page: pageNum.toString(),
        limit: pageSize.toString(),
        owner: user.id,
        ...(searchTerm && { search: searchTerm }),
        ...(activeTab !== "all" && { status: activeTab })
      });
      
      console.log('API request params:', params.toString());

      const response = await fetch(`${API_BASE_URL}/beats?${params}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch beats');
      }

      const data = await response.json();
      console.log('API response:', data);
      
      // Handle the correct response structure
      const beats = Array.isArray(data.data) ? data.data : (data.data?.beats || []);
      const pagination = data.pagination || data.data?.pagination || {};
      
      if (reset) {
        setBeats(beats);
      } else {
        setBeats(prev => [...prev, ...beats]);
      }
      
      setCurrentPage(pagination.page || pagination.currentPage || 1);
      setTotalPages(pagination.pages || pagination.totalPages || 1);
    } catch (error) {
      console.error('Error fetching beats:', error);
      toast({
        title: "Error",
        description: "Failed to load your beats. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, user?.id, pageSize, searchTerm, activeTab, toast]);

  // Derived filtered beats (now just use the API data directly)
  // Ensure unique beats by ID to prevent React key warnings
  const filteredBeats = useMemo(() => {
    const uniqueBeats = new Map();
    beats.forEach(beat => {
      const id = beat._id || beat.id;
      if (id && !uniqueBeats.has(id)) {
        uniqueBeats.set(id, beat);
      }
    });
    return Array.from(uniqueBeats.values());
  }, [beats]);

  // Initial data load
  useEffect(() => {
    if (accessToken) {
      fetchBeats(1, true);
    }
  }, [accessToken, fetchBeats]);

  // Refetch when filters change
  useEffect(() => {
    if (accessToken) {
      fetchBeats(1, true);
    }
  }, [searchTerm, activeTab, pageSize, accessToken, fetchBeats]);

  // Load more beats when scrolling to bottom
  const loadMore = useCallback(() => {
    if (isGenerating || currentPage >= totalPages) return;
    setIsGenerating(true);
    fetchBeats(currentPage + 1, false).finally(() => {
      setIsGenerating(false);
    });
  }, [isGenerating, currentPage, totalPages, fetchBeats]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting && currentPage < totalPages) {
          loadMore();
        }
      });
    }, { root: null, threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentPage, totalPages, loadMore]);

  const getStatusBadge = (status: string) => {
    const variant = status === "published" ? "default" : status === "draft" ? "secondary" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  
  const allVisibleSelected = filteredBeats.length > 0 && filteredBeats.every(b => selectedIds.has(b._id || b.id));
  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredBeats.forEach(b => next.delete(b._id || b.id));
      } else {
        filteredBeats.forEach(b => next.add(b._id || b.id));
      }
      return next;
    });
  };

  const deleteBeats = async (ids: string[]) => {
    if (!accessToken) return;
    
    try {
      const deletePromises = ids.map(id => 
        fetch(`${API_BASE_URL}/beats/${id}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        })
      );

      await Promise.all(deletePromises);
      
      // Remove deleted beats from state
      setBeats(prev => prev.filter(b => !ids.includes(b._id || b.id)));
      setSelectedIds(prev => {
        const next = new Set(prev);
        ids.forEach(id => next.delete(id));
        return next;
      });

      toast({
        title: "Success",
        description: `${ids.length} beat(s) deleted successfully.`,
      });
    } catch (error) {
      console.error('Error deleting beats:', error);
      toast({
        title: "Error",
        description: "Failed to delete beats. Please try again.",
        variant: "destructive"
      });
    }
  };
  const handleEdit = (beat: Beat) => {
    // Defer opening the modal until after the dropdown menu has fully closed.
    // Radix warns when a focused descendant becomes aria-hidden in the same frame.
    // Scheduling the dialog open on the next tick lets the menu unmount & focus shift first.
    setEditingBeat(beat);
    setTimeout(() => setEditOpen(true), 0);
  };

  const handleEditSave = async (updated: Partial<Beat>) => {
    if (!accessToken || !editingBeat) return;
    
    try {
      const response = await fetch(`${API_BASE_URL}/beats/${editingBeat._id || editingBeat.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updated)
      });

      if (!response.ok) {
        throw new Error('Failed to update beat');
      }

      const data = await response.json();
      
      // Update the beat in state
      setBeats(prev => prev.map(b => 
        (b._id || b.id) === (editingBeat._id || editingBeat.id) 
          ? { ...b, ...data.data } 
          : b
      ));

      toast({
        title: "Success",
        description: "Beat updated successfully.",
      });
    } catch (error) {
      console.error('Error updating beat:', error);
      toast({
        title: "Error",
        description: "Failed to update beat. Please try again.",
        variant: "destructive"
      });
    }
  };

  // Handle edit save with files - this will be called by EditBeatDialog when files are uploaded
  const handleEditSaveWithFiles = async (updated: Partial<Beat>) => {
    // Just refresh the beats list to get the updated data from server
    await fetchBeats(1, true);
    
    toast({
      title: "Success",
      description: "Beat updated successfully.",
    });
  };

  const handleView = (beat: Beat) => {
    // Navigate to beat page (assumed route pattern /beats/:id)
    navigate(`/beats/${beat._id || beat.id}`);
  };

  const handleDownload = async (beat: Beat, format: 'mp3' | 'wav' | 'stems') => {
    if (!accessToken) return;
    
    try {
      const beatId = beat._id || beat.id;
      let downloadUrl: string;
      
      if (format === 'stems') {
        // Download stems ZIP file - use direct R2 URL
        if (!beat.stemsStorageKey) {
          toast({
            title: "No Stems Available",
            description: "This beat doesn't have stems available for download.",
            variant: "destructive"
          });
          return;
        }
        downloadUrl = `https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev/${beat.stemsStorageKey}`;
      } else {
        // Download audio file (MP3/WAV) - use API endpoint to get proper download URL
        if (!beat.storageKey) {
          toast({
            title: "No Audio Available",
            description: "This beat doesn't have audio available for download.",
            variant: "destructive"
          });
          return;
        }
        
        console.log('🎵 MyBeatsLayout: Getting download URL from API for beat:', beatId);
        
        // Get download URL from API
        const response = await fetch(`${API_BASE_URL}/beats/${beatId}/audio`, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to get download URL');
        }
        
        const data = await response.json();
        downloadUrl = data.data.audioUrl;
        
        console.log('🎵 MyBeatsLayout: Got download URL from API:', downloadUrl);
      }
      
      console.log('🎵 MyBeatsLayout: Starting download for:', {
        beatId,
        format,
        downloadUrl,
        fileName: `${beat.title}_${format.toUpperCase()}.${format === 'stems' ? 'zip' : format}`
      });
      
      // Force download by fetching the file and creating a blob
      console.log('🎵 MyBeatsLayout: Fetching file for download...');
      
      const response = await fetch(downloadUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch file for download');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      link.download = `${beat.title}_${format.toUpperCase()}.${format === 'stems' ? 'zip' : format}`;
      link.style.display = 'none';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Clean up the blob URL
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Download Started",
        description: `Downloading ${format.toUpperCase()} file for "${beat.title}"`,
      });
    } catch (error) {
      console.error('Error downloading file:', error);
      toast({
        title: "Download Failed",
        description: "Failed to download the file. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleRowClick = (beat: Beat) => (e: React.MouseEvent) => {
    // Prevent triggering when clicking interactive controls
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, [role="menu"], [role="checkbox"], [data-no-row-play]')) return;
    
    // Use direct public URLs for artwork and audio
    const artworkUrl = getArtworkUrl(beat.artwork);
    const audioUrl = beat.storageKey ? `https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev/${beat.storageKey}` : undefined;
    
    console.log('Playing beat:', {
      id: (beat._id || beat.id).toString(),
      title: beat.title,
      audioUrl: audioUrl,
      storageKey: beat.storageKey
    });
    
    playBeat({
      id: (beat._id || beat.id).toString(),
      title: beat.title,
      producer: beat.producer || "You",
      artwork: artworkUrl,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
      price: beat.salePrice || beat.basePrice || 0,
      audioUrl: audioUrl
    });
  };

  return (
    <div className="container mx-auto p-4 sm:p-6 mt-6 sm:mt-10">
      <PageHeader 
        title={t('myBeats.title')} 
        description={t('myBeats.description')}
      />

      <div className="mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder={t('myBeats.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
        <TabsList className="w-full flex overflow-hidden gap-1 p-1 rounded-md bg-muted">
          <TabsTrigger value="all" className="flex-1 basis-0 text-center">{t('myBeats.all')}</TabsTrigger>
          <TabsTrigger value="published" className="flex-1 basis-0 text-center">{t('myBeats.published')}</TabsTrigger>
          <TabsTrigger value="draft" className="flex-1 basis-0 text-center">{t('myBeats.draft')}</TabsTrigger>
          <TabsTrigger value="scheduled" className="flex-1 basis-0 text-center">{t('myBeats.scheduled')}</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading your beats...</p>
              </div>
            </div>
          ) : filteredBeats.length === 0 ? (
            <EmptyState
              title={t('myBeats.noBeatsFound')}
              description={searchTerm ? t('myBeats.noBeatsMatchSearch') : t('myBeats.haventUploadedYet')}
              icon="music"
              action={!searchTerm ? {
                label: t('myBeats.uploadFirstBeat'),
                onClick: () => window.location.href = "/upload"
              } : undefined}
            />
          ) : (
            <div className="border rounded-lg">
              <div className="flex items-center justify-between px-3 sm:px-4 py-3 gap-4 flex-wrap">
                <div className="text-sm text-muted-foreground">
                  {filteredBeats.length === 1
                    ? t('myBeats.beatFound').replace('{count}', '1')
                    : t('myBeats.beatsFound').replace('{count}', filteredBeats.length.toString())}
                </div>
                <div className="flex items-center gap-3">
                  {selectedIds.size > 0 && (
                    <Button variant="destructive" size="sm" onClick={() => deleteBeats(Array.from(selectedIds))} className="w-full sm:w-auto">
                      <Trash2 className="h-4 w-4 mr-1" /> {t('myBeats.delete')} ({selectedIds.size})
                    </Button>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <span className="text-muted-foreground">{t('myBeats.perPage')}:</span>
                    <Select value={String(pageSize)} onValueChange={v => setPageSize(Number(v))}>
                      <SelectTrigger className="h-8 w-[90px]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[10,20,30,50].map(size => (
                          <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="px-2 text-sm tabular-nums">{currentPage} / {totalPages}</div>
                  </div>
                </div>
              </div>
              <div className="overflow-x-auto">
              <Table className="min-w-full">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-10">
                      <Checkbox checked={allVisibleSelected} onCheckedChange={toggleSelectAllVisible} aria-label={t('myBeats.selectAll')} />
                    </TableHead>
                    <TableHead className="w-16" />
                    <TableHead>{t('myBeats.title')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('myBeats.bpm')}</TableHead>
                    <TableHead className="hidden md:table-cell">{t('myBeats.key')}</TableHead>
                    <TableHead className="hidden xl:table-cell">{t('myBeats.date')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('myBeats.status')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('myBeats.streams')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('myBeats.scheduledFor')}</TableHead>
                    <TableHead className="text-right">{t('myBeats.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBeats.map((beat) => {
                    const beatId = beat._id || beat.id;
                    const selected = selectedIds.has(beatId);
                    return (
                    <TableRow 
                      key={beatId}
                      data-selected={selected || undefined}
                      className={`hover:bg-muted/50 ${selected ? 'bg-muted/70' : ''} cursor-pointer`}
                      onClick={handleRowClick(beat)}
                      title={t('myBeats.clickToPlay')}
                    >
                      <TableCell className="w-10">
                        <Checkbox checked={selected} onCheckedChange={() => toggleSelect(beatId)} aria-label={t('myBeats.selectBeat')} />
                      </TableCell>
                      <TableCell>
                        <div className="w-14 h-14 rounded overflow-hidden bg-muted flex items-center justify-center">
                          <ArtworkImage 
                            artwork={beat.artwork}
                            title={beat.title}
                            className="w-full h-full object-cover object-center"
                          />
                        </div>
                      </TableCell>
                      <TableCell className="font-medium align-top">
                        <div className="flex flex-col gap-1">
                          <span className="line-clamp-1">{beat.title}</span>
                          {/* Mobile meta */}
                          <div className="md:hidden text-xs text-muted-foreground flex flex-wrap gap-x-2 gap-y-0.5">
                            <span>{beat.bpm} {t('myBeats.bpm')}</span>
                            <span>{beat.key}</span>
                            <span>{getStatusBadge(beat.status)}</span>
                            {beat.status === 'scheduled' && beat.scheduledDate && (
                              <span className="text-blue-600">
                                {format(new Date(beat.scheduledDate), 'MMM d, yyyy')} {new Date(beat.scheduledDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ({formatDistanceToNow(new Date(beat.scheduledDate), { addSuffix: true })})
                              </span>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{beat.bpm}</TableCell>
                      <TableCell className="hidden md:table-cell">{beat.key}</TableCell>
                      <TableCell className="hidden xl:table-cell">{new Date(beat.uploadDate || beat.date).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden sm:table-cell">{getStatusBadge(beat.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{beat.plays?.toLocaleString() || 0}</TableCell>
                      <TableCell className="hidden lg:table-cell">
                        {beat.status === 'scheduled' && beat.scheduledDate ? (
                          <div className="text-sm">
                            <div className="font-medium">
                              {format(new Date(beat.scheduledDate), 'MMM d, yyyy')}
                            </div>
                            <div className="text-muted-foreground">
                              {new Date(beat.scheduledDate).toLocaleTimeString([], { 
                                hour: '2-digit', 
                                minute: '2-digit' 
                              })}
                            </div>
                            <div className="text-xs text-blue-600">
                              {formatDistanceToNow(new Date(beat.scheduledDate), { addSuffix: true })}
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" data-no-row-play>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onSelect={() => handleView(beat)}>
                              <Eye className="h-4 w-4 mr-2" />
                              {t('myBeats.view')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleEdit(beat)}>
                              <Edit className="h-4 w-4 mr-2" />
                              {t('myBeats.edit')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => deleteBeats([beatId])} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('myBeats.delete')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDownload(beat, 'mp3')}>
                              <Download className="h-4 w-4 mr-2" />
                              {t('myBeats.downloadMP3')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDownload(beat, 'wav')}>
                              <Download className="h-4 w-4 mr-2" />
                              {t('myBeats.downloadWAV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem onSelect={() => handleDownload(beat, 'stems')}>
                              <Download className="h-4 w-4 mr-2" />
                              {t('myBeats.downloadStems')}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );})}
                </TableBody>
              </Table>
              </div>
              <div className="flex items-center justify-between px-4 py-3 gap-4 flex-wrap border-t">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  {t('myBeats.showingResults')
                    .replace('{showing}', filteredBeats.length.toString())
                    .replace('{total}', filteredBeats.length.toLocaleString())}
                  {isGenerating && <span className="animate-pulse"> • {t('myBeats.loadingMore')}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <div className="px-2 text-sm tabular-nums">{currentPage} / {totalPages}</div>
                  {isGenerating && <span className="text-xs text-muted-foreground">Loading more...</span>}
                </div>
              </div>
              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-4" />
            </div>
          )}
        </TabsContent>
      </Tabs>
  <EditBeatDialog open={editOpen} onOpenChange={setEditOpen} beat={editingBeat} onSave={handleEditSave} onSaveWithFiles={handleEditSaveWithFiles} onRefresh={fetchBeats} />
    </div>
  );
}
