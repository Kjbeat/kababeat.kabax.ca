/**
 * Utility functions for handling artwork URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api/v1';
const PUBLIC_R2_URL = 'https://pub-6f3847c4d3f4471284d44c6913bcf6f0.r2.dev';

/**
 * Construct full artwork URL from relative path
 * @param artwork - The artwork path (can be relative or full URL)
 * @returns Full artwork URL or placeholder
 */
export const getArtworkUrl = (artwork: string | undefined): string => {
  if (!artwork) return "/placeholder.svg";
  
  // If it's already a full URL, return as is
  if (artwork.startsWith('http://') || artwork.startsWith('https://')) {
    return artwork;
  }
  
  // For relative paths, combine with public R2 URL
  return `${PUBLIC_R2_URL}/${artwork}`;
};

/**
 * Fetch presigned artwork URL for a beat
 * @param beatId - The beat ID
 * @returns Promise with artwork URL or null
 */
export const fetchArtworkUrl = async (beatId: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/beats/${beatId}/artwork`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.data?.artworkUrl || null;
  } catch (error) {
    console.error('Error fetching artwork URL:', error);
    return null;
  }
};

/**
 * Fetch presigned audio URL for a beat
 * @param beatId - The beat ID
 * @returns Promise with audio URL or null
 */
export const fetchAudioUrl = async (beatId: string): Promise<string | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/beats/${beatId}/audio`);
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.data?.audioUrl || null;
  } catch (error) {
    console.error('Error fetching audio URL:', error);
    return null;
  }
};

/**
 * Get CDN base URL
 * @returns The CDN base URL
 */
export const getCdnBaseUrl = (): string => {
  return import.meta.env.VITE_CDN_BASE_URL || 'https://9d7f10e493d3ca887d3c03c0a59ffeee.r2.cloudflarestorage.com';
};
