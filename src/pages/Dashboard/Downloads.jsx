import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Download } from 'lucide-react';

// Kept for old links; the store has no downloadable products yet.
const Downloads = () => (
  <div className="space-y-5">
    <h1 className="text-2xl font-black tracking-tight text-white md:text-3xl">Downloads</h1>
    <div className="rounded-2xl border border-dashed border-white/15 bg-card p-12 text-center">
      <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/5 text-gray-500"><Download className="h-8 w-8" /></span>
      <p className="mt-4 text-lg font-bold text-white">No downloads yet</p>
      <p className="mt-1 text-gray-400">Looking for code and wiring guides for your kit? They're in our tutorials.</p>
      <Link to="/tutorials" className="mt-5 inline-flex h-11 items-center gap-2 rounded-xl bg-zan-cyan px-6 font-bold text-zan-dark hover:opacity-90">
        <BookOpen className="h-4 w-4" /> Open tutorials
      </Link>
    </div>
  </div>
);

export default Downloads;
