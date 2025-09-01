import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProfileStats, ProfileStatsData } from "./ProfileStats";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User, Plus, Check, Loader2 } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface CreatorData {
  name: string;
  handle: string;
  avatar: string;
  bio: string;
  verified: boolean;
  isFollowing: boolean;
  followers: number;
}

interface ProfileHeaderProps {
  producer: CreatorData & { stats?: ProfileStatsData };
  onFollowToggle: (isFollowing: boolean) => void;
  showStatsInline?: boolean;
}

export function ProfileHeader({ producer, onFollowToggle, showStatsInline = true }: ProfileHeaderProps) {
  const [isFollowing, setIsFollowing] = useState(producer.isFollowing);
  const [followersCount, setFollowersCount] = useState(producer.followers);
  const [pending, setPending] = useState(false);
  const { t } = useLanguage();

  const handleFollow = async () => {
    if (pending) return;
    const targetState = !isFollowing;
    // Optimistic UI update
    setIsFollowing(targetState);
    setFollowersCount(prev => targetState ? prev + 1 : prev - 1);
    try {
      setPending(true);
  onFollowToggle(targetState);
    } catch (e) {
      // Revert on error
      setIsFollowing(!targetState);
      setFollowersCount(prev => targetState ? prev - 1 : prev + 1);
      // TODO: integrate toast error if available
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8 mb-8">
      {/* Avatar */}
      <Avatar className="w-24 h-24 md:w-32 md:h-32 bg-muted">
        <AvatarImage src={producer.avatar} alt={producer.name} />
        <AvatarFallback className="bg-muted text-foreground text-2xl md:text-3xl">
          <User className="h-12 w-12 md:h-16 md:w-16" />
        </AvatarFallback>
      </Avatar>

      {/* Profile Info */}
      <div className="flex-1 text-center md:text-left">
        <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              {producer.name}
            </h1>
            <div className="flex flex-col xs:flex-row items-stretch xs:items-center gap-3 mb-3 w-full">
              <Button
                onClick={handleFollow}
                variant={isFollowing ? "secondary" : "default"}
                aria-pressed={isFollowing}
                disabled={pending}
                className={
                  `relative w-full xs:w-auto px-6 h-11 rounded-full font-medium tracking-tight text-[0.95rem]
                   transition-all focus-visible:ring-2 focus-visible:ring-ring/60 focus-visible:outline-none
                   active:scale-[0.97] disabled:opacity-60 disabled:cursor-not-allowed`
                }
              >
                {pending && (
                  <Loader2 className="absolute left-4 h-4 w-4 animate-spin" />
                )}
                {!pending && (
                  <span className="absolute left-4 flex items-center justify-center">
                    {isFollowing ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
                  </span>
                )}
                <span className="pl-5 pr-1">
                  {isFollowing ? t('creator.following') : t('creator.follow')}
                </span>
              </Button>
            </div>

            {showStatsInline && (
              <div className="mb-4">
                <ProfileStats
                  stats={{
                    totalBeats: producer.stats?.totalBeats ?? 0,
                    followers: followersCount,
                    following: producer.stats?.following ?? 0
                  }}
                  emphasisFollowers
                  variant="inline"
                  compactMobile
                  className="text-sm"
                />
              </div>
            )}
          </div>
        </div>

        {/* Producer Badge */}
        <div className="mb-3">
          <Badge variant="secondary" className="tracking-wide text-[10px] font-medium px-3 py-1 rounded-full">
            {t('creator.producer')}
          </Badge>
        </div>

        {/* Bio */}
        <p className="text-muted-foreground max-w-3xl leading-relaxed text-sm md:text-base">
          {producer.bio}
        </p>
      </div>
    </div>
  );
}
