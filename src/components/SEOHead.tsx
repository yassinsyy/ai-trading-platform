// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useEffect } from 'react';

// Extend Window interface for gtag
declare global {
  interface Window {
    gtag: (...args: any[]) => void;
    dataLayer: any[];
  }
}

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
}

export default function SEOHead({
  title = "DIM Partners - Внедрение Power BI под ключ в Казахстане",
  description = "Внедрение Power BI под ключ в Казахстане. Автоматизация управленческой отчетности, BI-аналитика для бизнеса, настройка финансовой отчетности. Консалтинг по Power BI и создание KPI-систем.",
  keywords = "внедрение Power BI под ключ, автоматизация управленческой отчетности, BI-аналитика для бизнеса, настройка финансовой отчетности, консалтинг Power BI, построение дашбордов Power BI, Power BI + 1C интеграция, KPI в Power BI, визуализация данных Power BI, облачная аналитика Power BI, разработка P&L ДДС баланс Power BI, автоматизация отчетов из 1С, визуализация финансовых показателей, решение для управленческого учета, как контролировать финансы компании, отчеты для собственника бизнеса, консалтинг по управленческой отчетности, внедрение дашбордов для отдела продаж, BI-системы, консалтинг, аналитика, Казахстан, Астана, Алматы",
  image = "/images/og-image.jpg",
  url = process.env.NODE_ENV === 'production' ? "https://dim-partners.kz" : "https://localhost:3000",
  type = "website",
  author = "DIM Partners",
  publishedTime,
  modifiedTime,
  section = "Консалтинг",
  tags = ["консалтинг", "аналитика", "бизнес"]
}: SEOHeadProps) {
  const siteName = "DIM Partners";
  const fullTitle = title.includes(siteName) ? title : `${title} | ${siteName}`;
  
  useEffect(() => {
    // Add Google Analytics
    const addGoogleAnalytics = () => {
      // Check if gtag is already loaded
      if (typeof window.gtag === 'function') return;
      
      // Add gtag script
      const script1 = document.createElement('script');
      script1.async = true;
      script1.src = 'https://www.googletagmanager.com/gtag/js?id=G-BHZ77DCM5M';
      document.head.appendChild(script1);
      
      // Add gtag configuration
      const script2 = document.createElement('script');
      script2.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', 'G-BHZ77DCM5M');
      `;
      document.head.appendChild(script2);
    };
    
    // Function to add Yandex Metrika
    const addYandexMetrika = () => {
      // Add Yandex Metrika script
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.innerHTML = `
        (function(m,e,t,r,i,k,a){
            m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
            m[i].l=1*new Date();
            for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
            k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
        })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=103635516', 'ym');

        ym(103635516, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", accurateTrackBounce:true, trackLinks:true});
      `;
      document.head.appendChild(script);
      
      // Add noscript fallback
      const noscript = document.createElement('noscript');
      const div = document.createElement('div');
      const img = document.createElement('img');
      img.src = 'https://mc.yandex.ru/watch/103635516';
      img.style.position = 'absolute';
      img.style.left = '-9999px';
      img.alt = '';
      div.appendChild(img);
      noscript.appendChild(div);
      document.head.appendChild(noscript);
    };
    
    // Add Google Analytics if not already present
    if (!document.querySelector('script[src*="googletagmanager.com"]')) {
      addGoogleAnalytics();
    }
    
    // Add Yandex Metrika if not already present
    if (!document.querySelector('script[src*="mc.yandex.ru"]')) {
      addYandexMetrika();
    }
    
    // Update document title
    document.title = fullTitle;
    
    // Update meta description
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description);
    
    // Update meta keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.head.appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', keywords);
    
    // Update Open Graph tags
    const ogTags = [
      { property: 'og:type', content: type },
      { property: 'og:url', content: url },
      { property: 'og:title', content: fullTitle },
      { property: 'og:description', content: description },
      { property: 'og:image', content: image },
      { property: 'og:site_name', content: siteName },
      { property: 'og:locale', content: 'ru_RU' }
    ];
    
    ogTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[property="${tag.property}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('property', tag.property);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });
    
    // Update Twitter tags
    const twitterTags = [
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:url', content: url },
      { name: 'twitter:title', content: fullTitle },
      { name: 'twitter:description', content: description },
      { name: 'twitter:image', content: image }
    ];
    
    twitterTags.forEach(tag => {
      let metaTag = document.querySelector(`meta[name="${tag.name}"]`);
      if (!metaTag) {
        metaTag = document.createElement('meta');
        metaTag.setAttribute('name', tag.name);
        document.head.appendChild(metaTag);
      }
      metaTag.setAttribute('content', tag.content);
    });
    
    // Update canonical URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', url);
    
  }, [fullTitle, description, keywords, url, type, image, siteName]);

  return null;
} 