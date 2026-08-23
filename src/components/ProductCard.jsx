import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Eye, Star, Package } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";

const ProductCard = ({ product, isNew = false }) => {
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
  const { addToWishlist, wishlist } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

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

  return (
    <div className="group relative bg-white rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 overflow-hidden flex flex-col">
      {/* Top Badges Row */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5">
        {hasDiscount && (
          <div className="bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md">
            {discountPercentage ? `-${Math.round(discountPercentage)}%` : "SALE"}
          </div>
        )}
        {is_bundle === 1 && (
          <div className="bg-gray-900 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
            <Package className="w-2.5 h-2.5" />
            KIT
          </div>
        )}
        {isNew && (
          <div className="bg-blue-600 text-white text-[10px] font-bold px-2 py-1 rounded-md">
            NEW
          </div>
        )}
      </div>

      {/* Wishlist Button */}
      <button
        onClick={handleWishlistToggle}
        className={`absolute top-3 right-3 z-10 p-2 rounded-lg transition-colors ${
          isWishlisted
            ? "bg-red-50 text-red-500"
            : "bg-white/90 text-gray-400 hover:bg-white hover:text-red-500 border border-gray-100"
        }`}
        aria-label={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
      >
        <Heart className={`w-4 h-4 ${isWishlisted ? "fill-current" : ""}`} />
      </button>

      {/* Product Image */}
      <Link to={`/product/${product.slug}`} className="block">
        <div className="relative aspect-[5/4] bg-gray-50 overflow-hidden">
          <img
            src={image}
            alt={name}
            className="w-full h-full object-contain p-4 group-hover:scale-[1.03] transition-transform duration-300"
          />
        </div>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-grow">
        {rating && (
          <div className="flex items-center gap-1.5 mb-1.5">
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
            <span className="text-sm text-gray-400 line-through">
              ৳{price?.toLocaleString()}
            </span>
          )}
        </div>

        {product.stock !== undefined && product.stock === 0 && (
          <p className="text-xs font-medium text-red-500 mb-3">Out of Stock</p>
        )}

        <div className="flex gap-2 mt-auto">
          <button
            onClick={handleAddToCart}
            disabled={
              isLoading || (product.stock !== undefined && product.stock === 0)
            }
            className="flex-1 bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-3 rounded-xl transition-colors flex items-center justify-center gap-1.5 text-sm active:scale-[0.98]"
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
            className="hidden sm:flex items-center justify-center border border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-500 px-3 rounded-xl transition-colors flex-shrink-0"
            title="View Details"
          >
            <Eye className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
