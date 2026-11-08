import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ShoppingCart, Heart, Star, ChevronLeft, ChevronRight,
  Package, Minus, Plus, Share2, Check, ShieldCheck, Truck,
  RotateCcw, AlertCircle, Tag, Cpu, ExternalLink, Home,
  ChevronRight as Breadcrumb, MessageSquare, BookOpen,
  Maximize2, X, Zap, Sparkles,
} from "lucide-react";
import { useParams, Link, useNavigate, useSearchParams } from "react-router-dom";
import { config } from "@/config";
import DOMPurify from "dompurify";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { toast } from "sonner";
import RelatedProducts from "@/components/RelatedProducts";
import Seo from "@/components/Seo";

// ─── Gallery ────────────────────────────────────────────────
const Gallery = ({ images = [], alt = "" }) => {
  const imgs = Array.isArray(images) ? images.map(i => i?.path ? i.path : i) : [];
  const [index, setIndex] = useState(imgs.length ? 0 : -1);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  useEffect(() => { setIndex(imgs.length ? 0 : -1); }, [images, imgs.length]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e) => e.key === "Escape" && setLightboxOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen]);

  if (!imgs.length)
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-background rounded-2xl border border-white/10">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-white/10 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 font-medium text-sm">No Image Available</p>
        </div>
      </div>
    );

  const Thumbs = ({ vertical = false }) => (
    <div className={vertical ? "flex flex-col gap-2" : "flex gap-2 overflow-x-auto pb-1"}>
      {imgs.map((src, idx) => (
        <button
          key={idx}
          onClick={() => setIndex(idx)}
          className={`flex-shrink-0 w-14 h-14 p-1.5 rounded-xl overflow-hidden border transition-all ${
            idx === index
              ? "border-zan-cyan bg-[#fff] ring-2 ring-zan-cyan/30"
              : "border-white/10 bg-[#fff] opacity-70 hover:opacity-100"
          }`}
        >
          <img src={src} alt={`${alt}-${idx}`} loading="lazy" decoding="async" className="w-full h-full object-contain" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="flex gap-3">
      {imgs.length > 1 && (
        <div className="hidden sm:block flex-shrink-0">
          <Thumbs vertical />
        </div>
      )}

      <div className="flex-1 min-w-0 space-y-3">
        {/* Main image */}
        <div className="product-tile relative rounded-2xl border border-white/10 overflow-hidden group aspect-square flex items-center justify-center p-8">
          <img
            src={imgs[index]}
            alt={alt}
            loading="eager"
            fetchPriority="high"
            className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
          />

          <button
            onClick={() => setLightboxOpen(true)}
            className="absolute top-3 right-3 bg-card p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:scale-110 transition-all text-gray-300"
            aria-label="Zoom image"
          >
            <Maximize2 className="h-4 w-4" />
          </button>

          {imgs.length > 1 && (
            <>
              <button
                onClick={() => setIndex(i => (i > 0 ? i - 1 : i))}
                disabled={index === 0}
                className="absolute left-3 top-1/2 -translate-y-1/2 bg-card p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:scale-110 transition-all disabled:hidden text-gray-300"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIndex(i => (i < imgs.length - 1 ? i + 1 : i))}
                disabled={index === imgs.length - 1}
                className="absolute right-3 top-1/2 -translate-y-1/2 bg-card p-2 rounded-full shadow-sm opacity-0 group-hover:opacity-100 hover:scale-110 transition-all disabled:hidden text-gray-300"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-black/40 text-[#fff] text-[11px] font-semibold px-2 py-0.5 rounded-full">
                {index + 1}/{imgs.length}
              </div>
            </>
          )}
        </div>

        {/* Mobile thumbnails */}
        {imgs.length > 1 && (
          <div className="sm:hidden">
            <Thumbs />
          </div>
        )}
      </div>

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-6"
          onClick={() => setLightboxOpen(false)}
        >
          <button
            onClick={() => setLightboxOpen(false)}
            className="absolute top-5 right-5 text-[#fff]/80 hover:text-[#fff] p-2 rounded-full hover:bg-[#fff]/10 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
          <img
            src={imgs[index]}
            alt={alt}
            className="max-h-full max-w-full object-contain"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
};

// ─── Star Rating ────────────────────────────────────────────
const StarRating = ({ rating, totalReviews = 0 }) => (
  <div className="flex items-center gap-2">
    <div className="flex items-center gap-0.5">
      {[...Array(5)].map((_, i) => (
        <Star key={i} className={`w-4 h-4 ${i < Math.round(rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
      ))}
    </div>
    <span className="text-sm font-bold text-white">{rating.toFixed(1)}</span>
    <span className="text-sm text-gray-400">({totalReviews})</span>
  </div>
);

// ─── Quantity Selector ───────────────────────────────────────
const QuantitySelector = ({ max = 1, value = 1, onChange }) => (
  <div className="flex items-center border border-white/10 rounded-xl overflow-hidden bg-card">
    <button
      onClick={() => onChange?.(Math.max(1, value - 1))}
      disabled={value <= 1}
      aria-label="One less"
      className="w-10 h-10 flex items-center justify-center hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300 pointer-coarse:w-11 pointer-coarse:h-11"
    >
      <Minus className="w-3.5 h-3.5" />
    </button>
    <span className="w-10 text-center font-bold text-white text-sm">{value}</span>
    <button
      onClick={() => onChange?.(Math.min(value + 1, max))}
      disabled={value >= max}
      aria-label="One more"
      className="w-10 h-10 flex items-center justify-center hover:bg-background disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-300 pointer-coarse:w-11 pointer-coarse:h-11"
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────
const ProductPage = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, wishlist } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");
  // Phones: once the buy panel scrolls away, a bar at the bottom of the screen
  // keeps Add to Cart / Buy Now under the thumb (Fitts's law: near and big).
  const buyPanelRef = useRef(null);
  const [showStickyBuy, setShowStickyBuy] = useState(false);

  useEffect(() => {
    const panel = buyPanelRef.current;
    if (!panel || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => {
      setShowStickyBuy(!entry.isIntersecting && entry.boundingClientRect.top < 0);
    });
    observer.observe(panel);
    return () => observer.disconnect();
  }, [product]);

  // Lift the chat button above the bar while it shows (same hook as checkout).
  useEffect(() => {
    if (!showStickyBuy) return;
    document.body.dataset.bottomBar = "1";
    return () => { delete document.body.dataset.bottomBar; };
  }, [showStickyBuy]);

  const siteUrl = "https://store.zantechbd.com";
  const productUrl = `${siteUrl}/product/${slug}`;

  useEffect(() => {
    if (product && Array.isArray(wishlist)) setIsWishlisted(wishlist.includes(product.id));
  }, [product, wishlist]);

  useEffect(() => {
    let mounted = true;
    const fetchProduct = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.baseURL}/products/slug/${slug}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && json.data) {
          const p = json.data;
          if (mounted) setProduct({
            ...p,
            is_bundle: Number(p.is_bundle) === 1 ? 1 : 0,
            image: p.image || p.image_path || (Array.isArray(p.images) && p.images[0]?.path) || "",
            description: p.description || "",
            discountedPrice: p.discountedPrice ?? p.discounted_price ?? p.price,
            discountPercentage: p.discountPercentage ?? p.discount_percentage ?? null,
            meta_title: p.meta_title || p.name,
            meta_keywords: p.meta_keywords || "",
            meta_description: p.meta_description || p.short_description || "",
          });
        } else {
          throw new Error("Product not found");
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load product");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    setChosenVariant(null);
    if (slug) fetchProduct();
    return () => { mounted = false; };
  }, [slug]);

  // ── Variants (e.g. 1 pin / 2 pin / 3 pin): the choice is kept in the address (?v=12) ──
  const [searchParams, setSearchParams] = useSearchParams();
  const variants = useMemo(() => product?.variants || [], [product]);
  // Kept in state too, so the choice counts at once (the address updates a moment later).
  const [chosenVariant, setChosenVariant] = useState(null);
  const askedVariant = chosenVariant ?? (Number(searchParams.get("v")) || null);
  const variant =
    variants.find((v) => v.id === askedVariant) ||
    variants.find((v) => v.quantity > 0) ||
    variants[0] ||
    null;
  // Show each option's price on its button only when they differ.
  const pricesDiffer = new Set(variants.map((v) => v.discountedPrice ?? v.price)).size > 1;
  const chooseVariant = (v) => {
    setChosenVariant(v.id);
    setSearchParams((prev) => { const n = new URLSearchParams(prev); n.set("v", v.id); return n; }, { replace: true });
    setQuantity(1);
  };

  // What the customer is looking at: the product, or the chosen variant's price and stock.
  const view = useMemo(() => {
    if (!product || !variant) return product;
    return {
      ...product,
      price: variant.price,
      discountedPrice: variant.discountedPrice ?? variant.price,
      discountPercentage: variant.discountPercentage,
      quantity: variant.quantity,
    };
  }, [product, variant]);

  // The chosen variant's photo shows first.
  const galleryImages = useMemo(() => {
    const imgs = product?.images?.length ? product.images : product?.image ? [product.image] : [];
    if (!variant?.image_id) return imgs;
    const hit = imgs.find((i) => i?.id === variant.image_id);
    return hit ? [hit, ...imgs.filter((i) => i !== hit)] : variant.image_url ? [variant.image_url, ...imgs] : imgs;
  }, [product, variant]);

  // The cart line: a product, or one variant of it.
  const cartLine = () =>
    variant
      ? {
          ...view,
          cartKey: `${product.id}:${variant.id}`,
          product_id: product.id,
          variant_id: variant.id,
          variant_name: variant.name,
          variant_label: product.variant_label || null,
          image: variant.image_url || product.image,
        }
      : product;

  const handleAddToCart = () => {
    if (product) {
      addToCart(cartLine(), quantity);
      toast.success("Added to cart", { description: `${quantity} × ${product.name}${variant ? ` (${variant.name})` : ""}` });
    }
  };

  const handleBuyNow = () => {
    if (!product) return;
    addToCart(cartLine(), quantity);
    navigate("/checkout");
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (isWishlisted) { toast.info("Already in wishlist"); return; }
    const result = await addToWishlist(product.id);
    if (result.success) setIsWishlisted(true);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try { await navigator.share({ title: product?.name, url: window.location.href }); } catch {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const seoImage = product?.image?.startsWith("http") ? product.image : product?.image ? `${siteUrl}${product.image}` : "";
  const SeoComponent = (
    <Seo
      title={product?.meta_title || (product ? `${product.name} | ZAN Tech Store` : undefined)}
      description={product?.meta_description || product?.short_description}
      keywords={product?.meta_keywords}
      image={seoImage}
      url={productUrl}
      type="product"
      product={view ? { price: view.discountedPrice, currency: "BDT", availability: view.quantity > 0 ? "in stock" : "out of stock", brand: view.brand || "ZAN Tech" } : undefined}
    />
  );

  // ── Loading skeleton ──
  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-card">
        {SeoComponent}
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl bg-white/5" />
            <div className="space-y-4">
              {[3, 2, 4, 2, 12].map((w, i) => (
                <Skeleton key={i} className={`h-${w === 12 ? 32 : w === 4 ? 10 : w === 3 ? 6 : 5} w-${w === 12 ? 'full' : w === 4 ? 'full' : w === 3 ? '3/4' : '1/2'} bg-white/5 rounded-xl`} />
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );

  // ── Error state ──
  if (error || !product)
    return (
      <div className="flex flex-col min-h-screen bg-card">
        {SeoComponent}
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Product Not Found</h2>
            <p className="text-gray-400 mb-7 text-sm">{error || "The product you're looking for doesn't exist."}</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-zan-cyan text-zan-dark font-bold rounded-xl hover:bg-white transition-colors">
              <ShoppingCart className="w-4 h-4" /> Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );

  const hasDiscount = view.discountedPrice < view.price;
  const savings = hasDiscount ? view.price - view.discountedPrice : 0;
  const isBundleProduct = product.is_bundle === 1 && product.bundle_items?.length > 0;

  const bundleIndividualTotal = isBundleProduct
    ? product.bundle_items.reduce(
        (sum, item) => sum + (item.discountedPrice ?? item.price ?? 0) * (item.bundle_quantity || 1),
        0
      )
    : 0;
  const bundleSavings = bundleIndividualTotal - view.discountedPrice;
  const bundleSavingsPercent = bundleIndividualTotal > 0 ? Math.round((bundleSavings / bundleIndividualTotal) * 100) : 0;

  const trustItems = [
    { icon: <Truck className="w-4 h-4" />, label: "Fast delivery — Dhaka next day" },
    { icon: <ShieldCheck className="w-4 h-4" />, label: "100% genuine" },
    { icon: <RotateCcw className="w-4 h-4" />, label: "3-day easy returns" },
    { icon: <Check className="w-4 h-4" />, label: "Official warranty" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-card font-sans">
      {SeoComponent}
      <Header />

      <main className="flex-grow py-6 md:py-10">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6 overflow-x-auto whitespace-nowrap">
            <Link to="/" className="hover:text-gray-200 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <Breadcrumb className="w-3 h-3 flex-shrink-0" />
            <Link to="/shop" className="hover:text-gray-200 transition-colors">Shop</Link>
            {product.categories?.[0] && (
              <>
                <Breadcrumb className="w-3 h-3 flex-shrink-0" />
                <Link to={`/shop?category_slug=${product.categories[0].slug}`} className="hover:text-gray-200 transition-colors">
                  {product.categories[0].name}
                </Link>
              </>
            )}
            <Breadcrumb className="w-3 h-3 flex-shrink-0" />
            <span className="text-gray-300 font-medium truncate max-w-[160px] md:max-w-xs">{product.name}</span>
          </nav>

          {/* ── Top Section: Gallery + Info ── */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-14">

            {/* Gallery — wider column, no card chrome */}
            <div className="lg:col-span-7">
              <Gallery images={galleryImages} alt={variant ? `${product.name}, ${variant.name}` : product.name} />
              {product.brand && (
                <div className="mt-3 flex items-center gap-1.5 text-xs text-gray-400">
                  <Cpu className="w-3.5 h-3.5" />
                  Brand <span className="font-semibold text-gray-300">{product.brand}</span>
                </div>
              )}
            </div>

            {/* Info column — sticky on desktop, minimal chrome */}
            <div className="lg:col-span-5 lg:sticky lg:top-24 lg:self-start">

              {product.categories?.[0] && (
                <Link
                  to={`/shop?category_slug=${product.categories[0].slug}`}
                  className="text-[11px] font-bold uppercase tracking-[0.15em] text-zan-cyan hover:text-zan-cyan"
                >
                  {product.categories[0].name}
                </Link>
              )}

              <h1 className="text-2xl md:text-3xl font-black text-white leading-snug mt-2">
                {product.name}
              </h1>

              <div className="flex items-center gap-3 flex-wrap mt-2.5">
                {product.average_rating > 0 && (
                  <StarRating rating={product.average_rating} totalReviews={product.ratings?.length} />
                )}
                {view.quantity > 0 ? (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    In stock — {view.quantity} available
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-red-500">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Out of stock
                  </span>
                )}
              </div>

              {/* Price — plain, no card */}
              <div className="mt-5">
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-4xl font-black text-white">
                    ৳{view.discountedPrice?.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base text-gray-400 line-through font-medium">
                        ৳{view.price?.toLocaleString()}
                      </span>
                      <span className="text-xs font-black text-[#fff] bg-red-500 px-2 py-0.5 rounded-full">
                        -{view.discountPercentage}%
                      </span>
                    </div>
                  )}
                </div>
                {hasDiscount && savings > 0 && (
                  <p className="text-sm text-emerald-400 font-semibold flex items-center gap-1.5 mt-1.5">
                    <Tag className="w-3.5 h-3.5" />
                    You save ৳{savings.toLocaleString()}
                  </p>
                )}
              </div>

              {variants.length > 0 && (
                <fieldset className="mt-5">
                  <legend className="text-sm font-semibold text-gray-200 mb-2">
                    {product.variant_label || "Option"}: <span className="text-white">{variant?.name}</span>
                  </legend>
                  <div className="flex flex-wrap gap-2" role="radiogroup" aria-label={product.variant_label || "Option"}>
                    {variants.map((v) => {
                      const on = v.id === variant?.id;
                      const out = v.quantity <= 0;
                      return (
                        <button
                          key={v.id}
                          type="button"
                          role="radio"
                          aria-checked={on}
                          onClick={() => chooseVariant(v)}
                          className={`relative min-h-[44px] rounded-xl border px-3.5 py-2 text-sm font-semibold transition-colors ${
                            on ? "border-zan-cyan bg-zan-cyan/10 text-white" : "border-white/15 text-gray-300 hover:border-white/30"
                          } ${out ? "opacity-60" : ""}`}
                        >
                          <span className={out ? "line-through decoration-1" : ""}>{v.name}</span>
                          {pricesDiffer && (
                            <span className="ml-1.5 text-xs font-medium text-gray-400">৳{(v.discountedPrice ?? v.price).toLocaleString()}</span>
                          )}
                          {out && <span className="sr-only"> (out of stock)</span>}
                        </button>
                      );
                    })}
                  </div>
                  {variant?.sku && <p className="mt-2 text-xs text-gray-500">SKU: {variant.sku}</p>}
                </fieldset>
              )}

              {product.short_description && (
                <p className="text-gray-400 text-sm leading-relaxed mt-4">
                  {product.short_description}
                </p>
              )}

              {/* Bundle value callout — driven by real bundle_items pricing */}
              {isBundleProduct && bundleSavings > 0 && (
                <div className="mt-4 flex items-start gap-2.5 bg-emerald-500/10 rounded-xl px-3.5 py-3">
                  <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-emerald-400 leading-snug">
                    <span className="font-bold">Save ৳{bundleSavings.toLocaleString()} ({bundleSavingsPercent}%)</span> buying
                    these {product.bundle_items.length} parts as a kit — ৳{bundleIndividualTotal.toLocaleString()} bought separately
                  </p>
                </div>
              )}

              {/* Buy panel — the one grouped, boxed element on the page */}
              <div ref={buyPanelRef} className="mt-5 bg-background rounded-2xl p-4">
                <div className="flex items-center justify-between mb-3.5">
                  <span className="text-sm font-semibold text-gray-200">Quantity</span>
                  <QuantitySelector max={view.quantity} value={quantity} onChange={setQuantity} />
                </div>
                <div className="flex gap-2.5">
                  <button
                    onClick={handleAddToCart}
                    disabled={view.quantity <= 0}
                    className="flex-1 border border-white/15 bg-surface-2 hover:bg-surface-3 disabled:bg-white/10 disabled:cursor-not-allowed text-white font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                  >
                    <ShoppingCart className="w-4 h-4" />
                    {view.quantity <= 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleBuyNow}
                    disabled={view.quantity <= 0}
                    className="flex-1 bg-zan-cyan hover:bg-cyan-300 disabled:bg-white/10 disabled:cursor-not-allowed text-zan-dark font-bold py-3 px-5 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm"
                  >
                    <Zap className="w-4 h-4 fill-current" />
                    Buy Now
                  </button>
                </div>

                <div className="flex items-center gap-4 mt-3.5">
                  <button
                    onClick={handleWishlistToggle}
                    className={`flex items-center gap-1.5 text-xs font-semibold transition-colors ${isWishlisted ? "text-red-400" : "text-gray-400 hover:text-red-400"}`}
                  >
                    <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
                    {isWishlisted ? "In Wishlist" : "Wishlist"}
                  </button>
                  <span className="w-px h-3.5 bg-white/15" />
                  <button onClick={handleShare} className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-zan-cyan transition-colors">
                    <Share2 className="w-4 h-4" /> Share
                  </button>
                </div>
              </div>

              {/* Trust strip — inline, no boxes */}
              <div className="flex flex-wrap gap-x-5 gap-y-2 mt-4">
                {trustItems.map((t) => (
                  <div key={t.label} className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span className="text-gray-400">{t.icon}</span>
                    {t.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── What's in the Box (bundle products only) — light, consistent chrome ── */}
          {isBundleProduct && (
            <div className="mb-14">
              <div className="flex items-center gap-2.5 mb-5">
                <Package className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-black text-white">What's in the Box</h2>
                <span className="text-sm text-gray-400">
                  {product.bundle_items.length} item{product.bundle_items.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                {product.bundle_items.map((item) => (
                  <Link
                    key={item.item_id}
                    to={`/product/${item.slug}`}
                    className="group bg-background hover:bg-white/5 rounded-2xl p-3 md:p-4 transition-colors"
                  >
                    <div className="product-tile relative aspect-square rounded-xl mb-3 overflow-hidden p-2 md:p-3 border border-white/10">
                      <img src={item.image} alt={item.name} loading="lazy" decoding="async" className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                      <div className="absolute top-1 right-1 bg-surface-2 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
                        ×{item.bundle_quantity}
                      </div>
                    </div>
                    <h3 className="font-semibold text-white text-xs leading-snug line-clamp-2 group-hover:text-zan-cyan transition-colors mb-1.5">
                      {item.name}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-400 text-[10px] group-hover:text-zan-cyan transition-colors">
                      <ExternalLink className="w-3 h-3" />
                      <span>View details</span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* ── Tabs: Description & Reviews — minimal underline style ── */}
          <div className="mb-14">
            <div className="flex items-center gap-8 border-b border-white/10 mb-6">
              <button
                onClick={() => setActiveTab("description")}
                className={`flex items-center gap-2 pb-3.5 text-sm font-bold transition-colors relative ${
                  activeTab === "description" ? "text-white" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Description
                {activeTab === "description" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zan-cyan" />}
              </button>
              {isBundleProduct && (
                <button
                  onClick={() => setActiveTab("kit")}
                  className={`flex items-center gap-2 pb-3.5 text-sm font-bold transition-colors relative ${
                    activeTab === "kit" ? "text-white" : "text-gray-400 hover:text-gray-300"
                  }`}
                >
                  <Package className="w-4 h-4" />
                  Kit Includes
                  <span className="text-[10px] font-black bg-white/5 text-gray-300 px-1.5 py-0.5 rounded-full">
                    {product.bundle_items.length}
                  </span>
                  {activeTab === "kit" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zan-cyan" />}
                </button>
              )}
              <button
                onClick={() => setActiveTab("reviews")}
                className={`flex items-center gap-2 pb-3.5 text-sm font-bold transition-colors relative ${
                  activeTab === "reviews" ? "text-white" : "text-gray-400 hover:text-gray-300"
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Reviews
                {product.ratings?.length > 0 && (
                  <span className="text-[10px] font-black bg-white/5 text-gray-300 px-1.5 py-0.5 rounded-full">
                    {product.ratings.length}
                  </span>
                )}
                {activeTab === "reviews" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-zan-cyan" />}
              </button>
            </div>

            {activeTab === "description" && (
              /* Same theme-aware reading styles as tutorials (see .article-body in index.css) */
              <div
                className="article-body max-w-3xl text-[15px] md:text-base"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || "") }}
              />
            )}

            {activeTab === "kit" && isBundleProduct && (
              <div>
                {bundleSavings > 0 && (
                  <div className="flex items-start gap-2.5 bg-emerald-500/10 rounded-xl px-3.5 py-3 mb-5">
                    <Sparkles className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-emerald-400 leading-snug">
                      <span className="font-bold">Save ৳{bundleSavings.toLocaleString()} ({bundleSavingsPercent}%)</span> buying
                      these {product.bundle_items.length} parts as a kit — ৳{bundleIndividualTotal.toLocaleString()} bought separately
                    </p>
                  </div>
                )}
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2.5">
                  {product.bundle_items.map((item) => (
                    <li key={item.item_id} className="flex items-center gap-2.5 text-sm text-gray-300">
                      <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" strokeWidth={2.5} />
                      <span className="flex-1 leading-snug">
                        {item.name}
                        {item.bundle_quantity > 1 && (
                          <span className="text-gray-400"> × {item.bundle_quantity}</span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === "reviews" && (
              <div>
                {product.ratings?.length > 0 ? (
                  <>
                    <div className="flex items-center gap-5 mb-6 p-4 bg-background rounded-2xl">
                      <div className="text-center flex-shrink-0">
                        <div className="text-5xl font-black text-white leading-none">{product.average_rating?.toFixed(1)}</div>
                        <div className="flex justify-center gap-0.5 my-1.5">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className={`w-4 h-4 ${i < Math.round(product.average_rating) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                          ))}
                        </div>
                        <p className="text-xs text-gray-400">{product.ratings.length} reviews</p>
                      </div>
                      <div className="flex-1 space-y-1.5">
                        {[5, 4, 3, 2, 1].map(star => {
                          const count = product.ratings.filter(r => parseInt(r.star) === star).length;
                          const pct = Math.round((count / product.ratings.length) * 100);
                          return (
                            <div key={star} className="flex items-center gap-2">
                              <span className="text-xs text-gray-400 w-4 text-right">{star}</span>
                              <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                              <div className="flex-1 bg-white/10 rounded-full h-1.5 overflow-hidden">
                                <div className="bg-amber-400 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-gray-400 w-7">{pct}%</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {product.ratings.map((review) => (
                        <div key={review.id} className="bg-background p-4 rounded-2xl">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-10 h-10 bg-surface-2 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                              {review.user.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-white text-sm">{review.user}</p>
                              <div className="flex gap-0.5 mt-0.5">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-3 h-3 ${i < parseInt(review.star) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">"{review.rating}"</p>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-center py-10">
                    <div className="w-14 h-14 bg-white/5 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Star className="w-7 h-7 text-gray-300" />
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">No Reviews Yet</h3>
                    <p className="text-gray-400 text-sm">Be the first to review this product!</p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── Related Products ── */}
          <div className="border-t border-white/10 pt-10">
            <h2 className="text-xl font-black text-white mb-6">You Might Also Like</h2>
            <RelatedProducts categorySlug={product.categories?.[0]?.slug} currentProductId={product.id} />
          </div>
        </div>
      </main>

      {/* Phone: price and buy buttons stay in thumb reach after the buy panel scrolls away */}
      {view.quantity > 0 && (
        <div
          aria-hidden={!showStickyBuy}
          className={`fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-card/95 px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgba(0,0,0,0.15)] backdrop-blur transition-transform duration-200 lg:hidden ${showStickyBuy ? "translate-y-0" : "pointer-events-none translate-y-full"}`}
        >
          <div className="flex items-center gap-2.5">
            <div className="min-w-0 mr-auto">
              <p className="truncate text-xs text-gray-400">{quantity > 1 ? `${quantity} ×` : "Price"}</p>
              <p className="text-lg font-black leading-tight text-white">৳{view.discountedPrice?.toLocaleString()}</p>
            </div>
            <button
              onClick={handleAddToCart}
              tabIndex={showStickyBuy ? 0 : -1}
              aria-label="Add to cart"
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-white/15 bg-surface-2 text-white active:scale-[0.98]"
            >
              <ShoppingCart className="h-5 w-5" />
            </button>
            <button
              onClick={handleBuyNow}
              tabIndex={showStickyBuy ? 0 : -1}
              className="flex h-12 flex-1 max-w-[12rem] items-center justify-center gap-2 rounded-xl bg-zan-cyan font-bold text-zan-dark active:scale-[0.98]"
            >
              <Zap className="h-4 w-4 fill-current" /> Buy Now
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default ProductPage;
