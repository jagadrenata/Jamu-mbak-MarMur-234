'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { C } from '@/components/Navbar'; 
import { heroSlides } from '@/lib/siteConfig'; 

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  

  // Auto slide logic
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % heroSlides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [heroSlides.length, isHovered]);

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % heroSlides.length);
  };

  const goToSlide = (index) => {
    setCurrent(index);
  };

  return (
    <div
      className="relative w-full overflow-hidden"
      style={{ minHeight: '400px' }} // sedikit lebih tinggi biar nyaman
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Slides */}
      <AnimatePresence mode="wait">
        <motion.div
          key={current}
          className="absolute inset-0 bg-cover bg-center flex items-center justify-center"
          style={{
            backgroundImage: `url(${heroSlides[current].image})`,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 2, ease: 'easeInOut' }}
        >
          {/* Overlay + Content */}
          <div className="relative z-10 w-full h-full text-center mx-auto bg-black/35 px-14 flex flex-col items-center justify-center">
            <h1
              className="text-4xl sm:text-5xl md:text-6xl font-bold mb-4 md:mb-6 leading-tight drop-shadow-lg"
              style={{ fontFamily: "'Georgia', serif", color: C.textLight || '#fff' }}
            >
              {heroSlides[current].title}
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
              style={{ color: C.textLight || '#fff' }}
            >
              {heroSlides[current].description}
            </p>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Navigation Arrows */}
      <button
        onClick={goToPrev}
        className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-black/40 text-white hover:bg-black/70 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Slide sebelumnya"
      >
        <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      <button
        onClick={goToNext}
        className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-4 rounded-full bg-black/40 text-white hover:bg-black/70 transition-all duration-300 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/50"
        aria-label="Slide berikutnya"
      >
        <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
      </button>

      {/* Dots Indicator */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex items-center gap-3 sm:gap-4">
        {heroSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-400 transform ${
              current === index
                ? 'bg-white scale-110 shadow-lg shadow-white/40'
                : 'bg-white/50 hover:bg-white/80 hover:scale-95'
            }`}
            aria-label={`Pindah ke slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
}

export default HeroSlider;