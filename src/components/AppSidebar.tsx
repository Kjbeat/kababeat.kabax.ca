/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-empty */
import { Home, Search, Music, User, Users, BarChart3, Upload, Library, Heart, ListMusic, Compass, Bell, LogOut } from "lucide-react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { useSidebar } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import { useNotifications } from "@/contexts/useNotifications";
import { Badge } from "@/components/ui/badge";
import { LanguageToggle } from "@/components/LanguageToggle";
import { useLanguage } from "@/contexts/LanguageContext";

const mainNavItems = [
  { title: "explore", url: "/explore", icon: Compass, notification: false },
  { title: "browse", url: "/browse", icon: Search, notification: false },
  { title: "library", url: "/library", icon: Library, notification: false },
  { title: "connections", url: "/connections", icon: Users, notification: false },
];

const collectionItems = [
  { title: "playlists", url: "/playlists", icon: ListMusic, notification: false },
  { title: "favorites", url: "/favorites", icon: Heart, notification: false },
];

const creatorItems = [
  { title: "dashboard", url: "/dashboard", icon: BarChart3, notification: false },
  { title: "upload", url: "/upload", icon: Upload, notification: false },
  { title: "myBeats", url: "/my-beats", icon: Music, notification: false },
];

export function AppSidebar() {
  const { state, open, toggleSidebar } = useSidebar();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const { unreadCount } = useNotifications();
  const { t } = useLanguage();
  
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      // Optional: call a global sign-out if your app registers one (e.g., Firebase/Supabase wrapper)
      if (typeof (window as any)?.authSignOut === "function") {
        await (window as any).authSignOut();
      }
    } finally {
      try {
        [
          "access_token",
          "refresh_token",
          "auth_token",
          "user",
          "kb_session",
        ].forEach((k) => localStorage.removeItem(k));
        sessionStorage.clear();
      } catch (e) {}
      navigate("/login", { replace: true });
    }
  };

  const isCollapsed = state === "collapsed" || !open;
  const currentPath = location.pathname;

  useEffect(() => {
    const handleScroll = (e: Event) => {
      const target = e.target as Element;
      setIsScrolled(target.scrollTop > 20);
    };

    const sidebarContent = document.querySelector(".sidebar-content");
    if (sidebarContent) {
      sidebarContent.addEventListener("scroll", handleScroll, { passive: true });
    }

    return () => {
      if (sidebarContent) {
        sidebarContent.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const isActive = (path: string) => {
    if (path === "/explore") return currentPath === "/" || currentPath === "/explore";
    return currentPath.startsWith(path);
  };

  const NavItem = ({ item, isCompact = false }) => {
    const isActiveRoute = isActive(item.url);
    
    return (
      <li>
        {isCollapsed ? (
          <Tooltip>
            <TooltipTrigger asChild>
              <NavLink 
                to={item.url}
                className={cn(
                  "relative flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg transition-all duration-200",
                  isActiveRoute 
                    ? "bg-primary text-primary-foreground shadow-sm" 
                    : "text-muted-foreground hover:bg-muted/80"
                )}
              >
                <item.icon className={cn(
                  "w-4 h-4 sm:w-5 sm:h-5",
                  isActiveRoute ? "text-primary-foreground" : "text-muted-foreground"
                )} />
                {item.notification && (
                  <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                    {item.notification}
                  </Badge>
                )}
              </NavLink>
            </TooltipTrigger>
            <TooltipContent side="right" className="font-medium">
              {item.title}
            </TooltipContent>
          </Tooltip>
        ) : (
          <NavLink
            to={item.url}
            className={({ isActive }) => cn(
              "group flex items-center gap-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200",
              isActiveRoute 
                ? "bg-primary/10 text-primary" 
                : "text-muted-foreground hover:bg-muted/50 hover:text-foreground"
            )}
          >
            <span className={cn(
              "flex-shrink-0 w-5 h-5 relative",
              isCompact && "sm:w-4 sm:h-4",
              isActiveRoute ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
            )}>
              <item.icon className="w-full h-full" />
              {item.notification && (
                <Badge className="absolute -top-1 -right-1 w-4 h-4 p-0 flex items-center justify-center text-[10px] bg-primary text-primary-foreground">
                  {item.notification}
                </Badge>
              )}
            </span>
            <span className={cn(
              "truncate",
              isCompact && "text-xs sm:text-sm",
            )}>
              {t(`nav.${item.title}`)}
            </span>
          </NavLink>
        )}
      </li>
    );
  };

          {/* Creator Tools */}
  return (
    <aside 
      className={cn(
        "fixed top-0 left-0 h-screen z-30 flex flex-col border-r border-border bg-card/90 backdrop-blur-sm transition-all duration-300",
        isCollapsed ? "w-[3.9rem]" : "w-[13.25rem] lg:w-[14rem]"
      )}
    >
      {/* Logo Section */}
      <div className={cn(
        "flex h-14 sm:h-16 items-center border-b border-border transition-all duration-300",
        isCollapsed ? "justify-center px-1.5" : "px-3 sm:px-5",
        isScrolled && "shadow-sm"
      )}>
        {isCollapsed ? (
          <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
            <Music className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
          </div>
        ) : (
          <Link to="/" className="flex items-center gap-2 no-underline">
            <div className="w-8 h-8 sm:w-9 sm:h-9 bg-gradient-to-br from-primary to-primary/70 rounded-lg flex items-center justify-center">
              <Music className="h-4 w-4 sm:h-5 sm:w-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/80">
              BeatHaus
            </span>
          </Link>
        )}
      </div>
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto sidebar-content py-3 px-2 space-y-4">
        {/* Main Nav */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text uppercase tracking-wider px-2 mb-2">
              
            </h3>
          )}
          <ul className="space-y-1">
            {[
              // Notifications tab first
              { 
                title: "notifications", 
                url: "/notifications", 
                icon: Bell, 
                notification: unreadCount ? (unreadCount > 9 ? '9+' : unreadCount) : false 
              },
              ...mainNavItems,
            ].map(item => (
              <NavItem key={item.title} item={item} />
            ))}
          </ul>
        </div>
        {/* Collections */}
        <div>
          {!isCollapsed && (
            <h3 className="text-xs font-semibold text uppercase tracking-wider px-2 mb-2">
              {t('nav.yourLibrary')}
            </h3>
          )}
          <ul className="space-y-1">
            {collectionItems.map(item => (
              <NavItem key={item.title} item={item} isCompact />
            ))}
          </ul>
        </div>
        {/* Creator Studio */}
        <div>
          {!isCollapsed && (
            <div className="flex items-center justify-between px-2 mb-2">
              <h3 className="text-xs font-semibold text uppercase tracking-wider">
                {t('nav.creatorStudio')}
              </h3>
              {/* <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">PRO</Badge> */}
            </div>
          )}
          <ul className="space-y-1">
            {creatorItems.map(item => (
              <NavItem key={item.title} item={item} isCompact />
            ))}
          </ul>
        </div>
      </div>
      {/* Footer */}
      <div className="p-3 border-t border-border space-y-3">
        {/* Language Toggle */}
        <div className="flex justify-center">
          <LanguageToggle variant="compact" className={cn("w-full", isCollapsed && "w-10")} />
        </div>
        
        <button
          onClick={handleSignOut}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
            "text-muted-foreground hover:bg-muted/60 hover:text-foreground"
          )}
        >
          <LogOut className="h-4 w-4" />
          {!isCollapsed && <span>{t('nav.signOut')}</span>}
        </button>
      </div>
    </aside>
  );
}