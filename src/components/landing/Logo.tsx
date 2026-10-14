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
    <span className={cn("inline-flex items-center gap-2.5", className)}>
      <span className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-accent shadow-pop">
        <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
          <rect x="3.5" y="5.5" width="9" height="2.4" rx="1.2" fill="#fff" />
          <rect x="3.5" y="10.8" width="13" height="2.4" rx="1.2" fill="#fff" opacity="0.88" />
          <rect x="3.5" y="16.1" width="6.5" height="2.4" rx="1.2" fill="#fff" opacity="0.72" />
          <circle cx="17.6" cy="17.6" r="3.1" fill="#101010" />
          <path
            d="M15.9 17.6l1 1 1.8-2"
            stroke="#ff5a36"
            strokeWidth="1.3"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      {!compact && (
        <span
          className={cn(
            "text-[1.15rem] font-extrabold tracking-tight",
            dark ? "text-white" : "text-ink",
          )}
        >
          Menu<span className="text-accent">Snap</span>
        </span>
      )}
    </span>
  );
}