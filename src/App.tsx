import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useParams, useNavigate } from "react-router-dom";
import { ThemeProvider } from "@/components/ThemeProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { CartProvider } from "@/contexts/CartContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { MediaPlayerProvider } from "@/contexts/MediaPlayerContext";
import { FavoritesProvider } from "@/contexts/FavoritesContext";
import { PlaylistsProvider } from "@/contexts/PlaylistsContext";
import { NotificationsProvider } from "@/contexts/NotificationsContext";
import { Layout } from "@/components/Layout";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SidebarProvider } from "@/components/ui/sidebar";
// Module imports
import { LandingLayout } from "@/modules/landing";
import { LoginForm, SignupForm } from "@/modules/auth";
import { BrowseLayout } from "@/modules/browse";
import { UploadBeatLayout } from "../external-features/Upload/src/modules/upload";
import { LibraryLayout } from "@/modules/library";
import { CheckoutLayout } from "@/modules/checkout";
import { DashboardSettingsLayout } from "@/modules/dashboard";
import { FavoritesLayout } from "@/modules/favorites";
import { PlaylistsLayout } from "../external-features/Playlist/src/modules";
import { MyBeatsLayout } from "../external-features/MyBeats/src/modules/my-beats";
import { Explore } from "@/modules/explore";
import { NotificationsLayout } from "@/modules/notifications";
import { BillingSettings } from "@/modules/dashboard";
import SubscriptionSettings from "@/modules/dashboard/components/Settings/SubscriptionSettings";
import PayoutSettings from "@/modules/dashboard/components/Settings/PayoutSettings";

// Pages that still need migration
import { BeatDetailLayout } from "@/modules/beat";
import { CreatorProfileLayout } from "@/modules/creator";
import { ConnectionsPage } from "@/modules/connections";
import { PlaylistDetailLayout } from "../external-features/Playlist/src/modules";
import { PaymentSuccess } from "@/modules/checkout";
import { CustomThemeLayout } from "@/modules/theme";
import { NotFound } from "@/modules/errors";
import { DashboardHome, DashboardAnalytics, DashboardTracks, DashboardLicenses, DashboardSales } from "@/modules/dashboard";

const queryClient = new QueryClient();

function PlaylistDetailLayoutWrapper() {
  const { id } = useParams();
  const navigate = useNavigate();
  return (
    <PlaylistDetailLayout
      playlistId={id || ""}
      onBack={() => navigate("/playlists")}
    />
  );
}

function PlaylistsLayoutWithNavigation() {
  const navigate = useNavigate();
  return <PlaylistsLayout onPlaylistClick={(id) => navigate(`/playlist/${id}`)} />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="beathaus-ui-theme">
      <LanguageProvider>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <PlaylistsProvider>
                <MediaPlayerProvider>
                  <NotificationsProvider>
                  <QueryClientProvider client={queryClient}>
                  <BrowserRouter>
                    <Routes>
                      {/* Auth routes without layout */}
                      <Route path="/landing" element={<LandingLayout />} />
                      <Route path="/login" element={<LoginForm />} />
                      <Route path="/signup" element={<SignupForm />} />
                       <Route path="/" element={<LandingLayout />} />

                      {/* App routes with auth-aware routing - wrapped in SidebarProvider */}
                      <Route path="/explore" element={<SidebarProvider defaultOpen={true}><Layout><Explore /></Layout></SidebarProvider>} />
                      <Route path="/browse" element={<SidebarProvider defaultOpen={true}><Layout><BrowseLayout /></Layout></SidebarProvider>} />
                      <Route path="/beat/:id" element={<SidebarProvider defaultOpen={true}><Layout><BeatDetailLayout /></Layout></SidebarProvider>} />
                      <Route path="/playlists" element={<SidebarProvider defaultOpen={true}><Layout><PlaylistsLayoutWithNavigation /></Layout></SidebarProvider>} />
                      <Route path="/playlist/:id" element={<SidebarProvider defaultOpen={true}><Layout><PlaylistDetailLayoutWrapper /></Layout></SidebarProvider>} />
                      <Route path="/creator/:username" element={<SidebarProvider defaultOpen={true}><Layout><CreatorProfileLayout /></Layout></SidebarProvider>} />
                      <Route path="/connections" element={<SidebarProvider defaultOpen={true}><Layout><ConnectionsPage /></Layout></SidebarProvider>} />
                      <Route path="/upload" element={<SidebarProvider defaultOpen={true}><Layout><UploadBeatLayout /></Layout></SidebarProvider>} />
                      <Route path="/my-beats" element={<SidebarProvider defaultOpen={true}><Layout><MyBeatsLayout /></Layout></SidebarProvider>} />
                      <Route path="/library" element={<SidebarProvider defaultOpen={true}><Layout><LibraryLayout /></Layout></SidebarProvider>} />
                      <Route path="/favorites" element={<SidebarProvider defaultOpen={true}><Layout><FavoritesLayout /></Layout></SidebarProvider>} />
                      <Route path="/checkout" element={<SidebarProvider defaultOpen={true}><Layout><CheckoutLayout /></Layout></SidebarProvider>} />
                      <Route path="/payment-success" element={<SidebarProvider defaultOpen={true}><Layout><PaymentSuccess /></Layout></SidebarProvider>} />
                      <Route path="/custom-theme" element={<SidebarProvider defaultOpen={true}><Layout><CustomThemeLayout /></Layout></SidebarProvider>} />
                      
                      {/* Dashboard routes with dashboard layout - no SidebarProvider */}
                      <Route path="/dashboard" element={<DashboardLayout />}>
                        <Route index element={<DashboardHome />} />
                        <Route path="analytics" element={<DashboardAnalytics />} />
                        <Route path="tracks" element={<DashboardTracks />} />
                        <Route path="licenses" element={<DashboardLicenses />} />
                        <Route path="sales" element={<DashboardSales />} />
                        <Route path="theme" element={<CustomThemeLayout />} />
                        <Route path="settings" element={<DashboardSettingsLayout />} />
                        <Route path="payouts" element={<PayoutSettings />} />
                        <Route path="billing" element={<BillingSettings />} />
                        <Route path="subscription" element={<SubscriptionSettings />} />
                      </Route>
                      
                      <Route path="*" element={<SidebarProvider defaultOpen={true}><Layout><NotFound /></Layout></SidebarProvider>} />
                      <Route path="/notifications" element={<SidebarProvider defaultOpen={true}><Layout><NotificationsLayout /></Layout></SidebarProvider>} />
                    </Routes>
                    <Toaster />
                    <Sonner />
                  </BrowserRouter>
                </QueryClientProvider>
              </NotificationsProvider>
              </MediaPlayerProvider>
            </PlaylistsProvider>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
