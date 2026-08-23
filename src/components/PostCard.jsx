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

  const getCategoryStyle = (category) => {
    const lowerCategory = category?.toLowerCase() || "";
    if (lowerCategory.includes("tutorial")) return "bg-purple-600";
    if (lowerCategory.includes("blog")) return "bg-blue-600";
    return "bg-emerald-600";
  };

  return (
    <Link
      to={`/postdetails/${post.slug}`}
      state={linkState}
      className="group flex flex-col bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all duration-200 overflow-hidden h-full"
    >
      {/* Image Section */}
      <div className="relative overflow-hidden shrink-0">
        <div className="aspect-[16/10] overflow-hidden bg-gray-100">
          <img
            src={post.thumbnail || "/placeholder-post.jpg"}
            alt={post.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        </div>

        {/* Category Badge */}
        {post.category && (
          <div
            className={`absolute top-3 left-3 ${getCategoryStyle(post.category)} text-white text-xs font-bold px-2.5 py-1 rounded-md`}
          >
            {post.category}
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-grow p-5">
        {/* Meta Top */}
        <div className="flex items-center gap-3 text-xs font-medium text-gray-400 mb-2.5">
          <div className="flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{formatDate(post.created_at)}</span>
          </div>
          {post.read_time && (
            <>
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5" />
                <span>{post.read_time} min read</span>
              </div>
            </>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-gray-900 mb-2 line-clamp-2 leading-snug group-hover:text-blue-600 transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        {post.excerpt && (
          <p className="text-gray-500 text-sm mb-5 line-clamp-3 leading-relaxed flex-grow">
            {post.excerpt}
          </p>
        )}

        {/* Footer Meta */}
        <div className="pt-3.5 mt-auto border-t border-gray-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 flex-shrink-0">
              <User className="h-3.5 w-3.5" />
            </div>
            <span className="text-xs font-medium text-gray-600 truncate">
              {post.author_name || "ZAN Tech Team"}
            </span>
          </div>

          {post.tags && post.tags.length > 0 ? (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <Tag className="h-3.5 w-3.5 text-gray-400" />
              <span className="text-xs font-medium text-gray-500">{post.tags[0]}</span>
            </div>
          ) : (
            <ArrowRight className="h-4 w-4 text-gray-300 group-hover:text-blue-500 group-hover:translate-x-0.5 transition-all flex-shrink-0" />
          )}
        </div>
      </div>
    </Link>
  );
};

export default PostCard;
