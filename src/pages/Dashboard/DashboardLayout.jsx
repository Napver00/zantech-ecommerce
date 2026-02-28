import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import Header from "../../components/Header";
import Footer from "../../components/Footer";
import { useAuth } from "../../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Download,
  MapPin,
  User,
  LogOut,
  Heart,
} from "lucide-react";
import { cn } from "../../lib/utils";

const DashboardLayout = () => {
  const { user, logout } = useAuth();

  const navLinks = [
    { to: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { to: "orders", icon: Package, label: "Orders" },
    { to: "downloads", icon: Download, label: "Downloads" },
    { to: "addresses", icon: MapPin, label: "Addresses" },
    { to: "account-details", icon: User, label: "Account Details" },
    { to: "wishlist", icon: Heart, label: "Wishlist" },
  ];

  if (!user) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 text-center">
          <p>Loading user data...</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8 sm:py-12">
        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 overflow-hidden">
          <div className="flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 lg:w-72 flex-shrink-0 border-r border-gray-100 bg-gray-50/50">
              <div className="p-6">
                <div className="mb-8">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 px-4">
                    Menu
                  </p>
                </div>
                <nav className="space-y-2">
                  {navLinks.map((link) => (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      end={link.to === "/dashboard"}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300",
                          isActive
                            ? "bg-white text-blue-600 shadow-sm border border-gray-100 transform scale-[1.02]"
                            : "text-gray-500 hover:text-gray-900 hover:bg-white/50",
                        )
                      }
                    >
                      <link.icon className="h-5 w-5" />
                      <span>{link.label}</span>
                    </NavLink>
                  ))}
                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-3 px-4 py-3.5 text-sm font-bold rounded-2xl transition-all duration-300 text-gray-400 hover:text-red-500 hover:bg-red-50 mt-4"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>Logout</span>
                  </button>
                </nav>
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0 bg-white">
              <div className="p-6 sm:p-10 lg:p-12">
                <Outlet />
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default DashboardLayout;
