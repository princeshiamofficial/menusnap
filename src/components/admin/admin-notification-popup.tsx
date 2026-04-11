"use client";

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { io, Socket } from 'socket.io-client';

interface AdminNotification {
  message: string;
  title?: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
}

export function AdminNotificationPopup() {
  const [notification, setNotification] = useState<AdminNotification | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    // Import Varela Round for the exact repository style
    const link = document.createElement('link');
    link.href = 'https://fonts.googleapis.com/css2?family=Varela+Round&display=swap';
    link.rel = 'stylesheet';
    document.head.appendChild(link);

    const socketUrl = typeof window !== 'undefined' 
      ? `${window.location.protocol}//${window.location.hostname}:1234`
      : 'http://localhost:1234';
      
    const newSocket = io(socketUrl, {
      transports: ['websocket'],
    });

    newSocket.on('admin-notification', (data: AdminNotification) => {
      setNotification(data);
      setIsVisible(true);
    });

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []);

  const handleClose = () => {
    setIsVisible(false);
  };

  return (
    <AnimatePresence>
      {isVisible && notification && (
        <>
          {/* Overlay - Persistent (Removed click to close) */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/40 backdrop-blur-[4px] z-[9998]"
          />

          {/* Modal Container */}
          <div className="fixed inset-0 flex items-center justify-center z-[9999] pointer-events-none p-4 font-['Varela_Round',_sans-serif]">
            <motion.div
              initial={{ opacity: 0, scale: 0.85, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.85, y: 30 }}
              className="relative w-[95%] max-w-[450px] pointer-events-auto flex flex-col items-center"
            >
              
              {/* Part 1: Bear Head (Behind) */}
              <div className="mb-[-22px] z-[1] pointer-events-none">
                <svg width="150" height="110" viewBox="0 0 140 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Ears */}
                  <circle cx="35" cy="35" r="16" fill="white" stroke="#4A352F" strokeWidth="4"/>
                  <circle cx="105" cy="35" r="16" fill="white" stroke="#4A352F" strokeWidth="4"/>
                  {/* Head */}
                  <path d="M15 95C15 45 35 20 70 20C105 20 125 45 125 95" fill="white" stroke="#4A352F" strokeWidth="4"/>
                  {/* Eyes */}
                  <circle cx="58" cy="55" r="3.5" fill="#4A352F"/>
                  <circle cx="82" cy="55" r="3.5" fill="#4A352F"/>
                  {/* Mouth ("w" shape) */}
                  <path d="M65 65C65 66.5 66.5 68 68 68C69.5 68 70 66.5 70 65C70 66.5 70.5 68 72 68C73.5 68 75 66.5 75 65" stroke="#4A352F" strokeWidth="3" strokeLinecap="round"/>
                  {/* Blush */}
                  <circle cx="45" cy="62" r="6" fill="#FFD1D1" opacity="0.9"/>
                  <circle cx="95" cy="62" r="6" fill="#FFD1D1" opacity="0.9"/>
                </svg>
              </div>

              {/* Message Box */}
              <div className="relative w-full bg-white border-[4px] border-[#4A352F] rounded-[45px] p-[50px_35px_35px_35px] shadow-[0_12px_0px_rgba(74,53,47,0.08)] z-[2] text-center overflow-visible">
                
                {/* Part 2: Clutching Paws (Directly overlapping top edge) */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[10px] z-[3] pointer-events-none flex gap-[24px]">
                  <div className="w-[18px] h-[26px] bg-white border-[4px] border-[#4A352F] rounded-full" />
                  <div className="w-[18px] h-[26px] bg-white border-[4px] border-[#4A352F] rounded-full" />
                </div>

                <div className="space-y-[18px]">
                  <h3 className="text-[1.95rem] font-bold text-[#4A352F] tracking-tight leading-tight">
                    {notification.title || "Hello there!"}
                  </h3>
                  <p className="text-[1.05rem] leading-[1.6] text-[#6d5b57] font-medium max-h-[180px] overflow-y-auto no-scrollbar">
                    {notification.message}
                  </p>

                  <div className="pt-[12px] flex justify-center">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleClose}
                      className="inline-block bg-[#ffd1d1] border-[3.5px] border-[#4A352F] rounded-[15px] py-[10px] px-[26px] text-lg font-bold text-[#4A352F] transition-all shadow-[2px_2px_0px_rgba(74,53,47,0.1)] active:shadow-none translate-y-[-2px] active:translate-y-0"
                    >
                      Close
                    </motion.button>
                  </div>
                </div>
              </div>

            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
