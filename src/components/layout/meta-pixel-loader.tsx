
'use client';

import { useEffect } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { getMetaPixelSettings } from '@/app/actions/meta-events';

// Store the loaded state to prevent re-injection on navigation
let pixelLoaded = false;

// Helper function for the noscript tag
const noscript = (pixelId: string) => {
  const noscript = document.createElement('noscript');
  const img = document.createElement('img');
  img.height = 1;
  img.width = 1;
  img.style.display = 'none';
  img.src = `https://www.facebook.com/tr?id=${pixelId}&ev=PageView&noscript=1`;
  noscript.appendChild(img);
  document.head.appendChild(noscript);
};

export function MetaPixelScriptLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    let active = true;

    async function loadPixel() {
      if (pixelLoaded) {
        // If the base script is already loaded, just send pageview events on navigation
        if (window.fbq) {
          window.fbq('track', 'PageView');
        }
        return;
      }
      
      const settings = await getMetaPixelSettings();

      if (active && settings.isEnabled && settings.pixelId) {
        
        // Mark as loaded so this block doesn't run again
        pixelLoaded = true;

        // Initialize the fbq function
        window.fbq = window.fbq || function() {
          (window.fbq.q = window.fbq.q || []).push(arguments);
        };
        if (!window.fbq.loaded) {
          window.fbq.loaded = true;
          window.fbq.version = '2.0';
          window.fbq.queue = [];
        }
        
        // Inject the script
        const script = document.createElement('script');
        script.async = true;
        script.src = `https://connect.facebook.net/en_US/fbevents.js`;
        script.onload = () => {
          if (window.fbq) {
            window.fbq('init', settings.pixelId);
            window.fbq('track', 'PageView'); // Initial page view
          }
        };
        document.head.appendChild(script);

        // Add the noscript tag for browsers that don't support JavaScript
        noscript(settings.pixelId);
      }
    }

    loadPixel();

    return () => {
      active = false;
    };
  }, [pathname, searchParams]);

  return null;
}
