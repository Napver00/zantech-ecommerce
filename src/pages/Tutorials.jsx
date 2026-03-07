import React, { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import { config } from "@/config";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, GraduationCap, Target, Zap } from "lucide-react";
import Seo from "@/components/Seo";
import Pagination from "@/components/Pagination";

const Tutorials = () => {
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [totalPages, setTotalPages] = useState(1);
  const [totalTutorials, setTotalTutorials] = useState(0);

  // Get current page from URL or default to 1
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const itemsPerPage = 6;

  useEffect(() => {
    const fetchTutorials = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(
          `${config.baseURL}/posts/published?category=tutorial&page=${currentPage}&limit=${itemsPerPage}`,
        );
        if (!response.ok) {
          throw new Error("Failed to fetch tutorials.");
        }
        const data = await response.json();
        if (data.success) {
          const postData = Array.isArray(data.data)
            ? data.data
            : data.data
              ? [data.data]
              : [];
          setTutorials(postData);

          if (data.pagination) {
            setTotalPages(data.pagination.total_pages);
            setTotalTutorials(data.pagination.total_rows);
          }
        } else {
          throw new Error(data.message || "Could not retrieve tutorials.");
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchTutorials();
  }, [currentPage]);

  const handlePageChange = (page) => {
    setSearchParams({ page: page.toString() });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const renderSkeletons = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: 6 }).map((_, i) => (
        <div
          key={i}
          className="bg-white rounded-2xl shadow-sm border-2 border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
        >
          <Skeleton className="h-56 w-full bg-gradient-to-br from-purple-50 to-pink-100" />
          <div className="p-6 space-y-4">
            <Skeleton className="h-6 w-3/4 bg-gray-200" />
            <Skeleton className="h-4 w-full bg-gray-200" />
            <Skeleton className="h-4 w-5/6 bg-gray-200" />
            <div className="flex gap-2 pt-2">
              <Skeleton className="h-6 w-20 rounded-full bg-gray-200" />
              <Skeleton className="h-6 w-24 rounded-full bg-gray-200" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-purple-50">
      {/*  SEO for Tutorials listing page */}
      <Seo
        title={`Robotics & IoT Tutorials - Page ${currentPage} | Zantech Store Bangladesh`}
        description="Step-by-step tutorials on Arduino, ESP32, robotics, IoT and electronics. Learn practical projects, coding, and hardware with Zantech Store’s free tutorials in Bangladesh."
        url={`https://store.zantechbd.com/tutorials?page=${currentPage}`}
        type="article"
        keywords="Arduino tutorial Bangladesh, ESP32 tutorial, robotics tutorials BD, IoT tutorials, Zantech tutorials, electronics learning"
      />

      <Header />
      <main className="flex-grow container mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Learn with{" "}
            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              Tutorials
            </span>
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Master new skills with our comprehensive step-by-step guides. From
            beginner basics to advanced techniques, we've got you covered.
          </p>

          {/* Stats or Features */}
          {!loading && !error && tutorials.length > 0 && (
            <div className="flex flex-wrap justify-center gap-8 mt-10">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-purple-100 rounded-xl">
                  <GraduationCap className="h-6 w-6 text-purple-600" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-900">
                    {totalTutorials}
                  </p>
                  <p className="text-sm text-gray-600">Tutorials</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-100 rounded-xl">
                  <Target className="h-6 w-6 text-pink-600" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-900">Focused</p>
                  <p className="text-sm text-gray-600">Learning</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-3 bg-indigo-100 rounded-xl">
                  <Zap className="h-6 w-6 text-indigo-600" />
                </div>
                <div className="text-left">
                  <p className="text-2xl font-bold text-gray-900">Practical</p>
                  <p className="text-sm text-gray-600">Examples</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Loading State */}
        {loading && renderSkeletons()}

        {/* Error State */}
        {!loading && error && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-12 text-center shadow-sm">
              <div className="inline-flex p-4 bg-red-100 rounded-full mb-6">
                <AlertTriangle className="h-12 w-12 text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-red-900 mb-3">
                Unable to Load Tutorials
              </h3>
              <p className="text-red-700 text-lg mb-6">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-8 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Try Again
              </button>
            </div>
          </div>
        )}

        {/* Tutorials Grid */}
        {!loading && !error && tutorials.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {tutorials.map((tutorial) => (
                <PostCard
                  key={tutorial.id}
                  post={tutorial}
                  linkState={{ from: "tutorials", page: currentPage }}
                />
              ))}
            </div>

            {/* Pagination Controls */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}

        {/* Empty State */}
        {!loading && !error && tutorials.length === 0 && (
          <div className="max-w-2xl mx-auto">
            <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center">
              <div className="inline-flex p-5 bg-white rounded-full shadow-sm mb-6">
                <GraduationCap className="h-16 w-16 text-gray-400" />
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-4">
                No Tutorials Yet
              </h3>
              <p className="text-gray-600 text-lg mb-8">
                We're creating comprehensive tutorials for you. Check back soon
                for step-by-step guides and learning materials!
              </p>
              <Link
                to="/blog"
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white font-semibold px-8 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Read Our Blog
              </Link>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Tutorials;
