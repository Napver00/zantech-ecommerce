import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, Banknote, Check, CheckCircle2, ChevronDown, Copy, Loader2, Lock, MapPin, Minus, Package, Plus,
  ShieldCheck, ShoppingBag, Store, Tag, Trash2, Truck, User, X,
} from "lucide-react";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Seo from "../components/Seo";
import AddressForm from "../components/AddressForm";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { config } from "../config";
import { isBdMobile, normalisePhone } from "../lib/phone";
import { taka } from "../lib/orders";

const BKASH_NUMBER = "01627199815";
const PICKUP_ADDRESS = "House 48, Road 9/C, Sector 5, Uttara, Dhaka - 1230";
const GUEST_KEY = "zt-guest-details";

const readGuest = () => {
  try {
    return JSON.parse(localStorage.getItem(GUEST_KEY) || "null") || {};
  } catch {
    return {};
  }
};

const inputCls =
  "h-12 w-full rounded-xl border bg-background px-4 text-white outline-none transition-all placeholder:text-gray-500 focus:border-zan-cyan focus:ring-2 focus:ring-zan-cyan/25";

const Section = ({ step, title, icon: Icon, done, children, aside, innerRef }) => (
  <section ref={innerRef} className="scroll-mt-36 rounded-2xl border border-white/10 bg-card">
    <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4 md:px-6">
      <div className="flex items-center gap-3">
        <span className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold ${done ? "bg-emerald-500 text-[#fff]" : "bg-zan-cyan/10 text-zan-cyan"}`}>
          {done ? <Check className="h-4 w-4" /> : step}
        </span>
        <h2 className="flex items-center gap-2 text-lg font-bold text-white">
          <Icon className="hidden h-5 w-5 text-gray-500 sm:block" /> {title}
        </h2>
      </div>
      {aside}
    </div>
    <div className="p-5 md:p-6">{children}</div>
  </section>
);

const Choice = ({ checked, onSelect, children, name, value }) => (
  <label
    className={`relative flex cursor-pointer gap-3 rounded-xl border-2 p-4 transition-colors ${checked ? "border-zan-cyan bg-zan-cyan/5" : "border-white/10 hover:border-white/25"}`}
  >
    <input type="radio" name={name} value={value} checked={checked} onChange={onSelect} className="sr-only" />
    <span className={`mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2 ${checked ? "border-zan-cyan" : "border-white/25"}`}>
      {checked && <span className="h-2.5 w-2.5 rounded-full bg-zan-cyan" />}
    </span>
    <span className="min-w-0 flex-1">{children}</span>
  </label>
);

const CopyButton = ({ text, label }) => {
  const [copied, setCopied] = useState(false);
  return (
    <button
      type="button"
      onClick={() => navigator.clipboard?.writeText(text).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}
      className="inline-flex items-center gap-1 rounded-lg border border-white/15 bg-card px-2 py-1 text-xs font-semibold text-gray-300 hover:text-white"
      aria-label={`Copy ${label}`}
    >
      {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />} {copied ? "Copied" : "Copy"}
    </button>
  );
};

const Checkout = () => {
  const { cartItems, cartTotal, clearCart, updateQuantity, removeFromCart } = useCart();
  const { user, token, openAuth } = useAuth();

  const [orderInfo, setOrderInfo] = useState(null);
  const [addresses, setAddresses] = useState([]);
  const [addressId, setAddressId] = useState(null);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [addingAddress, setAddingAddress] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);

  const [guest, setGuest] = useState(() => ({ user_name: "", userphone: "", address: "", ...readGuest() }));
  const [shipping, setShipping] = useState(null); // "localPickup" | "insideDhaka" | "outsideDhaka"
  const [shippingTouched, setShippingTouched] = useState(false);
  const [payment, setPayment] = useState("1");
  const [bkash, setBkash] = useState({ paymentphone: "", trxed: "" });

  const [couponOpen, setCouponOpen] = useState(false);
  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState(null);
  const [couponError, setCouponError] = useState("");
  const [couponLoading, setCouponLoading] = useState(false);

  const [errors, setErrors] = useState({});
  const [placing, setPlacing] = useState(false);
  const [orderError, setOrderError] = useState("");
  const [placedOrder, setPlacedOrder] = useState(null);

  const refs = { contact: useRef(null), delivery: useRef(null), payment: useRef(null) };

  // Lift the floating chat button above the phone order bar while it's shown.
  const showBar = !placedOrder && cartItems.length > 0;
  useEffect(() => {
    if (!showBar) return undefined;
    document.body.dataset.bottomBar = "1";
    return () => {
      delete document.body.dataset.bottomBar;
    };
  }, [showBar]);

  useEffect(() => {
    fetch(`${config.baseURL}/documents/order-info`)
      .then((r) => r.json())
      .then((d) => d.success && setOrderInfo(d.data))
      .catch((e) => console.error("Failed to fetch order info:", e));
  }, []);

  useEffect(() => {
    if (!user || !token) {
      setAddresses([]);
      setAddressId(null);
      return;
    }
    setLoadingAddresses(true);
    fetch(`${config.baseURL}/shipping-addresses`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        const list = d.success && Array.isArray(d.data) ? d.data : [];
        setAddresses(list);
        setAddressId(list[0]?.id ?? null);
        setAddingAddress(list.length === 0);
      })
      .catch((e) => console.error("Failed to fetch shipping addresses:", e))
      .finally(() => setLoadingAddresses(false));
  }, [user, token]);

  // Suggest the delivery zone from the address until the customer picks one.
  const selectedAddress = addresses.find((a) => a.id === addressId);
  const addressText = user ? `${selectedAddress?.address || ""} ${selectedAddress?.city || ""}` : guest.address;
  useEffect(() => {
    if (shippingTouched || !addressText.trim()) return;
    setShipping(/dhaka/i.test(addressText) ? "insideDhaka" : "outsideDhaka");
  }, [addressText, shippingTouched]);

  const shippingCharge = !orderInfo || !shipping || shipping === "localPickup"
    ? 0
    : shipping === "insideDhaka" ? Number(orderInfo.insideDhaka) : Number(orderInfo.outsideDhaka);
  const discount = coupon ? Number(coupon.discount) : 0;
  const afterDiscount = cartTotal + shippingCharge - discount;
  const bkashPercent = Number(orderInfo?.bkashChangedParsentage || 0);
  const bkashFee = payment === "2" ? afterDiscount * (bkashPercent / 100) : 0;
  const grandTotal = afterDiscount + bkashFee;
  const itemCount = cartItems.reduce((n, i) => n + i.quantity, 0);

  const contactDone = user ? !!addressId : !!(guest.user_name.trim() && isBdMobile(normalisePhone(guest.userphone)) && guest.address.trim());
  const paymentDone = payment === "1" || (bkash.paymentphone.trim() && bkash.trxed.trim());

  const deliveryOptions = useMemo(() => [
    { id: "insideDhaka", title: "Home delivery inside Dhaka", note: "Usually 2–3 working days", price: orderInfo?.insideDhaka },
    { id: "outsideDhaka", title: "Home delivery outside Dhaka", note: "Usually 3–5 working days by courier", price: orderInfo?.outsideDhaka },
    { id: "localPickup", title: "Pick up from our office", note: PICKUP_ADDRESS, price: 0 },
  ], [orderInfo]);

  const setGuestField = (e) => {
    const { name, value } = e.target;
    setGuest((g) => ({ ...g, [name]: value }));
    setErrors((er) => ({ ...er, [name]: undefined }));
  };

  const saveAddress = async (values) => {
    setSavingAddress(true);
    try {
      const res = await fetch(`${config.baseURL}/shipping-addresses`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ User_id: user.id, ...values }),
      });
      const data = await res.json();
      if (!data.success) return data.message || "Couldn't save this address.";
      const created = data.data?.id ? data.data : null;
      // Reload so we have the saved record with its id.
      const list = await fetch(`${config.baseURL}/shipping-addresses`, { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => (Array.isArray(d.data) ? d.data : []));
      setAddresses(list);
      setAddressId(created?.id ?? list[list.length - 1]?.id ?? null);
      setAddingAddress(false);
      setErrors((er) => ({ ...er, address: undefined }));
      return null;
    } catch {
      return "Couldn't save this address. Please try again.";
    } finally {
      setSavingAddress(false);
    }
  };

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError("");
    try {
      const res = await fetch(`${config.baseURL}/check-coupon`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ coupon_code: couponCode.trim(), total_amount: cartTotal }),
      });
      const data = await res.json();
      if (data.success) setCoupon({ ...data.data, code: couponCode.trim() });
      else {
        setCoupon(null);
        setCouponError(data.message || "That code isn't valid.");
      }
    } catch {
      setCouponError("Couldn't check the code. Please try again.");
    } finally {
      setCouponLoading(false);
    }
  };

  // A coupon was checked against the old total; ask again if the cart changes.
  useEffect(() => {
    if (coupon) {
      setCoupon(null);
      setCouponError("Your cart changed, so please apply the code again.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartTotal]);

  const validate = () => {
    const next = {};
    if (user) {
      if (!addressId) next.address = "Add or choose a delivery address.";
    } else {
      if (!guest.user_name.trim()) next.user_name = "Enter your name.";
      if (!isBdMobile(normalisePhone(guest.userphone))) next.userphone = "Enter an 11-digit mobile number, e.g. 01712345678.";
      if (!guest.address.trim()) next.address = "Enter your full address.";
    }
    if (!shipping) next.shipping = "Choose how you'd like to receive your order.";
    if (payment === "2") {
      if (!isBdMobile(normalisePhone(bkash.paymentphone))) next.paymentphone = "Enter the bKash number you paid from.";
      if (!bkash.trxed.trim()) next.trxed = "Enter the transaction ID from your bKash message.";
    }
    setErrors(next);
    const firstSection = next.user_name || next.userphone || next.address ? "contact" : next.shipping ? "delivery" : next.paymentphone || next.trxed ? "payment" : null;
    if (firstSection) refs[firstSection].current?.scrollIntoView({ behavior: "smooth", block: "start" });
    return !firstSection;
  };

  const placeOrder = async (e) => {
    e.preventDefault();
    setOrderError("");
    if (cartItems.length === 0 || !validate()) return;

    const orderData = {
      product_subtotal: cartTotal,
      total: grandTotal,
      shipping_charge: shippingCharge,
      payment_type: parseInt(payment, 10),
      products: cartItems.map((item) => ({ product_id: item.id, quantity: item.quantity })),
      ...(user
        ? { user_id: user.id, shipping_id: addressId }
        : { user_name: guest.user_name.trim(), userphone: normalisePhone(guest.userphone), address: guest.address.trim() }),
      ...(coupon && { coupon_id: coupon.coupon_id }),
      ...(payment === "2" && { trxed: bkash.trxed.trim(), paymentphone: normalisePhone(bkash.paymentphone) }),
    };

    setPlacing(true);
    try {
      const res = await fetch(`${config.baseURL}/orders/place-order`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json", ...(token && { Authorization: `Bearer ${token}` }) },
        body: JSON.stringify(orderData),
      });
      const data = await res.json().catch(() => ({}));
      if (data.success) {
        if (!user) {
          try {
            localStorage.setItem(GUEST_KEY, JSON.stringify(guest));
          } catch {
            /* not critical */
          }
        }
        setPlacedOrder({
          code: data.data?.invoice_code,
          total: grandTotal,
          payment,
          items: itemCount,
          pickup: shipping === "localPickup",
        });
        clearCart();
        window.scrollTo({ top: 0 });
      } else if (res.status === 429) {
        setOrderError("Too many attempts. Please wait a minute and try again.");
      } else {
        setOrderError(data.message || "We couldn't place your order. Please try again.");
      }
    } catch {
      setOrderError("Connection problem. Check your internet and try again.");
    } finally {
      setPlacing(false);
    }
  };

  /* ── After ordering ── */
  if (placedOrder) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Seo title="Order placed - ZAN Tech Store" url="https://store.zantechbd.com/checkout" />
        <Header />
        <main className="container mx-auto flex flex-grow items-center justify-center px-4 py-12">
          <div className="w-full max-w-lg rounded-3xl border border-white/10 bg-card p-6 text-center shadow-xl md:p-10">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="h-10 w-10" />
            </span>
            <h1 className="mt-5 text-3xl font-black text-white">Thank you! Order placed</h1>
            <p className="mt-2 text-gray-400">We'll call you shortly to confirm, then get it on its way.</p>
            <div className="mt-6 grid grid-cols-2 gap-3 text-left">
              <div className="rounded-xl border border-white/10 bg-background p-4">
                <p className="text-xs text-gray-500">Order number</p>
                <p className="mt-1 font-mono text-lg font-bold text-white">{placedOrder.code || "—"}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-background p-4">
                <p className="text-xs text-gray-500">Total</p>
                <p className="mt-1 text-lg font-bold text-white">{taka(placedOrder.total, 2)}</p>
              </div>
            </div>
            <p className="mt-4 rounded-xl bg-zan-cyan/5 p-3 text-sm text-gray-300">
              {placedOrder.payment === "1"
                ? placedOrder.pickup ? "Pay in cash when you collect your order." : "Pay in cash when your order arrives."
                : "We'll check your bKash payment and confirm it."}
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              {user && placedOrder.code ? (
                <Link to={`/dashboard/orders/${placedOrder.code}`} className="flex h-12 items-center justify-center rounded-xl bg-zan-cyan font-bold text-zan-dark hover:opacity-90">
                  Track this order
                </Link>
              ) : (
                <button type="button" onClick={() => openAuth("register")} className="h-12 rounded-xl bg-zan-cyan font-bold text-zan-dark hover:opacity-90">
                  Create an account
                </button>
              )}
              <Link to="/shop" className="flex h-12 items-center justify-center rounded-xl border border-white/15 font-semibold text-white hover:border-zan-cyan/40">
                Continue shopping
              </Link>
            </div>
            {!user && <p className="mt-4 text-xs text-gray-500">An account lets you track orders and check out faster next time.</p>}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  /* ── Empty cart ── */
  if (cartItems.length === 0) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Seo title="Checkout - ZAN Tech Store" url="https://store.zantechbd.com/checkout" />
        <Header />
        <main className="container mx-auto flex flex-grow items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white/5 text-gray-500">
              <ShoppingBag className="h-9 w-9" />
            </span>
            <h1 className="mt-5 text-2xl font-black text-white">Your cart is empty</h1>
            <p className="mt-2 text-gray-400">Add some parts or a kit, then come back to check out.</p>
            <Link to="/shop" className="mt-6 inline-flex h-12 items-center justify-center rounded-xl bg-zan-cyan px-8 font-bold text-zan-dark hover:opacity-90">
              Browse products
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const errorText = (key) => errors[key] && <p className="mt-1.5 text-sm text-red-500">{errors[key]}</p>;
  const border = (key) => (errors[key] ? "border-red-500/60" : "border-white/10");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo title="Checkout - ZAN Tech Store" url="https://store.zantechbd.com/checkout" />
      <Header />
      <main className="container mx-auto flex-grow px-4 pb-32 pt-6 md:py-10 lg:pb-12">
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-white md:text-4xl">Checkout</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
              <ShieldCheck className="h-4 w-4 text-emerald-500" /> {itemCount} {itemCount === 1 ? "item" : "items"} · No payment needed for cash on delivery
            </p>
          </div>
          <Link to="/shop" className="text-sm font-semibold text-zan-cyan hover:underline">Continue shopping</Link>
        </div>

        <form onSubmit={placeOrder} noValidate className="grid gap-6 lg:grid-cols-[1fr_400px] lg:items-start">
          <div className="min-w-0 space-y-5">
            {/* 1. Contact & address */}
            <Section
              step={1}
              title={user ? "Delivery address" : "Your details"}
              icon={MapPin}
              done={contactDone}
              innerRef={refs.contact}
              aside={!user && (
                <button type="button" onClick={() => openAuth("login")} className="text-sm font-semibold text-zan-cyan hover:underline">
                  Sign in
                </button>
              )}
            >
              {user ? (
                loadingAddresses ? (
                  <div className="flex justify-center py-6"><Loader2 className="h-6 w-6 animate-spin text-zan-cyan" /></div>
                ) : (
                  <div className="space-y-3">
                    {addresses.length > 0 && (
                      <div className="grid gap-3 sm:grid-cols-2">
                        {addresses.map((a) => (
                          <Choice key={a.id} name="address" value={a.id} checked={addressId === a.id} onSelect={() => { setAddressId(a.id); setErrors((er) => ({ ...er, address: undefined })); }}>
                            <span className="block font-semibold text-white">{a.f_name} {a.l_name}</span>
                            <span className="mt-1 block text-sm leading-snug text-gray-400">{a.address}, {a.city} {a.zip}</span>
                            <span className="mt-1 block text-sm font-medium text-gray-300">{a.phone}</span>
                          </Choice>
                        ))}
                      </div>
                    )}
                    {errorText("address")}
                    {addingAddress ? (
                      <div className="rounded-xl border border-white/10 bg-background/60 p-4">
                        <p className="mb-4 font-semibold text-white">{addresses.length ? "New address" : "Where should we deliver?"}</p>
                        <AddressForm
                          idPrefix="checkout-addr"
                          initial={{ f_name: user.name?.split(" ")[0] || "", l_name: user.name?.split(" ").slice(1).join(" ") || "", phone: user.phone || "" }}
                          onSubmit={saveAddress}
                          onCancel={addresses.length ? () => setAddingAddress(false) : undefined}
                          submitting={savingAddress}
                          submitLabel="Save and use this address"
                        />
                      </div>
                    ) : (
                      <button type="button" onClick={() => setAddingAddress(true)} className="inline-flex items-center gap-1.5 text-sm font-semibold text-zan-cyan hover:underline">
                        <Plus className="h-4 w-4" /> Add a new address
                      </button>
                    )}
                  </div>
                )
              ) : (
                <div className="space-y-4">
                  <div className="flex items-start gap-3 rounded-xl bg-zan-cyan/5 p-3 text-sm text-gray-300">
                    <User className="mt-0.5 h-4 w-4 flex-shrink-0 text-zan-cyan" />
                    <span>
                      No account needed. <button type="button" onClick={() => openAuth("login")} className="font-semibold text-zan-cyan hover:underline">Sign in</button> to use saved addresses and track your order.
                    </span>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="user_name" className="mb-1.5 block text-sm font-medium text-gray-200">Full name</label>
                      <input id="user_name" name="user_name" value={guest.user_name} onChange={setGuestField} autoComplete="name" placeholder="Your name" className={`${inputCls} ${border("user_name")}`} />
                      {errorText("user_name")}
                    </div>
                    <div>
                      <label htmlFor="userphone" className="mb-1.5 block text-sm font-medium text-gray-200">Mobile number</label>
                      <input id="userphone" name="userphone" type="tel" inputMode="numeric" value={guest.userphone} onChange={setGuestField} autoComplete="tel" placeholder="01712345678" className={`${inputCls} ${border("userphone")}`} />
                      {errorText("userphone")}
                    </div>
                  </div>
                  <div>
                    <label htmlFor="address" className="mb-1.5 block text-sm font-medium text-gray-200">Full delivery address</label>
                    <textarea
                      id="address"
                      name="address"
                      rows={2}
                      value={guest.address}
                      onChange={setGuestField}
                      autoComplete="street-address"
                      placeholder="House, road, area, city (e.g. House 12, Road 5, Uttara, Dhaka)"
                      className={`${inputCls} h-auto resize-none py-3 ${border("address")}`}
                    />
                    {errorText("address")}
                  </div>
                </div>
              )}
            </Section>

            {/* 2. Delivery */}
            <Section step={2} title="Delivery" icon={Truck} done={!!shipping} innerRef={refs.delivery}>
              <div className="grid gap-3">
                {deliveryOptions.map((o) => (
                  <Choice key={o.id} name="shipping" value={o.id} checked={shipping === o.id} onSelect={() => { setShipping(o.id); setShippingTouched(true); setErrors((er) => ({ ...er, shipping: undefined })); }}>
                    <span className="flex items-start justify-between gap-3">
                      <span>
                        <span className="flex items-center gap-2 font-semibold text-white">
                          {o.id === "localPickup" && <Store className="h-4 w-4 text-gray-400" />} {o.title}
                        </span>
                        <span className="mt-0.5 block text-sm text-gray-400">{o.note}</span>
                      </span>
                      <span className="whitespace-nowrap font-bold text-white">
                        {o.price === 0 ? <span className="text-emerald-500">Free</span> : o.price != null ? taka(o.price) : "…"}
                      </span>
                    </span>
                  </Choice>
                ))}
              </div>
              {errorText("shipping")}
              {shipping && !shippingTouched && <p className="mt-3 text-xs text-gray-500">Picked from your address. Change it if that's not right.</p>}
            </Section>

            {/* 3. Payment */}
            <Section step={3} title="Payment" icon={Banknote} done={!!paymentDone} innerRef={refs.payment}>
              <div className="grid gap-3 sm:grid-cols-2">
                <Choice name="payment" value="1" checked={payment === "1"} onSelect={() => setPayment("1")}>
                  <span className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-white">Cash on delivery</span>
                    <span className="rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-bold text-emerald-500">Popular</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-gray-400">Pay when you receive it</span>
                </Choice>
                <Choice name="payment" value="2" checked={payment === "2"} onSelect={() => setPayment("2")}>
                  <span className="flex items-center gap-2 font-semibold text-white">
                    bKash <img src="/bkashLogo.png" alt="" className="h-4 object-contain" />
                  </span>
                  <span className="mt-0.5 block text-sm text-gray-400">Send money now · {bkashPercent}% fee</span>
                </Choice>
              </div>

              {payment === "2" && (
                <div className="mt-4 rounded-xl border border-pink-500/25 bg-pink-500/5 p-4">
                  <ol className="space-y-3 text-sm text-gray-300">
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-[#fff]">1</span>
                      Send money to <strong className="font-mono text-white">{BKASH_NUMBER}</strong>
                      <CopyButton text={BKASH_NUMBER} label="bKash number" />
                    </li>
                    <li className="flex flex-wrap items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-[#fff]">2</span>
                      Amount <strong className="text-white">{taka(grandTotal, 2)}</strong>
                      <CopyButton text={grandTotal.toFixed(2)} label="amount" />
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-pink-500 text-xs font-bold text-[#fff]">3</span>
                      Enter your number and the TrxID below
                    </li>
                  </ol>
                  <div className="mt-4 grid gap-4 sm:grid-cols-2">
                    <div>
                      <label htmlFor="paymentphone" className="mb-1.5 block text-sm font-medium text-gray-200">Your bKash number</label>
                      <input id="paymentphone" type="tel" inputMode="numeric" value={bkash.paymentphone} onChange={(e) => { setBkash((b) => ({ ...b, paymentphone: e.target.value })); setErrors((er) => ({ ...er, paymentphone: undefined })); }} placeholder="01712345678" className={`${inputCls} ${border("paymentphone")}`} />
                      {errorText("paymentphone")}
                    </div>
                    <div>
                      <label htmlFor="trxed" className="mb-1.5 block text-sm font-medium text-gray-200">Transaction ID (TrxID)</label>
                      <input id="trxed" value={bkash.trxed} onChange={(e) => { setBkash((b) => ({ ...b, trxed: e.target.value.toUpperCase() })); setErrors((er) => ({ ...er, trxed: undefined })); }} placeholder="e.g. 9K7D2XQ1AB" className={`${inputCls} font-mono uppercase placeholder:normal-case placeholder:font-sans ${border("trxed")}`} />
                      {errorText("trxed")}
                    </div>
                  </div>
                </div>
              )}
            </Section>
          </div>

          {/* Summary */}
          <aside className="lg:sticky lg:top-36">
            <div className="rounded-2xl border border-white/10 bg-card">
              <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                <h2 className="text-lg font-bold text-white">Order summary</h2>
                <span className="text-sm text-gray-400">{itemCount} {itemCount === 1 ? "item" : "items"}</span>
              </div>
              <ul className="scroll-strip max-h-72 divide-y divide-white/10 overflow-y-auto px-5">
                {cartItems.map((item) => {
                  const unit = item.discountedPrice || item.price;
                  return (
                    <li key={item.id} className="flex gap-3 py-3">
                      <img src={item.image} alt="" loading="lazy" className="product-tile h-14 w-14 flex-shrink-0 rounded-lg border border-white/10 object-contain p-1" />
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-2 text-sm font-medium leading-snug text-white">{item.name}</p>
                        <div className="mt-1.5 flex items-center justify-between gap-2">
                          <div className="flex items-center rounded-lg border border-white/10">
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Decrease" className="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-white">
                              {item.quantity === 1 ? <Trash2 className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                            </button>
                            <span className="w-7 text-center text-sm font-semibold text-white">{item.quantity}</span>
                            <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Increase" className="flex h-7 w-7 items-center justify-center text-gray-400 hover:text-white">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-bold text-white">{taka(unit * item.quantity)}</span>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFromCart(item.id)} aria-label={`Remove ${item.name}`} className="self-start p-1 text-gray-500 hover:text-red-500">
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  );
                })}
              </ul>

              <div className="border-t border-white/10 px-5 py-4">
                {coupon ? (
                  <div className="flex items-center justify-between rounded-xl bg-emerald-500/10 px-3 py-2.5 text-sm">
                    <span className="flex items-center gap-2 font-semibold text-emerald-500"><Tag className="h-4 w-4" /> {coupon.code} applied</span>
                    <button type="button" onClick={() => { setCoupon(null); setCouponCode(""); }} className="text-xs font-semibold text-gray-400 hover:text-white">Remove</button>
                  </div>
                ) : (
                  <>
                    <button type="button" onClick={() => setCouponOpen((o) => !o)} className="flex w-full items-center justify-between text-sm font-semibold text-gray-300 hover:text-white">
                      <span className="flex items-center gap-2"><Tag className="h-4 w-4" /> Have a coupon code?</span>
                      <ChevronDown className={`h-4 w-4 transition-transform ${couponOpen ? "rotate-180" : ""}`} />
                    </button>
                    {couponOpen && (
                      <div className="mt-3 flex gap-2">
                        <input
                          value={couponCode}
                          onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponError(""); }}
                          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); applyCoupon(); } }}
                          placeholder="CODE"
                          className="h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-background px-3 font-mono uppercase text-white outline-none focus:border-zan-cyan"
                          aria-label="Coupon code"
                        />
                        <button type="button" onClick={applyCoupon} disabled={couponLoading || !couponCode.trim()} className="h-11 rounded-xl border border-zan-cyan/40 px-4 text-sm font-bold text-zan-cyan hover:bg-zan-cyan/10 disabled:opacity-50">
                          {couponLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Apply"}
                        </button>
                      </div>
                    )}
                  </>
                )}
                {couponError && <p className="mt-2 flex items-center gap-1.5 text-xs text-red-500"><AlertCircle className="h-3.5 w-3.5" /> {couponError}</p>}
              </div>

              <dl className="space-y-2 border-t border-white/10 px-5 py-4 text-sm">
                <div className="flex justify-between text-gray-300"><dt>Subtotal</dt><dd className="font-medium text-white">{taka(cartTotal)}</dd></div>
                <div className="flex justify-between text-gray-300">
                  <dt>Delivery</dt>
                  <dd className="font-medium text-white">{!shipping ? <span className="text-gray-500">Choose above</span> : shippingCharge === 0 ? "Free" : taka(shippingCharge)}</dd>
                </div>
                {discount > 0 && <div className="flex justify-between text-emerald-500"><dt>Discount</dt><dd className="font-medium">− {taka(discount)}</dd></div>}
                {bkashFee > 0 && <div className="flex justify-between text-gray-300"><dt>bKash fee ({bkashPercent}%)</dt><dd className="font-medium text-white">{taka(bkashFee, 2)}</dd></div>}
                <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                  <dt className="font-bold text-white">Total</dt>
                  <dd className="text-2xl font-black text-white">{taka(grandTotal, 2)}</dd>
                </div>
              </dl>

              <div className="hidden px-5 pb-5 lg:block">
                {orderError && (
                  <p className="mb-3 flex items-start gap-2 rounded-xl border border-red-500/25 bg-red-500/10 p-3 text-sm text-red-500" role="alert">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /> {orderError}
                  </p>
                )}
                <button type="submit" disabled={placing} className="flex h-13 w-full items-center justify-center gap-2 rounded-xl bg-zan-cyan py-3.5 text-base font-bold text-zan-dark transition-opacity hover:opacity-90 disabled:opacity-60">
                  {placing ? <><Loader2 className="h-5 w-5 animate-spin" /> Placing order…</> : <><Lock className="h-4 w-4" /> Place order · {taka(grandTotal)}</>}
                </button>
                <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-500">
                  <Package className="h-3.5 w-3.5" /> By ordering you agree to our <Link to="/terms" className="text-zan-cyan hover:underline">Terms</Link> & <Link to="/return-policy" className="text-zan-cyan hover:underline">Returns</Link>
                </p>
              </div>
            </div>
          </aside>

          {/* Phone: total and button always in reach */}
          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-card/95 px-4 py-3 shadow-[0_-8px_24px_rgba(0,0,0,0.15)] backdrop-blur lg:hidden">
            {orderError && <p className="mb-2 text-sm text-red-500" role="alert">{orderError}</p>}
            <div className="flex items-center gap-3">
              <div className="min-w-0">
                <p className="text-xs text-gray-400">Total</p>
                <p className="text-lg font-black leading-tight text-white">{taka(grandTotal, 2)}</p>
              </div>
              <button type="submit" disabled={placing} className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-zan-cyan font-bold text-zan-dark disabled:opacity-60">
                {placing ? <><Loader2 className="h-5 w-5 animate-spin" /> Placing…</> : <><Lock className="h-4 w-4" /> Place order</>}
              </button>
            </div>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Checkout;
