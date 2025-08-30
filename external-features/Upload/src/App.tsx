import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "./providers/AuthProvider";
import { ServicesProvider } from "./providers/ServicesProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { MediaPlayerProvider } from "@/contexts/MediaPlayerContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { PlaylistsProvider } from "@/contexts/PlaylistsContext";
import { DevUserSwitcher } from "@/components/DevUserSwitcher";
import { UploadBeatLayout } from "@/modules/upload";

function App() {
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
                        <h1 className="text-3xl font-bold mb-6">Kababeat - Upload Module</h1>
                        <UploadBeatLayout />
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
