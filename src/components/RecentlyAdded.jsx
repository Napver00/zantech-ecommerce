import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import SectionHeader from "./SectionHeader";
import { config } from "@/config";
import { Skeleton } from "@/components/ui/skeleton";
import { Link } from "react-router-dom";
import { Sparkles, Zap, AlertTriangle, ArrowRight } from "lucide-react";

const RecentlyAdded = ({ limit = 8 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchNew = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.baseURL}/products/new?limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const normalized = json.data.map((p) => ({
            ...p,
            image: p.image || p.image_path || (Array.isArray(p.image_paths) && p.image_paths[0]) || "",
            discountedPrice: p.discountedPrice ?? p.discounted_price ?? p.price,
            discountPercentage: p.discountPercentage ?? p.discount_percentage ?? null,
            discount: p.discount ?? (p.discountedPrice && p.discountedPrice < p.price
              ? Math.round(((p.price - p.discountedPrice) / p.price) * 100) : 0),
          }));
          if (mounted) setProducts(normalized);
        } else {
          throw new Error("Unexpected API response");
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load products");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchNew();
    return () => { mounted = false; };
  }, [limit]);

  return (
    <section className="mt-14">
      <SectionHeader
        icon={Sparkles}
        eyebrow="Just landed"
        title="Recently Added"
        subtitle="Fresh arrivals — just landed in store"
        viewAllHref="/shop"
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: limit }).map((_, i) => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
              <Skeleton className="aspect-[5/4] bg-gray-100" />
              <div className="p-4 space-y-2.5">
                <Skeleton className="h-4 w-4/5 bg-gray-100" />
                <Skeleton className="h-4 w-3/5 bg-gray-100" />
                <Skeleton className="h-10 w-full rounded-xl bg-gray-100" />
              </div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center">
          <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
          <p className="text-red-800 font-semibold">Unable to Load Products</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Zap className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">No New Products Yet</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon for the latest additions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product, index) => (
            <ProductCard key={product.id} product={product} isNew={index < 3} />
          ))}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="mt-6 text-center sm:hidden">
          <Link to="/shop" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm">
            View All Products <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
};

export default RecentlyAdded;
