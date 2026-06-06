import React, { createContext, useContext, useState, useEffect } from "react";
import { config } from "../config";
import { toast } from "sonner";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthSheetOpen, setIsAuthSheetOpen] = useState(false);

  const fetchUserInfo = async (authToken) => {
    try {
      const response = await fetch(`${config.baseURL}/users/info`, {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      if (!response.ok) throw new Error('Could not fetch user info.');
      const data = await response.json();
      if (data.success) setUserInfo(data.data);
    } catch (err) {
      console.error("Failed to fetch user info:", err);
    }
  };

  const fetchWishlist = async (authToken) => {
    try {
        const response = await fetch(`${config.baseURL}/wishlist`, {
            headers: { 'Authorization': `Bearer ${authToken}` }
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = await response.json();
        if (data.success && Array.isArray(data.data)) {
            const wishlistProductIds = data.data.map(item => item.product_id);
            setWishlist(wishlistProductIds);
        }
    } catch (err) {
        // silently fail — wishlist is non-critical on load
    }
  };


  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    const storedUser = localStorage.getItem("user");
    if (storedToken && storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setToken(storedToken);
      setUser(parsedUser);
      fetchUserInfo(storedToken);
      fetchWishlist(storedToken); // Fetch wishlist on initial load
    }
  }, []);

  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.baseURL}/users/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Login failed");
      }

      const loggedInUser = {
        id: data.data.id,
        name: data.data.name,
        email: data.data.email,
        phone: data.data.phone,
      };

      setUser(loggedInUser);
      setToken(data.data.token);
      localStorage.setItem("token", data.data.token);
      localStorage.setItem("user", JSON.stringify(loggedInUser));
      
      await fetchUserInfo(data.data.token);
      await fetchWishlist(data.data.token); // Fetch wishlist after login

      setIsAuthSheetOpen(false); 

      toast.success("Welcome back!", {
        description: `Logged in as ${loggedInUser.name}`,
        duration: 3000,
      });

      return { success: true, user: loggedInUser };
    } catch (err) {
      setError(err.message);
      toast.error("Login failed", {
        description: err.message,
        duration: 4000,
      });
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, phone, password) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`${config.baseURL}/users/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, password }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Registration failed");
      }
      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      toast.error("Registration failed", {
        description: err.message,
        duration: 4000,
      });
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const resendVerificationEmail = async (email) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `${config.baseURL}/email/resend-verification`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to resend verification email.");
      }

      toast.success("Verification email sent", {
        description: "Please check your inbox",
        duration: 4000,
      });

      return { success: true, message: data.message };
    } catch (err) {
      setError(err.message);
      toast.error("Failed to send email", {
        description: err.message,
        duration: 4000,
      });
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const addToWishlist = async (productId) => {
    if (!user) {
      toast.error("Login required", {
        description: "Please login first to add items to your wishlist",
        duration: 4000,
      });
      setIsAuthSheetOpen(true);
      return { success: false, message: "User not logged in." };
    }

    setLoading(true);
    try {
      const response = await fetch(`${config.baseURL}/wishlist`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ user_id: user.id, product_id: productId }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.message || "Failed to add to wishlist.");
      }

      setWishlist((prev) => [...prev, productId]);
      await fetchUserInfo(token);

      toast.success("Added to wishlist", {
        description: "Product saved to your wishlist",
        duration: 3000,
      });

      return { success: true, data: data.data };
    } catch (err) {
      toast.error("Failed to add to wishlist", {
        description: err.message,
        duration: 4000,
      });
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setUserInfo(null);
    setWishlist([]); // Clear wishlist on logout
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    toast.success("Logged out", {
      description: "You have been successfully logged out",
      duration: 3000,
    });
  };

  const value = {
    user,
    token,
    userInfo,
    loading,
    error,
    login,
    register,
    logout,
    resendVerificationEmail,
    addToWishlist,
    wishlist,
    isAuthSheetOpen,
    setIsAuthSheetOpen,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};