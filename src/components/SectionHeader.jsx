import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const SectionHeader = ({ icon: Icon, eyebrow, title, subtitle, viewAllHref, viewAllLabel = "View all" }) => {
  return (
    <div className="flex items-end justify-between gap-4 mb-6">
      <div className="min-w-0">
        {eyebrow && (
          <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-600 mb-1.5">
            {Icon && <Icon className="w-3.5 h-3.5" />}
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
      </div>

      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="hidden sm:inline-flex items-center gap-1 text-sm font-semibold text-gray-600 hover:text-blue-600 transition-colors flex-shrink-0 group"
        >
          {viewAllLabel}
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
