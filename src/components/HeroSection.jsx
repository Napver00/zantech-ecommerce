import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { config } from "@/config";

const HeroSection = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.baseURL}/hero-images`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setImages(result.data);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (e) {
        console.error("Failed to fetch hero images:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length === 0) return;

    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 5000);

    return () => clearInterval(timer);
  }, [images.length]);

  const goToPrevious = () => {
    if (images.length === 0) return;
    setCurrentIndex(
      (prevIndex) => (prevIndex - 1 + images.length) % images.length,
    );
  };

  const goToNext = () => {
    if (images.length === 0) return;
    setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const goToSlide = (index) => {
    setCurrentIndex(index);
  };

  if (isLoading) {
    return (
      <div className="w-full">
        <Skeleton className="w-full h-[400px] md:h-[500px] lg:h-[600px] rounded-none" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
        <div className="text-center px-6">
          <p className="text-gray-600 text-lg mb-4">Failed to load images</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (images.length === 0) {
    return (
      <div className="w-full h-[400px] md:h-[500px] lg:h-[600px] bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4">
            Welcome to Our Store
          </h2>
          <p className="text-gray-600 text-lg">Discover amazing products</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full mb-8">
      {/* Full-width Hero Slider */}
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px] overflow-hidden bg-gray-900 group">
        {/* Images */}
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex
                ? "opacity-100 scale-100"
                : "opacity-0 scale-105"
            }`}
          >
            <img
              src={image.path}
              alt={`Hero slide ${index + 1}`}
              className="w-full h-full object-cover"
            />
            {/* Subtle Overlay */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Centered Minimalist Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="container mx-auto px-4 md:px-8">
                <div
                  className={`max-w-3xl mx-auto transition-all duration-1000 transform ${
                    index === currentIndex
                      ? "translate-y-0 opacity-100"
                      : "translate-y-4 opacity-0"
                  }`}
                >
                  <span className="inline-block px-3 py-1 bg-white/10 backdrop-blur-md text-white/80 text-[10px] font-bold uppercase tracking-[0.3em] rounded-full mb-6 border border-white/10">
                    ZánTech Robotics
                  </span>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                    Awaken your hidden <br />
                    <span className="text-blue-400">Talent</span>
                  </h1>
                  <p className="text-gray-200 text-base md:text-lg mb-10 leading-relaxed max-w-xl mx-auto opacity-90">
                    Next-generation robotic parts and DIY kits for innovators.
                  </p>
                  <div className="flex justify-center">
                    <button className="bg-white text-gray-900 hover:bg-blue-600 hover:text-white px-10 py-4 rounded-full font-bold transition-all shadow-xl active:scale-95">
                      Shop Now
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Navigation Arrows - Minimal */}
        {images.length > 1 && (
          <>
            <button
              aria-label="Previous slide"
              onClick={goToPrevious}
              className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <ChevronLeft className="h-8 w-8" />
            </button>

            <button
              aria-label="Next slide"
              onClick={goToNext}
              className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-all opacity-0 group-hover:opacity-100 z-20"
            >
              <ChevronRight className="h-8 w-8" />
            </button>
          </>
        )}

        {/* Indicators - Simple Dots */}
        {images.length > 1 && (
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2.5 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-2.5 h-2.5 bg-white"
                    : "w-2 h-2 bg-white/20 hover:bg-white/40"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
