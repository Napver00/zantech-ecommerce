import React from "react";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Tag,
} from "lucide-react";
import { Link } from "react-router-dom";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
  const itemTotal = (item.discountedPrice || item.price) * item.quantity;

  return (
    <div className="relative bg-white rounded-xl p-3 border border-gray-100">
      {/* Discount Badge */}
      {hasDiscount && item.discountPercentage && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md z-10">
          -{Math.round(item.discountPercentage)}%
        </div>
      )}

      <div className="flex gap-3">
        {/* Product Image */}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          decoding="async"
          className="w-16 h-16 object-contain rounded-lg bg-gray-50 border border-gray-100 flex-shrink-0"
        />

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
            {item.name}
          </h4>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-2">
            {hasDiscount ? (
              <>
                <span className="text-sm font-bold text-gray-900">
                  ৳{item.discountedPrice.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ৳{item.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-sm font-bold text-gray-900">
                ৳{item.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center border border-gray-200 rounded-lg">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-2 py-1 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3.5 w-3.5 text-gray-600" />
              </button>
              <span className="px-3 py-1 text-sm font-semibold min-w-[2.5rem] text-center border-x border-gray-200">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 hover:bg-gray-50 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>

            {/* Remove & Total */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-[10px] text-gray-400">Total</div>
                <div className="text-sm font-bold text-gray-900">
                  ৳{itemTotal.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                title="Remove from cart"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export const Cart = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalSavings = cartItems.reduce((sum, item) => {
    const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
    return hasDiscount ? sum + (item.price - item.discountedPrice) * item.quantity : sum;
  }, 0);

  return (
    <SheetContent className="w-[400px] sm:w-[440px] flex flex-col p-0 gap-0">
      {/* Header */}
      <SheetHeader className="px-5 py-4 border-b border-gray-100 bg-white flex-shrink-0">
        <SheetTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ShoppingBag className="h-5 w-5 text-gray-500" />
          Shopping Cart
        </SheetTitle>
        {cartItems.length > 0 && (
          <p className="text-xs text-gray-500">
            {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} · {itemCount} total
          </p>
        )}
      </SheetHeader>

      {cartItems.length > 0 ? (
        <>
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto scroll-strip px-4 py-3 bg-gray-50 min-h-0">
            <div className="space-y-2.5">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Footer with Summary */}
          <SheetFooter className="p-4 bg-white border-t border-gray-100 flex-shrink-0">
            <div className="w-full space-y-3">
              {/* Order Summary */}
              <div className="bg-gray-50 rounded-xl p-3.5">
                <div className="flex justify-between text-sm text-gray-600 mb-1.5">
                  <span>Subtotal ({itemCount} items)</span>
                  <span>৳{cartTotal.toLocaleString()}</span>
                </div>
                {totalSavings > 0 && (
                  <div className="flex justify-between text-sm text-emerald-600 font-medium mb-1.5">
                    <span className="flex items-center gap-1"><Tag className="w-3.5 h-3.5" /> You're saving</span>
                    <span>-৳{totalSavings.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between items-center pt-2 border-t border-gray-200">
                  <span className="text-base font-bold text-gray-900">Total</span>
                  <span className="text-xl font-black text-gray-900">
                    ৳{cartTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2">
                <SheetClose asChild>
                  <Link to="/checkout" className="w-full block">
                    <Button
                      className="w-full h-11 text-sm font-semibold bg-gray-900 hover:bg-gray-800"
                      size="lg"
                    >
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                </SheetClose>
                <Button
                  onClick={clearCart}
                  variant="outline"
                  className="w-full h-9 text-xs border-gray-200 text-gray-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                  Clear Cart
                </Button>
              </div>

              {/* Trust note */}
              <div className="flex items-center justify-center gap-1.5 text-xs text-gray-400 pt-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full" />
                Secure checkout · Genuine components
              </div>
            </div>
          </SheetFooter>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 bg-gray-50">
          <div className="bg-gray-100 p-6 rounded-full mb-6">
            <ShoppingCart className="h-12 w-12 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1.5">
            Your cart is empty
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Start adding products to your cart to see them here.
          </p>
          <SheetClose asChild>
            <Link to="/shop">
              <Button className="bg-gray-900 hover:bg-gray-800" size="lg">
                <ShoppingBag className="h-4 w-4 mr-2" />
                Start Shopping
              </Button>
            </Link>
          </SheetClose>
        </div>
      )}
    </SheetContent>
  );
};
