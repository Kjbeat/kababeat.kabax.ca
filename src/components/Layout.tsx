import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { TopBar } from "@/components/TopBar";
import { MediaPlayer } from "@/components/MediaPlayer";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/components/ui/sidebar";

interface LayoutProps {
  children: React.ReactNode;
}

function LayoutContent({ children }: LayoutProps) {
  const { state, open } = useSidebar();
  const isCollapsed = state === "collapsed" || !open;

  return (
    <div className="min-h-screen w-full flex bg-background">
      <AppSidebar />
      <div className={cn(
        "flex-1 flex flex-col min-w-0 h-screen transition-all duration-300",
        isCollapsed ? "ml-[3.9rem]" : "ml-[13.25rem] lg:ml-[14rem]"
      )}>
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden no-scrollbar pt-14 sm:pt-16 p-3 sm:p-4 lg:p-6">
          <div className="max-w-7xl mx-auto w-full">
            {children}
          </div>
        </main>
        <MediaPlayer />
      </div>
    </div>
  );
}

export function Layout({ children }: LayoutProps) {
  return (
    <SidebarProvider defaultOpen={true}>
      <LayoutContent>
        {children}
      </LayoutContent>
    </SidebarProvider>
  );
}