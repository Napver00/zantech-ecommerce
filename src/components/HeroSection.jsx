import React, { useState, useEffect, useRef } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronLeft, ChevronRight, ArrowRight, Package, Trophy, Wrench } from "lucide-react";
import { Link } from "react-router-dom";
import { config } from "@/config";

// Promo tiles beside the banner (DFRobot-style hero column)
const PROMOS = [
  {
    to: "/zantech-kits",
    eyebrow: "Designed in-house",
    title: "ZAN Tech Kits",
    text: "Complete kits engineered by our team.",
    icon: Package,
    glow: "from-zan-cyan/25",
  },
  {
    to: "/shop?category_slug=competition-robotics-kits",
    eyebrow: "Pro series",
    title: "Competition Robotics",
    text: "Line followers, soccer bots & more.",
    icon: Trophy,
    glow: "from-zan-red/25",
  },
];

const PromoTile = ({ to, eyebrow, title, text, icon: Icon, glow }) => (
  <Link
    to={to}
    className="group relative flex flex-1 flex-col justify-between overflow-hidden rounded-xl border border-white/10 bg-surface-dark p-4 transition-colors hover:border-zan-cyan/40 sm:p-5"
  >
    <div className={`pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-gradient-to-br ${glow} to-transparent blur-2xl`} />
    <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40" />
    <div className="relative flex items-start justify-between gap-3">
      <div>
        <p className="font-mono text-[10px] uppercase tracking-[0.15em] text-zan-cyan sm:tracking-[0.2em]">{eyebrow}</p>
        <h3 className="mt-1.5 text-base font-bold leading-tight text-white sm:text-lg">{title}</h3>
        <p className="mt-1 hidden text-sm text-gray-400 sm:block">{text}</p>
      </div>
      <span className="hidden h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zan-cyan sm:flex">
        <Icon className="h-5 w-5" />
      </span>
    </div>
    <span className="relative mt-3 inline-flex items-center gap-1.5 text-sm sm:mt-4 font-bold text-zan-cyan">
      Shop now <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
    </span>
  </Link>
);

const FallbackBanner = () => (
  <div className="relative flex h-full flex-col justify-center overflow-hidden px-8 md:px-14">
    <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
    <div className="pointer-events-none absolute -left-20 top-1/2 h-80 w-80 -translate-y-1/2 rounded-full bg-zan-cyan/10 blur-[100px]" />
    <div className="relative max-w-xl">
      <span className="mb-4 inline-flex items-center gap-1.5 rounded bg-zan-red px-2.5 py-1 font-mono text-[11px] font-bold uppercase tracking-widest text-white">
        <Wrench className="h-3 w-3" /> ZAN Tech Store
      </span>
      <h1 className="text-4xl font-bold leading-tight text-white md:text-5xl">
        Build your next robot <span className="text-zan-cyan">today.</span>
      </h1>
      <p className="mt-4 text-base text-gray-400 md:text-lg">
        Arduino, ESP32, sensors, motors and complete DIY kits — delivered across Bangladesh.
      </p>
      <div className="mt-8 flex flex-wrap gap-3">
        <Link to="/shop" className="inline-flex items-center gap-2 rounded-lg bg-zan-cyan px-6 py-3 font-bold text-zan-dark transition-colors hover:bg-white">
          Shop now <ArrowRight className="h-4 w-4" />
        </Link>
        <Link to="/zantech-kits" className="rounded-lg border border-white/20 px-6 py-3 font-semibold text-white transition-colors hover:border-white/50">
          ZAN Tech Kits
        </Link>
      </div>
    </div>
  </div>
);

const HeroSection = () => {
  const [images, setImages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchX = useRef(null);

  useEffect(() => {
    const fetchImages = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.baseURL}/hero-images`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) setImages(result.data);
        else throw new Error("Invalid API response format");
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchImages();
  }, []);

  useEffect(() => {
    if (images.length < 2 || paused) return;
    const timer = setInterval(() => setCurrentIndex((prev) => (prev + 1) % images.length), 5500);
    return () => clearInterval(timer);
  }, [images.length, paused]);

  const go = (dir) => setCurrentIndex((i) => (i + dir + images.length) % images.length);

  return (
    <section className="grid grid-cols-1 gap-4 lg:grid-cols-12">
      {/* Banner carousel — banners already carry their own text, so show them whole */}
      <div
        className="group relative h-[220px] overflow-hidden rounded-xl border border-white/10 bg-surface-dark sm:h-[340px] lg:col-span-8 lg:h-[440px] xl:col-span-9"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
        onTouchEnd={(e) => {
          if (touchX.current == null) return;
          const dx = e.changedTouches[0].clientX - touchX.current;
          if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
          touchX.current = null;
        }}
      >
        {isLoading ? (
          <Skeleton className="h-full w-full rounded-none bg-white/5" />
        ) : error || images.length === 0 ? (
          <FallbackBanner />
        ) : (
          <>
            {images.map((image, index) => (
              <div
                key={image.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentIndex ? "opacity-100" : "pointer-events-none opacity-0"}`}
                aria-hidden={index !== currentIndex}
              >
                {/* Blurred fill so any banner ratio looks intentional */}
                <img src={image.path} alt="" aria-hidden className="absolute inset-0 h-full w-full scale-110 object-cover opacity-40 blur-2xl" />
                <img
                  src={image.path}
                  alt={`Promotion ${index + 1}`}
                  loading={index === 0 ? "eager" : "lazy"}
                  fetchPriority={index === 0 ? "high" : "auto"}
                  decoding="async"
                  className="relative h-full w-full object-contain"
                />
              </div>
            ))}

            {images.length > 1 && (
              <>
                <button aria-label="Previous slide" onClick={() => go(-1)}
                  className="absolute left-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-zan-dark/60 p-2.5 text-white opacity-0 backdrop-blur transition-all hover:border-zan-cyan hover:text-zan-cyan group-hover:opacity-100">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button aria-label="Next slide" onClick={() => go(1)}
                  className="absolute right-3 top-1/2 z-20 -translate-y-1/2 rounded-full border border-white/20 bg-zan-dark/60 p-2.5 text-white opacity-0 backdrop-blur transition-all hover:border-zan-cyan hover:text-zan-cyan group-hover:opacity-100">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <div className="absolute bottom-4 left-1/2 z-20 flex -translate-x-1/2 items-center gap-2 rounded-full bg-zan-dark/60 px-3 py-2 backdrop-blur">
                  {images.map((_, index) => (
                    <button key={index} onClick={() => setCurrentIndex(index)} aria-label={`Go to slide ${index + 1}`}
                      className={`h-1.5 rounded-full transition-all duration-300 ${index === currentIndex ? "w-6 bg-zan-cyan" : "w-1.5 bg-white/40 hover:bg-white/70"}`} />
                  ))}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Promo tiles */}
      <div className="grid grid-cols-2 gap-4 lg:col-span-4 lg:flex lg:flex-col xl:col-span-3">
        {PROMOS.map((p) => <PromoTile key={p.to} {...p} />)}
      </div>
    </section>
  );
};

export default HeroSection;
