import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, ShoppingCart, Star, Package, Check } from "lucide-react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

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
  const isBundle = Number(is_bundle) === 1;
  const { addToCart } = useCart();
  const { addToWishlist, wishlist } = useAuth();

  const [isWishlisted, setIsWishlisted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    setIsWishlisted(Array.isArray(wishlist) && wishlist.includes(product.id));
  }, [wishlist, product.id]);

  const hasDiscount = Number(discount) > 0 || (discountedPrice && discountedPrice < price);
  const finalPrice = hasDiscount ? (discountedPrice ?? price) : price;
  const savings = hasDiscount ? price - finalPrice : 0;
  const percent = discountPercentage
    ? Math.round(discountPercentage)
    : hasDiscount && price ? Math.round((savings / price) * 100) : 0;
  const outOfStock = product.stock !== undefined && Number(product.stock) === 0;
  const category = product.categories?.[0]?.name;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    setIsLoading(true);
    addToCart(product, 1);
    toast.success("Added to cart", {
      description: `${product.name} has been added to your cart`,
      duration: 3000,
    });
    setTimeout(() => {
      setIsLoading(false);
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), 1500);
    }, 400);
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
    <div className="group relative flex flex-col overflow-hidden rounded-xl border border-white/10 bg-surface-dark transition-all duration-300 hover:-translate-y-1 hover:border-zan-cyan/40 hover:shadow-[0_8px_30px_rgba(0,240,255,0.08)]">
      {/* Badges */}
      <div className="absolute left-3 top-3 z-10 flex flex-col gap-1.5">
        {hasDiscount && percent > 0 && (
          <span className="rounded bg-zan-red px-2 py-1 text-[11px] font-bold leading-none text-white shadow-sm">
            -{percent}%
          </span>
        )}
        {isBundle && (
          <span className="flex items-center gap-1 rounded bg-zan-dark px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wider text-zan-cyan">
            <Package className="h-3 w-3" /> Kit
          </span>
        )}
        {isNew && (
          <span className="rounded bg-zan-cyan px-2 py-1 text-[10px] font-bold uppercase leading-none tracking-wider text-zan-dark">
            New
          </span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={handleWishlistToggle}
        className={cn(
          "absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full border shadow-sm transition-all",
          isWishlisted
            ? "border-zan-red/30 bg-zan-red text-white"
            : "border-black/5 bg-white/90 text-gray-500 opacity-100 hover:text-zan-red sm:opacity-0 sm:group-hover:opacity-100",
        )}
        aria-label={isWishlisted ? "In your wishlist" : "Add to wishlist"}
      >
        <Heart className={cn("h-4 w-4", isWishlisted && "fill-current")} />
      </button>

      {/* Image */}
      <Link to={`/product/${product.slug}`} className="block" tabIndex={-1}>
        <div className="product-tile relative aspect-square overflow-hidden">
          <img
            src={image}
            alt={name}
            loading="lazy"
            decoding="async"
            className={cn(
              "h-full w-full object-contain p-5 transition-transform duration-500 group-hover:scale-105",
              outOfStock && "opacity-50 grayscale",
            )}
          />
          {outOfStock && (
            <span className="absolute inset-x-0 bottom-0 bg-zan-dark/85 py-1.5 text-center text-xs font-bold uppercase tracking-widest text-gray-300">
              Out of stock
            </span>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="flex flex-grow flex-col p-4">
        {category && (
          <p className="mb-1 line-clamp-1 font-mono text-[10px] uppercase tracking-widest text-zan-cyan/70">{category}</p>
        )}

        <h3 className="mb-2 line-clamp-2 min-h-[2.5rem] text-sm font-semibold leading-snug text-gray-100">
          <Link to={`/product/${product.slug}`} className="transition-colors hover:text-zan-cyan" title={name}>
            {name}
          </Link>
        </h3>

        {rating ? (
          <div className="mb-2 flex items-center gap-1.5">
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={cn("h-3.5 w-3.5 fill-current", i < Math.floor(rating) ? "text-amber-400" : "text-white/15")} />
              ))}
            </div>
            {reviews ? <span className="text-xs text-gray-500">({reviews})</span> : null}
          </div>
        ) : null}

        <div className="mt-auto">
          <div className="mb-3 flex flex-wrap items-baseline gap-x-2">
            <span className="text-lg font-bold text-white">৳{finalPrice?.toLocaleString()}</span>
            {hasDiscount && <span className="text-sm text-gray-500 line-through">৳{price?.toLocaleString()}</span>}
          </div>

          <button
            onClick={handleAddToCart}
            disabled={isLoading || outOfStock}
            className={cn(
              "flex w-full items-center justify-center gap-2 rounded-lg border py-2.5 text-sm font-bold transition-all active:scale-[0.98]",
              outOfStock
                ? "cursor-not-allowed border-white/10 bg-white/5 text-gray-500"
                : justAdded
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300"
                  : "border-zan-cyan/40 bg-zan-cyan/10 text-zan-cyan hover:bg-zan-cyan hover:text-zan-dark",
            )}
          >
            {isLoading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
            ) : justAdded ? (
              <><Check className="h-4 w-4" /> Added</>
            ) : (
              <><ShoppingCart className="h-4 w-4" /> {outOfStock ? "Out of stock" : "Add to cart"}</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
