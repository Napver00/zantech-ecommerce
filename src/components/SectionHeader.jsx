import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

// Section title in the main website's style: mono "tech" eyebrow, bold heading, view-all link.
const SectionHeader = ({ icon: Icon, eyebrow, title, subtitle, viewAllHref, viewAllLabel = "View all" }) => {
  return (
    <div className="mb-6 flex items-end justify-between gap-4 border-b border-white/10 pb-4">
      <div className="min-w-0">
        {eyebrow && (
          <span className="mb-2 inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.2em] text-zan-cyan">
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {eyebrow}
          </span>
        )}
        <h2 className="text-2xl font-bold leading-tight tracking-tight text-white md:text-[28px]">{title}</h2>
        {subtitle && <p className="mt-1 text-sm text-gray-400">{subtitle}</p>}
      </div>

      {viewAllHref && (
        <Link
          to={viewAllHref}
          className="group hidden flex-shrink-0 items-center gap-1.5 rounded-lg border border-white/10 px-4 py-2 text-sm font-semibold text-gray-300 transition-colors hover:border-zan-cyan/50 hover:text-zan-cyan sm:inline-flex"
        >
          {viewAllLabel}
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </Link>
      )}
    </div>
  );
};

export default SectionHeader;
