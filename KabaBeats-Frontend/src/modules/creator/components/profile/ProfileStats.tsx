import React from "react";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ProfileStatsData {
  totalBeats: number;
  followers: number;
  following: number;
}

interface ProfileStatsProps {
  stats: ProfileStatsData;
  variant?: 'inline' | 'stacked';
  className?: string;
  loading?: boolean;
  emphasisFollowers?: boolean; // highlight followers first (some UIs do this)
  compactMobile?: boolean; // render an ultra-compact line on xs screens
}

// number -> 12.5K etc
const fmt = (n: number) => {
  if (n >= 1_000_000_000) return trim((n/1_000_000_000).toFixed(1))+"B";
  if (n >= 1_000_000) return trim((n/1_000_000).toFixed(1))+"M";
  if (n >= 1_000) return trim((n/1_000).toFixed(1))+"K";
  return String(n);
};
const trim = (v: string) => v.replace(/\.0$/, "");

const InlineItem = ({value,label}:{value:number,label:string}) => {
  const isLink = label === 'followers' || label === 'following';
  const base = (
    <span className="flex items-baseline gap-1 text-sm md:text-[0.95rem] font-medium leading-none" aria-label={`${value} ${label}`}>
      <span className="font-semibold tabular-nums text-foreground">{fmt(value)}</span>
      <span className="text-muted-foreground lowercase tracking-tight hidden xs:inline">{label}</span>
    </span>
  );
  if (!isLink) return base;
  const tab = label === 'followers' ? 'followers' : 'following';
  return (
    <a
      href={`/connections?tab=${tab}`}
      onClick={(e)=>{ e.stopPropagation(); }}
      className="group transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
    >
      {base}
    </a>
  );
};

export function ProfileStats({ stats, variant='inline', className='', loading, emphasisFollowers, compactMobile }: ProfileStatsProps) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <div className={`flex gap-6 ${className}`}>
        {Array.from({length:3}).map((_,i)=>(
          <div key={i} className="h-4 w-16 rounded bg-muted animate-pulse" />
        ))}
      </div>
    );
  }

  const order = emphasisFollowers
    ? [
        { value: stats.followers, label: 'followers' },
        { value: stats.totalBeats, label: 'tracks' },
        { value: stats.following, label: 'following' }
      ]
    : [
        { value: stats.totalBeats, label: 'tracks' },
        { value: stats.followers, label: 'followers' },
        { value: stats.following, label: 'following' }
      ];

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col gap-3 ${className}`}>
        {order.map(i => (
          <div key={i.label} className="flex items-center justify-between gap-6 text-sm">
            <span className="text-muted-foreground uppercase tracking-wide text-[11px]">{i.label}</span>
            <span className="font-semibold tabular-nums text-foreground">{fmt(i.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  // Inline layout (default). If compactMobile true, show a single-line condensed version below sm.
  if (compactMobile) {
    return (
      <>
        <div className={`hidden sm:flex flex-wrap gap-6 md:gap-8 ${className}`}>
          {order.map(i => (
            <InlineItem key={i.label} value={i.value} label={i.label} />
          ))}
        </div>
        <div className={`sm:hidden flex gap-4 ${className}`} aria-label="profile statistics compact">
          {order.map((i, idx) => {
            const isLink = i.label === 'followers' || i.label === 'following';
            const content = (
              <span className="flex items-center gap-1 text-[11px] font-medium leading-none" aria-label={`${i.label} ${fmt(i.value)}`}>
                <span className="tabular-nums font-semibold">{fmt(i.value)}</span>
                <span className="text-muted-foreground">{abbr(i.label)}</span>
                {idx < order.length - 1 && <span className="text-muted-foreground/50" aria-hidden>•</span>}
              </span>
            );
            if (!isLink) return <span key={i.label}>{content}</span>;
            const tab = i.label === 'followers' ? 'followers' : 'following';
            return (
              <a
                key={i.label}
                href={`/connections?tab=${tab}`}
                onClick={(e)=>{ e.stopPropagation(); }}
                className="hover:text-primary transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded"
              >
                {content}
              </a>
            );
          })}
        </div>
      </>
    );
  }

  return (
    <div className={`flex flex-wrap gap-5 md:gap-8 ${className}`}>
      {order.map(i => (
        <InlineItem key={i.label} value={i.value} label={i.label} />
      ))}
    </div>
  );
}

// Abbreviations for ultra compact mobile view
const abbr = (label: string) => {
  switch(label) {
    case 'followers': return 'fol';
    case 'following': return 'ing';
    case 'tracks': return 'trk';
    default: return label.slice(0,3);
  }
};
