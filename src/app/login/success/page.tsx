
"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import Image from 'next/image';

export default function LoginSuccessPage() {
  const router = useRouter();
  const { theme } = useTheme();

  useEffect(() => {
    // Auto redirect after 2.5 seconds
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] relative overflow-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[60%] h-[60%] bg-orange-600/20 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute -bottom-[20%] -right-[10%] w-[60%] h-[60%] bg-indigo-600/10 blur-[120px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center space-y-8"
        >
          {/* Logo */}
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center mb-12"
          >
            <div className="bg-white/5 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl">
              <Image 
                src="/menusnap-logo-white.png" 
                alt="MenuSnap" 
                width={180} 
                height={50} 
                className="object-contain"
              />
            </div>
          </motion.div>

          {/* Success Icon Animation */}
          <div className="relative flex justify-center">
            <motion.div
              initial={{ scale: 0, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ 
                type: "spring", 
                stiffness: 260, 
                damping: 20,
                delay: 0.4
              }}
              className="w-24 h-24 bg-gradient-to-tr from-orange-600 to-amber-400 rounded-full flex items-center justify-center shadow-[0_0_50px_rgba(249,115,22,0.4)]"
            >
              <CheckCircle2 className="w-12 h-12 text-white" />
            </motion.div>

            {/* Floating Sparkles */}
            <motion.div
              animate={{ 
                y: [0, -10, 0],
                opacity: [0.5, 1, 0.5]
              }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="absolute -top-4 -right-4"
            >
              <Sparkles className="w-6 h-6 text-amber-300 shadow-glow" />
            </motion.div>
          </div>

          {/* Text Content */}
          <div className="space-y-4">
            <motion.h1
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-4xl font-black text-white tracking-tight"
            >
              Login <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-amber-300">Successful</span>
            </motion.h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="text-slate-400 font-medium text-lg"
            >
              Welcome back! Setting up your workspace...
            </motion.p>
          </div>

          {/* Loading Indicator */}
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: "100%" }}
            transition={{ delay: 1, duration: 1.5 }}
            className="h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[240px] mx-auto mt-12 border border-white/5"
          >
            <motion.div 
              initial={{ x: "-100%" }}
              animate={{ x: "0%" }}
              transition={{ duration: 1.5, ease: "easeInOut" }}
              className="h-full bg-gradient-to-r from-orange-600 to-amber-400 w-full"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 }}
            className="flex items-center justify-center gap-2 text-orange-500/80 font-bold text-xs uppercase tracking-widest"
          >
            Redirecting to Dashboard <ArrowRight className="w-3 h-3 animate-bounce-x" />
          </motion.div>
        </motion.div>
      </div>

      <style jsx global>{`
        @keyframes bounce-x {
          0%, 100% { transform: translateX(0); }
          50% { transform: translateX(5px); }
        }
        .animate-bounce-x {
          animation: bounce-x 1s infinite;
        }
        .shadow-glow {
          filter: drop-shadow(0 0 8px rgba(251, 191, 36, 0.6));
        }
      `}</style>
    </div>
  );
}
