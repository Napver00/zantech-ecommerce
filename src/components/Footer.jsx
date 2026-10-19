import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Mail,
  MapPin,
  Phone,
  Link as LinkIcon,
  Facebook,
  Instagram,
  Linkedin,
  ArrowUp,
  ArrowUpRight,
  Twitter,
  Youtube,
  Send,
  Banknote,
} from "lucide-react";
import { toast } from "sonner";
import { useCompany } from "@/context/CompanyContext";
import { useCategories } from "@/context/CategoriesContext";
import BrandLogo from "@/components/BrandLogo";

const iconForPlatform = (platform) => {
  const p = platform?.toLowerCase?.();
  if (!p) return LinkIcon;
  if (p.includes("facebook")) return Facebook;
  if (p.includes("instagram")) return Instagram;
  if (p.includes("linkedin")) return Linkedin;
  if (p.includes("twitter")) return Twitter;
  if (p.includes("youtube")) return Youtube;
  return LinkIcon;
};

const FooterHeading = ({ children }) => (
  <h3 className="mb-5 font-mono text-[11px] uppercase tracking-[0.2em] text-zan-cyan">{children}</h3>
);

const FooterLink = ({ to, href, children }) => {
  const cls = "text-sm text-gray-400 transition-colors hover:text-white";
  return href ? (
    <a href={href} target="_blank" rel="noreferrer" className={`${cls} inline-flex items-center gap-1`}>
      {children} <ArrowUpRight className="h-3 w-3" />
    </a>
  ) : (
    <Link to={to} className={cls}>{children}</Link>
  );
};

const Footer = () => {
  const company = useCompany();
  const { categories } = useCategories();
  const [newsletterEmail, setNewsletterEmail] = useState("");

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (!newsletterEmail.trim()) return;
    toast.success("Thanks for subscribing!", {
      description: "You'll hear from us about new kits and STEM workshops.",
    });
    setNewsletterEmail("");
  };

  const socialLinks = (company?.social_links || []).filter((l) => !l.platform?.toLowerCase?.().includes("tiktok"));
  const location = company?.location || "Barishal, Barisal Division Bangladesh";
  const email = company?.email || "zantechbd@gmail.com";
  const phone = company?.phone;

  return (
    <footer className="relative mt-20 overflow-hidden border-t border-white/10 bg-surface-footer text-gray-300">
      <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-40" />
      <div className="pointer-events-none absolute -top-40 left-1/2 h-80 w-[700px] -translate-x-1/2 rounded-full bg-zan-cyan/5 blur-[120px]" />

      <div className="container relative mx-auto px-4">
        {/* Newsletter */}
        <div className="flex flex-col gap-6 border-b border-white/10 py-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="mb-1 font-mono text-[11px] uppercase tracking-[0.2em] text-zan-cyan">&lt;Stay updated /&gt;</p>
            <h3 className="text-xl font-bold text-white md:text-2xl">New kits, restocks &amp; free workshops</h3>
            <p className="mt-1 text-sm text-gray-400">Be the first to know — straight to your inbox.</p>
          </div>
          <form onSubmit={handleSubscribe} className="flex w-full flex-shrink-0 gap-2 lg:w-auto">
            <input
              type="email"
              required
              value={newsletterEmail}
              onChange={(e) => setNewsletterEmail(e.target.value)}
              placeholder="you@example.com"
              className="h-12 flex-1 rounded-lg border border-white/10 bg-white/5 px-4 text-sm text-white placeholder-gray-500 outline-none transition-all focus:border-zan-cyan/60 lg:w-80"
            />
            <button type="submit"
              className="flex h-12 flex-shrink-0 items-center gap-2 rounded-lg bg-zan-cyan px-6 text-sm font-bold text-zan-dark transition-colors hover:bg-white">
              <Send className="h-4 w-4" />
              <span className="hidden sm:inline">Subscribe</span>
            </button>
          </form>
        </div>

        {/* Columns */}
        <div className="grid grid-cols-2 gap-10 py-14 md:grid-cols-4 lg:grid-cols-12">
          <div className="col-span-2 space-y-5 md:col-span-4 lg:col-span-4">
            <BrandLogo />
            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Robotics parts, IoT modules and DIY kits for students, makers and engineers across Bangladesh — from the team behind ZAN Tech's courses and bootcamps.
            </p>
            {socialLinks.length > 0 && (
              <div className="flex gap-2.5">
                {socialLinks.map((link) => {
                  const Icon = iconForPlatform(link.platform);
                  return (
                    <a key={link.id} href={link.url} target="_blank" rel="noreferrer" aria-label={link.platform}
                      className="flex h-10 w-10 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-gray-400 transition-all hover:-translate-y-0.5 hover:border-zan-cyan/50 hover:text-zan-cyan">
                      <Icon size={18} />
                    </a>
                  );
                })}
              </div>
            )}
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>Shop</FooterHeading>
            <ul className="space-y-3">
              <li><FooterLink to="/shop">All products</FooterLink></li>
              <li><FooterLink to="/zantech-kits">ZAN Tech Kits</FooterLink></li>
              {categories.slice(0, 4).map((c) => (
                <li key={c.id}><FooterLink to={`/shop?category_slug=${c.slug}`}>{c.name}</FooterLink></li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>Help</FooterHeading>
            <ul className="space-y-3">
              <li><FooterLink to="/faq">FAQ</FooterLink></li>
              <li><FooterLink to="/return-policy">Return Policy</FooterLink></li>
              <li><FooterLink to="/terms">Terms &amp; Conditions</FooterLink></li>
              <li><FooterLink to="/privacy-policy">Privacy Policy</FooterLink></li>
              <li><FooterLink to="/dashboard/orders">Track your order</FooterLink></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <FooterHeading>Company</FooterHeading>
            <ul className="space-y-3">
              <li><FooterLink to="/about">About us</FooterLink></li>
              <li><FooterLink to="/contact">Contact</FooterLink></li>
              <li><FooterLink to="/blog">Blog</FooterLink></li>
              <li><FooterLink to="/tutorials">Tutorials</FooterLink></li>
              <li><FooterLink href="https://zantechbd.com">Courses &amp; Bootcamps</FooterLink></li>
            </ul>
          </div>

          <div className="col-span-2 md:col-span-4 lg:col-span-2">
            <FooterHeading>Get in touch</FooterHeading>
            <ul className="space-y-4 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-zan-cyan" />
                <span className="text-gray-400">{location}</span>
              </li>
              {phone && (
                <li className="flex items-center gap-3">
                  <Phone className="h-4 w-4 flex-shrink-0 text-zan-cyan" />
                  <a href={`tel:${phone}`} className="text-gray-400 transition-colors hover:text-white">{phone}</a>
                </li>
              )}
              <li className="flex items-center gap-3">
                <Mail className="h-4 w-4 flex-shrink-0 text-zan-cyan" />
                <a href={`mailto:${email}`} className="break-all text-gray-400 transition-colors hover:text-white">{email}</a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 border-t border-white/10 py-6 md:flex-row">
          <p className="text-sm text-gray-500">&copy; {new Date().getFullYear()} ZAN Tech. All rights reserved.</p>

          <div className="flex items-center gap-3 text-xs text-gray-500">
            <span className="font-mono uppercase tracking-widest">We accept</span>
            <span className="flex h-8 items-center gap-1.5 rounded-md border border-white/10 bg-white/5 px-3 text-gray-300">
              <Banknote className="h-4 w-4 text-zan-neon" /> Cash on Delivery
            </span>
            <span className="flex h-8 items-center rounded-md bg-[#fff] px-2.5">
              <img src="/bkashLogo.png" alt="bKash" className="h-5 w-auto" />
            </span>
          </div>

          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="group flex items-center gap-2 text-sm text-gray-400 transition-colors hover:text-white"
          >
            Back to top
            <span className="rounded-lg border border-white/10 p-2 transition-colors group-hover:border-zan-cyan/50 group-hover:text-zan-cyan">
              <ArrowUp size={16} />
            </span>
          </button>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
