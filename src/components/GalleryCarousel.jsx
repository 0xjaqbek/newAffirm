// src/components/GalleryCarousel.jsx
import React, { useRef, useState, useEffect, useMemo, useContext } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useCursor, Image, Environment, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion, AnimatePresence } from 'framer-motion';
import MobileCarousel from './MobileCarousel'; // Import our mobile component
import { useMobileDetector } from '../hooks/useMobileDetector'; // Import our hook
import { ThemeContext } from '../contexts/ThemeContext';

// In a real implementation, these would be your actual image URLs
const IMAGES = [
  "images/2d.png",
  "images/140858.jpg",
  "images/154706.png",
  "images/154959.png",
  "images/155301.png",
  "images/155800.png",
  "images/160144.png",
  "images/affirm_knight.png",
  "images/affirmwowods.png",
  "images/ai16z_eliza_affirm_store3.png", 
  "images/dasha_terminal 1.png"
];

// Refined ImageFrame component
function ImageFrame({ url, index, setFocused, isFocused, totalImages, theme, featuredIndex, userInteracted, centralPosition, ...props }) {
  const image = useRef();
  const [hovered, setHovered] = useState(false);
  const { viewport, camera } = useThree();
  useCursor(hovered);
  const isDark = theme === 'dark';
  
  // Calculate scale based on viewport
  const baseScale = 2.5;
  const scaleFactor = useMemo(() => Math.min(viewport.width, viewport.height) / 10, [viewport]);
  
  // Store original position for animation
  const originalPosition = useMemo(() => new THREE.Vector3(...props.position), [props.position]);
  
  // Check if this image is featured
  const isFeatured = featuredIndex === index;
  
  // Calculate distance from central viewing position (front of carousel)
  const [distanceFromCenter, setDistanceFromCenter] = useState(1);
  
  // Smooth animation with continuous movement
  useFrame((state) => {
    if (!image.current) return;

    // Make image face camera
    const lookPos = new THREE.Vector3();
    camera.getWorldPosition(lookPos);
    image.current.lookAt(lookPos);
    
    // Calculate current position in world space
    const worldPos = new THREE.Vector3();
    image.current.getWorldPosition(worldPos);
    
    // Calculate normalized distance from the central viewing position (0-1 range)
    // This helps determine which image is most prominently in view
    const distToCenter = worldPos.distanceTo(centralPosition);
    const normalizedDist = Math.min(distToCenter / (viewport.width * 0.5), 1);
    setDistanceFromCenter(normalizedDist);
    
    // Subtle floating animation - different for each image using index
    const floatSpeed = 0.5 + (index / totalImages) * 0.5;
    const floatHeight = 0.05 + (index % 3) * 0.02;
    const floatY = Math.sin(state.clock.elapsedTime * floatSpeed) * floatHeight;
    
    if (isFocused) {
      // When focused - larger and moved forward
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, baseScale * scaleFactor * 1.9, 0.08);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, baseScale * scaleFactor * 1.9, 0.08);
      
      // Move toward camera when focused
      const toCamera = new THREE.Vector3(3, 3, 3);
      const targetPosition = originalPosition.clone().add(toCamera);
      
      // Smooth position transition
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, targetPosition.x, 0.08);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, targetPosition.y + floatY * 0.3, 0.08);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, targetPosition.z, 0.08);
      
      // Full brightness
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.1);
    } else if (isFeatured && !userInteracted) {
      // Featured image is slightly larger but not as large as user-focused
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, baseScale * scaleFactor * 1.5, 0.05);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, baseScale * scaleFactor * 1.5, 0.05);
      
      // Keep in place but add enhanced floating
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, originalPosition.x, 0.05);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, originalPosition.y + floatY * 1.5, 0.05);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, originalPosition.z, 0.05);
      
      // Full brightness for featured image
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.1);
    } else if (hovered) {
      // Normal size with hover effect
      const targetScale = baseScale * scaleFactor * 1.15;
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, targetScale, 0.06);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, targetScale, 0.06);
      
      // Return to original position with floating effect
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, originalPosition.x, 0.06);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, originalPosition.y + floatY, 0.06);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, originalPosition.z, 0.06);
      
      // Full brightness for hovered state
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.1);
    } else {
      // Normal size, not interacted with
      const targetScale = baseScale * scaleFactor;
      image.current.scale.x = THREE.MathUtils.lerp(image.current.scale.x, targetScale, 0.06);
      image.current.scale.y = THREE.MathUtils.lerp(image.current.scale.y, targetScale, 0.06);
      
      // Return to original position with floating effect
      image.current.position.x = THREE.MathUtils.lerp(image.current.position.x, originalPosition.x, 0.06);
      image.current.position.y = THREE.MathUtils.lerp(image.current.position.y, originalPosition.y + floatY, 0.06);
      image.current.position.z = THREE.MathUtils.lerp(image.current.position.z, originalPosition.z, 0.06);
      
      // Adjust color based on distance from center and theme
      const baseColor = isDark ? 0.85 : 0.95;
      // Fade images based on distance from center - further images are darker
      const brightnessAdjustment = 1 - (normalizedDist * 0.3);
      const targetColor = new THREE.Color(
        baseColor * brightnessAdjustment,
        baseColor * brightnessAdjustment,
        baseColor * brightnessAdjustment
      );
      image.current.material.color.lerp(targetColor, 0.1);
    }
  });
  
  return (
    <Image
      ref={image}
      {...props}
      url={url}
      scale={[baseScale * scaleFactor, baseScale * scaleFactor, 1]}
      transparent={true}
      onClick={(e) => {
        e.stopPropagation();
        setFocused(isFocused ? null : index);
      }}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
    />
  );
}

// Gallery component with continuous rotation
function Gallery({ setCurrentImage, theme }) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const [featuredIndex, setFeaturedIndex] = useState(0); // Start with first image featured
  const [userInteracted, setUserInteracted] = useState(false);
  const [rotationPaused, setRotationPaused] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [frontPositionIndex, setFrontPositionIndex] = useState(0);
  
  const group = useRef();
  const rotationRef = useRef(0); // Track rotation for continuous motion
  const elapsedTimeRef = useRef(0); // Track total elapsed time
  const lastUpdateTimeRef = useRef(0);
  const { viewport, camera } = useThree();
  
  // Central viewing position - directly in front of the carousel
  const centralPosition = useMemo(() => new THREE.Vector3(0, 0, viewport.width * 0.25), [viewport]);
  
  // Track all image positions to determine which is closest to front
  const imagePositions = useRef([]);
  
  // Adjust spacing between images
  const radius = useMemo(() => Math.min(viewport.width, viewport.height) * 0.45, [viewport]);
  const theta = useMemo(() => (2 * Math.PI) / IMAGES.length, []);
  
  // Time settings
  const featureDuration = 5; // seconds to feature each image
  
  // Update current image when focus or featured index changes
  useEffect(() => {
    if (focusedIndex !== null) {
      setCurrentImage(IMAGES[focusedIndex]);
      setUserInteracted(true);
      setRotationPaused(true);
    } else if (featuredIndex !== null && !userInteracted) {
      setCurrentImage(IMAGES[featuredIndex]);
    } else {
      setCurrentImage(null);
    }
  }, [focusedIndex, featuredIndex, userInteracted, setCurrentImage]);
  
  // Reset user interaction when all images are deselected
  useEffect(() => {
    if (focusedIndex === null) {
      // Add a small delay before resetting user interaction
      const timer = setTimeout(() => {
        setUserInteracted(false);
        setRotationPaused(false);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [focusedIndex]);
  
  // Advanced position detection and rotation control
  useFrame((state, delta) => {
    // Update elapsed time
    elapsedTimeRef.current += delta;
    
    if (!group.current) return;
    
    // Initialize image positions array if empty
    if (imagePositions.current.length === 0) {
      imagePositions.current = IMAGES.map((_, i) => {
        const angle = i * theta;
        return new THREE.Vector3(
          radius * Math.sin(angle),
          0,
          radius * Math.cos(angle)
        );
      });
    }
    
    if (rotationPaused) {
      // When an image is focused by user, rotate to center it
      if (focusedIndex !== null) {
        // Calculate target rotation to center the focused image
        const targetRotation = -focusedIndex * theta;
        
        // Get current rotation
        const currentRotation = group.current.rotation.y;
        
        // Calculate shortest path to target rotation
        let diff = targetRotation - currentRotation;
        if (diff > Math.PI) diff -= 2 * Math.PI;
        if (diff < -Math.PI) diff += 2 * Math.PI;
        
        // Smooth rotation to focused image
        group.current.rotation.y += diff * 0.05;
      }
    } else {
      // Auto rotation - continuous smooth movement
      if (!isTransitioning) {
        // Automatically rotate the entire carousel
        group.current.rotation.y -= delta * 0.15; // steady rotation speed
        
        // Calculate which image is currently at the front position
        // Use rotation to find the forward-most image
        const currentRotation = group.current.rotation.y;
        
        // Find the image closest to the front based on its rotation angle
        const normalizedRotation = ((currentRotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        const rotationIndex = Math.round(normalizedRotation / theta) % IMAGES.length;
        const frontIndex = (IMAGES.length - rotationIndex) % IMAGES.length;
        
        // Only update if front position has changed
        if (frontIndex !== frontPositionIndex) {
          setFrontPositionIndex(frontIndex);
          
          // Check if we should update the featured image
          if (!isTransitioning && elapsedTimeRef.current - lastUpdateTimeRef.current > featureDuration) {
            // Begin transition to new featured image
            setIsTransitioning(true);
            
            // Update the featured image to the one at front
            setFeaturedIndex(frontIndex);
            
            // After the transition completes
            setTimeout(() => {
              setIsTransitioning(false);
              lastUpdateTimeRef.current = elapsedTimeRef.current;
            }, 0.3 * 1000); // Brief transition time
          }
        }
      }
    }
  });

  return (
    <group ref={group} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
      {IMAGES.map((url, i) => (
        <ImageFrame
          key={i}
          url={url}
          index={i}
          totalImages={IMAGES.length}
          position={[
            radius * Math.sin(i * theta),
            0,
            radius * Math.cos(i * theta)
          ]}
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

// Main component with conditional rendering based on device
function GalleryCarousel() {
  const [currentImage, setCurrentImage] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const isMobile = useMobileDetector(); 
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  // Set loaded state after a short delay
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 800);
    return () => clearTimeout(timer);
  }, []);

  // Function to open fullscreen image viewer
  const openFullscreen = () => {
    setShowFullscreen(true);
  };

  // If on a mobile device, render the mobile-friendly carousel
  if (isMobile) {
    return <MobileCarousel items={IMAGES} type="gallery" />;
  }

  // Otherwise, render the 3D carousel for desktop
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
        ) : (
          <Canvas 
            camera={{ position: [0, 0, 20], fov: 45 }} 
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
            <fog attach="fog" args={[isDark ? '#121212' : '#F2F0EA', 10, 40]} />
            
            <ambientLight intensity={isDark ? 0.7 : 0.9} />
            <spotLight position={[0, 10, 0]} intensity={isDark ? 1 : 1.2} angle={0.3} penumbra={1} castShadow />
            
            <PresentationControls
              global
              zoom={0.8}
              rotation={[0, 0, 0]}
              polar={[-Math.PI / 3, Math.PI / 3]}
              azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
              config={{ mass: 1, tension: 170, friction: 26 }}
              snap={false}
              enabled={currentImage === null} // Disable controls when image is selected
            >
              <Gallery setCurrentImage={setCurrentImage} theme={theme} />
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
      
      {/* UI Elements */}
      <motion.div 
        className="absolute inset-x-0 bottom-4 px-4 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ delay: 0.2 }}
      >
        <p className={`${isDark ? 'text-dark-muted' : 'text-light-muted'} mb-2`}>
          {currentImage 
            ? "Click again to return to gallery view" 
            : "Click on an image to focus"}
        </p>
        
        {currentImage && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
            className={`btn ${isDark ? 'btn-primary' : 'bg-light-highlight text-white'} px-6 py-2 rounded-full hover:bg-opacity-90 transition-all`}
            onClick={openFullscreen}
          >
            Open Full Size
          </motion.button>
        )}
      </motion.div>
      
      {/* Fullscreen viewer with AnimatePresence */}
      <AnimatePresence>
        {showFullscreen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
            onClick={() => setShowFullscreen(false)}
          >
            <motion.img 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              src={currentImage} 
              alt="Full size" 
              className="max-w-full max-h-full p-4 object-contain"
            />
            <button 
              className="absolute top-6 right-6 text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80 transition-all"
              onClick={(e) => {
                e.stopPropagation();
                setShowFullscreen(false);
              }}
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default GalleryCarousel;