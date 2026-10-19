import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategoryShowcase from "@/components/CategoryShowcase";
import CompletePackage from "@/components/CompletePackage";
import ProductTabs from "@/components/ProductTabs";
import LearnBanner from "@/components/LearnBanner";
import Seo from "@/components/Seo";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const TRUST = [
  { icon: Truck, title: "Fast Delivery", desc: "Next day inside Dhaka" },
  { icon: ShieldCheck, title: "Genuine Products", desc: "100% authentic parts" },
  { icon: RotateCcw, title: "Easy Returns", desc: "3-day return policy" },
  { icon: Headphones, title: "Expert Support", desc: "Robotics specialists" },
];

const TrustStrip = () => (
  <div className="mt-4 grid grid-cols-2 overflow-hidden rounded-xl border border-white/10 bg-surface-dark md:grid-cols-4">
    {TRUST.map(({ icon: Icon, title, desc }, i) => (
      <div
        key={title}
        className={`flex items-center gap-3 px-4 py-4 md:px-6 ${i % 2 ? "border-l" : ""} ${i > 1 ? "border-t md:border-t-0" : ""} ${i === 2 ? "md:border-l" : ""} border-white/10`}
      >
        <Icon className="h-6 w-6 flex-shrink-0 text-zan-cyan" strokeWidth={1.6} />
        <div className="min-w-0">
          <p className="text-sm font-bold text-white">{title}</p>
          <p className="truncate text-xs text-gray-400">{desc}</p>
        </div>
      </div>
    ))}
  </div>
);

const HomePage = () => {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Seo
        title="ZAN Tech Store - Robotics, IoT & Electronics in Bangladesh"
        description="Shop Arduino, ESP32, Raspberry Pi, sensors, robotics kits, competition robot packages, and IoT solutions in Bangladesh. Perfect for students, hobbyists, and professionals."
        url="https://store.zantechbd.com/"
        type="website"
        keywords="ZAN Tech Store, Zantech Store, Arduino Bangladesh, ESP32 Bangladesh, robotics store BD, IoT store Bangladesh, electronics components Bangladesh, robotics kits, competition robot kit, STEM education Bangladesh"
      />

      <Header />

      <main className="container mx-auto flex-grow px-4 pt-5">
        <HeroSection />
        <TrustStrip />
        <CategoryShowcase />
        <ProductTabs />
        <CompletePackage />
        <LearnBanner />
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
