import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wrench, ShieldCheck, BookOpen, ChevronLeft, ChevronRight } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";
import { fetchProducts } from "@/lib/products";

const POINTS = [
  { icon: Wrench, text: "Engineered in-house" },
  { icon: ShieldCheck, text: "Every kit quality checked" },
  { icon: BookOpen, text: "Guides & tutorials included" },
];

const navBtn =
  "kits-nav absolute top-[38%] z-10 hidden h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/15 bg-zan-dark/80 text-white shadow-lg backdrop-blur transition-colors hover:border-zan-cyan hover:text-zan-cyan disabled:pointer-events-none disabled:opacity-0 md:flex";

// ZAN Tech Kits showcase: brand panel on the left, a slider of every kit on the right.
const CompletePackage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchProducts("/products/category/starter-kit")
      .then((data) => mounted && setProducts(data))
      .catch((e) => mounted && setError(e.message || "Failed to load products"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  // Nothing to showcase — keep the home page clean instead of showing an empty box.
  if (!loading && (error || products.length === 0)) return null;

  return (
    <section className="mt-16 grid gap-4 lg:grid-cols-4">
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-zan-cyan/20 bg-surface-dark p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-zan-cyan/15 blur-[80px]" />
        <div className="relative">
          <span className="mb-4 inline-block rounded bg-zan-red px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-[#fff]">
            Made by ZAN Tech
          </span>
          <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl">
            ZAN<span className="text-zan-red">TECH</span> Kits
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Complete robotics kits designed and packaged by our own engineers — everything you need to build, in one box.
          </p>
          <ul className="mt-6 hidden space-y-3 2xl:block">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-gray-200">
                <Icon className="h-4 w-4 flex-shrink-0 text-zan-cyan" /> {text}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/zantech-kits"
          className="group relative mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-zan-cyan px-5 py-3 text-sm font-bold text-zan-dark transition-colors hover:bg-white lg:mt-8"
        >
          View all {products.length > 0 ? `${products.length} ` : ""}kits
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="relative min-w-0 lg:col-span-3">
        {loading ? (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className={`overflow-hidden rounded-xl border border-white/10 bg-surface-dark ${i === 2 ? "hidden md:block" : ""}`}>
                <Skeleton className="aspect-square w-full rounded-none bg-white/5" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-9 w-full bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            <Swiper
              className="kits-swiper"
              modules={[Navigation, Autoplay, Pagination]}
              spaceBetween={16}
              slidesPerView={1.6}
              breakpoints={{ 480: { slidesPerView: 2 }, 768: { slidesPerView: 3 } }}
              navigation={{ prevEl: ".kits-prev", nextEl: ".kits-next" }}
              pagination={{ clickable: true }}
              autoplay={{ delay: 4000, disableOnInteraction: false, pauseOnMouseEnter: true }}
              rewind
              grabCursor
            >
              {products.map((product) => (
                <SwiperSlide key={product.id}>
                  <ProductCard product={product} />
                </SwiperSlide>
              ))}
            </Swiper>
            <button aria-label="Previous kits" className={`kits-prev ${navBtn} -left-4`}>
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button aria-label="Next kits" className={`kits-next ${navBtn} -right-4`}>
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
    </section>
  );
};

export default CompletePackage;
