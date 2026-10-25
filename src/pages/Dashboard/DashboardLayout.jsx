import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { Heart, LayoutDashboard, LogOut, MapPin, Package, UserCog } from "lucide-react";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import { cn } from "../../lib/utils";

const DASHBOARD_LINKS = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Overview", end: true },
  { to: "/dashboard/orders", icon: Package, label: "Orders" },
  { to: "/dashboard/addresses", icon: MapPin, label: "Addresses" },
  { to: "/dashboard/wishlist", icon: Heart, label: "Wishlist" },
  { to: "/dashboard/account-details", icon: UserCog, label: "Account" },
];

const initials = (name = "") =>
  name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]).join("").toUpperCase() || "?";

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="container mx-auto flex-grow px-4 pb-28 pt-6 md:py-10">
        <div className="grid gap-6 lg:grid-cols-[260px_1fr] lg:gap-8">
          {/* Sidebar (tablet & desktop) */}
          <aside className="hidden lg:block">
            <div className="sticky top-36 space-y-4">
              <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-card p-4">
                <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-zan-cyan text-base font-black text-zan-dark">
                  {initials(user?.name)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{user?.name}</p>
                  <p className="truncate text-xs text-gray-400">{user?.email}</p>
                </div>
              </div>
              <nav className="rounded-2xl border border-white/10 bg-card p-2" aria-label="Account">
                {DASHBOARD_LINKS.map(({ to, icon: Icon, label, end }) => (
                  <NavLink
                    key={to}
                    to={to}
                    end={end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold transition-colors",
                        isActive ? "bg-zan-cyan/10 text-zan-cyan" : "text-gray-400 hover:bg-white/5 hover:text-white"
                      )
                    }
                  >
                    <Icon className="h-[18px] w-[18px]" /> {label}
                  </NavLink>
                ))}
                <button
                  type="button"
                  onClick={logout}
                  className="mt-1 flex w-full items-center gap-3 rounded-xl px-3.5 py-3 text-sm font-semibold text-gray-400 transition-colors hover:bg-red-500/10 hover:text-red-500"
                >
                  <LogOut className="h-[18px] w-[18px]" /> Sign out
                </button>
              </nav>
            </div>
          </aside>

          {/* Tabs (phone) */}
          <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:hidden" aria-label="Account">
            {DASHBOARD_LINKS.map(({ to, icon: Icon, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  cn(
                    "inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                    isActive ? "border-zan-cyan bg-zan-cyan text-zan-dark" : "border-white/10 bg-card text-gray-400"
                  )
                }
              >
                <Icon className="h-4 w-4" /> {label}
              </NavLink>
            ))}
          </nav>

          <div className="min-w-0">
            <Outlet />
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
