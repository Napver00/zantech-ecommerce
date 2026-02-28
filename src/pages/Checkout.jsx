import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { config } from "../config";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group";
import { Alert, AlertDescription } from "../components/ui/alert";
import {
  Loader2,
  User,
  AlertCircle,
  CheckCircle,
  MapPin,
  CreditCard,
  Truck,
  Tag,
  Shield,
  Lock,
} from "lucide-react";

const Checkout = () => {
  const { cartItems, cartTotal, clearCart } = useCart();
  const { user, token, setIsAuthSheetOpen } = useAuth();
  const navigate = useNavigate();

  const [orderInfo, setOrderInfo] = useState(null);
  const [shippingAddresses, setShippingAddresses] = useState([]);
  const [selectedAddressId, setSelectedAddressId] = useState(null);
  const [isLoadingAddresses, setIsLoadingAddresses] = useState(false);
  const [shippingOption, setShippingOption] = useState("localPickup");
  const [paymentMethod, setPaymentMethod] = useState("1");
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [isCouponLoading, setIsCouponLoading] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [isGuestCheckout, setIsGuestCheckout] = useState(false);

  const [formData, setFormData] = useState({
    user_name: "",
    userphone: "",
    address: "",
    trxed: "",
    paymentphone: "",
  });

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        user_name: user.name,
        userphone: user.phone,
        address: user.address || "",
      }));
      fetchShippingAddresses();
    } else {
      setIsGuestCheckout(false);
      setShippingAddresses([]);
      setSelectedAddressId(null);
    }
  }, [user]);

  const fetchShippingAddresses = async () => {
    setIsLoadingAddresses(true);
    try {
      const response = await fetch(`${config.baseURL}/shipping-addresses`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success && data.data) {
        setShippingAddresses(data.data);
        // Auto-select first address if available
        if (data.data.length > 0) {
          setSelectedAddressId(data.data[0].id);
        }
      }
    } catch (error) {
      console.error("Failed to fetch shipping addresses:", error);
    } finally {
      setIsLoadingAddresses(false);
    }
  };

  useEffect(() => {
    const fetchOrderInfo = async () => {
      try {
        const res = await fetch(`${config.baseURL}/documents/order-info`);
        const data = await res.json();
        if (data.success) setOrderInfo(data.data);
      } catch (error) {
        console.error("Failed to fetch order info:", error);
      }
    };
    fetchOrderInfo();
  }, []);

  const shippingCharge = orderInfo
    ? shippingOption === "localPickup"
      ? 0
      : shippingOption === "insideDhaka"
        ? orderInfo.insideDhaka
        : orderInfo.outsideDhaka
    : 0;
  const discountAmount = coupon ? coupon.discount : 0;
  const subtotalAfterDiscount = cartTotal + shippingCharge - discountAmount;
  const bkashChargePercentage = orderInfo?.bkashChangedParsentage || 0;
  const bkashCharge =
    paymentMethod === "2"
      ? subtotalAfterDiscount * (bkashChargePercentage / 100)
      : 0;
  const grandTotal = subtotalAfterDiscount + bkashCharge;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) return;
    setIsCouponLoading(true);
    setCouponError("");
    try {
      const response = await fetch(`${config.baseURL}/check-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          coupon_code: couponCode,
          total_amount: cartTotal,
        }),
      });
      const data = await response.json();
      if (data.success) {
        setCoupon(data.data);
      } else {
        setCouponError(data.message || "Invalid coupon code.");
        setCoupon(null);
      }
    } catch (error) {
      setCouponError("Failed to apply coupon.");
    } finally {
      setIsCouponLoading(false);
    }
  };

  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    setOrderError("");

    // Validate cart
    if (cartItems.length === 0) {
      setOrderError("Your cart is empty.");
      return;
    }

    // Validate guest checkout
    if (!user && !isGuestCheckout) {
      setOrderError("Please sign in or continue as guest to place order.");
      return;
    }

    // Validate guest information
    if (!user && isGuestCheckout) {
      if (!formData.user_name?.trim()) {
        setOrderError("Please enter your full name.");
        return;
      }
      if (!formData.userphone?.trim()) {
        setOrderError("Please enter your phone number.");
        return;
      }
      if (!formData.address?.trim()) {
        setOrderError("Please enter your full address.");
        return;
      }
    }

    // Validate logged-in user information
    if (user) {
      if (!user.id) {
        setOrderError(
          "User information is missing. Please try logging in again.",
        );
        return;
      }
      if (shippingAddresses.length === 0) {
        setOrderError(
          "Please add a shipping address in your dashboard before placing an order.",
        );
        return;
      }
      if (!selectedAddressId) {
        setOrderError("Please select a shipping address.");
        return;
      }
    }

    // Validate bKash payment fields
    if (paymentMethod === "2") {
      if (!formData.paymentphone?.trim()) {
        setOrderError("Please enter your bKash number.");
        return;
      }
      if (!formData.trxed?.trim()) {
        setOrderError("Please enter your transaction ID.");
        return;
      }
    }

    setIsPlacingOrder(true);

    const orderData = {
      product_subtotal: cartTotal,
      total: grandTotal,
      shipping_charge: shippingCharge,
      payment_type: parseInt(paymentMethod),
      products: cartItems.map((item) => ({
        product_id: item.id,
        quantity: item.quantity,
      })),
      ...(user && { user_id: user.id, shipping_id: selectedAddressId }),
      ...(!user &&
        isGuestCheckout && {
          user_name: formData.user_name.trim(),
          userphone: formData.userphone.trim(),
          address: formData.address.trim(),
        }),
      ...(coupon && { coupon_id: coupon.coupon_id }),
      ...(paymentMethod === "2" && {
        trxed: formData.trxed.trim(),
        paymentphone: formData.paymentphone.trim(),
      }),
    };

    try {
      const response = await fetch(`${config.baseURL}/orders/place-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(orderData),
      });
      const data = await response.json();
      if (data.success) {
        setOrderSuccess(true);
        clearCart();
        setTimeout(() => navigate("/"), 5000);
      } else {
        setOrderError(
          data.message || "Failed to place order. Please try again.",
        );
      }
    } catch (error) {
      setOrderError(
        "An unexpected error occurred. Please check your connection and try again.",
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (orderSuccess) {
    return (
      <div className="flex flex-col min-h-screen bg-gray-50">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-16 flex items-center justify-center">
          <div className="text-center bg-white p-12 rounded-xl shadow-lg max-w-lg w-full border border-gray-200">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-3">
              Order Placed!
            </h1>
            <p className="text-gray-600 mb-6">
              Thank you for your purchase. We'll process your order shortly.
            </p>
            <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-5">
              <p className="text-sm text-green-800">
                Redirecting to homepage in 5 seconds...
              </p>
            </div>
            <Button
              onClick={() => navigate("/")}
              size="lg"
              className="bg-blue-600 hover:bg-blue-700"
            >
              Continue Shopping
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        {/* Header */}
        <div className="max-w-7xl mx-auto mb-8">
          <div className="text-center mb-6">
            <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
              Checkout
            </h1>
            <p className="text-sm text-gray-600 flex items-center justify-center gap-2">
              <Shield className="h-4 w-4 text-green-600" />
              Secure checkout process
            </p>
          </div>
        </div>

        <form
          onSubmit={handlePlaceOrder}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto"
        >
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="border-b border-gray-200 p-5">
                <div className="flex items-center gap-3">
                  <MapPin className="h-5 w-5 text-blue-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Shipping Information
                  </h2>
                </div>
              </div>
              <div className="p-8">
                {user ? (
                  <div className="space-y-4">
                    {isLoadingAddresses ? (
                      <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                      </div>
                    ) : shippingAddresses.length > 0 ? (
                      <>
                        <div className="mb-4">
                          <p className="text-sm font-medium text-gray-900">
                            Select Shipping Address *
                          </p>
                          <p className="text-xs text-gray-600 mt-1">
                            Choose where you want your order delivered
                          </p>
                        </div>

                        <div className="grid grid-cols-1 gap-3">
                          {shippingAddresses.map((addr) => (
                            <label
                              key={addr.id}
                              htmlFor={`addr-${addr.id}`}
                              className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition ${
                                selectedAddressId === addr.id
                                  ? "border-blue-600 bg-blue-50"
                                  : "border-gray-200 hover:border-blue-300"
                              }`}
                            >
                              <input
                                type="radio"
                                id={`addr-${addr.id}`}
                                name="shipping-address"
                                value={addr.id}
                                checked={selectedAddressId === addr.id}
                                onChange={() => setSelectedAddressId(addr.id)}
                                className="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500"
                              />
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-gray-900 mb-1">
                                  {addr.f_name} {addr.l_name}
                                </div>
                                <div className="text-sm text-gray-600">
                                  <p>
                                    {addr.address}, {addr.city} - {addr.zip}
                                  </p>
                                  <p className="mt-1 font-medium text-gray-900">
                                    {addr.phone}
                                  </p>
                                </div>
                              </div>
                            </label>
                          ))}
                        </div>

                        <Link
                          to="/dashboard/addresses"
                          className="inline-flex items-center gap-1 text-sm text-blue-600 font-medium hover:text-blue-700 mt-2"
                        >
                          Manage Addresses →
                        </Link>
                      </>
                    ) : (
                      <div className="text-center py-8 bg-orange-50 rounded-lg border-2 border-orange-200">
                        <AlertCircle className="h-12 w-12 text-orange-600 mx-auto mb-3" />
                        <h3 className="text-base font-medium text-gray-900 mb-2">
                          No Shipping Address Found
                        </h3>
                        <p className="text-sm text-gray-600 mb-4">
                          Please add a shipping address to place your order
                        </p>
                        <Link to="/dashboard/addresses">
                          <Button className="bg-blue-600 hover:bg-blue-700">
                            <MapPin className="h-4 w-4 mr-2" />
                            Add Shipping Address
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                ) : (
                  <div>
                    {!isGuestCheckout ? (
                      <div className="text-center space-y-5 py-6">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                          <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                            <User className="h-8 w-8 text-white" />
                          </div>
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            Sign in for faster checkout
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Access saved addresses and track orders
                          </p>
                          <Button
                            type="button"
                            onClick={() => setIsAuthSheetOpen(true)}
                            size="lg"
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            <User className="mr-2 h-4 w-4" />
                            Sign In
                          </Button>
                        </div>

                        <div className="relative">
                          <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300"></div>
                          </div>
                          <div className="relative flex justify-center">
                            <span className="px-4 bg-white text-sm text-gray-500">
                              or
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsGuestCheckout(true)}
                          className="text-sm text-gray-600 hover:text-blue-600 font-medium underline"
                        >
                          Continue as Guest
                        </button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="flex items-center justify-between pb-3 border-b">
                          <p className="font-medium text-gray-900">
                            Guest Checkout
                          </p>
                          <button
                            type="button"
                            onClick={() => setIsGuestCheckout(false)}
                            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                          >
                            ← Sign In
                          </button>
                        </div>
                        <div className="space-y-4">
                          <div>
                            <Label
                              htmlFor="user_name"
                              className="text-gray-700 font-medium"
                            >
                              Full Name <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="user_name"
                              name="user_name"
                              value={formData.user_name}
                              onChange={handleInputChange}
                              placeholder="Enter your full name"
                              className="mt-1.5 h-11"
                              required={isGuestCheckout}
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="userphone"
                              className="text-gray-700 font-medium"
                            >
                              Phone Number{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="userphone"
                              name="userphone"
                              value={formData.userphone}
                              onChange={handleInputChange}
                              placeholder="e.g., 01712345678"
                              className="mt-1.5 h-11"
                              required={isGuestCheckout}
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor="address"
                              className="text-gray-700 font-medium"
                            >
                              Full Address{" "}
                              <span className="text-red-500">*</span>
                            </Label>
                            <Input
                              id="address"
                              name="address"
                              value={formData.address}
                              onChange={handleInputChange}
                              placeholder="House, Road, Area, City"
                              className="mt-1.5 h-11"
                              required={isGuestCheckout}
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method Card */}
            <div className="bg-white rounded-xl shadow-md border border-gray-200">
              <div className="border-b border-gray-200 p-5">
                <div className="flex items-center gap-3">
                  <CreditCard className="h-5 w-5 text-purple-600" />
                  <h2 className="text-xl font-semibold text-gray-900">
                    Payment Method
                  </h2>
                </div>
              </div>
              <div className="p-6">
                <RadioGroup
                  value={paymentMethod}
                  onValueChange={setPaymentMethod}
                  className="space-y-3"
                >
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "1"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="1" id="cash" />
                      <Label
                        htmlFor="cash"
                        className="flex-1 cursor-pointer font-medium text-gray-900"
                      >
                        Cash on Delivery
                      </Label>
                      <div className="px-2.5 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                        Popular
                      </div>
                    </div>
                  </div>
                  <div
                    className={`p-4 border-2 rounded-lg cursor-pointer transition ${
                      paymentMethod === "2"
                        ? "border-blue-600 bg-blue-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start space-x-3">
                      <RadioGroupItem value="2" id="bkash" className="mt-1" />
                      <div className="flex-1">
                        <Label
                          htmlFor="bkash"
                          className="cursor-pointer font-medium text-gray-900 flex items-center gap-2"
                        >
                          bKash Payment
                          <img
                            src="/bkashLogo.png"
                            alt="bKash"
                            className="h-4 object-contain"
                          />
                        </Label>
                        <p className="text-xs text-orange-600 mt-1">
                          + {bkashChargePercentage}% fee
                        </p>
                      </div>
                    </div>
                  </div>
                </RadioGroup>

                {paymentMethod === "2" && (
                  <div className="mt-5 p-4 bg-orange-50 rounded-lg space-y-4 border border-orange-200">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          Payment Instructions
                        </p>
                        <p className="text-xs text-gray-600 mt-1">
                          Send money to <strong>01627199815</strong> and enter
                          details below
                        </p>
                      </div>
                    </div>
                    <div>
                      <Label
                        htmlFor="paymentphone"
                        className="text-sm font-medium text-gray-700"
                      >
                        Your bKash Number
                      </Label>
                      <Input
                        id="paymentphone"
                        name="paymentphone"
                        value={formData.paymentphone}
                        onChange={handleInputChange}
                        placeholder="01712345678"
                        className="mt-1.5 h-11"
                        required
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="trxed"
                        className="text-sm font-medium text-gray-700"
                      >
                        Transaction ID (TrxID)
                      </Label>
                      <Input
                        id="trxed"
                        name="trxed"
                        value={formData.trxed}
                        onChange={handleInputChange}
                        placeholder="Enter your TrxID"
                        className="mt-1.5 h-11"
                        required
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-md border border-gray-200 sticky top-24">
              <div className="border-b border-gray-200 p-5">
                <h2 className="text-xl font-semibold text-gray-900">
                  Order Summary
                </h2>
              </div>

              <div className="p-5 space-y-5">
                {/* Cart Items */}
                <div className="space-y-3 max-h-56 overflow-y-auto">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex justify-between items-start gap-3 text-sm"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Qty: {item.quantity}
                        </p>
                      </div>
                      <p className="font-semibold text-gray-900">
                        ৳{(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Coupon Section */}
                <div className="pt-4 border-t">
                  <Label
                    htmlFor="coupon"
                    className="text-sm font-medium text-gray-700 flex items-center gap-2"
                  >
                    <Tag className="h-4 w-4" />
                    Coupon Code
                  </Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      id="coupon"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value)}
                      placeholder="Enter code"
                      className="h-10"
                    />
                    <Button
                      type="button"
                      onClick={handleApplyCoupon}
                      disabled={isCouponLoading}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isCouponLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        "Apply"
                      )}
                    </Button>
                  </div>
                  {couponError && (
                    <p className="text-red-600 text-xs mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {couponError}
                    </p>
                  )}
                  {coupon && (
                    <p className="text-green-600 text-xs mt-1.5 flex items-center gap-1">
                      <CheckCircle className="h-3 w-3" />
                      Coupon applied!
                    </p>
                  )}
                </div>

                {/* Shipping Options */}
                <div className="pt-4 border-t">
                  <div className="flex items-center gap-2 mb-3">
                    <Truck className="h-4 w-4 text-gray-600" />
                    <h3 className="text-sm font-medium text-gray-700">
                      Shipping
                    </h3>
                  </div>
                  <RadioGroup
                    value={shippingOption}
                    onValueChange={setShippingOption}
                    className="space-y-2"
                  >
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                        shippingOption === "localPickup"
                          ? "border-green-600 bg-green-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <RadioGroupItem
                          value="localPickup"
                          id="localPickup"
                          className="mt-0.5"
                        />
                        <div className="flex-1">
                          <Label
                            htmlFor="localPickup"
                            className="font-medium cursor-pointer text-gray-900 text-sm flex items-center gap-2"
                          >
                            Local Pickup
                            <span className="px-1.5 py-0.5 bg-green-600 text-white text-xs font-semibold rounded">
                              FREE
                            </span>
                          </Label>
                          <p className="text-xs text-gray-600 mt-1">
                            House 48, Road 9/C, Sector 5, Uttara, Dhaka - 1230,
                            Bangladesh
                          </p>
                        </div>
                      </div>
                    </div>
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                        shippingOption === "insideDhaka"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <RadioGroupItem
                            value="insideDhaka"
                            id="insideDhaka"
                          />
                          <Label
                            htmlFor="insideDhaka"
                            className="cursor-pointer font-medium text-gray-900 text-sm truncate"
                          >
                            Inside Dhaka
                          </Label>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                          ৳{orderInfo?.insideDhaka || "..."}
                        </span>
                      </div>
                    </div>
                    <div
                      className={`p-3 border-2 rounded-lg cursor-pointer transition ${
                        shippingOption === "outsideDhaka"
                          ? "border-blue-600 bg-blue-50"
                          : "border-gray-200"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <RadioGroupItem
                            value="outsideDhaka"
                            id="outsideDhaka"
                          />
                          <Label
                            htmlFor="outsideDhaka"
                            className="cursor-pointer font-medium text-gray-900 text-sm truncate"
                          >
                            Outside Dhaka
                          </Label>
                        </div>
                        <span className="font-semibold text-gray-900 text-sm whitespace-nowrap">
                          ৳{orderInfo?.outsideDhaka || "..."}
                        </span>
                      </div>
                    </div>
                  </RadioGroup>
                </div>

                {/* Price Breakdown */}
                <div className="space-y-2 pt-4 border-t text-sm">
                  <div className="flex justify-between text-gray-700">
                    <span>Subtotal</span>
                    <span className="font-medium">
                      ৳{cartTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-700">
                    <span>Shipping</span>
                    <span className="font-medium">
                      {shippingCharge === 0
                        ? "FREE"
                        : `৳${shippingCharge.toLocaleString()}`}
                    </span>
                  </div>
                  {coupon && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount</span>
                      <span className="font-medium">
                        - ৳{discountAmount.toLocaleString()}
                      </span>
                    </div>
                  )}
                  {paymentMethod === "2" && bkashCharge > 0 && (
                    <div className="flex justify-between text-orange-600">
                      <span>bKash Fee ({bkashChargePercentage}%)</span>
                      <span className="font-medium">
                        ৳{bkashCharge.toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>

                {/* Grand Total */}
                <div className="pt-3 border-t-2">
                  <div className="flex justify-between items-center">
                    <span className="text-lg font-bold text-gray-900">
                      Total
                    </span>
                    <span className="text-2xl font-bold text-blue-600">
                      ৳
                      {grandTotal.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                  </div>
                </div>

                {/* Error Alert */}
                {orderError && (
                  <Alert
                    variant="destructive"
                    className="border-red-400 bg-red-50"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm font-medium">
                      {orderError}
                    </AlertDescription>
                  </Alert>
                )}

                {/* Place Order Button */}
                <Button
                  type="submit"
                  size="lg"
                  className="w-full h-12 font-semibold bg-blue-600 hover:bg-blue-700"
                  disabled={isPlacingOrder || cartItems.length === 0}
                >
                  {isPlacingOrder ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 mr-2" />
                      Place Order
                    </>
                  )}
                </Button>

                {/* Trust Badge */}
                <div className="text-center">
                  <p className="text-xs text-gray-500 flex items-center justify-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-green-600" />
                    Secure checkout
                  </p>
                </div>
              </div>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
