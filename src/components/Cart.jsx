import React from "react";
import { useCart } from "../context/CartContext";
import { Button } from "@/components/ui/button";
import {
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
} from "@/components/ui/sheet";
import {
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  ArrowRight,
  Package,
} from "lucide-react";
import { Link } from "react-router-dom";

const CartItem = ({ item }) => {
  const { updateQuantity, removeFromCart } = useCart();
  const hasDiscount = item.discountedPrice && item.discountedPrice < item.price;
  const itemTotal = (item.discountedPrice || item.price) * item.quantity;

  return (
    <div className="relative bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
      {/* Discount Badge */}
      {hasDiscount && item.discountPercentage && (
        <div className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-md z-10">
          -{Math.round(item.discountPercentage)}%
        </div>
      )}

      <div className="flex gap-3">
        {/* Product Image */}
        <div className="relative flex-shrink-0">
          <img
            src={item.image}
            alt={item.name}
            className="w-16 h-16 object-contain rounded-md bg-gray-50 border border-gray-100"
          />
        </div>

        {/* Product Details */}
        <div className="flex-1 min-w-0 flex flex-col">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2 mb-1">
            {item.name}
          </h4>

          {/* Price Section */}
          <div className="flex items-baseline gap-2 mb-2">
            {hasDiscount ? (
              <>
                <span className="text-base font-bold text-blue-600">
                  ৳{item.discountedPrice.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 line-through">
                  ৳{item.price.toLocaleString()}
                </span>
              </>
            ) : (
              <span className="text-base font-bold text-gray-900">
                ৳{item.price.toLocaleString()}
              </span>
            )}
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between mt-auto">
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-md">
              <button
                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                className="px-2 py-1 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                disabled={item.quantity <= 1}
              >
                <Minus className="h-3.5 w-3.5 text-gray-600" />
              </button>
              <span className="px-3 py-1 text-sm font-semibold bg-white min-w-[2.5rem] text-center border-x border-gray-200">
                {item.quantity}
              </span>
              <button
                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                className="px-2 py-1 hover:bg-gray-100 transition-colors"
              >
                <Plus className="h-3.5 w-3.5 text-gray-600" />
              </button>
            </div>

            {/* Remove & Total */}
            <div className="flex items-center gap-2">
              <div className="text-right">
                <div className="text-xs text-gray-500">Total</div>
                <div className="text-sm font-bold text-gray-900">
                  ৳{itemTotal.toLocaleString()}
                </div>
              </div>
              <button
                onClick={() => removeFromCart(item.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
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

  return (
    <SheetContent className="w-[400px] sm:w-[540px] flex flex-col p-0">
      {/* Header */}
      <SheetHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
        <div className="flex items-center justify-between">
          <div>
            <SheetTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShoppingBag className="h-5 w-5 text-blue-600" />
              Shopping Cart
            </SheetTitle>
            {cartItems.length > 0 && (
              <p className="text-xs text-gray-600 mt-1">
                {cartItems.length} item{cartItems.length !== 1 ? "s" : ""} (
                {itemCount} total)
              </p>
            )}
          </div>
        </div>
      </SheetHeader>

      {cartItems.length > 0 ? (
        <>
          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto px-4 py-3 bg-gray-50 min-h-0">
            <div className="space-y-2.5">
              {cartItems.map((item) => (
                <CartItem key={item.id} item={item} />
              ))}
            </div>
          </div>

          {/* Footer with Summary */}
          <SheetFooter className="p-4 bg-white border-t shadow-lg flex-shrink-0">
            <div className="w-full space-y-3">
              {/* Order Summary */}
              <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-gray-600">
                    <span>Items ({itemCount})</span>
                    <span>৳{cartTotal.toLocaleString()}</span>
                  </div>
                  <div className="border-t border-blue-200 pt-1.5 mt-1.5">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-900">
                        Total
                      </span>
                      <span className="text-xl font-bold text-blue-600">
                        ৳{cartTotal.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link to="/checkout" className="w-full block">
                  <Button
                    className="w-full h-11 text-sm font-semibold bg-blue-600 hover:bg-blue-700 shadow-md hover:shadow-lg transition-all"
                    size="lg"
                  >
                    <Package className="h-4 w-4 mr-2" />
                    Proceed to Checkout
                    <ArrowRight className="h-4 w-4 ml-2" />
                  </Button>
                </Link>
                <div className="pt-2">
                  <Button
                    onClick={clearCart}
                    variant="outline"
                    className="w-full h-9 text-xs border-gray-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-all opacity-60 hover:opacity-100"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                    Clear Cart
                  </Button>
                </div>
              </div>

              {/* Trust Badges */}
              <div className="flex items-center justify-center gap-4 text-xs text-gray-500 pt-1">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                  Secure Checkout
                </div>
              </div>
            </div>
          </SheetFooter>
        </>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center text-center px-6 py-12 bg-gray-50">
          <div className="relative mb-6">
            <div className="bg-blue-100 p-6 rounded-full">
              <ShoppingCart className="h-16 w-16 text-blue-600" />
            </div>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            Your cart is empty
          </h3>
          <p className="text-gray-500 text-sm mb-6 max-w-xs">
            Start adding products to your cart to see them here.
          </p>
          <Button className="bg-blue-600 hover:bg-blue-700 shadow-md" size="lg">
            <ShoppingBag className="h-4 w-4 mr-2" />
            Start Shopping
          </Button>
        </div>
      )}
    </SheetContent>
  );
};
