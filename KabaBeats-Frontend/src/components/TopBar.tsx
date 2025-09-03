import { Search, Bell, User, Upload, Moon, Sun, Monitor, Palette, ShoppingCart, LogOut, PanelLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useSidebar } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { useTheme } from "@/components/ThemeProvider";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useNotifications } from "@/contexts/useNotifications";
import { cn } from "@/lib/utils";

export function TopBar() {
  const { theme, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();
  const { items, getItemCount, getTotalPrice, removeFromCart, updateQuantity } = useCart();
  const { latest: notifications, unreadCount, markAsRead } = useNotifications();
  const { state, open, setOpen } = useSidebar();
  const isCollapsed = state === "collapsed" || !open;

  // Unified hover & focus styling for icon-like ghost buttons (uses shadcn accent token)
  const iconHover = "transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring";

  const handleLogout = () => {
    logout();
    toast({
      title: "Logged out successfully",
      description: "See you next time!",
    });
    navigate('/landing');
  };

  const getThemeIcon = () => {
    switch (theme) {
      case "light":
        return <Sun className="h-5 w-5" />;
      case "dark":
        return <Moon className="h-5 w-5" />;
      default:
        return <Monitor className="h-5 w-5" />;
    }
  };

  return (
    <header 
      className={cn(
        "fixed top-0 right-0 z-50",
        "h-14 sm:h-16",
        "bg-background/20 backdrop-blur-md",
        "border-b border-border/20",
        "flex items-center justify-between",
        "px-3 sm:px-4 lg:px-6",
        "transition-all duration-300",
  // Adjusted to match updated AppSidebar widths (collapsed: 3.9rem, expanded: 13.25rem / 14rem lg)
  isCollapsed ? "left-[3.9rem]" : "left-[13.25rem] lg:left-[14rem]"
      )}
      style={{
        backdropFilter: 'blur(12px) saturate(120%)',
        WebkitBackdropFilter: 'blur(12px) saturate(120%)',
      }}
    >
      {/* Left section */}
      <div className="flex items-center gap-2 sm:gap-4">
        <Button
          variant="ghost"
          size="icon"
          className={cn("h-7 w-7", iconHover)}
          onClick={() => setOpen(!open)}
          aria-label="Toggle Sidebar"
        >
          <PanelLeft className="h-4 w-4" />
        </Button>
        
        {/* Search */}
        {/* <div className="relative w-full max-w-[200px] sm:max-w-xs lg:max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search beats, producers, genres..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-background/30 border-border/40 focus:border-primary text-sm backdrop-blur-sm"
          />
        </div> */}
      </div>

      {/* Right section */}
      <div className="flex items-center gap-1 sm:gap-2 lg:gap-4">
        {/* Upload Button - Hidden on very small screens */}
        <Button 
          size="sm"
          className="hidden sm:flex bg-primary hover:bg-primary/90 text-primary-foreground shadow-glow"
          onClick={() => navigate("/upload")}
        >
          <Upload className="h-4 w-4 sm:mr-2" />
          <span className="hidden md:inline">Upload Beat</span>
        </Button>

        {/* Mobile Upload Button */}
        <Button 
          size="sm"
          variant="ghost"
          className={cn("sm:hidden", iconHover)}
          onClick={() => navigate("/upload")}
        >
          <Upload className="h-4 w-4" />
        </Button>
        
        {/* Mobile Notifications Button */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={cn("relative sm:hidden", iconHover)}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-[10px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-xs font-medium tracking-wide">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => notifications.filter(n=>!n.read).forEach(n=>markAsRead(n.id))}
                  className="text-[10px] text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                >
                  Mark all
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-[11px] text-muted-foreground text-center">No notifications</div>
              ) : (
                notifications.slice(0,5).map(n => {
                  const time = n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={cn(
                        "w-full text-left px-3 py-2 flex gap-2 text-xs transition-colors",
                        "hover:bg-muted/60 dark:hover:bg-muted/40 focus:bg-muted/60 dark:focus:bg-muted/40",
                        "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
                        !n.read && "bg-accent/15 dark:bg-accent/20"
                      )}
                    >
                      <span className="flex-shrink-0 mt-1">
                        <span className={cn("block w-2 h-2 rounded-full", !n.read ? "bg-primary" : "bg-muted-foreground/30")} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={cn("block truncate", !n.read && "font-medium")}>{n.title}</span>
                        <span className="block text-[10px] text-muted-foreground truncate">{n.message}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">{time}</span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t bg-background/60">
              <Button
                size="sm"
                variant="ghost"
                className="w-full rounded-none transition-colors hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onClick={() => navigate('/notifications')}
              >
                View all
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Cart */}
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className={cn("relative", iconHover)}>
              <ShoppingCart className="h-5 w-5" />
              {getItemCount() > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-xs">
                  {getItemCount()}
                </Badge>
              )}
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:w-96">
            <SheetHeader>
              <SheetTitle>Cart ({getItemCount()} items)</SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {items.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Your cart is empty
                </div>
              ) : (
                <>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {items.map((item) => (
                      <div key={`${item.id}-${item.licenseType}`} className="flex items-center gap-3 p-3 border rounded-lg">
                        <img 
                          src={item.artwork || "/placeholder.svg"} 
                          alt={item.title}
                          className="w-10 h-10 sm:w-12 sm:h-12 rounded object-cover flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm truncate">{item.title}</div>
                          <div className="text-xs text-muted-foreground truncate">{item.producer}</div>
                          <div className="text-xs text-primary">{item.licenseType}</div>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <div className="font-bold text-sm">${item.price}</div>
                          <div className="flex items-center gap-1 mt-1">
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, item.licenseType, item.quantity - 1)}
                            >
                              -
                            </Button>
                            <span className="text-xs w-6 text-center">{item.quantity}</span>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="h-6 w-6 p-0"
                              onClick={() => updateQuantity(item.id, item.licenseType, item.quantity + 1)}
                            >
                              +
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="border-t pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-bold">Total: ${getTotalPrice().toFixed(2)}</span>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={() => navigate('/checkout')}
                    >
                      Checkout
                    </Button>
                  </div>
                </>
              )}
            </div>
          </SheetContent>
        </Sheet>

        {/* Theme Toggle - Hidden on very small screens */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className={cn("hidden sm:inline-flex", iconHover)}
            >
              {getThemeIcon()}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setTheme("light")}>
              <Sun className="h-4 w-4 mr-2" />
              Light
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("dark")}>
              <Moon className="h-4 w-4 mr-2" />
              Dark
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTheme("system")}>
              <Monitor className="h-4 w-4 mr-2" />
              System
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => navigate("/custom-theme")}>
              <Palette className="h-4 w-4 mr-2" />
              Custom Theme
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        
        {/* Notifications - Desktop Version */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className={cn("relative hidden sm:inline-flex", iconHover)}>
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center p-0 bg-primary text-[10px]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-72 p-0 overflow-hidden">
            <div className="flex items-center justify-between px-3 py-2 border-b">
              <span className="text-xs font-medium tracking-wide">Notifications</span>
              {unreadCount > 0 && (
                <button
                  onClick={() => notifications.filter(n=>!n.read).forEach(n=>markAsRead(n.id))}
          className="text-[10px] text-primary hover:underline focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring rounded-sm"
                >
                  Mark all
                </button>
              )}
            </div>
            <div className="max-h-72 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-4 text-[11px] text-muted-foreground text-center">No notifications</div>
              ) : (
                notifications.slice(0,5).map(n => {
                  const time = n.createdAt.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                  return (
                    <button
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
            className={cn(
              "w-full text-left px-3 py-2 flex gap-2 text-xs transition-colors",
              "hover:bg-muted/60 dark:hover:bg-muted/40 focus:bg-muted/60 dark:focus:bg-muted/40",
              "focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring",
              !n.read && "bg-accent/15 dark:bg-accent/20"
            )}
                    >
                      <span className="flex-shrink-0 mt-1">
                        <span className={cn("block w-2 h-2 rounded-full", !n.read ? "bg-primary" : "bg-muted-foreground/30")} />
                      </span>
                      <span className="flex-1 min-w-0">
                        <span className={cn("block truncate", !n.read && "font-medium")}>{n.title}</span>
                        <span className="block text-[10px] text-muted-foreground truncate">{n.message}</span>
                      </span>
                      <span className="text-[10px] text-muted-foreground flex-shrink-0 mt-0.5">{time}</span>
                    </button>
                  );
                })
              )}
            </div>
            <div className="border-t bg-background/60">
              <Button
                size="sm"
                variant="ghost"
        className="w-full rounded-none transition-colors hover:bg-accent focus:bg-accent hover:text-accent-foreground focus:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                onClick={() => navigate('/notifications')}
              >
                View all
              </Button>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className={cn("p-1", iconHover)}>
              <Avatar className="h-6 w-6 sm:h-8 sm:w-8">
                <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xs sm:text-sm">
                  {user?.firstName && user?.lastName 
                    ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                    : user?.username?.charAt(0).toUpperCase() || 'U'
                  }
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username || 'User'
                }
              </p>
              <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role === 'creator' ? "Creator" : user?.role === 'admin' ? "Admin" : "User"} • {user?.country}
              </p>
            </div>
            <DropdownMenuSeparator />
            {/* Mobile-only menu items */}
            <div className="sm:hidden">
              <DropdownMenuItem onClick={() => navigate("/upload")}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Beat
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme(theme === "dark" ? "light" : "dark")}>
                {getThemeIcon()}
                <span className="ml-2">Toggle Theme</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
            </div>
            <DropdownMenuItem onClick={() => navigate("/dashboard")}>
              <User className="h-4 w-4 mr-2" />
              Dashboard
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}