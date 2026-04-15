import { useState, useEffect } from "react";
import { API_ORIGIN } from "../src/services/api";

const API = API_ORIGIN
  ? `${API_ORIGIN}/api/products`
  : "/api/products";

export interface ApiProduct {
  productId: string;
  productName: string;
  category: string;
  furnitureType: string;
  steelGrade: string;
  availability: string;
  finalPriceINR: number;
  leadTimeDays: number;
  stockQuantity: number;
  rating: number;
  productDescription: string;
  features: string;
  surfaceFinish: string;
  frameThickness: string;
  loadCapacityKg: number;
  warrantyYears: number;
  customizationAvailable: string;
  imageUrl: string;
  length_cm: number;
  width_cm: number;
  height_cm: number;
  weight_kg: number;
  color: string;
  usageArea: string;
  recommendedFor: string;
}

export function useProducts(search: string, category: string, limit = 12, page = 1) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      setLoading(true);
      const params = new URLSearchParams({
        search,
        category,
        page: String(page),
        limit: String(limit),
      });
      try {
        const r = await fetch(`${API}?${params}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data = await r.json();
        if (!cancelled) {
          setProducts(data.products ?? []);
          setTotal(data.total ?? 0);
        }
      } catch {
        if (!cancelled) {
          setProducts([]);
          setTotal(0);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [search, category, page, limit]);

  return { products, total, loading };
}

export function useCategories() {
  const [categories, setCategories] = useState<{ _id: string; count: number }[]>([]);

  useEffect(() => {
    fetch(`${API}/categories`)
      .then(r => r.json())
      .then(setCategories)
      .catch(console.error);
  }, []);

  return categories;
}