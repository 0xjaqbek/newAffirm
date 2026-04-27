// src/components/GalleryCarousel.jsx
import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useCursor, Image, Environment, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import MobileCarousel from './MobileCarousel';
import { useMobileDetector } from '../hooks/useMobileDetector';
import { ThemeContext } from '../contexts/ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

function ImageFrame({ url, index, setFocused, isFocused, totalImages, theme, featuredIndex, userInteracted, centralPosition, ...props }) {
  const image = useRef();
  const [hovered, setHovered] = useState(false);
  const { viewport, camera } = useThree();
  useCursor(hovered);
  const isDark = theme === 'dark';

  const baseScale = 2.5;
  const scaleFactor = useMemo(() => Math.min(viewport.width, viewport.height) / 10, [viewport]);
  const originalPosition = useMemo(() => new THREE.Vector3(...props.position), [props.position]);
  const isFeatured = featuredIndex === index;
  const [normalizedDist, setNormalizedDist] = useState(1);

  useFrame((state) => {
    if (!image.current) return;
    const lookPos = new THREE.Vector3();
    camera.getWorldPosition(lookPos);
    image.current.lookAt(lookPos);

    const worldPos = new THREE.Vector3();
    image.current.getWorldPosition(worldPos);
    const distToCenter = worldPos.distanceTo(centralPosition);
    setNormalizedDist(Math.min(distToCenter / (viewport.width * 0.5), 1));

    const floatSpeed = 0.5 + (index / Math.max(totalImages, 1)) * 0.5;
    const floatHeight = 0.05 + (index % 3) * 0.02;
    const floatY = Math.sin(state.clock.elapsedTime * floatSpeed) * floatHeight;

    if (isFocused) {
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, baseScale * scaleFactor * 1.9, 0.08);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, baseScale * scaleFactor * 1.9, 0.08);
      const toCamera = new THREE.Vector3(3, 3, 3);
      const targetPosition = originalPosition.clone().add(toCamera);
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, targetPosition.x, 0.08);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, targetPosition.y + floatY * 0.3, 0.08);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, targetPosition.z, 0.08);
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.1);
    } else if (isFeatured && !userInteracted) {
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, baseScale * scaleFactor * 1.5, 0.05);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, baseScale * scaleFactor * 1.5, 0.05);
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, originalPosition.x, 0.05);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, originalPosition.y + floatY * 1.5, 0.05);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, originalPosition.z, 0.05);
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.1);
    } else if (hovered) {
      const targetScale = baseScale * scaleFactor * 1.15;
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, targetScale, 0.06);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, targetScale, 0.06);
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, originalPosition.x, 0.06);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, originalPosition.y + floatY, 0.06);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, originalPosition.z, 0.06);
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.1);
    } else {
      const targetScale = baseScale * scaleFactor;
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, targetScale, 0.06);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, targetScale, 0.06);
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, originalPosition.x, 0.06);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, originalPosition.y + floatY, 0.06);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, originalPosition.z, 0.06);
      const baseColor = isDark ? 0.85 : 0.95;
      const brightness = baseColor * (1 - normalizedDist * 0.3);
      image.current.material.color.lerp(new THREE.Color(brightness, brightness, brightness), 0.1);
    }
  });

  return (
    <Image
      ref={image}
      {...props}
      url={url}
      scale={[baseScale * scaleFactor, baseScale * scaleFactor * 1.4, 1]}
      transparent={true}
      onClick={(e) => { e.stopPropagation(); setFocused(isFocused ? null : index); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}

function Gallery({ images, setCurrentImage, theme }) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [frontPositionIndex, setFrontPositionIndex] = useState(0);
  const group = useRef();
  const elapsedTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const imagePositions = useRef([]);
  const { viewport } = useThree();

  const centralPosition = useMemo(() => new THREE.Vector3(0, 0, viewport.width * 0.25), [viewport]);
  const radius = useMemo(() => Math.min(viewport.width, viewport.height) * 0.45, [viewport]);
  const theta = useMemo(() => (2 * Math.PI) / Math.max(images.length, 1), [images.length]);
  const featureDuration = 5;

  useEffect(() => {
    if (focusedIndex !== null) {
      setCurrentImage(images[focusedIndex]);
      setUserInteracted(true);
      setRotationPaused(true);
    } else if (featuredIndex !== null && !userInteracted) {
      setCurrentImage(images[featuredIndex] || null);
    } else {
      setCurrentImage(null);
    }
  }, [focusedIndex, featuredIndex, userInteracted, images, setCurrentImage]);

  useEffect(() => {
    if (focusedIndex === null) {
      const timer = setTimeout(() => { setUserInteracted(false); setRotationPaused(false); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [focusedIndex]);

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;
    if (!group.current || images.length === 0) return;

    if (imagePositions.current.length !== images.length) {
      imagePositions.current = images.map((_, i) => {
        const angle = i * theta;
        return new THREE.Vector3(radius * Math.sin(angle), 0, radius * Math.cos(angle));
      });
    }

    if (rotationPaused) {
      if (focusedIndex !== null) {
        const targetRotation = -focusedIndex * theta;
        const currentRotation = group.current.rotation.y;
        let diff = targetRotation - currentRotation;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;
        group.current.rotation.y += diff * 0.05;
      }
    } else {
      if (!isTransitioning) {
        group.current.rotation.y -= delta * 0.15;
        const currentRotation = group.current.rotation.y;
        const normalizedRotation = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const rotationIndex = Math.round(normalizedRotation / theta) % images.length;
        const frontIndex = (images.length - rotationIndex) % images.length;
        if (frontIndex !== frontPositionIndex) {
          setFrontPositionIndex(frontIndex);
          if (!isTransitioning && elapsedTimeRef.current - lastUpdateTimeRef.current > featureDuration) {
            setIsTransitioning(true);
            setFeaturedIndex(frontIndex);
            setTimeout(() => {
              setIsTransitioning(false);
              lastUpdateTimeRef.current = elapsedTimeRef.current;
            }, 300);
          }
        }
      }
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
      {images.map((url, i) => (
        <ImageFrame
          key={i}
          url={url}
          index={i}
          totalImages={images.length}
          position={[radius * Math.sin(i * theta), 0, radius * Math.cos(i * theta)]}
          setFocused={setFocusedIndex}
          isFocused={focusedIndex === i}
          featuredIndex={featuredIndex}
          userInteracted={userInteracted}
          centralPosition={centralPosition}
          theme={theme}
        />
      ))}
    </group>
  );
}

function GalleryCarousel() {
  const [cards] = useLocalStorage('affirm_cards', []);
  const images = useMemo(() => cards.map(c => c.image), [cards]);

  const [currentImage, setCurrentImage] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useMobileDetector();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  if (isMobile) {
    return <MobileCarousel items={images} type="gallery" />;
  }

  return (
    <div className="relative">
      <div className="carousel-container" style={{ height: '70vh' }}>
        {!isLoaded ? (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
            <div className="text-center">
              <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDark ? 'border-dark-accent' : 'border-light-accent'}`}></div>
              <p className={`mt-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Loading Gallery...</p>
            </div>
          </div>
        ) : images.length === 0 ? (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
            <p className={`${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>No cards in inventory yet.</p>
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0, 20], fov: 45 }}
            dpr={window.devicePixelRatio > 1 ? 1.5 : 1}
            gl={{ powerPreference: 'default', antialias: true, alpha: false, stencil: false, depth: true, failIfMajorPerformanceCaveat: false }}
            frameloop="always"
          >
            <color attach="background" args={[isDark ? '#121212' : '#F2F0EA']} />
            <fog attach="fog" args={[isDark ? '#121212' : '#F2F0EA', 10, 40]} />
            <ambientLight intensity={isDark ? 0.7 : 0.9} />
            <spotLight position={[0, 10, 0]} intensity={isDark ? 1 : 1.2} angle={0.3} penumbra={1} castShadow />
            <PresentationControls
              global zoom={0.8} rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
              config={{ mass: 1, tension: 170, friction: 26 }}
              snap={false}
              enabled={currentImage === null}
            >
              <Gallery images={images} setCurrentImage={setCurrentImage} theme={theme} />
            </PresentationControls>
            <ContactShadows position={[0, 4, 0]} opacity={0.1} scale={200} blur={20} far={200} />
            <Environment preset={isDark ? 'city' : 'sunset'} />
          </Canvas>
        )}
      </div>

      <motion.div
        className="absolute inset-x-0 bottom-4 px-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className={`${isDark ? 'text-dark-muted' : 'text-light-muted'} mb-2`}>
          {currentImage ? 'Click again to return' : 'Click on a card to focus'}
        </p>
        {currentImage && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
            className={`btn ${isDark ? 'btn-primary' : 'bg-light-highlight text-white'} px-6 py-2 rounded-full`}
            onClick={() => setShowFullscreen(true)}
          >
            Open Full Size
          </motion.button>
        )}
      </motion.div>

      <AnimatePresence>
        {showFullscreen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
            onClick={() => setShowFullscreen(false)}
          >
            <motion.img
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              src={currentImage} alt="Full size"
              className="max-w-full max-h-full p-4 object-contain"
            />
            <button
              className="absolute top-6 right-6 text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80 transition-all"
              onClick={(e) => { e.stopPropagation(); setShowFullscreen(false); }}
            >✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GalleryCarousel;
