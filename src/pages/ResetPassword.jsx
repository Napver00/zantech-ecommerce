import React, { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { AlertCircle, CheckCircle2, Eye, EyeOff, KeyRound, Lock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { useAuth } from "@/context/AuthContext";

const inputCls =
  "h-12 w-full rounded-xl border border-white/10 bg-background pl-11 pr-12 text-white outline-none transition-all placeholder:text-gray-500 focus:border-zan-cyan focus:ring-2 focus:ring-zan-cyan/25";

/** Landing page for the "Reset your password" email link (/auth/reset?token=…&email=…). */
const ResetPassword = () => {
  const [params] = useSearchParams();
  const { resetPassword, loading, openAuth } = useAuth();
  const token = params.get("token") || "";
  const email = params.get("email") || "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const linkBroken = !token || !email;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("The two passwords don't match.");
    const result = await resetPassword({ email, token, password, password_confirmation: confirm });
    if (result.success) setDone(true);
    else setError(result.message);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo title="Reset password - ZAN Tech Store" url="https://store.zantechbd.com/auth/reset" />
      <Header />
      <main className="flex flex-grow items-center justify-center px-4 py-12">
        <div className="w-full max-w-md rounded-3xl border border-white/10 bg-card p-6 shadow-xl md:p-8">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-zan-cyan/10 text-zan-cyan">
            {done ? <CheckCircle2 className="h-6 w-6" /> : <KeyRound className="h-6 w-6" />}
          </span>

          {done ? (
            <>
              <h1 className="mt-5 text-2xl font-black text-white">Password updated</h1>
              <p className="mt-2 text-gray-400">You can now sign in with your new password.</p>
              <button
                type="button"
                onClick={() => openAuth("login")}
                className="mt-6 h-12 w-full rounded-xl bg-zan-cyan font-bold text-zan-dark transition-opacity hover:opacity-90"
              >
                Sign in
              </button>
            </>
          ) : linkBroken ? (
            <>
              <h1 className="mt-5 text-2xl font-black text-white">This link doesn't work</h1>
              <p className="mt-2 text-gray-400">It may be incomplete or out of date. Ask for a new reset link and try again.</p>
              <button
                type="button"
                onClick={() => openAuth("forgot")}
                className="mt-6 h-12 w-full rounded-xl bg-zan-cyan font-bold text-zan-dark transition-opacity hover:opacity-90"
              >
                Send a new link
              </button>
            </>
          ) : (
            <>
              <h1 className="mt-5 text-2xl font-black text-white">Choose a new password</h1>
              <p className="mt-2 break-all text-sm text-gray-400">For {email}</p>
              {error && (
                <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-sm text-red-500" role="alert">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" /> {error}
                </div>
              )}
              <form onSubmit={handleSubmit} className="mt-6 space-y-4">
                {[
                  { id: "new-password", label: "New password", value: password, set: setPassword, placeholder: "At least 8 characters" },
                  { id: "confirm-password", label: "Confirm password", value: confirm, set: setConfirm, placeholder: "Type it again" },
                ].map((f) => (
                  <div key={f.id} className="space-y-1.5">
                    <label htmlFor={f.id} className="text-sm font-semibold text-gray-200">{f.label}</label>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
                      <input
                        id={f.id}
                        type={show ? "text" : "password"}
                        value={f.value}
                        onChange={(e) => f.set(e.target.value)}
                        autoComplete="new-password"
                        placeholder={f.placeholder}
                        minLength={8}
                        required
                        className={inputCls}
                      />
                      <button
                        type="button"
                        onClick={() => setShow((s) => !s)}
                        aria-label={show ? "Hide passwords" : "Show passwords"}
                        className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white"
                      >
                        {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
                      </button>
                    </div>
                  </div>
                ))}
                <button
                  type="submit"
                  disabled={loading}
                  className="h-12 w-full rounded-xl bg-zan-cyan font-bold text-zan-dark transition-opacity hover:opacity-90 disabled:opacity-60"
                >
                  {loading ? "Saving…" : "Save new password"}
                </button>
              </form>
            </>
          )}
          <p className="mt-6 text-center text-sm text-gray-500">
            Need help? <Link to="/contact" className="font-semibold text-zan-cyan hover:underline">Contact us</Link>
          </p>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ResetPassword;
