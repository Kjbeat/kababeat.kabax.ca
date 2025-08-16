import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ConnectionsTabs } from './components/ConnectionsTabs';
import { ConnectionUser } from './components/ConnectionItem';
import { PageHeader } from '@/components/shared/PageHeader';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// Simple random data generator for mock users
function randomUser(idx: number): ConnectionUser {
  const adjectives = ['Sonic', 'Velvet', 'Neon', 'Golden', 'Midnight', 'Crimson', 'Lush', 'Solar', 'Echo', 'Liquid'];
  const nouns = ['Waves', 'Beats', 'Rhythm', 'Groove', 'Pulse', 'Vibes', 'Loops', 'Keys', 'Bass', 'Fuse'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  const handle = (adj + noun + idx).toLowerCase();
  return {
    id: `${handle}-${idx}-${Math.random().toString(36).slice(2,8)}`,
    name: `${adj} ${noun}`,
    handle: `@${handle}`,
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${handle}`,
    isFollowing: Math.random() > 0.5,
    followsYou: Math.random() > 0.6,
    beats: Math.floor(Math.random() * 120) + 1,
  };
}

export function ConnectionsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') === 'followers' ? 'followers' : 'following') as 'following' | 'followers';
  const [following, setFollowing] = useState<ConnectionUser[]>(() => Array.from({ length: 24 }, (_, i) => ({ ...randomUser(i), isFollowing: true })));
  const [followers, setFollowers] = useState<ConnectionUser[]>(() => Array.from({ length: 18 }, (_, i) => randomUser(i + 50)));
  const [refreshKey, setRefreshKey] = useState(0);
  const { t } = useLanguage();

  // Keep URL in sync when user switches via internal state (Tabs uses defaultValue and doesn't control value)
  // We'll wrap Tabs later if we need controlled behavior; for now we observe changes by intercepting click via delegation is overkill.
  // Instead, we expose a small effect: when refreshKey changes due to user regeneration, we keep current tab param.
  useEffect(() => {
    if (!searchParams.get('tab')) {
      searchParams.set('tab', initialTab);
      setSearchParams(searchParams, { replace: true });
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleToggleFollow = (id: string, newState: boolean) => {
    setFollowing(prev => prev.map(u => (u.id === id ? { ...u, isFollowing: newState } : u)));
    setFollowers(prev => prev.map(u => (u.id === id ? { ...u, isFollowing: newState } : u)));
  };

  const regenerate = () => {
  setFollowing(Array.from({ length: 24 }, (_, i) => ({ ...randomUser(i + Math.random() * 1000), isFollowing: true })));
    setFollowers(Array.from({ length: 18 }, (_, i) => randomUser(i + 500 + Math.random() * 1000)));
    setRefreshKey(k => k + 1);
  };

  const defaultTab = useMemo(() => initialTab, [initialTab]);

  return (
    <div className="space-y-6 mt-14">
      <div className="flex items-start justify-between flex-col md:flex-row gap-4 md:gap-8">
        <PageHeader
          title={t('connections.title')}
          description={t('connections.description')}
        />
        <Button variant="outline" size="sm" onClick={regenerate} className="gap-2 self-end md:self-start -mt-6 md:mt-0">
          <RefreshCcw className="w-4 h-4" /> {t('connections.refresh')}
        </Button>
      </div>
      <Separator />
      <div className="mt-2">
        <ConnectionsTabs
          following={following}
          followers={followers}
          onToggleFollow={handleToggleFollow}
          defaultTab={defaultTab}
        />
      </div>
    </div>
  );
}

export default ConnectionsPage;
