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
      <div className="w-full h-[340px] md:h-[460px] rounded-2xl bg-gradient-to-br from-slate-900 via-blue-950 to-indigo-900 flex items-center justify-center mb-6 overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-blue-700/20 via-transparent to-transparent" />
        <div className="text-center px-6 relative z-10">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-3 leading-tight"
            style={{ textShadow: "0 4px 24px rgba(0,0,0,0.6)" }}>
            Awaken Your Hidden <span className="text-blue-400">Talent</span>
          </h2>
          <p className="text-blue-200 text-base md:text-lg mb-8 max-w-lg mx-auto">
            Next-generation robotic parts and DIY kits for innovators.
          </p>
          <div className="flex justify-center gap-4 flex-wrap">
            <Link to="/shop" className="bg-white text-gray-900 hover:bg-blue-500 hover:text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-xl">
              Shop Now
            </Link>
            <Link to="/shop?category_slug=starter-kit" className="bg-white/10 border border-white/30 text-white hover:bg-white/20 px-7 py-3.5 rounded-full font-semibold transition-all backdrop-blur-sm">
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
            className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100 scale-100" : "opacity-0 scale-105"
            }`}
          >
            <img src={image.path} alt={`Hero slide ${index + 1}`} className="w-full h-full object-cover" />

            {/* Multi-layer overlay for strong text contrast */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/15" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent" />

            {/* Content */}
            <div
              className={`absolute inset-0 flex items-center justify-center text-center transition-all duration-1000 ${
                index === currentIndex ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
              }`}
            >
              <div className="px-6 md:px-12 max-w-3xl mx-auto">
                <span className="inline-block px-4 py-1.5 bg-white/15 backdrop-blur-md text-white/90 text-[10px] font-black uppercase tracking-[0.35em] rounded-full mb-5 border border-white/20"
                  style={{ textShadow: "0 1px 8px rgba(0,0,0,0.5)" }}>
                  ZánTech Robotics
                </span>

                <h1 className="text-3xl md:text-5xl lg:text-6xl font-black text-white mb-5 leading-tight tracking-tight"
                  style={{ textShadow: "0 4px 32px rgba(0,0,0,0.9), 0 2px 8px rgba(0,0,0,0.8)" }}>
                  Awaken your hidden{" "}
                  <br />
                  <span className="text-blue-400" style={{ textShadow: "0 4px 32px rgba(59,130,246,0.8), 0 2px 8px rgba(0,0,0,0.9)" }}>
                    Talent
                  </span>
                </h1>

                <p className="text-gray-200 text-sm md:text-base mb-8 leading-relaxed max-w-xl mx-auto"
                  style={{ textShadow: "0 2px 16px rgba(0,0,0,0.9)" }}>
                  Next-generation robotic parts and DIY kits for innovators.
                </p>

                <div className="flex justify-center gap-3 flex-wrap">
                  <Link
                    to="/shop"
                    className="bg-white text-gray-900 hover:bg-blue-500 hover:text-white px-8 py-3.5 rounded-full font-bold transition-all shadow-2xl shadow-black/40 active:scale-95 text-sm md:text-base"
                  >
                    Shop Now
                  </Link>
                  <Link
                    to="/shop?category_slug=starter-kit"
                    className="bg-white/15 border border-white/35 text-white hover:bg-white/25 px-7 py-3.5 rounded-full font-semibold transition-all backdrop-blur-md text-sm md:text-base"
                    style={{ textShadow: "0 1px 8px rgba(0,0,0,0.6)" }}
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
