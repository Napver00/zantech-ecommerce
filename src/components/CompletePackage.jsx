import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { config } from '@/config';
import { Skeleton } from '@/components/ui/skeleton';
import { Rocket, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const CompletePackage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.baseURL}/products/category/starter-kit`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          if (mounted) setProducts(json.data);
        } else {
          throw new Error('Unexpected API response');
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => { mounted = false; };
  }, []);

  return (
    <section className="mt-12">
      {/* Section Header */}
      <div className="flex items-center justify-between mb-7">
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-xl shadow-emerald-500/30">
              <Rocket className="w-7 h-7 text-white" />
            </div>
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-emerald-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white">
              ✦
            </span>
          </div>
          <div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-900 leading-tight">Starter Kits</h2>
            <p className="text-gray-500 text-sm mt-0.5">Complete packages to kickstart your projects</p>
          </div>
        </div>
        {!loading && !error && products.length > 0 && (
          <Link
            to="/shop?category_slug=starter-kit"
            className="hidden sm:flex items-center gap-1.5 text-sm text-blue-600 hover:text-blue-700 font-semibold bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
          >
            View All
            <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 4 }).map((_, i) => (
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
          <p className="text-red-800 font-semibold">Unable to Load Starter Kits</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Rocket className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">No Starter Kits Available</p>
          <p className="text-gray-400 text-sm mt-1">We're working on adding new starter kits. Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {!loading && !error && products.length > 0 && (
        <div className="mt-6 text-center sm:hidden">
          <Link to="/shop?category_slug=starter-kit" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm">
            View All Starter Kits <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      )}
    </section>
  );
};

export default CompletePackage;
