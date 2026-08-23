import React, { useState, useEffect, useRef } from "react";
import {
  Search,
  ShoppingCart,
  User,
  Menu,
  Facebook,
  Instagram,
  Linkedin,
  Link as LinkIcon,
  Heart,
  LogOut,
  ChevronDown,
  ArrowRight,
  TrendingUp,
  X,
  Cpu,
  Package,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuLink,
} from "@/components/ui/navigation-menu";
import { cn } from "@/lib/utils";
import { config } from "@/config";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Cart } from "@/components/Cart";
import { useAuth } from "@/context/AuthContext";
import { AuthSheet } from "@/components/AuthSheet";

const YouTubeIcon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
    <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="white" />
  </svg>
);

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [categories, setCategories] = useState([]);
  const [company, setCompany] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("main");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { cartCount } = useCart();
  const { user, userInfo, logout, isAuthSheetOpen, setIsAuthSheetOpen } =
    useAuth(); // Get userInfo from context

  const wishlistCount = userInfo?.total_wishlist || 0;

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${config.baseURL}/categories`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setCategories(result.data);
        } else {
          throw new Error("API response format is incorrect.");
        }
      } catch (e) {
        console.error("Failed to fetch categories:", e);
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    let mounted = true;
    const fetchCompany = async () => {
      try {
        const res = await fetch(`${config.baseURL}/company`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && json.data && mounted) setCompany(json.data);
      } catch (err) {
        console.error("Failed to load company info in header:", err);
      }
    };
    fetchCompany();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length > 2) {
        performSearch(searchQuery, true);
      } else {
        setSearchResults([]);
        setShowSearchResults(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  const performSearch = async (query, isPreview = false) => {
    if (!query.trim()) return;

    setIsSearching(true);
    try {
      const limit = isPreview ? 5 : 20;
      const response = await fetch(
        `${config.baseURL}/products?search=${encodeURIComponent(query)}&limit=${limit}`,
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.success && Array.isArray(result.data)) {
        setSearchResults(result.data);
        if (isPreview) {
          setShowSearchResults(true);
        }
      } else {
        setSearchResults([]);
      }
    } catch (err) {
      console.error("Search failed:", err);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const handleSearchInputChange = (e) => {
    setSearchQuery(e.target.value);
    if (!e.target.value.trim()) {
      setShowSearchResults(false);
    }
  };

  const handleSearchResultClick = (productSlug) => {
    navigate(`/product/${productSlug}`);
    setShowSearchResults(false);
    setSearchQuery("");
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowSearchResults(false);
    }
  };

  const searchInputRef = useRef(null);
  const isResourcesActive =
    location.pathname === "/blog" || location.pathname === "/tutorials";

  const trendingSearches = ["Arduino", "ESP32", "Robot Kit", "Servo Motor", "Ultrasonic Sensor"];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50 border-b border-gray-100">
      {/* Top Bar */}
      <div className="bg-gray-900 text-white text-xs py-3">
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="flex items-center space-x-6">
            <span className="text-blue-100 font-medium">
              Welcome to ZAN Tech
            </span>
            <div className="hidden md:flex items-center space-x-4">
              <Link
                to="/terms"
                className="hover:text-blue-200 transition-colors duration-200 hover:underline"
              >
                Terms & Conditions
              </Link>
              <Link
                to="/privacy-policy"
                className="hover:text-blue-200 transition-colors duration-200 hover:underline"
              >
                Privacy Policy
              </Link>
              <Link
                to="/return-policy"
                className="hover:text-blue-200 transition-colors duration-200 hover:underline"
              >
                Return Policy
              </Link>
            </div>
          </div>

          <div className="flex items-center space-x-3 hidden sm:flex">
            <span className="text-blue-200 text-xs hidden sm:block">
              Follow us:
            </span>
            {company?.social_links?.length > 0 ? (
              company.social_links.map((link) => {
                const platform = link.platform?.toLowerCase?.() || "";
                let Icon = LinkIcon;
                if (platform.includes("facebook")) Icon = Facebook;
                if (platform.includes("instagram")) Icon = Instagram;
                if (platform.includes("linkedin")) Icon = Linkedin;
                if (platform.includes("youtube")) Icon = YouTubeIcon;
                if (platform.includes("tiktok")) return null;
                return (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-200 hover:text-white transition-all duration-200 hover:scale-110"
                  >
                    <Icon size={16} />
                  </a>
                );
              })
            ) : (
              <>
                <a
                  href="#"
                  className="text-blue-200 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <Facebook size={16} />
                </a>
                <a
                  href="#"
                  className="text-blue-200 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <Instagram size={16} />
                </a>
                <a
                  href="#"
                  className="text-blue-200 hover:text-white transition-all duration-200 hover:scale-110"
                >
                  <Linkedin size={16} />
                </a>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Main Header */}
      <div className="container mx-auto px-4 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/zantech-logo.webp"
              alt="ZAN Tech Logo"
              className="h-10 sm:h-12 w-auto object-contain transition-transform duration-200 group-hover:scale-105"
            />
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center">
            <NavigationMenu>
              <NavigationMenuList className="space-x-2">
                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/shop"
                      className={cn(
                        "font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50 relative",
                        'after:content-[""] after:absolute after:left-1/2 after:bottom-0 after:h-0.5 after:bg-blue-600 after:transform after:-translate-x-1/2 after:transition-all after:duration-300',
                        location.pathname === "/shop"
                          ? "text-blue-600 bg-blue-50 after:w-8"
                          : "text-gray-700 after:w-0 hover:after:w-4",
                      )}
                    >
                      SHOP
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                {/* Resources Dropdown */}
                <NavigationMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button
                        className={cn(
                          "font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50 relative flex items-center gap-1",
                          'after:content-[""] after:absolute after:left-1/2 after:bottom-0 after:h-0.5 after:bg-blue-600 after:transform after:-translate-x-1/2 after:transition-all after:duration-300',
                          isResourcesActive
                            ? "text-blue-600 bg-blue-50 after:w-8"
                            : "text-gray-700 after:w-0 hover:after:w-4",
                        )}
                      >
                        RESOURCES
                        <ChevronDown className="h-4 w-4" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48 mt-2">
                      <DropdownMenuItem asChild>
                        <Link to="/blog" className="cursor-pointer font-medium">
                          Blog
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuItem asChild>
                        <Link
                          to="/tutorials"
                          className="cursor-pointer font-medium"
                        >
                          Tutorials
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/about"
                      className={cn(
                        "font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50 relative",
                        'after:content-[""] after:absolute after:left-1/2 after:bottom-0 after:h-0.5 after:bg-blue-600 after:transform after:-translate-x-1/2 after:transition-all after:duration-300',
                        location.pathname === "/about"
                          ? "text-blue-600 bg-blue-50 after:w-8"
                          : "text-gray-700 after:w-0 hover:after:w-4",
                      )}
                    >
                      ABOUT
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>

                <NavigationMenuItem>
                  <NavigationMenuLink asChild>
                    <Link
                      to="/contact"
                      className={cn(
                        "font-semibold text-sm px-4 py-2 rounded-lg transition-all duration-200 hover:bg-blue-50 relative",
                        'after:content-[""] after:absolute after:left-1/2 after:bottom-0 after:h-0.5 after:bg-blue-600 after:transform after:-translate-x-1/2 after:transition-all after:duration-300',
                        location.pathname === "/contact"
                          ? "text-blue-600 bg-blue-50 after:w-8"
                          : "text-gray-700 after:w-0 hover:after:w-4",
                      )}
                    >
                      CONTACT
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              </NavigationMenuList>
            </NavigationMenu>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-4">
            {/* Search Bar with Dropdown */}
            <div className="relative w-72 sm:w-96 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
                <Input
                  ref={searchInputRef}
                  type="search"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={handleSearchInputChange}
                  onFocus={() => setShowSearchResults(true)}
                  onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                  className="pl-10 pr-10 py-2.5 text-sm rounded-xl bg-gray-50 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all shadow-sm h-10"
                />
                {searchQuery ? (
                  <button type="button" onClick={() => { setSearchQuery(''); setSearchResults([]); setShowSearchResults(false); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    <X className="h-4 w-4" />
                  </button>
                ) : isSearching ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : null}
              </form>

              {/* Search Results Dropdown */}
              {showSearchResults && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-gray-200 rounded-2xl shadow-lg z-50 overflow-hidden">
                  {/* Trending (no query) */}
                  {!searchQuery && (
                    <div className="p-3">
                      <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 px-2 mb-2 flex items-center gap-1.5">
                        <TrendingUp className="w-3 h-3" /> Trending searches
                      </p>
                      <div className="flex flex-wrap gap-1.5 px-1">
                        {trendingSearches.map(term => (
                          <button key={term} type="button"
                            onMouseDown={() => { setSearchQuery(term); }}
                            className="text-xs bg-blue-50 text-blue-700 hover:bg-blue-100 px-3 py-1.5 rounded-full font-medium transition-colors">
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Searching spinner */}
                  {searchQuery && isSearching && (
                    <div className="flex items-center gap-3 px-4 py-4">
                      <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin flex-shrink-0" />
                      <span className="text-sm text-gray-500">Searching for <strong className="text-gray-800">"{searchQuery}"</strong>…</span>
                    </div>
                  )}

                  {/* No results */}
                  {searchQuery && !isSearching && searchResults.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Search className="w-5 h-5 text-gray-400" />
                      </div>
                      <p className="text-sm font-semibold text-gray-700 mb-0.5">No results for "{searchQuery}"</p>
                      <p className="text-xs text-gray-400 mb-3">Try a different keyword</p>
                      <button onMouseDown={handleViewAllResults}
                        className="text-xs text-blue-600 hover:underline font-medium">
                        Browse all products →
                      </button>
                    </div>
                  )}

                  {/* Results list */}
                  {searchQuery && !isSearching && searchResults.length > 0 && (
                    <>
                      <div className="px-3 pt-3 pb-1 flex items-center justify-between">
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          Products
                        </p>
                        <span className="text-[10px] text-gray-400">{searchResults.length} found</span>
                      </div>
                      <div className="px-2 pb-2 max-h-72 overflow-y-auto">
                        {searchResults.map((product) => (
                          <div key={product.id} onMouseDown={() => handleSearchResultClick(product.slug)}
                            className="flex items-center gap-3 p-2 hover:bg-blue-50 cursor-pointer rounded-xl transition-colors group">
                            <div className="relative flex-shrink-0">
                              <img src={product.image || "/placeholder-product.jpg"} alt={product.name}
                                className="w-12 h-12 object-cover rounded-lg bg-gray-100" />
                              {product.discountPercentage && (
                                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[8px] font-bold px-1 py-0.5 rounded-full leading-none">
                                  -{product.discountPercentage}%
                                </span>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-gray-800 group-hover:text-blue-700 line-clamp-1 transition-colors leading-snug">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-sm font-bold text-blue-600">
                                  ৳{(product.discountedPrice || product.price || 0).toLocaleString()}
                                </span>
                                {product.discountedPrice && product.discountedPrice < product.price && (
                                  <span className="text-xs text-gray-400 line-through">৳{(product.price).toLocaleString()}</span>
                                )}
                                {product.categories?.[0] && (
                                  <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded-full ml-auto">
                                    {product.categories[0].name}
                                  </span>
                                )}
                              </div>
                            </div>
                            <ArrowRight className="w-3.5 h-3.5 text-gray-300 group-hover:text-blue-500 flex-shrink-0 transition-colors" />
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-gray-100">
                        <button onMouseDown={handleViewAllResults}
                          className="w-full py-3 text-sm font-semibold text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2 rounded-b-2xl">
                          View all results for "{searchQuery}"
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2">
              {/* Wishlist */}
              <Link to="/dashboard/wishlist">
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-blue-50 transition-colors duration-200 group"
                >
                  <Heart className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                  {user && wishlistCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                      {wishlistCount}
                    </span>
                  )}
                </Button>
              </Link>

              {/* Cart */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="relative hover:bg-blue-50 transition-colors duration-200 group"
                  >
                    <ShoppingCart className="text-gray-600 group-hover:text-blue-600 transition-colors duration-200" />
                    {cartCount > 0 && (
                      <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium shadow-sm">
                        {cartCount}
                      </span>
                    )}
                  </Button>
                </SheetTrigger>
                <Cart />
              </Sheet>

              {/* Login/User Section - Desktop */}
              {user ? (
                <div className="hidden sm:flex items-center gap-2">
                  <Link to="/dashboard">
                    <Button
                      variant="outline"
                      className="hover:bg-blue-50 transition-colors duration-200"
                    >
                      <User className="mr-2 h-4 w-4" />
                      Dashboard
                    </Button>
                  </Link>
                  <Button
                    onClick={logout}
                    variant="ghost"
                    size="icon"
                    className="hover:bg-red-50 transition-colors duration-200 group"
                    title="Logout"
                  >
                    <LogOut className="h-4 w-4 text-gray-600 group-hover:text-red-600" />
                  </Button>
                </div>
              ) : (
                <Sheet open={isAuthSheetOpen} onOpenChange={setIsAuthSheetOpen}>
                  <SheetTrigger asChild>
                    <Button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors hidden sm:flex">
                      <User className="mr-2 h-4 w-4" />
                      Login
                    </Button>
                  </SheetTrigger>
                  <AuthSheet />
                </Sheet>
              )}
            </div>

            {/* Mobile Menu */}
            <div className="lg:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="hover:bg-blue-50 transition-colors duration-200"
                  >
                    <Menu className="text-gray-600" />
                  </Button>
                </SheetTrigger>
                <SheetContent className="w-[320px] sm:w-[400px] overflow-y-auto p-0 border-l border-gray-100 shadow-lg">
                  {/* Tabs Header */}
                  <div className="sticky top-0 bg-white border-b border-gray-200 z-10">
                    <div className="p-4">
                      <img
                        src="/zantech-logo.webp"
                        alt="ZAN Tech"
                        className="h-10 mb-4"
                      />
                    </div>

                    {/* Tab Buttons */}
                    <div className="flex border-b border-gray-200">
                      <button
                        onClick={() => setActiveMobileTab("main")}
                        className={cn(
                          "flex-1 py-3 px-4 text-sm font-semibold transition-colors",
                          activeMobileTab === "main"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900",
                        )}
                      >
                        Main tab
                      </button>
                      <button
                        onClick={() => setActiveMobileTab("category")}
                        className={cn(
                          "flex-1 py-3 px-4 text-sm font-semibold transition-colors",
                          activeMobileTab === "category"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-600 hover:text-gray-900",
                        )}
                      >
                        Category tab
                      </button>
                    </div>
                  </div>

                  <nav className="flex flex-col space-y-1 p-4">
                    {activeMobileTab === "main" ? (
                      <>
                        {/* User Info & Dashboard Link - Mobile */}
                        {user ? (
                          <div className="mb-6 p-4 bg-blue-50 rounded-2xl border border-blue-100">
                            <div className="flex items-center gap-3 mb-4">
                              <div className="w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">
                                {user.name?.charAt(0) || user.email?.charAt(0)}
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">
                                  {user.name || "User"}
                                </p>
                                <p className="text-xs text-gray-500 truncate">
                                  {user.email}
                                </p>
                              </div>
                            </div>
                            <Link
                              to="/dashboard"
                              className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 font-bold py-2.5 rounded-xl border border-blue-100 shadow-sm active:scale-[0.98] transition-all"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <User className="h-4 w-4" />
                              Go to Dashboard
                            </Link>
                          </div>
                        ) : (
                          <div className="mb-6">
                            <Link to="/login" onClick={() => setMobileMenuOpen(false)}>
                              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold">
                                Login / Sign Up
                              </Button>
                            </Link>
                          </div>
                        )}

                        {/* Mobile Search - Minimal */}
                        <form onSubmit={handleSearch} className="relative mb-6">
                          <Input
                            type="search"
                            placeholder="Search high-tech robotics..."
                            value={searchQuery}
                            onChange={handleSearchInputChange}
                            className="pr-10 rounded-2xl border-gray-100 bg-gray-50/50 focus:bg-white focus:ring-4 focus:ring-blue-100/50 transition-all h-12 text-base"
                          />
                          <button
                            type="submit"
                            className="absolute right-4 top-1/2 -translate-y-1/2"
                          >
                            {isSearching ? (
                              <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                            ) : (
                              <Search className="h-5 w-5 text-gray-400" />
                            )}
                          </button>
                        </form>

                        {/* SHOP */}
                        <Link
                          to="/shop"
                          className={cn(
                            "font-semibold py-3 px-4 rounded-lg transition-colors duration-200",
                            location.pathname === "/shop"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          SHOP
                        </Link>

                        {/* Resources Section */}
                        <div className="space-y-1 mt-4">
                          <div className="font-semibold py-3 px-4 text-gray-900">
                            RESOURCES
                          </div>
                          <Link
                            to="/blog"
                            className="py-2 px-8 rounded-lg transition-colors duration-200 block text-gray-600 hover:bg-gray-50"
                          >
                            Blog
                          </Link>
                          <Link
                            to="/tutorials"
                            className="py-2 px-8 rounded-lg transition-colors duration-200 block text-gray-600 hover:bg-gray-50"
                          >
                            Tutorials
                          </Link>
                        </div>

                        {/* ABOUT */}
                        <Link
                          to="/about"
                          className={cn(
                            "font-semibold py-3 px-4 rounded-lg transition-colors duration-200 mt-4",
                            location.pathname === "/about"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          ABOUT
                        </Link>

                        {/* CONTACT */}
                        <Link
                          to="/contact"
                          className={cn(
                            "font-semibold py-3 px-4 rounded-lg transition-colors duration-200",
                            location.pathname === "/contact"
                              ? "text-blue-600 bg-blue-50"
                              : "text-gray-700 hover:bg-gray-50",
                          )}
                        >
                          CONTACT
                        </Link>

                        <div className="border-t border-gray-200 my-4"></div>

                        {/* Legal Links */}
                        <div className="space-y-1">
                          <Link
                            to="/terms"
                            className="block text-gray-600 hover:text-blue-600 py-2 px-4 text-sm transition-colors duration-200"
                          >
                            Terms & Conditions
                          </Link>
                          <Link
                            to="/privacy-policy"
                            className="block text-gray-600 hover:text-blue-600 py-2 px-4 text-sm transition-colors duration-200"
                          >
                            Privacy Policy
                          </Link>
                          <Link
                            to="/return-policy"
                            className="block text-gray-600 hover:text-blue-600 py-2 px-4 text-sm transition-colors duration-200"
                          >
                            Return Policy
                          </Link>
                        </div>

                        {/* Mobile Login/Dashboard Button */}
                        {user ? (
                          <div className="space-y-2 mt-6">
                            <Link to="/dashboard">
                              <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                <User className="mr-2 h-4 w-4" /> Dashboard
                              </Button>
                            </Link>
                            <Button
                              onClick={logout}
                              variant="outline"
                              className="w-full hover:bg-red-50 hover:text-red-600 hover:border-red-300"
                            >
                              <LogOut className="mr-2 h-4 w-4" /> Logout
                            </Button>
                          </div>
                        ) : (
                          <Sheet
                            open={isAuthSheetOpen}
                            onOpenChange={setIsAuthSheetOpen}
                          >
                            <SheetTrigger asChild>
                              <Button className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white rounded-lg">
                                <User className="mr-2 h-4 w-4" /> Login
                              </Button>
                            </SheetTrigger>
                            <AuthSheet />
                          </Sheet>
                        )}
                      </>
                    ) : (
                      <>
                        {/* Category Tab - Only Categories */}
                        <div className="space-y-1">
                          {isLoading ? (
                            <div className="py-8 text-center text-gray-500">
                              <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent mx-auto mb-2"></div>
                              <p className="text-sm">Loading categories...</p>
                            </div>
                          ) : categories.length > 0 ? (
                            <>
                              <Link
                                to="/shop"
                                className="py-3 px-4 rounded-lg transition-colors duration-200 block font-semibold text-gray-700 hover:bg-gray-50 border-b border-gray-100 mb-2"
                              >
                                All Categories
                              </Link>
                              {categories.map((category) => (
                                <Link
                                  key={category.id}
                                  to={`/shop?category_slug=${category.slug}`}
                                  className={cn(
                                    "py-3 px-4 rounded-lg transition-colors duration-200 block",
                                    location.pathname === "/shop" &&
                                      location.search.includes(
                                        `category_slug=${category.slug}`,
                                      )
                                      ? "text-blue-600 bg-blue-50 font-semibold"
                                      : "text-gray-700 hover:bg-gray-50",
                                  )}
                                >
                                  {category.name}
                                </Link>
                              ))}
                            </>
                          ) : (
                            <div className="py-8 text-center text-gray-500">
                              <p className="text-sm">No categories available</p>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
