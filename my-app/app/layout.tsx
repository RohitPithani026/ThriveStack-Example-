// app/layout.tsx

'use client';

import { ReactNode, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { Mona_Sans as FontSans } from 'next/font/google';
import './globals.css';
import { cn } from '@/lib/utils';
import { metadata } from './head';  // Import metadata from head.tsx
import { initMixpanel } from '@/lib/mixpanel';

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
    initMixpanel(); // Initialize Mixpanel
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
      </head>
      <body
        className={cn('min-h-screen bg-background font-sans antialiased', fontSans.variable)}
      >
        {children}
      </body>
    </html>
  );
}
