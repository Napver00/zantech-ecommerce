import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { config } from '@/config';
import {
  ChevronRight, AlertTriangle, Grid3X3, Search, X,
  Cpu, Zap, Package, Trophy, Layers, Circle, Tag,
  Radio, Settings, Microchip, Wrench, Bot,
  CircuitBoard, Battery, Gauge, Wifi, Camera,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

const getCategoryIcon = (name = '') => {
  const n = name.toLowerCase();
  if (n.includes('robot') || n.includes('arm') || n.includes('chassis')) return Bot;
  if (n.includes('competition')) return Trophy;
  if (n.includes('kit') || n.includes('starter') || n.includes('package')) return Package;
  if (n.includes('sensor')) return Gauge;
  if (n.includes('motor') || n.includes('servo')) return Settings;
  if (n.includes('wheel')) return Circle;
  if (n.includes('power') || n.includes('battery')) return Battery;
  if (n.includes('transistor') || n.includes('mosfet')) return Cpu;
  if (n.includes('capacitor') || n.includes('resistor') || n.includes('diode')) return CircuitBoard;
  if (n.includes('esp') || n.includes('wifi') || n.includes('bluetooth')) return Wifi;
  if (n.includes('arduino') || n.includes('raspberry') || n.includes('micro')) return Microchip;
  if (n.includes('camera') || n.includes('display') || n.includes('screen')) return Camera;
  if (n.includes('module') || n.includes('board')) return Radio;
  if (n.includes('tool') || n.includes('wire') || n.includes('cable')) return Wrench;
  if (n.includes('3d') || n.includes('print')) return Layers;
  if (n.includes('iot') || n.includes('smart')) return Zap;
  return Tag;
};

const CategorySidebar = () => {
  const [categories, setCategories] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const activeSlug = new URLSearchParams(location.search).get('category_slug') || '';

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`${config.baseURL}/categories`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const result = await response.json();
        if (result.success && Array.isArray(result.data)) {
          setCategories(result.data);
          setFiltered(result.data);
        } else {
          throw new Error('API response format is incorrect.');
        }
      } catch (e) {
        setError(e.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFiltered(categories);
    } else {
      setFiltered(categories.filter(c =>
        c.name.toLowerCase().includes(searchTerm.toLowerCase())
      ));
    }
  }, [searchTerm, categories]);

  const handleSelectCategory = (slug) => {
    navigate(`/shop?category_slug=${encodeURIComponent(slug)}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">

      {/* Header */}
      <div className="bg-gray-900 px-4 py-4">
        <div className="flex items-center gap-2.5 mb-3">
          <Grid3X3 className="w-4 h-4 text-white" />
          <span className="text-white font-bold text-sm tracking-wide uppercase">Categories</span>
        </div>
        {/* Search within categories */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-white/50" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Filter categories..."
            className="w-full bg-white/10 border border-white/20 text-white placeholder-white/40 text-xs rounded-xl pl-8 pr-3 py-2 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all"
          />
          {searchTerm && (
            <button onClick={() => setSearchTerm('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-white/50 hover:text-white">
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* All Categories link */}
      <button
        onClick={() => navigate('/shop')}
        className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-semibold transition-all border-b border-gray-100 ${
          !activeSlug && location.pathname === '/shop'
            ? 'bg-blue-50 text-blue-700 border-l-4 border-l-blue-600'
            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 border-l-4 border-l-transparent'
        }`}
      >
        <Grid3X3 className="w-4 h-4 text-gray-400 flex-shrink-0" />
        <span>All Products</span>
        <ChevronRight className="w-3.5 h-3.5 ml-auto text-gray-400" />
      </button>

      {/* Categories list */}
      <div className="scroll-strip max-h-[480px] overflow-y-auto overscroll-contain">
        {isLoading ? (
          <ul className="p-3 space-y-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <li key={i} className="flex items-center gap-3 px-2 py-2">
                <Skeleton className="w-7 h-7 rounded-lg bg-gray-100" />
                <Skeleton className="h-4 flex-1 bg-gray-100" />
              </li>
            ))}
          </ul>
        ) : error ? (
          <div className="p-6 text-center">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <p className="text-sm text-red-600 font-medium mb-2">Failed to load</p>
            <button onClick={() => window.location.reload()} className="text-xs text-blue-600 hover:underline">
              Try Again
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-8 text-center">
            <Search className="h-8 w-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">
              {searchTerm ? `No results for "${searchTerm}"` : 'No categories available'}
            </p>
          </div>
        ) : (
          <ul className="p-2">
            {filtered.map((category) => {
              const Icon = getCategoryIcon(category.name);
              const isActive = activeSlug === category.slug;

              return (
                <li key={category.id}>
                  <button
                    type="button"
                    onClick={() => handleSelectCategory(category.slug)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-colors group ${
                      isActive
                        ? 'bg-blue-50 text-blue-700 font-semibold'
                        : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                  >
                    <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-blue-600' : 'text-gray-400'}`} />
                    <span className="flex-1 text-left leading-snug line-clamp-1">{category.name}</span>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-all ${
                      isActive ? 'text-blue-500' : 'text-gray-300 group-hover:text-gray-500 group-hover:translate-x-0.5'
                    }`} />
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Footer */}
      {!isLoading && !error && categories.length > 0 && (
        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50/50">
          <p className="text-[11px] text-gray-400 text-center font-medium">
            {searchTerm
              ? `${filtered.length} of ${categories.length} categories`
              : `${categories.length} categories`}
          </p>
        </div>
      )}
    </div>
  );
};

export default CategorySidebar;
