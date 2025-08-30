import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ServicesProvider } from "./providers/ServicesProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MediaPlayerProvider } from "@/contexts/MediaPlayerContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { PlaylistsProvider } from "@/contexts/PlaylistsContext";
import { DevUserSwitcher } from "@/components/DevUserSwitcher";
import { PlaylistsLayout, PlaylistDetailLayout } from "@/modules";
import { useState } from "react";

function App() {
  const [currentView, setCurrentView] = useState<'list' | 'detail'>('list');
  const [selectedPlaylistId, setSelectedPlaylistId] = useState<string | null>(null);

  const handlePlaylistClick = (playlistId: string) => {
    setSelectedPlaylistId(playlistId);
    setCurrentView('detail');
  };

  const handleBackToList = () => {
    setCurrentView('list');
    setSelectedPlaylistId(null);
  };

  return (
    <ThemeProvider defaultTheme="dark" storageKey="beathaus-ui-theme">
      <LanguageProvider>
        <AuthProvider>
          <ServicesProvider>
            <MediaPlayerProvider>
              <CartProvider>
                <FavoritesProvider>
                  <PlaylistsProvider>
                    <div className="min-h-screen bg-background">
                      <div className="container mx-auto p-6">
                        <h1 className="text-3xl font-bold mb-6">Kababeat - Playlists Module</h1>
                        {currentView === 'list' ? (
                          <PlaylistsLayout onPlaylistClick={handlePlaylistClick} />
                        ) : (
                          <PlaylistDetailLayout 
                            playlistId={selectedPlaylistId!} 
                            onBack={handleBackToList}
                          />
                        )}
                      </div>
                      <DevUserSwitcher />
                    </div>
                  </PlaylistsProvider>
                </FavoritesProvider>
              </CartProvider>
            </MediaPlayerProvider>
          </ServicesProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
