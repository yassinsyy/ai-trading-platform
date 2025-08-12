import React from 'react';

interface StructuredDataProps {
  type: 'organization' | 'course' | 'article' | 'website';
  data: any;
}

export default function StructuredData({ type, data }: StructuredDataProps) {
  const getStructuredData = () => {
    switch (type) {
      case 'organization':
        return {
          "@context": "https://schema.org",
          "@type": "Organization",
          "name": "DIM Partners",
          "url": "https://dim-partners.kz",
          "logo": "https://dim-partners.kz/images/logo.png",
          "description": "Внедрение Power BI под ключ в Казахстане. Автоматизация управленческой отчетности, BI-аналитика для бизнеса, настройка финансовой отчетности. Консалтинг по Power BI и создание KPI-систем.",
          "address": {
            "@type": "PostalAddress",
            "addressCountry": "KZ",
            "addressLocality": "Алматы"
          },
          "contactPoint": {
            "@type": "ContactPoint",
            "telephone": "+7-xxx-xxx-xxxx",
            "contactType": "customer service",
            "availableLanguage": "Russian"
          },
          "sameAs": [
            "https://t.me/dimpartners",
            "https://linkedin.com/company/dimpartners"
          ],
          "foundingDate": "2019",
          "numberOfEmployees": "10-50",
          "serviceArea": {
            "@type": "Country",
            "name": "Kazakhstan"
          }
        };

      case 'course':
        return {
          "@context": "https://schema.org",
          "@type": "Course",
          "name": "Power BI и аналитика на уровне топ-консалтинга",
          "description": "Освойте Power BI и аналитику на уровне топ-консалтинга. Практика на реальных кейсах, 50+ проектов, методика лидеров.",
          "provider": {
            "@type": "Organization",
            "name": "DIM Partners",
            "url": "https://dim-partners.kz"
          },
          "courseMode": "online",
          "educationalLevel": "intermediate",
          "inLanguage": "ru",
          "timeRequired": "PT40H",
          "coursePrerequisites": "Базовые знания Excel",
          "teaches": [
            "Power BI",
            "Бизнес-аналитика", 
            "Стратегическое мышление",
            "Консалтинговые методики"
          ],
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "KZT",
            "availability": "https://schema.org/InStock"
          }
        };

      case 'article':
        return {
          "@context": "https://schema.org",
          "@type": "Article",
          "headline": data.title || "Статья о консалтинге",
          "description": data.description || "Актуальная статья о консалтинге и аналитике",
          "author": {
            "@type": "Organization",
            "name": "DIM Partners"
          },
          "publisher": {
            "@type": "Organization",
            "name": "DIM Partners",
            "logo": {
              "@type": "ImageObject",
              "url": "https://dim-partners.kz/images/logo.png"
            }
          },
          "datePublished": data.publishedTime || new Date().toISOString(),
          "dateModified": data.modifiedTime || new Date().toISOString(),
          "mainEntityOfPage": {
            "@type": "WebPage",
            "@id": data.url || "https://dim-partners.kz/blog"
          }
        };

      case 'website':
        return {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "DIM Partners",
          "url": "https://dim-partners.kz",
          "description": "Консалтинговая компания в Казахстане",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://dim-partners.kz/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };

      default:
        return null;
    }
  };

  const structuredData = getStructuredData();

  if (!structuredData) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(structuredData)
      }}
    />
  );
} 