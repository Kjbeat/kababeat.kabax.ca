import React from 'react';
import { Volume2, VolumeX } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { cn } from '@/lib/utils';
import { useMediaPlayer } from '@/contexts/MediaPlayerContext';

interface VolumeControlProps {
  accentGradient?: string;
}

export const VolumeControl: React.FC<VolumeControlProps> = ({ accentGradient }) => {
  const { state, setVolume } = useMediaPlayer();
  const containerRef = React.useRef<HTMLDivElement | null>(null);
  const lastNonZero = React.useRef(state.volume || 0.7);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    if (state.volume > 0) lastNonZero.current = state.volume;
  }, [state.volume]);

  const handleToggleMute = () => {
    if (state.volume === 0) {
      setVolume(lastNonZero.current || 0.7);
    } else {
      setVolume(0);
    }
  };

  const changeVolume = (delta: number, fine = false) => {
    const step = fine ? 0.01 : 0.05;
    let next = state.volume + (delta * step);
    next = Math.min(1, Math.max(0, next));
    setVolume(Number(next.toFixed(3)));
  };

  const onWheel: React.WheelEventHandler = (e) => {
    e.preventDefault();
    const fine = e.shiftKey;
    changeVolume(e.deltaY < 0 ? 1 : -1, fine);
  };

  const onKeyDown: React.KeyboardEventHandler = (e) => {
    if (e.key === 'ArrowUp') { e.preventDefault(); changeVolume(1, e.shiftKey); }
    if (e.key === 'ArrowDown') { e.preventDefault(); changeVolume(-1, e.shiftKey); }
    if (e.key === 'm' || e.key === 'M') { e.preventDefault(); handleToggleMute(); }
  if (e.key === 'Escape') { /* no-op when always pinned */ }
  };

  // Open on hover
  const handleMouseEnter = () => setOpen(true);
  const handleMouseLeave = (e: React.MouseEvent) => {
    // If moving focus inside panel, ignore
    if (containerRef.current && containerRef.current.contains(e.relatedTarget as Node)) return;
    setOpen(false);
  };

  // Close on outside click
  React.useEffect(() => {
    if (!open) return;
    const onDocClick = (e: MouseEvent) => {
      if (!containerRef.current) return;
      if (!containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const vol = state.volume;
  // Simplified: only two icon states (muted vs active) to avoid threshold jumps
  const Icon = vol === 0 ? VolumeX : Volume2;

  // Ephemeral value bubble while interacting
  const [showValue, setShowValue] = React.useState(false);
  const hideTimer = React.useRef<number | null>(null);

  const triggerShowValue = React.useCallback(() => {
    setShowValue(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => setShowValue(false), 900);
  }, []);

  React.useEffect(() => () => { if (hideTimer.current) window.clearTimeout(hideTimer.current); }, []);

  return (
    <div
      ref={containerRef}
      className="relative flex items-center"
      onWheel={onWheel}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      <button
        type="button"
        aria-label={vol === 0 ? 'Unmute' : 'Mute'}
        onClick={handleToggleMute}
        className={cn('h-7 w-7 flex items-center justify-center rounded-full text-muted-foreground/70 hover:text-foreground/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition bg-transparent hover:bg-muted/40')}
      >
        <Icon className="h-3.5 w-3.5" />
      </button>
      {open && (
        <div className={cn('absolute bottom-7 left-1/2 -translate-x-1/2 z-50 animate-in fade-in zoom-in-95')}>
          <div
            onKeyDown={onKeyDown}
            tabIndex={0}
            aria-label="Volume control" role="group"
            className={cn('outline-none px-2.5 pt-2.5 pb-2 rounded-2xl shadow-lg border border-border/40 backdrop-blur-md bg-background/90 dark:bg-background/80 relative overflow-hidden')}
            style={{ minWidth: '3rem', maxHeight: '28rem' }}
          >
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/40 via-transparent to-white/10 dark:from-white/10" />
            <div className="relative flex flex-col items-center mt-3 gap-1.5">
              <div className="relative h-28  px-1 mb-2 flex items-stretch">
                {(() => {
                  const rangeBase = vol === 0 ? 'bg-transparent' : accentGradient
                    ? `bg-gradient-to-b ${accentGradient}`
                    : 'bg-gradient-to-b from-foreground to-foreground/80';
                  return (
                    <Slider
                      orientation="vertical"
                      value={[vol * 100]}
                      min={0}
                      max={100}
                      step={1}
                      onValueChange={([value]) => { setVolume(value / 100); triggerShowValue(); }}
                      className="h-full"
                      aria-label="Volume"
                      onPointerDown={() => triggerShowValue()}
                      onPointerMove={(e) => e.buttons === 1 && triggerShowValue()}
                      thumbClassName={cn('border-foreground/40 bg-background/95 shadow-sm data-[state=active]:shadow-lg transition-all data-[state=active]:scale-110 h-4 w-4 backdrop-blur-sm')}
                      trackClassName="relative w-1.5 h-full my-0 bg-gradient-to-b from-muted/50 via-muted/30 to-muted/40 border border-border/40 rounded-full shadow-inner"
                      rangeClassName={rangeBase}
                    />
                  );
                })()}
                {showValue && <VolumeBubble volume={vol} />}
              </div>
              <div className="flex items-center gap-1 mt-0.5 text-[8px] text-muted-foreground/70 uppercase tracking-[0.15em]">VOL</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const VolumeBubble: React.FC<{ volume: number }> = ({ volume }) => {
  const pct = Math.min(100, Math.max(0, volume * 100));
  const clamped = pct > 98 ? 98 : pct < 2 ? 2 : pct; // keep inside panel
  return (
    <div
      className="pointer-events-none absolute left-1/2 -translate-x-1/2 select-none px-2 py-0.5 rounded-full bg-foreground text-background text-[10px] font-semibold shadow shadow-black/30 animate-in fade-in zoom-in-95"
      style={{ bottom: `calc(${clamped}% - 6px)` }}
    >
      {Math.round(pct)}%
      <span className="absolute left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-foreground -bottom-1 rounded-[2px]" />
    </div>
  );
};

export default VolumeControl;
