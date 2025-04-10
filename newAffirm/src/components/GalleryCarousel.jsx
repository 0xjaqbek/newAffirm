// src/components/GalleryCarousel.jsx - Improved version
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useCursor, Image, Environment, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// In a real implementation, these would be your actual image URLs
const IMAGES = [
  "/images/2d.png",
  "/images/140858.jpg",
  "/images/154706.png",
  "/images/154959.png",
  "/images/155301.png",
  "/images/155800.png",
  "/images/160144.png",
  "/images/affirm_knight.png",
  "/images/AFFIRM3_1.png",
  "/images/affirmwowods.png",
  "/images/ai16z_eliza_affirm_store3.png",
  "/images/CHILL GUY W T-SHIRT bez tła 2.png",
  "/images/dasha_terminal 1.png"
];

function ImageFrame({ url, index, setFocused, isFocused, ...props }) {
  const image = useRef();
  const [hovered, setHovered] = useState(false);
  const { viewport, camera } = useThree();
  useCursor(hovered);
  
  // Calculate a larger scale for better visibility
  const baseScale = 2.5;
  
  // Make images larger based on viewport
  const scaleFactor = Math.min(viewport.width, viewport.height) / 10;
  
  useFrame((state, dt) => {
    // We don't need to explicitly set quaternion anymore since we handle rotation in the parent
    
    // Only animate if this image is not the focused one
    if (!isFocused) {
      // Gentle hover animation with slower transition (less springy)
      const hover = hovered ? 0.1 : 0;
      image.current.scale.x = THREE.MathUtils.lerp(
        image.current.scale.x,
        baseScale * scaleFactor + hover,
        0.05
      );
      image.current.scale.y = THREE.MathUtils.lerp(
        image.current.scale.y,
        baseScale * scaleFactor + hover,
        0.05
      );
      
      // Slight color adjustment on hover
      image.current.material.color.lerp(
        new THREE.Color(hovered ? 1 : 0.8, hovered ? 1 : 0.8, hovered ? 1 : 0.8),
        0.05
      );
    } else {
      // Make focused image larger with smoother transition
      image.current.scale.x = THREE.MathUtils.lerp(
        image.current.scale.x,
        baseScale * scaleFactor * 1.5,
        0.05
      );
      image.current.scale.y = THREE.MathUtils.lerp(
        image.current.scale.y,
        baseScale * scaleFactor * 1.5,
        0.05
      );
      
      // Full brightness for focused image
      image.current.material.color.lerp(new THREE.Color(1, 1, 1), 0.05);
    }
  });
  
  return (
    <Image
      ref={image}
      {...props}
      url={url}
      scale={[baseScale * scaleFactor, baseScale * scaleFactor, 1]}
      onClick={(e) => {
        e.stopPropagation();
        setFocused(isFocused ? null : index);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
    />
  );
}

function Gallery({ setCurrentImage }) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const group = useRef();
  const { viewport } = useThree();
  
  // Adjust spacing between images
  const radius = Math.min(viewport.width, viewport.height) * 0.7;
  const theta = (2 * Math.PI) / IMAGES.length;
  
  useEffect(() => {
    if (focusedIndex !== null) {
      setCurrentImage(IMAGES[focusedIndex]);
    } else {
      setCurrentImage(null);
    }
  }, [focusedIndex, setCurrentImage]);
  
  // Add auto rotation effect that also keeps images facing the camera
  useFrame((state, delta) => {
    // Very slow, smooth rotation
    if (focusedIndex === null) {
      group.current.rotation.y += delta * 0.05;
      
      // Update each child to face the camera as the parent rotates
      group.current.children.forEach(child => {
        // Calculate angle to face camera based on its position in the circle
        const childWorldPos = new THREE.Vector3();
        child.getWorldPosition(childWorldPos);
        
        // Make the child face the camera by counteracting the group's rotation
        child.rotation.y = -group.current.rotation.y;
      });
    }
  });

  // Return images positioned in a circle with a better starting position
  return (
    <group ref={group} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
      {IMAGES.map((url, i) => (
        <ImageFrame
          key={i}
          url={url}
          index={i}
          position={[
            radius * Math.sin(i * theta),
            0,
            radius * Math.cos(i * theta)
          ]}
          setFocused={setFocusedIndex}
          isFocused={focusedIndex === i}
        />
      ))}
    </group>
  );
}

function GalleryCarousel() {
  const [currentImage, setCurrentImage] = useState(null);
  const [showFullscreen, setShowFullscreen] = useState(false);

  const openFullscreen = (image) => {
    setShowFullscreen(true);
  };

  return (
    <div className="relative">
      <div className="carousel-container" style={{ height: '70vh' }}>
        <Canvas 
          camera={{ position: [0, 0, 20], fov: 45 }} 
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true }}
        >
          <color attach="background" args={['#121212']} />
          <fog attach="fog" args={['#121212', 10, 40]} />
          
          <ambientLight intensity={0.7} />
          <spotLight position={[0, 10, 0]} intensity={1} angle={0.3} penumbra={1} castShadow />
          
          <PresentationControls
            global
            zoom={0.8}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
            config={{ mass: 1, tension: 170, friction: 26 }}
            snap={false}
          >
            <Gallery setCurrentImage={setCurrentImage} />
          </PresentationControls>
          
          <ContactShadows 
            position={[0, -5, 0]} 
            opacity={0.5} 
            scale={30} 
            blur={2}
          />
          
          <Environment preset="city" />
        </Canvas>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 text-center px-4">
        <p className="text-muted mb-2">
          {currentImage 
            ? "Click again to return to gallery view" 
            : "Click on an image to focus • Use mouse to rotate"}
        </p>
        
        {currentImage && (
          <motion.button
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="btn btn-primary"
            onClick={() => openFullscreen(currentImage)}
          >
            Open Full Size
          </motion.button>
        )}
      </div>
      
      {showFullscreen && (
        <div 
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center"
          onClick={() => setShowFullscreen(false)}
        >
          <img 
            src={currentImage} 
            alt="Full size" 
            className="max-w-full max-h-full p-4 object-contain"
          />
          <button 
            className="absolute top-4 right-4 text-white text-2xl"
            onClick={() => setShowFullscreen(false)}
          >
            ✕
          </button>
        </div>
      )}
    </div>
  );
}

export default GalleryCarousel;