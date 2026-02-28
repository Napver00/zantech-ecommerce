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
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
              Dashboard
            </h2>
            <p className="text-gray-500 mt-1">
              Manage your account and track your robotics orders.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
            <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">
              {user.name?.charAt(0)}
            </div>
            <div className="text-sm">
              <p className="font-bold text-gray-900">{user.name}</p>
              <button
                onClick={logout}
                className="text-blue-600 hover:text-blue-700 font-medium text-xs"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-indigo-50/30 p-6 rounded-3xl border border-blue-100/50">
          <p className="text-slate-700 leading-relaxed text-lg">
            Welcome back! From here you can easily oversee your{" "}
            <Link
              to="orders"
              className="text-blue-600 hover:underline font-semibold tracking-tight"
            >
              recent orders
            </Link>
            , update your{" "}
            <Link
              to="addresses"
              className="text-blue-600 hover:underline font-semibold tracking-tight"
            >
              shipping info
            </Link>
            , and{" "}
            <Link
              to="account-details"
              className="text-blue-600 hover:underline font-semibold tracking-tight"
            >
              security settings
            </Link>
            .
          </p>
        </div>
      </div>

      {/* Quick Actions Grid */}
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Quick Actions
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {dashboardItems.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="group bg-white border border-gray-100 rounded-3xl p-5 sm:p-6 hover:border-blue-200 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300 active:scale-[0.98]"
            >
              <div className="flex items-center gap-5">
                <div className="bg-gray-50 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-all duration-300">
                  <item.icon className="h-7 w-7 text-gray-400 group-hover:text-white transition-colors" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-bold text-lg text-gray-900 group-hover:text-blue-600 transition-colors">
                      {item.label}
                    </h4>
                    <ArrowRight className="h-5 w-5 text-gray-300 group-hover:text-blue-600 transform group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-sm text-gray-500 hidden sm:block mt-1">
                    {item.description}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Account Summary Section */}
      <div className="mt-8 pt-6 border-t border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          Account Summary
        </h3>
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="bg-gray-50 rounded-lg p-4 border border-gray-200"
              >
                <Skeleton className="h-4 w-2/3 mb-2" />
                <Skeleton className="h-8 w-1/3" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg border border-red-200 flex items-center gap-3">
            <AlertTriangle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6">
            {summaryItems.map((item) => (
              <div
                key={item.label}
                className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-100 shadow-sm hover:shadow-md transition-shadow"
              >
                <p className="text-xs sm:text-sm font-medium text-gray-500 mb-2 uppercase tracking-wider">
                  {item.label}
                </p>
                <p className="text-3xl font-bold text-gray-900">
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
