import React, { createContext, useContext, ReactNode } from 'react';
import { useAuth } from './AuthProvider';
import { createMongoServices } from '../adapters/mongo';
import { createSupabaseServices } from '../adapters/supabase';
import { 
  BeatService, 
  PlaylistService, 
  CartService, 
  OrderService, 
  UploadDraftService, 
  SearchService, 
  UserService, 
  StorageService 
} from '../core/services';

interface ServicesContextType {
  beatService: BeatService;
  playlistService: PlaylistService;
  cartService: CartService;
  orderService: OrderService;
  uploadDraftService: UploadDraftService;
  searchService: SearchService;
  userService: UserService;
  storageService: StorageService;
}

const ServicesContext = createContext<ServicesContextType | undefined>(undefined);

interface ServicesProviderProps {
  children: ReactNode;
}

export function ServicesProvider({ children }: ServicesProviderProps) {
  const { user } = useAuth();
  
  const implMode = import.meta.env.VITE_IMPL || 'mongo';
  
  let services: ServicesContextType;
  
  if (implMode === 'mongo') {
    services = createMongoServices({ user });
  } else if (implMode === 'supabase') {
    services = createSupabaseServices({ user });
  } else {
    throw new Error(`Unknown implementation mode: ${implMode}`);
  }

  return (
    <ServicesContext.Provider value={services}>
      {children}
    </ServicesContext.Provider>
  );
}

export function useServices() {
  const context = useContext(ServicesContext);
  if (context === undefined) {
    throw new Error('useServices must be used within a ServicesProvider');
  }
  return context;
}

