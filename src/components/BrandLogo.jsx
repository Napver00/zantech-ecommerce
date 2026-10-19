import React from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

// Same lockup as the main website (zantechbd.com): circuit mark + ZANTECH wordmark.
const BrandLogo = ({ className, compact = false, onClick }) => (
  <Link to="/" onClick={onClick} className={cn("group relative flex items-center gap-2.5 shrink-0", className)} aria-label="ZAN Tech Store home">
    <span className="absolute -inset-2 rounded-full bg-zan-cyan/20 blur-lg opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
    <img src="/zantech-mark.png" alt="" className={cn("relative h-auto", compact ? "w-8" : "w-10")} />
    <span className="relative flex flex-col leading-none">
      <span className={cn("font-bold tracking-widest text-white", compact ? "text-lg" : "text-xl")}>
        ZAN<span className="text-zan-red">TECH</span>
      </span>
      <span className="mt-1 font-mono text-[0.6rem] uppercase tracking-[0.3em] text-zan-cyan/80 transition-colors group-hover:text-zan-cyan">
        Store
      </span>
    </span>
  </Link>
);

export default BrandLogo;
