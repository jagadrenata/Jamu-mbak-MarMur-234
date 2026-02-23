'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { C } from '@/components/Navbar'; // sesuaikan path jika perlu

function HeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = [
    {
      image: 'https://come2indonesia.com/wp-content/uploads/2021/02/jamu-3.jpg',
      title: '🌿 Jamu Mbak MarMur',
      description: 'Jamu tradisional pilihan, dibuat dengan cinta dari bahan-bahan alami terbaik.',
    },
    {
      image: 'https://www.foodandwine.com/thmb/KnwEFDzXWXC97r2fsHyvr83J_E4=/1500x0/filters:no_upscale():max_bytes(150000):strip_icc()/Jamu-The-drink-that-Indonesians-swear-by-FT-BOG0125-01B-c60d5317b31f447ab62513a5b54be331.jpg',
      title: 'Nikmati Kesehatan Alami',
      description: 'Rasakan manfaat jamu asli Indonesia untuk tubuh dan pikiran sehat setiap hari.',
    },
    {
      image: 'https://cdn.shopify.com/s/files/1/0012/1657/7656/files/jamu_11563cfd-1d26-469c-a1a8-8ec2a5c6f90f.jpg?v=1739511288',
      title: 'Rasa Tradisi, Manfaat Nyata',
      description: 'Dibuat dari resep turun-temurun dengan bahan organik pilihan.',
    },
  ];

  // Auto slide logic
  useEffect(() => {
    if (isHovered) return;

    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 10000);

    return () => clearInterval(timer);
  }, [slides.length, isHovered]);

  const goToPrev = () => {
    setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToNext = () => {
    setCurrent((prev) => (prev + 1) % slides.length);
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
            backgroundImage: `url(${slides[current].image})`,
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
              {slides[current].title}
            </h1>
            <p
              className="text-lg sm:text-xl md:text-2xl opacity-90 max-w-3xl mx-auto leading-relaxed drop-shadow-md"
              style={{ color: C.textLight || '#fff' }}
            >
              {slides[current].description}
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
        {slides.map((_, index) => (
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