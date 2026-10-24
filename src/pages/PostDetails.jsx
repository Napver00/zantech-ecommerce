import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import parse, { domToReact } from "html-react-parser";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { config } from "@/config";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertTriangle,
  Calendar,
  ArrowLeft,
  Clock,
  Share2,
  Link2,
  Check,
  ListOrdered,
  ChevronDown,
  ShoppingBag,
  ArrowRight,
  BookOpen,
} from "lucide-react";
import Seo from "@/components/Seo";
import CodeBlock from "@/components/CodeBlock";

const slugify = (text) =>
  text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);

const textOf = (node) => {
  if (!node) return "";
  if (node.type === "text") return node.data || "";
  return (node.children || []).map(textOf).join("");
};

const findCode = (node) => {
  if (!node) return null;
  if (node.name === "code") return node;
  for (const child of node.children || []) {
    const found = findCode(child);
    if (found) return found;
  }
  return null;
};

const codeText = (node) => {
  if (!node) return "";
  if (node.type === "text") return node.data || "";
  if (node.name === "br") return "\n";
  const inner = (node.children || []).map(codeText).join("");
  return node.name === "div" || node.name === "p" ? `${inner}\n` : inner;
};

const formatDate = (d) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "ZT";

const PostDetails = () => {
  const { slug } = useParams();
  const location = useLocation();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [activeId, setActiveId] = useState("");
  const [copied, setCopied] = useState(false);
  const articleRef = useRef(null);

  const isTutorial =
    location.state?.from === "tutorials" || (post?.category || "").toLowerCase() === "tutorial";
  const backLink =
    location.state?.from === "tutorials"
      ? `/tutorials?page=${location.state.page || 1}`
      : isTutorial
        ? "/tutorials"
        : "/blog";
  const backText = isTutorial ? "All tutorials" : "All articles";

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`${config.baseURL}/posts/${slug}`);
        if (!res.ok) throw new Error("Post not found.");
        const data = await res.json();
        if (!(data.success && data.data)) throw new Error(data.message || "Could not retrieve the post.");
        if (cancelled) return;
        setPost(data.data);
        setLoading(false); // show the article now; related posts load afterwards

        // Related posts from the same category (best effort)
        const cat = (data.data.category || "tutorial").toLowerCase();
        const rel = await fetch(`${config.baseURL}/posts/published?category=${cat}&page=1&limit=4`)
          .then((r) => r.json())
          .catch(() => null);
        if (!cancelled && rel?.success && Array.isArray(rel.data)) {
          setRelated(rel.data.filter((p) => p.slug !== slug).slice(0, 3));
        }
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    window.scrollTo(0, 0);
    return () => {
      cancelled = true;
    };
  }, [slug]);

  // Headings → table of contents (ids are added while parsing)
  const toc = useMemo(() => {
    if (!post?.content) return [];
    const doc = new DOMParser().parseFromString(post.content, "text/html");
    const used = {};
    const heads = [...doc.querySelectorAll("h2, h3")];
    // Indent h3s only when the post really has several h2 sections;
    // many posts use h3 for every section, which should read as one flat list.
    const nested = heads.filter((h) => h.tagName === "H2").length >= 2;
    return heads
      .map((h) => {
        const text = h.textContent.trim();
        if (!text) return null;
        let id = slugify(text) || "section";
        used[id] = (used[id] || 0) + 1;
        if (used[id] > 1) id = `${id}-${used[id]}`;
        return { id, text, level: nested && h.tagName === "H3" ? 3 : 2 };
      })
      .filter(Boolean);
  }, [post?.content]);

  const readingMinutes = useMemo(() => {
    const words = (post?.content || "").replace(/<[^>]+>/g, " ").split(/\s+/).filter(Boolean).length;
    return Math.max(1, Math.round(words / 200));
  }, [post?.content]);

  // Reading progress + active heading
  useEffect(() => {
    if (!post) return;
    const onScroll = () => {
      const el = articleRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const total = el.offsetHeight - window.innerHeight * 0.6;
      const done = Math.min(Math.max(-rect.top + 120, 0), Math.max(total, 1));
      setProgress(Math.round((done / Math.max(total, 1)) * 100));

      let current = "";
      for (const item of toc) {
        const h = document.getElementById(item.id);
        if (h && h.getBoundingClientRect().top < 160) current = item.id;
      }
      setActiveId(current);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [post, toc]);

  // Parse the stored HTML: code blocks, responsive video, framed images, heading ids
  const parsed = useMemo(() => {
    if (!post?.content) return null;
    let headingIndex = 0;
    const options = {
      replace: (node) => {
        if (node.name === "pre") {
          // Code pasted from ChatGPT etc. keeps that site's toolbar markup inside
          // <pre>; use only the real <code> text (with <br> as new lines).
          const code = findCode(node) || node;
          const text = codeText(code).replace(/\n{3,}/g, "\n\n").trim();
          return <CodeBlock>{text}</CodeBlock>;
        }
        if (node.name === "iframe" && /youtube|youtu\.be/.test(node.attribs?.src || "")) {
          // eslint-disable-next-line no-unused-vars
          const { frameborder, allowfullscreen, width, height, style, ...rest } = node.attribs;
          return (
            <div className="relative my-8 aspect-video w-full overflow-hidden rounded-2xl border border-white/10 bg-black">
              <iframe {...rest} allowFullScreen className="absolute inset-0 h-full w-full" title="Video" loading="lazy" />
            </div>
          );
        }
        if (node.name === "img") {
          // eslint-disable-next-line no-unused-vars
          const { width, height, style, ...rest } = node.attribs;
          return <img {...rest} alt={rest.alt || post.title} loading="lazy" decoding="async" />;
        }
        if ((node.name === "h2" || node.name === "h3") && textOf(node).trim()) {
          const item = toc[headingIndex++];
          const Tag = node.name;
          return <Tag id={item?.id}>{domToReact(node.children, options)}</Tag>;
        }
      },
    };
    return parse(post.content, options);
  }, [post?.content, post?.title, toc]);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareTitle = post?.title || "";
  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard blocked — nothing else to do */
    }
  };
  const nativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: shareTitle, url: shareUrl });
      } catch {
        /* user closed the share sheet */
      }
    } else {
      copyLink();
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <main className="container mx-auto max-w-6xl flex-grow px-4 py-10">
          <Skeleton className="mb-4 h-4 w-40 bg-white/5" />
          <Skeleton className="mb-3 h-10 w-3/4 bg-white/5" />
          <Skeleton className="mb-8 h-5 w-1/2 bg-white/5" />
          <Skeleton className="mb-8 aspect-video w-full rounded-2xl bg-white/5" />
          <div className="space-y-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-4 w-full bg-white/5" />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header />
        <div className="flex flex-grow items-center justify-center p-4">
          <div className="max-w-sm text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-red-500/10 text-red-400">
              <AlertTriangle className="h-7 w-7" />
            </span>
            <h2 className="text-2xl font-bold text-white">This article isn't available</h2>
            <p className="mt-2 text-sm text-gray-400">It may have been moved or unpublished.</p>
            <Link to={backLink} className="mt-6 inline-flex items-center gap-2 font-bold text-zan-cyan">
              <ArrowLeft className="h-4 w-4" /> {backText}
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const siteUrl = "https://store.zantechbd.com";
  const tags = Array.isArray(post.tags) ? post.tags.filter(Boolean) : [];
  const shopQuery = encodeURIComponent(tags[0] || post.title.split(" ").slice(0, 2).join(" "));

  const TocList = ({ onPick }) => (
    <ol className="space-y-1 text-sm">
      {toc.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            onClick={onPick}
            className={`block rounded-md border-l-2 py-1.5 pr-2 transition-colors ${
              item.level === 3 ? "pl-6" : "pl-3"
            } ${
              activeId === item.id
                ? "border-zan-cyan bg-zan-cyan/10 font-semibold text-zan-cyan"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo
        title={`${post.meta_title || post.title} | ZAN Tech`}
        description={post.meta_description || post.title}
        image={post.thumbnail_url || `${siteUrl}/zantech-logo.webp`}
        url={`${siteUrl}/postdetails/${slug}`}
        type="article"
      />

      <Header />

      {/* Reading progress */}
      <div className="pointer-events-none fixed left-0 right-0 top-0 z-[60] h-[3px]" aria-hidden>
        <div className="h-full bg-zan-cyan transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <main className="flex-grow">
        {/* ── Header ── */}
        <section className="border-b border-white/10 bg-surface-dark">
          <div className="container mx-auto max-w-6xl px-4 py-8 md:py-12">
            <nav className="mb-6 flex items-center gap-2 text-sm text-gray-400">
              <Link to={backLink} className="inline-flex items-center gap-1.5 font-semibold hover:text-zan-cyan">
                <ArrowLeft className="h-4 w-4" /> {backText}
              </Link>
            </nav>

            <div className="grid items-center gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:gap-12">
              <div>
                <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-zan-cyan/30 bg-zan-cyan/10 px-3 py-1 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-zan-cyan">
                  <BookOpen className="h-3.5 w-3.5" /> {post.category || "Article"}
                </span>
                <h1 className="text-3xl font-bold leading-tight text-white md:text-[2.6rem]">{post.title}</h1>
                {post.meta_description && (
                  <p className="mt-4 text-base leading-relaxed text-gray-400 md:text-lg">{post.meta_description}</p>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-gray-400">
                  {post.author_name && (
                    <span className="flex items-center gap-2.5">
                      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-zan-cyan/15 text-xs font-bold text-zan-cyan">
                        {initials(post.author_name)}
                      </span>
                      <span className="font-semibold text-white">{post.author_name}</span>
                    </span>
                  )}
                  <span className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" /> {formatDate(post.created_at)}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {readingMinutes} min read
                  </span>
                </div>

                <div className="mt-6 flex flex-wrap gap-2">
                  <a
                    href={`https://wa.me/?text=${encodeURIComponent(`${shareTitle} ${shareUrl}`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3.5 text-sm font-semibold text-gray-300 transition-colors hover:border-zan-cyan/50 hover:text-zan-cyan"
                  >
                    WhatsApp
                  </a>
                  <a
                    href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3.5 text-sm font-semibold text-gray-300 transition-colors hover:border-zan-cyan/50 hover:text-zan-cyan"
                  >
                    Facebook
                  </a>
                  <button
                    onClick={copyLink}
                    className="inline-flex h-10 items-center gap-2 rounded-lg border border-white/10 px-3.5 text-sm font-semibold text-gray-300 transition-colors hover:border-zan-cyan/50 hover:text-zan-cyan"
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />} {copied ? "Copied" : "Copy link"}
                  </button>
                </div>
              </div>

              {post.thumbnail_url && (
                <div className="overflow-hidden rounded-2xl border border-white/10 bg-surface-2 shadow-xl">
                  <img src={post.thumbnail_url} alt={post.title} className="aspect-video w-full object-cover" fetchPriority="high" />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* ── Body ── */}
        <div className="container mx-auto max-w-6xl px-4 py-10 md:py-14">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
            <div className="min-w-0">
              {/* Contents (phones / tablets) */}
              {toc.length > 1 && (
                <details className="group mb-8 rounded-xl border border-white/10 bg-surface-dark lg:hidden">
                  <summary className="flex cursor-pointer list-none items-center justify-between px-4 py-3 font-semibold text-white">
                    <span className="flex items-center gap-2">
                      <ListOrdered className="h-4 w-4 text-zan-cyan" /> On this page
                    </span>
                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
                  </summary>
                  <div className="border-t border-white/10 px-2 py-3">
                    <TocList onPick={(e) => e.currentTarget.closest("details")?.removeAttribute("open")} />
                  </div>
                </details>
              )}

              <article ref={articleRef} className="article-body mx-auto max-w-[760px]">
                {parsed}
              </article>

              {tags.length > 0 && (
                <div className="mx-auto mt-12 max-w-[760px] border-t border-white/10 pt-6">
                  <p className="mb-3 font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400">Topics</p>
                  <div className="flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <Link
                        key={tag}
                        to={`/search?q=${encodeURIComponent(tag)}`}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm font-medium text-gray-300 transition-colors hover:border-zan-cyan/50 hover:text-zan-cyan"
                      >
                        #{tag}
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Share + shop (end of article) */}
              <div className="mx-auto mt-10 grid max-w-[760px] gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-surface-dark p-5">
                  <p className="font-bold text-white">Found this helpful?</p>
                  <p className="mt-1 text-sm text-gray-400">Share it with a friend who's building too.</p>
                  <button
                    onClick={nativeShare}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg bg-zan-cyan px-4 text-sm font-bold text-zan-dark transition-colors hover:bg-white"
                  >
                    <Share2 className="h-4 w-4" /> Share
                  </button>
                </div>
                <div className="rounded-2xl border border-zan-cyan/25 bg-zan-cyan/5 p-5">
                  <p className="font-bold text-white">Build it yourself</p>
                  <p className="mt-1 text-sm text-gray-400">Get the parts used in this guide from the ZAN Tech store.</p>
                  <Link
                    to={`/search?q=${shopQuery}`}
                    className="mt-4 inline-flex h-10 items-center gap-2 rounded-lg border border-zan-cyan/40 px-4 text-sm font-bold text-zan-cyan transition-colors hover:bg-zan-cyan hover:text-zan-dark"
                  >
                    <ShoppingBag className="h-4 w-4" /> Shop the parts
                  </Link>
                </div>
              </div>
            </div>

            {/* Sidebar (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-36 space-y-5">
                {toc.length > 1 && (
                  <div className="rounded-2xl border border-white/10 bg-surface-dark p-4">
                    <p className="mb-3 flex items-center gap-2 px-2 font-mono text-[11px] uppercase tracking-[0.14em] text-gray-400">
                      <ListOrdered className="h-3.5 w-3.5 text-zan-cyan" /> On this page
                    </p>
                    <div className="max-h-[50vh] overflow-y-auto pr-1">
                      <TocList />
                    </div>
                    <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-zan-cyan transition-[width]" style={{ width: `${progress}%` }} />
                    </div>
                    <p className="mt-1.5 px-1 text-xs text-gray-400">{progress}% read</p>
                  </div>
                )}
                <div className="rounded-2xl border border-white/10 bg-surface-dark p-5">
                  <ShoppingBag className="h-6 w-6 text-zan-cyan" />
                  <p className="mt-3 font-bold text-white">Need the parts?</p>
                  <p className="mt-1 text-sm text-gray-400">Genuine components, delivered across Bangladesh.</p>
                  <Link
                    to={`/search?q=${shopQuery}`}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-zan-cyan py-2.5 text-sm font-bold text-zan-dark transition-colors hover:bg-white"
                  >
                    Shop now <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </aside>
          </div>
        </div>

        {/* ── Related ── */}
        {related.length > 0 && (
          <section className="border-t border-white/10 bg-surface-dark">
            <div className="container mx-auto max-w-6xl px-4 py-12">
              <div className="mb-6 flex items-end justify-between gap-4">
                <h2 className="text-2xl font-bold text-white">Keep learning</h2>
                <Link to={backLink} className="hidden items-center gap-1.5 text-sm font-semibold text-zan-cyan sm:inline-flex">
                  {backText} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((p) => (
                  <Link
                    key={p.slug}
                    to={`/postdetails/${p.slug}`}
                    state={location.state}
                    className="group overflow-hidden rounded-2xl border border-white/10 bg-background transition-all hover:-translate-y-1 hover:border-zan-cyan/40"
                  >
                    <div className="aspect-video overflow-hidden bg-white/5">
                      {p.thumbnail && (
                        <img
                          src={p.thumbnail}
                          alt={p.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                      )}
                    </div>
                    <div className="p-4">
                      <p className="line-clamp-2 font-bold leading-snug text-white group-hover:text-zan-cyan">{p.title}</p>
                      <p className="mt-2 inline-flex items-center gap-1 text-sm font-semibold text-zan-cyan">
                        Read <ArrowRight className="h-3.5 w-3.5" />
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default PostDetails;
