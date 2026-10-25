import React from 'react';
import { Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

/**
 * Account pages need a signed-in user. Instead of bouncing visitors to the
 * home page, ask them to sign in right here; once they do, the page they
 * wanted renders in place.
 */
const ProtectedRoute = ({ children }) => {
  const { user, token, openAuth } = useAuth();

  if (token && user) return children;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main className="flex flex-grow items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-8 text-center shadow-xl">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zan-cyan/10 text-zan-cyan">
            <Lock className="h-7 w-7" />
          </span>
          <h1 className="mt-5 text-2xl font-black text-white">Sign in to see your account</h1>
          <p className="mt-2 text-gray-400">Your orders, saved addresses and wishlist are waiting.</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => openAuth('login')}
              className="h-12 rounded-xl bg-zan-cyan font-bold text-zan-dark transition-opacity hover:opacity-90"
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => openAuth('register')}
              className="h-12 rounded-xl border border-white/15 font-semibold text-white transition-colors hover:border-zan-cyan/40"
            >
              Create account
            </button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ProtectedRoute;
