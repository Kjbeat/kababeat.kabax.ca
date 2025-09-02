export interface BeatCardProps {
  id: string;
  title: string;
  producer: string;
  artwork?: string;
  bpm: number;
  musicalKey: string;
  genre: string;
  price: number;
  /** Hide pricing / add-to-cart UI (e.g., in library after purchase) */
  hidePrice?: boolean;
  /** Flag for premium / exclusive beats */
  exclusive?: boolean;
  /** Whether this beat is already in the user's cart */
  inCart?: boolean;
  /** Optional sale price to show discount */
  salePrice?: number;
  /** Whether free download is allowed */
  allowFreeDownload?: boolean;
  /** HLS streaming URL */
  hlsUrl?: string;
  /** Whether HLS is processed and available */
  hlsProcessed?: boolean;
  /** Beat owner ID for fetching license settings */
  ownerId?: string;
  onPlay?: () => void;
  onLike?: () => void;
  onAddToCart?: () => void;
  onDownload?: (licenseType: string) => void;
}
