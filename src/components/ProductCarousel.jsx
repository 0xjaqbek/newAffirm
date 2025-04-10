// src/components/ProductCarousel.jsx
import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useCursor, Environment, PresentationControls, ContactShadows, useTexture } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import MobileCarousel from './MobileCarousel'; 
import { useMobileDetector } from '../hooks/useMobileDetector';
import { ThemeContext } from '../contexts/ThemeContext';

// Products data remains the same
const products = [
  { 
    id: 1, 
    name: "Olive aFFiRM Tee", 
    size: "L", 
    color: "#8A9A5B", 
    price: 47, 
    description: "Manifest Your Reality",
    stripeId: "buy_btn_1QOKLnK1N5l6JY7eOroi5V75",
    image: "images/olive.png"
  },
  { 
    id: 2, 
    name: "Olive aFFiRM Tee", 
    size: "M", 
    color: "#8A9A5B", 
    price: 47, 
    description: "Create Your Perfect World",
    stripeId: "buy_btn_1QOKNFK1N5l6JY7e6zEMyXOG",
    image: "images/olive1.png"
  },
  { 
    id: 3, 
    name: "Pure White aFFiRM Tee", 
    size: "L", 
    color: "#F5F5F5", 
    price: 47, 
    description: "Embrace Pure Energy",
    stripeId: "buy_btn_1QSG0JK1N5l6JY7ehIiH2UrZ",
    image: "images/white.png"
  },
  { 
    id: 4, 
    name: "Pure White aFFiRM Tee", 
    size: "M", 
    color: "#F5F5F5", 
    price: 47, 
    description: "Pure Light Within",
    stripeId: "buy_btn_1QSFtuK1N5l6JY7eVuMSXjGE",
    image: "images/white1.png"
  },
];

// This component represents a single product in the 3D space
function ProductFrame({ product, index, setFocused, isFocused, groupRef, totalProducts, theme, ...props }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  const { viewport, camera } = useThree();
  useCursor(hovered);
  const isDark = theme === 'dark';
  
  // Try to load the texture
  const texture = useTexture(product.image);
  
  // Base scale for products
  const baseScale = 2.2;
  
  // Responsive scaling based on viewport
  const scaleFactor = useMemo(() => Math.min(viewport.width, viewport.height) / 12, [viewport]);
  
  // Store original position for animation
  const originalPosition = useMemo(() => new THREE.Vector3(...props.position), [props.position]);
  
  // Floating animation settings
  const floatSpeed = 0.5 + (index / totalProducts) * 0.5;
  const floatHeight = 0.05 + (index % 3) * 0.02;
  
  useFrame((state) => {
    if (!mesh.current) return;
    
    // Calculate the floating effect
    const floatY = Math.sin(state.clock.elapsedTime * floatSpeed) * floatHeight;
    
    // Force products to always face camera
    const lookPos = new THREE.Vector3();
    camera.getWorldPosition(lookPos);
    mesh.current.lookAt(lookPos);
    
    if (isFocused) {
      // Focused product is larger and moved forward
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, baseScale * scaleFactor * 1.9, 0.08);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, baseScale * scaleFactor * 1.9, 0.08);
      
      // Move toward camera when focused
      const toCamera = new THREE.Vector3(-1, 0, 0);
      const targetPosition = originalPosition.clone().add(toCamera);
      
      // Smooth position transition
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetPosition.x, 0.08);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetPosition.y + floatY * 0.3, 0.08);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, targetPosition.z, 0.08);
      
      // Brighter color for focused product
      mesh.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.05);
    } else {
      // Normal size with hover effect
      const targetScale = baseScale * scaleFactor * (hovered ? 1.15 : 1);
      mesh.current.scale.x = THREE.MathUtils.lerp(mesh.current.scale.x, targetScale, 0.05);
      mesh.current.scale.y = THREE.MathUtils.lerp(mesh.current.scale.y, targetScale, 0.05);
      
      // Return to original position with floating effect
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, originalPosition.x, 0.05);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, originalPosition.y + floatY, 0.05);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, originalPosition.z, 0.05);
      
      // Adjust color for hover state or normal state
      const targetColor = hovered ? 
        new THREE.Color(product.color) : 
        new THREE.Color(adjustColorBrightness(product.color, -0.0001));
      mesh.current.material.color.lerp(targetColor, 0.05);
    }
  });
  
  // Helper function to adjust color brightness
  function adjustColorBrightness(hex, brightness) {
    // Convert hex to RGB
    let r = parseInt(hex.slice(1, 3), 16);
    let g = parseInt(hex.slice(3, 5), 16);
    let b = parseInt(hex.slice(5, 7), 16);
    
    // Adjust brightness
    r = Math.max(0, Math.min(255, r + Math.round(r * brightness)));
    g = Math.max(0, Math.min(255, g + Math.round(g * brightness)));
    b = Math.max(0, Math.min(255, b + Math.round(b * brightness)));
    
    // Convert back to hex
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  return (
    <mesh
      ref={mesh}
      {...props}
      onClick={(e) => {
        e.stopPropagation();
        setFocused(isFocused ? null : index);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      scale={[baseScale * scaleFactor, baseScale * scaleFactor, 0.1]}
    >
      <boxGeometry args={[1, 1.5, 0.1]} />
      <meshStandardMaterial 
        color={product.color} 
        map={texture}
        transparent={true}
      />
    </mesh>
  );
}

// Products Gallery component for the 3D version
function ProductsGallery({ setCurrentProduct, theme }) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const group = useRef();
  const rotationRef = useRef({ value: 0 });
  const { viewport } = useThree();
  
  // Calculate radius based on viewport and number of products
  const radius = useMemo(() => Math.min(viewport.width, viewport.height) * 0.35, [viewport]);
  const theta = useMemo(() => (2 * Math.PI) / products.length, []);
  
  // Update current product when focus changes
  useEffect(() => {
    if (focusedIndex !== null) {
      setCurrentProduct(products[focusedIndex]);
    } else {
      setCurrentProduct(null);
    }
  }, [focusedIndex, setCurrentProduct]);
  
  // Smooth constant rotation
  useFrame((state, delta) => {
    if (!group.current) return;
    
    // Constant smooth rotation when not focused
    if (focusedIndex === null) {
      // Store rotation value separately for smooth transitions
      rotationRef.current.value += delta * 0.15; // Constant speed
      group.current.rotation.y = rotationRef.current.value;
    } else {
      // When a product is focused, smoothly rotate to center it
      const targetRotation = Math.PI / 4 - focusedIndex * theta;
      const currentRotation = group.current.rotation.y % (Math.PI * 2);
      
      // Calculate shortest path to target rotation
      let diff = targetRotation - currentRotation;
      if (diff > Math.PI) diff -= Math.PI * 2;
      if (diff < -Math.PI) diff += Math.PI * 2;
      
      // Smooth rotation to focused product
      group.current.rotation.y += diff * 0.05;
      
      // Update stored rotation for when focus is released
      rotationRef.current.value = group.current.rotation.y;
    }
  });
  
  return (
    <group ref={group} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
      {products.map((product, i) => (
        <ProductFrame
          key={product.id}
          product={product}
          index={i}
          totalProducts={products.length}
          position={[
            radius * Math.sin(i * theta),
            0,
            radius * Math.cos(i * theta)
          ]}
          groupRef={group}
          setFocused={setFocusedIndex}
          isFocused={focusedIndex === i}
          theme={theme}
        />
      ))}
    </group>
  );
}

// Main component with conditional rendering based on device
function ProductCarousel() {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useMobileDetector();
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Set loaded state after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // If on a mobile device, render the mobile-friendly carousel
  if (isMobile) {
    return <MobileCarousel items={products} type="product" />;
  }

  // Otherwise, render the 3D carousel for desktop
  return (
    <div className="relative">
      <div className="carousel-container" style={{ height: '60vh' }}>
        {!isLoaded ? (
          <div className={`flex items-center justify-center h-full ${isDark ? 'bg-dark-background' : 'bg-light-background'}`}>
            <div className="text-center">
              <div className={`inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${isDark ? 'border-dark-accent' : 'border-light-accent'}`}></div>
              <p className={`mt-4 ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Loading Products...</p>
            </div>
          </div>
        ) : (
          <Canvas
            camera={{ position: [0, 0, 15], fov: 50 }}
            dpr={window.devicePixelRatio > 1 ? 1.5 : 1}
            gl={{ 
              powerPreference: "default",
              antialias: true,
              alpha: false,
              stencil: false,
              depth: true,
              failIfMajorPerformanceCaveat: false
            }}
            frameloop="always"
          >
            <color attach="background" args={[isDark ? '#121212' : '#F2F0EA']} />
            <fog attach="fog" args={[isDark ? '#121212' : '#F2F0EA', 8, 30]} />
            
            <ambientLight intensity={isDark ? 0.7 : 0.9} />
            <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={isDark ? 1 : 1.2} castShadow />
            
            <PresentationControls
              global
              zoom={0.8}
              rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
              config={{ mass: 1, tension: 170, friction: 26 }}
              snap={false}
              enabled={currentProduct === null}
            >
              <ProductsGallery setCurrentProduct={setCurrentProduct} theme={theme} />
            </PresentationControls>
            
            <ContactShadows
              position={[0, 4, 0]}
              opacity={isDark ? 0.1 : 0.1}
              scale={200}
              blur={20}
              far={200}
            />
            
            <Environment preset={isDark ? "city" : "sunset"} />
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
          {currentProduct 
            ? "Click product again to deselect" 
            : "Click on a product to view details"}
        </p>
      </motion.div>
      
      {/* Product details panel */}
      {currentProduct && (
        <motion.div
          className={`absolute left-0 right-0 mx-auto max-w-md ${isDark ? 'bg-dark-surface/90' : 'bg-light-surface/90'} backdrop-blur-sm p-6 rounded-lg shadow-lg`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className={`font-display font-bold text-xl ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{currentProduct.name}</h3>
              <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Size: {currentProduct.size}</p>
              <p className={`font-bold mt-1 ${isDark ? 'text-dark-accent' : 'text-light-highlight'}`}>${currentProduct.price}</p>
              <p className={`text-sm italic mt-1 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{currentProduct.description}</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">            
                <button
                    className={`btn ${isDark ? 'btn-primary' : 'bg-light-highlight text-white hover:bg-light-highlight/90'}`}
                    onClick={() => {
                      const stripeLinks = {
                        'buy_btn_1QOKLnK1N5l6JY7eOroi5V75': 'https://buy.stripe.com/9AQ5nH2pVfx7cgMaEI?locale=en&__embed_source=buy_btn_1QOKLnK1N5l6JY7eOroi5V75',
                        'buy_btn_1QOKNFK1N5l6JY7e6zEMyXOG': 'https://buy.stripe.com/aEU7vP5C7bgRfsY5kp?locale=en&__embed_source=buy_btn_1QOKNFK1N5l6JY7e6zEMyXOG',
                        'buy_btn_1QSG0JK1N5l6JY7ehIiH2UrZ': 'https://buy.stripe.com/3cs8zT8OjckVeoU28f?locale=en&__embed_source=buy_btn_1QSG0JK1N5l6JY7ehIiH2UrZ',
                        'buy_btn_1QSFtuK1N5l6JY7eVuMSXjGE': 'https://buy.stripe.com/9AQcQ97KfacN0y428e?locale=en&__embed_source=buy_btn_1QSFtuK1N5l6JY7eVuMSXjGE'
                      };
                      
                      window.open(stripeLinks[currentProduct.stripeId] || '#', '_blank');
                    }}
                  >
                    Buy Now
                  </button>
                </div>
                <button
  className={`btn text-sm ${
    isDark 
      ? 'border border-dark-accent text-dark-accent hover:bg-dark-accent hover:text-dark-text' 
      : 'border border-light-highlight text-light-highlight hover:bg-light-highlight hover:text-white'
  }`}
  onClick={() => setShowDetails(!showDetails)}
>
  {showDetails ? 'Less Info' : 'More Info'}
</button>
              </div>
            </div>
          </div>
          
          {showDetails && (
            <motion.div
              className={`mt-4 text-sm ${isDark ? 'text-dark-text' : 'text-light-text'}`}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-4">Each aFFiRM tee comes with an embedded NFC tag, connecting you instantly to meditations and affirmations. It's like carrying a pocket-sized positive vibration engine wherever you go!</p>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default ProductCarousel;