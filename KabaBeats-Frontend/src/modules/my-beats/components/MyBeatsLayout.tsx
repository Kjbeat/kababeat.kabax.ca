import { useState, useEffect, useRef, useCallback } from "react";
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
import { generateMockBeats, Beat } from "./mockBeats";
import { Checkbox } from "@/components/ui/checkbox";
import { EditBeatDialog } from "./EditBeatDialog";
import { useNavigate } from "react-router-dom";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { useLanguage } from "@/contexts/LanguageContext";

export function MyBeatsLayout() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [beats, setBeats] = useState<Beat[]>(() => generateMockBeats(40, 1));
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isGenerating, setIsGenerating] = useState(false);
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [editOpen, setEditOpen] = useState(false);
  const [editingBeat, setEditingBeat] = useState<Beat | null>(null);
  const navigate = useNavigate();
  const { playBeat } = useMediaPlayer();
  const { t } = useLanguage();

  // Derived filtered beats
  const filteredBeats = beats.filter(beat => {
    const matchesSearch = beat.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === "all" || beat.status.toLowerCase() === activeTab;
    return matchesSearch && matchesTab;
  });

  // Pagination derived values
  const totalPages = Math.max(1, Math.ceil(filteredBeats.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageStart = (currentPage - 1) * pageSize;
  const pageEnd = pageStart + pageSize;
  const visibleBeats = filteredBeats.slice(pageStart, pageEnd);

  // Ensure page resets when filters change
  useEffect(() => { setPage(1); }, [searchTerm, activeTab, pageSize]);

  // Infinite scroll: when we reach bottom AND the user is on last page (of current data), generate more
  const generateMore = useCallback(() => {
    if (isGenerating) return;
    setIsGenerating(true);
    // Simulate async delay
    setTimeout(() => {
      setBeats(prev => {
        const nextId = prev.length ? prev[prev.length - 1].id + 1 : 1;
        const extra = generateMockBeats(30, nextId);
        return [...prev, ...extra];
      });
      setIsGenerating(false);
    }, 400);
  }, [isGenerating]);

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        const onLastPage = currentPage === Math.ceil(filteredBeats.length / pageSize);
        if (entry.isIntersecting && onLastPage) {
          generateMore();
        }
      });
    }, { root: null, threshold: 0.1 });
    observer.observe(el);
    return () => observer.disconnect();
  }, [currentPage, filteredBeats.length, pageSize, generateMore]);

  const getStatusBadge = (status: string) => {
    const variant = status === "Published" ? "default" : status === "Draft" ? "secondary" : "outline";
    return <Badge variant={variant}>{status}</Badge>;
  };

  const goToPage = (p: number) => {
    setPage(Math.min(Math.max(1, p), totalPages));
  };

  const toggleSelect = (id: number) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };
  const allVisibleSelected = visibleBeats.length > 0 && visibleBeats.every(b => selectedIds.has(b.id));
  const toggleSelectAllVisible = () => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        visibleBeats.forEach(b => next.delete(b.id));
      } else {
        visibleBeats.forEach(b => next.add(b.id));
      }
      return next;
    });
  };
  const deleteBeats = (ids: number[]) => {
    setBeats(prev => prev.filter(b => !ids.includes(b.id)));
    setSelectedIds(prev => {
      const next = new Set(prev);
      ids.forEach(id => next.delete(id));
      return next;
    });
  };
  const handleEdit = (beat: Beat) => {
    // Defer opening the modal until after the dropdown menu has fully closed.
    // Radix warns when a focused descendant becomes aria-hidden in the same frame.
    // Scheduling the dialog open on the next tick lets the menu unmount & focus shift first.
    setEditingBeat(beat);
    setTimeout(() => setEditOpen(true), 0);
  };
  const handleEditSave = (updated: Partial<Beat>) => {
    setBeats(prev => prev.map(b => b.id === updated.id ? { ...b, ...updated } as Beat : b));
  };
  const handleView = (beat: Beat) => {
    // Navigate to beat page (assumed route pattern /beats/:id)
    navigate(`/beats/${beat.id}`);
  };

  const handleRowClick = (beat: Beat) => (e: React.MouseEvent) => {
    // Prevent triggering when clicking interactive controls
    const target = e.target as HTMLElement;
    if (target.closest('button, a, input, [role="menu"], [role="checkbox"], [data-no-row-play]')) return;
    playBeat({
      id: beat.id.toString(),
      title: beat.title,
      producer: "You", // placeholder until producer data available
      artwork: beat.artwork,
      bpm: beat.bpm,
      key: beat.key,
      genre: beat.genre,
      price: 0,
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
          {filteredBeats.length === 0 ? (
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
                    <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} className="h-8 w-8">
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <div className="px-2 text-sm tabular-nums">{currentPage} / {totalPages}</div>
                    <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} className="h-8 w-8">
                      <ChevronRight className="h-4 w-4" />
                    </Button>
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
                    <TableHead className="hidden lg:table-cell">{t('myBeats.genre')}</TableHead>
                    <TableHead className="hidden xl:table-cell">{t('myBeats.date')}</TableHead>
                    <TableHead className="hidden sm:table-cell">{t('myBeats.status')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('myBeats.streams')}</TableHead>
                    <TableHead className="hidden lg:table-cell">{t('myBeats.sales')}</TableHead>
                    <TableHead className="text-right">{t('myBeats.actions')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {visibleBeats.map((beat) => {
                    const selected = selectedIds.has(beat.id);
                    return (
                    <TableRow 
                      key={beat.id}
                      data-selected={selected || undefined}
                      className={`hover:bg-muted/50 ${selected ? 'bg-muted/70' : ''} cursor-pointer`}
                      onClick={handleRowClick(beat)}
                      title={t('myBeats.clickToPlay')}
                    >
                      <TableCell className="w-10">
                        <Checkbox checked={selected} onCheckedChange={() => toggleSelect(beat.id)} aria-label={t('myBeats.selectBeat')} />
                      </TableCell>
                      <TableCell>
                        <div className="w-14 h-14 rounded overflow-hidden bg-muted flex items-center justify-center">
                          <img 
                            src={beat.artwork} 
                            alt={beat.title}
                            className="w-full h-full object-cover object-center"
                            loading="lazy"
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
                            <span className="hidden xs:inline">{beat.genre}</span>
                            <span>{getStatusBadge(beat.status)}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell">{beat.bpm}</TableCell>
                      <TableCell className="hidden md:table-cell">{beat.key}</TableCell>
                      <TableCell className="hidden lg:table-cell">{beat.genre}</TableCell>
                      <TableCell className="hidden xl:table-cell">{new Date(beat.date).toLocaleDateString()}</TableCell>
                      <TableCell className="hidden sm:table-cell">{getStatusBadge(beat.status)}</TableCell>
                      <TableCell className="hidden lg:table-cell">{beat.streams.toLocaleString()}</TableCell>
                      <TableCell className="hidden lg:table-cell">{beat.sales}</TableCell>
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
                            <DropdownMenuItem onSelect={() => deleteBeats([beat.id])} className="text-destructive focus:text-destructive">
                              <Trash2 className="h-4 w-4 mr-2" />
                              {t('myBeats.delete')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              {t('myBeats.downloadMP3')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="h-4 w-4 mr-2" />
                              {t('myBeats.downloadWAV')}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
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
                    .replace('{showing}', Math.min(pageEnd, filteredBeats.length).toString())
                    .replace('{total}', filteredBeats.length.toLocaleString())}
                  {isGenerating && <span className="animate-pulse"> • {t('myBeats.loadingMore')}</span>}
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="outline" size="icon" disabled={currentPage === 1} onClick={() => goToPage(currentPage - 1)} className="h-8 w-8">
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <div className="px-2 text-sm tabular-nums">{currentPage} / {totalPages}</div>
                  <Button variant="outline" size="icon" disabled={currentPage === totalPages} onClick={() => goToPage(currentPage + 1)} className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {/* Sentinel for infinite scroll */}
              <div ref={sentinelRef} className="h-4" />
            </div>
          )}
        </TabsContent>
      </Tabs>
  <EditBeatDialog open={editOpen} onOpenChange={setEditOpen} beat={editingBeat} onSave={handleEditSave} />
    </div>
  );
}
