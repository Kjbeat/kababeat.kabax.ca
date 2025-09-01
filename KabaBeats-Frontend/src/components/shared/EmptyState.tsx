import { Button } from "@/components/ui/button";
import { Music, Heart, ShoppingCart, Upload } from "lucide-react";

/**
 * EmptyState - Reusable empty state component
 * 
 * @param title - The main heading text
 * @param description - Explanatory text below the title
 * @param icon - Icon to display (string identifier or React node)
 * @param action - Optional action button configuration
 */
interface EmptyStateProps {
  title: string;
  description: string;
  icon?: "music" | "heart" | "cart" | "upload" | React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
    variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive";
  };
}

/**
 * EmptyState Component
 * 
 * A reusable component for displaying empty states with optional call-to-action.
 * Supports predefined icons or custom React nodes.
 */
export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  const getIcon = () => {
    if (typeof icon === "string") {
      switch (icon) {
        case "music":
          return <Music className="h-12 w-12 text-muted-foreground" />;
        case "heart":
          return <Heart className="h-12 w-12 text-muted-foreground" />;
        case "cart":
          return <ShoppingCart className="h-12 w-12 text-muted-foreground" />;
        case "upload":
          return <Upload className="h-12 w-12 text-muted-foreground" />;
        default:
          return <Music className="h-12 w-12 text-muted-foreground" />;
      }
    }
    return icon || <Music className="h-12 w-12 text-muted-foreground" />;
  };

  return (
    <div className="text-center py-12">
      <div className="flex justify-center mb-4">
        {getIcon()}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">{description}</p>
      {action && (
        <Button 
          variant={action.variant || "default"}
          onClick={action.onClick}
        >
          {action.label}
        </Button>
      )}
    </div>
  );
}
