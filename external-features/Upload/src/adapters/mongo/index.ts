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

export interface MongoContext {
  user: AuthUser | null;
}

// TODO: Implement these service adapters with mock data
// For now, these are stubs that throw "Not implemented" errors

export function createMongoServices(context: MongoContext) {
  return {
    beatService: {} as BeatService, // TODO: Implement BeatService.mongo.ts
    playlistService: {} as PlaylistService, // TODO: Implement PlaylistService.mongo.ts
    cartService: {} as CartService, // TODO: Implement CartService.mongo.ts
    orderService: {} as OrderService, // TODO: Implement OrderService.mongo.ts
    uploadDraftService: {} as UploadDraftService, // TODO: Implement UploadDraftService.mongo.ts
    searchService: {} as SearchService, // TODO: Implement SearchService.mongo.ts
    userService: {} as UserService, // TODO: Implement UserService.mongo.ts
    storageService: {} as StorageService, // TODO: Implement StorageService.mongo.ts
  };
}
