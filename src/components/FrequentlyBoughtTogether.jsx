import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { config } from "@/config";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { ShoppingCart, Check } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

const FrequentlyBoughtTogether = ({ currentProduct, categorySlug }) => {
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkedIds, setCheckedIds] = useState(new Set());
  const { addToCart } = useCart();

  useEffect(() => {
    if (!categorySlug) {
      setLoading(false);
      return;
    }
    let mounted = true;
    const fetchRelated = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${config.baseURL}/products/category/${categorySlug}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json.success && Array.isArray(json.data) && mounted) {
          const items = json.data
            .filter((p) => p.id !== currentProduct.id)
            .slice(0, 2)
            .map((p) => ({
              ...p,
              image: p.image || p.image_path || (Array.isArray(p.images) && p.images[0]?.path) || "",
              discountedPrice: p.discountedPrice ?? p.discounted_price ?? p.price,
            }));
          setRelated(items);
          setCheckedIds(new Set([currentProduct.id, ...items.map((i) => i.id)]));
        }
      } catch (err) {
        console.error("Failed to load frequently bought together:", err);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    fetchRelated();
    return () => {
      mounted = false;
    };
  }, [categorySlug, currentProduct.id]);

  if (!loading && related.length === 0) return null;

  const items = [currentProduct, ...related];

  const toggle = (id) => {
    if (id === currentProduct.id) return;
    setCheckedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const selectedItems = items.filter((i) => checkedIds.has(i.id));
  const total = selectedItems.reduce((sum, i) => sum + (i.discountedPrice ?? i.price ?? 0), 0);

  const handleAddSelected = () => {
    selectedItems.forEach((item) => addToCart(item, 1));
    toast.success("Added to cart", {
      description: `${selectedItems.length} item${selectedItems.length !== 1 ? "s" : ""} added`,
    });
  };

  return (
    <div className="pt-5 mt-5 border-t border-gray-100">
      <p className="text-xs font-black text-gray-900 uppercase tracking-wide mb-3">
        Frequently Bought Together
      </p>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-xl bg-gray-100" />
          ))}
        </div>
      ) : (
        <>
          <ul className="space-y-1">
            {items.map((item) => {
              const isCurrent = item.id === currentProduct.id;
              const isChecked = checkedIds.has(item.id);
              return (
                <li key={item.id} className="flex items-center gap-2.5 py-1.5">
                  <button
                    type="button"
                    onClick={() => toggle(item.id)}
                    disabled={isCurrent}
                    className={`w-4 h-4 rounded flex items-center justify-center border-2 flex-shrink-0 transition-colors ${
                      isChecked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                    } ${isCurrent ? "cursor-default opacity-60" : "cursor-pointer hover:border-blue-400"}`}
                  >
                    {isChecked && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  </button>
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-9 h-9 rounded-lg object-contain bg-gray-50 border border-gray-100 flex-shrink-0 p-1"
                  />
                  {isCurrent ? (
                    <span className="flex-1 min-w-0 text-xs font-semibold text-gray-500 truncate">
                      This item
                    </span>
                  ) : (
                    <Link
                      to={`/product/${item.slug}`}
                      className="flex-1 min-w-0 text-xs font-semibold text-gray-700 hover:text-blue-600 truncate"
                      title={item.name}
                    >
                      {item.name}
                    </Link>
                  )}
                  <span className="text-xs font-bold text-gray-900 flex-shrink-0">
                    ৳{(item.discountedPrice ?? item.price ?? 0).toLocaleString()}
                  </span>
                </li>
              );
            })}
          </ul>

          <div className="flex items-center justify-between gap-3 mt-4">
            <div>
              <p className="text-[10px] text-gray-400 uppercase tracking-wide font-semibold">
                {selectedItems.length} selected
              </p>
              <p className="text-lg font-black text-gray-900">৳{total.toLocaleString()}</p>
            </div>
            <button
              onClick={handleAddSelected}
              disabled={selectedItems.length === 0}
              className="bg-gray-900 hover:bg-gray-800 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-2.5 px-4 rounded-xl flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] text-xs flex-shrink-0"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Add Selected
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FrequentlyBoughtTogether;
