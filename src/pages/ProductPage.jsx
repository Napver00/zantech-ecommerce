import React, { useEffect, useState } from "react";
import {
  ShoppingCart,
  Heart,
  Star,
  ChevronLeft,
  ChevronRight,
  Package,
  Minus,
  Plus,
  Share2,
  Check,
  ShieldCheck,
  Truck,
  RotateCcw,
  AlertCircle,
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

// --- Components ---

const Gallery = ({ images = [], alt = "" }) => {
  const imgs = Array.isArray(images)
    ? images.map((i) => (i?.path ? i.path : i))
    : [];
  const [index, setIndex] = useState(imgs.length ? 0 : -1);

  useEffect(() => {
    setIndex(imgs.length ? 0 : -1);
  }, [images, imgs.length]);

  if (!imgs.length)
    return (
      <div className="w-full aspect-square flex items-center justify-center bg-slate-50 rounded-2xl border border-slate-100">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-slate-200 rounded-full flex items-center justify-center">
            <ShoppingCart className="w-8 h-8 text-slate-400" />
          </div>
          <p className="text-slate-500 font-medium">No Image Available</p>
        </div>
      </div>
    );

  return (
    <div className="space-y-4">
      <div className="relative bg-white border border-slate-200 rounded-2xl overflow-hidden group aspect-square flex items-center justify-center p-8">
        <img
          src={imgs[index]}
          alt={alt}
          className="max-h-full max-w-full object-contain transition-transform duration-500 group-hover:scale-110"
        />

        {/* Navigation Arrows */}
        {imgs.length > 1 && (
          <>
            <button
              onClick={() => setIndex((i) => (i > 0 ? i - 1 : i))}
              disabled={index === 0}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-0 disabled:cursor-not-allowed text-slate-700"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => setIndex((i) => (i < imgs.length - 1 ? i + 1 : i))}
              disabled={index === imgs.length - 1}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 backdrop-blur-sm p-3 rounded-full shadow-lg hover:bg-white hover:scale-110 transition-all duration-200 disabled:opacity-0 disabled:cursor-not-allowed text-slate-700"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {imgs.length > 1 && (
        <div className="grid grid-cols-5 gap-4">
          {imgs.map((src, idx) => (
            <button
              key={idx}
              onClick={() => setIndex(idx)}
              className={`aspect-square p-2 rounded-2xl overflow-hidden border-2 transition-all duration-300 ${
                idx === index
                  ? "border-blue-600 shadow-lg shadow-blue-500/10 bg-white scale-105"
                  : "border-transparent bg-white hover:border-slate-200"
              }`}
            >
              <img
                src={src}
                alt={`${alt}-${idx}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const StarRating = ({ rating, totalReviews = 0 }) => {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`w-4 h-4 ${
              i < Math.round(rating)
                ? "fill-amber-400 text-amber-400"
                : "fill-slate-200 text-slate-200"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-bold text-slate-900">
        {rating.toFixed(1)}
      </span>
      <span className="text-sm text-slate-500">({totalReviews} reviews)</span>
    </div>
  );
};

const QuantitySelector = ({ max = 1, value = 1, onChange }) => {
  const inc = () => onChange?.(Math.min(value + 1, max));
  const dec = () => onChange?.(Math.max(1, value - 1));

  return (
    <div className="flex items-center border border-slate-100 rounded-2xl overflow-hidden bg-slate-50/50 p-1">
      <button
        onClick={dec}
        disabled={value <= 1}
        className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 hover:shadow-sm"
      >
        <Minus className="w-4 h-4" />
      </button>
      <span className="w-12 text-center font-bold text-slate-900">{value}</span>
      <button
        onClick={inc}
        disabled={value >= max}
        className="w-10 h-10 flex items-center justify-center hover:bg-white rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-all text-slate-600 hover:shadow-sm"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
};

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
    if (product && Array.isArray(wishlist)) {
      setIsWishlisted(wishlist.includes(product.id));
    }
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
          const normalized = {
            ...p,
            image:
              p.image ||
              p.image_path ||
              (Array.isArray(p.images) && p.images[0]?.path) ||
              "",
            description: p.description || "",
            discountedPrice: p.discountedPrice ?? p.discounted_price ?? p.price,
            discountPercentage:
              p.discountPercentage ?? p.discount_percentage ?? null,
            meta_title: p.meta_title || p.name,
            meta_keywords: p.meta_keywords || "",
            meta_description: p.meta_description || p.short_description || "",
          };
          if (mounted) setProduct(normalized);
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
    return () => {
      mounted = false;
    };
  }, [slug]);

  const handleAddToCart = () => {
    if (product) {
      addToCart(product, quantity);
      toast.success("Added to cart", {
        description: `${quantity} x ${product.name}`,
      });
    }
  };

  const handleWishlistToggle = async () => {
    if (!product) return;
    if (isWishlisted) {
      toast.info("Already in wishlist");
      return;
    }
    const result = await addToWishlist(product.id);
    if (result.success) setIsWishlisted(true);
  };

  const handleShare = async () => {
    const shareData = {
      title: product?.name,
      text: product?.short_description,
      url: window.location.href,
    };
    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Link copied to clipboard");
    }
  };

  const seoImage = product?.image?.startsWith("http")
    ? product.image
    : product?.image
      ? `${siteUrl}${product.image}`
      : "";

  const SeoComponent = (
    <Seo
      title={
        product?.meta_title ||
        (product ? `${product.name} | Zantech Store` : undefined)
      }
      description={product?.meta_description || product?.short_description}
      keywords={product?.meta_keywords}
      image={seoImage}
      url={productUrl}
      type="product"
      product={
        product
          ? {
              price: product.discountedPrice,
              currency: "BDT",
              availability: product.quantity > 0 ? "in stock" : "out of stock",
              brand: product.brand || "Zantech",
            }
          : undefined
      }
    />
  );

  if (loading)
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        {SeoComponent}
        <Header />
        <main className="flex-grow container mx-auto px-4 py-12">
          <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12">
            <Skeleton className="aspect-square rounded-2xl bg-slate-200" />
            <div className="space-y-6">
              <Skeleton className="h-8 w-3/4 bg-slate-200" />
              <Skeleton className="h-6 w-1/2 bg-slate-200" />
              <Skeleton className="h-24 w-full bg-slate-200" />
              <Skeleton className="h-12 w-full bg-slate-200" />
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );

  if (error || !product)
    return (
      <div className="flex flex-col min-h-screen bg-slate-50">
        {SeoComponent}
        <Header />
        <main className="flex-grow flex items-center justify-center p-4">
          <div className="text-center max-w-md">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <AlertCircle className="w-10 h-10 text-red-500" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Product Not Found
            </h2>
            <p className="text-slate-600 mb-8">
              {error || "The product you are looking for does not exist."}
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
            >
              Back to Shop
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );

  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {SeoComponent}

      <Header />

      <main className="flex-grow py-8 md:py-12">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-sm text-slate-500 mb-8 overflow-x-auto whitespace-nowrap pb-2">
            <Link to="/" className="hover:text-blue-600 transition-colors">
              Home
            </Link>
            <ChevronRight className="w-4 h-4" />
            <Link to="/shop" className="hover:text-blue-600 transition-colors">
              Shop
            </Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-slate-900 font-medium">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 mb-16">
            {/* Left Column: Gallery */}
            <div>
              <Gallery
                images={
                  product.images?.length
                    ? product.images
                    : product.image
                      ? [product.image]
                      : []
                }
                alt={product.name}
              />
            </div>

            {/* Right Column: Product Info */}
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  {product.categories?.[0] && (
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider rounded-full">
                      {product.categories[0].name}
                    </span>
                  )}
                  {product.quantity > 0 ? (
                    <span className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      In Stock
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-red-600 text-xs font-bold uppercase tracking-wider">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      Out of Stock
                    </span>
                  )}
                </div>

                <h1 className="text-2xl md:text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-3">
                  {product.name}
                </h1>

                <div className="flex items-center gap-4 mb-6">
                  {product.average_rating > 0 && (
                    <StarRating
                      rating={product.average_rating}
                      totalReviews={product.ratings?.length}
                    />
                  )}
                  <button
                    onClick={handleShare}
                    className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-blue-600 transition-colors"
                  >
                    <Share2 className="w-4 h-4" />
                    Share
                  </button>
                </div>

                <div className="flex items-end gap-3 mb-6">
                  <span className="text-3xl sm:text-4xl font-bold text-slate-900">
                    ৳{product.discountedPrice}
                  </span>
                  {product.discountedPrice < product.price && (
                    <div className="flex flex-col mb-1">
                      <span className="text-lg text-slate-400 line-through">
                        ৳{product.price}
                      </span>
                      <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                        -{product.discountPercentage}% OFF
                      </span>
                    </div>
                  )}
                </div>

                <p className="text-slate-600 leading-relaxed text-lg">
                  {product.short_description}
                </p>
              </div>

              {/* Actions - Premium Minimal Card */}
              <div className="p-8 bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 space-y-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Quantity
                    </span>
                    <p className="text-sm text-slate-500 font-medium tracking-tight">
                      {product.quantity} items available
                    </p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-5">
                  <QuantitySelector
                    max={product.quantity}
                    value={quantity}
                    onChange={setQuantity}
                  />
                  <button
                    onClick={handleAddToCart}
                    disabled={product.quantity === 0}
                    className="flex-1 bg-gray-900 hover:bg-blue-600 disabled:bg-slate-200 disabled:cursor-not-allowed text-white font-bold text-lg py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all active:scale-[0.98] shadow-xl shadow-gray-900/10 hover:shadow-blue-600/20"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    Add to Cart
                  </button>
                  <button
                    onClick={handleWishlistToggle}
                    className={`p-4 rounded-2xl border transition-all ${
                      isWishlisted
                        ? "bg-red-500 text-white border-red-500 shadow-lg shadow-red-200"
                        : "border-slate-100 bg-slate-50 text-slate-400 hover:text-red-500 hover:bg-white hover:border-red-100"
                    }`}
                  >
                    <Heart
                      className={`w-6 h-6 ${isWishlisted ? "fill-current" : ""}`}
                    />
                  </button>
                </div>

                {/* Trust Badges - Minimal Grid */}
                <div className="grid grid-cols-2 gap-y-8 gap-x-4 pt-8 border-t border-slate-50">
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-600 transition-all duration-300">
                      <Truck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Fast Delivery
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Express
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-emerald-50 group-hover:text-emerald-600 transition-all duration-300">
                      <ShieldCheck className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Genuine
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Authentic
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-purple-50 group-hover:text-purple-600 transition-all duration-300">
                      <RotateCcw className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Returns
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        3 Days
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 group">
                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400 group-hover:bg-amber-50 group-hover:text-amber-600 transition-all duration-300">
                      <Check className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">
                        Warranty
                      </p>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">
                        Official
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Bundle Section */}
          {product.is_bundle === 1 && product.bundle_items?.length > 0 && (
            <div className="mb-16 bg-gradient-to-br from-emerald-50 to-teal-50 rounded-3xl p-8 md:p-12 border border-emerald-100">
              <div className="flex items-center gap-4 mb-8">
                <div className="p-3 bg-emerald-500 rounded-2xl shadow-lg shadow-emerald-500/20">
                  <Package className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold text-slate-900">
                    Bundle Includes
                  </h2>
                  <p className="text-emerald-700">
                    Get everything you need in one package
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {product.bundle_items.map((item) => (
                  <Link
                    key={item.item_id}
                    to={`/product/${item.slug}`}
                    className="bg-white rounded-2xl p-4 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group"
                  >
                    <div className="aspect-square bg-slate-50 rounded-xl mb-4 overflow-hidden p-4">
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
                      />
                    </div>
                    <h3 className="font-bold text-slate-900 line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                      {item.name}
                    </h3>
                    <div className="flex items-center justify-between">
                      <span className="text-emerald-600 font-bold">
                        x{item.bundle_quantity}
                      </span>
                      <span className="text-slate-500 text-sm">
                        View Details
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Tabs: Description & Reviews */}
          <div className="mb-16">
            <div className="flex items-center gap-8 border-b border-slate-200 mb-8 overflow-x-auto">
              {["description", "reviews"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`pb-4 text-lg font-bold capitalize transition-colors relative ${
                    activeTab === tab
                      ? "text-blue-600"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {tab}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full" />
                  )}
                </button>
              ))}
            </div>

            <div className="min-h-[300px]">
              {activeTab === "description" && (
                <div
                  className="prose prose-lg prose-slate max-w-none
                    prose-headings:font-bold prose-headings:text-slate-900
                    prose-p:text-slate-600 prose-p:leading-relaxed
                    prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                    prose-img:rounded-2xl prose-img:shadow-lg
                    prose-li:text-slate-600"
                  dangerouslySetInnerHTML={{
                    __html: DOMPurify.sanitize(product.description || ""),
                  }}
                />
              )}

              {activeTab === "reviews" && (
                <div className="space-y-8">
                  {product.ratings?.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {product.ratings.map((review) => (
                        <div
                          key={review.id}
                          className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm"
                        >
                          <div className="flex items-center gap-4 mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-blue-500/20">
                              {review.user.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <h4 className="font-bold text-slate-900">
                                {review.user}
                              </h4>
                              <div className="flex items-center gap-1">
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3.5 h-3.5 ${
                                      i < parseInt(review.star)
                                        ? "fill-amber-400 text-amber-400"
                                        : "fill-slate-200 text-slate-200"
                                    }`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-600 italic">
                            "{review.rating}"
                          </p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-white rounded-3xl border border-slate-100">
                      <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Star className="w-8 h-8 text-slate-300" />
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        No Reviews Yet
                      </h3>
                      <p className="text-slate-500">
                        Be the first to review this product!
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Related Products */}
          <div className="border-t border-slate-200 pt-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8">
              You Might Also Like
            </h2>
            <RelatedProducts
              categorySlug={product.categories?.[0]?.slug}
              currentProductId={product.id}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ProductPage;
