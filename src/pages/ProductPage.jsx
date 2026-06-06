import React, { useEffect, useState } from "react";
import {
  ShoppingCart, Heart, Star, ChevronLeft, ChevronRight,
  Package, Minus, Plus, Share2, Check, ShieldCheck, Truck,
  RotateCcw, AlertCircle, Tag, Cpu, ExternalLink, Home,
  ChevronRight as Breadcrumb, MessageSquare, BookOpen,
} from "lucide-react";
import { useParams, Link } from "react-router-dom";
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

  useEffect(() => { setIndex(imgs.length ? 0 : -1); }, [images, imgs.length]);

  if (!imgs.length)
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-3 bg-gray-200 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-500 font-medium text-sm">No Image Available</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-3">
      {/* Main image */}
      <div className="relative bg-white border border-gray-100 rounded-2xl overflow-hidden group aspect-square flex items-center justify-center p-6 shadow-sm">
        <img
          src={imgs[index]}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-105"
        />
        {imgs.length > 1 && (
          <>
            <button
              onClick={() => setIndex(i => (i > 0 ? i - 1 : i))}
              disabled={index === 0}
              className="absolute left-3 top-1/2 -translate-y-1/2 bg-white/95 p-2.5 rounded-full shadow-md hover:scale-110 transition-all disabled:opacity-0 disabled:pointer-events-none text-gray-700 border border-gray-100"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              onClick={() => setIndex(i => (i < imgs.length - 1 ? i + 1 : i))}
              disabled={index === imgs.length - 1}
              className="absolute right-3 top-1/2 -translate-y-1/2 bg-white/95 p-2.5 rounded-full shadow-md hover:scale-110 transition-all disabled:opacity-0 disabled:pointer-events-none text-gray-700 border border-gray-100"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
            <div className="absolute bottom-3 right-3 bg-black/50 text-white text-xs font-semibold px-2.5 py-1 rounded-full">
              {index + 1}/{imgs.length}
            </div>
          </>
        )}
      </div>
      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {imgs.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`flex-shrink-0 w-16 h-16 p-1.5 rounded-xl overflow-hidden border-2 transition-all ${
                idx === index
                  ? "border-blue-500 shadow-md shadow-blue-500/20 bg-white"
                  : "border-gray-100 bg-white hover:border-gray-300"
              }`}
            >
              <img src={src} alt={`${alt}-${idx}`} className="w-full h-full object-contain" />
            </button>
          ))}
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
    <span className="text-sm font-bold text-gray-900">{rating.toFixed(1)}</span>
    <span className="text-sm text-gray-400">({totalReviews} reviews)</span>
  </div>
);

// ─── Quantity Selector ───────────────────────────────────────
const QuantitySelector = ({ max = 1, value = 1, onChange }) => (
  <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden bg-gray-50 p-1 gap-1">
    <button
      onClick={() => onChange?.(Math.max(1, value - 1))}
      disabled={value <= 1}
      className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600"
    >
      <Minus className="w-3.5 h-3.5" />
    </button>
    <span className="w-10 text-center font-bold text-gray-900 text-sm">{value}</span>
    <button
      onClick={() => onChange?.(Math.min(value + 1, max))}
      disabled={value >= max}
      className="w-9 h-9 flex items-center justify-center hover:bg-white rounded-lg disabled:opacity-30 disabled:cursor-not-allowed transition-all text-gray-600"
    >
      <Plus className="w-3.5 h-3.5" />
    </button>
  </div>
);

// ─── Main Page ───────────────────────────────────────────────
const ProductPage = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();
  const { addToWishlist, wishlist } = useAuth();
  const [isWishlisted, setIsWishlisted] = useState(false);
  const [activeTab, setActiveTab] = useState("description");

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
    if (slug) fetchProduct();
    return () => { mounted = false; };
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success("Added to cart", { description: `${quantity} × ${product.name}` });
    }
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
      title={product?.meta_title || (product ? `${product.name} | Zantech Store` : undefined)}
      description={product?.meta_description || product?.short_description}
      keywords={product?.meta_keywords}
      image={seoImage}
      url={productUrl}
      type="product"
      product={product ? { price: product.discountedPrice, currency: "BDT", availability: product.quantity > 0 ? "in stock" : "out of stock", brand: product.brand || "Zantech" } : undefined}
    />
  );

  // ── Loading skeleton ──
  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        {SeoComponent}
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 max-w-6xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Skeleton className="aspect-square rounded-2xl bg-gray-200" />
            <div className="space-y-4">
              {[3, 2, 4, 2, 12].map((w, i) => (
                <Skeleton key={i} className={`h-${w === 12 ? 32 : w === 4 ? 10 : w === 3 ? 6 : 5} w-${w === 12 ? 'full' : w === 4 ? 'full' : w === 3 ? '3/4' : '1/2'} bg-gray-200 rounded-xl`} />
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
      <div className="flex flex-col min-h-screen bg-gray-50">
        {SeoComponent}
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-sm">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h2>
            <p className="text-gray-500 mb-7 text-sm">{error || "The product you're looking for doesn't exist."}</p>
            <Link to="/shop" className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors">
              <ShoppingCart className="w-4 h-4" /> Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );

  const hasDiscount = product.discountedPrice < product.price;
  const savings = hasDiscount ? product.price - product.discountedPrice : 0;
  const isBundleProduct = product.is_bundle === 1 && product.bundle_items?.length > 0;

  const trustBadges = [
    { icon: <Truck className="w-5 h-5" />, title: "Fast Delivery", sub: "Dhaka next day", color: "bg-blue-50 text-blue-600" },
    { icon: <ShieldCheck className="w-5 h-5" />, title: "Genuine", sub: "100% authentic", color: "bg-emerald-50 text-emerald-600" },
    { icon: <RotateCcw className="w-5 h-5" />, title: "3-Day Returns", sub: "Easy policy", color: "bg-purple-50 text-purple-600" },
    { icon: <Check className="w-5 h-5" />, title: "Warranty", sub: "Official support", color: "bg-amber-50 text-amber-600" },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 font-sans">
      {SeoComponent}
      <Header />

      <main className="flex-grow py-5 md:py-8 pb-28 lg:pb-8">
        <div className="container mx-auto px-4 max-w-6xl">

          {/* ── Breadcrumb ── */}
          <nav className="flex items-center gap-1 text-xs text-gray-400 mb-5 overflow-x-auto whitespace-nowrap py-1">
            <Link to="/" className="hover:text-blue-600 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <Breadcrumb className="w-3 h-3 flex-shrink-0" />
            <Link to="/shop" className="hover:text-blue-600 transition-colors">Shop</Link>
            {product.categories?.[0] && (
              <>
                <Breadcrumb className="w-3 h-3 flex-shrink-0" />
                <Link to={`/shop?category_slug=${product.categories[0].slug}`} className="hover:text-blue-600 transition-colors">
                  {product.categories[0].name}
                </Link>
              </>
            )}
            <Breadcrumb className="w-3 h-3 flex-shrink-0" />
            <span className="text-gray-600 font-medium truncate max-w-[160px] md:max-w-xs">{product.name}</span>
          </nav>

          {/* ── Top Section: Gallery + Info ── */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-10 mb-8">

            {/* Gallery */}
            <div className="w-full">
              <Gallery
                images={product.images?.length ? product.images : product.image ? [product.image] : []}
                alt={product.name}
              />
              {product.brand && (
                <div className="mt-3 flex items-center gap-2 text-xs text-gray-400">
                  <Cpu className="w-3.5 h-3.5" />
                  Brand: <span className="font-semibold text-gray-600">{product.brand}</span>
                </div>
              )}
            </div>

            {/* Info */}
            <div className="flex flex-col gap-4">

              {/* Badges row */}
              <div className="flex items-center gap-2 flex-wrap">
                {product.categories?.[0] && (
                  <Link
                    to={`/shop?category_slug=${product.categories[0].slug}`}
                    className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wide rounded-full hover:bg-blue-100 transition-colors"
                  >
                    {product.categories[0].name}
                  </Link>
                )}
                {isBundleProduct && (
                  <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold uppercase rounded-full flex items-center gap-1">
                    <Package className="w-3 h-3" /> Bundle Kit
                  </span>
                )}
                {product.quantity > 0 ? (
                  <span className="flex items-center gap-1.5 text-emerald-700 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    In Stock ({product.quantity} units)
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-red-700 text-xs font-bold bg-red-50 px-3 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Name */}
              <h1 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 leading-snug">
                {product.name}
              </h1>

              {/* Rating + Share */}
              <div className="flex items-center gap-4 flex-wrap">
                {product.average_rating > 0 && (
                  <StarRating rating={product.average_rating} totalReviews={product.ratings?.length} />
                )}
                <button onClick={handleShare} className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-blue-600 transition-colors">
                  <Share2 className="w-3.5 h-3.5" /> Share
                </button>
              </div>

              {/* Price block */}
              <div className="bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                <div className="flex items-end gap-3 flex-wrap">
                  <span className="text-3xl md:text-4xl font-black text-gray-900">
                    ৳{product.discountedPrice?.toLocaleString()}
                  </span>
                  {hasDiscount && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-base text-gray-400 line-through font-medium">
                        ৳{product.price?.toLocaleString()}
                      </span>
                      <span className="text-xs font-black text-white bg-red-500 px-2 py-0.5 rounded-full">
                        -{product.discountPercentage}% OFF
                      </span>
                    </div>
                  )}
                </div>
                {hasDiscount && savings > 0 && (
                  <p className="text-sm text-emerald-600 font-semibold flex items-center gap-1.5 mt-2">
                    <Tag className="w-3.5 h-3.5" />
                    You save ৳{savings.toLocaleString()} on this order
                  </p>
                )}
                {product.short_description && (
                  <p className="text-gray-500 text-sm leading-relaxed mt-3 pt-3 border-t border-gray-100">
                    {product.short_description}
                  </p>
                )}
              </div>

              {/* Desktop purchase actions */}
              <div className="hidden lg:block bg-white rounded-2xl border border-gray-100 p-4 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">Quantity</span>
                  <QuantitySelector max={product.quantity} value={quantity} onChange={setQuantity} />
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleAddToCart}
                    disabled={product.quantity === 0}
                    className="flex-1 bg-gray-900 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-3.5 px-6 rounded-xl flex items-center justify-center gap-2.5 transition-all active:scale-[0.98] shadow-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-3.5 rounded-xl border transition-all ${isWishlisted ? "bg-red-500 text-white border-red-500 shadow-lg" : "border-gray-200 bg-white text-gray-400 hover:text-red-500 hover:bg-red-50 hover:border-red-200"}`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? "fill-current" : ""}`} />
                  </button>
                </div>
                {/* Trust badges grid */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-50">
                  {trustBadges.map(b => (
                    <div key={b.title} className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${b.color}`}>
                        {b.icon}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900">{b.title}</p>
                        <p className="text-[10px] text-gray-400 uppercase tracking-wide">{b.sub}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Mobile trust badges (no buy button — that's in sticky bar) */}
              <div className="lg:hidden grid grid-cols-2 gap-3 bg-white rounded-2xl border border-gray-100 p-4 shadow-sm">
                {trustBadges.map(b => (
                  <div key={b.title} className="flex items-center gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${b.color}`}>
                      {b.icon}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-900">{b.title}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">{b.sub}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Bundle Items ── */}
          {isBundleProduct && (
            <div className="mb-8">
              <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 md:p-10">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/8 rounded-full -translate-y-32 translate-x-32 pointer-events-none" />
                <div className="absolute bottom-0 left-0 w-48 h-48 bg-emerald-500/8 rounded-full translate-y-24 -translate-x-24 pointer-events-none" />
                <div className="relative z-10">
                  <div className="flex items-start gap-4 mb-7">
                    <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/30 flex-shrink-0">
                      <Package className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h2 className="text-xl md:text-2xl font-black text-white">What's in the Box</h2>
                      <p className="text-slate-400 text-sm mt-0.5">
                        {product.bundle_items.length} item{product.bundle_items.length !== 1 ? "s" : ""} included in this complete kit
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
                    {product.bundle_items.map((item) => (
                      <Link
                        key={item.item_id}
                        to={`/product/${item.slug}`}
                        className="group bg-white/8 hover:bg-white/15 border border-white/10 hover:border-white/25 rounded-2xl p-3 md:p-4 transition-all duration-300"
                      >
                        <div className="relative aspect-square bg-white/8 rounded-xl mb-3 overflow-hidden p-2 md:p-3">
                          <img src={item.image} alt={item.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" />
                          <div className="absolute top-1 right-1 bg-emerald-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full shadow-sm">
                            ×{item.bundle_quantity}
                          </div>
                        </div>
                        <h3 className="font-semibold text-white text-xs leading-snug line-clamp-2 group-hover:text-emerald-400 transition-colors mb-1.5">
                          {item.name}
                        </h3>
                        <div className="flex items-center gap-1 text-slate-500 text-[10px] group-hover:text-emerald-400 transition-colors">
                          <ExternalLink className="w-3 h-3" />
                          <span>View details</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-5 pt-5 border-t border-white/10 flex flex-wrap items-center gap-4">
                    <div className="flex items-center gap-2 text-emerald-400">
                      <Check className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm font-medium">All items tested & quality assured</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                      <ShieldCheck className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">Official warranty included</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── Tabs: Description & Reviews ── */}
          <div className="mb-8">
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {/* Tab buttons */}
              <div className="flex border-b border-gray-100 overflow-x-auto">
                <button
                  onClick={() => setActiveTab("description")}
                  className={`flex items-center gap-2 px-5 md:px-8 py-4 text-sm font-bold whitespace-nowrap transition-colors relative flex-shrink-0 ${
                    activeTab === "description" ? "text-blue-600 bg-blue-50/60" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  Description
                  {activeTab === "description" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
                <button
                  onClick={() => setActiveTab("reviews")}
                  className={`flex items-center gap-2 px-5 md:px-8 py-4 text-sm font-bold whitespace-nowrap transition-colors relative flex-shrink-0 ${
                    activeTab === "reviews" ? "text-blue-600 bg-blue-50/60" : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Reviews
                  {product.ratings?.length > 0 && (
                    <span className="ml-1 text-[10px] font-black bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded-full">
                      {product.ratings.length}
                    </span>
                  )}
                  {activeTab === "reviews" && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />}
                </button>
              </div>

              {/* Tab content */}
              <div className="p-5 md:p-8 min-h-[200px]">
                {activeTab === "description" && (
                  <div
                    className={[
                      "prose prose-sm md:prose-base max-w-none",
                      // headings
                      "prose-headings:font-black prose-headings:text-gray-900 prose-headings:tracking-tight",
                      "prose-h1:text-2xl prose-h2:text-xl prose-h3:text-lg",
                      // paragraphs
                      "prose-p:text-gray-600 prose-p:leading-relaxed prose-p:text-[15px]",
                      // links
                      "prose-a:text-blue-600 prose-a:no-underline prose-a:font-semibold hover:prose-a:underline",
                      // lists
                      "prose-li:text-gray-600 prose-li:text-[15px]",
                      "prose-ul:space-y-1 prose-ol:space-y-1",
                      "prose-ul:my-3 prose-ol:my-3",
                      // images
                      "prose-img:rounded-2xl prose-img:shadow-md prose-img:border prose-img:border-gray-100",
                      // tables
                      "prose-table:border prose-table:border-gray-200 prose-table:rounded-xl prose-table:overflow-hidden",
                      "prose-th:bg-gray-50 prose-th:text-gray-800 prose-th:font-bold prose-th:px-4 prose-th:py-2.5",
                      "prose-td:px-4 prose-td:py-2.5 prose-td:border-b prose-td:border-gray-100 prose-td:text-gray-600",
                      // code
                      "prose-code:bg-gray-100 prose-code:text-blue-700 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-code:text-sm",
                      "prose-pre:bg-gray-900 prose-pre:rounded-2xl prose-pre:shadow-lg",
                      // blockquote
                      "prose-blockquote:border-l-4 prose-blockquote:border-blue-400 prose-blockquote:bg-blue-50 prose-blockquote:rounded-r-xl prose-blockquote:py-1",
                      "prose-blockquote:text-gray-700 prose-blockquote:not-italic",
                      // strong
                      "prose-strong:text-gray-900 prose-strong:font-bold",
                      // hr
                      "prose-hr:border-gray-200",
                    ].join(" ")}
                    dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(product.description || "") }}
                  />
                )}

                {activeTab === "reviews" && (
                  <div>
                    {product.ratings?.length > 0 ? (
                      <>
                        {/* Rating summary */}
                        <div className="flex items-center gap-5 mb-6 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                          <div className="text-center flex-shrink-0">
                            <div className="text-5xl font-black text-gray-900 leading-none">{product.average_rating?.toFixed(1)}</div>
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
                                  <span className="text-xs text-gray-500 w-4 text-right">{star}</span>
                                  <Star className="w-3 h-3 fill-amber-400 text-amber-400 flex-shrink-0" />
                                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
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
                            <div key={review.id} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                              <div className="flex items-center gap-3 mb-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md flex-shrink-0">
                                  {review.user.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <p className="font-bold text-gray-900 text-sm">{review.user}</p>
                                  <div className="flex gap-0.5 mt-0.5">
                                    {[...Array(5)].map((_, i) => (
                                      <Star key={i} className={`w-3 h-3 ${i < parseInt(review.star) ? "fill-amber-400 text-amber-400" : "fill-gray-200 text-gray-200"}`} />
                                    ))}
                                  </div>
                                </div>
                              </div>
                              <p className="text-gray-600 text-sm leading-relaxed">"{review.rating}"</p>
                            </div>
                          ))}
                        </div>
                      </>
                    ) : (
                      <div className="text-center py-10">
                        <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                          <Star className="w-7 h-7 text-gray-300" />
                        </div>
                        <h3 className="text-base font-bold text-gray-900 mb-1">No Reviews Yet</h3>
                        <p className="text-gray-400 text-sm">Be the first to review this product!</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── Related Products ── */}
          <div className="border-t border-gray-200 pt-8">
            <h2 className="text-xl font-black text-gray-900 mb-6">You Might Also Like</h2>
            <RelatedProducts categorySlug={product.categories?.[0]?.slug} currentProductId={product.id} />
          </div>
        </div>
      </main>

      {/* ── Mobile Sticky Add-to-Cart Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-50 lg:hidden bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-2xl shadow-black/10">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <div className="flex-shrink-0">
            <p className="text-[10px] text-gray-400 uppercase tracking-wider">Price</p>
            <p className="text-lg font-black text-gray-900 leading-tight">৳{product.discountedPrice?.toLocaleString()}</p>
            {hasDiscount && (
              <p className="text-xs text-gray-400 line-through">৳{product.price?.toLocaleString()}</p>
            )}
          </div>
          <div className="flex items-center gap-2 flex-1">
            <QuantitySelector max={product.quantity} value={quantity} onChange={setQuantity} />
            <button
              onClick={handleAddToCart}
              disabled={product.quantity === 0}
              className="flex-1 bg-gray-900 hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.97] text-sm"
            >
              <ShoppingCart className="w-4 h-4" />
              {product.quantity === 0 ? "Out of Stock" : "Add to Cart"}
            </button>
            <button
              onClick={handleWishlistToggle}
              className={`p-3 rounded-xl border transition-all flex-shrink-0 ${isWishlisted ? "bg-red-500 text-white border-red-500" : "border-gray-200 text-gray-400 hover:text-red-500"}`}
            >
              <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProductPage;
