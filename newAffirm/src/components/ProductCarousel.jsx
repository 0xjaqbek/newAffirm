// src/components/ProductCarousel.jsx - Improved version
import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useThree, useFrame } from '@react-three/fiber';
import { useCursor, Environment, PresentationControls, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';

// Product data
const products = [
  { 
    id: 1, 
    name: "Olive Affirmation Tee", 
    size: "L", 
    color: "#8A9A5B", 
    price: 47, 
    description: "Manifest Your Reality",
    stripeId: "buy_btn_1QOKLnK1N5l6JY7eOroi5V75",
    image: "/images/olive-tee-l.png"
  },
  { 
    id: 2, 
    name: "Olive Affirmation Tee", 
    size: "M", 
    color: "#8A9A5B", 
    price: 47, 
    description: "Create Your Perfect World",
    stripeId: "buy_btn_1QOKNFK1N5l6JY7e6zEMyXOG",
    image: "/images/olive-tee-m.png"
  },
  { 
    id: 3, 
    name: "Pure White Affirmation Tee", 
    size: "L", 
    color: "#F5F5F5", 
    price: 47, 
    description: "Embrace Pure Energy",
    stripeId: "buy_btn_1QSG0JK1N5l6JY7ehIiH2UrZ",
    image: "/images/white-tee-l.png"
  },
  { 
    id: 4, 
    name: "Pure White Affirmation Tee", 
    size: "M", 
    color: "#F5F5F5", 
    price: 47, 
    description: "Pure Light Within",
    stripeId: "buy_btn_1QSFtuK1N5l6JY7eVuMSXjGE",
    image: "/images/white-tee-m.png"
  },
];

// This component represents a single product in the 3D space
function ProductFrame({ product, index, setFocused, isFocused, groupRef, ...props }) {
  const mesh = useRef();
  const [hovered, setHovered] = useState(false);
  const { viewport, camera } = useThree();
  useCursor(hovered);
  
  // Base scale for products
  const baseScale = 2.2;
  
  // Responsive scaling based on viewport
  const scaleFactor = Math.min(viewport.width, viewport.height) / 12;
  
  // Store original position for animation
  const [originalPosition] = useState(new THREE.Vector3(...props.position));
  
  useFrame((state) => {
    if (!mesh.current) return;
    
    // Force products to always face camera, even during user interaction
    // This will override any rotation from the parent group
    
    // Calculate the direction vector to the camera
    const position = new THREE.Vector3();
    mesh.current.getWorldPosition(position);
    
    // Direction from product to camera
    const direction = new THREE.Vector3().subVectors(camera.position, position);
    
    // Create a rotation that looks at the camera
    mesh.current.updateWorldMatrix(true, false);
    const worldQuaternion = new THREE.Quaternion();
    mesh.current.getWorldQuaternion(worldQuaternion);
    
    // Calculate the target quaternion (looking at camera)
    const targetQuaternion = new THREE.Quaternion();
    const m = new THREE.Matrix4().lookAt(
      position,
      new THREE.Vector3().addVectors(position, direction),
      new THREE.Vector3(0, 1, 0)
    );
    targetQuaternion.setFromRotationMatrix(m);
    
    // Convert world rotation to local
    const parentQuaternion = new THREE.Quaternion();
    if (mesh.current.parent) {
      mesh.current.parent.updateWorldMatrix(true, false);
      mesh.current.parent.getWorldQuaternion(parentQuaternion);
      parentQuaternion.invert();
    }
    
    // Calculate local quaternion needed to achieve the world-space target
    const localTargetQuaternion = new THREE.Quaternion().multiplyQuaternions(
      parentQuaternion, 
      targetQuaternion
    );
    
    // Apply with immediate response (minimal interpolation)
    mesh.current.quaternion.slerp(localTargetQuaternion, 0.8);
    
    // Animation for hover and focus states
    if (!isFocused) {
      // Gentle hover animation
      const hover = hovered ? 0.15 : 0;
      mesh.current.scale.x = THREE.MathUtils.lerp(
        mesh.current.scale.x,
        baseScale * scaleFactor + hover,
        0.05
      );
      mesh.current.scale.y = THREE.MathUtils.lerp(
        mesh.current.scale.y,
        baseScale * scaleFactor + hover,
        0.05
      );
      
      // Adjust material color for hover
      mesh.current.material.color.lerp(
        new THREE.Color(hovered ? product.color : adjustColorBrightness(product.color, -0.3)),
        0.05
      );
      
      // Move back to original position when not focused
      const targetPosition = originalPosition.clone();
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetPosition.x, 0.1);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetPosition.y, 0.1);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, targetPosition.z, 0.1);
    } else {
      // Focused product is larger
      mesh.current.scale.x = THREE.MathUtils.lerp(
        mesh.current.scale.x,
        baseScale * scaleFactor * 1.8, // Increased scale when focused
        0.1
      );
      mesh.current.scale.y = THREE.MathUtils.lerp(
        mesh.current.scale.y,
        baseScale * scaleFactor * 1.8, // Increased scale when focused
        0.1
      );
      
      // Full color for focused product
      mesh.current.material.color.lerp(new THREE.Color(product.color), 0.05);
      
      // Move focused product closer to the camera
      const cameraDirection = direction.clone().normalize();
      const targetPosition = originalPosition.clone().add(
        cameraDirection.multiplyScalar(1.9) // Move toward camera
      );
      
      mesh.current.position.x = THREE.MathUtils.lerp(mesh.current.position.x, targetPosition.x, 0.1);
      mesh.current.position.y = THREE.MathUtils.lerp(mesh.current.position.y, targetPosition.y, 0.1);
      mesh.current.position.z = THREE.MathUtils.lerp(mesh.current.position.z, targetPosition.z, 0.1);
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
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
      }}
      onPointerOut={() => setHovered(false)}
      scale={[baseScale * scaleFactor, baseScale * scaleFactor, 0.1]}
    >
      <boxGeometry args={[1, 1.5, 0.1]} />
      <meshStandardMaterial color={product.color} />
      {/* You could use a texture map here with the t-shirt image if available */}
    </mesh>
  );
}

function ProductsGallery({ setCurrentProduct }) {
  const [focusedIndex, setFocusedIndex] = useState(null);
  const group = useRef();
  const { viewport } = useThree();
  
  // Calculate radius based on viewport and number of products
  // Reduced radius for smaller distance between products
  const radius = Math.min(viewport.width, viewport.height) * 0.45;
  const theta = (2 * Math.PI) / products.length;
  
  // Update current product when focus changes
  useEffect(() => {
    if (focusedIndex !== null) {
      setCurrentProduct(products[focusedIndex]);
    } else {
      setCurrentProduct(null);
    }
  }, [focusedIndex, setCurrentProduct]);
  
  // Auto-rotation with products facing camera
  useFrame((state, delta) => {
    if (focusedIndex === null) {
      // Slow rotation of the entire group
      group.current.rotation.y += delta * 0.1;
      
      // The counter-rotation is now handled in each individual ProductFrame component
      // This provides better control and separation of concerns
    }
  });
  
  return (
    <group ref={group} position={[0, 0, 0]} rotation={[0, Math.PI / 4, 0]}>
      {products.map((product, i) => (
        <ProductFrame
          key={product.id}
          product={product}
          index={i}
          position={[
            radius * Math.sin(i * theta),
            0,
            radius * Math.cos(i * theta)
          ]}
          groupRef={group}
          setFocused={setFocusedIndex}
          isFocused={focusedIndex === i}
        />
      ))}
    </group>
  );
}

function ProductCarousel() {
  const [currentProduct, setCurrentProduct] = useState(null);
  const [showDetails, setShowDetails] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('stripe');

  return (
    <div className="relative">
      <div className="carousel-container" style={{ height: '60vh' }}>
        <Canvas
          camera={{ position: [0, 0, 15], fov: 50 }}
          dpr={[1, 2]}
          gl={{ preserveDrawingBuffer: true }}
        >
          <color attach="background" args={['#121212']} />
          <fog attach="fog" args={['#121212', 8, 30]} />
          
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          
          <PresentationControls
            global
            zoom={0.8}
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 3, Math.PI / 3]}
            azimuth={[-Math.PI / 1.5, Math.PI / 1.5]}
            config={{ mass: 1, tension: 170, friction: 26 }}
            snap={false}
            enabled={currentProduct === null} // Disable controls when a product is selected
          >
            <ProductsGallery setCurrentProduct={setCurrentProduct} />
          </PresentationControls>
          
          <ContactShadows
            position={[0, -4, 0]}
            opacity={0.5}
            scale={20}
            blur={2}
          />
          
          <Environment preset="city" />
        </Canvas>
      </div>
      
      <div className="absolute bottom-4 left-0 right-0 text-center">
        <p className="text-muted mb-2">
          {currentProduct 
            ? "Click product again to deselect" 
            : "Click on a product to view details"}
        </p>
      </div>
      
      {/* Product details panel */}
      {currentProduct && (
        <motion.div
          className="absolute bottom-12 left-0 right-0 mx-auto max-w-md bg-surface/90 backdrop-blur-sm p-6 rounded-lg shadow-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-display font-bold text-xl">{currentProduct.name}</h3>
              <p className="text-sm text-muted">Size: {currentProduct.size}</p>
              <p className="text-accent font-bold mt-1">${currentProduct.price}</p>
              <p className="text-sm italic mt-1">{currentProduct.description}</p>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                className="btn btn-outline text-sm"
                onClick={() => setShowDetails(!showDetails)}
              >
                {showDetails ? 'Hide Details' : 'More Info'}
              </button>
            </div>
          </div>
          
          {showDetails && (
            <motion.div
              className="mt-4 text-sm"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              transition={{ duration: 0.3 }}
            >
              <p className="mb-4">Each aFFiRM tee comes with an embedded NFC tag, connecting you instantly to meditations and affirmations. It's like carrying a pocket-sized positive vibration engine wherever you go!</p>
              
              {/* Payment options */}
              <div className="mt-4">
                <div className="flex justify-between items-center mb-3">
                  <div className="flex space-x-2">
                    <button 
                      className={`text-xs px-3 py-1 rounded-full ${paymentMethod === 'stripe' ? 'bg-accent text-white' : 'bg-surface border border-accent/50 text-muted'}`}
                      onClick={() => setPaymentMethod('stripe')}
                    >
                      Credit Card
                    </button>
                    <button 
                      className={`text-xs px-3 py-1 rounded-full ${paymentMethod === 'crypto' ? 'bg-accent text-white' : 'bg-surface border border-accent/50 text-muted'}`}
                      onClick={() => setPaymentMethod('crypto')}
                    >
                      Crypto
                    </button>
                  </div>
                  
                  <button
                    className="btn btn-primary"
                    onClick={() => {
                      if (paymentMethod === 'stripe') {
                        // Use the complete links provided
                        const stripeLinks = {
                          'buy_btn_1QOKLnK1N5l6JY7eOroi5V75': 'https://buy.stripe.com/9AQ5nH2pVfx7cgMaEI?locale=en&__embed_source=buy_btn_1QOKLnK1N5l6JY7eOroi5V75',
                          'buy_btn_1QOKNFK1N5l6JY7e6zEMyXOG': 'https://buy.stripe.com/aEU7vP5C7bgRfsY5kp?locale=en&__embed_source=buy_btn_1QOKNFK1N5l6JY7e6zEMyXOG',
                          'buy_btn_1QSG0JK1N5l6JY7ehIiH2UrZ': 'https://buy.stripe.com/3cs8zT8OjckVeoU28f?locale=en&__embed_source=buy_btn_1QSG0JK1N5l6JY7ehIiH2UrZ',
                          'buy_btn_1QSFtuK1N5l6JY7eVuMSXjGE': 'https://buy.stripe.com/9AQcQ97KfacN0y428e?locale=en&__embed_source=buy_btn_1QSFtuK1N5l6JY7eVuMSXjGE'
                        };
                        
                        window.open(stripeLinks[currentProduct.stripeId] || '#', '_blank');
                      } else {
                        // Open crypto payment modal
                        alert('Crypto payment option would open here');
                      }
                    }}
                  >
                    Buy Now
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </div>
  );
}

export default ProductCarousel;