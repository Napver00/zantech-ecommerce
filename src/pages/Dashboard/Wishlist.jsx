import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, Heart, Loader2, ShoppingCart, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { config } from '../../config';
import { Skeleton } from '../../components/ui/skeleton';
import { taka } from '../../lib/orders';

const PER_PAGE = 9;

const Wishlist = () => {
  const { token, refreshWishlist } = useAuth();
  const { addToCart } = useCart();
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ total_rows: 0, total_pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [removing, setRemoving] = useState(null);

  const load = (p = page) => {
    setLoading(true);
    setError('');
    return fetch(`${config.baseURL}/wishlist?limit=${PER_PAGE}&page=${p}`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async (r) => {
        const d = await r.json().catch(() => ({}));
        // The API answers 404 when the wishlist is simply empty.
        if (r.status === 404) return { success: true, data: [], pagination: { total_rows: 0, total_pages: 1 } };
        return d;
      })
      .then((d) => {
        if (!d.success) throw new Error(d.message || "Couldn't load your wishlist.");
        setItems(Array.isArray(d.data) ? d.data : []);
        if (d.pagination) setPagination(d.pagination);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (token) load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, page]);

  const remove = async (item) => {
    setRemoving(item.wishlistId);
    try {
      const res = await fetch(`${config.baseURL}/wishlist/${item.wishlistId}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Couldn't remove this item.");
      toast.success('Removed from wishlist');
      refreshWishlist?.();
      // Step back a page if this was the last item on it.
      if (items.length === 1 && page > 1) setPage(page - 1);
      else load(page);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setRemoving(null);
    }
  };

  const moveToCart = (item) => {
    const price = Number(item.price);
    const discount = Number(item.discount || 0);
    addToCart({ id: item.product_id, name: item.name, slug: item.product_slug, image: item.image, price, discountedPrice: discount > 0 ? price - discount : price }, 1);
    toast.success('Added to cart', { description: item.name });
  };

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">Wishlist</h1>
        <p className="mt-1 text-sm text-gray-400">
          {pagination.total_rows ? `${pagination.total_rows} saved ${pagination.total_rows === 1 ? 'item' : 'items'}` : 'Products you save appear here.'}
        </p>
      </div>

      {error && <p className="rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-500" role="alert">{error}</p>}

      {loading && items.length === 0 ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="aspect-[3/4] w-full rounded-2xl" />)}
        </div>
      ) : items.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-card p-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-gray-500"><Heart className="h-8 w-8" /></span>
          <p className="mt-4 text-lg font-bold text-white">Nothing saved yet</p>
          <p className="mt-1 text-gray-400">Tap the heart on any product to keep it for later.</p>
          <Link to="/shop" className="mt-5 inline-flex h-11 items-center rounded-xl bg-zan-cyan px-6 font-bold text-zan-dark hover:opacity-90">Browse products</Link>
        </div>
      ) : (
        <>
          <div className={`grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 ${loading ? 'opacity-60' : ''}`}>
            {items.map((item) => {
              const price = Number(item.price);
              const discount = Number(item.discount || 0);
              return (
                <div key={item.wishlistId} className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-card">
                  <Link to={`/product/${item.product_slug}`} className="product-tile relative block aspect-square overflow-hidden">
                    <img src={item.image} alt={item.name} loading="lazy" className="h-full w-full object-contain p-3 transition-transform duration-300 group-hover:scale-105" />
                    {discount > 0 && (
                      <span className="absolute left-2 top-2 rounded-md bg-red-600 px-1.5 py-0.5 text-[11px] font-bold text-[#fff]">−{Math.round((discount / price) * 100)}%</span>
                    )}
                  </Link>
                  <div className="flex flex-1 flex-col p-3 md:p-4">
                    <Link to={`/product/${item.product_slug}`} className="line-clamp-2 text-sm font-semibold leading-snug text-white hover:text-zan-cyan">{item.name}</Link>
                    <p className="mt-2 flex items-baseline gap-2">
                      <span className="font-black text-white">{taka(price - discount)}</span>
                      {discount > 0 && <span className="text-xs text-gray-500 line-through">{taka(price)}</span>}
                    </p>
                    <div className="mt-auto flex gap-2 pt-3">
                      <button type="button" onClick={() => moveToCart(item)} className="inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg bg-zan-cyan text-xs font-bold text-zan-dark hover:opacity-90 sm:text-sm">
                        <ShoppingCart className="h-4 w-4" /> Add to cart
                      </button>
                      <button
                        type="button"
                        onClick={() => remove(item)}
                        disabled={removing === item.wishlistId}
                        aria-label={`Remove ${item.name} from wishlist`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-gray-400 hover:border-red-500/40 hover:text-red-500 disabled:opacity-50"
                      >
                        {removing === item.wishlistId ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {pagination.total_pages > 1 && (
            <div className="flex items-center justify-between gap-3">
              <button type="button" onClick={() => setPage((p) => p - 1)} disabled={page <= 1} className="inline-flex h-10 items-center gap-1 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white disabled:opacity-40">
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-sm text-gray-400">Page {page} of {pagination.total_pages}</span>
              <button type="button" onClick={() => setPage((p) => p + 1)} disabled={page >= pagination.total_pages} className="inline-flex h-10 items-center gap-1 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white disabled:opacity-40">
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Wishlist;
