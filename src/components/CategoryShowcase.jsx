import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "@/context/CategoriesContext";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeader from "./SectionHeader";
import { LayoutGrid, ChevronDown } from "lucide-react";
import { getCategoryIcon } from "@/lib/categoryIcons";

const INITIAL = 12;

// Icon grid of every category, like DFRobot's platform row.
const CategoryShowcase = () => {
  const { categories, isLoading: loading } = useCategories();
  const [showAll, setShowAll] = useState(false);

  if (!loading && categories.length === 0) return null;

  const visible = showAll ? categories : categories.slice(0, INITIAL);

  return (
    <section className="mt-16">
      <SectionHeader
        icon={LayoutGrid}
        eyebrow="Browse"
        title="Shop by Category"
        subtitle="Find exactly what your project needs"
        viewAllHref="/shop"
        viewAllLabel="All products"
      />

      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6">
        {loading
          ? Array.from({ length: INITIAL }).map((_, i) => (
              <Skeleton key={i} className="h-[112px] rounded-xl bg-white/5" />
            ))
          : visible.map((category) => {
              const Icon = getCategoryIcon(category.name);
              return (
                <Link
                  key={category.id}
                  to={`/shop?category_slug=${encodeURIComponent(category.slug)}`}
                  className="group flex flex-col items-center justify-center gap-3 rounded-xl border border-white/10 bg-surface-dark px-2 py-5 text-center transition-all hover:-translate-y-0.5 hover:border-zan-cyan/40 hover:bg-surface-2"
                >
                  <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-300 transition-colors group-hover:border-zan-cyan/30 group-hover:bg-zan-cyan/10 group-hover:text-zan-cyan">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="line-clamp-2 text-xs font-semibold leading-tight text-gray-200 group-hover:text-white">
                    {category.name}
                  </span>
                </Link>
              );
            })}
      </div>

      {!loading && categories.length > INITIAL && (
        <div className="mt-5 flex justify-center">
          <button
            onClick={() => setShowAll((v) => !v)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-5 py-2 text-sm font-semibold text-gray-300 transition-colors hover:border-zan-cyan/50 hover:text-zan-cyan"
          >
            {showAll ? "Show less" : `Show all ${categories.length} categories`}
            <ChevronDown className={`h-4 w-4 transition-transform ${showAll ? "rotate-180" : ""}`} />
          </button>
        </div>
      )}
    </section>
  );
};

export default CategoryShowcase;
