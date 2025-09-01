import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * PageHeader - Reusable page header component
 * 
 * @param title - The main title of the page
 * @param description - Optional description text below the title
 * @param showBackButton - Whether to show a back navigation button
 * @param backUrl - Specific URL to navigate back to (defaults to browser back)
 * @param action - Optional action button configuration
 */
interface PageHeaderProps {
  title: string;
  description?: string;
  showBackButton?: boolean;
  backUrl?: string;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  };
  children?: React.ReactNode;
}

/**
 * PageHeader Component
 * 
 * A reusable header component for pages with optional back navigation and action button.
 * Provides consistent styling and layout across different pages.
 */
export function PageHeader({ 
  title, 
  description, 
  showBackButton = false, 
  backUrl,
  action,
  children
}: PageHeaderProps) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (backUrl) {
      navigate(backUrl);
    } else {
      navigate(-1);
    }
  };

  return (
    <div className="flex items-center justify-between mb-4 md:mb-8 w-full">
      <div className="flex items-center gap-4">
        {showBackButton && (
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
        )}
        <div>
          <h1 className="text-3xl font-bold text-foreground">{title}</h1>
          {description && (
            <p className="text-muted-foreground mt-1">{description}</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        {children}
        {action && (
          <Button 
            variant={action.variant || "default"}
            onClick={action.onClick}
          >
            {action.label}
          </Button>
        )}
      </div>
    </div>
  );
}
