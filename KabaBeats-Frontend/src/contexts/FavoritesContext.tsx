import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';
import { FavoritesContextType } from '../interface-types/favorites';

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
};

interface FavoritesProviderProps {
  children: ReactNode;
}

export const FavoritesProvider: React.FC<FavoritesProviderProps> = ({ children }) => {
  const [likedBeats, setLikedBeats] = useState<Set<string>>(new Set());
  const { toast } = useToast();

  const toggleLike = (beatId: string, beatTitle?: string) => {
    setLikedBeats(prev => {
      const newLikedBeats = new Set(prev);
      const isCurrentlyLiked = newLikedBeats.has(beatId);
      
      if (isCurrentlyLiked) {
        newLikedBeats.delete(beatId);
        toast({
          title: "Removed from favorites",
          description: beatTitle ? `"${beatTitle}" has been removed from your favorites.` : "Beat removed from favorites.",
        });
      } else {
        newLikedBeats.add(beatId);
        toast({
          title: "Added to favorites",
          description: beatTitle ? `"${beatTitle}" has been added to your favorites.` : "Beat added to favorites.",
        });
      }
      
      return newLikedBeats;
    });
  };

  const isLiked = (beatId: string) => {
    return likedBeats.has(beatId);
  };

  return (
    <FavoritesContext.Provider value={{ likedBeats, toggleLike, isLiked }}>
      {children}
    </FavoritesContext.Provider>
  );
};
