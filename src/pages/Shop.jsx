import React, { useEffect, useState, useCallback } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import Seo from "@/components/Seo";

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [viewMode, setViewMode] = useState("grid");

  // Filter states
  const [filters, setFilters] = useState({
    search: "",
    min_price: "",
    max_price: "",
    category_slug: "",
    page: 1,
    limit: 12,
  });

  // UI states
  const [showFilters, setShowFilters] = useState(false);
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true,
  });

  // Pagination
  const [pagination, setPagination] = useState({
    current_page: 1,
    last_page: 1,
    per_page: 12,
    total: 0,
  });

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch(`${config.baseURL}/categories`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch products with filters
  const fetchProducts = useCallback(
    async (currentFilters = filters) => {
      setIsLoading(true);
      setError(null);

      try {
        const queryParams = new URLSearchParams();

        // Add non-empty parameters
        Object.entries(currentFilters).forEach(([key, value]) => {
          if (value !== "" && value !== null && value !== undefined) {
            queryParams.append(key, value);
          }
        });

        const res = await fetch(
          `${config.baseURL}/products?${queryParams.toString()}`,
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);

        const json = await res.json();
        let productData = [];
        let paginationData = {};

        if (json.success) {
          // Products are directly in json.data array
          if (Array.isArray(json.data)) {
            productData = json.data;
          }

          // Pagination data is in separate pagination object
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

        if (Object.keys(paginationData).length > 0) {
          setPagination(paginationData);
        }
      } catch (err) {
        console.error("Failed to fetch products:", err);
        setError(err.message || "Failed to load products");
      } finally {
        setIsLoading(false);
      }
    },
    [filters],
  );

  // Initial load
  const location = useLocation();
  const navigate = useNavigate();

  // Sync state with URL
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
    fetchProducts(urlFilters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]);

  const updateUrlParams = (newParams) => {
    const params = new URLSearchParams(location.search);
    Object.entries(newParams).forEach(([key, value]) => {
      if (value === "" || value === null || value === undefined) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });
    // Always navigate to the new URL, this will trigger the useEffect
    navigate({ search: params.toString() }, { replace: false });
  };

  // Handle filter changes
  const handleFilterChange = (key, value) => {
    // When filter changes, reset to page 1
    updateUrlParams({ [key]: value, page: 1 });
  };

  // Handle search
  const handleSearch = (e) => {
    e.preventDefault();
    const searchValue = e.target.search.value;
    updateUrlParams({ search: searchValue, page: 1 });
  };

  // Clear filters
  const clearFilters = () => {
    navigate({ search: "" });
  };

  // Handle page change
  const handlePageChange = (page) => {
    if (page !== filters.page && page >= 1 && page <= pagination.last_page) {
      updateUrlParams({ page });
      // Scroll to top of products section
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  // Toggle filter sections
  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  };

  // Map product for ProductCard
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

  // Pagination Component
  const Pagination = () => {
    const { current_page, last_page, total } = pagination;

    if (last_page <= 1) return null;

    const getPageNumbers = () => {
      const pages = [];
      const maxVisible = 7;

      if (last_page <= maxVisible) {
        // Show all pages if total pages is small
        for (let i = 1; i <= last_page; i++) {
          pages.push(i);
        }
      } else {
        // Show smart pagination with ellipsis
        if (current_page <= 4) {
          // Show first 5 pages + ellipsis + last page
          for (let i = 1; i <= 5; i++) pages.push(i);
          if (last_page > 6) pages.push("...");
          pages.push(last_page);
        } else if (current_page >= last_page - 3) {
          // Show first page + ellipsis + last 5 pages
          pages.push(1);
          if (last_page > 6) pages.push("...");
          for (let i = last_page - 4; i <= last_page; i++) pages.push(i);
        } else {
          // Show first page + ellipsis + current-1, current, current+1 + ellipsis + last page
          pages.push(1);
          pages.push("...");
          for (let i = current_page - 1; i <= current_page + 1; i++)
            pages.push(i);
          pages.push("...");
          pages.push(last_page);
        }
      }

      return pages;
    };

    const pageNumbers = getPageNumbers();

    return (
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mt-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Page Info */}
          <div className="text-sm text-gray-600">
            Showing page {current_page} of {last_page}
            <span className="hidden sm:inline">
              {" "}
              ({total.toLocaleString()} total products)
            </span>
          </div>

          {/* Pagination Controls */}
          <div className="flex items-center gap-1">
            {/* Previous Button */}
            <Button
              onClick={() => handlePageChange(current_page - 1)}
              disabled={current_page === 1}
              variant="outline"
              size="sm"
              className="h-9 px-3"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">Previous</span>
            </Button>

            {/* Page Numbers */}
            <div className="flex items-center gap-1 mx-2">
              {pageNumbers.map((page, index) =>
                page === "..." ? (
                  <span key={`ellipsis-${index}`} className="px-2 py-1">
                    <MoreHorizontal className="h-4 w-4 text-gray-400" />
                  </span>
                ) : (
                  <Button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    variant={current_page === page ? "default" : "outline"}
                    size="sm"
                    className={`h-9 w-9 p-0 ${
                      current_page === page
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "hover:bg-blue-50"
                    }`}
                  >
                    {page}
                  </Button>
                ),
              )}
            </div>

            {/* Next Button */}
            <Button
              onClick={() => handlePageChange(current_page + 1)}
              disabled={current_page === last_page}
              variant="outline"
              size="sm"
              className="h-9 px-3"
            >
              <span className="hidden sm:inline mr-1">Next</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Quick Jump */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-600 hidden md:inline">Go to:</span>
            <select
              value={current_page}
              onChange={(e) => handlePageChange(parseInt(e.target.value))}
              className="border border-gray-200 rounded-lg px-2 py-1 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              {Array.from({ length: last_page }, (_, i) => i + 1).map(
                (page) => (
                  <option key={page} value={page}>
                    Page {page}
                  </option>
                ),
              )}
            </select>
          </div>
        </div>
      </div>
    );
  };

  const LoadingSkeleton = () => (
    <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6">
      {Array.from({ length: 8 }).map((_, i) => (
        <div
          key={i}
          className="bg-white border border-gray-100 rounded-xl shadow-sm overflow-hidden"
        >
          <Skeleton className="aspect-[5/4] w-full" />
          <div className="p-4 space-y-3">
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/*  SEO for Shop page */}
      <Seo
        title="Shop Robotics & IoT Components Online - Zantech Store"
        description="Browse and buy robotics kits, Arduino, ESP32, sensors, modules, and IoT components from Zantech Store. Fast delivery across Bangladesh for students, makers, and engineers."
        url="https://store.zantechbd.com/shop"
        type="website"
        keywords="Zantech shop, buy Arduino Bangladesh, robotics components BD, IoT sensors online, ESP32 modules, electronics shop Bangladesh, ZAN Tech store"
      />

      <Header />

      <main className="flex-1">
        <div className="container mx-auto px-4 py-8">
          {/* Header Section */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 sm:p-8 mb-6 sm:mb-8">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div>
                <h1 className="text-2xl sm:text-4xl font-bold text-gray-900 mb-2">
                  Shop
                </h1>
                <p className="text-gray-600">
                  Discover our complete collection of products
                  {pagination.total > 0 && (
                    <span className="ml-2 text-blue-600 font-medium">
                      ({pagination.total.toLocaleString()} products)
                    </span>
                  )}
                </p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleSearch} className="relative w-full lg:w-96">
                <Input
                  name="search"
                  type="search"
                  placeholder="Search products..."
                  defaultValue={filters.search}
                  className="pr-12 h-12 text-base rounded-xl border-gray-200 focus:ring-2 focus:ring-blue-500"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Search className="h-5 w-5 text-gray-500" />
                </button>
              </form>
            </div>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="lg:w-80">
              {/* Mobile Filter Toggle */}
              <div className="lg:hidden mb-4">
                <Button
                  onClick={() => setShowFilters(!showFilters)}
                  variant="outline"
                  className="w-full justify-between h-12"
                >
                  <div className="flex items-center gap-2">
                    <SlidersHorizontal className="h-4 w-4" />
                    Filters
                  </div>
                  {showFilters ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </div>

              {/* Filter Panel */}
              <div
                className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${showFilters || "hidden lg:block"}`}
              >
                <div className="p-6 border-b border-gray-100">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                      <Filter className="h-5 w-5" />
                      Filters
                    </h3>
                    <Button
                      onClick={clearFilters}
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-700"
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Clear All
                    </Button>
                  </div>
                </div>

                <div className="divide-y divide-gray-100">
                  {/* Price Range Filter */}
                  <div className="p-6">
                    <button
                      onClick={() => toggleSection("price")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h4 className="font-semibold text-gray-900">
                        Price Range
                      </h4>
                      {expandedSections.price ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.price && (
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Min Price
                            </label>
                            <Input
                              type="number"
                              placeholder="0"
                              value={filters.min_price}
                              onChange={(e) =>
                                handleFilterChange("min_price", e.target.value)
                              }
                              className="text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Max Price
                            </label>
                            <Input
                              type="number"
                              placeholder="∞"
                              value={filters.max_price}
                              onChange={(e) =>
                                handleFilterChange("max_price", e.target.value)
                              }
                              className="text-sm"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Category Filter */}
                  <div className="p-6">
                    <button
                      onClick={() => toggleSection("category")}
                      className="flex items-center justify-between w-full text-left"
                    >
                      <h4 className="font-semibold text-gray-900">
                        Categories
                      </h4>
                      {expandedSections.category ? (
                        <ChevronUp className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      )}
                    </button>

                    {expandedSections.category && (
                      <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                        <button
                          onClick={() =>
                            handleFilterChange("category_slug", "")
                          }
                          className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                            filters.category_slug === ""
                              ? "bg-blue-100 text-blue-700 font-medium"
                              : "hover:bg-gray-50 text-gray-700"
                          }`}
                        >
                          All Categories
                        </button>
                        {categories.map((category) => (
                          <button
                            key={category.id}
                            onClick={() =>
                              handleFilterChange("category_slug", category.slug)
                            }
                            className={`block w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                              filters.category_slug === category.slug
                                ? "bg-blue-100 text-blue-700 font-medium"
                                : "hover:bg-gray-50 text-gray-700"
                            }`}
                          >
                            {category.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Products Section */}
            <div className="flex-1">
              {/* Toolbar */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {/* View Mode Toggle */}
                    <div className="flex items-center bg-gray-100 rounded-lg p-1">
                      <button
                        onClick={() => setViewMode("grid")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "grid"
                            ? "bg-white shadow-sm text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setViewMode("list")}
                        className={`p-2 rounded-md transition-colors ${
                          viewMode === "list"
                            ? "bg-white shadow-sm text-blue-600"
                            : "text-gray-500 hover:text-gray-700"
                        }`}
                      >
                        <List className="h-4 w-4" />
                      </button>
                    </div>

                    {/* Results Count */}
                    {!isLoading && pagination.total > 0 && (
                      <span className="text-sm text-gray-600">
                        Showing{" "}
                        {(pagination.current_page - 1) * pagination.per_page +
                          1}
                        -
                        {Math.min(
                          pagination.current_page * pagination.per_page,
                          pagination.total,
                        )}{" "}
                        of {pagination.total.toLocaleString()} products
                      </span>
                    )}
                  </div>

                  {/* Sort Options */}
                  <div className="flex items-center gap-2">
                    <ArrowUpDown className="h-4 w-4 text-gray-500" />
                    <select
                      className="border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => {
                        // Add sorting logic here when backend supports it
                        console.log("Sort by:", e.target.value);
                      }}
                    >
                      <option value="newest">Newest First</option>
                      <option value="price_low">Price: Low to High</option>
                      <option value="price_high">Price: High to Low</option>
                      <option value="name">Name A-Z</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Products Grid/List */}
              {isLoading ? (
                <LoadingSkeleton />
              ) : error ? (
                <div className="bg-white rounded-2xl shadow-sm border border-red-100 p-12 text-center">
                  <div className="text-red-600 mb-4">
                    <X className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    Error Loading Products
                  </h3>
                  <p className="text-gray-600 mb-6">{error}</p>
                  <Button
                    onClick={() => fetchProducts()}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    Try Again
                  </Button>
                </div>
              ) : products.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                  <div className="text-gray-400 mb-4">
                    <Search className="h-12 w-12 mx-auto" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No Products Found
                  </h3>
                  <p className="text-gray-600 mb-6">
                    Try adjusting your filters or search terms to find what
                    you're looking for.
                  </p>
                  <Button onClick={clearFilters} variant="outline">
                    Clear Filters
                  </Button>
                </div>
              ) : (
                <>
                  <div
                    className={`${
                      viewMode === "grid"
                        ? "grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
                        : "space-y-4"
                    }`}
                  >
                    {products.map((product) => (
                      <ProductCard
                        key={product.id || product._id || product.slug}
                        product={mapProduct(product)}
                      />
                    ))}
                  </div>

                  {/* Pagination */}
                  <Pagination />
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
