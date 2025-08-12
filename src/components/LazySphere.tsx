import React, { Suspense, useState, useEffect } from 'react';
import { StaticSphereSVG } from './StaticSphereSVG';

// Расширяем типы для новых API
declare global {
  interface Navigator {
    deviceMemory?: number;
    connection?: {
      effectiveType: 'slow-2g' | '2g' | '3g' | '4g';
    };
  }
}

// Ленивая загрузка Sphere3D
const Sphere3D = React.lazy(() => import('./Sphere3D').then(module => ({ 
  default: module.Sphere3D 
})));

/**
 * LazySphere — Компонент для ленивой загрузки 3D сферы с fallback
 * Оптимизирован для мобильных устройств и слабых соединений
 */
export function LazySphere() {
  const [shouldLoad3D, setShouldLoad3D] = useState(false);
  const [isLowPerformance, setIsLowPerformance] = useState(false);

  useEffect(() => {
    // Проверяем производительность устройства
    const checkPerformance = () => {
      const isMobile = window.innerWidth < 768;
      
      // Безопасная проверка доступности API
      const hasLowMemory = navigator.deviceMemory !== undefined && navigator.deviceMemory < 4;
      const hasLowCores = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency < 4;
      const hasSlowConnection = navigator.connection !== undefined && 
        (navigator.connection.effectiveType === 'slow-2g' || 
         navigator.connection.effectiveType === '2g');

      console.log('LazySphere Debug:', {
        isMobile,
        hasLowMemory,
        hasLowCores,
        hasSlowConnection,
        deviceMemory: navigator.deviceMemory,
        hardwareConcurrency: navigator.hardwareConcurrency,
        connection: navigator.connection?.effectiveType
      });

      // Если устройство слабое, используем SVG fallback
      if (isMobile && (hasLowMemory || hasLowCores || hasSlowConnection)) {
        console.log('Using SVG fallback due to low performance');
        setIsLowPerformance(true);
        return;
      }

      // Загружаем 3D с небольшой задержкой для оптимизации
      const timer = setTimeout(() => {
        console.log('Loading 3D sphere');
        setShouldLoad3D(true);
      }, 100);

      return () => clearTimeout(timer);
    };

    checkPerformance();
  }, []);

  // Если устройство слабое, показываем только SVG
  if (isLowPerformance) {
    console.log('Rendering SVG fallback');
    return (
      <div className="w-[280px] h-[280px] opacity-80 flex items-center justify-center mobile-fade-in">
        <StaticSphereSVG />
      </div>
    );
  }

  console.log('Rendering LazySphere:', { shouldLoad3D, isLowPerformance });
  
  return (
    <div className="w-[280px] h-[280px] opacity-80 flex items-center justify-center">
      <Suspense 
        fallback={
          <div className="w-full h-full flex items-center justify-center mobile-fade-in">
            <StaticSphereSVG />
          </div>
        }
      >
        {shouldLoad3D ? (
          <div className="mobile-fade-in">
            <Sphere3D />
          </div>
        ) : (
          <div className="mobile-fade-in">
            <StaticSphereSVG />
          </div>
        )}
      </Suspense>
    </div>
  );
}
