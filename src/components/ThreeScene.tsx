import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import * as THREE from 'three';

const ThreeScene: React.FC = () => {
  const mountRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const animationIdRef = useRef<number | null>(null);

  useEffect(() => {
    if (!mountRef.current) return;

    // Создание сцены, камеры и рендерера
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, mountRef.current.clientWidth / mountRef.current.clientHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    rendererRef.current = renderer;
    renderer.setSize(mountRef.current.clientWidth, mountRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.shadowMap.enabled = true;
    renderer.setClearColor(0x000000, 0); // Прозрачный фон
    mountRef.current.appendChild(renderer.domElement);

    // Освещение
    const ambientLight = new THREE.AmbientLight(0x66FCF1, 0.4);
    scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0x66FCF1, 0.8);
    directionalLight.position.set(5, 5, 5);
    directionalLight.castShadow = true;
    scene.add(directionalLight);

    const pointLight = new THREE.PointLight(0x45A29E, 1, 100);
    pointLight.position.set(-5, 5, 5);
    scene.add(pointLight);

    // Создание основной сферы
    const sphereGeometry = new THREE.SphereGeometry(1, 32, 32);
    const sphereMaterial = new THREE.MeshPhongMaterial({
      color: 0x66FCF1,
      transparent: true,
      opacity: 0.8,
      shininess: 100
    });
    const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);

    // Создание маленьких орбитальных сфер
    const smallSpheres: THREE.Mesh[] = [];
    for (let i = 0; i < 8; i++) {
      const smallSphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const smallSphereMaterial = new THREE.MeshPhongMaterial({
        color: 0x45A29E,
        transparent: true,
        opacity: 0.6
      });
      const smallSphere = new THREE.Mesh(smallSphereGeometry, smallSphereMaterial);
      
      const angle = (i / 8) * Math.PI * 2;
      const radius = 2;
      smallSphere.position.x = Math.cos(angle) * radius;
      smallSphere.position.z = Math.sin(angle) * radius;
      smallSphere.position.y = Math.sin(angle * 2) * 0.5;
      
      scene.add(smallSphere);
      smallSpheres.push(smallSphere);
    }

    // Создание системы частиц
    const particleCount = 100;
    const particleGeometry = new THREE.BufferGeometry();
    const particlePositions = new Float32Array(particleCount * 3);
    
    for (let i = 0; i < particleCount * 3; i += 3) {
      particlePositions[i] = (Math.random() - 0.5) * 10;
      particlePositions[i + 1] = (Math.random() - 0.5) * 10;
      particlePositions[i + 2] = (Math.random() - 0.5) * 10;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));
    
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x66FCF1,
      size: 0.05,
      transparent: true,
      opacity: 0.6
    });
    
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Анимационный цикл
    const animate = () => {
      animationIdRef.current = requestAnimationFrame(animate);
      
      // Вращение основной сферы
      sphere.rotation.x += 0.01;
      sphere.rotation.y += 0.01;

      // Анимация маленьких сфер
      smallSpheres.forEach((smallSphere, index) => {
        const time = Date.now() * 0.001;
        const angle = (index / 8) * Math.PI * 2 + time * 0.5;
        const radius = 2;
        smallSphere.position.x = Math.cos(angle) * radius;
        smallSphere.position.z = Math.sin(angle) * radius;
        smallSphere.position.y = Math.sin(angle * 2 + time) * 0.5;
        smallSphere.rotation.x += 0.02;
        smallSphere.rotation.y += 0.02;
      });

      // Анимация частиц
      particles.rotation.y += 0.002;

      renderer.render(scene, camera);
    };

    animate();

    // Обработка изменения размера
    const handleResize = () => {
      if (!mountRef.current || !camera || !renderer) return;
      
      const width = mountRef.current.clientWidth;
      const height = mountRef.current.clientHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    };

    window.addEventListener('resize', handleResize);

    // Очистка
    return () => {
      window.removeEventListener('resize', handleResize);
      if (animationIdRef.current) {
        cancelAnimationFrame(animationIdRef.current);
      }
      if (mountRef.current && renderer.domElement) {
        mountRef.current.removeChild(renderer.domElement);
      }
      scene.clear();
      renderer.dispose();
    };
  }, []);

  return (
    <section className="py-20 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-gilroy-bold mb-6">
            <span className="gradient-text">3D</span> Графика
          </h2>
          <p className="text-xl text-primary-gray max-w-3xl mx-auto">
            Интерактивная 3D-сцена, созданная с помощью Three.js. 
            Демонстрирует возможности современной веб-графики и анимации.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1 }}
          viewport={{ once: true }}
          className="relative"
        >
          <div 
            ref={mountRef} 
            className="w-full h-96 md:h-[500px] rounded-2xl overflow-hidden border border-primary-accent/20 bg-gradient-to-br from-primary-dark/50 to-primary-medium/50"
          />
          
          {/* Информационная панель */}
          <div className="absolute bottom-4 left-4 right-4 bg-primary-dark/80 backdrop-blur-sm rounded-lg p-4 border border-primary-accent/20">
            <div className="flex items-center justify-between text-sm text-primary-gray">
              <span>Three.js Scene</span>
              <span>Интерактивная 3D-графика</span>
            </div>
          </div>
        </motion.div>

        {/* Технические детали */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          <div className="text-center">
            <div className="text-2xl font-gilroy-bold text-primary-light mb-2">WebGL</div>
            <div className="text-primary-gray">Аппаратное ускорение</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-gilroy-bold text-primary-light mb-2">60 FPS</div>
            <div className="text-primary-gray">Плавная анимация</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-gilroy-bold text-primary-light mb-2">Responsive</div>
            <div className="text-primary-gray">Адаптивный дизайн</div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default ThreeScene;
