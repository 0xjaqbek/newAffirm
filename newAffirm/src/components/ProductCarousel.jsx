// src/components/ProductCarousel.jsx
import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, ContactShadows, PresentationControls } from '@react-three/drei';


// This would be a simple 3D model of a t-shirt
function TShirtModel({ color, onClick, isActive, position }) {
  const group = useRef();
  
  // In a real implementation, you would import an actual t-shirt model
  // For this example, we'll use a simple box to represent the t-shirt
  useFrame((state) => {
    if (!isActive) return;
    group.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.2;
  });

  return (
    <group 
      ref={group} 
      position={position} 
      onClick={onClick}
      scale={isActive ? 1.1 : 1}
      cursor="pointer"
    >
      <mesh castShadow receiveShadow>
        <boxGeometry args={[1.5, 2, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  );
}

const products = [
  { id: 1, name: "Olive Affirmation Tee", size: "L", color: "#8A9A5B", price: 47, stripeId: "buy_btn_1QOKLnK1N5l6JY7eOroi5V75" },
  { id: 2, name: "Olive Affirmation Tee", size: "M", color: "#8A9A5B", price: 47, stripeId: "buy_btn_1QOKNFK1N5l6JY7e6zEMyXOG" },
  { id: 3, name: "Pure White Affirmation Tee", size: "L", color: "#F5F5F5", price: 47, stripeId: "buy_btn_1QSG0JK1N5l6JY7ehIiH2UrZ" },
  { id: 4, name: "Pure White Affirmation Tee", size: "M", color: "#F5F5F5", price: 47, stripeId: "buy_btn_1QSFtuK1N5l6JY7eVuMSXjGE" },
];

function ProductCarousel() {
  const [activeProduct, setActiveProduct] = useState(products[0]);
  const [showDetails, setShowDetails] = useState(false);
  
  return (
    <div className="relative">
      <div className="carousel-container">
        <Canvas dpr={[1, 2]} camera={{ position: [0, 0, 5], fov: 50 }}>
          <color attach="background" args={['#121212']} />
          <ambientLight intensity={0.7} />
          <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
          
          <PresentationControls
            global
            rotation={[0, 0, 0]}
            polar={[-Math.PI / 4, Math.PI / 4]}
            azimuth={[-Math.PI / 4, Math.PI / 4]}
            config={{ mass: 2, tension: 400 }}
            snap={{ mass: 4, tension: 400 }}
          >
            {products.map((product, index) => (
              <TShirtModel
                key={product.id}
                color={product.color}
                position={[index * 2.5 - 3.75, 0, 0]}
                isActive={activeProduct.id === product.id}
                onClick={() => setActiveProduct(product)}
              />
            ))}
          </PresentationControls>
          
          <ContactShadows
            position={[0, -2, 0]}
            opacity={0.4}
            scale={10}
            blur={1.5}
            far={4}
          />
          <Environment preset="city" />
        </Canvas>
      </div>
      
      <motion.div
        className="absolute bottom-4 left-0 right-0 mx-auto max-w-md bg-surface/90 backdrop-blur-sm p-4 rounded-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-display font-bold text-xl">{activeProduct.name}</h3>
            <p className="text-sm text-muted">Size: {activeProduct.size}</p>
            <p className="text-accent font-bold mt-1">${activeProduct.price}</p>
          </div>
          
          <div className="flex space-x-2">
            <button
              className="btn btn-outline text-sm"
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? 'Hide Details' : 'Details'}
            </button>
            <button
              className="btn btn-primary text-sm"
              onClick={() => {
                // In a real implementation, this would integrate with Stripe
                window.open(`https://buy.stripe.com/${activeProduct.stripeId}`, '_blank');
              }}
            >
              Buy Now
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
            <p>Each aFFiRM tee comes with an embedded NFC tag, connecting you instantly to meditations and affirmations. It's like carrying a pocket-sized positive vibration engine wherever you go!</p>
            <div className="mt-2 flex justify-end">
              <button className="text-xs text-accent">Crypto payment available</button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
}

export default ProductCarousel;