import { Link } from "react-router-dom";

interface BeatInfoProps {
  id: string;
  title: string;
  producer: string;
}

export function BeatInfo({ id, title, producer }: BeatInfoProps) {
  return (
    <div>
      <Link
        to={`/beat/${id}`}
        className="font-semibold pt-1 text-[11px] sm:text-[12px] leading-snug text-foreground hover:text-primary transition-colors duration-200 cursor-pointer block truncate"
      >
        {title}
      </Link>
      <Link
        to={`/creator/${producer.toLowerCase().replace(/\s+/g, '')}`}
        className="text-[10px] sm:text-[11px] text-muted-foreground hover:text-primary cursor-pointer transition-colors block truncate mt-0.5"
      >
        {producer}
      </Link>
    </div>
  );
}
