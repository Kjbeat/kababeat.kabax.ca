import { ReactNode, CSSProperties } from "react";

interface BeatGridProps {
  children: ReactNode;
  /** Base minimum column width in pixels (used as lower bound of clamp) */
  minColWidth?: number;
  /** Maximum column width before an additional column is added */
  maxColWidth?: number;
  /** Gap size (Tailwind spacing scale key or custom) */
  gapClassName?: string;
  className?: string;
}

/**
 * BeatGrid arranges BeatCard components in a responsive auto-fill grid
 * maintaining consistent card widths while adapting the number of columns.
 * It uses CSS grid auto-fill with minmax and layered media-query adjustments
 * for very small and very large screens.
 */
export function BeatGrid({
  children,
  minColWidth = 200,
  maxColWidth = 320,
  gapClassName = "gap-6",
  className = ""
}: BeatGridProps) {
  // Use CSS custom properties so global / per-breakpoint overrides can adjust fluidly
  // We rely on a clamp formula inside App.css for .beat-grid when --beat-col-min/max provided
  const style: CSSProperties & { [key: string]: string | undefined } = {
    ['--beat-col-min']: `${minColWidth}px`,
    ['--beat-col-max']: `${maxColWidth}px`,
    gridTemplateColumns: `repeat(auto-fill,minmax(var(--beat-col-min),1fr))`
  };
  return (
    <div className={`beat-grid grid ${gapClassName} ${className}`.trim()} style={style}>
      {children}
    </div>
  );
}

export default BeatGrid;
