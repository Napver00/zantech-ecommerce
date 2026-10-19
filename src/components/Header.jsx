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
  ChevronRight,
  ArrowRight,
  ArrowUpRight,
  TrendingUp,
  X,
  LayoutGrid,
  LayoutDashboard,
  Package,
  Phone,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { config } from "@/config";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";
import { Cart } from "@/components/Cart";
import { useAuth } from "@/context/AuthContext";
import { useCategories } from "@/context/CategoriesContext";
import { useCompany } from "@/context/CompanyContext";
import { AuthSheet } from "@/components/AuthSheet";
import BrandLogo from "@/components/BrandLogo";
import { getCategoryIcon } from "@/lib/categoryIcons";
import ThemeToggle from "@/components/ThemeToggle";

const YouTubeIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden>
    <rect x="2" y="5" width="20" height="14" rx="4" fill="currentColor" />
    <path d="M10 9.5L15 12L10 14.5V9.5Z" fill="var(--zan-dark)" />
  </svg>
);

const socialIcon = (platform = "") => {
  const p = platform.toLowerCase();
  if (p.includes("facebook")) return Facebook;
  if (p.includes("instagram")) return Instagram;
  if (p.includes("linkedin")) return Linkedin;
  if (p.includes("youtube")) return YouTubeIcon;
  return LinkIcon;
};

// Quick links in the category bar (DFRobot-style secondary navigation)
const NAV_LINKS = [
  { to: "/shop", label: "All Products" },
  { to: "/zantech-kits", label: "ZAN Tech Kits", highlight: true },
  { to: "/shop?category_slug=competition-robotics-kits", label: "Competition Kits" },
  { to: "/shop?category_slug=starter-kit", label: "Starter Kits" },
  { to: "/tutorials", label: "Tutorials" },
  { to: "/blog", label: "Blog" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

const trendingSearches = ["Arduino", "ESP32", "Robot Kit", "Servo Motor", "Ultrasonic Sensor"];

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { categories, isLoading } = useCategories();
  const company = useCompany();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeMobileTab, setActiveMobileTab] = useState("main");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const megaTimer = useRef(null);
  const { cartCount } = useCart();
  const { user, userInfo, logout, isAuthSheetOpen, setIsAuthSheetOpen } = useAuth();

  const wishlistCount = userInfo?.total_wishlist || 0;
  const socialLinks = (company?.social_links || []).filter((l) => !l.platform?.toLowerCase?.().includes("tiktok"));

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (searchQuery.trim() && searchQuery.length > 2) {
        performSearch(searchQuery, true);
      } else {
        setSearchResults([]);
      }
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchQuery]);

  // Close the mega menu / mobile menu whenever the page changes
  useEffect(() => {
    setMegaOpen(false);
    setMobileMenuOpen(false);
  }, [location.pathname, location.search]);

  const performSearch = async (query, isPreview = false) => {
    if (!query.trim()) return;
    setIsSearching(true);
    try {
      const limit = isPreview ? 5 : 20;
      const response = await fetch(`${config.baseURL}/products?search=${encodeURIComponent(query)}&limit=${limit}`);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
      const result = await response.json();
      if (result.success && Array.isArray(result.data)) {
        setSearchResults(result.data);
        if (isPreview) setShowSearchResults(true);
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
      setMobileMenuOpen(false);
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

  const openMega = () => { clearTimeout(megaTimer.current); setMegaOpen(true); };
  const closeMega = () => { megaTimer.current = setTimeout(() => setMegaOpen(false), 150); };

  const isActive = (to) => {
    const [path, query] = to.split("?");
    if (query) return location.pathname === path && location.search.includes(query);
    return location.pathname === path && (path !== "/shop" || !location.search.includes("category_slug"));
  };

  const activeCategory = new URLSearchParams(location.search).get("category_slug") || "";

  return (
    <>
      {/* ── Utility bar ── */}
      <div className="hidden border-b border-white/5 bg-surface-footer text-xs text-gray-400 md:block">
        <div className="container mx-auto flex h-9 items-center justify-between px-4">
          <div className="flex items-center gap-5">
            <span className="font-mono uppercase tracking-widest text-zan-cyan/80">Robotics · IoT · Electronics</span>
            <span className="h-3 w-px bg-white/10" />
            <Link to="/terms" className="transition-colors hover:text-white">Terms</Link>
            <Link to="/privacy-policy" className="transition-colors hover:text-white">Privacy</Link>
            <Link to="/return-policy" className="transition-colors hover:text-white">Returns</Link>
            <Link to="/faq" className="transition-colors hover:text-white">FAQ</Link>
          </div>
          <div className="flex items-center gap-4">
            <a href="https://zantechbd.com" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 transition-colors hover:text-zan-cyan">
              Courses &amp; Bootcamps <ArrowUpRight className="h-3 w-3" />
            </a>
            {socialLinks.length > 0 && <span className="h-3 w-px bg-white/10" />}
            {socialLinks.map((link) => {
              const Icon = socialIcon(link.platform);
              return (
                <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform}
                  className="transition-colors hover:text-zan-cyan">
                  <Icon size={14} />
                </a>
              );
            })}
          </div>
        </div>
      </div>

      <header className="sticky top-0 z-50 border-b border-white/10 bg-zan-dark/90 backdrop-blur-xl">
        {/* ── Main bar ── */}
        <div className="container mx-auto flex h-16 items-center gap-4 px-4 lg:h-[72px] lg:gap-8">
          <BrandLogo />

          {/* Search */}
          <div className="relative hidden flex-1 md:block">
            <form onSubmit={handleSearch} className="relative mx-auto max-w-2xl">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
              <input
                type="search"
                placeholder="Search Arduino, ESP32, sensors, robot kits…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setShowSearchResults(true)}
                onBlur={() => setTimeout(() => setShowSearchResults(false), 200)}
                className="h-11 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-11 pr-28 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-zan-cyan/60 focus:bg-white/[0.06] focus:ring-4 focus:ring-zan-cyan/10"
              />
              {searchQuery && (
                <button type="button" aria-label="Clear search"
                  onClick={() => { setSearchQuery(""); setSearchResults([]); }}
                  className="absolute right-[5.5rem] top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
                  <X className="h-4 w-4" />
                </button>
              )}
              <button type="submit"
                className="absolute right-1 top-1 bottom-1 inline-flex items-center gap-1.5 rounded-md bg-zan-cyan px-4 text-sm font-bold text-zan-dark transition-colors hover:bg-white">
                {isSearching ? <span className="h-4 w-4 animate-spin rounded-full border-2 border-zan-dark/30 border-t-zan-dark" /> : <Search className="h-4 w-4" />}
                <span>Search</span>
              </button>

              {showSearchResults && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl border border-white/10 bg-surface-dark shadow-2xl shadow-black/50">
                  {!searchQuery && (
                    <div className="p-4">
                      <p className="mb-2.5 flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-widest text-gray-500">
                        <TrendingUp className="h-3 w-3" /> Trending searches
                      </p>
                      <div className="flex flex-wrap gap-1.5">
                        {trendingSearches.map((term) => (
                          <button key={term} type="button" onMouseDown={() => setSearchQuery(term)}
                            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-gray-300 transition-colors hover:border-zan-cyan/40 hover:text-zan-cyan">
                            {term}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {searchQuery && searchQuery.length <= 2 && (
                    <p className="px-4 py-4 text-sm text-gray-500">Keep typing to search…</p>
                  )}

                  {searchQuery.length > 2 && isSearching && searchResults.length === 0 && (
                    <div className="flex items-center gap-3 px-4 py-4 text-sm text-gray-400">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-zan-cyan/30 border-t-zan-cyan" />
                      Searching for <strong className="text-white">"{searchQuery}"</strong>…
                    </div>
                  )}

                  {searchQuery.length > 2 && !isSearching && searchResults.length === 0 && (
                    <div className="px-4 py-6 text-center">
                      <p className="mb-1 text-sm font-semibold text-gray-200">No results for "{searchQuery}"</p>
                      <p className="mb-3 text-xs text-gray-500">Try a different keyword</p>
                      <button onMouseDown={() => navigate("/shop")} className="text-xs font-medium text-zan-cyan hover:underline">
                        Browse all products →
                      </button>
                    </div>
                  )}

                  {searchQuery.length > 2 && searchResults.length > 0 && (
                    <>
                      <div className="flex items-center justify-between px-4 pb-1 pt-3">
                        <p className="font-mono text-[10px] uppercase tracking-widest text-gray-500">Products</p>
                        <span className="text-[10px] text-gray-500">{searchResults.length} found</span>
                      </div>
                      <div className="max-h-80 overflow-y-auto px-2 pb-2">
                        {searchResults.map((product) => (
                          <div key={product.id} onMouseDown={() => handleSearchResultClick(product.slug)}
                            className="group flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-white/5">
                            <img src={product.image || "/placeholder-product.jpg"} alt={product.name} loading="lazy" decoding="async"
                              className="product-tile h-12 w-12 flex-shrink-0 rounded-md object-contain p-1" />
                            <div className="min-w-0 flex-1">
                              <p className="line-clamp-1 text-sm font-semibold text-gray-100 transition-colors group-hover:text-zan-cyan">{product.name}</p>
                              <div className="mt-0.5 flex items-center gap-2">
                                <span className="text-sm font-bold text-zan-cyan">৳{(product.discountedPrice || product.price || 0).toLocaleString()}</span>
                                {product.discountedPrice && product.discountedPrice < product.price && (
                                  <span className="text-xs text-gray-500 line-through">৳{product.price.toLocaleString()}</span>
                                )}
                                {product.categories?.[0] && (
                                  <span className="ml-auto rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-gray-400">{product.categories[0].name}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <button onMouseDown={handleViewAllResults}
                        className="flex w-full items-center justify-center gap-2 border-t border-white/10 py-3 text-sm font-semibold text-zan-cyan transition-colors hover:bg-white/5">
                        View all results for "{searchQuery}" <ArrowRight className="h-4 w-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </form>
          </div>

          {/* Actions */}
          <div className="ml-auto flex items-center gap-1 md:ml-0 md:gap-2">
            {/* Account */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="hidden items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5 sm:flex">
                    <span className="flex h-9 w-9 items-center justify-center rounded-full border border-zan-cyan/40 bg-zan-cyan/10 text-sm font-bold text-zan-cyan">
                      {(user.name || user.email || "U").charAt(0).toUpperCase()}
                    </span>
                    <span className="hidden leading-tight xl:block">
                      <span className="block text-[11px] text-gray-500">Hello,</span>
                      <span className="block max-w-[110px] truncate text-sm font-semibold text-white">{user.name?.split(" ")[0] || "Account"}</span>
                    </span>
                    <ChevronDown className="hidden h-3.5 w-3.5 text-gray-500 xl:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="truncate text-xs font-normal text-gray-400">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to="/dashboard" className="cursor-pointer"><LayoutDashboard className="h-4 w-4" /> Dashboard</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/orders" className="cursor-pointer"><Package className="h-4 w-4" /> My orders</Link></DropdownMenuItem>
                  <DropdownMenuItem asChild><Link to="/dashboard/wishlist" className="cursor-pointer"><Heart className="h-4 w-4" /> Wishlist</Link></DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} className="cursor-pointer text-red-400 focus:text-red-300"><LogOut className="h-4 w-4" /> Log out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Sheet open={isAuthSheetOpen} onOpenChange={setIsAuthSheetOpen}>
                <SheetTrigger asChild>
                  <button className="hidden items-center gap-2.5 rounded-lg px-2 py-1.5 text-left transition-colors hover:bg-white/5 sm:flex">
                    <User className="h-6 w-6 text-gray-300" />
                    <span className="hidden leading-tight xl:block">
                      <span className="block text-[11px] text-gray-500">Sign in</span>
                      <span className="block text-sm font-semibold text-white">Account</span>
                    </span>
                  </button>
                </SheetTrigger>
                <AuthSheet />
              </Sheet>
            )}

            <ThemeToggle />

            {/* Wishlist */}
            <Link to="/dashboard/wishlist" aria-label="Wishlist"
              className="relative hidden rounded-lg p-2.5 text-gray-300 transition-colors hover:bg-white/5 hover:text-zan-cyan sm:block">
              <Heart className="h-6 w-6" />
              {user && wishlistCount > 0 && (
                <span className="absolute right-0.5 top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-zan-red px-1 text-[11px] font-bold text-[#fff]">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Cart */}
            <Sheet>
              <SheetTrigger asChild>
                <button aria-label="Cart" className="relative flex items-center gap-2.5 rounded-lg p-2.5 text-gray-300 transition-colors hover:bg-white/5 hover:text-zan-cyan">
                  <span className="relative">
                    <ShoppingCart className="h-6 w-6" />
                    {cartCount > 0 && (
                      <span className="absolute -right-2.5 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-zan-cyan px-1 text-[11px] font-bold text-zan-dark">
                        {cartCount}
                      </span>
                    )}
                  </span>
                  <span className="hidden text-left leading-tight xl:block">
                    <span className="block text-[11px] text-gray-500">Your</span>
                    <span className="block text-sm font-semibold text-white">Cart</span>
                  </span>
                </button>
              </SheetTrigger>
              <Cart />
            </Sheet>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <button aria-label="Open menu" className="rounded-lg p-2.5 text-gray-300 transition-colors hover:bg-white/5 lg:hidden">
                  <Menu className="h-6 w-6" />
                </button>
              </SheetTrigger>
              <SheetContent className="w-[320px] overflow-y-auto border-l border-white/10 bg-zan-dark p-0 sm:w-[380px]">
                <div className="sticky top-0 z-10 border-b border-white/10 bg-zan-dark">
                  <div className="p-4 pr-12">
                    <BrandLogo compact onClick={() => setMobileMenuOpen(false)} />
                  </div>
                  <div className="flex">
                    {[["main", "Menu"], ["category", "Categories"]].map(([key, label]) => (
                      <button key={key} onClick={() => setActiveMobileTab(key)}
                        className={cn("flex-1 border-b-2 px-4 py-3 text-sm font-semibold transition-colors",
                          activeMobileTab === key ? "border-zan-cyan text-zan-cyan" : "border-transparent text-gray-400 hover:text-white")}>
                        {label}
                      </button>
                    ))}
                  </div>
                </div>

                <nav className="flex flex-col p-4">
                  {activeMobileTab === "main" ? (
                    <>
                      {user ? (
                        <div className="mb-5 rounded-xl border border-white/10 bg-surface-dark p-4">
                          <div className="mb-3 flex items-center gap-3">
                            <span className="flex h-11 w-11 items-center justify-center rounded-full border border-zan-cyan/40 bg-zan-cyan/10 text-lg font-bold text-zan-cyan">
                              {(user.name || user.email || "U").charAt(0).toUpperCase()}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-bold text-white">{user.name || "User"}</p>
                              <p className="truncate text-xs text-gray-400">{user.email}</p>
                            </div>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Link to="/dashboard" className="flex items-center justify-center gap-1.5 rounded-lg bg-zan-cyan py-2 text-sm font-bold text-zan-dark">
                              <LayoutDashboard className="h-4 w-4" /> Dashboard
                            </Link>
                            <button onClick={logout} className="flex items-center justify-center gap-1.5 rounded-lg border border-white/10 py-2 text-sm font-semibold text-gray-300 hover:border-red-500/40 hover:text-red-400">
                              <LogOut className="h-4 w-4" /> Log out
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button onClick={() => { setMobileMenuOpen(false); setIsAuthSheetOpen(true); }}
                          className="mb-5 flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-zan-cyan font-bold text-zan-dark">
                          <User className="h-4 w-4" /> Login / Sign up
                        </button>
                      )}

                      <form onSubmit={handleSearch} className="relative mb-5">
                        <input type="search" placeholder="Search products…" value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="h-11 w-full rounded-lg border border-white/10 bg-white/5 pl-4 pr-11 text-base text-white placeholder-gray-500 outline-none focus:border-zan-cyan/60" />
                        <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                          <Search className="h-5 w-5" />
                        </button>
                      </form>

                      {NAV_LINKS.map((l) => (
                        <Link key={l.to} to={l.to}
                          className={cn("flex items-center justify-between rounded-lg px-3 py-3 font-medium transition-colors",
                            isActive(l.to) ? "bg-zan-cyan/10 text-zan-cyan" : "text-gray-200 hover:bg-white/5")}>
                          {l.label}
                          <ChevronRight className="h-4 w-4 text-gray-600" />
                        </Link>
                      ))}

                      <div className="my-4 border-t border-white/10" />
                      <Link to="/dashboard/wishlist" className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-gray-300 hover:bg-white/5">
                        <Heart className="h-4 w-4" /> Wishlist {user && wishlistCount > 0 && <span className="ml-auto text-xs text-zan-red">{wishlistCount}</span>}
                      </Link>
                      {[["/terms", "Terms & Conditions"], ["/privacy-policy", "Privacy Policy"], ["/return-policy", "Return Policy"], ["/faq", "FAQ"]].map(([to, label]) => (
                        <Link key={to} to={to} className="rounded-lg px-3 py-2 text-sm text-gray-400 hover:text-white">{label}</Link>
                      ))}
                    </>
                  ) : isLoading ? (
                    <div className="py-10 text-center text-sm text-gray-500">
                      <span className="mx-auto mb-3 block h-8 w-8 animate-spin rounded-full border-2 border-zan-cyan/30 border-t-zan-cyan" />
                      Loading categories…
                    </div>
                  ) : (
                    <>
                      <Link to="/shop" className="mb-1 flex items-center gap-3 rounded-lg px-3 py-3 font-semibold text-white hover:bg-white/5">
                        <LayoutGrid className="h-4 w-4 text-zan-cyan" /> All products
                      </Link>
                      {categories.map((category) => {
                        const Icon = getCategoryIcon(category.name);
                        const active = activeCategory === category.slug;
                        return (
                          <Link key={category.id} to={`/shop?category_slug=${category.slug}`}
                            className={cn("flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
                              active ? "bg-zan-cyan/10 font-semibold text-zan-cyan" : "text-gray-300 hover:bg-white/5 hover:text-white")}>
                            <Icon className={cn("h-4 w-4", active ? "text-zan-cyan" : "text-gray-500")} />
                            {category.name}
                          </Link>
                        );
                      })}
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>

        {/* ── Mobile search ── */}
        <div className="container mx-auto px-4 pb-3 md:hidden">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
            <input
              type="search"
              placeholder="Search products…"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-lg border border-white/10 bg-white/[0.04] pl-10 pr-20 text-sm text-white placeholder-gray-500 outline-none focus:border-zan-cyan/60"
            />
            <button type="submit" className="absolute bottom-1 right-1 top-1 rounded-md bg-zan-cyan px-3 text-xs font-bold text-zan-dark">
              Search
            </button>
          </form>
        </div>

        {/* ── Category bar (desktop) ── */}
        <div className="hidden border-t border-white/5 lg:block">
          <div className="container mx-auto flex h-12 items-center gap-6 px-4">
            {/* Mega menu */}
            <div className="relative h-full" onMouseEnter={openMega} onMouseLeave={closeMega}>
              <button onClick={() => setMegaOpen((v) => !v)} aria-expanded={megaOpen}
                className={cn("flex h-full items-center gap-2.5 px-4 text-sm font-bold uppercase tracking-wide transition-colors",
                  megaOpen ? "bg-zan-cyan text-zan-dark" : "bg-zan-cyan/10 text-zan-cyan hover:bg-zan-cyan/20")}>
                <LayoutGrid className="h-4 w-4" />
                All Categories
                <ChevronDown className={cn("h-4 w-4 transition-transform", megaOpen && "rotate-180")} />
              </button>

              {megaOpen && (
                <div className="absolute left-0 top-full z-50 w-[min(960px,calc(100vw-2rem))] rounded-b-xl rounded-tr-xl border border-white/10 bg-surface-dark p-6 shadow-2xl shadow-black/60">
                  <div className="mb-4 flex items-center justify-between">
                    <p className="font-mono text-[11px] uppercase tracking-widest text-gray-500">Shop by category</p>
                    <Link to="/shop" className="inline-flex items-center gap-1 text-sm font-semibold text-zan-cyan hover:underline">
                      Browse all products <ArrowRight className="h-4 w-4" />
                    </Link>
                  </div>
                  {isLoading ? (
                    <p className="py-6 text-center text-sm text-gray-500">Loading categories…</p>
                  ) : (
                    <div className="grid grid-cols-3 gap-1 xl:grid-cols-4">
                      {categories.map((category) => {
                        const Icon = getCategoryIcon(category.name);
                        return (
                          <Link key={category.id} to={`/shop?category_slug=${category.slug}`}
                            className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-white/5">
                            <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 transition-colors group-hover:border-zan-cyan/40 group-hover:bg-zan-cyan/10">
                              <Icon className="h-4 w-4 text-gray-400 transition-colors group-hover:text-zan-cyan" />
                            </span>
                            <span className="line-clamp-1 text-sm text-gray-300 transition-colors group-hover:text-white">{category.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>

            <nav className="flex h-full min-w-0 flex-1 items-center gap-1 overflow-x-auto [scrollbar-width:none]">
              {NAV_LINKS.map((l) => (
                <Link key={l.to} to={l.to}
                  className={cn("relative flex h-full items-center whitespace-nowrap px-3 text-sm font-medium transition-colors",
                    "after:absolute after:inset-x-3 after:bottom-0 after:h-0.5 after:bg-zan-cyan after:transition-transform after:duration-300",
                    isActive(l.to) ? "text-white after:scale-x-100" : "text-gray-400 after:scale-x-0 hover:text-white hover:after:scale-x-100",
                    l.highlight && "text-zan-cyan")}>
                  {l.label}
                </Link>
              ))}
            </nav>

            {company?.phone && (
              <a href={`tel:${company.phone}`} className="hidden items-center gap-2 text-sm text-gray-400 transition-colors hover:text-zan-cyan 2xl:flex">
                <Phone className="h-4 w-4 text-zan-cyan" />
                <span>Need help? <span className="font-semibold text-white">{company.phone}</span></span>
              </a>
            )}
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
