// src/hooks/useMobileDetector.js
import { useState, useEffect } from 'react';

export const useMobileDetector = () => {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    // Function to check if the screen is mobile
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Standard breakpoint for tablets
    };
    
    // Check on initial load
    checkMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkMobile);
    
    // Clean up
    return () => window.removeEventListener('resize', checkMobile);
  }, []);
  
  return isMobile;
};