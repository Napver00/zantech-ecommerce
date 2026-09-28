import React, { useEffect, useState } from "react";
import ProductCard from "./ProductCard";
import { config } from '@/config';
import { Skeleton } from '@/components/ui/skeleton';
import { Sparkles, PackageSearch, AlertTriangle, ArrowRight, Wrench, ShieldCheck } from 'lucide-react';
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
    <section className="mt-14">
      <div className="relative overflow-hidden rounded-3xl bg-gray-900 shadow-sm">
        {/* Ambient brand glow, matching the dedicated ZAN Tech Kits page */}
        <div className="absolute inset-0 opacity-25 bg-[radial-gradient(circle_at_15%_20%,#3b82f6,transparent_45%),radial-gradient(circle_at_85%_75%,#8b5cf6,transparent_45%)]" />

        {/* Header */}
        <div className="relative z-10 px-5 md:px-10 pt-8 md:pt-10 pb-7">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">
            <div className="min-w-0">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.15em] text-blue-300 bg-white/10 border border-white/15 px-3 py-1.5 rounded-full mb-3.5">
                <Sparkles className="w-3.5 h-3.5" />
                Designed by ZAN Tech
              </span>
              <h2 className="text-2xl md:text-[32px] font-black text-white tracking-tight leading-tight">
                ZAN Tech Kits
              </h2>
              <p className="text-sm md:text-[15px] text-gray-400 mt-2 max-w-md leading-relaxed">
                Engineered and packaged in-house by our own team — complete kits to kickstart your next build.
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                  <Wrench className="w-3.5 h-3.5 text-blue-400" />
                  In-house engineered
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-300">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-400" />
                  Quality checked
                </span>
              </div>
            </div>
            <Link
              to="/zantech-kits"
              className="hidden sm:inline-flex items-center gap-1.5 bg-white text-gray-900 hover:bg-gray-100 px-5 py-2.5 rounded-xl font-bold text-sm transition-colors flex-shrink-0 group"
            >
              View all kits
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </div>
        </div>

        {/* Product showcase panel */}
        <div className="relative z-10 bg-gray-50 rounded-t-[28px] px-4 md:px-8 py-7 md:py-8">
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
              <p className="text-red-800 font-semibold">Unable to load ZAN Tech kits</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <PackageSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-semibold">Our next kit is in the workshop</p>
              <p className="text-gray-400 text-sm mt-1">We're designing new kits — check back soon!</p>
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
              <Link to="/zantech-kits" className="inline-flex items-center gap-2 bg-gray-900 text-white px-6 py-3 rounded-xl font-semibold text-sm">
                View All ZAN Tech Kits <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default CompletePackage;
