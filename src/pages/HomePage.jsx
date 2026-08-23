import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroSection from "@/components/HeroSection";
import CategorySidebar from "@/components/CategorySidebar";
import CategoryShowcase from "@/components/CategoryShowcase";
import CompletePackage from "@/components/CompletePackage";
import CompetitionPackage from "@/components/CompetitionPackage";
import BestSelling from "@/components/BestSelling";
import RecentlyAdded from "@/components/RecentlyAdded";
import Seo from "@/components/Seo";
import { Truck, ShieldCheck, RotateCcw, Headphones } from "lucide-react";

const FeatureStrip = () => (
  <div className="bg-white border border-gray-100 rounded-2xl shadow-sm mb-8 overflow-hidden">
    <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-gray-100">
      {[
        {
          icon: <Truck className="w-5 h-5" />,
          title: "Fast Delivery",
          desc: "Dhaka next day",
          color: "bg-blue-50 text-blue-600",
        },
        {
          icon: <ShieldCheck className="w-5 h-5" />,
          title: "Genuine Products",
          desc: "100% authentic",
          color: "bg-emerald-50 text-emerald-600",
        },
        {
          icon: <RotateCcw className="w-5 h-5" />,
          title: "Easy Returns",
          desc: "3-day return policy",
          color: "bg-purple-50 text-purple-600",
        },
        {
          icon: <Headphones className="w-5 h-5" />,
          title: "Expert Support",
          desc: "Robotics specialists",
          color: "bg-amber-50 text-amber-600",
        },
      ].map((item) => (
        <div key={item.title} className="flex items-center gap-3 px-4 py-5">
          <div className={`p-2.5 rounded-xl ${item.color} flex-shrink-0`}>
            {item.icon}
          </div>
          <div>
            <p className="font-bold text-gray-900 text-sm">{item.title}</p>
            <p className="text-gray-500 text-xs">{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <Seo
        title="Zantech Store - Robotics, IoT & Electronics in Bangladesh"
        description="Shop Arduino, ESP32, Raspberry Pi, sensors, robotics kits, competition robot packages, and IoT solutions in Bangladesh. Perfect for students, hobbyists, and professionals."
        url="https://store.zantechbd.com/"
        type="website"
        keywords="Zantech Store, Arduino Bangladesh, ESP32 Bangladesh, robotics store BD, IoT store Bangladesh, electronics components Bangladesh, robotics kits, competition robot kit, STEM education Bangladesh"
      />

      <Header />

      <main className="flex-grow container mx-auto px-4 mt-6 pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <aside className="col-span-1 hidden lg:block">
            <div className="sticky top-4">
              <CategorySidebar />
            </div>
          </aside>

          <div className="col-span-1 lg:col-span-3 space-y-0">
            <HeroSection />
            <FeatureStrip />
            <CategoryShowcase />
            <CompletePackage />
            <CompetitionPackage />
            <BestSelling />
            <RecentlyAdded />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default HomePage;
