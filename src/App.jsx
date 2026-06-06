import React, { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { Toaster } from "sonner";
import ProtectedRoute from "./components/ProtectedRoute";
import QuickSupport from "./components/QuickSupport";

// Lazy load pages
const HomePage = lazy(() => import("./pages/HomePage"));
const About = lazy(() => import("./pages/About"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const ReturnPolicy = lazy(() => import("./pages/ReturnPolicy"));
const Contact = lazy(() => import("./pages/Contact"));
const ProductPage = lazy(() => import("./pages/ProductPage"));
const Shop = lazy(() => import("./pages/Shop"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Faq = lazy(() => import("./pages/Faq"));
const Blog = lazy(() => import("./pages/Blog"));
const PostDetails = lazy(() => import("./pages/PostDetails"));
const Tutorials = lazy(() => import("./pages/Tutorials"));

// Lazy load Dashboard components
const DashboardLayout = lazy(() => import("./pages/Dashboard/DashboardLayout"));
const DashboardHome = lazy(() => import("./pages/Dashboard/DashboardHome"));
const Orders = lazy(() => import("./pages/Dashboard/Orders"));
const OrderDetails = lazy(() => import("./pages/Dashboard/OrderDetails"));
const Downloads = lazy(() => import("./pages/Dashboard/Downloads"));
const Addresses = lazy(() => import("./pages/Dashboard/Addresses"));
const AccountDetails = lazy(() => import("./pages/Dashboard/AccountDetails"));
const Wishlist = lazy(() => import("./pages/Dashboard/Wishlist"));

// 404 page
const NotFound = () => (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
    <div className="text-center max-w-md">
      <div className="text-8xl font-black text-gray-200 mb-4">404</div>
      <h1 className="text-2xl font-black text-gray-900 mb-2">Page Not Found</h1>
      <p className="text-gray-500 mb-8">The page you're looking for doesn't exist or has been moved.</p>
      <a href="/" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
        Back to Home
      </a>
    </div>
  </div>
);

// Redirect /search?q=term → /shop?search=term
const SearchRedirect = () => {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const q = params.get("q") || "";
  return <Navigate to={`/shop?search=${encodeURIComponent(q)}`} replace />;
};

// Simple loading fallback
const PageLoader = () => (
  <div className="fixed inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center">
    <div className="w-10 h-10 border-4 border-blue-600/20 border-t-blue-600 rounded-full animate-spin" />
  </div>
);

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <CartProvider>
          <BrowserRouter>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/shop" element={<Shop />} />
                <Route path="/blog" element={<Blog />} />
                <Route path="/tutorials" element={<Tutorials />} />
                <Route path="/postdetails/:slug" element={<PostDetails />} />
                <Route path="/about" element={<About />} />
                <Route path="/terms" element={<Terms />} />
                <Route path="/privacy-policy" element={<Privacy />} />
                <Route path="/return-policy" element={<ReturnPolicy />} />
                <Route path="/contact" element={<Contact />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/product/:slug" element={<ProductPage />} />
                <Route path="/checkout" element={<Checkout />} />
                <Route path="/search" element={<SearchRedirect />} />

                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <DashboardLayout />
                    </ProtectedRoute>
                  }
                >
                  <Route index element={<DashboardHome />} />
                  <Route path="orders" element={<Orders />} />
                  <Route
                    path="orders/:invoiceCode"
                    element={<OrderDetails />}
                  />
                  <Route path="downloads" element={<Downloads />} />
                  <Route path="addresses" element={<Addresses />} />
                  <Route path="account-details" element={<AccountDetails />} />
                  <Route path="wishlist" element={<Wishlist />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          <Toaster
            position="top-right"
            expand={true}
            richColors
            closeButton
            duration={4000}
            toastOptions={{
              style: {
                borderRadius: "12px",
                padding: "16px",
              },
              className: "toast-notification",
            }}
          />
        </CartProvider>
      </AuthProvider>
      <QuickSupport />
    </HelmetProvider>
  );
}

export default App;
