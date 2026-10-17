import Image from "next/image";
import { cn } from "@/lib/cn";

export function Logo({
  dark = false,
  className,
  compact = false,
}: {
  dark?: boolean;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span className={cn("inline-flex items-center", className)}>
      <Image
        src="/menusnap-logo-white.png"
        alt="MenuSnap Logo"
        width={160}
        height={36}
        priority
        className="h-7 sm:h-8 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
        style={dark ? undefined : { filter: "url(#menusnap-white-to-black)" }}
      />
      {/* SVG filter converting white text in logo to dark while preserving orange accent on light backgrounds */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="hidden"
        aria-hidden="true"
        style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }}
      >
        <defs>
          <filter id="menusnap-white-to-black">
            <feColorMatrix
              type="matrix"
              values="1 -1 0 0 0
                      0  0 0 0 0
                      0  0 0 0 0
                      0  0 0 1 0"
            />
          </filter>
        </defs>
      </svg>
    </span>
  );
}