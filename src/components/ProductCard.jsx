import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Star, Zap } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

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
  } = product;
  const { addToCart } = useCart();
  const { user, addToWishlist, wishlist } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Safely check if wishlist exists and is an array before using .includes()
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

    setTimeout(() => {
      setIsLoading(false);
    }, 500);
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
    if (result.success) {
      setIsWishlisted(true);
    }
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toast.info("Coming soon", {
      description: "Quick view feature will be available soon",
      duration: 2000,
    });
  };

  return (
    <div className="group relative bg-white rounded-[2rem] border border-gray-100/50 hover:border-blue-100 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/5 hover:-translate-y-1 overflow-hidden">
      {/* Discount Badge */}
      {hasDiscount && (
        <div className="absolute top-4 left-4 z-10">
          <div className="bg-white/90 backdrop-blur-md text-red-600 text-[10px] font-bold px-3 py-1 rounded-full shadow-sm border border-red-100 flex items-center gap-1 uppercase tracking-wider">
            <Zap className="w-3 h-3 fill-current" />
            {discountPercentage
              ? `${Math.round(discountPercentage)}% Off`
              : "Sale"}
          </div>
        </div>
      )}

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-4 right-4 z-10 p-2.5 rounded-xl backdrop-blur-md transition-all duration-300 ${
          isWishlisted
            ? "bg-red-500 text-white shadow-lg shadow-red-200 scale-110"
            : "bg-white/80 text-gray-400 hover:bg-white hover:text-red-500 border border-gray-100"
        }`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[5/4] bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-2 group-hover:scale-105 transition-transform duration-500"
          />

          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
            <button
              onClick={handleQuickView}
              className="bg-white/95 backdrop-blur-sm text-gray-900 px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300 shadow-lg hover:shadow-xl"
            >
              <Eye className="w-4 h-4" />
              Quick View
            </button>
          </div>
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-5 sm:p-6 space-y-3 sm:space-y-4">
        {rating && (
          <div className="flex items-center gap-2">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < Math.floor(rating)
                      ? "text-yellow-400 fill-current"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            {reviews && (
              <span className="text-xs text-gray-500">({reviews} reviews)</span>
            )}
          </div>
        )}

        <h3 className="font-bold text-gray-900 text-sm sm:text-lg leading-tight tracking-tight mb-1">
          <Link
            to={`/product/${product.slug}`}
            className="hover:text-blue-600 transition-colors"
            title={name}
          >
            {name}
          </Link>
        </h3>

        <div className="space-y-2">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg sm:text-2xl font-bold text-gray-900">
              ৳{finalPrice?.toLocaleString()}
            </span>
            {hasDiscount && (
              <>
                <span className="text-xs sm:text-base text-gray-500 line-through">
                  ৳{price?.toLocaleString()}
                </span>
                {savings > 0 && (
                  <span className="text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    Save ৳{savings.toLocaleString()}
                  </span>
                )}
              </>
            )}
          </div>
        </div>

        {product.stock !== undefined && (
          <div className="flex items-center text-sm">
            {product.stock > 0 ? (
              <span className="text-green-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-green-600 rounded-full animate-pulse"></span>
                In Stock ({product.stock} available)
              </span>
            ) : (
              <span className="text-red-600 font-medium flex items-center gap-1">
                <span className="w-2 h-2 bg-red-600 rounded-full"></span>
                Out of Stock
              </span>
            )}
          </div>
        )}

        <div className="space-y-2 pt-2">
          <button
            onClick={handleAddToCart}
            disabled={
              isLoading || (product.stock !== undefined && product.stock === 0)
            }
            className="w-full bg-gray-900 hover:bg-blue-600 disabled:bg-gray-200 text-white font-bold py-3.5 px-4 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 text-sm shadow-sm active:scale-[0.98]"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <ShoppingCart className="w-4 h-4" />
                {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
              </>
            )}
          </button>

          <Link
            to={`/product/${product.slug}`}
            className="w-full block text-center border border-gray-100 hover:border-blue-100 bg-white text-gray-500 hover:text-blue-600 font-bold py-3 px-4 rounded-2xl transition-all duration-300 text-sm"
          >
            Details
          </Link>
        </div>
      </div>

      <div className="absolute inset-0 rounded-2xl ring-2 ring-blue-500 ring-opacity-0 group-hover:ring-opacity-20 transition-all duration-300 pointer-events-none"></div>
    </div>
  );
};

export default ProductCard;
