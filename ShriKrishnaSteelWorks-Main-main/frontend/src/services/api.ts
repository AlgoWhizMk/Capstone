// frontend/src/services/api.ts
// This file handles all calls to your Express + MongoDB backend

// In production (Vercel), API_ORIGIN is empty so requests go to /api/... on the same domain.
// In development, falls back to localhost:5000.
export const API_ORIGIN = import.meta.env.VITE_API_URL ?? "";
const BASE_URL = API_ORIGIN ? `${API_ORIGIN}/api` : "/api";

// ── Types ─────────────────────────────────────────────────────────────────────
export interface MongoUser {
  _id:         string;
  firebaseUid: string;
  name:        string;
  email:       string;
  role:        "user" | "admin";
  company:     string;
  phone:       string;
  photoURL:    string;
  address: {
    street:  string;
    city:    string;
    state:   string;
    pincode: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface MongoOrder {
  _id:         string;
  orderId:     string;
  firebaseUid: string;
  product:     string;
  quantity:    string;
  amount:      string;
  status:      "Pending" | "Processing" | "Shipped" | "Delivered" | "Cancelled";
  createdAt:   string;
  isCustomized?: boolean;
  customDetails?: Record<string, string>;
}

// ── Helper ────────────────────────────────────────────────────────────────────
async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || `Request failed: ${res.status}`);
  }
  return res.json();
}

// ── User API ──────────────────────────────────────────────────────────────────

// Fetch user profile from MongoDB
export const getUser = (firebaseUid: string) =>
  request<MongoUser>(`/users/${firebaseUid}`);

// Fetch all users (Admin only)
export const getAllUsers = () => request<MongoUser[]>("/users");

/** Same as getUser but returns null if the user document does not exist (404). */
export async function getUserOrNull(firebaseUid: string): Promise<MongoUser | null> {
  try {
    return await getUser(firebaseUid);
  } catch {
    return null;
  }
}

// Create or update user in MongoDB (call this after every Firebase login)
export const syncUser = (data: {
  firebaseUid: string;
  name:        string;
  email:       string;
  role?:       string;
  company?:    string;
  phone?:      string;
  photoURL?:   string;
}) => request<MongoUser>("/users", { method: "POST", body: JSON.stringify(data) });

// Update user profile fields
export const updateUser = (firebaseUid: string, updates: Partial<MongoUser>) =>
  request<MongoUser>(`/users/${firebaseUid}`, {
    method: "PUT",
    body:   JSON.stringify(updates),
  });

// ── Orders API ────────────────────────────────────────────────────────────────

// Get all orders for a user
export const getUserOrders = (firebaseUid: string) =>
  request<MongoOrder[]>(`/orders/${firebaseUid}`);

// Get all orders (Admin only)
export const getAllOrders = () => request<MongoOrder[]>("/orders");