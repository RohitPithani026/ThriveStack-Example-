// app/layout.tsx

'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Mona_Sans as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { metadata } from './head';  // Import metadata from head.tsx
import mixpanel from "mixpanel-browser";
import amplitude from 'amplitude-js';

const fontSans = FontSans({
  subsets: ['latin'],
  variable: '--font-sans',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const pathname = usePathname();

  useEffect(() => {
    // Initialize Amplitude
    amplitude.getInstance().init('4422bcec4debfc8b62f6b85ea73ae5a7');
  }, []);

  useEffect(() => {
    // Only run this on the client side
    if (typeof window !== "undefined") {
      mixpanel.init("96b5f76ad22e3b2fbdee6a0085e30c3e", {
        debug: true,
      });

      // Track page views on initial load
      mixpanel.track("Page Viewed", {
        page: window.location.pathname,
      });

      // Track page views on route change (client-side routing)
      const handleRouteChange = (event: PopStateEvent) => {
        mixpanel.track("Page Viewed", {
          page: window.location.pathname, // Use the current location after a route change
        });
      };

      // Track initial page load
      mixpanel.track("Page Viewed", {
        page: window.location.pathname,
      });

      mixpanel.track("Page View", {
        page: window.location.pathname,
      });

      window.addEventListener("popstate", handleRouteChange);

      return () => {
        // Clean up the event listener on unmount
        window.removeEventListener("popstate", handleRouteChange);
      };
    }
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const amplitudeScript = document.createElement('script');
      amplitudeScript.src =
        'https://cdn.amplitude.com/libs/analytics-browser-2.11.1-min.js.gz';
      amplitudeScript.async = true;
      document.head.appendChild(amplitudeScript);

      const sessionReplayScript = document.createElement('script');
      sessionReplayScript.src =
        'https://cdn.amplitude.com/libs/plugin-session-replay-browser-1.8.0-min.js.gz';
      sessionReplayScript.async = true;
      document.head.appendChild(sessionReplayScript);

      sessionReplayScript.onload = () => {
        window.amplitude.add(window.sessionReplay.plugin({ sampleRate: 1 }));
        window.amplitude.init('4422bcec4debfc8b62f6b85ea73ae5a7', {
          autocapture: { elementInteractions: true },
        });
      };
    }
  }, []);

  useEffect(() => {
    if (pathname) {
      if (typeof window !== 'undefined' && window.amplitude) {
        window.amplitude.logEvent('page_view', { page: pathname });
      }
    }
  }, [pathname]);

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Google Analytics Global Site Tag */}
        <script
          async
          src={`https://www.googletagmanager.com/gtag/js?id=G-RTEY772S3D`}
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-RTEY772S3D', {
                page_path: window.location.pathname,
              });
            `,
          }}
        />
        <script src="https://ts-script.app.thrivestack.ai/latest/thrivestack.js"
          api-key="/0h1H3frdqN8u1C99q03MMu+VO8YbQeXbNa1VQPXf3A="
          data-source="marketing">
        </script>
        <script src="https://ts-script.app.thrivestack.ai/latest/thrivestack.js"
          api-key="/0h1H3frdqN8u1C99q03MMu+VO8YbQeXbNa1VQPXf3A="
          data-source="product">
        </script>
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}
      >
        {children}
      </body>
    </html>
  );
}
