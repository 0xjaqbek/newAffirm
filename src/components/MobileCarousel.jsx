// src/components/MobileCarousel.jsx
import React, { useState, useEffect, useRef, useContext } from 'react';
import { motion } from 'framer-motion';
import { FiMaximize } from 'react-icons/fi';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Navigation, Autoplay } from 'swiper/modules';
import { ThemeContext } from '../contexts/ThemeContext';

const MobileCarousel = ({ items, type }) => {
  const [showFullscreen, setShowFullscreen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [containerHeight, setContainerHeight] = useState(type === 'product' ? 450 : 350);
  const swiperRef = useRef(null);
  const { theme } = useContext(ThemeContext);
  const isDark = theme === 'dark';

  useEffect(() => {
    setContainerHeight(type === 'product' ? 450 : 350);
  }, [items, type]);

  const renderProductItem = (item) => {
    return (
      <div className="flex flex-col items-center h-full py-6">
        <div className="bg-surface p-4 rounded-lg shadow-md mb-3 transform transition-all duration-300 hover:scale-105">
          <img src={item.image} alt={item.name} className="h-48 w-auto object-contain mx-auto" />
        </div>
        <h3 className={`font-display font-bold text-xl mt-2 ${isDark ? 'text-dark-text' : 'text-light-text'}`}>{item.name}</h3>
        <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{item.set}</p>
        <p className={`text-sm ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{item.rarity} • {item.condition}</p>
        {item.types?.length > 0 && (
          <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>{item.types.join(', ')}</p>
        )}
        <p className={`font-bold mt-1 ${isDark ? 'text-dark-accent' : 'text-light-highlight'}`}>${item.price}</p>
        <p className={`text-xs ${isDark ? 'text-dark-muted' : 'text-light-muted'}`}>Stock: {item.stock}</p>
        <div className="flex flex-col items-center mt-3">
          <button
            className={`btn px-6 py-2 rounded-full ${isDark ? 'btn-primary' : 'bg-light-highlight text-white hover:bg-light-highlight/90'}`}
            onClick={() => document.querySelector('footer')?.scrollIntoView({ behavior: 'smooth' })}
          >
            Contact to Buy
          </button>
        </div>
      </div>
    );
  };

  const renderGalleryItem = (item, index) => {
    return (
      <div className="relative h-full flex items-center justify-center py-6">
        <img src={item} alt="Gallery item" className="max-h-64 w-auto object-contain mx-auto rounded-lg shadow-xl transform transition-all duration-300 hover:scale-105" />
        <button
          className="absolute bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded-full"
          onClick={() => { setActiveIndex(index); setShowFullscreen(true); }}
        >
          <FiMaximize size={20} />
        </button>
      </div>
    );
  };

  return (
    <div className="relative">
      <div className="w-full" style={{ height: `${containerHeight + 40}px`, perspective: '1000px', perspectiveOrigin: 'center' }}>
        <Swiper
          ref={swiperRef}
          effect={'coverflow'}
          grabCursor={true}
          centeredSlides={true}
          slidesPerView={'auto'}
          coverflowEffect={{ rotate: 50, stretch: 0, depth: 100, modifier: 1, slideShadows: true }}
          autoplay={{ delay: 3000, disableOnInteraction: false, pauseOnMouseEnter: true }}
          speed={1000}
          pagination={{ clickable: true, dynamicBullets: true }}
          navigation={true}
          modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
          className="h-full"
          onSlideChange={(swiper) => setActiveIndex(swiper.activeIndex)}
        >
          {items.map((item, index) => (
            <SwiperSlide
              key={index}
              style={{ width: type === 'product' ? '280px' : '320px', height: type === 'product' ? '380px' : '280px' }}
              className={`${isDark ? 'bg-dark-background/30' : 'bg-light-background/30'} backdrop-blur-sm rounded-lg border ${isDark ? 'border-dark-muted/10' : 'border-light-border/10'}`}
            >
              {type === 'product' ? renderProductItem(item) : renderGalleryItem(item, index)}
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      {showFullscreen && type === 'gallery' && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center"
          onClick={() => setShowFullscreen(false)}
        >
          <motion.img
            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            src={items[activeIndex]} alt="Full size"
            className="max-w-full max-h-full p-4 object-contain"
          />
          <div className="absolute bottom-10 flex space-x-4">
            <button className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full" onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev > 0 ? prev - 1 : items.length - 1); }}>Previous</button>
            <button className="bg-black bg-opacity-50 text-white px-4 py-2 rounded-full" onClick={(e) => { e.stopPropagation(); setActiveIndex(prev => prev < items.length - 1 ? prev + 1 : 0); }}>Next</button>
          </div>
          <button className="absolute top-6 right-6 text-white text-xl bg-black bg-opacity-50 rounded-full w-10 h-10 flex items-center justify-center hover:bg-opacity-80 transition-all" onClick={(e) => { e.stopPropagation(); setShowFullscreen(false); }}>✕</button>
        </motion.div>
      )}
    </div>
  );
};

export default MobileCarousel;
