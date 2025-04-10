// src/components/MobileCarousel.jsx
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiChevronLeft, FiChevronRight, FiMaximize } from 'react-icons/fi';

const MobileCarousel = ({ items, type }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [containerHeight, setContainerHeight] = useState(type === 'product' ? 450 : 350);
  
  // Update container height when items change
  useEffect(() => {
    // Set appropriate default heights based on content type
    setContainerHeight(type === 'product' ? 450 : 350);
  }, [items, type]);
  
  // Swipe handlers
  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };
  
  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };
  
  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;
    
    if (isLeftSwipe) {
      next();
    }
    
    if (isRightSwipe) {
      prev();
    }
    
    setTouchStart(null);
    setTouchEnd(null);
  };
  
  // Navigation functions
  const next = () => {
    setDirection(1);
    setCurrentIndex((prevIndex) => 
      prevIndex === items.length - 1 ? 0 : prevIndex + 1
    );
  };
  
  const prev = () => {
    setDirection(-1);
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? items.length - 1 : prevIndex - 1
    );
  };
  
  // Determine what to render based on carousel type
  const renderItem = (item) => {
    if (type === 'product') {
      return (
        <div className="flex flex-col items-center h-full">
          <div className="bg-surface p-4 rounded-lg shadow-md mb-3">
            <img 
              src={item.image} 
              alt={item.name} 
              className="h-52 w-auto object-contain mx-auto" 
            />
          </div>
          <h3 className="font-display font-bold text-xl mt-2">{item.name}</h3>
          <p className="text-sm text-muted">Size: {item.size}</p>
          <p className="text-accent font-bold mt-1">${item.price}</p>
          <p className="text-sm italic mt-1">{item.description}</p>
          <button 
            className="mt-4 btn btn-primary px-8 py-2 rounded-full"
            onClick={() => {
              const stripeLinks = {
                'buy_btn_1QOKLnK1N5l6JY7eOroi5V75': 'https://buy.stripe.com/9AQ5nH2pVfx7cgMaEI?locale=en&__embed_source=buy_btn_1QOKLnK1N5l6JY7eOroi5V75',
                'buy_btn_1QOKNFK1N5l6JY7e6zEMyXOG': 'https://buy.stripe.com/aEU7vP5C7bgRfsY5kp?locale=en&__embed_source=buy_btn_1QOKNFK1N5l6JY7e6zEMyXOG',
                'buy_btn_1QSG0JK1N5l6JY7ehIiH2UrZ': 'https://buy.stripe.com/3cs8zT8OjckVeoU28f?locale=en&__embed_source=buy_btn_1QSG0JK1N5l6JY7ehIiH2UrZ',
                'buy_btn_1QSFtuK1N5l6JY7eVuMSXjGE': 'https://buy.stripe.com/9AQcQ97KfacN0y428e?locale=en&__embed_source=buy_btn_1QSFtuK1N5l6JY7eVuMSXjGE'
              };
              window.open(stripeLinks[item.stripeId] || '#', '_blank');
            }}
          >
            Buy Now
          </button>
        </div>
      );
    } else {
      // Gallery item
      return (
        <div className="relative h-full flex items-center justify-center">
          <img 
            src={item} 
            alt="Gallery item" 
            className="max-h-64 w-auto object-contain mx-auto rounded-lg" 
          />
          <button 
            className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full"
            onClick={() => setShowFullscreen(true)}
          >
            <FiMaximize size={20} />
          </button>
        </div>
      );
    }
  };
  
  // Pagination indicators
  const renderPagination = () => {
    return (
      <div className="flex justify-center space-x-2 mt-4">
        {items.map((_, index) => (
          <button
            key={index}
            className={`h-2 rounded-full transition-all ${
              currentIndex === index ? 'w-6 bg-accent' : 'w-2 bg-muted'
            }`}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
            }}
          />
        ))}
      </div>
    );
  };
  
  return (
    <div className="relative">
      <div 
        className="overflow-hidden relative w-full"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        style={{ height: `${containerHeight}px` }}
      >
        <div className="flex justify-between absolute top-1/2 left-0 right-0 z-10 px-2 transform -translate-y-1/2 pointer-events-none">
          <button 
            onClick={prev}
            className="bg-black bg-opacity-30 text-white p-2 rounded-full pointer-events-auto"
          >
            <FiChevronLeft size={24} />
          </button>
          <button 
            onClick={next}
            className="bg-black bg-opacity-30 text-white p-2 rounded-full pointer-events-auto"
          >
            <FiChevronRight size={24} />
          </button>
        </div>
        
        <div className="absolute inset-0 flex items-center justify-center">
          <AnimatePresence initial={false} custom={direction} mode="popLayout">
            <motion.div
              key={currentIndex}
              custom={direction}
              initial={{ opacity: 0, x: direction * 300, y: 0 }}
              animate={{ opacity: 1, x: 0, y: 0 }}
              exit={{ opacity: 0, x: direction * -300, y: 0 }}
              transition={{ 
                duration: 0.3,
                ease: "easeInOut"
              }}
              className="w-full h-full flex items-center justify-center px-4"
            >
              <div className="w-full h-full flex items-center justify-center">
                {renderItem(items[currentIndex])}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
      
      {renderPagination()}
      
      {/* Fullscreen viewer for gallery */}
      {showFullscreen && type === 'gallery' && (
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
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            src={items[currentIndex]} 
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
    </div>
  );
};

export default MobileCarousel;