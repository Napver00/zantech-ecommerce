import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  AlertCircle, ArrowRight, CalendarClock, ChevronDown, ChevronRight, Clock, Home, Mail, Phone, Printer,
} from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";
import { Skeleton } from "@/components/ui/skeleton";
import { config } from "@/config";
import { useCompany } from "@/context/CompanyContext";
import { splitDocument } from "@/lib/legalDoc";
import WhatsAppIcon from "@/components/WhatsAppIcon";

const WHATSAPP = "8801894634149";

const POLICIES = [
  { to: "/terms", label: "Terms & Conditions", desc: "Ordering, pricing, delivery and your responsibilities." },
  { to: "/privacy-policy", label: "Privacy Policy", desc: "What we collect and how we keep it safe." },
  { to: "/return-policy", label: "Return Policy", desc: "Returns, refunds, exchanges and cancellations." },
];

/**
 * Store policy page. The text is managed in the admin panel (documents API);
 * this page cleans it up and lays it out as summary cards, a contents list and
 * numbered sections.
 */
const LegalPageLayout = ({ icon: Icon, title, subtitle, endpoint, seo, highlights = [] }) => {
  const company = useCompany();
  const [doc, setDoc] = useState(null);
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [active, setActive] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    fetch(`${config.baseURL}/documents/${endpoint}`)
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((json) => {
        if (!mounted) return;
        const item = json.success && Array.isArray(json.data) ? json.data[0] : null;
        setDoc(item ? splitDocument(item.text || "") : { intro: "", sections: [], outro: "" });
        setUpdatedAt(item?.updated_at || null);
      })
      .catch((err) => {
        console.error(`Failed to load ${endpoint}:`, err);
        if (mounted) setError("We couldn't load this page right now.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  // Highlight the section being read in the contents list.
  useEffect(() => {
    if (!doc?.sections.length) return undefined;
    setActive(doc.sections[0].id);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-140px 0px -60% 0px" }
    );
    doc.sections.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) io.observe(el);
    });
    return () => io.disconnect();
  }, [doc]);

  const jump = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    window.scrollTo({ top: el.getBoundingClientRect().top + window.scrollY - 130, behavior: "smooth" });
    setActive(id);
  };

  const sections = doc?.sections || [];
  const words = doc ? `${doc.intro} ${sections.map((s) => s.html).join(" ")}`.replace(/<[^>]+>/g, " ").split(/\s+/).length : 0;
  const readMins = Math.max(1, Math.round(words / 200));
  const others = POLICIES.filter((p) => p.label !== title);
  const phone = company?.phone || "+880 1894634149";
  const email = company?.email || "zantechbd@gmail.com";

  const contents = (
    <ol className="space-y-0.5">
      {sections.map((s, i) => (
        <li key={s.id}>
          <button
            type="button"
            onClick={() => jump(s.id)}
            className={`flex w-full items-start gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
              active === s.id ? "bg-zan-cyan/10 font-semibold text-zan-cyan" : "text-gray-400 hover:bg-white/5 hover:text-white"
            }`}
          >
            <span className="w-5 flex-shrink-0 font-mono text-xs leading-5 opacity-70">{String(i + 1).padStart(2, "0")}</span>
            <span className="leading-5">{s.title}</span>
          </button>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo {...seo} type="article" />
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
              <span className="font-medium text-gray-300">{title}</span>
            </nav>
            <div className="mt-6 flex items-start gap-4">
              <span className="hidden h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-zan-cyan/10 text-zan-cyan sm:inline-flex">
                <Icon className="h-7 w-7" />
              </span>
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-zan-cyan">Store policy</p>
                <h1 className="mt-2 text-3xl font-black tracking-tight text-white md:text-5xl">{title}</h1>
                <p className="mt-3 max-w-2xl text-gray-400 md:text-lg">{subtitle}</p>
              </div>
            </div>
            <div className="mt-6 flex flex-wrap gap-2 text-xs font-medium text-gray-400 sm:text-sm">
              {updatedAt && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-card px-3 py-1.5">
                  <CalendarClock className="h-4 w-4 text-zan-cyan" />
                  Updated {new Date(updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}
                </span>
              )}
              {!loading && !error && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-card px-3 py-1.5">
                  <Clock className="h-4 w-4 text-zan-cyan" /> {readMins} min read
                </span>
              )}
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-card px-3 py-1.5 transition-colors hover:border-zan-cyan/40 hover:text-white"
              >
                <Printer className="h-4 w-4 text-zan-cyan" /> Print / save PDF
              </button>
            </div>
          </div>
        </section>

        <div className="container mx-auto px-4 py-8 md:py-12">
          {/* At a glance */}
          {highlights.length > 0 && (
            <section aria-label="At a glance">
              <h2 className="mb-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">At a glance</h2>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {highlights.map((item) => (
                  <div key={item.title} className="flex gap-3 rounded-2xl border border-white/10 bg-card p-4">
                    <span className="inline-flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-zan-cyan/10 text-zan-cyan">
                      <item.icon className="h-5 w-5" />
                    </span>
                    <div>
                      <h3 className="text-sm font-bold text-white">{item.title}</h3>
                      <p className="mt-0.5 text-xs leading-relaxed text-gray-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          <div className="mt-8 grid gap-6 lg:grid-cols-[250px_1fr] lg:gap-10">
            {/* Contents */}
            <aside className="print:hidden lg:sticky lg:top-36 lg:self-start">
              {loading ? (
                <Skeleton className="h-12 w-full rounded-2xl lg:h-72" />
              ) : sections.length > 0 ? (
                <>
                  <details className="group rounded-2xl border border-white/10 bg-card lg:hidden">
                    <summary className="flex cursor-pointer list-none items-center justify-between px-5 py-4 text-sm font-semibold text-white">
                      On this page ({sections.length} sections)
                      <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="border-t border-white/10 p-2">{contents}</div>
                  </details>
                  <nav className="hidden lg:block" aria-label="Contents">
                    <p className="mb-2 px-3 font-mono text-[11px] font-semibold uppercase tracking-[0.2em] text-gray-500">On this page</p>
                    {contents}
                  </nav>
                </>
              ) : null}
            </aside>

            {/* Document */}
            <div className="min-w-0 space-y-4">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="space-y-3 rounded-2xl border border-white/10 bg-card p-6">
                    <Skeleton className="h-6 w-1/3" />
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-5/6" />
                  </div>
                ))
              ) : error ? (
                <div className="rounded-2xl border border-white/10 bg-card py-12 text-center">
                  <AlertCircle className="mx-auto h-10 w-10 text-red-500" />
                  <p className="mt-3 text-gray-300">{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-xl bg-zan-cyan px-5 py-2.5 text-sm font-bold text-zan-dark transition-opacity hover:opacity-90"
                  >
                    Try again
                  </button>
                </div>
              ) : (
                <>
                  {doc.intro && (
                    <div
                      className="article-body rounded-2xl border border-zan-cyan/20 bg-zan-cyan/5 p-5 md:p-7 [&>:last-child]:mb-0"
                      dangerouslySetInnerHTML={{ __html: doc.intro }}
                    />
                  )}
                  {sections.map((s, i) => (
                    <section key={s.id} id={s.id} className="scroll-mt-36 rounded-2xl border border-white/10 bg-card p-5 md:p-7">
                      <div className="mb-4 flex items-center gap-3">
                        <span className="inline-flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-zan-cyan/10 font-mono text-xs font-bold text-zan-cyan">
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <h2 className="text-lg font-bold text-white md:text-xl">{s.title}</h2>
                      </div>
                      <div className="article-body [&>:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: s.html }} />
                    </section>
                  ))}
                  {!doc.intro && sections.length === 0 && (
                    <div className="rounded-2xl border border-white/10 bg-card py-12 text-center text-gray-400">
                      This page is being updated. Please check back soon.
                    </div>
                  )}
                </>
              )}

              {/* Help */}
              <div className="rounded-2xl border border-zan-cyan/30 bg-gradient-to-br from-zan-cyan/10 to-transparent p-5 md:p-7">
                <h2 className="text-lg font-bold text-white md:text-xl">Questions about this policy?</h2>
                <p className="mt-1.5 text-sm text-gray-400">
                  {doc?.outro || "Our support team is happy to help with orders, returns and anything on this page."}
                </p>
                <div className="mt-5 grid gap-2 sm:grid-cols-3">
                  <a
                    href={`https://wa.me/${WHATSAPP}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-[#fff] transition-opacity hover:opacity-90"
                  >
                    <WhatsAppIcon className="h-4 w-4" /> WhatsApp
                  </a>
                  <a
                    href={`tel:${phone.replace(/\s+/g, "")}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-card px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-zan-cyan/40"
                  >
                    <Phone className="h-4 w-4" /> Call us
                  </a>
                  <a
                    href={`mailto:${email}`}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-card px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-zan-cyan/40"
                  >
                    <Mail className="h-4 w-4" /> Email
                  </a>
                </div>
              </div>

              {/* Other policies */}
              <div className="grid gap-3 sm:grid-cols-2 print:hidden">
                {others.map((p) => (
                  <Link
                    key={p.to}
                    to={p.to}
                    className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card p-5 transition-colors hover:border-zan-cyan/40"
                  >
                    <span>
                      <span className="block font-bold text-white">{p.label}</span>
                      <span className="mt-0.5 block text-xs text-gray-400">{p.desc}</span>
                    </span>
                    <ArrowRight className="h-5 w-5 flex-shrink-0 text-zan-cyan transition-transform group-hover:translate-x-1" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPageLayout;
