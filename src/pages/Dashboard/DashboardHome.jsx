import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Heart, MapPin, Package, ShoppingBag, Sparkles } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { config } from "../../config";
import { Skeleton } from "../../components/ui/skeleton";
import WhatsAppIcon from "../../components/WhatsAppIcon";
import StatusPill from "../../components/StatusPill";
import { formatDate, taka } from "../../lib/orders";

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
};

const DashboardHome = () => {
  const { user, token, userInfo } = useAuth();
  const [orders, setOrders] = useState(null);

  useEffect(() => {
    if (!token) return;
    fetch(`${config.baseURL}/orders/users?limit=3&page=1`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => setOrders(d.success && Array.isArray(d.data) ? d.data : []))
      .catch(() => setOrders([]));
  }, [token]);

  const firstName = user?.name?.split(" ")[0] || "there";
  const stats = [
    { to: "/dashboard/orders", icon: Package, label: "Orders", value: userInfo?.total_orders },
    { to: "/dashboard/wishlist", icon: Heart, label: "Wishlist", value: userInfo?.total_wishlist },
    { to: "/dashboard/addresses", icon: MapPin, label: "Addresses", value: userInfo?.total_shipping_addr },
  ];
  const noAddress = userInfo && Number(userInfo.total_shipping_addr) === 0;

  return (
    <div className="space-y-6">
      {/* Greeting */}
      <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-surface-2 p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-zan-cyan/15 blur-3xl" />
        <div className="relative">
          <p className="text-sm font-medium text-gray-400">{greeting()},</p>
          <h1 className="mt-1 text-3xl font-black tracking-tight text-white md:text-4xl">{firstName} 👋</h1>
          <p className="mt-2 max-w-lg text-gray-400">Track your orders, manage delivery addresses and pick up where you left off.</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link to="/shop" className="inline-flex h-11 items-center gap-2 rounded-xl bg-zan-cyan px-5 text-sm font-bold text-zan-dark hover:opacity-90">
              <ShoppingBag className="h-4 w-4" /> Shop now
            </Link>
            <Link to="/dashboard/orders" className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 bg-card px-5 text-sm font-semibold text-white hover:border-zan-cyan/40">
              <Package className="h-4 w-4" /> My orders
            </Link>
          </div>
        </div>
      </section>

      {/* Counts */}
      <section className="grid grid-cols-3 gap-3 md:gap-4">
        {stats.map(({ to, icon: Icon, label, value }) => (
          <Link key={label} to={to} className="group rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-zan-cyan/40 md:p-5">
            <Icon className="h-5 w-5 text-zan-cyan" />
            {userInfo || orders !== null ? (
              <p className="mt-3 text-2xl font-black text-white md:text-3xl">{userInfo ? value ?? 0 : "—"}</p>
            ) : (
              <Skeleton className="mt-3 h-8 w-10" />
            )}
            <p className="mt-0.5 flex items-center justify-between text-xs font-medium text-gray-400 md:text-sm">
              {label} <ChevronRight className="hidden h-4 w-4 transition-transform group-hover:translate-x-0.5 sm:block" />
            </p>
          </Link>
        ))}
      </section>

      {noAddress && (
        <Link to="/dashboard/addresses" className="flex items-center gap-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 hover:border-amber-500/50">
          <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-amber-500/15 text-amber-500"><MapPin className="h-5 w-5" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-bold text-white">Add a delivery address</span>
            <span className="block text-sm text-gray-400">Save it once and checkout takes seconds.</span>
          </span>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-amber-500" />
        </Link>
      )}

      {/* Recent orders */}
      <section className="rounded-2xl border border-white/10 bg-card">
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
          <h2 className="text-lg font-bold text-white">Recent orders</h2>
          <Link to="/dashboard/orders" className="text-sm font-semibold text-zan-cyan hover:underline">View all</Link>
        </div>
        {orders === null ? (
          <div className="space-y-3 p-5">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-xl" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <Sparkles className="mx-auto h-8 w-8 text-gray-500" />
            <p className="mt-3 font-semibold text-white">No orders yet</p>
            <p className="mt-1 text-sm text-gray-400">Your orders will show up here.</p>
            <Link to="/shop" className="mt-4 inline-flex h-10 items-center rounded-xl bg-zan-cyan px-5 text-sm font-bold text-zan-dark hover:opacity-90">
              Start shopping
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-white/10">
            {orders.map((o) => (
              <li key={o.order_id}>
                <Link to={`/dashboard/orders/${o.invoice_code}`} className="flex items-center gap-4 px-5 py-4 transition-colors hover:bg-white/[0.03]">
                  <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-400"><Package className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-mono font-bold text-white">{o.invoice_code}</span>
                    <span className="block text-sm text-gray-400">{formatDate(o.order_placed_date)} · {o.totalProduct} {Number(o.totalProduct) === 1 ? "item" : "items"}</span>
                  </span>
                  <span className="hidden text-right sm:block">
                    <span className="block font-bold text-white">{taka(o.total_amount)}</span>
                  </span>
                  <StatusPill status={o.status} />
                  <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-500" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Help */}
      <section className="flex flex-col items-start gap-4 rounded-2xl border border-white/10 bg-card p-5 sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl bg-[#25D366]/15 text-[#25D366]"><WhatsAppIcon className="h-5 w-5" /></span>
        <span className="flex-1">
          <span className="block font-bold text-white">Question about an order?</span>
          <span className="block text-sm text-gray-400">Send us your order number on WhatsApp and we'll help right away.</span>
        </span>
        <a href="https://wa.me/8801894634149" target="_blank" rel="noreferrer" className="inline-flex h-10 items-center rounded-xl border border-white/15 px-4 text-sm font-semibold text-white hover:border-[#25D366]/50">
          Chat with us
        </a>
      </section>
    </div>
  );
};

export default DashboardHome;
