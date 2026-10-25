import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowLeft, Check, CircleDollarSign, Copy, MapPin, Package, PackageCheck, Printer, Receipt, Star, Truck,
} from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/context/AuthContext';
import { config } from '@/config';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import StatusPill from '@/components/StatusPill';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { formatDate, PAYMENT_TYPE, statusOf, taka } from '@/lib/orders';

const STEPS = [
  { icon: Receipt, label: 'Placed' },
  { icon: Package, label: 'Processing' },
  { icon: PackageCheck, label: 'Delivered' },
];

/** Where the order is on Placed → Processing → Delivered. */
const Progress = ({ status }) => {
  const code = Number(status);
  const reached = code === 1 ? 2 : 1;
  const stopped = code === 3 || code === 4 || code === 2;
  return (
    <div className="rounded-2xl border border-white/10 bg-card p-5 md:p-6">
      <ol className="flex items-center">
        {STEPS.map(({ icon: Icon, label }, i) => {
          const done = i <= reached && !(stopped && i > 0);
          const current = i === reached && !stopped;
          return (
            <li key={label} className={`flex items-center ${i < STEPS.length - 1 ? 'flex-1' : ''}`}>
              <div className="flex flex-col items-center gap-2">
                <span
                  className={`flex h-11 w-11 items-center justify-center rounded-full border-2 ${
                    done ? 'border-zan-cyan bg-zan-cyan text-zan-dark' : 'border-white/15 bg-background text-gray-500'
                  } ${current ? 'ring-4 ring-zan-cyan/20' : ''}`}
                >
                  {done && !current ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                </span>
                <span className={`text-xs font-semibold ${done ? 'text-white' : 'text-gray-500'}`}>{label}</span>
              </div>
              {i < STEPS.length - 1 && (
                <span className={`mx-2 mb-6 h-1 flex-1 rounded-full ${i < reached && !stopped ? 'bg-zan-cyan' : 'bg-white/10'}`} />
              )}
            </li>
          );
        })}
      </ol>
      <p className={`mt-4 rounded-xl px-3 py-2 text-center text-sm ${stopped ? 'bg-amber-500/10 text-amber-500' : 'bg-zan-cyan/5 text-gray-300'}`}>
        {statusOf(status).hint}
      </p>
    </div>
  );
};

const OrderDetails = () => {
  const { invoiceCode } = useParams();
  const { token } = useAuth();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rateItem, setRateItem] = useState(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState('');
  const [sendingReview, setSendingReview] = useState(false);

  useEffect(() => {
    if (!invoiceCode || !token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    fetch(`${config.baseURL}/orders/users/${invoiceCode}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("We couldn't find this order in your account."))))
      .then((d) => {
        if (!d.success) throw new Error(d.message || "Couldn't load this order.");
        if (!cancelled) setOrder(d.data);
      })
      .catch((e) => !cancelled && setError(e.message))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [invoiceCode, token]);

  const openRating = (item) => {
    setRateItem(item);
    setRating(0);
    setReview('');
  };

  const submitRating = async () => {
    if (!rating || !review.trim()) {
      toast.error('Pick a star rating and write a few words.');
      return;
    }
    setSendingReview(true);
    try {
      const res = await fetch(`${config.baseURL}/ratings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ star: rating, reating: review.trim(), product_id: rateItem.product_id }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || 'Failed to submit your review.');
      toast.success('Thanks for your review!');
      setRateItem(null);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSendingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-36 w-full rounded-2xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="rounded-2xl border border-white/10 bg-card p-10 text-center">
        <AlertTriangle className="mx-auto h-9 w-9 text-red-500" />
        <p className="mt-3 font-semibold text-white">{error || 'Order not found.'}</p>
        <Link to="/dashboard/orders" className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 px-4 text-sm font-semibold text-white hover:border-zan-cyan/40">
          <ArrowLeft className="h-4 w-4" /> Back to orders
        </Link>
      </div>
    );
  }

  const pay = order.payments?.[0];
  const paid = Number(pay?.status) === 1;
  const addr = order.shipping_address;
  const items = order.order_items || [];
  const help = `https://wa.me/8801894634149?text=${encodeURIComponent(`Hi ZAN Tech, I have a question about order ${order.invoice_code}.`)}`;

  return (
    <div className="space-y-5">
      <Link to="/dashboard/orders" className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white print:hidden">
        <ArrowLeft className="h-4 w-4" /> All orders
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="font-mono text-2xl font-black text-white md:text-3xl">{order.invoice_code}</h1>
            <button
              type="button"
              onClick={() => navigator.clipboard?.writeText(order.invoice_code).then(() => toast.success('Order number copied'))}
              className="rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white print:hidden"
              aria-label="Copy order number"
            >
              <Copy className="h-4 w-4" />
            </button>
            <StatusPill status={order.status} />
          </div>
          <p className="mt-1 text-sm text-gray-400">Placed {formatDate(order.created_at, true)}</p>
        </div>
        <div className="flex flex-wrap gap-2 print:hidden">
          <a href={help} target="_blank" rel="noreferrer" className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-card px-4 text-sm font-semibold text-white hover:border-[#25D366]/50">
            <WhatsAppIcon className="h-4 w-4 text-[#25D366]" /> Get help
          </a>
          <button type="button" onClick={() => window.print()} className="inline-flex h-10 items-center gap-2 rounded-xl border border-white/15 bg-card px-4 text-sm font-semibold text-white hover:border-zan-cyan/40">
            <Printer className="h-4 w-4" /> Print
          </button>
        </div>
      </div>

      <Progress status={order.status} />

      <div className="grid gap-5 xl:grid-cols-[1fr_340px]">
        {/* Items */}
        <section className="rounded-2xl border border-white/10 bg-card">
          <h2 className="border-b border-white/10 px-5 py-4 text-lg font-bold text-white">
            {items.length} {items.length === 1 ? 'item' : 'items'}
          </h2>
          <ul className="divide-y divide-white/10">
            {items.map((item) => (
              <li key={`${item.product_id}-${item.name}`} className="flex gap-4 p-4 md:p-5">
                {item.image ? (
                  <img src={item.image} alt="" loading="lazy" className="product-tile h-16 w-16 flex-shrink-0 rounded-xl border border-white/10 object-contain p-1" />
                ) : (
                  <span className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-xl bg-white/5 text-gray-500"><Package className="h-6 w-6" /></span>
                )}
                <div className="min-w-0 flex-1">
                  {item.slug ? (
                    <Link to={`/product/${item.slug}`} className="line-clamp-2 font-semibold text-white hover:text-zan-cyan">{item.name}</Link>
                  ) : (
                    <p className="font-semibold text-gray-400">{item.name}</p>
                  )}
                  <p className="mt-1 text-sm text-gray-400">{item.quantity} × {taka(item.price)}</p>
                  {Array.isArray(item.bundle_items) && item.bundle_items.length > 0 && (
                    <p className="mt-1 text-xs text-gray-500">Includes: {item.bundle_items.map((b) => b.name).join(', ')}</p>
                  )}
                  <div className="mt-2 flex flex-wrap gap-3 text-sm print:hidden">
                    {item.slug && (
                      <>
                        <button type="button" onClick={() => openRating(item)} className="inline-flex items-center gap-1 font-semibold text-zan-cyan hover:underline">
                          <Star className="h-3.5 w-3.5" /> Write a review
                        </button>
                        <Link to={`/product/${item.slug}`} className="font-semibold text-gray-400 hover:text-white">Buy again</Link>
                      </>
                    )}
                  </div>
                </div>
                <p className="font-bold text-white">{taka(item.quantity * item.price)}</p>
              </li>
            ))}
          </ul>
        </section>

        <div className="space-y-5">
          {/* Summary */}
          <section className="rounded-2xl border border-white/10 bg-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-white"><Receipt className="h-4 w-4 text-zan-cyan" /> Summary</h2>
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400"><dt>Items</dt><dd className="text-white">{taka(order.item_subtotal)}</dd></div>
              <div className="flex justify-between text-gray-400">
                <dt>Delivery</dt><dd className="text-white">{Number(order.shipping_charge) ? taka(order.shipping_charge) : 'Free'}</dd>
              </div>
              {Number(order.discount) > 0 && (
                <div className="flex justify-between text-emerald-500">
                  <dt>Discount{order.coupon?.code ? ` (${order.coupon.code})` : ''}</dt><dd>− {taka(order.discount)}</dd>
                </div>
              )}
              <div className="flex items-baseline justify-between border-t border-white/10 pt-3">
                <dt className="font-bold text-white">Total</dt><dd className="text-xl font-black text-white">{taka(order.total_amount, 2)}</dd>
              </div>
            </dl>
          </section>

          {/* Payment */}
          <section className="rounded-2xl border border-white/10 bg-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-white"><CircleDollarSign className="h-4 w-4 text-zan-cyan" /> Payment</h2>
            <div className="mt-3 flex items-center justify-between">
              <span className="text-sm text-gray-300">{PAYMENT_TYPE[Number(pay?.payment_type)] || 'Not recorded'}</span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-bold ${paid ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                {paid ? 'Paid' : 'Not paid yet'}
              </span>
            </div>
            {pay && !paid && Number(pay.due_amount) > 0 && (
              <p className="mt-2 text-sm text-gray-400">Due: <span className="font-semibold text-white">{taka(pay.due_amount, 2)}</span></p>
            )}
          </section>

          {/* Address */}
          <section className="rounded-2xl border border-white/10 bg-card p-5">
            <h2 className="flex items-center gap-2 font-bold text-white"><Truck className="h-4 w-4 text-zan-cyan" /> Delivery</h2>
            {addr ? (
              <address className="mt-3 space-y-0.5 text-sm not-italic text-gray-400">
                <p className="font-semibold text-white">{addr.f_name} {addr.l_name}</p>
                <p>{addr.address}</p>
                <p>{addr.city} {addr.zip}</p>
                <p className="pt-1 text-gray-300">{addr.phone}</p>
              </address>
            ) : (
              <p className="mt-3 flex items-center gap-2 text-sm text-gray-400"><MapPin className="h-4 w-4" /> Address not available</p>
            )}
          </section>
        </div>
      </div>

      {/* Review dialog */}
      <AlertDialog open={!!rateItem} onOpenChange={(o) => !o && setRateItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Review “{rateItem?.name}”</AlertDialogTitle>
            <AlertDialogDescription>Your review helps other makers choose the right parts.</AlertDialogDescription>
          </AlertDialogHeader>
          <div className="flex gap-1" role="radiogroup" aria-label="Rating">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" role="radio" aria-checked={rating === n} aria-label={`${n} star${n > 1 ? 's' : ''}`} onClick={() => setRating(n)} className="p-1">
                <Star className={`h-8 w-8 ${n <= rating ? 'fill-amber-400 text-amber-400' : 'text-gray-500'}`} />
              </button>
            ))}
          </div>
          <Textarea placeholder="What did you build? How did it work?" value={review} onChange={(e) => setReview(e.target.value)} rows={4} />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <button
              type="button"
              onClick={submitRating}
              disabled={sendingReview}
              className="inline-flex h-9 items-center justify-center rounded-md bg-zan-cyan px-4 text-sm font-bold text-zan-dark hover:opacity-90 disabled:opacity-60"
            >
              {sendingReview ? 'Sending…' : 'Submit review'}
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default OrderDetails;
