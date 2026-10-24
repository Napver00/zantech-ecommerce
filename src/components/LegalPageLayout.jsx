import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import { Link } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Skeleton } from "@/components/ui/skeleton";
import { config } from "@/config";
import { Home, ChevronRight, AlertCircle } from "lucide-react";
import Seo from "@/components/Seo";

const LegalPageLayout = ({ icon: Icon, title, subtitle, endpoint, seo, highlights }) => {
  const [content, setContent] = useState("");
  const [updatedAt, setUpdatedAt] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    const fetchDoc = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.baseURL}/documents/${endpoint}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && json.data.length > 0) {
          const doc = json.data[0];
          const sanitized = DOMPurify.sanitize(doc.text || "", { USE_PROFILES: { html: true } });
          if (mounted) {
            setContent(sanitized);
            setUpdatedAt(doc.updated_at || null);
          }
        } else if (mounted) {
          setContent("");
        }
      } catch (err) {
        console.error(`Failed to load ${endpoint}:`, err);
        if (mounted) setError(err.message || "Failed to load content");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchDoc();
    return () => {
      mounted = false;
    };
  }, [endpoint]);

  const renderSkeletons = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <Skeleton className="h-7 w-3/4 bg-white/5" />
        <Skeleton className="h-4 w-full bg-white/5" />
        <Skeleton className="h-4 w-5/6 bg-white/5" />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-3 pt-2">
          <Skeleton className="h-5 w-1/3 bg-white/5" />
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-full bg-white/5" />
          <Skeleton className="h-4 w-4/5 bg-white/5" />
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Seo {...seo} type="article" />
      <Header />

      <main className="flex-grow">
        <div className="container mx-auto px-4 py-8 md:py-10">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1 text-xs text-gray-400 mb-6 max-w-4xl mx-auto">
            <Link to="/" className="hover:text-gray-200 transition-colors flex items-center gap-1">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3 h-3" />
            <span className="text-gray-300 font-medium">{title}</span>
          </nav>

          {/* Title */}
          <div className="max-w-4xl mx-auto mb-8">
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-white/5 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-gray-300" />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">{title}</h1>
                <p className="text-gray-400 text-sm mt-0.5">{subtitle}</p>
              </div>
            </div>
          </div>

          {/* Highlights */}
          {highlights && highlights.length > 0 && (
            <div className="grid sm:grid-cols-3 gap-4 max-w-4xl mx-auto mb-8">
              {highlights.map((item) => (
                <div key={item.title} className="bg-card p-4 rounded-xl border border-white/10 flex items-start gap-3">
                  <div className="p-2 bg-background rounded-lg text-gray-400 flex-shrink-0">
                    <item.icon size={18} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                    <p className="text-xs text-gray-400 mt-0.5">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Content */}
          <div className="max-w-4xl mx-auto bg-card rounded-2xl border border-white/10 p-6 sm:p-10">
            {loading ? (
              renderSkeletons()
            ) : error ? (
              <div className="text-center py-12">
                <div className="w-14 h-14 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-7 h-7 text-red-500" />
                </div>
                <p className="text-gray-300 mb-4">{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 bg-zan-cyan text-zan-dark rounded-xl text-sm font-bold hover:bg-white transition-colors"
                >
                  Retry
                </button>
              </div>
            ) : content ? (
              <div
                className="rich-html prose dark:prose-invert prose-sm md:prose-base max-w-none
                  prose-headings:font-bold prose-headings:text-white
                  prose-p:text-gray-300 prose-p:leading-relaxed
                  prose-a:text-zan-cyan prose-a:no-underline hover:prose-a:underline
                  prose-strong:text-white
                  prose-li:text-gray-300
                  prose-ul:list-disc prose-ul:pl-4"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : (
              <div className="text-center py-12 text-gray-400">
                <p>No content available at the moment.</p>
              </div>
            )}
          </div>

          {!loading && !error && (
            <div className="max-w-4xl mx-auto mt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-sm text-gray-400">
              {updatedAt && (
                <span>
                  Last updated{" "}
                  {new Date(updatedAt).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              )}
              <span>
                Questions?{" "}
                <Link to="/contact" className="text-zan-cyan hover:underline font-medium">
                  Contact our support team
                </Link>
              </span>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default LegalPageLayout;
