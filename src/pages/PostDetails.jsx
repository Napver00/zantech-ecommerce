import React, { useEffect, useState } from "react";
import { useParams, Link, useLocation } from "react-router-dom"; // Updated Link import
import parse, { domToReact } from "html-react-parser"; // 1. Import Parser
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { config } from "@/config";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertTriangle, Calendar, ArrowLeft, User, Share2 } from "lucide-react";
import Seo from "@/components/Seo";
import CodeBlock from "@/components/CodeBlock"; // 2. Import your new CodeBlock

const PostDetails = () => {
  const { slug } = useParams();
  const location = useLocation(); // Hook to access state
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Determine back link destination
  const backLink =
    location.state?.from === "tutorials"
      ? `/tutorials?page=${location.state.page}`
      : "/blog";

  const backText =
    location.state?.from === "tutorials" ? "Back to Tutorials" : "Back to Blog";

  // --- Fetch Data Logic (No Changes Here) ---
  useEffect(() => {
    const fetchPost = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch(`${config.baseURL}/posts/${slug}`);
        if (!response.ok) throw new Error("Post not found.");
        const data = await response.json();
        if (data.success && data.data) setPost(data.data);
        else throw new Error(data.message || "Could not retrieve the post.");
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  // --- 3. THE MAGIC PARSER CONFIGURATION ---
  // This tells React how to handle specific HTML tags from your database
  const parseOptions = {
    replace: (domNode) => {
      // A. If we find a <pre> tag, turn it into our fancy CodeBlock
      if (domNode.name === "pre") {
        // Check if the pre tag contains a code tag immediately inside
        const hasCodeTag =
          domNode.children.length > 0 && domNode.children[0].name === "code";

        let codeContent;
        if (hasCodeTag) {
          // If <pre><code>...</code></pre>, stick to the inner content
          codeContent = domToReact(domNode.children[0].children, parseOptions);
        } else {
          // Otherwise just use the children of <pre>
          codeContent = domToReact(domNode.children, parseOptions);
        }

        return <CodeBlock>{codeContent}</CodeBlock>;
      }

      // B. If we find a YouTube iframe, make it responsive
      if (
        domNode.name === "iframe" &&
        domNode.attribs.src?.includes("youtube")
      ) {
        const { frameborder, allowfullscreen, ...iframeAttribs } = domNode.attribs;
        return (
          <div className="relative w-full aspect-video my-8 rounded-2xl overflow-hidden border border-gray-100">
            <iframe
              {...iframeAttribs}
              frameBorder={frameborder}
              allowFullScreen={allowfullscreen !== undefined}
              className="absolute top-0 left-0 w-full h-full"
              title="Video content"
            />
          </div>
        );
      }

      // C. If we find an Image, add some nice styling
      if (domNode.name === "img") {
        return (
          <img
            {...domNode.attribs}
            className="w-full h-auto rounded-xl shadow-lg my-6 mx-auto border-2 border-gray-100"
          />
        );
      }
    },
  };

  // --- Helper Functions ---
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: post.title, url: window.location.href });
      } catch (err) {}
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert("Link copied!");
    }
  };

  // --- Render Loading State ---
  if (loading)
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="h-screen flex justify-center items-center">
          <Skeleton className="h-12 w-1/2" />
        </div>
        <Footer />
      </div>
    );

  // --- Render Error State ---
  if (error || !post)
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Header />
        <div className="flex-grow flex justify-center items-center p-4">
          <div className="text-center">
            <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold">Post Not Found</h2>
            <Link
              to="/blog"
              className="text-blue-500 hover:underline mt-4 block"
            >
              Go Back
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );

  // --- SEO Setup ---
  const siteUrl = "https://store.zantechbd.com";
  const postUrl = `${siteUrl}/postdetails/${slug}`;
  const seoImage = post.thumbnail_url || `${siteUrl}/zantech-logo.webp`;

  return (
    <div className="flex flex-col min-h-screen bg-white font-sans">
      <Seo
        title={`${post.title} | Zantech`}
        description={post.title}
        image={seoImage}
        url={postUrl}
        type="article"
      />

      <Header />

      <main className="flex-grow">
        {/* HERO SECTION */}
        <div className="relative w-full min-h-[50vh] flex items-end bg-gray-900">
          {/* Background Image */}
          <div className="absolute inset-0 opacity-60">
            {post.thumbnail_url && (
              <img
                src={post.thumbnail_url}
                alt={post.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-transparent to-transparent" />

          {/* Title Content */}
          <div className="relative container mx-auto px-4 pb-12 pt-32 max-w-5xl z-10 text-white">
            {post.category && (
              <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
                {post.category}
              </span>
            )}
            <h1 className="text-4xl md:text-6xl font-black mb-4 drop-shadow-lg">
              {post.title}
            </h1>
            <div className="flex items-center gap-4 text-gray-300 font-medium">
              {post.author_name && (
                <span className="flex items-center gap-2">
                  <User size={16} /> {post.author_name}
                </span>
              )}
              <span className="flex items-center gap-2">
                <Calendar size={16} /> {formatDate(post.created_at)}
              </span>
            </div>
          </div>
        </div>

        {/* MAIN CONTENT AREA */}
        <div className="relative bg-white z-20 px-4 py-12">
          <div className="container mx-auto max-w-4xl">
            {/* Back Link */}
            <Link
              to={backLink}
              className="inline-flex items-center gap-2 text-gray-500 hover:text-blue-600 mb-8 font-bold transition-colors"
            >
              <ArrowLeft size={20} /> {backText}
            </Link>

            {/* 4. THE CONTENT CONTAINER */}
            {/* The 'prose' class automates all the typography styling */}
            <article
              className="prose prose-lg prose-blue md:prose-xl max-w-none 
                prose-headings:font-black prose-headings:text-gray-900 
                prose-p:text-gray-700 prose-li:text-gray-700
                prose-img:rounded-xl"
            >
              {/* This replaces {post.content} */}
              {parse(post.content || "", parseOptions)}
            </article>

            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="mt-12 pt-8 border-t border-gray-100">
                <h4 className="text-sm font-bold text-gray-400 uppercase mb-3">
                  Tags
                </h4>
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag, i) => (
                    <span
                      key={i}
                      className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-sm font-bold"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Share Section */}
        <div className="bg-blue-600 py-16 text-center text-white">
          <h3 className="text-2xl font-bold mb-6">Found this helpful?</h3>
          <button
            onClick={handleShare}
            className="bg-white text-blue-600 px-8 py-3 rounded-full font-bold shadow-lg hover:scale-105 transition-transform flex items-center gap-2 mx-auto"
          >
            <Share2 size={20} /> Share with Friends
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PostDetails;
