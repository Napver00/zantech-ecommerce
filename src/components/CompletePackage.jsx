import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Wrench, ShieldCheck, BookOpen } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import ProductCard from "./ProductCard";
import { fetchProducts } from "@/lib/products";

const POINTS = [
  { icon: Wrench, text: "Engineered in-house" },
  { icon: ShieldCheck, text: "Every kit quality checked" },
  { icon: BookOpen, text: "Guides & tutorials included" },
];

// ZAN Tech Kits showcase: brand panel on the left, kits on the right.
const CompletePackage = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetchProducts("/products/category/starter-kit")
      .then((data) => mounted && setProducts(data))
      .catch((e) => mounted && setError(e.message || "Failed to load products"))
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, []);

  // Nothing to showcase — keep the home page clean instead of showing an empty box.
  if (!loading && (error || products.length === 0)) return null;

  return (
    <section className="mt-16 grid gap-4 lg:grid-cols-4">
      <div className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-zan-cyan/20 bg-surface-dark p-6 md:p-8">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-zan-cyan/15 blur-[80px]" />
        <div className="relative">
          <span className="mb-4 inline-block rounded bg-zan-red px-2.5 py-1 font-mono text-[10px] font-bold uppercase tracking-widest text-white">
            Made by ZAN Tech
          </span>
          <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl">
            ZAN<span className="text-zan-red">TECH</span> Kits
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Complete robotics kits designed and packaged by our own engineers — everything you need to build, in one box.
          </p>
          <ul className="mt-6 space-y-3">
            {POINTS.map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-2.5 text-sm text-gray-200">
                <Icon className="h-4 w-4 flex-shrink-0 text-zan-cyan" /> {text}
              </li>
            ))}
          </ul>
        </div>
        <Link
          to="/zantech-kits"
          className="group relative mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-zan-cyan px-5 py-3 text-sm font-bold text-zan-dark transition-colors hover:bg-white"
        >
          View all kits <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:col-span-3">
        {loading
          ? Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="overflow-hidden rounded-xl border border-white/10 bg-surface-dark">
                <Skeleton className="aspect-square w-full rounded-none bg-white/5" />
                <div className="space-y-2 p-4">
                  <Skeleton className="h-4 w-full bg-white/5" />
                  <Skeleton className="h-9 w-full bg-white/5" />
                </div>
              </div>
            ))
          : products.slice(0, 3).map((product) => <ProductCard key={product.id} product={product} />)}
      </div>
    </section>
  );
};

export default CompletePackage;
