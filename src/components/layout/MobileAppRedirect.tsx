
"use client";

import { useEffect } from 'react';

// IMPORTANT: Replace 'yourcustomappscheme://open' with your actual mobile app's URL scheme or universal link.
// Example for a specific page: 'yourcustomappscheme://dashboard'
// Example universal link: 'https://app.yourdomain.com/some/path'
const MOBILE_APP_URL_SCHEME = 'yourcustomappscheme://open'; 

export function MobileAppRedirect() {
  useEffect(() => {
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    if (isMobileDevice) {
      console.log(`Mobile device detected. Attempting to redirect to: ${MOBILE_APP_URL_SCHEME}`);
      // This attempts to open your mobile app.
      // If the app is not installed, or the URL scheme/universal link is not configured correctly,
      // this may do nothing, or the browser might show an error for unknown schemes.
      window.location.href = MOBILE_APP_URL_SCHEME;

      // Note: Reliably detecting if the app opened and then falling back to an app store
      // page is complex and often involves timeouts, which can be unreliable.
      // For simplicity, this component only attempts the direct redirection.
      // You might want to explore more sophisticated deep linking libraries if robust fallback is needed.
    }
  }, []);

  return null; // This component does not render any UI
}
