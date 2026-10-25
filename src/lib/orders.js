// Shared labels and formatting for orders, used by checkout and the dashboard.

export const taka = (value, decimals = 0) =>
  `৳${Number(value || 0).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`;

export const formatDate = (value, withTime = false) => {
  if (!value) return "";
  // The API sends "YYYY-MM-DD HH:mm:ss"; make it ISO so every browser parses it.
  const date = new Date(String(value).replace(" ", "T"));
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "numeric", minute: "2-digit" } : {}),
  });
};

// Order status codes as stored by the backend.
export const ORDER_STATUS = {
  0: { label: "Processing", tone: "cyan", hint: "We're packing your order." },
  1: { label: "Completed", tone: "green", hint: "Delivered. Enjoy building!" },
  2: { label: "On hold", tone: "amber", hint: "We need to check something with you." },
  3: { label: "Cancelled", tone: "red", hint: "This order was cancelled." },
  4: { label: "Refunded", tone: "gray", hint: "The payment was refunded." },
};

export const statusOf = (code) => ORDER_STATUS[Number(code)] || { label: "Unknown", tone: "gray", hint: "" };

export const TONE = {
  cyan: "bg-zan-cyan/10 text-zan-cyan ring-zan-cyan/30",
  green: "bg-emerald-500/10 text-emerald-500 ring-emerald-500/30",
  amber: "bg-amber-500/10 text-amber-500 ring-amber-500/30",
  red: "bg-red-500/10 text-red-500 ring-red-500/30",
  gray: "bg-white/5 text-gray-400 ring-white/15",
};

export const PAYMENT_TYPE = { 1: "Cash on delivery", 2: "bKash" };
