import React, { useState } from 'react';
import { CheckCircle2, Eye, EyeOff, KeyRound, Loader2, LogOut, UserRound } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '../../context/AuthContext';
import { config } from '../../config';
import { isBdMobile, normalisePhone } from '../../lib/phone';

const inputCls =
  'h-11 w-full rounded-xl border border-white/10 bg-background px-3.5 text-white outline-none transition-all placeholder:text-gray-500 focus:border-zan-cyan focus:ring-2 focus:ring-zan-cyan/25';

const Notice = ({ type, children }) => (
  <p className={`rounded-xl border p-3 text-sm ${type === 'error' ? 'border-red-500/25 bg-red-500/10 text-red-500' : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-500'}`} role={type === 'error' ? 'alert' : 'status'}>
    {children}
  </p>
);

const firstError = (data, fallback) => {
  if (data?.errors && typeof data.errors === 'object') return Object.values(data.errors).flat()[0] || fallback;
  return (typeof data?.errors === 'string' && data.errors) || data?.message || fallback;
};

const AccountDetails = () => {
  const { user, userInfo, token, updateUser, logout } = useAuth();

  const [info, setInfo] = useState({
    name: user?.name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: userInfo?.address || user?.address || '',
  });
  const [savingInfo, setSavingInfo] = useState(false);
  const [infoMsg, setInfoMsg] = useState(null);

  const [pw, setPw] = useState({ current_password: '', new_password: '', new_password_confirmation: '' });
  const [showPw, setShowPw] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [pwMsg, setPwMsg] = useState(null);

  const changed = ['name', 'email', 'phone', 'address'].some((k) => (info[k] || '') !== ((k === 'address' ? userInfo?.address || user?.address : user?.[k]) || ''));

  const saveInfo = async (e) => {
    e.preventDefault();
    setInfoMsg(null);
    const phone = normalisePhone(info.phone);
    if (!info.name.trim() || !info.email.trim()) return setInfoMsg({ type: 'error', text: 'Name and email are required.' });
    if (!isBdMobile(phone)) return setInfoMsg({ type: 'error', text: 'Enter an 11-digit mobile number, e.g. 01712345678.' });

    // The API rejects an empty address, so only send it when filled in.
    const body = { name: info.name.trim(), email: info.email.trim(), phone, ...(info.address.trim() && { address: info.address.trim() }) };
    setSavingInfo(true);
    try {
      const res = await fetch(`${config.baseURL}/update-user-info`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) throw new Error(firstError(data, "Couldn't save your details."));
      updateUser(body);
      setInfo((i) => ({ ...i, phone }));
      setInfoMsg({ type: 'ok', text: 'Your details are saved.' });
      toast.success('Profile updated');
    } catch (err) {
      setInfoMsg({ type: 'error', text: err.message });
    } finally {
      setSavingInfo(false);
    }
  };

  const savePassword = async (e) => {
    e.preventDefault();
    setPwMsg(null);
    if (pw.new_password.length < 8) return setPwMsg({ type: 'error', text: 'The new password needs at least 8 characters.' });
    if (pw.new_password !== pw.new_password_confirmation) return setPwMsg({ type: 'error', text: "The new passwords don't match." });
    setSavingPw(true);
    try {
      const res = await fetch(`${config.baseURL}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(pw),
      });
      const data = await res.json();
      if (!data.success) throw new Error(firstError(data, "Couldn't change your password."));
      setPw({ current_password: '', new_password: '', new_password_confirmation: '' });
      setPwMsg({ type: 'ok', text: 'Password changed.' });
      toast.success('Password changed');
    } catch (err) {
      setPwMsg({ type: 'error', text: err.message });
    } finally {
      setSavingPw(false);
    }
  };

  const setI = (e) => setInfo((i) => ({ ...i, [e.target.name]: e.target.value }));
  const setP = (e) => setPw((p) => ({ ...p, [e.target.name]: e.target.value }));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">Account settings</h1>
        <p className="mt-1 text-sm text-gray-400">Keep your contact details up to date so deliveries reach you.</p>
      </div>

      <form onSubmit={saveInfo} className="rounded-2xl border border-white/10 bg-card">
        <div className="flex items-center gap-3 border-b border-white/10 px-5 py-4">
          <UserRound className="h-5 w-5 text-zan-cyan" />
          <h2 className="text-lg font-bold text-white">Personal details</h2>
        </div>
        <div className="space-y-4 p-5">
          {infoMsg && <Notice type={infoMsg.type}>{infoMsg.text}</Notice>}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label htmlFor="acc-name" className="mb-1.5 block text-sm font-medium text-gray-200">Full name</label>
              <input id="acc-name" name="name" value={info.name} onChange={setI} autoComplete="name" className={inputCls} />
            </div>
            <div>
              <label htmlFor="acc-email" className="mb-1.5 block text-sm font-medium text-gray-200">Email</label>
              <input id="acc-email" name="email" type="email" value={info.email} onChange={setI} autoComplete="email" className={inputCls} />
            </div>
            <div>
              <label htmlFor="acc-phone" className="mb-1.5 block text-sm font-medium text-gray-200">Mobile number</label>
              <input id="acc-phone" name="phone" type="tel" inputMode="numeric" value={info.phone} onChange={setI} autoComplete="tel" className={inputCls} />
            </div>
            <div className="sm:col-span-2">
              <label htmlFor="acc-address" className="mb-1.5 block text-sm font-medium text-gray-200">Address <span className="font-normal text-gray-500">(optional)</span></label>
              <input id="acc-address" name="address" value={info.address} onChange={setI} autoComplete="street-address" placeholder="Your home or office address" className={inputCls} />
            </div>
          </div>
          <button type="submit" disabled={savingInfo || !changed} className="inline-flex h-11 items-center gap-2 rounded-xl bg-zan-cyan px-5 text-sm font-bold text-zan-dark hover:opacity-90 disabled:opacity-50">
            {savingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Save changes
          </button>
        </div>
      </form>

      <form onSubmit={savePassword} className="rounded-2xl border border-white/10 bg-card">
        <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
          <div className="flex items-center gap-3">
            <KeyRound className="h-5 w-5 text-zan-cyan" />
            <h2 className="text-lg font-bold text-white">Password</h2>
          </div>
          <button type="button" onClick={() => setShowPw((s) => !s)} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-400 hover:text-white">
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />} {showPw ? 'Hide' : 'Show'}
          </button>
        </div>
        <div className="space-y-4 p-5">
          {pwMsg && <Notice type={pwMsg.type}>{pwMsg.text}</Notice>}
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              ['current_password', 'Current password', 'current-password'],
              ['new_password', 'New password', 'new-password'],
              ['new_password_confirmation', 'Confirm new password', 'new-password'],
            ].map(([name, label, ac]) => (
              <div key={name}>
                <label htmlFor={`acc-${name}`} className="mb-1.5 block text-sm font-medium text-gray-200">{label}</label>
                <input id={`acc-${name}`} name={name} type={showPw ? 'text' : 'password'} value={pw[name]} onChange={setP} autoComplete={ac} required className={inputCls} />
              </div>
            ))}
          </div>
          <button type="submit" disabled={savingPw} className="inline-flex h-11 items-center gap-2 rounded-xl border border-white/15 px-5 text-sm font-bold text-white hover:border-zan-cyan/40 disabled:opacity-50">
            {savingPw && <Loader2 className="h-4 w-4 animate-spin" />} Change password
          </button>
        </div>
      </form>

      <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card p-5 lg:hidden">
        <p className="text-sm text-gray-400">Signed in as <span className="font-semibold text-white">{user?.email}</span></p>
        <button type="button" onClick={logout} className="inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-red-500 hover:bg-red-500/10">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>
    </div>
  );
};

export default AccountDetails;
