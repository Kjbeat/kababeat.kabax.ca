import { useState } from "react";
import { useParams } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ProfileHeader,
  ProfileSocials,
  ProfileStats,
  BeatDisplay
} from "./profile";
import { 
  User, 
  Users, 
  Music, 
  TrendingUp, 
  Globe, 
  Instagram, 
  Twitter,
  Check,
  Plus
} from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

// Mock data
const producer = {
  name: "BeatMaker Pro",
  handle: "@beatmakerpro",
  avatar: "",
  coverImage: "",
  bio: "Professional beat producer with over 5 years experience. Specialized in Trap, Hip Hop, and R&B productions. Featured on major streaming platforms.",
  location: "Atlanta, GA",
  joinDate: "2019-03-15",
  followers: 12543,
  following: 1845,
  totalBeats: 187,
  totalSales: 2543,
  verified: true,
  isFollowing: false,
  socials: {
    website: "https://beatmakerpro.com",
    instagram: "@beatmakerpro",
    twitter: "@beatmakerpro"
  },
  stats: {
    totalPlays: 1250000,
    monthlyListeners: 45000,
    avgRating: 4.8
  }
};

const allBeats = [
  { id: "1", title: "Midnight Vibes", producer: "BeatMaker Pro", artwork: "", bpm: 140, key: "C Minor", genre: "Trap", price: 29.99, isLiked: false },
  { id: "2", title: "Summer Dreams", producer: "BeatMaker Pro", artwork: "", bpm: 85, key: "G Major", genre: "LoFi", price: 19.99, isLiked: true },
  { id: "3", title: "Electric Pulse", producer: "BeatMaker Pro", artwork: "", bpm: 128, key: "D Minor", genre: "EDM", price: 34.99, isLiked: false },
  { id: "4", title: "Urban Stories", producer: "BeatMaker Pro", artwork: "", bpm: 95, key: "F# Minor", genre: "Hip Hop", price: 24.99, isLiked: false },
  { id: "5", title: "Cosmic Journey", producer: "BeatMaker Pro", artwork: "", bpm: 110, key: "A Major", genre: "Ambient", price: 39.99, isLiked: true },
  { id: "6", title: "Neon Nights", producer: "BeatMaker Pro", artwork: "", bpm: 125, key: "E Minor", genre: "Synthwave", price: 27.99, isLiked: false },
];

const topSellers = allBeats.slice(0, 3);
const newReleases = allBeats.slice(-3);

export default function CreatorProfile() {
  const { username } = useParams();
  const [followersCount, setFollowersCount] = useState(producer.followers);
  const { t } = useLanguage();

  const handleFollowToggle = (isFollowing: boolean) => {
    setFollowersCount(isFollowing ? producer.followers + 1 : producer.followers - 1);
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-6 mt-6 md:mt-10">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <ProfileHeader 
            producer={{
              ...producer,
              stats: {
                totalBeats: producer.totalBeats,
                followers: followersCount,
                following: producer.following
              }
            }} 
            onFollowToggle={handleFollowToggle} 
          />
          
          <div className="flex flex-col md:flex-row items-center md:justify-end gap-4 md:gap-6 mt-2 mb-6 w-full">
            <ProfileSocials socials={producer.socials} />
          </div>
        </div>

        {/* Content Tabs */}
        <Tabs defaultValue="latest" className="w-full">
          <TabsList className="bg-transparent border-b border-border rounded-none w-full justify-start p-0 h-12 overflow-x-auto">
            <TabsTrigger 
              value="latest" 
              className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-6 font-medium"
            >
              {t('creator.latest')}
            </TabsTrigger>
            <TabsTrigger 
              value="popular" 
              className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-6 font-medium"
            >
              {t('creator.popular')}
            </TabsTrigger>
            {/* <TabsTrigger 
              value="playlists" 
              className="bg-transparent border-0 border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-6 font-medium"
            >
              {t('creator.playlists')}
            </TabsTrigger> */}
          </TabsList>

          <TabsContent value="latest" className="mt-8">
            <BeatDisplay 
              beats={allBeats.slice(-6).map(beat => ({
                ...beat,
                key: beat.key
              }))} 
            />
          </TabsContent>

          <TabsContent value="popular" className="mt-8">
            <BeatDisplay 
              beats={topSellers.map(beat => ({
                ...beat,
                key: beat.key
              }))} 
            />
          </TabsContent>

          <TabsContent value="playlists" className="mt-8">
            <BeatDisplay 
              beats={[]} 
              emptyMessage={t('creator.noPlaylistsYet')} 
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}