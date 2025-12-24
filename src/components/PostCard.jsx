import React from "react";
import { Link } from "react-router-dom";
import { Calendar, Tag, ArrowRight, Clock, User } from "lucide-react";

const PostCard = ({ post, linkState }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Determine category color scheme
  const getCategoryStyle = (category) => {
    const lowerCategory = category?.toLowerCase() || "";
    if (lowerCategory.includes("tutorial")) {
      return "bg-gradient-to-r from-purple-600 to-pink-600 shadow-purple-500/30";
    }
    if (lowerCategory.includes("blog")) {
      return "bg-gradient-to-r from-blue-600 to-indigo-600 shadow-blue-500/30";
    }
    return "bg-gradient-to-r from-emerald-600 to-teal-600 shadow-emerald-500/30";
  };

  return (
    <Link
      to={`/postdetails/${post.slug}`}
      state={linkState}
      className="group flex flex-col bg-white rounded-2xl shadow-sm border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300 overflow-hidden h-full"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden shrink-0">
        <div className="aspect-[16/10] overflow-hidden bg-slate-100">
          <img
            src={post.thumbnail || "/placeholder-post.jpg"}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </div>

        {/* Category Badge */}
        {post.category && (
          <div
            className={`absolute top-4 left-4 ${getCategoryStyle(
              post.category
            )} text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg backdrop-blur-sm border border-white/10`}
          >
            {post.category}
          </div>
        )}

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="absolute bottom-4 right-4 translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
            <div className="bg-white/90 backdrop-blur-md rounded-full p-2.5 shadow-lg">
              <ArrowRight className="h-5 w-5 text-blue-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-6">
        {/* Meta Top */}
        <div className="flex items-center gap-3 text-xs font-medium text-slate-500 mb-3">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          {post.read_time && (
            <>
              <span className="w-1 h-1 rounded-full bg-slate-300" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{post.read_time} min read</span>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2 leading-tight group-hover:text-blue-600 transition-colors duration-300">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-slate-600 text-sm mb-6 line-clamp-3 leading-relaxed flex-grow">
            {post.excerpt}
          </p>
        )}

        {/* Footer Meta */}
        <div className="pt-4 mt-auto border-t border-slate-100 flex items-center justify-between">
          {post.author_name ? (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-600">
                {post.author_name}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                <User className="h-3.5 w-3.5" />
              </div>
              <span className="text-xs font-medium text-slate-600">
                Zantech Team
              </span>
            </div>
          )}

          {post.tags && post.tags.length > 0 && (
            <div className="flex items-center gap-1.5">
              <Tag className="h-3.5 w-3.5 text-slate-400" />
              <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2 py-1 rounded-md border border-slate-100">
                {post.tags[0]}
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
