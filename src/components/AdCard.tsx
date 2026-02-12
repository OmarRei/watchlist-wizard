import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Megaphone } from "lucide-react";

interface AdCardProps {
  adSlot?: string;
  adFormat?: string;
}

declare global {
  interface Window {
    adsbygoogle?: Array<Record<string, unknown>>;
  }
}

export default function AdCard({ adSlot, adFormat = "auto" }: AdCardProps) {
  const adRef = useRef<HTMLModElement>(null);
  const pushed = useRef(false);

  useEffect(() => {
    if (adSlot && adRef.current && !pushed.current) {
      try {
        (window.adsbygoogle = window.adsbygoogle || []).push({});
        pushed.current = true;
      } catch {
        // AdSense not loaded yet
      }
    }
  }, [adSlot]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-lg bg-card border border-border flex flex-col"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-muted/50 flex items-center justify-center relative">
        {adSlot ? (
          <ins
            ref={adRef}
            className="adsbygoogle"
            style={{ display: "block", width: "100%", height: "100%" }}
            data-ad-format={adFormat}
            data-ad-slot={adSlot}
            data-full-width-responsive="true"
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground">
            <Megaphone className="h-10 w-10" />
            <span className="text-xs text-center">Ad Space</span>
          </div>
        )}
        {/* Ad label */}
        <div className="absolute top-2 right-2 bg-muted/80 backdrop-blur-sm text-muted-foreground text-[10px] px-1.5 py-0.5 rounded">
          Ad
        </div>
      </div>
      <div className="p-2">
        <p className="text-sm font-medium text-muted-foreground truncate">Sponsored</p>
        <p className="text-xs text-muted-foreground/60">Advertisement</p>
      </div>
    </motion.div>
  );
}
