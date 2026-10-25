import React from "react";
import { statusOf, TONE } from "@/lib/orders";

/** Coloured label for an order status code. */
const StatusPill = ({ status }) => {
  const s = statusOf(status);
  return <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-bold ring-1 ring-inset ${TONE[s.tone]}`}>{s.label}</span>;
};

export default StatusPill;
