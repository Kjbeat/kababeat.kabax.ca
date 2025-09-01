import { useEffect, useState } from 'react';

/**
 * Lightweight dominant color extractor (average sampling) for an image URL.
 * Returns a css rgb() string or null while loading / on failure.
 */
export function useDominantColor(url?: string | null, { samples = 10 } = {}) {
  const [color, setColor] = useState<string | null>(null);

  useEffect(() => {
    if (!url) { setColor(null); return; }
    let cancelled = false;
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.decoding = 'async';
    img.src = url;
    img.onload = () => {
      try {
        if (cancelled) return;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;
        const w = img.naturalWidth;
        const h = img.naturalHeight;
        canvas.width = samples;
        canvas.height = samples;
        ctx.drawImage(img, 0, 0, samples, samples);
        const data = ctx.getImageData(0, 0, samples, samples).data;
        let r = 0, g = 0, b = 0, count = 0;
        for (let i = 0; i < data.length; i += 4) {
          const alpha = data[i + 3];
            if (alpha < 200) continue;
          r += data[i];
          g += data[i + 1];
          b += data[i + 2];
          count++;
        }
        if (count) {
          r = Math.round(r / count);
          g = Math.round(g / count);
          b = Math.round(b / count);
          setColor(`rgb(${r}, ${g}, ${b})`);
        }
      } catch {
        /* ignore */
      }
    };
    return () => { cancelled = true; };
  }, [url, samples]);

  return color;
}

// Provide a default export as a fallback for any incorrect import usage or HMR inconsistencies
export default useDominantColor;
