import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Check, UserMinus, UserPlus } from "lucide-react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export interface ConnectionUser {
  id: string;
  name: string;
  handle: string;
  avatar?: string;
  isFollowing?: boolean; // whether current user follows them
  followsYou?: boolean; // whether they follow current user
  verified?: boolean;
  beats?: number;
}

interface ConnectionItemProps {
  user: ConnectionUser;
  mode: 'following' | 'followers';
  onToggleFollow?: (id: string, newState: boolean) => void;
}

export function ConnectionItem({ user, mode, onToggleFollow }: ConnectionItemProps) {
  const { t } = useLanguage();
  
  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onToggleFollow) onToggleFollow(user.id, !user.isFollowing);
  };

  return (
    <Link
      to={`/creator/${user.handle.replace('@','')}`}
      className="group flex items-center gap-4 rounded-xl border border-border/60 bg-card/60 hover:bg-card/80 transition-colors p-4 focus:outline-none focus:ring-2 focus:ring-ring/50"
    >
      <Avatar className="h-12 w-12">
        <AvatarImage src={user.avatar} alt={user.name} />
        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{user.name}</span>
          {user.verified && <Check className="h-3.5 w-3.5 text-primary" />}
          {user.followsYou && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/5 text-primary uppercase tracking-wide">{t('connections.followsYou')}</span>}
        </div>
        <div className="text-xs text-muted-foreground truncate">{user.handle} {user.beats ? `• ${user.beats} ${t('connections.tracks')}` : ''}</div>
      </div>
      {mode === 'following' && user.isFollowing && (
        <Button
          onClick={handleClick}
          size="sm"
          variant='secondary'
          className="rounded-full px-4"
        >
          <UserMinus className="h-4 w-4 mr-1" /> {t('connections.unfollow')}
        </Button>
      )}
      {mode === 'followers' && !user.isFollowing && (
        <Button
          onClick={handleClick}
          size="sm"
          variant={'outline'}
          className="rounded-full px-4"
        >
          <UserPlus className="h-4 w-4 mr-1" /> {t('connections.followBack')}
        </Button>
      )}
    </Link>
  );
}
