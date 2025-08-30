import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { AuthProvider } from "./providers/AuthProvider";
import { ServicesProvider } from "./providers/ServicesProvider";
import { MediaPlayerProvider } from "@/contexts/MediaPlayerContext";
import { CartProvider } from "@/contexts/CartContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { PlaylistsProvider } from "@/contexts/PlaylistsContext";
import { MyBeatsLayout } from "@/modules/my-beats";

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
                      <MyBeatsLayout />
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
