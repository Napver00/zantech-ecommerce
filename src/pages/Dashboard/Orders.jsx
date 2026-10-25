import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AlertTriangle, ChevronLeft, ChevronRight, Package, RefreshCw, ShoppingBag } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { config } from "../../config";
import { Skeleton } from "../../components/ui/skeleton";
import StatusPill from "../../components/StatusPill";
import { formatDate, statusOf, taka } from "../../lib/orders";

const PER_PAGE = 8;

const Orders = () => {
  const { token } = useAuth();
  const [orders, setOrders] = useState([]);
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, total: 0 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${config.baseURL}/orders/users?limit=${PER_PAGE}&page=${page}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("Couldn't load your orders."))))
      .then((d) => {
        if (cancelled) return;
        if (!d.success) throw new Error(d.message || "Couldn't load your orders.");
        setOrders(Array.isArray(d.data) ? d.data : []);
        if (d.pagination) setPagination(d.pagination);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [token, page, reload]);

  const goTo = (p) => {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">My orders</h1>
          <p className="mt-1 text-sm text-gray-400">
            {pagination.total ? `${pagination.total} ${pagination.total === 1 ? "order" : "orders"} in total` : "Everything you've ordered from us."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 w-full rounded-2xl" />)}
        </div>
      ) : error ? (
        <div className="rounded-2xl border border-white/10 bg-card p-10 text-center">
          <AlertTriangle className="mx-auto h-9 w-9 text-red-500" />
          <p className="mt-3 font-semibold text-white">{error}</p>
          <button type="button" onClick={() => setReload((n) => n + 1)} className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white hover:border-zan-cyan/40">
            <RefreshCw className="h-4 w-4" /> Try again
          </button>
        </div>
      ) : orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-white/15 bg-card p-12 text-center">
          <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-gray-500"><ShoppingBag className="h-8 w-8" /></span>
          <p className="mt-4 text-lg font-bold text-white">No orders yet</p>
          <p className="mt-1 text-gray-400">When you place an order, you can follow it here.</p>
          <Link to="/shop" className="mt-5 inline-flex h-11 items-center rounded-xl bg-zan-cyan px-6 font-bold text-zan-dark hover:opacity-90">Browse products</Link>
        </div>
      ) : (
        <>
          <ul className="space-y-3">
            {orders.map((o) => (
              <li key={o.order_id}>
                <Link
                  to={`/dashboard/orders/${o.invoice_code}`}
                  className="group flex flex-wrap items-center gap-x-4 gap-y-3 rounded-2xl border border-white/10 bg-card p-4 transition-colors hover:border-zan-cyan/40 md:p-5"
                >
                  <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-400"><Package className="h-5 w-5" /></span>
                  <span className="min-w-0 flex-1">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-base font-bold text-white">{o.invoice_code}</span>
                      <StatusPill status={o.status} />
                    </span>
                    <span className="mt-1 block text-sm text-gray-400">
                      {formatDate(o.order_placed_date)} · {o.totalProduct} {Number(o.totalProduct) === 1 ? "item" : "items"}
                    </span>
                    <span className="mt-0.5 block text-xs text-gray-500">{statusOf(o.status).hint}</span>
                  </span>
                  <span className="flex items-center gap-3 sm:ml-auto">
                    <span className="text-lg font-black text-white">{taka(o.total_amount)}</span>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-zan-cyan">
                      Details <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          {pagination.last_page > 1 && (
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={() => goTo(page - 1)}
                disabled={page <= 1}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                <ChevronLeft className="h-4 w-4" /> Newer
              </button>
              <span className="text-sm text-gray-400">Page {pagination.current_page} of {pagination.last_page}</span>
              <button
                type="button"
                onClick={() => goTo(page + 1)}
                disabled={page >= pagination.last_page}
                className="inline-flex h-10 items-center gap-1 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white disabled:opacity-40"
              >
                Older <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Orders;
