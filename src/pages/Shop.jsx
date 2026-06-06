import React, { useEffect, useState, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ProductCard from "@/components/ProductCard";
import { config } from "@/config";
import {
  Search,
  Filter,
  X,
  ChevronDown,
  ChevronUp,
  SlidersHorizontal,
  Grid3X3,
  List,
  ArrowUpDown,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Tag,
  Bot,
  Package,
  Trophy,
  Gauge,
  Settings,
  Battery,
  CircuitBoard,
  Wifi,
  Microchip,
  Camera,
  Radio,
  Wrench,
  Layers,
  Zap,
  Circle,
  Cpu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Seo from "@/components/Seo";

const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("robot") || n.includes("arm") || n.includes("chassis")) return Bot;
  if (n.includes("competition")) return Trophy;
  if (n.includes("kit") || n.includes("starter") || n.includes("package")) return Package;
  if (n.includes("sensor")) return Gauge;
  if (n.includes("motor") || n.includes("servo")) return Settings;
  if (n.includes("wheel")) return Circle;
  if (n.includes("power") || n.includes("battery")) return Battery;
  if (n.includes("transistor") || n.includes("mosfet")) return Cpu;
  if (n.includes("capacitor") || n.includes("resistor") || n.includes("diode")) return CircuitBoard;
  if (n.includes("esp") || n.includes("wifi") || n.includes("bluetooth")) return Wifi;
  if (n.includes("arduino") || n.includes("raspberry") || n.includes("micro")) return Microchip;
  if (n.includes("camera") || n.includes("display") || n.includes("screen")) return Camera;
  if (n.includes("module") || n.includes("board")) return Radio;
  if (n.includes("tool") || n.includes("wire") || n.includes("cable")) return Wrench;
  if (n.includes("3d") || n.includes("print")) return Layers;
  if (n.includes("iot") || n.includes("smart")) return Zap;
  return Tag;
};

const getCategoryColor = (index) => {
  const colors = [
    "text-blue-600 bg-blue-50",
    "text-emerald-600 bg-emerald-50",
    "text-violet-600 bg-violet-50",
    "text-amber-600 bg-amber-50",
    "text-rose-600 bg-rose-50",
    "text-cyan-600 bg-cyan-50",
    "text-orange-600 bg-orange-50",
    "text-indigo-600 bg-indigo-50",
    "text-teal-600 bg-teal-50",
    "text-pink-600 bg-pink-50",
  ];
  return colors[index % colors.length];
};

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");
  const [liveSearch, setLiveSearch] = useState("");
  const searchInputRef = useRef(null);

  const [filters, setFilters] = useState({
    search: "",
    min_price: "",
    max_price: "",
    category_slug: "",
    page: 1,
    limit: 12,
  });

  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ price: true, category: true });
  const [pagination, setPagination] = useState({ current_page: 1, last_page: 1, per_page: 12, total: 0 });

  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${config.baseURL}/categories`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) setCategories(json.data);
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  const fetchProducts = useCallback(async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const queryParams = new URLSearchParams();
      Object.entries(currentFilters).forEach(([key, value]) => {
        if (value !== "" && value !== null && value !== undefined) queryParams.append(key, value);
      });
      const res = await fetch(`${config.baseURL}/products?${queryParams.toString()}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      let productData = [];
      let paginationData = {};
      if (json.success) {
        if (Array.isArray(json.data)) productData = json.data;
        if (json.pagination) {
          paginationData = {
            current_page: json.pagination.current_page || 1,
            last_page: json.pagination.total_pages || 1,
            per_page: json.pagination.per_page || 12,
            total: json.pagination.total_rows || 0,
          };
        }
      }
      setProducts(productData);
      if (Object.keys(paginationData).length > 0) setPagination(paginationData);
    } catch (err) {
      setError(err.message || "Failed to load products");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlFilters = {
      search: params.get("search") || "",
      min_price: params.get("min_price") || "",
      max_price: params.get("max_price") || "",
      category_slug: params.get("category_slug") || "",
      page: parseInt(params.get("page")) || 1,
      limit: parseInt(params.get("limit")) || 12,
    };
    setFilters(urlFilters);
    setLiveSearch(urlFilters.search);
    fetchProducts(urlFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  // Debounced live search
  useEffect(() => {
    const t = setTimeout(() => {
      const params = new URLSearchParams(location.search);
      const current = params.get("search") || "";
      if (liveSearch !== current) {
        updateUrlParams({ search: liveSearch, page: 1 });
      }
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveSearch]);

  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) params.delete(key);
      else params.set(key, value);
    });
    navigate({ search: params.toString() }, { replace: false });
  };

  const handleFilterChange = (key, value) => updateUrlParams({ [key]: value, page: 1 });

  const clearFilters = () => {
    setLiveSearch("");
    navigate({ search: "" });
  };

  const handlePageChange = (page) => {
    if (page !== filters.page && page >= 1 && page <= pagination.last_page) {
      updateUrlParams({ page });
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const toggleSection = (section) => setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));

  const mapProduct = (p) => ({
    id: p.id ?? p._id,
    slug: p.slug ?? p.product_slug ?? (p._id ? String(p._id) : undefined),
    name: p.name ?? p.title ?? "Untitled Product",
    price: Number(p.price ?? 0),
    discountedPrice: p.discountedPrice ? Number(p.discountedPrice) : null,
    discount: p.discount ?? 0,
    discountPercentage: p.discountPercentage ?? null,
    image: p.image || "/placeholder-product.jpg",
    stock: p.quantity ?? p.stock ?? p.qty ?? null,
    rating: p.rating ?? null,
    reviews: p.reviews_count ?? p.reviews ?? null,
    short_description: p.short_description ?? p.description ?? p.excerpt ?? "",
    categories: p.categories ?? [],
    _raw: p,
  });

  // Active filters count
  const activeFilterCount = [
    filters.search,
    filters.min_price,
    filters.max_price,
    filters.category_slug,
  ].filter(Boolean).length;

  const activeCategory = categories.find(c => c.slug === filters.category_slug);

  // Pagination Component
  const PaginationBar = () => {
    const { current_page, last_page, total } = pagination;
    if (last_page <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      if (last_page <= 7) {
        for (let i = 1; i <= last_page; i++) pages.push(i);
      } else if (current_page <= 4) {
        for (let i = 1; i <= 5; i++) pages.push(i);
        pages.push("...");
        pages.push(last_page);
      } else if (current_page >= last_page - 3) {
        pages.push(1);
        pages.push("...");
        for (let i = last_page - 4; i <= last_page; i++) pages.push(i);
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = current_page - 1; i <= current_page + 1; i++) pages.push(i);
        pages.push("...");
        pages.push(last_page);
      }
      return pages;
    };

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-6 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-gray-500 order-2 sm:order-1">
            Page <span className="font-semibold text-gray-800">{current_page}</span> of <span className="font-semibold text-gray-800">{last_page}</span>
            <span className="hidden sm:inline text-gray-400"> · {total.toLocaleString()} products</span>
          </p>
          <div className="flex items-center gap-1 order-1 sm:order-2">
            <button onClick={() => handlePageChange(current_page - 1)} disabled={current_page === 1}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Prev</span>
            </button>
            <div className="flex items-center gap-1 mx-1">
              {getPageNumbers().map((page, index) =>
                page === "..." ? (
                  <span key={`e-${index}`} className="w-8 flex items-center justify-center">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </span>
                ) : (
                  <button key={page} onClick={() => handlePageChange(page)}
                    className={`h-9 w-9 rounded-lg text-sm font-semibold transition-colors ${
                      current_page === page
                        ? "bg-blue-600 text-white shadow-sm shadow-blue-200"
                        : "border border-gray-200 text-gray-700 hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700"
                    }`}>
                    {page}
                  </button>
                )
              )}
            </div>
            <button onClick={() => handlePageChange(current_page + 1)} disabled={current_page === last_page}
              className="h-9 px-3 rounded-lg border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1 transition-colors">
              <span className="hidden sm:inline">Next</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="hidden md:flex items-center gap-2 order-3 text-sm">
            <span className="text-gray-500">Go to:</span>
            <select value={current_page} onChange={(e) => handlePageChange(parseInt(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white">
              {Array.from({ length: last_page }, (_, i) => i + 1).map(p => (
                <option key={p} value={p}>Page {p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white border border-gray-100 rounded-2xl overflow-hidden">
          <Skeleton className="aspect-[5/4] w-full bg-gray-100" />
          <div className="p-4 space-y-2.5">
            <Skeleton className="h-4 w-3/4 bg-gray-100" />
            <Skeleton className="h-4 w-1/2 bg-gray-100" />
            <Skeleton className="h-9 w-full rounded-xl bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Seo
        title="Shop Robotics & IoT Components Online - Zantech Store"
        description="Browse and buy robotics kits, Arduino, ESP32, sensors, modules, and IoT components from Zantech Store. Fast delivery across Bangladesh for students, makers, and engineers."
        url="https://store.zantechbd.com/shop"
        type="website"
        keywords="Zantech shop, buy Arduino Bangladesh, robotics components BD, IoT sensors online, ESP32 modules, electronics shop Bangladesh, ZAN Tech store"
      />
      <Header />

      <main className="flex-1 pb-8">
        <div className="container mx-auto px-4 py-6">

          {/* Page Header */}
          <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 rounded-2xl p-6 sm:p-8 mb-6 text-white relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-blue-600/30 via-transparent to-transparent" />
            <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl sm:text-3xl font-black mb-1">
                  {activeCategory ? activeCategory.name : "All Products"}
                </h1>
                <p className="text-blue-200 text-sm">
                  {isLoading
                    ? "Loading products..."
                    : `${pagination.total.toLocaleString()} products available`}
                </p>
              </div>
              {/* Search bar */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-white/50 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={liveSearch}
                  onChange={e => setLiveSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-white/15 border border-white/25 text-white placeholder-white/50 pl-10 pr-9 py-2.5 rounded-xl text-sm focus:outline-none focus:bg-white/25 focus:border-white/50 transition-all"
                />
                {liveSearch && (
                  <button onClick={() => setLiveSearch("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Active Filter Chips */}
          {activeFilterCount > 0 && (
            <div className="flex flex-wrap items-center gap-2 mb-4">
              <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Filters:</span>
              {filters.search && (
                <span className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  <Search className="w-3 h-3" />
                  "{filters.search}"
                  <button onClick={() => { setLiveSearch(""); handleFilterChange("search", ""); }}
                    className="hover:bg-blue-200 rounded-full p-0.5 -mr-0.5 transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {filters.category_slug && activeCategory && (
                <span className="inline-flex items-center gap-1.5 bg-violet-50 border border-violet-200 text-violet-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  {React.createElement(getCategoryIcon(activeCategory.name), { className: "w-3 h-3" })}
                  {activeCategory.name}
                  <button onClick={() => handleFilterChange("category_slug", "")}
                    className="hover:bg-violet-200 rounded-full p-0.5 -mr-0.5 transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {filters.min_price && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  Min ৳{Number(filters.min_price).toLocaleString()}
                  <button onClick={() => handleFilterChange("min_price", "")}
                    className="hover:bg-emerald-200 rounded-full p-0.5 -mr-0.5 transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              {filters.max_price && (
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold px-3 py-1.5 rounded-full">
                  Max ৳{Number(filters.max_price).toLocaleString()}
                  <button onClick={() => handleFilterChange("max_price", "")}
                    className="hover:bg-emerald-200 rounded-full p-0.5 -mr-0.5 transition-colors">
                    <X className="w-2.5 h-2.5" />
                  </button>
                </span>
              )}
              <button onClick={clearFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-gray-500 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-full border border-gray-200 hover:border-red-200 transition-all">
                <RefreshCw className="w-3 h-3" /> Clear All
              </button>
            </div>
          )}

          <div className="flex flex-col lg:flex-row gap-6">
            {/* Sidebar */}
            <div className="lg:w-72 flex-shrink-0">
              {/* Mobile toggle */}
              <div className="lg:hidden mb-3">
                <button onClick={() => setShowFilters(!showFilters)}
                  className="w-full flex items-center justify-between bg-white border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold text-gray-700 shadow-sm">
                  <span className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4 text-blue-600" />
                    Filters {activeFilterCount > 0 && (
                      <span className="bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {activeFilterCount}
                      </span>
                    )}
                  </span>
                  {showFilters ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              </div>

              <div className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${showFilters || "hidden lg:block"}`}>
                {/* Sidebar Header */}
                <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-blue-50 rounded-lg flex items-center justify-center">
                      <Filter className="h-3.5 w-3.5 text-blue-600" />
                    </div>
                    <span className="text-sm font-black text-gray-800 uppercase tracking-wider">Filters</span>
                    {activeFilterCount > 0 && (
                      <span className="bg-blue-600 text-white text-[10px] font-black w-4.5 h-4.5 px-1.5 py-0.5 rounded-full leading-none">
                        {activeFilterCount}
                      </span>
                    )}
                  </div>
                  {activeFilterCount > 0 && (
                    <button onClick={clearFilters} className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 transition-colors">
                      <RefreshCw className="h-3 w-3" /> Reset
                    </button>
                  )}
                </div>

                <div className="divide-y divide-gray-50">
                  {/* Price Range */}
                  <div className="p-4">
                    <button onClick={() => toggleSection("price")}
                      className="flex items-center justify-between w-full text-left mb-1">
                      <span className="text-sm font-bold text-gray-800">Price Range</span>
                      {expandedSections.price
                        ? <ChevronUp className="h-4 w-4 text-gray-400" />
                        : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </button>
                    {expandedSections.price && (
                      <div className="mt-3 grid grid-cols-2 gap-2">
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Min ৳</label>
                          <Input type="number" placeholder="0" value={filters.min_price}
                            onChange={(e) => handleFilterChange("min_price", e.target.value)}
                            className="h-9 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500" />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-gray-500 mb-1">Max ৳</label>
                          <Input type="number" placeholder="∞" value={filters.max_price}
                            onChange={(e) => handleFilterChange("max_price", e.target.value)}
                            className="h-9 text-sm rounded-lg border-gray-200 focus:ring-2 focus:ring-blue-500" />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Categories */}
                  <div className="p-4">
                    <button onClick={() => toggleSection("category")}
                      className="flex items-center justify-between w-full text-left mb-1">
                      <span className="text-sm font-bold text-gray-800">Categories</span>
                      {expandedSections.category
                        ? <ChevronUp className="h-4 w-4 text-gray-400" />
                        : <ChevronDown className="h-4 w-4 text-gray-400" />}
                    </button>
                    {expandedSections.category && (
                      <div className="mt-3 space-y-0.5 max-h-72 overflow-y-auto -mx-1 px-1">
                        <button onClick={() => handleFilterChange("category_slug", "")}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all text-left ${
                            filters.category_slug === ""
                              ? "bg-blue-50 text-blue-700 font-semibold"
                              : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                          }`}>
                          <div className="w-6 h-6 bg-gray-100 rounded-md flex items-center justify-center flex-shrink-0">
                            <Grid3X3 className="w-3 h-3 text-gray-500" />
                          </div>
                          All Products
                        </button>
                        {categories.map((cat, idx) => {
                          const Icon = getCategoryIcon(cat.name);
                          const colorClass = getCategoryColor(idx);
                          const isActive = filters.category_slug === cat.slug;
                          return (
                            <button key={cat.id} onClick={() => handleFilterChange("category_slug", cat.slug)}
                              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-sm transition-all text-left group ${
                                isActive
                                  ? "bg-blue-50 text-blue-700 font-semibold"
                                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                              }`}>
                              <div className={`w-6 h-6 rounded-md flex items-center justify-center flex-shrink-0 ${
                                isActive ? "bg-blue-100 text-blue-600" : colorClass
                              }`}>
                                <Icon className="w-3 h-3" />
                              </div>
                              <span className="line-clamp-1 flex-1">{cat.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 mb-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex items-center gap-3">
                  {/* View Mode */}
                  <div className="flex items-center bg-gray-100 rounded-lg p-0.5">
                    <button onClick={() => setViewMode("grid")}
                      className={`p-2 rounded-md transition-colors ${viewMode === "grid" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                      <Grid3X3 className="h-3.5 w-3.5" />
                    </button>
                    <button onClick={() => setViewMode("list")}
                      className={`p-2 rounded-md transition-colors ${viewMode === "list" ? "bg-white shadow-sm text-blue-600" : "text-gray-400 hover:text-gray-600"}`}>
                      <List className="h-3.5 w-3.5" />
                    </button>
                  </div>

                  {/* Results count */}
                  {!isLoading && pagination.total > 0 && (
                    <span className="text-xs text-gray-500 font-medium">
                      {(pagination.current_page - 1) * pagination.per_page + 1}–{Math.min(pagination.current_page * pagination.per_page, pagination.total)}
                      {" "}of <strong className="text-gray-800">{pagination.total.toLocaleString()}</strong> products
                    </span>
                  )}
                  {isLoading && (
                    <span className="text-xs text-gray-400 flex items-center gap-1.5">
                      <div className="w-3 h-3 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      Loading…
                    </span>
                  )}
                </div>

                {/* Sort */}
                <div className="flex items-center gap-2">
                  <ArrowUpDown className="h-3.5 w-3.5 text-gray-400 flex-shrink-0" />
                  <select
                    className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white text-gray-700"
                    onChange={(e) => handleFilterChange("sort", e.target.value)}>
                    <option value="newest">Newest First</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="price_high">Price: High to Low</option>
                    <option value="name">Name A-Z</option>
                  </select>
                </div>
              </div>

              {/* Products */}
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center">
                  <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <X className="h-8 w-8 text-red-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">Failed to load products</h3>
                  <p className="text-sm text-gray-500 mb-6">{error}</p>
                  <button onClick={() => fetchProducts()}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    Try Again
                  </button>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Search className="h-8 w-8 text-gray-400" />
                  </div>
                  <h3 className="text-base font-bold text-gray-900 mb-2">No products found</h3>
                  <p className="text-sm text-gray-500 mb-6">
                    {filters.search
                      ? `No results for "${filters.search}". Try a different keyword.`
                      : "Try adjusting your filters to find what you're looking for."}
                  </p>
                  <button onClick={clearFilters}
                    className="border border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors">
                    Clear Filters
                  </button>
                </div>
              ) : (
                <>
                  <div className={
                    viewMode === "grid"
                      ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-5"
                      : "space-y-3"
                  }>
                    {products.map((product) => (
                      <ProductCard
                        key={product.id || product._id || product.slug}
                        product={mapProduct(product)}
                      />
                    ))}
                  </div>
                  <PaginationBar />
                </>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Shop;
