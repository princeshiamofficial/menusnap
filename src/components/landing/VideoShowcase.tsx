"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/cn";
import { DEMO_VIDEO_URL } from "@/lib/data";
import { trackEvent } from "@/lib/analytics";
import { ExpandIcon, PauseIcon, PlayIcon, VolumeIcon, VolumeMuteIcon } from "@/components/landing/icons";

function PosterScene() {
  const suspenders = Array.from({ length: 9 }, (_, i) => {
    const t = (i + 1) / 10;
    const u = 1 - t;
    return {
      x: u * u * u * 356 + 3 * u * u * t * 470 + 3 * u * t * t * 730 + t * t * t * 844,
      y: u * u * u * 262 + 3 * u * u * t * 400 + 3 * u * t * t * 400 + t * t * t * 262,
    };
  });

  return (
    <svg
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="vs-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#5db1e6" />
          <stop offset="42%" stopColor="#a6d5f0" />
          <stop offset="72%" stopColor="#f8ddbc" />
          <stop offset="100%" stopColor="#ffd6a0" />
        </linearGradient>
        <radialGradient id="vs-sun">
          <stop offset="0%" stopColor="#fff9de" />
          <stop offset="55%" stopColor="#ffeaa6" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#ffd479" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="vs-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#8fc7df" />
          <stop offset="45%" stopColor="#5da3c9" />
          <stop offset="100%" stopColor="#3c7fae" />
        </linearGradient>
        <filter id="vs-cloud-blur" x="-40%" y="-40%" width="180%" height="180%">
          <feGaussianBlur stdDeviation="11" />
        </filter>
      </defs>

      <rect width="1200" height="560" fill="url(#vs-sky)" />
      <circle cx="600" cy="430" r="210" fill="url(#vs-sun)" />
      <circle cx="600" cy="430" r="62" fill="#fff7d6" />

      <g fill="#ffffff" opacity="0.85" filter="url(#vs-cloud-blur)">
        <ellipse cx="230" cy="130" rx="150" ry="34" />
        <ellipse cx="340" cy="162" rx="108" ry="26" />
        <ellipse cx="520" cy="82" rx="120" ry="26" />
        <ellipse cx="878" cy="112" rx="170" ry="36" />
        <ellipse cx="756" cy="150" rx="100" ry="24" />
        <ellipse cx="1055" cy="222" rx="130" ry="28" />
        <ellipse cx="118" cy="262" rx="112" ry="24" />
      </g>

      <path
        d="M0 500 Q180 440 340 480 T680 470 T1000 490 T1200 462 V560 H0 Z"
        fill="#b3c3bd"
        opacity="0.7"
      />
      <path
        d="M0 526 Q220 472 420 510 T820 505 T1200 500 V560 H0 Z"
        fill="#93a7a3"
        opacity="0.9"
      />

      <g fill="#d9603c">
        <rect x="348" y="262" width="16" height="300" rx="3" />
        <rect x="836" y="262" width="16" height="300" rx="3" />
        <rect x="336" y="300" width="40" height="10" rx="4" />
        <rect x="824" y="300" width="40" height="10" rx="4" />
        <rect x="336" y="358" width="40" height="10" rx="4" />
        <rect x="824" y="358" width="40" height="10" rx="4" />
        <rect x="120" y="436" width="960" height="14" rx="6" />
      </g>

      <g stroke="#d9603c" fill="none">
        <path
          d="M140 430 C 232 340 300 274 356 262 C 470 400 730 400 844 262 C 900 274 968 340 1060 430"
          strokeWidth="7"
        />
        <g strokeWidth="3" opacity="0.85">
          {suspenders.map((p) => (
            <line key={p.x} x1={p.x} y1="436" x2={p.x} y2={p.y} />
          ))}
        </g>
      </g>

      <rect y="560" width="1200" height="240" fill="url(#vs-water)" />
      <g fill="#ffffff" opacity="0.3">
        <ellipse cx="600" cy="600" rx="120" ry="8" />
        <ellipse cx="600" cy="642" rx="88" ry="7" />
        <ellipse cx="600" cy="684" rx="140" ry="8" />
        <ellipse cx="600" cy="736" rx="70" ry="6" />
        <ellipse cx="300" cy="622" rx="82" ry="6" />
        <ellipse cx="920" cy="664" rx="104" ry="6" />
      </g>
    </svg>
  );
}

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0) return "00:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function VideoShowcase({ className }: { className?: string }) {
  const [started, setStarted] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [time, setTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const screenRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const v = videoRef.current;
    if (!started || !v) return;
    void v.play().catch(() => {});
  }, [started]);

  const start = () => {
    if (!DEMO_VIDEO_URL || started) return;
    setStarted(true);
    trackEvent("demoStarted", { source: "hero_video" });
  };

  useEffect(() => {
    if (started || !DEMO_VIDEO_URL) return;
    const el = screenRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setStarted(true);
          trackEvent("demoStarted", { source: "hero_video" });
          observer.disconnect();
        }
      },
      { threshold: 0.45 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [started]);

  const togglePlay = () => {
    if (!started) {
      start();
      return;
    }
    const v = videoRef.current;
    if (!v) return;
    if (v.paused || v.ended) {
      if (v.ended) v.currentTime = 0;
      void v.play().catch(() => {});
    } else {
      v.pause();
    }
  };

  const toggleMute = () => {
    const next = !muted;
    setMuted(next);
    if (videoRef.current) videoRef.current.muted = next;
  };

  const toggleFullscreen = () => {
    const el = screenRef.current;
    if (!el) return;
    if (document.fullscreenElement) {
      void document.exitFullscreen();
    } else if (el.requestFullscreen) {
      void el.requestFullscreen().catch(() => {});
    }
  };

  return (
    <div className={cn("relative mx-auto mt-12 w-full max-w-4xl sm:mt-16", className)}>
      <div className="relative rounded-[1.75rem] bg-gradient-to-b from-[#3c3c3f] via-[#2a2a2d] to-[#1b1b1e] p-2.5 shadow-[0_36px_72px_-32px_rgb(17_17_17/0.5)] sm:rounded-[2.5rem] sm:p-4">
        <span
          className="absolute left-1/2 top-[2px] h-1.5 w-1.5 -translate-x-1/2 rounded-full bg-black/70 ring-1 ring-white/10 sm:top-1 sm:h-2 sm:w-2"
          aria-hidden="true"
        />

        <div
          ref={screenRef}
          className="relative aspect-[3/2] w-full overflow-hidden rounded-[1.25rem] bg-night sm:rounded-[1.875rem]"
        >
          <PosterScene />

          {started && (
            <video
              ref={videoRef}
              src={DEMO_VIDEO_URL}
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              playsInline
              muted={muted}
              preload="auto"
              onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
              onDurationChange={(e) => setDuration(e.currentTarget.duration)}
              onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
              onPlay={() => setPlaying(true)}
              onPause={() => setPlaying(false)}
              onEnded={() => {
                setPlaying(false);
                trackEvent("demoCompleted");
              }}
            />
          )}

          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/55 via-black/25 to-transparent sm:h-24"
            aria-hidden="true"
          />
          <div
            className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/75 via-black/35 to-transparent sm:h-28"
            aria-hidden="true"
          />

          {!playing && (
            <button
              type="button"
              onClick={togglePlay}
              aria-label="Play the MenuSnap demo video"
              className="group absolute inset-0 flex items-center justify-center"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-night/75 text-white shadow-[0_10px_30px_rgb(0_0_0/0.4)] backdrop-blur-sm transition-transform duration-200 group-hover:scale-105 sm:h-16 sm:w-16">
                <PlayIcon className="h-5 w-5 translate-x-0.5 sm:h-6 sm:w-6" />
              </span>
            </button>
          )}

          <button
            type="button"
            onClick={toggleFullscreen}
            aria-label="Toggle fullscreen"
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-lg bg-black/70 text-white backdrop-blur-sm transition-colors hover:bg-black/85 sm:right-6 sm:top-6 sm:h-9 sm:w-9"
          >
            <ExpandIcon className="h-4 w-4" />
          </button>

          <div className="absolute inset-x-4 bottom-4 flex items-center justify-between gap-3 sm:inset-x-6 sm:bottom-5">
            <div className="flex items-center gap-3.5 text-white sm:gap-4">
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? "Pause demo video" : "Play demo video"}
                className="transition-opacity hover:opacity-75"
              >
                {playing ? <PauseIcon className="h-4 w-4" /> : <PlayIcon className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={toggleMute}
                aria-label={muted ? "Unmute" : "Mute"}
                aria-pressed={muted}
                className="transition-opacity hover:opacity-75"
              >
                {muted ? <VolumeMuteIcon className="h-4 w-4" /> : <VolumeIcon className="h-4 w-4" />}
              </button>
              <span className="text-[12px] font-medium tabular-nums sm:text-[13px]">
                {formatTime(started ? time : 0)} / {formatTime(started ? duration : 0)}
              </span>
            </div>

            <div className="flex items-center gap-2.5 sm:gap-3.5">
              <span className="hidden text-[13px] font-medium text-white sm:inline">
                MenuSnap Interactive Demo
              </span>
              <button
                type="button"
                onClick={togglePlay}
                className="rounded-lg bg-white px-3 py-1.5 text-[12px] font-bold text-ink shadow-card transition-colors hover:bg-cream sm:px-3.5 sm:text-[13px]"
              >
                {playing ? "Pause" : "Play"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div
        className="mx-auto mt-2 h-1.5 w-20 rounded-full bg-ink/15 sm:mt-3 sm:w-24"
        aria-hidden="true"
      />
    </div>
  );
}
