import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { config } from "../../config";
import {
  Package,
  Download,
  MapPin,
  User,
  Heart,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { Skeleton } from "../../components/ui/skeleton";

const DashboardHome = () => {
  const { user, logout, token } = useAuth();
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserInfo = async () => {
      if (!token) return;
      try {
        const response = await fetch(`${config.baseURL}/users/info`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!response.ok) {
          throw new Error("Could not fetch user summary.");
        }
        const data = await response.json();
        if (data.success) {
          setUserInfo(data.data);
        } else {
          throw new Error(data.message || "Failed to get user info.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserInfo();
  }, [token]);

  const dashboardItems = [
    {
      to: "orders",
      icon: Package,
      label: "Orders",
      description: "View and track your orders",
    },
    {
      to: "downloads",
      icon: Download,
      label: "Downloads",
      description: "Access your downloads",
    },
    {
      to: "addresses",
      icon: MapPin,
      label: "Addresses",
      description: "Manage shipping addresses",
    },
    {
      to: "account-details",
      icon: User,
      label: "Account Details",
      description: "Update your information",
    },
    {
      to: "wishlist",
      icon: Heart,
      label: "Wishlist",
      description: "View saved items",
    },
  ];

  const summaryItems = [
    { label: "Total Orders", value: userInfo?.total_orders },
    { label: "Wishlist Items", value: userInfo?.total_wishlist },
    { label: "Addresses", value: userInfo?.total_shipping_addr },
    { label: "Downloads", value: 0 }, // Assuming downloads are not in the API yet
  ];

  return (
    <div>
      {/* Welcome Message - Minimalist */}
      <div className="mb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-white tracking-tight">
              Dashboard
            </h2>
            <p className="text-gray-400 mt-1">
              Manage your account and track your robotics orders.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-background px-4 py-2 rounded-2xl border border-white/10">
            <div className="w-10 h-10 rounded-full bg-zan-cyan text-zan-dark flex items-center justify-center font-bold">
              {user.name?.charAt(0)}
            </div>
            <div className="text-sm">
              <p className="font-bold text-white">{user.name}</p>
              <button
                onClick={logout}
                className="text-zan-cyan hover:text-zan-cyan font-medium text-xs"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="bg-zan-cyan/5 p-6 rounded-3xl border border-zan-cyan/20">
          <p className="text-gray-200 leading-relaxed text-lg">
            Welcome back! From here you can easily oversee your{" "}
            <Link
              to="orders"
              className="text-zan-cyan hover:underline font-semibold tracking-tight"
            >
              recent orders
            </Link>
            , update your{" "}
            <Link
              to="addresses"
              className="text-zan-cyan hover:underline font-semibold tracking-tight"
            >
              shipping info
            </Link>
            , and{" "}
            <Link
              to="account-details"
              className="text-zan-cyan hover:underline font-semibold tracking-tight"
            >
              security settings
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-semibold text-white mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group bg-card border border-white/10 rounded-3xl p-5 sm:p-6 hover:border-zan-cyan/20 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="bg-background w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-zan-cyan transition-all duration-300">
                  <item.icon className="h-7 w-7 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-lg text-white group-hover:text-zan-cyan transition-colors">
                      {item.label}
                    </h4>
                    <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-zan-cyan transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-gray-400 hidden sm:block mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Account Summary Section */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-3">
          Account Summary
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-background rounded-lg p-4 border border-white/10"
              >
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-500/10 text-red-300 p-4 rounded-lg border border-red-500/25 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="bg-card rounded-3xl p-5 sm:p-6 border border-white/10 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs sm:text-sm font-medium text-gray-400 mb-2 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-3xl font-bold text-white">
                  {item.value ?? 0}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardHome;
