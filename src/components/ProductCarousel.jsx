// src/components/ProductCarousel.jsx
import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useCursor, Environment, PresentationControls, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import MobileCarousel from './MobileCarousel';
import CardFilters from './CardFilters';
import { useMobileDetector } from '../hooks/useMobileDetector';
import { ThemeContext } from '../contexts/ThemeContext';
import { useLocalStorage } from '../hooks/useLocalStorage';

function ProductFrame({ product, index, setFocused, isFocused, totalProducts, theme, featuredIndex, userInteracted, ...props }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  const { viewport, camera } = useThree();
  useCursor(hovered);
  const isDark = theme === 'dark';

  const texture = useTexture(product.image);

  const baseScale = 3;
  const scaleFactor = useMemo(() => Math.min(viewport.width, viewport.height) / 12, [viewport]);
  const originalPosition = useMemo(() => new THREE.Vector3(...props.position), [props.position]);

  const floatSpeed = 0.5 + (index / Math.max(totalProducts, 1)) * 0.5;
  const floatHeight = 0.05 + (index % 3) * 0.02;
  const isFeatured = featuredIndex === index;

  useFrame((state) => {
    if (!mesh.current) return;
    const floatY = Math.sin(state.clock.elapsedTime * floatSpeed) * floatHeight;
    const lookPos = new THREE.Vector3();
    camera.getWorldPosition(lookPos);
    mesh.current.lookAt(lookPos);

    if (isFocused) {
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, baseScale * scaleFactor * 1.9, 0.08);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, baseScale * scaleFactor * 1.9, 0.08);
      const toCamera = new THREE.Vector3(-1, 0, 0);
      const targetPosition = originalPosition.clone().add(toCamera);
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetPosition.x, 0.08);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetPosition.y + floatY * 0.3, 0.08);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, targetPosition.z, 0.08);
      mesh.current.material.color.lerp(new THREE.Color('#FFFFFF'), 0.05);
    } else if (isFeatured && !userInteracted) {
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, baseScale * scaleFactor * 1.5, 0.05);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, baseScale * scaleFactor * 1.5, 0.05);
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, originalPosition.x, 0.05);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, originalPosition.y + floatY * 1.5, 0.05);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, originalPosition.z, 0.05);
      mesh.current.material.color.lerp(new THREE.Color('#FFFFFF'), 0.05);
    } else if (hovered) {
      const targetScale = baseScale * scaleFactor * 1.15;
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, targetScale, 0.05);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, targetScale, 0.05);
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, originalPosition.x, 0.05);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, originalPosition.y + floatY, 0.05);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, originalPosition.z, 0.05);
      mesh.current.material.color.lerp(new THREE.Color('#FFFFFF'), 0.05);
    } else {
      const targetScale = baseScale * scaleFactor;
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, targetScale, 0.05);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, targetScale, 0.05);
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, originalPosition.x, 0.05);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, originalPosition.y + floatY, 0.05);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, originalPosition.z, 0.05);
      mesh.current.material.color.lerp(new THREE.Color('#FFFFFF'), 0.05);
    }
  });

  return (
    <mesh
      ref={mesh}
      {...props}
      onClick={(e) => { e.stopPropagation(); setFocused(isFocused ? null : index); }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={[baseScale * scaleFactor, baseScale * scaleFactor * 1.4, 0.1]}
    >
      <boxGeometry args={[1, 1, 0.1]} />
      <meshStandardMaterial color="#FFFFFF" map={texture} transparent={true} />
    </mesh>
  );
}

function ProductsGallery({ products, setCurrentProduct, theme }) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0);
  const [userInteracted, setUserInteracted] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const group = useRef();
  const elapsedTimeRef = useRef(0);
  const lastUpdateTimeRef = useRef(0);
  const { viewport } = useThree();

  const radius = useMemo(() => Math.min(viewport.width, viewport.height) * 0.35, [viewport]);
  const theta = useMemo(() => (2 * Math.PI) / Math.max(products.length, 1), [products.length]);
  const featureDuration = 5;
  const fadeOutDuration = 0.4;
  const fadeInDuration = 0.4;

  useFrame((state, delta) => {
    elapsedTimeRef.current += delta;
    if (!group.current || products.length === 0) return;

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
        group.current.rotation.y -= delta * 0.2;
        const normalizedRotation = -group.current.rotation.y % (2 * Math.PI);
        const newFeaturedIndex = Math.round(normalizedRotation / theta) % products.length;
        const positiveIndex = (newFeaturedIndex + products.length) % products.length;
        if (positiveIndex !== featuredIndex && elapsedTimeRef.current - lastUpdateTimeRef.current > featureDuration) {
          setIsTransitioning(true);
          setFeaturedIndex(positiveIndex);
          setTimeout(() => {
            setIsTransitioning(false);
            lastUpdateTimeRef.current = elapsedTimeRef.current;
          }, (fadeOutDuration + fadeInDuration) * 1000);
        }
      }
    }
  });

  useEffect(() => {
    if (focusedIndex !== null) {
      setCurrentProduct(products[focusedIndex]);
      setUserInteracted(true);
      setRotationPaused(true);
    } else if (featuredIndex !== null && !userInteracted) {
      setCurrentProduct(products[featuredIndex] || null);
    } else {
      setCurrentProduct(null);
    }
  }, [focusedIndex, featuredIndex, userInteracted, products, setCurrentProduct]);

  useEffect(() => {
    if (focusedIndex === null) {
      const timer = setTimeout(() => {
        setUserInteracted(false);
        setRotationPaused(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [focusedIndex]);

  // Reset focused/featured when products array changes (filter)
  useEffect(() => {
    setFocusedIndex(null);
    setFeaturedIndex(0);
    setUserInteracted(false);
    setRotationPaused(false);
  }, [products.length]);

  return (
    <group ref={group} position={[0, 0, 0]}>
      {products.map((product, i) => (
        <ProductFrame
          key={product.id}
          product={product}
          index={i}
          totalProducts={products.length}
          position={[radius * Math.sin(i * theta), 0, radius * Math.cos(i * theta)]}
          setFocused={setFocusedIndex}
          isFocused={focusedIndex === i}
          featuredIndex={featuredIndex}
          userInteracted={userInteracted}
          theme={theme}
        />
      ))}
    </group>
  );
}

function ProductCarousel() {
  const [cards] = useLocalStorage('affirm_cards', []);
  const [filters, setFilters] = useState({ search: '', set: '', rarity: '', type: '' });
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useMobileDetector();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  const filteredCards = useMemo(() => {
    return cards.filter(card => {
      const matchSearch = !filters.search || card.name.toLowerCase().includes(filters.search.toLowerCase());
      const matchSet = !filters.set || card.set === filters.set;
      const matchRarity = !filters.rarity || card.rarity === filters.rarity;
      const matchType = !filters.type || (card.types || []).includes(filters.type);
      return matchSearch && matchSet && matchRarity && matchType;
    });
  }, [cards, filters]);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (currentProduct) setShowDetails(false);
  }, [currentProduct]);

  const contactToBuy = () => {
    document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' });
  };

  if (isMobile) {
    return (
      <>
        <CardFilters cards={cards} filters={filters} onChange={setFilters} />
        <MobileCarousel items={filteredCards} type="product" />
      </>
    );
  }

  return (
    <div className="relative">
      <CardFilters cards={cards} filters={filters} onChange={setFilters} />
      <div className="carousel-container" style={{ height: '75vh' }}>
        {!isLoaded ? (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
            <div className="text-center">
              <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDark ? 'border-dark-accent' : 'border-light-accent'}`}></div>
              <p className={`mt-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Loading Cards...</p>
            </div>
          </div>
        ) : filteredCards.length === 0 ? (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
            <p className={`text-center ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
              {cards.length === 0 ? 'No cards in inventory yet.' : 'No cards match your filters.'}
            </p>
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0, 15], fov: 50 }}
            dpr={window.devicePixelRatio > 1 ? 1.5 : 1}
            gl={{ powerPreference: 'default', antialias: true, alpha: false, stencil: false, depth: true, failIfMajorPerformanceCaveat: false }}
            frameloop="always"
          >
            <color attach="background" args={[isDark ? '#121212' : '#F2F0EA']} />
            <fog attach="fog" args={[isDark ? '#121212' : '#F2F0EA', 8, 30]} />
            <ambientLight intensity={isDark ? 0.7 : 0.9} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={isDark ? 1 : 1.2} castShadow />
            <PresentationControls
              global zoom={0.8} rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
              config={{ mass: 1, tension: 170, friction: 26 }}
              snap={false}
              enabled={currentProduct === null}
            >
              <ProductsGallery products={filteredCards} setCurrentProduct={setCurrentProduct} theme={theme} />
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
        <p className={`mb-2 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
          {currentProduct ? 'Click card again to deselect' : 'Click on a card to view details'}
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {currentProduct && (
          <motion.div
            key={currentProduct.id}
            className={`absolute left-0 right-0 mx-auto max-w-md ${isDark ? 'bg-dark-surface/90' : 'bg-light-surface/90'} backdrop-blur-sm p-6 rounded-lg shadow-lg`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-start gap-4">
              <div className="flex-1">
                <h3 className={`font-display font-bold text-xl ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{currentProduct.name}</h3>
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{currentProduct.set}</p>
                <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  {currentProduct.rarity} • {currentProduct.condition}
                </p>
                {currentProduct.types?.length > 0 && (
                  <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                    {currentProduct.types.join(', ')}
                  </p>
                )}
                <p className={`font-bold mt-1 ${isDark ? 'text-dark-accent' : 'text-light-highlight'}`}>
                  ${currentProduct.price}
                </p>
                <p className={`text-xs mt-1 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>
                  Stock: {currentProduct.stock}
                </p>
              </div>
              <button
                className={`btn shrink-0 ${isDark ? 'btn-primary' : 'bg-light-highlight text-white hover:bg-light-highlight/90'}`}
                onClick={contactToBuy}
              >
                Contact to Buy
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ProductCarousel;
