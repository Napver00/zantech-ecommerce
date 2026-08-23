import React, { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
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
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setImages(result.data);
        } else {
          throw new Error("Invalid API response format");
        }
      } catch (e) {
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
      setCurrentIndex((prev) => (prev + 1) % images.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [images.length]);

  if (isLoading)
    return <Skeleton className="w-full h-[340px] md:h-[460px] lg:h-[520px] rounded-2xl mb-6" />;

  if (error || images.length === 0)
    return (
      <div className="w-full h-[340px] md:h-[460px] rounded-2xl bg-slate-900 flex items-center justify-center mb-6 overflow-hidden relative">
        <div className="text-center px-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight">
            Awaken Your Hidden <span className="text-blue-400">Talent</span>
          </h2>
          <p className="text-slate-300 text-base md:text-lg mb-8 max-w-lg mx-auto">
            Next-generation robotic parts and DIY kits for innovators.
          </p>
          <div className="flex justify-center gap-3 flex-wrap">
            <Link to="/shop" className="bg-white text-gray-900 hover:bg-gray-100 px-7 py-3 rounded-xl font-bold transition-colors">
              Shop Now
            </Link>
            <Link to="/shop?category_slug=starter-kit" className="bg-white/10 border border-white/20 text-white hover:bg-white/15 px-7 py-3 rounded-xl font-semibold transition-colors">
              Starter Kits
            </Link>
          </div>
        </div>
      </div>
    );

  return (
    <div className="w-full mb-6">
      <div className="relative w-full h-[340px] md:h-[460px] lg:h-[520px] overflow-hidden rounded-2xl group bg-gray-900">
        {/* Slides */}
        {images.map((image, index) => (
          <div
            key={image.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            <img
              src={image.path}
              alt={`Hero slide ${index + 1}`}
              loading={index === 0 ? "eager" : "lazy"}
              fetchPriority={index === 0 ? "high" : "auto"}
              decoding="async"
              className="w-full h-full object-cover"
            />

            {/* Overlay for text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Content */}
            <div className="absolute inset-0 flex items-center justify-center text-center">
              <div className="px-6 md:px-12 max-w-3xl mx-auto">
                <span className="text-blue-300 text-xs font-bold uppercase tracking-[0.2em] mb-4 block">
                  ZAN Tech Robotics
                </span>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight tracking-tight">
                  Awaken your hidden <span className="text-blue-400">talent</span>
                </h1>

                <p className="text-gray-300 text-sm md:text-base mb-8 leading-relaxed max-w-xl mx-auto">
                  Next-generation robotic parts and DIY kits for innovators.
                </p>

                <div className="flex justify-center gap-3 flex-wrap">
                  <Link
                    to="/shop"
                    className="bg-white text-gray-900 hover:bg-gray-100 px-7 py-3 rounded-xl font-bold transition-colors active:scale-95 text-sm md:text-base"
                  >
                    Shop Now
                  </Link>
                  <Link
                    to="/shop?category_slug=starter-kit"
                    className="bg-white/10 border border-white/20 text-white hover:bg-white/15 px-7 py-3 rounded-xl font-semibold transition-colors text-sm md:text-base"
                  >
                    Starter Kits
                  </Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Arrow navigation */}
        {images.length > 1 && (
          <>
            <button
              aria-label="Previous slide"
              onClick={() => setCurrentIndex((i) => (i - 1 + images.length) % images.length)}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2.5 md:p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/20"
            >
              <ChevronLeft className="h-5 w-5 md:h-6 md:w-6" />
            </button>
            <button
              aria-label="Next slide"
              onClick={() => setCurrentIndex((i) => (i + 1) % images.length)}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 backdrop-blur-sm text-white p-2.5 md:p-3 rounded-full transition-all opacity-0 group-hover:opacity-100 z-20 border border-white/20"
            >
              <ChevronRight className="h-5 w-5 md:h-6 md:w-6" />
            </button>
          </>
        )}

        {/* Slide indicators */}
        {images.length > 1 && (
          <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`transition-all duration-300 rounded-full ${
                  index === currentIndex
                    ? "w-6 h-2 bg-white"
                    : "w-2 h-2 bg-white/40 hover:bg-white/70"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        )}

        {/* Slide counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white/80 text-xs font-semibold px-2.5 py-1 rounded-full z-20 border border-white/10">
            {currentIndex + 1} / {images.length}
          </div>
        )}
      </div>
    </div>
  );
};

export default HeroSection;
