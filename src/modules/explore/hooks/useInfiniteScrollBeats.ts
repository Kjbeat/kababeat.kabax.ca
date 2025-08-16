import { useState, useCallback } from "react";
import { generateBeats } from "../utils/mockData";

export const useInfiniteScrollBeats = () => {
  const [allBeats, setAllBeats] = useState(() => generateBeats(6, 20));
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  const loadMoreBeats = useCallback(async () => {
    if (isLoadingMore || !hasMore) return;
    
    setIsLoadingMore(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newBeats = generateBeats(allBeats.length, 20);
    setAllBeats(prev => [...prev, ...newBeats]);
    
    // Simulate end of data after 100 beats
    if (allBeats.length >= 80) {
      setHasMore(false);
    }
    
    setIsLoadingMore(false);
  }, [allBeats.length, isLoadingMore, hasMore]);

  return {
    allBeats,
    isLoadingMore,
    hasMore,
    loadMoreBeats
  };
};
