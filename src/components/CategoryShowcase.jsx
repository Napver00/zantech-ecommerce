import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { config } from "@/config";
import { Skeleton } from "@/components/ui/skeleton";
import SectionHeader from "./SectionHeader";
import {
  LayoutGrid, Cpu, Zap, Package, Trophy, Layers, Circle, Tag,
  Radio, Settings, Microchip, Wrench, Bot, CircuitBoard, Battery, Gauge,
  Wifi, Camera,
} from "lucide-react";

const getCategoryIcon = (name = "") => {
  const n = name.toLowerCase();
  if (n.includes("robot") || n.includes("arm") || n.includes("chassis")) return Bot;
  if (n.includes("competition")) return Trophy;
  if (n.includes("kit") || n.includes("starter") || n.includes("package")) return Package;
  if (n.includes("sensor")) return Gauge;
  if (n.includes("motor") || n.includes("servo")) return Settings;
  if (n.includes("wheel")) return Circle;
  if (n.includes("power") || n.includes("battery")) return Battery;
  if (n.includes("transistor") || n.includes("mosfet")) return Cpu;
  if (n.includes("capacitor") || n.includes("resistor") || n.includes("diode")) return CircuitBoard;
  if (n.includes("esp") || n.includes("wifi") || n.includes("bluetooth") || n.includes("wireless")) return Wifi;
  if (n.includes("arduino") || n.includes("raspberry") || n.includes("micro")) return Microchip;
  if (n.includes("camera") || n.includes("display") || n.includes("screen")) return Camera;
  if (n.includes("module") || n.includes("board") || n.includes("ic")) return Radio;
  if (n.includes("tool") || n.includes("wire") || n.includes("cable") || n.includes("accessor")) return Wrench;
  if (n.includes("3d") || n.includes("print")) return Layers;
  if (n.includes("iot") || n.includes("smart")) return Zap;
  return Tag;
};

const CategoryShowcase = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.baseURL}/categories`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && mounted) {
          setCategories(json.data);
        }
      } catch (err) {
        console.error("Failed to load categories:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchCategories();
    return () => {
      mounted = false;
    };
  }, []);

  if (!loading && categories.length === 0) return null;

  return (
    <section className="mt-14">
      <SectionHeader
        icon={LayoutGrid}
        eyebrow="Browse"
        title="Shop by Category"
        subtitle="Find exactly what your project needs"
        viewAllHref="/shop"
        viewAllLabel="All categories"
      />

      <div className="scroll-strip flex gap-2 overflow-x-auto pb-3 -mx-4 px-4 sm:mx-0 sm:px-0">
        {loading
          ? Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="flex-shrink-0 w-20 flex flex-col items-center gap-2">
                <Skeleton className="w-14 h-14 rounded-xl bg-gray-100" />
                <Skeleton className="h-3 w-14 bg-gray-100" />
              </div>
            ))
          : categories.map((category) => {
              const Icon = getCategoryIcon(category.name);
              return (
                <button
                  key={category.id}
                  onClick={() =>
                    navigate(`/shop?category_slug=${encodeURIComponent(category.slug)}`)
                  }
                  className="group flex-shrink-0 w-20 flex flex-col items-center gap-2"
                >
                  <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center transition-colors group-hover:bg-blue-50 group-hover:border-blue-100">
                    <Icon className="w-5 h-5 text-gray-500 group-hover:text-blue-600 transition-colors" />
                  </div>
                  <span className="text-[11px] font-medium text-gray-600 text-center leading-tight line-clamp-2">
                    {category.name}
                  </span>
                </button>
              );
            })}
      </div>
    </section>
  );
};

export default CategoryShowcase;
