import { AuthUser } from '../../core/types';
import { 
  BeatService, 
  PlaylistService, 
  CartService, 
  OrderService, 
  UploadDraftService, 
  SearchService, 
  UserService, 
  StorageService 
} from '../../core/services';

export interface SupabaseContext {
  user: AuthUser | null;
}

// TODO: Implement these service adapters with Supabase
// For now, these are stubs that throw "Not implemented" errors

export function createSupabaseServices(context: SupabaseContext) {
  return {
    beatService: {} as BeatService, // TODO: Implement BeatService.supabase.ts
    playlistService: {} as PlaylistService, // TODO: Implement PlaylistService.supabase.ts
    cartService: {} as CartService, // TODO: Implement CartService.supabase.ts
    orderService: {} as OrderService, // TODO: Implement OrderService.supabase.ts
    uploadDraftService: {} as UploadDraftService, // TODO: Implement UploadDraftService.supabase.ts
    searchService: {} as SearchService, // TODO: Implement SearchService.supabase.ts
    userService: {} as UserService, // TODO: Implement UserService.supabase.ts
    storageService: {} as StorageService, // TODO: Implement StorageService.supabase.ts
  };
}
