import { useState, useMemo, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ConnectionItem, ConnectionUser } from './ConnectionItem';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useLanguage } from '@/contexts/LanguageContext';

interface ConnectionsTabsProps {
  following: ConnectionUser[];
  followers: ConnectionUser[];
  onToggleFollow: (id: string, newState: boolean) => void;
  defaultTab?: 'following' | 'followers';
}

export function ConnectionsTabs({ following, followers, onToggleFollow, defaultTab = 'following' }: ConnectionsTabsProps) {
  const [query, setQuery] = useState('');
  const { t } = useLanguage();

  const filter = useCallback((list: ConnectionUser[]) => {
    const q = query.trim().toLowerCase();
    if (!q) return list;
    return list.filter(u => u.name.toLowerCase().includes(q) || u.handle.toLowerCase().includes(q));
  }, [query]);

  const filteredFollowing = useMemo(() => filter(following.filter(u=>u.isFollowing)), [following, filter]);
  const filteredFollowers = useMemo(() => filter(followers), [followers, filter]);
  const followingCount = useMemo(() => following.reduce((acc,u)=>u.isFollowing?acc+1:acc,0), [following]);

  return (
    <Tabs defaultValue={defaultTab} className="w-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
        <TabsList className="bg-transparent border-b border-border rounded-none w-full md:w-auto justify-start md:justify-start p-0 h-12 overflow-x-auto">
          <TabsTrigger value="following" className="px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            {t('connections.following')} ({followingCount})
          </TabsTrigger>
          <TabsTrigger value="followers" className="px-6 rounded-none data-[state=active]:border-b-2 data-[state=active]:border-primary">
            {t('connections.followers')} ({followers.length})
          </TabsTrigger>
        </TabsList>
        <div className="w-full md:w-64">
          <Input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder={t('connections.searchConnections')}
            className="h-10"
          />
        </div>
      </div>

      <TabsContent value="following" className="focus-visible:outline-none mt-2">
        {filteredFollowing.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">{t('connections.notFollowingYet')}</div>
        ) : (
          <ScrollArea className="h-[calc(100vh-320px)] pr-2">
            <div className="space-y-3">
              {filteredFollowing.map(user => (
                <ConnectionItem key={user.id} user={user} mode="following" onToggleFollow={onToggleFollow} />
              ))}
            </div>
          </ScrollArea>
        )}
      </TabsContent>

      <TabsContent value="followers" className="focus-visible:outline-none mt-2">
        {filteredFollowers.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">{t('connections.noFollowersYet')}</div>
        ) : (
          <ScrollArea className="h-[calc(100vh-320px)] pr-2">
            <div className="space-y-3">
              {filteredFollowers.map(user => (
                <ConnectionItem key={user.id} user={user} mode="followers" onToggleFollow={onToggleFollow} />
              ))}
            </div>
          </ScrollArea>
        )}
      </TabsContent>
    </Tabs>
  );
}
