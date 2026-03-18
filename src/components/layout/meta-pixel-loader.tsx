
'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname, useSearchParams } from 'next/navigation';
import { getMetaPixelSettings, type MetaPixelSettings } from '@/app/actions/meta-events';

export function MetaPixelScriptLoader() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [settings, setSettings] = useState<MetaPixelSettings | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const s = await getMetaPixelSettings();
        setSettings(s);
      } catch (err) {
        console.error('Failed to load Meta Pixel settings', err);
      }
    }
    fetchSettings();
  }, []);

  // Track pageviews on route changes
  useEffect(() => {
    if (settings?.isEnabled && settings?.pixelId && window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [pathname, searchParams, settings]);

  if (!settings?.isEnabled || !settings?.pixelId) {
    return null;
  }

  return (
    <>
      <Script
        id="fb-pixel"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            !function(f,b,e,v,n,t,s)
            {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
            n.callMethod.apply(n,arguments):n.queue.push(arguments)};
            if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
            n.queue=[];t=b.createElement(e);t.async=!0;
            t.src=v;s=b.getElementsByTagName(e)[0];
            s.parentNode.insertBefore(t,s)}(window, document,'script',
            'https://connect.facebook.net/en_US/fbevents.js');
            fbq('init', '${settings.pixelId}');
            fbq('track', 'PageView');
          `,
        }}
      />
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: 'none' }}
          src={`https://www.facebook.com/tr?id=${settings.pixelId}&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
}
