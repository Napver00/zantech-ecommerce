import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { config } from "@/config";
import { Compass, ChevronLeft, ChevronRight } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const RelatedProducts = ({ categorySlug, currentProductId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [itemsPerPage, setItemsPerPage] = useState(4);

  // 🔹 Handle responsive items per page
  useEffect(() => {
    const updateItemsPerPage = () => {
      if (typeof window === "undefined") return;

      const width = window.innerWidth;

      if (width < 640) {
        // < sm
        setItemsPerPage(1);
      } else if (width < 768) {
        // sm
        setItemsPerPage(2);
      } else if (width < 1024) {
        // md
        setItemsPerPage(3);
      } else {
        // lg and up
        setItemsPerPage(4);
      }
    };

    updateItemsPerPage();
    window.addEventListener("resize", updateItemsPerPage);

    return () => window.removeEventListener("resize", updateItemsPerPage);
  }, []);

  // 🔹 Fetch related products
  useEffect(() => {
    if (!categorySlug) {
      setLoading(false);
      return;
    }

    const fetchRelatedProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${config.baseURL}/products/category/${categorySlug}`
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();

        if (json.success && Array.isArray(json.data)) {
          const related = json.data
            .filter((p) => p.id !== currentProductId)
            .map((p) => ({
              ...p,
              image:
                p.image ||
                p.image_path ||
                (Array.isArray(p.image_paths) && p.image_paths[0]) ||
                (Array.isArray(p.images) && p.images[0]?.path) ||
                "",
              discountedPrice: p.discountedPrice ?? p.discounted_price ?? p.price,
              discountPercentage:
                p.discountPercentage ?? p.discount_percentage ?? null,
            }));
          setProducts(related);
          setCurrentIndex(0); // reset slider when data changes
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Failed to load related products:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [categorySlug, currentProductId]);

  const maxIndex = Math.max(0, products.length - itemsPerPage);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex <= 0 ? maxIndex : prevIndex - 1
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex >= maxIndex ? 0 : prevIndex + 1
    );
  };

  if (loading) {
    return (
      <div className="bg-card rounded-2xl p-8 border border-white/10">
        <div className="flex items-center gap-3 mb-6">
          <Compass className="h-6 w-6 text-zan-cyan" />
          <h2 className="text-2xl font-bold text-white">Related Products</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-64 w-full rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error || products.length === 0) return null;

  const canScroll = products.length > itemsPerPage;

  return (
    <div className="bg-card rounded-2xl p-8 border border-white/10">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-3">
          <Compass className="h-6 w-6 text-zan-cyan" />
          <h2 className="text-2xl font-bold text-white">Related Products</h2>
        </div>
        {canScroll && (
          <div className="flex gap-2">
            <button
              onClick={handlePrev}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={handleNext}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${
              (currentIndex * 100) / itemsPerPage
            }%)`,
          }}
        >
          {products.map((p) => (
            <div
              key={p.id}
              className="flex-shrink-0 px-2 sm:px-3"
              style={{ width: `${100 / itemsPerPage}%` }}
            >
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default RelatedProducts;
