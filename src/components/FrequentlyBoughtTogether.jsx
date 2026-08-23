import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { config } from "@/config";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { Plus, ShoppingCart, Check } from "lucide-react";
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
    <section className="mb-8">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 md:p-6">
        <div className="flex items-center gap-2.5 mb-5">
          <div className="w-9 h-9 rounded-xl bg-gray-900 flex items-center justify-center flex-shrink-0">
            <ShoppingCart className="w-4 h-4 text-white" />
          </div>
          <h2 className="text-lg md:text-xl font-extrabold text-gray-900">Frequently Bought Together</h2>
        </div>

        {loading ? (
          <div className="flex items-center gap-3 overflow-x-auto">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="w-32 h-40 rounded-xl bg-gray-100 flex-shrink-0" />
            ))}
          </div>
        ) : (
          <>
            <div className="flex items-stretch gap-2 overflow-x-auto pb-2">
              {items.map((item, idx) => {
                const isCurrent = item.id === currentProduct.id;
                const isChecked = checkedIds.has(item.id);
                return (
                  <React.Fragment key={item.id}>
                    {idx > 0 && (
                      <div className="flex items-center justify-center flex-shrink-0 text-gray-300">
                        <Plus className="w-5 h-5" />
                      </div>
                    )}
                    <div className="flex-shrink-0 w-28 sm:w-32">
                      <button
                        type="button"
                        onClick={() => toggle(item.id)}
                        disabled={isCurrent}
                        className={`relative w-full aspect-square rounded-xl border-2 p-2 mb-2 transition-all ${
                          isChecked ? "border-blue-500 bg-blue-50/40" : "border-gray-100 bg-gray-50"
                        } ${isCurrent ? "cursor-default" : "cursor-pointer hover:border-blue-300"}`}
                      >
                        <span
                          className={`absolute top-1.5 left-1.5 w-5 h-5 rounded-md flex items-center justify-center border-2 ${
                            isChecked ? "bg-blue-600 border-blue-600" : "bg-white border-gray-300"
                          }`}
                        >
                          {isChecked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
                        </span>
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </button>
                      {isCurrent ? (
                        <p className="text-[11px] font-bold text-gray-900 text-center leading-snug line-clamp-2">
                          This item
                        </p>
                      ) : (
                        <Link
                          to={`/product/${item.slug}`}
                          className="text-[11px] font-semibold text-gray-600 hover:text-blue-600 text-center leading-snug line-clamp-2 block"
                          title={item.name}
                        >
                          {item.name}
                        </Link>
                      )}
                      <p className="text-xs font-bold text-gray-900 text-center mt-1">
                        ৳{(item.discountedPrice ?? item.price ?? 0).toLocaleString()}
                      </p>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            <div className="mt-5 pt-5 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <p className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
                  Total for {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""}
                </p>
                <p className="text-2xl font-black text-gray-900">৳{total.toLocaleString()}</p>
              </div>
              <button
                onClick={handleAddSelected}
                disabled={selectedItems.length === 0}
                className="bg-gray-900 hover:bg-blue-600 disabled:bg-gray-200 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] text-sm flex-shrink-0"
              >
                <ShoppingCart className="w-4 h-4" />
                Add Selected to Cart
              </button>
            </div>
          </>
        )}
      </div>
    </section>
  );
};

export default FrequentlyBoughtTogether;
