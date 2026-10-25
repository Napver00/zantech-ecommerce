import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, ArrowUpRight, CheckCircle, ChevronRight, Clock, Copy, Home, Mail, MapPin, Phone, Send,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import WhatsAppIcon from "@/components/WhatsAppIcon";
import { config } from "@/config";
import { useCompany } from "@/context/CompanyContext";

const WHATSAPP = "8801894634149";
const HOURS = "Saturday – Thursday, 10 AM – 6 PM";
const FALLBACK = {
  phone: "+880 1894634149",
  email: "zantechbd@gmail.com",
  location: "House 48, Road 9/C, Sector 5, Uttara, Dhaka - 1230, Bangladesh",
};

// Picking a topic fills the subject, so messages arrive already sorted.
const TOPICS = ["Order help", "Product question", "Bulk / school order", "Return or exchange", "Custom project", "Other"];

const EMPTY = { f_name: "", l_name: "", email: "", project_type: "", message: "" };

const inputCls =
  "w-full rounded-xl border border-white/10 bg-background px-4 py-3 text-white outline-none transition-all placeholder:text-gray-500 focus:border-zan-cyan focus:bg-card focus:ring-2 focus:ring-zan-cyan/30";

const Contact = () => {
  const company = useCompany();
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState("");

  const phone = company?.phone || FALLBACK.phone;
  const email = company?.email || FALLBACK.email;
  const location = company?.location || FALLBACK.location;
  const mapUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`ZAN Tech, ${location}`)}`;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const copy = (label, text) => {
    navigator.clipboard?.writeText(text).then(() => {
      setCopied(label);
      setTimeout(() => setCopied(""), 1800);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setSuccess(null);
    setError(null);
    try {
      const res = await fetch(`${config.baseURL}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.success) {
        if (res.status === 429) throw new Error("Too many messages in a short time. Please wait a minute and try again.");
        throw new Error(json.message || "Failed to send message");
      }
      setSuccess(json.message || "Thanks! We'll reply by email soon.");
      setForm(EMPTY);
    } catch (err) {
      console.error("Contact submit error:", err);
      setError(err.message || "Failed to send message");
    } finally {
      setLoading(false);
    }
  };

  const channels = [
    {
      icon: WhatsAppIcon,
      title: "WhatsApp",
      text: "Fastest reply",
      value: phone,
      href: `https://wa.me/${WHATSAPP}?text=${encodeURIComponent("Hi ZAN Tech Store, ")}`,
      external: true,
      tint: "bg-[#25D366]/15 text-[#25D366]",
    },
    { icon: Phone, title: "Call us", text: HOURS, value: phone, href: `tel:${phone.replace(/\s+/g, "")}`, tint: "bg-zan-cyan/10 text-zan-cyan" },
    { icon: Mail, title: "Email", text: "Reply within 24 hours", value: email, href: `mailto:${email}`, tint: "bg-violet-500/10 text-violet-500" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo
        title="Contact ZAN Tech Store - Robotics & IoT Support in Bangladesh"
        description="Get in touch with ZAN Tech Store for product queries, orders, bulk and school orders, technical support or custom projects."
        url="https://store.zantechbd.com/contact"
        type="website"
      />
      <Header />

      <main className="flex-grow">
        {/* Header */}
        <section className="relative overflow-hidden border-b border-white/10 bg-surface-2">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
          <div className="pointer-events-none absolute -top-32 right-[-10%] h-[380px] w-[380px] rounded-full bg-zan-cyan/10 blur-[110px]" />
          <div className="container relative mx-auto px-4 py-8 md:py-12">
            <nav className="flex items-center gap-1 text-xs text-gray-400" aria-label="Breadcrumb">
              <Link to="/" className="flex items-center gap-1 transition-colors hover:text-white">
                <Home className="h-3.5 w-3.5" /> Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-gray-300">Contact</span>
            </nav>
            <p className="mt-6 font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-zan-cyan">Contact us</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">We're here to help</h1>
            <p className="mt-3 max-w-2xl text-gray-400 md:text-lg">
              Questions about a product, an order, a bulk purchase for your school or a custom project? Pick whichever way suits you.
            </p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {channels.map(({ icon: Icon, title, text, value, href, external, tint }) => (
                <a
                  key={title}
                  href={href}
                  {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
                  className="group flex items-center gap-4 rounded-2xl border border-white/10 bg-card p-4 transition-all hover:-translate-y-0.5 hover:border-zan-cyan/40"
                >
                  <span className={`inline-flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl ${tint}`}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="block font-bold text-white">{title}</span>
                    <span className="block truncate text-sm text-gray-300">{value}</span>
                    <span className="block text-xs text-gray-500">{text}</span>
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
            {/* Form */}
            <div className="rounded-2xl border border-white/10 bg-card p-5 md:p-8">
              <h2 className="text-xl font-bold text-white md:text-2xl">Send us a message</h2>
              <p className="mt-1 text-sm text-gray-400">We answer by email, usually within one working day.</p>

              {success && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-emerald-500/25 bg-emerald-500/10 p-4" role="status">
                  <CheckCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-emerald-500" />
                  <div>
                    <p className="font-semibold text-emerald-500">Message sent</p>
                    <p className="mt-0.5 text-sm text-emerald-500">{success}</p>
                  </div>
                </div>
              )}
              {error && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-500/25 bg-red-500/10 p-4" role="alert">
                  <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                  <div>
                    <p className="font-semibold text-red-500">Couldn't send</p>
                    <p className="mt-0.5 text-sm text-red-500">{error}</p>
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <fieldset>
                  <legend className="mb-2 text-sm font-medium text-gray-200">What's it about?</legend>
                  <div className="flex flex-wrap gap-2">
                    {TOPICS.map((t) => (
                      <button
                        key={t}
                        type="button"
                        onClick={() => setForm((prev) => ({ ...prev, project_type: prev.project_type === t ? "" : t }))}
                        aria-pressed={form.project_type === t}
                        className={`rounded-full border px-3.5 py-1.5 text-sm font-medium transition-colors ${
                          form.project_type === t
                            ? "border-zan-cyan bg-zan-cyan text-zan-dark"
                            : "border-white/10 bg-background text-gray-300 hover:border-white/25"
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </fieldset>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="f_name" className="text-sm font-medium text-gray-200">First name</label>
                    <input id="f_name" name="f_name" value={form.f_name} onChange={handleChange} className={inputCls} placeholder="Your first name" autoComplete="given-name" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="l_name" className="text-sm font-medium text-gray-200">Last name</label>
                    <input id="l_name" name="l_name" value={form.l_name} onChange={handleChange} className={inputCls} placeholder="Your last name" autoComplete="family-name" required />
                  </div>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-gray-200">Email</label>
                    <input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={inputCls} placeholder="you@example.com" autoComplete="email" required />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="project_type" className="text-sm font-medium text-gray-200">Subject</label>
                    <input id="project_type" name="project_type" value={form.project_type} onChange={handleChange} className={inputCls} placeholder="e.g. Order #ZT1234" />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-gray-200">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    rows={5}
                    value={form.message}
                    onChange={handleChange}
                    className={`${inputCls} resize-y`}
                    placeholder="Tell us what you need. For orders, include your order number."
                    required
                  />
                </div>

                <div className="flex flex-col-reverse items-stretch gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-xs text-gray-500">
                    By sending, you agree to our <Link to="/privacy-policy" className="text-zan-cyan hover:underline">Privacy Policy</Link>.
                  </p>
                  <button
                    type="submit"
                    disabled={loading}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zan-cyan px-7 py-3.5 font-bold text-zan-dark transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <>
                        <span className="h-5 w-5 animate-spin rounded-full border-2 border-current border-t-transparent" />
                        Sending…
                      </>
                    ) : (
                      <>
                        Send message <Send className="h-4 w-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* Visit */}
            <aside className="space-y-4">
              <div className="overflow-hidden rounded-2xl border border-white/10 bg-card">
                <iframe
                  src="https://maps.google.com/maps?q=23.863472,90.387222&t=&z=15&ie=UTF8&iwloc=&output=embed"
                  className="h-56 w-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="ZAN Tech office location"
                />
                <div className="space-y-4 p-5">
                  <div className="flex gap-3">
                    <MapPin className="mt-0.5 h-5 w-5 flex-shrink-0 text-zan-cyan" />
                    <div className="min-w-0">
                      <p className="font-bold text-white">Visit our office</p>
                      <p className="mt-0.5 text-sm leading-relaxed text-gray-400">{location}</p>
                      <div className="mt-2 flex flex-wrap gap-3 text-sm font-semibold">
                        <a href={mapUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-zan-cyan hover:underline">
                          Directions <ArrowUpRight className="h-3.5 w-3.5" />
                        </a>
                        <button type="button" onClick={() => copy("address", location)} className="inline-flex items-center gap-1 text-gray-400 hover:text-white">
                          <Copy className="h-3.5 w-3.5" /> {copied === "address" ? "Copied" : "Copy address"}
                        </button>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 border-t border-white/10 pt-4">
                    <Clock className="mt-0.5 h-5 w-5 flex-shrink-0 text-zan-cyan" />
                    <div>
                      <p className="font-bold text-white">Opening hours</p>
                      <p className="mt-0.5 text-sm text-gray-400">{HOURS}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border border-white/10 bg-card p-5">
                <p className="font-bold text-white">Quick answers</p>
                <ul className="mt-3 space-y-1">
                  {[
                    { to: "/faq", label: "Frequently asked questions" },
                    { to: "/return-policy", label: "Returns & refunds" },
                    { to: "/dashboard/orders", label: "Track your order" },
                  ].map((l) => (
                    <li key={l.to}>
                      <Link to={l.to} className="flex items-center justify-between rounded-lg px-2 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5 hover:text-white">
                        {l.label} <ChevronRight className="h-4 w-4 text-gray-500" />
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Contact;
