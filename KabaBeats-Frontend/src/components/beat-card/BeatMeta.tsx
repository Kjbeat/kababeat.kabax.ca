import { Badge } from "@/components/ui/badge";

interface BeatMetaProps {
  bpm: number;
  musicalKey: string;
  genre: string;
}

export function BeatMeta({ bpm, musicalKey, genre }: BeatMetaProps) {
  return (
    <div className="flex items-center gap-1 text-[9px] sm:text-[10px] flex-wrap">
      <Badge variant="secondary" className="px-1 py-0.5 text-[9px] sm:text-[10px] font-medium">
        {bpm} BPM
      </Badge>
      <Badge variant="secondary" className="px-1 py-0.5 text-[9px] sm:text-[10px] font-medium">
        {musicalKey}
      </Badge>
      <Badge variant="outline" className="px-1 py-0.5 text-[9px] sm:text-[10px] font-medium">
        {genre}
      </Badge>
    </div>
  );
}
