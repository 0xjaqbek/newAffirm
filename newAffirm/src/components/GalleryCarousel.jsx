// src/components/GalleryCarousel.jsx
import React, { useRef, useState } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useCursor, Image, Environment } from '@react-three/drei';
import * as THREE from 'three';
import { easing } from 'maath';

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

function ImageFrame({ url, ...props }) {
  const image = useRef();
  const [hovered, hover] = useState(false);
  const [clicked, click] = useState(false);
  useThree((state) => state.viewport);
  useCursor(hovered);
  
  useFrame((state, dt) => {
    easing.damp3(
      image.current.scale,
      clicked ? 1.2 : hovered ? [1.1, 1.1, 1] : [1, 1, 1],
      0.1,
      dt
    );
    easing.dampC(
      image.current.material.color,
      hovered ? 'white' : '#aaa',
      0.2,
      dt
    );
  });
  
  return (
    <Image
      ref={image}
      {...props}
      url={url}
      scale={[1, 1, 1]}
      onClick={(e) => (e.stopPropagation(), click(!clicked))}
      onPointerOver={(e) => (e.stopPropagation(), hover(true))}
      onPointerOut={() => hover(false)}
    />
  );
}

function Gallery({ images, ...props }) {
  useThree((state) => state.viewport);
  const group = useRef();
  const theta = Math.PI / 4;
  
  useFrame((state, dt) => {
    easing.damp3(
      group.current.rotation,
      [0, group.current.rotation.y + 0.007 * dt, 0],
      0.75,
      dt
    );
  });
  
  return (
    <group ref={group} {...props} dispose={null}>
      {images.map((url, i) => (
        <ImageFrame
          key={i}
          url={url}
          position={[
            Math.sin(i * theta) * 5,
            0,
            Math.cos(i * theta) * 5,
          ]}
          rotation={[0, Math.PI - i * theta, 0]}
        />
      ))}
    </group>
  );
}

function GalleryCarousel() {
  return (
    <div className="carousel-container">
      <Canvas camera={{ position: [0, 0, 15], fov: 50 }}>
        <color attach="background" args={['#121212']} />
        <ambientLight intensity={0.7} />
        <spotLight position={[0, 10, 0]} intensity={1} angle={0.3} penumbra={1} castShadow />
        
        <Gallery images={IMAGES} position={[0, -0.5, 0]} />
        
        <Environment preset="city" />
      </Canvas>
      
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-muted">Click on an image to enlarge • Use mouse to rotate</p>
      </div>
    </div>
  );
}

export default GalleryCarousel;