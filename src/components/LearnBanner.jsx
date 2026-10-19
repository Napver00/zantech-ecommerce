import React from "react";
import { ArrowUpRight, GraduationCap, Rocket, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const MAIN_SITE = "https://zantechbd.com";

const ITEMS = [
  { icon: GraduationCap, title: "Robotics Courses", text: "Structured classes for kids & teens.", href: `${MAIN_SITE}/courses` },
  { icon: Rocket, title: "Bootcamps", text: "Short, hands-on intensive programs.", href: `${MAIN_SITE}/bootcamps` },
  { icon: BookOpen, title: "Free Tutorials", text: "Step-by-step builds with our parts.", to: "/tutorials" },
];

// Cross-links the store with ZAN Tech's learning side (main website).
const LearnBanner = () => (
  <section className="relative mt-16 overflow-hidden rounded-2xl border border-white/10 bg-surface-dark">
    <div className="pointer-events-none absolute inset-0 bg-grid-pattern opacity-60" />
    <div className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-zan-cyan/10 blur-[100px]" />
    <div className="pointer-events-none absolute -bottom-24 right-0 h-72 w-72 rounded-full bg-zan-red/10 blur-[100px]" />

    <div className="relative grid gap-8 p-6 md:p-10 lg:grid-cols-5 lg:items-center">
      <div className="lg:col-span-2">
        <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.2em] text-zan-cyan">&lt;Learn with ZAN Tech /&gt;</p>
        <h2 className="text-2xl font-bold leading-tight text-white md:text-3xl">
          Don't just buy the parts — <span className="text-zan-cyan">learn to build.</span>
        </h2>
        <p className="mt-3 text-sm text-gray-400 md:text-base">
          Our engineers teach the same kits we sell. Join a course or bootcamp and go from components to a working robot.
        </p>
        <a
          href={MAIN_SITE}
          target="_blank"
          rel="noreferrer"
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-zan-cyan px-5 py-2.5 text-sm font-bold text-zan-dark transition-colors hover:bg-white"
        >
          Visit zantechbd.com <ArrowUpRight className="h-4 w-4" />
        </a>
      </div>

      <div className="grid gap-3 sm:grid-cols-3 lg:col-span-3">
        {ITEMS.map(({ icon: Icon, title, text, href, to }) => {
          const inner = (
            <>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zan-cyan">
                <Icon className="h-5 w-5" />
              </span>
              <div>
                <p className="flex items-center gap-1 font-bold text-white">
                  {title} <ArrowUpRight className="h-3.5 w-3.5 text-gray-500 transition-colors group-hover:text-zan-cyan" />
                </p>
                <p className="mt-1 text-xs text-gray-400">{text}</p>
              </div>
            </>
          );
          const cls = "group flex flex-col gap-4 rounded-xl border border-white/10 bg-zan-dark/60 p-5 transition-colors hover:border-zan-cyan/40";
          return href ? (
            <a key={title} href={href} target="_blank" rel="noreferrer" className={cls}>{inner}</a>
          ) : (
            <Link key={title} to={to} className={cls}>{inner}</Link>
          );
        })}
      </div>
    </div>
  </section>
);

export default LearnBanner;
