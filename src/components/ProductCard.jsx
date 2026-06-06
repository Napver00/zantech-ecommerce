import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Star, Zap, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import QuickViewModal from "./QuickViewModal";

const ProductCard = ({ product }) => {
  const {
    name,
    price,
    image,
    discount,
    discountedPrice,
    discountPercentage,
    rating,
    reviews,
    is_bundle,
  } = product;
  const { addToCart } = useCart();
  const { user, addToWishlist, wishlist } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  useEffect(() => {
    if (Array.isArray(wishlist) && wishlist.includes(product.id)) {
      setIsWishlisted(true);
    } else {
      setIsWishlisted(false);
    }
  }, [wishlist, product.id]);

  const hasDiscount =
    Number(discount) > 0 || (discountedPrice && discountedPrice < price);
  const finalPrice = hasDiscount ? (discountedPrice ?? price) : price;
  const savings = hasDiscount ? price - finalPrice : 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsLoading(true);
    addToCart(product, 1);
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart`,
      duration: 3000,
    });
    setTimeout(() => setIsLoading(false), 500);
  };

  const handleWishlistToggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWishlisted) {
      toast.info("Already in wishlist", {
        description: "This item is already in your wishlist",
        duration: 3000,
      });
      return;
    }
    const result = await addToWishlist(product.id);
    if (result.success) setIsWishlisted(true);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
    <div className="group relative bg-white rounded-[1.75rem] border border-gray-100/80 hover:border-blue-100 transition-all duration-400 hover:shadow-xl hover:shadow-blue-500/8 hover:-translate-y-1 overflow-hidden flex flex-col">
      {/* Top Badges Row */}
      <div className="absolute top-3.5 left-3.5 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <div className="bg-red-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Zap className="w-2.5 h-2.5 fill-current" />
            {discountPercentage
              ? `${Math.round(discountPercentage)}% OFF`
              : "SALE"}
          </div>
        )}
        {is_bundle === 1 && (
          <div className="bg-emerald-500 text-white text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1 shadow-sm">
            <Package className="w-2.5 h-2.5" />
            BUNDLE
          </div>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3.5 right-3.5 z-10 p-2 rounded-xl transition-all duration-300 ${
          isWishlisted
            ? "bg-red-500 text-white shadow-lg shadow-red-200 scale-110"
            : "bg-white/90 text-gray-400 hover:bg-white hover:text-red-500 border border-gray-100 shadow-sm"
        }`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[5/4] bg-gradient-to-br from-gray-50 to-gray-100/80 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/15 transition-colors duration-300 flex items-end justify-center pb-4">
            <button
              onClick={handleQuickView}
              className="bg-white/95 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-xl font-medium flex items-center gap-1.5 translate-y-8 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300 shadow-lg text-sm"
            >
              <Eye className="w-3.5 h-3.5" />
              Quick View
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 sm:p-5 flex flex-col flex-grow">
        {rating && (
          <div className="flex items-center gap-1.5 mb-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-3.5 h-3.5 ${
                    i < Math.floor(rating)
                      ? "text-amber-400 fill-current"
                      : "text-gray-200 fill-current"
                  }`}
                />
              ))}
            </div>
            {reviews && (
              <span className="text-xs text-gray-400">({reviews})</span>
            )}
          </div>
        )}

        <h3 className="font-semibold text-gray-900 text-sm leading-snug mb-2 flex-grow line-clamp-2">
          <Link
            to={`/product/${product.slug}`}
            className="hover:text-blue-600 transition-colors"
            title={name}
          >
            {name}
          </Link>
        </h3>

        <div className="flex items-baseline gap-2 mb-3 flex-wrap">
          <span className="text-lg font-bold text-gray-900">
            ৳{finalPrice?.toLocaleString()}
          </span>
          {hasDiscount && (
            <>
              <span className="text-sm text-gray-400 line-through">
                ৳{price?.toLocaleString()}
              </span>
              {savings > 0 && (
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">
                  Save ৳{savings.toLocaleString()}
                </span>
              )}
            </>
          )}
        </div>

        {product.stock !== undefined && (
          <div className="flex items-center text-xs mb-3">
            {product.stock > 0 ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse" />
                In Stock
              </span>
            ) : (
              <span className="text-red-500 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                Out of Stock
              </span>
            )}
          </div>
        )}

        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={
              isLoading || (product.stock !== undefined && product.stock === 0)
            }
            className="flex-1 bg-gray-900 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold py-3 px-3 rounded-xl transition-all duration-300 flex items-center justify-center gap-1.5 text-sm active:scale-[0.97]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-3.5 h-3.5" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </>
            )}
          </button>

          <Link
            to={`/product/${product.slug}`}
            className="flex items-center justify-center border border-gray-200 hover:border-blue-200 hover:bg-blue-50 text-gray-500 hover:text-blue-600 px-3 rounded-xl transition-all duration-300"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>

    {quickViewOpen && (
      <QuickViewModal
        slug={product.slug}
        onClose={() => setQuickViewOpen(false)}
      />
    )}
  </>
  );
};

export default ProductCard;
