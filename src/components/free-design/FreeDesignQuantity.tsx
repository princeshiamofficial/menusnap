"use client";

import { useEffect, useRef } from "react";
import { motion, useInView, animate } from "framer-motion";

function Counter({ value, duration = 1.5 }: { value: number; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: false, amount: 0.3 });

  useEffect(() => {
    if (inView) {
      const controls = animate(0, value, {
        duration: duration,
        ease: "easeOut",
        onUpdate: (latest) => {
          if (ref.current) {
            ref.current.textContent = Math.floor(latest).toString();
          }
        }
      });
      return () => controls.stop();
    } else {
      if (ref.current) {
        ref.current.textContent = "0";
      }
    }
  }, [inView, value, duration]);

  return <span ref={ref}>0</span>;
}

export function FreeDesignQuantity() {
  return (
    <section id="quantity-info" className="w-full bg-white px-4 md:px-6 pt-3 pb-6 md:pt-5 md:pb-10 font-sans relative overflow-hidden">
      {/* Background blobs to showcase backdrop-blur glassmorphism */}
      <div className="absolute top-1/2 left-1/3 -translate-y-1/2 w-64 h-64 rounded-full bg-orange-400/10 blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 right-1/3 -translate-y-1/2 w-64 h-64 rounded-full bg-amber-300/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto w-full relative z-10">
        <div className="max-w-2xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
          
          {/* Delivered Stat Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden bg-black/[0.04] backdrop-blur-md border border-black/[0.06] rounded-xl md:rounded-2xl py-6 md:py-8 px-6 text-slate-900 text-center shadow-[0_15px_30px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center"
          >
            {/* Water liquid animation layers */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl md:rounded-2xl">
              <div className="absolute -inset-6 bg-blue-400/[0.04] animate-water-1 blur-md" />
              <div className="absolute -inset-8 bg-orange-400/[0.03] animate-water-2 blur-lg" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
              
              {/* Concentric Ripples */}
              <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-orange-500/15 -translate-x-1/2 -translate-y-1/2 animate-ripple-1" />
              <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-orange-500/10 -translate-x-1/2 -translate-y-1/2 animate-ripple-2" />
              <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-orange-500/5 -translate-x-1/2 -translate-y-1/2 animate-ripple-3" />
            </div>

            <div className="relative z-10">
              <span className="text-4xl md:text-5xl font-black tracking-tight mb-2 select-none text-slate-900">
                <Counter value={5931} />+
              </span>
              <p className="text-sm md:text-lg font-bold text-slate-500 opacity-90 tracking-wide font-sans">
                Delivered
              </p>
            </div>
          </motion.div>

          {/* In order Processing Stat Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="relative overflow-hidden bg-black/[0.04] backdrop-blur-md border border-black/[0.06] rounded-xl md:rounded-2xl py-6 md:py-8 px-6 text-slate-900 text-center shadow-[0_15px_30px_rgba(0,0,0,0.01)] flex flex-col items-center justify-center"
          >
            {/* Water liquid animation layers */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none rounded-xl md:rounded-2xl">
              <div className="absolute -inset-6 bg-blue-400/[0.04] animate-water-1 blur-md" />
              <div className="absolute -inset-8 bg-orange-400/[0.03] animate-water-2 blur-lg" />
              <div className="absolute top-0 left-0 right-0 h-1/2 bg-gradient-to-b from-white/10 to-transparent" />
              
              {/* Concentric Ripples */}
              <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-orange-500/15 -translate-x-1/2 -translate-y-1/2 animate-ripple-1" />
              <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-orange-500/10 -translate-x-1/2 -translate-y-1/2 animate-ripple-2" />
              <div className="absolute top-1/2 left-1/2 w-64 h-64 rounded-full border border-orange-500/5 -translate-x-1/2 -translate-y-1/2 animate-ripple-3" />
            </div>

            <div className="relative z-10">
              <span className="text-4xl md:text-5xl font-black tracking-tight mb-2 select-none text-slate-900">
                <Counter value={185} />+
              </span>
              <p className="text-sm md:text-lg font-bold text-slate-500 opacity-90 tracking-wide font-sans">
                Processing
              </p>
            </div>
          </motion.div>

        </div>
      </div>

      <style jsx global>{`
        @keyframes water-liquid-1 {
          0%, 100% {
            border-radius: 40% 60% 70% 30% / 40% 50% 60% 50%;
            transform: rotate(0deg) scale(1);
          }
          50% {
            border-radius: 70% 30% 50% 50% / 50% 70% 30% 50%;
            transform: rotate(180deg) scale(1.1);
          }
        }
        @keyframes water-liquid-2 {
          0%, 100% {
            border-radius: 50% 50% 30% 70% / 50% 60% 40% 50%;
            transform: rotate(0deg) scale(1);
          }
          50% {
            border-radius: 30% 70% 60% 40% / 60% 40% 60% 40%;
            transform: rotate(-180deg) scale(0.95);
          }
        }
        @keyframes water-ripple {
          0% {
            transform: translate(-50%, -50%) scale(0.3);
            opacity: 0.8;
          }
          100% {
            transform: translate(-50%, -50%) scale(1.6);
            opacity: 0;
          }
        }
        .animate-water-1 {
          animation: water-liquid-1 12s ease-in-out infinite;
        }
        .animate-water-2 {
          animation: water-liquid-2 16s ease-in-out infinite;
        }
        .animate-ripple-1 {
          animation: water-ripple 5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
        }
        .animate-ripple-2 {
          animation: water-ripple 5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          animation-delay: 1.6s;
        }
        .animate-ripple-3 {
          animation: water-ripple 5s cubic-bezier(0.1, 0.8, 0.3, 1) infinite;
          animation-delay: 3.2s;
        }
      `}</style>
    </section>
  );
}
