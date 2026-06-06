import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  X, ChevronLeft, ChevronRight, ShoppingCart, Heart,
  Star, Minus, Plus, ExternalLink, ShieldCheck, Truck,
  RotateCcw, Tag, Zap, Package, AlertTriangle,
} from "lucide-react";
import { config } from "@/config";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

/* ─── mini gallery ─── */
const MiniGallery = ({ images = [], alt = "" }) => {
  const imgs = images.map(i => (i?.path ? i.path : i)).filter(Boolean);
  const [idx, setIdx] = useState(0);

  useEffect(() => setIdx(0), [images]);

  if (!imgs.length)
    return (
      <div className="w-full aspect-square bg-gray-50 rounded-2xl flex items-center justify-center border border-gray-100">
        <ShoppingCart className="w-12 h-12 text-gray-300" />
      </div>
    );

  return (
    <div className="space-y-2.5">
      <div className="relative aspect-square bg-white rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center p-6 group">
        <img
          src={imgs[idx]}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {imgs.length > 1 && (
          <>
            <button
              onClick={() => setIdx(i => Math.max(0, i - 1))}
              disabled={idx === 0}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/90 border border-gray-100 p-1.5 rounded-full shadow-sm hover:scale-110 transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronLeft className="h-4 w-4 text-gray-700" />
            </button>
            <button
              onClick={() => setIdx(i => Math.min(imgs.length - 1, i + 1))}
              disabled={idx === imgs.length - 1}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/90 border border-gray-100 p-1.5 rounded-full shadow-sm hover:scale-110 transition-all disabled:opacity-0 disabled:pointer-events-none"
            >
              <ChevronRight className="h-4 w-4 text-gray-700" />
            </button>
            <div className="absolute bottom-2.5 right-2.5 bg-black/50 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {idx + 1}/{imgs.length}
            </div>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {imgs.map((src, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className={`flex-shrink-0 w-14 h-14 p-1 rounded-xl border-2 transition-all bg-white overflow-hidden ${
                i === idx
                  ? "border-blue-500 shadow-md shadow-blue-200"
                  : "border-gray-100 hover:border-gray-300"
              }`}
            >
              <img src={src} alt={`${alt} ${i + 1}`} className="w-full h-full object-contain" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── main component ─── */
const QuickViewModal = ({ slug, onClose }) => {
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [isWishlisted, setIsWishlisted] = useState(false);

  const { addToCart } = useCart();
  const { user, addToWishlist, wishlist } = useAuth();

  /* fetch product */
  useEffect(() => {
    if (!slug) return;
    setIsLoading(true);
    setError(null);
    setQty(1);

    const controller = new AbortController();
    const fetchProduct = async () => {
      try {
        const res = await fetch(`${config.baseURL}/products/${slug}`, { signal: controller.signal });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data = json.success ? (json.data ?? json.product ?? json) : null;
        if (!data) throw new Error("Product not found");
        setProduct(data);
      } catch (e) {
        if (e.name !== "AbortError") setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduct();
    return () => controller.abort();
  }, [slug]);

  /* sync wishlist */
  useEffect(() => {
    setIsWishlisted(Array.isArray(wishlist) && product && wishlist.includes(product.id));
  }, [wishlist, product]);

  /* close on Escape */
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  /* lock body scroll */
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleAddToCart = () => {
    if (!product) return;
    setIsAddingToCart(true);
    addToCart(product, qty);
    toast.success("Added to cart", {
      description: `${product.name} ×${qty} added to your cart`,
      duration: 3000,
    });
    setTimeout(() => setIsAddingToCart(false), 600);
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    if (!user) { toast.error("Please login to add to wishlist"); return; }
    if (isWishlisted) { toast.info("Already in wishlist"); return; }
    const result = await addToWishlist(product.id);
    if (result?.success) setIsWishlisted(true);
  };

  /* derived values */
  const price = product ? Number(product.price ?? 0) : 0;
  const discountedPrice = product?.discountedPrice ? Number(product.discountedPrice) : null;
  const discountPct = product?.discountPercentage ?? product?.discount_percentage ?? null;
  const hasDiscount = discountedPrice && discountedPrice < price;
  const finalPrice = hasDiscount ? discountedPrice : price;
  const savings = hasDiscount ? price - discountedPrice : 0;
  const stock = product?.quantity ?? product?.stock ?? null;
  const inStock = stock === null || stock > 0;
  const images = product?.images ?? (product?.image ? [{ path: product.image }] : []);
  const categories = product?.categories ?? [];
  const rating = product?.rating ?? null;
  const reviewCount = product?.reviews_count ?? product?.reviews ?? null;
  const isBundleProduct = product?.is_bundle === 1;

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Modal */}
      <div
        className="relative bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 bg-gray-100 hover:bg-gray-200 text-gray-700 p-2 rounded-full transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Scrollable content */}
        <div className="overflow-y-auto flex-1">
          {isLoading ? (
            <div className="grid md:grid-cols-2 gap-0">
              <div className="p-6">
                <Skeleton className="aspect-square w-full rounded-2xl bg-gray-100" />
                <div className="flex gap-2 mt-3">
                  {[1, 2, 3].map(i => <Skeleton key={i} className="w-14 h-14 rounded-xl bg-gray-100" />)}
                </div>
              </div>
              <div className="p-6 space-y-4">
                <Skeleton className="h-5 w-1/3 bg-gray-100 rounded-full" />
                <Skeleton className="h-7 w-4/5 bg-gray-100" />
                <Skeleton className="h-6 w-2/5 bg-gray-100" />
                <Skeleton className="h-16 w-full bg-gray-100 rounded-xl" />
                <Skeleton className="h-12 w-full bg-gray-100 rounded-xl" />
                <Skeleton className="h-12 w-full bg-gray-100 rounded-xl" />
              </div>
            </div>
          ) : error ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-8 h-8 text-red-400" />
              </div>
              <p className="font-semibold text-gray-900 mb-1">Failed to load product</p>
              <p className="text-sm text-gray-500">{error}</p>
            </div>
          ) : product ? (
            <div className="grid md:grid-cols-2">
              {/* Left: Gallery */}
              <div className="p-5 md:p-6 bg-gray-50/50 border-b md:border-b-0 md:border-r border-gray-100">
                {/* Badges */}
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {hasDiscount && (
                    <span className="inline-flex items-center gap-1 bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <Zap className="w-2.5 h-2.5 fill-white" />
                      {discountPct ? `${Math.round(discountPct)}% OFF` : "SALE"}
                    </span>
                  )}
                  {isBundleProduct && (
                    <span className="inline-flex items-center gap-1 bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                      <Package className="w-2.5 h-2.5" /> BUNDLE
                    </span>
                  )}
                </div>
                <MiniGallery images={images} alt={product.name} />
              </div>

              {/* Right: Details */}
              <div className="p-5 md:p-6 flex flex-col gap-4">

                {/* Category + title */}
                <div>
                  {categories.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-2">
                      {categories.slice(0, 2).map(c => (
                        <span key={c.id} className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-100">
                          <Tag className="w-2.5 h-2.5" />
                          {c.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <h2 className="text-lg sm:text-xl font-black text-gray-900 leading-tight">
                    {product.name}
                  </h2>
                </div>

                {/* Rating */}
                {rating && (
                  <div className="flex items-center gap-2">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} className={`w-3.5 h-3.5 ${i <= Math.round(rating) ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200"}`} />
                      ))}
                    </div>
                    <span className="text-xs font-semibold text-gray-600">{Number(rating).toFixed(1)}</span>
                    {reviewCount && <span className="text-xs text-gray-400">({reviewCount} reviews)</span>}
                  </div>
                )}

                {/* Price */}
                <div className="flex items-baseline gap-3 flex-wrap">
                  <span className="text-2xl font-black text-gray-900">
                    ৳{finalPrice.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <>
                      <span className="text-base text-gray-400 line-through">৳{price.toLocaleString()}</span>
                      <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        Save ৳{savings.toLocaleString()}
                      </span>
                    </>
                  )}
                </div>

                {/* Stock */}
                <div>
                  {inStock ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                      In Stock {stock !== null && stock < 10 && `(${stock} left)`}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-100 px-3 py-1.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                      Out of Stock
                    </span>
                  )}
                </div>

                {/* Short description */}
                {product.short_description && (
                  <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 border-t border-gray-100 pt-3">
                    {product.short_description}
                  </p>
                )}

                {/* Quantity + Add to cart */}
                {inStock && (
                  <div className="flex items-center gap-3">
                    {/* Qty selector */}
                    <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50">
                      <button
                        onClick={() => setQty(q => Math.max(1, q - 1))}
                        className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="w-10 text-center text-sm font-bold text-gray-900 select-none">
                        {qty}
                      </span>
                      <button
                        onClick={() => setQty(q => (stock === null ? q + 1 : Math.min(stock, q + 1)))}
                        className="px-3 py-2.5 text-gray-600 hover:bg-gray-100 transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Add to cart */}
                    <button
                      onClick={handleAddToCart}
                      disabled={isAddingToCart}
                      className="flex-1 bg-gray-900 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm active:scale-[0.97]"
                    >
                      {isAddingToCart ? (
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart className="w-4 h-4" />
                          Add to Cart
                        </>
                      )}
                    </button>

                    {/* Wishlist */}
                    <button
                      onClick={handleWishlist}
                      className={`p-2.5 rounded-xl border transition-all ${
                        isWishlisted
                          ? "bg-red-50 border-red-200 text-red-500"
                          : "bg-white border-gray-200 text-gray-400 hover:border-red-200 hover:text-red-500"
                      }`}
                      aria-label="Wishlist"
                    >
                      <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                    </button>
                  </div>
                )}

                {/* Trust badges */}
                <div className="grid grid-cols-3 gap-2 border-t border-gray-100 pt-3">
                  {[
                    { Icon: Truck, label: "Fast Delivery" },
                    { Icon: ShieldCheck, label: "Genuine Parts" },
                    { Icon: RotateCcw, label: "Easy Returns" },
                  ].map(({ Icon, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1 text-center">
                      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center">
                        <Icon className="w-4 h-4 text-blue-600" />
                      </div>
                      <span className="text-[10px] font-semibold text-gray-500 leading-tight">{label}</span>
                    </div>
                  ))}
                </div>

                {/* Full details link */}
                <Link
                  to={`/product/${product.slug}`}
                  onClick={onClose}
                  className="flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 border border-blue-100 hover:border-blue-300 hover:bg-blue-50 py-2.5 rounded-xl transition-all"
                >
                  <ExternalLink className="w-4 h-4" />
                  View Full Details
                </Link>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default QuickViewModal;
