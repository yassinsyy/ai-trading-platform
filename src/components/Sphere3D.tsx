// src/components/Sphere3D.tsx
import React, { useEffect, useRef, useCallback } from "react";
import * as THREE from "three";

/**
 * Sphere3D — 3D сфера с бирюзовым свечением.
 * Использует Three.js для создания интерактивной анимированной сферы.
 * Mobile-optimized: улучшенное качество и производительность
 */
export function Sphere3D() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const resizeTimeoutRef = useRef<NodeJS.Timeout>();

  // Debounced resize handler
  const debouncedResize = useCallback(() => {
    if (resizeTimeoutRef.current) {
      clearTimeout(resizeTimeoutRef.current);
    }
    resizeTimeoutRef.current = setTimeout(() => {
      // Resize logic will be handled in useEffect
    }, 150);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    // Check WebGL support
    const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
    if (!gl) return;

    // ====== SPHERE SETUP ======
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, 1, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ 
      canvas, 
      alpha: true,
      antialias: true, // Включаем антиалиасинг
      powerPreference: "high-performance", // Приоритет производительности
      preserveDrawingBuffer: false // Улучшает производительность
    });
    
    // Responsive canvas size with aspect ratio support
    const updateCanvasSize = () => {
      const rect = container.getBoundingClientRect();
      const isMobile = window.innerWidth < 768;
      const isLowPerformance = navigator.hardwareConcurrency && navigator.hardwareConcurrency < 4;
      
      // Размер на основе контейнера
      const containerSize = Math.min(rect.width, rect.height);
      const size = isMobile ? Math.min(containerSize, 320) : Math.min(containerSize, 480);
      
      // Pixel ratio с ограничением для производительности
      const pixelRatio = isLowPerformance ? 1 : Math.min(window.devicePixelRatio, 2);
      
      renderer.setSize(size, size);
      renderer.setPixelRatio(pixelRatio);
      canvas.style.width = `${size}px`;
      canvas.style.height = `${size}px`;
    };
    
    updateCanvasSize();
    window.addEventListener('resize', debouncedResize);

    // Основная сфера из точек с бирюзовым свечением
    const geometry = new THREE.SphereGeometry(3, 64, 64);
    const material = new THREE.PointsMaterial({ 
      color: 0x00F5D4, // Фирменный бирюзовый
      size: 0.04, // Увеличили размер точек
      transparent: true,
      opacity: 0.7, // Увеличили прозрачность
      blending: THREE.AdditiveBlending,
      map: null
    });
    
    // Внешняя сфера с более ярким бирюзовым свечением
    const glowGeometry = new THREE.SphereGeometry(3.2, 32, 32);
    const glowMaterial = new THREE.PointsMaterial({
      color: 0x00F5D4, // Фирменный бирюзовый
      size: 0.08, // Увеличили размер точек
      transparent: true,
      opacity: 0.4, // Увеличили прозрачность
      blending: THREE.AdditiveBlending
    });
    const glowSphere = new THREE.Points(glowGeometry, glowMaterial);
    scene.add(glowSphere);
    
    // Внутренняя сфера с более темным оттенком бирюзового
    const innerGeometry = new THREE.SphereGeometry(2.8, 48, 48);
    const innerMaterial = new THREE.PointsMaterial({
      color: 0x00D4B3, // Более темный оттенок бирюзового
      size: 0.03, // Увеличили размер точек
      transparent: true,
      opacity: 0.5, // Увеличили прозрачность
      blending: THREE.AdditiveBlending
    });
    const innerSphere = new THREE.Points(innerGeometry, innerMaterial);
    scene.add(innerSphere);
    
    const sphere = new THREE.Points(geometry, material);
    scene.add(sphere);

    camera.position.z = 6;

    // Анимация с FPS monitoring
    let animationId: number;
    let frameCount = 0;
    let lastTime = performance.now();
    let fps = 60;

    function animate() {
      const currentTime = performance.now();
      frameCount++;
      
      if (currentTime - lastTime >= 1000) {
        fps = frameCount;
        frameCount = 0;
        lastTime = currentTime;
      }

      // Анимация работает на всех устройствах
      sphere.rotation.y += 0.004;
      sphere.rotation.x += 0.002;
      glowSphere.rotation.y += 0.003;
      glowSphere.rotation.x += 0.001;
      innerSphere.rotation.y += 0.005;
      innerSphere.rotation.x += 0.003;
      
      renderer.render(scene, camera);
      animationId = requestAnimationFrame(animate);
    }
    animate();

    // Cleanup function
    const cleanup = () => {
      // Очищаем canvas
      renderer.clear();
      
      // Dispose geometries and materials
      geometry.dispose();
      material.dispose();
      glowGeometry.dispose();
      glowMaterial.dispose();
      innerGeometry.dispose();
      innerMaterial.dispose();
      
      // Dispose renderer
      renderer.dispose();
      
      // Remove event listeners
      window.removeEventListener('resize', debouncedResize);
      
      // Clear timeout
      if (resizeTimeoutRef.current) {
        clearTimeout(resizeTimeoutRef.current);
      }
      
      // Cancel animation
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };

    return cleanup;
  }, [debouncedResize]);

  return (
    <div
      ref={containerRef}
      className="flex items-center justify-center w-[320px] h-[320px] md:w-[390px] md:h-[390px] xl:w-[420px] xl:h-[420px] relative"
      aria-hidden="true"
    >
      {/* Premium glow effect container */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#00F5D4]/10 to-transparent rounded-full blur-sm" />
      
      <canvas 
        ref={canvasRef}
        className="w-full h-full relative z-10"
        id="sphere-3d-canvas"
        role="presentation"
        aria-label="3D анимированная сфера с бирюзовым свечением"
      />
    </div>
  );
} 