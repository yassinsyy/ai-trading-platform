import React from 'react';

/**
 * StaticSphereSVG — Статичная SVG сфера как fallback для слабых устройств
 * Используется когда Three.js не может загрузиться или устройство слабое
 */
export function StaticSphereSVG() {
  return (
    <div className="w-full h-full flex items-center justify-center">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 200 200"
        className="opacity-80"
        aria-label="Статичная сфера с бирюзовым свечением"
      >
        {/* Внешнее свечение */}
        <defs>
          <radialGradient id="sphereGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.3" />
            <stop offset="70%" stopColor="#00F5D4" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#00F5D4" stopOpacity="0" />
          </radialGradient>
          
          <radialGradient id="sphereCore" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#00D4B3" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#00D4B3" stopOpacity="0.2" />
          </radialGradient>
        </defs>
        
        {/* Внешнее свечение */}
        <circle
          cx="100"
          cy="100"
          r="85"
          fill="url(#sphereGlow)"
          className="animate-pulse"
        />
        
        {/* Основная сфера */}
        <circle
          cx="100"
          cy="100"
          r="60"
          fill="url(#sphereCore)"
          className="animate-pulse"
          style={{ animationDelay: '0.5s' }}
        />
        
        {/* Точки на сфере для имитации 3D эффекта */}
        {Array.from({ length: 12 }, (_, i) => {
          const angle = (i * 30) * (Math.PI / 180);
          const radius = 50 + Math.sin(i * 0.5) * 10;
          const x = 100 + Math.cos(angle) * radius;
          const y = 100 + Math.sin(angle) * radius;
          
          return (
            <circle
              key={i}
              cx={x}
              cy={y}
              r="2"
              fill="#00F5D4"
              opacity="0.7"
              className="animate-pulse"
              style={{ animationDelay: `${i * 0.1}s` }}
            />
          );
        })}
      </svg>
    </div>
  );
}
