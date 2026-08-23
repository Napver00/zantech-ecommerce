import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { config } from "@/config";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle } from "lucide-react";
import Seo from "@/components/Seo";

const PostListLayout = ({
  icon: Icon,
  eyebrow,
  title,
  highlight,
  subtitle,
  category,
  statLabel,
  emptyTitle,
  emptyDescription,
  emptyCtaLabel,
  emptyCtaHref,
  seo,
}) => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = 6;

  useEffect(() => {
    let mounted = true;
    const fetchPosts = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `${config.baseURL}/posts/published?category=${category}&page=${currentPage}&limit=${itemsPerPage}`
        );
        if (!res.ok) throw new Error("Failed to fetch posts.");
        const data = await res.json();
        if (data.success) {
          const postData = Array.isArray(data.data) ? data.data : data.data ? [data.data] : [];
          if (mounted) {
            setPosts(postData);
            if (data.pagination) {
              setTotalPages(data.pagination.total_pages || 1);
              setTotalCount(data.pagination.total_rows || postData.length);
            } else {
              setTotalCount(postData.length);
            }
          }
        } else {
          throw new Error(data.message || "Could not retrieve posts.");
        }
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchPosts();
    return () => {
      mounted = false;
    };
  }, [category, currentPage]);

  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <Skeleton className="h-48 w-full bg-gray-100" />
          <div className="p-5 space-y-3">
            <Skeleton className="h-5 w-3/4 bg-gray-100" />
            <Skeleton className="h-4 w-full bg-gray-100" />
            <Skeleton className="h-4 w-5/6 bg-gray-100" />
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Seo {...seo} type="article" />
      <Header />

      <main className="flex-grow container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-10">
          {Icon && (
            <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-gray-100 mb-4">
              <Icon className="w-5 h-5 text-gray-600" />
            </div>
          )}
          <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-3">
            {title} <span className="text-blue-600">{highlight}</span>
          </h1>
          <p className="text-gray-500 max-w-xl mx-auto">{subtitle}</p>

          {!loading && !error && totalCount > 0 && (
            <p className="text-sm text-gray-400 mt-5">
              <span className="font-bold text-gray-700">{totalCount}</span> {statLabel}
            </p>
          )}
        </div>

        {/* Loading */}
        {loading && renderSkeletons()}

        {/* Error */}
        {!loading && error && (
          <div className="max-w-lg mx-auto bg-white border border-gray-100 rounded-2xl p-10 text-center">
            <div className="w-14 h-14 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="h-7 w-7 text-red-500" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Unable to Load Content</h3>
            <p className="text-gray-500 text-sm mb-5">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-900 hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl text-sm font-semibold transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Grid */}
        {!loading && !error && posts.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  linkState={{ from: category === "tutorial" ? "tutorials" : "blog", page: currentPage }}
                />
              ))}
            </div>
            <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}

        {/* Empty */}
        {!loading && !error && posts.length === 0 && (
          <div className="max-w-lg mx-auto bg-white border border-dashed border-gray-200 rounded-2xl p-12 text-center">
            {Icon && (
              <div className="inline-flex p-4 bg-gray-50 rounded-full mb-5">
                <Icon className="h-8 w-8 text-gray-300" />
              </div>
            )}
            <h3 className="text-xl font-bold text-gray-900 mb-2">{emptyTitle}</h3>
            <p className="text-gray-500 mb-6">{emptyDescription}</p>
            <Link
              to={emptyCtaHref}
              className="inline-flex items-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-6 py-2.5 rounded-xl transition-colors"
            >
              {emptyCtaLabel}
            </Link>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default PostListLayout;
