// src/firebase.ts — Firebase is used only for Authentication (and optional Analytics).
// User profile data lives in MongoDB via ../services/api.ts

import { initializeApp } from "firebase/app";
import type { Analytics } from "firebase/analytics";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile,
  type User,
} from "firebase/auth";
import { syncUser } from "./api";

const firebaseConfig = {
  apiKey:            import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId:             import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId:     import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
};

// ── Initialize Firebase (Auth only — no Firestore) ───────────────────────────
const app = initializeApp(firebaseConfig);

/**
 * Analytics is loaded only via dynamic import so the Installations/Analytics code never runs
 * when VITE_* env vars are missing (avoids "Missing App configuration value: projectId").
 */
let analytics: Analytics | null = null;

const canInitAnalytics =
  typeof window !== "undefined" &&
  Boolean(firebaseConfig.apiKey) &&
  !firebaseConfig.apiKey?.includes("MockKey") &&
  Boolean(firebaseConfig.projectId) &&
  Boolean(firebaseConfig.appId) &&
  Boolean(firebaseConfig.measurementId);

if (canInitAnalytics) {
  void import("firebase/analytics")
    .then(({ getAnalytics }) => {
      try {
        analytics = getAnalytics(app);
      } catch {
        analytics = null;
      }
    })
    .catch(() => {
      analytics = null;
    });
} else if (import.meta.env.DEV) {
  console.warn(
    "[Firebase] Analytics skipped: add VITE_FIREBASE_* web app values in frontend/.env (apiKey, projectId, appId, measurementId, …)."
  );
}

export const auth           = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export { analytics };

// ── Types ─────────────────────────────────────────────────────────────────────
export type UserRole = "user" | "admin";

// ── Register (Firebase Auth + first MongoDB row) ─────────────────────────────
export async function signUp(
  email:    string,
  password: string,
  name:     string,
  role:     UserRole = "user"
) {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(cred.user, { displayName: name });
  await syncUser({
    firebaseUid: cred.user.uid,
    name,
    email:       cred.user.email ?? "",
    role,
    company:     "",
    phone:       "",
    photoURL:    cred.user.photoURL ?? "",
  });
  return cred;
}

// ── Sign in ───────────────────────────────────────────────────────────────────
export async function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

// ── Google sign-in (Mongo profile created/updated in AuthContext on auth change) ─
export async function signInWithGoogle() {
  try {
    googleProvider.setCustomParameters({ prompt: "select_account" });
    return await signInWithPopup(auth, googleProvider);
  } catch (error: unknown) {
    const e = error as { code?: string; message?: string };
    console.error("Google Sign-In Error:", e.code, e.message);
    throw error;
  }
}

// ── Sign out ──────────────────────────────────────────────────────────────────
export async function logOut() {
  return signOut(auth);
}

// ── Password reset ────────────────────────────────────────────────────────────
export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export { onAuthStateChanged };
export type { User };
