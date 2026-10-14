"use client";

import { useEffect } from "react";
import { DEMO_VIDEO_URL } from "@/lib/data";
import { CloseIcon, PlayIcon } from "@/components/landing/icons";

export function DemoModal({
  onClose,
  videoUrl = DEMO_VIDEO_URL,
}: {
  onClose: () => void;
  videoUrl?: string;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-center justify-center bg-night/90 p-4 backdrop-blur-sm sm:p-8"
      role="dialog"
      aria-modal="true"
      aria-label="MenuSnap demo video"
      onClick={onClose}
    >
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <button
          type="button"
          onClick={onClose}
          autoFocus
          aria-label="Close video"
          className="absolute -top-12 right-0 flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
        >
          <CloseIcon className="h-5 w-5" />
        </button>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black shadow-lift">
          {videoUrl && /\.(mp4|webm|ogv|ogg|mov|m4v)(\?|#|$)/i.test(videoUrl) ? (
            <video
              src={videoUrl}
              className="h-full w-full"
              controls
              autoPlay
              playsInline
              title="MenuSnap product demo video"
            />
          ) : videoUrl ? (
            <iframe
              src={videoUrl}
              className="h-full w-full"
              title="MenuSnap product demo video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 px-6 text-center">
              <span className="flex h-16 w-16 items-center justify-center rounded-full bg-white/10">
                <PlayIcon className="h-7 w-7 text-white/70" />
              </span>
              <p className="text-lg font-bold text-white">Demo video coming soon</p>
              <p className="max-w-sm text-sm leading-relaxed text-white/60">
                Set <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">DEMO_VIDEO_URL</code> in{" "}
                <code className="rounded bg-white/10 px-1.5 py-0.5 font-mono text-xs">src/lib/data.ts</code> to connect
                your YouTube, Vimeo or self-hosted video.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
