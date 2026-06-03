'use client';

import Script from 'next/script';
import { usePathname } from 'next/navigation';

export function MicrosoftClarityLoader() {
  const pathname = usePathname();

  // Disable Microsoft Clarity on admin pages
  if (pathname?.startsWith('/m-admin') || pathname?.startsWith('/panel')) {
    return null;
  }

  return (
    <Script
      id="microsoft-clarity"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{
        __html: `
          (function(c,l,a,r,i,t,y){
            c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
            t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
            y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
          })(window, document, "clarity", "script", "wc1ds6399n");
        `,
      }}
    />
  );
}
