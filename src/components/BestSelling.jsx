import React, { useEffect, useState } from 'react';
import ProductCard from './ProductCard';
import SectionHeader from './SectionHeader';
import { config } from '@/config';
import { Skeleton } from '@/components/ui/skeleton';
import { Flame, AlertTriangle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const BestSelling = ({ limit = 8 }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchBest = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.baseURL}/products/best-selling?limit=${limit}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          const normalized = json.data.map(p => ({
            ...p,
            image: p.image || p.image_path || '',
            discountedPrice: p.discountedPrice ?? p.discounted_price ?? p.price,
            discountPercentage: p.discountPercentage ?? p.discount_percentage ?? null,
            discount: p.discount ?? (p.discountedPrice && p.discountedPrice < p.price
              ? Math.round(((p.price - p.discountedPrice) / p.price) * 100) : 0),
          }));
          if (mounted) setProducts(normalized);
        } else {
          throw new Error('Unexpected API response');
        }
      } catch (err) {
        if (mounted) setError(err.message || 'Failed to load products');
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchBest();
    return () => { mounted = false; };
  }, [limit]);

  return (
    <section className="mt-14">
      <SectionHeader
        icon={Flame}
        eyebrow="Trending now"
        title="Best Selling"
        subtitle="Most loved by our customers"
        viewAllHref="/shop"
      />

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
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
          <p className="text-red-800 font-semibold">Unable to load best sellers</p>
          <p className="text-red-500 text-sm mt-1">{error}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
          <Flame className="h-12 w-12 text-gray-300 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">No Products Available</p>
          <p className="text-gray-400 text-sm mt-1">Check back soon!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-5">
          {products.map(p => <ProductCard key={p.id} product={p} />)}
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

export default BestSelling;
