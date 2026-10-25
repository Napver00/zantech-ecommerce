import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, ArrowUpRight, BadgeCheck, BookOpen, ChevronRight, FlaskConical, GraduationCap, Heart, Home,
  LayoutGrid, LifeBuoy, Package, School, ShieldCheck, Truck,
} from 'lucide-react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Seo from '@/components/Seo';
import { Skeleton } from '@/components/ui/skeleton';
import { config } from '@/config';
import { useCategories } from '@/context/CategoriesContext';
import { cleanHtml } from '@/lib/legalDoc';

const MAIN_SITE = 'https://zantechbd.com';

const REASONS = [
  { icon: BadgeCheck, title: 'Genuine, tested parts', text: 'Every component is curated and checked so it works in class, in competitions and in real projects.' },
  { icon: Truck, title: 'Delivery across Bangladesh', text: 'Order online and we ship to your door, inside Dhaka and in every district.' },
  { icon: LifeBuoy, title: 'Free basic guidance', text: 'Stuck on wiring or code? Our engineers help, and our tutorials cover the parts we sell.' },
  { icon: Package, title: 'Kits made by educators', text: 'Our Uddipon, RC, line-follower and soccer robot kits are the same ones we teach with.' },
];

const BEYOND = [
  { icon: GraduationCap, title: 'Courses & bootcamps', text: 'Robotics, IoT and AI classes for school and college students.', href: `${MAIN_SITE}/courses`, label: 'See courses' },
  { icon: Heart, title: 'Project Uddipon', text: 'Free robotics workshops in schools across Bangladesh, funded partly by store sales.', href: 'https://projectuddipon.zantechbd.com/', label: 'Learn more' },
  { icon: FlaskConical, title: 'Custom R&D', text: 'Electronics, IoT systems and robots designed and built for businesses.', href: `${MAIN_SITE}/projects`, label: 'View projects' },
];

const About = () => {
  const { categories } = useCategories();
  const [story, setStory] = useState('');
  const [loading, setLoading] = useState(true);
  const [productCount, setProductCount] = useState(null);

  useEffect(() => {
    let mounted = true;
    fetch(`${config.baseURL}/documents/about`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`HTTP ${res.status}`))))
      .then((json) => {
        const html = json.success && Array.isArray(json.data) ? json.data[0]?.text : '';
        // The page has its own heading, so drop the document's first "Who we are" title.
        if (mounted) setStory(cleanHtml(html || '').replace(/^\s*<h[1-3][^>]*>.*?<\/h[1-3]>/i, ''));
      })
      .catch((err) => console.error('Failed to load about:', err))
      .finally(() => mounted && setLoading(false));

    fetch(`${config.baseURL}/products?page=1&limit=1`)
      .then((res) => res.json())
      .then((json) => mounted && setProductCount(json?.pagination?.total_rows ?? null))
      .catch((err) => console.error('Failed to load product count:', err));

    return () => {
      mounted = false;
    };
  }, []);

  const stats = [
    { label: 'Products', value: productCount != null ? `${productCount}+` : '—', icon: Package },
    { label: 'Categories', value: categories.length > 0 ? `${categories.length}` : '—', icon: LayoutGrid },
    { label: 'Students taught', value: '5,000+', icon: School },
    { label: 'Delivery', value: 'Nationwide', icon: Truck },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo
        title="About ZAN Tech Store - Robotics & IoT Components in Bangladesh"
        description="ZAN Tech Store supplies genuine robotics, IoT and electronics components and kits across Bangladesh, backed by the team that teaches robotics in schools."
        url="https://store.zantechbd.com/about"
        type="website"
      />
      <Header />

      <main className="flex-grow">
        {/* Hero */}
        <section className="relative overflow-hidden border-b border-white/10 bg-surface-2">
          <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
          <div className="pointer-events-none absolute -top-40 left-[-10%] h-[420px] w-[420px] rounded-full bg-zan-cyan/10 blur-[110px]" />
          <div className="container relative mx-auto px-4 py-8 md:py-14">
            <nav className="flex items-center gap-1 text-xs text-gray-400" aria-label="Breadcrumb">
              <Link to="/" className="flex items-center gap-1 transition-colors hover:text-white">
                <Home className="h-3.5 w-3.5" /> Home
              </Link>
              <ChevronRight className="h-3 w-3" />
              <span className="font-medium text-gray-300">About</span>
            </nav>
            <div className="mt-6 grid items-center gap-10 lg:grid-cols-[1.1fr_1fr]">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-zan-cyan">Robotics · IoT · STEM education</p>
                <h1 className="mt-3 text-4xl font-black leading-tight tracking-tight text-white md:text-6xl">
                  Parts for makers, <span className="text-zan-cyan">from people who teach</span>
                </h1>
                <p className="mt-4 max-w-xl leading-relaxed text-gray-400 md:text-lg">
                  ZAN Tech Store is run by the engineers behind ZAN Tech's robotics classes and free school workshops. We stock the
                  components and kits we trust in our own labs, and help you use them.
                </p>
                <div className="mt-7 flex flex-col gap-3 sm:flex-row">
                  <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-xl bg-zan-cyan px-6 py-3.5 text-sm font-bold text-zan-dark transition-opacity hover:opacity-90">
                    Browse the shop <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link to="/zantech-kits" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-card px-6 py-3.5 text-sm font-semibold text-white transition-colors hover:border-zan-cyan/40">
                    ZAN Tech kits
                  </Link>
                </div>
              </div>
              <div className="relative">
                <div className="overflow-hidden rounded-3xl border border-white/10 bg-card">
                  <img
                    src={`${MAIN_SITE}/hero_section_image.jpg`}
                    alt="Students building robots with ZAN Tech kits"
                    className="aspect-[4/3] w-full object-cover"
                    loading="eager"
                  />
                </div>
                <div className="absolute -bottom-5 left-4 flex items-center gap-3 rounded-2xl border border-white/10 bg-card/95 p-4 shadow-xl backdrop-blur">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="h-5 w-5" />
                  </span>
                  <div>
                    <p className="text-sm font-bold text-white">Tested before it ships</p>
                    <p className="text-xs text-gray-400">Genuine components only</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Stats */}
        <section className="container mx-auto px-4 pt-12">
          <div className="grid grid-cols-2 overflow-hidden rounded-2xl border border-white/10 bg-card lg:grid-cols-4">
            {stats.map(({ label, value, icon: Icon }, i) => (
              <div
                key={label}
                className={`flex items-center gap-3 p-5 md:p-6 ${i % 2 ? 'border-l border-white/10' : ''} ${i > 1 ? 'border-t border-white/10 lg:border-t-0' : ''} ${i === 2 ? 'lg:border-l' : ''}`}
              >
                <Icon className="hidden h-6 w-6 flex-shrink-0 text-zan-cyan sm:block" />
                <div>
                  <p className="text-xl font-black text-white md:text-3xl">{value}</p>
                  <p className="text-xs font-medium text-gray-400 md:text-sm">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Story */}
        <section className="container mx-auto grid gap-8 px-4 py-14 md:py-20 lg:grid-cols-[1fr_1.4fr] lg:gap-14">
          <div>
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-zan-cyan">Who we are</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">Making innovation accessible in Bangladesh</h2>
            <div className="mt-6 space-y-3">
              {[
                { title: 'Our mission', text: 'Give every student, maker and engineer in Bangladesh reliable parts and the know-how to use them.' },
                { title: 'Our vision', text: 'A country that builds and exports technology, not just imports it.' },
              ].map((m) => (
                <div key={m.title} className="rounded-2xl border-l-4 border-zan-cyan bg-card p-4">
                  <p className="font-bold text-white">{m.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400">{m.text}</p>
                </div>
              ))}
            </div>
          </div>
          <div>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-2/3" />
              </div>
            ) : story ? (
              <div className="article-body [&>:last-child]:mb-0" dangerouslySetInnerHTML={{ __html: story }} />
            ) : (
              <div className="article-body">
                <p>
                  ZAN Tech is your destination for electronics and robotics in Bangladesh, with quality products at fair prices for
                  hobbyists, students and professionals alike.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Why shop with us */}
        <section className="border-y border-white/10 bg-surface-2 py-14 md:py-20">
          <div className="container mx-auto px-4">
            <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-zan-cyan">Why shop with us</p>
            <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">More than a parts shop</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {REASONS.map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-white/10 bg-card p-6">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-zan-cyan/10 text-zan-cyan">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-white">{title}</h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-gray-400">{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Categories */}
        {categories.length > 0 && (
          <section className="container mx-auto px-4 py-14 md:py-20">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-[11px] font-semibold uppercase tracking-[0.25em] text-zan-cyan">What we stock</p>
                <h2 className="mt-3 text-3xl font-black tracking-tight text-white md:text-4xl">Shop by category</h2>
              </div>
              <Link to="/shop" className="inline-flex items-center gap-1.5 font-semibold text-zan-cyan hover:underline">
                All products <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              {categories.map((c) => (
                <Link
                  key={c.id}
                  to={`/shop?category_slug=${c.slug}`}
                  className="rounded-full border border-white/10 bg-card px-4 py-2 text-sm font-medium text-gray-300 transition-colors hover:border-zan-cyan/50 hover:text-zan-cyan"
                >
                  {c.name}
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Beyond the store */}
        <section className={`container mx-auto px-4 pb-14 md:pb-20 ${categories.length > 0 ? '' : 'pt-14 md:pt-20'}`}>
          <div className="rounded-3xl border border-white/10 bg-card p-6 md:p-10">
            <div className="flex items-center gap-3">
              <BookOpen className="h-6 w-6 text-zan-cyan" />
              <h2 className="text-2xl font-black tracking-tight text-white md:text-3xl">Part of the ZAN Tech family</h2>
            </div>
            <p className="mt-2 max-w-2xl text-gray-400">Every order helps fund our education work. Here is what else we do.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {BEYOND.map(({ icon: Icon, title, text, href, label }) => (
                <a
                  key={title}
                  href={href}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex flex-col rounded-2xl border border-white/10 bg-background p-5 transition-colors hover:border-zan-cyan/40"
                >
                  <Icon className="h-6 w-6 text-zan-cyan" />
                  <p className="mt-4 font-bold text-white">{title}</p>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-gray-400">{text}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-zan-cyan">
                    {label} <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </span>
                </a>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="container mx-auto px-4 pb-16 md:pb-24">
          <div className="rounded-3xl border border-zan-cyan/30 bg-gradient-to-br from-zan-cyan/10 via-card to-card p-8 text-center md:p-14">
            <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">Ready to build something?</h2>
            <p className="mx-auto mt-3 max-w-xl text-gray-400">
              Find the parts for your next project, or ask us about bulk orders for your school, club or lab.
            </p>
            <div className="mt-7 flex flex-col justify-center gap-3 sm:flex-row">
              <Link to="/shop" className="inline-flex items-center justify-center gap-2 rounded-xl bg-zan-cyan px-7 py-3.5 text-sm font-bold text-zan-dark transition-opacity hover:opacity-90">
                Browse the shop <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/contact" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-card px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-zan-cyan/40">
                Contact us
              </Link>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default About;
