import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { config } from "@/config";

const CategoriesContext = createContext();

export const useCategories = () => useContext(CategoriesContext);

// Module-level cache so the list survives remounts and is shared across
// every consumer without re-fetching, and a shared in-flight promise so
// simultaneous mounts (e.g. Header + Sidebar + Showcase on the same page)
// dedupe into a single network request instead of one each.
let cachedCategories = null;
let inFlightRequest = null;

const fetchCategories = () => {
  if (cachedCategories) return Promise.resolve(cachedCategories);
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = fetch(`${config.baseURL}/categories`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((json) => {
      if (!json.success || !Array.isArray(json.data)) {
        throw new Error("API response format is incorrect.");
      }
      cachedCategories = json.data;
      return cachedCategories;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
};

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState(cachedCategories || []);
  const [isLoading, setIsLoading] = useState(!cachedCategories);
  const [error, setError] = useState(null);

  const load = useCallback(() => {
    setIsLoading(true);
    setError(null);
    fetchCategories()
      .then((data) => setCategories(data))
      .catch((e) => setError(e.message))
      .finally(() => setIsLoading(false));
  }, []);

  useEffect(() => {
    if (cachedCategories) {
      setCategories(cachedCategories);
      setIsLoading(false);
      return;
    }
    load();
  }, [load]);

  const refetch = useCallback(() => {
    cachedCategories = null;
    load();
  }, [load]);

  return (
    <CategoriesContext.Provider value={{ categories, isLoading, error, refetch }}>
      {children}
    </CategoriesContext.Provider>
  );
};
