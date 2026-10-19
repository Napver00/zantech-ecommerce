import { config } from "@/config";

// The product endpoints return slightly different shapes; give ProductCard one shape.
export const normalizeProduct = (p) => {
  const discountedPrice = p.discountedPrice ?? p.discounted_price ?? p.price;
  return {
    ...p,
    image: p.image || p.image_path || (Array.isArray(p.image_paths) && p.image_paths[0]) || "",
    discountedPrice,
    discountPercentage: p.discountPercentage ?? p.discount_percentage ?? null,
    discount:
      p.discount ??
      (discountedPrice && discountedPrice < p.price ? Math.round(((p.price - discountedPrice) / p.price) * 100) : 0),
  };
};

// Small in-memory cache so switching home-page tabs back and forth doesn't refetch.
const cache = new Map();

export const fetchProducts = async (path) => {
  if (cache.has(path)) return cache.get(path);
  const res = await fetch(`${config.baseURL}${path}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success || !Array.isArray(json.data)) throw new Error("Unexpected API response");
  const data = json.data.map(normalizeProduct);
  cache.set(path, data);
  return data;
};
