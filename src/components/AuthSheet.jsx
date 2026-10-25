import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertCircle, ArrowLeft, CheckCircle2, Eye, EyeOff, Heart, KeyRound, Lock, Mail, MapPin, Package, Phone, User, Zap,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetClose } from '@/components/ui/sheet';
import { isBdMobile, normalisePhone } from '@/lib/phone';

const TITLES = {
  login: ['Welcome back', 'Sign in to track orders and check out faster.'],
  register: ['Create your account', 'It takes less than a minute.'],
  forgot: ['Reset your password', "Enter your email and we'll send you a reset link."],
  forgotSent: ['Check your email', 'Follow the link in the email to choose a new password.'],
  registerSuccess: ['Account created', 'Verify your email, then sign in.'],
};

const PERKS = [
  { icon: Package, text: 'Track every order' },
  { icon: MapPin, text: 'Saved delivery addresses' },
  { icon: Zap, text: 'One-tap checkout' },
  { icon: Heart, text: 'Keep a wishlist' },
];

const strengthOf = (pw) => {
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (pw.length < 8) return { score: 1, label: 'Too short', color: 'bg-red-500' };
  if (score <= 2) return { score: 2, label: 'Okay', color: 'bg-amber-500' };
  if (score <= 3) return { score: 3, label: 'Good', color: 'bg-zan-cyan' };
  return { score: 4, label: 'Strong', color: 'bg-emerald-500' };
};

const inputCls =
  'h-12 w-full rounded-xl border border-white/10 bg-background pl-11 pr-4 text-[15px] text-white outline-none transition-all placeholder:text-gray-500 focus:border-zan-cyan focus:ring-2 focus:ring-zan-cyan/25';

const Field = ({ id, label, icon: Icon, hint, aside, children }) => (
  <div className="space-y-1.5">
    <div className="flex items-center justify-between">
      <label htmlFor={id} className="text-sm font-semibold text-gray-200">{label}</label>
      {aside}
    </div>
    <div className="relative">
      <Icon className="pointer-events-none absolute left-4 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500" />
      {children}
    </div>
    {hint && <p className="text-xs text-gray-500">{hint}</p>}
  </div>
);

const PasswordInput = ({ id, name, value, onChange, autoComplete, placeholder, show, onToggle, minLength }) => (
  <>
    <input
      id={id}
      name={name}
      type={show ? 'text' : 'password'}
      value={value}
      onChange={onChange}
      autoComplete={autoComplete}
      placeholder={placeholder}
      minLength={minLength}
      required
      className={`${inputCls} pr-12`}
    />
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? 'Hide password' : 'Show password'}
      className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-gray-500 hover:bg-white/5 hover:text-white"
    >
      {show ? <EyeOff className="h-[18px] w-[18px]" /> : <Eye className="h-[18px] w-[18px]" />}
    </button>
  </>
);

const Spinner = () => <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />;

export const AuthSheet = () => {
  const {
    login, register, loading, error, setError, resendVerificationEmail, forgotPassword, authView, setAuthView,
  } = useAuth();
  const view = authView || 'login';
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [fieldError, setFieldError] = useState('');
  const [registeredEmail, setRegisteredEmail] = useState('');

  useEffect(() => {
    setShowPassword(false);
    setFieldError('');
  }, [view]);

  const go = (next) => {
    setError(null);
    setAuthView(next);
  };

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    await login(form.email.trim(), form.password);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    const phone = normalisePhone(form.phone);
    if (!isBdMobile(phone)) {
      setFieldError('Enter an 11-digit Bangladeshi mobile number, e.g. 01712345678.');
      return;
    }
    const email = form.email.trim();
    const result = await register(form.name.trim(), email, phone, form.password);
    if (!result.success) return;
    // Sign-in doesn't wait for verification, so log the new customer straight in.
    const signedIn = await login(email, form.password);
    if (signedIn.success) {
      toast.success('Account created', { description: `We've sent a verification link to ${email}.`, duration: 6000 });
      setAuthView('login');
      setForm({ name: '', email: '', phone: '', password: '' });
    } else {
      setRegisteredEmail(email);
      setAuthView('registerSuccess');
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    const result = await forgotPassword(form.email.trim());
    if (result.success) {
      setRegisteredEmail(form.email.trim());
      setAuthView('forgotSent');
    }
  };

  const strength = strengthOf(form.password);
  const [title, subtitle] = TITLES[view] || TITLES.login;
  const message = fieldError || error;

  return (
    <SheetContent className="flex w-full flex-col gap-0 overflow-y-auto border-l border-white/10 bg-card p-0 sm:max-w-md">
      <SheetHeader className="sr-only">
        <SheetTitle>{title}</SheetTitle>
        <SheetDescription>{subtitle}</SheetDescription>
      </SheetHeader>

      {/* Brand header */}
      <div className="relative overflow-hidden border-b border-white/10 bg-surface-2 px-6 pb-6 pt-10">
        <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
        <div className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full bg-zan-cyan/15 blur-3xl" />
        <div className="relative">
          <img src="/zantech-mark.png" alt="" className="h-10 w-10 object-contain" />
          <h2 className="mt-4 text-2xl font-black tracking-tight text-white">{title}</h2>
          <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        </div>
      </div>

      <div className="flex-1 px-6 py-6">
        {/* Sign in / Create account switch */}
        {(view === 'login' || view === 'register') && (
          <div className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-background p-1" role="tablist">
            {[['login', 'Sign in'], ['register', 'Create account']].map(([v, label]) => (
              <button
                key={v}
                type="button"
                role="tab"
                aria-selected={view === v}
                onClick={() => go(v)}
                className={`h-10 rounded-lg text-sm font-bold transition-colors ${view === v ? 'bg-card text-white shadow-sm' : 'text-gray-400 hover:text-white'}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}

        {message && !['forgotSent', 'registerSuccess'].includes(view) && (
          <div className="mb-5 flex items-start gap-2.5 rounded-xl border border-red-500/25 bg-red-500/10 p-3.5 text-sm text-red-500" role="alert">
            <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {view === 'login' && (
          <form onSubmit={handleLogin} className="space-y-4">
            <Field id="login-email" label="Email" icon={Mail}>
              <input id="login-email" name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" placeholder="you@example.com" required className={inputCls} />
            </Field>
            <Field
              id="login-password"
              label="Password"
              icon={Lock}
              aside={<button type="button" onClick={() => go('forgot')} className="text-xs font-semibold text-zan-cyan hover:underline">Forgot password?</button>}
            >
              <PasswordInput id="login-password" name="password" value={form.password} onChange={onChange} autoComplete="current-password" placeholder="Your password" show={showPassword} onToggle={() => setShowPassword((s) => !s)} />
            </Field>
            <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zan-cyan font-bold text-zan-dark transition-opacity hover:opacity-90 disabled:opacity-60">
              {loading ? <><Spinner /> Signing in…</> : 'Sign in'}
            </button>
            <p className="text-center text-sm text-gray-400">
              New here?{' '}
              <button type="button" onClick={() => go('register')} className="font-semibold text-zan-cyan hover:underline">Create a free account</button>
            </p>
          </form>
        )}

        {view === 'register' && (
          <form onSubmit={handleRegister} className="space-y-4">
            <Field id="register-name" label="Full name" icon={User}>
              <input id="register-name" name="name" value={form.name} onChange={onChange} autoComplete="name" placeholder="Your name" required className={inputCls} />
            </Field>
            <Field id="register-phone" label="Mobile number" icon={Phone} hint="We'll call this number about deliveries.">
              <input id="register-phone" name="phone" type="tel" inputMode="numeric" value={form.phone} onChange={onChange} autoComplete="tel" placeholder="01712345678" required className={inputCls} />
            </Field>
            <Field id="register-email" label="Email" icon={Mail} hint="Order updates and invoices are sent here.">
              <input id="register-email" name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" placeholder="you@example.com" required className={inputCls} />
            </Field>
            <div className="space-y-1.5">
              <Field id="register-password" label="Password" icon={Lock}>
                <PasswordInput id="register-password" name="password" value={form.password} onChange={onChange} autoComplete="new-password" placeholder="At least 8 characters" minLength={8} show={showPassword} onToggle={() => setShowPassword((s) => !s)} />
              </Field>
              {form.password && (
                <div className="flex items-center gap-3">
                  <div className="grid flex-1 grid-cols-4 gap-1">
                    {[1, 2, 3, 4].map((i) => (
                      <span key={i} className={`h-1.5 rounded-full ${i <= strength.score ? strength.color : 'bg-white/10'}`} />
                    ))}
                  </div>
                  <span className="w-16 text-right text-xs font-medium text-gray-400">{strength.label}</span>
                </div>
              )}
            </div>
            <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zan-cyan font-bold text-zan-dark transition-opacity hover:opacity-90 disabled:opacity-60">
              {loading ? <><Spinner /> Creating account…</> : 'Create account'}
            </button>
            <p className="text-center text-xs leading-relaxed text-gray-500">
              By creating an account you agree to our{' '}
              <SheetClose asChild><Link to="/terms" className="text-zan-cyan hover:underline">Terms</Link></SheetClose> and{' '}
              <SheetClose asChild><Link to="/privacy-policy" className="text-zan-cyan hover:underline">Privacy Policy</Link></SheetClose>.
            </p>
          </form>
        )}

        {view === 'forgot' && (
          <form onSubmit={handleForgot} className="space-y-4">
            <button type="button" onClick={() => go('login')} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white">
              <ArrowLeft className="h-4 w-4" /> Back to sign in
            </button>
            <Field id="forgot-email" label="Email" icon={Mail}>
              <input id="forgot-email" name="email" type="email" value={form.email} onChange={onChange} autoComplete="email" placeholder="you@example.com" required className={inputCls} />
            </Field>
            <button type="submit" disabled={loading} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-zan-cyan font-bold text-zan-dark transition-opacity hover:opacity-90 disabled:opacity-60">
              {loading ? <><Spinner /> Sending…</> : <><KeyRound className="h-4 w-4" /> Send reset link</>}
            </button>
          </form>
        )}

        {(view === 'forgotSent' || view === 'registerSuccess') && (
          <div className="space-y-5 text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-500">
              <CheckCircle2 className="h-8 w-8" />
            </span>
            <div className="rounded-xl border border-zan-cyan/25 bg-zan-cyan/5 p-4">
              <p className="text-sm text-gray-400">{view === 'forgotSent' ? 'Reset link sent to' : 'Verification link sent to'}</p>
              <p className="mt-1 break-all font-bold text-white">{registeredEmail}</p>
            </div>
            <p className="text-sm text-gray-400">Can't find it? Check your spam or promotions folder.</p>
            <button type="button" onClick={() => go('login')} className="h-12 w-full rounded-xl bg-zan-cyan font-bold text-zan-dark transition-opacity hover:opacity-90">
              Back to sign in
            </button>
            {view === 'registerSuccess' && (
              <button
                type="button"
                disabled={loading}
                onClick={() => resendVerificationEmail(registeredEmail)}
                className="h-12 w-full rounded-xl border border-white/15 font-semibold text-white transition-colors hover:border-zan-cyan/40 disabled:opacity-60"
              >
                Resend verification email
              </button>
            )}
          </div>
        )}

        {(view === 'login' || view === 'register') && (
          <div className="mt-8 rounded-2xl border border-white/10 bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">With an account you can</p>
            <ul className="mt-3 grid grid-cols-2 gap-3">
              {PERKS.map(({ icon: Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-sm text-gray-300">
                  <Icon className="h-4 w-4 flex-shrink-0 text-zan-cyan" /> {text}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </SheetContent>
  );
};
