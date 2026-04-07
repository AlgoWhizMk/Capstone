// src/context/AuthContext.tsx
// Firebase = authentication only. Profile data = MongoDB (via API).

import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { auth, onAuthStateChanged } from "../services/firebase";
import type { User } from "../services/firebase";
import { syncUser, getUserOrNull } from "../services/api";
import type { MongoUser } from "../services/api";

interface AuthCtx {
  user:    User | null;
  profile: MongoUser | null;
  loading: boolean;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthCtx>({
  user: null, profile: null, loading: true, isAdmin: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<User | null>(null);
  const [profile, setProfile] = useState<MongoUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (fbUser) => {
      setUser(fbUser);
      if (fbUser) {
        try {
          const existing = await getUserOrNull(fbUser.uid);
          const mongoUser = await syncUser({
            firebaseUid: fbUser.uid,
            name:        fbUser.displayName ?? existing?.name ?? "User",
            email:       fbUser.email       ?? existing?.email ?? "",
            role:        existing?.role      ?? "user",
            company:     existing?.company   ?? "",
            phone:       existing?.phone     ?? "",
            photoURL:    fbUser.photoURL     ?? existing?.photoURL ?? "",
          });
          setProfile(mongoUser);
        } catch {
          console.warn("MongoDB unavailable — profile not loaded. Is the backend running?");
          setProfile(null);
        }
      } else {
        setProfile(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, profile, loading, isAdmin: profile?.role === "admin" }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components -- hook must live next to provider
export const useAuth = () => useContext(AuthContext);
