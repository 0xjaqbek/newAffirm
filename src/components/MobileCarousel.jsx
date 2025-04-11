// src/components/MobileCarousel.jsx
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMaximize, FiChevronDown, FiChevronUp } from 'react-icons/fi';
// Import Swiper React components
import { Swiper, SwiperSlide } from 'swiper/react';
// Import required modules
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';

const MobileCarousel = ({ items, type }) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState(type === 'product' ? 450 : 350);
  const [showDetails, setShowDetails] = useState(false);
  const swiperRef = useRef(null);
  
  // Update container height when items change
  useEffect(() => {
    // Set appropriate default heights based on content type
    setContainerHeight(type === 'product' ? 450 : 350);
  }, [items, type]);
  
  // Control autoplay based on showDetails state
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.swiper) {
      if (showDetails) {
        // Stop autoplay when details are shown
        swiperRef.current.swiper.autoplay.stop();
      } else {
        // Resume autoplay when details are hidden
        swiperRef.current.swiper.autoplay.start();
      }
    }
  }, [showDetails]);
  
  // Determine what to render based on carousel type
  const renderProductItem = (item) => {
    return (
      <div className="flex flex-col items-center h-full py-6">
        <div className="bg-surface p-4 rounded-lg shadow-md mb-3 transform transition-all duration-300 hover:scale-105">
          <img 
            src={item.image} 
            alt={item.name} 
            className="h-48 w-auto object-contain mx-auto" 
          />
        </div>
        <h3 className="font-display font-bold text-xl mt-2">{item.name}</h3>
        <p className="text-sm text-muted">Size: {item.size}</p>
        <p className="text-accent font-bold mt-1">${item.price}</p>
        <p className="text-sm italic mt-1">{item.description}</p>
        
        <div className="flex flex-col items-center mt-3 space-y-2">
          <button 
            className="btn btn-primary px-6 py-2 rounded-full"
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
          
          <button 
            className="btn btn-outline text-xs px-3 py-1 flex items-center"
            onClick={(e) => {
              e.stopPropagation();
              setShowDetails(!showDetails);
            }}
          >
            {showDetails ? 'Less Info' : 'More Info'} 
            {showDetails ? <FiChevronUp className="ml-1" /> : <FiChevronDown className="ml-1" />}
          </button>
        </div>
      </div>
    );
  };

  const renderGalleryItem = (item, index) => {
    return (
      <div className="relative h-full flex items-center justify-center py-6">
        <img 
          src={item} 
          alt="Gallery item" 
          className="max-h-64 w-auto object-contain mx-auto rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105" 
        />
        <button 
          className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full"
          onClick={() => {
            setActiveIndex(index);
            setShowFullscreen(true);
          }}
        >
          <FiMaximize size={20} />
        </button>
      </div>
    );
  };
  
  return (
    <div className="relative">
      <div 
        className="w-full"
        style={{ 
          height: `${containerHeight + 40}px`,
          perspective: '1000px',
          perspectiveOrigin: 'center'
        }}
      >
        <Swiper
          ref={swiperRef}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{
            rotate: 50,
            stretch: 0,
            depth: 100,
            modifier: 1,
            slideShadows: true,
          }}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
            pauseOnMouseEnter: true,
          }}
          pagination={{
            clickable: true,
          }}
          navigation={true}
          modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
          className="h-full"
          onSlideChange={(swiper) => {
            setActiveIndex(swiper.activeIndex);
            setShowDetails(false); // Reset details when slide changes
          }}
        >
          {items.map((item, index) => (
            <SwiperSlide 
              key={index} 
              style={{ 
                width: type === 'product' ? '280px' : '320px',
                height: type === 'product' ? '380px' : '280px',
              }}
              className="bg-background/30 backdrop-blur-sm rounded-lg border border-muted/10"
            >
              {type === 'product' ? renderProductItem(item) : renderGalleryItem(item, index)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
      
      {/* More Info Panel for Products */}
      {showDetails && type === 'product' && (
        <motion.div 
          className="bg-surface/90 backdrop-blur-sm p-4 rounded-lg shadow-lg mx-auto max-w-sm -mt-32"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-sm mb-3">
            Each aFFiRM tee comes with an embedded NFC tag, connecting you instantly to meditations and affirmations. 
            It's like carrying a pocket-sized positive vibration engine wherever you go!
          </p>
          <button 
            className="btn btn-outline text-xs px-3 py-1 mx-auto block"
            onClick={() => setShowDetails(false)}
          >
            Close
          </button>
        </motion.div>
      )}
      
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
            src={items[activeIndex]} 
            alt="Full size" 
            className="max-w-full max-h-full p-4 object-contain"
          />
          <div className="absolute bottom-10 flex space-x-4">
            <button 
              className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(prev => prev > 0 ? prev - 1 : items.length - 1);
              }}
            >
              Previous
            </button>
            <button 
              className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full"
              onClick={(e) => {
                e.stopPropagation();
                setActiveIndex(prev => prev < items.length - 1 ? prev + 1 : 0);
              }}
            >
              Next
            </button>
          </div>
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