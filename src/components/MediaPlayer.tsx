import React from "react";
import { Play, Pause, SkipBack, SkipForward, Heart, Music, ChevronUp, ChevronDown } from "lucide-react";
import { useFavorites } from "@/contexts/FavoritesContext";
import { useDominantColor } from "@/hooks/useDominantColor";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { VolumeControl } from "@/components/media/VolumeControl";
import { useMediaPlayer } from "@/contexts/MediaPlayerContext";
import { Link, useLocation } from "react-router-dom";
import { useTheme } from "@/components/ThemeProvider";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

export function MediaPlayer() {
  const { state, togglePlayPause, setVolume, seekTo, stopBeat, toggleMute, nextBeat, prevBeat } = useMediaPlayer();
  const { isLiked, toggleLike } = useFavorites();
  const location = useLocation();
  
  // Get sidebar state directly like TopBar does
  const { state: sidebarState, open } = useSidebar();
  const isCollapsed = sidebarState === "collapsed" || !open;
  
  // Determine if current route should have sidebar
  const sidebarRoutes = [
    '/explore', '/browse', '/beat', '/playlists', '/playlist',
    '/creator', '/upload', '/my-beats', '/connections', '/library', '/favorites',
    '/checkout', '/payment-success', '/custom-theme'
  ];
  
  const hasSidebar = sidebarRoutes.some(route => 
    location.pathname.startsWith(route) || 
    (route === '/beat' && location.pathname.includes('/beat/')) ||
    (route === '/playlist' && location.pathname.includes('/playlist/')) ||
    (route === '/creator' && location.pathname.includes('/creator/'))
  );
  
  // Compute dynamic left offset so player centers within remaining content area (no extra ML stacking)
  const leftOffset = React.useMemo(() => {
    if (!hasSidebar) return '0';
    return isCollapsed ? '3.9rem' : '13.25rem'; // lg variant difference negligible for fixed element
  }, [hasSidebar, isCollapsed]);
  
  // collapsed == true means the player is hidden (only a restore button shows)
  const [collapsed, setCollapsed] = React.useState(false);
  const wrapperRef = React.useRef<HTMLDivElement | null>(null);
  const progressClickableRef = React.useRef<HTMLDivElement | null>(null);
  const startY = React.useRef<number | null>(null);

  // Keyboard shortcuts
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!state.currentBeat) return;
      if (['Space', ' '].includes(e.code)) { e.preventDefault(); togglePlayPause(); }
      if (e.code === 'ArrowRight') seekTo(Math.min(state.duration, state.currentTime + 5));
      if (e.code === 'ArrowLeft') seekTo(Math.max(0, state.currentTime - 5));
      if (e.key.toLowerCase() === 'm') toggleMute();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [state.currentBeat, state.currentTime, state.duration, togglePlayPause, seekTo, toggleMute]);

  // Swipe down to dismiss on touch
  React.useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;
    const onTouchStart = (e: TouchEvent) => { startY.current = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      if (startY.current == null) return;
      const diff = e.touches[0].clientY - startY.current;
      if (diff > 30) el.style.transform = `translateY(${Math.min(diff - 30, 120)}px)`;
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (startY.current == null) return;
      const diff = e.changedTouches[0].clientY - startY.current;
      el.style.transform = '';
      if (diff > 120) stopBeat();
      startY.current = null;
    };
    el.addEventListener('touchstart', onTouchStart);
    el.addEventListener('touchmove', onTouchMove);
    el.addEventListener('touchend', onTouchEnd);
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
    };
  }, [stopBeat]);

  // Keep hooks above; handle absence of beat later.

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = state.duration > 0 ? (state.currentTime / state.duration) * 100 : 0;
  const accent = useDominantColor(state.currentBeat?.artwork) || 'var(--primary)';
  const { theme } = useTheme();
  const isLight = theme === 'light';

  // Simpler progress percentage from context (tick-based)
  const progressPct = progressPercentage;

  // Visual progress decoupled from tick updates to avoid sawtooth on heavy re-render pages (e.g., /library)
  const [visualProgressPct, setVisualProgressPct] = React.useState(progressPct);
  const baselineTimeRef = React.useRef(state.currentTime);
  const rafIdRef = React.useRef<number | null>(null);
  const startTimestampRef = React.useRef<number | null>(null);

  // Restart interpolation loop when play/pause toggles or duration changes
  React.useEffect(() => {
    // Always clear any prior frame
    if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current);

    if (!state.isPlaying || !state.duration) {
      baselineTimeRef.current = state.currentTime;
      setVisualProgressPct(progressPct);
      return; // no loop when paused
    }

    // Reset baseline when a new beat starts (detected via near-zero currentTime) or when duration changes
    if (Math.abs(state.currentTime - baselineTimeRef.current) > 0.4) {
      baselineTimeRef.current = state.currentTime;
    }
    startTimestampRef.current = performance.now();
    const animate = () => {
      if (!state.isPlaying || !state.duration) return;
      const now = performance.now();
      const elapsed = (now - (startTimestampRef.current || now)) / 1000;
      let interpolated = baselineTimeRef.current + elapsed;
      if (interpolated > state.duration) interpolated = state.duration;
      const pct = (interpolated / state.duration) * 100;
      setVisualProgressPct(pct);
      if (interpolated < state.duration && state.isPlaying) {
        rafIdRef.current = requestAnimationFrame(animate);
      }
    };
    rafIdRef.current = requestAnimationFrame(animate);
    return () => { if (rafIdRef.current) cancelAnimationFrame(rafIdRef.current); };
  // include progressPct & currentTime to appease exhaustive-deps; loop restarts gracefully
  }, [state.isPlaying, state.duration, state.currentTime, progressPct]);

  // Respond to tick (state.currentTime) or seek jumps: if tick jumped a noticeable amount, reset baseline & visual
  React.useEffect(() => {
    const delta = Math.abs(state.currentTime - baselineTimeRef.current);
    // If paused, always sync exactly.
    if (!state.isPlaying) {
      baselineTimeRef.current = state.currentTime;
      setVisualProgressPct(progressPct);
      return;
    }
    // If user sought (large jump) or tick drifted too far from interpolation (> 0.35s) realign.
    if (delta > 0.35) {
      baselineTimeRef.current = state.currentTime;
      startTimestampRef.current = performance.now();
      setVisualProgressPct(progressPct);
    }
  }, [state.currentTime, state.isPlaying, progressPct]);

  // Accent color safety adjustments for readability
  const safeAccent = React.useMemo(() => {
    if (!accent.startsWith('rgb')) return accent; // assume theme var or hex ok
    const nums = accent.match(/\d+/g)?.map(Number) || [255,255,255];
    let [r,g,b] = nums;
    const luminance = (0.2126*r + 0.7152*g + 0.0722*b)/255;
    // If too dark (<0.25) lighten; if too light (>0.9) darken slightly
    if (luminance < 0.25) { r = Math.min(255, r + 80); g = Math.min(255, g + 80); b = Math.min(255, b + 80); }
    else if (luminance > 0.9) { r = Math.max(0, r - 40); g = Math.max(0, g - 40); b = Math.max(0, b - 40); }
    return `rgb(${r}, ${g}, ${b})`;
  }, [accent]);

  // Derive richer gradient + variants from safeAccent
  const accentDerived = React.useMemo(() => {
    // Parse either rgb(...) or fallback to CSS var
    const nums = safeAccent.startsWith('rgb') ? safeAccent.match(/\d+/g)?.map(Number) : null;
    let r=120,g=120,b=255;
    if (nums && nums.length>=3) { [r,g,b] = nums; }
    
    // Convert to HSL
    const rr = r/255, gg = g/255, bb = b/255;
    const max = Math.max(rr,gg,bb), min = Math.min(rr,gg,bb);
  let h=0,s=0; const l=(max+min)/2;
    if (max!==min) {
      const d = max-min;
      s = l>0.5 ? d/(2-max-min) : d/(max+min);
      switch(max){
        case rr: h = (gg-bb)/d + (gg<bb?6:0); break;
        case gg: h = (bb-rr)/d + 2; break;
        case bb: h = (rr-gg)/d + 4; break;
      }
      h/=6;
    }
    const toRgb = (hh:number, ss:number, ll:number) => {
      const hue2rgb = (p:number,q:number,t:number)=>{ if(t<0) t+=1; if(t>1) t-=1; if(t<1/6) return p+(q-p)*6*t; if(t<1/2) return q; if(t<2/3) return p+(q-p)*(2/3 - t)*6; return p; };
      let r2:number,g2:number,b2:number;
      if(ss===0){ r2=g2=b2=ll; } else {
        const q = ll < 0.5 ? ll*(1+ss) : ll + ss - ll*ss;
        const p = 2*ll - q;
        r2 = hue2rgb(p,q,hh+1/3);
        g2 = hue2rgb(p,q,hh);
        b2 = hue2rgb(p,q,hh-1/3);
      }
      return [Math.round(r2*255),Math.round(g2*255),Math.round(b2*255)];
    };
    const clamp = (v:number,min:number,max:number)=>Math.min(max,Math.max(min,v));
    // Create lighter & darker variants
  const lightL = clamp(l + (isLight? -0.05:0.12),0,1);
  const darkL = clamp(l + (isLight? -0.25:-0.35),0,1);
    const vividS = clamp(s*1.15,0,1);
    const [lr,lg,lb] = toRgb(h,vividS,lightL);
    const [dr,dg,db] = toRgb(h,clamp(s*0.9,0,1),darkL);
    const lightRGB = `rgb(${lr}, ${lg}, ${lb})`;
    const darkRGB = `rgb(${dr}, ${dg}, ${db})`;
    const solid = safeAccent;
    const gradient = `linear-gradient(90deg, ${darkRGB} 0%, ${solid} 45%, ${lightRGB} 100%)`;
    const rail = isLight? 'rgba(0,0,0,0.20)' : 'rgba(255,255,255,0.11)';
    const buffer = isLight? 'rgba(0,0,0,0.32)' : 'rgba(255,255,255,0.18)';
    const knobShadow = isLight? '0 0 0 2px rgba(0,0,0,0.20),0 2px 4px -1px rgba(0,0,0,0.25)' : '0 0 0 2px rgba(255,255,255,0.35),0 2px 4px -1px rgba(0,0,0,0.6)';
    const knobColor = lightRGB;
    
    return { 
      gradient: gradient || '#3b82f6', 
      rail: rail || (isLight ? '#e5e7eb' : '#374151'), 
      buffer: buffer || (isLight ? '#d1d5db' : '#4b5563'), 
      knobShadow, 
      knobColor: knobColor || '#3b82f6' 
    };
  }, [safeAccent, isLight]);

  // Hover styling using primary theme color
  const primaryHover = 'hover:text-primary hover:bg-primary/10';


  // Click / seek on thin progress bar
  const computeSeekTime = (clientX: number) => {
    if (!progressClickableRef.current || state.duration === 0) return null;
    const rect = progressClickableRef.current.getBoundingClientRect();
    const ratio = (clientX - rect.left) / rect.width;
    return Math.min(state.duration, Math.max(0, ratio * state.duration));
  };

  const handleProgressClick = (e: React.MouseEvent) => {
    const time = computeSeekTime(e.clientX);
    if (time != null) {
      // Reset baseline for proper visual sync on backward/forward seeks
      baselineTimeRef.current = time;
      startTimestampRef.current = performance.now();
      setVisualProgressPct((time / state.duration) * 100);
      seekTo(time);
    }
  };

  const draggingRef = React.useRef(false);
  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    const time = computeSeekTime(e.clientX);
    if (time != null) {
      // Reset baseline for proper visual sync on drag seeks
      baselineTimeRef.current = time;
      startTimestampRef.current = performance.now();
      setVisualProgressPct((time / state.duration) * 100);
      seekTo(time);
    }
  };
  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const time = computeSeekTime(e.clientX);
    if (time != null) {
      // Update baseline during drag for smooth visual tracking
      baselineTimeRef.current = time;
      startTimestampRef.current = performance.now();
      setVisualProgressPct((time / state.duration) * 100);
      seekTo(time);
    }
  };
  const handlePointerUp = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
  };

  if (!state.currentBeat) return null;

  // When collapsed, show only a small floating restore button with an upward arrow
  if (collapsed) {
    return (
      <div
        ref={wrapperRef}
        style={{ left: leftOffset, right: 0 }}
        className={cn(
          "fixed bottom-4 z-50 flex justify-center transition-all duration-300 pointer-events-none"
        )}
        role="region"
        aria-label="Collapsed media player"
      >
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          aria-label="Show media player"
          className={cn(
            "pointer-events-auto inline-flex items-center justify-center rounded-full shadow-md",
            "h-10 w-10 bg-white text-black dark:bg-white/90 dark:text-black",
            "hover:bg-white/90 active:scale-95 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40"
          )}
        >
          <ChevronUp className="h-5 w-5" />
        </button>
      </div>
    );
  }

  return (
    <div
      ref={wrapperRef}
      style={{ left: leftOffset, right: 0 }}
      className={cn(
        "fixed bottom-4 z-50 transition-all duration-300"
      )}
      role="region"
      aria-label={state.currentBeat ? `Player: ${state.currentBeat.title} by ${state.currentBeat.producer}` : 'Media player'}
      data-collapsed={collapsed ? 'true' : 'false'}
    >
      <div className="max-w-[65rem] mx-auto w-full px-6 md:px-8 lg:px-10">
        <div
          className={`relative ${collapsed ? 'py-1' : ''} transition-colors duration-300 rounded-2xl shadow-lg ${isLight ? 'border border-black/10 bg-white/95 supports-[backdrop-filter]:bg-white/85' : 'border border-white/5 bg-[#0f0f10]/95 supports-[backdrop-filter]:bg-[#0f0f10]/85'} backdrop-blur`}
          style={{ ['--player-accent' as unknown as string]: accent }}
        >
    {/* Content container */}
    <div className="px-3 sm:px-4 lg:px-6 py-2 sm:py-2.5 relative">
      <div className={`grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 sm:gap-6 ${collapsed ? 'py-0.5' : ''}`}>
          {/* Left: Artwork + info */}
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0">
                <div className="absolute inset-0 rounded-xl ring-1 ring-white/20 overflow-hidden bg-muted/40 backdrop-blur-sm">
                  {state.currentBeat.artwork ? (
                    <img
                      src={state.currentBeat.artwork}
                      alt={state.currentBeat.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/30 to-primary/5 animate-pulse">
                      <Music className="h-5 w-5 text-white/80" />
                    </div>
                  )}
                  {/* Accent overlay */}
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity mix-blend-overlay" style={{ background: 'linear-gradient(145deg,var(--player-accent),transparent 60%)' }} />
                </div>
              </div>
        <div className="min-w-0">
                <Link
                  to={`/beat/${state.currentBeat.id}`}
          className={`block truncate ${collapsed ? 'text-xs' : 'text-xs sm:text-sm'} font-medium tracking-tight text-foreground/90 hover:text-primary transition-colors`}
                >
                  {state.currentBeat.title}
                </Link>
                <Link
                  to={`/creator/${state.currentBeat.producer.toLowerCase().replace(/\s+/g, '')}`}
          className={`block truncate ${collapsed ? 'text-[9px]' : 'text-[10px] sm:text-[11px]'} text-muted-foreground/80 hover:text-primary transition-colors`}
                >
                  {state.currentBeat.producer}
                </Link>
              </div>
            </div>

          {/* Center: Controls */}
          <div className="flex items-center justify-center w-full mx-auto">
            <div className="flex items-center justify-center gap-3 sm:gap-5">
              <Button
                size="icon"
                variant="ghost"
                aria-label="Previous"
                className={cn("h-6 w-6 p-0 hidden md:inline-flex rounded-full active:scale-95 transition-colors text-foreground/70", primaryHover)}
                onClick={prevBeat}
              >
                <SkipBack className="h-3 w-3" />
              </Button>
              <Button
                size="icon"
                onClick={togglePlayPause}
                aria-label={state.isPlaying ? 'Pause' : 'Play'}
                className="relative h-9 w-9 sm:h-10 sm:w-10 rounded-full bg-white/90 text-black hover:bg-white active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/40 shadow-md"
              >
                {state.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
              </Button>
              <Button
                size="icon"
                variant="ghost"
                aria-label="Next"
                className={cn("h-6 w-6 p-0 hidden md:inline-flex rounded-full active:scale-95 transition-colors text-foreground/70", primaryHover)}
                onClick={nextBeat}
              >
                <SkipForward className="h-3 w-3" />
              </Button>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center justify-end gap-0.5 sm:gap-1.5">
            {state.currentBeat && (
              <Button
                size="sm"
                variant="ghost"
                aria-label={isLiked(state.currentBeat.id) ? 'Remove from favorites' : 'Add to favorites'}
                aria-pressed={isLiked(state.currentBeat.id)}
                onClick={() => toggleLike(state.currentBeat!.id, state.currentBeat!.title)}
                className={`h-6 w-6 p-0 hidden sm:inline-flex rounded-full active:scale-95 transition-colors relative group/like
                  ${isLiked(state.currentBeat.id) ? 'text-rose-500 hover:text-rose-400' : 'text-muted-foreground/70 ' + primaryHover}`}
              >
                <Heart
                  className={`h-3.5 w-3.5 transition-all duration-300 ${isLiked(state.currentBeat.id) ? 'scale-110 drop-shadow-[0_0_6px_rgba(244,63,94,0.6)]' : ''}`}
                  fill={isLiked(state.currentBeat.id) ? 'currentColor' : 'none'}
                />
                {isLiked(state.currentBeat.id) && (
                  <span className="pointer-events-none absolute inset-0 rounded-full bg-rose-500/20 animate-ping-slow" />
                )}
              </Button>
            )}
            <div className="hidden lg:flex items-center pr-0.5">
              <VolumeControl />
            </div>
            <Button
              size="sm"
              variant="ghost"
              aria-label="Hide media player"
              className={cn("h-6 w-6 p-0 rounded-full active:scale-95 transition-colors hidden sm:inline-flex text-foreground/70", primaryHover)}
              onClick={() => setCollapsed(true)}
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </Button>
          </div>
  </div>
  {/* Full-width progress bar row */}
  <div className="mt-0.5 px-8 sm:px-12 lg:px-16 xl:px-20 pb-2 flex items-center gap-2 select-none">
          <span className="text-[9px] tabular-nums text-muted-foreground/70 w-7 text-right">{formatTime(state.currentTime)}</span>
          <div
            ref={progressClickableRef}
            className={`relative h-1 flex-1 rounded-full overflow-hidden group/progress cursor-pointer transition-colors hover:h-1.5`}
            role="slider"
            aria-label="Seek"
            aria-valuemin={0}
            aria-valuemax={Math.round(state.duration)}
            aria-valuenow={Math.round(state.currentTime)}
            onClick={handleProgressClick}
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
          >
            <div className="absolute inset-0" style={{ background: accentDerived.rail }} />
            <div className="absolute inset-y-0 left-0"
              style={{
                width: `${visualProgressPct}%`,
                background: 'hsl(var(--primary))',
                // rAF drives smoothness; keep transition minimal for seek jumps
                transition: state.isPlaying ? 'none' : 'width 150ms ease-out'
              }} />
          </div>
          <span className="text-[9px] tabular-nums text-muted-foreground/60 w-7">{formatTime(state.duration)}</span>
      </div>
    </div>{/* end content container */}
        </div>{/* end matte panel */}
      </div>{/* width wrapper */}
    </div>
  );
}