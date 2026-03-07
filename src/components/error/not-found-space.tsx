"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { Rocket, Sparkles, Orbit, Moon, Satellite, Stars } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NotFoundSpaceProps {
    title?: string;
    message?: string;
}

export function NotFoundSpace({
    title = "404",
    message = "Hey captain! Looks like you're heading to a wrong planet!"
}: NotFoundSpaceProps) {
    return (
        <div className="flex flex-col h-screen w-full items-center justify-center bg-white font-sans px-4 text-center overflow-hidden relative">
            {/* Background Decorative Elements */}
            <motion.div
                className="absolute top-1/4 left-1/4 text-gray-200"
                animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
                <Satellite size={40} />
            </motion.div>

            <motion.div
                className="absolute bottom-1/3 left-1/3 text-gray-200"
                animate={{ scale: [1, 1.2, 1], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            >
                <Moon size={32} />
            </motion.div>

            <motion.div
                className="absolute top-1/3 right-1/4 text-gray-200"
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            >
                <Orbit size={48} />
            </motion.div>

            <motion.div
                className="absolute bottom-1/4 right-1/3 text-gray-100"
            >
                <Stars size={60} />
            </motion.div>

            {/* Central Illustration Area */}
            <div className="relative mb-8">
                {/* Shooting Star / Rocket */}
                <motion.div
                    className="absolute -top-24 -left-20 text-gray-800"
                    initial={{ x: -100, y: -100, opacity: 0 }}
                    animate={{ x: 0, y: 0, opacity: 1 }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                >
                    <div className="relative">
                        <Rocket size={48} className="rotate-[-45deg]" />
                        <div className="absolute top-0 left-0 w-24 h-[2px] bg-gradient-to-r from-transparent via-gray-300 to-transparent rotate-[-45deg] origin-left -translate-x-12 translate-y-6" />
                        <div className="absolute top-2 left-2 w-16 h-[1px] bg-gray-200 rotate-[-45deg] origin-left -translate-x-8 translate-y-4" />
                    </div>
                </motion.div>

                {/* The Planet */}
                <motion.div
                    className="relative z-10"
                    animate={{ y: [0, -10, 0] }}
                    transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                    <div className="w-32 h-32 rounded-full bg-red-100 border-2 border-gray-800 flex items-center justify-center relative shadow-inner">
                        {/* Question Marks on Planet */}
                        <span className="text-red-400 font-bold text-4xl absolute top-4 left-6 rotate-[-15deg]">?</span>
                        <span className="text-red-500 font-bold text-3xl absolute bottom-6 right-8 rotate-[10deg]">?</span>
                        <span className="text-red-300 font-extrabold text-2xl absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-50">?</span>

                        {/* Orbit path around planet */}
                        <div className="absolute inset-[-10px] border border-gray-300 rounded-full rotate-[20deg]" />
                        <div className="absolute w-3 h-3 bg-gray-800 rounded-full top-0 right-4" />
                    </div>
                </motion.div>

                {/* Decorative Sparkles */}
                <div className="absolute -top-4 -right-8 text-gray-400">
                    <Sparkles size={24} />
                </div>
            </div>

            {/* Content */}
            <motion.h1
                className="text-8xl font-black text-gray-900 mb-4 tracking-tighter"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                {title}
            </motion.h1>

            <motion.p
                className="text-gray-500 text-lg mb-8 font-medium max-w-md mx-auto"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
            >
                {message}
            </motion.p>

            {/* Static background stars */}
            <div className="absolute top-10 left-10 text-gray-100"><Sparkles size={16} /></div>
            <div className="absolute top-20 right-20 text-gray-200 opacity-30 rotate-45"><Sparkles size={12} /></div>
            <div className="absolute bottom-20 left-1/4 text-gray-100"><Sparkles size={20} /></div>
            <div className="absolute bottom-40 right-10 text-gray-200 opacity-20"><Sparkles size={14} /></div>
        </div>
    );
}
