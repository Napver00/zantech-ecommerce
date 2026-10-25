import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle, ArrowRight, ChevronDown, ChevronRight, CreditCard, Home, LayoutGrid, Mail, Package,
  RotateCcw, Search, Truck, Wrench, X,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Seo from '@/components/Seo';
import WhatsAppIcon from '@/components/WhatsAppIcon';
import { Skeleton } from '@/components/ui/skeleton';
import { config } from '@/config';
import { useCompany } from '@/context/CompanyContext';
import { fixText } from '@/lib/text';

const WHATSAPP = '8801894634149';

// Questions are grouped by what they are about, read from their wording.
const TOPICS = [
  { id: 'all', label: 'All', icon: LayoutGrid },
  { id: 'delivery', label: 'Orders & delivery', icon: Truck, match: /deliver|ship|order from|courier/i },
  { id: 'payment', label: 'Payment', icon: CreditCard, match: /pay|bkash|nagad|rocket|cash on/i },
  { id: 'returns', label: 'Returns & warranty', icon: RotateCcw, match: /return|refund|exchange|warrant/i },
  { id: 'support', label: 'Help & projects', icon: Wrench, match: /guid|help|support|contact|project|tutorial/i },
  { id: 'products', label: 'Products', icon: Package },
];

const topicOf = (faq) =>
  TOPICS.find((t) => t.match && t.match.test(faq.question))?.id || 'products';

const Faq = () => {
  const company = useCompany();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState('');
  const [topic, setTopic] = useState('all');
  const [open, setOpen] = useState(() => new Set());

  useEffect(() => {
    let mounted = true;
    fetch(`${config.baseURL}/faqs/active`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to fetch FAQs.');
        return res.json();
      })
      .then((data) => {
        if (!data.success || !Array.isArray(data.data)) throw new Error('Invalid data received from the server.');
        const list = data.data
          .filter((f) => f.category === 'store')
          .map((f) => ({ ...f, question: fixText(f.question), answer: fixText(f.answer) }))
          .map((f) => ({ ...f, topic: topicOf(f) }));
        if (!mounted) return;
        setFaqs(list);
        // A shared link like /faq#faq-22 opens that answer.
        const id = Number(window.location.hash.replace('#faq-', ''));
        if (id) {
          setOpen(new Set([id]));
          setTimeout(() => document.getElementById(`faq-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' }), 150);
        }
      })
      .catch((err) => mounted && setError(err.message))
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  const counts = useMemo(() => {
    const c = { all: faqs.length };
    faqs.forEach((f) => { c[f.topic] = (c[f.topic] || 0) + 1; });
    return c;
  }, [faqs]);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return faqs.filter(
      (f) => (topic === 'all' || f.topic === topic) && (!q || `${f.question} ${f.answer}`.toLowerCase().includes(q))
    );
  }, [faqs, topic, query]);

  const toggle = (id) =>
    setOpen((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const allOpen = shown.length > 0 && shown.every((f) => open.has(f.id));
  const email = company?.email || 'zantechbd@gmail.com';

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo
        title="FAQ - ZAN Tech Store | Frequently Asked Questions"
        description="Answers about orders, delivery, payment, returns and robotics & IoT products at ZAN Tech Store."
        url="https://store.zantechbd.com/faq"
        type="website"
      />
      <Header />

      <main className="flex-grow">
        {/* Header with search */}
        <section className="relative overflow-hidden border-b border-white/10 bg-surface-2">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[620px] -translate-x-1/2 rounded-full bg-zan-cyan/10 blur-[110px]" />
          <div className="container relative mx-auto px-4 py-8 md:py-14">
            <nav className="flex items-center gap-1 text-xs text-gray-400" aria-label="Breadcrumb">
              <Link to="/" className="flex items-center gap-1 transition-colors hover:text-white">
                <Home className="h-3.5 w-3.5" /> Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-gray-300">FAQ</span>
            </nav>
            <div className="mx-auto mt-6 max-w-2xl text-center">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-zan-cyan">Help centre</p>
              <h1 className="mt-3 text-3xl font-black tracking-tight text-white md:text-5xl">How can we help?</h1>
              <p className="mt-3 text-gray-400 md:text-lg">Quick answers about ordering, delivery, payment, returns and our products.</p>
              <label className="relative mt-7 block">
                <span className="sr-only">Search questions</span>
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-500" />
                <input
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search e.g. delivery, bKash, return"
                  className="w-full rounded-2xl border border-white/10 bg-card py-4 pl-12 pr-12 text-white shadow-lg outline-none transition-colors placeholder:text-gray-500 focus:border-zan-cyan/60"
                />
                {query && (
                  <button
                    type="button"
                    onClick={() => setQuery('')}
                    aria-label="Clear search"
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-lg p-1.5 text-gray-500 hover:bg-white/5 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </label>
            </div>
          </div>
        </section>

        <div className="container mx-auto grid gap-8 px-4 py-8 md:py-12 lg:grid-cols-[1fr_300px]">
          <div className="min-w-0">
            {/* Topics */}
            <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:flex-wrap sm:px-0">
              {TOPICS.filter((t) => t.id === 'all' || counts[t.id]).map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTopic(id)}
                  className={`inline-flex flex-shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors ${
                    topic === id
                      ? 'border-zan-cyan bg-zan-cyan text-zan-dark'
                      : 'border-white/10 bg-card text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                >
                  <Icon className="h-4 w-4" /> {label}
                  <span className={`rounded-full px-1.5 text-xs ${topic === id ? 'bg-black/10' : 'bg-white/5'}`}>{counts[id] || 0}</span>
                </button>
              ))}
            </div>

            <div className="mt-5 flex items-center justify-between gap-4 text-sm text-gray-500">
              <span>
                {loading ? 'Loading…' : `${shown.length} ${shown.length === 1 ? 'question' : 'questions'}`}
                {query && !loading && <> for “{query}”</>}
              </span>
              {shown.length > 1 && (
                <button
                  type="button"
                  onClick={() => setOpen(allOpen ? new Set() : new Set(shown.map((f) => f.id)))}
                  className="font-semibold text-zan-cyan hover:underline"
                >
                  {allOpen ? 'Collapse all' : 'Expand all'}
                </button>
              )}
            </div>

            <div className="mt-4 space-y-3">
              {loading &&
                Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-2xl" />)}

              {!loading && error && (
                <div className="rounded-2xl border border-white/10 bg-card py-12 text-center">
                  <AlertTriangle className="mx-auto h-9 w-9 text-red-500" />
                  <p className="mt-3 text-gray-300">{error}</p>
                  <button
                    type="button"
                    onClick={() => window.location.reload()}
                    className="mt-5 rounded-xl bg-zan-cyan px-5 py-2.5 text-sm font-bold text-zan-dark transition-opacity hover:opacity-90"
                  >
                    Try again
                  </button>
                </div>
              )}

              {!loading && !error && shown.length === 0 && (
                <div className="rounded-2xl border border-white/10 bg-card p-10 text-center">
                  <Search className="mx-auto h-8 w-8 text-gray-500" />
                  <p className="mt-3 font-semibold text-white">No answer matches that yet</p>
                  <p className="mt-1 text-sm text-gray-400">Try another word, or ask us on WhatsApp.</p>
                </div>
              )}

              {!loading && !error && shown.map((faq) => {
                const isOpen = open.has(faq.id);
                return (
                  <div
                    key={faq.id}
                    id={`faq-${faq.id}`}
                    className={`scroll-mt-36 rounded-2xl border bg-card transition-colors ${
                      isOpen ? 'border-zan-cyan/40' : 'border-white/10 hover:border-white/20'
                    }`}
                  >
                    <h2>
                      <button
                        type="button"
                        onClick={() => toggle(faq.id)}
                        aria-expanded={isOpen}
                        className="flex w-full items-start justify-between gap-4 p-5 text-left md:px-6"
                      >
                        <span className={`font-semibold leading-snug md:text-[17px] ${isOpen ? 'text-zan-cyan' : 'text-white'}`}>
                          {faq.question}
                        </span>
                        <ChevronDown
                          className={`mt-0.5 h-5 w-5 flex-shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180 text-zan-cyan' : 'text-gray-500'}`}
                        />
                      </button>
                    </h2>
                    <div className={`grid transition-[grid-template-rows] duration-300 ease-out ${isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
                      <div className="overflow-hidden">
                        <p className="mx-5 whitespace-pre-line border-t border-white/10 pb-5 pt-4 leading-7 text-gray-300 md:mx-6">
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Still stuck */}
          <aside className="space-y-4 lg:sticky lg:top-36 lg:self-start">
            <div className="rounded-2xl border border-zan-cyan/30 bg-gradient-to-br from-zan-cyan/10 to-transparent p-6">
              <h2 className="text-lg font-bold text-white">Still have a question?</h2>
              <p className="mt-1.5 text-sm leading-relaxed text-gray-400">
                Message us with the product name or your order number and we'll get back to you quickly.
              </p>
              <a
                href={`https://wa.me/${WHATSAPP}?text=${encodeURIComponent('Hi ZAN Tech Store, I have a question: ')}`}
                target="_blank"
                rel="noreferrer"
                className="mt-5 flex items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-bold text-[#fff] transition-opacity hover:opacity-90"
              >
                <WhatsAppIcon className="h-5 w-5" /> Chat on WhatsApp
              </a>
              <a
                href={`mailto:${email}`}
                className="mt-2 flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-card px-4 py-3 text-sm font-semibold text-white transition-colors hover:border-zan-cyan/40"
              >
                <Mail className="h-4 w-4" /> {email}
              </a>
            </div>
            {[
              { to: '/return-policy', title: 'Return Policy', text: 'How returns, refunds and exchanges work.' },
              { to: '/dashboard/orders', title: 'Track your order', text: 'See the status of your orders.' },
              { to: '/tutorials', title: 'Tutorials', text: 'Guides for the parts and kits you buy.' },
            ].map((c) => (
              <Link
                key={c.to}
                to={c.to}
                className="group flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-card p-5 transition-colors hover:border-zan-cyan/40"
              >
                <span>
                  <span className="block font-bold text-white">{c.title}</span>
                  <span className="mt-0.5 block text-sm text-gray-400">{c.text}</span>
                </span>
                <ArrowRight className="h-5 w-5 flex-shrink-0 text-zan-cyan transition-transform group-hover:translate-x-1" />
              </Link>
            ))}
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Faq;
