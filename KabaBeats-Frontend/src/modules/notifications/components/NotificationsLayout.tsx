import { useNotifications } from '@/contexts/useNotifications';
import { PageHeader } from '@/components/shared';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bell, DollarSign, UserPlus, MessageCircle, Heart, CheckCircle2, Trash2 } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

const TYPE_META: Record<string, { icon: JSX.Element; color: string; accent: string; label: string }> = {
  sale:    { icon: <DollarSign className="h-3.5 w-3.5" />,    color: 'bg-emerald-500', accent: 'bg-emerald-500/10 text-emerald-500', label: 'Sale' },
  follower:{ icon: <UserPlus className="h-3.5 w-3.5" />,    color: 'bg-blue-500',    accent: 'bg-blue-500/10 text-blue-500',       label: 'Follower' },
  comment: { icon: <MessageCircle className="h-3.5 w-3.5" />, color: 'bg-violet-500',  accent: 'bg-violet-500/10 text-violet-500',   label: 'Comment' },
  like:    { icon: <Heart className="h-3.5 w-3.5" />,        color: 'bg-pink-500',    accent: 'bg-pink-500/10 text-pink-500',       label: 'Like' },
  default: { icon: <Bell className="h-3.5 w-3.5" />,         color: 'bg-primary',     accent: 'bg-primary/10 text-primary',         label: 'General' },
};

function getMeta(type: string) {
  return TYPE_META[type] || TYPE_META.default;
}

export function NotificationsLayout() {
  const { notifications, unreadCount, markAllAsRead, markAsRead, clearNotifications } = useNotifications();
  const { t } = useLanguage();

  return (
    <div className="container mx-auto p-6 mt-14 sm:mt-16">
      <PageHeader
        title={t('notifications.title')}
        description={t('notifications.description')}
      />

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between mb-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <span className={cn('inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium border', unreadCount ? 'border-primary/30 text-primary' : 'border-muted-foreground/20')}>
            <Bell className="h-3 w-3" /> {unreadCount
              ? t('notifications.unreadCount').replace('{count}', unreadCount.toString())
              : t('notifications.allCaughtUp')}
          </span>
        </div>
        <div className="flex gap-2">
          {unreadCount > 0 && (
            <Button size="sm" variant="outline" onClick={markAllAsRead} className="gap-1">
              <CheckCircle2 className="h-4 w-4" />
              <span className="hidden xs:inline">{t('notifications.markAll')}</span>
            </Button>
          )}
          {notifications.length > 0 && (
            <Button size="sm" variant="ghost" onClick={clearNotifications} className="gap-1 text-destructive hover:text-destructive focus-visible:ring-destructive">
              <Trash2 className="h-4 w-4" />
              <span className="hidden xs:inline">{t('notifications.clear')}</span>
            </Button>
          )}
        </div>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-0">
          <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
            <span className="uppercase tracking-wide">{t('notifications.activityFeed')}</span>
          </div>
        </CardHeader>
        <CardContent className="p-0 mt-2">
          {notifications.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              {t('notifications.noNotificationsYet')}
            </div>
          ) : (
            <ScrollArea className="h-[65vh]">
              <ul className="flex flex-col">
                {notifications.map(n => {
                  const meta = getMeta(n.type);
                  const time = n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => markAsRead(n.id)}
                        className={cn(
                          'group w-full text-left px-4 py-3 flex gap-3 items-start transition-colors',
                          'hover:bg-muted/50 dark:hover:bg-muted/30 focus:bg-muted/50 dark:focus:bg-muted/30',
                          'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring'
                        )}
                      >
                        {/* Icon Circle */}
                        <span className={cn('mt-0.5 flex h-8 w-8 items-center justify-center rounded-full flex-shrink-0 border border-border/50 shadow-sm', meta.accent)}>
                          {meta.icon}
                        </span>
                        <span className="flex-1 min-w-0">
                          <span className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-medium truncate max-w-[170px] md:max-w-[340px]">{n.title}</span>
                            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-medium', meta.accent)}>{meta.label}</span>
                            {!n.read && <span className="inline-block w-2 h-2 rounded-full bg-primary" />}
                          </span>
                          <span className="block text-[11px] leading-snug text-muted-foreground/90 line-clamp-2">{n.message}</span>
                          <span className="mt-1 inline-flex items-center gap-1 text-[10px] text-muted-foreground/70">
                            <span>{time}</span>
                          </span>
                        </span>
                      </button>
                    </li>
                  );
                })}
              </ul>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
