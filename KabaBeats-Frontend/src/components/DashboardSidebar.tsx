import { useState } from "react"
import { useTheme } from "@/components/ThemeProvider"
import { NavLink, useLocation, useNavigate } from "react-router-dom"
import {
  BarChart3,
  TrendingUp,
  Music,
  FileText,
  DollarSign,
  Settings,
  User,
  Crown,
  Plus,
  Menu,
  X,
  ArrowLeft,
  Sun,
  Moon,
  Monitor,
  ChevronDown,
  Palette,
  CreditCard,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { LanguageToggle } from "@/components/LanguageToggle"
import { useLanguage } from "@/contexts/LanguageContext"
import { useAuth } from "@/contexts/AuthContext"

const dashboardItems = [
  { title: "overview", url: "/dashboard", icon: BarChart3 },
  { title: "analytics", url: "/dashboard/analytics", icon: TrendingUp },
  { title: "licenses", url: "/dashboard/licenses", icon: FileText },
  { title: "sales", url: "/dashboard/sales", icon: DollarSign },
  { title: "theme", url: "/dashboard/theme", icon: Palette },
  { title: "payouts", url: "/dashboard/payouts", icon: DollarSign },
  { title: "billing", url: "/dashboard/billing", icon: CreditCard },
  { title: "subscription", url: "/dashboard/subscription", icon: Crown },
  { title: "settings", url: "/dashboard/settings", icon: Settings },
]

export function DashboardSidebar() {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const location = useLocation()
  const currentPath = location.pathname
  const navigate = useNavigate();
  const { theme, setTheme } = useTheme();
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const { t } = useLanguage();
  const { user } = useAuth();

  const isActive = (path: string) => {
    if (path === "/dashboard") {
      return currentPath === "/dashboard"
    }
    return currentPath.startsWith(path)
  }

  return (
    <div className={cn(
      "flex flex-col h-screen bg-card border-r border-border transition-all duration-300",
      isCollapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        {!isCollapsed && (
          <div
            className="flex items-center space-x-2 cursor-pointer"
            onClick={() => navigate("/explore")}
            role="button"
            tabIndex={0}
            aria-label="Go to Explore"
            onKeyPress={e => { if (e.key === 'Enter' || e.key === ' ') navigate('/explore') }}
          >
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">KB</span>
            </div>
            <span className="font-semibold text-foreground">Kababeats</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? <Menu className="h-4 w-4" /> : <X className="h-4 w-4" />}
        </Button>
      </div>

      {/* Profile Section */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={user?.avatar || "/placeholder.svg"} alt={user?.username} />
            <AvatarFallback>
              {user?.firstName && user?.lastName 
                ? `${user.firstName.charAt(0)}${user.lastName.charAt(0)}`
                : user?.username?.charAt(0).toUpperCase() || 'U'
              }
            </AvatarFallback>
          </Avatar>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">
                {user?.firstName && user?.lastName 
                  ? `${user.firstName} ${user.lastName}`
                  : user?.username || 'User'
                }
              </p>
              <p className="text-xs text-muted-foreground truncate">@{user?.username || 'username'}</p>
            </div>
          )}
        </div>
        
        {!isCollapsed && (
          <Button
            className="w-full mt-3 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70"
            size="sm"
            onClick={() => navigate('/dashboard/settings?tab=subscription')}
          >
            <Crown className="h-4 w-4 mr-2" />
            {t('dashboard.upgradePro')}
          </Button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-4 space-y-1">
        {dashboardItems.map((item) => (
          <NavLink
            key={item.url}
            to={item.url}
            className={cn(
              "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200",
              isActive(item.url)
                ? "bg-primary/10 text-primary border border-primary/20"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <item.icon className="h-4 w-4 flex-shrink-0" />
            {!isCollapsed && <span className="ml-3">{t(`dashboard.${item.title}`)}</span>}
          </NavLink>
        ))}
      </nav>

      {/* Create Button */}
      <div className="p-4 border-t border-border flex flex-col gap-3">
        {/* Return to Home Button */}
        <Button
          className="w-full mb-2 bg-accent text-accent-foreground hover:bg-accent/80"
          size={isCollapsed ? "icon" : "default"}
          onClick={() => navigate('/explore')}
        >
          <ArrowLeft className="h-4 w-4" />
          {!isCollapsed && <span className="ml-2">{t('nav.returnHome')}</span>}
        </Button>
        
        {/* Language Toggle */}
        <div className={cn("w-full flex items-center justify-center", isCollapsed && "px-0")}
          aria-label="Language Toggle"
        >
          <LanguageToggle variant="compact" className={cn("w-full", isCollapsed && "w-10")} />
        </div>
        
        {/* Theme Segmented Toggle */}
        <div className={cn("w-full flex items-center justify-center", isCollapsed && "px-0")}
          aria-label="Theme Toggle"
        >
          <div className={cn("flex rounded-lg bg-muted/40 border border-border overflow-hidden w-full", isCollapsed ? "flex-col items-center w-10" : "flex-row h-10")}
            style={{ minWidth: isCollapsed ? 40 : 180 }}
          >
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium transition-colors",
                theme === "system" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/40",
                isCollapsed && "py-1 px-0"
              )}
              onClick={() => setTheme("system")}
              aria-pressed={theme === "system"}
            >
              <Monitor className="h-4 w-4" />
              {!isCollapsed && <span>{t('theme.system')}</span>}
            </button>
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium transition-colors",
                theme === "light" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/40",
                isCollapsed && "py-1 px-0"
              )}
              onClick={() => setTheme("light")}
              aria-pressed={theme === "light"}
            >
              <Sun className="h-4 w-4" />
              {!isCollapsed && <span>{t('theme.light')}</span>}
            </button>
            <button
              className={cn(
                "flex-1 flex items-center justify-center gap-1 py-2 px-2 text-xs font-medium transition-colors",
                theme === "dark" ? "bg-accent text-accent-foreground" : "text-muted-foreground hover:bg-accent/40",
                isCollapsed && "py-1 px-0"
              )}
              onClick={() => setTheme("dark")}
              aria-pressed={theme === "dark"}
            >
              <Moon className="h-4 w-4" />
              {!isCollapsed && <span>{t('theme.dark')}</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}