import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import Seo from "@/components/Seo";
import { config } from "@/config";
import { Skeleton } from "@/components/ui/skeleton";
import { Sparkles, AlertTriangle, PackageSearch, Wrench, Lightbulb, Rocket } from "lucide-react";

const ZanTechKits = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.baseURL}/products/category/starter-kit`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          if (mounted) setProducts(json.data);
        } else {
          throw new Error("Unexpected API response");
        }
      } catch (err) {
        if (mounted) setError(err.message || "Failed to load kits");
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchProducts();
    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Seo
        title="ZAN Tech Kits — Designed In-House | Zantech Store"
        description="Robotics and electronics kits designed, engineered, and packaged by the ZAN Tech team in Bangladesh. Not resold parts — our own kits, built to turn curiosity into creation."
        url="https://store.zantechbd.com/zantech-kits"
        type="website"
        keywords="ZAN Tech kits, in-house designed robotics kits, Bangladesh robotics kit, starter kit Bangladesh, ZAN Tech Robotics"
      />

      <Header />

      <main className="flex-grow">
        {/* Hero / brand story */}
        <div className="bg-gray-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_20%_20%,#3b82f6,transparent_45%),radial-gradient(circle_at_80%_60%,#8b5cf6,transparent_45%)]" />
          <div className="container mx-auto px-4 py-16 md:py-20 relative z-10 text-center max-w-3xl">
            <span className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-blue-300 text-xs font-bold uppercase tracking-[0.2em] px-4 py-1.5 rounded-full mb-6">
              <Sparkles className="w-3.5 h-3.5" />
              Designed by the ZAN Tech team
            </span>
            <h1 className="text-3xl md:text-5xl font-black text-white leading-tight mb-5">
              These aren't just parts. <span className="text-blue-400">They're our kits.</span>
            </h1>
            <p className="text-gray-300 text-sm md:text-lg leading-relaxed max-w-2xl mx-auto">
              Every kit on this page is designed, engineered, and packaged in-house by ZAN Tech —
              from the first sketch to the last screw. No shortcuts, no generic bundles. Just kits
              built by makers, for makers, to turn your curiosity into your next creation.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 mt-8">
              {[
                { icon: Wrench, label: "Engineered in-house" },
                { icon: Lightbulb, label: "Built for beginners to pros" },
                { icon: Rocket, label: "Made in Bangladesh" },
              ].map(({ icon: Icon, label }) => (
                <span
                  key={label}
                  className="inline-flex items-center gap-2 bg-white/5 border border-white/10 text-white/90 text-xs md:text-sm font-semibold px-4 py-2 rounded-xl"
                >
                  <Icon className="w-4 h-4 text-blue-400" />
                  {label}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Products */}
        <div className="container mx-auto px-4 py-10 md:py-14">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
                  <Skeleton className="aspect-[5/4] bg-gray-100" />
                  <div className="p-4 space-y-2.5">
                    <Skeleton className="h-4 w-4/5 bg-gray-100" />
                    <Skeleton className="h-4 w-3/5 bg-gray-100" />
                    <Skeleton className="h-10 w-full rounded-xl bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-10 text-center">
              <AlertTriangle className="h-10 w-10 text-red-400 mx-auto mb-3" />
              <p className="text-red-800 font-semibold">Unable to load ZAN Tech kits</p>
              <p className="text-red-500 text-sm mt-1">{error}</p>
            </div>
          ) : products.length === 0 ? (
            <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 text-center">
              <PackageSearch className="h-12 w-12 text-gray-300 mx-auto mb-3" />
              <p className="text-gray-700 font-semibold">Our next kit is in the workshop</p>
              <p className="text-gray-400 text-sm mt-1">
                We're designing new kits right now — check back soon!
              </p>
            </div>
          ) : (
            <>
              <div className="flex items-end justify-between gap-4 mb-6">
                <div>
                  <h2 className="text-xl md:text-2xl font-extrabold text-gray-900 tracking-tight">
                    {products.length} kit{products.length !== 1 ? "s" : ""} designed by ZAN Tech
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Everything you need in one box — pick a kit and start building today.
                  </p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {products.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ZanTechKits;
