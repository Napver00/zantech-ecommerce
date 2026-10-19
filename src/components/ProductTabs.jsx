import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Flame, Sparkles, Trophy, PackageOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";
import { fetchProducts } from "@/lib/products";
import { cn } from "@/lib/utils";

// Tabbed product rows — like DFRobot's New / Featured / Specials block.
const TABS = [
  { id: "best", label: "Best Selling", icon: Flame, path: "/products/best-selling?limit=10", href: "/shop" },
  { id: "new", label: "New Arrivals", icon: Sparkles, path: "/products/new?limit=10", href: "/shop", isNew: true },
  {
    id: "competition",
    label: "Competition Kits",
    icon: Trophy,
    path: "/products/category/competition-robotics-kits",
    href: "/shop?category_slug=competition-robotics-kits",
  },
];

const ProductTabs = () => {
  const [active, setActive] = useState(TABS[0].id);
  const [state, setState] = useState({ loading: true, error: null, items: [] });
  const tab = TABS.find((t) => t.id === active);

  useEffect(() => {
    let cancelled = false;
    setState((s) => ({ ...s, loading: true, error: null }));
    fetchProducts(tab.path)
      .then((items) => !cancelled && setState({ loading: false, error: null, items: items.slice(0, 10) }))
      .catch((e) => !cancelled && setState({ loading: false, error: e.message, items: [] }));
    return () => { cancelled = true; };
  }, [tab.path]);

  return (
    <section className="mt-16">
      <div className="mb-6 flex flex-col gap-4 border-b border-white/10 sm:flex-row sm:items-end sm:justify-between">
        <div role="tablist" className="scroll-strip -mb-px flex gap-1 overflow-x-auto">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              role="tab"
              aria-selected={active === id}
              onClick={() => setActive(id)}
              className={cn(
                "flex flex-shrink-0 items-center gap-2 border-b-2 px-4 pb-3 pt-1 text-base font-bold transition-colors md:text-lg",
                active === id ? "border-zan-cyan text-white" : "border-transparent text-gray-500 hover:text-gray-200",
              )}
            >
              <Icon className={cn("h-4 w-4", active === id && "text-zan-cyan")} />
              {label}
            </button>
          ))}
        </div>
        <Link
          to={tab.href}
          className="group mb-3 hidden flex-shrink-0 items-center gap-1.5 text-sm font-semibold text-gray-300 transition-colors hover:text-zan-cyan sm:inline-flex"
        >
          View all <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      {state.loading ? (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-surface-dark">
              <Skeleton className="aspect-square w-full rounded-none bg-white/5" />
              <div className="space-y-2 p-4">
                <Skeleton className="h-3 w-1/2 bg-white/5" />
                <Skeleton className="h-4 w-full bg-white/5" />
                <Skeleton className="h-9 w-full bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      ) : state.items.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16 text-center">
          <PackageOpen className="mb-3 h-10 w-10 text-gray-600" />
          <p className="text-sm text-gray-400">{state.error ? "Couldn't load products right now." : "No products here yet."}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
          {state.items.map((p) => (
            <ProductCard key={p.id} product={p} isNew={tab.isNew} />
          ))}
        </div>
      )}

      <Link
        to={tab.href}
        className="mt-5 flex items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2.5 text-sm font-semibold text-gray-300 sm:hidden"
      >
        View all {tab.label.toLowerCase()} <ArrowRight className="h-4 w-4" />
      </Link>
    </section>
  );
};

export default ProductTabs;
