'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';
import { usePathname } from 'next/navigation';
import { getGtmSettings, type GtmSettings } from '@/app/actions/gtm-settings';

export function GtmScriptLoader() {
  const pathname = usePathname();
  const [settings, setSettings] = useState<GtmSettings | null>(null);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const s = await getGtmSettings();
        setSettings(s);
      } catch (err) {
        console.error('Failed to load GTM settings', err);
      }
    }
    fetchSettings();
  }, []);

  // Disable GTM on admin pages
  if (pathname?.startsWith('/m-admin') || pathname?.startsWith('/panel')) {
    return null;
  }

  if (!settings?.isEnabled || !settings?.gtmId) {
    return null;
  }

  const cleanGtmId = settings.gtmId.trim();

  return (
    <>
      <Script
        id="gtm-script"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
            })(window,document,'script','dataLayer','${cleanGtmId}');
          `,
        }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${cleanGtmId}`}
          height="0"
          width="0"
          style={{ display: 'none', visibility: 'hidden' }}
        />
      </noscript>
    </>
  );
}
