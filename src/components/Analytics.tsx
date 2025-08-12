// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react';

interface AnalyticsProps {
  googleAnalyticsId?: string;
  yandexMetrikaId?: string;
}

export default function Analytics({ 
  googleAnalyticsId = process.env.REACT_APP_GA_ID,
  yandexMetrikaId = process.env.REACT_APP_YANDEX_METRIKA_ID 
}: AnalyticsProps) {
  
  useEffect(() => {
    // Google Analytics
    if (googleAnalyticsId) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`;
      document.head.appendChild(script);

      window.dataLayer = window.dataLayer || [];
      const gtag = (...args: any[]) => {
        window.dataLayer.push(args);
      };
      gtag('js', new Date());
      gtag('config', googleAnalyticsId, {
        page_title: document.title,
        page_location: window.location.href
      });

      // Track page views
      const handleRouteChange = () => {
        gtag('config', googleAnalyticsId, {
          page_title: document.title,
          page_location: window.location.href
        });
      };

      window.addEventListener('popstate', handleRouteChange);
      return () => window.removeEventListener('popstate', handleRouteChange);
    }

    // Yandex Metrika
    if (yandexMetrikaId) {
      const ym = (window as any).ym || function() {
        (window as any).ym.a = (window as any).ym.a || [];
        (window as any).ym.a.push(arguments);
      };
      (window as any).ym = ym;
      (window as any).ym.l = new Date().getTime();

      const script = document.createElement('script');
      script.async = true;
      script.src = 'https://mc.yandex.ru/metrika/tag.js';
      document.head.appendChild(script);

      (window as any).ym(yandexMetrikaId, "init", {
        clickmap: true,
        trackLinks: true,
        accurateTrackBounce: true,
        webvisor: true
      });
    }
  }, [googleAnalyticsId, yandexMetrikaId]);

  return null;
}

// Extend Window interface for Google Analytics
declare global {
  interface Window {
    dataLayer: any[];
    ym: any;
  }
} 