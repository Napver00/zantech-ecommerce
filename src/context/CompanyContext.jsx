import React, { createContext, useContext, useEffect, useState } from "react";
import { config } from "@/config";

const CompanyContext = createContext();

export const useCompany = () => useContext(CompanyContext);

// Same module-level cache + in-flight dedupe pattern as CategoriesContext —
// Header and Footer (and Contact) both need this on every page, so a shared
// cache turns N duplicate requests into exactly one per session.
let cachedCompany = null;
let inFlightRequest = null;

const fetchCompany = () => {
  if (cachedCompany) return Promise.resolve(cachedCompany);
  if (inFlightRequest) return inFlightRequest;

  inFlightRequest = fetch(`${config.baseURL}/company`)
    .then((res) => {
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res.json();
    })
    .then((json) => {
      if (!json.success || !json.data) throw new Error("Invalid company response");
      cachedCompany = json.data;
      return cachedCompany;
    })
    .finally(() => {
      inFlightRequest = null;
    });

  return inFlightRequest;
};

export const CompanyProvider = ({ children }) => {
  const [company, setCompany] = useState(cachedCompany);

  useEffect(() => {
    if (cachedCompany) {
      setCompany(cachedCompany);
      return;
    }
    fetchCompany()
      .then(setCompany)
      .catch((err) => console.error("Failed to load company info:", err));
  }, []);

  return <CompanyContext.Provider value={company}>{children}</CompanyContext.Provider>;
};
