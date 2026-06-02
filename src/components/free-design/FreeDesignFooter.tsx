"use client";

import React from "react";

export function FreeDesignFooter() {
  return (
    <footer className="w-full bg-black text-neutral-400 pt-4 pb-4 md:pt-6 md:pb-8 px-4 md:px-8 lg:px-16 font-sans relative overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col items-center gap-5 relative z-10">
        
        {/* ROW 1: Social Contact Buttons & Support 24/7 */}
        {/* Contacts & Policies Sub-Container to reduce gap by 70% */}
        <div className="w-full flex flex-col items-center gap-3">
          {/* ROW 1: Social Contact Buttons & Support 24/7 */}
          <div className="w-full flex flex-row items-center justify-center gap-3 sm:gap-6 md:gap-8">
            
            {/* Action Icons (Call, Messenger, WhatsApp) */}
            <div className="flex items-center gap-2 sm:gap-4">
              {/* Phone Call */}
              <a 
                href="tel:+8801919760626" 
                className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0"
                aria-label="Call Support"
              >
                <i className="bi bi-telephone-fill text-base md:text-2xl text-white"></i>
              </a>
              
              {/* FB Messenger */}
              <a 
                href="https://m.me/menusnap" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-tr from-blue-600 via-blue-500 to-cyan-400 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0"
                aria-label="Contact Messenger"
              >
                <i className="bi bi-messenger text-base md:text-2xl text-white"></i>
              </a>
              
              {/* WhatsApp */}
              <a 
                href="https://wa.me/8801919760626" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-tr from-green-500 to-emerald-500 flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-transform duration-200 shrink-0"
                aria-label="Contact WhatsApp"
              >
                <i className="bi bi-whatsapp text-lg md:text-[26px] text-white"></i>
              </a>
            </div>

            {/* Support Headset Group */}
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="w-12 h-12 sm:w-16 md:w-[104px] md:h-[104px] shrink-0">
                <img 
                  src="/spmic.webp" 
                  alt="Support Headset" 
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-red-600 text-[9px] sm:text-xs md:text-base font-bold tracking-wide leading-tight bn-support-text relative sm:-left-[8%] z-10">Support 24/7</span>
                <a href="tel:+8801919760626" className="text-white text-xs sm:text-sm md:text-lg font-bold tracking-wide hover:text-red-500 transition-colors leading-tight relative sm:-left-[5%] z-10">
                  +8801919-760626
                </a>
                <a href="mailto:menusnap.official@gmail.com" className="text-red-500 text-[9px] sm:text-[10px] md:text-sm font-normal hover:underline leading-tight relative sm:-left-[20%] z-10">
                  menusnap.official@gmail.com
                </a>
              </div>
            </div>

          </div>

          {/* ROW 2: Policy Links */}
          <div className="w-full text-center py-1">
            <div className="flex flex-wrap items-center justify-center gap-x-2 sm:gap-x-3 gap-y-2 text-xs sm:text-xl font-normal tracking-wide text-red-600">
              <a href="/privacy-policy" className="hover:text-white transition-colors">Privacy Policy</a>
              <span className="text-neutral-600 font-normal">|</span>
              <a href="/terms-of-service" className="hover:text-white transition-colors">Terms of Service</a>
              <span className="text-neutral-600 font-normal">|</span>
              <a href="/refund-policy" className="hover:text-white transition-colors">Refund Policy</a>
            </div>
          </div>
        </div>


        {/* Social Icons, Payment Banner, & Address/Copyright Wrapper to control spacing */}
        <div className="w-full flex flex-col items-center gap-2">
          {/* ROW 4: Social Media Share Icons */}
          <div className="flex items-center justify-center gap-4 py-2">
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#1E1E1E] rounded-xl flex items-center justify-center text-white hover:bg-[#caa460] hover:text-black transition-colors duration-300">
              <i className="bi bi-facebook text-lg"></i>
            </a>
            <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#1E1E1E] rounded-xl flex items-center justify-center text-white hover:bg-[#caa460] hover:text-black transition-colors duration-300">
              <i className="bi bi-twitter text-lg"></i>
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#1E1E1E] rounded-xl flex items-center justify-center text-white hover:bg-[#caa460] hover:text-black transition-colors duration-300">
              <i className="bi bi-instagram text-lg"></i>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="w-10 h-10 bg-[#1E1E1E] rounded-xl flex items-center justify-center text-white hover:bg-[#caa460] hover:text-black transition-colors duration-300">
              <i className="bi bi-linkedin text-lg"></i>
            </a>
          </div>

          {/* ROW 5: Payment Gateway Logos Banner (SSLCOMMERZ Strip) */}
          <div className="w-full overflow-hidden py-2 border-t border-b border-neutral-900/60">
            <div className="max-w-5xl mx-auto px-4 flex justify-center">
              <img 
                src="/SSLCommerz.webp" 
                alt="Payment Gateways SSLCommerz" 
                className="max-w-full h-auto object-contain"
              />
            </div>
          </div>

          {/* ROW 6: Address & Copyright Footer */}
          <div className="w-full flex flex-col items-center text-center gap-2 pt-3.5 border-t border-neutral-900/60">
            <span className="text-neutral-300 text-base sm:text-lg font-normal tracking-wide font-bengali">
              House No. 14, Road No. A, Block A, Sontek, South Kajla, Jatrabari, Dhaka - 1236
            </span>
            <span className="text-neutral-400 text-[10px] sm:text-xs font-normal tracking-wide">
                © Menu Snap - All rights reserved
              </span>
            {/* 
            <a 
              href="https://www.facebook.com/mehanahmed.me" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="text-white text-[10px] sm:text-xs font-medium tracking-wide flex items-center gap-1"
            >
              <span>Design and Managed by:</span>
              <i className="bi bi-facebook text-[#1877F2]"></i>
              <span>Mehan Ahmed</span>
            </a>
            */}
          </div>
        </div>

      </div>

      {/* Styled JSX for Premium Metallic Gold and Brand Text */}
      <style jsx global>{`
        .gold-text-gradient {
          background: linear-gradient(135deg, #ffe5a3 0%, #caa460 50%, #936c2e 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
      `}</style>
    </footer>
  );
}
